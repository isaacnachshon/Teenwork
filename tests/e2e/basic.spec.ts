import { test, expect } from '@playwright/test';

test('homepage has title and basic elements', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring (case-insensitive).
    await expect(page).toHaveTitle(/TeenWork/i);

    // Check for main heading
    await expect(page.locator('h1').first()).toBeVisible();

    // Check for landing page content (TEENWORK appears multiple times; use .first())
    await expect(page.getByText('TEENWORK').first()).toBeVisible();
});
