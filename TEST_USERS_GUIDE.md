# Test Users Guide - Primacy Care CMS

## 🚀 Quick Access

Visit `/test-login` in your browser to access the test user selection page.

## Test User Credentials

All test users have been created with role-specific access. Here are the 15 test accounts:

### Executive Roles

| Role | Name | Email | Features |
|------|------|-------|----------|
| **Super Admin** | Sarah Admin | admin@primacycare.test | Full system access, all configurations |
| **CEO** | Michael Thompson | ceo@primacycare.test | Executive dashboard, strategic oversight |
| **General Manager** | Jennifer Williams | gm@primacycare.test | Operational management, departmental oversight |

### Intake Department

| Role | Name | Email | Features |
|------|------|-------|----------|
| **Intake Coordinator** | David Chen | intake.coord@primacycare.test | Participant intake, initial assessments |
| **Intake Manager** | Lisa Martinez | intake.mgr@primacycare.test | Intake department management, referral oversight |

### Finance Department

| Role | Name | Email | Features |
|------|------|-------|----------|
| **Finance Officer - Billing** | Robert Johnson | billing@primacycare.test | Invoice generation, payment tracking |
| **Finance Officer - Payroll** | Emma Davis | payroll@primacycare.test | Payroll processing, SCHADS calculations |
| **Finance Manager** | James Anderson | finance.mgr@primacycare.test | Financial reporting, budget oversight |

### HR & Recruitment

| Role | Name | Email | Features |
|------|------|-------|----------|
| **HR Manager** | Patricia Brown | hr.mgr@primacycare.test | Staff management, performance reviews |
| **HR Recruiter** | Andrew Taylor | recruiter@primacycare.test | Job postings, candidate management |

### Service Delivery

| Role | Name | Email | Features |
|------|------|-------|----------|
| **Service Delivery Manager** | Maria Garcia | service.mgr@primacycare.test | Service oversight, quality assurance |
| **Service Delivery - Allocation** | Kevin Lee | allocation@primacycare.test | Staff scheduling, shift allocation |
| **Service Delivery Coordinator** | Sophie Wilson | coordinator@primacycare.test | Service coordination, participant support |
| **Support Worker** | Emily Jackson | support@primacycare.test | Direct service delivery, progress notes |

### Compliance & Quality

| Role | Name | Email | Features |
|------|------|-------|----------|
| **Quality Manager** | Daniel Moore | quality@primacycare.test | Compliance monitoring, incident management |

## How to Test Different Roles

### Method 1: Test Login Page
1. Navigate to `/test-login` in your browser
2. Select the role you want to test
3. Click "Login as Test User"
4. You'll be redirected to the role-specific dashboard

### Method 2: Quick Switch (Development Only)
A "Test Users" dropdown will appear in the header when in development mode, allowing quick switching between roles.

## Testing Scenarios by Role

### Super Admin Testing
- Access all system settings
- View all departments
- Manage user roles and permissions
- Access all reports and analytics
- Configure system-wide settings

### CEO Testing
- View executive dashboard
- Access strategic reports
- Monitor KPIs across all departments
- View financial summaries

### Intake Coordinator Testing
- Add new participants
- Process referrals
- Complete initial assessments
- Create service agreements

### Finance Officer - Billing Testing
- Generate invoices
- Process NDIS claims
- Track payments
- Manage billing disputes

### HR Manager Testing
- View staff directory
- Manage leave requests
- Process performance reviews
- Access training records

### Support Worker Testing
- View assigned participants
- Create progress notes
- Track service delivery
- Update goal progress

## Features Available by Department

### Intake Department
- Referral management
- Participant onboarding
- Initial assessments
- Waitlist management

### Finance Department
- Invoice generation
- Payment tracking
- SCHADS award calculations
- Budget monitoring
- Financial reporting

### HR & Recruitment
- Staff management
- Recruitment pipeline
- Training coordination
- Performance management
- Leave management

### Service Delivery
- Service scheduling
- Staff allocation
- Progress tracking
- Quality monitoring
- Incident reporting

### Compliance & Quality
- Audit management
- Incident tracking
- Practice standards
- Risk assessments
- Compliance reporting

## Common Test Workflows

### 1. Complete Participant Journey
1. Login as **Intake Coordinator**
2. Add new participant
3. Switch to **Service Delivery Manager**
4. Schedule services
5. Switch to **Support Worker**
6. Complete service and add progress notes
7. Switch to **Finance Officer - Billing**
8. Generate invoice

### 2. Staff Management Flow
1. Login as **HR Recruiter**
2. Create job posting
3. Process applications
4. Switch to **HR Manager**
5. Complete onboarding
6. Assign to department

### 3. Financial Workflow
1. Login as **Support Worker**
2. Complete shifts
3. Switch to **Finance Officer - Payroll**
4. Process payroll with SCHADS
5. Switch to **Finance Manager**
6. Review financial reports

## Notes

- All test users are pre-configured with appropriate permissions
- Test data includes sample participants and services
- Changes made by test users persist in the development database
- To reset test data, run: `npx tsx server/seedTestUsers.ts`

## Troubleshooting

If you can't access a test user:
1. Ensure you're in development mode
2. Check that test users are seeded: `npx tsx server/seedTestUsers.ts`
3. Clear browser cache and cookies
4. Restart the development server

---
*Last Updated: January 2025*