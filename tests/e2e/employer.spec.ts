import { test, expect } from '@playwright/test';

// Helper: navigate to employer login from landing page
async function goToEmployerLogin(page: any) {
    await page.getByRole('button', { name: 'פרסם משרה', exact: true }).click();
}

test.describe('Employer Persona', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // --- Navigation ---

    test('landing page has employer CTA button in header', async ({ page }) => {
        // exact: true avoids matching "אני מעסיק — פרסם משרה חינם" in hero section
        await expect(page.getByRole('button', { name: 'פרסם משרה', exact: true })).toBeVisible();
    });

    test('clicking "פרסם משרה" navigates to employer login page', async ({ page }) => {
        await goToEmployerLogin(page);
        await expect(page.getByRole('heading', { name: 'כניסת מעסיקים' })).toBeVisible();
    });

    test('clicking hero CTA "אני מעסיק" navigates to employer login', async ({ page }) => {
        await page.getByRole('button', { name: /אני מעסיק/ }).click();
        await expect(page.getByRole('heading', { name: 'כניסת מעסיקים' })).toBeVisible();
    });

    // --- Employer Login Form ---

    test('employer login page shows email and password fields', async ({ page }) => {
        await goToEmployerLogin(page);
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
    });

    test('employer login page shows "התחברות" submit button', async ({ page }) => {
        await goToEmployerLogin(page);
        await expect(page.getByRole('button', { name: 'התחברות', exact: true })).toBeVisible();
    });

    test('employer login page shows Google login button', async ({ page }) => {
        await goToEmployerLogin(page);
        await expect(page.getByRole('button', { name: /התחברות עם גוגל/ })).toBeVisible();
    });

    test('employer login page shows "שכחת סיסמה?" link', async ({ page }) => {
        await goToEmployerLogin(page);
        await expect(page.getByRole('button', { name: 'שכחת סיסמה?' })).toBeVisible();
    });

    // --- Employer Signup Form ---

    test('employer login page has toggle to switch to signup mode', async ({ page }) => {
        await goToEmployerLogin(page);
        // Toggle shows "הרשם כאן" when in login mode
        await expect(page.getByRole('button', { name: 'הרשם כאן' })).toBeVisible();
    });

    test('employer signup form shows company name, email, password, confirm-password fields', async ({ page }) => {
        await goToEmployerLogin(page);
        await page.getByRole('button', { name: 'הרשם כאן' }).click();
        await expect(page.getByRole('heading', { name: 'הרשמת מעסיקים' })).toBeVisible();
        await expect(page.locator('#companyName')).toBeVisible();
        await expect(page.locator('#email-signup')).toBeVisible();
        await expect(page.locator('#password-signup')).toBeVisible();
        await expect(page.locator('#confirmPassword')).toBeVisible();
    });

    test('employer signup shows error when passwords do not match', async ({ page }) => {
        await goToEmployerLogin(page);
        await page.getByRole('button', { name: 'הרשם כאן' }).click();

        await page.locator('#companyName').fill('Test Company Ltd');
        await page.locator('#email-signup').fill('employer@test.com');
        await page.locator('#password-signup').fill('password123');
        await page.locator('#confirmPassword').fill('differentpassword');
        await page.getByRole('button', { name: 'הרשמה', exact: true }).click();

        await expect(page.getByRole('alert')).toContainText('הסיסמאות אינן תואמות');
    });

    test('employer signup shows error when company name is empty', async ({ page }) => {
        await goToEmployerLogin(page);
        await page.getByRole('button', { name: 'הרשם כאן' }).click();

        // Bypass HTML5 required on company name
        await page.evaluate(() => {
            const nameInput = document.querySelector('#companyName') as HTMLInputElement;
            if (nameInput) nameInput.removeAttribute('required');
        });
        await page.locator('#email-signup').fill('employer@test.com');
        await page.locator('#password-signup').fill('pass123');
        await page.locator('#confirmPassword').fill('pass123');
        await page.getByRole('button', { name: 'הרשמה', exact: true }).click();

        await expect(page.getByRole('alert')).toContainText('נא למלא את כל השדות');
    });

    // --- Forgot Password ---

    test('forgot password view is shown after clicking "שכחת סיסמה?"', async ({ page }) => {
        await goToEmployerLogin(page);
        await page.getByRole('button', { name: 'שכחת סיסמה?' }).click();
        await expect(page.getByText('הזן את כתובת האימייל שלך')).toBeVisible();
        await expect(page.locator('#reset-email')).toBeVisible();
        await expect(page.getByRole('button', { name: 'שלח קישור לאיפוס' })).toBeVisible();
    });

    test('forgot password back button returns to employer login', async ({ page }) => {
        await goToEmployerLogin(page);
        await page.getByRole('button', { name: 'שכחת סיסמה?' }).click();
        await page.getByRole('button', { name: 'חזרה להתחברות' }).click();
        await expect(page.getByRole('heading', { name: 'כניסת מעסיקים' })).toBeVisible();
    });

    test('forgot password shows error when email is empty', async ({ page }) => {
        await goToEmployerLogin(page);
        await page.getByRole('button', { name: 'שכחת סיסמה?' }).click();

        await page.evaluate(() => {
            const emailInput = document.querySelector('#reset-email') as HTMLInputElement;
            if (emailInput) emailInput.removeAttribute('required');
        });
        await page.getByRole('button', { name: 'שלח קישור לאיפוס' }).click();

        await expect(page.getByRole('alert')).toContainText('נא להזין כתובת אימייל');
    });

    // --- Login with invalid credentials ---

    test('employer login shows error for invalid credentials', async ({ page }) => {
        await goToEmployerLogin(page);
        await page.locator('#email').fill('notexist@company.com');
        await page.locator('#password').fill('wrongpassword123');
        await page.getByRole('button', { name: 'התחברות', exact: true }).click();

        await expect(page.getByRole('alert')).toContainText('אימייל או סיסמה שגויים', { timeout: 15000 });
    });
});
