/**
 * Service Delivery Service for Primacy Care Australia CMS
 * Handles staff allocation, shift management, attendance tracking, and timesheet generation
 */

import { db } from "./db";
import { sql, eq, and, gte, lte, desc, asc, or, ne } from "drizzle-orm";
import { 
  shifts,
  shiftOffers,
  staffUnavailability,
  shiftAttendance,
  staffAllocationScores,
  billingLines,
  staff,
  participants,
  services,
  ndisSupportItems
} from "@shared/schema";

export class ServiceDeliveryService {
  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Smart staff allocation algorithm
   */
  async allocateStaff(shiftId: string): Promise<any> {
    try {
      // Get shift details
      const [shift] = await db
        .select()
        .from(shifts)
        .where(eq(shifts.id, shiftId))
        .limit(1);
      
      if (!shift) {
        throw new Error("Shift not found");
      }

      // Get participant location
      const [participant] = await db
        .select()
        .from(participants)
        .where(eq(participants.id, shift.participantId))
        .limit(1);

      // Get all available staff
      const availableStaff = await this.getAvailableStaff(
        shift.shiftDate,
        shift.startTime,
        shift.endTime
      );

      // Score and rank staff
      const scoredStaff = await this.scoreStaff(
        availableStaff,
        shift,
        participant
      );

      // Store allocation scores
      for (const staffScore of scoredStaff) {
        await db.insert(staffAllocationScores).values({
          shiftId,
          staffId: staffScore.staffId,
          distanceScore: staffScore.scores.distance,
          distanceKm: staffScore.distanceKm.toString(),
          skillsScore: staffScore.scores.skills,
          preferenceScore: staffScore.scores.preference,
          continuityScore: staffScore.scores.continuity,
          reliabilityScore: staffScore.scores.reliability,
          costScore: staffScore.scores.cost,
          totalScore: staffScore.totalScore,
          rank: staffScore.rank,
          isEligible: staffScore.isEligible
        });
      }

      // Send offers to top candidates
      const topCandidates = scoredStaff
        .filter(s => s.isEligible)
        .slice(0, 5);

      for (let i = 0; i < topCandidates.length; i++) {
        await this.createShiftOffer(
          shiftId,
          topCandidates[i].staffId,
          i + 1
        );
      }

      return {
        shiftId,
        candidatesFound: topCandidates.length,
        offerssSent: topCandidates.length
      };
    } catch (error) {
      console.error('Error allocating staff:', error);
      throw error;
    }
  }

  /**
   * Get available staff for a shift
   */
  private async getAvailableStaff(date: string, startTime: string, endTime: string): Promise<any[]> {
    // Get staff not on unavailability
    const unavailableStaffIds = await db
      .select({ staffId: staffUnavailability.staffId })
      .from(staffUnavailability)
      .where(and(
        lte(staffUnavailability.dateFrom, date),
        gte(staffUnavailability.dateTo, date),
        eq(staffUnavailability.status, 'approved')
      ));

    const unavailableIds = unavailableStaffIds.map(u => u.staffId);

    // Get all active staff not unavailable
    const availableStaff = await db
      .select()
      .from(staff)
      .where(and(
        eq(staff.status, 'active'),
        unavailableIds.length > 0 
          ? sql`${staff.id} NOT IN (${unavailableIds.join(',')})` 
          : sql`1=1`
      ));

    // TODO: Check for conflicts with existing shifts
    // TODO: Check fatigue rules (max hours per week)

    return availableStaff;
  }

