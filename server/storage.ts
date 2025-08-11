import {
  users,
  participants,
  ndisPlans,
  staff,
  services,
  progressNotes,
  invoices,
  invoiceLineItems,
  // Department tables
  referrals,
  serviceAgreements,
  staffQualifications,
  performanceReviews,
  awardRates,
  payroll,
  shifts,
  staffAvailability,
  audits,
  incidents,
  // Role and permission tables
  roles,
  permissions,
  rolePermissions,
  userRoles,
  type User,
  type UpsertUser,
  type Participant,
  type InsertParticipant,
  type NdisPlan,
  type InsertNdisPlan,
  type Staff,
  type InsertStaff,
  type Service,
  type InsertService,
  type ProgressNote,
  type InsertProgressNote,
  type Invoice,
  type InsertInvoice,
  type InvoiceLineItem,
  type InsertInvoiceLineItem,
  // Department types
  type Referral,
  type InsertReferral,
  type ServiceAgreement,
  type InsertServiceAgreement,
  type StaffQualification,
  type InsertStaffQualification,
  type PerformanceReview,
  type InsertPerformanceReview,
  type AwardRate,
  type InsertAwardRate,
  type Payroll,
  type InsertPayroll,
  type Shift,
  type InsertShift,
  type StaffAvailability,
  type InsertStaffAvailability,
  type Audit,
  type InsertAudit,
  type Incident,
  type InsertIncident,
  // Role and permission types
  type Role,
  type InsertRole,
  type Permission,
  type InsertPermission,
  type RolePermission,
  type InsertRolePermission,
  type UserRole,
  type InsertUserRole,
  // NDIS Plan Reader imports
  participantGoals,
  goalActions,
  type ParticipantGoals,
  type InsertParticipantGoals,
  type GoalActions,
  type InsertGoalActions,
  // NDIS Price Guide imports
  ndisSupportCategories,
  ndisSupportItems,
  ndisPricing,
  ndisPlanLineItems,
  type NdisSupportCategory,
  type InsertNdisSupportCategory,
  type NdisSupportItem,
  type InsertNdisSupportItem,
  type NdisPricing,
  type InsertNdisPricing,
  type NdisPlanLineItem,
  type InsertNdisPlanLineItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Participant operations
  getParticipants(): Promise<Participant[]>;
  getParticipant(id: string): Promise<Participant | undefined>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipant(id: string, participant: Partial<InsertParticipant>): Promise<Participant>;
  deleteParticipant(id: string): Promise<void>;
  
  // NDIS Plan operations
  getPlans(): Promise<NdisPlan[]>;
  getPlan(id: string): Promise<NdisPlan | undefined>;
  getPlansByParticipant(participantId: string): Promise<NdisPlan[]>;
  createPlan(plan: InsertNdisPlan): Promise<NdisPlan>;
  updatePlan(id: string, plan: Partial<InsertNdisPlan>): Promise<NdisPlan>;
  deletePlan(id: string): Promise<void>;
  
  // Staff operations
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: string): Promise<Staff | undefined>;
  createStaffMember(staff: InsertStaff): Promise<Staff>;
  updateStaffMember(id: string, staff: Partial<InsertStaff>): Promise<Staff>;
  deleteStaffMember(id: string): Promise<void>;
  
  // Service operations
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  getServicesByParticipant(participantId: string): Promise<Service[]>;
  getServicesByDateRange(startDate: Date, endDate: Date): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;
  
  // Progress Note operations
  getProgressNotes(): Promise<ProgressNote[]>;
  getProgressNote(id: string): Promise<ProgressNote | undefined>;
  getProgressNotesByParticipant(participantId: string): Promise<ProgressNote[]>;
  createProgressNote(note: InsertProgressNote): Promise<ProgressNote>;
  updateProgressNote(id: string, note: Partial<InsertProgressNote>): Promise<ProgressNote>;
  deleteProgressNote(id: string): Promise<void>;
  
  // Invoice operations
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoicesByParticipant(participantId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;
  
  // Invoice Line Item operations
  getInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]>;
  createInvoiceLineItem(lineItem: InsertInvoiceLineItem): Promise<InvoiceLineItem>;
  updateInvoiceLineItem(id: string, lineItem: Partial<InsertInvoiceLineItem>): Promise<InvoiceLineItem>;
  deleteInvoiceLineItem(id: string): Promise<void>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    activeParticipants: number;
    servicesThisWeek: number;
    budgetUsedPercentage: number;
    plansExpiringSoon: number;
  }>;

  // Department operations - Intake
  getReferrals(): Promise<Referral[]>;
  getReferral(id: string): Promise<Referral | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: string, referral: Partial<InsertReferral>): Promise<Referral>;
  deleteReferral(id: string): Promise<void>;

  getServiceAgreements(): Promise<ServiceAgreement[]>;
  getServiceAgreement(id: string): Promise<ServiceAgreement | undefined>;
  createServiceAgreement(agreement: InsertServiceAgreement): Promise<ServiceAgreement>;
  updateServiceAgreement(id: string, agreement: Partial<InsertServiceAgreement>): Promise<ServiceAgreement>;
  deleteServiceAgreement(id: string): Promise<void>;

  // Department operations - HR & Recruitment
  getStaffQualifications(): Promise<StaffQualification[]>;
  getStaffQualificationsByStaff(staffId: string): Promise<StaffQualification[]>;
  createStaffQualification(qualification: InsertStaffQualification): Promise<StaffQualification>;
  updateStaffQualification(id: string, qualification: Partial<InsertStaffQualification>): Promise<StaffQualification>;
  deleteStaffQualification(id: string): Promise<void>;

  getPerformanceReviews(): Promise<PerformanceReview[]>;
  getPerformanceReviewsByStaff(staffId: string): Promise<PerformanceReview[]>;
  createPerformanceReview(review: InsertPerformanceReview): Promise<PerformanceReview>;
  updatePerformanceReview(id: string, review: Partial<InsertPerformanceReview>): Promise<PerformanceReview>;
  deletePerformanceReview(id: string): Promise<void>;

  // Department operations - Finance & Awards
  getAwardRates(): Promise<AwardRate[]>;
  getAwardRate(id: string): Promise<AwardRate | undefined>;
  createAwardRate(rate: InsertAwardRate): Promise<AwardRate>;
  updateAwardRate(id: string, rate: Partial<InsertAwardRate>): Promise<AwardRate>;
  deleteAwardRate(id: string): Promise<void>;

  getPayroll(): Promise<Payroll[]>;
  getPayrollByStaff(staffId: string): Promise<Payroll[]>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: string, payroll: Partial<InsertPayroll>): Promise<Payroll>;
  deletePayroll(id: string): Promise<void>;

  // Department operations - Service Delivery
  getShifts(): Promise<Shift[]>;
  getShift(id: string): Promise<Shift | undefined>;
  getShiftsByStaff(staffId: string): Promise<Shift[]>;
  getShiftsByParticipant(participantId: string): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, shift: Partial<InsertShift>): Promise<Shift>;
  deleteShift(id: string): Promise<void>;

  getStaffAvailability(): Promise<StaffAvailability[]>;
  getStaffAvailabilityByStaff(staffId: string): Promise<StaffAvailability[]>;
  createStaffAvailability(availability: InsertStaffAvailability): Promise<StaffAvailability>;
  updateStaffAvailability(id: string, availability: Partial<InsertStaffAvailability>): Promise<StaffAvailability>;
  deleteStaffAvailability(id: string): Promise<void>;

  // Department operations - Compliance & Quality
  getAudits(): Promise<Audit[]>;
  getAudit(id: string): Promise<Audit | undefined>;
  createAudit(audit: InsertAudit): Promise<Audit>;
  updateAudit(id: string, audit: Partial<InsertAudit>): Promise<Audit>;
  deleteAudit(id: string): Promise<void>;

  getIncidents(): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, incident: Partial<InsertIncident>): Promise<Incident>;
  deleteIncident(id: string): Promise<void>;

  // Role management operations
  getRoles(): Promise<Role[]>;
  getRole(id: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, role: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: string): Promise<void>;

  getPermissions(): Promise<Permission[]>;
  getPermission(id: string): Promise<Permission | undefined>;
  createPermission(permission: InsertPermission): Promise<Permission>;

  getRolePermissions(roleId: string): Promise<RolePermission[]>;
  assignPermissionToRole(rolePermission: InsertRolePermission): Promise<RolePermission>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<void>;

  getUserRoles(userId: string): Promise<UserRole[]>;
  assignRoleToUser(userRole: InsertUserRole): Promise<UserRole>;
  removeRoleFromUser(userId: string, roleId: string): Promise<void>;

  getRolesWithPermissions(): Promise<(Role & { permissions: Permission[] })[]>;
  getUsersWithRoles(): Promise<(User & { roles: Role[] })[]>;

  // NDIS Plan Reader operations
  createParticipantGoal(goal: InsertParticipantGoals): Promise<ParticipantGoals>;
  getParticipantGoals(participantId: string): Promise<ParticipantGoals[]>;
  getParticipantGoal(id: string): Promise<ParticipantGoals | undefined>;
  updateParticipantGoal(id: string, updates: Partial<InsertParticipantGoals>): Promise<ParticipantGoals>;
  deleteParticipantGoal(id: string): Promise<void>;
  
  createGoalAction(action: InsertGoalActions): Promise<GoalActions>;
  getGoalActions(goalId: string): Promise<GoalActions[]>;
  getGoalAction(id: string): Promise<GoalActions | undefined>;
  updateGoalAction(id: string, updates: Partial<InsertGoalActions>): Promise<GoalActions>;
  completeGoalAction(id: string): Promise<GoalActions>;
  deleteGoalAction(id: string): Promise<void>;

  // NDIS Price Guide operations
  getNdisSupportCategories(): Promise<NdisSupportCategory[]>;
  getNdisSupportCategory(id: string): Promise<NdisSupportCategory | undefined>;
  createNdisSupportCategory(category: InsertNdisSupportCategory): Promise<NdisSupportCategory>;
  updateNdisSupportCategory(id: string, category: Partial<InsertNdisSupportCategory>): Promise<NdisSupportCategory>;
  deleteNdisSupportCategory(id: string): Promise<void>;

  getNdisSupportItems(): Promise<NdisSupportItem[]>;
  getNdisSupportItem(id: string): Promise<NdisSupportItem | undefined>;
  getNdisSupportItemsByCategory(categoryId: string): Promise<NdisSupportItem[]>;
  searchNdisSupportItems(query: string): Promise<NdisSupportItem[]>;
  createNdisSupportItem(item: InsertNdisSupportItem): Promise<NdisSupportItem>;
  updateNdisSupportItem(id: string, item: Partial<InsertNdisSupportItem>): Promise<NdisSupportItem>;
  deleteNdisSupportItem(id: string): Promise<void>;

  getNdisPricing(): Promise<NdisPricing[]>;
  getNdisPricingBySupportItem(supportItemId: string): Promise<NdisPricing[]>;
  getNdisPricingByGeographicArea(geographicArea: string): Promise<NdisPricing[]>;
  getPriceForSupportItem(supportItemId: string, geographicArea: string): Promise<NdisPricing | undefined>;
  createNdisPricing(pricing: InsertNdisPricing): Promise<NdisPricing>;
  updateNdisPricing(id: string, pricing: Partial<InsertNdisPricing>): Promise<NdisPricing>;
  deleteNdisPricing(id: string): Promise<void>;

  getNdisPlanLineItems(planId: string): Promise<NdisPlanLineItem[]>;
  createNdisPlanLineItem(lineItem: InsertNdisPlanLineItem): Promise<NdisPlanLineItem>;
  updateNdisPlanLineItem(id: string, lineItem: Partial<InsertNdisPlanLineItem>): Promise<NdisPlanLineItem>;
  deleteNdisPlanLineItem(id: string): Promise<void>;

  // Price lookup functionality
  getPriceGuideData(geographicArea?: string): Promise<{
    categories: NdisSupportCategory[];
    items: (NdisSupportItem & { pricing: NdisPricing[] })[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Participant operations
  async getParticipants(): Promise<Participant[]> {
    return await db.select().from(participants).where(eq(participants.isActive, true)).orderBy(desc(participants.createdAt));
  }

  async getParticipant(id: string): Promise<Participant | undefined> {
    const [participant] = await db.select().from(participants).where(eq(participants.id, id));
    return participant;
  }

  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const [newParticipant] = await db.insert(participants).values(participant).returning();
    return newParticipant;
  }

  async updateParticipant(id: string, participant: Partial<InsertParticipant>): Promise<Participant> {
    const [updated] = await db
      .update(participants)
      .set({ ...participant, updatedAt: new Date() })
      .where(eq(participants.id, id))
      .returning();
    return updated;
  }

  async deleteParticipant(id: string): Promise<void> {
    await db.update(participants).set({ isActive: false }).where(eq(participants.id, id));
  }

  // NDIS Plan operations
  async getPlans(): Promise<NdisPlan[]> {
    return await db.select().from(ndisPlans).orderBy(desc(ndisPlans.createdAt));
  }

  async getPlan(id: string): Promise<NdisPlan | undefined> {
    const [plan] = await db.select().from(ndisPlans).where(eq(ndisPlans.id, id));
    return plan;
  }

  async getPlansByParticipant(participantId: string): Promise<NdisPlan[]> {
    return await db.select().from(ndisPlans).where(eq(ndisPlans.participantId, participantId)).orderBy(desc(ndisPlans.startDate));
  }

  async createPlan(plan: InsertNdisPlan): Promise<NdisPlan> {
    const [newPlan] = await db.insert(ndisPlans).values(plan).returning();
    return newPlan;
  }

  async updatePlan(id: string, plan: Partial<InsertNdisPlan>): Promise<NdisPlan> {
    const [updated] = await db
      .update(ndisPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(ndisPlans.id, id))
      .returning();
    return updated;
  }

  async deletePlan(id: string): Promise<void> {
    await db.delete(ndisPlans).where(eq(ndisPlans.id, id));
  }

  // Staff operations
  async getStaff(): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.isActive, true)).orderBy(desc(staff.createdAt));
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember;
  }

  async createStaffMember(staffData: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(staffData).returning();
    return newStaff;
  }

  async updateStaffMember(id: string, staffData: Partial<InsertStaff>): Promise<Staff> {
    const [updated] = await db
      .update(staff)
      .set({ ...staffData, updatedAt: new Date() })
      .where(eq(staff.id, id))
      .returning();
    return updated;
  }

  async deleteStaffMember(id: string): Promise<void> {
    await db.update(staff).set({ isActive: false }).where(eq(staff.id, id));
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(desc(services.scheduledDate));
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServicesByParticipant(participantId: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.participantId, participantId)).orderBy(desc(services.scheduledDate));
  }

  async getServicesByDateRange(startDate: Date, endDate: Date): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(and(gte(services.scheduledDate, startDate), lte(services.scheduledDate, endDate)))
      .orderBy(services.scheduledDate);
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service> {
    const [updated] = await db
      .update(services)
      .set({ ...service, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Progress Note operations
  async getProgressNotes(): Promise<ProgressNote[]> {
    return await db.select().from(progressNotes).orderBy(desc(progressNotes.noteDate));
  }

  async getProgressNote(id: string): Promise<ProgressNote | undefined> {
    const [note] = await db.select().from(progressNotes).where(eq(progressNotes.id, id));
    return note;
  }

  async getProgressNotesByParticipant(participantId: string): Promise<ProgressNote[]> {
    return await db.select().from(progressNotes).where(eq(progressNotes.participantId, participantId)).orderBy(desc(progressNotes.noteDate));
  }

  async createProgressNote(note: InsertProgressNote): Promise<ProgressNote> {
    const [newNote] = await db.insert(progressNotes).values(note).returning();
    return newNote;
  }

  async updateProgressNote(id: string, note: Partial<InsertProgressNote>): Promise<ProgressNote> {
    const [updated] = await db
      .update(progressNotes)
      .set({ ...note, updatedAt: new Date() })
      .where(eq(progressNotes.id, id))
      .returning();
    return updated;
  }

  async deleteProgressNote(id: string): Promise<void> {
    await db.delete(progressNotes).where(eq(progressNotes.id, id));
  }

  // Invoice operations
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.issueDate));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoicesByParticipant(participantId: string): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.participantId, participantId)).orderBy(desc(invoices.issueDate));
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updated] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  // Invoice Line Item operations
  async getInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
    return await db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoiceId));
  }

  async createInvoiceLineItem(lineItem: InsertInvoiceLineItem): Promise<InvoiceLineItem> {
    const [newLineItem] = await db.insert(invoiceLineItems).values(lineItem).returning();
    return newLineItem;
  }

  async updateInvoiceLineItem(id: string, lineItem: Partial<InsertInvoiceLineItem>): Promise<InvoiceLineItem> {
    const [updated] = await db
      .update(invoiceLineItems)
      .set(lineItem)
      .where(eq(invoiceLineItems.id, id))
      .returning();
    return updated;
  }

  async deleteInvoiceLineItem(id: string): Promise<void> {
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.id, id));
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    activeParticipants: number;
    servicesThisWeek: number;
    budgetUsedPercentage: number;
    plansExpiringSoon: number;
  }> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const [activeParticipantsResult] = await db
      .select({ count: count() })
      .from(participants)
      .where(eq(participants.isActive, true));

    const [servicesThisWeekResult] = await db
      .select({ count: count() })
      .from(services)
      .where(and(gte(services.scheduledDate, startOfWeek), lte(services.scheduledDate, endOfWeek)));

    const [plansExpiringSoonResult] = await db
      .select({ count: count() })
      .from(ndisPlans)
      .where(and(eq(ndisPlans.status, "active"), lte(sql`${ndisPlans.endDate}::date`, thirtyDaysFromNow.toISOString().split('T')[0])));

    // For budget calculation, we'll use a simple average for demonstration
    const budgetUsedPercentage = 73; // This would need more complex calculation based on actual service costs vs plan budgets

    return {
      activeParticipants: activeParticipantsResult.count,
      servicesThisWeek: servicesThisWeekResult.count,
      budgetUsedPercentage,
      plansExpiringSoon: plansExpiringSoonResult.count,
    };
  }

  // Department operations - Intake
  async getReferrals(): Promise<Referral[]> {
    return await db.select().from(referrals).orderBy(desc(referrals.createdAt));
  }

  async getReferral(id: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.id, id));
    return referral;
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [newReferral] = await db.insert(referrals).values(referral).returning();
    return newReferral;
  }

  async updateReferral(id: string, referral: Partial<InsertReferral>): Promise<Referral> {
    const [updated] = await db
      .update(referrals)
      .set({ ...referral, updatedAt: new Date() })
      .where(eq(referrals.id, id))
      .returning();
    return updated;
  }

  async deleteReferral(id: string): Promise<void> {
    await db.delete(referrals).where(eq(referrals.id, id));
  }

  async getServiceAgreements(): Promise<ServiceAgreement[]> {
    return await db.select().from(serviceAgreements).orderBy(desc(serviceAgreements.createdAt));
  }

  async getServiceAgreement(id: string): Promise<ServiceAgreement | undefined> {
    const [agreement] = await db.select().from(serviceAgreements).where(eq(serviceAgreements.id, id));
    return agreement;
  }

  async createServiceAgreement(agreement: InsertServiceAgreement): Promise<ServiceAgreement> {
    const [newAgreement] = await db.insert(serviceAgreements).values(agreement).returning();
    return newAgreement;
  }

  async updateServiceAgreement(id: string, agreement: Partial<InsertServiceAgreement>): Promise<ServiceAgreement> {
    const [updated] = await db
      .update(serviceAgreements)
      .set({ ...agreement, updatedAt: new Date() })
      .where(eq(serviceAgreements.id, id))
      .returning();
    return updated;
  }

  async deleteServiceAgreement(id: string): Promise<void> {
    await db.delete(serviceAgreements).where(eq(serviceAgreements.id, id));
  }

  // Department operations - HR & Recruitment
  async getStaffQualifications(): Promise<StaffQualification[]> {
    return await db.select().from(staffQualifications).orderBy(desc(staffQualifications.createdAt));
  }

  async getStaffQualificationsByStaff(staffId: string): Promise<StaffQualification[]> {
    return await db.select().from(staffQualifications).where(eq(staffQualifications.staffId, staffId)).orderBy(desc(staffQualifications.createdAt));
  }

  async createStaffQualification(qualification: InsertStaffQualification): Promise<StaffQualification> {
    const [newQualification] = await db.insert(staffQualifications).values(qualification).returning();
    return newQualification;
  }

  async updateStaffQualification(id: string, qualification: Partial<InsertStaffQualification>): Promise<StaffQualification> {
    const [updated] = await db
      .update(staffQualifications)
      .set({ ...qualification, updatedAt: new Date() })
      .where(eq(staffQualifications.id, id))
      .returning();
    return updated;
  }

  async deleteStaffQualification(id: string): Promise<void> {
    await db.delete(staffQualifications).where(eq(staffQualifications.id, id));
  }

  async getPerformanceReviews(): Promise<PerformanceReview[]> {
    return await db.select().from(performanceReviews).orderBy(desc(performanceReviews.createdAt));
  }

  async getPerformanceReviewsByStaff(staffId: string): Promise<PerformanceReview[]> {
    return await db.select().from(performanceReviews).where(eq(performanceReviews.staffId, staffId)).orderBy(desc(performanceReviews.createdAt));
  }

  async createPerformanceReview(review: InsertPerformanceReview): Promise<PerformanceReview> {
    const [newReview] = await db.insert(performanceReviews).values(review).returning();
    return newReview;
  }

  async updatePerformanceReview(id: string, review: Partial<InsertPerformanceReview>): Promise<PerformanceReview> {
    const [updated] = await db
      .update(performanceReviews)
      .set({ ...review, updatedAt: new Date() })
      .where(eq(performanceReviews.id, id))
      .returning();
    return updated;
  }

  async deletePerformanceReview(id: string): Promise<void> {
    await db.delete(performanceReviews).where(eq(performanceReviews.id, id));
  }

  // Department operations - Finance & Awards
  async getAwardRates(): Promise<AwardRate[]> {
    return await db.select().from(awardRates).orderBy(desc(awardRates.createdAt));
  }

  async getAwardRate(id: string): Promise<AwardRate | undefined> {
    const [rate] = await db.select().from(awardRates).where(eq(awardRates.id, id));
    return rate;
  }

  async createAwardRate(rate: InsertAwardRate): Promise<AwardRate> {
    const [newRate] = await db.insert(awardRates).values(rate).returning();
    return newRate;
  }

  async updateAwardRate(id: string, rate: Partial<InsertAwardRate>): Promise<AwardRate> {
    const [updated] = await db
      .update(awardRates)
      .set({ ...rate, updatedAt: new Date() })
      .where(eq(awardRates.id, id))
      .returning();
    return updated;
  }

  async deleteAwardRate(id: string): Promise<void> {
    await db.delete(awardRates).where(eq(awardRates.id, id));
  }

  async getPayroll(): Promise<Payroll[]> {
    return await db.select().from(payroll).orderBy(desc(payroll.createdAt));
  }

  async getPayrollByStaff(staffId: string): Promise<Payroll[]> {
    return await db.select().from(payroll).where(eq(payroll.staffId, staffId)).orderBy(desc(payroll.createdAt));
  }

  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    const [newPayroll] = await db.insert(payroll).values(payrollData).returning();
    return newPayroll;
  }

  async updatePayroll(id: string, payrollData: Partial<InsertPayroll>): Promise<Payroll> {
    const [updated] = await db
      .update(payroll)
      .set({ ...payrollData, updatedAt: new Date() })
      .where(eq(payroll.id, id))
      .returning();
    return updated;
  }

  async deletePayroll(id: string): Promise<void> {
    await db.delete(payroll).where(eq(payroll.id, id));
  }

  // Department operations - Service Delivery
  async getShifts(): Promise<Shift[]> {
    return await db.select().from(shifts).orderBy(desc(shifts.createdAt));
  }

  async getShift(id: string): Promise<Shift | undefined> {
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, id));
    return shift;
  }

  async getShiftsByStaff(staffId: string): Promise<Shift[]> {
    return await db.select().from(shifts).where(eq(shifts.assignedStaffId, staffId)).orderBy(desc(shifts.createdAt));
  }

  async getShiftsByParticipant(participantId: string): Promise<Shift[]> {
    return await db.select().from(shifts).where(eq(shifts.participantId, participantId)).orderBy(desc(shifts.createdAt));
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const [newShift] = await db.insert(shifts).values(shift).returning();
    return newShift;
  }

  async updateShift(id: string, shift: Partial<InsertShift>): Promise<Shift> {
    const [updated] = await db
      .update(shifts)
      .set({ ...shift, updatedAt: new Date() })
      .where(eq(shifts.id, id))
      .returning();
    return updated;
  }

  async deleteShift(id: string): Promise<void> {
    await db.delete(shifts).where(eq(shifts.id, id));
  }

  async getStaffAvailability(): Promise<StaffAvailability[]> {
    return await db.select().from(staffAvailability).orderBy(desc(staffAvailability.createdAt));
  }

  async getStaffAvailabilityByStaff(staffId: string): Promise<StaffAvailability[]> {
    return await db.select().from(staffAvailability).where(eq(staffAvailability.staffId, staffId)).orderBy(desc(staffAvailability.createdAt));
  }

  async createStaffAvailability(availability: InsertStaffAvailability): Promise<StaffAvailability> {
    const [newAvailability] = await db.insert(staffAvailability).values(availability).returning();
    return newAvailability;
  }

  async updateStaffAvailability(id: string, availability: Partial<InsertStaffAvailability>): Promise<StaffAvailability> {
    const [updated] = await db
      .update(staffAvailability)
      .set({ ...availability, updatedAt: new Date() })
      .where(eq(staffAvailability.id, id))
      .returning();
    return updated;
  }

  async deleteStaffAvailability(id: string): Promise<void> {
    await db.delete(staffAvailability).where(eq(staffAvailability.id, id));
  }

  // Department operations - Compliance & Quality
  async getAudits(): Promise<Audit[]> {
    return await db.select().from(audits).orderBy(desc(audits.createdAt));
  }

  async getAudit(id: string): Promise<Audit | undefined> {
    const [audit] = await db.select().from(audits).where(eq(audits.id, id));
    return audit;
  }

  async createAudit(audit: InsertAudit): Promise<Audit> {
    const [newAudit] = await db.insert(audits).values(audit).returning();
    return newAudit;
  }

  async updateAudit(id: string, audit: Partial<InsertAudit>): Promise<Audit> {
    const [updated] = await db
      .update(audits)
      .set({ ...audit, updatedAt: new Date() })
      .where(eq(audits.id, id))
      .returning();
    return updated;
  }

  async deleteAudit(id: string): Promise<void> {
    await db.delete(audits).where(eq(audits.id, id));
  }

  async getIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [newIncident] = await db.insert(incidents).values(incident).returning();
    return newIncident;
  }

  async updateIncident(id: string, incident: Partial<InsertIncident>): Promise<Incident> {
    const [updated] = await db
      .update(incidents)
      .set({ ...incident, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return updated;
  }

  async deleteIncident(id: string): Promise<void> {
    await db.delete(incidents).where(eq(incidents.id, id));
  }

  // Role management operations
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles).where(eq(roles.isActive, true)).orderBy(roles.name);
  }

  async getRole(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
  }

  async updateRole(id: string, role: Partial<InsertRole>): Promise<Role> {
    const [updated] = await db
      .update(roles)
      .set({ ...role, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return updated;
  }

  async deleteRole(id: string): Promise<void> {
    await db.update(roles).set({ isActive: false }).where(eq(roles.id, id));
  }

  // Permission operations
  async getPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions).where(eq(permissions.isActive, true)).orderBy(permissions.name);
  }

  async getPermission(id: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [newPermission] = await db.insert(permissions).values(permission).returning();
    return newPermission;
  }

  // Role permission operations
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  }

  async assignPermissionToRole(rolePermission: InsertRolePermission): Promise<RolePermission> {
    const [newAssignment] = await db.insert(rolePermissions).values(rolePermission).returning();
    return newAssignment;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await db.delete(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)));
  }

  // User role operations
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return await db.select().from(userRoles).where(eq(userRoles.userId, userId));
  }

  async assignRoleToUser(userRole: InsertUserRole): Promise<UserRole> {
    const [newAssignment] = await db.insert(userRoles).values(userRole).returning();
    return newAssignment;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await db.delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
  }

  // Get roles with permissions (for super admin interface)
  async getRolesWithPermissions(): Promise<(Role & { permissions: Permission[] })[]> {
    const rolesData = await db.select().from(roles).where(eq(roles.isActive, true));
    
    const rolesWithPermissions = await Promise.all(
      rolesData.map(async (role) => {
        const rolePermissionData = await db
          .select({ permission: permissions })
          .from(rolePermissions)
          .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
          .where(eq(rolePermissions.roleId, role.id));
        
        return {
          ...role,
          permissions: rolePermissionData.map(rp => rp.permission)
        };
      })
    );

    return rolesWithPermissions;
  }

  // Get users with their roles (for super admin interface)
  async getUsersWithRoles(): Promise<(User & { roles: Role[] })[]> {
    const usersData = await db.select().from(users).where(eq(users.isActive, true));
    
    const usersWithRoles = await Promise.all(
      usersData.map(async (user) => {
        const userRoleData = await db
          .select({ role: roles })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, user.id));
        
        return {
          ...user,
          roles: userRoleData.map(ur => ur.role)
        };
      })
    );

    return usersWithRoles;
  }

  // NDIS Plan Reader operations
  async createParticipantGoal(goal: InsertParticipantGoals): Promise<ParticipantGoals> {
    const [newGoal] = await db.insert(participantGoals).values(goal).returning();
    return newGoal;
  }

  async getParticipantGoals(participantId: string): Promise<ParticipantGoals[]> {
    return await db.select().from(participantGoals)
      .where(eq(participantGoals.participantId, participantId))
      .orderBy(desc(participantGoals.createdAt));
  }

  async getParticipantGoal(id: string): Promise<ParticipantGoals | undefined> {
    const [goal] = await db.select().from(participantGoals).where(eq(participantGoals.id, id));
    return goal;
  }

  async updateParticipantGoal(id: string, updates: Partial<InsertParticipantGoals>): Promise<ParticipantGoals> {
    const [updated] = await db
      .update(participantGoals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(participantGoals.id, id))
      .returning();
    return updated;
  }

  async deleteParticipantGoal(id: string): Promise<void> {
    await db.delete(participantGoals).where(eq(participantGoals.id, id));
  }

  async createGoalAction(action: InsertGoalActions): Promise<GoalActions> {
    const [newAction] = await db.insert(goalActions).values(action).returning();
    return newAction;
  }

  async getGoalActions(goalId: string): Promise<GoalActions[]> {
    return await db.select().from(goalActions)
      .where(eq(goalActions.goalId, goalId))
      .orderBy(desc(goalActions.createdAt));
  }

  async getGoalAction(id: string): Promise<GoalActions | undefined> {
    const [action] = await db.select().from(goalActions).where(eq(goalActions.id, id));
    return action;
  }

  async updateGoalAction(id: string, updates: Partial<InsertGoalActions>): Promise<GoalActions> {
    const [updated] = await db
      .update(goalActions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(goalActions.id, id))
      .returning();
    return updated;
  }

  async completeGoalAction(id: string): Promise<GoalActions> {
    const [completed] = await db
      .update(goalActions)
      .set({ 
        status: 'completed',
        completedDate: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(goalActions.id, id))
      .returning();
    return completed;
  }

  async deleteGoalAction(id: string): Promise<void> {
    await db.delete(goalActions).where(eq(goalActions.id, id));
  }

  // NDIS Price Guide operations
  async getNdisSupportCategories(): Promise<NdisSupportCategory[]> {
    return await db.select().from(ndisSupportCategories)
      .where(eq(ndisSupportCategories.isActive, true))
      .orderBy(ndisSupportCategories.categoryNumber);
  }

  async getNdisSupportCategory(id: string): Promise<NdisSupportCategory | undefined> {
    const [category] = await db.select().from(ndisSupportCategories).where(eq(ndisSupportCategories.id, id));
    return category;
  }

  async createNdisSupportCategory(category: InsertNdisSupportCategory): Promise<NdisSupportCategory> {
    const [newCategory] = await db.insert(ndisSupportCategories).values(category).returning();
    return newCategory;
  }

  async updateNdisSupportCategory(id: string, category: Partial<InsertNdisSupportCategory>): Promise<NdisSupportCategory> {
    const [updated] = await db
      .update(ndisSupportCategories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(ndisSupportCategories.id, id))
      .returning();
    return updated;
  }

  async deleteNdisSupportCategory(id: string): Promise<void> {
    await db.update(ndisSupportCategories).set({ isActive: false }).where(eq(ndisSupportCategories.id, id));
  }

  async getNdisSupportItems(): Promise<NdisSupportItem[]> {
    return await db.select().from(ndisSupportItems)
      .where(eq(ndisSupportItems.isActive, true))
      .orderBy(ndisSupportItems.supportCode);
  }

  async getNdisSupportItem(id: string): Promise<NdisSupportItem | undefined> {
    const [item] = await db.select().from(ndisSupportItems).where(eq(ndisSupportItems.id, id));
    return item;
  }

  async getNdisSupportItemsByCategory(categoryId: string): Promise<NdisSupportItem[]> {
    return await db.select().from(ndisSupportItems)
      .where(and(eq(ndisSupportItems.categoryId, categoryId), eq(ndisSupportItems.isActive, true)))
      .orderBy(ndisSupportItems.supportCode);
  }

  async searchNdisSupportItems(query: string): Promise<NdisSupportItem[]> {
    return await db.select().from(ndisSupportItems)
      .where(and(
        eq(ndisSupportItems.isActive, true),
        sql`(${ndisSupportItems.name} ILIKE ${`%${query}%`} OR ${ndisSupportItems.supportCode} ILIKE ${`%${query}%`} OR ${ndisSupportItems.description} ILIKE ${`%${query}%`})`
      ))
      .orderBy(ndisSupportItems.supportCode);
  }

  async createNdisSupportItem(item: InsertNdisSupportItem): Promise<NdisSupportItem> {
    const [newItem] = await db.insert(ndisSupportItems).values(item).returning();
    return newItem;
  }

  async updateNdisSupportItem(id: string, item: Partial<InsertNdisSupportItem>): Promise<NdisSupportItem> {
    const [updated] = await db
      .update(ndisSupportItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(ndisSupportItems.id, id))
      .returning();
    return updated;
  }

  async deleteNdisSupportItem(id: string): Promise<void> {
    await db.update(ndisSupportItems).set({ isActive: false }).where(eq(ndisSupportItems.id, id));
  }

  async getNdisPricing(): Promise<NdisPricing[]> {
    return await db.select().from(ndisPricing)
      .where(eq(ndisPricing.isActive, true))
      .orderBy(ndisPricing.effectiveDate);
  }

  async getNdisPricingBySupportItem(supportItemId: string): Promise<NdisPricing[]> {
    return await db.select().from(ndisPricing)
      .where(and(eq(ndisPricing.supportItemId, supportItemId), eq(ndisPricing.isActive, true)))
      .orderBy(ndisPricing.geographicArea);
  }

  async getNdisPricingByGeographicArea(geographicArea: string): Promise<NdisPricing[]> {
    return await db.select().from(ndisPricing)
      .where(and(eq(ndisPricing.geographicArea, geographicArea), eq(ndisPricing.isActive, true)))
      .orderBy(ndisPricing.effectiveDate);
  }

  async getPriceForSupportItem(supportItemId: string, geographicArea: string): Promise<NdisPricing | undefined> {
    const [pricing] = await db.select().from(ndisPricing)
      .where(and(
        eq(ndisPricing.supportItemId, supportItemId),
        eq(ndisPricing.geographicArea, geographicArea),
        eq(ndisPricing.isActive, true),
        lte(ndisPricing.effectiveDate, new Date()),
        sql`(${ndisPricing.endDate} IS NULL OR ${ndisPricing.endDate} >= ${new Date()})`
      ))
      .orderBy(desc(ndisPricing.effectiveDate))
      .limit(1);
    return pricing;
  }

  async createNdisPricing(pricing: InsertNdisPricing): Promise<NdisPricing> {
    const [newPricing] = await db.insert(ndisPricing).values(pricing).returning();
    return newPricing;
  }

  async updateNdisPricing(id: string, pricing: Partial<InsertNdisPricing>): Promise<NdisPricing> {
    const [updated] = await db
      .update(ndisPricing)
      .set({ ...pricing, updatedAt: new Date() })
      .where(eq(ndisPricing.id, id))
      .returning();
    return updated;
  }

  async deleteNdisPricing(id: string): Promise<void> {
    await db.update(ndisPricing).set({ isActive: false }).where(eq(ndisPricing.id, id));
  }

  async getNdisPlanLineItems(planId: string): Promise<NdisPlanLineItem[]> {
    return await db.select().from(ndisPlanLineItems)
      .where(and(eq(ndisPlanLineItems.planId, planId), eq(ndisPlanLineItems.isActive, true)))
      .orderBy(ndisPlanLineItems.createdAt);
  }

  async createNdisPlanLineItem(lineItem: InsertNdisPlanLineItem): Promise<NdisPlanLineItem> {
    const [newLineItem] = await db.insert(ndisPlanLineItems).values(lineItem).returning();
    return newLineItem;
  }

  async updateNdisPlanLineItem(id: string, lineItem: Partial<InsertNdisPlanLineItem>): Promise<NdisPlanLineItem> {
    const [updated] = await db
      .update(ndisPlanLineItems)
      .set({ ...lineItem, updatedAt: new Date() })
      .where(eq(ndisPlanLineItems.id, id))
      .returning();
    return updated;
  }

  async deleteNdisPlanLineItem(id: string): Promise<void> {
    await db.update(ndisPlanLineItems).set({ isActive: false }).where(eq(ndisPlanLineItems.id, id));
  }

  // Price lookup functionality
  async getPriceGuideData(geographicArea?: string): Promise<{
    categories: NdisSupportCategory[];
    items: (NdisSupportItem & { pricing: NdisPricing[] })[];
  }> {
    const categories = await this.getNdisSupportCategories();
    const items = await this.getNdisSupportItems();
    
    const itemsWithPricing = await Promise.all(
      items.map(async (item) => {
        let pricing: NdisPricing[];
        if (geographicArea) {
          pricing = await this.getNdisPricingBySupportItem(item.id);
          pricing = pricing.filter(p => p.geographicArea === geographicArea);
        } else {
          pricing = await this.getNdisPricingBySupportItem(item.id);
        }
        
        return {
          ...item,
          pricing
        };
      })
    );

    return {
      categories,
      items: itemsWithPricing
    };
  }
}

export const storage = new DatabaseStorage();
