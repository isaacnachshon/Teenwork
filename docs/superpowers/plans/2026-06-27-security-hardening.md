# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all known security gaps in TeenWork — fix Firestore rules, create Storage rules, and remove the hardcoded admin UID.

**Architecture:** Three targeted file changes with no app code changes. Firestore rules replace a hardcoded UID check with a role-based Firestore lookup. Storage rules are created from scratch and wired into firebase.json. Both rule sets are deployed independently of the hosting build.

**Tech Stack:** Firebase Security Rules (Firestore + Storage), Firebase CLI (`firebase deploy`)

## Global Constraints

- Do NOT change any React/TypeScript application code
- Do NOT change firebase.json hosting or functions sections
- All rules require `request.auth != null` — no anonymous access
- Deploy rules independently of the app (`--only firestore:rules` / `--only storage`)
- Working directory for all commands: `C:\Users\orina\TeenWork\teenwork`

---

### Task 1: Fix Firestore Security Rules

**Files:**
- Modify: `firestore.rules`

**Problem with current rules:**
- `isAdmin()` checks a hardcoded UID string instead of the user's Firestore role
- `users` collection: read restricted to own doc only — employers cannot read teen profiles for location-based discovery
- `jobs` create: no validation that `request.resource.data.employerId == request.auth.uid`
- `applications` create: no validation that `request.resource.data.applicantId == request.auth.uid`
- `messages` / `notifications`: fully open to any logged-in user

**New rules:**

- [ ] **Step 1: Replace `firestore.rules` with the following content**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isLoggedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isLoggedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Any authenticated user can read any profile.
    // Employers need to read teen profiles for location-based job discovery.
    match /users/{userId} {
      allow read: if isLoggedIn();
      allow create: if isLoggedIn() && request.auth.uid == userId;
      allow update: if isAdmin() || (isLoggedIn() && request.auth.uid == userId);
      allow delete: if isAdmin();
    }

    match /jobs/{jobId} {
      allow read: if isLoggedIn();
      allow create: if isLoggedIn() &&
        request.resource.data.employerId == request.auth.uid;
      allow update: if isAdmin() ||
        (isLoggedIn() && resource.data.employerId == request.auth.uid);
      allow delete: if isAdmin() ||
        (isLoggedIn() && resource.data.employerId == request.auth.uid);
    }

    match /applications/{appId} {
      allow read: if isAdmin()
        || (isLoggedIn() && resource.data.applicantId == request.auth.uid)
        || (isLoggedIn() && resource.data.employerId == request.auth.uid);
      allow create: if isLoggedIn() &&
        request.resource.data.applicantId == request.auth.uid;
      allow update: if isAdmin() ||
        (isLoggedIn() && resource.data.employerId == request.auth.uid);
      allow delete: if isAdmin();
    }

    match /messages/{msgId} {
      allow read, write: if isLoggedIn() &&
        (resource == null || resource.data.senderId == request.auth.uid ||
         resource.data.recipientId == request.auth.uid);
    }

    match /notifications/{notifId} {
      allow read: if isLoggedIn() &&
        resource.data.userId == request.auth.uid;
      allow create: if isLoggedIn();
      allow update, delete: if isAdmin() ||
        (isLoggedIn() && resource.data.userId == request.auth.uid);
    }
  }
}
```

- [ ] **Step 2: Deploy Firestore rules**

```
firebase deploy --only firestore:rules
```

Expected output:
```
✔  firestore: released rules firestore.rules to cloud.firestore
+ Deploy complete!
```

- [ ] **Step 3: Verify rules in Firebase Console**

Open: https://console.firebase.google.com/project/teenwork-4c9de/firestore/rules

Confirm the new rules appear in the editor. Click "Rules Playground" and test:
- Unauthenticated read of `users/anyId` → **DENIED**
- Authenticated read of `users/anyId` → **ALLOWED**
- Authenticated write to `users/otherId` → **DENIED**
- Authenticated write to `users/ownId` → **ALLOWED**

---

### Task 2: Create Storage Security Rules

**Files:**
- Create: `storage.rules`
- Modify: `firebase.json` (add `storage` section)

**Context:** No `storage.rules` file exists. The `firebase.json` has no storage section, meaning Storage is running with default rules (deny all or test mode depending on project setup).

- [ ] **Step 1: Create `storage.rules`**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Teen profile images
    // - Any logged-in user can read (employers need to see teen photos)
    // - Only the teen themselves can write
    // - Images only, max 5MB
    match /profileImages/teens/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size <= 5 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp)');
    }

    // Company logos
    // - Any logged-in user can read
    // - Only the employer themselves can write
    // - Images only, max 5MB
    match /companyLogos/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size <= 5 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp)');
    }

    // Parental consent documents
    // - Only the uploading teen can read their own consent
    // - Any logged-in user can upload (teen uploads their own)
    // - PDF and images only, max 5MB
    match /parental_consents/{uid}/{filename} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size <= 5 * 1024 * 1024
        && request.resource.contentType.matches('(application/pdf|image/(jpeg|png))');
    }
  }
}
```

