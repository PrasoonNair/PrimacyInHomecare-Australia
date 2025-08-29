import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../db';
import { sql } from 'drizzle-orm';

// Create test app instance
const app = express();
app.use(express.json());

// Import routes (simplified for testing)
import { registerRoutes } from '../routes';
registerRoutes(app);

describe('Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS test_participants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        ndis_number TEXT UNIQUE
      )
    `);
  });

  afterAll(async () => {
    // Cleanup
    await db.execute(sql`DROP TABLE IF EXISTS test_participants`);
  });

  describe('API Endpoints Integration', () => {
    describe('Participant Management', () => {
      it('should create and retrieve a participant', async () => {
        // Create participant
        const createResponse = await request(app)
          .post('/api/participants')
          .send({
            name: 'Test Participant',
            ndisNumber: '123456789',
            email: 'test@example.com',
            phone: '0400000000'
          });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body).toHaveProperty('id');

        const participantId = createResponse.body.id;

        // Retrieve participant
        const getResponse = await request(app)
          .get(`/api/participants/${participantId}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.name).toBe('Test Participant');
        expect(getResponse.body.ndisNumber).toBe('123456789');
      });

      it('should update participant information', async () => {
        // Create participant first
        const createResponse = await request(app)
          .post('/api/participants')
          .send({
            name: 'Update Test',
            ndisNumber: '987654321',
            email: 'update@example.com'
          });

        const participantId = createResponse.body.id;

        // Update participant
        const updateResponse = await request(app)
          .patch(`/api/participants/${participantId}`)
          .send({
            name: 'Updated Name',
            phone: '0411111111'
          });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.name).toBe('Updated Name');
        expect(updateResponse.body.phone).toBe('0411111111');
      });

      it('should handle bulk operations', async () => {
        const bulkData = [
          { name: 'Bulk 1', ndisNumber: '111111111' },
          { name: 'Bulk 2', ndisNumber: '222222222' },
          { name: 'Bulk 3', ndisNumber: '333333333' }
        ];

        const response = await request(app)
          .post('/api/participants/bulk')
          .send({ participants: bulkData });

        expect(response.status).toBe(201);
        expect(response.body.created).toBe(3);
      });
    });

    describe('Staff Management Integration', () => {
      it('should create staff and assign to participant', async () => {
        // Create staff member
        const staffResponse = await request(app)
          .post('/api/staff')
          .send({
            name: 'Test Worker',
            email: 'worker@example.com',
            role: 'support_worker',
            department: 'service_delivery'
          });

        expect(staffResponse.status).toBe(201);
        const staffId = staffResponse.body.id;

        // Create participant
        const participantResponse = await request(app)
          .post('/api/participants')
          .send({
            name: 'Assigned Participant',
            ndisNumber: '444444444'
          });

        const participantId = participantResponse.body.id;

        // Assign staff to participant
        const assignResponse = await request(app)
          .post('/api/assignments')
          .send({
            staffId,
            participantId,
            role: 'primary_support'
          });

        expect(assignResponse.status).toBe(201);
        expect(assignResponse.body.staffId).toBe(staffId);
        expect(assignResponse.body.participantId).toBe(participantId);
      });
    });

    describe('Service Delivery Integration', () => {
      it('should create service and link to participant', async () => {
        // Create participant
        const participantResponse = await request(app)
          .post('/api/participants')
          .send({
            name: 'Service Participant',
            ndisNumber: '555555555'
          });

        const participantId = participantResponse.body.id;

        // Create service
        const serviceResponse = await request(app)
          .post('/api/services')
          .send({
            participantId,
            serviceType: 'daily_living',
            date: new Date().toISOString(),
            duration: 120,
            notes: 'Test service delivery'
          });

        expect(serviceResponse.status).toBe(201);
        expect(serviceResponse.body.participantId).toBe(participantId);
        expect(serviceResponse.body.serviceType).toBe('daily_living');
      });

      it('should generate invoice from services', async () => {
        // Create participant with services
        const participantResponse = await request(app)
          .post('/api/participants')
          .send({
            name: 'Invoice Participant',
            ndisNumber: '666666666'
          });

        const participantId = participantResponse.body.id;

        // Create multiple services
        for (let i = 0; i < 3; i++) {
          await request(app)
            .post('/api/services')
            .send({
              participantId,
              serviceType: 'community_access',
              date: new Date().toISOString(),
              duration: 60,
              cost: 100
            });
        }

        // Generate invoice
        const invoiceResponse = await request(app)
          .post('/api/invoices/generate')
          .send({
            participantId,
            period: 'current_month'
          });

        expect(invoiceResponse.status).toBe(201);
        expect(invoiceResponse.body.totalAmount).toBe(300);
        expect(invoiceResponse.body.lineItems).toHaveLength(3);
      });
    });

    describe('Workflow Integration', () => {
      it('should progress through workflow stages', async () => {
        // Create workflow
        const workflowResponse = await request(app)
          .post('/api/workflows')
          .send({
            type: 'participant_onboarding',
            participantName: 'Workflow Test',
            currentStage: 'referral_received'
          });

        expect(workflowResponse.status).toBe(201);
        const workflowId = workflowResponse.body.id;

        // Progress to next stage
        const progressResponse = await request(app)
          .post(`/api/workflows/${workflowId}/advance`)
          .send({
            nextStage: 'data_verified',
            notes: 'All data verified'
          });

        expect(progressResponse.status).toBe(200);
        expect(progressResponse.body.currentStage).toBe('data_verified');

        // Check audit trail
        const auditResponse = await request(app)
          .get(`/api/workflows/${workflowId}/audit`);

        expect(auditResponse.status).toBe(200);
        expect(auditResponse.body).toHaveLength(2); // Initial + advancement
      });
    });

    describe('Communication Integration', () => {
      it('should send bulk emails using templates', async () => {
        // Get participants
        const participantsResponse = await request(app)
          .get('/api/participants');

        const participantIds = participantsResponse.body
          .slice(0, 3)
          .map((p: any) => p.id);

        // Send bulk email
        const emailResponse = await request(app)
          .post('/api/communications/email/bulk')
          .send({
            template: 'welcome',
            recipientIds: participantIds,
            variables: {
              startDate: new Date().toISOString()
            }
          });

        expect(emailResponse.status).toBe(200);
        expect(emailResponse.body.sent).toBe(participantIds.length);
      });

      it('should queue SMS messages', async () => {
        const smsResponse = await request(app)
          .post('/api/communications/sms/queue')
          .send({
            recipients: ['0400000000', '0411111111'],
            message: 'Test SMS message',
            scheduledFor: new Date(Date.now() + 3600000).toISOString()
          });

        expect(smsResponse.status).toBe(201);
        expect(smsResponse.body.queued).toBe(2);
        expect(smsResponse.body.status).toBe('scheduled');
      });
    });
  });

  describe('Database Transaction Integration', () => {
    it('should rollback on error in transaction', async () => {
      // Attempt to create participant with duplicate NDIS number
      const firstResponse = await request(app)
        .post('/api/participants')
        .send({
          name: 'First Participant',
          ndisNumber: '999999999'
        });

      expect(firstResponse.status).toBe(201);

      // Try to create duplicate
      const duplicateResponse = await request(app)
        .post('/api/participants')
        .send({
          name: 'Duplicate Participant',
          ndisNumber: '999999999'
        });

      expect(duplicateResponse.status).toBe(400);
      expect(duplicateResponse.body.error).toContain('already exists');

      // Verify only one participant exists
      const checkResponse = await request(app)
        .get('/api/participants?ndisNumber=999999999');

      expect(checkResponse.body).toHaveLength(1);
    });
  });
});