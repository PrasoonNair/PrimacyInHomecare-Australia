import { db } from "./db";
import { 
  ndisPlans, 
  services, 
  participants,
  incidents,
  shifts
} from "@shared/schema";
import { eq, and, gte, lte, or, desc, asc } from "drizzle-orm";

/**
 * NDIS Service for Australian NDIS-specific operations
 * Handles price guide, claims, quality & safeguards, and compliance
 */
export class NDISService {
  // Current NDIS price guide version (updates quarterly)
  private readonly PRICE_GUIDE_VERSION = "2024-2025 Q3";
  
  // NDIS support categories
  private readonly SUPPORT_CATEGORIES = {
    CORE: ["Daily Activities", "Community", "Social", "Transport"],
    CAPACITY_BUILDING: ["Support Coordination", "CB Daily Activity", "CB Social", "CB Health"],
    CAPITAL: ["Assistive Technology", "Home Modifications", "Vehicle Modifications"]
  };

  // NDIS Quality & Safeguards incident types
  private readonly INCIDENT_TYPES = {
    IMMEDIATE: ["death", "serious_injury", "abuse", "neglect", "violence", "sexual_misconduct"],
    FIVE_DAY: ["restrictive_practice", "unauthorized_practice"],
    MONTHLY: ["medication_errors", "property_damage", "other"]
  };

  /**
   * Get current NDIS price for a support item
   */
  async getNDISPrice(
    supportItemCode: string,
    location: string = "NSW",
    participantAge?: number
  ): Promise<any> {
    try {
      // Fetch from price guide table
      const [priceItem] = await db.select()
        .from(ndisPriceGuide)
        .where(
          and(
            eq(ndisPriceGuide.itemCode, supportItemCode),
            eq(ndisPriceGuide.state, location),
            eq(ndisPriceGuide.isActive, true)
          )
        );

      if (!priceItem) {
        // Use default pricing if not found
        return this.getDefaultPrice(supportItemCode);
      }

      // Apply age-based adjustments
      let price = parseFloat(priceItem.basePrice);
      if (participantAge && participantAge < 18) {
        price *= 1.1; // 10% loading for participants under 18
      }

      // Apply location loading
      const locationLoading = this.getLocationLoading(location);
      price *= locationLoading;

      return {
        itemCode: supportItemCode,
        itemName: priceItem.itemName,
        category: priceItem.category,
        basePrice: priceItem.basePrice,
        adjustedPrice: price.toFixed(2),
        unit: priceItem.unit,
        description: priceItem.description,
        travelApplicable: priceItem.travelApplicable,
        cancellationRules: this.getCancellationRules(priceItem.category)
      };
    } catch (error) {
      console.error("Error fetching NDIS price:", error);
      throw error;
    }
  }

  /**
   * Get default pricing for common support items
   */
  private getDefaultPrice(itemCode: string): any {
    const defaultPrices: Record<string, any> = {
      "01_011_0107_1_1": {
        itemName: "Assistance With Self-Care Activities - Standard - Weekday Daytime",
        basePrice: "65.09",
        unit: "Hour"
      },
      "01_012_0106_1_1": {
        itemName: "Assistance With Daily Life Tasks In A Group Or Shared Living Arrangement - Standard - Weekday Daytime",
        basePrice: "58.98",
        unit: "Hour"
      },
      "04_104_0125_6_1": {
        itemName: "Community Participation Activities - 1:1 - Standard - Weekday Daytime",
        basePrice: "65.09",
        unit: "Hour"
      },
      "07_001_0106_8_3": {
        itemName: "Support Coordination",
        basePrice: "100.14",
        unit: "Hour"
      },
      "01_020_0120_1_1": {
        itemName: "Transport - First 10km",
        basePrice: "5.31",
        unit: "Each"
      }
    };

    return defaultPrices[itemCode] || {
      itemName: "Unknown Support Item",
      basePrice: "0.00",
      unit: "Unit"
    };
  }

  /**
   * Get location loading factor for remote/very remote areas
   */
  private getLocationLoading(location: string): number {
    const remoteAreas = ["NT", "WA-Remote", "QLD-Remote", "SA-Remote"];
    const veryRemoteAreas = ["NT-VeryRemote", "WA-VeryRemote", "QLD-VeryRemote"];
    
    if (veryRemoteAreas.some(area => location.includes(area))) {
      return 1.4; // 40% loading for very remote
    }
    if (remoteAreas.some(area => location.includes(area))) {
      return 1.25; // 25% loading for remote
    }
    return 1.0; // No loading for metro/regional
  }

  /**
   * Get NDIS cancellation rules
   */
  private getCancellationRules(category: string): any {
    return {
      shortNotice: {
        threshold: "2 hours",
        charge: "100% of service",
        applies: ["Daily Activities", "Community Participation"]
      },
      noShow: {
        charge: "100% of service",
        documentation: "Required within 24 hours"
      },
      providerInitiated: {
        notice: "7 days minimum",
        compensation: "May apply for participant inconvenience"
      }
    };
  }

