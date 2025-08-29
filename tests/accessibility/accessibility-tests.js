import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Accessibility compliance testing using axe-core
test.describe('Accessibility Compliance Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000');
    await page.click('[data-testid="test-user-admin"]');
    await page.waitForSelector('[data-testid="text-page-title"]');
  });

  test.describe('WCAG 2.1 AA Compliance', () => {
    
    test('should pass axe accessibility scan on dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
      
      // Log any incomplete tests for manual review
      if (accessibilityScanResults.incomplete.length > 0) {
        console.log('Incomplete accessibility tests:', accessibilityScanResults.incomplete);
      }
    });

    test('should pass axe scan on participant forms', async ({ page }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass axe scan on data tables', async ({ page }) => {
      await page.goto('/participants');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('table')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass axe scan on navigation elements', async ({ page }) => {
      await page.goto('/dashboard');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('nav')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    
    test('should support full keyboard navigation', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Test tab order is logical
      const tabbableElements = [];
      let currentElement = null;
      
      // Get first tabbable element
      await page.keyboard.press('Tab');
      currentElement = await page.locator(':focus').getAttribute('data-testid') || 
                      await page.locator(':focus').getAttribute('aria-label') ||
                      await page.locator(':focus').evaluate(el => el.tagName);
      tabbableElements.push(currentElement);
      
      // Tab through several elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const newElement = await page.locator(':focus').getAttribute('data-testid') || 
                          await page.locator(':focus').getAttribute('aria-label') ||
                          await page.locator(':focus').evaluate(el => el.tagName);
        if (newElement !== currentElement) {
          tabbableElements.push(newElement);
          currentElement = newElement;
        }
      }
      
      // Should have found multiple tabbable elements
      expect(tabbableElements.length).toBeGreaterThan(3);
      
      // Test reverse tab order
      await page.keyboard.press('Shift+Tab');
      const reversedElement = await page.locator(':focus').getAttribute('data-testid') ||
                             await page.locator(':focus').evaluate(el => el.tagName);
      expect(reversedElement).toBeTruthy();
    });

    test('should handle keyboard shortcuts', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Test global search shortcut
      await page.keyboard.press('Control+K');
      await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
      
      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="search-modal"]')).toBeHidden();
      
      // Test new participant shortcut
      await page.keyboard.press('Control+N');
      await expect(page).toHaveURL(/participants.*new/);
      
      // Test help shortcut
      await page.keyboard.press('F1');
      const helpModal = page.locator('[data-testid="help-modal"]');
      if (await helpModal.isVisible()) {
        await expect(helpModal).toContainText(/help|shortcuts/i);
        await page.keyboard.press('Escape');
      }
    });

    test('should handle focus management in modals', async ({ page }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Focus should be trapped in modal
      const modal = page.locator('[data-testid="participant-form"], [role="dialog"]');
      await expect(modal).toBeVisible();
      
      // First focusable element should be focused
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      const focusedBox = await focusedElement.boundingBox();
      const modalBox = await modal.boundingBox();
      
      // Focus should be within modal bounds
      expect(focusedBox.x).toBeGreaterThanOrEqual(modalBox.x);
      expect(focusedBox.y).toBeGreaterThanOrEqual(modalBox.y);
      
      // Test escape to close
      await page.keyboard.press('Escape');
      await expect(modal).toBeHidden();
    });
  });

  test.describe('Screen Reader Support', () => {
    
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/dashboard');
      
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels = [];
      
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName);
        const level = parseInt(tagName.charAt(1));
        headingLevels.push(level);
      }
      
      // Should have h1 as main heading
      expect(headingLevels).toContain(1);
      
      // Check for logical heading progression (no skipping levels)
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1); // Should not skip heading levels
      }
    });

    test('should have proper landmarks and regions', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Test for main landmarks
      await expect(page.locator('main, [role="main"]')).toBeVisible();
      await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
      await expect(page.locator('header, [role="banner"]')).toBeVisible();
      
      // Test for complementary regions
      const aside = page.locator('aside, [role="complementary"]');
      if (await aside.isVisible()) {
        await expect(aside).toBeVisible();
      }
      
      // Test for content info (footer)
      const footer = page.locator('footer, [role="contentinfo"]');
      if (await footer.isVisible()) {
        await expect(footer).toBeVisible();
      }
    });

    test('should have descriptive labels and text', async ({ page }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Test form inputs have labels
      const inputs = page.locator('input[type="text"], input[type="email"], select, textarea');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          // Should have associated label
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          const hasAriaLabel = !!ariaLabel || !!ariaLabelledBy;
          
          expect(hasLabel || hasAriaLabel).toBeTruthy();
        }
      }
    });

    test('should provide alternative text for images', async ({ page }) => {
      await page.goto('/dashboard');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Images should have alt text or be marked as decorative
        expect(alt !== null || role === 'presentation').toBeTruthy();
        
        // Alt text should not be redundant
        if (alt) {
          expect(alt.toLowerCase()).not.toContain('image');
          expect(alt.toLowerCase()).not.toContain('picture');
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    
    test('should meet color contrast requirements', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Test high-contrast elements
      const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6').first();
      
      const contrast = await textElements.evaluate(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Simple contrast check (in production, use proper WCAG calculation)
        return {
          color,
          backgroundColor,
          isTransparent: backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent'
        };
      });
      
      // Basic validation - not transparent background or sufficient difference
      expect(contrast.color).not.toBe(contrast.backgroundColor);
    });

    test('should not rely solely on color for information', async ({ page }) => {
      await page.goto('/participants');
      
      // Test status indicators have text/icons in addition to color
      const statusElements = page.locator('[data-testid*="status"]');
      const statusCount = await statusElements.count();
      
      for (let i = 0; i < Math.min(statusCount, 5); i++) {
        const status = statusElements.nth(i);
        const textContent = await status.textContent();
        const ariaLabel = await status.getAttribute('aria-label');
        
        // Should have text content or aria-label, not just color
        expect(textContent || ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Motion and Animation', () => {
    
    test('should respect reduced motion preferences', async ({ page }) => {
      // Simulate prefers-reduced-motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/dashboard');
      
      // Test animations are reduced or disabled
      const animatedElements = page.locator('[class*="animate"], [style*="transition"]');
      const animatedCount = await animatedElements.count();
      
      for (let i = 0; i < Math.min(animatedCount, 3); i++) {
        const element = animatedElements.nth(i);
        const style = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            animationDuration: computed.animationDuration,
            transitionDuration: computed.transitionDuration
          };
        });
        
        // Animations should be significantly reduced or disabled
        if (style.animationDuration !== 'none') {
          const duration = parseFloat(style.animationDuration);
          expect(duration).toBeLessThan(0.1); // Less than 100ms
        }
      }
    });

    test('should provide pause controls for auto-playing content', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for auto-playing content
      const autoContent = page.locator('[autoplay], [data-autoplay="true"]');
      const autoCount = await autoContent.count();
      
      if (autoCount > 0) {
        // Should have pause/stop controls
        const pauseControl = page.locator('[data-testid*="pause"], [aria-label*="pause"]');
        await expect(pauseControl).toBeVisible();
      }
    });
  });

  test.describe('Error Prevention and Recovery', () => {
    
    test('should provide clear error messages', async ({ page }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Submit form with errors
      await page.click('[data-testid="button-save"]');
      
      // Error messages should be descriptive
      const errorMessages = page.locator('[data-testid*="error"], [role="alert"]');
      const errorCount = await errorMessages.count();
      
      expect(errorCount).toBeGreaterThan(0);
      
      for (let i = 0; i < errorCount; i++) {
        const error = errorMessages.nth(i);
        const text = await error.textContent();
        
        // Error should be descriptive, not just "Error"
        expect(text.length).toBeGreaterThan(5);
        expect(text.toLowerCase()).not.toBe('error');
      }
    });

    test('should confirm destructive actions', async ({ page }) => {
      await page.goto('/participants');
      
      // Look for delete buttons
      const deleteButtons = page.locator('[data-testid*="delete"], [aria-label*="delete"]');
      const deleteCount = await deleteButtons.count();
      
      if (deleteCount > 0) {
        await deleteButtons.first().click();
        
        // Should show confirmation dialog
        const confirmation = page.locator('[role="dialog"], [data-testid*="confirm"]');
        await expect(confirmation).toBeVisible();
        
        // Should have clear confirmation text
        const confirmText = await confirmation.textContent();
        expect(confirmText.toLowerCase()).toContain('delete');
        expect(confirmText.toLowerCase()).toContain('confirm');
      }
    });
  });

  test.describe('Focus Management', () => {
    
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Test focus indicators are visible
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      const focusStyle = await focusedElement.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow,
          border: style.border
        };
      });
      
      // Should have some form of focus indicator
      const hasFocusIndicator = 
        focusStyle.outline !== 'none' ||
        focusStyle.outlineWidth !== '0px' ||
        focusStyle.boxShadow !== 'none' ||
        focusStyle.border !== 'none';
      
      expect(hasFocusIndicator).toBeTruthy();
    });

    test('should manage focus on page transitions', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Focus on an element
      await page.keyboard.press('Tab');
      
      // Navigate to new page
      await page.goto('/participants');
      
      // Focus should be reset to logical starting point
      const focusedElement = page.locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName);
      
      // Should be on body or skip link
      expect(['BODY', 'A', 'BUTTON'].includes(tagName)).toBeTruthy();
    });
  });

  test.describe('Time-based Content', () => {
    
    test('should provide time limits and extensions', async ({ page }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Look for session timeout warnings
      const timeoutWarning = page.locator('[data-testid*="timeout"], [data-testid*="session"]');
      
      if (await timeoutWarning.isVisible()) {
        // Should provide option to extend session
        const extendButton = page.locator('[data-testid*="extend"], [data-testid*="continue"]');
        await expect(extendButton).toBeVisible();
      }
    });
  });
});

