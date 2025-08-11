import { db } from "./db";
import { 
  ndisSupportCategories, 
  ndisSupportItems, 
  ndisPricing 
} from "@shared/schema";

// Official NDIS 2024-25 Support Categories
const supportCategories = [
  {
    id: "cat_01",
    categoryNumber: "01",
    name: "Assistance with Daily Life",
    description: "Assistance with personal care, cooking, cleaning, household tasks, and other activities of daily living",
    budgetType: "core_supports",
    isFlexible: true,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_02", 
    categoryNumber: "02",
    name: "Transport",
    description: "Transport to access community, social and recreational activities when unable to use public transport",
    budgetType: "core_supports",
    isFlexible: true,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_03",
    categoryNumber: "03", 
    name: "Consumables",
    description: "Everyday items and aids including continence products, low cost assistive technology",
    budgetType: "core_supports",
    isFlexible: true,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_04",
    categoryNumber: "04",
    name: "Assistance with Social & Community Participation",
    description: "Support to participate in community, social and recreational activities",
    budgetType: "core_supports", 
    isFlexible: true,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_05",
    categoryNumber: "05",
    name: "Finding & Keeping a Home",
    description: "Support to find and keep appropriate housing and living arrangements",
    budgetType: "capacity_building",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_06",
    categoryNumber: "06",
    name: "Increased Social & Community Participation", 
    description: "Therapy and training to develop skills for community participation",
    budgetType: "capacity_building",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_07",
    categoryNumber: "07",
    name: "Finding & Keeping a Job",
    description: "Support to find and keep employment including job coaching and workplace assessments",
    budgetType: "capacity_building",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_08",
    categoryNumber: "08",
    name: "Improved Relationships",
    description: "Support to develop and maintain relationships and social skills",
    budgetType: "capacity_building",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_09",
    categoryNumber: "09",
    name: "Improved Health & Wellbeing", 
    description: "Therapy and training focused on health, fitness and wellbeing",
    budgetType: "capacity_building",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_10",
    categoryNumber: "10",
    name: "Improved Learning",
    description: "Support to develop skills for learning and education including school to work transition",
    budgetType: "capacity_building",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_11",
    categoryNumber: "11",
    name: "Improved Life Choices",
    description: "Support coordination and plan management to improve choice and control",
    budgetType: "capacity_building",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_12",
    categoryNumber: "12",
    name: "Improved Daily Living Skills",
    description: "Therapy and training to develop daily living and life skills",
    budgetType: "capacity_building",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_13", 
    categoryNumber: "13",
    name: "Assistive Technology",
    description: "Equipment and technology to support independence and safety",
    budgetType: "capital_supports",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_14",
    categoryNumber: "14",
    name: "Home Modifications",
    description: "Physical modifications to the home environment for accessibility and safety",
    budgetType: "capital_supports",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "cat_15",
    categoryNumber: "15",
    name: "Specialist Disability Accommodation",
    description: "Housing designed to meet the needs of people with extreme functional impairment or very high support needs",
    budgetType: "capital_supports",
    isFlexible: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
];

// Common NDIS Support Items with official codes
const supportItems = [
  // Core Supports - Daily Living
  {
    id: "item_01_011",
    supportCode: "01_011_0104_6_3",
    name: "Assistance with Personal Care Activities",
    description: "Support with showering, dressing, grooming and other personal care tasks",
    categoryId: "cat_01",
    unitType: "hour",
    supportType: "individual",
    registrationGroup: "standard",
    minimumCancellationNotice: 168, // 7 days in hours
    isQuoteBased: false,
    requiresAssessment: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  {
    id: "item_01_015",
    supportCode: "01_015_0104_6_3", 
    name: "Assistance with Household Tasks",
    description: "Support with cooking, cleaning, shopping and other household activities",
    categoryId: "cat_01",
    unitType: "hour",
    supportType: "individual",
    registrationGroup: "standard",
    minimumCancellationNotice: 168,
    isQuoteBased: false,
    requiresAssessment: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  // Transport
  {
    id: "item_02_001",
    supportCode: "02_001_0102_6_3",
    name: "Transport - Use of Own Vehicle",
    description: "Reimbursement for use of participant's own vehicle when unable to use public transport",
    categoryId: "cat_02",
    unitType: "km",
    supportType: "transport",
    registrationGroup: "standard",
    minimumCancellationNotice: 48,
    isQuoteBased: false,
    requiresAssessment: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  // Consumables
  {
    id: "item_03_001",
    supportCode: "03_001_0109_6_3",
    name: "Continence Aids",
    description: "Continence pads, catheters and other continence management products",
    categoryId: "cat_03",
    unitType: "each",
    supportType: "consumable",
    registrationGroup: "standard",
    minimumCancellationNotice: 48,
    isQuoteBased: false,
    requiresAssessment: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  // Community Participation
  {
    id: "item_04_001",
    supportCode: "04_001_0125_6_1",
    name: "Group Activities - Community Participation",
    description: "Support to participate in group activities in the community",
    categoryId: "cat_04",
    unitType: "hour",
    supportType: "group",
    registrationGroup: "standard", 
    minimumCancellationNotice: 48,
    isQuoteBased: false,
    requiresAssessment: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  // Capacity Building - Finding a Home
  {
    id: "item_05_001",
    supportCode: "05_001_0106_6_3",
    name: "Assistance to Access/Maintain Housing",
    description: "Support to find and maintain appropriate accommodation",
    categoryId: "cat_05",
    unitType: "hour",
    supportType: "individual",
    registrationGroup: "standard",
    minimumCancellationNotice: 48,
    isQuoteBased: false,
    requiresAssessment: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  // Therapy Services
  {
    id: "item_09_001",
    supportCode: "09_001_0128_6_3",
    name: "Therapeutic Supports",
    description: "Allied health therapy including physiotherapy, occupational therapy, speech therapy",
    categoryId: "cat_09",
    unitType: "hour",
    supportType: "individual",
    registrationGroup: "specialist",
    minimumCancellationNotice: 48,
    isQuoteBased: false,
    requiresAssessment: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  // Plan Management
  {
    id: "item_11_001",
    supportCode: "11_001_0136_6_3",
    name: "Plan Management",
    description: "Financial management of NDIS plan including invoice processing and payments",
    categoryId: "cat_11",
    unitType: "month",
    supportType: "individual",
    registrationGroup: "specialist",
    minimumCancellationNotice: 48,
    isQuoteBased: false,
    requiresAssessment: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
  // Support Coordination
  {
    id: "item_11_002", 
    supportCode: "11_002_0106_6_3",
    name: "Support Coordination",
    description: "Assistance to implement and coordinate supports in participant's plan",
    categoryId: "cat_11",
    unitType: "hour",
    supportType: "individual",
    registrationGroup: "specialist",
    minimumCancellationNotice: 48,
    isQuoteBased: false,
    requiresAssessment: false,
    isActive: true,
    effectiveDate: new Date("2024-07-01"),
  },
];

// 2024-25 NDIS Pricing with geographic variations
const pricingData = [
  // Personal Care - Standard DSW rate across geographic areas
  {
    supportItemId: "item_01_011",
    geographicArea: "metropolitan",
    priceLimit: 68.27,
    currency: "AUD", 
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_01_011",
    geographicArea: "regional",
    priceLimit: 68.27,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_01_011",
    geographicArea: "remote",
    priceLimit: 95.58, // 40% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_01_011",
    geographicArea: "very_remote",
    priceLimit: 102.41, // 50% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  // Household Tasks
  {
    supportItemId: "item_01_015",
    geographicArea: "metropolitan",
    priceLimit: 61.93,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_01_015",
    geographicArea: "regional",
    priceLimit: 61.93,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_01_015",
    geographicArea: "remote",
    priceLimit: 86.70, // 40% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_01_015",
    geographicArea: "very_remote",
    priceLimit: 92.90, // 50% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  // Transport - Vehicle Use
  {
    supportItemId: "item_02_001",
    geographicArea: "metropolitan",
    priceLimit: 0.85,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_02_001",
    geographicArea: "regional",
    priceLimit: 0.85,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_02_001",
    geographicArea: "remote",
    priceLimit: 1.19, // 40% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_02_001",
    geographicArea: "very_remote",
    priceLimit: 1.28, // 50% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  // Group Community Participation
  {
    supportItemId: "item_04_001",
    geographicArea: "metropolitan",
    priceLimit: 15.73,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_04_001",
    geographicArea: "regional", 
    priceLimit: 15.73,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_04_001",
    geographicArea: "remote",
    priceLimit: 22.02, // 40% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_04_001",
    geographicArea: "very_remote",
    priceLimit: 23.60, // 50% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  // Therapeutic Supports
  {
    supportItemId: "item_09_001",
    geographicArea: "metropolitan",
    priceLimit: 193.99,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_09_001",
    geographicArea: "regional",
    priceLimit: 193.99,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_09_001",
    geographicArea: "remote",
    priceLimit: 271.59, // 40% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_09_001",
    geographicArea: "very_remote",
    priceLimit: 290.99, // 50% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  // Plan Management - Fixed monthly rate
  {
    supportItemId: "item_11_001",
    geographicArea: "metropolitan",
    priceLimit: 132.96,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_11_001",
    geographicArea: "regional",
    priceLimit: 132.96,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_11_001",
    geographicArea: "remote",
    priceLimit: 132.96, // No loading for plan management
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_11_001",
    geographicArea: "very_remote",
    priceLimit: 132.96, // No loading for plan management
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  // Support Coordination
  {
    supportItemId: "item_11_002",
    geographicArea: "metropolitan",
    priceLimit: 147.19,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_11_002",
    geographicArea: "regional",
    priceLimit: 147.19,
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_11_002",
    geographicArea: "remote",
    priceLimit: 206.07, // 40% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
  {
    supportItemId: "item_11_002",
    geographicArea: "very_remote", 
    priceLimit: 220.79, // 50% loading
    currency: "AUD",
    effectiveDate: new Date("2024-07-01"),
    isActive: true,
  },
];

export async function seedNdisData() {
  console.log("🌱 Seeding NDIS Price Guide data...");
  
  try {
    // Insert support categories
    console.log("📋 Creating support categories...");
    for (const category of supportCategories) {
      await db.insert(ndisSupportCategories).values(category).onConflictDoNothing();
    }
    
    // Insert support items
    console.log("🛠️ Creating support items...");
    for (const item of supportItems) {
      await db.insert(ndisSupportItems).values(item).onConflictDoNothing();
    }
    
    // Insert pricing data
    console.log("💰 Creating pricing data...");
    for (const pricing of pricingData) {
      await db.insert(ndisPricing).values(pricing).onConflictDoNothing();
    }
    
    console.log("✅ NDIS Price Guide data seeded successfully!");
    console.log(`   • ${supportCategories.length} support categories`);
    console.log(`   • ${supportItems.length} support items`);
    console.log(`   • ${pricingData.length} pricing records`);
    
  } catch (error) {
    console.error("❌ Error seeding NDIS data:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNdisData()
    .then(() => {
      console.log("🎉 Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}