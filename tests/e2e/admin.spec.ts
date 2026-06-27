import { test, expect } from '@playwright/test';

test.describe('Admin Persona', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // --- Navigation ---

    test('landing page footer has "כניסת מנהלים" admin login button', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'כניסת מנהלים' })).toBeVisible();
    });

    test('clicking "כניסת מנהלים" navigates to admin login page', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסת מנהלים' }).click();
        await expect(page.getByRole('heading', { name: 'כניסת מנהלים' })).toBeVisible();
    });

    // --- Admin Login Form ---

    test('admin login page shows email and password fields', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסת מנהלים' }).click();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
    });

    test('admin login page shows "התחברות" submit button', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסת מנהלים' }).click();
        // Use exact: true to avoid matching "התחברות עם גוגל"
        await expect(page.getByRole('button', { name: 'התחברות', exact: true })).toBeVisible();
    });

    test('admin login page shows Google login button', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסת מנהלים' }).click();
        await expect(page.getByRole('button', { name: /התחברות עם גוגל/ })).toBeVisible();
    });

    test('admin login page shows subtitle "נא להזין את פרטי ההתחברות"', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסת מנהלים' }).click();
        await expect(page.getByText('נא להזין את פרטי ההתחברות')).toBeVisible();
    });

    // --- Admin Login Validation ---

    test('admin login shows error for invalid credentials', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסת מנהלים' }).click();
        await page.locator('#email').fill('notadmin@test.com');
        await page.locator('#password').fill('wrongpassword123');
        await page.getByRole('button', { name: 'התחברות', exact: true }).click();

        await expect(page.getByRole('alert')).toContainText('אימייל או סיסמה שגויים', { timeout: 15000 });
    });

    test('admin login fields are required', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסת מנהלים' }).click();
        await expect(page.locator('#email')).toHaveAttribute('required');
        await expect(page.locator('#password')).toHaveAttribute('required');
    });

    test('admin login email field has type email', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסת מנהלים' }).click();
        await expect(page.locator('#email')).toHaveAttribute('type', 'email');
    });

    test('admin login password field has type password', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסת מנהלים' }).click();
        await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    });

    test('admin login Google button is enabled and clickable', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסת מנהלים' }).click();
        const googleBtn = page.getByRole('button', { name: /התחברות עם גוגל/ });
        await expect(googleBtn).toBeEnabled();
        await expect(googleBtn).not.toHaveAttribute('disabled');
    });
});
