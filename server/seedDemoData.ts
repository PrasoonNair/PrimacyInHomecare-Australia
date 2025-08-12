import { db } from "./db";
import { sql } from "drizzle-orm";
import { 
  participants, 
  staff, 
  ndisPlans,
  participantGoals,
  services,
  shifts,
  progressNotes,
  incidents,
  referrals,
  serviceAgreements
} from "@shared/schema";
import { randomUUID } from "crypto";

// Australian suburbs and postcodes for realistic data
const locations = [
  { suburb: "Parramatta", postcode: "2150", state: "NSW" },
  { suburb: "Blacktown", postcode: "2148", state: "NSW" },
  { suburb: "Liverpool", postcode: "2170", state: "NSW" },
  { suburb: "Penrith", postcode: "2750", state: "NSW" },
  { suburb: "Castle Hill", postcode: "2154", state: "NSW" },
  { suburb: "Hornsby", postcode: "2077", state: "NSW" },
  { suburb: "Bankstown", postcode: "2200", state: "NSW" },
  { suburb: "Campbelltown", postcode: "2560", state: "NSW" },
  { suburb: "Wollongong", postcode: "2500", state: "NSW" },
  { suburb: "Newcastle", postcode: "2300", state: "NSW" }
];

// Demo participants with diverse disabilities and needs
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
  },
  {
    firstName: "Isabella",
    lastName: "Martinez",
    dateOfBirth: "2008-06-18",
    ndisNumber: "430678901",
    primaryDisability: "Down Syndrome",
    address: "89 Pacific Highway, Hornsby NSW 2077",
    phone: "0467890123",
    email: "isabella.martinez@example.com",
    emergencyContact: "Carlos Martinez (Father) - 0467890124",
    culturalBackground: "Spanish-Australian",
    preferredLanguage: "English",
    communicationNeeds: "Patient communication style, enjoys social interaction",
    isActive: true
  },
  {
    firstName: "William",
    lastName: "Singh",
    dateOfBirth: "1992-12-05",
    ndisNumber: "430789012",
    primaryDisability: "Spinal Cord Injury",
    address: "34 Chapel Road, Bankstown NSW 2200",
    phone: "0478901234",
    email: "william.singh@example.com",
    emergencyContact: "Priya Singh (Sister) - 0478901235",
    culturalBackground: "Indian-Australian",
    preferredLanguage: "English",
    communicationNeeds: "Standard communication, wheelchair accessible venues required",
    isActive: true
  },
  {
    firstName: "Charlotte",
    lastName: "Taylor",
    dateOfBirth: "2003-04-25",
    ndisNumber: "430890123",
    primaryDisability: "Vision Impairment",
    address: "67 Queen Street, Campbelltown NSW 2560",
    phone: "0489012345",
    email: "charlotte.taylor@example.com",
    emergencyContact: "Robert Taylor (Father) - 0489012346",
    culturalBackground: "Australian",
    preferredLanguage: "English",
    communicationNeeds: "Audio descriptions preferred, uses screen reader",
    isActive: true
  },
  {
    firstName: "Alexander",
    lastName: "Papadopoulos",
    dateOfBirth: "2000-08-12",
    ndisNumber: "430901234",
    primaryDisability: "Psychosocial Disability",
    address: "12 Crown Street, Wollongong NSW 2500",
    phone: "0490123456",
    email: "alex.papa@example.com",
    emergencyContact: "Maria Papadopoulos (Mother) - 0490123457",
    culturalBackground: "Greek-Australian",
    preferredLanguage: "English",
    communicationNeeds: "Prefers scheduled appointments, may need flexibility with timing",
    isActive: true
  },
  {
    firstName: "Grace",
    lastName: "Robinson",
    dateOfBirth: "2012-01-20",
    ndisNumber: "431012345",
    primaryDisability: "Autism Spectrum Disorder",
    address: "45 Hunter Street, Newcastle NSW 2300",
    phone: "0401234567",
    email: "grace.robinson@example.com",
    emergencyContact: "Emma Robinson (Mother) - 0401234568",
    culturalBackground: "Australian",
    preferredLanguage: "English",
    communicationNeeds: "Routine important, visual schedules helpful",
    isActive: true
  }
];

