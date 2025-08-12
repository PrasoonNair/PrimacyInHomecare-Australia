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

// Job Postings table for recruitment
export const jobPostings = pgTable("job_postings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  department: varchar("department"),
  position: varchar("position").notNull(),
  schacsLevel: varchar("schacs_level"),
  jobType: varchar("job_type").notNull(), // full-time, part-time, casual, contract
  location: varchar("location"),
  salary: varchar("salary"),
  description: text("description").notNull(),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  benefits: text("benefits"),
  status: varchar("status").default("draft"), // draft, published, closed, filled
  publishedDate: date("published_date"),
  closingDate: date("closing_date"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job Applications table
export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobPostingId: varchar("job_posting_id").references(() => jobPostings.id).notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  resumeUrl: varchar("resume_url"),
  coverLetterUrl: varchar("cover_letter_url"),
  linkedInProfile: varchar("linkedin_profile"),
  experience: text("experience"),
  qualifications: text("qualifications"),
  ndisWorkerCheck: boolean("ndis_worker_check").default(false),
  workingWithChildrenCheck: boolean("working_with_children_check").default(false),
  policeCheck: boolean("police_check").default(false),
  referenceChecks: boolean("reference_checks").default(false),
  status: varchar("status").default("new"), // new, screening, interview, reference-check, offer, rejected, withdrawn
  rating: integer("rating"), // 1-5 star rating
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interview Schedule table
export const interviewSchedule = pgTable("interview_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => jobApplications.id).notNull(),
  interviewType: varchar("interview_type").notNull(), // phone, video, in-person, panel
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: varchar("scheduled_time").notNull(),
  duration: integer("duration"), // in minutes
  location: varchar("location"),
  meetingLink: varchar("meeting_link"),
  interviewers: text("interviewers").array(),
  status: varchar("status").default("scheduled"), // scheduled, completed, cancelled, no-show
  feedback: text("feedback"),
  outcome: varchar("outcome"), // proceed, reject, hold
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Onboarding table
export const staffOnboarding = pgTable("staff_onboarding", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  applicationId: varchar("application_id").references(() => jobApplications.id),
  onboardingStatus: varchar("onboarding_status").default("pending"), // pending, in-progress, completed
  contractSigned: boolean("contract_signed").default(false),
  contractDate: date("contract_date"),
  bankDetailsProvided: boolean("bank_details_provided").default(false),
  superannuationSetup: boolean("superannuation_setup").default(false),
  taxFileDeclaration: boolean("tax_file_declaration").default(false),
  emergencyContactsProvided: boolean("emergency_contacts_provided").default(false),
  ndisWorkerCheckCompleted: boolean("ndis_worker_check_completed").default(false),
  ndisWorkerCheckExpiry: date("ndis_worker_check_expiry"),
  workingWithChildrenCheckCompleted: boolean("wwcc_completed").default(false),
  workingWithChildrenCheckExpiry: date("wwcc_expiry"),
  policeCheckCompleted: boolean("police_check_completed").default(false),
  policeCheckExpiry: date("police_check_expiry"),
  inductionCompleted: boolean("induction_completed").default(false),
  inductionDate: date("induction_date"),
  mandatoryTrainingCompleted: boolean("mandatory_training_completed").default(false),
  uniformProvided: boolean("uniform_provided").default(false),
  equipmentProvided: boolean("equipment_provided").default(false),
  systemAccessGranted: boolean("system_access_granted").default(false),
  buddyAssigned: varchar("buddy_assigned").references(() => staff.id),
  probationEndDate: date("probation_end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Leave Management table
export const staffLeave = pgTable("staff_leave", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  leaveType: varchar("leave_type").notNull(), // annual, sick, personal, bereavement, long-service, unpaid
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: decimal("total_days", { precision: 5, scale: 2 }),
  reason: text("reason"),
  medicalCertificate: boolean("medical_certificate").default(false),
  status: varchar("status").default("pending"), // pending, approved, rejected, cancelled
  approvedBy: varchar("approved_by").references(() => users.id),
  approvalDate: date("approval_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Training Records table
export const staffTraining = pgTable("staff_training", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  trainingType: varchar("training_type").notNull(), // mandatory, professional-development, compliance, skill-specific
  trainingName: varchar("training_name").notNull(),
  provider: varchar("provider"),
  completionDate: date("completion_date"),
  expiryDate: date("expiry_date"),
  certificateUrl: varchar("certificate_url"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  duration: integer("duration"), // in hours
  status: varchar("status").default("enrolled"), // enrolled, in-progress, completed, expired
  isNdisMandatory: boolean("is_ndis_mandatory").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

// SCHADS Award Rates table - Full compliance with SCHADS Award
export const schacsAwardRates = pgTable("schacs_award_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  level: varchar("level").notNull(), // Level 1.1, 1.2, 1.3, 2.1, 2.2, 3, 4, 5, 6, 7, 8
  classification: varchar("classification").notNull(), // Support Worker, Senior Support Worker, Team Leader, etc.
  streamType: varchar("stream_type").notNull(), // social-community-disability, home-care, family-day-care
  employmentType: varchar("employment_type").notNull(), // full-time, part-time, casual
  // Base rates
  baseHourlyRate: decimal("base_hourly_rate", { precision: 8, scale: 2 }).notNull(),
  baseWeeklyRate: decimal("base_weekly_rate", { precision: 10, scale: 2 }),
  baseAnnualRate: decimal("base_annual_rate", { precision: 10, scale: 2 }),
  // Penalty rates - SCHADS compliant
  saturdayRate: decimal("saturday_rate", { precision: 5, scale: 2 }).default("1.5"), // 150%
  sundayRate: decimal("sunday_rate", { precision: 5, scale: 2 }).default("2.0"), // 200%
  publicHolidayRate: decimal("public_holiday_rate", { precision: 5, scale: 2 }).default("2.5"), // 250%
  eveningRate: decimal("evening_rate", { precision: 5, scale: 2 }).default("1.125"), // 112.5% (6pm-8pm Mon-Fri)
  nightRate: decimal("night_rate", { precision: 5, scale: 2 }).default("1.15"), // 115% (8pm-6am Mon-Fri)
  // Overtime rates
  overtime1Rate: decimal("overtime_1_rate", { precision: 5, scale: 2 }).default("1.5"), // First 2 hours - 150%
  overtime2Rate: decimal("overtime_2_rate", { precision: 5, scale: 2 }).default("2.0"), // After 2 hours - 200%
  // Loadings and allowances
  casualLoading: decimal("casual_loading", { precision: 5, scale: 2 }).default("0.25"), // 25% casual loading
  brokenShiftAllowance: decimal("broken_shift_allowance", { precision: 8, scale: 2 }),
  sleeperAllowance: decimal("sleepover_allowance", { precision: 8, scale: 2 }),
  onCallAllowance: decimal("on_call_allowance", { precision: 8, scale: 2 }),
  // Travel allowances
  vehicleAllowancePerKm: decimal("vehicle_allowance_per_km", { precision: 5, scale: 2 }).default("0.95"),
  transportationAllowance: decimal("transportation_allowance", { precision: 8, scale: 2 }),
  // Other allowances
  mealAllowance: decimal("meal_allowance", { precision: 8, scale: 2 }),
  uniformAllowance: decimal("uniform_allowance", { precision: 8, scale: 2 }),
  laundryAllowance: decimal("laundry_allowance", { precision: 8, scale: 2 }),
  // Validity
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true),
  fairWorkReference: varchar("fair_work_reference"), // Reference to Fair Work determination
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Award Rates table (for other awards beyond SCHADS)
export const awardRates = pgTable("award_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  awardType: awardTypeEnum("award_type").notNull(),
  level: varchar("level").notNull(),
  classification: varchar("classification"),
  baseHourlyRate: decimal("base_hourly_rate", { precision: 8, scale: 2 }).notNull(),
  casualLoading: decimal("casual_loading", { precision: 5, scale: 2 }).default("0.25"),
  weekendRate: decimal("weekend_rate", { precision: 5, scale: 2 }).default("1.5"),
  publicHolidayRate: decimal("public_holiday_rate", { precision: 5, scale: 2 }).default("2.0"),
  overnightRate: decimal("overnight_rate", { precision: 5, scale: 2 }).default("1.0"),
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
  participantAddress: text("participant_address"), // Specific address for the shift
  status: shiftStatusEnum("status").default("scheduled"),
  notes: text("notes"),
  clockInTime: timestamp("clock_in_time"),
  clockOutTime: timestamp("clock_out_time"),
  clockInLocation: text("clock_in_location"), // GPS/address where staff clocked in
  clockOutLocation: text("clock_out_location"), // GPS/address where staff clocked out
  actualDuration: integer("actual_duration"), // in minutes
  travelTime: integer("travel_time"), // in minutes
  breakTime: integer("break_time"), // in minutes
  isUrgent: boolean("is_urgent").default(false),
  requestedBy: varchar("requested_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  // Billing and NDIS specific fields
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  ndisSupportItemNumber: varchar("ndis_support_item_number"),
  billingStatus: varchar("billing_status").default("pending"), // pending, approved, invoiced, paid
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  // Compliance tracking
  caseNoteCompleted: boolean("case_note_completed").default(false),
  participantSignature: boolean("participant_signature").default(false),
  qualityCheckPassed: boolean("quality_check_passed").default(false),
  supervisorApproval: boolean("supervisor_approval").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shift Case Notes table - Enhanced for NDIS compliance
export const shiftCaseNotes = pgTable("shift_case_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: varchar("shift_id").references(() => shifts.id).notNull(),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  noteDate: timestamp("note_date").defaultNow(),
  
  // NDIS specific fields
  goalProgress: text("goal_progress"),
  activitiesCompleted: text("activities_completed"),
  supportProvided: text("support_provided"),
  participantMood: varchar("participant_mood"), // excellent, good, fair, poor
  participantEngagement: varchar("participant_engagement"), // high, medium, low
  skillsObserved: text("skills_observed"),
  challengesFaced: text("challenges_faced"),
  breakthroughs: text("breakthroughs"),
  
  // Medication and health
  medicationGiven: boolean("medication_given").default(false),
  medicationDetails: text("medication_details"),
  healthObservations: text("health_observations"),
  incidentOccurred: boolean("incident_occurred").default(false),
  incidentDetails: text("incident_details"),
  
  // Support and outcomes
  outcomes: text("outcomes"),
  nextSteps: text("next_steps"),
  participantFeedback: text("participant_feedback"),
  supportWorkerReflection: text("support_worker_reflection"),
  
  // Compliance and approval
  supervisorReviewed: boolean("supervisor_reviewed").default(false),
  supervisorNotes: text("supervisor_notes"),
  qualityRating: integer("quality_rating"), // 1-5 stars
  
  // Digital signatures
  participantSignatureUrl: varchar("participant_signature_url"),
  staffSignatureUrl: varchar("staff_signature_url"),
  supervisorSignatureUrl: varchar("supervisor_signature_url"),
  
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

// Automation History table
export const automationHistory = pgTable("automation_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskName: varchar("task_name").notNull(),
  taskType: varchar("task_type").notNull(), 
  executedAt: timestamp("executed_at").defaultNow(),
  status: varchar("status").notNull(), // success, failed, partial
  affectedRecords: integer("affected_records"),
  errorMessage: text("error_message"),
  executionTime: integer("execution_time"), // in milliseconds
  details: jsonb("details"),
  createdBy: varchar("created_by").default("System"),
  createdAt: timestamp("created_at").defaultNow(),
});

// NDIS Price Guide table
export const ndisPriceGuide = pgTable("ndis_price_guide", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemNumber: varchar("item_number").notNull().unique(),
  itemName: varchar("item_name").notNull(),
  supportCategory: varchar("support_category").notNull(),
  unitOfMeasure: varchar("unit_of_measure").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  description: text("description"),
  restrictions: text("restrictions"),
  nonFaceToFace: boolean("non_face_to_face").default(false),
  travelApplicable: boolean("travel_applicable").default(false),
  cancellationRules: text("cancellation_rules"),
  qualificationRequired: text("qualification_required"),
  registrationGroup: varchar("registration_group"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Allocations table  
export const serviceAllocations = pgTable("service_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  staffId: varchar("staff_id").notNull().references(() => staff.id),
  participantId: varchar("participant_id").notNull().references(() => participants.id),
  allocationDate: date("allocation_date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: varchar("status").notNull().default("allocated"), // allocated, confirmed, completed, cancelled
  matchScore: integer("match_score"), // AI matching score 0-100
  matchReason: text("match_reason"),
  travelTime: integer("travel_time"), // in minutes
  travelDistance: decimal("travel_distance", { precision: 10, scale: 2 }), // in km
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audits table
export const audits = pgTable("audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditType: varchar("audit_type").notNull(), // internal, external, spot_check, participant_feedback
  auditDate: date("audit_date").notNull(),
  auditorName: varchar("auditor_name").notNull().default("System"),
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

// [Old incidents table removed - see comprehensive NDIS incident reporting system below]



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

// NDIS Plan Documents table for PDF storage and processing
export const planDocuments = pgTable("plan_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id),
  planId: varchar("plan_id").references(() => ndisPlans.id),
  documentUrl: varchar("document_url").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  processingStatus: varchar("processing_status").default("pending"), // pending, processing, completed, failed
  extractedData: jsonb("extracted_data"), // Store extracted participant info and goals
  aiAnalysis: jsonb("ai_analysis"), // Store AI-generated goal breakdown
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Digital Service Agreements with e-signature capability
export const digitalServiceAgreements = pgTable("digital_service_agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  planId: varchar("plan_id").references(() => ndisPlans.id),
  documentId: varchar("document_id").references(() => planDocuments.id),
  agreementNumber: varchar("agreement_number").unique().notNull(),
  agreementType: varchar("agreement_type").default("initial"), // initial, review, amendment, renewal
  content: jsonb("content").notNull(), // Structured agreement content including goals and funding
  htmlContent: text("html_content"), // Rendered HTML for display
  pdfUrl: varchar("pdf_url"), // Generated PDF URL
  status: varchar("status").default("draft"), // draft, sent, viewed, signed, expired, cancelled
  sentDate: timestamp("sent_date"),
  viewedDate: timestamp("viewed_date"),
  signedDate: timestamp("signed_date"),
  expiryDate: timestamp("expiry_date"),
  participantSignature: text("participant_signature"), // Base64 signature image
  participantSignatureIp: varchar("participant_signature_ip"),
  witnessName: varchar("witness_name"),
  witnessSignature: text("witness_signature"),
  communicationMethod: varchar("communication_method"), // email, sms, whatsapp, portal
  accessToken: varchar("access_token").unique(), // Secure token for accessing agreement
  accessUrl: varchar("access_url"), // Public URL for viewing/signing
  fundingBreakdown: jsonb("funding_breakdown"), // Detailed funding allocation per goal
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communication logs for service agreements
export const agreementCommunications = pgTable("agreement_communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agreementId: varchar("agreement_id").references(() => digitalServiceAgreements.id).notNull(),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  communicationType: varchar("communication_type").notNull(), // email, sms, whatsapp
  recipient: varchar("recipient").notNull(), // Email or phone number
  subject: varchar("subject"),
  message: text("message"),
  status: varchar("status").default("pending"), // pending, sent, delivered, failed, bounced
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // Provider-specific metadata (SendGrid, Twilio, etc)
  createdAt: timestamp("created_at").defaultNow(),
});

// Incident reporting and management system
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentNumber: varchar("incident_number").unique().notNull(),
  
  // NDIS Reportable Incident Categories
  category: varchar("category").notNull(), // death, serious injury, abuse/neglect, unlawful sexual/physical contact, unauthorized restrictive practice
  subcategory: varchar("subcategory"),
  severity: varchar("severity").notNull(), // critical, high, medium, low
  
  // Participant Information
  participantId: varchar("participant_id").references(() => participants.id),
  participantName: varchar("participant_name").notNull(),
  ndisNumber: varchar("ndis_number"),
  
  // Incident Details
  incidentDate: date("incident_date").notNull(),
  incidentTime: varchar("incident_time").notNull(),
  location: varchar("location").notNull(),
  description: text("description").notNull(),
  immediateAction: text("immediate_action").notNull(),
  
  // People Involved
  reportedBy: varchar("reported_by").notNull(),
  reportedByRole: varchar("reported_by_role").notNull(),
  reportedDate: timestamp("reported_date").defaultNow(),
  witnessNames: text("witness_names"),
  staffInvolved: text("staff_involved"),
  
  // Injury/Medical Details
  injuryType: varchar("injury_type"),
  bodyPartAffected: varchar("body_part_affected"),
  medicalTreatment: text("medical_treatment"),
  hospitalAttendance: boolean("hospital_attendance").default(false),
  
  // Notification Requirements
  notificationRequired: boolean("notification_required").default(true),
  policeNotified: boolean("police_notified").default(false),
  familyNotified: boolean("family_notified").default(false),
  ndisNotified: boolean("ndis_notified").default(false),
  worksafeNotified: boolean("worksafe_notified").default(false),
  
  // Sign-off Workflow
  status: varchar("status").default("pending"), // pending, under_review, escalated, approved, closed
  currentApprovalLevel: integer("current_approval_level").default(1),
  
  // Risk Assessment
  riskRating: varchar("risk_rating"), // low, medium, high, critical
  likelihoodRecurrence: varchar("likelihood_recurrence"),
  
  // Follow-up Actions
  correctiveActions: text("corrective_actions"),
  preventativeMeasures: text("preventative_measures"),
  reviewDate: date("review_date"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const incidentApprovals = pgTable("incident_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").references(() => incidents.id).notNull(),
  
  // Approval Level Details
  approvalLevel: integer("approval_level").notNull(), // 1: Team Leader, 2: Manager, 3: Director, 4: CEO
  approverRole: varchar("approver_role").notNull(),
  approverId: varchar("approver_id").references(() => users.id),
  approverName: varchar("approver_name").notNull(),
  
  // Approval Action
  action: varchar("action").notNull(), // approved, rejected, escalated, request_info
  comments: text("comments"),
  signature: text("signature"),
  
  // Timestamps
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const incidentNotifications = pgTable("incident_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").references(() => incidents.id).notNull(),
  
  // Notification Details
  recipientId: varchar("recipient_id").references(() => users.id),
  recipientEmail: varchar("recipient_email").notNull(),
  recipientRole: varchar("recipient_role").notNull(),
  notificationType: varchar("notification_type").notNull(), // new_incident, approval_required, escalation, resolution
  
  // Delivery Status
  status: varchar("status").default("pending"), // pending, sent, delivered, failed
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  
  // Message Content
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const incidentDocuments = pgTable("incident_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").references(() => incidents.id).notNull(),
  
  // Document Details
  documentType: varchar("document_type").notNull(), // photo, witness_statement, medical_report, police_report, other
  documentName: varchar("document_name").notNull(),
  documentUrl: varchar("document_url").notNull(),
  uploadedBy: varchar("uploaded_by").notNull(),
  
  // Metadata
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const incidentTimeline = pgTable("incident_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").references(() => incidents.id).notNull(),
  
  // Timeline Entry
  action: varchar("action").notNull(),
  description: text("description").notNull(),
  performedBy: varchar("performed_by").notNull(),
  performedByRole: varchar("performed_by_role").notNull(),
  
  // Timestamps
  timestamp: timestamp("timestamp").defaultNow(),
});

// Create types for incidents
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;
export type IncidentApproval = typeof incidentApprovals.$inferSelect;
export type InsertIncidentApproval = typeof incidentApprovals.$inferInsert;
export type IncidentNotification = typeof incidentNotifications.$inferSelect;
export type InsertIncidentNotification = typeof incidentNotifications.$inferInsert;
export type IncidentDocument = typeof incidentDocuments.$inferSelect;
export type InsertIncidentDocument = typeof incidentDocuments.$inferInsert;
export type IncidentTimelineEntry = typeof incidentTimeline.$inferSelect;
export type InsertIncidentTimelineEntry = typeof incidentTimeline.$inferInsert;

// Define relations
export const participantsRelations = relations(participants, ({ many }) => ({
  plans: many(ndisPlans),
  goals: many(participantGoals),
  services: many(services),
  progressNotes: many(progressNotes),
  invoices: many(invoices),
  planDocuments: many(planDocuments),
  digitalServiceAgreements: many(digitalServiceAgreements),
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

export const planDocumentsRelations = relations(planDocuments, ({ one, many }) => ({
  participant: one(participants, {
    fields: [planDocuments.participantId],
    references: [participants.id],
  }),
  plan: one(ndisPlans, {
    fields: [planDocuments.planId],
    references: [ndisPlans.id],
  }),
  uploadedByUser: one(users, {
    fields: [planDocuments.uploadedBy],
    references: [users.id],
  }),
  serviceAgreements: many(digitalServiceAgreements),
}));

export const digitalServiceAgreementsRelations = relations(digitalServiceAgreements, ({ one, many }) => ({
  participant: one(participants, {
    fields: [digitalServiceAgreements.participantId],
    references: [participants.id],
  }),
  plan: one(ndisPlans, {
    fields: [digitalServiceAgreements.planId],
    references: [ndisPlans.id],
  }),
  document: one(planDocuments, {
    fields: [digitalServiceAgreements.documentId],
    references: [planDocuments.id],
  }),
  createdByUser: one(users, {
    fields: [digitalServiceAgreements.createdBy],
    references: [users.id],
  }),
  communications: many(agreementCommunications),
}));

export const agreementCommunicationsRelations = relations(agreementCommunications, ({ one }) => ({
  agreement: one(digitalServiceAgreements, {
    fields: [agreementCommunications.agreementId],
    references: [digitalServiceAgreements.id],
  }),
  participant: one(participants, {
    fields: [agreementCommunications.participantId],
    references: [participants.id],
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

export const insertShiftCaseNoteSchema = createInsertSchema(shiftCaseNotes).omit({
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

// Recruitment-specific insert schemas
export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterviewScheduleSchema = createInsertSchema(interviewSchedule).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffOnboardingSchema = createInsertSchema(staffOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffLeaveSchema = createInsertSchema(staffLeave).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffTrainingSchema = createInsertSchema(staffTraining).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSchacsAwardRateSchema = createInsertSchema(schacsAwardRates).omit({
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

export const insertPlanDocumentSchema = createInsertSchema(planDocuments).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertDigitalServiceAgreementSchema = createInsertSchema(digitalServiceAgreements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  agreementNumber: true,
  accessToken: true,
});

export const insertAgreementCommunicationSchema = createInsertSchema(agreementCommunications).omit({
  id: true,
  createdAt: true,
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
// Recruitment types
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertInterviewSchedule = z.infer<typeof insertInterviewScheduleSchema>;
export type InterviewSchedule = typeof interviewSchedule.$inferSelect;
export type InsertStaffOnboarding = z.infer<typeof insertStaffOnboardingSchema>;
export type StaffOnboarding = typeof staffOnboarding.$inferSelect;
export type InsertStaffLeave = z.infer<typeof insertStaffLeaveSchema>;
export type StaffLeave = typeof staffLeave.$inferSelect;
export type InsertStaffTraining = z.infer<typeof insertStaffTrainingSchema>;
export type StaffTraining = typeof staffTraining.$inferSelect;
export type InsertSchacsAwardRate = z.infer<typeof insertSchacsAwardRateSchema>;
export type SchacsAwardRate = typeof schacsAwardRates.$inferSelect;
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
export type InsertPlanDocument = z.infer<typeof insertPlanDocumentSchema>;
export type PlanDocument = typeof planDocuments.$inferSelect;
export type InsertDigitalServiceAgreement = z.infer<typeof insertDigitalServiceAgreementSchema>;
export type DigitalServiceAgreement = typeof digitalServiceAgreements.$inferSelect;
export type InsertAgreementCommunication = z.infer<typeof insertAgreementCommunicationSchema>;
export type AgreementCommunication = typeof agreementCommunications.$inferSelect;

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
