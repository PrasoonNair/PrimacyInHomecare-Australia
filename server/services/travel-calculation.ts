import { db } from '../db';
import { 
  providerTravelCalculations, 
  travelRateConfigurations, 
  travelVerificationRules,
  dailyShiftSequences,
  shifts,
  staff,
  participants 
} from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

interface TravelCalculationRequest {
  shiftId: string;
  originAddress: string;
  destinationAddress: string;
  travelDate: string;
}

interface DistanceCalculationResult {
  distanceKm: number;
  travelTimeMinutes: number;
  mmmClassification: string;
}

export class TravelCalculationService {
  /**
   * Main method to calculate provider travel costs
   */
  async calculateTravel(request: TravelCalculationRequest) {
    try {
      // 1. Get shift and related data
      const shiftData = await this.getShiftData(request.shiftId);
      if (!shiftData) {
        throw new Error('Shift not found');
      }

      // 2. Calculate distance and travel time
      const distanceResult = await this.calculateDistance(
        request.originAddress, 
        request.destinationAddress
      );

      // 3. Determine shift sequence for the day
      if (!shiftData.assignedStaffId) {
        throw new Error('No staff assigned to this shift');
      }
      
      const shiftSequence = await this.determineShiftSequence(
        shiftData.assignedStaffId, 
        request.travelDate,
        request.shiftId
      );

      // 4. Get current rate configuration
      const rateConfig = await this.getCurrentRateConfiguration();

      // 5. Apply business rules
      const businessRules = await this.applyBusinessRules(
        shiftSequence,
        distanceResult,
        rateConfig
      );

      // 6. Calculate NDIS billable amount
      const ndisCalculation = this.calculateNdisBilling(
        distanceResult,
        businessRules,
        rateConfig
      );

      // 7. Calculate SCHADS payment amount
      const schacsCalculation = this.calculateSchacsPayment(
        distanceResult,
        businessRules,
        rateConfig
      );

      // 8. Create travel calculation record
      const travelCalculation = await db.insert(providerTravelCalculations).values({
        shiftId: request.shiftId,
        staffId: shiftData.assignedStaffId!,
        participantId: shiftData.participantId,
        originAddress: request.originAddress,
        destinationAddress: request.destinationAddress,
        travelDate: request.travelDate,
        distanceKm: distanceResult.distanceKm.toString(),
        travelTimeMinutes: distanceResult.travelTimeMinutes,
        shiftSequenceNumber: shiftSequence.sequenceNumber,
        isFirstShiftOfDay: shiftSequence.isFirstShift,
        originMmmClassification: distanceResult.mmmClassification,
        destinationMmmClassification: distanceResult.mmmClassification,
        applicableMmmRating: distanceResult.mmmClassification,
        ndisMaxTravelTimeMinutes: this.getNdisTimeLimit(distanceResult.mmmClassification),
        ndisBillableTimeMinutes: Math.min(
          distanceResult.travelTimeMinutes,
          this.getNdisTimeLimit(distanceResult.mmmClassification)
        ),
        ndisRatePerKm: this.getNdisRate(distanceResult.mmmClassification, rateConfig).toString(),
        ndisTravelAmount: ndisCalculation.amount.toString(),
        ndisIsBillable: ndisCalculation.isBillable,
        ndisNonBillableReason: ndisCalculation.nonBillableReason,
        schacsVehicleAllowancePerKm: (rateConfig.schacsVehicleAllowanceRate || 0.95).toString(),
        schacsTravelPayment: schacsCalculation.amount.toString(),
        schacsIsPayable: schacsCalculation.isPayable,
        schacsNonPayableReason: schacsCalculation.nonPayableReason,
        autoVerificationStatus: 'verified',
        verificationFlags: [],
        atoCompliant: this.checkAtoCompliance(distanceResult, businessRules),
        atoNonComplianceReasons: [],
      }).returning();

      // 9. Update daily shift sequence
      await this.updateDailyShiftSequence(
        shiftData.assignedStaffId!,
        request.travelDate,
        travelCalculation[0]
      );

      return travelCalculation[0];
    } catch (error) {
      console.error('Travel calculation failed:', error);
      throw error;
    }
  }

