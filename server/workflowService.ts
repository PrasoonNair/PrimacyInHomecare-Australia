import { db } from "./db";
import { sql, eq, and, or, desc, asc } from "drizzle-orm";
import { 
  participants, 
  staff, 
  referrals, 
  serviceAgreements, 
  ndisPlans,
  services,
  workflowAuditLog
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  automated: boolean;
  requiredFields?: string[];
  nextStage?: string;
}

export const WORKFLOW_STAGES: Record<string, WorkflowStage> = {
  referral_received: {
    id: "referral_received",
    name: "Referral Received",
    description: "Initial referral intake completed",
    automated: false
  },
  data_verified: {
    id: "data_verified",
    name: "Data Verified",
    description: "Participant information verification",
    automated: true,
    requiredFields: ["firstName", "lastName", "ndisNumber", "primaryDisability"],
    nextStage: "service_agreement_prepared"
  },
  service_agreement_prepared: {
    id: "service_agreement_prepared",
    name: "Service Agreement Prepared",
    description: "Generate service agreement document",
    automated: true,
    nextStage: "agreement_sent"
  },
  agreement_sent: {
    id: "agreement_sent",
    name: "Agreement Sent",
    description: "Service agreement sent for digital signature",
    automated: true,
    nextStage: "agreement_signed"
  },
  agreement_signed: {
    id: "agreement_signed",
    name: "Agreement Signed",
    description: "Participant has signed service agreement",
    automated: false,
    nextStage: "funding_verification"
  },
  funding_verification: {
    id: "funding_verification",
    name: "Funding Verification",
    description: "Verify NDIS funding and plan details",
    automated: true,
    nextStage: "funding_verified"
  },
  funding_verified: {
    id: "funding_verified",
    name: "Funding Verified",
    description: "NDIS funding confirmed and available",
    automated: true,
    nextStage: "staff_allocation"
  },
  staff_allocation: {
    id: "staff_allocation",
    name: "Staff Allocation",
    description: "Match and allocate appropriate support staff",
    automated: true,
    nextStage: "worker_allocated"
  },
  worker_allocated: {
    id: "worker_allocated",
    name: "Worker Allocated",
    description: "Support worker assigned to participant",
    automated: true,
    nextStage: "meet_greet_scheduled"
  },
  meet_greet_scheduled: {
    id: "meet_greet_scheduled",
    name: "Meet & Greet Scheduled",
    description: "Initial meeting scheduled between participant and worker",
    automated: false,
    nextStage: "meet_greet_completed"
  },
  meet_greet_completed: {
    id: "meet_greet_completed",
    name: "Meet & Greet Completed",
    description: "Initial meeting completed successfully",
    automated: false,
    nextStage: "service_commenced"
  },
  service_commenced: {
    id: "service_commenced",
    name: "Service Commenced",
    description: "Regular service delivery has begun",
    automated: false
  }
};

export class WorkflowService {
  /**
   * Advance a referral to the next workflow stage
   */
  async advanceWorkflow(referralId: string, targetStage?: string, userId?: string): Promise<void> {
    try {
      // Get current referral
      const [referral] = await db
        .select()
        .from(referrals)
        .where(eq(referrals.id, referralId));

      if (!referral) {
        throw new Error("Referral not found");
      }

      const currentStage = referral.workflowStatus || "referral_received";
      const nextStage = targetStage || this.getNextStage(currentStage);

      if (!nextStage) {
        throw new Error("No next stage available");
      }

      // Validate stage requirements
      await this.validateStageRequirements(referralId, nextStage);

      // Execute stage-specific automation
      await this.executeStageAutomation(referralId, nextStage, referral);

      // Update referral workflow stage
      await db
        .update(referrals)
        .set({
          workflowStatus: nextStage,
          updatedAt: new Date()
        })
        .where(eq(referrals.id, referralId));

      // Log the workflow advancement
      await this.logWorkflowAction(referralId, currentStage, nextStage, userId);

      console.log(`Workflow advanced: ${referralId} from ${currentStage} to ${nextStage}`);
    } catch (error) {
      console.error("Error advancing workflow:", error);
      throw error;
    }
  }

  /**
   * Get the next stage in the workflow
   */
  private getNextStage(currentStage: string): string | null {
    const stage = WORKFLOW_STAGES[currentStage];
    return stage?.nextStage || null;
  }

