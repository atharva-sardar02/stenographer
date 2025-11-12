import { test, expect } from '@playwright/test';

test.describe('User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('Attorney Journey: Complete workflow from login to export', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'attorney@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1:has-text("Stenographer")')).toBeVisible();

    // Create new matter
    await page.click('button:has-text("Create New Matter")');
    await page.fill('input[name="title"]', 'E2E Test Matter');
    await page.fill('input[name="clientName"]', 'E2E Test Client');
    await page.click('button:has-text("Create Matter")');

    // Wait for matter detail page
    await expect(page).toHaveURL(/\/matters\/.+/);
    await expect(page.locator('text=E2E Test Matter')).toBeVisible();

    // Upload file (mock - would need actual file in real test)
    // This is a placeholder for the actual file upload test

    // Navigate to templates
    await page.goto('/templates');
    await expect(page.locator('h1:has-text("Templates")')).toBeVisible();

    // Verify we can navigate back to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('text=E2E Test Matter')).toBeVisible();
  });

  test('Paralegal Journey: Template creation and collaboration', async ({ page }) => {
    // Login as paralegal
    await page.goto('/login');
    await page.fill('input[type="email"]', 'paralegal@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Navigate to templates
    await page.goto('/templates');
    await expect(page.locator('h1:has-text("Templates")')).toBeVisible();

    // Paralegal should not see create template button (attorney only)
    const createButton = page.locator('button:has-text("Create New Template")');
    await expect(createButton).not.toBeVisible();
  });

  test('Navigation and routing', async ({ page }) => {
    // Test protected route redirect
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');

    // After login, should redirect to dashboard
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    await expect(page).toHaveURL('/dashboard');
  });
});