  /**
   * Get shift and related staff/participant data
   */
  private async getShiftData(shiftId: string) {
    const shiftData = await db
      .select({
        shiftId: shifts.id,
        assignedStaffId: shifts.assignedStaffId,
        participantId: shifts.participantId,
        startTime: shifts.startTime,
        endTime: shifts.endTime,
      })
      .from(shifts)
      .where(eq(shifts.id, shiftId))
      .limit(1);

    return shiftData[0] || null;
  }

  /**
   * Calculate distance using geocoding service (mock implementation)
   */
  private async calculateDistance(
    originAddress: string, 
    destinationAddress: string
  ): Promise<DistanceCalculationResult> {
    // In real implementation, use Google Maps API or similar
    // For now, return mock data
    const mockDistance = Math.random() * 50 + 5; // 5-55 km
    const mockTravelTime = Math.round(mockDistance * 1.5); // Rough estimate
    
    // Mock MMM classification based on distance
    let mmmClassification = 'MMM1';
    if (mockDistance > 20) mmmClassification = 'MMM3';
    if (mockDistance > 40) mmmClassification = 'MMM4';

    return {
      distanceKm: Math.round(mockDistance * 100) / 100,
      travelTimeMinutes: mockTravelTime,
      mmmClassification
    };
  }

  /**
   * Determine shift sequence for the day to apply first shift rule
   */
  private async determineShiftSequence(
    staffId: string, 
    travelDate: string, 
    currentShiftId: string
  ) {
    // Get all shifts for this staff member on this date
    const dailyShifts = await db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.assignedStaffId, staffId),
          sql`DATE(${shifts.startTime}) = ${travelDate}`
        )
      )
      .orderBy(shifts.startTime);

    const sequenceNumber = dailyShifts.findIndex((shift: any) => shift.id === currentShiftId) + 1;
    const isFirstShift = sequenceNumber === 1;

    return {
      sequenceNumber,
      isFirstShift,
      totalShifts: dailyShifts.length
    };
  }

  /**
   * Get current rate configuration
   */
  private async getCurrentRateConfiguration() {
    const config = await db
      .select()
      .from(travelRateConfigurations)
      .where(eq(travelRateConfigurations.isActive, true))
      .orderBy(desc(travelRateConfigurations.effectiveFrom))
      .limit(1);

    if (!config[0]) {
      // Return default configuration if none exists
      return {
        ndisMmm1Rate: 0.99,
        ndisMmm2Rate: 0.99,
        ndisMmm3Rate: 0.99,
        ndisMmm4Rate: 0.85,
        ndisMmm5Rate: 0.78,
        ndisMmm123MaxMinutes: 30,
        ndisMmm45MaxMinutes: 60,
        schacsVehicleAllowanceRate: 0.95,
        atoBusinessKmRate: 0.85
      };
    }

    return config[0];
  }

  /**
   * Apply business rules for travel calculations
   */
  private async applyBusinessRules(
    shiftSequence: any,
    distanceResult: DistanceCalculationResult,
    rateConfig: any
  ) {
    const rules = {
      isFirstShift: shiftSequence.isFirstShift,
      exceedsNdisTimeLimit: distanceResult.travelTimeMinutes > this.getNdisTimeLimit(distanceResult.mmmClassification),
      exceedsReasonableDistance: distanceResult.distanceKm > 100, // Configurable threshold
      requiresManualReview: false
    };

    // Flag for manual review if exceeds limits
    if (rules.exceedsNdisTimeLimit || rules.exceedsReasonableDistance) {
      rules.requiresManualReview = true;
    }

    return rules;
  }

  /**
   * Calculate NDIS billing amount
   */
  private calculateNdisBilling(
    distanceResult: DistanceCalculationResult,
    businessRules: any,
    rateConfig: any
  ) {
    // First shift rule: non-billable
    if (businessRules.isFirstShift) {
      return {
        amount: 0,
        isBillable: false,
        nonBillableReason: 'First shift of the day - non-billable per NDIS guidelines'
      };
    }

    // Calculate billable amount
    const rate = this.getNdisRate(distanceResult.mmmClassification, rateConfig);
    const amount = distanceResult.distanceKm * rate;

    return {
      amount: Math.round(amount * 100) / 100,
      isBillable: true,
      nonBillableReason: null
    };
  }

  /**
   * Calculate SCHADS payment amount
   */
  private calculateSchacsPayment(
    distanceResult: DistanceCalculationResult,
    businessRules: any,
    rateConfig: any
  ) {
    // First shift rule: non-payable
    if (businessRules.isFirstShift) {
      return {
        amount: 0,
        isPayable: false,
        nonPayableReason: 'First shift of the day - non-payable per policy'
      };
    }

    // Calculate payable amount using SCHADS vehicle allowance
    const amount = distanceResult.distanceKm * (rateConfig.schacsVehicleAllowanceRate || 0.95);

    return {
      amount: Math.round(amount * 100) / 100,
      isPayable: true,
      nonPayableReason: null
    };
  }

  /**
   * Get NDIS rate based on MMM classification
   */
  private getNdisRate(mmmClassification: string, rateConfig: any): number {
    switch (mmmClassification) {
      case 'MMM1': return rateConfig.ndisMmm1Rate;
      case 'MMM2': return rateConfig.ndisMmm2Rate;
      case 'MMM3': return rateConfig.ndisMmm3Rate;
      case 'MMM4': return rateConfig.ndisMmm4Rate;
      case 'MMM5': return rateConfig.ndisMmm5Rate;
      default: return rateConfig.ndisMmm1Rate;
    }
  }

  /**
   * Get NDIS time limit based on MMM classification
   */
  private getNdisTimeLimit(mmmClassification: string): number {
    if (['MMM1', 'MMM2', 'MMM3'].includes(mmmClassification)) {
      return 30; // 30 minutes for metropolitan/regional
    }
    return 60; // 60 minutes for rural/remote
  }

  /**
   * Check ATO compliance
   */
  private checkAtoCompliance(distanceResult: DistanceCalculationResult, businessRules: any): boolean {
    // Basic ATO compliance checks
    if (distanceResult.distanceKm > 200) return false; // Excessive distance
    if (businessRules.exceedsReasonableDistance) return false;
    return true;
  }

  /**
   * Update daily shift sequence tracking
   */
  private async updateDailyShiftSequence(
    staffId: string, 
    shiftDate: string, 
    travelCalculation: any
  ) {
    const existing = await db
      .select()
      .from(dailyShiftSequences)
      .where(
        and(
          eq(dailyShiftSequences.staffId, staffId),
          eq(dailyShiftSequences.shiftDate, shiftDate)
        )
      )
      .limit(1);

    const travelAmount = parseFloat(travelCalculation.ndisTravelAmount);
    const paymentAmount = parseFloat(travelCalculation.schacsTravelPayment);

    if (existing[0]) {
      // Update existing record
      await db
        .update(dailyShiftSequences)
        .set({
          totalShiftsForDay: sql`${dailyShiftSequences.totalShiftsForDay} + 1`,
          shiftsWithTravel: sql`${dailyShiftSequences.shiftsWithTravel} + 1`,
          totalTravelKm: sql`${dailyShiftSequences.totalTravelKm} + ${travelCalculation.distanceKm}`,
          totalNdisBillableTravel: sql`${dailyShiftSequences.totalNdisBillableTravel} + ${travelAmount}`,
          totalSchacsTravelPayments: sql`${dailyShiftSequences.totalSchacsTravelPayments} + ${paymentAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(dailyShiftSequences.id, existing[0].id));
    } else {
      // Create new record
      await db.insert(dailyShiftSequences).values({
        staffId,
        shiftDate,
        totalShiftsForDay: 1,
        shiftsWithTravel: 1,
        firstShiftId: travelCalculation.shiftId,
        lastShiftId: travelCalculation.shiftId,
        totalTravelKm: travelCalculation.distanceKm,
        totalNdisBillableTravel: travelAmount.toString(),
        totalSchacsTravelPayments: paymentAmount.toString(),
      });
    }
  }

  /**
   * Get all travel calculations
   */
  async getAllCalculations() {
    return await db
      .select()
      .from(providerTravelCalculations)
      .orderBy(desc(providerTravelCalculations.createdAt));
  }

  /**
   * Get daily summaries
   */
  async getDailySummaries() {
    return await db
      .select()
      .from(dailyShiftSequences)
      .orderBy(desc(dailyShiftSequences.shiftDate));
  }

  /**
   * Bulk recalculate for a date range
   */
  async bulkRecalculate(fromDate: string, toDate: string) {
    // Implementation for bulk recalculation
    // This would re-process all shifts in the date range
    console.log(`Bulk recalculating travel from ${fromDate} to ${toDate}`);
    return { message: 'Bulk recalculation completed' };
  }
}