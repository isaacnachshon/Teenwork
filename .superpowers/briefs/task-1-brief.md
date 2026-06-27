# Task 1: Fix Firestore Security Rules

## Context
TeenWork is a Firebase-backed React app (Israeli teen job marketplace). You are fixing the Firestore security rules file only — no React/TypeScript changes.

## File to Modify
`C:\Users\orina\TeenWork\teenwork\firestore.rules`

## Current Problem
The existing `firestore.rules` has a critical flaw: `isAdmin()` checks a hardcoded UID string (`mCQUl4hMRoeDnIeuvOEJf791ZdA3`) instead of reading the user's role from Firestore. Additionally:
- `users` read is restricted to own doc only — must allow all authenticated users to read (employers browse teen profiles)
- `jobs` create has no validation that `employerId == request.auth.uid`
- `applications` create has no validation that `applicantId == request.auth.uid`
- `messages`/`notifications` are fully open to any logged-in user

## Required Result
Replace the entire content of `firestore.rules` with exactly this:

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

## Steps
1. Write the above content to `firestore.rules` (replace entirely)
2. Deploy: `cd C:\Users\orina\TeenWork\teenwork && firebase deploy --only firestore:rules`
3. Confirm deploy output shows success
4. Commit: `git add firestore.rules && git commit -m "fix: replace hardcoded admin UID with Firestore role check in security rules"`

## Report
Write your report to: `C:\Users\orina\TeenWork\teenwork\.superpowers\briefs\task-1-report.md`

Include:
- Status: DONE / BLOCKED / NEEDS_CONTEXT
- Commits made (full SHA)
- Deploy output
- Any concerns
