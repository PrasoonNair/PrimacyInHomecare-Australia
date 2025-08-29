import { Express } from "express";
import { db } from "./db";
import { 
  participants,
  ndisPlans,
  services,
  participantGoals,
  goalActions,
  progressNotes,
  shifts,
  staff,
  incidents
} from "@shared/schema";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";

export function setupParticipantPortalRoutes(app: Express) {
  // Participant Portal: Get participant profile
  app.get("/api/participant-portal/profile", async (req, res) => {
    try {
      // In production, get participant ID from authenticated session
      const participantId = req.query.participantId || "8f7d83bc-59e4-46a3-a87a-e4fff1f29bbc";
      
      const [participant] = await db.select()
        .from(participants)
        .where(eq(participants.id, participantId as string));
      
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      res.json(participant);
    } catch (error) {
      console.error("Error fetching participant profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Participant Portal: Get NDIS plan details
  app.get("/api/participant-portal/plan", async (req, res) => {
    try {
      const participantId = req.query.participantId || "8f7d83bc-59e4-46a3-a87a-e4fff1f29bbc";
      
      const [plan] = await db.select()
        .from(ndisPlans)
        .where(
          and(
            eq(ndisPlans.participantId, participantId as string),
            eq(ndisPlans.status, "active")
          )
        );
      
      if (!plan) {
        return res.json({ message: "No active plan found" });
      }
      
      // Calculate budget usage
      const totalBudget = parseFloat(plan.totalBudget || "0");
      const coreUsed = parseFloat(plan.coreBudget || "0") * 0.3; // Simulated usage
      const capacityUsed = parseFloat(plan.capacityBuildingBudget || "0") * 0.4;
      const capitalUsed = parseFloat(plan.capitalBudget || "0") * 0.1;
      
      const planDetails = {
        ...plan,
        categories: [
          {
            name: "Core Supports",
            total: plan.coreBudget,
            used: coreUsed.toFixed(2),
            remaining: (parseFloat(plan.coreBudget || "0") - coreUsed).toFixed(2)
          },
          {
            name: "Capacity Building",
            total: plan.capacityBuildingBudget,
            used: capacityUsed.toFixed(2),
            remaining: (parseFloat(plan.capacityBuildingBudget || "0") - capacityUsed).toFixed(2)
          },
          {
            name: "Capital Supports",
            total: plan.capitalBudget,
            used: capitalUsed.toFixed(2),
            remaining: (parseFloat(plan.capitalBudget || "0") - capitalUsed).toFixed(2)
          }
        ],
        supportItems: [
          {
            code: "01_011_0107_1_1",
            name: "Assistance With Self-Care Activities",
            category: "Core"
          },
          {
            code: "04_104_0125_6_1",
            name: "Community Participation",
            category: "Core"
          },
          {
            code: "07_001_0106_8_3",
            name: "Support Coordination",
            category: "Capacity Building"
          }
        ],
        planManager: plan.planManagement || "Agency-Managed"
      };
      
      res.json(planDetails);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      res.status(500).json({ message: "Failed to fetch plan details" });
    }
  });

  // Participant Portal: Get upcoming services
  app.get("/api/participant-portal/services/upcoming", async (req, res) => {
    try {
      const participantId = req.query.participantId || "8f7d83bc-59e4-46a3-a87a-e4fff1f29bbc";
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      
      // Get upcoming shifts
      const upcomingShifts = await db.select({
        id: shifts.id,
        date: shifts.shiftDate,
        time: shifts.startTime,
        serviceType: services.serviceType,
        staffId: shifts.assignedStaffId,
        staffFirstName: staff.firstName,
        staffLastName: staff.lastName,
        status: shifts.status
      })
        .from(shifts)
        .leftJoin(services, eq(shifts.serviceId, services.id))
        .leftJoin(staff, eq(shifts.assignedStaffId, staff.id))
        .where(
          and(
            eq(shifts.participantId, participantId as string),
            gte(shifts.shiftDate, format(today, "yyyy-MM-dd"))
          )
        )
        .orderBy(asc(shifts.shiftDate), asc(shifts.startTime))
        .limit(10);
      
      // Count services this week
      const thisWeekCount = upcomingShifts.filter(s => {
        const shiftDate = new Date(s.date);
        return shiftDate >= weekStart && shiftDate <= weekEnd;
      }).length;
      
      // Format services for display
      const formattedServices = upcomingShifts.map(shift => ({
        id: shift.id,
        date: shift.date,
        time: shift.time,
        serviceType: shift.serviceType || "Support Service",
        staffName: shift.staffFirstName ? 
          `${shift.staffFirstName} ${shift.staffLastName}` : 
          "To be assigned",
        status: shift.status
      }));
      
      res.json({
        thisWeek: thisWeekCount,
        next: formattedServices[0] || null,
        services: formattedServices
      });
    } catch (error) {
      console.error("Error fetching upcoming services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Participant Portal: Get goals
  app.get("/api/participant-portal/goals", async (req, res) => {
    try {
      const participantId = req.query.participantId || "8f7d83bc-59e4-46a3-a87a-e4fff1f29bbc";
      
      // Get participant goals
      const goals = await db.select()
        .from(participantGoals)
        .where(eq(participantGoals.participantId, participantId as string))
        .orderBy(desc(participantGoals.priority));
      
      // Calculate goal statistics
      const completed = goals.filter(g => g.status === "completed").length;
      const total = goals.length;
      
      // Format goals with progress and next steps
      const formattedGoals = await Promise.all(goals.map(async (goal) => {
        // Get goal actions
        const actions = await db.select()
          .from(goalActions)
          .where(eq(goalActions.goalId, goal.id));
        
        const completedActions = actions.filter(a => a.completionStatus === "completed").length;
        const progress = actions.length > 0 ? 
          Math.round((completedActions / actions.length) * 100) : 0;
        
        return {
          id: goal.id,
          title: goal.goalTitle,
          description: goal.goalDescription,
          status: goal.status,
          progress,
          targetDate: goal.targetDate,
          nextSteps: actions
            .filter(a => a.completionStatus !== "completed")
            .slice(0, 3)
            .map(a => a.actionDescription)
        };
      }));
      
      res.json({
        completed,
        total,
        items: formattedGoals
      });
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Participant Portal: Get documents
  app.get("/api/participant-portal/documents", async (req, res) => {
    try {
      const participantId = req.query.participantId || "8f7d83bc-59e4-46a3-a87a-e4fff1f29bbc";
      
      // Mock document data - in production, this would come from a documents table
      const documents = [
        {
          id: "1",
          name: "NDIS Plan 2024-2025.pdf",
          type: "NDIS Plan",
          size: "2.3 MB",
          uploadedAt: new Date("2024-01-15")
        },
        {
          id: "2",
          name: "Service Agreement - Primacy Care.pdf",
          type: "Service Agreement",
          size: "1.1 MB",
          uploadedAt: new Date("2024-02-01")
        },
        {
          id: "3",
          name: "Progress Report Q4 2024.pdf",
          type: "Progress Report",
          size: "3.5 MB",
          uploadedAt: new Date("2024-12-31")
        },
        {
          id: "4",
          name: "Goal Achievement Certificate.pdf",
          type: "Certificate",
          size: "500 KB",
          uploadedAt: new Date("2025-01-05")
        }
      ];
      
      res.json({
        items: documents
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Mobile Check-in: Clock in
  app.post("/api/shifts/check-in", async (req, res) => {
    try {
      const { shiftId, checkInTime, latitude, longitude, accuracy } = req.body;
      
      // Update shift with check-in details
      await db.update(shifts)
        .set({
          clockInTime: checkInTime,
          clockInLocation: `${latitude},${longitude}`,
          status: "in_progress",
          updatedAt: new Date()
        })
        .where(eq(shifts.id, shiftId));
      
      res.json({
        success: true,
        message: "Successfully checked in",
        shiftId
      });
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  // Mobile Check-in: Clock out
  app.post("/api/shifts/check-out", async (req, res) => {
    try {
      const { shiftId, checkOutTime, latitude, longitude, accuracy, notes, incidents } = req.body;
      
      // Update shift with check-out details
      await db.update(shifts)
        .set({
          clockOutTime: checkOutTime,
          clockOutLocation: `${latitude},${longitude}`,
          actualDuration: 0, // Calculate based on times
          status: "completed",
          notes,
          incidentReport: incidents,
          updatedAt: new Date()
        })
        .where(eq(shifts.id, shiftId));
      
      // If incidents reported, create incident record
      if (incidents) {
        await db.insert(incidents).values({
          shiftId,
          category: "shift_incident",
          severity: "medium",
          participantName: "From shift",
          incidentDate: new Date(),
          incidentTime: format(new Date(), "HH:mm"),
          location: `${latitude},${longitude}`,
          description: incidents,
          immediateActions: "Reported via mobile check-out",
          reportedBy: "Support Worker",
          reportedDate: new Date()
        });
      }
      
      res.json({
        success: true,
        message: "Successfully checked out",
        shiftId
      });
    } catch (error) {
      console.error("Error checking out:", error);
      res.status(500).json({ message: "Failed to check out" });
    }
  });

  // Incident Reporting
  app.post("/api/incidents", async (req, res) => {
    try {
      const incidentData = req.body;
      
      // Generate incident number
      const incidentNumber = `INC-${Date.now()}`;
      
      // Create incident record
      const [incident] = await db.insert(incidents)
        .values({
          incidentNumber,
          category: incidentData.incidentType,
          subcategory: incidentData.severity,
          severity: incidentData.severity,
          participantId: incidentData.participantId,
          participantName: incidentData.participantName || "Unknown",
          incidentDate: new Date(incidentData.dateTime),
          incidentTime: format(new Date(incidentData.dateTime), "HH:mm"),
          location: incidentData.location,
          description: incidentData.description,
          immediateActions: incidentData.immediateAction,
          injuries: incidentData.injuryOccurred ? incidentData.injuryDetails : null,
          medicalTreatment: incidentData.medicalTreatment ? incidentData.medicalDetails : null,
          propertyDamage: null,
          witnesses: incidentData.witnesses?.join(", ") || null,
          reportedBy: incidentData.reportedBy,
          reportedDate: new Date(),
          notificationsSent: incidentData.notifyFamily ? "Family notified" : null,
          followUpRequired: incidentData.followUpRequired,
          status: "open"
        })
        .returning();
      
      // Determine if NDIS notification required
      const criticalTypes = ["injury", "abuse", "restrictive", "missing", "death"];
      const notifyNdis = criticalTypes.includes(incidentData.incidentType);
      
      res.json({
        id: incident.id,
        incidentNumber,
        notifyNdis,
        message: notifyNdis ? 
          "Incident reported. NDIS will be notified within required timeframe." :
          "Incident reported successfully."
      });
    } catch (error) {
      console.error("Error reporting incident:", error);
      res.status(500).json({ message: "Failed to report incident" });
    }
  });
}