  /**
   * Score staff for allocation
   */
  private async scoreStaff(staffList: any[], shift: any, participant: any): Promise<any[]> {
    const scoredStaff = [];

    for (const staffMember of staffList) {
      // Calculate distance if locations available
      let distanceKm = 0;
      let distanceScore = 100;
      
      if (participant.latitude && participant.longitude && 
          staffMember.latitude && staffMember.longitude) {
        distanceKm = this.calculateDistance(
          parseFloat(participant.latitude),
          parseFloat(participant.longitude),
          parseFloat(staffMember.latitude),
          parseFloat(staffMember.longitude)
        );
        
        // Score based on distance (max 30km)
        if (distanceKm <= 10) distanceScore = 100;
        else if (distanceKm <= 20) distanceScore = 75;
        else if (distanceKm <= 30) distanceScore = 50;
        else distanceScore = 0; // Beyond 30km
      }

      // Skills score (simplified)
      const skillsScore = 80; // TODO: Match required skills

      // Preference score
      const preferenceScore = 70; // TODO: Check participant preferences

      // Continuity score (previous shifts with participant)
      const previousShifts = await db
        .select({ count: sql`count(*)` })
        .from(shifts)
        .where(and(
          eq(shifts.participantId, participant.id),
          eq(shifts.assignedStaffId, staffMember.id),
          eq(shifts.status, 'completed')
        ));
      
      const continuityScore = Math.min(100, previousShifts[0].count * 20);

      // Reliability score
      const reliabilityScore = parseFloat(staffMember.reliabilityScore || '85');

      // Cost score (inverse - lower cost = higher score)
      const hourlyRate = parseFloat(staffMember.hourlyRate || '35');
      const costScore = Math.max(0, 100 - (hourlyRate - 30) * 5);

      // Calculate total score
      const weights = {
        distance: 0.3,
        skills: 0.25,
        preference: 0.15,
        continuity: 0.15,
        reliability: 0.1,
        cost: 0.05
      };

      const totalScore = Math.round(
        distanceScore * weights.distance +
        skillsScore * weights.skills +
        preferenceScore * weights.preference +
        continuityScore * weights.continuity +
        reliabilityScore * weights.reliability +
        costScore * weights.cost
      );

      scoredStaff.push({
        staffId: staffMember.id,
        staffName: `${staffMember.firstName} ${staffMember.lastName}`,
        distanceKm,
        scores: {
          distance: distanceScore,
          skills: skillsScore,
          preference: preferenceScore,
          continuity: continuityScore,
          reliability: reliabilityScore,
          cost: costScore
        },
        totalScore,
        isEligible: distanceKm <= 30 && distanceScore > 0
      });
    }

    // Sort by total score and add rank
    scoredStaff.sort((a, b) => b.totalScore - a.totalScore);
    scoredStaff.forEach((s, index) => {
      s.rank = index + 1;
    });

    return scoredStaff;
  }