  /**
   * Submit NDIS claim for completed service
   */
  async submitNDISClaim(shiftId: string): Promise<any> {
    try {
      const [shift] = await db.select()
        .from(shifts)
        .where(eq(shifts.id, shiftId));

      if (!shift || shift.status !== "completed") {
        throw new Error("Shift must be completed before claiming");
      }

      // Calculate claim amount based on NDIS pricing
      const price = await this.getNDISPrice(
        shift.serviceItemCode || "01_011_0107_1_1",
        shift.location || "NSW"
      );

      const duration = this.calculateDuration(shift.checkInTime!, shift.checkOutTime!);
      const claimAmount = parseFloat(price.adjustedPrice) * duration;

      // Apply SCHADS award rates if applicable
      const schadsAmount = this.calculateSCHADSRate(
        shift.checkInTime!,
        shift.checkOutTime!,
        shift.isPublicHoliday
      );

      const claimData = {
        shiftId,
        participantId: shift.participantId,
        serviceDate: shift.date,
        supportItemCode: shift.serviceItemCode,
        quantity: duration,
        unitPrice: price.adjustedPrice,
        totalAmount: claimAmount.toFixed(2),
        gstAmount: (claimAmount * 0.1).toFixed(2),
        staffPayment: schadsAmount,
        claimStatus: "pending",
        submittedAt: new Date(),
        ndisPortalRef: `CLM-${Date.now()}`
      };

      // In production, this would submit to NDIS PRODA/API
      console.log("NDIS Claim prepared:", claimData);

      return {
        success: true,
        claimReference: claimData.ndisPortalRef,
        amount: claimData.totalAmount,
        message: "Claim ready for submission to NDIS portal"
      };
    } catch (error) {
      console.error("Error submitting NDIS claim:", error);
      throw error;
    }
  }

  /**
   * Calculate service duration in hours
   */
  private calculateDuration(checkIn: Date, checkOut: Date): number {
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.round((diff / (1000 * 60 * 60)) * 4) / 4; // Round to 15 min increments
  }

  /**
   * Calculate SCHADS award rates for staff payment
   */
  private calculateSCHADSRate(
    checkIn: Date,
    checkOut: Date,
    isPublicHoliday?: boolean
  ): number {
    const baseRate = 32.50; // Level 2.3 base rate
    let totalPay = 0;
    
    const startHour = checkIn.getHours();
    const endHour = checkOut.getHours();
    const duration = this.calculateDuration(checkIn, checkOut);
    
    // Public holiday - 250% (150% penalty)
    if (isPublicHoliday) {
      return baseRate * 2.5 * duration;
    }
    
    // Weekend rates
    const dayOfWeek = checkIn.getDay();
    if (dayOfWeek === 0) { // Sunday - 200% (100% penalty)
      return baseRate * 2.0 * duration;
    }
    if (dayOfWeek === 6) { // Saturday - 150% (50% penalty)
      return baseRate * 1.5 * duration;
    }
    
    // Weekday shift penalties
    if (startHour < 7 || endHour > 20) { // Night shift - 130% (30% penalty)
      return baseRate * 1.3 * duration;
    }
    
    return baseRate * duration; // Standard weekday rate
  }

  /**
   * Report incident to NDIS Quality & Safeguards Commission
   */
  async reportToNDISCommission(incidentId: string): Promise<any> {
    try {
      const [incident] = await db.select()
        .from(incidents)
        .where(eq(incidents.id, incidentId));

      if (!incident) {
        throw new Error("Incident not found");
      }

      // Determine notification timeframe
      const notificationType = this.getNotificationType(incident.incidentType);
      
      const reportData = {
        incidentId: incident.id,
        providerName: "Primacy Care Australia",
        providerRegistration: "4-XXXXXX", // NDIS registration number
        incidentDate: incident.dateTime,
        incidentType: incident.incidentType,
        severity: incident.severity,
        participantNDISNumber: incident.participantNdisNumber,
        description: incident.description,
        immediateAction: incident.immediateAction,
        injuryDetails: incident.injuryDetails,
        policeInvolvement: incident.policeInvolved,
        notificationType,
        submittedBy: incident.reportedBy,
        submittedAt: new Date()
      };

      // In production, this would submit to NDIS Commission portal
      console.log("NDIS Commission Report prepared:", reportData);

      // Update incident record
      await db.update(incidents)
        .set({
          ndisReported: true,
          ndisReportDate: new Date(),
          ndisReferenceNumber: `NDIS-${Date.now()}`
        })
        .where(eq(incidents.id, incidentId));

      return {
        success: true,
        referenceNumber: `NDIS-${Date.now()}`,
        notificationType,
        deadline: this.getReportingDeadline(notificationType)
      };
    } catch (error) {
      console.error("Error reporting to NDIS Commission:", error);
      throw error;
    }
  }

