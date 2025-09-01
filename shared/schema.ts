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

// Department enums - moved before userRoleEnum
export const departmentEnum = pgEnum("department", ["intake", "hr_recruitment", "finance", "service_delivery", "compliance_quality"]);

// Price guide document types
export const priceGuideTypeEnum = pgEnum("price_guide_type", ["schads", "ndis"]);

// Offboarding enums
export const resignationTypeEnum = pgEnum("resignation_type", ["voluntary", "involuntary", "retirement", "redundancy"]);
export const offboardingStatusEnum = pgEnum("offboarding_status", ["initiated", "in_progress", "completed"]);

// Define specific role enum for all 15 roles
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "ceo",
  "general_manager",
  "intake_coordinator",
  "intake_manager",
  "finance_officer_billing",
  "finance_officer_payroll", 
  "finance_manager",
  "hr_manager",
  "hr_recruiter",
  "service_delivery_manager",
  "service_delivery_allocation",
  "service_delivery_coordinator",
  "quality_manager",
  "support_worker"
]);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("support_worker"), // Keep as varchar to avoid data loss
  department: varchar("department"),
  position: varchar("position"),
  phone: varchar("phone"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
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
  
  // Finance module enhancements
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  gstAmount: decimal("gst_amount", { precision: 10, scale: 2 }).default('0'),
  ndisClaimReference: varchar("ndis_claim_reference", { length: 100 }),
  paymentReceivedDate: timestamp("payment_received_date"),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  
  // Xero Integration fields
  xeroSyncId: varchar("xero_sync_id"),
  xeroInvoiceId: varchar("xero_invoice_id"),
  xeroSyncStatus: varchar("xero_sync_status"), // pending, synced, error
  xeroLastSyncedAt: timestamp("xero_last_synced_at"),
  
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
  
  // Document upload and OCR/AI extraction
  documentUrl: varchar("document_url"),
  documentType: varchar("document_type"), // pdf, word, excel
  autoExtractedData: jsonb("auto_extracted_data"),
  extractionStatus: varchar("extraction_status").default("pending"), // pending, processing, completed, failed
  
  // Participant information
  participantId: varchar("participant_id").references(() => participants.id),
  ndisNumber: varchar("ndis_number"),
  participantFirstName: varchar("participant_first_name"),
  participantLastName: varchar("participant_last_name"),
  participantDob: date("participant_dob"),
  participantPhone: varchar("participant_phone"),
  participantEmail: varchar("participant_email"),
  
  // Plan details
  planStartDate: date("plan_start_date"),
  planEndDate: date("plan_end_date"),
  supportCategories: text("support_categories").array(),
  
  // Referral source information
  referralSource: referralSourceEnum("referral_source").notNull(),
  referralType: varchar("referral_type"), // completed_form, rfs_portal, partner_referral
  referrerName: varchar("referrer_name"),
  referrerContact: varchar("referrer_contact"),
  referrerOrganization: varchar("referrer_organization"),
  
  // Workflow status tracking - aligned with brief
  workflowStatus: varchar("workflow_status").notNull().default("referral_received"),
  // Flow: referral_received -> data_verified -> pending_service_agreement -> 
  // agreement_sent -> agreement_signed -> pending_funding_verification -> 
  // funding_verified -> ready_for_allocation -> worker_allocated -> 
  // meet_greet_scheduled -> meet_greet_completed -> service_commenced
  
  // Verification and compliance
  mandatoryFieldsComplete: boolean("mandatory_fields_complete").default(false),
  dataVerifiedBy: varchar("data_verified_by").references(() => users.id),
  dataVerifiedAt: timestamp("data_verified_at"),
  
  // Service agreement tracking
  agreementTemplateId: varchar("agreement_template_id"),
  agreementSentAt: timestamp("agreement_sent_at"),
  agreementSignedAt: timestamp("agreement_signed_at"),
  
  // Funding verification
  fundingVerified: boolean("funding_verified").default(false),
  fundingNotes: text("funding_notes"),
  
  // Staff allocation
  allocatedStaffId: varchar("allocated_staff_id").references(() => staff.id),
  allocationDate: timestamp("allocation_date"),
  
  // Meet & greet
  meetGreetScheduled: timestamp("meet_greet_scheduled"),
  meetGreetCompleted: boolean("meet_greet_completed").default(false),
  meetGreetOutcome: varchar("meet_greet_outcome"), // successful, participant_declined, worker_declined, rescheduled
  
  // General fields
  referralDate: date("referral_date").notNull(),
  status: varchar("status").default("pending"), // pending, approved, rejected, on_hold
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
  referralId: varchar("referral_id").references(() => referrals.id),
  agreementNumber: varchar("agreement_number").unique().notNull(),
  
  // Agreement dates
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  renewalDate: date("renewal_date"),
  
  // Enhanced status tracking for workflow
  status: agreementStatusEnum("status").default("draft"),
  workflowStep: varchar("workflow_step"), // template_selected, pre_populated, sent_for_signature, viewed, signed
  
  // Template and content
  templateUsed: varchar("template_used"),
  documentUrl: varchar("document_url"),
  prepopulatedData: jsonb("prepopulated_data"),
  
  // E-signature integration
  signatureMethod: varchar("signature_method"), // docusign, adobe_sign, manual
  signatureRequestId: varchar("signature_request_id"),
  sentForSignatureAt: timestamp("sent_for_signature_at"),
  viewedAt: timestamp("viewed_at"),
  signedAt: timestamp("signed_at"),
  signatureIpAddress: varchar("signature_ip_address"),
  
  // Service details
  servicesIncluded: text("services_included").array(),
  specialConditions: text("special_conditions"),
  
  // Version control
  versionNumber: integer("version_number").default(1),
  previousVersionId: varchar("previous_version_id"),
  
  // Multi-language support
  language: varchar("language").default("en"),
  
  // Approval workflow
  createdBy: varchar("created_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2. HR & RECRUITMENT DEPARTMENT TABLES

// Job Postings table for recruitment
// COMPREHENSIVE RECRUITMENT & ONBOARDING MODULE - NDIS Compliant

// Job Requisitions - Initial hiring requests
export const jobRequisitions = pgTable("job_requisitions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  locations: text("locations").array().default(sql`'{}'::text[]`),
  awardLevel: varchar("award_level", { length: 50 }).notNull(), // SCHADS Level 2, 3, 4
  shiftType: varchar("shift_type", { length: 50 }).notNull(),
  employmentType: varchar("employment_type", { length: 50 }).notNull(),
  headcount: integer("headcount").default(1),
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
  essentialCriteria: text("essential_criteria").array(),
  desirableCriteria: text("desirable_criteria").array(),
  requiredChecks: text("required_checks").array(), // WWCC, Police, NDIS_WS, FirstAid, CPR
  closeDate: timestamp("close_date").notNull(),
  hiringTeam: text("hiring_team").array(),
  status: varchar("status", { length: 50 }).default("draft"),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedAt: timestamp("approved_at"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Job Posts - Published advertisements  
export const jobPosts = pgTable("job_posts", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  jobRequisitionId: varchar("job_requisition_id", { length: 255 }).references(() => jobRequisitions.id).notNull(),
  channel: varchar("channel", { length: 50 }).notNull(), // careers, seek, indeed
  externalId: varchar("external_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("draft"),
  publishedAt: timestamp("published_at"),
  closedAt: timestamp("closed_at"),
  analytics: jsonb("analytics"),
  utmTracking: jsonb("utm_tracking"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Recruitment Candidates
export const recruitmentCandidates = pgTable("recruitment_candidates", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  mobile: varchar("mobile", { length: 20 }),
  mobileVerified: boolean("mobile_verified").default(false),
  address: text("address"),
  postcode: varchar("postcode", { length: 10 }),
  rightToWork: boolean("right_to_work").default(false),
  hasLicense: boolean("has_license").default(false),
  hasVehicle: boolean("has_vehicle").default(false),
  languages: text("languages").array().default(sql`'{}'::text[]`),
  qualifications: text("qualifications").array().default(sql`'{}'::text[]`),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  source: varchar("source", { length: 100 }),
  status: varchar("status", { length: 50 }).default("active"),
  experienceYears: integer("experience_years").default(0),
  ndisExperience: boolean("ndis_experience").default(false),
  availability: jsonb("availability"),
  profileNotes: text("profile_notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Recruitment Applications - Enhanced
export const recruitmentApplications = pgTable("recruitment_applications", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id", { length: 255 }).references(() => recruitmentCandidates.id).notNull(),
  jobRequisitionId: varchar("job_requisition_id", { length: 255 }).references(() => jobRequisitions.id).notNull(),
  jobPostId: varchar("job_post_id", { length: 255 }).references(() => jobPosts.id),
  answers: jsonb("answers"),
  coverLetter: text("cover_letter"),
  score: decimal("score", { precision: 5, scale: 2 }),
  state: varchar("state", { length: 50 }).default("received"),
  rejectedReason: text("rejected_reason"),
  reviewerId: varchar("reviewer_id", { length: 255 }),
  reviewedAt: timestamp("reviewed_at"),
  autoScreeningResult: varchar("auto_screening_result", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Legacy job postings (keep for backward compatibility)
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

// FINANCE MODULE TABLES - Critical for Revenue Generation
// Note: invoices table already exists above with basic structure

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id", { length: 255 }).references(() => invoices.id).notNull(),
  serviceId: varchar("service_id", { length: 255 }).references(() => services.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  ndisItemNumber: varchar("ndis_item_number", { length: 20 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const payRuns = pgTable("pay_runs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  payDate: timestamp("pay_date").notNull(),
  status: varchar("status", { length: 50 }).default('draft'), // draft, approved, processing, completed
  totalGross: decimal("total_gross", { precision: 12, scale: 2 }).notNull(),
  totalTax: decimal("total_tax", { precision: 12, scale: 2 }).notNull(),
  totalSuper: decimal("total_super", { precision: 12, scale: 2 }).notNull(),
  totalNet: decimal("total_net", { precision: 12, scale: 2 }).notNull(),
  stpSubmissionId: varchar("stp_submission_id", { length: 100 }),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const paySlips = pgTable("pay_slips", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  payRunId: varchar("pay_run_id", { length: 255 }).references(() => payRuns.id).notNull(),
  staffId: varchar("staff_id", { length: 255 }).references(() => staff.id).notNull(),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  taxWithheld: decimal("tax_withheld", { precision: 10, scale: 2 }).notNull(),
  superContribution: decimal("super_contribution", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  ordinaryHours: decimal("ordinary_hours", { precision: 10, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 10, scale: 2 }),
  leaveHours: decimal("leave_hours", { precision: 10, scale: 2 }),
  ytdGross: decimal("ytd_gross", { precision: 12, scale: 2 }),
  ytdTax: decimal("ytd_tax", { precision: 12, scale: 2 }),
  ytdSuper: decimal("ytd_super", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Price Guide Documents table for SCHADS and NDIS master documents
export const priceGuideDocuments = pgTable("price_guide_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentType: priceGuideTypeEnum("document_type").notNull(),
  title: varchar("title").notNull(),
  version: varchar("version").notNull(),
  effectiveDate: date("effective_date").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  isActive: boolean("is_active").default(false),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  description: text("description"),
  ratesExtracted: boolean("rates_extracted").default(false),
  extractedRatesCount: integer("extracted_rates_count").default(0),
  extractionLog: jsonb("extraction_log"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Offboarding and Exit Management Tables
export const offboardingCases = pgTable("offboarding_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  resignationDate: date("resignation_date").notNull(),
  lastWorkingDay: date("last_working_day").notNull(),
  resignationReason: text("resignation_reason"),
  resignationType: resignationTypeEnum("resignation_type").notNull(),
  noticePeriod: integer("notice_period").notNull(), // in weeks
  exitSurveyCompleted: boolean("exit_survey_completed").default(false),
  offboardingStatus: offboardingStatusEnum("offboarding_status").default("initiated"),
  assignedHR: varchar("assigned_hr").references(() => users.id),
  completionPercentage: integer("completion_percentage").default(0),
  knowledgeTransferCompleted: boolean("knowledge_transfer_completed").default(false),
  equipmentReturned: boolean("equipment_returned").default(false),
  accessRevoked: boolean("access_revoked").default(false),
  finalPayProcessed: boolean("final_pay_processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exitSurveys = pgTable("exit_surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  offboardingCaseId: varchar("offboarding_case_id").references(() => offboardingCases.id),
  overallSatisfaction: integer("overall_satisfaction").notNull(), // 1-5 scale
  reasonForLeaving: text("reason_for_leaving").notNull(),
  workEnvironmentRating: integer("work_environment_rating").notNull(),
  managementRating: integer("management_rating").notNull(),
  careerDevelopmentRating: integer("career_development_rating").notNull(),
  compensationRating: integer("compensation_rating").notNull(),
  workLifeBalanceRating: integer("work_life_balance_rating").notNull(),
  wouldRecommendCompany: boolean("would_recommend_company").notNull(),
  improvementSuggestions: text("improvement_suggestions"),
  additionalComments: text("additional_comments"),
  feedbackCategories: text("feedback_categories").array(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  isAnonymous: boolean("is_anonymous").default(false),
});

export const offboardingTasks = pgTable("offboarding_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offboardingCaseId: varchar("offboarding_case_id").references(() => offboardingCases.id).notNull(),
  category: varchar("category").notNull(), // HR, IT, Payroll, Manager, etc.
  task: text("task").notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  dueDate: date("due_date"),
  priority: varchar("priority").default("medium"), // high, medium, low
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by").references(() => users.id),
  notes: text("notes"),
  documentRequired: boolean("document_required").default(false),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeTransfer = pgTable("knowledge_transfer", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offboardingCaseId: varchar("offboarding_case_id").references(() => offboardingCases.id).notNull(),
  departingStaffId: varchar("departing_staff_id").references(() => staff.id).notNull(),
  receivingStaffId: varchar("receiving_staff_id").references(() => staff.id),
  transferType: varchar("transfer_type").notNull(), // handover_document, training_session, shadowing
  title: varchar("title").notNull(),
  description: text("description"),
  priority: varchar("priority").default("medium"),
  status: varchar("status").default("pending"), // pending, in_progress, completed
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  documentUrl: text("document_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 4. SERVICE DELIVERY DEPARTMENT TABLES

// Shift Offers table for managing shift offers to staff
export const shiftOffers = pgTable("shift_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: varchar("shift_id").references(() => shifts.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  offerRank: integer("offer_rank").notNull(), // 1 = first choice, 2 = second, etc.
  offeredAt: timestamp("offered_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  responseStatus: varchar("response_status").default("pending"), // pending, accepted, declined, expired
  respondedAt: timestamp("responded_at"),
  declineReason: text("decline_reason"),
  autoDeclined: boolean("auto_declined").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Unavailability table for fortnightly submissions
export const staffUnavailability = pgTable("staff_unavailability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  dateFrom: date("date_from").notNull(),
  dateTo: date("date_to").notNull(),
  submissionPeriod: varchar("submission_period").notNull(), // e.g., "2025-W05-W06"
  reason: text("reason"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern"), // weekly, fortnightly
  allDay: boolean("all_day").default(true),
  startTime: varchar("start_time"), // For partial day unavailability
  endTime: varchar("end_time"),
  submittedAt: timestamp("submitted_at").notNull(),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  status: varchar("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shift Attendance table for clock-in/out tracking
export const shiftAttendance = pgTable("shift_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: varchar("shift_id").references(() => shifts.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  
  // Clock-in details
  clockInTime: timestamp("clock_in_time"),
  clockInLocation: text("clock_in_location"),
  clockInLat: decimal("clock_in_lat", { precision: 10, scale: 8 }),
  clockInLng: decimal("clock_in_lng", { precision: 11, scale: 8 }),
  clockInMethod: varchar("clock_in_method"), // app, manual, phone
  
  // Clock-out details
  clockOutTime: timestamp("clock_out_time"),
  clockOutLocation: text("clock_out_location"),
  clockOutLat: decimal("clock_out_lat", { precision: 10, scale: 8 }),
  clockOutLng: decimal("clock_out_lng", { precision: 11, scale: 8 }),
  clockOutMethod: varchar("clock_out_method"),
  
  // Duration tracking
  actualDuration: integer("actual_duration"), // in minutes
  travelTime: integer("travel_time"), // in minutes
  breakTime: integer("break_time"), // in minutes
  
  // Geo-fence compliance
  geoFenceViolations: integer("geo_fence_violations").default(0),
  geoFenceOverride: boolean("geo_fence_override").default(false),
  overrideReason: text("override_reason"),
  overrideBy: varchar("override_by").references(() => users.id),
  
  // Additional tracking
  tasks: jsonb("tasks"), // Checklist of completed tasks
  progressNotes: text("progress_notes"),
  incidents: jsonb("incidents"), // Any incidents during shift
  photos: text("photos").array(), // Photo URLs for verification
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Allocation Scores table for ranking
export const staffAllocationScores = pgTable("staff_allocation_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: varchar("shift_id").references(() => shifts.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  
  // Individual scores (0-100)
  distanceScore: integer("distance_score"),
  distanceKm: decimal("distance_km", { precision: 5, scale: 2 }),
  travelTimeMinutes: integer("travel_time_minutes"),
  
  skillsScore: integer("skills_score"),
  matchedSkills: text("matched_skills").array(),
  missingSkills: text("missing_skills").array(),
  
  preferenceScore: integer("preference_score"),
  isPreferredStaff: boolean("is_preferred_staff").default(false),
  
  continuityScore: integer("continuity_score"),
  previousShiftsCount: integer("previous_shifts_count").default(0),
  
  reliabilityScore: integer("reliability_score"),
  attendanceRate: decimal("attendance_rate", { precision: 5, scale: 2 }),
  
  costScore: integer("cost_score"),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  
  // Total and ranking
  totalScore: integer("total_score").notNull(),
  rank: integer("rank"),
  isEligible: boolean("is_eligible").default(true),
  ineligibleReason: text("ineligible_reason"),
  
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Billing Lines table for NDIS billing
export const billingLines = pgTable("billing_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shiftId: varchar("shift_id").references(() => shifts.id),
  timesheetId: varchar("timesheet_id"),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  
  // NDIS billing details
  ndisItemNumber: varchar("ndis_item_number").notNull(),
  ndisItemName: text("ndis_item_name"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 8, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  gstAmount: decimal("gst_amount", { precision: 8, scale: 2 }).default('0'),
  
  // Claim details
  claimReference: varchar("claim_reference"),
  claimType: varchar("claim_type"), // portal, plan_manager, self_managed
  claimStatus: varchar("claim_status").default("pending"), // pending, submitted, accepted, rejected
  claimSubmittedAt: timestamp("claim_submitted_at"),
  claimResponseAt: timestamp("claim_response_at"),
  rejectionReason: text("rejection_reason"),
  
  // Travel and cancellation
  includesTravel: boolean("includes_travel").default(false),
  travelAmount: decimal("travel_amount", { precision: 8, scale: 2 }),
  isCancellation: boolean("is_cancellation").default(false),
  cancellationReason: text("cancellation_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

// Add new tables for enhanced workflow management

// Service Agreement Templates table
export const serviceAgreementTemplates = pgTable("service_agreement_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  templateType: varchar("template_type").notNull(), // standard, complex_needs, short_term, respite
  
  // Template content
  templateContent: text("template_content").notNull(),
  placeholderFields: jsonb("placeholder_fields"), // Fields that need to be filled
  
  // NDIS compliance
  ndisCompliant: boolean("ndis_compliant").default(true),
  complianceNotes: text("compliance_notes"),
  
  // Multi-language templates
  availableLanguages: text("available_languages").array(),
  translations: jsonb("translations"),
  
  // Versioning
  version: varchar("version").notNull(),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Funding Budget Tracking table
export const fundingBudgets = pgTable("funding_budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  planId: varchar("plan_id").references(() => ndisPlans.id).notNull(),
  
  // Budget categories
  coreBudget: decimal("core_budget", { precision: 10, scale: 2 }),
  coreUsed: decimal("core_used", { precision: 10, scale: 2 }).default("0"),
  coreRemaining: decimal("core_remaining", { precision: 10, scale: 2 }),
  
  capacityBuildingBudget: decimal("capacity_building_budget", { precision: 10, scale: 2 }),
  capacityBuildingUsed: decimal("capacity_building_used", { precision: 10, scale: 2 }).default("0"),
  capacityBuildingRemaining: decimal("capacity_building_remaining", { precision: 10, scale: 2 }),
  
  capitalBudget: decimal("capital_budget", { precision: 10, scale: 2 }),
  capitalUsed: decimal("capital_used", { precision: 10, scale: 2 }).default("0"),
  capitalRemaining: decimal("capital_remaining", { precision: 10, scale: 2 }),
  
  // Verification status
  verificationStatus: varchar("verification_status").default("pending"), // pending, verified, insufficient_funds
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  verificationNotes: text("verification_notes"),
  
  // Alerts
  alertThreshold: integer("alert_threshold").default(20), // Percentage
  alertSent: boolean("alert_sent").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meet & Greet Scheduling table
export const meetGreets = pgTable("meet_greets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").references(() => referrals.id),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  
  // Scheduling
  scheduledDate: timestamp("scheduled_date").notNull(),
  location: varchar("location"),
  locationType: varchar("location_type"), // in_person, virtual, phone
  meetingLink: varchar("meeting_link"),
  
  // Status tracking
  status: varchar("status").default("scheduled"), // scheduled, completed, cancelled, rescheduled, no_show
  
  // Feedback from both parties
  participantAttended: boolean("participant_attended"),
  staffAttended: boolean("staff_attended"),
  participantDecision: varchar("participant_decision"), // accept, decline, undecided
  staffDecision: varchar("staff_decision"), // accept, decline, undecided
  participantFeedback: text("participant_feedback"),
  staffFeedback: text("staff_feedback"),
  
  // Outcome
  outcome: varchar("outcome"), // successful, participant_declined, worker_declined, rescheduled, no_decision
  nextSteps: text("next_steps"),
  
  // Notifications
  participantNotified: boolean("participant_notified").default(false),
  staffNotified: boolean("staff_notified").default(false),
  reminderSent: boolean("reminder_sent").default(false),
  
  createdBy: varchar("created_by").references(() => users.id),
  completedBy: varchar("completed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Matching Criteria table
export const staffMatchingCriteria = pgTable("staff_matching_criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  
  // Location preferences
  preferredLocations: text("preferred_locations").array(),
  maxTravelDistance: integer("max_travel_distance"), // in km
  
  // Skills and qualifications
  requiredQualifications: text("required_qualifications").array(),
  preferredQualifications: text("preferred_qualifications").array(),
  requiredSkills: text("required_skills").array(),
  
  // Availability
  preferredDays: text("preferred_days").array(),
  preferredTimes: text("preferred_times").array(),
  
  // Personal preferences
  genderPreference: varchar("gender_preference"),
  languagePreference: text("language_preference").array(),
  culturalRequirements: text("cultural_requirements"),
  
  // Matching score thresholds
  minimumMatchScore: integer("minimum_match_score").default(70),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflow Audit Log table
export const workflowAuditLog = pgTable("workflow_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(), // referral, service_agreement, funding, meet_greet
  entityId: varchar("entity_id").notNull(),
  
  // Workflow tracking
  previousStatus: varchar("previous_status"),
  newStatus: varchar("new_status"),
  action: varchar("action").notNull(),
  
  // User tracking
  performedBy: varchar("performed_by").references(() => users.id),
  performedByRole: varchar("performed_by_role"),
  
  // Details
  details: jsonb("details"),
  notes: text("notes"),
  
  // Compliance
  isCompliant: boolean("is_compliant").default(true),
  complianceNotes: text("compliance_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// STATES AND REGIONS MANAGEMENT

// Australian States and Territories table
export const states = pgTable("states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  abbreviation: varchar("abbreviation", { length: 3 }).notNull().unique(),
  type: varchar("type").notNull().default("state"), // state, territory
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Regional divisions within states
export const regions = pgTable("regions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  stateId: varchar("state_id").references(() => states.id).notNull(),
  postcodeLow: varchar("postcode_low", { length: 4 }),
  postcodeHigh: varchar("postcode_high", { length: 4 }),
  description: text("description"),
  majorTowns: text("major_towns").array(),
  coordinates: jsonb("coordinates"), // Lat/lng boundaries for mapping
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Department-Region assignments for operational coverage
export const departmentRegions = pgTable("department_regions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  departmentName: varchar("department_name").notNull(),
  regionId: varchar("region_id").references(() => regions.id).notNull(),
  isActive: boolean("is_active").default(true),
  operationalPriority: varchar("operational_priority").default("standard"), // high, standard, low
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// XERO INTEGRATION TABLES

// Xero Configuration table
export const xeroConfig = pgTable("xero_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(), // From Xero
  tenantId: varchar("tenant_id").notNull().unique(), // Xero Tenant ID
  tenantName: varchar("tenant_name"),
  tenantType: varchar("tenant_type"), // ORGANISATION, COMPANY, etc.
  
  // OAuth2 tokens
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  scopes: text("scopes").array(),
  
  // Connection details
  connectedAt: timestamp("connected_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
  syncEnabled: boolean("sync_enabled").default(true),
  
  // Sync settings
  syncInvoices: boolean("sync_invoices").default(true),
  syncPayments: boolean("sync_payments").default(true),
  syncContacts: boolean("sync_contacts").default(true),
  syncBankTransactions: boolean("sync_bank_transactions").default(false),
  autoReconcile: boolean("auto_reconcile").default(false),
  
  // Default accounts (Xero account codes)
  defaultSalesAccount: varchar("default_sales_account"),
  defaultTaxRate: varchar("default_tax_rate"),
  defaultBrandingTheme: varchar("default_branding_theme"),
  
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Xero Invoice Sync table
export const xeroInvoiceSync = pgTable("xero_invoice_sync", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id).notNull(),
  xeroInvoiceId: varchar("xero_invoice_id").unique(),
  xeroInvoiceNumber: varchar("xero_invoice_number"),
  
  // Sync status
  syncStatus: varchar("sync_status").default("pending"), // pending, synced, error, cancelled
  syncDirection: varchar("sync_direction").default("to_xero"), // to_xero, from_xero
  lastSyncedAt: timestamp("last_synced_at"),
  
  // Xero details
  xeroStatus: varchar("xero_status"), // DRAFT, SUBMITTED, AUTHORISED, PAID, VOIDED
  xeroTotal: decimal("xero_total", { precision: 10, scale: 2 }),
  xeroCurrencyCode: varchar("xero_currency_code").default("AUD"),
  xeroReference: varchar("xero_reference"),
  xeroUrl: varchar("xero_url"), // Direct link to invoice in Xero
  
  // Payment status
  xeroAmountPaid: decimal("xero_amount_paid", { precision: 10, scale: 2 }).default("0"),
  xeroAmountDue: decimal("xero_amount_due", { precision: 10, scale: 2 }),
  xeroFullyPaidDate: timestamp("xero_fully_paid_date"),
  
  // Error tracking
  errorMessage: text("error_message"),
  errorDetails: jsonb("error_details"),
  retryCount: integer("retry_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Xero Contact Sync table
export const xeroContactSync = pgTable("xero_contact_sync", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id),
  staffId: varchar("staff_id").references(() => staff.id),
  xeroContactId: varchar("xero_contact_id").unique().notNull(),
  
  // Contact details from Xero
  xeroContactName: varchar("xero_contact_name"),
  xeroContactNumber: varchar("xero_contact_number"),
  xeroEmail: varchar("xero_email"),
  xeroTaxNumber: varchar("xero_tax_number"),
  
  // Sync details
  syncStatus: varchar("sync_status").default("synced"),
  syncDirection: varchar("sync_direction").default("to_xero"),
  lastSyncedAt: timestamp("last_synced_at"),
  
  // Contact type
  contactType: varchar("contact_type").notNull(), // participant, staff, supplier
  isCustomer: boolean("is_customer").default(true),
  isSupplier: boolean("is_supplier").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Xero Bank Reconciliation table
export const xeroBankReconciliation = pgTable("xero_bank_reconciliation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  xeroAccountId: varchar("xero_account_id").notNull(),
  xeroAccountName: varchar("xero_account_name"),
  
  // Transaction details
  xeroBankTransactionId: varchar("xero_bank_transaction_id").unique(),
  transactionDate: date("transaction_date").notNull(),
  reference: varchar("reference"),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Reconciliation details
  reconciliationStatus: varchar("reconciliation_status").default("unreconciled"), // unreconciled, reconciled, error
  reconciledAt: timestamp("reconciled_at"),
  reconciledBy: varchar("reconciled_by").references(() => users.id),
  
  // Matching
  matchedInvoiceId: varchar("matched_invoice_id").references(() => invoices.id),
  matchedPaymentId: varchar("matched_payment_id"),
  matchConfidence: integer("match_confidence"), // 0-100 percentage
  matchMethod: varchar("match_method"), // auto, manual, suggested
  
  // Error tracking
  errorMessage: text("error_message"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Xero Sync Log table
export const xeroSyncLog = pgTable("xero_sync_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncType: varchar("sync_type").notNull(), // invoices, payments, contacts, bank_transactions
  syncDirection: varchar("sync_direction").notNull(), // to_xero, from_xero
  
  // Sync details
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  status: varchar("status").default("running"), // running, completed, failed, partial
  
  // Statistics
  totalRecords: integer("total_records").default(0),
  successfulRecords: integer("successful_records").default(0),
  failedRecords: integer("failed_records").default(0),
  skippedRecords: integer("skipped_records").default(0),
  
  // Error tracking
  errors: jsonb("errors"),
  warnings: jsonb("warnings"),
  
  // Metadata
  syncedBy: varchar("synced_by").references(() => users.id),
  isScheduled: boolean("is_scheduled").default(false),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

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

// States relations
export const statesRelations = relations(states, ({ many }) => ({
  regions: many(regions),
}));

// Regions relations
export const regionsRelations = relations(regions, ({ one, many }) => ({
  state: one(states, {
    fields: [regions.stateId],
    references: [states.id],
  }),
  departmentRegions: many(departmentRegions),
}));

// Department Regions relations
export const departmentRegionsRelations = relations(departmentRegions, ({ one }) => ({
  region: one(regions, {
    fields: [departmentRegions.regionId],
    references: [regions.id],
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

// Offboarding and Exit Survey schemas
export const insertOffboardingCaseSchema = createInsertSchema(offboardingCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExitSurveySchema = createInsertSchema(exitSurveys).omit({
  id: true,
  submittedAt: true,
});

export const insertOffboardingTaskSchema = createInsertSchema(offboardingTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeTransferSchema = createInsertSchema(knowledgeTransfer).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Participant Exit/Offboarding Tables
export const participantOffboardingCases = pgTable("participant_offboarding_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  exitDate: date("exit_date").notNull(),
  exitReason: text("exit_reason"),
  exitType: varchar("exit_type").notNull(), // plan_ended, participant_choice, provider_initiated, deceased, moved
  finalShiftDate: date("final_shift_date"),
  finalInvoiceCompleted: boolean("final_invoice_completed").default(false),
  clientSurveyCompleted: boolean("client_survey_completed").default(false),
  offboardingStatus: varchar("offboarding_status").default("initiated"), // initiated, invoicing, survey_pending, completed
  assignedCoordinator: varchar("assigned_coordinator").references(() => users.id),
  completionPercentage: integer("completion_percentage").default(0),
  outstandingAmount: decimal("outstanding_amount", { precision: 10, scale: 2 }).default("0.00"),
  ndisClaimReconciled: boolean("ndis_claim_reconciled").default(false),
  servicesTransferred: boolean("services_transferred").default(false),
  documentsArchived: boolean("documents_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientExitSurveys = pgTable("client_exit_surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  offboardingCaseId: varchar("offboarding_case_id").references(() => participantOffboardingCases.id),
  overallSatisfaction: integer("overall_satisfaction").notNull(), // 1-5 scale
  serviceQualityRating: integer("service_quality_rating").notNull(),
  staffProfessionalismRating: integer("staff_professionalism_rating").notNull(),
  communicationRating: integer("communication_rating").notNull(),
  valueForMoneyRating: integer("value_for_money_rating").notNull(),
  goalAchievementRating: integer("goal_achievement_rating").notNull(),
  wouldRecommendService: boolean("would_recommend_service").notNull(),
  reasonForLeaving: text("reason_for_leaving").notNull(),
  improvementSuggestions: text("improvement_suggestions"),
  additionalComments: text("additional_comments"),
  experienceCategories: text("experience_categories").array(),
  completedBy: varchar("completed_by").notNull(), // participant, guardian, advocate
  submittedAt: timestamp("submitted_at").defaultNow(),
  isAnonymous: boolean("is_anonymous").default(false),
});

export const participantFinalInvoicing = pgTable("participant_final_invoicing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  offboardingCaseId: varchar("offboarding_case_id").references(() => participantOffboardingCases.id).notNull(),
  finalShiftDate: date("final_shift_date").notNull(),
  totalOutstandingHours: decimal("total_outstanding_hours", { precision: 8, scale: 2 }).notNull(),
  totalOutstandingAmount: decimal("total_outstanding_amount", { precision: 10, scale: 2 }).notNull(),
  invoiceGenerated: boolean("invoice_generated").default(false),
  invoiceNumber: varchar("invoice_number"),
  invoiceDate: date("invoice_date"),
  ndisClaimSubmitted: boolean("ndis_claim_submitted").default(false),
  ndisClaimReference: varchar("ndis_claim_reference"),
  paidInFull: boolean("paid_in_full").default(false),
  paymentDate: date("payment_date"),
  reconciliationComplete: boolean("reconciliation_complete").default(false),
  reconciliationNotes: text("reconciliation_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Participant Offboarding schemas
export const insertParticipantOffboardingCaseSchema = createInsertSchema(participantOffboardingCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientExitSurveySchema = createInsertSchema(clientExitSurveys).omit({
  id: true,
  submittedAt: true,
});

export const insertParticipantFinalInvoicingSchema = createInsertSchema(participantFinalInvoicing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Staff Availability Management Tables
export const staffAvailabilitySchedules = pgTable("staff_availability_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  date: date("date").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6, Monday = 1
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
  unavailabilityReason: text("unavailability_reason"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern"), // weekly, fortnightly, monthly
  recurringEndDate: date("recurring_end_date"),
  submissionPeriod: varchar("submission_period").notNull(), // "2025-01-01_2025-01-14"
  lastSubmitted: timestamp("last_submitted"),
  isEditable: boolean("is_editable").default(true),
  shiftAssigned: boolean("shift_assigned").default(false),
  assignedShiftId: varchar("assigned_shift_id").references(() => shifts.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const staffAvailabilitySubmissions = pgTable("staff_availability_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  submissionPeriod: varchar("submission_period").notNull(), // "2025-01-01_2025-01-14"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  status: varchar("status").default("pending"), // pending, submitted, approved, rejected
  totalAvailableHours: decimal("total_available_hours", { precision: 8, scale: 2 }).default("0.00"),
  totalUnavailableHours: decimal("total_unavailable_hours", { precision: 8, scale: 2 }).default("0.00"),
  mandatorySubmission: boolean("mandatory_submission").default(true),
  employmentType: varchar("employment_type").notNull(), // casual, permanent, contract
  submissionDeadline: timestamp("submission_deadline"),
  reminderSent: boolean("reminder_sent").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
});

export const shiftRequirements = pgTable("shift_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id),
  date: date("date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  serviceType: varchar("service_type").notNull(),
  requiredSkills: text("required_skills").array(),
  requiredCertifications: text("required_certifications").array(),
  preferredStaffId: varchar("preferred_staff_id").references(() => staff.id),
  staffAssigned: varchar("staff_assigned").references(() => staff.id),
  assignmentMethod: varchar("assignment_method"), // manual, auto, preference
  assignedAt: timestamp("assigned_at"),
  status: varchar("status").default("open"), // open, assigned, confirmed, in_progress, completed, cancelled
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  location: text("location"),
  specialInstructions: text("special_instructions"),
  budgetCode: varchar("budget_code"),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  estimatedDuration: decimal("estimated_duration", { precision: 4, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const availabilityReminders = pgTable("availability_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  submissionPeriod: varchar("submission_period").notNull(),
  reminderType: varchar("reminder_type").notNull(), // initial, follow_up, final, overdue
  sentAt: timestamp("sent_at").defaultNow(),
  method: varchar("method").notNull(), // email, sms, in_app
  status: varchar("status").default("sent"), // sent, delivered, failed, clicked
  nextReminderAt: timestamp("next_reminder_at"),
  content: text("content"),
});

// Staff Availability schemas
export const insertStaffAvailabilityScheduleSchema = createInsertSchema(staffAvailabilitySchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffAvailabilitySubmissionSchema = createInsertSchema(staffAvailabilitySubmissions).omit({
  id: true,
  submittedAt: true,
  approvedAt: true,
});

export const insertShiftRequirementSchema = createInsertSchema(shiftRequirements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedAt: true,
});

export const insertAvailabilityReminderSchema = createInsertSchema(availabilityReminders).omit({
  id: true,
  sentAt: true,
});

// Leave Management Tables
export const leaveTypes = pgTable("leave_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // Annual, Sick, Personal, Compassionate, etc.
  description: text("description"),
  maxDaysPerYear: integer("max_days_per_year"),
  carryOverAllowed: boolean("carry_over_allowed").default(false),
  maxCarryOverDays: integer("max_carry_over_days").default(0),
  requiresMedicalCertificate: boolean("requires_medical_certificate").default(false),
  medicalCertificateThreshold: integer("medical_certificate_threshold").default(3), // days
  paidLeave: boolean("paid_leave").default(true),
  advanceNoticeRequired: integer("advance_notice_required").default(14), // days
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const staffLeaveBalances = pgTable("staff_leave_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  leaveTypeId: varchar("leave_type_id").references(() => leaveTypes.id).notNull(),
  totalEntitlement: decimal("total_entitlement", { precision: 5, scale: 2 }).notNull(),
  usedDays: decimal("used_days", { precision: 5, scale: 2 }).default("0.00"),
  pendingDays: decimal("pending_days", { precision: 5, scale: 2 }).default("0.00"),
  remainingDays: decimal("remaining_days", { precision: 5, scale: 2 }).notNull(),
  carryOverDays: decimal("carry_over_days", { precision: 5, scale: 2 }).default("0.00"),
  accrualRate: decimal("accrual_rate", { precision: 5, scale: 4 }).default("0.0000"), // days per pay period
  lastAccrual: date("last_accrual"),
  financialYear: varchar("financial_year").notNull(), // "2024-2025"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  leaveTypeId: varchar("leave_type_id").references(() => leaveTypes.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: decimal("total_days", { precision: 5, scale: 2 }).notNull(),
  halfDayType: varchar("half_day_type"), // morning, afternoon, null for full days
  reason: text("reason").notNull(),
  emergencyContact: text("emergency_contact"),
  medicalCertificateRequired: boolean("medical_certificate_required").default(false),
  medicalCertificateUploaded: boolean("medical_certificate_uploaded").default(false),
  medicalCertificateUrl: varchar("medical_certificate_url"),
  status: varchar("status").default("pending"), // pending, approved, rejected, cancelled
  submittedAt: timestamp("submitted_at").defaultNow(),
  approvalLevel: integer("approval_level").default(1),
  currentApproverId: varchar("current_approver_id").references(() => users.id),
  finalApproverId: varchar("final_approver_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  handoverNotes: text("handover_notes"),
  coveringStaffId: varchar("covering_staff_id").references(() => staff.id),
  managerNotified: boolean("manager_notified").default(false),
  hrNotified: boolean("hr_notified").default(false),
  payrollNotified: boolean("payroll_notified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leaveApprovals = pgTable("leave_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leaveRequestId: varchar("leave_request_id").references(() => leaveRequests.id).notNull(),
  approverId: varchar("approver_id").references(() => users.id).notNull(),
  approvalLevel: integer("approval_level").notNull(),
  status: varchar("status").notNull(), // pending, approved, rejected
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  comments: text("comments"),
  delegatedTo: varchar("delegated_to").references(() => users.id),
  isDelegated: boolean("is_delegated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leaveApprovalHierarchy = pgTable("leave_approval_hierarchy", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  approvalLevel: integer("approval_level").notNull(),
  approverId: varchar("approver_id").references(() => users.id).notNull(),
  approverRole: varchar("approver_role").notNull(), // direct_manager, department_head, hr_manager, ceo
  isActive: boolean("is_active").default(true),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const publicHolidays = pgTable("public_holidays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  date: date("date").notNull(),
  description: text("description"),
  isNational: boolean("is_national").default(true),
  stateTerritory: varchar("state_territory"), // NSW, VIC, QLD, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leave Management schemas
export const insertLeaveTypeSchema = createInsertSchema(leaveTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffLeaveBalanceSchema = createInsertSchema(staffLeaveBalances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  submittedAt: true,
  approvedAt: true,
  rejectedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaveApprovalSchema = createInsertSchema(leaveApprovals).omit({
  id: true,
  approvedAt: true,
  rejectedAt: true,
  createdAt: true,
});

export const insertLeaveApprovalHierarchySchema = createInsertSchema(leaveApprovalHierarchy).omit({
  id: true,
  createdAt: true,
});

export const insertPublicHolidaySchema = createInsertSchema(publicHolidays).omit({
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
export type InsertPlanDocument = z.infer<typeof insertPlanDocumentSchema>;
export type PlanDocument = typeof planDocuments.$inferSelect;
export type InsertDigitalServiceAgreement = z.infer<typeof insertDigitalServiceAgreementSchema>;
export type DigitalServiceAgreement = typeof digitalServiceAgreements.$inferSelect;
export type InsertAgreementCommunication = z.infer<typeof insertAgreementCommunicationSchema>;
export type AgreementCommunication = typeof agreementCommunications.$inferSelect;

// Offboarding and Exit Survey types
export type InsertOffboardingCase = z.infer<typeof insertOffboardingCaseSchema>;
export type OffboardingCase = typeof offboardingCases.$inferSelect;
export type InsertExitSurvey = z.infer<typeof insertExitSurveySchema>;
export type ExitSurvey = typeof exitSurveys.$inferSelect;
export type InsertOffboardingTask = z.infer<typeof insertOffboardingTaskSchema>;
export type OffboardingTask = typeof offboardingTasks.$inferSelect;
export type InsertKnowledgeTransfer = z.infer<typeof insertKnowledgeTransferSchema>;
export type KnowledgeTransfer = typeof knowledgeTransfer.$inferSelect;

// Participant Offboarding types
export type InsertParticipantOffboardingCase = z.infer<typeof insertParticipantOffboardingCaseSchema>;
export type ParticipantOffboardingCase = typeof participantOffboardingCases.$inferSelect;
export type InsertClientExitSurvey = z.infer<typeof insertClientExitSurveySchema>;
export type ClientExitSurvey = typeof clientExitSurveys.$inferSelect;
export type InsertParticipantFinalInvoicing = z.infer<typeof insertParticipantFinalInvoicingSchema>;
export type ParticipantFinalInvoicing = typeof participantFinalInvoicing.$inferSelect;

// Staff Availability types
export type InsertStaffAvailabilitySchedule = z.infer<typeof insertStaffAvailabilityScheduleSchema>;
export type StaffAvailabilitySchedule = typeof staffAvailabilitySchedules.$inferSelect;
export type InsertStaffAvailabilitySubmission = z.infer<typeof insertStaffAvailabilitySubmissionSchema>;
export type StaffAvailabilitySubmission = typeof staffAvailabilitySubmissions.$inferSelect;
export type InsertShiftRequirement = z.infer<typeof insertShiftRequirementSchema>;
export type ShiftRequirement = typeof shiftRequirements.$inferSelect;
export type InsertAvailabilityReminder = z.infer<typeof insertAvailabilityReminderSchema>;
export type AvailabilityReminder = typeof availabilityReminders.$inferSelect;

// Leave Management types
export type InsertLeaveType = z.infer<typeof insertLeaveTypeSchema>;
export type LeaveType = typeof leaveTypes.$inferSelect;
export type InsertStaffLeaveBalance = z.infer<typeof insertStaffLeaveBalanceSchema>;
export type StaffLeaveBalance = typeof staffLeaveBalances.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveApproval = z.infer<typeof insertLeaveApprovalSchema>;
export type LeaveApproval = typeof leaveApprovals.$inferSelect;
export type InsertLeaveApprovalHierarchy = z.infer<typeof insertLeaveApprovalHierarchySchema>;
export type LeaveApprovalHierarchy = typeof leaveApprovalHierarchy.$inferSelect;
export type InsertPublicHoliday = z.infer<typeof insertPublicHolidaySchema>;
export type PublicHoliday = typeof publicHolidays.$inferSelect;
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
