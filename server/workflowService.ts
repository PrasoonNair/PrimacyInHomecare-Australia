import { db } from "./db";
import { 
  referrals, 
  participants,
  serviceAgreements,
  serviceAgreementTemplates,
  fundingBudgets,
  meetGreets,
  staffMatchingCriteria,
  workflowAuditLog,
  staff,
  ndisPlans
} from "@shared/schema";
import { eq, and, or, gte, lte, sql, desc } from "drizzle-orm";

export class WorkflowService {
  // Workflow status progression
  private readonly workflowSteps = [
    "referral_received",
    "data_verified", 
    "pending_service_agreement",
    "agreement_sent",
    "agreement_signed",
    "pending_funding_verification",
    "funding_verified",
    "ready_for_allocation",
    "worker_allocated",
    "meet_greet_scheduled",
    "meet_greet_completed",
    "service_commenced"
  ];

  // Process referral upload and auto-extract data
  async processReferralUpload(referralId: string, documentUrl: string, documentType: string) {
    try {
      // Simulate OCR/AI extraction (in production, integrate with actual OCR service)
      const extractedData = await this.extractDataFromDocument(documentUrl, documentType);
      
      // Update referral with extracted data
      await db.update(referrals)
        .set({
          autoExtractedData: extractedData,
          extractionStatus: "completed",
          mandatoryFieldsComplete: this.checkMandatoryFields(extractedData),
          updatedAt: new Date()
        })
        .where(eq(referrals.id, referralId));

      // Log the action
      await this.logWorkflowAction(
        "referral",
        referralId,
        null,
        "data_extracted",
        "Document processed and data extracted"
      );

      return { success: true, extractedData };
    } catch (error) {
      await db.update(referrals)
        .set({
          extractionStatus: "failed",
          updatedAt: new Date()
        })
        .where(eq(referrals.id, referralId));
      
      throw error;
    }
  }

  // Simulate data extraction (replace with actual OCR/AI service)
  private async extractDataFromDocument(documentUrl: string, documentType: string) {
    // In production, integrate with OCR service like Azure Form Recognizer or AWS Textract
    return {
      participantName: "Extracted Name",
      ndisNumber: "1234567890",
      dateOfBirth: "1990-01-01",
      planStartDate: "2024-01-01",
      planEndDate: "2025-01-01",
      supportCategories: ["Core", "Capacity Building"],
      contactPhone: "0400000000",
      contactEmail: "participant@example.com"
    };
  }

  // Check if all mandatory fields are complete
  private checkMandatoryFields(data: any): boolean {
    const requiredFields = [
      "ndisNumber",
      "dateOfBirth",
      "planStartDate",
      "planEndDate",
      "supportCategories",
      "contactPhone"
    ];

    return requiredFields.every(field => data[field] !== null && data[field] !== undefined);
  }

  // Move referral to next workflow step
  async advanceWorkflow(referralId: string, currentStatus: string) {
    const currentIndex = this.workflowSteps.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === this.workflowSteps.length - 1) {
      return { success: false, message: "Cannot advance workflow" };
    }

    const nextStatus = this.workflowSteps[currentIndex + 1];
    
    // Perform status-specific actions
    const result = await this.performWorkflowAction(referralId, nextStatus);
    
    if (result.success) {
      await db.update(referrals)
        .set({
          workflowStatus: nextStatus,
          updatedAt: new Date()
        })
        .where(eq(referrals.id, referralId));

      await this.logWorkflowAction(
        "referral",
        referralId,
        currentStatus,
        nextStatus,
        result.message
      );
    }

