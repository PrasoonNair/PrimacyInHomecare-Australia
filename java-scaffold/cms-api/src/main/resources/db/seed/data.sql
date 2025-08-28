-- Data seeding script for development and testing
-- Mirrors test data from Node.js application

-- States (Australian states and territories)
INSERT INTO states (id, code, name) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'NSW', 'New South Wales'),
    ('550e8400-e29b-41d4-a716-446655440002', 'VIC', 'Victoria'),
    ('550e8400-e29b-41d4-a716-446655440003', 'QLD', 'Queensland'),
    ('550e8400-e29b-41d4-a716-446655440004', 'WA', 'Western Australia'),
    ('550e8400-e29b-41d4-a716-446655440005', 'SA', 'South Australia'),
    ('550e8400-e29b-41d4-a716-446655440006', 'TAS', 'Tasmania'),
    ('550e8400-e29b-41d4-a716-446655440007', 'ACT', 'Australian Capital Territory'),
    ('550e8400-e29b-41d4-a716-446655440008', 'NT', 'Northern Territory');

-- Regions (Sample regions for NSW)
INSERT INTO regions (id, state_id, name) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Sydney Metro'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Western Sydney'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'North Sydney'),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'South Sydney'),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Central Coast'),
    ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Newcastle'),
    ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'Illawarra');

-- Test Users
INSERT INTO users (id, email, name, role) VALUES
    ('admin-001', 'admin@primacycare.com.au', 'System Admin', 'admin'),
    ('cm-001', 'john.manager@primacycare.com.au', 'John Manager', 'case_manager'),
    ('sc-001', 'sarah.coordinator@primacycare.com.au', 'Sarah Coordinator', 'support_coordinator'),
    ('sw-001', 'mike.worker@primacycare.com.au', 'Mike Worker', 'support_worker'),
    ('sw-002', 'emma.worker@primacycare.com.au', 'Emma Worker', 'support_worker'),
    ('fm-001', 'david.finance@primacycare.com.au', 'David Finance', 'finance_manager'),
    ('hr-001', 'lisa.hr@primacycare.com.au', 'Lisa HR', 'hr_manager'),
    ('part-001', 'james.participant@example.com', 'James Brown', 'participant'),
    ('part-002', 'mary.participant@example.com', 'Mary Johnson', 'participant'),
    ('part-003', 'robert.participant@example.com', 'Robert Williams', 'participant');

-- Staff Members
INSERT INTO staff (id, user_id, first_name, last_name, email, phone, position, department, employment_type, start_date, state_id, region_id) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', 'sw-001', 'Mike', 'Worker', 'mike.worker@primacycare.com.au', '0412345678', 
     'Senior Support Worker', 'SERVICE_DELIVERY', 'FULL_TIME', '2022-01-15', 
     '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'),
    
    ('770e8400-e29b-41d4-a716-446655440002', 'sw-002', 'Emma', 'Worker', 'emma.worker@primacycare.com.au', '0423456789', 
     'Support Worker', 'SERVICE_DELIVERY', 'PART_TIME', '2022-06-01', 
     '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002'),
    
    ('770e8400-e29b-41d4-a716-446655440003', 'cm-001', 'John', 'Manager', 'john.manager@primacycare.com.au', '0434567890', 
     'Case Manager', 'OPERATIONS', 'FULL_TIME', '2021-03-10', 
     '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'),
    
    ('770e8400-e29b-41d4-a716-446655440004', 'sc-001', 'Sarah', 'Coordinator', 'sarah.coordinator@primacycare.com.au', '0445678901', 
     'Support Coordinator', 'SERVICE_DELIVERY', 'FULL_TIME', '2021-09-01', 
     '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001');

