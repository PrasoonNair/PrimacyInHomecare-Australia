import { sql } from 'drizzle-orm';
import { db } from '../db';

async function addPerformanceIndexes() {
  console.log('🚀 Adding performance indexes for 200+ participants and 100+ staff...');
  
  try {
    // Participants indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_participants_ndis ON participants(ndis_number)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_participants_user ON participants(user_id)`);
    
    // Services indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_services_date ON services(scheduled_date)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_services_participant ON services(participant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_services_status ON services(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_services_composite ON services(participant_id, scheduled_date, status)`);
    
    // Shifts indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_shifts_date_status ON shifts(shift_date, status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_shifts_staff ON shifts(assigned_staff_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_shifts_composite ON shifts(assigned_staff_id, shift_date, status)`);
    
    // Invoices indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_invoices_participant ON invoices(participant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(issue_date)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_invoices_composite ON invoices(status, issue_date)`);
    
    // Staff indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department)`);
    
    // Staff availability indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_staff_availability_staff ON staff_availability(staff_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_staff_availability_day ON staff_availability(day_of_week)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_staff_availability_composite ON staff_availability(staff_id, day_of_week)`);
    
    // Goals and actions indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_goals_participant ON participant_goals(participant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_goals_status ON participant_goals(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_goals_composite ON participant_goals(participant_id, status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_goal_actions_goal ON goal_actions(goal_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_goal_actions_staff ON goal_actions(assigned_staff_id)`);
    
    // NDIS Plans indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_plans_participant ON ndis_plans(participant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_plans_status ON ndis_plans(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_plans_dates ON ndis_plans(start_date, end_date)`);
    
    // Progress notes indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_progress_notes_participant ON progress_notes(participant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_progress_notes_service ON progress_notes(service_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_progress_notes_date ON progress_notes(note_date)`);
    
    // Incidents indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_incidents_participant ON incidents(participant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_incidents_date ON incidents(incident_date)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity)`);
    
    // Communications and alerts indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_communications_participant ON communications(participant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_communications_staff ON communications(staff_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_alerts_participant ON alerts(participant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(is_read)`);
    
    // Referrals and service agreements indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_referrals_date ON referrals(referral_date)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_service_agreements_participant ON service_agreements(participant_id)`);
    
    // Audit log index for compliance queries
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audits_entity ON audits(entity_type, entity_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audits_user ON audits(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audits_timestamp ON audits(timestamp)`);
    
    console.log('✅ Performance indexes added successfully');
    
    // Analyze tables to update statistics
    console.log('📊 Analyzing tables to update statistics...');
    await db.execute(sql`ANALYZE participants`);
    await db.execute(sql`ANALYZE staff`);
    await db.execute(sql`ANALYZE services`);
    await db.execute(sql`ANALYZE shifts`);
    await db.execute(sql`ANALYZE invoices`);
    await db.execute(sql`ANALYZE ndis_plans`);
    
    console.log('✅ Table statistics updated');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    throw error;
  }
}

// Run if called directly
addPerformanceIndexes()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

export { addPerformanceIndexes };