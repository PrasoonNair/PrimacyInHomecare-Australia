# NDIS Manager

## Overview

NDIS Manager is a comprehensive case management system specifically designed for NDIS (National Disability Insurance Scheme) service providers. The application facilitates complete lifecycle management of NDIS participants, including participant profiles, plan management, service scheduling, progress tracking, financial management, and compliance reporting. Built as a full-stack web application, it provides an intuitive interface for case managers and support staff to efficiently deliver NDIS services while maintaining compliance with regulatory requirements.

The system now includes an advanced NDIS Plan Reader that can automatically extract participant goals from uploaded plans and provide detailed breakdowns for staff and support workers to manage their workflow efficiently.

The system also features a comprehensive automation engine that optimizes operations through intelligent scheduling, automated invoicing, SCHADS payroll calculations, budget monitoring, and compliance reporting - delivering significant efficiency improvements and cost savings.

The application now includes advanced quick search functionality with global search across all participants, staff, plans, services, and system features, accessible via keyboard shortcut (Ctrl/Cmd + K) or the search button in the header.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, leveraging modern development patterns:

- **Component Library**: Utilizes Radix UI primitives with shadcn/ui for consistent, accessible UI components
- **Styling**: Tailwind CSS with custom NDIS-specific color palette and design tokens
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a component-based architecture with clear separation between layout components, form components, and page-specific components. Each major feature area (participants, plans, services, etc.) has dedicated pages with corresponding form components for data entry.

### Backend Architecture
The server-side application follows a REST API pattern built on Express.js:

- **Framework**: Express.js with TypeScript for type safety
- **Database Access**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication
- **Session Management**: PostgreSQL-backed session storage for scalable session handling
- **API Design**: RESTful endpoints organized by resource type with consistent error handling

The backend implements a layered architecture with clear separation between routes, business logic (storage layer), and database access. The storage interface provides abstraction for all database operations, making the system maintainable and testable.

### Database Design
PostgreSQL database with Drizzle ORM providing type-safe schema definitions:

- **User Management**: Integrated with Replit Auth for user profiles and role-based access
- **NDIS-Specific Entities**: Participants, NDIS plans, services, progress notes, and financial records
- **Relational Structure**: Proper foreign key relationships ensuring data integrity
- **Audit Trail**: Timestamp tracking on all entities for compliance requirements
- **Enums**: Type-safe enumerations for plan status, service categories, and other constrained values

The schema supports the full NDIS service delivery lifecycle with fields specific to disability services, including communication needs, cultural background, and NDIS plan categories.

Key additions include the NDIS Plan Reader tables:
- **participantGoals**: Stores participant goals extracted from NDIS plans with progress tracking, priority levels, and staff assignments
- **goalActions**: Detailed action items for each goal with frequency, cost estimation, due dates, and completion tracking
- **Relations**: Proper foreign key relationships linking goals to participants, plans, and staff members for comprehensive workflow management

### File Upload and Storage
Google Cloud Storage integration for secure file handling:

- **Provider**: Google Cloud Storage for scalable file storage
- **Upload Interface**: Uppy.js for modern, user-friendly file upload experience
- **File Types**: Support for documents, images, progress note attachments, and NDIS plan documents
- **Security**: Authenticated access to uploaded files with proper access controls
- **NDIS Plan Processing**: Automated parsing and goal extraction from uploaded NDIS plan documents

### NDIS Plan Reader System
Advanced plan processing and goal management capabilities:

- **Automated Goal Extraction**: Parse uploaded NDIS plans to automatically extract participant goals and objectives
- **Goal Management**: Comprehensive goal tracking with priority levels, target dates, and progress monitoring
- **Action Planning**: Detailed action items for each goal with frequency, cost tracking, and completion status
- **Staff Workflow**: Assignment of goals and actions to specific staff members with progress tracking
- **Integration**: Seamless integration with existing NDIS price guide for cost estimation and budget management

### Comprehensive Automation System
Advanced automation engine delivering operational efficiency:

- **Intelligent Staff Matching**: AI-powered algorithm matching staff to participants based on qualifications, availability, location, and preferences
- **Automated Service Scheduling**: Smart scheduling based on goal requirements, staff availability, and participant needs
- **Automated Invoice Generation**: Monthly invoice creation from completed services with NDIS pricing integration
- **SCHADS Payroll Automation**: Automated calculation of staff payroll including penalty rates, allowances, and compliance
- **Budget Monitoring & Alerts**: Real-time budget tracking with automated threshold alerts and notifications
- **Goal Progress Automation**: Automatic progress tracking and completion status updates based on service delivery
- **Compliance Reporting**: Automated generation of monthly compliance reports and audit scheduling
- **Performance Analytics**: Real-time efficiency metrics and optimization recommendations
- **Scheduled Task Management**: Background automation processes for invoicing, payroll, monitoring, and optimization
- **System Optimization**: Automated database maintenance, performance monitoring, and efficiency improvements

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL for managed database hosting
- **Authentication**: Replit Auth service for user authentication and session management
- **File Storage**: Google Cloud Storage for document and image storage
- **Hosting**: Replit platform for application deployment and hosting

### Development and Build Tools
- **Frontend Build**: Vite with React plugin for fast development and optimized builds
- **Database Management**: Drizzle Kit for schema migrations and database management
- **TypeScript**: Full TypeScript support across frontend and backend for type safety
- **Package Management**: npm for dependency management

### UI and Styling
- **Component Library**: Radix UI for accessible, unstyled components
- **UI Framework**: shadcn/ui for pre-built component implementations
- **Styling**: Tailwind CSS for utility-first styling approach
- **Icons**: Font Awesome for consistent iconography

### Development Libraries
- **Form Management**: React Hook Form with Hookform Resolvers for form handling
- **Validation**: Zod for runtime type validation and schema definition
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **File Uploads**: Uppy with AWS S3 support for file upload functionality