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

// NDIS Plans table
export const ndisPlans = pgTable("ndis_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").references(() => participants.id).notNull(),
  planNumber: varchar("plan_number").unique().notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: planStatusEnum("status").default("active"),
  totalBudget: decimal("total_budget", { precision: 10, scale: 2 }),
  coreSupportsbudget: decimal("core_supports_budget", { precision: 10, scale: 2 }),
  capacityBuildingBudget: decimal("capacity_building_budget", { precision: 10, scale: 2 }),
  capitalSupportsBudget: decimal("capital_supports_budget", { precision: 10, scale: 2 }),
  planManagerName: varchar("plan_manager_name"),
  planManagerContact: varchar("plan_manager_contact"),
  goals: text("goals"),
  reviewDate: date("review_date"),
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

// Define relations
export const participantsRelations = relations(participants, ({ many }) => ({
  plans: many(ndisPlans),
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertNdisPlan = z.infer<typeof insertNdisplanSchema>;
export type NdisPlan = typeof ndisPlans.$inferSelect;
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
