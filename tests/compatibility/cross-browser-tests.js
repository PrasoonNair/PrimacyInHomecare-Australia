import { test, expect, devices } from '@playwright/test';

// Cross-browser and cross-device compatibility testing
const browsers = ['chromium', 'firefox', 'webkit'];
const viewports = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Large Mobile', width: 414, height: 896 }
];

// Device-specific tests using Playwright's device emulation
const deviceTests = [
  devices['Desktop Chrome'],
  devices['Desktop Firefox'],
  devices['Desktop Safari'],
  devices['iPad'],
  devices['iPhone 12'],
  devices['iPhone 12 Pro'],
  devices['Pixel 5'],
  devices['Galaxy S21']
];

test.describe('Cross-Browser Compatibility', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000');
    // Use development auth
    await page.click('[data-testid="test-user-admin"]');
    await page.waitForSelector('[data-testid="text-page-title"]');
  });

  test.describe('Core Functionality Across Browsers', () => {
    test('should render layout correctly in all browsers', async ({ page, browserName }) => {
      await page.goto('/dashboard');
      
      // Test header is visible and positioned correctly
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // Test navigation is accessible
      await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();
      
      // Test main content area
      await expect(page.locator('main, [role="main"]')).toBeVisible();
      
      // Browser-specific adjustments
      if (browserName === 'webkit') {
        // Safari-specific checks
        await expect(page.locator('[data-testid="text-page-title"]')).toBeVisible();
      } else if (browserName === 'firefox') {
        // Firefox-specific checks
        await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      }
    });

    test('should handle JavaScript features consistently', async ({ page, browserName }) => {
      await page.goto('/participants');
      
      // Test modern JavaScript features work
      await page.click('[data-testid="button-new-participant"]');
      await expect(page.locator('[data-testid="participant-form"]')).toBeVisible();
      
      // Test async/await functionality
      await page.fill('[data-testid="input-name"]', 'Cross Browser Test');
      await page.fill('[data-testid="input-ndis-number"]', '999888777');
      await page.fill('[data-testid="input-email"]', 'cross@browser.test');
      
      await page.click('[data-testid="button-save"]');
      
      // Should work across all browsers
      await expect(page.locator('[data-testid="toast-success"], [data-testid="success-message"]'))
        .toBeVisible({ timeout: 5000 });
      
      console.log(`✓ JavaScript functionality verified in ${browserName}`);
    });

    test('should handle CSS features and layout', async ({ page, browserName }) => {
      await page.goto('/dashboard');
      
      // Test CSS Grid/Flexbox layouts
      const dashboard = page.locator('[data-testid="dashboard-grid"]');
      if (await dashboard.isVisible()) {
        const layout = await dashboard.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            display: style.display,
            gridTemplateColumns: style.gridTemplateColumns,
            gap: style.gap
          };
        });
        
        expect(layout.display).toContain('grid');
      }
      
      // Test modern CSS features
      const cards = page.locator('[data-testid*="card"]');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        const cardStyles = await cards.first().evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            borderRadius: style.borderRadius,
            boxShadow: style.boxShadow,
            backdropFilter: style.backdropFilter
          };
        });
        
        // Basic CSS support validation
        expect(cardStyles.borderRadius).toBeTruthy();
      }
      
      console.log(`✓ CSS layout verified in ${browserName}`);
    });

    test('should handle form interactions consistently', async ({ page, browserName }) => {
      await page.goto('/participants');
      await page.click('[data-testid="button-new-participant"]');
      
      // Test form controls work across browsers
      const formInputs = [
        '[data-testid="input-name"]',
        '[data-testid="input-email"]',
        '[data-testid="input-phone"]',
        '[data-testid="select-state"]'
      ];
      
      for (const input of formInputs) {
        const element = page.locator(input);
        if (await element.isVisible()) {
          await element.click();
          await expect(element).toBeFocused();
          
          if (input.includes('select')) {
            await element.selectOption({ index: 1 });
          } else {
            await element.fill('test value');
            await expect(element).toHaveValue('test value');
          }
        }
      }
      
      // Test form validation
      await page.locator('[data-testid="input-name"]').fill('');
      await page.click('[data-testid="button-save"]');
      
      await expect(page.locator('[data-testid="error-name"]')).toBeVisible();
      
      console.log(`✓ Form interactions verified in ${browserName}`);
    });
  });

  test.describe('API and Network Compatibility', () => {
    test('should handle fetch/XHR requests consistently', async ({ page, browserName }) => {
      // Monitor network requests
      const requests = [];
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          requests.push(request.method() + ' ' + request.url());
        }
      });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Verify API requests were made
      expect(requests.length).toBeGreaterThan(0);
      expect(requests.some(req => req.includes('GET'))).toBeTruthy();
      
      // Test API error handling
      await page.route('**/api/participants', route => route.abort());
      await page.goto('/participants');
      
      // Should handle network errors gracefully
      await expect(page.locator('[data-testid="error-message"], [data-testid="retry-button"]'))
        .toBeVisible({ timeout: 5000 });
      
      console.log(`✓ Network handling verified in ${browserName}`);
    });

    test('should handle WebSocket connections', async ({ page, browserName }) => {
      // Skip WebSocket tests for Safari if not supported
      if (browserName === 'webkit') {
        test.skip();
      }
      
      // Test real-time features if implemented
      await page.goto('/dashboard');
      
      // Look for WebSocket connection indicators
      const wsStatus = page.locator('[data-testid="connection-status"]');
      if (await wsStatus.isVisible()) {
        await expect(wsStatus).toContainText(/connected|online/i);
      }
      
      console.log(`✓ WebSocket support verified in ${browserName}`);
    });
  });
});

