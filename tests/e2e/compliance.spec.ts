import { test, expect } from '@playwright/test';

// Public-page compliance checks (no Firebase auth needed) — QA round-2 "must-fix" items.

test.describe('Public compliance surface', () => {
    test('landing page has no fabricated numbers, logos or testimonials', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('img[src*="logoipsum"]')).toHaveCount(0);
        await expect(page.locator('img[src*="picsum"]')).toHaveCount(0);
        await expect(page.getByText('143 נרשמו')).toHaveCount(0);
        await expect(page.getByText('47 משרות')).toHaveCount(0);
        await expect(page.locator('a[href="#testimonials"]')).toHaveCount(0);
        await expect(page.getByText('בהתאם לחוק עבודת הנוער').first()).toBeVisible();
    });

    test('rights center opens from the landing nav with the 04/2026 minimum-wage table', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'זכויות נוער', exact: true }).first().click();
        const dialog = page.getByRole('dialog', { name: 'מרכז זכויות עובדים לבני נוער' });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByText('26.07 ₪')).toBeVisible();
        await expect(dialog.getByText('27.94 ₪')).toBeVisible();
        await expect(dialog.getByText('30.92 ₪')).toBeVisible();
        await expect(dialog.getByText('04/2026')).toBeVisible();
        await expect(dialog.getByText('מי רשאי לעבוד?')).toBeVisible();
        await expect(dialog.getByText('אסור להעסיק נוער בשעות נוספות.')).toBeVisible();
    });

    test('rights center deep link ?rights=1 opens the modal directly', async ({ page }) => {
        await page.goto('/?rights=1');
        await expect(page.getByRole('dialog', { name: 'מרכז זכויות עובדים לבני נוער' })).toBeVisible();
    });

    test('privacy page is the full policy with minors section and back links', async ({ page }) => {
        await page.goto('/privacy.html');
        await expect(page.getByRole('heading', { name: /קטינים והסכמת הורים/ })).toBeVisible();
        await expect(page.getByRole('heading', { name: /מה נחשף למעסיקים/ })).toBeVisible();
        await expect(page.getByRole('link', { name: /חזרה ל־TEENWORK/ }).first()).toHaveAttribute('href', '/');
        await expect(page.getByText('גרסה 2')).toBeVisible();
    });
});

test.describe('Teen signup age gate', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'כניסה', exact: true }).click();
        await page.getByRole('button', { name: 'הרשם כאן' }).click();
    });

    test('date-of-birth field is bounded to 14–18 years and terms checkbox is required', async ({ page }) => {
        const dob = page.locator('#birthDate');
        await expect(dob).toBeVisible();
        const max = await dob.getAttribute('max');
        const min = await dob.getAttribute('min');
        expect(max).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(min).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const yearsAgo = (y: number) => new Date().getFullYear() - y;
        expect(Number(max!.slice(0, 4))).toBe(yearsAgo(14));
        expect(Number(min!.slice(0, 4))).toBeGreaterThanOrEqual(yearsAgo(19));
        await expect(page.locator('input[type="checkbox"][required]')).toHaveCount(1);
        await expect(page.getByText('פרטי הורה / אפוטרופוס (חובה)')).toBeVisible();
    });

    test('a 13-year-old is rejected with the youth-age error', async ({ page }) => {
        const thirteen = new Date();
        thirteen.setFullYear(thirteen.getFullYear() - 13);
        const iso = thirteen.toISOString().slice(0, 10);
        // Remove browser-level bounds so the app-level validation is what gets exercised.
        await page.evaluate(() => {
            const el = document.querySelector('#birthDate') as HTMLInputElement | null;
            el?.removeAttribute('min'); el?.removeAttribute('max');
            document.querySelectorAll('input[required]').forEach(i => i.removeAttribute('required'));
        });
        await page.locator('#fullName').fill('נער בדיקה');
        await page.locator('#birthDate').fill(iso);
        await page.locator('#email-signup').fill('qa-teen13@example.com');
        await page.locator('#password-signup').fill('password123');
        await page.locator('#confirmPassword').fill('password123');
        await page.getByRole('button', { name: 'הרשמה', exact: true }).click();
        await expect(page.getByRole('alert')).toContainText('הפלטפורמה מיועדת לגילאי 14–18 בלבד');
    });
});
