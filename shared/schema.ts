import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("staff"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// NDIS-specific enums
export const planStatusEnum = pgEnum("plan_status", ["active", "inactive", "pending", "expired"]);
export const serviceStatusEnum = pgEnum("service_status", ["scheduled", "in_progress", "completed", "cancelled"]);
export const serviceCategoryEnum = pgEnum("service_category", [
  "core_supports",
  "capacity_building",
  "capital_supports",
  "assistance_with_daily_life",
  "transport",
  "consumables",
  "assistance_products",
  "home_modifications",
  "specialist_disability_accommodation"
]);

// Department enums
export const departmentEnum = pgEnum("department", ["intake", "hr_recruitment", "finance", "service_delivery", "compliance_quality"]);
export const agreementStatusEnum = pgEnum("agreement_status", ["draft", "pending", "active", "expired", "cancelled"]);
export const staffStatusEnum = pgEnum("staff_status", ["pending", "active", "on_leave", "terminated"]);
export const shiftStatusEnum = pgEnum("shift_status", ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]);
export const payrollStatusEnum = pgEnum("payroll_status", ["pending", "processed", "paid", "cancelled"]);
export const auditStatusEnum = pgEnum("audit_status", ["pending", "in_progress", "completed", "requires_action"]);
export const awardTypeEnum = pgEnum("award_type", ["schads", "healthcare", "general", "casual"]);
export const referralSourceEnum = pgEnum("referral_source", ["ndis_planner", "family", "healthcare_provider", "self_referral", "other"]);
export const qualificationStatusEnum = pgEnum("qualification_status", ["current", "expired", "pending_renewal"]);

// Role and permission enums
export const roleTypeEnum = pgEnum("role_type", ["super_admin", "admin", "manager", "supervisor", "staff", "support", "readonly"]);
export const permissionTypeEnum = pgEnum("permission_type", [
  "create", "read", "update", "delete", "approve", "manage_users", "view_reports", 
  "export_data", "system_settings", "financial_access", "clinical_access", "admin_tools"
]);

// NDIS Price Guide enums
export const ndisBudgetTypeEnum = pgEnum("ndis_budget_type", ["core_supports", "capacity_building", "capital_supports"]);
export const ndisGeographicAreaEnum = pgEnum("ndis_geographic_area", ["metropolitan", "regional", "remote", "very_remote"]);
export const ndisUnitTypeEnum = pgEnum("ndis_unit_type", ["hour", "day", "week", "month", "each", "km", "session", "assessment"]);
export const ndisSupportTypeEnum = pgEnum("ndis_support_type", ["individual", "group", "transport", "equipment", "consumable"]);
export const ndisRegistrationGroupEnum = pgEnum("ndis_registration_group", ["standard", "specialist", "early_childhood"]);