-- Participants
INSERT INTO participants (id, user_id, first_name, last_name, ndis_number, date_of_birth, 
    phone, email, address, emergency_contact, emergency_phone, funding_type, state_id, region_id, created_by) VALUES
    
    ('880e8400-e29b-41d4-a716-446655440001', 'part-001', 'James', 'Brown', '430000001', '1985-03-15', 
     '0456789012', 'james.participant@example.com', '123 Main St, Sydney NSW 2000', 
     'Sarah Brown', '0467890123', 'Plan Managed', 
     '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'cm-001'),
    
    ('880e8400-e29b-41d4-a716-446655440002', 'part-002', 'Mary', 'Johnson', '430000002', '1990-07-22', 
     '0478901234', 'mary.participant@example.com', '456 Park Ave, Sydney NSW 2000', 
     'John Johnson', '0489012345', 'Self Managed', 
     '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'cm-001'),
    
    ('880e8400-e29b-41d4-a716-446655440003', 'part-003', 'Robert', 'Williams', '430000003', '1978-11-08', 
     '0490123456', 'robert.participant@example.com', '789 Beach Rd, Sydney NSW 2000', 
     'Lisa Williams', '0401234567', 'Agency Managed', 
     '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'cm-001');

-- NDIS Plans
INSERT INTO ndis_plans (id, participant_id, plan_number, start_date, end_date, 
    total_budget, core_budget, capacity_building_budget, capital_budget, plan_management_type) VALUES
    
    ('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 
     'N2023001', '2024-01-01', '2024-12-31', 
     75000.00, 50000.00, 20000.00, 5000.00, 'Plan Managed'),
    
    ('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 
     'N2023002', '2024-02-01', '2025-01-31', 
     85000.00, 55000.00, 25000.00, 5000.00, 'Self Managed'),
    
    ('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 
     'N2023003', '2024-03-01', '2025-02-28', 
     65000.00, 45000.00, 15000.00, 5000.00, 'Agency Managed');

-- Services (Scheduled)
INSERT INTO services (id, participant_id, service_type, category, item_number, 
    scheduled_date, start_time, end_time, duration_minutes, location, assigned_to, 
    rate_type, rate, total_cost) VALUES
    
    ('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 
     'Personal Care', 'CORE', '01_011_0107_1_1', 
     CURRENT_DATE + INTERVAL '1 day', '09:00:00', '11:00:00', 120, 
     'Participant Home', '770e8400-e29b-41d4-a716-446655440001', 
     'STANDARD', 65.09, 130.18),
    
    ('aa0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 
     'Community Access', 'CORE', '04_104_0125_6_1', 
     CURRENT_DATE + INTERVAL '2 days', '10:00:00', '14:00:00', 240, 
     'Community Center', '770e8400-e29b-41d4-a716-446655440002', 
     'STANDARD', 60.45, 241.80),
    
    ('aa0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 
     'Support Coordination', 'CAPACITY_BUILDING', '07_001_0106_8_3', 
     CURRENT_DATE + INTERVAL '3 days', '14:00:00', '15:00:00', 60, 
     'Office', '770e8400-e29b-41d4-a716-446655440004', 
     'STANDARD', 100.14, 100.14);

-- Shifts (Upcoming)
INSERT INTO shifts (id, participant_id, assigned_staff_id, shift_date, start_time, end_time, 
    status, base_rate) VALUES
    
    ('bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 
     '770e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', 
     '09:00:00', '11:00:00', 'Scheduled', 30.91),
    
    ('bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 
     '770e8400-e29b-41d4-a716-446655440002', CURRENT_DATE + INTERVAL '2 days', 
     '10:00:00', '14:00:00', 'Scheduled', 28.26),
    
    ('bb0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 
     '770e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '3 days', 
     '14:00:00', '18:00:00', 'Scheduled', 30.91);

-- Staff Availability
INSERT INTO staff_availability (id, staff_id, day_of_week, start_time, end_time, available) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 1, '08:00:00', '16:00:00', true),
    ('cc0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 2, '08:00:00', '16:00:00', true),
    ('cc0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 3, '08:00:00', '16:00:00', true),
    ('cc0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 4, '08:00:00', '16:00:00', true),
    ('cc0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001', 5, '08:00:00', '16:00:00', true),
    ('cc0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', 1, '09:00:00', '15:00:00', true),
    ('cc0e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', 3, '09:00:00', '15:00:00', true),
    ('cc0e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440002', 5, '09:00:00', '15:00:00', true);

-- Participant Goals
INSERT INTO participant_goals (id, participant_id, plan_id, goal_area, goal_title, 
    goal_description, priority, target_date, progress, status, assigned_staff_id) VALUES
    
    ('dd0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 
     '990e8400-e29b-41d4-a716-446655440001', 'Daily Living', 
     'Improve Personal Care Independence', 
     'Develop skills to manage personal care tasks independently', 
     'HIGH', CURRENT_DATE + INTERVAL '90 days', 25, 'In Progress', 
     '770e8400-e29b-41d4-a716-446655440001'),
    
    ('dd0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 
     '990e8400-e29b-41d4-a716-446655440002', 'Social', 
     'Increase Community Participation', 
     'Attend community events and activities at least twice per week', 
     'MEDIUM', CURRENT_DATE + INTERVAL '60 days', 50, 'In Progress', 
     '770e8400-e29b-41d4-a716-446655440002');

-- Referrals (New)
INSERT INTO referrals (id, referral_date, referral_source, referrer_name, referrer_email, 
    referrer_phone, participant_name, participant_dob, urgency, status) VALUES
    
    ('ee0e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '5 days', 
     'Hospital', 'Dr. Smith', 'dr.smith@hospital.com', '0298765432', 
     'Patricia Davis', '1995-04-20', 'MEDIUM', 'IN_REVIEW'),
    
    ('ee0e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '2 days', 
     'NDIS LAC', 'Jane Coordinator', 'jane@ndis.gov.au', '0287654321', 
     'Michael Chen', '1988-09-15', 'HIGH', 'CONTACTING');

-- Sample Progress Notes
INSERT INTO progress_notes (id, participant_id, staff_id, note_date, note_type, content) VALUES
    ('ff0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 
     '770e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 
     'Daily', 'Participant engaged well in personal care activities. Showed improvement in morning routine.'),
    
    ('ff0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 
     '770e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '2 days', 
     'Activity', 'Attended community center social group. Participated in group discussions.');