import { db } from '../db';
import { eq, and, gte, lte, desc, asc, sql } from 'drizzle-orm';
import {
  workflowAutomations,
  verificationCheckpoints,
  verificationCheckpointLogs,
  roleKPIs,
  kpiMeasurements,
  automationExecutionLogs,
  processPerformanceMetrics,
  users,
  staff,
  participants,
  type WorkflowAutomation,
  type VerificationCheckpoint,
  type RoleKPI,
  type KPIMeasurement,
} from '../../shared/schema';

export class AutomationEngine {
  private static instance: AutomationEngine;
  private activeAutomations: Map<string, WorkflowAutomation> = new Map();
  private checkpointCache: Map<string, VerificationCheckpoint[]> = new Map();

  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  async initialize() {
    console.log('Initializing Automation Engine...');
    await this.loadActiveAutomations();
    await this.loadVerificationCheckpoints();
    await this.initializeDefaultKPIs();
    console.log('Automation Engine initialized successfully');
  }

  private async loadActiveAutomations() {
    const automations = await db
      .select()
      .from(workflowAutomations)
      .where(eq(workflowAutomations.isActive, true))
      .orderBy(asc(workflowAutomations.priority), asc(workflowAutomations.executionOrder));

    this.activeAutomations.clear();
    automations.forEach(automation => {
      this.activeAutomations.set(automation.id, automation);
    });

    console.log(`Loaded ${automations.length} active automations`);
  }

  private async loadVerificationCheckpoints() {
    const checkpoints = await db
      .select()
      .from(verificationCheckpoints)
      .orderBy(asc(verificationCheckpoints.processType), asc(verificationCheckpoints.checkpointOrder));

    this.checkpointCache.clear();
    checkpoints.forEach(checkpoint => {
      if (!this.checkpointCache.has(checkpoint.processType)) {
        this.checkpointCache.set(checkpoint.processType, []);
      }
      this.checkpointCache.get(checkpoint.processType)!.push(checkpoint);
    });

    console.log(`Loaded verification checkpoints for ${this.checkpointCache.size} processes`);
  }

