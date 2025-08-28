import { db } from './db';
import {
  users, participants, staff, ndisPlans, services, progressNotes,
  invoices, participantGoals, goalActions, shifts, shiftOffers,
  incidents, audits, referrals, serviceAgreements, jobPostings,
  jobApplications, staffQualifications, staffAvailability,
  staffUnavailability, invoiceItems, billingLines,
  ndisSupportCategories, ndisSupportItems, kpiMetrics,
  planDocuments, communications, alerts, notes, tasks,
  payroll, serviceDeliveryLogs, shiftAttendance
} from '@shared/schema';
import bcrypt from 'bcryptjs';

// Australian specific data
const australianSuburbs = [
  'Bondi', 'Surry Hills', 'Parramatta', 'Chatswood', 'Manly', 'Newtown',
  'Coogee', 'Randwick', 'Marrickville', 'Glebe', 'Balmain', 'Mosman',
  'St Kilda', 'Fitzroy', 'Carlton', 'South Yarra', 'Richmond', 'Prahran',
  'Brisbane City', 'Fortitude Valley', 'West End', 'New Farm', 'Toowong',
  'Perth', 'Fremantle', 'Subiaco', 'Cottesloe', 'Adelaide', 'Glenelg'
];

const australianStates = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const ndisCategories = [
  'Core Supports', 'Capacity Building', 'Capital Supports',
  'Core - Daily Activities', 'Core - Social and Community',
  'CB - Support Coordination', 'CB - Improved Living Arrangements'
];

const disabilityTypes = [
  'Intellectual', 'Physical', 'Neurological', 'Sensory', 'Psychosocial',
  'Autism', 'Multiple Sclerosis', 'Cerebral Palsy', 'Down Syndrome'
];

const staffRoles = [
  'support_worker', 'team_leader', 'coordinator', 'nurse', 'therapist',
  'manager', 'admin', 'finance', 'quality_officer', 'trainer'
];

const serviceTypes = [
  'Personal Care', 'Community Access', 'Domestic Assistance',
  'Transport', 'Therapy', 'Respite', 'Nursing', 'Group Activities',
  'Skill Development', 'Employment Support'
];

// Helper functions
const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const randomElements = <T>(array: T[], min: number, max: number): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomFloat = (min: number, max: number, decimals: number = 2): number => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

const randomBoolean = (probability: number = 0.5): boolean => {
  return Math.random() < probability;
};

