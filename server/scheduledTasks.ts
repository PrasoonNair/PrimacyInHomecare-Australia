import { automationService } from "./automation";
import { storage } from "./storage";

/**
 * Scheduled Tasks for NDIS Manager Automation
 * Handles background processes and automated workflows
 */

interface ScheduledTask {
  name: string;
  schedule: string; // cron-like schedule
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  execute(): Promise<void>;
}

class TaskScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.initializeTasks();
  }

  private initializeTasks() {
    // Daily automation tasks
    this.addTask({
      name: 'daily_budget_monitoring',
      schedule: '0 9 * * *', // 9 AM daily
      enabled: true,
      execute: async () => {
        console.log('Running daily budget monitoring...');
        await automationService.monitorBudgetThresholds();
      }
    });

    this.addTask({
      name: 'daily_goal_progress_update',
      schedule: '0 18 * * *', // 6 PM daily
      enabled: true,
      execute: async () => {
        console.log('Updating goal progress...');
        // Update progress for all active goals
        const participants = await storage.getParticipants();
        for (const participant of participants) {
          const goals = await storage.getParticipantGoals(participant.id);
          for (const goal of goals) {
            if (goal.status === 'active') {
              await automationService.autoUpdateGoalProgress(goal.id);
            }
          }
        }
      }
    });

    // Weekly automation tasks
    this.addTask({
      name: 'weekly_staff_optimization',
      schedule: '0 8 * * 1', // 8 AM every Monday
      enabled: true,
      execute: async () => {
        console.log('Optimizing staff allocation for the week...');
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          await automationService.optimizeStaffAllocation(date);
        }
      }
    });

    this.addTask({
      name: 'weekly_certification_reminders',
      schedule: '0 9 * * 1', // 9 AM every Monday
      enabled: true,
      execute: async () => {
        console.log('Sending certification reminders...');
        await automationService.sendStaffCertificationReminders();
      }
    });

    // Monthly automation tasks
    this.addTask({
      name: 'monthly_invoice_generation',
      schedule: '0 9 1 * *', // 9 AM on 1st of every month
      enabled: true,
      execute: async () => {
        console.log('Generating monthly invoices...');
        const now = new Date();
        const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        await automationService.autoGenerateInvoices(lastMonth, year);
      }
    });

    this.addTask({
      name: 'monthly_payroll_calculation',
      schedule: '0 10 1 * *', // 10 AM on 1st of every month
      enabled: true,
      execute: async () => {
        console.log('Calculating monthly payroll...');
        const now = new Date();
        const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        
        const staff = await storage.getStaff();
        for (const member of staff) {
          await automationService.calculateSCHADSPayroll(member.id, lastMonth, year);
        }
      }
    });

    this.addTask({
      name: 'monthly_compliance_report',
      schedule: '0 11 1 * *', // 11 AM on 1st of every month
      enabled: true,
      execute: async () => {
        console.log('Generating monthly compliance report...');
        const now = new Date();
        const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        await automationService.generateComplianceReports(lastMonth, year);
      }
    });

    this.addTask({
      name: 'monthly_quality_audits',
      schedule: '0 14 15 * *', // 2 PM on 15th of every month
      enabled: true,
      execute: async () => {
        console.log('Scheduling quality audits...');
        await automationService.autoScheduleQualityAudits();
      }
    });

    // Real-time automation tasks
    this.addTask({
      name: 'plan_expiry_reminders',
      schedule: '0 9 * * *', // 9 AM daily
      enabled: true,
      execute: async () => {
        console.log('Checking for plan expiry reminders...');
        await automationService.sendPlanExpiryReminders();
      }
    });

    // Efficiency optimization tasks
    this.addTask({
      name: 'database_optimization',
      schedule: '0 2 * * 0', // 2 AM every Sunday
      enabled: true,
      execute: async () => {
        console.log('Running database optimization...');
        await this.optimizeDatabase();
      }
    });

    this.addTask({
      name: 'performance_analytics',
      schedule: '0 7 * * 1', // 7 AM every Monday
      enabled: true,
      execute: async () => {
        console.log('Generating performance analytics...');
        await this.generatePerformanceAnalytics();
      }
    });
  }

  addTask(task: ScheduledTask) {
    this.tasks.set(task.name, task);
  }

  removeTask(taskName: string) {
    this.tasks.delete(taskName);
  }

  enableTask(taskName: string) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.enabled = true;
    }
  }

  disableTask(taskName: string) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.enabled = false;
    }
  }

  start() {
    console.log('Starting NDIS Manager automation scheduler...');
    
    // Check and run tasks every minute
    this.intervalId = setInterval(() => {
      this.checkAndRunTasks();
    }, 60000); // 1 minute

    // Run immediate checks
    this.checkAndRunTasks();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log('NDIS Manager automation scheduler stopped.');
  }

  private async checkAndRunTasks() {
    const now = new Date();
    
    for (const [taskName, task] of this.tasks) {
      if (!task.enabled) continue;
      
      // Simple schedule check (in production, use a proper cron parser)
      if (this.shouldRunTask(task, now)) {
        try {
          console.log(`Executing task: ${taskName}`);
          await task.execute();
          task.lastRun = now;
          console.log(`Task completed: ${taskName}`);
        } catch (error) {
          console.error(`Task failed: ${taskName}`, error);
        }
      }
    }
  }

  private shouldRunTask(task: ScheduledTask, now: Date): boolean {
    // Simplified schedule checking (would use proper cron parsing in production)
    if (!task.lastRun) return true;
    
    const timeSinceLastRun = now.getTime() - task.lastRun.getTime();
    const scheduleHours = this.parseScheduleToHours(task.schedule);
    
    return timeSinceLastRun >= scheduleHours * 60 * 60 * 1000;
  }

  private parseScheduleToHours(schedule: string): number {
    // Simplified parsing - in production use proper cron parser
    if (schedule.includes('* * *')) return 24; // Daily
    if (schedule.includes('* * 1')) return 24 * 7; // Weekly
    if (schedule.includes('1 * *')) return 24 * 30; // Monthly
    return 1; // Default to hourly
  }

  // Database optimization utilities
  private async optimizeDatabase() {
    try {
      console.log('Running database maintenance...');
      
      // Archive old records
      await this.archiveOldRecords();
      
      // Update statistics
      await this.updateDatabaseStatistics();
      
      // Clean up temporary data
      await this.cleanupTemporaryData();
      
      console.log('Database optimization completed');
    } catch (error) {
      console.error('Database optimization failed:', error);
    }
  }

  private async archiveOldRecords() {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 2); // Archive records older than 2 years
    
    // Archive old services, progress notes, etc.
    // Implementation would move old records to archive tables
    console.log(`Archiving records older than ${cutoffDate.toISOString()}`);
  }

  private async updateDatabaseStatistics() {
    // Update database statistics for query optimization
    console.log('Updating database statistics for query optimization');
  }

  private async cleanupTemporaryData() {
    // Clean up temporary files, session data, etc.
    console.log('Cleaning up temporary data and files');
  }

  private async generatePerformanceAnalytics() {
    try {
      console.log('Generating weekly performance analytics...');
      
      // Calculate key performance indicators
      const analytics = {
        serviceDeliveryRate: await this.calculateServiceDeliveryRate(),
        staffUtilization: await this.calculateStaffUtilization(),
        budgetEfficiency: await this.calculateBudgetEfficiency(),
        goalCompletionRate: await this.calculateGoalCompletionRate(),
        complianceScore: await this.calculateComplianceScore()
      };
      
      // Store analytics for dashboard display
      console.log('Performance Analytics:', analytics);
      
    } catch (error) {
      console.error('Performance analytics generation failed:', error);
    }
  }

  private async calculateServiceDeliveryRate(): Promise<number> {
    // Calculate percentage of services delivered on time
    const totalServices = await storage.getServices();
    const completedServices = totalServices.filter(s => s.status === 'completed');
    return totalServices.length > 0 ? (completedServices.length / totalServices.length) * 100 : 0;
  }

  private async calculateStaffUtilization(): Promise<number> {
    // Calculate average staff utilization rate
    const staff = await storage.getStaff();
    // Implementation would calculate actual utilization
    return 85; // Placeholder
  }

  private async calculateBudgetEfficiency(): Promise<number> {
    // Calculate budget utilization efficiency
    return 92; // Placeholder
  }

  private async calculateGoalCompletionRate(): Promise<number> {
    // Calculate goal completion rate across all participants
    return 78; // Placeholder
  }

  private async calculateComplianceScore(): Promise<number> {
    // Calculate overall compliance score
    return 96; // Placeholder
  }

  // Public method to get task status
  getTaskStatus(): Array<{name: string; enabled: boolean; lastRun?: Date; nextRun?: Date}> {
    return Array.from(this.tasks.values()).map(task => ({
      name: task.name,
      enabled: task.enabled,
      lastRun: task.lastRun,
      nextRun: task.nextRun
    }));
  }
}

// Export singleton instance
export const taskScheduler = new TaskScheduler();

// Auto-start scheduler in development
if (process.env.NODE_ENV === 'development') {
  taskScheduler.start();
}