  /**
   * Determine NDIS notification type based on incident
   */
  private getNotificationType(incidentType: string): string {
    if (this.INCIDENT_TYPES.IMMEDIATE.includes(incidentType)) {
      return "immediate"; // Within 24 hours
    }
    if (this.INCIDENT_TYPES.FIVE_DAY.includes(incidentType)) {
      return "five_day"; // Within 5 business days
    }
    return "monthly"; // Monthly reporting
  }

  /**
   * Get reporting deadline based on notification type
   */
  private getReportingDeadline(notificationType: string): Date {
    const now = new Date();
    switch (notificationType) {
      case "immediate":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case "five_day":
        return this.addBusinessDays(now, 5);
      case "monthly":
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 5);
        return nextMonth;
      default:
        return now;
    }
  }

  /**
   * Add business days to a date
   */
  private addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let daysAdded = 0;
    
    while (daysAdded < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        daysAdded++;
      }
    }
    
    return result;
  }

  /**
   * Validate participant NDIS eligibility
   */
  async validateNDISEligibility(participantId: string): Promise<any> {
    try {
      const [participant] = await db.select()
        .from(participants)
        .where(eq(participants.id, participantId));

      if (!participant) {
        throw new Error("Participant not found");
      }

      // Check NDIS plan validity
      const [activePlan] = await db.select()
        .from(ndisPlans)
        .where(
          and(
            eq(ndisPlans.participantId, participantId),
            eq(ndisPlans.status, "active"),
            gte(ndisPlans.endDate, new Date())
          )
        );

      const eligibility = {
        eligible: !!activePlan,
        ndisNumber: participant.ndisNumber,
        planActive: !!activePlan,
        planEndDate: activePlan?.endDate,
        daysRemaining: activePlan ? 
          Math.floor((activePlan.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
        fundingAvailable: activePlan ? 
          parseFloat(activePlan.totalBudget) > parseFloat(activePlan.budgetUsed || "0") : false,
        requiresReview: activePlan && 
          Math.floor((activePlan.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) < 90
      };

      return eligibility;
    } catch (error) {
      console.error("Error validating NDIS eligibility:", error);
      throw error;
    }
  }

  /**
   * Generate NDIS compliance report
   */
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      // Fetch incidents for period
      const incidentsList = await db.select()
        .from(incidents)
        .where(
          and(
            gte(incidents.dateTime, startDate),
            lte(incidents.dateTime, endDate)
          )
        )
        .orderBy(desc(incidents.dateTime));

      // Categorize incidents
      const categorized = {
        immediate: incidentsList.filter(i => 
          this.INCIDENT_TYPES.IMMEDIATE.includes(i.incidentType)
        ),
        fiveDay: incidentsList.filter(i => 
          this.INCIDENT_TYPES.FIVE_DAY.includes(i.incidentType)
        ),
        monthly: incidentsList.filter(i => 
          this.INCIDENT_TYPES.MONTHLY.includes(i.incidentType)
        )
      };

      // Calculate compliance metrics
      const metrics = {
        totalIncidents: incidentsList.length,
        reportedToNDIS: incidentsList.filter(i => i.ndisReported).length,
        unreported: incidentsList.filter(i => !i.ndisReported && i.notifyNdis).length,
        complianceRate: incidentsList.length > 0 ? 
          (incidentsList.filter(i => i.ndisReported || !i.notifyNdis).length / incidentsList.length * 100).toFixed(1) : 100,
        criticalIncidents: categorized.immediate.length,
        restrictivePractices: incidentsList.filter(i => i.restrictivePractice).length
      };

      return {
        period: {
          start: startDate,
          end: endDate
        },
        metrics,
        incidents: categorized,
        recommendations: this.generateRecommendations(metrics),
        nextAuditDate: this.addBusinessDays(new Date(), 30)
      };
    } catch (error) {
      console.error("Error generating compliance report:", error);
      throw error;
    }
  }

  /**
   * Generate compliance recommendations
   */
  private generateRecommendations(metrics: any): string[] {
    const recommendations = [];
    
    if (metrics.unreported > 0) {
      recommendations.push(`URGENT: ${metrics.unreported} incidents require immediate NDIS notification`);
    }
    
    if (parseFloat(metrics.complianceRate) < 100) {
      recommendations.push("Review incident reporting procedures with all staff");
    }
    
    if (metrics.restrictivePractices > 0) {
      recommendations.push("Schedule restrictive practice review with behaviour support practitioner");
    }
    
    if (metrics.criticalIncidents > 2) {
      recommendations.push("Conduct risk assessment and implement additional safety measures");
    }
    
    return recommendations.length > 0 ? recommendations : ["Maintain current compliance standards"];
  }
}

export const ndisService = new NDISService();