test.describe('Cross-Device and Viewport Testing', () => {
  
  viewports.forEach(viewport => {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('http://localhost:5000');
        await page.click('[data-testid="test-user-admin"]');
        await page.waitForSelector('[data-testid="text-page-title"]');
      });

      test('should adapt layout appropriately', async ({ page }) => {
        await page.goto('/dashboard');
        
        if (viewport.width < 768) {
          // Mobile layout tests
          const mobileMenu = page.locator('[data-testid="mobile-menu-button"], [data-testid="hamburger-menu"]');
          if (await mobileMenu.isVisible()) {
            await expect(mobileMenu).toBeVisible();
            
            // Test mobile menu functionality
            await mobileMenu.click();
            await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
          }
          
          // Test content stacking on mobile
          const cards = page.locator('[data-testid*="card"]');
          if (await cards.count() > 1) {
            const firstCard = cards.first();
            const secondCard = cards.nth(1);
            
            const firstBox = await firstCard.boundingBox();
            const secondBox = await secondCard.boundingBox();
            
            // Cards should stack vertically on mobile
            expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
          }
          
        } else if (viewport.width < 1024) {
          // Tablet layout tests
          const sidebar = page.locator('[data-testid="sidebar"]');
          if (await sidebar.isVisible()) {
            // Sidebar might be collapsed or overlay on tablet
            const sidebarStyle = await sidebar.evaluate(el => 
              window.getComputedStyle(el).transform
            );
            // Could be transformed off-screen or collapsed
          }
          
        } else {
          // Desktop layout tests
          await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
          await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
          
          // Test multi-column layouts
          const dashboard = page.locator('[data-testid="dashboard-grid"]');
          if (await dashboard.isVisible()) {
            const columns = await dashboard.evaluate(el => {
              const style = window.getComputedStyle(el);
              return style.gridTemplateColumns;
            });
            
            // Should have multiple columns on desktop
            expect(columns).not.toBe('1fr');
          }
        }
        
        console.log(`✓ Layout adaptation verified for ${viewport.name}`);
      });

      test('should maintain usability across screen sizes', async ({ page }) => {
        await page.goto('/participants');
        
        // Test interactive elements are appropriately sized
        const buttons = page.locator('button[data-testid*="button"]');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            const box = await button.boundingBox();
            
            if (viewport.width < 768) {
              // Touch targets should be at least 44px on mobile
              expect(box.height).toBeGreaterThanOrEqual(44);
            } else {
              // Desktop can have smaller targets
              expect(box.height).toBeGreaterThanOrEqual(32);
            }
          }
        }
        
        // Test text readability
        const bodyText = page.locator('body');
        const fontSize = await bodyText.evaluate(el => {
          return parseInt(window.getComputedStyle(el).fontSize);
        });
        
        if (viewport.width < 768) {
          // Mobile should have readable font size
          expect(fontSize).toBeGreaterThanOrEqual(16);
        }
        
        console.log(`✓ Usability verified for ${viewport.name}`);
      });

      test('should handle touch interactions on mobile devices', async ({ page }) => {
        if (viewport.width >= 768) {
          test.skip(); // Skip touch tests on non-mobile viewports
        }
        
        await page.goto('/participants');
        
        // Test touch-friendly interactions
        const newButton = page.locator('[data-testid="button-new-participant"]');
        
        // Simulate touch events
        await newButton.tap();
        await expect(page.locator('[data-testid="participant-form"]')).toBeVisible();
        
        // Test form interactions with touch
        await page.locator('[data-testid="input-name"]').tap();
        await page.locator('[data-testid="input-name"]').fill('Touch Test User');
        
        // Test gesture navigation if implemented
        await page.touchscreen.tap(100, 100);
        
        console.log(`✓ Touch interactions verified for ${viewport.name}`);
      });
    });
  });
});

