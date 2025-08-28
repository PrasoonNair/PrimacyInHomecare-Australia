# Primacy Care Australia CMS - Developer Briefing Document

**Version:** 2.0  
**Last Updated:** January 29, 2025  
**System Status:** Production Ready  
**Tech Stack:** React, TypeScript, Node.js, PostgreSQL, Drizzle ORM

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Technical Architecture](#technical-architecture)
3. [Core Functionalities](#core-functionalities)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Authentication & Security](#authentication--security)
7. [Third-Party Integrations](#third-party-integrations)
8. [Development Setup](#development-setup)
9. [Testing Guidelines](#testing-guidelines)
10. [Deployment Process](#deployment-process)
11. [Environment Variables](#environment-variables)
12. [Code Standards](#code-standards)

---

## 🎯 SYSTEM OVERVIEW

**Purpose:** Comprehensive NDIS case management system for disability service providers in Australia

**Key Capabilities:**
- Complete participant lifecycle management
- NDIS plan processing with AI-powered goal extraction
- Smart staff allocation with geo-matching
- SCHADS Award-compliant payroll processing
- Real-time compliance monitoring
- Mobile workforce management
- Automated billing and invoicing

**Users:** 1,000+ staff, 5,000+ participants, 15 role types

---

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend Stack
```javascript
{
  "framework": "React 18.2",
  "language": "TypeScript 5.0",
  "styling": "Tailwind CSS 3.4",
  "ui_components": "Radix UI + shadcn/ui",
  "state_management": "TanStack Query v5",
  "routing": "Wouter 3.0",
  "build_tool": "Vite 5.0",
  "forms": "React Hook Form + Zod"
}
```

### Backend Stack
```javascript
{
  "runtime": "Node.js 20",
  "framework": "Express.js 4.18",
  "language": "TypeScript 5.0",
  "database": "PostgreSQL 15 (Neon)",
  "orm": "Drizzle ORM",
  "authentication": "Replit Auth + OpenID Connect",
  "sessions": "Express Session + PostgreSQL Store",
  "file_storage": "Google Cloud Storage"
}
```

### Infrastructure
```javascript
{
  "hosting": "Replit",
  "database_host": "Neon",
  "file_storage": "Google Cloud Storage",
  "monitoring": "Built-in logging",
  "deployment": "Replit Deployments",
  "domain": "*.replit.app"
}
```

---

## 💼 CORE FUNCTIONALITIES

### 1. PARTICIPANT MANAGEMENT
```typescript
Features:
- Complete participant profiles with NDIS details
- Communication preferences and cultural needs
- Emergency contacts and medical information
- Document management
- Progress tracking

Key Files:
- /client/src/pages/participants.tsx
- /client/src/components/forms/participant-form.tsx
- /server/storage.ts (participant CRUD operations)

Database Tables:
- participants
- emergency_contacts
- participant_documents
```

### 2. NDIS PLAN MANAGEMENT
```typescript
Features:
- Plan upload and OCR processing
- AI-powered goal extraction (Claude 4)
- Budget tracking and utilization
- Category management
- Plan review scheduling

Key Files:
- /client/src/pages/plans.tsx
- /server/ndisPlanProcessor.ts
- /shared/schema.ts (ndisPlans, participantGoals)

API Endpoints:
- POST /api/plans/upload
- GET /api/plans/:id
- POST /api/plans/:id/process
```

### 3. SERVICE DELIVERY MODULE
```typescript
Features:
- Smart staff allocation (20-30km radius)
- Shift lifecycle management
- Geo-fenced clock-in/out
- Fortnightly unavailability
- Automated timesheet generation
- NDIS billing line creation

Key Files:
- /server/serviceDeliveryService.ts
- /client/src/pages/service-delivery-dashboard.tsx

Database Tables:
- shifts
- shiftOffers
- staffUnavailability
- shiftAttendance
- staffAllocationScores
- billingLines
```

### 4. FINANCE MODULE
```typescript
Features:
- Automated invoice generation
- SCHADS Award payroll processing
- ABA file generation
- Payment reconciliation
- Budget monitoring
- Financial reporting

Key Files:
- /server/financeService.ts
- /client/src/pages/finance-dashboard.tsx

Database Tables:
- invoices
- invoiceItems
- payRuns
- paySlips
- schacsAwardRates
```

### 5. HR & RECRUITMENT
```typescript
Features:
- Job posting management
- Application tracking
- Interview scheduling
- Onboarding workflows
- Training management
- Performance tracking

Key Files:
- /server/recruitmentService.ts
- /client/src/pages/hr-recruitment.tsx

Database Tables:
- jobPostings
- jobApplications
- interviewSchedules
- staffOnboarding
- trainingRecords
```

### 6. COMPLIANCE & QUALITY
```typescript
Features:
- Incident reporting
- Audit logging
- Quality metrics
- Compliance tracking
- Document management
- Certification monitoring

Key Files:
- /server/auditLogger.ts
- /client/src/pages/compliance-quality.tsx

Database Tables:
- incidents
- auditLog
- qualityMetrics
- complianceChecks
```

### 7. WORKFLOW AUTOMATION
```typescript
Features:
- 9-stage referral workflow
- Automated staff matching
- Document generation
- Scheduled tasks
- Email/SMS notifications
- Performance optimization

Key Files:
- /server/workflowService.ts
- /server/automation.ts
- /server/scheduledTasks.ts

Key Processes:
- Referral intake → Service delivery
- Invoice generation
- Payroll processing
- Compliance monitoring
```

### 8. DASHBOARD & ANALYTICS
```typescript
Features:
- Role-based KPI dashboards
- Real-time metrics
- Predictive analytics
- Custom reporting
- Data visualization

Key Files:
- /client/src/pages/dashboard.tsx
- /server/kpiService.ts
- /shared/kpiData.ts

Metrics Tracked:
- Service utilization
- Financial performance
- Staff productivity
- Quality indicators
```

---

## 🔌 API ENDPOINTS

### Authentication
```http
GET    /api/auth/user          # Get current user
GET    /api/auth/login          # Initiate login
POST   /api/auth/logout         # Logout user
```

### Participants
```http
GET    /api/participants        # List all participants
GET    /api/participants/:id    # Get participant details
POST   /api/participants        # Create participant
PUT    /api/participants/:id    # Update participant
DELETE /api/participants/:id    # Delete participant
```

### NDIS Plans
```http
GET    /api/plans               # List all plans
GET    /api/plans/:id           # Get plan details
POST   /api/plans               # Create plan
POST   /api/plans/upload        # Upload plan document
POST   /api/plans/:id/process   # Process with AI
```

### Services
```http
GET    /api/services            # List services
POST   /api/services            # Create service
GET    /api/services/:id        # Get service
PUT    /api/services/:id        # Update service
POST   /api/services/:id/complete # Mark complete
```

### Staff Management
```http
GET    /api/staff               # List all staff
GET    /api/staff/:id           # Get staff details
POST   /api/staff               # Create staff
PUT    /api/staff/:id           # Update staff
GET    /api/staff/availability  # Get availability
```

### Service Delivery
```http
GET    /api/service-delivery/dashboard         # Dashboard data
POST   /api/service-delivery/shifts/:id/allocate # Auto-allocate
POST   /api/service-delivery/clock-in          # Clock in
POST   /api/service-delivery/clock-out         # Clock out
POST   /api/service-delivery/unavailability    # Submit unavailability
```

### Finance
```http
POST   /api/finance/invoices/generate   # Generate invoices
GET    /api/finance/invoices/pending    # Pending invoices
GET    /api/finance/stats              # Financial stats
POST   /api/finance/payrun/process     # Process payroll
POST   /api/finance/reconcile          # Reconcile payments
```

### Workflow
```http
GET    /api/workflow/:id        # Get workflow status
POST   /api/workflow/advance    # Advance stage
GET    /api/workflow/pending    # Pending actions
POST   /api/workflow/document   # Upload document
```

---

## 💾 DATABASE SCHEMA

### Core Tables (Total: 76 tables)

#### User Management
- users (Replit Auth integrated)
- userProfiles
- userRoles
- rolePermissions

#### Participant Management
- participants
- emergencyContacts
- participantDocuments
- participantPreferences

#### NDIS Specific
- ndisPlans
- participantGoals
- goalActions
- ndisPriceGuide
- ndisSupportCategories
- ndisSupportItems

#### Service Delivery
- services
- shifts
- shiftOffers
- shiftAttendance
- staffAllocationScores
- billingLines

#### Staff Management
- staff
- staffQualifications
- staffAvailability
- staffUnavailability
- staffDocuments

#### Finance
- invoices
- invoiceItems
- payRuns
- paySlips
- schacsAwardRates
- bankTransactions

#### Compliance
- incidents
- auditLog
- qualityMetrics
- complianceChecks
- restrictivePractices

#### Workflow
- referrals
- serviceAgreements
- serviceAgreementTemplates
- meetGreets
- fundingBudgets

#### Geographic
- australianStates
- australianRegions
- departmentRegions

---

## 🔐 AUTHENTICATION & SECURITY

### Authentication Flow
```javascript
// Replit Auth with OpenID Connect
const authConfig = {
  provider: "Replit Auth",
  session: "PostgreSQL backed",
  timeout: "24 hours",
  roles: [
    "admin", "manager", "coordinator", 
    "support_worker", "participant", "family"
  ]
};
```

### Security Features
- Role-based access control (RBAC)
- Session management
- CSRF protection
- SQL injection prevention (parameterized queries)
- XSS protection
- Rate limiting
- Audit logging

### API Security
```typescript
// Middleware stack
app.use(helmet());           // Security headers
app.use(cors());             // CORS configuration
app.use(rateLimiter);        // Rate limiting
app.use(isAuthenticated);    // Auth check
app.use(checkPermissions);   // Role check
```

---

## 🔗 THIRD-PARTY INTEGRATIONS

### Current Integrations
```javascript
{
  "ai": "Anthropic Claude 4 (Goal extraction)",
  "storage": "Google Cloud Storage",
  "auth": "Replit Auth",
  "database": "Neon PostgreSQL"
}
```

### Prepared Integrations
```javascript
{
  "xero": "Invoice sync ready",
  "sendgrid": "Email service configured",
  "twilio": "SMS capability",
  "stripe": "Payment processing",
  "docusign": "Digital signatures",
  "ndis_api": "Bulk upload ready"
}
```

---

## 🛠️ DEVELOPMENT SETUP

### Prerequisites
```bash
- Node.js 20+
- PostgreSQL 15+
- npm or yarn
- Git
```

### Local Setup
```bash
# 1. Clone repository
git clone [repository-url]
cd primacy-care-cms

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Initialize database
npm run db:push
npm run db:seed

# 5. Start development server
npm run dev
```

### Environment Variables Required
```env
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-...
SENDGRID_API_KEY=SG...
GOOGLE_CLOUD_STORAGE_BUCKET=...
REPLIT_DB_URL=...
NODE_ENV=development
```

---

## 🧪 TESTING GUIDELINES

### Test Structure
```javascript
/tests
  /unit         # Unit tests
  /integration  # API tests
  /e2e         # End-to-end tests
  /fixtures    # Test data
```

### Running Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test
```

### Test Coverage Requirements
- Minimum 80% code coverage
- All API endpoints tested
- Critical workflows E2E tested
- Accessibility testing (WCAG 2.1)

---

## 🚀 DEPLOYMENT PROCESS

### Production Deployment
```bash
# 1. Pre-deployment checks
npm run lint
npm run test
npm run build

# 2. Database migrations
npm run db:migrate

# 3. Deploy via Replit
# Click "Deploy" button in Replit interface

# 4. Post-deployment
# Verify health checks
# Run smoke tests
# Monitor logs
```

### Deployment Checklist
- [ ] All tests passing
- [ ] Database migrations complete
- [ ] Environment variables set
- [ ] SSL certificates valid
- [ ] Monitoring configured
- [ ] Backup verified
- [ ] Rollback plan ready

---

## 📝 CODE STANDARDS

### TypeScript Guidelines
```typescript
// Use strict types
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Avoid any
❌ const data: any = {};
✅ const data: Record<string, unknown> = {};

// Use enums for constants
enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
```

### React Best Practices
```typescript
// Use functional components
const Component: FC<Props> = ({ prop }) => {
  return <div>{prop}</div>;
};

// Custom hooks for logic
const useCustomHook = () => {
  // Logic here
  return { data, loading };
};
```

### API Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2025-01-29T10:00:00Z"
}
```

### Error Handling
```typescript
try {
  // Operation
} catch (error) {
  console.error('Context:', error);
  res.status(500).json({
    success: false,
    error: 'User-friendly message',
    code: 'ERROR_CODE'
  });
}
```

---

## 📊 PERFORMANCE METRICS

### Target Metrics
- API Response: <200ms (p95)
- Page Load: <2s
- Database Query: <100ms
- Uptime: 99.9%
- Error Rate: <0.1%

### Monitoring
- Real-time dashboard
- Error tracking
- Performance monitoring
- User analytics
- Audit logs

---

## 🔄 VERSION HISTORY

### v2.0 (Current)
- Finance module implementation
- Service delivery automation
- AI-powered plan processing
- Mobile app support

### v1.5
- Workflow automation
- Compliance tracking
- Geographic management

### v1.0
- Initial release
- Core CRUD operations
- Basic authentication

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- API Documentation: `/docs/api`
- User Guide: `/docs/user-guide`
- Admin Manual: `/docs/admin`

### Support
- Technical Support: tech@primacycare.com.au
- Business Support: support@primacycare.com.au
- Emergency: 1800-XXX-XXX

### Training Materials
- Developer onboarding videos
- Code walkthrough sessions
- Architecture deep dives
- Best practices guide

---

## 🚨 KNOWN ISSUES & LIMITATIONS

### Current Limitations
1. Mobile app in beta (iOS/Android native pending)
2. Offline mode partial implementation
3. Real-time sync limited to critical operations

### Planned Improvements
- Native mobile apps (Q2 2025)
- Advanced AI predictions (Q3 2025)
- Blockchain audit trail (Q4 2025)
- Voice interface (2026)

---

## 🤝 CONTRIBUTION GUIDELINES

### Code Review Process
1. Create feature branch
2. Implement changes
3. Write tests
4. Submit PR
5. Two approvals required
6. Merge to main

### Commit Convention
```
feat: Add new feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code restructuring
test: Add tests
chore: Maintenance
```

---

## 📋 QUICK REFERENCE

### Common Commands
```bash
npm run dev              # Start development
npm run build           # Production build
npm run db:push         # Update database
npm run db:seed         # Seed test data
npm run lint            # Run linter
npm run format          # Format code
```

### File Structure
```
/
├── client/             # Frontend React app
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/     # Route pages
│   │   ├── hooks/     # Custom hooks
│   │   └── lib/       # Utilities
├── server/            # Backend Node.js
│   ├── routes.ts      # API routes
│   ├── storage.ts     # Database operations
│   └── services/      # Business logic
├── shared/            # Shared types/schemas
└── docs/              # Documentation
```

---

## ✅ PRODUCTION READINESS CHECKLIST

### Security
- [x] Authentication implemented
- [x] Authorization enforced
- [x] Data encryption
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection

### Performance
- [x] Database indexed
- [x] Query optimization
- [x] Caching strategy
- [x] Load testing completed
- [x] CDN configured

### Compliance
- [x] NDIS requirements met
- [x] Privacy Act compliance
- [x] WCAG 2.1 accessibility
- [x] Data retention policies
- [x] Audit logging

### Operations
- [x] Monitoring setup
- [x] Backup strategy
- [x] Disaster recovery
- [x] Documentation complete
- [x] Training materials

---

**END OF DOCUMENT**

*This briefing document is version controlled and updated with each major release.*  
*For questions, contact the development team.*  
*Last review: January 29, 2025*