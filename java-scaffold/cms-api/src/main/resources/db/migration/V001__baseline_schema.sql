-- Flyway baseline migration generated from current PostgreSQL schema
-- Matches existing Drizzle ORM schema from shared/schema.ts
-- V001__baseline_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Replit Auth integration)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(100) DEFAULT 'participant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- States table
CREATE TABLE IF NOT EXISTS states (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    state_id UUID REFERENCES states(id),
    name VARCHAR(255) NOT NULL
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    preferred_name VARCHAR(100),
    ndis_number VARCHAR(20) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    pronouns VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    emergency_contact TEXT,
    emergency_phone VARCHAR(20),
    cultural_background VARCHAR(255),
    languages_spoken VARCHAR(255),
    communication_needs TEXT,
    mobility_needs TEXT,
    medical_conditions TEXT,
    medications TEXT,
    allergies TEXT,
    gp_name VARCHAR(255),
    gp_contact VARCHAR(255),
    specialist_contacts TEXT,
    guardian_name VARCHAR(255),
    guardian_relationship VARCHAR(100),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(255),
    plan_manager VARCHAR(255),
    plan_manager_email VARCHAR(255),
    plan_manager_phone VARCHAR(20),
    support_coordinator VARCHAR(255),
    support_coordinator_email VARCHAR(255),
    support_coordinator_phone VARCHAR(20),
    goals TEXT,
    interests TEXT,
    preferred_activities TEXT,
    funding_type VARCHAR(50),
    transport_method VARCHAR(100),
    dietary_requirements TEXT,
    behaviour_support_plan TEXT,
    risk_assessment TEXT,
    incident_notes TEXT,
    consent_photos BOOLEAN DEFAULT false,
    consent_data_sharing BOOLEAN DEFAULT false,
    profile_photo VARCHAR(500),
    documents TEXT,
    notes TEXT,
    created_by VARCHAR(255),
    state_id UUID REFERENCES states(id),
    region_id UUID REFERENCES regions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(100),
    department VARCHAR(50),
    employment_type VARCHAR(50),
    start_date DATE,
    qualifications TEXT,
    certifications TEXT,
    emergency_contact TEXT,
    emergency_phone VARCHAR(20),
    state_id UUID REFERENCES states(id),
    region_id UUID REFERENCES regions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NDIS Plans table
CREATE TABLE IF NOT EXISTS ndis_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id),
    plan_number VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget DECIMAL(15, 2),
    core_budget DECIMAL(15, 2),
    capacity_building_budget DECIMAL(15, 2),
    capital_budget DECIMAL(15, 2),
    plan_management_type VARCHAR(50),
    goals TEXT,
    funding_breakdown TEXT,
    plan_document VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id),
    service_type VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    subcategory VARCHAR(50),
    item_number VARCHAR(20),
    scheduled_date DATE,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    location VARCHAR(255),
    assigned_to UUID REFERENCES staff(id),
    rate_type VARCHAR(50),
    rate DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    transport_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participant Goals table
CREATE TABLE IF NOT EXISTS participant_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id),
    plan_id UUID REFERENCES ndis_plans(id),
    goal_area VARCHAR(100),
    goal_title VARCHAR(255) NOT NULL,
    goal_description TEXT,
    priority VARCHAR(20),
    target_date DATE,
    progress INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Not Started',
    assigned_staff_id UUID REFERENCES staff(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goal Actions table
CREATE TABLE IF NOT EXISTS goal_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES participant_goals(id),
    action_description TEXT NOT NULL,
    frequency VARCHAR(50),
    due_date DATE,
    completed_date DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    assigned_staff_id UUID REFERENCES staff(id),
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_id UUID REFERENCES participants(id),
    assigned_staff_id UUID REFERENCES staff(id),
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER DEFAULT 0,
    actual_start_time TIME,
    actual_end_time TIME,
    status VARCHAR(50) DEFAULT 'Scheduled',
    clock_in_lat DECIMAL(10, 8),
    clock_in_lng DECIMAL(11, 8),
    clock_out_lat DECIMAL(10, 8),
    clock_out_lng DECIMAL(11, 8),
    case_notes TEXT,
    incident_report TEXT,
    rate_type VARCHAR(50),
    base_rate DECIMAL(10, 2),
    penalty_rate DECIMAL(10, 2),
    total_hours DECIMAL(5, 2),
    total_pay DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id),
    plan_id UUID REFERENCES ndis_plans(id),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(15, 2),
    gst DECIMAL(15, 2),
    total DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    paid_date DATE,
    payment_method VARCHAR(50),
    xero_invoice_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress Notes table