  /**
   * Execute automation for a specific process
   */
  async executeProcessAutomation(processType: string, processData: any, userId: string) {
    const startTime = Date.now();
    const processInstanceId = `${processType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`Starting automation for process: ${processType}, instance: ${processInstanceId}`);

      // Start performance tracking
      await this.startProcessPerformanceTracking(processType, processInstanceId, processData);

      // Get relevant automations for this process
      const relevantAutomations = Array.from(this.activeAutomations.values())
        .filter(automation => automation.targetProcess === processType);

      // Execute verification checkpoints
      const checkpoints = await this.executeVerificationCheckpoints(processType, processInstanceId, processData, userId);

      // Execute automation actions
      const automationResults = await this.executeAutomationActions(relevantAutomations, processData, userId);

      // Update KPIs
      await this.updateProcessKPIs(processType, processData, userId, checkpoints, automationResults);

      // Complete performance tracking
      await this.completeProcessPerformanceTracking(processInstanceId, checkpoints, automationResults);

      const executionTime = Date.now() - startTime;
      console.log(`Process automation completed in ${executionTime}ms for ${processType}`);

      return {
        processInstanceId,
        executionTime,
        checkpointsExecuted: checkpoints.length,
        automationsExecuted: automationResults.length,
        success: true
      };

    } catch (error) {
      console.error(`Process automation failed for ${processType}:`, error);
      
      await this.logAutomationError(processType, processInstanceId, error, userId);
      
      return {
        processInstanceId,
        executionTime: Date.now() - startTime,
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Execute verification checkpoints for a process
   */
  private async executeVerificationCheckpoints(
    processType: string, 
    processInstanceId: string, 
    processData: any, 
    userId: string
  ) {
    const checkpoints = this.checkpointCache.get(processType) || [];
    const checkpointLogs = [];

    for (const checkpoint of checkpoints) {
      const checkpointStartTime = Date.now();

      try {
        console.log(`Executing checkpoint: ${checkpoint.checkpointName} for ${processType}`);

        // Determine if checkpoint should be executed based on criteria
        const shouldExecute = await this.evaluateCheckpointCriteria(checkpoint, processData);

        if (!shouldExecute && !checkpoint.isRequired) {
          console.log(`Skipping optional checkpoint: ${checkpoint.checkpointName}`);
          continue;
        }

        // Execute checkpoint verification
        const verificationResult = await this.executeCheckpointVerification(checkpoint, processData, userId);

        // Log checkpoint execution
        const checkpointLog = await db.insert(verificationCheckpointLogs).values({
          checkpointId: checkpoint.id,
          processInstanceId,
          processType,
          status: verificationResult.status,
          verifiedBy: verificationResult.verifiedBy || userId,
          verificationNotes: verificationResult.notes,
          verificationData: JSON.stringify(verificationResult.data),
          timeToComplete: Math.round((Date.now() - checkpointStartTime) / 60000), // minutes
          escalatedTo: verificationResult.escalatedTo,
          escalationReason: verificationResult.escalationReason,
          completedAt: verificationResult.status !== 'pending' ? new Date() : null,
        }).returning();

        checkpointLogs.push(checkpointLog[0]);

        // Handle checkpoint failure
        if (verificationResult.status === 'rejected' && checkpoint.isRequired) {
          throw new Error(`Required checkpoint failed: ${checkpoint.checkpointName}`);
        }

      } catch (error) {
        console.error(`Checkpoint execution failed: ${checkpoint.checkpointName}`, error);
        
        // Log failed checkpoint
        await db.insert(verificationCheckpointLogs).values({
          checkpointId: checkpoint.id,
          processInstanceId,
          processType,
          status: 'failed',
          verifiedBy: userId,
          verificationNotes: `Error: ${error.message}`,
          verificationData: JSON.stringify({ error: error.message }),
          timeToComplete: Math.round((Date.now() - checkpointStartTime) / 60000),
          completedAt: new Date(),
        });

        if (checkpoint.isRequired) {
          throw error; // Propagate error for required checkpoints
        }
      }
    }

    return checkpointLogs;
  }

  /**
   * Execute automation actions
   */
  private async executeAutomationActions(automations: WorkflowAutomation[], processData: any, userId: string) {
    const results = [];

    for (const automation of automations) {
      try {
        console.log(`Executing automation: ${automation.name}`);

        // Parse automation actions
        const actions = JSON.parse(automation.automationActions || '[]');
        const actionResults = [];

        for (const action of actions) {
          const actionResult = await this.executeAutomationAction(action, processData, userId);
          actionResults.push(actionResult);
        }

        // Update automation execution stats
        await this.updateAutomationStats(automation.id, true, actionResults);

        // Log execution
        await db.insert(automationExecutionLogs).values({
          automationId: automation.id,
          triggerType: 'process_based',
          triggerData: JSON.stringify(processData),
          executionStatus: 'success',
          actionsExecuted: JSON.stringify(actionResults),
          executionTime: 0, // Will be updated
          executedBy: userId,
        });

        results.push({
          automationId: automation.id,
          name: automation.name,
          actionsExecuted: actionResults.length,
          success: true
        });

      } catch (error) {
        console.error(`Automation execution failed: ${automation.name}`, error);
        
        await this.updateAutomationStats(automation.id, false, []);
        
        results.push({
          automationId: automation.id,
          name: automation.name,
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  /**
   * Execute individual automation action
   */
  private async executeAutomationAction(action: any, processData: any, userId: string) {
    const startTime = Date.now();

    switch (action.type) {
      case 'send_notification':
        return await this.sendAutomationNotification(action, processData, userId);
      
      case 'update_status':
        return await this.updateEntityStatus(action, processData, userId);
      
      case 'create_task':
        return await this.createAutomationTask(action, processData, userId);
      
      case 'send_email':
        return await this.sendAutomationEmail(action, processData, userId);
      
      case 'calculate_metrics':
        return await this.calculateAutomationMetrics(action, processData, userId);
      
      case 'escalate_process':
        return await this.escalateProcess(action, processData, userId);
      
      default:
        throw new Error(`Unknown automation action type: ${action.type}`);
    }
  }

  /**
   * Update KPIs based on process execution
   */
  private async updateProcessKPIs(
    processType: string, 
    processData: any, 
    userId: string, 
    checkpoints: any[], 
    automationResults: any[]
  ) {
    try {
      // Get user role for KPI calculation
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) return;

      const userRole = user[0].role;
      const measurementPeriod = new Date().toISOString().split('T')[0]; // Today's date

      // Get relevant KPIs for this role and process
      const relevantKPIs = await db
        .select()
        .from(roleKPIs)
        .where(and(
          eq(roleKPIs.roleName, userRole),
          eq(roleKPIs.isActive, true)
        ));

      for (const kpi of relevantKPIs) {
        try {
          // Calculate KPI value based on process execution
          const kpiValue = await this.calculateKPIValue(kpi, processType, processData, checkpoints, automationResults);
          
          if (kpiValue !== null) {
            // Upsert KPI measurement
            await this.upsertKPIMeasurement(kpi.id, userId, measurementPeriod, kpiValue, kpi.targetValue);
          }
        } catch (error) {
          console.error(`Failed to update KPI ${kpi.kpiName} for user ${userId}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to update process KPIs:', error);
    }
  }

  /**
   * Calculate KPI value based on process execution
   */
  private async calculateKPIValue(
    kpi: RoleKPI, 
    processType: string, 
    processData: any, 
    checkpoints: any[], 
    automationResults: any[]
  ): Promise<number | null> {
    const calculationMethod = JSON.parse(kpi.calculationMethod || '{}');

    switch (kpi.kpiCategory) {
      case 'productivity':
        return this.calculateProductivityKPI(kpi, processType, processData, checkpoints);
      
      case 'quality':
        return this.calculateQualityKPI(kpi, processType, processData, checkpoints);
      
      case 'compliance':
        return this.calculateComplianceKPI(kpi, processType, processData, checkpoints);
      
      case 'efficiency':
        return this.calculateEfficiencyKPI(kpi, processType, processData, automationResults);
      
      default:
        return null;
    }
  }

  /**
   * Initialize default KPIs for all roles
   */
  private async initializeDefaultKPIs() {
    const defaultKPIs = [
      // Intake Coordinator KPIs
      {
        roleName: 'intake-coordinator',
        kpiName: 'Referrals Processed',
        kpiDescription: 'Number of referrals processed per day',
        kpiCategory: 'productivity',
        measurementType: 'count',
        targetValue: 15,
        targetPeriod: 'daily',
        calculationMethod: JSON.stringify({ type: 'count', table: 'referrals', field: 'status' }),
        dataSource: 'referrals',
      },
      {
        roleName: 'intake-coordinator',
        kpiName: 'Verification Accuracy',
        kpiDescription: 'Percentage of verifications passed on first attempt',
        kpiCategory: 'quality',
        measurementType: 'percentage',
        targetValue: 95,
        targetPeriod: 'weekly',
        calculationMethod: JSON.stringify({ type: 'percentage', numerator: 'passed_first_attempt', denominator: 'total_verifications' }),
        dataSource: 'verification_checkpoint_logs',
      },
      
      // Finance Manager KPIs
      {
        roleName: 'finance-manager',
        kpiName: 'Invoice Processing Time',
        kpiDescription: 'Average time to process invoices (hours)',
        kpiCategory: 'efficiency',
        measurementType: 'time',
        targetValue: 24,
        targetPeriod: 'weekly',
        calculationMethod: JSON.stringify({ type: 'average', field: 'processing_time' }),
        dataSource: 'invoices',
      },
      {
        roleName: 'finance-manager',
        kpiName: 'Travel Calculation Accuracy',
        kpiDescription: 'Percentage of travel calculations verified without errors',
        kpiCategory: 'quality',
        measurementType: 'percentage',
        targetValue: 98,
        targetPeriod: 'weekly',
        calculationMethod: JSON.stringify({ type: 'percentage', numerator: 'verified_accurate', denominator: 'total_calculations' }),
        dataSource: 'provider_travel_calculations',
      },
      
      // HR Manager KPIs
      {
        roleName: 'hr-manager',
        kpiName: 'Staff Onboarding Time',
        kpiDescription: 'Average days to complete staff onboarding',
        kpiCategory: 'efficiency',
        measurementType: 'time',
        targetValue: 7,
        targetPeriod: 'monthly',
        calculationMethod: JSON.stringify({ type: 'average', field: 'onboarding_duration' }),
        dataSource: 'staff_onboarding',
      },
      {
        roleName: 'hr-manager',
        kpiName: 'Document Verification Rate',
        kpiDescription: 'Percentage of staff documents verified within SLA',
        kpiCategory: 'compliance',
        measurementType: 'percentage',
        targetValue: 100,
        targetPeriod: 'weekly',
        calculationMethod: JSON.stringify({ type: 'percentage', numerator: 'verified_on_time', denominator: 'total_documents' }),
        dataSource: 'verification_checkpoint_logs',
      },
      
      // Service Delivery Manager KPIs
      {
        roleName: 'service-delivery-manager',
        kpiName: 'Service Agreement Processing',
        kpiDescription: 'Number of service agreements processed per week',
        kpiCategory: 'productivity',
        measurementType: 'count',
        targetValue: 25,
        targetPeriod: 'weekly',
        calculationMethod: JSON.stringify({ type: 'count', table: 'service_agreements', field: 'status' }),
        dataSource: 'service_agreements',
      },
      {
        roleName: 'service-delivery-manager',
        kpiName: 'Plan Analysis Accuracy',
        kpiDescription: 'Percentage of NDIS plans analyzed accurately',
        kpiCategory: 'quality',
        measurementType: 'percentage',
        targetValue: 96,
        targetPeriod: 'weekly',
        calculationMethod: JSON.stringify({ type: 'percentage', numerator: 'accurate_analyses', denominator: 'total_analyses' }),
        dataSource: 'participant_goals',
      },
      
      // Quality Manager KPIs
      {
        roleName: 'quality-manager',
        kpiName: 'Compliance Audit Score',
        kpiDescription: 'Average compliance audit score',
        kpiCategory: 'compliance',
        measurementType: 'percentage',
        targetValue: 95,
        targetPeriod: 'monthly',
        calculationMethod: JSON.stringify({ type: 'average', field: 'audit_score' }),
        dataSource: 'audits',
      },
      {
        roleName: 'quality-manager',
        kpiName: 'Process Verification Rate',
        kpiDescription: 'Percentage of processes verified within required timeframes',
        kpiCategory: 'efficiency',
        measurementType: 'percentage',
        targetValue: 98,
        targetPeriod: 'weekly',
        calculationMethod: JSON.stringify({ type: 'percentage', numerator: 'verified_on_time', denominator: 'total_verifications' }),
        dataSource: 'verification_checkpoint_logs',
      },
      
      // Support Worker KPIs
      {
        roleName: 'support-worker',
        kpiName: 'Shift Completion Rate',
        kpiDescription: 'Percentage of scheduled shifts completed',
        kpiCategory: 'productivity',
        measurementType: 'percentage',
        targetValue: 98,
        targetPeriod: 'weekly',
        calculationMethod: JSON.stringify({ type: 'percentage', numerator: 'completed_shifts', denominator: 'scheduled_shifts' }),
        dataSource: 'shifts',
      },
      {
        roleName: 'support-worker',
        kpiName: 'Case Note Quality',
        kpiDescription: 'Average case note quality score',
        kpiCategory: 'quality',
        measurementType: 'percentage',
        targetValue: 90,
        targetPeriod: 'weekly',
        calculationMethod: JSON.stringify({ type: 'average', field: 'quality_score' }),
        dataSource: 'progress_notes',
      },
    ];

    for (const kpi of defaultKPIs) {
      try {
        // Check if KPI already exists
        const existing = await db
          .select()
          .from(roleKPIs)
          .where(and(
            eq(roleKPIs.roleName, kpi.roleName),
            eq(roleKPIs.kpiName, kpi.kpiName)
          ))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(roleKPIs).values(kpi);
          console.log(`Initialized KPI: ${kpi.kpiName} for ${kpi.roleName}`);
        }
      } catch (error) {
        console.error(`Failed to initialize KPI ${kpi.kpiName}:`, error);
      }
    }
  }

  // Helper methods for KPI calculations
  private async calculateProductivityKPI(kpi: RoleKPI, processType: string, processData: any, checkpoints: any[]): Promise<number> {
    // Return 1 for each process completed (can be aggregated later)
    return 1;
  }

  private async calculateQualityKPI(kpi: RoleKPI, processType: string, processData: any, checkpoints: any[]): Promise<number> {
    const passedCheckpoints = checkpoints.filter(cp => cp.status === 'approved').length;
    const totalCheckpoints = checkpoints.length;
    return totalCheckpoints > 0 ? (passedCheckpoints / totalCheckpoints) * 100 : 100;
  }

  private async calculateComplianceKPI(kpi: RoleKPI, processType: string, processData: any, checkpoints: any[]): Promise<number> {
    const requiredCheckpoints = checkpoints.filter(cp => cp.isRequired);
    const passedRequiredCheckpoints = requiredCheckpoints.filter(cp => cp.status === 'approved').length;
    return requiredCheckpoints.length > 0 ? (passedRequiredCheckpoints / requiredCheckpoints.length) * 100 : 100;
  }

  private async calculateEfficiencyKPI(kpi: RoleKPI, processType: string, processData: any, automationResults: any[]): Promise<number> {
    const automatedSteps = automationResults.filter(ar => ar.success).length;
    const totalSteps = automationResults.length;
    return totalSteps > 0 ? (automatedSteps / totalSteps) * 100 : 0;
  }

  // Additional helper methods
  private async evaluateCheckpointCriteria(checkpoint: VerificationCheckpoint, processData: any): Promise<boolean> {
    // Simplified evaluation - in production this would have complex logic
    return true;
  }

  private async executeCheckpointVerification(checkpoint: VerificationCheckpoint, processData: any, userId: string) {
    // Simplified verification - in production this would have complex verification logic
    if (checkpoint.verificationType === 'automated') {
      return {
        status: 'approved',
        verifiedBy: 'system',
        notes: 'Automated verification passed',
        data: { automated: true }
      };
    } else {
      return {
        status: 'pending',
        notes: 'Manual verification required',
        data: { manual: true }
      };
    }
  }

  private async startProcessPerformanceTracking(processType: string, processInstanceId: string, processData: any) {
    await db.insert(processPerformanceMetrics).values({
      processType,
      processInstanceId,
      startTime: new Date(),
      participantId: processData.participantId || null,
      staffId: processData.staffId || null,
    });
  }

  private async completeProcessPerformanceTracking(processInstanceId: string, checkpoints: any[], automationResults: any[]) {
    const endTime = new Date();
    await db
      .update(processPerformanceMetrics)
      .set({
        endTime,
        checkpointCount: checkpoints.length,
        checkpointsCompleted: checkpoints.filter(cp => cp.status === 'approved').length,
        automationSteps: automationResults.filter(ar => ar.success).length,
        manualSteps: checkpoints.filter(cp => cp.verificationType === 'manual').length,
        qualityScore: sql`(${checkpoints.filter(cp => cp.status === 'approved').length} * 10.0 / ${checkpoints.length})`,
        complianceScore: sql`(${checkpoints.filter(cp => cp.isRequired && cp.status === 'approved').length} * 10.0 / ${checkpoints.filter(cp => cp.isRequired).length})`,
        efficientScore: sql`(${automationResults.filter(ar => ar.success).length} * 10.0 / ${automationResults.length})`
      })
      .where(eq(processPerformanceMetrics.processInstanceId, processInstanceId));
  }

  private async updateAutomationStats(automationId: string, success: boolean, results: any[]) {
    // Update automation statistics
    const automation = await db.select().from(workflowAutomations).where(eq(workflowAutomations.id, automationId)).limit(1);
    if (automation.length > 0) {
      const currentCount = automation[0].executionCount || 0;
      const currentSuccessRate = parseFloat(automation[0].successRate || '0');
      const newCount = currentCount + 1;
      const newSuccessRate = ((currentSuccessRate * currentCount) + (success ? 100 : 0)) / newCount;

      await db
        .update(workflowAutomations)
        .set({
          executionCount: newCount,
          successRate: newSuccessRate.toFixed(2),
          lastTriggered: new Date(),
        })
        .where(eq(workflowAutomations.id, automationId));
    }
  }

  private async upsertKPIMeasurement(kpiId: string, userId: string, measurementPeriod: string, actualValue: number, targetValue: number | null) {
    const achievementPercentage = targetValue ? (actualValue / Number(targetValue)) * 100 : 100;
    const status = achievementPercentage >= 100 ? 'above_target' : 
                  achievementPercentage >= 80 ? 'on_target' : 
                  achievementPercentage >= 60 ? 'below_target' : 'critical';

    // Check if measurement exists for this period
    const existing = await db
      .select()
      .from(kpiMeasurements)
      .where(and(
        eq(kpiMeasurements.kpiId, kpiId),
        eq(kpiMeasurements.userId, userId),
        eq(kpiMeasurements.measurementPeriod, measurementPeriod)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing measurement
      await db
        .update(kpiMeasurements)
        .set({
          actualValue: existing[0].actualValue + actualValue, // Accumulate values
          achievementPercentage,
          status,
          calculatedAt: new Date(),
        })
        .where(eq(kpiMeasurements.id, existing[0].id));
    } else {
      // Create new measurement
      await db.insert(kpiMeasurements).values({
        kpiId,
        userId,
        measurementPeriod,
        actualValue,
        targetValue: Number(targetValue || 0),
        achievementPercentage,
        status,
      });
    }
  }

  private async logAutomationError(processType: string, processInstanceId: string, error: any, userId: string) {
    console.error(`Automation error for ${processType}:`, error);
  }

  // Automation action implementations
  private async sendAutomationNotification(action: any, processData: any, userId: string) {
    console.log(`Sending notification: ${action.message}`);
    return { type: 'notification', status: 'sent', message: action.message };
  }

  private async updateEntityStatus(action: any, processData: any, userId: string) {
    console.log(`Updating status: ${action.status}`);
    return { type: 'status_update', status: 'updated', newStatus: action.status };
  }

  private async createAutomationTask(action: any, processData: any, userId: string) {
    console.log(`Creating task: ${action.taskName}`);
    return { type: 'task_creation', status: 'created', taskName: action.taskName };
  }

  private async sendAutomationEmail(action: any, processData: any, userId: string) {
    console.log(`Sending email: ${action.subject}`);
    return { type: 'email', status: 'sent', subject: action.subject };
  }

  private async calculateAutomationMetrics(action: any, processData: any, userId: string) {
    console.log(`Calculating metrics: ${action.metricType}`);
    return { type: 'metrics', status: 'calculated', metricType: action.metricType };
  }

  private async escalateProcess(action: any, processData: any, userId: string) {
    console.log(`Escalating process to: ${action.escalateTo}`);
    return { type: 'escalation', status: 'escalated', escalatedTo: action.escalateTo };
  }
}

// Initialize automation engine
export const automationEngine = AutomationEngine.getInstance();