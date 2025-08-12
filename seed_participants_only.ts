import { db } from "./server/db";
import { sql } from "drizzle-orm";
import { participants, ndisPlans, participantGoals } from "./shared/schema";
import { randomUUID } from "crypto";

const demoParticipants = [
  {
    firstName: "Michael",
    lastName: "Thompson",
    dateOfBirth: "1998-03-15",
    ndisNumber: "430123456",
    primaryDisability: "Autism Spectrum Disorder",
    address: "45 Railway Street, Parramatta NSW 2150",
    phone: "0412345678",
    email: "michael.thompson@example.com",
    emergencyContact: "Sarah Thompson (Mother) - 0412345679",
    culturalBackground: "Australian",
    preferredLanguage: "English",
    communicationNeeds: "Prefers written communication, may need extra processing time",
    isActive: true
  },
  {
    firstName: "Emily",
    lastName: "Chen",
    dateOfBirth: "2005-07-22",
    ndisNumber: "430234567",
    primaryDisability: "Cerebral Palsy",
    address: "12 Garden Avenue, Blacktown NSW 2148",
    phone: "0423456789",
    email: "emily.chen@example.com",
    emergencyContact: "David Chen (Father) - 0423456790",
    culturalBackground: "Chinese-Australian",
    preferredLanguage: "English",
    communicationNeeds: "Uses AAC device for complex conversations",
    isActive: true
  },
  {
    firstName: "James",
    lastName: "Wilson",
    dateOfBirth: "1985-11-08",
    ndisNumber: "430345678",
    primaryDisability: "Acquired Brain Injury",
    address: "78 Main Road, Liverpool NSW 2170",
    phone: "0434567890",
    email: "james.wilson@example.com",
    emergencyContact: "Mary Wilson (Wife) - 0434567891",
    culturalBackground: "Australian",
    preferredLanguage: "English",
    communicationNeeds: "May experience fatigue, requires regular breaks",
    isActive: true
  },
  {
    firstName: "Sophia",
    lastName: "Nguyen",
    dateOfBirth: "2010-02-14",
    ndisNumber: "430456789",
    primaryDisability: "Intellectual Disability",
    address: "23 Park Street, Penrith NSW 2750",
    phone: "0445678901",
    email: "sophia.nguyen@example.com",
    emergencyContact: "Linh Nguyen (Mother) - 0445678902",
    culturalBackground: "Vietnamese-Australian",
    preferredLanguage: "English",
    communicationNeeds: "Simple language, visual supports helpful",
    isActive: true
  },
  {
    firstName: "Oliver",
    lastName: "Brown",
    dateOfBirth: "1995-09-30",
    ndisNumber: "430567890",
    primaryDisability: "Multiple Sclerosis",
    address: "156 Windsor Road, Castle Hill NSW 2154",
    phone: "0456789012",
    email: "oliver.brown@example.com",
    emergencyContact: "Peter Brown (Brother) - 0456789013",
    culturalBackground: "Australian",
    preferredLanguage: "English",
    communicationNeeds: "Standard communication, mobility aids required",
    isActive: true
  }
];

async function seedParticipants() {
  console.log("Seeding new participants...");
  try {
    for (const participant of demoParticipants) {
      const existing = await db.select().from(participants)
        .where(sql`ndis_number = ${participant.ndisNumber}`)
        .limit(1);
      
      if (existing.length === 0) {
        const [inserted] = await db.insert(participants).values(participant).returning();
        console.log(`Created participant: ${participant.firstName} ${participant.lastName}`);
        
        // Create an NDIS plan for each participant
        const planId = randomUUID();
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        
        await db.insert(ndisPlans).values({
          id: planId,
          participantId: inserted.id,
          planNumber: `PLAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status: "active",
          totalBudget: String(Math.floor(Math.random() * 100000) + 50000),
          coreSupportsbudget: String(Math.floor(Math.random() * 50000) + 20000),
          capacityBuildingBudget: String(Math.floor(Math.random() * 30000) + 10000),
          capitalSupportsBudget: String(Math.floor(Math.random() * 20000) + 5000),
          planManagerName: "NDIS Plan Management Co",
          planManagerContact: "1300 NDIS PM",
          supportCoordinator: "Rebecca Johnson"
        });
        console.log(`Created NDIS plan for ${participant.firstName}`);
      } else {
        console.log(`Participant ${participant.firstName} ${participant.lastName} already exists`);
      }
    }
    console.log("Participant seeding completed!");
  } catch (error) {
    console.error("Error seeding participants:", error);
  }
  process.exit(0);
}

seedParticipants();