  /**
   * Validate that all requirements are met for a stage
   */
  private async validateStageRequirements(referralId: string, stage: string): Promise<void> {
    const stageConfig = WORKFLOW_STAGES[stage];
    if (!stageConfig?.requiredFields) return;

    // Get referral with participant data
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, referralId));

    if (!referral) {
      throw new Error("Referral not found");
    }

    // Check required fields
    for (const field of stageConfig.requiredFields) {
      if (!referral[field as keyof typeof referral]) {
        throw new Error(`Required field '${field}' is missing for stage ${stage}`);
      }
    }
  }

  /**
   * Execute automated actions for a workflow stage
   */
  private async executeStageAutomation(
    referralId: string, 
    stage: string, 
    referral: any
  ): Promise<void> {
    const stageConfig = WORKFLOW_STAGES[stage];
    if (!stageConfig?.automated) return;

    switch (stage) {
      case "data_verified":
        await this.automateDataVerification(referralId, referral);
        break;
      case "service_agreement_prepared":
        await this.automateServiceAgreementGeneration(referralId, referral);
        break;
      case "agreement_sent":
        await this.automateAgreementSending(referralId, referral);
        break;
      case "funding_verification":
        await this.automateFundingVerification(referralId, referral);
        break;
      case "funding_verified":
        await this.automateFundingConfirmation(referralId, referral);
        break;
      case "staff_allocation":
        await this.automateStaffAllocation(referralId, referral);
        break;
      case "worker_allocated":
        await this.automateWorkerAssignment(referralId, referral);
        break;
    }
  }

  /**
   * Create a participant from referral data
   */
  async createParticipantFromReferral(referralId: string): Promise<string> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, referralId));

    if (!referral) {
      throw new Error("Referral not found");
    }

    // Check if participant already exists
    if (referral.participantId) {
      return referral.participantId;
    }

    // Create new participant
    const [participant] = await db
      .insert(participants)
      .values({
        firstName: referral.participantFirstName,
        lastName: referral.participantLastName,
        ndisNumber: `430${Math.random().toString().substr(2, 6)}`,
        primaryDisability: "Not specified",
        phone: referral.contactPhone || "",
        email: referral.contactEmail || "",
        address: referral.address || "",
        emergencyContact: referral.emergencyContact || "",
        preferredLanguage: "English",
        culturalBackground: "Australian",
        communicationNeeds: "",
        isActive: true
      })
      .returning();

    // Link participant to referral
    await db
      .update(referrals)
      .set({ participantId: participant.id })
      .where(eq(referrals.id, referralId));

    return participant.id;
  }

  /**
   * Generate service agreement for participant
   */
  async generateServiceAgreement(participantId: string): Promise<string> {
    try {
      // Get participant details
      const [participant] = await db
        .select()
        .from(participants)
        .where(eq(participants.id, participantId));

      if (!participant) {
        throw new Error("Participant not found");
      }

      // Generate agreement content
      const agreementContent = this.generateAgreementTemplate(participant);

      // Create service agreement record
      const [agreement] = await db
        .insert(serviceAgreements)
        .values({
          participantId: participantId,
          agreementType: "standard_support",
          status: "draft",
          content: agreementContent,
          generatedDate: new Date(),
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        })
        .returning();

      console.log(`Service agreement generated for participant ${participantId}`);
      return agreement.id;
    } catch (error) {
      console.error("Error generating service agreement:", error);
      throw error;
    }
  }

  /**
   * Send service agreement for digital signature
   */
  async sendServiceAgreement(agreementId: string): Promise<void> {
    try {
      // Update agreement status
      await db
        .update(serviceAgreements)
        .set({
          status: "pending",
          sentDate: new Date()
        })
        .where(eq(serviceAgreements.id, agreementId));

      // In a real implementation, this would integrate with DocuSign or similar
      console.log(`Service agreement ${agreementId} sent for signature`);
    } catch (error) {
      console.error("Error sending service agreement:", error);
      throw error;
    }
  }

  /**
   * Match and allocate staff to participant
   */
  async allocateStaff(participantId: string): Promise<string[]> {
    try {
      // Get participant details
      const [participant] = await db
        .select()
        .from(participants)
        .where(eq(participants.id, participantId));

      if (!participant) {
        throw new Error("Participant not found");
      }

      // Find available staff based on criteria
      const availableStaff = await db
        .select()
        .from(staff)
        .where(and(
          eq(staff.isActive, true),
          or(
            eq(staff.position, "Support Worker"),
            eq(staff.position, "Senior Support Worker"),
            eq(staff.position, "Community Support Worker")
          )
        ));

      if (availableStaff.length === 0) {
        throw new Error("No available staff found");
      }

      // Simple allocation algorithm - select first available
      // In a real system, this would consider location, qualifications, availability, etc.
      const allocatedStaff = availableStaff.slice(0, 2); // Allocate up to 2 staff members

      // Create service records for allocated staff
      const servicePromises = allocatedStaff.map(staffMember => 
        db.insert(services).values({
          participantId: participantId,
          staffId: staffMember.id,
          serviceName: "Personal Care & Support",
          serviceCategory: "daily_living",
          status: "scheduled",
          startDate: new Date().toISOString().split('T')[0],
          hours: "2",
          hourlyRate: staffMember.hourlyRate || "35.00"
        })
      );

      await Promise.all(servicePromises);

      console.log(`Staff allocated for participant ${participantId}: ${allocatedStaff.map(s => s.id).join(', ')}`);
      return allocatedStaff.map(s => s.id);
    } catch (error) {
      console.error("Error allocating staff:", error);
      throw error;
    }
  }

  /**
   * Get workflow status for a referral
   */
  async getWorkflowStatus(referralId: string): Promise<any> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, referralId));

    if (!referral) {
      throw new Error("Referral not found");
    }

    const currentStage = referral.workflowStatus || "referral_received";
    const stageConfig = WORKFLOW_STAGES[currentStage];

    // Get workflow history
    const history = await db
      .select()
      .from(workflowAuditLog)
      .orderBy(desc(workflowAuditLog.createdAt));

    return {
      referralId,
      currentStage,
      stageConfig,
      history,
      canAdvance: !!stageConfig?.nextStage
    };
  }

  // Private automation methods

  private async automateDataVerification(referralId: string, referral: any): Promise<void> {
    // Simulate data verification process
    console.log(`Automating data verification for referral ${referralId}`);
    
    // Create participant if not exists
    if (!referral.participantId) {
      await this.createParticipantFromReferral(referralId);
    }
  }

  private async automateServiceAgreementGeneration(referralId: string, referral: any): Promise<void> {
    console.log(`Automating service agreement generation for referral ${referralId}`);
    
    if (referral.participantId) {
      await this.generateServiceAgreement(referral.participantId);
    }
  }

  private async automateAgreementSending(referralId: string, referral: any): Promise<void> {
    console.log(`Automating agreement sending for referral ${referralId}`);
    
    // Find the latest agreement for this participant
    if (referral.participantId) {
      const [agreement] = await db
        .select()
        .from(serviceAgreements)
        .where(eq(serviceAgreements.participantId, referral.participantId))
        .orderBy(desc(serviceAgreements.createdAt))
        .limit(1);

      if (agreement) {
        await this.sendServiceAgreement(agreement.id);
      }
    }
  }

  private async automateFundingVerification(referralId: string, referral: any): Promise<void> {
    console.log(`Automating funding verification for referral ${referralId}`);
    // Simulate NDIS funding verification
    // In real implementation, this would call NDIS APIs
  }

  private async automateFundingConfirmation(referralId: string, referral: any): Promise<void> {
    console.log(`Automating funding confirmation for referral ${referralId}`);
    // Create NDIS plan record if not exists
    if (referral.participantId) {
      const existingPlan = await db
        .select()
        .from(ndisPlans)
        .where(eq(ndisPlans.participantId, referral.participantId))
        .limit(1);

      if (existingPlan.length === 0) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        await db.insert(ndisPlans).values({
          participantId: referral.participantId,
          planNumber: `PLAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status: "active",
          totalBudget: "80000",
          coreSupportsbudget: "40000",
          capacityBuildingBudget: "25000",
          capitalSupportsBudget: "15000"
        });
      }
    }
  }

  private async automateStaffAllocation(referralId: string, referral: any): Promise<void> {
    console.log(`Automating staff allocation for referral ${referralId}`);
    
    if (referral.participantId) {
      await this.allocateStaff(referral.participantId);
    }
  }

  private async automateWorkerAssignment(referralId: string, referral: any): Promise<void> {
    console.log(`Automating worker assignment for referral ${referralId}`);
    // Additional assignment logic if needed
  }

  private generateAgreementTemplate(participant: any): string {
    return `
SERVICE AGREEMENT

Participant: ${participant.firstName} ${participant.lastName}
NDIS Number: ${participant.ndisNumber}
Date: ${new Date().toLocaleDateString()}

This Service Agreement outlines the terms and conditions for NDIS support services to be provided by Primacy Care Australia.

SERVICES TO BE PROVIDED:
- Personal Care and Support
- Community Access
- Life Skills Development
- Transport Support

TERMS AND CONDITIONS:
1. Services will be provided in accordance with your NDIS Plan
2. All staff are qualified and registered with the NDIS Quality and Safeguards Commission
3. Services will be delivered with respect for your choice and control
4. Regular reviews will be conducted to ensure service quality

PARTICIPANT RIGHTS:
- Right to choice and control over your supports
- Right to be treated with dignity and respect
- Right to privacy and confidentiality
- Right to make complaints

By signing below, you agree to the terms outlined in this agreement.

Participant Signature: ___________________ Date: __________
Service Provider Signature: ______________ Date: __________

Primacy Care Australia
Email: info@primacycare.com.au
Phone: 1300 PRIMACY
    `.trim();
  }

  private async logWorkflowAction(
    referralId: string, 
    fromStage: string, 
    toStage: string, 
    userId?: string
  ): Promise<void> {
    try {
      // Log workflow audit - note: referralId field doesn't exist in table
      await db.insert(workflowAuditLog).values({
        fromStage,
        toStage,
        action: "stage_advancement",
        performedBy: userId || "system",
        notes: `Workflow advanced from ${fromStage} to ${toStage} for referral ${referralId}`
      });
    } catch (error) {
      console.error("Error logging workflow action:", error);
    }
  }
}

export const workflowService = new WorkflowService();