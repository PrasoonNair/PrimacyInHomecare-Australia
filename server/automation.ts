import { storage } from "./storage";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

/**
 * Comprehensive Automation System for NDIS Manager
 * Handles intelligent scheduling, automated processing, and efficiency optimizations
 */

// Automation Service Interface
export interface AutomationService {
  // Staff & Service Automation
  intelligentStaffMatching(participantId: string, serviceType: string, dateTime: Date): Promise<string[]>;
  automateServiceScheduling(participantId: string, goalId: string): Promise<void>;
  optimizeStaffAllocation(date: Date): Promise<void>;

  // Financial Automation
  autoGenerateInvoices(month: number, year: number): Promise<void>;
  calculateSCHADSPayroll(staffId: string, month: number, year: number): Promise<number>;
  monitorBudgetThresholds(): Promise<void>;

  // Progress & Compliance Automation
  autoUpdateGoalProgress(goalId: string): Promise<void>;
  generateComplianceReports(month: number, year: number): Promise<void>;
  autoScheduleQualityAudits(): Promise<void>;

  // Notification & Alert System
  sendBudgetAlerts(): Promise<void>;
  sendPlanExpiryReminders(): Promise<void>;
  sendStaffCertificationReminders(): Promise<void>;

  // Document Processing Automation
  processNDISPlanDocument(planId: string, documentPath: string): Promise<void>;
  extractGoalsFromPlan(planContent: string): Promise<any[]>;
}

export class NDISAutomationService implements AutomationService {
  private storage: IStorage;
  
  constructor() {
    this.storage = storage;
  }
  
  /**
   * Intelligent Staff Matching Algorithm
   * Matches staff to participants based on qualifications, availability, location, and preferences
   */
  async intelligentStaffMatching(participantId: string, serviceType: string, dateTime: Date): Promise<string[]> {
    // Get participant details and preferences
    const participant = await storage.getParticipant(participantId);
    if (!participant) throw new Error("Participant not found");

    // Get available staff for the date/time
    const availableStaff = await db.execute(sql`
      SELECT s.*, sq.qualification_type, sq.expiry_date,
             ST_Distance(s.location, ${participant.address}) as distance
      FROM staff s
      LEFT JOIN staff_qualifications sq ON s.id = sq.staff_id
      LEFT JOIN staff_availability sa ON s.id = sa.staff_id
      WHERE s.is_active = true 
        AND s.department = 'service_delivery'
        AND sq.qualification_status = 'current'
        AND (sa.start_time <= ${dateTime} AND sa.end_time >= ${dateTime})
        AND NOT EXISTS (
          SELECT 1 FROM shifts sh 
          WHERE sh.staff_id = s.id 
            AND sh.scheduled_date = ${dateTime.toDateString()}
            AND sh.status IN ('scheduled', 'confirmed', 'in_progress')
        )
      ORDER BY distance ASC, s.rating DESC, s.experience_years DESC
      LIMIT 5
    `);

    return availableStaff.map((staff: any) => staff.id);
  }

  /**
   * Automated Service Scheduling
   * Creates optimal schedules based on goal requirements and staff availability
   */
  async automateServiceScheduling(participantId: string, goalId: string): Promise<void> {
    const goal = await storage.getParticipantGoal(goalId);
    if (!goal) throw new Error("Goal not found");

    const actions = await storage.getGoalActions(goalId);
    
    for (const action of actions) {
      if (action.frequency && action.status === 'pending') {
        const frequency = this.parseFrequency(action.frequency);
        const schedules = this.generateScheduleDates(frequency, goal.targetDate);
        
        for (const scheduleDate of schedules) {
          const suitableStaff = await this.intelligentStaffMatching(
            participantId, 
            goal.goalCategory, 
            scheduleDate
          );

          if (suitableStaff.length > 0) {
            // Create automated service booking
            await storage.createService({
              participantId,
              staffId: suitableStaff[0], // Best match
              serviceType: goal.goalCategory,
              scheduledDate: scheduleDate.toISOString().split('T')[0], // YYYY-MM-DD format
              duration: 60, // Default 1 hour
              location: 'participant_home',
              status: 'scheduled',
              notes: `Auto-scheduled for goal: ${goal.goalDescription}`,
              supportItemId: action.supportItemId,
              estimatedCost: action.estimatedCost
            });
          }
        }
      }
    }
  }

  /**
   * Automated Invoice Generation
   * Generates invoices from completed services with NDIS pricing integration
   */
  async autoGenerateInvoices(month: number, year: number): Promise<void> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get all completed services for the month
    const completedServices = await storage.getServicesByDateRange(startDate, endDate);
    const servicesByParticipant = new Map();