const randomDate = (daysAgo: number, daysFuture: number = 0): Date => {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  const end = new Date();
  end.setDate(end.getDate() + daysFuture);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateNDISNumber = () => {
  return `43${randomNumber(1000000, 9999999)}`;
};

const generateABN = () => {
  return `${randomNumber(10, 99)} ${randomNumber(100, 999)} ${randomNumber(100, 999)} ${randomNumber(100, 999)}`;
};

const generatePhoneNumber = () => {
  return `04${randomNumber(10000000, 99999999)}`;
};

const generateNames = () => {
  const firstNames = ['James', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'John', 'Mary', 'Robert', 'Jennifer'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor'];
  return {
    firstName: randomElement(firstNames),
    lastName: randomElement(lastNames)
  };
};

async function seedComprehensiveTestData() {
  console.log('🚀 Starting comprehensive test data seeding...');
  console.log('📊 Target: 200 participants, 100 staff members');
  
  try {
    const startTime = Date.now();
    
    // 1. Create Support Categories and Items
    console.log('📋 Creating NDIS support categories and items...');
    const categories = [];
    for (const catName of ndisCategories) {
      const [category] = await db.insert(ndisSupportCategories).values({
        name: catName,
        code: catName.substring(0, 3).toUpperCase(),
        description: `${catName} support services`,
        isActive: true
      }).returning();
      categories.push(category);
    }
    
    // 2. Create Price Guide Items
    console.log('💰 Creating NDIS price guide...');
    const supportItems = [];
    for (const category of categories) {
      for (let i = 0; i < 5; i++) {
        const [item] = await db.insert(ndisSupportItems).values({
          categoryId: category.id,
          itemNumber: `0${randomNumber(1000, 9999)}_0${randomNumber(10, 99)}`,
          itemName: randomElement(serviceTypes) + ` - Level ${i + 1}`,
          unitType: randomElement(['Hour', 'Each', 'Day', 'Week']),
          priceNational: randomFloat(45, 195)
        }).returning();
        supportItems.push(item);
      }
    }
    
    // 3. Create Staff Users (100)
    console.log('👥 Creating 100 staff members...');
    const staffMembers = [];
    const staffUsers = [];
    
    for (let i = 1; i <= 100; i++) {
      const { firstName, lastName } = generateNames();
      const email = `staff${i}@primacycare.com.au`;
      
      // Create user account
      const [user] = await db.insert(users).values({
        email,
        hashedPassword: await bcrypt.hash('TestPass123!', 10),
        role: randomElement(staffRoles),
        isActive: true,
        createdAt: randomDate(730, 0) // Past 2 years
      }).returning();
      staffUsers.push(user);
      
      // Create staff profile
      const [staffMember] = await db.insert(staff).values({
        userId: user.id,
        firstName,
        lastName,
        email,
        phone: generatePhoneNumber(),
        position: randomElement(['Support Worker', 'Senior Support Worker', 'Team Leader', 'Coordinator']),
        department: randomElement(['Service Delivery', 'Clinical', 'Administration', 'Management']),
        employmentType: randomElement(['full-time', 'part-time', 'casual']),
        startDate: randomDate(1095, 0), // Past 3 years
        baseRate: randomFloat(25, 45),
        status: randomElement(['active', 'active', 'active', 'on-leave']),
        emergencyContact: `${generateNames().firstName} ${generateNames().lastName}`,
        emergencyPhone: generatePhoneNumber(),
        address: `${randomNumber(1, 999)} ${randomElement(['Main', 'High', 'Church', 'Park'])} Street, ${randomElement(australianSuburbs)}, ${randomElement(australianStates)} ${randomNumber(1000, 9999)}`,
        dateOfBirth: randomDate(23725, -8030), // 22-65 years old
        bankAccount: `${randomNumber(100000, 999999)}-${randomNumber(10000000, 99999999)}`,
        superannuation: randomElement(['Australian Super', 'REST', 'HESTA', 'Hostplus']),
        taxFileNumber: `${randomNumber(100, 999)}-${randomNumber(100, 999)}-${randomNumber(100, 999)}`,
        workingWithChildrenCheck: `WWC${randomNumber(1000000, 9999999)}`,
        ndisWorkerScreening: `NDIS${randomNumber(1000000, 9999999)}`,
        policeCheck: randomDate(365, 0),
        firstAidCertificate: randomDate(0, 730), // Valid for 2 years
        driverLicense: randomBoolean(0.7) ? `DL${randomNumber(1000000, 9999999)}` : null,
        hasReliableVehicle: randomBoolean(0.7),
        languages: randomElements(['English', 'Mandarin', 'Arabic', 'Vietnamese', 'Italian', 'Greek'], 1, 3),
        specializations: randomElements(['Autism', 'Mental Health', 'Physical Disability', 'Aged Care', 'Complex Needs'], 1, 3)
      }).returning();
      
      staffMembers.push(staffMember);
      
      // Add qualifications
      if (randomBoolean(0.8)) {
        await db.insert(staffQualifications).values({
          staffId: staffMember.id,
          qualificationType: randomElement(['Certificate III', 'Certificate IV', 'Diploma', 'Bachelor']),
          qualificationName: randomElement(['Individual Support', 'Disability', 'Community Services', 'Nursing']),
          institution: randomElement(['TAFE NSW', 'TAFE VIC', 'TAFE QLD']) + ' Institute',
          dateObtained: randomDate(1825, 0), // Past 5 years
          expiryDate: randomDate(0, 1095), // Next 3 years
          isVerified: true
        });
      }
      
      // Add availability
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of randomElements(days, 3, 5)) {
        await db.insert(staffAvailability).values({
          staffId: staffMember.id,
          dayOfWeek: day,
          startTime: randomElement(['07:00', '08:00', '09:00']),
          endTime: randomElement(['15:00', '16:00', '17:00', '18:00']),
          isAvailable: true,
          maxHours: randomNumber(6, 10)
        });
      }
    }
    
    console.log(`✅ Created ${staffMembers.length} staff members`);
    
    // 4. Create Participants (200)
    console.log('🧑‍🦽 Creating 200 participants...');
    const participantsList = [];
    const participantUsers = [];
    
    for (let i = 1; i <= 200; i++) {
      const { firstName, lastName } = generateNames();
      const email = `participant${i}@example.com`;
      
      // Create user account
      const [user] = await db.insert(users).values({
        email,
        hashedPassword: await bcrypt.hash('TestPass123!', 10),
        role: 'participant',
        isActive: true,
        createdAt: randomDate(365, 0)
      }).returning();
      participantUsers.push(user);
      
      // Create participant profile
      const [participant] = await db.insert(participants).values({
        userId: user.id,
        firstName,
        lastName,
        email,
        phone: generatePhoneNumber(),
        dateOfBirth: randomDate(31025, -6570), // 18-85 years old
        address: `${randomNumber(1, 999)} ${randomElement(['Main', 'High', 'Church', 'Park'])} Street, ${randomElement(australianSuburbs)}, ${randomElement(australianStates)} ${randomNumber(1000, 9999)}`,
        ndisNumber: generateNDISNumber(),
        status: randomElement(['active', 'active', 'active', 'inactive']),
        primaryDisability: randomElement(disabilityTypes),
        secondaryDisabilities: randomElements(disabilityTypes, 0, 2),
        communicationNeeds: randomElements(['Verbal', 'Non-verbal', 'Sign Language', 'Communication Device'], 1, 2),
        mobilityNeeds: randomElement(['Independent', 'Walking Aid', 'Wheelchair', 'Full Assistance']),
        medicalConditions: randomElements(['Diabetes', 'Epilepsy', 'Heart Condition', 'Asthma'], 0, 2),
        medications: randomElements(['Medication A', 'Medication B', 'Medication C'], 0, 3),
        allergies: randomElements(['Peanuts', 'Latex', 'Penicillin'], 0, 2),
        emergencyContactName: `${generateNames().firstName} ${generateNames().lastName}`,
        emergencyContactPhone: generatePhoneNumber(),
        emergencyContactRelation: randomElement(['Parent', 'Sibling', 'Guardian', 'Friend']),
        gpName: `Dr. ${generateNames().lastName}`,
        gpPhone: `0${randomNumber(2, 8)}${randomNumber(10000000, 99999999)}`,
        gpAddress: `${randomNumber(1, 999)} Medical Centre, ${randomElement(australianSuburbs)}`,
        culturalBackground: randomElement(['Australian', 'Indigenous', 'European', 'Asian', 'Middle Eastern']),
        languageSpoken: randomElement(['English', 'Mandarin', 'Arabic', 'Vietnamese', 'Italian']),
        religiousPreferences: randomElement(['None', 'Christian', 'Muslim', 'Buddhist', 'Hindu']),
        dietaryRequirements: randomElements(['Vegetarian', 'Halal', 'Kosher', 'Gluten Free'], 0, 2),
        transportRequirements: randomElement(['Independent', 'Public Transport', 'Support Required', 'Wheelchair Accessible']),
        housingStatus: randomElement(['Independent', 'SIL', 'Family', 'Group Home']),
        fundingType: 'NDIS',
        planManagerName: randomBoolean(0.5) ? `${randomElement(['Plan', 'Support', 'Care'])} Partners` : null,
        planManagerEmail: randomBoolean(0.5) ? `admin@planpartners.com.au` : null,
        planManagerPhone: randomBoolean(0.5) ? `0${randomNumber(2, 8)}${randomNumber(10000000, 99999999)}` : null,
        behaviourSupportPlan: randomBoolean(0.3),
        restrictivePractices: randomBoolean(0.1),
        riskAssessments: randomElements(['Falls', 'Choking', 'Absconding', 'Self-harm'], 0, 2),
        createdAt: randomDate(730, 0)
      }).returning();
      
      participantsList.push(participant);
      
      // Emergency contact is stored in the participant record itself
      // No separate emergency contacts table needed
    }
    
    console.log(`✅ Created ${participantsList.length} participants`);
    
    // 5. Create NDIS Plans
    console.log('📑 Creating NDIS plans with goals...');
    const plansList = [];
    let totalGoals = 0;
    let totalActions = 0;
    
    for (const participant of participantsList) {
      const planStartDate = randomDate(365, -180);
      const planEndDate = new Date(planStartDate);
      planEndDate.setFullYear(planEndDate.getFullYear() + randomElement([1, 2]));
      
      const [plan] = await db.insert(ndisPlans).values({
        participantId: participant.id,
        planNumber: `N${randomNumber(1000000, 9999999)}`,
        startDate: planStartDate,
        endDate: planEndDate,
        totalBudget: randomFloat(30000, 150000),
        usedBudget: randomFloat(5000, 50000),
        status: randomElement(['active', 'active', 'review', 'expired']),
        planType: randomElement(['Full Scheme', 'Supported Independent Living', 'Early Childhood']),
        fundingType: randomElement(['Agency Managed', 'Plan Managed', 'Self Managed', 'Mixed']),
        supportCoordination: randomBoolean(0.7),
        supportCoordinationLevel: randomElement(['Level 1', 'Level 2', 'Level 3']),
        categories: randomElements(ndisCategories, 2, 5)
      }).returning();
      
      plansList.push(plan);
      
      // Create goals for each plan
      const goalCount = randomNumber(2, 5);
      for (let g = 0; g < goalCount; g++) {
        const [goal] = await db.insert(participantGoals).values({
          participantId: participant.id,
          planId: plan.id,
          goalTitle: randomElement([
            'Improve independence in daily living',
            'Increase social participation',
            'Develop work skills',
            'Improve communication abilities',
            'Enhance mobility and access'
          ]),
          goalDescription: 'Working towards achieving greater independence and quality of life through targeted support services.',
          category: randomElement(['Daily Living', 'Social', 'Employment', 'Health', 'Education']),
          priority: randomElement(['high', 'medium', 'low']),
          status: randomElement(['active', 'in-progress', 'completed', 'on-hold']),
          targetDate: randomDate(-30, 365),
          progress: randomNumber(0, 100),
          assignedStaffId: randomElement(staffMembers).id
        }).returning();
        totalGoals++;
        
        // Create actions for each goal
        const actionCount = randomNumber(2, 4);
        for (let a = 0; a < actionCount; a++) {
          await db.insert(goalActions).values({
            goalId: goal.id,
            actionTitle: `Support action ${a + 1}`,
            actionDescription: 'Providing targeted support to achieve goal outcomes.',
            frequency: randomElement(['daily', 'weekly', 'fortnightly', 'monthly']),
            supportItemId: randomElement(supportItems).id,
            hoursPerWeek: randomFloat(1, 10, 1),
            status: randomElement(['pending', 'active', 'completed']),
            assignedStaffId: randomElement(staffMembers).id,
            dueDate: randomDate(-30, 365)
          });
          totalActions++;
        }
      }
    }
    
    console.log(`✅ Created ${plansList.length} NDIS plans with ${totalGoals} goals and ${totalActions} actions`);
    
    // 6. Create Services and Progress Notes
    console.log('🚗 Creating services and progress notes...');
    let servicesCount = 0;
    let notesCount = 0;
    
    // Create services for 150 active participants
    for (const participant of participantsList.slice(0, 150)) {
      const serviceCount = randomNumber(5, 15);
      
      for (let s = 0; s < serviceCount; s++) {
        const serviceDate = randomDate(30, 30);
        const isPast = serviceDate < new Date();
        const assignedStaff = randomElement(staffMembers);
        
        const [service] = await db.insert(services).values({
          participantId: participant.id,
          planId: plansList.find(p => p.participantId === participant.id)?.id,
          serviceType: randomElement(serviceTypes),
          scheduledDate: serviceDate.toISOString().split('T')[0],
          scheduledStartTime: randomElement(['09:00', '10:00', '14:00', '15:00']),
          scheduledEndTime: randomElement(['12:00', '13:00', '17:00', '18:00']),
          actualStartTime: isPast ? randomElement(['09:05', '10:02', '14:10']) : null,
          actualEndTime: isPast ? randomElement(['11:55', '12:58', '16:50']) : null,
          status: isPast ? 'completed' : randomElement(['scheduled', 'confirmed']),
          assignedTo: assignedStaff.userId,
          location: randomElement(['Home', 'Community', 'Centre', 'Online']),
          notes: 'Service delivery notes',
          travelDistance: randomNumber(5, 50),
          travelTime: randomNumber(10, 60),
          createdBy: randomElement(staffUsers).id
        }).returning();
        servicesCount++;
        
        // Create progress notes for completed services
        if (service.status === 'completed') {
          await db.insert(progressNotes).values({
            serviceId: service.id,
            participantId: participant.id,
            staffId: assignedStaff.id,
            noteDate: serviceDate,
            noteType: randomElement(['Progress', 'Incident', 'General']),
            content: 'Service delivered successfully. Participant engaged well with activities. Goals addressed as per care plan.',
            goals: 'Working on independence and skill development',
            outcomes: 'Positive progress observed',
            followUp: randomBoolean(0.3) ? 'Schedule follow-up session next week' : null,
            createdBy: assignedStaff.userId
          });
          notesCount++;
        }
      }
    }
    
    console.log(`✅ Created ${servicesCount} services with ${notesCount} progress notes`);
    
    // 7. Create Shifts for upcoming services
    console.log('📅 Creating shifts and shift offers...');
    let shiftsCount = 0;
    let offersCount = 0;
    
    // Get future services
    const futureServices = await db.select()
      .from(services)
      .where(services.status === 'scheduled' || services.status === 'confirmed')
      .limit(200);
    
    for (const service of futureServices) {
      const [shift] = await db.insert(shifts).values({
        participantId: service.participantId,
        serviceId: service.id,
        shiftDate: new Date(service.scheduledDate),
        startTime: service.scheduledStartTime,
        endTime: service.scheduledEndTime,
        shiftType: randomElement(['Regular', 'Respite', 'Emergency']),
        location: service.location || 'TBD',
        requiredSkills: randomElements(['Personal Care', 'Medication', 'Behavior Support'], 1, 2),
        status: randomElement(['open', 'allocated', 'confirmed']),
        assignedStaffId: randomElement(staffMembers).id,
        notes: 'Shift requirements and details'
      }).returning();
      shiftsCount++;
      
      // Create shift offers
      const offerCount = randomNumber(1, 3);
      for (let o = 0; o < offerCount; o++) {
        await db.insert(shiftOffers).values({
          shiftId: shift.id,
          staffId: randomElement(staffMembers).id,
          offerStatus: randomElement(['pending', 'accepted', 'declined']),
          offerExpiresAt: randomDate(-7, 7),
          responseReceivedAt: randomBoolean(0.7) ? randomDate(2, 0) : null
        });
        offersCount++;
      }
    }
    
    console.log(`✅ Created ${shiftsCount} shifts with ${offersCount} offers`);
    
    // 8. Create Invoices and Billing
    console.log('💳 Creating invoices and billing data...');
    let invoicesCount = 0;
    let invoiceItemsCount = 0;
    
    // Create invoices for 100 participants
    for (const participant of participantsList.slice(0, 100)) {
      const invoiceCount = randomNumber(1, 6);
      
      for (let i = 0; i < invoiceCount; i++) {
        const invoiceDate = randomDate(180, -30);
        const total = randomFloat(550, 5500);
        const gst = total * 0.1;
        const subtotal = total - gst;
        
        const [invoice] = await db.insert(invoices).values({
          participantId: participant.id,
          planId: plansList.find(p => p.participantId === participant.id)?.id,
          invoiceNumber: `INV-${randomNumber(10000, 99999)}`,
          issueDate: invoiceDate,
          dueDate: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          status: randomElement(['draft', 'sent', 'paid', 'overdue']),
          subtotal: subtotal.toString(),
          gst: gst.toString(),
          total: total.toString(),
          paidAmount: randomElement(['0', total.toString()]),
          claimReference: `CLM${randomNumber(1000000, 9999999)}`,
          ndisPaymentStatus: randomElement(['pending', 'approved', 'paid', 'rejected']),
          createdBy: randomElement(staffUsers).id
        }).returning();
        invoicesCount++;
        
        // Create invoice items
        const itemCount = randomNumber(1, 5);
        for (let item = 0; item < itemCount; item++) {
          const supportItem = randomElement(supportItems);
          const quantity = randomNumber(1, 10);
          const unitPrice = randomFloat(50, 200);
          
          await db.insert(invoiceItems).values({
            invoiceId: invoice.id,
            description: supportItem.itemName,
            supportItemNumber: supportItem.itemNumber,
            quantity,
            unitPrice: unitPrice.toString(),
            total: (quantity * unitPrice).toString()
          });
          invoiceItemsCount++;
        }
      }
    }
    
    console.log(`✅ Created ${invoicesCount} invoices with ${invoiceItemsCount} items`);
    
    // 9. Create Incidents
    console.log('⚠️ Creating incidents...');
    let incidentsCount = 0;
    
    for (let i = 0; i < 50; i++) {
      const incidentDate = randomDate(180, 0);
      await db.insert(incidents).values({
        incidentNumber: `INC-${randomNumber(1000, 9999)}`,
        participantId: randomElement(participantsList).id,
        staffId: randomElement(staffMembers).id,
        incidentDate: incidentDate,
        incidentTime: `${randomNumber(0, 23).toString().padStart(2, '0')}:${randomNumber(0, 59).toString().padStart(2, '0')}`,
        location: randomElement(['Home', 'Community', 'Vehicle', 'Centre']),
        incidentType: randomElement(['Fall', 'Medication', 'Behavior', 'Injury', 'Property']),
        severity: randomElement(['minor', 'moderate', 'major', 'critical']),
        description: 'Incident description and details of what occurred.',
        immediateAction: 'Immediate action taken to address the incident.',
        injuriesRecorded: randomBoolean(0.4),
        medicalTreatmentRequired: randomBoolean(0.3),
        reportableToNDIS: randomBoolean(0.2),
        status: randomElement(['draft', 'submitted', 'investigating', 'closed']),
        reportedBy: randomElement(staffUsers).id,
        reportedAt: incidentDate
      });
      incidentsCount++;
    }
    
    console.log(`✅ Created ${incidentsCount} incidents`);
    
    // 10. Create Referrals and Service Agreements
    console.log('📝 Creating referrals and service agreements...');
    let referralsCount = 0;
    let agreementsCount = 0;
    
    for (let i = 0; i < 30; i++) {
      const [referral] = await db.insert(referrals).values({
        referralNumber: `REF-${randomNumber(1000, 9999)}`,
        referralDate: randomDate(90, -30),
        referralSource: randomElement(['NDIS', 'Hospital', 'GP', 'Self', 'Family']),
        referrerName: `${generateNames().firstName} ${generateNames().lastName}`,
        referrerOrganization: randomElement(['Local Hospital', 'Medical Centre', 'NDIS LAC', 'Community Health']),
        referrerPhone: `0${randomNumber(2, 8)}${randomNumber(10000000, 99999999)}`,
        participantName: `${generateNames().firstName} ${generateNames().lastName}`,
        participantPhone: generatePhoneNumber(),
        status: randomElement(['new', 'in-progress', 'accepted', 'rejected']),
        priority: randomElement(['low', 'medium', 'high', 'urgent']),
        assignedTo: randomElement(staffUsers).id
      }).returning();
      referralsCount++;
      
      // Create service agreement for accepted referrals
      if (referral.status === 'accepted') {
        await db.insert(serviceAgreements).values({
          participantId: randomElement(participantsList).id,
          agreementNumber: `SA-${randomNumber(1000, 9999)}`,
          startDate: randomDate(30, -30),
          endDate: randomDate(-30, 365),
          status: randomElement(['draft', 'active', 'expired']),
          servicesIncluded: randomElements(serviceTypes, 2, 5),
          totalHours: randomNumber(10, 100),
          hourlyRate: randomFloat(45, 95),
          signedBy: `${generateNames().firstName} ${generateNames().lastName}`,
          signedDate: randomDate(30, 0),
          createdBy: randomElement(staffUsers).id
        });
        agreementsCount++;
      }
    }
    
    console.log(`✅ Created ${referralsCount} referrals and ${agreementsCount} service agreements`);
    
    // 11. Create HR Data
    console.log('👔 Creating HR and recruitment data...');
    let jobsCount = 0;
    let applicationsCount = 0;
    
    for (let i = 0; i < 10; i++) {
      const [posting] = await db.insert(jobPostings).values({
        title: randomElement(['Support Worker', 'Team Leader', 'Coordinator', 'Administrator']),
        department: randomElement(['Service Delivery', 'Clinical', 'Administration']),
        location: `${randomElement(australianSuburbs)}, ${randomElement(australianStates)}`,
        employmentType: randomElement(['full-time', 'part-time', 'casual']),
        salaryRange: `$${randomNumber(50, 80)},000 - $${randomNumber(60, 100)},000`,
        description: 'Position description and key responsibilities.',
        requirements: 'Required qualifications and experience.',
        status: randomElement(['draft', 'published', 'closed']),
        publishedDate: randomDate(60, -30),
        closingDate: randomDate(-30, 30),
        createdBy: randomElement(staffUsers).id
      }).returning();
      jobsCount++;
      
      // Create applications
      const applicationCount = randomNumber(5, 20);
      for (let a = 0; a < applicationCount; a++) {
        await db.insert(jobApplications).values({
          jobPostingId: posting.id,
          candidateName: `${generateNames().firstName} ${generateNames().lastName}`,
          candidateEmail: `candidate${a}@example.com`,
          candidatePhone: generatePhoneNumber(),
          resumeUrl: 'https://example.com/resume.pdf',
          coverLetter: 'Cover letter content.',
          status: randomElement(['new', 'screening', 'interview', 'reference-check', 'offered', 'rejected']),
          rating: randomNumber(1, 5),
          notes: 'Application notes and comments.'
        });
        applicationsCount++;
      }
    }
    
    console.log(`✅ Created ${jobsCount} job postings with ${applicationsCount} applications`);
    
    // 12. Create KPI Metrics
    console.log('📊 Creating KPI metrics...');
    const kpiTypes = [
      'service_delivery_rate', 'participant_satisfaction', 'staff_utilization',
      'incident_rate', 'compliance_score', 'budget_utilization'
    ];
    
    for (const type of kpiTypes) {
      await db.insert(kpiMetrics).values({
        metricType: type,
        metricValue: randomFloat(60, 98, 1),
        targetValue: randomFloat(80, 100, 1),
        period: 'monthly',
        calculatedAt: new Date()
      });
    }
    
    console.log(`✅ Created ${kpiTypes.length} KPI metrics`);
    
    // Calculate summary
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n✅ Comprehensive test data seeding completed!');
    console.log(`⏱️ Total time: ${duration.toFixed(2)} seconds`);
    console.log('\n📊 Summary:');
    console.log(`   - Staff Members: ${staffMembers.length}`);
    console.log(`   - Participants: ${participantsList.length}`);
    console.log(`   - NDIS Plans: ${plansList.length}`);
    console.log(`   - Goals: ${totalGoals}`);
    console.log(`   - Actions: ${totalActions}`);
    console.log(`   - Services: ${servicesCount}`);
    console.log(`   - Progress Notes: ${notesCount}`);
    console.log(`   - Shifts: ${shiftsCount}`);
    console.log(`   - Shift Offers: ${offersCount}`);
    console.log(`   - Invoices: ${invoicesCount}`);
    console.log(`   - Invoice Items: ${invoiceItemsCount}`);
    console.log(`   - Incidents: ${incidentsCount}`);
    console.log(`   - Referrals: ${referralsCount}`);
    console.log(`   - Service Agreements: ${agreementsCount}`);
    console.log(`   - Job Postings: ${jobsCount}`);
    console.log(`   - Applications: ${applicationsCount}`);
    console.log(`   - KPI Metrics: ${kpiTypes.length}`);
    
    return {
      success: true,
      summary: {
        staff: staffMembers.length,
        participants: participantsList.length,
        plans: plansList.length,
        services: servicesCount,
        shifts: shiftsCount,
        invoices: invoicesCount,
        incidents: incidentsCount,
        duration: duration
      }
    };
  } catch (error) {
    console.error('❌ Error seeding comprehensive test data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedComprehensiveTestData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedComprehensiveTestData };