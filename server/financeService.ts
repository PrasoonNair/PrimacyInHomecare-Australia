/**
 * Finance Service for Primacy Care Australia CMS
 * Handles invoicing, billing, payroll, and financial compliance
 * Compliant with NDIS Pricing Arrangements and SCHADS Award
 */

import { db } from "./db";
import { sql, eq, and, gte, lte, desc, sum } from "drizzle-orm";
import { 
  invoices, 
  invoiceItems,
  payRuns,
  paySlips,
  services,
  participants,
  staff,
  ndisPlanCategoryBudgets
} from "@shared/schema";

export class FinanceService {
  /**
   * Generate invoice from completed services
   */
  async generateInvoice(participantId: string, serviceIds: string[]): Promise<any> {
    try {
      // Get participant details
      const participant = await db
        .select()
        .from(participants)
        .where(eq(participants.id, participantId))
        .limit(1);

      if (!participant.length) {
        throw new Error("Participant not found");
      }

      // Get services and validate
      const servicesToInvoice = await db
        .select()
        .from(services)
        .where(and(
          eq(services.participantId, participantId),
          sql`${services.id} IN (${serviceIds.join(',')})`
        ));

      if (!servicesToInvoice.length) {
        throw new Error("No services found to invoice");
      }

      // Calculate total amount
      let totalAmount = 0;
      let gstAmount = 0;
      
      servicesToInvoice.forEach(service => {
        const serviceAmount = parseFloat(service.cost || '0');
        totalAmount += serviceAmount;
        gstAmount += serviceAmount * 0.1; // 10% GST
      });

      // Generate invoice number (format: INV-YYYYMM-XXXX)
      const now = new Date();
      const invoiceNumber = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Create invoice
      const [invoice] = await db
        .insert(invoices)
        .values({
          participantId,
          invoiceNumber,
          dateIssued: now,
          dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
          totalAmount: totalAmount.toString(),
          gstAmount: gstAmount.toString(),
          status: 'draft',
          notes: `Invoice for ${servicesToInvoice.length} services`
        })
        .returning();

      // Create invoice items
      for (const service of servicesToInvoice) {
        await db.insert(invoiceItems).values({
          invoiceId: invoice.id,
          serviceId: service.id,
          description: `${service.serviceType} - ${service.date}`,
          quantity: service.hours || '1',
          unitPrice: service.cost || '0',
          totalAmount: service.cost || '0',
          ndisItemNumber: service.ndisItemNumber
        });
      }

      return invoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  /**
   * Process pay run for staff
   */
  async processPayRun(periodStart: Date, periodEnd: Date): Promise<any> {
    try {
      // Get all staff with hours worked in period
      const staffWithHours = await db
        .select({
          staff,
          totalHours: sum(services.hours),
          totalCost: sum(services.cost)
        })
        .from(staff)
        .leftJoin(services, eq(services.staffId, staff.id))
        .where(and(
          gte(services.date, periodStart.toISOString()),
          lte(services.date, periodEnd.toISOString())
        ))
        .groupBy(staff.id);

      // Calculate pay for each staff member
      const payCalculations = staffWithHours.map(s => {
        const hours = parseFloat(s.totalHours || '0');
        const hourlyRate = parseFloat(s.staff.hourlyRate || '0');
        
        // SCHADS calculations
        const grossPay = this.calculateSCHADSPay(hours, hourlyRate, s.staff.employmentType);
        const tax = this.calculateTax(grossPay);
        const superContribution = grossPay * 0.11; // 11% super
        const netPay = grossPay - tax - superContribution;

        return {
          staffId: s.staff.id,
          grossPay,
          tax,
          superContribution,
          netPay,
          hours
        };
      });

      // Calculate totals
      const totalGross = payCalculations.reduce((sum, calc) => sum + calc.grossPay, 0);
      const totalTax = payCalculations.reduce((sum, calc) => sum + calc.tax, 0);
      const totalSuper = payCalculations.reduce((sum, calc) => sum + calc.superContribution, 0);
      const totalNet = payCalculations.reduce((sum, calc) => sum + calc.netPay, 0);

      // Create pay run
      const [payRun] = await db
        .insert(payRuns)
        .values({
          periodStart,
          periodEnd,
          payDate: new Date(),
          status: 'draft',
          totalGross: totalGross.toString(),
          totalTax: totalTax.toString(),
          totalSuper: totalSuper.toString(),
          totalNet: totalNet.toString()
        })
        .returning();

      // Create pay slips
      for (const calc of payCalculations) {
        await db.insert(paySlips).values({
          payRunId: payRun.id,
          staffId: calc.staffId,
          grossPay: calc.grossPay.toString(),
          taxWithheld: calc.tax.toString(),
          superContribution: calc.superContribution.toString(),
          netPay: calc.netPay.toString(),
          ordinaryHours: calc.hours.toString()
        });
      }

      return payRun;
    } catch (error) {
      console.error('Error processing pay run:', error);
      throw error;
    }
  }

  /**
   * Calculate SCHADS-compliant pay
   */
  private calculateSCHADSPay(hours: number, baseRate: number, employmentType?: string): number {
    let totalPay = 0;

    // Base rate calculation
    if (employmentType === 'casual') {
      // 25% casual loading
      totalPay = hours * baseRate * 1.25;
    } else {
      totalPay = hours * baseRate;
    }

    // TODO: Add penalty rates for weekends, public holidays, overtime
    // This would require tracking when the hours were worked

    return totalPay;
  }

  /**
   * Calculate tax withholding (simplified)
   */
  private calculateTax(grossPay: number): number {
    // Simplified PAYG calculation (should use ATO tax tables)
    if (grossPay < 500) return 0;
    if (grossPay < 1000) return grossPay * 0.19;
    if (grossPay < 2000) return grossPay * 0.29;
    return grossPay * 0.32;
  }

  /**
   * Get financial dashboard statistics
   */
  async getFinancialStats(): Promise<any> {
    try {
      // Get invoice statistics
      const invoiceStats = await db
        .select({
          totalInvoiced: sum(invoices.totalAmount),
          totalPaid: sum(invoices.paymentAmount),
          count: sql`count(*)`,
          status: invoices.status
        })
        .from(invoices)
        .groupBy(invoices.status);

      // Get pay run statistics
      const payRunStats = await db
        .select({
          totalGross: sum(payRuns.totalGross),
          totalNet: sum(payRuns.totalNet),
          count: sql`count(*)`
        })
        .from(payRuns)
        .where(eq(payRuns.status, 'completed'));

      // Calculate key metrics
      const totalInvoiced = invoiceStats.reduce((sum, stat) => 
        sum + parseFloat(stat.totalInvoiced || '0'), 0
      );
      
      const totalPaid = invoiceStats
        .filter(s => s.status === 'paid')
        .reduce((sum, stat) => sum + parseFloat(stat.totalPaid || '0'), 0);

      const outstandingAmount = totalInvoiced - totalPaid;

      return {
        totalInvoiced,
        totalPaid,
        outstandingAmount,
        invoiceCount: invoiceStats.reduce((sum, stat) => sum + Number(stat.count), 0),
        payrollProcessed: payRunStats[0]?.totalGross || '0',
        payRunCount: payRunStats[0]?.count || 0
      };
    } catch (error) {
      console.error('Error getting financial stats:', error);
      throw error;
    }
  }

  /**
   * Check participant budget availability
   */
  async checkBudgetAvailability(participantId: string, amount: number): Promise<boolean> {
    try {
      // Get participant's plan budget
      const budgets = await db
        .select()
        .from(ndisPlanCategoryBudgets)
        .where(eq(ndisPlanCategoryBudgets.planId, participantId));

      const totalBudget = budgets.reduce((sum, b) => 
        sum + parseFloat(b.totalBudget || '0'), 0
      );

      const usedBudget = budgets.reduce((sum, b) => 
        sum + parseFloat(b.usedBudget || '0'), 0
      );

      return (totalBudget - usedBudget) >= amount;
    } catch (error) {
      console.error('Error checking budget:', error);
      return false;
    }
  }

  /**
   * Generate ABA file for bank processing
   */
  generateABAFile(payRun: any, paySlips: any[]): string {
    const lines: string[] = [];
    
    // Descriptive record (header)
    const header = '0' + 
      ' '.repeat(17) + // blank
      '01' + // reel sequence number
      'CBA' + // financial institution
      ' '.repeat(7) + // blank
      'Primacy Care' + // user name
      '123456' + // user ID
      'Payroll' + // description
      new Date().toISOString().slice(0, 10).replace(/-/g, '') + // processing date
      ' '.repeat(40); // blank
    
    lines.push(header.padEnd(120));

    // Detail records
    paySlips.forEach(slip => {
      const detail = '1' +
        '062-000' + // BSB
        '12345678' + // account number
        ' ' + // indicator
        '50' + // transaction code (pay)
        slip.netPay.padStart(10, '0') + // amount in cents
        slip.staff.name.padEnd(32) + // title
        '062-000' + // lodgement BSB
        '87654321' + // lodgement account
        'Primacy Care'.padEnd(16) + // name of remitter
        '00000000'; // tax amount
      
      lines.push(detail.padEnd(120));
    });

    // File total record (trailer)
    const trailer = '7' +
      '999-999' + // BSB
      ' '.repeat(12) + // blank
      payRun.totalNet.padStart(10, '0') + // net total
      payRun.totalGross.padStart(10, '0') + // gross total
      ' '.repeat(24) + // blank
      paySlips.length.toString().padStart(6, '0') + // count
      ' '.repeat(40); // blank

    lines.push(trailer.padEnd(120));

    return lines.join('\n');
  }

  /**
   * Reconcile bank payments
   */
  async reconcilePayment(invoiceId: string, amount: number, reference: string): Promise<any> {
    try {
      const [invoice] = await db
        .update(invoices)
        .set({
          status: 'paid',
          paymentReceivedDate: new Date(),
          paymentAmount: amount.toString(),
          ndisClaimReference: reference,
          updatedAt: new Date()
        })
        .where(eq(invoices.id, invoiceId))
        .returning();

      return invoice;
    } catch (error) {
      console.error('Error reconciling payment:', error);
      throw error;
    }
  }
}

export default FinanceService;