// Test configuration for different accessibility standards
const accessibilityStandards = {
  'wcag2a': ['wcag2a'],
  'wcag2aa': ['wcag2a', 'wcag2aa'],
  'wcag21aa': ['wcag2a', 'wcag2aa', 'wcag21aa'],
  'wcag22aa': ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
};

// Run accessibility tests with different standards
Object.entries(accessibilityStandards).forEach(([standard, tags]) => {
  test.describe(`${standard.toUpperCase()} Compliance`, () => {
    
    test(`should pass ${standard} on all major pages`, async ({ page }) => {
      const pages = [
        '/dashboard',
        '/participants',
        '/staff',
        '/services',
        '/reports'
      ];
      
      for (const pagePath of pages) {
        await page.goto('http://localhost:5000');
        await page.click('[data-testid="test-user-admin"]');
        await page.goto(pagePath);
        await page.waitForLoadState('domcontentloaded');
        
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(tags)
          .analyze();
        
        expect(accessibilityScanResults.violations).toEqual([]);
        
        console.log(`✓ ${standard} compliance verified for ${pagePath}`);
      }
    });
  });
});

// Helper functions for accessibility testing
async function checkColorContrast(page, selector) {
  return await page.locator(selector).evaluate(el => {
    const style = window.getComputedStyle(el);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight
    };
  });
}

async function checkFocusManagement(page) {
  const focusedElement = page.locator(':focus');
  return {
    hasFocus: await focusedElement.count() > 0,
    tagName: await focusedElement.evaluate(el => el.tagName).catch(() => null),
    ariaLabel: await focusedElement.getAttribute('aria-label').catch(() => null),
    testId: await focusedElement.getAttribute('data-testid').catch(() => null)
  };
}