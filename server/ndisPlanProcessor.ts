import { db } from "./db";
import { participants, ndisPlans, participantGoals, goalActions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

interface ExtractedPlanData {
  participant: {
    firstName: string;
    lastName: string;
    ndisNumber: string;
    dateOfBirth: string;
    phone?: string;
    email?: string;
    address?: string;
    primaryDisability?: string;
    communicationNeeds?: string;
  };
  plan: {
    planNumber: string;
    startDate: string;
    endDate: string;
    totalBudget: string;
    planManagementType: string;
  };
  goals: Array<{
    category: string;
    description: string;
    priority: string;
    targetDate?: string;
  }>;
  fundingBreakdown: {
    coreSupports: string;
    capacityBuilding: string;
    capitalSupports: string;
  };
}

// Mock extraction for demonstration - in production, this would use AI/OCR
export async function extractDataFromNdisPlan(fileBuffer: Buffer, fileName: string): Promise<ExtractedPlanData> {
  // In a real implementation, this would:
  // 1. Use OCR to extract text from PDF
  // 2. Use AI (like Claude) to parse and structure the data
  // 3. Return the extracted information
  
  // Using real NDIS plan data from Mark Reilly's plan
  const mockData: ExtractedPlanData = {
    participant: {
      firstName: "Mark",
      lastName: "Reilly",
      ndisNumber: "430779676",
      dateOfBirth: "1964-11-25",
      phone: "",
      email: "",
      address: "Unit 4, 46 Marklin Street, CRANBOURNE VIC 3977",
      primaryDisability: "Multiple disabilities requiring 24/7 support",
      communicationNeeds: "Requires support with personal care and communication"
    },
    plan: {
      planNumber: "430779676-2023",
      startDate: "2023-01-19",
      endDate: "2024-01-19",
      totalBudget: "906203.38",
      planManagementType: "NDIA-managed"
    },
    goals: [
      {
        category: "Daily Living",
        description: "Live in a home as safely and independently as possible with appropriate supports and strategies",
        priority: "High",
        targetDate: "2024-01-19"
      },
      {
        category: "Relationships",
        description: "Build and maintain healthy and supportive relationships with carers and family",
        priority: "High",
        targetDate: "2024-01-19"
      },
      {
        category: "Community Participation",
        description: "Attend day program and build meaningful relationships with fellow participants",
        priority: "Medium",
        targetDate: "2024-01-19"
      },
      {
        category: "Behaviour Support",
        description: "Address behavior management and explore and develop behaviour management strategies",
        priority: "Medium",
        targetDate: "2024-01-19"
      },
      {
        category: "Social & Community",
        description: "Access social and community supports to increase participation and engagement",
        priority: "Medium",
        targetDate: "2024-01-19"
      }
    ],
    fundingBreakdown: {
      coreSupports: "798975.85",
      capacityBuilding: "105443.53", 
      capitalSupports: "1784.00"
    }
  };

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return mockData;
}

export async function saveExtractedPlanData(data: any, userId: string) {
  // Check if participant already exists
  let participantId: string;
  
  // Handle different data structures
  const participantInfo = data.participantInfo || data.participant;
  const ndisNumber = participantInfo?.ndisNumber;
  
  if (!ndisNumber) {
    // If no NDIS number, create a placeholder participant
    const newParticipant = await db.insert(participants)
      .values({
        firstName: participantInfo?.firstName || "Unknown",
        lastName: participantInfo?.lastName || "Participant",
        dateOfBirth: participantInfo?.dateOfBirth || new Date().toISOString().split('T')[0],
        ndisNumber: `TEMP-${Date.now()}`,
        primaryDisability: participantInfo?.primaryDisability || "Not specified",
        address: "",
        phone: "",
        email: "",
        emergencyContact: "",
        emergencyPhone: "",
        culturalBackground: null,
        preferredLanguage: "English",
        communicationNeeds: null,
        isActive: true
      })
      .returning();
    participantId = newParticipant[0].id;
  } else {
    const existingParticipant = await db.select().from(participants)
      .where(eq(participants.ndisNumber, ndisNumber))
      .limit(1);
  
    if (existingParticipant.length > 0) {
      participantId = existingParticipant[0].id;
      // Update participant information
      await db.update(participants)
        .set({
          firstName: participantInfo.firstName || existingParticipant[0].firstName,
          lastName: participantInfo.lastName || existingParticipant[0].lastName,
          dateOfBirth: participantInfo.dateOfBirth || existingParticipant[0].dateOfBirth,
          primaryDisability: participantInfo.primaryDisability || existingParticipant[0].primaryDisability,
          updatedAt: new Date()
        })
        .where(eq(participants.id, participantId));
    } else {
      // Create new participant
      const newParticipant = await db.insert(participants)
        .values({
          firstName: participantInfo.firstName || "Unknown",
          lastName: participantInfo.lastName || "Participant",
          dateOfBirth: participantInfo.dateOfBirth || new Date().toISOString().split('T')[0],
          ndisNumber: ndisNumber,
          primaryDisability: participantInfo.primaryDisability || "Not specified",
          address: "",
          phone: "",
          email: "",
          emergencyContact: "",
          emergencyPhone: "",
          culturalBackground: null,
          preferredLanguage: "English",
          communicationNeeds: null,
          isActive: true
        })
        .returning();
      participantId = newParticipant[0].id;
    }
  }

  // Create NDIS plan
  const planId = randomUUID();
  
  // Handle different data structures for plan details
  const planDetails = data.planDetails || {};
  const budgetBreakdown = data.budgetBreakdown || {};
  const goals = data.goals || [];
  
  const totalBudget = (budgetBreakdown.coreSupports || 0) + 
                     (budgetBreakdown.capacityBuilding || 0) + 
                     (budgetBreakdown.capitalSupports || 0);
  
  await db.insert(ndisPlans)
    .values({
      id: planId,
      participantId,
      planNumber: planDetails.planNumber || `PLAN-${Date.now()}`,
      planVersion: "1.0",
      startDate: planDetails.startDate || new Date().toISOString().split('T')[0],
      endDate: planDetails.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "active",
      totalBudget: totalBudget,
      coreSupportsbudget: budgetBreakdown.coreSupports || 0,
      capacityBuildingBudget: budgetBreakdown.capacityBuilding || 0,
      capitalSupportsBudget: budgetBreakdown.capitalSupports || 0,
      planManagerName: "",
      planManagerContact: "",
      supportCoordinator: "",
      goals: JSON.stringify(goals)
    });

  // Create participant goals
  if (goals && goals.length > 0) {
    for (const goal of goals) {
      await db.insert(participantGoals)
        .values({
          participantId: participantId,
          planId: planId,
          goalType: "long_term", // Default to long-term goal
          category: goal.category || "daily_living",
          title: goal.description ? goal.description.substring(0, 100) : "NDIS Goal",
          description: goal.description || "Goal description",
          priority: goal.priority?.toLowerCase() || "medium",
          targetDate: goal.targetDate ? 
            new Date(goal.targetDate).toISOString().split('T')[0] : 
            new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "active",
          supportBudgetCategory: "capacity_building",
          estimatedHours: "40",
          assignedStaffId: null
        });
    }
  }

  return {
    participantId,
    planId,
    success: true
  };
}