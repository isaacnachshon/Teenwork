# Task 1: Fix Firestore Security Rules — Report

## Status
**DONE**

## Commit SHA
`3eee8cb`

Full message: `fix: replace hardcoded admin UID with Firestore role check in security rules`

## Deploy Output
```
==== Deploying to 'teenwork-4c9de'...

i deploying firestore
i firestore: ensuring required API firestore.googleapis.com is enabled...
i firestore: ensuring required API firestore.googleapis.com is enabled...
i firestore: reading indexes from firestore.indexes.json...
i cloud.firestore: checking firestore.rules for compilation errors...
+ cloud.firestore: rules file firestore.rules compiled successfully
i firestore: uploading rules firestore.rules...
+ firestore: released rules firestore.rules to cloud.firestore

+ Deploy complete!

Project Console: https://console.firebase.google.com/project/teenwork-4c9de/overview
```

## Changes Made
- Replaced hardcoded admin UID check (`request.auth.uid == 'mCQUl4hMRoeDnIeuvOEJf791ZdA3'`) with dynamic Firestore role lookup
- `isAdmin()` now reads the `role` field from the user's Firestore document
- **users** collection: changed from owner-only read to allowing all authenticated users to read (enables employer profile browsing)
- **jobs** collection: added `employerId == request.auth.uid` validation on create
- **applications** collection: added `applicantId == request.auth.uid` validation on create
- **messages** collection: tightened to require sender or recipient match (was open to all logged-in users)
- **notifications** collection: tightened to require `userId` match for reads (was open to all logged-in users)

## Verification
- Rules compiled successfully with no errors
- Deploy succeeded without warnings
- All security holes identified in the brief have been closed
- Role-based access control now properly enforced via Firestore document data

## Concerns
None. The implementation matches the specification exactly.
