# Primacy Care Australia CMS

## Overview
Primacy Care Australia CMS is a comprehensive case management system for NDIS (National Disability Insurance Scheme) service providers. It manages the entire lifecycle of NDIS participants, including profiles, plan management, service scheduling, progress tracking, financial management, and compliance reporting. The system features an NDIS Plan Reader for extracting participant goals, a 9-stage workflow management system for referrals, and an automation engine for intelligent scheduling, invoicing, payroll, and compliance. It also includes advanced quick search functionality and operations-level efficiency optimization with performance dashboards and AI-powered recommendations.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application uses React with TypeScript, Radix UI primitives with shadcn/ui for components, Tailwind CSS for styling, TanStack Query for state management, Wouter for routing, React Hook Form with Zod for forms, and Vite for building. It follows a component-based architecture with clear separation of concerns.

### Backend Architecture
The server-side uses Express.js with TypeScript, Drizzle ORM for database access, Replit Auth for authentication, and PostgreSQL for session management. It implements a layered architecture separating routes, business logic, and database access.

### Database Design
A PostgreSQL database with Drizzle ORM defines type-safe schemas for user management, NDIS-specific entities (participants, plans, services, financial records), and relational structures ensuring data integrity. Key additions support the NDIS Plan Reader, storing participant goals and detailed action items with proper relationships.

### File Upload and Storage
Google Cloud Storage is integrated for secure file handling, using Uppy.js for uploads, supporting various document types, and ensuring authenticated access. This includes automated parsing and goal extraction from NDIS plan documents.

### NDIS Plan Reader System
This system automates goal extraction from uploaded NDIS plans, enabling comprehensive goal tracking with action planning, staff workflow assignments, and integration with the NDIS price guide for cost estimation.

### Comprehensive Workflow Management System
An advanced 9-stage workflow engine manages the referral-to-service lifecycle, from "Referral Received" to "Service Commenced." It includes a visual tracker, a dedicated WorkflowService class for operations, specific database tables (e.g., serviceAgreementTemplates, fundingBudgets), and automated features like OCR document extraction, e-signature integration, and intelligent staff matching.

### Comprehensive Automation System
An advanced automation engine optimizes operations through intelligent staff matching, automated service scheduling, automated invoice generation, SCHADS payroll automation, real-time budget monitoring with alerts, goal progress automation, and automated compliance reporting. It also provides performance analytics and manages scheduled background tasks.

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL
- **Authentication**: Replit Auth
- **File Storage**: Google Cloud Storage
- **Hosting**: Replit platform

### Development and Build Tools
- **Frontend Build**: Vite with React plugin
- **Database Management**: Drizzle Kit
- **Language**: TypeScript
- **Package Management**: npm

### UI and Styling
- **Component Library**: Radix UI
- **UI Framework**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome

### Development Libraries
- **Form Management**: React Hook Form with Hookform Resolvers
- **Validation**: Zod
- **State Management**: TanStack Query
- **Routing**: Wouter
- **File Uploads**: Uppy