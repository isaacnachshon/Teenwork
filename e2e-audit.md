# E2E Audit & Auth/Navigation Audit for TeenWork

Date: 2025-11-20

Summary
- No end-to-end (E2E) tests found in the repository (`package.json` has only `dev`, `build`, `preview`).
- I inspected the Firebase config, auth initialization, login/signup components (`LoginPage.tsx`, `EmployerLoginPage.tsx`, `TeenLoginPage.tsx`) and the app-level auth routing in `App.tsx`.

Findings (high-priority)
- No automated E2E tests present. Recommend adding Playwright or Cypress tests.
- `LoginPage.tsx` contains a hardcoded admin email (`isaacnachshon@gmail.com`) used to gate admin access. This is insecure and brittle; use Firestore role checks instead.
- OAuth (Google) uses `signInWithPopup` — ensure the site domain is listed in Firebase Console (authorized domains) and that popup behavior is acceptable for your environment.
- `App.tsx` attempts to `deleteUser(user)` when a teen doesn't verify email within 24 hours. `deleteUser` often requires recent authentication and will throw; the code catches and signs out — this is fine but consider a server-side cleanup job instead (Cloud Function or scheduled script) to avoid lifecycle issues.
- Firebase config `storageBucket` value looks unusual (`teenwork-4c9de.firebasestorage.app`) — typical value is `PROJECT_ID.appspot.com` or `...appspot.com`. Verify in Firebase console.
- `initializeAuth` explicitly sets `popupRedirectResolver` and `browserLocalPersistence` — this is fine for popup flows but confirm redirect/resolver behavior if you want redirect-based OAuth.

Findings (medium/low-priority)
- Error messages are localized in Hebrew — good for UX; ensure consistency across the app.
- Some operations (e.g., creating Firestore docs after `createUserWithEmailAndPassword`) do not have retries. Consider small robustification (catch + cleanup on partial failure).

Reproduction steps (manual)
1. Run the dev server:

```powershell
npm install
npm run dev
```

2. Open http://localhost:5173 (Vite default) and exercise flows:
- Landing -> `מנהלים` -> try admin login form using the admin email (if you have the password) or change to using a non-admin email to confirm rejection.
- Landing -> `מעסיקים` -> try Employer signup (with logo upload) and login, and Google sign-in.
- Landing -> `נוער` -> try Teen signup, check email verification (this requires real email delivery), and login behavior when unverified.

Automated E2E testing recommendations
- Use Playwright (recommended) or Cypress for E2E tests. Playwright supports multiple browsers and is easy to set up for CI.
- Tests to add:
  - Admin login flow (mock or use a test admin account).
  - Employer signup -> Firestore doc created -> login -> upload/serving of company logo.
  - Teen signup -> verify email flow (for E2E, simulate verification by toggling `emailVerified` on a test user in Firestore emulator or via admin SDK in test setup).
  - Google OAuth flow should be mocked (or use a test OAuth client + test account) because real Google popups are flaky in CI.
  - Navigation tests: landing -> each role button, verify correct page and visible links.

Sample Playwright test skeleton (tests/auth.spec.ts)
```ts
import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test('Landing links navigate to login pages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'מנהלים' }).click();
    await expect(page.getByRole('heading', { name: /כניסת מנהלים|הרשמת מנהלים/ })).toBeVisible();
  });

  // NOTE: For signup/login with Firebase, use the Firebase emulator or mock the network.
});
```

Implementation notes & recommended code fixes
- Replace hardcoded admin email logic with a Firestore role check (already done for other users). Example in `App.tsx`:
  - Instead of `if (user.email === '...') { role = 'admin' }`, fetch `users/{uid}` and use `role: 'admin'` there; or maintain an `admins` list in Firestore or Firebase Authentication custom claims.
- Email verification cleanup:
  - Move deletion/expiration logic out of client (where `deleteUser` may require recent login) and into a server-side scheduled task (Cloud Function cron or an admin script) that removes unverified users older than 24 hours.
- Improve error handling on signup flows to rollback partially created state (e.g., if upload succeeds but Firestore write fails, attempt to remove the uploaded file).
- Add informative UI states when OAuth fails due to `unauthorized-domain` and guide the owner to add the domain in Firebase Console.

Next steps I can take for you
- Add a basic Playwright setup and a few smoke tests that verify navigation and the main auth flows (using the Firebase emulator or mocks). This will include:
  - `package.json` scripts: `test:e2e`, `test:e2e:headed`.
  - `playwright.config.ts` and one or two test files.
- Implement the suggested code improvements (non-breaking) like removing hardcoded admin email and replacing it with a Firestore role lookup.

Would you like me to:
- (A) Scaffold Playwright with a couple of smoke tests (fast, recommended), or
- (B) Implement the code changes to remove the hardcoded admin and add safer delete/cleanup handling, or
- (C) Both (I'll scaffold tests and make the small code change)?

If you pick (A) or (C), tell me whether you want tests to run against the real Firebase project (not recommended for CI) or the Firebase Local Emulator (recommended). I can proceed to scaffold now.

Diagnostics added
- The app now exposes Firebase initialization errors at runtime. If Firebase fails to initialize in the deployed environment, the app shows a diagnostic screen with the captured error message (see `App.tsx`) and logs details to the console. This helps identify why the front page may remain stuck on the loading screen.
