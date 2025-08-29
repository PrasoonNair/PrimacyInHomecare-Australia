import { test, expect, Page } from '@playwright/test';

// Helper function to login
async function login(page: Page, role: string = 'admin') {
  await page.goto('http://localhost:5000');
  
  // Use test login for development
  if (role === 'admin') {
    await page.click('[data-testid="test-user-admin"]');
  } else if (role === 'staff') {
    await page.click('[data-testid="test-user-staff"]');
  }
  
  await page.waitForSelector('[data-testid="text-page-title"]');
}

test.describe('End-to-End System Tests', () => {
  test.describe('Complete Participant Journey', () => {
    test('should complete full participant onboarding flow', async ({ page }) => {
      await login(page, 'admin');
      
      // Step 1: Create new participant
      await page.click('[data-testid="button-new-participant"]');
      await page.fill('[data-testid="input-name"]', 'E2E Test Participant');
      await page.fill('[data-testid="input-ndis-number"]', '123456789');
      await page.fill('[data-testid="input-email"]', 'e2e@test.com');
      await page.fill('[data-testid="input-phone"]', '0400000000');
      await page.selectOption('[data-testid="select-state"]', 'NSW');
      await page.click('[data-testid="button-save"]');
      
      // Verify participant created
      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Participant created');
      
      // Step 2: Upload NDIS plan
      await page.click('[data-testid="tab-documents"]');
      await page.setInputFiles('[data-testid="input-file-upload"]', 'test-files/sample-ndis-plan.pdf');
      await expect(page.locator('[data-testid="document-list"]')).toContainText('sample-ndis-plan.pdf');
      
      // Step 3: Create service agreement
      await page.click('[data-testid="button-create-agreement"]');
      await page.fill('[data-testid="input-start-date"]', '2025-02-01');
      await page.fill('[data-testid="input-end-date"]', '2026-01-31');
      await page.click('[data-testid="button-generate-agreement"]');
      
      // Step 4: Assign staff
      await page.click('[data-testid="tab-staff"]');
      await page.click('[data-testid="button-assign-staff"]');
      await page.selectOption('[data-testid="select-staff"]', 'John Smith');
      await page.selectOption('[data-testid="select-role"]', 'Support Coordinator');
      await page.click('[data-testid="button-confirm-assignment"]');
      
      // Step 5: Schedule first service
      await page.click('[data-testid="tab-services"]');
      await page.click('[data-testid="button-schedule-service"]');
      await page.selectOption('[data-testid="select-service-type"]', 'Daily Living Support');
      await page.fill('[data-testid="input-service-date"]', '2025-02-03');
      await page.fill('[data-testid="input-service-time"]', '09:00');
      await page.fill('[data-testid="input-duration"]', '2');
      await page.click('[data-testid="button-save-service"]');
      
      // Verify complete setup
      await page.goto('/participants');
      await expect(page.locator('[data-testid="participant-row"]')).toContainText('E2E Test Participant');
      await expect(page.locator('[data-testid="status-badge"]')).toContainText('Active');
    });
  });

  test.describe('Workflow Automation', () => {
    test('should progress through 9-stage workflow automatically', async ({ page }) => {
      await login(page, 'admin');
      
      // Start new referral
      await page.goto('/intake');
      await page.click('[data-testid="button-new-referral"]');
      
      // Stage 1: Referral Received
      await page.fill('[data-testid="input-referral-name"]', 'Workflow Test');
      await page.selectOption('[data-testid="select-referral-source"]', 'NDIS Portal');
      await page.click('[data-testid="button-save-referral"]');
      
      // Verify workflow tracker shows Stage 1
      await expect(page.locator('[data-testid="workflow-stage-1"]')).toHaveClass(/active/);
      
      // Stage 2: Data Verification (auto-advances)
      await page.click('[data-testid="button-verify-data"]');
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid="workflow-stage-2"]')).toHaveClass(/completed/);
      
      // Stage 3: Service Agreement
      await page.click('[data-testid="button-prepare-agreement"]');
      await page.click('[data-testid="button-generate"]');
      await expect(page.locator('[data-testid="workflow-stage-3"]')).toHaveClass(/completed/);
      
      // Continue through remaining stages...
      // Stage 4: Agreement Sent
      await page.click('[data-testid="button-send-agreement"]');
      
      // Stage 5: Agreement Signed (simulate)
      await page.click('[data-testid="button-mark-signed"]');
      
      // Verify final status
      await expect(page.locator('[data-testid="workflow-status"]')).toContainText('Service Commenced');
    });
  });

  test.describe('Bulk Operations', () => {
    test('should process bulk participant import', async ({ page }) => {
      await login(page, 'admin');
      
      // Navigate to bulk operations
      await page.goto('/bulk-operations');
      
      // Upload CSV file
      await page.setInputFiles('[data-testid="input-bulk-upload"]', 'test-files/participants.csv');
      
      // Review import preview
      await expect(page.locator('[data-testid="import-preview"]')).toContainText('10 participants');
      
      // Process import
      await page.click('[data-testid="button-import"]');
      
      // Wait for processing
      await page.waitForSelector('[data-testid="import-success"]');
      await expect(page.locator('[data-testid="import-results"]')).toContainText('Successfully imported: 10');
      
      // Verify participants appear in list
      await page.goto('/participants');
      await expect(page.locator('[data-testid="participant-count"]')).toContainText('10');
    });

    test('should generate bulk invoices', async ({ page }) => {
      await login(page, 'admin');
      
      await page.goto('/bulk-operations');
      await page.click('[data-testid="tab-invoices"]');
      
      // Select period and participants
      await page.selectOption('[data-testid="select-period"]', 'last-month');
      await page.click('[data-testid="checkbox-select-all"]');
      
      // Generate invoices
      await page.click('[data-testid="button-generate-invoices"]');
      
      // Verify generation
      await page.waitForSelector('[data-testid="invoice-success"]');
      await expect(page.locator('[data-testid="invoices-generated"]')).toContainText('Generated 10 invoices');
    });
  });

  test.describe('Communication Features', () => {
    test('should send bulk SMS campaign', async ({ page }) => {
      await login(page, 'admin');
      
      await page.goto('/communications');
      await page.click('[data-testid="tab-sms"]');
      
      // Select template
      await page.selectOption('[data-testid="select-sms-template"]', 'appointment-reminder');
      
      // Select recipients
      await page.click('[data-testid="button-select-active"]');
      
      // Customize message
      await page.fill('[data-testid="textarea-sms-message"]', 'Reminder: Your appointment is tomorrow at [TIME]');
      
      // Send campaign
      await page.click('[data-testid="button-send-sms"]');
      
      // Verify sent
      await expect(page.locator('[data-testid="sms-status"]')).toContainText('Sent to 25 recipients');
    });

    test('should use email templates', async ({ page }) => {
      await login(page, 'admin');
      
      await page.goto('/communications');
      await page.click('[data-testid="tab-email"]');
      
      // Select welcome template
      await page.click('[data-testid="template-welcome"]');
      
      // Preview template
      await page.click('[data-testid="button-preview"]');
      await expect(page.locator('[data-testid="email-preview"]')).toContainText('Welcome to Primacy Care');
      
      // Send to new participants
      await page.click('[data-testid="button-select-new"]');
      await page.click('[data-testid="button-send-email"]');
      
      await expect(page.locator('[data-testid="email-status"]')).toContainText('Sent successfully');
    });
  });

  test.describe('Mobile Support Worker Experience', () => {
    test('should complete mobile shift workflow', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      
      await login(page, 'staff');
      
      // Clock in
      await page.click('[data-testid="button-clock-in"]');
      await expect(page.locator('[data-testid="shift-status"]')).toContainText('Active');
      
      // Navigate to participant
      await page.click('[data-testid="shift-participant"]');
      
      // Add progress note
      await page.click('[data-testid="button-quick-note"]');
      await page.fill('[data-testid="textarea-note"]', 'Participant in good spirits. Completed daily activities.');
      
      // Add photo
      await page.setInputFiles('[data-testid="input-photo"]', 'test-files/activity.jpg');
      
      // Submit note
      await page.click('[data-testid="button-save-note"]');
      
      // Clock out
      await page.click('[data-testid="button-clock-out"]');
      await expect(page.locator('[data-testid="shift-complete"]')).toContainText('Shift completed');
    });
  });

  test.describe('Analytics and Reporting', () => {
    test('should generate monthly compliance report', async ({ page }) => {
      await login(page, 'admin');
      
      await page.goto('/reports');
      
      // Select report type
      await page.selectOption('[data-testid="select-report-type"]', 'compliance-monthly');
      
      // Set parameters
      await page.selectOption('[data-testid="select-month"]', '2025-01');
      
      // Generate report
      await page.click('[data-testid="button-generate-report"]');
      
      // Wait for generation
      await page.waitForSelector('[data-testid="report-ready"]');
      
      // Verify report contents
      await expect(page.locator('[data-testid="compliance-score"]')).toContainText('98%');
      await expect(page.locator('[data-testid="incidents-count"]')).toContainText('2');
      
      // Download report
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="button-download-pdf"]')
      ]);
      
      expect(download.suggestedFilename()).toContain('compliance-report');
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should navigate using keyboard shortcuts', async ({ page }) => {
      await login(page, 'admin');
      
      // Test global search (Ctrl+K)
      await page.keyboard.press('Control+K');
      await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
      await page.keyboard.press('Escape');
      
      // Test new participant (Ctrl+N)
      await page.keyboard.press('Control+N');
      await expect(page).toHaveURL(/.*participants.*action=new/);
      
      // Test department switching (Alt+1-5)
      await page.keyboard.press('Alt+1');
      await expect(page).toHaveURL(/.*intake/);
      
      await page.keyboard.press('Alt+3');
      await expect(page).toHaveURL(/.*finance/);
      
      // Test quick actions (Ctrl+Q)
      await page.keyboard.press('Control+Q');
      await expect(page.locator('[data-testid="quick-actions-menu"]')).toBeVisible();
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await login(page, 'admin');
      
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Try to save participant
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      await page.fill('[data-testid="input-name"]', 'Offline Test');
      await page.click('[data-testid="button-save"]');
      
      // Should show offline message
      await expect(page.locator('[data-testid="offline-message"]')).toContainText('You are offline');
      
      // Go back online
      await page.context().setOffline(false);
      
      // Retry save
      await page.click('[data-testid="button-retry"]');
      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Saved successfully');
    });

    test('should validate form inputs', async ({ page }) => {
      await login(page, 'admin');
      
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Try to save without required fields
      await page.click('[data-testid="button-save"]');
      
      // Check validation messages
      await expect(page.locator('[data-testid="error-name"]')).toContainText('Name is required');
      await expect(page.locator('[data-testid="error-ndis"]')).toContainText('NDIS number is required');
      
      // Test invalid email
      await page.fill('[data-testid="input-email"]', 'invalid-email');
      await page.click('[data-testid="button-save"]');
      await expect(page.locator('[data-testid="error-email"]')).toContainText('Invalid email address');
      
      // Test invalid phone
      await page.fill('[data-testid="input-phone"]', '123');
      await page.click('[data-testid="button-save"]');
      await expect(page.locator('[data-testid="error-phone"]')).toContainText('Invalid phone number');
    });
  });
});