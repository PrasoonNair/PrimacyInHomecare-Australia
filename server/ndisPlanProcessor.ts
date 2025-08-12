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
  
  // For now, return sample extracted data
  const mockData: ExtractedPlanData = {
    participant: {
      firstName: "John",
      lastName: "Smith",
      ndisNumber: `NDIS${Math.floor(Math.random() * 900000 + 100000)}`,
      dateOfBirth: "1990-01-15",
      phone: "0412345678",
      email: "john.smith@email.com",
      address: "123 Main Street, Sydney NSW 2000",
      primaryDisability: "Autism Spectrum Disorder",
      communicationNeeds: "Prefers written communication, may need extra time to process verbal information"
    },
    plan: {
      planNumber: `PLAN-${Date.now()}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalBudget: "85000",
      planManagementType: "Plan Managed"
    },
    goals: [
      {
        category: "Daily Living",
        description: "Increase independence in daily living activities including meal preparation and personal care",
        priority: "High",
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        category: "Social & Community",
        description: "Build social connections and participate in community activities at least twice per week",
        priority: "Medium",
        targetDate: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        category: "Employment",
        description: "Develop job-ready skills and secure part-time employment within 12 months",
        priority: "High",
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ],
    fundingBreakdown: {
      coreSupports: "35000",
      capacityBuilding: "30000",
      capitalSupports: "20000"
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
        id: randomUUID(),
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
          id: randomUUID(),
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
  
  await db.insert(ndisplans)
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
      const goalId = randomUUID();
      await db.insert(participantGoals)
        .values({
          id: goalId,
          participantId: participantId,
          category: goal.category || "General",
          description: goal.description || "Goal description",
          priority: goal.priority || "Medium",
          targetDate: goal.targetDate ? new Date(goal.targetDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          status: "Active",
          estimatedCost: goal.estimatedCost || 0,
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