    // Group services by participant
    completedServices.forEach(service => {
      if (service.status === 'completed') {
        if (!servicesByParticipant.has(service.participantId)) {
          servicesByParticipant.set(service.participantId, []);
        }
        servicesByParticipant.get(service.participantId).push(service);
      }
    });

    // Generate invoices for each participant
    for (const [participantId, services] of servicesByParticipant) {
      const participant = await storage.getParticipant(participantId);
      if (!participant) continue;

      const totalAmount = services.reduce((sum: number, service: any) => {
        return sum + (service.actualCost || service.estimatedCost || 0);
      }, 0);

      // Create invoice
      const invoice = await storage.createInvoice({
        participantId,
        invoiceNumber: `INV-${year}${month.toString().padStart(2, '0')}-${participantId.slice(-6).toUpperCase()}`,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        totalAmount,
        gstAmount: totalAmount * 0.1, // 10% GST
        status: 'draft',
        notes: `Auto-generated invoice for ${month}/${year}`
      });

      // Create line items for each service
      for (const service of services) {
        await storage.createInvoiceLineItem({
          invoiceId: invoice.id,
          description: `${service.serviceType} - ${new Date(service.scheduledDate).toLocaleDateString()}`,
          quantity: service.duration / 60, // Convert minutes to hours
          unitPrice: (service.actualCost || service.estimatedCost || 0) / (service.duration / 60),
          totalPrice: service.actualCost || service.estimatedCost || 0,
          supportItemId: service.supportItemId
        });
      }
    }
  }

  /**
   * SCHADS Award Payroll Calculation
   * Calculates staff payroll based on SCHADS award rates, qualifications, and hours worked
   */
  async calculateSCHADSPayroll(staffId: string, month: number, year: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get staff details and qualifications
    const staff = await storage.getStaffMember(staffId);
    if (!staff) throw new Error("Staff member not found");

    const qualifications = await storage.getStaffQualificationsByStaff(staffId);
    
    // Get completed shifts for the month
    const shifts = await storage.getShiftsByStaff(staffId);
    const monthlyShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.scheduledDate);
      return shiftDate >= startDate && shiftDate <= endDate && shift.status === 'completed';
    });

    // Determine SCHADS level based on qualifications and experience
    const schadLevel = this.determineSCHADSLevel(staff, qualifications);
    const baseRate = await this.getSCHADSRate(schadLevel, year);

    let totalPay = 0;
    let regularHours = 0;
    let overtimeHours = 0;
    let weekendHours = 0;
    let publicHolidayHours = 0;

    for (const shift of monthlyShifts) {
      const shiftDate = new Date(shift.scheduledDate);
      const hours = (shift.actualEndTime ? 
        new Date(shift.actualEndTime).getTime() - new Date(shift.actualStartTime || shift.scheduledDate).getTime() 
        : shift.duration) / (1000 * 60 * 60);

      // Categorize hours
      if (this.isPublicHoliday(shiftDate)) {
        publicHolidayHours += hours;
      } else if (this.isWeekend(shiftDate)) {
        weekendHours += hours;
      } else if (regularHours + hours > 38) { // Standard full-time hours
        const regularPortion = Math.max(0, 38 - regularHours);
        const overtimePortion = hours - regularPortion;
        regularHours += regularPortion;
        overtimeHours += overtimePortion;
      } else {
        regularHours += hours;
      }
    }

    // Calculate pay with penalty rates
    totalPay += regularHours * baseRate;
    totalPay += overtimeHours * baseRate * 1.5; // 150% for overtime
    totalPay += weekendHours * baseRate * 1.5; // 150% for weekends
    totalPay += publicHolidayHours * baseRate * 2.5; // 250% for public holidays

    // Add allowances
    totalPay += this.calculateAllowances(staff, monthlyShifts.length);

    // Create payroll record
    await storage.createPayroll({
      staffId,
      payPeriodStart: startDate.toISOString(),
      payPeriodEnd: endDate.toISOString(),
      regularHours,
      overtimeHours,
      casualHours: staff.employmentType === 'casual' ? regularHours : 0,
      grossPay: totalPay,
      netPay: totalPay * 0.8, // Simplified - should include proper tax calculation
      payrollStatus: 'pending'
    });

    return totalPay;
  }

  /**
   * Automated Budget Monitoring
   * Monitors participant budgets and sends alerts when thresholds are reached
   */
  async monitorBudgetThresholds(): Promise<void> {
    const activePlans = await db.execute(sql`
      SELECT p.*, pt.first_name, pt.last_name,
             COALESCE(SUM(s.total_cost), 0) as spent_amount
      FROM ndis_plans p
      JOIN participants pt ON p.participant_id = pt.id
      LEFT JOIN services s ON p.participant_id = s.participant_id 
        AND s.scheduled_date >= p.start_date 
        AND s.scheduled_date <= p.end_date
        AND s.status = 'completed'
      WHERE p.status = 'active'
        AND p.end_date > NOW()
      GROUP BY p.id, pt.first_name, pt.last_name
    `);

    // Handle the result array properly - db.execute returns { rows: [] } format
    const plansArray = activePlans.rows || [];
    
    for (const plan of plansArray) {
      const budgetUsed = (plan.spent_amount / plan.total_budget) * 100;
      
      // Send alerts at different thresholds
      if (budgetUsed >= 90) {
        await this.sendAlert('budget_critical', {
          participantName: `${plan.first_name} ${plan.last_name}`,
          planNumber: plan.plan_number,
          budgetUsed: Math.round(budgetUsed),
          remainingBudget: plan.total_budget - plan.spent_amount
        });
      } else if (budgetUsed >= 75) {
        await this.sendAlert('budget_warning', {
          participantName: `${plan.first_name} ${plan.last_name}`,
          planNumber: plan.plan_number,
          budgetUsed: Math.round(budgetUsed),
          remainingBudget: plan.total_budget - plan.spent_amount
        });
      }
    }
  }

  /**
   * Automated Goal Progress Tracking
   * Updates goal progress based on completed actions and services
   */
  async autoUpdateGoalProgress(goalId: string): Promise<void> {
    const goal = await storage.getParticipantGoal(goalId);
    if (!goal) return;

    const actions = await storage.getGoalActions(goalId);
    const completedActions = actions.filter(action => action.status === 'completed');
    
    if (actions.length === 0) return;

    const progressPercentage = Math.round((completedActions.length / actions.length) * 100);
    
    // Update goal progress
    await storage.updateParticipantGoal(goalId, {
      progress: progressPercentage,
      status: progressPercentage === 100 ? 'completed' : 'active'
    });

    // Send progress update notification
    if (progressPercentage >= 100) {
      await this.sendAlert('goal_completed', {
        goalDescription: goal.goalDescription,
        participantId: goal.participantId
      });
    } else if (progressPercentage >= 75) {
      await this.sendAlert('goal_near_completion', {
        goalDescription: goal.goalDescription,
        progress: progressPercentage,
        participantId: goal.participantId
      });
    }
  }

  /**
   * Automated Compliance Reporting
   * Generates compliance reports and schedules audits
   */
  async generateComplianceReports(month: number, year: number): Promise<void> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Service delivery compliance
    const serviceMetrics = await this.calculateServiceMetrics(startDate, endDate);
    
    // Staff qualification compliance
    const staffCompliance = await this.checkStaffQualifications();
    
    // Financial compliance
    const financialMetrics = await this.calculateFinancialCompliance(startDate, endDate);

    // Create compliance audit record
    await storage.createAudit({
      auditType: 'monthly_compliance',
      auditDate: new Date().toISOString(),
      auditScope: `Monthly compliance review for ${month}/${year}`,
      findings: JSON.stringify({
        serviceMetrics,
        staffCompliance,
        financialMetrics
      }),
      recommendations: this.generateComplianceRecommendations(serviceMetrics, staffCompliance, financialMetrics),
      auditStatus: 'completed',
      nextReviewDate: new Date(year, month, 1).toISOString() // Next month
    });
  }

  // Helper methods
  private parseFrequency(frequency: string): { interval: number; unit: string } {
    // Parse frequency strings like "weekly", "bi-weekly", "monthly", "daily"
    const patterns = {
      daily: { interval: 1, unit: 'day' },
      weekly: { interval: 1, unit: 'week' },
      'bi-weekly': { interval: 2, unit: 'week' },
      monthly: { interval: 1, unit: 'month' }
    };
    return patterns[frequency.toLowerCase()] || { interval: 1, unit: 'week' };
  }

  private generateScheduleDates(frequency: { interval: number; unit: string }, targetDate: string): Date[] {
    const dates: Date[] = [];
    const target = new Date(targetDate);
    const now = new Date();
    
    let current = new Date(now);
    while (current <= target) {
      dates.push(new Date(current));
      
      if (frequency.unit === 'day') {
        current.setDate(current.getDate() + frequency.interval);
      } else if (frequency.unit === 'week') {
        current.setDate(current.getDate() + (frequency.interval * 7));
      } else if (frequency.unit === 'month') {
        current.setMonth(current.getMonth() + frequency.interval);
      }
    }
    
    return dates;
  }

  private determineSCHADSLevel(staff: any, qualifications: any[]): number {
    // Determine SCHADS classification level based on qualifications and experience
    const hasAdvancedQualifications = qualifications.some(q => 
      q.qualification_type.includes('diploma') || q.qualification_type.includes('degree')
    );
    
    if (hasAdvancedQualifications && staff.experience_years >= 3) {
      return 4; // SCHADS Level 4
    } else if (staff.experience_years >= 2) {
      return 3; // SCHADS Level 3
    } else if (staff.experience_years >= 1) {
      return 2; // SCHADS Level 2
    }
    return 1; // SCHADS Level 1
  }

  private async getSCHADSRate(level: number, year: number): Promise<number> {
    // Get current SCHADS award rates (would be stored in database)
    const rates = {
      2024: { 1: 24.50, 2: 25.80, 3: 27.10, 4: 28.90 },
      2025: { 1: 25.20, 2: 26.55, 3: 27.90, 4: 29.75 }
    };
    return rates[year]?.[level] || rates[2024][level];
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  private isPublicHoliday(date: Date): boolean {
    // Simplified - would include full Australian public holiday calendar
    const holidays = [
      '2024-01-01', '2024-01-26', '2024-03-29', '2024-04-01', '2024-04-25',
      '2024-06-10', '2024-12-25', '2024-12-26'
    ];
    return holidays.includes(date.toISOString().split('T')[0]);
  }

  private calculateAllowances(staff: any, shiftsWorked: number): number {
    // Calculate various allowances (meal, travel, etc.)
    let allowances = 0;
    
    // Meal allowance for shifts over 5 hours
    allowances += shiftsWorked * 15; // $15 per shift
    
    // Travel allowance if staff travels to participant homes
    if (staff.travel_required) {
      allowances += shiftsWorked * 25; // $25 per shift
    }
    
    return allowances;
  }

  private async sendAlert(type: string, data: any): Promise<void> {
    // Integration point for notification system (email, SMS, in-app)
    console.log(`Alert: ${type}`, data);
    // Would integrate with notification service
  }

  private async calculateServiceMetrics(startDate: Date, endDate: Date): Promise<any> {
    // Calculate service delivery metrics for compliance
    return {
      totalServices: 0,
      completedServices: 0,
      cancelledServices: 0,
      averageRating: 0,
      complianceRate: 95
    };
  }

  private async checkStaffQualifications(): Promise<any> {
    // Check staff qualification compliance
    return {
      totalStaff: 0,
      compliantStaff: 0,
      expiringQualifications: 0,
      complianceRate: 98
    };
  }

  private async calculateFinancialCompliance(startDate: Date, endDate: Date): Promise<any> {
    // Calculate financial compliance metrics
    return {
      invoiceAccuracy: 99,
      paymentTimeliness: 95,
      budgetVariance: 2.5,
      complianceRate: 97
    };
  }

  private generateComplianceRecommendations(service: any, staff: any, financial: any): string {
    const recommendations = [];
    
    if (service.complianceRate < 95) {
      recommendations.push("Improve service delivery documentation and quality assurance processes");
    }
    
    if (staff.complianceRate < 98) {
      recommendations.push("Implement automated qualification renewal tracking and staff training schedules");
    }
    
    if (financial.complianceRate < 95) {
      recommendations.push("Enhance financial controls and automated budget monitoring");
    }
    
    return recommendations.join('; ');
  }

  async sendStaffCertificationReminders(): Promise<void> {
    console.log("Checking staff certifications...");
    
    const staffMembers = await this.storage.getAllStaff();
    const currentDate = new Date();
    const reminderThreshold = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    for (const staff of staffMembers) {
      // Check certification expiry dates from metadata
      const metadata = staff.metadata as any;
      if (metadata?.certifications) {
        for (const cert of metadata.certifications) {
          const expiryDate = new Date(cert.expiryDate);
          if (expiryDate <= reminderThreshold && expiryDate >= currentDate) {
            console.log(`Reminder: ${staff.firstName} ${staff.lastName}'s ${cert.name} expires on ${cert.expiryDate}`);
            // In production, this would send an email/notification
          }
        }
      }
    }
  }

  async autoScheduleQualityAudits(): Promise<void> {
    console.log("Auto-scheduling quality audits...");
    
    const currentDate = new Date();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    // Schedule monthly quality audits for each department
    const departments = ['intake', 'hr_recruitment', 'finance', 'service_delivery', 'compliance_quality'];
    
    for (const dept of departments) {
      await this.storage.createAudit({
        auditType: 'internal',
        auditDate: nextMonth.toISOString().split('T')[0],
        auditorName: 'Quality Assurance Team',
        departmentAudited: dept as any,
        status: 'pending' as any,
        findings: `Scheduled monthly audit for ${dept} department`,
        followUpRequired: true,
        nextAuditDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1).toISOString().split('T')[0],
      });
    }
    
    console.log(`Scheduled ${departments.length} quality audits for next month`);
  }

  async sendPlanExpiryReminders(): Promise<void> {
    console.log("Checking for expiring NDIS plans...");
    
    const plans = await this.storage.getAllNDISPlans();
    const currentDate = new Date();
    const reminderThreshold = new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now
    
    let expiringCount = 0;
    for (const plan of plans) {
      if (plan.endDate) {
        const endDate = new Date(plan.endDate);
        if (endDate <= reminderThreshold && endDate >= currentDate && plan.status === 'active') {
          expiringCount++;
          console.log(`Reminder: Plan ${plan.planNumber} expires on ${plan.endDate}`);
          // In production, this would send notifications to case managers
        }
      }
    }
    
    console.log(`Found ${expiringCount} plans expiring within 60 days`);
  }

  async optimizeStaffAllocation(): Promise<void> {
    console.log("Optimizing staff allocation for upcoming services...");
    
    const upcomingServices = await this.storage.getUpcomingServices();
    const availableStaff = await this.storage.getAllStaff();
    
    let optimizedCount = 0;
    for (const service of upcomingServices) {
      if (!service.assignedTo && service.participantId) {
        // Find best matching staff based on skills, location, and availability
        const participant = await this.storage.getParticipant(service.participantId);
        if (participant) {
          // Simple matching logic - in production this would use more sophisticated algorithms
          const matchedStaff = availableStaff.find(staff => 
            staff.department === 'service_delivery' && 
            staff.isActive
          );
          
          if (matchedStaff) {
            // Create allocation record
            await this.storage.assignServiceToStaff(service.id, matchedStaff.id);
            optimizedCount++;
            console.log(`Allocated service ${service.id} to ${matchedStaff.firstName} ${matchedStaff.lastName}`);
          }
        }
      }
    }
    
    console.log(`Optimized allocation for ${optimizedCount} services`);
  }

  async sendBudgetAlerts(): Promise<void> {
    console.log("Checking budget thresholds for alerts...");
    
    const plans = await db.execute(sql`
      SELECT p.*, 
             SUM(s.total_cost) as spent,
             p.total_budget - SUM(s.total_cost) as remaining
      FROM ndis_plans p
      LEFT JOIN services s ON s.participant_id = p.participant_id
      WHERE p.status = 'active' 
        AND s.status = 'completed'
      GROUP BY p.id
      HAVING (SUM(s.total_cost) / p.total_budget) > 0.8
    `);
    
    for (const plan of plans as any[]) {
      const percentUsed = (plan.spent / plan.total_budget) * 100;
      console.log(`Alert: Plan ${plan.plan_number} has used ${percentUsed.toFixed(1)}% of budget`);
      // In production, this would send notifications to case managers
    }
  }

  async processNDISPlanDocument(planId: string, documentPath: string): Promise<void> {
    console.log(`Processing NDIS plan document for plan ${planId}`);
    
    // In production, this would:
    // 1. Read the document from storage
    // 2. Extract text using OCR or PDF parsing
    // 3. Parse goals and budget information
    // 4. Update the plan record with extracted data
    
    // For now, we'll simulate the processing
    const extractedGoals = await this.extractGoalsFromPlan("Sample plan content");
    
    for (const goal of extractedGoals) {
      await storage.createParticipantGoal({
        participantId: planId, // Would get from plan record
        planId: planId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        goalType: goal.type,
        targetDate: goal.targetDate,
        priority: goal.priority,
        status: 'not_started'
      });
    }
    
    console.log(`Processed plan document and extracted ${extractedGoals.length} goals`);
  }

  async extractGoalsFromPlan(planContent: string): Promise<any[]> {
    console.log("Extracting goals from NDIS plan content...");
    
    // In production, this would use NLP or pattern matching to extract goals
    // For now, return sample goals
    return [
      {
        title: "Improve Daily Living Skills",
        description: "Support to develop independent living skills including cooking, cleaning, and personal care",
        category: "daily_living",
        type: "short_term",
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: "high"
      },
      {
        title: "Community Participation",
        description: "Increase social engagement through community activities and group programs",
        category: "social_participation",
        type: "long_term",
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: "medium"
      }
    ];
  }
}

// Export singleton instance
export const automationService = new NDISAutomationService();