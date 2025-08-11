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
  insertInvoiceLineItemSchema
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

  const httpServer = createServer(app);
  return httpServer;
}
