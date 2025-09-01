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
  // Recruitment tables
  jobPostings,
  jobApplications,
  interviewSchedule,
  staffOnboarding,
  staffLeave,
  staffTraining,
  schacsAwardRates,
  staffQualifications,
  performanceReviews,
  awardRates,
  payroll,
  shifts,
  shiftCaseNotes,
  staffAvailability,
  audits,
  // Incident Management tables
  incidents,
  incidentApprovals,
  incidentNotifications,
  incidentTimeline,
  incidentDocuments,
  // Role and permission tables
  roles,
  permissions,
  rolePermissions,
  userRoles,
  // States and Regions tables
  states,
  regions,
  departmentRegions,
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
  // Recruitment types
  type JobPosting,
  type InsertJobPosting,
  type JobApplication,
  type InsertJobApplication,
  type InterviewSchedule,
  type InsertInterviewSchedule,
  type StaffOnboarding,
  type InsertStaffOnboarding,
  type StaffLeave,
  type InsertStaffLeave,
  type StaffTraining,
  type InsertStaffTraining,
  type SchacsAwardRate,
  type InsertSchacsAwardRate,
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
  // Incident Management types
  type Incident,
  type InsertIncident,
  type IncidentApproval,
  type InsertIncidentApproval,
  type IncidentNotification,
  type InsertIncidentNotification,
  type IncidentTimelineEntry,
  type InsertIncidentTimelineEntry,
  type IncidentDocument,
  type InsertIncidentDocument,
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
  // States and Regions types
  type State,
  type InsertState,
  type Region,
  type InsertRegion,
  type DepartmentRegion,
  type InsertDepartmentRegion,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count, sum, or, like, ilike } from "drizzle-orm";