// Demo staff with various roles and qualifications
const demoStaff = [
  {
    userId: null,
    employeeId: "EMP001",
    firstName: "Sarah",
    lastName: "Mitchell",
    email: "sarah.mitchell@primacycare.com.au",
    phone: "0412111222",
    position: "Senior Support Worker",
    qualifications: "Certificate IV in Disability, First Aid, Manual Handling",
    hourlyRate: "35.50",
    isActive: true
  },
  {
    userId: null,
    employeeId: "EMP002",
    firstName: "David",
    lastName: "Lee",
    email: "david.lee@primacycare.com.au",
    phone: "0423222333",
    position: "Support Worker",
    qualifications: "Certificate III in Individual Support, First Aid",
    hourlyRate: "28.50",
    isActive: true
  },
  {
    userId: null,
    employeeId: "EMP003",
    firstName: "Rebecca",
    lastName: "Johnson",
    email: "rebecca.johnson@primacycare.com.au",
    phone: "0434333444",
    position: "Senior Case Manager",
    qualifications: "Bachelor of Social Work, Certificate IV in Disability",
    hourlyRate: "45.00",
    isActive: true
  },
  {
    userId: null,
    employeeId: "EMP004",
    firstName: "Ahmed",
    lastName: "Hassan",
    email: "ahmed.hassan@primacycare.com.au",
    phone: "0445444555",
    position: "Bilingual Support Worker",
    qualifications: "Certificate III in Individual Support, First Aid, Mental Health First Aid",
    hourlyRate: "30.00",
    isActive: true
  },
  {
    userId: null,
    employeeId: "EMP005",
    firstName: "Lisa",
    lastName: "Wang",
    email: "lisa.wang@primacycare.com.au",
    phone: "0456555666",
    position: "Service Coordinator",
    qualifications: "Diploma of Community Services, Certificate IV in Disability",
    hourlyRate: "38.00",
    isActive: true
  },
  {
    userId: null,
    employeeId: "EMP006",
    firstName: "Mark",
    lastName: "Thompson",
    email: "mark.thompson@primacycare.com.au",
    phone: "0467666777",
    position: "Team Leader",
    qualifications: "Certificate IV in Leadership, Certificate IV in Disability, WHS Training",
    hourlyRate: "42.00",
    isActive: true
  },
  {
    userId: null,
    employeeId: "EMP007",
    firstName: "Jessica",
    lastName: "Brown",
    email: "jessica.brown@primacycare.com.au",
    phone: "0478777888",
    position: "Registered Nurse",
    qualifications: "Bachelor of Nursing, Medication Management, Wound Care Certification",
    hourlyRate: "55.00",
    isActive: true
  },
  {
    userId: null,
    employeeId: "EMP008",
    firstName: "Tony",
    lastName: "Nguyen",
    email: "tony.nguyen@primacycare.com.au",
    phone: "0489888999",
    position: "Support Worker",
    qualifications: "Certificate III in Individual Support, First Aid",
    hourlyRate: "28.50",
    isActive: true
  },
  {
    userId: null,
    employeeId: "EMP009",
    firstName: "Emma",
    lastName: "Wilson",
    email: "emma.wilson@primacycare.com.au",
    phone: "0490999000",
    position: "Administration Officer",
    qualifications: "Certificate IV in Business Administration, NDIS Worker Orientation",
    hourlyRate: "32.00",
    isActive: true
  },
  {
    userId: null,
    employeeId: "EMP010",
    firstName: "George",
    lastName: "Papadopoulos",
    email: "george.papa@primacycare.com.au",
    phone: "0401000111",
    position: "Community Support Worker",
    qualifications: "Certificate III in Individual Support, Driver's License, First Aid",
    hourlyRate: "29.50",
    isActive: true
  }
];

