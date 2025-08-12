import { db } from "./db";
import { users, staff, participants, plans, services, shifts, referrals } from "@shared/schema";
import { ROLES, ROLE_DEPARTMENTS } from "../client/src/lib/roles";

export async function seedTestUsers() {
  console.log("Creating test users for each role...");

  // Test user data for each role
  const testUsers = [
    {
      id: "test-super-admin",
      email: "super.admin@primacycare.com.au",
      firstName: "Super",
      lastName: "Admin",
      role: ROLES.SUPER_ADMIN,
      department: ROLE_DEPARTMENTS[ROLES.SUPER_ADMIN],
      position: "System Administrator"
    },
    {
      id: "test-ceo",
      email: "ceo@primacycare.com.au",
      firstName: "John",
      lastName: "Peterson",
      role: ROLES.CEO,
      department: ROLE_DEPARTMENTS[ROLES.CEO],
      position: "Chief Executive Officer"
    },
    {
      id: "test-general-manager",
      email: "gm@primacycare.com.au",
      firstName: "Sarah",
      lastName: "Mitchell",
      role: ROLES.GENERAL_MANAGER,
      department: ROLE_DEPARTMENTS[ROLES.GENERAL_MANAGER],
      position: "General Manager"
    },
    {
      id: "test-intake-coordinator",
      email: "intake.coord@primacycare.com.au",
      firstName: "Emily",
      lastName: "Thompson",
      role: ROLES.INTAKE_COORDINATOR,
      department: ROLE_DEPARTMENTS[ROLES.INTAKE_COORDINATOR],
      position: "Intake Coordinator"
    },
    {
      id: "test-intake-manager",
      email: "intake.manager@primacycare.com.au",
      firstName: "David",
      lastName: "Brown",
      role: ROLES.INTAKE_MANAGER,
      department: ROLE_DEPARTMENTS[ROLES.INTAKE_MANAGER],
      position: "Intake Manager"
    },
    {
      id: "test-finance-billing",
      email: "finance.billing@primacycare.com.au",
      firstName: "Jennifer",
      lastName: "Wilson",
      role: ROLES.FINANCE_OFFICER_BILLING,
      department: ROLE_DEPARTMENTS[ROLES.FINANCE_OFFICER_BILLING],
      position: "Finance Officer - Billing"
    },
    {
      id: "test-finance-payroll",
      email: "finance.payroll@primacycare.com.au",
      firstName: "Michael",
      lastName: "Davis",
      role: ROLES.FINANCE_OFFICER_PAYROLL,
      department: ROLE_DEPARTMENTS[ROLES.FINANCE_OFFICER_PAYROLL],
      position: "Finance Officer - Payroll"
    },
    {
      id: "test-finance-manager",
      email: "finance.manager@primacycare.com.au",
      firstName: "Robert",
      lastName: "Johnson",
      role: ROLES.FINANCE_MANAGER,
      department: ROLE_DEPARTMENTS[ROLES.FINANCE_MANAGER],
      position: "Finance Manager"
    },
    {
      id: "test-hr-manager",
      email: "hr.manager@primacycare.com.au",
      firstName: "Lisa",
      lastName: "Anderson",
      role: ROLES.HR_MANAGER,
      department: ROLE_DEPARTMENTS[ROLES.HR_MANAGER],
      position: "HR Manager"
    },
    {
      id: "test-hr-recruiter",
      email: "hr.recruiter@primacycare.com.au",
      firstName: "Mark",
      lastName: "Taylor",
      role: ROLES.HR_RECRUITER,
      department: ROLE_DEPARTMENTS[ROLES.HR_RECRUITER],
      position: "HR Recruiter"
    },
    {
      id: "test-service-manager",
      email: "service.manager@primacycare.com.au",
      firstName: "Patricia",
      lastName: "Moore",
      role: ROLES.SERVICE_DELIVERY_MANAGER,
      department: ROLE_DEPARTMENTS[ROLES.SERVICE_DELIVERY_MANAGER],
      position: "Service Delivery Manager"
    },
    {
      id: "test-service-allocation",
      email: "service.allocation@primacycare.com.au",
      firstName: "Steven",
      lastName: "Clark",
      role: ROLES.SERVICE_DELIVERY_ALLOCATION,
      department: ROLE_DEPARTMENTS[ROLES.SERVICE_DELIVERY_ALLOCATION],
      position: "Service Allocation Officer"
    },
    {
      id: "test-service-coordinator",
      email: "service.coord@primacycare.com.au",
      firstName: "Amanda",
      lastName: "White",
      role: ROLES.SERVICE_DELIVERY_COORDINATOR,
      department: ROLE_DEPARTMENTS[ROLES.SERVICE_DELIVERY_COORDINATOR],
      position: "Service Delivery Coordinator"
    },
    {
      id: "test-quality-manager",
      email: "quality@primacycare.com.au",
      firstName: "Christopher",
      lastName: "Harris",
      role: ROLES.QUALITY_MANAGER,
      department: ROLE_DEPARTMENTS[ROLES.QUALITY_MANAGER],
      position: "Quality Manager"
    },
    {
      id: "test-support-worker",
      email: "support@primacycare.com.au",
      firstName: "Jessica",
      lastName: "Martin",
      role: ROLES.SUPPORT_WORKER,
      department: ROLE_DEPARTMENTS[ROLES.SUPPORT_WORKER],
      position: "Support Worker"
    }
  ];

  // Insert test users
  for (const user of testUsers) {
    try {
      await db.insert(users).values({
        ...user,
        phone: "0400 000 000",
        isActive: true,
        lastLogin: new Date()
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          role: user.role,
          department: user.department,
          position: user.position,
          updatedAt: new Date()
        }
      });
      console.log(`Created/Updated test user: ${user.email} (Role: ${user.role})`);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }

  // Create sample data for testing
  console.log("Creating sample data...");

  // Sample participants
  const sampleParticipants = [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "0400 111 111",
      ndisNumber: "430000123",
      dateOfBirth: new Date("1985-05-15"),
      address: "123 Main St, Melbourne VIC 3000",
      emergencyContact: "Jane Smith - 0400 222 222",
      planManaged: false,
      createdAt: new Date()
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@example.com",
      phone: "0400 333 333",
      ndisNumber: "430000124",
      dateOfBirth: new Date("1990-08-22"),
      address: "456 Oak Ave, Richmond VIC 3121",
      emergencyContact: "Tom Johnson - 0400 444 444",
      planManaged: true,
      createdAt: new Date()
    }
  ];

  for (const participant of sampleParticipants) {
    try {
      await db.insert(participants).values(participant).onConflictDoNothing();
      console.log(`Created participant: ${participant.firstName} ${participant.lastName}`);
    } catch (error) {
      console.error(`Error creating participant:`, error);
    }
  }

  // Sample staff members
  const sampleStaff = [
    {
      userId: "test-support-worker",
      firstName: "Jessica",
      lastName: "Martin",
      email: "jessica.martin@primacycare.com.au",
      phone: "0400 555 555",
      position: "Senior Support Worker",
      department: "service_delivery",
      startDate: new Date("2022-03-15"),
      qualifications: ["Certificate III in Individual Support", "First Aid", "Manual Handling"],
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      status: "active" as const,
      createdAt: new Date()
    },
    {
      userId: "staff-2",
      firstName: "Thomas",
      lastName: "Lee",
      email: "thomas.lee@primacycare.com.au",
      phone: "0400 666 666",
      position: "Support Worker",
      department: "service_delivery",
      startDate: new Date("2023-01-10"),
      qualifications: ["Certificate III in Individual Support", "First Aid"],
      availableDays: ["Monday", "Wednesday", "Friday"],
      status: "active" as const,
      createdAt: new Date()
    }
  ];

  for (const staffMember of sampleStaff) {
    try {
      await db.insert(staff).values(staffMember).onConflictDoNothing();
      console.log(`Created staff: ${staffMember.firstName} ${staffMember.lastName}`);
    } catch (error) {
      console.error(`Error creating staff:`, error);
    }
  }

  // Sample referrals
  const sampleReferrals = [
    {
      participantName: "Michael Brown",
      referralSource: "ndis_planner" as const,
      referralDate: new Date("2024-01-05"),
      contactName: "NDIS Planner - Jane Doe",
      contactPhone: "0400 777 777",
      contactEmail: "planner@ndis.gov.au",
      urgency: "medium" as const,
      status: "pending" as const,
      notes: "New participant requiring personal care and community access support",
      createdAt: new Date()
    },
    {
      participantName: "Emma Wilson",
      referralSource: "family" as const,
      referralDate: new Date("2024-01-08"),
      contactName: "Robert Wilson (Father)",
      contactPhone: "0400 888 888",
      contactEmail: "r.wilson@example.com",
      urgency: "high" as const,
      status: "pending" as const,
      notes: "Urgent support needed for daily living activities",
      createdAt: new Date()
    }
  ];

  for (const referral of sampleReferrals) {
    try {
      await db.insert(referrals).values(referral).onConflictDoNothing();
      console.log(`Created referral: ${referral.participantName}`);
    } catch (error) {
      console.error(`Error creating referral:`, error);
    }
  }

  console.log("Test users and sample data created successfully!");
  console.log("\n=== TEST LOGIN CREDENTIALS ===");
  console.log("All test users can login with their email addresses:");
  testUsers.forEach(user => {
    console.log(`${user.role}: ${user.email}`);
  });
  console.log("\nNote: In development mode, authentication is bypassed.");
  console.log("You can switch between roles by logging out and logging in with a different email.");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestUsers()
    .then(() => {
      console.log("Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error during seeding:", error);
      process.exit(1);
    });
}