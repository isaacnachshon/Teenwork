# Security Hardening — Design Spec
**Date:** 2026-06-27  
**Scope:** Option B — Full security hardening  
**Estimated effort:** ~8 hours  
**Status:** Approved

---

## Problem

The TeenWork app has four known security gaps:

1. No Firestore Security Rules — any authenticated user can read/write any document
2. No Storage Security Rules — any authenticated user can upload any file to any path
3. Hardcoded admin email in `App.tsx` — admin access tied to a specific email address instead of Firestore role
4. Memory leak in `EmailVerificationPage` — polling interval never cleared on unmount

---

## Solution Overview

Four targeted fixes, no new features, no refactoring beyond what is required.

---

## Part 1 — Firestore Security Rules

**File:** `firestore.rules`

### Global
- All operations require `request.auth != null` (no anonymous access)
- Helper function `isAdmin()` checks `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'`

### Collection: `users/{uid}`
| Operation | Allowed |
|-----------|---------|
| read | Any authenticated user (employers need to browse teen profiles for location-based discovery) |
| create | Own document only (`request.auth.uid == uid`) |
| update | Own document only, or admin |
| delete | Admin only |

### Collection: `jobs/{jobId}`
| Operation | Allowed |
|-----------|---------|
| read | Any authenticated user |
| create | Authenticated employer — `request.resource.data.employerId == request.auth.uid` |
| update | Owner only (`resource.data.employerId == request.auth.uid`), or admin |
| delete | Owner only, or admin |

### Collection: `applications/{appId}`
| Operation | Allowed |
|-----------|---------|
| read | Applicant (`resource.data.applicantId == request.auth.uid`) or employer of that job (`resource.data.employerId == request.auth.uid`) or admin |
| create | Authenticated user where `request.resource.data.applicantId == request.auth.uid` |
| update | Employer of that application (`resource.data.employerId == request.auth.uid`) or admin — status changes only |
| delete | Admin only |

---

## Part 2 — Storage Security Rules

**File:** `storage.rules`

### Global
- All operations require `request.auth != null`

### `profileImages/teens/{uid}`
| Rule | Value |
|------|-------|
| read | Any authenticated user |
| write | Owner only (`request.auth.uid == uid`) |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Max size | 5MB (`request.resource.size <= 5 * 1024 * 1024`) |

### `companyLogos/{uid}`
| Rule | Value |
|------|-------|
| read | Any authenticated user |
| write | Owner only (`request.auth.uid == uid`) |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Max size | 5MB |

### `parental_consents/{filename}`
| Rule | Value |
|------|-------|
| read | Owner only — matched via `request.auth.uid` embedded in filename |
| write | Any authenticated user |
| Allowed MIME types | `application/pdf`, `image/jpeg`, `image/png` |
| Max size | 5MB |

> **Note on parental consent read access:** The current filename uses `{timestamp}_{filename}` which does not embed the UID. The implementation must either rename the path to `parental_consents/{uid}/{filename}` to enable owner-only reads, or keep the current path and allow any authenticated user to read (less ideal). Recommended: change path to `parental_consents/{uid}/{filename}`.

---

## Part 3 — Remove Hardcoded Admin Email

**File:** `App.tsx`

Search for any string literal matching `isaacnachshon@gmail.com` or any email-based admin check. Remove it entirely.

Admin role is already determined by `users/{uid}.role === 'admin'` via the `onSnapshot` listener — this is the correct single source of truth. No replacement logic needed.

**Verification:** After removal, confirm the admin login flow still works by checking `role === 'admin'` from Firestore (not email).

---

## Part 4 — Fix Memory Leak in EmailVerificationPage

**File:** `components/EmailVerificationPage.tsx`

The component polls Firebase Auth (`user.reload()`) on an interval to detect when the teen verifies their email. The interval is started in `useEffect` but the cleanup function does not call `clearInterval`.

**Fix:**
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    // existing polling logic
  }, 3000);
  
  return () => clearInterval(interval); // ADD THIS
}, []);
```

This is a one-line addition. No other logic changes.

---

## What Is NOT in Scope

- Cloud Functions for server-side file validation (Phase 3)
- URL routing changes
- Demo data replacement
- Any new features

---

## Deployment Steps

After implementation:
1. `firebase deploy --only firestore:rules` — deploy Firestore rules
2. `firebase deploy --only storage` — deploy Storage rules
3. `npm run build && firebase deploy --only hosting` — deploy app with admin email fix + memory leak fix
4. Manually test admin login still works
5. Manually test teen signup + file upload still works

---

## Success Criteria

- [ ] Unauthenticated requests to Firestore are rejected
- [ ] A teen cannot read/write another teen's applications
- [ ] An employer cannot modify a job they don't own
- [ ] Storage rejects files over 5MB
- [ ] Storage rejects non-image files for profile photos
- [ ] Storage rejects non-PDF/image files for consent forms
- [ ] Admin login works via Firestore role check (not email)
- [ ] No polling interval fires after EmailVerificationPage unmounts
