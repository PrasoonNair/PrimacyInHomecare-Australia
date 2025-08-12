const { neonConfig } = require('@neondatabase/serverless');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

async function seedShifts() {
  console.log('Seeding shift data...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });
  
  try {
    // Add sample shift data
    await pool.query(`
      INSERT INTO shifts (
        participant_id, 
        assigned_staff_id, 
        shift_date, 
        start_time, 
        end_time, 
        duration, 
        location, 
        participant_address, 
        status, 
        hourly_rate, 
        ndis_support_item_number, 
        billing_status, 
        case_note_completed
      ) VALUES 
      (
        '65c8f1a7-5e4b-4a91-9c8d-2f3e4a5b6c7d',
        '6508ef46-6429-4ea1-9f11-264375e677af',
        CURRENT_DATE,
        '09:00',
        '15:00',
        360,
        'participant_home',
        '123 Main Street, Brisbane, QLD 4000',
        'scheduled',
        '45.50',
        '01_013_0128_1_1',
        'pending',
        false
      ),
      (
        '65c8f1a7-5e4b-4a91-9c8d-2f3e4a5b6c7d',
        '6508ef46-6429-4ea1-9f11-264375e677af',
        CURRENT_DATE + 1,
        '10:00',
        '14:00',
        240,
        'community',
        'Local Community Centre, South Brisbane QLD',
        'scheduled',
        '45.50',
        '01_013_0128_1_1',
        'pending',
        false
      ),
      (
        '65c8f1a7-5e4b-4a91-9c8d-2f3e4a5b6c7d',
        '6508ef46-6429-4ea1-9f11-264375e677af',
        CURRENT_DATE - 1,
        '08:00',
        '12:00',
        240,
        'participant_home',
        '123 Main Street, Brisbane, QLD 4000',
        'in_progress',
        '45.50',
        '01_013_0128_1_1',
        'pending',
        false
      )
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Shift data seeded successfully!');
  } catch (error) {
    console.error('Error seeding shifts:', error);
  } finally {
    await pool.end();
  }
}

seedShifts();