    return result;
  }

  // Perform specific actions for each workflow step
  private async performWorkflowAction(referralId: string, newStatus: string) {
    switch (newStatus) {
      case "data_verified":
        return await this.verifyReferralData(referralId);
      
      case "pending_service_agreement":
        return await this.prepareServiceAgreement(referralId);
      
      case "agreement_sent":
        return await this.sendServiceAgreement(referralId);
      
      case "pending_funding_verification":
        return await this.initiateFundingVerification(referralId);
      
      case "ready_for_allocation":
        return await this.preparForAllocation(referralId);
      
      case "meet_greet_scheduled":
        return await this.scheduleMeetGreet(referralId);
      
      default:
        return { success: true, message: `Moved to ${newStatus}` };
    }
  }

  // Verify referral data completeness
  private async verifyReferralData(referralId: string) {
    const [referral] = await db.select()
      .from(referrals)
      .where(eq(referrals.id, referralId));

    if (!referral.mandatoryFieldsComplete) {
      return { 
        success: false, 
        message: "Mandatory fields are not complete" 
      };
    }

    await db.update(referrals)
      .set({
        dataVerifiedAt: new Date(),
        dataVerifiedBy: "system" // In production, use actual user ID
      })
      .where(eq(referrals.id, referralId));

    return { 
      success: true, 
      message: "Data verified successfully" 
    };
  }

  // Prepare service agreement from template
  private async prepareServiceAgreement(referralId: string) {
    const [referral] = await db.select()
      .from(referrals)
      .where(eq(referrals.id, referralId));

    // Get appropriate template
    const [template] = await db.select()
      .from(serviceAgreementTemplates)
      .where(
        and(
          eq(serviceAgreementTemplates.isActive, true),
          eq(serviceAgreementTemplates.templateType, "standard")
        )
      )
      .limit(1);

    if (!template) {
      return { 
        success: false, 
        message: "No active service agreement template found" 
      };
    }

    // Create service agreement
    const agreementNumber = `SA-${Date.now()}`;
    await db.insert(serviceAgreements).values({
      participantId: referral.participantId!,
      referralId: referralId,
      agreementNumber,
      templateUsed: template.id,
      startDate: referral.planStartDate!,
      endDate: referral.planEndDate!,
      status: "draft",
      workflowStep: "template_selected",
      prepopulatedData: referral.autoExtractedData,
      language: "en"
    });

    await db.update(referrals)
      .set({
        agreementTemplateId: template.id
      })
      .where(eq(referrals.id, referralId));

    return { 
      success: true, 
      message: "Service agreement prepared from template" 
    };
  }

  // Send service agreement for e-signature
  private async sendServiceAgreement(referralId: string) {
    // In production, integrate with DocuSign or Adobe Sign API
    const signatureRequestId = `SIG-${Date.now()}`;
    
    await db.update(referrals)
      .set({
        agreementSentAt: new Date()
      })
      .where(eq(referrals.id, referralId));

    const [agreement] = await db.select()
      .from(serviceAgreements)
      .where(eq(serviceAgreements.referralId, referralId))
      .limit(1);

    if (agreement) {
      await db.update(serviceAgreements)
        .set({
          signatureMethod: "docusign",
          signatureRequestId,
          sentForSignatureAt: new Date(),
          status: "sent",
          workflowStep: "sent_for_signature"
        })
        .where(eq(serviceAgreements.id, agreement.id));
    }

    return { 
      success: true, 
      message: "Service agreement sent for signature" 
    };
  }

  // Initiate funding verification
  private async initiateFundingVerification(referralId: string) {
    const [referral] = await db.select()
      .from(referrals)
      .where(eq(referrals.id, referralId));

    if (!referral.participantId) {
      return { 
        success: false, 
        message: "Participant not linked to referral" 
      };
    }

    // Get participant's NDIS plan
    const [plan] = await db.select()
      .from(ndisPlans)
      .where(eq(ndisPlans.participantId, referral.participantId))
      .orderBy(desc(ndisPlans.startDate))
      .limit(1);

    if (!plan) {
      return { 
        success: false, 
        message: "No NDIS plan found for participant" 
      };
    }

    // Create funding budget record
    await db.insert(fundingBudgets).values({
      participantId: referral.participantId,
      planId: plan.id,
      coreBudget: "50000",
      capacityBuildingBudget: "30000",
      capitalBudget: "10000",
      coreRemaining: "50000",
      capacityBuildingRemaining: "30000",
      capitalRemaining: "10000",
      verificationStatus: "pending"
    });

    return { 
      success: true, 
      message: "Funding verification initiated" 
    };
  }

  // Prepare for staff allocation
  private async preparForAllocation(referralId: string) {
    const [referral] = await db.select()
      .from(referrals)
      .where(eq(referrals.id, referralId));

    if (!referral.participantId) {
      return { 
        success: false, 
        message: "Participant not linked to referral" 
      };
    }

    // Create staff matching criteria
    await db.insert(staffMatchingCriteria).values({
      participantId: referral.participantId,
      preferredLocations: ["Melbourne", "Sydney"],
      maxTravelDistance: 20,
      requiredQualifications: ["Certificate IV in Disability"],
      minimumMatchScore: 70
    });

    await db.update(referrals)
      .set({
        fundingVerified: true
      })
      .where(eq(referrals.id, referralId));

    return { 
      success: true, 
      message: "Ready for staff allocation" 
    };
  }

  // Schedule meet & greet
  private async scheduleMeetGreet(referralId: string) {
    const [referral] = await db.select()
      .from(referrals)
      .where(eq(referrals.id, referralId));

    if (!referral.participantId || !referral.allocatedStaffId) {
      return { 
        success: false, 
        message: "Participant or staff not allocated" 
      };
    }

    // Create meet & greet record
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 3); // Schedule 3 days from now

    await db.insert(meetGreets).values({
      referralId,
      participantId: referral.participantId,
      staffId: referral.allocatedStaffId,
      scheduledDate,
      locationType: "in_person",
      status: "scheduled"
    });

    await db.update(referrals)
      .set({
        meetGreetScheduled: scheduledDate
      })
      .where(eq(referrals.id, referralId));

    return { 
      success: true, 
      message: "Meet & greet scheduled" 
    };
  }

  // Find matching staff for participant
  async findMatchingStaff(participantId: string) {
    // Get participant's matching criteria
    const [criteria] = await db.select()
      .from(staffMatchingCriteria)
      .where(eq(staffMatchingCriteria.participantId, participantId));

    if (!criteria) {
      return [];
    }

    // Get all available staff
    const availableStaff = await db.select()
      .from(staff)
      .where(eq(staff.status, "active"));

    // Calculate match scores
    const scoredStaff = availableStaff.map(staffMember => {
      let score = 100;
      
      // Check qualifications
      const hasRequiredQualifications = criteria.requiredQualifications?.every(
        qual => staffMember.qualifications?.includes(qual)
      );
      if (!hasRequiredQualifications) score -= 30;

      // Check location
      if (criteria.preferredLocations && !criteria.preferredLocations.includes(staffMember.location || "")) {
        score -= 20;
      }

      // Check gender preference
      if (criteria.genderPreference && staffMember.gender !== criteria.genderPreference) {
        score -= 15;
      }

      // Check language
      if (criteria.languagePreference && !criteria.languagePreference.some(
        lang => staffMember.languages?.includes(lang)
      )) {
        score -= 10;
      }

      return {
        ...staffMember,
        matchScore: Math.max(0, score)
      };
    });

    // Filter by minimum score and sort
    return scoredStaff
      .filter(s => s.matchScore >= (criteria.minimumMatchScore || 70))
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  // Allocate staff to referral
  async allocateStaff(referralId: string, staffId: string) {
    await db.update(referrals)
      .set({
        allocatedStaffId: staffId,
        allocationDate: new Date(),
        workflowStatus: "worker_allocated"
      })
      .where(eq(referrals.id, referralId));

    await this.logWorkflowAction(
      "referral",
      referralId,
      "ready_for_allocation",
      "worker_allocated",
      `Staff ${staffId} allocated`
    );

    return { success: true };
  }

  // Record meet & greet outcome
  async recordMeetGreetOutcome(
    meetGreetId: string,
    participantDecision: string,
    staffDecision: string,
    participantFeedback?: string,
    staffFeedback?: string
  ) {
    const outcome = participantDecision === "accept" && staffDecision === "accept" 
      ? "successful" 
      : participantDecision === "decline" 
      ? "participant_declined"
      : staffDecision === "decline"
      ? "worker_declined"
      : "no_decision";

    await db.update(meetGreets)
      .set({
        participantDecision,
        staffDecision,
        participantFeedback,
        staffFeedback,
        outcome,
        status: "completed",
        updatedAt: new Date()
      })
      .where(eq(meetGreets.id, meetGreetId));

    // Update referral status if successful
    if (outcome === "successful") {
      const [meetGreet] = await db.select()
        .from(meetGreets)
        .where(eq(meetGreets.id, meetGreetId));

      if (meetGreet?.referralId) {
        await db.update(referrals)
          .set({
            workflowStatus: "service_commenced",
            meetGreetCompleted: true,
            meetGreetOutcome: outcome
          })
          .where(eq(referrals.id, meetGreet.referralId));
      }
    }

    return { success: true, outcome };
  }

  // Verify funding availability
  async verifyFunding(participantId: string, serviceCategory: string, amount: number) {
    const [budget] = await db.select()
      .from(fundingBudgets)
      .where(eq(fundingBudgets.participantId, participantId))
      .orderBy(desc(fundingBudgets.createdAt))
      .limit(1);

    if (!budget) {
      return { 
        hasAvailableFunds: false, 
        message: "No budget found for participant" 
      };
    }

    let availableFunds = 0;
    let budgetCategory = "";

    switch (serviceCategory.toLowerCase()) {
      case "core":
        availableFunds = Number(budget.coreRemaining || 0);
        budgetCategory = "core";
        break;
      case "capacity_building":
        availableFunds = Number(budget.capacityBuildingRemaining || 0);
        budgetCategory = "capacity_building";
        break;
      case "capital":
        availableFunds = Number(budget.capitalRemaining || 0);
        budgetCategory = "capital";
        break;
    }

    const hasAvailableFunds = availableFunds >= amount;

    // Update verification status
    await db.update(fundingBudgets)
      .set({
        verificationStatus: hasAvailableFunds ? "verified" : "insufficient_funds",
        verifiedAt: new Date(),
        verificationNotes: hasAvailableFunds 
          ? `Sufficient ${budgetCategory} funds available`
          : `Insufficient ${budgetCategory} funds. Required: $${amount}, Available: $${availableFunds}`
      })
      .where(eq(fundingBudgets.id, budget.id));

    // Send alert if below threshold
    if (availableFunds > 0 && (availableFunds / Number(budget.coreBudget || 1)) * 100 < (budget.alertThreshold || 20)) {
      await db.update(fundingBudgets)
        .set({
          alertSent: true
        })
        .where(eq(fundingBudgets.id, budget.id));
    }

    return { 
      hasAvailableFunds, 
      availableFunds,
      message: hasAvailableFunds 
        ? "Funds verified successfully" 
        : `Insufficient ${budgetCategory} funds`
    };
  }

  // Log workflow actions for audit trail
  private async logWorkflowAction(
    entityType: string,
    entityId: string,
    previousStatus: string | null,
    newStatus: string,
    action: string,
    details?: any
  ) {
    await db.insert(workflowAuditLog).values({
      entityType,
      entityId,
      previousStatus,
      newStatus,
      action,
      performedBy: "system", // In production, use actual user ID
      performedByRole: "System",
      details,
      isCompliant: true
    });
  }

  // Get workflow history for an entity
  async getWorkflowHistory(entityType: string, entityId: string) {
    return await db.select()
      .from(workflowAuditLog)
      .where(
        and(
          eq(workflowAuditLog.entityType, entityType),
          eq(workflowAuditLog.entityId, entityId)
        )
      )
      .orderBy(desc(workflowAuditLog.createdAt));
  }

  // Get service agreement templates
  async getServiceAgreementTemplates() {
    return await db.select()
      .from(serviceAgreementTemplates)
      .where(eq(serviceAgreementTemplates.isActive, true))
      .orderBy(desc(serviceAgreementTemplates.createdAt));
  }

  // Create or update service agreement template
  async upsertServiceAgreementTemplate(template: any) {
    const existing = await db.select()
      .from(serviceAgreementTemplates)
      .where(eq(serviceAgreementTemplates.name, template.name))
      .limit(1);

    if (existing.length > 0) {
      await db.update(serviceAgreementTemplates)
        .set({
          ...template,
          updatedAt: new Date()
        })
        .where(eq(serviceAgreementTemplates.id, existing[0].id));
      
      return existing[0].id;
    } else {
      const [newTemplate] = await db.insert(serviceAgreementTemplates)
        .values(template)
        .returning();
      
      return newTemplate.id;
    }
  }
}

export const workflowService = new WorkflowService();