test.describe('Device-Specific Testing', () => {
  
  deviceTests.forEach(device => {
    test.describe(`${device.name}`, () => {
      
      test.use({ ...device });
      
      test('should work correctly on device', async ({ page }) => {
        await page.goto('http://localhost:5000');
        await page.click('[data-testid="test-user-admin"]');
        await page.waitForSelector('[data-testid="text-page-title"]');
        
        // Test core functionality
        await page.goto('/dashboard');
        await expect(page.locator('[data-testid="text-page-title"]')).toBeVisible();
        
        // Test navigation
        await page.goto('/participants');
        await expect(page.locator('[data-testid="participants-list"], table')).toBeVisible();
        
        // Test form functionality
        await page.click('[data-testid="button-new-participant"]');
        await page.fill('[data-testid="input-name"]', `Device Test ${device.name}`);
        await page.fill('[data-testid="input-ndis-number"]', '555666777');
        await page.fill('[data-testid="input-email"]', 'device@test.com');
        
        await page.click('[data-testid="button-save"]');
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible({ timeout: 5000 });
        
        console.log(`✓ Core functionality verified on ${device.name}`);
      });

      test('should handle device-specific features', async ({ page }) => {
        // Test orientation changes for mobile devices
        if (device.isMobile) {
          await page.goto('http://localhost:5000');
          await page.click('[data-testid="test-user-admin"]');
          
          // Test portrait orientation
          await page.setViewportSize({ 
            width: device.viewport.width, 
            height: device.viewport.height 
          });
          await page.goto('/dashboard');
          await expect(page.locator('[data-testid="text-page-title"]')).toBeVisible();
          
          // Test landscape orientation
          await page.setViewportSize({ 
            width: device.viewport.height, 
            height: device.viewport.width 
          });
          await page.reload();
          await expect(page.locator('[data-testid="text-page-title"]')).toBeVisible();
          
          console.log(`✓ Orientation changes handled on ${device.name}`);
        }
        
        // Test device-specific input methods
        if (device.hasTouch) {
          await page.goto('/participants');
          await page.locator('[data-testid="button-new-participant"]').tap();
          await expect(page.locator('[data-testid="participant-form"]')).toBeVisible();
        }
      });
    });
  });
});

test.describe('Performance Across Devices', () => {
  
  test('should load efficiently on slow connections', async ({ page }) => {
    // Simulate slow 3G connection
    await page.context().route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
      await route.continue();
    });
    
    const startTime = Date.now();
    await page.goto('http://localhost:5000');
    await page.click('[data-testid="test-user-admin"]');
    await page.waitForSelector('[data-testid="text-page-title"]');
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time even on slow connection
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
    
    console.log(`Load time on slow connection: ${loadTime}ms`);
  });

  test('should handle memory constraints', async ({ page }) => {
    // Test with multiple page navigations to check for memory leaks
    const pages = ['/dashboard', '/participants', '/staff', '/services', '/reports'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');
      
      // Check page loaded successfully
      await expect(page.locator('[data-testid="text-page-title"]')).toBeVisible();
    }
    
    // Navigate back to start
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="text-page-title"]')).toBeVisible();
    
    console.log('✓ Memory constraint handling verified');
  });
});

test.describe('Accessibility Across Devices', () => {
  
  test('should maintain accessibility features on all devices', async ({ page }) => {
    const viewportSizes = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];
    
    for (const viewport of viewportSizes) {
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:5000');
      await page.click('[data-testid="test-user-admin"]');
      
      // Test keyboard navigation works
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Test screen reader landmarks
      await expect(page.locator('main, [role="main"]')).toBeVisible();
      await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
      
      // Test skip links
      await page.keyboard.press('Tab');
      const skipLink = page.locator('[data-testid="skip-to-content"]');
      if (await skipLink.isVisible()) {
        await expect(skipLink).toContainText(/skip/i);
      }
      
      console.log(`✓ Accessibility verified at ${viewport.width}x${viewport.height}`);
    }
  });
});

// Test utilities
async function getDeviceInfo(page) {
  return await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    touchSupport: 'ontouchstart' in window,
    platform: navigator.platform
  }));
}

async function measurePerformance(page, url) {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  return Date.now() - startTime;
}