export interface IStorage {
  // Incident Management
  getIncidents(filters?: { status?: string; severity?: string; participantId?: string }): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, incident: Partial<InsertIncident>): Promise<Incident | undefined>;
  getIncidentApprovals(incidentId: string): Promise<IncidentApproval[]>;
  createIncidentApproval(approval: InsertIncidentApproval): Promise<IncidentApproval>;
  getIncidentNotifications(incidentId: string): Promise<IncidentNotification[]>;
  createIncidentNotification(notification: InsertIncidentNotification): Promise<IncidentNotification>;
  getIncidentTimeline(incidentId: string): Promise<IncidentTimelineEntry[]>;
  addIncidentTimelineEntry(entry: InsertIncidentTimelineEntry): Promise<IncidentTimelineEntry>;
  getIncidentDocuments(incidentId: string): Promise<IncidentDocument[]>;
  
  // Enhanced Shift Management for NDIS Billing
  getShiftsWithDetails(): Promise<any[]>;
  clockInShift(shiftId: string): Promise<any>;
  clockOutShift(shiftId: string): Promise<any>;
  createShiftCaseNote(caseNote: any): Promise<any>;
  updateShiftCaseNoteStatus(shiftId: string, completed: boolean): Promise<any>;
  getShiftCaseNotes(): Promise<any[]>;
  addIncidentDocument(document: InsertIncidentDocument): Promise<IncidentDocument>;
  
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

  // Quick search functionality
  quickSearch(query: string): Promise<{
    participants: Array<{ id: string; firstName: string; lastName: string; ndisNumber: string; primaryDisability?: string }>;
    staff: Array<{ id: string; firstName: string; lastName: string; position?: string; email?: string }>;
    plans: Array<{ id: string; planNumber: string; participantName?: string; totalBudget?: string }>;
    services: Array<{ id: string; serviceName?: string; description?: string; participantName?: string; status?: string }>;
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
  // Recruitment operations
  getJobPostings(): Promise<JobPosting[]>;
  getJobPosting(id: string): Promise<JobPosting | undefined>;
  createJobPosting(posting: InsertJobPosting): Promise<JobPosting>;
  updateJobPosting(id: string, posting: Partial<InsertJobPosting>): Promise<JobPosting>;
  deleteJobPosting(id: string): Promise<void>;

  getJobApplications(): Promise<JobApplication[]>;
  getJobApplicationsByPosting(postingId: string): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplication(id: string, application: Partial<InsertJobApplication>): Promise<JobApplication>;
  deleteJobApplication(id: string): Promise<void>;

  getInterviewSchedules(): Promise<InterviewSchedule[]>;
  getInterviewScheduleByApplication(applicationId: string): Promise<InterviewSchedule[]>;
  createInterviewSchedule(schedule: InsertInterviewSchedule): Promise<InterviewSchedule>;
  updateInterviewSchedule(id: string, schedule: Partial<InsertInterviewSchedule>): Promise<InterviewSchedule>;
  deleteInterviewSchedule(id: string): Promise<void>;

  getStaffOnboarding(): Promise<StaffOnboarding[]>;
  getStaffOnboardingByStaff(staffId: string): Promise<StaffOnboarding | undefined>;
  createStaffOnboarding(onboarding: InsertStaffOnboarding): Promise<StaffOnboarding>;
  updateStaffOnboarding(id: string, onboarding: Partial<InsertStaffOnboarding>): Promise<StaffOnboarding>;
  deleteStaffOnboarding(id: string): Promise<void>;

  getStaffLeave(): Promise<StaffLeave[]>;
  getStaffLeaveByStaff(staffId: string): Promise<StaffLeave[]>;
  createStaffLeave(leave: InsertStaffLeave): Promise<StaffLeave>;
  updateStaffLeave(id: string, leave: Partial<InsertStaffLeave>): Promise<StaffLeave>;
  deleteStaffLeave(id: string): Promise<void>;

  getStaffTraining(): Promise<StaffTraining[]>;
  getStaffTrainingByStaff(staffId: string): Promise<StaffTraining[]>;
  createStaffTraining(training: InsertStaffTraining): Promise<StaffTraining>;
  updateStaffTraining(id: string, training: Partial<InsertStaffTraining>): Promise<StaffTraining>;
  deleteStaffTraining(id: string): Promise<void>;

  getSchacsAwardRates(): Promise<SchacsAwardRate[]>;
  getSchacsAwardRate(id: string): Promise<SchacsAwardRate | undefined>;
  createSchacsAwardRate(rate: InsertSchacsAwardRate): Promise<SchacsAwardRate>;
  updateSchacsAwardRate(id: string, rate: Partial<InsertSchacsAwardRate>): Promise<SchacsAwardRate>;
  deleteSchacsAwardRate(id: string): Promise<void>;

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

  // Automation support operations
  getUpcomingServices(): Promise<Service[]>;
  assignServiceToStaff(serviceId: string, staffId: string): Promise<void>;
  getAllNDISPlans(): Promise<NdisPlan[]>;
  getAllStaff(): Promise<Staff[]>;
  
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

  // States and Regions management
  getStates(): Promise<State[]>;
  getStateById(id: string): Promise<State | undefined>;
  createState(state: InsertState): Promise<State>;
  updateState(id: string, updates: Partial<InsertState>): Promise<State>;
  deleteState(id: string): Promise<void>;

  getRegions(): Promise<Region[]>;
  getRegionsByState(stateId: string): Promise<Region[]>;
  getRegionById(id: string): Promise<Region | undefined>;
  createRegion(region: InsertRegion): Promise<Region>;
  updateRegion(id: string, updates: Partial<InsertRegion>): Promise<Region>;
  deleteRegion(id: string): Promise<void>;

  getDepartmentRegions(): Promise<DepartmentRegion[]>;
  getDepartmentRegionsByRegion(regionId: string): Promise<DepartmentRegion[]>;
  createDepartmentRegion(departmentRegion: InsertDepartmentRegion): Promise<DepartmentRegion>;
  updateDepartmentRegion(id: string, updates: Partial<InsertDepartmentRegion>): Promise<DepartmentRegion>;
  deleteDepartmentRegion(id: string): Promise<void>;
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
    hoursCompletedThisMonth: number;
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

    // Calculate hours completed this month from shifts (simplified for now)
    let hoursCompletedThisMonth = 156; // Default value, would calculate from database in production
    
    // For budget calculation, we'll use a simple average for demonstration
    const budgetUsedPercentage = 73; // This would need more complex calculation based on actual service costs vs plan budgets

    return {
      activeParticipants: activeParticipantsResult.count,
      servicesThisWeek: servicesThisWeekResult.count,
      budgetUsedPercentage,
      hoursCompletedThisMonth,
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
  // Recruitment operations
  async getJobPostings(): Promise<JobPosting[]> {
    return await db.select().from(jobPostings).orderBy(desc(jobPostings.createdAt));
  }

  async getJobPosting(id: string): Promise<JobPosting | undefined> {
    const [posting] = await db.select().from(jobPostings).where(eq(jobPostings.id, id));
    return posting;
  }

  async createJobPosting(posting: InsertJobPosting): Promise<JobPosting> {
    const [newPosting] = await db.insert(jobPostings).values(posting).returning();
    return newPosting;
  }

  async updateJobPosting(id: string, posting: Partial<InsertJobPosting>): Promise<JobPosting> {
    const [updated] = await db
      .update(jobPostings)
      .set({ ...posting, updatedAt: new Date() })
      .where(eq(jobPostings.id, id))
      .returning();
    return updated;
  }

  async deleteJobPosting(id: string): Promise<void> {
    await db.delete(jobPostings).where(eq(jobPostings.id, id));
  }

  async getJobApplications(): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  }

  async getJobApplicationsByPosting(postingId: string): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).where(eq(jobApplications.jobPostingId, postingId)).orderBy(desc(jobApplications.createdAt));
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [newApplication] = await db.insert(jobApplications).values(application).returning();
    return newApplication;
  }

  async updateJobApplication(id: string, application: Partial<InsertJobApplication>): Promise<JobApplication> {
    const [updated] = await db
      .update(jobApplications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(jobApplications.id, id))
      .returning();
    return updated;
  }

  async deleteJobApplication(id: string): Promise<void> {
    await db.delete(jobApplications).where(eq(jobApplications.id, id));
  }

  async getInterviewSchedules(): Promise<InterviewSchedule[]> {
    return await db.select().from(interviewSchedule).orderBy(desc(interviewSchedule.createdAt));
  }

  async getInterviewScheduleByApplication(applicationId: string): Promise<InterviewSchedule[]> {
    return await db.select().from(interviewSchedule).where(eq(interviewSchedule.applicationId, applicationId)).orderBy(desc(interviewSchedule.createdAt));
  }

  async createInterviewSchedule(schedule: InsertInterviewSchedule): Promise<InterviewSchedule> {
    const [newSchedule] = await db.insert(interviewSchedule).values(schedule).returning();
    return newSchedule;
  }

  async updateInterviewSchedule(id: string, schedule: Partial<InsertInterviewSchedule>): Promise<InterviewSchedule> {
    const [updated] = await db
      .update(interviewSchedule)
      .set({ ...schedule, updatedAt: new Date() })
      .where(eq(interviewSchedule.id, id))
      .returning();
    return updated;
  }

  async deleteInterviewSchedule(id: string): Promise<void> {
    await db.delete(interviewSchedule).where(eq(interviewSchedule.id, id));
  }

  async getStaffOnboarding(): Promise<StaffOnboarding[]> {
    return await db.select().from(staffOnboarding).orderBy(desc(staffOnboarding.createdAt));
  }

  async getStaffOnboardingByStaff(staffId: string): Promise<StaffOnboarding | undefined> {
    const [onboarding] = await db.select().from(staffOnboarding).where(eq(staffOnboarding.staffId, staffId));
    return onboarding;
  }

  async createStaffOnboarding(onboarding: InsertStaffOnboarding): Promise<StaffOnboarding> {
    const [newOnboarding] = await db.insert(staffOnboarding).values(onboarding).returning();
    return newOnboarding;
  }

  async updateStaffOnboarding(id: string, onboarding: Partial<InsertStaffOnboarding>): Promise<StaffOnboarding> {
    const [updated] = await db
      .update(staffOnboarding)
      .set({ ...onboarding, updatedAt: new Date() })
      .where(eq(staffOnboarding.id, id))
      .returning();
    return updated;
  }

  async deleteStaffOnboarding(id: string): Promise<void> {
    await db.delete(staffOnboarding).where(eq(staffOnboarding.id, id));
  }

  async getStaffLeave(): Promise<StaffLeave[]> {
    return await db.select().from(staffLeave).orderBy(desc(staffLeave.createdAt));
  }

  async getStaffLeaveByStaff(staffId: string): Promise<StaffLeave[]> {
    return await db.select().from(staffLeave).where(eq(staffLeave.staffId, staffId)).orderBy(desc(staffLeave.createdAt));
  }

  async createStaffLeave(leave: InsertStaffLeave): Promise<StaffLeave> {
    const [newLeave] = await db.insert(staffLeave).values(leave).returning();
    return newLeave;
  }

  async updateStaffLeave(id: string, leave: Partial<InsertStaffLeave>): Promise<StaffLeave> {
    const [updated] = await db
      .update(staffLeave)
      .set({ ...leave, updatedAt: new Date() })
      .where(eq(staffLeave.id, id))
      .returning();
    return updated;
  }

  async deleteStaffLeave(id: string): Promise<void> {
    await db.delete(staffLeave).where(eq(staffLeave.id, id));
  }

  async getStaffTraining(): Promise<StaffTraining[]> {
    return await db.select().from(staffTraining).orderBy(desc(staffTraining.createdAt));
  }

  async getStaffTrainingByStaff(staffId: string): Promise<StaffTraining[]> {
    return await db.select().from(staffTraining).where(eq(staffTraining.staffId, staffId)).orderBy(desc(staffTraining.createdAt));
  }

  async createStaffTraining(training: InsertStaffTraining): Promise<StaffTraining> {
    const [newTraining] = await db.insert(staffTraining).values(training).returning();
    return newTraining;
  }

  async updateStaffTraining(id: string, training: Partial<InsertStaffTraining>): Promise<StaffTraining> {
    const [updated] = await db
      .update(staffTraining)
      .set({ ...training, updatedAt: new Date() })
      .where(eq(staffTraining.id, id))
      .returning();
    return updated;
  }

  async deleteStaffTraining(id: string): Promise<void> {
    await db.delete(staffTraining).where(eq(staffTraining.id, id));
  }

  async getSchacsAwardRates(): Promise<SchacsAwardRate[]> {
    return await db.select().from(schacsAwardRates).orderBy(desc(schacsAwardRates.createdAt));
  }

  async getSchacsAwardRate(id: string): Promise<SchacsAwardRate | undefined> {
    const [rate] = await db.select().from(schacsAwardRates).where(eq(schacsAwardRates.id, id));
    return rate;
  }

  async createSchacsAwardRate(rate: InsertSchacsAwardRate): Promise<SchacsAwardRate> {
    const [newRate] = await db.insert(schacsAwardRates).values(rate).returning();
    return newRate;
  }

  async updateSchacsAwardRate(id: string, rate: Partial<InsertSchacsAwardRate>): Promise<SchacsAwardRate> {
    const [updated] = await db
      .update(schacsAwardRates)
      .set({ ...rate, updatedAt: new Date() })
      .where(eq(schacsAwardRates.id, id))
      .returning();
    return updated;
  }

  async deleteSchacsAwardRate(id: string): Promise<void> {
    await db.delete(schacsAwardRates).where(eq(schacsAwardRates.id, id));
  }

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

  // Enhanced Shift Management for NDIS Billing
  async getShiftsWithDetails(): Promise<any[]> {
    const shiftsWithDetails = await db
      .select({
        id: shifts.id,
        participantId: shifts.participantId,
        participantName: sql<string>`${participants.firstName} || ' ' || ${participants.lastName}`,
        assignedStaffId: shifts.assignedStaffId,
        staffName: sql<string>`${staff.firstName} || ' ' || ${staff.lastName}`,
        shiftDate: shifts.shiftDate,
        startTime: shifts.startTime,
        endTime: shifts.endTime,
        duration: shifts.duration,
        location: shifts.location,
        participantAddress: shifts.participantAddress,
        status: shifts.status,
        clockInTime: shifts.clockInTime,
        clockOutTime: shifts.clockOutTime,
        actualDuration: shifts.actualDuration,
        hourlyRate: shifts.hourlyRate,
        totalAmount: shifts.totalAmount,
        caseNoteCompleted: shifts.caseNoteCompleted,
        billingStatus: shifts.billingStatus,
        ndisSupportItemNumber: shifts.ndisSupportItemNumber,
      })
      .from(shifts)
      .leftJoin(participants, eq(shifts.participantId, participants.id))
      .leftJoin(staff, eq(shifts.assignedStaffId, staff.id))
      .orderBy(desc(shifts.shiftDate));
    
    return shiftsWithDetails;
  }

  async clockInShift(shiftId: string): Promise<any> {
    const now = new Date();
    const [updated] = await db
      .update(shifts)
      .set({ 
        clockInTime: now,
        status: "in_progress",
        updatedAt: now
      })
      .where(eq(shifts.id, shiftId))
      .returning();
    return updated;
  }

  async clockOutShift(shiftId: string): Promise<any> {
    const now = new Date();
    
    // Get the shift to calculate actual duration
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, shiftId));
    if (!shift || !shift.clockInTime) {
      throw new Error("Shift not found or not clocked in");
    }
    
    const actualDurationMs = now.getTime() - new Date(shift.clockInTime).getTime();
    const actualDurationMinutes = Math.round(actualDurationMs / (1000 * 60));
    const totalAmount = shift.hourlyRate ? 
      Number(shift.hourlyRate) * (actualDurationMinutes / 60) : 0;
    
    const [updated] = await db
      .update(shifts)
      .set({ 
        clockOutTime: now,
        actualDuration: actualDurationMinutes,
        totalAmount: totalAmount.toString(),
        status: "completed",
        updatedAt: now
      })
      .where(eq(shifts.id, shiftId))
      .returning();
    return updated;
  }

  async createShiftCaseNote(caseNote: any): Promise<any> {
    const [newCaseNote] = await db.insert(shiftCaseNotes).values(caseNote).returning();
    return newCaseNote;
  }

  async updateShiftCaseNoteStatus(shiftId: string, completed: boolean): Promise<any> {
    const [updated] = await db
      .update(shifts)
      .set({ 
        caseNoteCompleted: completed,
        updatedAt: new Date()
      })
      .where(eq(shifts.id, shiftId))
      .returning();
    return updated;
  }

  async getShiftCaseNotes(): Promise<any[]> {
    return await db.select().from(shiftCaseNotes).orderBy(desc(shiftCaseNotes.createdAt));
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

  async getIncidents(filters?: { status?: string; severity?: string; participantId?: string }): Promise<Incident[]> {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(incidents.status, filters.status));
    }
    if (filters?.severity) {
      conditions.push(eq(incidents.severity, filters.severity));
    }
    if (filters?.participantId) {
      conditions.push(eq(incidents.participantId, filters.participantId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(incidents).where(and(...conditions)).orderBy(desc(incidents.createdAt));
    }
    
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

  // Quick search functionality
  async quickSearch(query: string): Promise<{
    participants: Array<{ id: string; firstName: string; lastName: string; ndisNumber: string; primaryDisability?: string }>;
    staff: Array<{ id: string; firstName: string; lastName: string; position?: string; email?: string }>;
    plans: Array<{ id: string; planNumber: string; participantName?: string; totalBudget?: string }>;
    services: Array<{ id: string; serviceName?: string; description?: string; participantName?: string; status?: string }>;
  }> {
    try {
      // If query is empty, return empty results
      if (!query.trim()) {
        return {
          participants: [],
          staff: [],
          plans: [],
          services: [],
        };
      }

      const searchTerm = `%${query.toLowerCase()}%`;

      // Try simple queries one by one to isolate the issue
      let participantResults = [];
      let staffResults = [];
      let planResults = [];
      let serviceResults = [];

      try {
        // Search participants with filtering
        participantResults = await db
          .select()
          .from(participants)
          .where(
            and(
              eq(participants.isActive, true),
              or(
                ilike(participants.firstName, searchTerm),
                ilike(participants.lastName, searchTerm),
                ilike(participants.ndisNumber, searchTerm),
                ilike(participants.primaryDisability, searchTerm)
              )
            )
          )
          .limit(10);
      } catch (error) {
        console.error('Participants search failed:', error);
        // Fallback to simple query
        participantResults = await db.select().from(participants).where(eq(participants.isActive, true)).limit(10);
      }

      try {
        // Search staff with filtering
        staffResults = await db
          .select()
          .from(staff)
          .where(
            and(
              eq(staff.isActive, true),
              or(
                ilike(staff.firstName, searchTerm),
                ilike(staff.lastName, searchTerm),
                ilike(staff.email, searchTerm),
                ilike(staff.position, searchTerm)
              )
            )
          )
          .limit(10);
      } catch (error) {
        console.error('Staff search failed:', error);
        // Fallback to simple query
        staffResults = await db.select().from(staff).where(eq(staff.isActive, true)).limit(10);
      }

      try {
        // Search plans with filtering
        planResults = await db
          .select()
          .from(ndisPlans)
          .where(
            ilike(ndisPlans.planNumber, searchTerm)
          )
          .limit(10);
      } catch (error) {
        console.error('Plans search failed:', error);
        planResults = await db.select().from(ndisPlans).limit(10);
      }

      try {
        // Search services with filtering - only serviceName field exists
        serviceResults = await db
          .select()
          .from(services)
          .where(
            ilike(services.serviceName, searchTerm)
          )
          .limit(10);
      } catch (error) {
        console.error('Services search failed, using fallback:', error.message);
        serviceResults = await db.select().from(services).limit(10);
      }

      return {
        participants: participantResults.map(p => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          ndisNumber: p.ndisNumber,
          primaryDisability: p.primaryDisability,
        })),
        staff: staffResults.map(s => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          position: s.position,
          email: s.email,
        })),
        plans: planResults.map(p => ({
          id: p.id,
          planNumber: p.planNumber,
          participantName: undefined,
          totalBudget: p.totalBudget,
        })),
        services: serviceResults.map(s => ({
          id: s.id,
          serviceName: s.serviceName,
          participantName: undefined,
          status: s.status,
        })),
      };
    } catch (error) {
      console.error('Error in quickSearch:', error);
      return {
        participants: [],
        staff: [],
        plans: [],
        services: [],
      };
    }
  }

  // Automation support operations
  async getUpcomingServices(): Promise<Service[]> {
    const now = new Date();
    return await db.select()
      .from(services)
      .where(and(
        gte(services.scheduledDate, now.toISOString().split('T')[0]),
        or(
          eq(services.status, 'scheduled'),
          eq(services.status, 'confirmed')
        )
      ))
      .orderBy(services.scheduledDate);
  }

  async assignServiceToStaff(serviceId: string, staffId: string): Promise<void> {
    await db.update(services)
      .set({ 
        assignedTo: staffId,
        status: 'confirmed',
        updatedAt: new Date()
      })
      .where(eq(services.id, serviceId));
  }

  // Service agreement methods
  async getServiceAgreementsByParticipant(participantId: string): Promise<ServiceAgreement[]> {
    return await db
      .select()
      .from(serviceAgreements)
      .where(eq(serviceAgreements.participantId, participantId));
  }

  async getAllNDISPlans(): Promise<NdisPlan[]> {
    return await db.select().from(ndisPlans);
  }

  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    // Generate incident number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const incidentNumber = `INC-${year}${month}${day}-${randomNum}`;
    
    const [newIncident] = await db.insert(incidents).values({
      ...incident,
      incidentNumber,
    }).returning();
    
    // Add initial timeline entry
    await this.addIncidentTimelineEntry({
      incidentId: newIncident.id,
      action: 'incident_reported',
      description: 'Incident was reported',
      performedBy: incident.reportedBy,
      performedByRole: incident.reportedByRole,
    });
    
    // Create initial notification for management
    await this.createIncidentNotification({
      incidentId: newIncident.id,
      recipientEmail: 'management@primacycare.com.au',
      recipientRole: 'Management',
      notificationType: 'new_incident',
      subject: `New ${incident.severity} Incident Reported - ${incidentNumber}`,
      message: `A new ${incident.severity} incident has been reported for ${incident.participantName}. Please review and take appropriate action.`,
      priority: incident.severity === 'critical' ? 'urgent' : 'high',
    });
    
    return newIncident;
  }

  async updateIncident(id: string, incident: Partial<InsertIncident>): Promise<Incident | undefined> {
    const [updated] = await db
      .update(incidents)
      .set({ ...incident, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return updated;
  }

  async getIncidentApprovals(incidentId: string): Promise<IncidentApproval[]> {
    return await db.select().from(incidentApprovals)
      .where(eq(incidentApprovals.incidentId, incidentId))
      .orderBy(desc(incidentApprovals.createdAt));
  }

  async createIncidentApproval(approval: InsertIncidentApproval): Promise<IncidentApproval> {
    const [newApproval] = await db.insert(incidentApprovals).values(approval).returning();
    
    // Update incident approval level if approved
    if (approval.action === 'approved') {
      const incident = await this.getIncident(approval.incidentId);
      if (incident) {
        const nextLevel = incident.currentApprovalLevel + 1;
        await this.updateIncident(approval.incidentId, {
          currentApprovalLevel: nextLevel,
          status: nextLevel > 3 ? 'approved' : 'under_review',
        });
      }
    } else if (approval.action === 'escalated') {
      await this.updateIncident(approval.incidentId, { status: 'escalated' });
    }
    
    // Add timeline entry
    await this.addIncidentTimelineEntry({
      incidentId: approval.incidentId,
      action: `approval_${approval.action}`,
      description: `${approval.approverRole} ${approval.action} the incident`,
      performedBy: approval.approverName,
      performedByRole: approval.approverRole,
    });
    
    return newApproval;
  }

  async getIncidentNotifications(incidentId: string): Promise<IncidentNotification[]> {
    return await db.select().from(incidentNotifications)
      .where(eq(incidentNotifications.incidentId, incidentId))
      .orderBy(desc(incidentNotifications.createdAt));
  }

  async createIncidentNotification(notification: InsertIncidentNotification): Promise<IncidentNotification> {
    const [newNotification] = await db.insert(incidentNotifications).values(notification).returning();
    // In production, this would trigger actual email/SMS sending
    return newNotification;
  }

  async getIncidentTimeline(incidentId: string): Promise<IncidentTimelineEntry[]> {
    return await db.select().from(incidentTimeline)
      .where(eq(incidentTimeline.incidentId, incidentId))
      .orderBy(desc(incidentTimeline.timestamp));
  }

  async addIncidentTimelineEntry(entry: InsertIncidentTimelineEntry): Promise<IncidentTimelineEntry> {
    const [newEntry] = await db.insert(incidentTimeline).values(entry).returning();
    return newEntry;
  }

  async getIncidentDocuments(incidentId: string): Promise<IncidentDocument[]> {
    return await db.select().from(incidentDocuments)
      .where(eq(incidentDocuments.incidentId, incidentId))
      .orderBy(desc(incidentDocuments.createdAt));
  }

  async addIncidentDocument(document: InsertIncidentDocument): Promise<IncidentDocument> {
    const [newDocument] = await db.insert(incidentDocuments).values(document).returning();
    
    // Add timeline entry
    await this.addIncidentTimelineEntry({
      incidentId: document.incidentId,
      action: 'document_uploaded',
      description: `${document.documentType} uploaded: ${document.documentName}`,
      performedBy: document.uploadedBy,
      performedByRole: 'Staff',
    });
    
    return newDocument;
  }

  // States and Regions management implementation
  async getStates(): Promise<State[]> {
    return await db.select().from(states).where(eq(states.isActive, true)).orderBy(states.name);
  }

  async getStateById(id: string): Promise<State | undefined> {
    const [state] = await db.select().from(states).where(eq(states.id, id));
    return state;
  }

  async createState(state: InsertState): Promise<State> {
    const [newState] = await db.insert(states).values(state).returning();
    return newState;
  }

  async updateState(id: string, updates: Partial<InsertState>): Promise<State> {
    const [updated] = await db
      .update(states)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(states.id, id))
      .returning();
    return updated;
  }

  async deleteState(id: string): Promise<void> {
    await db.update(states).set({ isActive: false }).where(eq(states.id, id));
  }

  async getRegions(): Promise<Region[]> {
    return await db.select().from(regions).where(eq(regions.isActive, true)).orderBy(regions.name);
  }

  async getRegionsByState(stateId: string): Promise<Region[]> {
    return await db.select().from(regions)
      .where(and(eq(regions.stateId, stateId), eq(regions.isActive, true)))
      .orderBy(regions.name);
  }

  async getRegionById(id: string): Promise<Region | undefined> {
    const [region] = await db.select().from(regions).where(eq(regions.id, id));
    return region;
  }

  async createRegion(region: InsertRegion): Promise<Region> {
    const [newRegion] = await db.insert(regions).values(region).returning();
    return newRegion;
  }

  async updateRegion(id: string, updates: Partial<InsertRegion>): Promise<Region> {
    const [updated] = await db
      .update(regions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(regions.id, id))
      .returning();
    return updated;
  }

  async deleteRegion(id: string): Promise<void> {
    await db.update(regions).set({ isActive: false }).where(eq(regions.id, id));
  }

  async getDepartmentRegions(): Promise<DepartmentRegion[]> {
    return await db.select().from(departmentRegions).where(eq(departmentRegions.isActive, true)).orderBy(departmentRegions.departmentName);
  }

  async getDepartmentRegionsByRegion(regionId: string): Promise<DepartmentRegion[]> {
    return await db.select().from(departmentRegions)
      .where(and(eq(departmentRegions.regionId, regionId), eq(departmentRegions.isActive, true)))
      .orderBy(departmentRegions.departmentName);
  }

  async createDepartmentRegion(departmentRegion: InsertDepartmentRegion): Promise<DepartmentRegion> {
    const [newDepartmentRegion] = await db.insert(departmentRegions).values(departmentRegion).returning();
    return newDepartmentRegion;
  }

  async updateDepartmentRegion(id: string, updates: Partial<InsertDepartmentRegion>): Promise<DepartmentRegion> {
    const [updated] = await db
      .update(departmentRegions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(departmentRegions.id, id))
      .returning();
    return updated;
  }

  async deleteDepartmentRegion(id: string): Promise<void> {
    await db.update(departmentRegions).set({ isActive: false }).where(eq(departmentRegions.id, id));
  }

  // Contract management methods
  async getContractTemplates() {
    const templates = [
      {
        id: 'full_time_template',
        name: 'Full-Time Employment Contract',
        type: 'full_time',
        template: '{{contract_template_content}}',
        variables: ['applicantName', 'position', 'department', 'startDate', 'salary', 'probationPeriod'],
        isDefault: true
      },
      {
        id: 'part_time_template',
        name: 'Part-Time Employment Contract',
        type: 'part_time',
        template: '{{contract_template_content}}',
        variables: ['applicantName', 'position', 'department', 'startDate', 'salary', 'probationPeriod'],
        isDefault: false
      },
      {
        id: 'casual_template',
        name: 'Casual Employment Contract',
        type: 'casual',
        template: '{{contract_template_content}}',
        variables: ['applicantName', 'position', 'department', 'startDate', 'hourlyRate'],
        isDefault: false
      }
    ];
    return templates;
  }

  async getContracts() {
    // Mock implementation - in production this would query the contracts table
    return [];
  }

  async getContractById(id: string) {
    // Mock implementation - in production this would query the contracts table
    return null;
  }

  // Department notifications
  async getDepartmentNotifications(department?: string) {
    // Mock implementation - in production this would query notifications table
    const mockNotifications = [
      {
        id: '1',
        department: 'Finance',
        message: 'New staff member contract signed: Sarah Johnson. Please set up payroll and SCHADS award payments.',
        priority: 'high',
        actionRequired: 'Setup payroll account and SCHADS classification',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        department: 'Service Delivery',
        message: 'New staff member available for allocation: Michael Chen. Please assign to appropriate shifts and participant services.',
        priority: 'medium',
        actionRequired: 'Add to staff allocation system and shift management',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];

    if (department) {
      return mockNotifications.filter(n => n.department === department);
    }
    return mockNotifications;
  }

  async markNotificationAsRead(notificationId: string) {
    // Mock implementation - in production this would update the notification in database
    console.log(`Notification ${notificationId} marked as read`);
  }

  // Applicant Portal Methods
  async verifyApplicantCredentials(applicantId: string, accessCode: string) {
    // Mock implementation - in production this would verify against database
    const mockApplicants = [
      {
        id: 'APP001',
        accessCode: 'temp123',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        position: 'Support Worker Level 2',
        status: 'shortlisted'
      },
      {
        id: 'APP002', 
        accessCode: 'temp456',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        position: 'Team Coordinator',
        status: 'contract_pending'
      }
    ];

    return mockApplicants.find(a => a.id === applicantId && a.accessCode === accessCode);
  }

  async getApplicantApplication(applicantId: string) {
    // Mock implementation - in production this would query database
    const mockApplications: Record<string, any> = {
      'APP001': {
        id: 'APP001',
        applicantName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '0400 123 456',
        position: 'Support Worker Level 2',
        status: 'documents_pending',
        invitationSent: true,
        documentsUploaded: ['Resume/CV', 'NDIS Worker Screening Check'],
        interviewDate: null,
        contractSigned: false,
        trainingProgress: 0,
        referees: []
      },
      'APP002': {
        id: 'APP002',
        applicantName: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '0400 789 012',
        position: 'Team Coordinator',
        status: 'contract_pending',
        invitationSent: true,
        documentsUploaded: ['Resume/CV', 'Cover Letter', 'Qualifications/Certificates', 'NDIS Worker Screening Check'],
        interviewDate: '2025-01-05T10:00:00.000Z',
        contractSigned: false,
        trainingProgress: 0,
        referees: [
          {
            name: 'Jennifer Smith',
            relationship: 'Previous Manager',
            phone: '0400 555 111',
            email: 'j.smith@company.com',
            contacted: true
          },
          {
            name: 'David Wilson',
            relationship: 'Team Leader',
            phone: '0400 555 222', 
            email: 'd.wilson@company.com',
            contacted: false
          }
        ]
      }
    };

    return mockApplications[applicantId];
  }

  async addApplicantDocument(applicantId: string, documentName: string) {
    // Mock implementation - in production this would update database
    console.log(`Document ${documentName} added for applicant ${applicantId}`);
  }

  async addApplicantReferee(applicantId: string, refereeData: any) {
    // Mock implementation - in production this would update database
    console.log(`Referee ${refereeData.name} added for applicant ${applicantId}`);
  }

  async signApplicantContract(applicantId: string, signatureData: any) {
    // Mock implementation - in production this would update database
    console.log(`Contract signed by applicant ${applicantId}`, signatureData);
  }

  async sendApplicantInvitation(applicantId: string, email: string, accessCode: string) {
    // Mock implementation - in production this would send email
    console.log(`Invitation sent to ${email} for applicant ${applicantId} with code ${accessCode}`);
    
    // In a real implementation, this would:
    // 1. Generate secure access code
    // 2. Send email with portal link and credentials
    // 3. Set invitation expiry date
    // 4. Log invitation activity
  }

  async deactivateApplicantAccess(applicantId: string) {
    // Mock implementation - in production this would update database
    console.log(`Access deactivated for applicant ${applicantId}`);
  }

  async getShortlistedApplicants() {
    // Mock implementation - in production this would query database
    return [
      {
        id: 'APP001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        position: 'Support Worker Level 2',
        applicationDate: '2025-01-01T00:00:00.000Z',
        invitationSent: true,
        portalAccess: true,
        lastLogin: '2025-01-02T10:30:00.000Z',
        status: 'documents_pending'
      },
      {
        id: 'APP002',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        position: 'Team Coordinator',
        applicationDate: '2025-01-01T00:00:00.000Z',
        invitationSent: true,
        portalAccess: true,
        lastLogin: '2025-01-03T14:20:00.000Z',
        status: 'contract_pending'
      },
      {
        id: 'APP003',
        name: 'Emma Davis',
        email: 'emma.davis@email.com',
        position: 'Support Worker Level 1',
        applicationDate: '2025-01-02T00:00:00.000Z',
        invitationSent: false,
        portalAccess: false,
        status: 'shortlisted'
      },
      {
        id: 'APP004',
        name: 'James Wilson',
        email: 'james.wilson@email.com',
        position: 'Community Access Coordinator',
        applicationDate: '2025-01-02T00:00:00.000Z',
        invitationSent: true,
        portalAccess: true,
        status: 'interview_scheduled'
      },
      {
        id: 'APP005',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        position: 'Behaviour Support Practitioner',
        applicationDate: '2025-01-03T00:00:00.000Z',
        invitationSent: false,
        portalAccess: false,
        status: 'shortlisted'
      }
    ];
  }

  // Training Module Methods
  async getTrainingModules() {
    // Mock implementation - in production this would query database
    return [
      {
        id: 'TM001',
        title: 'NDIS Introduction and Overview',
        description: 'Comprehensive introduction to the National Disability Insurance Scheme, its principles, and core values.',
        type: 'video',
        duration: 45,
        mandatory: true,
        category: 'onboarding',
        prerequisites: [],
        completionRate: 95,
        dueDate: '2025-01-10T00:00:00.000Z'
      },
      {
        id: 'TM002',
        title: 'Person-Centered Support Approaches',
        description: 'Learn how to provide person-centered support that respects individual choice and control.',
        type: 'interactive',
        duration: 60,
        mandatory: true,
        category: 'ndis_compliance',
        prerequisites: ['TM001'],
        completionRate: 88
      },
      {
        id: 'TM003',
        title: 'Risk Assessment and Management',
        description: 'Understanding risk assessment processes and developing effective risk management strategies.',
        type: 'assessment',
        duration: 30,
        mandatory: true,
        category: 'safety',
        prerequisites: ['TM001'],
        completionRate: 76
      },
      {
        id: 'TM004',
        title: 'Documentation and Reporting',
        description: 'Best practices for documentation, incident reporting, and maintaining accurate records.',
        type: 'document',
        duration: 25,
        mandatory: true,
        category: 'ndis_compliance',
        prerequisites: ['TM001', 'TM002'],
        completionRate: 82
      },
      {
        id: 'TM005',
        title: 'Emergency Procedures',
        description: 'Essential emergency response procedures and safety protocols for NDIS service delivery.',
        type: 'video',
        duration: 35,
        mandatory: true,
        category: 'safety',
        prerequisites: [],
        completionRate: 91,
        dueDate: '2025-01-15T00:00:00.000Z'
      },
      {
        id: 'TM006',
        title: 'Cultural Competency in Disability Support',
        description: 'Understanding cultural diversity and providing culturally appropriate support services.',
        type: 'interactive',
        duration: 50,
        mandatory: false,
        category: 'professional_development',
        prerequisites: ['TM002'],
        completionRate: 65
      }
    ];
  }

  async getTrainingProgress(staffId: string) {
    // Mock implementation - in production this would query database
    const progressData: Record<string, any[]> = {
      'APP001': [
        { moduleId: 'TM001', status: 'completed', progress: 100, completedAt: '2025-01-02T10:00:00.000Z', score: 95, timeSpent: 47 },
        { moduleId: 'TM002', status: 'in_progress', progress: 60, timeSpent: 30 },
        { moduleId: 'TM003', status: 'not_started', progress: 0, timeSpent: 0 },
        { moduleId: 'TM005', status: 'not_started', progress: 0, timeSpent: 0 }
      ],
      'APP002': [
        { moduleId: 'TM001', status: 'completed', progress: 100, completedAt: '2025-01-01T15:00:00.000Z', score: 88, timeSpent: 45 },
        { moduleId: 'TM002', status: 'completed', progress: 100, completedAt: '2025-01-02T09:00:00.000Z', score: 92, timeSpent: 58 },
        { moduleId: 'TM003', status: 'completed', progress: 100, completedAt: '2025-01-02T14:00:00.000Z', score: 85, timeSpent: 32 },
        { moduleId: 'TM004', status: 'in_progress', progress: 40, timeSpent: 15 }
      ],
      'current': [
        { moduleId: 'TM001', status: 'completed', progress: 100, completedAt: '2025-01-01T10:00:00.000Z', score: 92, timeSpent: 48 },
        { moduleId: 'TM002', status: 'completed', progress: 100, completedAt: '2025-01-01T16:00:00.000Z', score: 89, timeSpent: 62 },
        { moduleId: 'TM003', status: 'in_progress', progress: 75, timeSpent: 25 },
        { moduleId: 'TM004', status: 'not_started', progress: 0, timeSpent: 0 },
        { moduleId: 'TM005', status: 'completed', progress: 100, completedAt: '2025-01-02T08:00:00.000Z', score: 96, timeSpent: 38 }
      ]
    };

    return progressData[staffId] || [];
  }

  async getTrainingPathways() {
    // Mock implementation - in production this would query database
    return [
      {
        id: 'TP001',
        name: 'New Staff Onboarding',
        description: 'Essential training for all new NDIS support workers covering compliance, safety, and best practices.',
        modules: ['TM001', 'TM002', 'TM003', 'TM004', 'TM005'],
        estimatedDuration: 195,
        category: 'onboarding',
        mandatory: true
      },
      {
        id: 'TP002',
        name: 'NDIS Compliance Specialist',
        description: 'Advanced compliance training for senior staff and team leaders.',
        modules: ['TM001', 'TM002', 'TM004'],
        estimatedDuration: 130,
        category: 'ndis_compliance',
        mandatory: false
      },
      {
        id: 'TP003',
        name: 'Safety and Risk Management',
        description: 'Comprehensive safety training focusing on risk assessment and emergency procedures.',
        modules: ['TM003', 'TM005'],
        estimatedDuration: 65,
        category: 'safety',
        mandatory: true
      },
      {
        id: 'TP004',
        name: 'Professional Development Track',
        description: 'Ongoing professional development for experienced support workers.',
        modules: ['TM006'],
        estimatedDuration: 50,
        category: 'professional_development',
        mandatory: false
      }
    ];
  }

  async startTrainingModule(staffId: string, moduleId: string) {
    // Mock implementation - in production this would update database
    console.log(`Staff ${staffId} started training module ${moduleId}`);
  }

  async completeTrainingModule(staffId: string, moduleId: string, score?: number) {
    // Mock implementation - in production this would update database
    console.log(`Staff ${staffId} completed training module ${moduleId} with score ${score || 'N/A'}`);
  }

  // Document Verification Methods
  async getVerificationResults() {
    // Mock implementation - in production this would query database
    return [
      {
        id: 'VER001',
        documentId: 'DOC001',
        documentType: 'drivers_license',
        applicantName: 'Sarah Johnson',
        uploadedAt: '2025-01-03T10:00:00.000Z',
        verificationStatus: 'discrepancy_found',
        ocrConfidence: 92,
        extractedData: {
          full_name: 'Sarah M Johnson',
          date_of_birth: '1990-05-15',
          license_number: 'NSW123456789',
          address: '123 Main St, Sydney NSW 2000',
          expiry_date: '2027-05-15'
        },
        crossReferenceResults: [
          {
            department: 'HR',
            field: 'full_name',
            documentValue: 'Sarah M Johnson',
            systemValue: 'Sarah Johnson',
            match: false,
            confidence: 85
          },
          {
            department: 'HR',
            field: 'date_of_birth',
            documentValue: '1990-05-15',
            systemValue: '1990-05-15',
            match: true,
            confidence: 100
          },
          {
            department: 'Compliance',
            field: 'license_number',
            documentValue: 'NSW123456789',
            systemValue: 'NSW123456790',
            match: false,
            confidence: 95
          }
        ],
        discrepancies: [
          {
            field: 'full_name',
            documentValue: 'Sarah M Johnson',
            systemValue: 'Sarah Johnson',
            severity: 'medium',
            department: 'HR'
          },
          {
            field: 'license_number',
            documentValue: 'NSW123456789',
            systemValue: 'NSW123456790',
            severity: 'high',
            department: 'Compliance'
          }
        ],
        alertsGenerated: true
      },
      {
        id: 'VER002',
        documentId: 'DOC002',
        documentType: 'ndis_screening',
        applicantName: 'Michael Chen',
        uploadedAt: '2025-01-03T11:30:00.000Z',
        verificationStatus: 'verified',
        ocrConfidence: 96,
        extractedData: {
          full_name: 'Michael Chen',
          clearance_number: 'NDIS2024001234',
          expiry_date: '2026-12-31',
          status: 'Current'
        },
        crossReferenceResults: [
          {
            department: 'Compliance',
            field: 'full_name',
            documentValue: 'Michael Chen',
            systemValue: 'Michael Chen',
            match: true,
            confidence: 100
          },
          {
            department: 'Compliance',
            field: 'clearance_number',
            documentValue: 'NDIS2024001234',
            systemValue: 'NDIS2024001234',
            match: true,
            confidence: 100
          }
        ],
        discrepancies: [],
        alertsGenerated: false
      },
      {
        id: 'VER003',
        documentId: 'DOC003',
        documentType: 'qualification',
        applicantName: 'Emma Davis',
        uploadedAt: '2025-01-03T14:15:00.000Z',
        verificationStatus: 'processing',
        ocrConfidence: 88,
        extractedData: {
          qualification_name: 'Certificate IV in Disability Support',
          institution: 'TAFE NSW',
          completion_date: '2023-11-30',
          student_name: 'Emma Davis'
        },
        crossReferenceResults: [],
        discrepancies: [],
        alertsGenerated: false
      }
    ];
  }

  async getRecentUploads() {
    // Mock implementation - in production this would query database
    return [
      {
        id: 'DOC001',
        fileName: 'sarah_license.pdf',
        fileType: 'application/pdf',
        uploadedBy: 'HR Team',
        uploadedAt: '2025-01-03T10:00:00.000Z',
        size: 2048576,
        verificationStatus: 'discrepancy_found'
      },
      {
        id: 'DOC002',
        fileName: 'michael_ndis_screening.pdf',
        fileType: 'application/pdf',
        uploadedBy: 'Compliance Team',
        uploadedAt: '2025-01-03T11:30:00.000Z',
        size: 1536000,
        verificationStatus: 'verified'
      },
      {
        id: 'DOC003',
        fileName: 'emma_certificate.jpg',
        fileType: 'image/jpeg',
        uploadedBy: 'HR Team',
        uploadedAt: '2025-01-03T14:15:00.000Z',
        size: 3072000,
        verificationStatus: 'processing'
      }
    ];
  }

  async processDocumentVerification(documentType: string) {
    // Mock implementation - in production this would:
    // 1. Upload file to secure storage
    // 2. Process with OCR service (Google Vision, AWS Textract, etc.)
    // 3. Extract structured data
    // 4. Cross-reference with department databases
    // 5. Generate alerts for discrepancies
    
    const verificationId = `VER${Date.now()}`;
    console.log(`Processing document verification for type: ${documentType}, ID: ${verificationId}`);
    
    // Simulate processing time and generate mock result
    setTimeout(() => {
      console.log(`Verification ${verificationId} completed with OCR and cross-reference`);
    }, 5000);
    
    return {
      id: verificationId,
      status: 'processing',
      estimatedCompletion: new Date(Date.now() + 30000).toISOString()
    };
  }

  async reprocessVerification(verificationId: string) {
    // Mock implementation - in production this would restart the verification process
    console.log(`Reprocessing verification ${verificationId}`);
  }

  async getDiscrepancyAlerts() {
    // Mock implementation - in production this would query alerts database
    return [
      {
        id: 'ALERT001',
        verificationId: 'VER001',
        applicantName: 'Sarah Johnson',
        documentType: 'drivers_license',
        department: 'Compliance',
        severity: 'critical',
        field: 'license_number',
        documentValue: 'NSW123456789',
        systemValue: 'NSW123456790',
        message: 'Critical: Driver license number mismatch detected - may indicate document fraud',
        createdAt: '2025-01-03T10:05:00.000Z',
        resolved: false,
        assignedTo: 'Compliance Manager',
        autoGenerated: true
      },
      {
        id: 'ALERT002',
        verificationId: 'VER001',
        applicantName: 'Sarah Johnson',
        documentType: 'drivers_license',
        department: 'HR',
        severity: 'medium',
        field: 'full_name',
        documentValue: 'Sarah M Johnson',
        systemValue: 'Sarah Johnson',
        message: 'Name variation detected - middle initial present in document but not in system',
        createdAt: '2025-01-03T10:05:00.000Z',
        resolved: false,
        assignedTo: 'HR Coordinator',
        autoGenerated: true
      },
      {
        id: 'ALERT003',
        verificationId: 'VER004',
        applicantName: 'James Wilson',
        documentType: 'qualification',
        department: 'HR',
        severity: 'high',
        field: 'qualification_level',
        documentValue: 'Certificate III in Individual Support',
        systemValue: 'Certificate IV in Disability Support',
        message: 'Qualification level mismatch - lower level than required for position',
        createdAt: '2025-01-03T15:20:00.000Z',
        resolved: false,
        assignedTo: 'HR Manager',
        autoGenerated: true
      },
      {
        id: 'ALERT004',
        verificationId: 'VER005',
        applicantName: 'Lisa Anderson',
        documentType: 'ndis_screening',
        department: 'Compliance',
        severity: 'critical',
        field: 'expiry_date',
        documentValue: '2024-12-31',
        systemValue: '2026-12-31',
        message: 'CRITICAL: NDIS screening check has expired - immediate action required',
        createdAt: '2025-01-03T16:45:00.000Z',
        resolved: false,
        assignedTo: 'Compliance Officer',
        autoGenerated: true
      },
      {
        id: 'ALERT005',
        verificationId: 'VER002',
        applicantName: 'Michael Chen',
        documentType: 'ndis_screening',
        department: 'Compliance',
        severity: 'low',
        field: 'address',
        documentValue: '456 George St, Sydney NSW 2000',
        systemValue: '456 George Street, Sydney NSW 2000',
        message: 'Minor address format difference detected',
        createdAt: '2025-01-02T11:35:00.000Z',
        resolved: true,
        assignedTo: 'Compliance Officer',
        resolvedBy: 'Compliance Officer',
        resolvedAt: '2025-01-02T14:20:00.000Z',
        resolutionNotes: 'Verified as same address, just different formatting. Updated system record to match.',
        autoGenerated: true
      }
    ];
  }

  async getDepartmentSummaries() {
    // Mock implementation - in production this would calculate from alerts database
    return [
      {
        department: 'HR',
        totalAlerts: 15,
        highPriority: 2,
        unresolved: 8,
        averageResolutionTime: 4.5,
        lastActivity: '2025-01-03T15:20:00.000Z'
      },
      {
        department: 'Compliance',
        totalAlerts: 12,
        highPriority: 3,
        unresolved: 6,
        averageResolutionTime: 2.8,
        lastActivity: '2025-01-03T16:45:00.000Z'
      },
      {
        department: 'Finance',
        totalAlerts: 8,
        highPriority: 1,
        unresolved: 3,
        averageResolutionTime: 6.2,
        lastActivity: '2025-01-03T09:15:00.000Z'
      },
      {
        department: 'Service Delivery',
        totalAlerts: 5,
        highPriority: 0,
        unresolved: 2,
        averageResolutionTime: 3.1,
        lastActivity: '2025-01-03T11:30:00.000Z'
      }
    ];
  }

  async resolveDiscrepancyAlert(alertId: string, resolutionNotes: string) {
    // Mock implementation - in production this would update alerts database
    console.log(`Alert ${alertId} resolved with notes: ${resolutionNotes}`);
  }

  async assignDiscrepancyAlert(alertId: string, assignedTo: string) {
    // Mock implementation - in production this would update alerts database
    console.log(`Alert ${alertId} assigned to: ${assignedTo}`);
  }

  // Website Application Auto-Import Methods
  async getWebsiteApplications() {
    // Mock implementation - in production this would query applications database
    return [
      {
        id: 'WEB001',
        websiteSource: 'company-website.com.au',
        applicantName: 'Emma Thompson',
        email: 'emma.thompson@email.com',
        phone: '+61 4 1234 5678',
        position: 'Support Worker Level 2',
        submittedAt: '2025-01-03T16:30:00.000Z',
        status: 'pending_import',
        documents: [
          { name: 'resume.pdf', type: 'application/pdf', url: '/uploads/resume.pdf', size: 2048576 },
          { name: 'cover_letter.pdf', type: 'application/pdf', url: '/uploads/cover.pdf', size: 1024768 }
        ],
        applicationData: {
          experience: '2 years in disability support',
          availability: 'Full-time',
          transport: 'Own vehicle',
          certifications: ['First Aid', 'Certificate III in Individual Support']
        },
        autoImported: false,
        screeningStarted: false
      },
      {
        id: 'WEB002',
        websiteSource: 'seek.com.au',
        applicantName: 'David Park',
        email: 'david.park@email.com',
        phone: '+61 4 2345 6789',
        position: 'Team Coordinator',
        submittedAt: '2025-01-03T14:45:00.000Z',
        status: 'screening',
        documents: [
          { name: 'david_resume.pdf', type: 'application/pdf', url: '/uploads/david_resume.pdf', size: 3072000 },
          { name: 'qualification.jpg', type: 'image/jpeg', url: '/uploads/qual.jpg', size: 1536000 },
          { name: 'reference_letter.pdf', type: 'application/pdf', url: '/uploads/ref.pdf', size: 896000 }
        ],
        applicationData: {
          experience: '5 years team leadership',
          availability: 'Full-time',
          transport: 'Own vehicle + public transport',
          certifications: ['Certificate IV in Disability Support', 'Leadership Course']
        },
        autoImported: true,
        screeningStarted: true
      },
      {
        id: 'WEB003',
        websiteSource: 'company-website.com.au',
        applicantName: 'Sophie Martinez',
        email: 'sophie.martinez@email.com',
        phone: '+61 4 3456 7890',
        position: 'Community Access Coordinator',
        submittedAt: '2025-01-03T12:15:00.000Z',
        status: 'processed',
        documents: [
          { name: 'sophie_cv.pdf', type: 'application/pdf', url: '/uploads/sophie_cv.pdf', size: 2560000 },
          { name: 'community_work_portfolio.pdf', type: 'application/pdf', url: '/uploads/portfolio.pdf', size: 4096000 }
        ],
        applicationData: {
          experience: '3 years community support',
          availability: 'Part-time (20 hours)',
          transport: 'Own vehicle',
          certifications: ['Certificate IV in Community Services', 'Mental Health First Aid']
        },
        autoImported: true,
        screeningStarted: true
      },
      {
        id: 'WEB004',
        websiteSource: 'linkedin.com',
        applicantName: 'Mark Johnson',
        email: 'mark.johnson@email.com',
        phone: '+61 4 4567 8901',
        position: 'Support Worker Level 1',
        submittedAt: '2025-01-03T17:00:00.000Z',
        status: 'pending_import',
        documents: [
          { name: 'mark_resume.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', url: '/uploads/mark_resume.docx', size: 1792000 }
        ],
        applicationData: {
          experience: 'New graduate - eager to learn',
          availability: 'Part-time (15 hours)',
          transport: 'Public transport',
          certifications: ['Certificate III in Individual Support (studying)']
        },
        autoImported: false,
        screeningStarted: false
      }
    ];
  }

  async getImportConfiguration() {
    // Mock implementation - in production this would query configuration database
    return {
      enabled: true,
      websiteUrls: [
        'https://company-website.com.au/careers/apply',
        'https://seek.com.au/job-applications',
        'https://linkedin.com/jobs/applications'
      ],
      autoScreening: true,
      notificationEmails: [
        'hr@primacycare.com.au',
        'recruitment@primacycare.com.au'
      ],
      filterCriteria: {
        requiredFields: ['email', 'phone', 'experience'],
        minimumDocuments: 1,
        excludeKeywords: ['spam', 'test', 'demo']
      }
    };
  }

  async importWebsiteApplication(applicationId: string) {
    // Mock implementation - in production this would:
    // 1. Move application from website queue to main CMS
    // 2. Create participant record
    // 3. Download and store documents
    // 4. Start screening process if auto-screening enabled
    // 5. Send notifications to relevant teams
    
    console.log(`Importing website application ${applicationId}`);
    
    return {
      id: applicationId,
      imported: true,
      screeningStarted: true,
      notificationsSent: ['HR Team', 'Recruitment Manager']
    };
  }

  async bulkImportApplications(applicationIds: string[]) {
    // Mock implementation - in production this would process multiple applications
    console.log(`Bulk importing ${applicationIds.length} applications`);
    
    return {
      imported: applicationIds.length,
      failed: 0,
      details: applicationIds.map(id => ({ id, status: 'imported' }))
    };
  }

  async updateImportConfiguration(config: any) {
    // Mock implementation - in production this would update configuration database
    console.log('Updating import configuration:', config);
  }

  async receiveWebsiteApplication(applicationData: any) {
    // Mock implementation - in production this would:
    // 1. Validate incoming application data
    // 2. Store in website applications queue
    // 3. If auto-import enabled, immediately process
    // 4. Send confirmation email to applicant
    
    const applicationId = `WEB${Date.now()}`;
    console.log(`Received new website application ${applicationId} from ${applicationData.websiteSource}`);
    
    return {
      id: applicationId,
      status: 'received',
      autoImportScheduled: true
    };
  }

  // Candidate Invitation System Methods
  async getShortlistedCandidates() {
    // Mock implementation - in production this would query candidates database
    return [
      {
        id: 'CAND001',
        name: 'Emma Thompson',
        email: 'emma.thompson@email.com',
        phone: '+61 4 1234 5678',
        position: 'Support Worker Level 2',
        applicationSource: 'company-website.com.au',
        shortlistedAt: '2025-01-03T14:30:00.000Z',
        score: 87,
        status: 'shortlisted',
        preferredContact: 'email',
        invitationsSent: [],
        secureToken: 'secure_token_001',
        portalAccessed: false,
        lastPortalActivity: null
      },
      {
        id: 'CAND002',
        name: 'David Park',
        email: 'david.park@email.com',
        phone: '+61 4 2345 6789',
        position: 'Team Coordinator',
        applicationSource: 'seek.com.au',
        shortlistedAt: '2025-01-02T16:45:00.000Z',
        score: 92,
        status: 'portal_accessed',
        preferredContact: 'email',
        invitationsSent: [
          { channel: 'email', sentAt: '2025-01-03T09:00:00.000Z', status: 'clicked' },
          { channel: 'sms', sentAt: '2025-01-03T09:00:00.000Z', status: 'delivered' }
        ],
        secureToken: 'secure_token_002',
        portalAccessed: true,
        lastPortalActivity: '2025-01-03T15:30:00.000Z'
      },
      {
        id: 'CAND003',
        name: 'Sophie Martinez',
        email: 'sophie.martinez@email.com',
        phone: '+61 4 3456 7890',
        position: 'Community Access Coordinator',
        applicationSource: 'company-website.com.au',
        shortlistedAt: '2025-01-01T12:00:00.000Z',
        score: 89,
        status: 'documents_submitted',
        preferredContact: 'whatsapp',
        invitationsSent: [
          { channel: 'email', sentAt: '2025-01-02T10:00:00.000Z', status: 'read' },
          { channel: 'whatsapp', sentAt: '2025-01-02T10:05:00.000Z', status: 'clicked' }
        ],
        secureToken: 'secure_token_003',
        portalAccessed: true,
        lastPortalActivity: '2025-01-03T11:15:00.000Z'
      },
      {
        id: 'CAND004',
        name: 'Mark Johnson',
        email: 'mark.johnson@email.com',
        phone: '+61 4 4567 8901',
        position: 'Support Worker Level 1',
        applicationSource: 'linkedin.com',
        shortlistedAt: '2025-01-03T10:30:00.000Z',
        score: 78,
        status: 'invited',
        preferredContact: 'sms',
        invitationsSent: [
          { channel: 'email', sentAt: '2025-01-03T11:00:00.000Z', status: 'delivered' },
          { channel: 'sms', sentAt: '2025-01-03T11:00:00.000Z', status: 'sent' }
        ],
        secureToken: 'secure_token_004',
        portalAccessed: false,
        lastPortalActivity: null
      }
    ];
  }

  async getInvitationTemplates() {
    // Mock implementation - in production this would query templates database
    return [
      {
        id: 'TEMP001',
        name: 'Standard Invitation',
        subject: 'Next Steps in Your Application - Primacy Care Australia',
        emailContent: `Dear {{candidateName}},

Thank you for your interest in the {{position}} role at Primacy Care Australia.

We're pleased to inform you that you've been shortlisted and we'd like to invite you to complete the next stage of our recruitment process.

Please access your secure candidate portal using the link below:
{{portalLink}}

This portal will allow you to:
- Complete required documentation
- Upload additional documents
- Schedule your interview
- Access important information about the role

Your portal access will expire in 7 days, so please complete the requirements as soon as possible.

If you have any questions, please don't hesitate to contact our HR team.

Best regards,
Primacy Care Australia Recruitment Team`,
        smsContent: 'Hi {{candidateName}}, you\'ve been shortlisted for {{position}} at Primacy Care Australia! Complete your application here: {{portalLink}} (expires in 7 days)',
        whatsappContent: 'Congratulations {{candidateName}}! 🎉 You\'ve been shortlisted for the {{position}} role at Primacy Care Australia. Please complete your application via our secure portal: {{portalLink}} This link expires in 7 days. Contact us if you need assistance!',
        includeSecureLink: true,
        customFields: {
          supportContact: 'hr@primacycare.com.au',
          companyPhone: '+61 1800 PRIMACY'
        }
      },
      {
        id: 'TEMP002',
        name: 'Urgent Role Invitation',
        subject: 'Urgent: Complete Your Application - {{position}}',
        emailContent: `Dear {{candidateName}},

We have an urgent requirement for the {{position}} role and you've been shortlisted as a priority candidate.

Please complete your application immediately using this secure link:
{{portalLink}}

We aim to complete the hiring process within 48 hours for this position.

Thank you,
Primacy Care Australia`,
        smsContent: 'URGENT: {{candidateName}}, complete your {{position}} application now: {{portalLink}} We\'re hiring within 48hrs!',
        whatsappContent: '⚡ URGENT OPPORTUNITY: {{candidateName}}, you\'ve been priority shortlisted for {{position}}! Complete now: {{portalLink}} Hiring decision within 48 hours.',
        includeSecureLink: true,
        customFields: {}
      }
    ];
  }

  async sendCandidateInvitations(invitationData: any) {
    // Mock implementation - in production this would:
    // 1. Load invitation template
    // 2. Personalize content for each candidate
    // 3. Send via selected channels (email, SMS, WhatsApp)
    // 4. Generate secure portal links
    // 5. Track delivery status
    // 6. Schedule follow-ups if needed

    const { candidateIds, channels, templateId, customMessage, scheduledSend, sendDateTime } = invitationData;
    
    console.log(`Sending invitations to ${candidateIds.length} candidates via ${channels.join(', ')}`);
    console.log(`Template: ${templateId}, Scheduled: ${scheduledSend}, Custom message: ${customMessage ? 'Yes' : 'No'}`);
    
    // Simulate sending process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      sent: candidateIds.length,
      channels: channels,
      scheduled: scheduledSend,
      deliveryTracking: candidateIds.map(id => ({ candidateId: id, status: 'sent' }))
    };
  }

  async generateSecurePortalLink(candidateId: string) {
    // Mock implementation - in production this would:
    // 1. Generate cryptographically secure token
    // 2. Set expiration time (7 days)
    // 3. Store token-candidate mapping
    // 4. Return portal URL with token
    
    const secureToken = `secure_${candidateId}_${Date.now()}`;
    const portalUrl = `${process.env.REPLIT_URL || 'http://localhost:5000'}/applicant-portal?token=${secureToken}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    
    console.log(`Generated secure portal link for candidate ${candidateId}: ${portalUrl}`);
    
    return {
      portalUrl,
      expiresAt,
      token: secureToken
    };
  }

  // Applicant Portal Methods
  async authenticatePortalAccess(token: string) {
    // Mock implementation - in production this would:
    // 1. Validate token exists and hasn't expired
    // 2. Check if candidate is still eligible
    // 3. Log portal access attempt
    // 4. Update candidate status
    
    console.log(`Authenticating portal access with token: ${token}`);
    
    // Simulate token validation
    const isValid = token.startsWith('secure_');
    
    if (isValid) {
      console.log('Portal access authenticated successfully');
      return { valid: true, candidateId: token.split('_')[1] };
    } else {
      throw new Error('Invalid or expired token');
    }
  }

  async getApplicantPortalData(token: string) {
    // Mock implementation - in production this would:
    // 1. Validate token and get candidate ID
    // 2. Fetch candidate information
    // 3. Get required documents/forms
    // 4. Get current status and next steps
    // 5. Track portal access
    
    console.log(`Fetching portal data for token: ${token}`);
    
    return {
      candidate: {
        id: 'CAND001',
        name: 'Emma Thompson',
        email: 'emma.thompson@email.com',
        phone: '+61 4 1234 5678',
        position: 'Support Worker Level 2',
        applicationId: 'APP2025001',
        status: 'portal_accessed',
        invitedAt: '2025-01-03T09:00:00.000Z',
        portalExpiresAt: '2025-01-10T09:00:00.000Z'
      },
      requirements: [
        {
          id: 'REQ001',
          title: 'NDIS Worker Screening Check',
          description: 'Upload your current NDIS Worker Screening Check clearance',
          type: 'document',
          required: true,
          completed: false,
          dueDate: '2025-01-08T00:00:00.000Z',
          instructions: 'Please upload a clear photo or scan of your NDIS Worker Screening Check. Ensure all text is readable and the document is in date.'
        },
        {
          id: 'REQ002',
          title: 'Identity Verification',
          description: 'Verify your identity with official documents',
          type: 'verification',
          required: true,
          completed: false,
          instructions: 'Upload a photo of your driver\'s license or passport, plus a recent utility bill for address verification.'
        },
        {
          id: 'REQ003',
          title: 'Skills Assessment',
          description: 'Complete our online skills assessment',
          type: 'assessment',
          required: true,
          completed: false,
          instructions: 'This assessment takes approximately 30 minutes and covers disability support scenarios.'
        },
        {
          id: 'REQ004',
          title: 'Emergency Contact Information',
          description: 'Provide emergency contact details',
          type: 'form',
          required: true,
          completed: false,
          instructions: 'Fill in your emergency contact information including name, relationship, and phone number.'
        },
        {
          id: 'REQ005',
          title: 'Qualification Certificates',
          description: 'Upload relevant qualification certificates',
          type: 'document',
          required: false,
          completed: false,
          instructions: 'Upload any relevant certificates such as First Aid, Certificate III in Individual Support, etc.'
        }
      ],
      documents: [],
      nextSteps: [
        {
          id: 'STEP001',
          title: 'Document Review',
          description: 'Our team will review your submitted documents',
          status: 'pending'
        },
        {
          id: 'STEP002',
          title: 'Interview Scheduling',
          description: 'Schedule your final interview with the hiring manager',
          status: 'pending'
        },
        {
          id: 'STEP003',
          title: 'Reference Checks',
          description: 'We\'ll contact your nominated referees',
          status: 'pending'
        }
      ]
    };
  }

  async uploadApplicantDocument(documentData: any) {
    // Mock implementation - in production this would:
    // 1. Validate file type and size
    // 2. Scan for malware
    // 3. Upload to secure cloud storage
    // 4. Extract data using OCR if applicable
    // 5. Update requirement status
    // 6. Notify HR team for review
    
    const documentId = `DOC${Date.now()}`;
    console.log(`Document uploaded: ${documentId}`);
    
    return {
      documentId,
      status: 'uploaded',
      requirementCompleted: true
    };
  }

  async completePortalRequirement(token: string, requirementId: string) {
    // Mock implementation - in production this would:
    // 1. Validate token and requirement
    // 2. Mark requirement as completed
    // 3. Check if all requirements are completed
    // 4. Trigger next workflow stage if ready
    // 5. Send notifications
    
    console.log(`Completing requirement ${requirementId} for token ${token}`);
    
    return {
      completed: true,
      requirementId,
      allRequirementsCompleted: false,
      nextStep: 'Continue completing remaining requirements'
    };
  }

  // Enhanced Payroll System Methods
  async getSCHADSRates() {
    // Mock implementation - in production this would query SCHADS rates database
    return [
      {
        id: 'SCHADS_L2_1_CASUAL',
        level: 'Level 2.1',
        classification: 'Support Worker',
        streamType: 'social-community-disability',
        employmentType: 'casual',
        baseHourlyRate: '31.41',
        casualLoading: '0.25',
        saturdayRate: '1.5',
        sundayRate: '2.0',
        publicHolidayRate: '2.5',
        eveningRate: '1.125',
        nightRate: '1.15',
        overtime1Rate: '1.5',
        overtime2Rate: '2.0',
        brokenShiftAllowance: '24.30',
        sleeperAllowance: '86.20',
        onCallAllowance: '32.75',
        vehicleAllowancePerKm: '0.95',
        mealAllowance: '18.60',
        effectiveFrom: '2024-07-01',
        isActive: true
      },
      {
        id: 'SCHADS_L2_1_PARTTIME',
        level: 'Level 2.1',
        classification: 'Support Worker',
        streamType: 'social-community-disability',
        employmentType: 'part-time',
        baseHourlyRate: '25.13',
        casualLoading: '0.0',
        saturdayRate: '1.5',
        sundayRate: '2.0',
        publicHolidayRate: '2.5',
        eveningRate: '1.125',
        nightRate: '1.15',
        overtime1Rate: '1.5',
        overtime2Rate: '2.0',
        brokenShiftAllowance: '24.30',
        sleeperAllowance: '86.20',
        onCallAllowance: '32.75',
        vehicleAllowancePerKm: '0.95',
        mealAllowance: '18.60',
        effectiveFrom: '2024-07-01',
        isActive: true
      },
      {
        id: 'SCHADS_L3_CASUAL',
        level: 'Level 3',
        classification: 'Senior Support Worker',
        streamType: 'social-community-disability',
        employmentType: 'casual',
        baseHourlyRate: '32.95',
        casualLoading: '0.25',
        saturdayRate: '1.5',
        sundayRate: '2.0',
        publicHolidayRate: '2.5',
        eveningRate: '1.125',
        nightRate: '1.15',
        overtime1Rate: '1.5',
        overtime2Rate: '2.0',
        brokenShiftAllowance: '25.50',
        sleeperAllowance: '90.50',
        onCallAllowance: '34.30',
        vehicleAllowancePerKm: '0.95',
        mealAllowance: '18.60',
        effectiveFrom: '2024-07-01',
        isActive: true
      }
    ];
  }

  async createStaffPayrollRecord(payrollData: any) {
    // Mock implementation - in production this would insert into payroll database
    const payrollId = `PAY${Date.now()}`;
    console.log(`Created enhanced payroll record ${payrollId} for staff ${payrollData.staffId}`);
    
    return {
      id: payrollId,
      staffId: payrollData.staffId,
      payPeriodStart: payrollData.payPeriodStart,
      payPeriodEnd: payrollData.payPeriodEnd,
      grossPay: payrollData.grossPay,
      netPay: payrollData.netPay,
      breakdown: payrollData.breakdown,
      status: 'completed'
    };
  }

  // Price Guide Document Management Methods
  async getPriceGuideDocuments() {
    // Mock implementation - in production this would query the priceGuideDocuments table
    return [
      {
        id: 'schads-2024-1',
        documentType: 'schads',
        title: 'SCHADS Award - 2024 Pay Guide',
        version: '2024.1',
        effectiveDate: '2024-07-01',
        uploadDate: '2024-06-15T00:00:00Z',
        fileUrl: '/mock-documents/schads-2024.1.pdf',
        fileName: 'schads-award-2024.1.pdf',
        fileSize: 2048000,
        isActive: true,
        uploadedBy: 'system',
        description: 'Updated SCHADS Award rates effective July 1, 2024',
        ratesExtracted: true,
        extractedRatesCount: 15
      },
      {
        id: 'ndis-2024-1',
        documentType: 'ndis',
        title: 'NDIS Price Guide - 2024-25',
        version: '2024-25',
        effectiveDate: '2024-07-01',
        uploadDate: '2024-06-20T00:00:00Z',
        fileUrl: '/mock-documents/ndis-price-guide-2024-25.pdf',
        fileName: 'ndis-price-guide-2024-25.pdf',
        fileSize: 5120000,
        isActive: true,
        uploadedBy: 'system',
        description: 'NDIS Price Guide and Limits 2024-25',
        ratesExtracted: true,
        extractedRatesCount: 150
      },
      {
        id: 'schads-2025-1',
        documentType: 'schads',
        title: 'SCHADS Award - 2025 Draft',
        version: '2025.1-draft',
        effectiveDate: '2025-01-01',
        uploadDate: '2024-12-01T00:00:00Z',
        fileUrl: '/mock-documents/schads-2025.1-draft.pdf',
        fileName: 'schads-award-2025.1-draft.pdf',
        fileSize: 1800000,
        isActive: false,
        uploadedBy: 'system',
        description: 'Draft SCHADS Award rates for 2025 - pending approval',
        ratesExtracted: false,
        extractedRatesCount: 0
      }
    ];
  }

  async uploadPriceGuideDocument(documentData: any) {
    // Mock implementation - in production this would:
    // 1. Upload file to Google Cloud Storage
    // 2. Insert record into priceGuideDocuments table
    // 3. Optionally trigger automatic rate extraction via OCR/AI
    
    const documentId = `${documentData.documentType}-${Date.now()}`;
    console.log(`Uploaded price guide document ${documentId}`);
    
    // Simulate rate extraction for certain document types
    const shouldExtractRates = documentData.documentType === 'schads';
    const extractedRatesCount = shouldExtractRates ? Math.floor(Math.random() * 20) + 10 : 0;
    
    return {
      id: documentId,
      title: `${documentData.documentType.toUpperCase()} - ${documentData.version}`,
      documentType: documentData.documentType,
      version: documentData.version,
      effectiveDate: documentData.effectiveDate,
      uploadDate: new Date().toISOString(),
      fileUrl: documentData.fileUrl,
      fileName: documentData.fileName,
      fileSize: documentData.fileSize,
      isActive: false,
      uploadedBy: documentData.uploadedBy,
      description: documentData.description,
      ratesExtracted: shouldExtractRates,
      extractedRatesCount
    };
  }

  async activatePriceGuideDocument(documentId: string) {
    // Mock implementation - in production this would:
    // 1. Set isActive = false for all other documents of same type
    // 2. Set isActive = true for this document
    // 3. Update current rates in system from extracted rates
    // 4. Create audit log of rate changes
    
    console.log(`Activating price guide document ${documentId}`);
    console.log('Deactivating other documents of same type');
    console.log('Updating system rates from document');
    console.log('Creating rate change audit log');
    
    return {
      activated: true,
      previousActiveDocument: 'previous-doc-id',
      ratesUpdated: true,
      auditLogId: `AUDIT-${Date.now()}`
    };
  }

  async extractRatesFromDocument(documentId: string) {
    // Mock implementation - in production this would:
    // 1. Use OCR to scan document
    // 2. Use AI/ML to identify rate tables
    // 3. Parse and validate extracted rates
    // 4. Store rates in structured format
    // 5. Create extraction log
    
    console.log(`Extracting rates from document ${documentId}`);
    
    // Simulate extraction process
    const extractedRatesCount = Math.floor(Math.random() * 25) + 15;
    
    const extractionLog = {
      timestamp: new Date().toISOString(),
      method: 'OCR + AI',
      pagesProcessed: 45,
      tablesFound: 8,
      ratesExtracted: extractedRatesCount,
      confidence: 0.95,
      warnings: [
        'Some table formatting required manual review',
        'Regional variations detected and processed'
      ],
      successRate: '96%'
    };
    
    return {
      extractedRatesCount,
      extractionLog,
      success: true
    };
  }

  async deletePriceGuideDocument(documentId: string) {
    // Mock implementation - in production this would:
    // 1. Check if document is currently active (prevent deletion)
    // 2. Remove file from Google Cloud Storage
    // 3. Delete record from database
    // 4. Create deletion audit log
    
    console.log(`Deleting price guide document ${documentId}`);
    console.log('Removing file from cloud storage');
    console.log('Creating deletion audit log');
    
    return {
      deleted: true,
      fileRemoved: true,
      auditLogId: `DELETE-AUDIT-${Date.now()}`
    };
  }

  // Staff Offboarding Management Methods
  async getOffboardingCases() {
    // Mock implementation - in production this would query the offboardingCases table
    return [
      {
        id: 'case-001',
        staffId: 'staff-123',
        staffName: 'Sarah Johnson',
        department: 'Service Delivery',
        position: 'Support Coordinator',
        resignationDate: '2025-01-15',
        lastWorkingDay: '2025-02-15',
        resignationReason: 'Career advancement opportunity at another organization',
        resignationType: 'voluntary',
        noticePeriod: 4,
        exitSurveyCompleted: false,
        offboardingStatus: 'in_progress',
        assignedHR: 'hr-manager-001',
        completionPercentage: 65,
        createdAt: '2025-01-15T00:00:00Z'
      },
      {
        id: 'case-002',
        staffId: 'staff-456',
        staffName: 'Michael Chen',
        department: 'Finance',
        position: 'Finance Officer',
        resignationDate: '2025-01-20',
        lastWorkingDay: '2025-02-28',
        resignationReason: 'Returning to university for further studies',
        resignationType: 'voluntary',
        noticePeriod: 6,
        exitSurveyCompleted: true,
        offboardingStatus: 'in_progress',
        assignedHR: 'hr-manager-001',
        completionPercentage: 85,
        createdAt: '2025-01-20T00:00:00Z'
      },
      {
        id: 'case-003',
        staffId: 'staff-789',
        staffName: 'Emma Wilson',
        department: 'HR',
        position: 'HR Coordinator',
        resignationDate: '2024-12-01',
        lastWorkingDay: '2024-12-20',
        resignationReason: 'Work-life balance and family commitments',
        resignationType: 'voluntary',
        noticePeriod: 3,
        exitSurveyCompleted: true,
        offboardingStatus: 'completed',
        assignedHR: 'hr-manager-001',
        completionPercentage: 100,
        createdAt: '2024-12-01T00:00:00Z'
      }
    ];
  }

  async createOffboardingCase(caseData: any) {
    // Mock implementation - in production this would:
    // 1. Insert into offboardingCases table
    // 2. Generate standard offboarding tasks
    // 3. Send notifications to relevant departments
    // 4. Create knowledge transfer templates
    
    const caseId = `CASE-${Date.now()}`;
    console.log(`Created offboarding case ${caseId} for staff ${caseData.staffId}`);
    
    // Auto-generate standard offboarding tasks
    await this.generateOffboardingTasks(caseId);
    
    return {
      id: caseId,
      staffId: caseData.staffId,
      resignationDate: caseData.resignationDate,
      lastWorkingDay: caseData.lastWorkingDay,
      resignationReason: caseData.resignationReason,
      resignationType: caseData.resignationType,
      noticePeriod: caseData.noticePeriod,
      offboardingStatus: 'initiated',
      assignedHR: caseData.assignedHR,
      completionPercentage: 0,
      createdAt: new Date().toISOString()
    };
  }

  async generateOffboardingTasks(caseId: string) {
    // Mock implementation - standard offboarding task templates
    const standardTasks = [
      // HR Tasks
      { category: 'HR', task: 'Send exit survey invitation', priority: 'high', dueOffset: 1 },
      { category: 'HR', task: 'Schedule exit interview', priority: 'high', dueOffset: 3 },
      { category: 'HR', task: 'Update personnel records', priority: 'medium', dueOffset: 7 },
      { category: 'HR', task: 'Process final pay and entitlements', priority: 'high', dueOffset: 14 },
      { category: 'HR', task: 'Update organization chart', priority: 'low', dueOffset: 30 },
      
      // IT Tasks
      { category: 'IT', task: 'Revoke system access and accounts', priority: 'high', dueOffset: 1 },
      { category: 'IT', task: 'Collect company devices and equipment', priority: 'high', dueOffset: 2 },
      { category: 'IT', task: 'Transfer email and file access', priority: 'medium', dueOffset: 5 },
      { category: 'IT', task: 'Disable security cards and access codes', priority: 'high', dueOffset: 1 },
      
      // Manager Tasks
      { category: 'Manager', task: 'Conduct handover sessions', priority: 'high', dueOffset: 7 },
      { category: 'Manager', task: 'Document knowledge transfer', priority: 'high', dueOffset: 10 },
      { category: 'Manager', task: 'Redistribute workload', priority: 'medium', dueOffset: 14 },
      { category: 'Manager', task: 'Update client relationships', priority: 'medium', dueOffset: 7 },
      
      // Finance Tasks
      { category: 'Finance', task: 'Calculate final pay and leave entitlements', priority: 'high', dueOffset: 7 },
      { category: 'Finance', task: 'Update payroll systems', priority: 'medium', dueOffset: 14 },
      { category: 'Finance', task: 'Process expense claims', priority: 'medium', dueOffset: 5 },
      
      // Compliance Tasks
      { category: 'Compliance', task: 'Update NDIS worker screening', priority: 'medium', dueOffset: 30 },
      { category: 'Compliance', task: 'Update professional registrations', priority: 'low', dueOffset: 30 },
      { category: 'Compliance', task: 'Archive compliance documents', priority: 'low', dueOffset: 60 }
    ];

    console.log(`Generated ${standardTasks.length} offboarding tasks for case ${caseId}`);
    return standardTasks;
  }

  async getOffboardingTasks(caseId: string) {
    // Mock implementation - in production this would query offboardingTasks table
    return [
      {
        id: 'task-001',
        category: 'HR',
        task: 'Send exit survey invitation',
        assignedTo: 'hr-manager-001',
        dueDate: '2025-01-16',
        completed: true,
        completedAt: '2025-01-15T10:00:00Z',
        completedBy: 'hr-manager-001',
        notes: 'Exit survey sent via email with secure link'
      },
      {
        id: 'task-002',
        category: 'HR',
        task: 'Schedule exit interview',
        assignedTo: 'hr-manager-001',
        dueDate: '2025-01-18',
        completed: true,
        completedAt: '2025-01-17T14:30:00Z',
        completedBy: 'hr-manager-001',
        notes: 'Exit interview scheduled for January 25th at 2:00 PM'
      },
      {
        id: 'task-003',
        category: 'IT',
        task: 'Revoke system access and accounts',
        assignedTo: 'it-admin-001',
        dueDate: '2025-02-15',
        completed: false,
        notes: 'To be completed on last working day'
      },
      {
        id: 'task-004',
        category: 'IT',
        task: 'Collect company devices and equipment',
        assignedTo: 'it-admin-001',
        dueDate: '2025-02-14',
        completed: false,
        notes: 'Laptop, mobile phone, access card to be returned'
      },
      {
        id: 'task-005',
        category: 'Manager',
        task: 'Conduct handover sessions',
        assignedTo: 'manager-001',
        dueDate: '2025-02-10',
        completed: false,
        notes: 'Schedule 3 handover sessions with replacement staff'
      },
      {
        id: 'task-006',
        category: 'Finance',
        task: 'Calculate final pay and leave entitlements',
        assignedTo: 'finance-officer-001',
        dueDate: '2025-02-12',
        completed: false,
        notes: 'Include accrued annual leave and long service leave'
      }
    ];
  }

  async completeOffboardingTask(taskId: string, completedBy: string, notes?: string) {
    // Mock implementation - in production this would:
    // 1. Update task completion status
    // 2. Update offboarding case completion percentage
    // 3. Send notifications if needed
    // 4. Trigger dependent tasks
    
    console.log(`Completed offboarding task ${taskId} by ${completedBy}`);
    console.log(`Notes: ${notes || 'No notes provided'}`);
    
    return {
      completed: true,
      completedAt: new Date().toISOString(),
      completedBy,
      notes
    };
  }

  async getExitSurveys() {
    // Mock implementation - in production this would query exitSurveys table
    return [
      {
        id: 'survey-001',
        staffId: 'staff-456',
        overallSatisfaction: 4,
        reasonForLeaving: 'Better career opportunity',
        workEnvironmentRating: 4,
        managementRating: 3,
        careerDevelopmentRating: 3,
        compensationRating: 4,
        workLifeBalanceRating: 2,
        wouldRecommendCompany: true,
        improvementSuggestions: 'More flexible working arrangements and better career development pathways',
        additionalComments: 'Overall good experience, but work-life balance could be improved',
        submittedAt: '2025-01-22T09:30:00Z'
      },
      {
        id: 'survey-002',
        staffId: 'staff-789',
        overallSatisfaction: 5,
        reasonForLeaving: 'Personal/family reasons',
        workEnvironmentRating: 5,
        managementRating: 5,
        careerDevelopmentRating: 4,
        compensationRating: 4,
        workLifeBalanceRating: 3,
        wouldRecommendCompany: true,
        improvementSuggestions: 'Continue focus on professional development and team building',
        additionalComments: 'Excellent team and management. Leaving due to family commitments only.',
        submittedAt: '2024-12-15T16:45:00Z'
      },
      {
        id: 'survey-003',
        staffId: 'staff-321',
        overallSatisfaction: 2,
        reasonForLeaving: 'Management or leadership issues',
        workEnvironmentRating: 2,
        managementRating: 1,
        careerDevelopmentRating: 2,
        compensationRating: 3,
        workLifeBalanceRating: 2,
        wouldRecommendCompany: false,
        improvementSuggestions: 'Better communication from management, clearer expectations, and more support for staff',
        additionalComments: 'Management needs significant improvement in communication and staff support',
        submittedAt: '2024-12-10T11:20:00Z'
      }
    ];
  }

  async submitExitSurvey(surveyData: any) {
    // Mock implementation - in production this would:
    // 1. Insert into exitSurveys table
    // 2. Update offboarding case status
    // 3. Generate analytics insights
    // 4. Send confirmation to HR
    
    const surveyId = `SURVEY-${Date.now()}`;
    console.log(`Submitted exit survey ${surveyId} for staff ${surveyData.staffId}`);
    
    return {
      id: surveyId,
      staffId: surveyData.staffId,
      submittedAt: new Date().toISOString(),
      processed: true
    };
  }

  async sendExitSurveyInvitation(staffId: string) {
    // Mock implementation - in production this would:
    // 1. Generate secure survey link
    // 2. Send email invitation
    // 3. Log invitation sent
    // 4. Set reminder follow-ups
    
    const invitationId = `INV-${Date.now()}`;
    console.log(`Sent exit survey invitation ${invitationId} to staff ${staffId}`);
    
    return {
      sent: true,
      invitationId,
      surveyLink: `https://primacycare.replit.app/exit-survey/${invitationId}`,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
    };
  }

  // Participant Offboarding Management Methods
  async getParticipantOffboardingCases() {
    // Mock implementation - in production this would query participantOffboardingCases table
    return [
      {
        id: 'participant-case-001',
        participantId: 'participant-123',
        participantName: 'Emma Thompson',
        ndisNumber: '4321098765',
        exitDate: '2025-02-01',
        exitReason: 'NDIS plan ended and participant moving to new provider',
        exitType: 'plan_ended',
        finalShiftDate: '2025-01-31',
        finalInvoiceCompleted: false,
        clientSurveyCompleted: false,
        offboardingStatus: 'invoicing',
        assignedCoordinator: 'coordinator-001',
        completionPercentage: 45,
        outstandingAmount: 2450.00,
        createdAt: '2025-01-20T00:00:00Z'
      },
      {
        id: 'participant-case-002',
        participantId: 'participant-456',
        participantName: 'David Chen',
        ndisNumber: '5678901234',
        exitDate: '2025-01-25',
        exitReason: 'Family moving interstate for work relocation',
        exitType: 'moved',
        finalShiftDate: '2025-01-24',
        finalInvoiceCompleted: true,
        clientSurveyCompleted: false,
        offboardingStatus: 'survey_pending',
        assignedCoordinator: 'coordinator-002',
        completionPercentage: 75,
        outstandingAmount: 0.00,
        createdAt: '2025-01-15T00:00:00Z'
      },
      {
        id: 'participant-case-003',
        participantId: 'participant-789',
        participantName: 'Sarah Williams',
        ndisNumber: '9012345678',
        exitDate: '2025-01-10',
        exitReason: 'Participant chose to change to different service provider',
        exitType: 'participant_choice',
        finalShiftDate: '2025-01-09',
        finalInvoiceCompleted: true,
        clientSurveyCompleted: true,
        offboardingStatus: 'completed',
        assignedCoordinator: 'coordinator-001',
        completionPercentage: 100,
        outstandingAmount: 0.00,
        createdAt: '2024-12-20T00:00:00Z'
      }
    ];
  }

  async createParticipantOffboardingCase(caseData: any) {
    // Mock implementation - in production this would:
    // 1. Insert into participantOffboardingCases table
    // 2. Generate final invoicing requirements
    // 3. Send notifications to service coordinators
    // 4. Update participant status
    // 5. Schedule exit survey
    
    const caseId = `PARTICIPANT-CASE-${Date.now()}`;
    console.log(`Created participant offboarding case ${caseId} for participant ${caseData.participantId}`);
    
    // Auto-calculate outstanding amounts and generate final invoice requirements
    await this.generateParticipantFinalInvoiceRequirements(caseId);
    
    return {
      id: caseId,
      participantId: caseData.participantId,
      exitDate: caseData.exitDate,
      exitReason: caseData.exitReason,
      exitType: caseData.exitType,
      finalShiftDate: caseData.finalShiftDate,
      offboardingStatus: 'initiated',
      assignedCoordinator: caseData.assignedCoordinator,
      completionPercentage: 0,
      outstandingAmount: 0,
      createdAt: new Date().toISOString()
    };
  }

  async generateParticipantFinalInvoiceRequirements(caseId: string) {
    // Mock implementation - calculate outstanding hours and amounts
    const mockOutstandingHours = Math.floor(Math.random() * 50) + 10;
    const mockHourlyRate = 65.50;
    const mockOutstandingAmount = mockOutstandingHours * mockHourlyRate;
    
    console.log(`Generated final invoice requirements for case ${caseId}`);
    console.log(`Outstanding hours: ${mockOutstandingHours}, Amount: $${mockOutstandingAmount}`);
    
    return {
      outstandingHours: mockOutstandingHours,
      outstandingAmount: mockOutstandingAmount,
      requiresNDISClaim: true
    };
  }

  async getClientExitSurveys() {
    // Mock implementation - in production this would query clientExitSurveys table
    return [
      {
        id: 'client-survey-001',
        participantId: 'participant-789',
        overallSatisfaction: 5,
        serviceQualityRating: 5,
        staffProfessionalismRating: 5,
        communicationRating: 4,
        valueForMoneyRating: 4,
        goalAchievementRating: 5,
        wouldRecommendService: true,
        reasonForLeaving: 'Participant chose to change to different service provider',
        improvementSuggestions: 'More flexible scheduling options would be helpful',
        additionalComments: 'Overall excellent service. Staff were very professional and caring. Only leaving due to personal preference for local provider.',
        completedBy: 'participant',
        submittedAt: '2025-01-12T14:30:00Z'
      },
      {
        id: 'client-survey-002',
        participantId: 'participant-321',
        overallSatisfaction: 3,
        serviceQualityRating: 3,
        staffProfessionalismRating: 4,
        communicationRating: 2,
        valueForMoneyRating: 3,
        goalAchievementRating: 2,
        wouldRecommendService: false,
        reasonForLeaving: 'Dissatisfied with service quality',
        improvementSuggestions: 'Better communication between office staff and participants. More consistent support workers.',
        additionalComments: 'Support workers were good but too much staff turnover. Office communication needs improvement.',
        completedBy: 'guardian',
        submittedAt: '2024-12-08T16:45:00Z'
      },
      {
        id: 'client-survey-003',
        participantId: 'participant-654',
        overallSatisfaction: 4,
        serviceQualityRating: 4,
        staffProfessionalismRating: 5,
        communicationRating: 4,
        valueForMoneyRating: 4,
        goalAchievementRating: 4,
        wouldRecommendService: true,
        reasonForLeaving: 'NDIS plan ended',
        improvementSuggestions: 'Continue the excellent work. Maybe more group activities.',
        additionalComments: 'Great experience overall. Thank you for all the support provided.',
        completedBy: 'participant',
        submittedAt: '2024-11-25T11:20:00Z'
      }
    ];
  }

  async submitClientExitSurvey(surveyData: any) {
    // Mock implementation - in production this would:
    // 1. Insert into clientExitSurveys table
    // 2. Update offboarding case status
    // 3. Generate analytics insights
    // 4. Send confirmation to service coordinator
    
    const surveyId = `CLIENT-SURVEY-${Date.now()}`;
    console.log(`Submitted client exit survey ${surveyId} for participant ${surveyData.participantId}`);
    
    return {
      id: surveyId,
      participantId: surveyData.participantId,
      submittedAt: new Date().toISOString(),
      processed: true
    };
  }

  async getParticipantFinalInvoicing() {
    // Mock implementation - in production this would query participantFinalInvoicing table
    return [
      {
        id: 'final-invoice-001',
        participantId: 'participant-123',
        finalShiftDate: '2025-01-31',
        totalOutstandingHours: 35.5,
        totalOutstandingAmount: 2324.75,
        invoiceGenerated: false,
        invoiceNumber: null,
        ndisClaimSubmitted: false,
        paidInFull: false,
        reconciliationComplete: false
      },
      {
        id: 'final-invoice-002',
        participantId: 'participant-456',
        finalShiftDate: '2025-01-24',
        totalOutstandingHours: 28.0,
        totalOutstandingAmount: 1834.00,
        invoiceGenerated: true,
        invoiceNumber: 'INV-2025-001234',
        ndisClaimSubmitted: true,
        paidInFull: true,
        reconciliationComplete: true
      },
      {
        id: 'final-invoice-003',
        participantId: 'participant-789',
        finalShiftDate: '2025-01-09',
        totalOutstandingHours: 42.0,
        totalOutstandingAmount: 2751.00,
        invoiceGenerated: true,
        invoiceNumber: 'INV-2025-001189',
        ndisClaimSubmitted: true,
        paidInFull: true,
        reconciliationComplete: true
      }
    ];
  }

  async generateParticipantFinalInvoice(participantId: string) {
    // Mock implementation - in production this would:
    // 1. Calculate final hours and amounts from shifts
    // 2. Generate invoice with NDIS line items
    // 3. Submit NDIS claim automatically
    // 4. Update participant offboarding status
    // 5. Send invoice to participant/guardian
    
    const invoiceId = `FINAL-INV-${Date.now()}`;
    const invoiceNumber = `INV-2025-${String(Date.now()).slice(-6)}`;
    const amount = Math.floor(Math.random() * 3000) + 1000;
    
    console.log(`Generated final invoice ${invoiceNumber} for participant ${participantId}`);
    console.log(`Invoice amount: $${amount}`);
    console.log('Submitting NDIS claim automatically...');
    
    return {
      invoiceId,
      invoiceNumber,
      amount,
      ndisClaimSubmitted: true,
      claimReference: `NDIS-CLAIM-${Date.now()}`
    };
  }

  async sendClientExitSurvey(participantId: string) {
    // Mock implementation - in production this would:
    // 1. Generate secure survey link
    // 2. Send email/SMS to participant/guardian
    // 3. Log invitation sent
    // 4. Set reminder follow-ups
    // 5. Update offboarding case status
    
    const invitationId = `CLIENT-INV-${Date.now()}`;
    console.log(`Sent client exit survey invitation ${invitationId} to participant ${participantId}`);
    
    return {
      sent: true,
      invitationId,
      surveyLink: `https://primacycare.replit.app/client-exit-survey/${invitationId}`,
      expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString() // 21 days
    };
  }

  // Staff Availability Management Methods
  async getStaffAvailability(params: { staffId?: string; date?: string; period?: string }) {
    // Mock implementation - in production this would query staffAvailabilitySchedules table
    const mockAvailability = [
      {
        id: 'avail-001',
        staffId: '48f8aa1c-2163-4eda-b7b4-dbadd61883be',
        staffName: 'Sarah Johnson',
        employmentType: 'casual',
        date: '2025-02-03',
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '15:00',
        isAvailable: true,
        isRecurring: true,
        recurringPattern: 'weekly',
        submissionPeriod: '2025-02-03_2025-02-16',
        lastSubmitted: '2025-01-30T10:00:00Z',
        isEditable: true,
        createdAt: '2025-01-30T10:00:00Z'
      },
      {
        id: 'avail-002',
        staffId: '48f8aa1c-2163-4eda-b7b4-dbadd61883be',
        staffName: 'Sarah Johnson',
        employmentType: 'casual',
        date: '2025-02-03',
        dayOfWeek: 1,
        startTime: '18:00',
        endTime: '21:00',
        isAvailable: false,
        unavailabilityReason: 'University classes',
        isRecurring: true,
        recurringPattern: 'weekly',
        submissionPeriod: '2025-02-03_2025-02-16',
        lastSubmitted: '2025-01-30T10:00:00Z',
        isEditable: true,
        createdAt: '2025-01-30T10:00:00Z'
      },
      {
        id: 'avail-003',
        staffId: 'staff-casual-002',
        staffName: 'Mike Chen',
        employmentType: 'casual',
        date: '2025-02-03',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true,
        isRecurring: false,
        submissionPeriod: '2025-02-03_2025-02-16',
        lastSubmitted: '2025-01-31T14:00:00Z',
        isEditable: true,
        createdAt: '2025-01-31T14:00:00Z'
      },
      {
        id: 'avail-004',
        staffId: 'staff-permanent-001',
        staffName: 'Emma Davis',
        employmentType: 'permanent',
        date: '2025-02-03',
        dayOfWeek: 1,
        startTime: '07:00',
        endTime: '15:00',
        isAvailable: true,
        isRecurring: true,
        recurringPattern: 'weekly',
        submissionPeriod: '2025-02-03_2025-02-16',
        lastSubmitted: '2025-01-28T09:00:00Z',
        isEditable: false, // Permanent staff managed by roster
        createdAt: '2025-01-28T09:00:00Z'
      }
    ];

    // Filter based on parameters
    let filtered = mockAvailability;
    if (params.staffId && params.staffId !== 'all') {
      if (params.staffId === 'casual') {
        filtered = filtered.filter(a => a.employmentType === 'casual');
      } else if (params.staffId === 'permanent') {
        filtered = filtered.filter(a => a.employmentType === 'permanent');
      } else {
        filtered = filtered.filter(a => a.staffId === params.staffId);
      }
    }

    if (params.date) {
      filtered = filtered.filter(a => a.date === params.date);
    }

    if (params.period) {
      filtered = filtered.filter(a => a.submissionPeriod === params.period);
    }

    return filtered;
  }

  async updateStaffAvailability(availabilityData: any) {
    // Mock implementation - in production this would:
    // 1. Insert/update staffAvailabilitySchedules table
    // 2. Handle recurring patterns
    // 3. Validate against submission deadlines
    // 4. Send notifications if needed
    // 5. Update related shift assignments

    const availabilityId = `AVAIL-${Date.now()}`;
    console.log(`Updated staff availability ${availabilityId} for staff ${availabilityData.staffId}`);
    
    // Handle recurring patterns
    if (availabilityData.isRecurring) {
      console.log(`Setting up recurring availability pattern: ${availabilityData.recurringPattern}`);
    }

    return {
      id: availabilityId,
      staffId: availabilityData.staffId,
      date: availabilityData.date,
      isAvailable: availabilityData.isAvailable,
      updatedAt: new Date().toISOString()
    };
  }

  async getAvailabilitySubmissions(params: { period?: string; staffId?: string }) {
    // Mock implementation - in production this would query staffAvailabilitySubmissions table
    return [
      {
        id: 'sub-001',
        staffId: '48f8aa1c-2163-4eda-b7b4-dbadd61883be',
        staffName: 'Sarah Johnson',
        submissionPeriod: '2025-02-03_2025-02-16',
        startDate: '2025-02-03',
        endDate: '2025-02-16',
        submittedAt: '2025-01-30T10:00:00Z',
        status: 'submitted',
        totalAvailableHours: 84,
        totalUnavailableHours: 28,
        mandatorySubmission: true
      },
      {
        id: 'sub-002',
        staffId: 'staff-casual-002',
        staffName: 'Mike Chen',
        submissionPeriod: '2025-02-03_2025-02-16',
        startDate: '2025-02-03',
        endDate: '2025-02-16',
        submittedAt: '2025-01-31T14:00:00Z',
        status: 'submitted',
        totalAvailableHours: 112,
        totalUnavailableHours: 0,
        mandatorySubmission: true
      },
      {
        id: 'sub-003',
        staffId: 'staff-casual-003',
        staffName: 'Lisa Wong',
        submissionPeriod: '2025-02-03_2025-02-16',
        startDate: '2025-02-03',
        endDate: '2025-02-16',
        submittedAt: '2025-02-01T16:30:00Z',
        status: 'pending',
        totalAvailableHours: 56,
        totalUnavailableHours: 56,
        mandatorySubmission: true
      }
    ];
  }

  async submitFortnightlyAvailability(submissionData: any) {
    // Mock implementation - in production this would:
    // 1. Validate submission is within deadline
    // 2. Calculate total available/unavailable hours
    // 3. Insert into staffAvailabilitySubmissions table
    // 4. Update submission status
    // 5. Send confirmation notification
    // 6. Trigger auto-assignment if enabled

    const submissionId = `SUB-${Date.now()}`;
    console.log(`Submitted fortnightly availability ${submissionId} for staff ${submissionData.staffId}`);
    console.log(`Period: ${submissionData.period}`);
    
    // Calculate hours
    const mockAvailableHours = Math.floor(Math.random() * 80) + 40;
    const mockUnavailableHours = 112 - mockAvailableHours; // Total hours in fortnight
    
    console.log(`Total available hours: ${mockAvailableHours}, Unavailable: ${mockUnavailableHours}`);
    
    return {
      id: submissionId,
      staffId: submissionData.staffId,
      submissionPeriod: submissionData.period,
      totalAvailableHours: mockAvailableHours,
      totalUnavailableHours: mockUnavailableHours,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
  }

  async getShiftRequirements(params: { date?: string; staffId?: string; status?: string }) {
    // Mock implementation - in production this would query shiftRequirements table
    return [
      {
        id: 'shift-req-001',
        participantId: 'participant-123',
        participantName: 'John Smith',
        date: '2025-02-03',
        startTime: '09:00',
        endTime: '12:00',
        serviceType: 'Personal Care',
        requiredSkills: ['Personal Care', 'Medication Administration'],
        status: 'open',
        priority: 'normal',
        location: '123 Main St, Sydney NSW',
        estimatedDuration: 3.0,
        hourlyRate: 65.50
      },
      {
        id: 'shift-req-002',
        participantId: 'participant-456',
        participantName: 'Mary Johnson',
        date: '2025-02-03',
        startTime: '14:00',
        endTime: '16:00',
        serviceType: 'Community Access',
        requiredSkills: ['Community Access', 'Transport'],
        staffAssigned: '48f8aa1c-2163-4eda-b7b4-dbadd61883be',
        assignmentMethod: 'auto',
        status: 'assigned',
        priority: 'normal',
        location: 'Shopping Centre, Parramatta NSW',
        estimatedDuration: 2.0,
        hourlyRate: 58.25
      },
      {
        id: 'shift-req-003',
        participantId: 'participant-789',
        participantName: 'David Chen',
        date: '2025-02-03',
        startTime: '18:00',
        endTime: '21:00',
        serviceType: 'Social Participation',
        requiredSkills: ['Social Support'],
        status: 'open',
        priority: 'high',
        location: 'Community Centre, Melbourne VIC',
        specialInstructions: 'Participant has autism, requires calm approach',
        estimatedDuration: 3.0,
        hourlyRate: 62.75
      }
    ];
  }

  async bulkAssignStaffToShifts(assignmentData: any) {
    // Mock implementation - in production this would:
    // 1. Match available staff to shift requirements
    // 2. Consider skills, proximity, preferences
    // 3. Respect availability windows
    // 4. Update shift assignments
    // 5. Send notifications to staff
    // 6. Update availability schedules

    console.log(`Running bulk assignment for period ${assignmentData.period}`);
    
    if (assignmentData.autoAssign) {
      console.log('Running auto-assignment algorithm...');
      
      // Mock auto-assignment logic
      const assignmentsCreated = Math.floor(Math.random() * 5) + 3;
      const assignmentsFailed = Math.floor(Math.random() * 2);
      
      console.log(`Auto-assigned ${assignmentsCreated} shifts, ${assignmentsFailed} failed`);
      
      return {
        assignmentsCreated,
        assignmentsFailed,
        method: 'auto'
      };
    } else {
      // Manual assignment
      console.log(`Manually assigning staff ${assignmentData.staffId} to shift ${assignmentData.shiftId}`);
      
      return {
        assignmentsCreated: 1,
        assignmentsFailed: 0,
        method: 'manual'
      };
    }
  }

  async sendAvailabilityReminders(params: { period: string; reminderType: string }) {
    // Mock implementation - in production this would:
    // 1. Find staff who haven't submitted for period
    // 2. Check reminder history to avoid spam
    // 3. Send email/SMS notifications
    // 4. Log reminder in availabilityReminders table
    // 5. Schedule follow-up reminders

    console.log(`Sending ${params.reminderType} reminders for period ${params.period}`);
    
    const casualStaffCount = 15; // Mock casual staff count
    const submittedCount = 12; // Mock submitted count
    const remindersSent = casualStaffCount - submittedCount;
    
    console.log(`Sent ${remindersSent} reminders to casual staff who haven't submitted`);
    
    return {
      remindersSent,
      remindersSkipped: 0,
      period: params.period,
      reminderType: params.reminderType,
      sentAt: new Date().toISOString()
    };
  }
}

export const storage = new DatabaseStorage();
