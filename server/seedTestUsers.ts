import { db } from "./db";
import { users, userRoles, staff } from "@shared/schema";
import { eq } from "drizzle-orm";

// Test user data for each role
export const testUsers = [
  {
    id: "test-super-admin",
    email: "admin@primacycare.test",
    firstName: "Sarah",
    lastName: "Admin",
    role: "Super Admin" as const,
    department: "Administration",
    password: "admin123" // In production, this would be hashed
  },
  {
    id: "test-ceo",
    email: "ceo@primacycare.test",
    firstName: "Michael",
    lastName: "Thompson",
    role: "CEO" as const,
    department: "Executive",
    password: "ceo123"
  },
  {
    id: "test-general-manager",
    email: "gm@primacycare.test",
    firstName: "Jennifer",
    lastName: "Williams",
    role: "General Manager" as const,
    department: "Management",
    password: "gm123"
  },
  {
    id: "test-intake-coordinator",
    email: "intake.coord@primacycare.test",
    firstName: "David",
    lastName: "Chen",
    role: "Intake Coordinator" as const,
    department: "Intake",
    password: "intake123"
  },
  {
    id: "test-intake-manager",
    email: "intake.mgr@primacycare.test",
    firstName: "Lisa",
    lastName: "Martinez",
    role: "Intake Manager" as const,
    department: "Intake",
    password: "intakemgr123"
  },
  {
    id: "test-finance-billing",
    email: "billing@primacycare.test",
    firstName: "Robert",
    lastName: "Johnson",
    role: "Finance Officer - Billing" as const,
    department: "Finance",
    password: "billing123"
  },
  {
    id: "test-finance-payroll",
    email: "payroll@primacycare.test",
    firstName: "Emma",
    lastName: "Davis",
    role: "Finance Officer - Payroll" as const,
    department: "Finance",
    password: "payroll123"
  },
  {
    id: "test-finance-manager",
    email: "finance.mgr@primacycare.test",
    firstName: "James",
    lastName: "Anderson",
    role: "Finance Manager" as const,
    department: "Finance",
    password: "financemgr123"
  },
  {
    id: "test-hr-manager",
    email: "hr.mgr@primacycare.test",
    firstName: "Patricia",
    lastName: "Brown",
    role: "HR Manager" as const,
    department: "HR & Recruitment",
    password: "hrmgr123"
  },
  {
    id: "test-hr-recruiter",
    email: "recruiter@primacycare.test",
    firstName: "Andrew",
    lastName: "Taylor",
    role: "HR Recruiter" as const,
    department: "HR & Recruitment",
    password: "recruiter123"
  },
  {
    id: "test-service-manager",
    email: "service.mgr@primacycare.test",
    firstName: "Maria",
    lastName: "Garcia",
    role: "Service Delivery Manager" as const,
    department: "Service Delivery",
    password: "servicemgr123"
  },
  {
    id: "test-service-allocation",
    email: "allocation@primacycare.test",
    firstName: "Kevin",
    lastName: "Lee",
    role: "Service Delivery - Allocation" as const,
    department: "Service Delivery",
    password: "allocation123"
  },
  {
    id: "test-service-coordinator",
    email: "coordinator@primacycare.test",
    firstName: "Sophie",
    lastName: "Wilson",
    role: "Service Delivery Coordinator" as const,
    department: "Service Delivery",
    password: "coordinator123"
  },
  {
    id: "test-quality-manager",
    email: "quality@primacycare.test",
    firstName: "Daniel",
    lastName: "Moore",
    role: "Quality Manager" as const,
    department: "Compliance & Quality",
    password: "quality123"
  },
  {
    id: "test-support-worker",
    email: "support@primacycare.test",
    firstName: "Emily",
    lastName: "Jackson",
    role: "Support Worker" as const,
    department: "Service Delivery",
    password: "support123"
  }
];

export async function seedTestUsers() {
  console.log("Seeding test users...");
  
  try {
    for (const testUser of testUsers) {
      // Check if user exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.id, testUser.id))
        .limit(1);
      
      if (existingUser.length === 0) {
        // Create user
        await db.insert(users).values({
          id: testUser.id,
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          profileImageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${testUser.firstName}${testUser.lastName}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Create user role
        await db.insert(userRoles).values({
          userId: testUser.id,
          role: testUser.role,
          assignedAt: new Date(),
          assignedBy: "system"
        });
        
        // Create staff record for non-executive roles
        if (!["CEO", "General Manager", "Super Admin"].includes(testUser.role)) {
          await db.insert(staff).values({
            userId: testUser.id,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            email: testUser.email,
            phone: `04${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
            position: testUser.role,
            department: testUser.department,
            startDate: new Date(),
            employmentStatus: "active",
            employmentType: "full-time",
            hourlyRate: 35 + Math.floor(Math.random() * 30),
            emergencyContact: "Emergency Contact",
            emergencyPhone: "0400000000",
            bankAccount: "123-456-789",
            taxFileNumber: "123456789",
            superannuationFund: "Test Super Fund"
          });
        }
        
        console.log(`Created test user: ${testUser.email} (${testUser.role})`);
      } else {
        console.log(`Test user already exists: ${testUser.email}`);
      }
    }
    
    console.log("Test users seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding test users:", error);
    return false;
  }
}

// Run if executed directly
seedTestUsers().then(() => process.exit(0));