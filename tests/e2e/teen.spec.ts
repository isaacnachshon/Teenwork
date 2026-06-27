import { test, expect } from '@playwright/test';

test.describe('Teen Persona', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // --- Navigation ---

    test('landing page has teen login button in header', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'כניסה', exact: true })).toBeVisible();
    });

    test('clicking "כניסה" navigates to teen login page', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'כניסה' })).toBeVisible();
    });

    test('clicking hero CTA "מצא עבודה קרוב אלי" navigates to teen login', async ({ page }) => {
        await page.getByRole('button', { name: /מצא עבודה קרוב אלי/ }).first().click();
        await expect(page.getByRole('heading', { name: 'כניסה' })).toBeVisible();
    });

    // --- Teen Login Form ---

    test('teen login page shows email and password fields', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
    });

    test('teen login page shows "התחברות" submit button', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await expect(page.getByRole('button', { name: 'התחברות', exact: true })).toBeVisible();
    });

    test('teen login page shows Google login button', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await expect(page.getByRole('button', { name: /התחברות עם גוגל/ })).toBeVisible();
    });

    test('teen login page shows "שכחת סיסמה?" link', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await expect(page.getByRole('button', { name: 'שכחת סיסמה?' })).toBeVisible();
    });

    // --- Teen Signup Form ---

    test('teen login page has toggle to switch to signup mode', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        // Toggle button shows "הרשם כאן" when in login mode
        await expect(page.getByRole('button', { name: 'הרשם כאן' })).toBeVisible();
    });

    test('teen signup form shows name, email, password, confirm-password fields', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await page.getByRole('button', { name: 'הרשם כאן' }).click();
        await expect(page.getByRole('heading', { name: 'הרשמה' })).toBeVisible();
        await expect(page.locator('#fullName')).toBeVisible();
        await expect(page.locator('#email-signup')).toBeVisible();
        await expect(page.locator('#password-signup')).toBeVisible();
        await expect(page.locator('#confirmPassword')).toBeVisible();
    });

    test('teen signup shows error when passwords do not match', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await page.getByRole('button', { name: 'הרשם כאן' }).click();

        await page.locator('#fullName').fill('Test Teen');
        await page.locator('#email-signup').fill('test@example.com');
        await page.locator('#password-signup').fill('password123');
        await page.locator('#confirmPassword').fill('differentpassword');
        await page.getByRole('button', { name: 'הרשמה', exact: true }).click();

        await expect(page.getByRole('alert')).toContainText('הסיסמאות אינן תואמות');
    });

    test('teen signup shows error when required fields are empty', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await page.getByRole('button', { name: 'הרשם כאן' }).click();

        // Fill email and matching passwords but leave name empty
        await page.evaluate(() => {
            const fullNameInput = document.querySelector('#fullName') as HTMLInputElement;
            if (fullNameInput) fullNameInput.removeAttribute('required');
        });
        await page.locator('#email-signup').fill('test@example.com');
        await page.locator('#password-signup').fill('pass123');
        await page.locator('#confirmPassword').fill('pass123');
        await page.getByRole('button', { name: 'הרשמה', exact: true }).click();

        await expect(page.getByRole('alert')).toContainText('נא למלא את כל השדות');
    });

    // --- Forgot Password ---

    test('forgot password view is shown after clicking "שכחת סיסמה?"', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await page.getByRole('button', { name: 'שכחת סיסמה?' }).click();
        await expect(page.getByText('הזן את כתובת האימייל שלך')).toBeVisible();
        await expect(page.locator('#reset-email')).toBeVisible();
    });

    test('forgot password back button returns to login form', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await page.getByRole('button', { name: 'שכחת סיסמה?' }).click();
        await page.getByRole('button', { name: 'חזרה להתחברות' }).click();
        await expect(page.getByRole('heading', { name: 'כניסה' })).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
    });

    test('forgot password shows error when email is empty', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await page.getByRole('button', { name: 'שכחת סיסמה?' }).click();

        await page.evaluate(() => {
            const emailInput = document.querySelector('#reset-email') as HTMLInputElement;
            if (emailInput) emailInput.removeAttribute('required');
        });
        await page.getByRole('button', { name: 'שלח קישור לאיפוס' }).click();

        await expect(page.getByRole('alert')).toContainText('נא להזין כתובת אימייל');
    });

    // --- Login with invalid credentials ---

    test('teen login shows error for invalid credentials', async ({ page }) => {
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await page.locator('#email').fill('notexist@test.com');
        await page.locator('#password').fill('wrongpassword123');
        await page.getByRole('button', { name: 'התחברות', exact: true }).click();

        await expect(page.getByRole('alert')).toContainText('אימייל או סיסמה שגויים', { timeout: 15000 });
    });
});
