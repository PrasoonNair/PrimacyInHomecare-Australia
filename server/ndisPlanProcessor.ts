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

export async function saveExtractedPlanData(data: ExtractedPlanData, userId: string) {
  // Check if participant already exists
  let participantId: string;
  const existingParticipant = await db.select().from(participants)
    .where(eq(participants.ndisNumber, data.participant.ndisNumber))
    .limit(1);
  
  if (existingParticipant.length > 0) {
    participantId = existingParticipant[0].id;
    // Update participant information
    await db.update(participants)
      .set({
        firstName: data.participant.firstName,
        lastName: data.participant.lastName,
        dateOfBirth: data.participant.dateOfBirth,
        phone: data.participant.phone,
        email: data.participant.email,
        address: data.participant.address,
        primaryDisability: data.participant.primaryDisability,
        communicationNeeds: data.participant.communicationNeeds,
        updatedAt: new Date()
      })
      .where(eq(participants.id, participantId));
  } else {
    // Create new participant
    const newParticipant = await db.insert(participants)
      .values({
        id: randomUUID(),
        ...data.participant,
        isActive: true,
        preferredLanguage: "English"
      })
      .returning();
    participantId = newParticipant[0].id;
  }

  // Create NDIS plan
  const planId = randomUUID();
  await db.insert(ndisPlans)
    .values({
      id: planId,
      participantId: participantId,
      planNumber: data.plan.planNumber,
      startDate: data.plan.startDate,
      endDate: data.plan.endDate,
      totalBudget: data.plan.totalBudget,
      coreSupportsbudget: data.fundingBreakdown.coreSupports,
      capacityBuildingBudget: data.fundingBreakdown.capacityBuilding,
      capitalSupportsBudget: data.fundingBreakdown.capitalSupports,
      status: "active",
    });

  // Create participant goals
  for (const goal of data.goals) {
    const goalId = randomUUID();
    await db.insert(participantGoals)
      .values({
        participantId: participantId,
        planId: planId,
        goalType: "long_term",
        category: goal.category,
        title: goal.description.substring(0, 100),
        description: goal.description,
        priority: goal.priority === "High" ? "high" : goal.priority === "Medium" ? "medium" : "low",
        targetDate: goal.targetDate,
        status: "active",
      });

    // Create default actions for each goal
    const defaultActions = [
      { title: "Initial assessment and planning", hours: "2" },
      { title: "Weekly support sessions", hours: "1.5" },
      { title: "Progress review meeting", hours: "1" }
    ];

    for (const action of defaultActions) {
      await db.insert(goalActions)
        .values({
          goalId: goalId,
          actionTitle: action.title,
          actionDescription: `${action.title} for goal: ${goal.description.substring(0, 50)}`,
          hoursEstimated: action.hours,
          status: "pending",
        });
    }
  }

  return {
    participantId,
    planId,
    success: true
  };
}