CREATE TABLE IF NOT EXISTS progress_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id),
    service_id UUID REFERENCES services(id),
    shift_id UUID REFERENCES shifts(id),
    staff_id UUID NOT NULL REFERENCES staff(id),
    note_date DATE NOT NULL,
    note_type VARCHAR(50),
    content TEXT NOT NULL,
    goals_addressed TEXT,
    outcomes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    attachments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_id UUID REFERENCES participants(id),
    staff_id UUID REFERENCES staff(id),
    incident_date DATE NOT NULL,
    incident_time TIME,
    location VARCHAR(255),
    incident_type VARCHAR(100),
    severity VARCHAR(20),
    description TEXT NOT NULL,
    immediate_action TEXT,
    witnesses TEXT,
    injuries TEXT,
    property_damage TEXT,
    notifications_made TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_actions TEXT,
    preventive_measures TEXT,
    reported_to_ndis BOOLEAN DEFAULT false,
    ndis_report_date DATE,
    attachments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referral_date DATE NOT NULL,
    referral_source VARCHAR(255),
    referrer_name VARCHAR(255),
    referrer_email VARCHAR(255),
    referrer_phone VARCHAR(20),
    participant_name VARCHAR(255) NOT NULL,
    participant_dob DATE,
    participant_ndis VARCHAR(20),
    participant_phone VARCHAR(20),
    participant_email VARCHAR(255),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(255),
    support_requirements TEXT,
    urgency VARCHAR(20),
    status VARCHAR(50) DEFAULT 'New',
    assigned_to UUID REFERENCES staff(id),
    notes TEXT,
    outcome VARCHAR(100),
    outcome_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audits table
CREATE TABLE IF NOT EXISTS audits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Communications table
CREATE TABLE IF NOT EXISTS communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_id UUID REFERENCES participants(id),
    staff_id UUID REFERENCES staff(id),
    communication_type VARCHAR(50),
    direction VARCHAR(20),
    subject VARCHAR(255),
    content TEXT,
    attachments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_id UUID REFERENCES participants(id),
    alert_type VARCHAR(50),
    priority VARCHAR(20),
    message TEXT NOT NULL,
    action_required TEXT,
    due_date DATE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Agreements table
CREATE TABLE IF NOT EXISTS service_agreements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id),
    agreement_number VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    services TEXT,
    terms TEXT,
    signed_date DATE,
    signed_by VARCHAR(255),
    document_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Availability table
CREATE TABLE IF NOT EXISTS staff_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_id UUID NOT NULL REFERENCES staff(id),
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes matching server/migrations/addPerformanceIndexes.ts
CREATE INDEX idx_participants_ndis ON participants(ndis_number);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_participants_created ON participants(created_at);

CREATE INDEX idx_services_date ON services(scheduled_date);
CREATE INDEX idx_services_participant ON services(participant_id);
CREATE INDEX idx_services_assigned ON services(assigned_to);
CREATE INDEX idx_services_composite ON services(participant_id, scheduled_date);

CREATE INDEX idx_shifts_date ON shifts(shift_date);
CREATE INDEX idx_shifts_staff ON shifts(assigned_staff_id);
CREATE INDEX idx_shifts_participant ON shifts(participant_id);

CREATE INDEX idx_invoices_participant ON invoices(participant_id);
CREATE INDEX idx_invoices_date ON invoices(issue_date);
CREATE INDEX idx_invoices_plan ON invoices(plan_id);

CREATE INDEX idx_staff_user ON staff(user_id);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_employment ON staff(employment_type);

CREATE INDEX idx_goals_participant ON participant_goals(participant_id);
CREATE INDEX idx_goals_plan ON participant_goals(plan_id);
CREATE INDEX idx_goals_staff ON participant_goals(assigned_staff_id);

CREATE INDEX idx_audits_entity ON audits(entity_type, entity_id);
CREATE INDEX idx_audits_user ON audits(user_id);