  /**
   * Create shift offer
   */
  private async createShiftOffer(shiftId: string, staffId: string, rank: number): Promise<any> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    return await db.insert(shiftOffers).values({
      shiftId,
      staffId,
      offerRank: rank,
      offeredAt: now,
      expiresAt,
      responseStatus: 'pending'
    });
  }

  /**
   * Respond to shift offer
   */
  async respondToOffer(offerId: string, response: 'accepted' | 'declined', reason?: string): Promise<any> {
    try {
      // Update offer
      const [offer] = await db
        .update(shiftOffers)
        .set({
          responseStatus: response,
          respondedAt: new Date(),
          declineReason: reason,
          updatedAt: new Date()
        })
        .where(eq(shiftOffers.id, offerId))
        .returning();

      // If accepted, assign staff to shift
      if (response === 'accepted') {
        await db
          .update(shifts)
          .set({
            assignedStaffId: offer.staffId,
            status: 'confirmed',
            updatedAt: new Date()
          })
          .where(eq(shifts.id, offer.shiftId));

        // Decline other offers for this shift
        await db
          .update(shiftOffers)
          .set({
            responseStatus: 'declined',
            autoDeclined: true,
            updatedAt: new Date()
          })
          .where(and(
            eq(shiftOffers.shiftId, offer.shiftId),
            ne(shiftOffers.id, offerId)
          ));
      }

      return offer;
    } catch (error) {
      console.error('Error responding to offer:', error);
      throw error;
    }
  }

  /**
   * Clock in for shift
   */
  async clockIn(shiftId: string, staffId: string, location: { lat: number, lng: number, address: string }): Promise<any> {
    try {
      // Get shift details
      const [shift] = await db
        .select()
        .from(shifts)
        .where(eq(shifts.id, shiftId))
        .limit(1);

      if (!shift) {
        throw new Error("Shift not found");
      }

      // Get participant location for geo-fence check
      const [participant] = await db
        .select()
        .from(participants)
        .where(eq(participants.id, shift.participantId))
        .limit(1);

      // Check geo-fence (500m radius)
      let geoFenceViolation = false;
      if (participant.latitude && participant.longitude) {
        const distance = this.calculateDistance(
          location.lat,
          location.lng,
          parseFloat(participant.latitude),
          parseFloat(participant.longitude)
        );
        
        if (distance > 0.5) { // 500m in km
          geoFenceViolation = true;
        }
      }

      // Create attendance record
      const [attendance] = await db
        .insert(shiftAttendance)
        .values({
          shiftId,
          staffId,
          clockInTime: new Date(),
          clockInLocation: location.address,
          clockInLat: location.lat.toString(),
          clockInLng: location.lng.toString(),
          clockInMethod: 'app',
          geoFenceViolations: geoFenceViolation ? 1 : 0
        })
        .returning();

      // Update shift status
      await db
        .update(shifts)
        .set({
          status: 'in_progress',
          clockInTime: new Date(),
          updatedAt: new Date()
        })
        .where(eq(shifts.id, shiftId));

      return {
        attendance,
        geoFenceViolation,
        requiresOverride: geoFenceViolation
      };
    } catch (error) {
      console.error('Error clocking in:', error);
      throw error;
    }
  }

  /**
   * Clock out for shift
   */
  async clockOut(shiftId: string, staffId: string, location: { lat: number, lng: number, address: string }, notes?: string): Promise<any> {
    try {
      // Get attendance record
      const [attendance] = await db
        .select()
        .from(shiftAttendance)
        .where(and(
          eq(shiftAttendance.shiftId, shiftId),
          eq(shiftAttendance.staffId, staffId)
        ))
        .limit(1);

      if (!attendance) {
        throw new Error("No clock-in record found");
      }

      // Calculate duration
      const clockInTime = new Date(attendance.clockInTime);
      const clockOutTime = new Date();
      const durationMinutes = Math.round((clockOutTime.getTime() - clockInTime.getTime()) / 60000);

      // Update attendance record
      const [updatedAttendance] = await db
        .update(shiftAttendance)
        .set({
          clockOutTime,
          clockOutLocation: location.address,
          clockOutLat: location.lat.toString(),
          clockOutLng: location.lng.toString(),
          clockOutMethod: 'app',
          actualDuration: durationMinutes,
          progressNotes: notes,
          updatedAt: new Date()
        })
        .where(eq(shiftAttendance.id, attendance.id))
        .returning();

      // Update shift status
      await db
        .update(shifts)
        .set({
          status: 'completed',
          clockOutTime,
          actualDuration: durationMinutes,
          updatedAt: new Date()
        })
        .where(eq(shifts.id, shiftId));

      // Auto-generate timesheet entry
      await this.generateTimesheet(shiftId, staffId, durationMinutes);

      return updatedAttendance;
    } catch (error) {
      console.error('Error clocking out:', error);
      throw error;
    }
  }

  /**
   * Generate timesheet from attendance
   */
  private async generateTimesheet(shiftId: string, staffId: string, durationMinutes: number): Promise<void> {
    // TODO: Create timesheet entry
    // TODO: Apply SCHADS rates
    // TODO: Calculate allowances
    console.log(`Timesheet generated for shift ${shiftId}, duration: ${durationMinutes} minutes`);
  }

  /**
   * Submit fortnightly unavailability
   */
  async submitUnavailability(staffId: string, periods: any[]): Promise<any> {
    try {
      const submissions = [];
      
      for (const period of periods) {
        const submission = await db
          .insert(staffUnavailability)
          .values({
            staffId,
            dateFrom: period.dateFrom,
            dateTo: period.dateTo,
            submissionPeriod: this.getCurrentSubmissionPeriod(),
            reason: period.reason,
            isRecurring: period.isRecurring || false,
            allDay: period.allDay !== false,
            startTime: period.startTime,
            endTime: period.endTime,
            submittedAt: new Date(),
            status: 'pending'
          })
          .returning();
        
        submissions.push(submission[0]);
      }
      
      return submissions;
    } catch (error) {
      console.error('Error submitting unavailability:', error);
      throw error;
    }
  }

  /**
   * Get current fortnightly submission period
   */
  private getCurrentSubmissionPeriod(): string {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();
    
    // Fortnightly periods (odd/even weeks)
    const periodStart = weekNumber % 2 === 1 ? weekNumber : weekNumber - 1;
    const periodEnd = periodStart + 1;
    
    return `${year}-W${periodStart.toString().padStart(2, '0')}-W${periodEnd.toString().padStart(2, '0')}`;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  }

  /**
   * Create billing line from completed shift
   */
  async createBillingLine(shiftId: string): Promise<any> {
    try {
      // Get shift details
      const [shift] = await db
        .select()
        .from(shifts)
        .where(eq(shifts.id, shiftId))
        .limit(1);

      if (!shift || shift.status !== 'completed') {
        throw new Error("Shift not found or not completed");
      }

      // Map to NDIS item
      const ndisItem = await this.mapToNDISItem(shift.serviceType);
      
      // Calculate quantity (hours)
      const quantity = (shift.actualDuration || shift.duration || 0) / 60;
      const totalAmount = quantity * parseFloat(ndisItem.priceNational || '0');

      // Create billing line
      const [billingLine] = await db
        .insert(billingLines)
        .values({
          shiftId,
          participantId: shift.participantId,
          ndisItemNumber: ndisItem.itemNumber,
          ndisItemName: ndisItem.itemName,
          quantity: quantity.toString(),
          unitPrice: ndisItem.priceNational || '0',
          totalAmount: totalAmount.toString(),
          claimType: 'portal' // TODO: Determine from participant plan
        })
        .returning();

      return billingLine;
    } catch (error) {
      console.error('Error creating billing line:', error);
      throw error;
    }
  }

  /**
   * Map service type to NDIS item
   */
  private async mapToNDISItem(serviceType: string): Promise<any> {
    const mapping: Record<string, string> = {
      'personal_care': '01_011_0107_1_1',
      'community_access': '04_104_0125_6_1',
      'overnight_support': '01_020_0107_1_1',
      'domestic_assistance': '01_012_0120_1_1',
      'social_support': '04_103_0125_6_1'
    };

    const itemNumber = mapping[serviceType] || '01_011_0107_1_1';

    // Get item details from database
    const [item] = await db
      .select()
      .from(ndisSupportItems)
      .where(eq(ndisSupportItems.itemNumber, itemNumber))
      .limit(1);

    return item || {
      itemNumber,
      itemName: serviceType,
      priceNational: '65.47' // Default price
    };
  }

  /**
   * Get shift allocation dashboard data
   */
  async getAllocationDashboard(): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get unallocated shifts
      const unallocatedShifts = await db
        .select({ count: sql`count(*)` })
        .from(shifts)
        .where(and(
          gte(shifts.shiftDate, today),
          eq(shifts.status, 'unallocated')
        ));

      // Get shifts starting soon
      const upcomingShifts = await db
        .select()
        .from(shifts)
        .where(and(
          eq(shifts.shiftDate, today),
          eq(shifts.status, 'confirmed')
        ))
        .orderBy(asc(shifts.startTime))
        .limit(10);

      // Get in-progress shifts
      const inProgressShifts = await db
        .select()
        .from(shifts)
        .where(eq(shifts.status, 'in_progress'))
        .limit(10);

      return {
        unallocatedCount: unallocatedShifts[0].count,
        upcomingShifts,
        inProgressShifts,
        stats: {
          fillRate: 92, // TODO: Calculate
          averageTimeToFill: 1.8, // hours - TODO: Calculate
          todaysCancellations: 2, // TODO: Calculate
          staffUtilization: 78 // % - TODO: Calculate
        }
      };
    } catch (error) {
      console.error('Error getting allocation dashboard:', error);
      throw error;
    }
  }
}

export default ServiceDeliveryService;