import { test, expect } from '@playwright/test';

test.describe('TeenWork Comprehensive E2E', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Navigation and Role Switching', async ({ page }) => {
        // From landing page, click "כניסה" -> teen login page
        const loginButton = page.getByRole('button', { name: 'כניסה' });
        await expect(loginButton).toBeVisible();
        await loginButton.click();
        // Teen login page should be visible
        await expect(page.getByRole('button', { name: /נוער/i })).toBeVisible();

        // Click "פרסם משרה" (on landing/header) -> employer login
        // After first click, we may be on teen login - go back to landing first
        await page.goto('/');
        const publishJobButton = page.getByRole('button', { name: 'פרסם משרה' });
        await expect(publishJobButton).toBeVisible();
        await publishJobButton.click();
        // Employer login page should be visible
        await expect(page.getByText('כניסת מעסיקים').or(page.getByText('הרשמת מעסיקים'))).toBeVisible();
    });

    test('Landing Page Elements', async ({ page }) => {
        // TEENWORK appears in multiple places; use .first() to avoid strict mode violation
        await expect(page.getByText('TEENWORK').first()).toBeVisible();
        await expect(page.getByText('העבודה הראשונה שלך')).toBeVisible();

        // Check Footer Admin Link (in LandingPage)
        const footerAdminLink = page.getByRole('button', { name: /כניסת מנהלים/i });
        await expect(footerAdminLink).toBeVisible();
    });

});
