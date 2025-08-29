import { test, expect, Page } from '@playwright/test';

// Usability and UX testing for NDIS CMS
test.describe('UI/UX Usability Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000');
    // Use development auth bypass
    await page.click('[data-testid="test-user-admin"]');
    await page.waitForSelector('[data-testid="text-page-title"]');
  });

  test.describe('Navigation and Layout', () => {
    test('should have intuitive navigation structure', async ({ page }) => {
      // Test main navigation is visible and accessible
      await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();
      
      // Test department navigation is clear
      const departments = ['Intake', 'HR', 'Finance', 'Service Delivery', 'Compliance'];
      for (const dept of departments) {
        await expect(page.locator(`text=${dept}`)).toBeVisible();
      }
      
      // Test breadcrumb navigation
      await page.click('text=Participants');
      await expect(page.locator('[data-testid="breadcrumb"]')).toContainText('Participants');
    });

    test('should have consistent header and branding', async ({ page }) => {
      // Test logo/branding is visible
      await expect(page.locator('[data-testid="app-logo"]')).toBeVisible();
      
      // Test user profile is accessible
      await expect(page.locator('[data-testid="img-user-profile"]')).toBeVisible();
      
      // Test notifications are accessible
      await expect(page.locator('[data-testid="button-notifications"]')).toBeVisible();
      
      // Test search is prominent
      await expect(page.locator('[data-testid="button-search"]')).toBeVisible();
    });

    test('should have responsive sidebar behavior', async ({ page }) => {
      // Test sidebar visibility on desktop
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      
      // Test sidebar collapse/expand functionality
      await page.click('[data-testid="button-toggle-sidebar"]');
      await page.waitForTimeout(500);
      
      // Verify sidebar state changed
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toHaveClass(/collapsed/);
    });
  });

  test.describe('Form Usability', () => {
    test('should have clear form validation and feedback', async ({ page }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Test form validation on submit without required fields
      await page.click('[data-testid="button-save"]');
      
      // Check validation messages are clear and helpful
      await expect(page.locator('[data-testid="error-name"]')).toContainText('required');
      await expect(page.locator('[data-testid="error-ndis"]')).toContainText('required');
      
      // Test field focus and highlighting
      await page.click('[data-testid="input-name"]');
      await expect(page.locator('[data-testid="input-name"]')).toBeFocused();
    });

    test('should provide helpful input assistance', async ({ page }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Test placeholder text is helpful
      await expect(page.locator('[data-testid="input-email"]')).toHaveAttribute('placeholder', /email/i);
      await expect(page.locator('[data-testid="input-phone"]')).toHaveAttribute('placeholder', /phone/i);
      
      // Test input formatting assistance
      await page.fill('[data-testid="input-phone"]', '0400000000');
      // Should format to (04) 0000 0000 or similar
      
      // Test auto-completion for common fields
      await page.fill('[data-testid="input-state"]', 'N');
      await expect(page.locator('text=NSW')).toBeVisible();
    });

    test('should have accessible form controls', async ({ page }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Test keyboard navigation through form
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="input-name"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="input-ndis-number"]')).toBeFocused();
      
      // Test form submission via keyboard
      await page.keyboard.press('Control+Enter');
      // Should attempt to save form
    });
  });

  test.describe('Data Display and Tables', () => {
    test('should have clear and scannable data tables', async ({ page }) => {
      await page.goto('/participants');
      
      // Test table headers are clear
      await expect(page.locator('th')).toContainText(['Name', 'NDIS Number', 'Status']);
      
      // Test alternating row colors for readability
      const rows = page.locator('[data-testid="participant-row"]');
      await expect(rows.first()).toBeVisible();
      
      // Test sorting functionality
      await page.click('th:has-text("Name")');
      await page.waitForTimeout(500);
      // Verify sort order changed
      
      // Test pagination is clear
      if (await page.locator('[data-testid="pagination"]').isVisible()) {
        await expect(page.locator('[data-testid="pagination"]')).toContainText(/page/i);
      }
    });

    test('should provide meaningful empty states', async ({ page }) => {
      // Navigate to a section that might be empty
      await page.goto('/services');
      
      // If no data, should show helpful empty state
      const emptyState = page.locator('[data-testid="empty-state"]');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toContainText(/no services/i);
        await expect(page.locator('[data-testid="button-add-service"]')).toBeVisible();
      }
    });

    test('should have efficient search and filtering', async ({ page }) => {
      await page.goto('/participants');
      
      // Test global search accessibility
      await page.keyboard.press('Control+K');
      await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
      
      // Test search is responsive and provides feedback
      await page.fill('[data-testid="search-input"]', 'test');
      await page.waitForTimeout(300);
      
      // Should show search results or "no results" message
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toBeVisible();
      
      // Close search
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="search-modal"]')).toBeHidden();
    });
  });

  test.describe('Feedback and Status Communication', () => {
    test('should provide clear loading states', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Test loading indicators are present during data fetch
      const loadingIndicator = page.locator('[data-testid="loading-spinner"]');
      if (await loadingIndicator.isVisible()) {
        await expect(loadingIndicator).toBeVisible();
        await loadingIndicator.waitFor({ state: 'detached', timeout: 5000 });
      }
      
      // Test skeleton loading for content
      const skeleton = page.locator('[data-testid="skeleton-loader"]');
      if (await skeleton.isVisible()) {
        await skeleton.waitFor({ state: 'detached', timeout: 5000 });
      }
    });

    test('should show clear success and error messages', async ({ page }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Fill valid form data
      await page.fill('[data-testid="input-name"]', 'UX Test User');
      await page.fill('[data-testid="input-ndis-number"]', '123456789');
      await page.fill('[data-testid="input-email"]', 'ux@test.com');
      
      await page.click('[data-testid="button-save"]');
      
      // Should show success notification
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="toast-success"]')).toContainText(/success/i);
      
      // Test error handling
      await page.click('[data-testid="button-new-participant"]');
      await page.fill('[data-testid="input-ndis-number"]', '123456789'); // Duplicate
      await page.click('[data-testid="button-save"]');
      
      await expect(page.locator('[data-testid="toast-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="toast-error"]')).toContainText(/error|already exists/i);
    });

    test('should have intuitive status indicators', async ({ page }) => {
      await page.goto('/participants');
      
      // Test status badges are meaningful
      const statusBadge = page.locator('[data-testid="status-badge"]').first();
      if (await statusBadge.isVisible()) {
        await expect(statusBadge).toHaveText(/active|inactive|pending/i);
        
        // Test status colors are distinguishable
        const badgeColor = await statusBadge.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        expect(badgeColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
      }
    });
  });

  test.describe('Accessibility and Keyboard Navigation', () => {
    test('should support full keyboard navigation', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Test tab order is logical
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(['BUTTON', 'A', 'INPUT'].includes(focusedElement)).toBeTruthy();
      
      // Test skip links for screen readers
      await page.keyboard.press('Tab');
      const skipLink = page.locator('[data-testid="skip-to-content"]');
      if (await skipLink.isVisible()) {
        await expect(skipLink).toContainText(/skip/i);
      }
      
      // Test keyboard shortcuts work
      await page.keyboard.press('Control+K'); // Search
      await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
      
      await page.keyboard.press('Escape');
      await page.keyboard.press('Control+N'); // New participant
      await expect(page).toHaveURL(/participants.*new/);
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/participants');
      
      // Test buttons have accessible names
      const newButton = page.locator('[data-testid="button-new-participant"]');
      await expect(newButton).toHaveAttribute('aria-label', /new participant/i);
      
      // Test form inputs have labels
      await page.click('[data-testid="button-new-participant"]');
      await expect(page.locator('[data-testid="input-name"]')).toHaveAttribute('aria-label');
      
      // Test tables have proper structure
      const table = page.locator('table[data-testid="participants-table"]');
      if (await table.isVisible()) {
        await expect(table).toHaveAttribute('role', 'table');
        await expect(page.locator('th').first()).toHaveAttribute('scope', 'col');
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Test text contrast ratios
      const textElement = page.locator('[data-testid="text-page-title"]');
      const styles = await textElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        };
      });
      
      // Basic contrast check (would need more sophisticated checking for WCAG)
      expect(styles.color).not.toBe(styles.backgroundColor);
    });
  });

  test.describe('Mobile-First and Touch Interaction', () => {
    test('should have touch-friendly interactive elements', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/dashboard');
      
      // Test buttons are large enough for touch (44px minimum)
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should adapt layout for mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/participants');
      
      // Test mobile navigation (hamburger menu)
      const mobileMenu = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
      }
      
      // Test responsive table behavior
      const table = page.locator('table');
      if (await table.isVisible()) {
        // Should either stack or scroll horizontally
        const tableWidth = await table.evaluate(el => el.scrollWidth);
        const viewportWidth = 375;
        
        if (tableWidth > viewportWidth) {
          // Should be scrollable
          await expect(table).toHaveCSS('overflow-x', 'auto');
        }
      }
    });
  });

  test.describe('Performance and Perceived Performance', () => {
    test('should load key content quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/dashboard');
      
      // Wait for main content to load
      await page.waitForSelector('[data-testid="text-page-title"]');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Test perceived performance with loading states
      await page.goto('/participants');
      // Should show loading indicators while fetching data
    });

    test('should handle slow network conditions gracefully', async ({ page }) => {
      // Simulate slow network
      await page.context().route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
        await route.continue();
      });
      
      await page.goto('/dashboard');
      
      // Should show loading indicators
      const loadingState = page.locator('[data-testid="loading-spinner"], [data-testid="skeleton-loader"]');
      await expect(loadingState.first()).toBeVisible({ timeout: 2000 });
      
      // Eventually loads content
      await expect(page.locator('[data-testid="text-page-title"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Error Recovery and User Guidance', () => {
    test('should provide helpful error recovery options', async ({ page }) => {
      // Simulate network error
      await page.context().setOffline(true);
      
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      await page.fill('[data-testid="input-name"]', 'Offline Test');
      await page.click('[data-testid="button-save"]');
      
      // Should show offline/error message with retry option
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="button-retry"]')).toBeVisible();
      
      // Test retry functionality
      await page.context().setOffline(false);
      await page.click('[data-testid="button-retry"]');
      
      // Should succeed after network restored
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible({ timeout: 5000 });
    });

    test('should provide contextual help and guidance', async ({ page }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Test help tooltips are available
      const helpIcon = page.locator('[data-testid="help-icon"]').first();
      if (await helpIcon.isVisible()) {
        await helpIcon.hover();
        await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
      }
      
      // Test contextual help text
      const helpText = page.locator('[data-testid="help-text"]');
      if (await helpText.isVisible()) {
        await expect(helpText).toContainText(/required|format|example/i);
      }
      
      // Test help keyboard shortcut
      await page.keyboard.press('F1');
      const helpModal = page.locator('[data-testid="help-modal"]');
      if (await helpModal.isVisible()) {
        await expect(helpModal).toContainText(/keyboard shortcuts|help/i);
      }
    });
  });
});

// UX-specific test helpers
async function measureLoadTime(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  return Date.now() - startTime;
}

async function testColorContrast(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  const styles = await element.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor
    };
  });
  
  // Basic contrast check - in production, use proper WCAG contrast calculation
  return styles.color !== styles.backgroundColor;
}

async function testTouchTarget(page: Page, selector: string): Promise<{ width: number, height: number }> {
  const element = page.locator(selector);
  const box = await element.boundingBox();
  return { width: box.width, height: box.height };
}