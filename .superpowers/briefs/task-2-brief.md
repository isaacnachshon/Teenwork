# Task 2: Create Storage Security Rules

## Context
TeenWork Firebase project (`teenwork-4c9de`). No `storage.rules` file exists. `firebase.json` has no storage section. Storage is currently unprotected.

Working directory: `C:\Users\orina\TeenWork\teenwork`

## Files to Create/Modify
- CREATE: `storage.rules`
- MODIFY: `firebase.json` (add `"storage"` section)

## Step 1: Create `storage.rules`
Write this exact content to `C:\Users\orina\TeenWork\teenwork\storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    match /profileImages/teens/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size <= 5 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp)');
    }

    match /companyLogos/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size <= 5 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp)');
    }

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

## Step 2: Modify `firebase.json`
The current `firebase.json` is:
```json
{
  "hosting": { ... },
  "functions": [ ... ],
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

Add a `"storage"` key after the `"firestore"` key so the final file is:
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

## Step 3: Deploy Storage rules
```
firebase deploy --only storage
```
Expected: `✔  storage: released rules storage.rules to firebase.storage`

## Step 4: Commit
```
git add storage.rules firebase.json
git commit -m "feat: add Firebase Storage security rules with file type and size enforcement"
```

## Report
Write your report to: `C:\Users\orina\TeenWork\teenwork\.superpowers\briefs\task-2-report.md`

Include:
- Status: DONE / BLOCKED / NEEDS_CONTEXT
- Commit SHA
- Deploy output
- Any concerns
