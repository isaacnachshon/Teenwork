# Profile Completion → Job Visibility Unlock System

**Date:** 2026-07-02  
**Status:** Approved  
**Feature area:** Teen Dashboard — OverviewPage

---

## Summary

Teens who fill in more profile details see more job listings. Incomplete profiles see fewer (and visually blurred) jobs. This creates a clear incentive to complete the profile — including legally-required fields like parental consent and ID number — without blocking access to the platform.

---

## Problem

Teens can currently view all jobs the moment they log in, with no incentive to complete their profile. Israeli youth employment law requires certain information (ID number, parental consent, birth date) before a teen can legally be hired. Currently nothing encourages teens to provide this.

---

## Goals

1. Give teens a tangible reason to fill in every profile field.
2. Guide teens toward legal compliance (ID, parental consent, birth date) as part of stage 1.
3. Keep the experience positive — users see real jobs immediately, just fewer of them.

---

## Non-Goals

- No enforcement gate — teens are never blocked from the platform.
- No employer-side changes.
- No backend changes — all unlock logic is client-side, computed from Firestore profile data.

---

## Design: 3-Stage Unlock System

### Stage definitions

| Stage | Label | Jobs visible | Unlock condition |
|-------|-------|-------------|-----------------|
| 0 | No profile | 0% | (default — nothing filled) |
| 1 | Legal profile | ~30% of all jobs | `name` + `idNumber` + `birthDate` + `parentEmail` + `parentPhone` + `parentalConsentStatus === 'approved'` |
| 2 | Worker profile | ~65% of all jobs | Stage 1 + `phone` + `city` + `school` + `studyStatus` |
| 3 | Full profile | 100% of all jobs | Stage 2 + `profileImageUrl` + `bio` + `skills.length > 0` |

Stage 0 is the state before any unlock condition is met. In practice, the user's `name` is set at registration, so most teens will reach Stage 1 quickly once they add legal fields.

### Job sorting and visibility

- Jobs are always sorted by relevance (most relevant first).
- Visible jobs = the top N% of the sorted list.
- Locked jobs (the tail) are shown as blurred cards with an overlay.
- The locked cards are always the least-relevant jobs, so there is no feel of arbitrary hiding.

### Exact percentages

```
stage 0 → 0 visible (nothing shown, just an unlock prompt)
stage 1 → ceil(total × 0.30)
stage 2 → ceil(total × 0.65)
stage 3 → total (all visible)
```

If `total === 0`, the empty state is shown regardless of stage.

---

## UI: "משרות בשבילך" Section (OverviewPage)

### Progress banner

Shown above the job list. Example (stage 2, 20 total jobs):

```
אתה רואה 13 מתוך 20 משרות
השלם את הפרופיל שלך לצפייה בכולן →
```

Clicking the banner navigates to the Profile tab.

At stage 3 (full profile), the banner is hidden.

### Job cards

- Visible cards: rendered normally, identical to current card design.
- Locked cards: same card layout, blurred (`filter: blur(4px)`), with a full-card overlay containing:
  - Lock icon (SVG)
  - Text: `"השלם שלב X לצפייה במשרה זו"` (where X is the next stage number)
- Pointer events on locked cards: `none` (not clickable).

### Section header

```
משרות בשבילך
```

Shown in the OverviewPage above the banner and cards.

---

## Architecture

### New file: `src/utils/profileUnlock.ts`

Two pure functions, no side effects, no imports from React or Firebase:

```typescript
export function getUnlockStage(profile: UserData): 0 | 1 | 2 | 3

export function getVisibleJobCount(totalJobs: number, stage: 0 | 1 | 2 | 3): number
```

`getUnlockStage` checks fields in order (stage 1 → 2 → 3); returns the highest stage whose conditions are all met.

`getVisibleJobCount` returns:
- stage 0 → 0
- stage 1 → `Math.ceil(totalJobs * 0.30)`
- stage 2 → `Math.ceil(totalJobs * 0.65)`
- stage 3 → `totalJobs`

### Modified file: `src/pages/dashboard/OverviewPage.tsx`

1. Accept a `setTab` prop (or equivalent navigation callback) to link the banner → Profile tab.
2. Fetch the current user's profile from Firestore (or receive it as a prop — see below).
3. Call `getUnlockStage(profile)` and `getVisibleJobCount(jobs.length, stage)` to determine visibility.
4. Render:
   - Progress banner (if stage < 3)
   - Visible job cards (first N jobs)
   - Locked job cards (remaining jobs, blurred + overlay)

### Modified file: `src/layouts/DashboardLayout.tsx`

Pass a `setTab` callback (or the existing tab-switching function) down to `OverviewPage` so the banner's navigation link works.

### Profile data source

`OverviewPage` already has access to `auth.currentUser.uid`. It will fetch the user doc from Firestore on mount (same pattern as `ProfileTab`). No prop drilling of profile data needed.

---

## Data Flow

```
DashboardLayout
  └─ OverviewPage
       ├─ Firestore: users/{uid}   → UserData (profile fields)
       ├─ Firestore: jobs           → Job[] (all jobs)
       ├─ profileUnlock.ts          → stage, visibleCount
       └─ renders: banner + visible cards + locked cards
```

---

## Edge Cases

| Case | Behavior |
|------|----------|
| 0 jobs in Firestore | Empty state, no banner |
| stage 0 | Show unlock prompt, 0 jobs listed |
| Profile doc missing | Treated as stage 0 |
| `parentalConsentStatus` is `'pending'` (not `'approved'`) | Stage 1 not reached — parental approval must be complete |
| `skills` exists but is empty array | Stage 3 condition not met |

---

## Out of Scope

- Employer-side filtering by profile completeness.
- Admin reporting on profile stages.
- Push notifications when a new stage is reached.
- Any changes to how jobs are stored or queried (relevance sort is client-side on the existing jobs array).

---

## Files Changed

| File | Change |
|------|--------|
| `src/utils/profileUnlock.ts` | **New** — `getUnlockStage`, `getVisibleJobCount` |
| `src/pages/dashboard/OverviewPage.tsx` | Add profile fetch, unlock logic, progress banner, blur cards |
| `src/layouts/DashboardLayout.tsx` | Pass `setTab` to OverviewPage |