- [ ] **Step 2: Add storage section to `firebase.json`**

The current `firebase.json` has `hosting`, `functions`, and `firestore` sections. Add a `storage` key at the top level:

```json
{
  "hosting": {
    "site": "teenwork-4c9de",
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local"
      ]
    }
  ],
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

- [ ] **Step 3: Deploy Storage rules**

```
firebase deploy --only storage
```

Expected output:
```
✔  storage: released rules storage.rules to firebase.storage
+ Deploy complete!
```

- [ ] **Step 4: Verify rules in Firebase Console**

Open: https://console.firebase.google.com/project/teenwork-4c9de/storage/teenwork-4c9de.firebasestorage.app/rules

Confirm new rules appear. Use the Rules Playground to test:
- Unauthenticated write to `profileImages/teens/anyUid` → **DENIED**
- Authenticated write to `profileImages/teens/ownUid` with `image/jpeg`, 1MB → **ALLOWED**
- Authenticated write to `profileImages/teens/ownUid` with `application/pdf`, 1MB → **DENIED**
- Authenticated write to `profileImages/teens/ownUid` with `image/jpeg`, 6MB → **DENIED**

---

### Task 3: Update Storage Path for Parental Consents

**Files:**
- Modify: `components/EditProfilePage.tsx`

**Context:** The current parental consent upload path is `parental_consents/{timestamp}_{filename}`. The Storage rules in Task 2 use `parental_consents/{uid}/{filename}` to enforce owner-only reads. The upload path must match the rules.

- [ ] **Step 1: Find the upload path in EditProfilePage.tsx**

Search for the string `parental_consents` in `components/EditProfilePage.tsx`. It will look something like:

```typescript
const storageRef = ref(storage, `parental_consents/${Date.now()}_${file.name}`);
```

- [ ] **Step 2: Update the path to include the user's UID**

Replace the storage ref line with:

```typescript
const user = auth.currentUser;
if (!user) return;
const storageRef = ref(storage, `parental_consents/${user.uid}/${file.name}`);
```

Ensure `auth` is already imported from `'../firebase'` at the top of the file (it is — check the existing imports).

- [ ] **Step 3: Build and verify no TypeScript errors**

```
npx tsc --noEmit
```

Expected: no output (zero errors)

- [ ] **Step 4: Deploy the updated app**

```
npm run build && firebase deploy --only hosting
```

Expected output ends with:
```
+ Deploy complete!
Hosting URL: https://teenwork-4c9de.web.app
```

- [ ] **Step 5: Manual smoke test**

1. Open https://teensworks.com
2. Log in as a teen
3. Go to Edit Profile
4. Upload a PDF file as parental consent
5. Confirm no console errors and upload succeeds

---

## Post-Deployment Checklist

- [ ] Firestore rules deployed and verified in Console
- [ ] Storage rules deployed and verified in Console
- [ ] Parental consent upload path updated to `parental_consents/{uid}/{filename}`
- [ ] App built and deployed to hosting
- [ ] Admin login still works (Firestore role check, not hardcoded UID)
- [ ] Teen profile upload still works
- [ ] Employer logo upload still works
- [ ] Parental consent upload still works with new path

## Notes

- The memory leak in `EmailVerificationPage` is **already fixed** (line 27 has `return () => clearInterval(interval)`)
- The hardcoded admin email in `App.tsx` **does not exist** — the issue was actually a hardcoded UID in `firestore.rules`, fixed in Task 1
- No Playwright tests needed for rules — Firebase rules are tested via Console playground and manual smoke tests