// Participants table
export const participants = pgTable("participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  ndisNumber: varchar("ndis_number").unique().notNull(),
  dateOfBirth: date("date_of_birth"),
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  primaryDisability: text("primary_disability"),
  communicationNeeds: text("communication_needs"),
  culturalBackground: text("cultural_background"),
  preferredLanguage: varchar("preferred_language").default("English"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// NDIS Plans table - Enhanced for plan document management
export const ndisPlans = pgTable("ndis_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  planNumber: varchar("plan_number").unique().notNull(),
  planVersion: varchar("plan_version").default("1.0"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reviewDate: date("review_date"),
  status: planStatusEnum("status").default("active"),
  totalBudget: decimal("total_budget", { precision: 12, scale: 2 }),
  coreSupportsbudget: decimal("core_supports_budget", { precision: 12, scale: 2 }),
  capacityBuildingBudget: decimal("capacity_building_budget", { precision: 12, scale: 2 }),
  capitalSupportsBudget: decimal("capital_supports_budget", { precision: 12, scale: 2 }),
  planManagerName: varchar("plan_manager_name"),
  planManagerContact: varchar("plan_manager_contact"),
  supportCoordinator: varchar("support_coordinator"),
  goals: text("goals"),
  documentsPath: text("documents_path"), // Path to uploaded plan documents
  extractedData: jsonb("extracted_data"), // Raw extracted plan data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff table
export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  employeeId: varchar("employee_id").unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").unique().notNull(),
  phone: varchar("phone"),
  position: varchar("position"),
  qualifications: text("qualifications"),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Services table
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  planId: varchar("plan_id").references(() => ndisPlans.id),
  staffId: varchar("staff_id").references(() => staff.id),
  serviceName: varchar("service_name").notNull(),
  serviceCategory: serviceCategoryEnum("service_category").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration"), // in minutes
  location: text("location"),
  status: serviceStatusEnum("status").default("scheduled"),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Progress Notes table
export const progressNotes = pgTable("progress_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  noteDate: timestamp("note_date").defaultNow(),
  goalProgress: text("goal_progress"),
  activities: text("activities"),
  outcomes: text("outcomes"),
  concerns: text("concerns"),
  nextSteps: text("next_steps"),
  participantFeedback: text("participant_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  planId: varchar("plan_id").references(() => ndisPlans.id),
  invoiceNumber: varchar("invoice_number").unique().notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  gst: decimal("gst", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }),
  status: varchar("status").default("pending"),
  paidDate: date("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice Line Items table
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 1. INTAKE DEPARTMENT TABLES

// Referrals table for intake management
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id),
  referralSource: referralSourceEnum("referral_source").notNull(),
  referrerName: varchar("referrer_name"),
  referrerContact: varchar("referrer_contact"),
  referralDate: date("referral_date").notNull(),
  status: varchar("status").default("pending"),
  priority: varchar("priority").default("standard"), // urgent, high, standard, low
  notes: text("notes"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Agreements table
export const serviceAgreements = pgTable("service_agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  planId: varchar("plan_id").references(() => ndisPlans.id),
  agreementNumber: varchar("agreement_number").unique().notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: agreementStatusEnum("status").default("draft"),
  servicesIncluded: text("services_included").array(),
  specialConditions: text("special_conditions"),
  renewalDate: date("renewal_date"),
  createdBy: varchar("created_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. HR & RECRUITMENT DEPARTMENT TABLES

// Staff Qualifications table
export const staffQualifications = pgTable("staff_qualifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  qualificationType: varchar("qualification_type").notNull(),
  qualificationName: varchar("qualification_name").notNull(),
  issuingBody: varchar("issuing_body"),
  dateObtained: date("date_obtained"),
  expiryDate: date("expiry_date"),
  status: qualificationStatusEnum("status").default("current"),
  documentUrl: varchar("document_url"),
  verificationNotes: text("verification_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Performance Reviews table
export const performanceReviews = pgTable("performance_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  reviewPeriodStart: date("review_period_start").notNull(),
  reviewPeriodEnd: date("review_period_end").notNull(),
  reviewDate: date("review_date").notNull(),
  reviewedBy: varchar("reviewed_by").references(() => users.id).notNull(),
  overallRating: integer("overall_rating"), // 1-5 scale
  performanceGoals: text("performance_goals"),
  achievements: text("achievements"),
  areasForImprovement: text("areas_for_improvement"),
  nextReviewDate: date("next_review_date"),
  status: varchar("status").default("draft"), // draft, completed, approved
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 3. FINANCE DEPARTMENT TABLES

// Award Rates table (SCHADS and other awards)
export const awardRates = pgTable("award_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  awardType: awardTypeEnum("award_type").notNull(),
  level: varchar("level").notNull(), // e.g., Level 1, Level 2, etc.
  classification: varchar("classification"), // e.g., Support Worker, Team Leader
  baseHourlyRate: decimal("base_hourly_rate", { precision: 8, scale: 2 }).notNull(),
  casualLoading: decimal("casual_loading", { precision: 5, scale: 2 }).default("0.25"), // 25% casual loading
  weekendRate: decimal("weekend_rate", { precision: 5, scale: 2 }).default("1.5"), // 150%
  publicHolidayRate: decimal("public_holiday_rate", { precision: 5, scale: 2 }).default("2.0"), // 200%
  overnightRate: decimal("overnight_rate", { precision: 5, scale: 2 }).default("1.0"), // 100%
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payroll table
export const payroll = pgTable("payroll", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  payPeriodStart: date("pay_period_start").notNull(),
  payPeriodEnd: date("pay_period_end").notNull(),
  regularHours: decimal("regular_hours", { precision: 8, scale: 2 }).default("0"),
  overtimeHours: decimal("overtime_hours", { precision: 8, scale: 2 }).default("0"),
  weekendHours: decimal("weekend_hours", { precision: 8, scale: 2 }).default("0"),
  publicHolidayHours: decimal("public_holiday_hours", { precision: 8, scale: 2 }).default("0"),
  overnightHours: decimal("overnight_hours", { precision: 8, scale: 2 }).default("0"),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }),
  superannuation: decimal("superannuation", { precision: 10, scale: 2 }),
  tax: decimal("tax", { precision: 10, scale: 2 }),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }),
  status: payrollStatusEnum("status").default("pending"),
  payDate: date("pay_date"),
  awardRateId: varchar("award_rate_id").references(() => awardRates.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 4. SERVICE DELIVERY DEPARTMENT TABLES

// Shifts table for staff allocation and shift management
export const shifts = pgTable("shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id),
  assignedStaffId: varchar("assigned_staff_id").references(() => staff.id),
  coverStaffId: varchar("cover_staff_id").references(() => staff.id), // for cover shifts
  shiftDate: date("shift_date").notNull(),
  startTime: varchar("start_time").notNull(), // HH:MM format
  endTime: varchar("end_time").notNull(), // HH:MM format
  duration: integer("duration"), // in minutes
  shiftType: varchar("shift_type").notNull(), // regular, cover, emergency, overnight
  location: text("location"),
  status: shiftStatusEnum("status").default("scheduled"),
  notes: text("notes"),
  clockInTime: timestamp("clock_in_time"),
  clockOutTime: timestamp("clock_out_time"),
  actualDuration: integer("actual_duration"), // in minutes
  travelTime: integer("travel_time"), // in minutes
  isUrgent: boolean("is_urgent").default(false),
  requestedBy: varchar("requested_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Availability table
export const staffAvailability = pgTable("staff_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time").notNull(), // HH:MM format
  endTime: varchar("end_time").notNull(), // HH:MM format
  isAvailable: boolean("is_available").default(true),
  maxHoursPerDay: integer("max_hours_per_day").default(8),
  preferredRegions: text("preferred_regions").array(),
  notes: text("notes"),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 5. COMPLIANCE & QUALITY DEPARTMENT TABLES

// Audits table
export const audits = pgTable("audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditType: varchar("audit_type").notNull(), // internal, external, spot_check, participant_feedback
  auditDate: date("audit_date").notNull(),
  auditorName: varchar("auditor_name").notNull(),
  departmentAudited: departmentEnum("department_audited"),
  participantId: varchar("participant_id").references(() => participants.id),
  staffId: varchar("staff_id").references(() => staff.id),
  serviceId: varchar("service_id").references(() => services.id),
  complianceScore: integer("compliance_score"), // 0-100
  findings: text("findings"),
  recommendations: text("recommendations"),
  actionItems: text("action_items").array(),
  status: auditStatusEnum("status").default("pending"),
  dueDate: date("due_date"),
  completedDate: date("completed_date"),
  followUpRequired: boolean("follow_up_required").default(false),
  nextAuditDate: date("next_audit_date"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Incidents table
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentNumber: varchar("incident_number").unique().notNull(),
  incidentDate: timestamp("incident_date").notNull(),
  incidentType: varchar("incident_type").notNull(), // injury, medication_error, behavioral, safeguarding, other
  severity: varchar("severity").notNull(), // low, medium, high, critical
  participantId: varchar("participant_id").references(() => participants.id),
  staffId: varchar("staff_id").references(() => staff.id),
  location: text("location"),
  description: text("description").notNull(),
  immediateActions: text("immediate_actions"),
  investigation: text("investigation"),
  rootCause: text("root_cause"),
  correctiveActions: text("corrective_actions").array(),
  preventiveActions: text("preventive_actions").array(),
  reportedBy: varchar("reported_by").references(() => users.id).notNull(),
  investigatedBy: varchar("investigated_by").references(() => users.id),
  reportedToAuthorities: boolean("reported_to_authorities").default(false),
  authorityReference: varchar("authority_reference"),
  status: varchar("status").default("open"), // open, investigating, closed
  closedDate: date("closed_date"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Participant Goals from NDIS Plans
export const participantGoals = pgTable("participant_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").notNull().references(() => participants.id),
  planId: varchar("plan_id").references(() => ndisPlans.id),
  goalType: varchar("goal_type").notNull(), // short_term, long_term, outcome
  category: varchar("category").notNull(), // daily_living, community, employment, relationships, etc.
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  targetDate: date("target_date"),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  status: varchar("status").default("active"), // active, in_progress, completed, on_hold, cancelled
  progressNotes: text("progress_notes"),
  assignedStaffId: varchar("assigned_staff_id").references(() => staff.id),
  supportBudgetCategory: varchar("support_budget_category"), // core, capacity_building, capital
  estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Goal Actions/Tasks for Staff
export const goalActions = pgTable("goal_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull().references(() => participantGoals.id),
  actionTitle: varchar("action_title").notNull(),
  actionDescription: text("action_description"),
  assignedStaffId: varchar("assigned_staff_id").references(() => staff.id),
  dueDate: date("due_date"),
  priority: varchar("priority").default("medium"),
  status: varchar("status").default("pending"), // pending, in_progress, completed, cancelled
  hoursEstimated: decimal("hours_estimated", { precision: 6, scale: 2 }),
  hoursActual: decimal("hours_actual", { precision: 6, scale: 2 }),
  supportItemId: varchar("support_item_id").references(() => ndisSupportItems.id),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const participantsRelations = relations(participants, ({ many }) => ({
  plans: many(ndisPlans),
  goals: many(participantGoals),
  services: many(services),
  progressNotes: many(progressNotes),
  invoices: many(invoices),
}));

export const ndisPlansRelations = relations(ndisPlans, ({ one, many }) => ({
  participant: one(participants, {
    fields: [ndisPlans.participantId],
    references: [participants.id],
  }),
  services: many(services),
  invoices: many(invoices),
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
  user: one(users, {
    fields: [staff.userId],
    references: [users.id],
  }),
  services: many(services),
  progressNotes: many(progressNotes),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  participant: one(participants, {
    fields: [services.participantId],
    references: [participants.id],
  }),
  plan: one(ndisPlans, {
    fields: [services.planId],
    references: [ndisPlans.id],
  }),
  staff: one(staff, {
    fields: [services.staffId],
    references: [staff.id],
  }),
  progressNotes: many(progressNotes),
  invoiceLineItems: many(invoiceLineItems),
}));

export const progressNotesRelations = relations(progressNotes, ({ one }) => ({
  participant: one(participants, {
    fields: [progressNotes.participantId],
    references: [participants.id],
  }),
  service: one(services, {
    fields: [progressNotes.serviceId],
    references: [services.id],
  }),
  staff: one(staff, {
    fields: [progressNotes.staffId],
    references: [staff.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  participant: one(participants, {
    fields: [invoices.participantId],
    references: [participants.id],
  }),
  plan: one(ndisPlans, {
    fields: [invoices.planId],
    references: [ndisPlans.id],
  }),
  lineItems: many(invoiceLineItems),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
  service: one(services, {
    fields: [invoiceLineItems.serviceId],
    references: [services.id],
  }),
}));

// Additional relations for department tables
export const referralsRelations = relations(referrals, ({ one }) => ({
  participant: one(participants, {
    fields: [referrals.participantId],
    references: [participants.id],
  }),
  assignedUser: one(users, {
    fields: [referrals.assignedTo],
    references: [users.id],
  }),
}));

export const serviceAgreementsRelations = relations(serviceAgreements, ({ one }) => ({
  participant: one(participants, {
    fields: [serviceAgreements.participantId],
    references: [participants.id],
  }),
  plan: one(ndisPlans, {
    fields: [serviceAgreements.planId],
    references: [ndisPlans.id],
  }),
  createdByUser: one(users, {
    fields: [serviceAgreements.createdBy],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [serviceAgreements.approvedBy],
    references: [users.id],
  }),
}));

export const shiftsRelations = relations(shifts, ({ one }) => ({
  participant: one(participants, {
    fields: [shifts.participantId],
    references: [participants.id],
  }),
  service: one(services, {
    fields: [shifts.serviceId],
    references: [services.id],
  }),
  assignedStaff: one(staff, {
    fields: [shifts.assignedStaffId],
    references: [staff.id],
  }),
  coverStaff: one(staff, {
    fields: [shifts.coverStaffId],
    references: [staff.id],
  }),
}));

export const payrollRelations = relations(payroll, ({ one }) => ({
  staff: one(staff, {
    fields: [payroll.staffId],
    references: [staff.id],
  }),
  awardRate: one(awardRates, {
    fields: [payroll.awardRateId],
    references: [awardRates.id],
  }),
}));

export const auditsRelations = relations(audits, ({ one }) => ({
  participant: one(participants, {
    fields: [audits.participantId],
    references: [participants.id],
  }),
  staff: one(staff, {
    fields: [audits.staffId],
    references: [staff.id],
  }),
  service: one(services, {
    fields: [audits.serviceId],
    references: [services.id],
  }),
  createdByUser: one(users, {
    fields: [audits.createdBy],
    references: [users.id],
  }),
}));



export const participantGoalsRelations = relations(participantGoals, ({ one, many }) => ({
  participant: one(participants, {
    fields: [participantGoals.participantId],
    references: [participants.id],
  }),
  plan: one(ndisPlans, {
    fields: [participantGoals.planId],
    references: [ndisPlans.id],
  }),
  assignedStaff: one(staff, {
    fields: [participantGoals.assignedStaffId],
    references: [staff.id],
  }),
  actions: many(goalActions),
}));

export const goalActionsRelations = relations(goalActions, ({ one }) => ({
  goal: one(participantGoals, {
    fields: [goalActions.goalId],
    references: [participantGoals.id],
  }),
  assignedStaff: one(staff, {
    fields: [goalActions.assignedStaffId],
    references: [staff.id],
  }),
  supportItem: one(ndisSupportItems, {
    fields: [goalActions.supportItemId],
    references: [ndisSupportItems.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNdisplanSchema = createInsertSchema(ndisPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParticipantGoalsSchema = createInsertSchema(participantGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGoalActionsSchema = createInsertSchema(goalActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProgressNoteSchema = createInsertSchema(progressNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
  createdAt: true,
});

// Department-specific insert schemas
export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceAgreementSchema = createInsertSchema(serviceAgreements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffQualificationSchema = createInsertSchema(staffQualifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPerformanceReviewSchema = createInsertSchema(performanceReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAwardRateSchema = createInsertSchema(awardRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffAvailabilitySchema = createInsertSchema(staffAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditSchema = createInsertSchema(audits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertNdisPlan = z.infer<typeof insertNdisplanSchema>;
export type NdisPlan = typeof ndisPlans.$inferSelect;
export type InsertParticipantGoals = z.infer<typeof insertParticipantGoalsSchema>;
export type ParticipantGoals = typeof participantGoals.$inferSelect;
export type InsertGoalActions = z.infer<typeof insertGoalActionsSchema>;
export type GoalActions = typeof goalActions.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertProgressNote = z.infer<typeof insertProgressNoteSchema>;
export type ProgressNote = typeof progressNotes.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;

// Department types
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertServiceAgreement = z.infer<typeof insertServiceAgreementSchema>;
export type ServiceAgreement = typeof serviceAgreements.$inferSelect;
export type InsertStaffQualification = z.infer<typeof insertStaffQualificationSchema>;
export type StaffQualification = typeof staffQualifications.$inferSelect;
export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;
export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertAwardRate = z.infer<typeof insertAwardRateSchema>;
export type AwardRate = typeof awardRates.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type Payroll = typeof payroll.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Shift = typeof shifts.$inferSelect;
export type InsertStaffAvailability = z.infer<typeof insertStaffAvailabilitySchema>;
export type StaffAvailability = typeof staffAvailability.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type Audit = typeof audits.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

// Roles and permissions tables
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  roleType: roleTypeEnum("role_type").notNull().default("staff"),
  departments: text("departments").array(),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  permissionType: permissionTypeEnum("permission_type").notNull(),
  resource: varchar("resource").notNull(), // participants, staff, reports, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: varchar("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: varchar("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  assignedBy: varchar("assigned_by").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// Relations for roles and permissions
export const rolesRelations = relations(roles, ({ many, one }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
  creator: one(users, {
    fields: [roles.createdBy],
    references: [users.id]
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id]
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id]
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id]
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id]
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id]
  }),
}));

// Insert schemas for roles and permissions
export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  assignedAt: true,
});

// NDIS Price Guide tables
export const ndisSupportCategories = pgTable("ndis_support_categories", {
  id: varchar("id").primaryKey(),
  categoryNumber: varchar("category_number").notNull().unique(), // e.g., "01", "02", etc.
  name: varchar("name").notNull(),
  description: text("description"),
  budgetType: ndisBudgetTypeEnum("budget_type").notNull(),
  isFlexible: boolean("is_flexible").default(false), // Whether funds can move between categories
  isActive: boolean("is_active").default(true),
  effectiveDate: date("effective_date").notNull(),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ndisSupportItems = pgTable("ndis_support_items", {
  id: varchar("id").primaryKey(),
  supportCode: varchar("support_code").notNull().unique(), // Official NDIS support item code
  name: varchar("name").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => ndisSupportCategories.id).notNull(),
  unitType: ndisUnitTypeEnum("unit_type").notNull(),
  supportType: ndisSupportTypeEnum("support_type").notNull(),
  registrationGroup: ndisRegistrationGroupEnum("registration_group").notNull(),
  minimumCancellationNotice: integer("minimum_cancellation_notice"), // in hours
  isQuoteBased: boolean("is_quote_based").default(false),
  requiresAssessment: boolean("requires_assessment").default(false),
  isActive: boolean("is_active").default(true),
  effectiveDate: date("effective_date").notNull(),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ndisPricing = pgTable("ndis_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supportItemId: varchar("support_item_id").references(() => ndisSupportItems.id).notNull(),
  geographicArea: ndisGeographicAreaEnum("geographic_area").notNull(),
  priceLimit: decimal("price_limit", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("AUD"),
  effectiveDate: date("effective_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Plan line items - links NDIS plans to specific support items with pricing
export const ndisPlanLineItems = pgTable("ndis_plan_line_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").references(() => ndisPlans.id).notNull(),
  supportItemId: varchar("support_item_id").references(() => ndisSupportItems.id).notNull(),
  allocatedUnits: integer("allocated_units").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAllocation: decimal("total_allocation", { precision: 10, scale: 2 }).notNull(),
  usedUnits: integer("used_units").default(0),
  remainingUnits: integer("remaining_units").notNull(),
  geographicArea: ndisGeographicAreaEnum("geographic_area").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for NDIS Price Guide
export const ndisSupportCategoriesRelations = relations(ndisSupportCategories, ({ many }) => ({
  supportItems: many(ndisSupportItems),
}));

export const ndisSupportItemsRelations = relations(ndisSupportItems, ({ one, many }) => ({
  category: one(ndisSupportCategories, {
    fields: [ndisSupportItems.categoryId],
    references: [ndisSupportCategories.id]
  }),
  pricing: many(ndisPricing),
  planLineItems: many(ndisPlanLineItems),
}));

export const ndisPricingRelations = relations(ndisPricing, ({ one }) => ({
  supportItem: one(ndisSupportItems, {
    fields: [ndisPricing.supportItemId],
    references: [ndisSupportItems.id]
  }),
}));

export const ndisPlanLineItemsRelations = relations(ndisPlanLineItems, ({ one }) => ({
  plan: one(ndisPlans, {
    fields: [ndisPlanLineItems.planId],
    references: [ndisPlans.id]
  }),
  supportItem: one(ndisSupportItems, {
    fields: [ndisPlanLineItems.supportItemId],
    references: [ndisSupportItems.id]
  }),
}));

// Insert schemas for NDIS Price Guide
export const insertNdisSupportCategorySchema = createInsertSchema(ndisSupportCategories).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertNdisSupportItemSchema = createInsertSchema(ndisSupportItems).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertNdisPricingSchema = createInsertSchema(ndisPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNdisPlanLineItemSchema = createInsertSchema(ndisPlanLineItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for roles and permissions
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

// Types for NDIS Price Guide
export type InsertNdisSupportCategory = z.infer<typeof insertNdisSupportCategorySchema>;
export type NdisSupportCategory = typeof ndisSupportCategories.$inferSelect;
export type InsertNdisSupportItem = z.infer<typeof insertNdisSupportItemSchema>;
export type NdisSupportItem = typeof ndisSupportItems.$inferSelect;
export type InsertNdisPricing = z.infer<typeof insertNdisPricingSchema>;
export type NdisPricing = typeof ndisPricing.$inferSelect;
export type InsertNdisPlanLineItem = z.infer<typeof insertNdisPlanLineItemSchema>;
export type NdisPlanLineItem = typeof ndisPlanLineItems.$inferSelect;
