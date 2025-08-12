import { storage } from "./storage";
import type { InsertAudit } from "@shared/schema";

export enum AuditAction {
  // Participant Actions
  PARTICIPANT_CREATED = "participant_created",
  PARTICIPANT_UPDATED = "participant_updated",
  PARTICIPANT_DELETED = "participant_deleted",
  PARTICIPANT_ACTIVATED = "participant_activated",
  PARTICIPANT_DEACTIVATED = "participant_deactivated",
  
  // Staff Actions
  STAFF_CREATED = "staff_created",
  STAFF_UPDATED = "staff_updated",
  STAFF_DELETED = "staff_deleted",
  STAFF_ONBOARDED = "staff_onboarded",
  STAFF_QUALIFICATION_ADDED = "staff_qualification_added",
  
  // Service Actions
  SERVICE_CREATED = "service_created",
  SERVICE_UPDATED = "service_updated",
  SERVICE_CANCELLED = "service_cancelled",
  SERVICE_COMPLETED = "service_completed",
  SERVICE_ALLOCATED = "service_allocated",
  
  // Shift Actions
  SHIFT_CREATED = "shift_created",
  SHIFT_UPDATED = "shift_updated",
  SHIFT_CANCELLED = "shift_cancelled",
  SHIFT_APPROVED = "shift_approved",
  SHIFT_COMPLETED = "shift_completed",
  
  // Plan Actions
  PLAN_CREATED = "plan_created",
  PLAN_UPDATED = "plan_updated",
  PLAN_ACTIVATED = "plan_activated",
  PLAN_EXPIRED = "plan_expired",
  
  // Referral Actions
  REFERRAL_CREATED = "referral_created",
  REFERRAL_ACCEPTED = "referral_accepted",
  REFERRAL_REJECTED = "referral_rejected",
  REFERRAL_CONVERTED = "referral_converted",
  
  // Agreement Actions
  AGREEMENT_CREATED = "agreement_created",
  AGREEMENT_SIGNED = "agreement_signed",
  AGREEMENT_UPDATED = "agreement_updated",
  AGREEMENT_EXPIRED = "agreement_expired",
  
  // Financial Actions
  INVOICE_CREATED = "invoice_created",
  INVOICE_PAID = "invoice_paid",
  PAYMENT_RECEIVED = "payment_received",
  PAYROLL_PROCESSED = "payroll_processed",
}

export interface AuditContext {
  userId?: string;
  entityType: "participant" | "staff" | "service" | "shift" | "plan" | "referral" | "agreement" | "invoice" | "payroll";
  entityId: string;
  action: AuditAction;
  details: Record<string, any>;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  department?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  async log(context: AuditContext): Promise<void> {
    try {
      const auditEntry: InsertAudit = {
        auditType: this.getAuditType(context.action),
        auditDate: new Date().toISOString().split('T')[0],
        auditorName: context.userId || "System",
        departmentAudited: this.getDepartment(context.entityType),
        participantId: context.entityType === "participant" ? context.entityId : undefined,
        staffId: context.entityType === "staff" ? context.entityId : undefined,
        serviceId: context.entityType === "service" ? context.entityId : undefined,
        findings: JSON.stringify({
          action: context.action,
          entityType: context.entityType,
          entityId: context.entityId,
          timestamp: new Date().toISOString(),
          details: context.details,
          previousValues: context.previousValues,
          newValues: context.newValues,
          metadata: {
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          }
        }),
        recommendations: this.generateRecommendations(context),
        actionItems: this.generateActionItems(context),
        status: "completed",
        createdBy: context.userId,
      };
      
      await storage.createAudit(auditEntry);
    } catch (error) {
      console.error("Failed to create audit log:", error);
      // Don't throw - audit failures shouldn't break operations
    }
  }
  
  private getAuditType(action: AuditAction): string {
    if (action.includes("created") || action.includes("updated")) return "data_modification";
    if (action.includes("deleted")) return "data_deletion";
    if (action.includes("approved") || action.includes("signed")) return "approval";
    if (action.includes("completed")) return "completion";
    return "system_action";
  }
  
  private getDepartment(entityType: string): string {
    switch (entityType) {
      case "participant":
      case "referral":
      case "agreement":
        return "intake";
      case "staff":
        return "hr_recruitment";
      case "service":
      case "shift":
        return "service_delivery";
      case "invoice":
      case "payroll":
        return "finance";
      case "plan":
        return "compliance_quality";
      default:
        return "system";
    }
  }
  