export async function seedDemoData() {
  console.log("Starting demo data seeding...");

  try {
    // Check if data already exists
    const existingParticipants = await db.select().from(participants).limit(1);
    const existingStaff = await db.select().from(staff).limit(1);
    
    if (existingParticipants.length > 0 || existingStaff.length > 0) {
      console.log("Database already contains data. Skipping seeding.");
      const participantCount = await db.select({ count: sql`count(*)` }).from(participants);
      const staffCount = await db.select({ count: sql`count(*)` }).from(staff);
      console.log(`Current data: ${participantCount[0].count} participants, ${staffCount[0].count} staff members`);
      return;
    }

    // Seed participants
    console.log("Seeding participants...");
    const insertedParticipants = [];
    for (const participant of demoParticipants) {
      const [inserted] = await db.insert(participants)
        .values(participant)
        .returning();
      insertedParticipants.push(inserted);
      console.log(`Created participant: ${participant.firstName} ${participant.lastName}`);
    }

    // Seed staff
    console.log("Seeding staff...");
    const insertedStaff = [];
    for (const staffMember of demoStaff) {
      const [inserted] = await db.insert(staff)
        .values(staffMember)
        .returning();
      insertedStaff.push(inserted);
      console.log(`Created staff: ${staffMember.firstName} ${staffMember.lastName} (${staffMember.position})`);
    }

    // Create NDIS plans for each participant
    console.log("Creating NDIS plans...");
    for (const participant of insertedParticipants) {
      const planId = randomUUID();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      await db.insert(ndisPlans).values({
        id: planId,
        participantId: participant.id,
        planNumber: `PLAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: "active",
        totalBudget: Math.floor(Math.random() * 100000) + 50000,
        coreSupportsBudget: Math.floor(Math.random() * 50000) + 20000,
        capacityBuildingBudget: Math.floor(Math.random() * 30000) + 10000,
        capitalSupportsBudget: Math.floor(Math.random() * 20000) + 5000,
        planManagerName: "NDIS Plan Management Co",
        planManagerContact: "1300 NDIS PM",
        supportCoordinator: insertedStaff.find(s => s.position === 'Senior Case Manager')?.firstName + " " + insertedStaff.find(s => s.position === 'Senior Case Manager')?.lastName
      });

      // Create goals for each participant
      const goalCategories = ["daily_living", "social_participation", "employment", "health_wellbeing"];
      for (let i = 0; i < 3; i++) {
        await db.insert(participantGoals).values({
          participantId: participant.id,
          planId: planId,
          goalType: i === 0 ? "long_term" : "short_term",
          category: goalCategories[i],
          title: `Goal ${i + 1} for ${participant.firstName}`,
          description: `Improve independence and quality of life in ${goalCategories[i].replace('_', ' ')}`,
          priority: i === 0 ? "high" : "medium",
          targetDate: new Date(Date.now() + (180 + i * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "active",
          supportBudgetCategory: "capacity_building",
          estimatedHours: String(20 + i * 10),
          assignedStaffId: insertedStaff[Math.floor(Math.random() * insertedStaff.length)].id
        });
      }
    }

    // Create referrals
    console.log("Creating referrals...");
    const referralSources = ["ndis_planner", "family", "healthcare_provider", "self_referral", "other"];
    for (let i = 0; i < 5; i++) {
      await db.insert(referrals).values({
        participantFirstName: `New`,
        participantLastName: `Client ${i + 1}`,
        referralSource: referralSources[i % referralSources.length],
        referralDate: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        referrerName: `Referrer ${i + 1}`,
        referrerContact: `041${i}123456`,
        referrerOrganization: `Organization ${i + 1}`,
        urgency: i === 0 ? "urgent" : i === 1 ? "high" : "standard",
        workflowStatus: i < 2 ? "referral_received" : i < 4 ? "data_verified" : "agreement_sent",
        notes: `Referral notes for client ${i + 1}. Requires assessment for support services.`
      });
    }

    // Create service agreements for some participants
    console.log("Creating service agreements...");
    for (let i = 0; i < 5; i++) {
      await db.insert(serviceAgreements).values({
        participantId: insertedParticipants[i].id,
        agreementNumber: `SA-2024-${String(i + 1).padStart(4, '0')}`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: i < 3 ? "active" : "draft",
        serviceTypes: ["Personal Care", "Community Access", "Social Support"],
        weeklyHours: 20 + i * 5,
        hourlyRate: 65.00,
        totalValue: (20 + i * 5) * 52 * 65.00,
        signedDate: i < 3 ? new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
        signedBy: i < 3 ? insertedParticipants[i].firstName + " " + insertedParticipants[i].lastName : null
      });
    }

    // Create some sample services and shifts
    console.log("Creating services and shifts...");
    const serviceCategories = ["core_supports", "capacity_building", "capital_supports"];
    const serviceNames = ["Personal Care", "Community Access", "Social Support", "Transport", "Domestic Assistance"];
    for (let i = 0; i < 10; i++) {
      const participantIndex = i % insertedParticipants.length;
      const staffIndex = i % insertedStaff.filter(s => s.position.includes('Support Worker')).length;
      const supportWorkers = insertedStaff.filter(s => s.position.includes('Support Worker'));
      
      const serviceId = randomUUID();
      await db.insert(services).values({
        id: serviceId,
        participantId: insertedParticipants[participantIndex].id,
        planId: null,
        staffId: supportWorkers[staffIndex]?.id,
        serviceName: serviceNames[i % serviceNames.length],
        serviceCategory: serviceCategories[0], // Using core_supports
        scheduledDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        duration: 120 + (i % 3) * 60,
        location: "Participant Home",
        status: "scheduled",
        hourlyRate: "65.00",
        totalCost: String(((120 + (i % 3) * 60) / 60) * 65.00),
        notes: `Service session ${i + 1}`
      });

      // Create a shift for this service
      const shiftDate = new Date();
      shiftDate.setDate(shiftDate.getDate() + i);
      
      await db.insert(shifts).values({
        serviceId: serviceId,
        participantId: insertedParticipants[participantIndex].id,
        staffId: supportWorkers[staffIndex].id,
        date: shiftDate.toISOString().split('T')[0],
        startTime: `${9 + (i % 8)}:00`,
        endTime: `${11 + (i % 8)}:00`,
        status: i < 3 ? "completed" : i < 7 ? "confirmed" : "scheduled",
        actualStart: i < 3 ? `${9 + (i % 8)}:05` : null,
        actualEnd: i < 3 ? `${11 + (i % 8)}:10` : null,
        notes: i < 3 ? `Shift completed successfully. Participant engaged well with activities.` : null,
        kilometersClaimed: i % 3 === 0 ? 15 : null,
        incidentOccurred: false
      });
    }

    // Create some progress notes
    console.log("Creating progress notes...");
    for (let i = 0; i < 15; i++) {
      const participantIndex = i % insertedParticipants.length;
      const staffIndex = i % insertedStaff.length;
      
      await db.insert(progressNotes).values({
        participantId: insertedParticipants[participantIndex].id,
        staffId: insertedStaff[staffIndex].id,
        serviceId: null,
        noteDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        goalProgress: `Progress on goal ${(i % 3) + 1}: Good improvement observed`,
        activities: `Daily living activities, community participation, skill development`,
        outcomes: `Participant showed good progress in daily activities. Maintained positive engagement throughout the session.`,
        concerns: i % 4 === 0 ? "Some fatigue observed, will monitor" : null,
        nextSteps: i % 4 === 0 ? "Schedule review meeting with family" : "Continue current support plan",
        participantFeedback: "Participant expressed satisfaction with support received"
      });
    }

    // Create some incidents for testing
    console.log("Creating incident reports...");
    const incidentTypes = ["fall", "medication", "behavioral", "property", "other"];
    const severityLevels = ["low", "medium", "high"];
    
    for (let i = 0; i < 3; i++) {
      await db.insert(incidents).values({
        participantId: insertedParticipants[i].id,
        staffId: insertedStaff[i].id,
        incidentDate: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        incidentTime: "14:30",
        incidentType: incidentTypes[i],
        location: "Participant home",
        description: `Test incident ${i + 1}: Minor incident occurred during service delivery. No injuries sustained.`,
        immediateActions: "First aid provided, participant reassured, family notified",
        severity: severityLevels[i % 3],
        witnessNames: "Support Worker, Family Member",
        witnessStatements: "Incident handled appropriately as per protocol",
        reportedToNdis: i === 2,
        ndisReportNumber: i === 2 ? `NDIS-INC-2024-${String(i + 1).padStart(4, '0')}` : null,
        followUpRequired: true,
        followUpActions: "Review risk assessment, update support plan",
        documentsAttached: false
      });
    }

    console.log("Demo data seeding completed successfully!");
    console.log(`Created ${insertedParticipants.length} participants`);
    console.log(`Created ${insertedStaff.length} staff members`);
    console.log("Created associated plans, goals, services, shifts, and notes");

  } catch (error) {
    console.error("Error seeding demo data:", error);
    throw error;
  }
}

// Run the seeding function if this file is executed directly
seedDemoData()
  .then(() => {
    console.log("Demo data seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed demo data:", error);
    process.exit(1);
  });