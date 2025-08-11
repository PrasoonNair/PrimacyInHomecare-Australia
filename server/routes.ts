import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertParticipantSchema,
  insertNdisplanSchema,
  insertStaffSchema,
  insertServiceSchema,
  insertProgressNoteSchema,
  insertInvoiceSchema,
  insertInvoiceLineItemSchema,
  // Department schemas
  insertReferralSchema,
  insertServiceAgreementSchema,
  insertStaffQualificationSchema,
  insertPerformanceReviewSchema,
  insertAwardRateSchema,
  insertPayrollSchema,
  insertShiftSchema,
  insertStaffAvailabilitySchema,
  insertAuditSchema,
  insertIncidentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Participant routes
  app.get("/api/participants", isAuthenticated, async (req, res) => {
    try {
      const participants = await storage.getParticipants();
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  app.get("/api/participants/:id", isAuthenticated, async (req, res) => {
    try {
      const participant = await storage.getParticipant(req.params.id);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      res.json(participant);
    } catch (error) {
      console.error("Error fetching participant:", error);
      res.status(500).json({ message: "Failed to fetch participant" });
    }
  });

  app.post("/api/participants", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertParticipantSchema.parse(req.body);
      const participant = await storage.createParticipant(validatedData);
      res.status(201).json(participant);
    } catch (error) {
      console.error("Error creating participant:", error);
      res.status(400).json({ message: "Failed to create participant" });
    }
  });

  app.put("/api/participants/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertParticipantSchema.partial().parse(req.body);
      const participant = await storage.updateParticipant(req.params.id, validatedData);
      res.json(participant);
    } catch (error) {
      console.error("Error updating participant:", error);
      res.status(400).json({ message: "Failed to update participant" });
    }
  });

  app.delete("/api/participants/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteParticipant(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting participant:", error);
      res.status(500).json({ message: "Failed to delete participant" });
    }
  });

  // NDIS Plan routes
  app.get("/api/plans", isAuthenticated, async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get("/api/plans/participant/:participantId", isAuthenticated, async (req, res) => {
    try {
      const plans = await storage.getPlansByParticipant(req.params.participantId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching participant plans:", error);
      res.status(500).json({ message: "Failed to fetch participant plans" });
    }
  });

  app.post("/api/plans", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertNdisplanSchema.parse(req.body);
      const plan = await storage.createPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(400).json({ message: "Failed to create plan" });
    }
  });

  // Staff routes
  app.get("/api/staff", isAuthenticated, async (req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post("/api/staff", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const staffMember = await storage.createStaffMember(validatedData);
      res.status(201).json(staffMember);
    } catch (error) {
      console.error("Error creating staff member:", error);
      res.status(400).json({ message: "Failed to create staff member" });
    }
  });

  // Service routes
  app.get("/api/services", isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let services;
      
      if (startDate && endDate) {
        services = await storage.getServicesByDateRange(new Date(startDate as string), new Date(endDate as string));
      } else {
        services = await storage.getServices();
      }
      
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/upcoming", isAuthenticated, async (req, res) => {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const services = await storage.getServicesByDateRange(today, nextWeek);
      res.json(services);
    } catch (error) {
      console.error("Error fetching upcoming services:", error);
      res.status(500).json({ message: "Failed to fetch upcoming services" });
    }
  });

  app.post("/api/services", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/services/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, validatedData);
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(400).json({ message: "Failed to update service" });
    }
  });

  // Progress Notes routes
  app.get("/api/progress-notes", isAuthenticated, async (req, res) => {
    try {
      const notes = await storage.getProgressNotes();
      res.json(notes);
    } catch (error) {
      console.error("Error fetching progress notes:", error);
      res.status(500).json({ message: "Failed to fetch progress notes" });
    }
  });

  app.get("/api/progress-notes/participant/:participantId", isAuthenticated, async (req, res) => {
    try {
      const notes = await storage.getProgressNotesByParticipant(req.params.participantId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching participant progress notes:", error);
      res.status(500).json({ message: "Failed to fetch participant progress notes" });
    }
  });

  app.post("/api/progress-notes", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProgressNoteSchema.parse(req.body);
      const note = await storage.createProgressNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating progress note:", error);
      res.status(400).json({ message: "Failed to create progress note" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

  // Department routes - Intake
  app.get("/api/referrals", isAuthenticated, async (req, res) => {
    try {
      const referrals = await storage.getReferrals();
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.post("/api/referrals", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertReferralSchema.parse(req.body);
      const referral = await storage.createReferral(validatedData);
      res.status(201).json(referral);
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(400).json({ message: "Failed to create referral" });
    }
  });

  app.get("/api/service-agreements", isAuthenticated, async (req, res) => {
    try {
      const agreements = await storage.getServiceAgreements();
      res.json(agreements);
    } catch (error) {
      console.error("Error fetching service agreements:", error);
      res.status(500).json({ message: "Failed to fetch service agreements" });
    }
  });

  app.post("/api/service-agreements", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertServiceAgreementSchema.parse(req.body);
      const agreement = await storage.createServiceAgreement(validatedData);
      res.status(201).json(agreement);
    } catch (error) {
      console.error("Error creating service agreement:", error);
      res.status(400).json({ message: "Failed to create service agreement" });
    }
  });

  // Department routes - HR & Recruitment
  app.get("/api/staff-qualifications", isAuthenticated, async (req, res) => {
    try {
      const qualifications = await storage.getStaffQualifications();
      res.json(qualifications);
    } catch (error) {
      console.error("Error fetching staff qualifications:", error);
      res.status(500).json({ message: "Failed to fetch staff qualifications" });
    }
  });

  app.post("/api/staff-qualifications", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStaffQualificationSchema.parse(req.body);
      const qualification = await storage.createStaffQualification(validatedData);
      res.status(201).json(qualification);
    } catch (error) {
      console.error("Error creating staff qualification:", error);
      res.status(400).json({ message: "Failed to create staff qualification" });
    }
  });

  app.get("/api/performance-reviews", isAuthenticated, async (req, res) => {
    try {
      const reviews = await storage.getPerformanceReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching performance reviews:", error);
      res.status(500).json({ message: "Failed to fetch performance reviews" });
    }
  });

  app.post("/api/performance-reviews", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPerformanceReviewSchema.parse(req.body);
      const review = await storage.createPerformanceReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating performance review:", error);
      res.status(400).json({ message: "Failed to create performance review" });
    }
  });

  // Department routes - Finance & Awards
  app.get("/api/award-rates", isAuthenticated, async (req, res) => {
    try {
      const rates = await storage.getAwardRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching award rates:", error);
      res.status(500).json({ message: "Failed to fetch award rates" });
    }
  });

  app.post("/api/award-rates", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAwardRateSchema.parse(req.body);
      const rate = await storage.createAwardRate(validatedData);
      res.status(201).json(rate);
    } catch (error) {
      console.error("Error creating award rate:", error);
      res.status(400).json({ message: "Failed to create award rate" });
    }
  });

  app.get("/api/payroll", isAuthenticated, async (req, res) => {
    try {
      const payroll = await storage.getPayroll();
      res.json(payroll);
    } catch (error) {
      console.error("Error fetching payroll:", error);
      res.status(500).json({ message: "Failed to fetch payroll" });
    }
  });

  app.post("/api/payroll", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPayrollSchema.parse(req.body);
      const payrollRecord = await storage.createPayroll(validatedData);
      res.status(201).json(payrollRecord);
    } catch (error) {
      console.error("Error creating payroll:", error);
      res.status(400).json({ message: "Failed to create payroll" });
    }
  });

  // Department routes - Service Delivery
  app.get("/api/shifts", isAuthenticated, async (req, res) => {
    try {
      const shifts = await storage.getShifts();
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.post("/api/shifts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertShiftSchema.parse(req.body);
      const shift = await storage.createShift(validatedData);
      res.status(201).json(shift);
    } catch (error) {
      console.error("Error creating shift:", error);
      res.status(400).json({ message: "Failed to create shift" });
    }
  });

  app.get("/api/staff-availability", isAuthenticated, async (req, res) => {
    try {
      const availability = await storage.getStaffAvailability();
      res.json(availability);
    } catch (error) {
      console.error("Error fetching staff availability:", error);
      res.status(500).json({ message: "Failed to fetch staff availability" });
    }
  });

  app.post("/api/staff-availability", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStaffAvailabilitySchema.parse(req.body);
      const availability = await storage.createStaffAvailability(validatedData);
      res.status(201).json(availability);
    } catch (error) {
      console.error("Error creating staff availability:", error);
      res.status(400).json({ message: "Failed to create staff availability" });
    }
  });

  // Department routes - Compliance & Quality
  app.get("/api/audits", isAuthenticated, async (req, res) => {
    try {
      const audits = await storage.getAudits();
      res.json(audits);
    } catch (error) {
      console.error("Error fetching audits:", error);
      res.status(500).json({ message: "Failed to fetch audits" });
    }
  });

  app.post("/api/audits", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAuditSchema.parse(req.body);
      const audit = await storage.createAudit(validatedData);
      res.status(201).json(audit);
    } catch (error) {
      console.error("Error creating audit:", error);
      res.status(400).json({ message: "Failed to create audit" });
    }
  });

  app.get("/api/incidents", isAuthenticated, async (req, res) => {
    try {
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.post("/api/incidents", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedData);
      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(400).json({ message: "Failed to create incident" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