  private generateRecommendations(context: AuditContext): string {
    const recommendations: string[] = [];
    
    if (context.action === AuditAction.PARTICIPANT_CREATED) {
      recommendations.push("Complete participant onboarding checklist");
      recommendations.push("Schedule initial assessment");
      recommendations.push("Assign case manager");
    }
    
    if (context.action === AuditAction.STAFF_ONBOARDED) {
      recommendations.push("Verify all qualifications");
      recommendations.push("Complete mandatory training modules");
      recommendations.push("Set up initial performance review");
    }
    
    if (context.action === AuditAction.SERVICE_ALLOCATED) {
      recommendations.push("Confirm staff availability");
      recommendations.push("Send confirmation to participant");
      recommendations.push("Prepare service materials");
    }
    
    if (context.action === AuditAction.SHIFT_COMPLETED) {
      recommendations.push("Submit progress notes");
      recommendations.push("Process timesheet");
      recommendations.push("Update participant records");
    }
    
    return recommendations.join("; ") || "No specific recommendations";
  }
  
  private generateActionItems(context: AuditContext): string[] {
    const items: string[] = [];
    
    if (context.action.includes("created")) {
      items.push(`Review new ${context.entityType} record`);
      items.push(`Verify data completeness`);
    }
    
    if (context.action.includes("updated")) {
      items.push(`Review changes to ${context.entityType}`);
      items.push(`Notify relevant stakeholders`);
    }
    
    if (context.action === AuditAction.SERVICE_ALLOCATED) {
      items.push("Send allocation notification");
      items.push("Update roster");
      items.push("Prepare service documentation");
    }
    
    return items.length > 0 ? items : ["No action items required"];
  }
  
  // Convenience methods for common operations
  async logParticipantCreated(participantId: string, userId: string, details: any) {
    await this.log({
      userId,
      entityType: "participant",
      entityId: participantId,
      action: AuditAction.PARTICIPANT_CREATED,
      details,
      newValues: details,
    });
  }
  
  async logParticipantUpdated(participantId: string, userId: string, previousValues: any, newValues: any) {
    await this.log({
      userId,
      entityType: "participant",
      entityId: participantId,
      action: AuditAction.PARTICIPANT_UPDATED,
      details: { updatedFields: Object.keys(newValues) },
      previousValues,
      newValues,
    });
  }
  
  async logStaffOnboarded(staffId: string, userId: string, details: any) {
    await this.log({
      userId,
      entityType: "staff",
      entityId: staffId,
      action: AuditAction.STAFF_ONBOARDED,
      details,
      newValues: details,
    });
  }
  
  async logServiceAllocated(serviceId: string, staffId: string, participantId: string, userId: string) {
    await this.log({
      userId,
      entityType: "service",
      entityId: serviceId,
      action: AuditAction.SERVICE_ALLOCATED,
      details: {
        staffId,
        participantId,
        allocationDate: new Date().toISOString(),
      },
    });
  }
  
  async logShiftCompleted(shiftId: string, staffId: string, userId: string, details: any) {
    await this.log({
      userId,
      entityType: "shift",
      entityId: shiftId,
      action: AuditAction.SHIFT_COMPLETED,
      details: {
        ...details,
        staffId,
        completedAt: new Date().toISOString(),
      },
    });
  }
}

export const auditLogger = new AuditLogger();

// Convenience function for direct audit logging
export async function logAudit({
  action,
  entityType,
  entityId,
  changes,
  performedBy,
  department
}: {
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  performedBy: string;
  department?: string;
}) {
  const actionMap: { [key: string]: AuditAction } = {
    'CREATE': AuditAction.PARTICIPANT_CREATED,
    'UPDATE': AuditAction.PARTICIPANT_UPDATED,
    'DELETE': AuditAction.PARTICIPANT_DELETED,
    'UPLOAD': AuditAction.PARTICIPANT_UPDATED,
    'SIGN': AuditAction.AGREEMENT_SIGNED,
    'SEND': AuditAction.AGREEMENT_UPDATED,
  };

  const entityTypeMap: { [key: string]: string } = {
    'PARTICIPANT_GOAL': 'participant',
    'SERVICE_AGREEMENT': 'agreement',
    'PLAN_DOCUMENT': 'plan',
  };

  await auditLogger.log({
    userId: performedBy,
    entityType: (entityTypeMap[entityType] || entityType?.toLowerCase() || 'unknown') as any,
    entityId: entityId || 'unknown',
    action: actionMap[action] || AuditAction.PARTICIPANT_UPDATED,
    details: changes || {},
    department: department || 'General',
  });
}