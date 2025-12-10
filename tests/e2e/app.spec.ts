import { test, expect } from '@playwright/test';

test.describe('Music Metadata Engine E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto('http://localhost:5173');
    });

    test('should load the homepage with welcome message', async ({ page }) => {
        // Check if the welcome message is visible
        await expect(page.locator('text=Welcome, Creator')).toBeVisible();

        // Verify the app title in footer
        await expect(page.locator('text=Music Metadata Engine')).toBeVisible();
    });

    test('should display the New Analysis button and navigate to upload', async ({ page }) => {
        // Check if the "New Analysis" button is present
        const newAnalysisButton = page.locator('button:has-text("New Analysis")');
        await expect(newAnalysisButton).toBeVisible();

        // Click the button
        await newAnalysisButton.click();

        // Wait for file input to appear in the DOM (explicit wait instead of timeout)
        const fileInput = page.locator('input[type="file"]');
        await expect(fileInput).toHaveCount(1, { timeout: 5000 });
    });

    test('should display Metadata Analyzer quick tool', async ({ page }) => {
        // Check if the Metadata Analyzer card is visible
        await expect(page.locator('text=Metadata Analyzer')).toBeVisible();

        // Check if the Open button is visible
        await expect(page.locator('button:has-text("Open")')).toBeVisible();
    });
});
