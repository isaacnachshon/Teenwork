# TeenBoost / GigSquad (Israel Edition) — Claude Code Prompt

You are an expert full-stack developer working inside the existing TeenWork codebase. Your mission is to evolve this app into a complete platform for teen employment and community in Israel for ages 14–18.

## Product Vision
Build a safe, motivating, and modern experience that connects teens with employers for temporary jobs, while also supporting Discord-like communities, secure transactions, and gamified growth.

The app must feel trustworthy for teens and parents, efficient for employers, and powerful for admins.

## Core Goals
- Help teens discover legal, age-appropriate temporary work opportunities in Israel
- Make it easy for employers to hire quickly and manage applicants
- Create a community layer where teens can join interest-based groups and collaborate
- Support secure, transparent payments and status tracking
- Add motivation through XP, badges, milestones, and rewards
- Support Hebrew-first UX with RTL layout and local relevance

## Target Users
- Teen users: ages 14–18, looking for short-term jobs and community activities
- Employer users: local businesses, gig organizers, event teams, and service providers
- Admin users: platform operators who manage moderation, oversight, analytics, and growth

## Required Tech Stack
- Frontend: React 19 + TypeScript + Vite 6
- Styling: Tailwind CSS classes (inline utility classes, consistent with the current app)
- Backend: Firebase Auth + Firestore + Storage + Cloud Functions where needed
- Charts: Recharts
- Testing: Playwright for end-to-end tests
- Localization: Hebrew-first UI with RTL support

## Architecture Requirements
The app should be structured around three main dashboards:

### 1) Teen Dashboard
Focus: fun, safety, motivation

Must include:
- Personalized home feed
- Job discovery board with nearby opportunities
- Search and filters by category, location, schedule, and pay
- Community spaces with channels, posts, and activity feed
- Achievement system with XP, streaks, badges, and milestones
- Profile page with skills, interests, work history, and preferences
- Safety and rights information for teen workers
- Secure progress tracking for applications and shifts
- Optional wallet or earnings overview

### 2) Employer Dashboard
Focus: efficiency, fast hiring

Must include:
- Quick job posting flow
- Applicant management and shortlist tools
- Job status tracking
- Shift scheduling and reminders
- Messaging or contact workflow with applicants
- Review and feedback system
- Payment and payout status tracking
- Analytics on hiring performance

### 3) Admin Dashboard
Focus: deep analytics and control

Must include:
- User growth and activity analytics
- Job posting and application metrics
- Employer and teen management tools
- Moderation and reporting tools
- Compliance and safety oversight views
- Content and community health monitoring
- Revenue and payout visibility

## Core Logic and Automation
Implement the following features in a polished and production-ready way:

### Authentication and Roles
- Support three roles: teen, employer, admin
- Use Firebase Auth with email/password login
- Enforce role-based access for each dashboard
- Require email verification for teen accounts
- Keep the onboarding flow lightweight and friendly

### Teen Experience
- Teen onboarding should collect: name, age, location, interests, skills, availability
- Add a safety-first experience with clear rules and legal guidance
- Show nearby jobs based on the teen’s location
- Support application workflow: apply → viewed → accepted → completed
- Show progress and confidence-building feedback

### Employer Experience
- Employers can publish jobs quickly using a short, fast form
- Jobs should support fields like title, location, pay, schedule, type, requirements, and description
- Employers should be able to review applicants and move them through statuses
- Add notification-friendly status changes and reminders

### Community Layer
- Add community spaces that feel similar to Discord-style channels
- Support categories such as study groups, local events, job tips, and city-based communities
- Allow teens to join communities, post updates, and interact safely

### Secure Transactions
- Add a clear, transparent flow for payment status and completion
- Support employer-to-teen payout status indicators
- Keep the experience understandable and not overly complex

### Gamification
- Add XP points for completing profile tasks, applying to jobs, attending shifts, and contributing to communities
- Add achievement badges for consistency and milestones
- Display progress bars and celebratory UI states

## Israel-Specific Requirements
- Use Hebrew-first content and RTL layout
- Support Israeli cities and neighborhoods in job location handling
- Keep the tone friendly, safe, and age-appropriate
- Respect local labor and safety expectations for teens
- Use relevant category names and job types that fit the Israel context

## Data Model Expectations
Use Firestore collections and documents that fit the current TeenWork structure and extend it cleanly.

Recommended collections:
- users
- jobs
- applications
- communities
- communityPosts
- achievements
- payouts
- notifications

Each document should include relevant metadata such as createdAt, updatedAt, status, and ownership fields.

## UI and UX Requirements
- Keep the interface modern, colorful, and encouraging
- Make the app feel trustworthy and safe, especially for teens
- Use clear empty states, progress indicators, and friendly microcopy
- Ensure the layout is responsive and works well on mobile
- Preserve the existing app style where possible while improving clarity and polish

## Implementation Plan for Claude Code
1. Review the existing TeenWork structure and current components.
2. Extend the app with role-based dashboard flows for teen, employer, and admin.
3. Add or refine Firestore data models and Firebase helpers.
4. Implement the teen experience: onboarding, jobs, applications, community, achievements, and profile.
5. Implement the employer experience: job posting, applicant review, scheduling, and payout visibility.
6. Implement the admin experience: analytics, moderation, management tools, and visibility controls.
7. Add tests for the critical flows using Playwright.
8. Verify the build and ensure the dev server runs without issues.

## Constraints and Best Practices
- Prefer incremental, working improvements over large risky rewrites
- Preserve existing functionality unless it conflicts with the new feature requirements
- Keep code modular and typed
- Avoid unnecessary complexity in the first pass
- Use realistic placeholder data only when explicitly needed for UI development
- If a feature requires backend logic that is not yet available, implement the frontend flow and clearly structure the Firebase integration points

## Success Criteria
The implementation is successful when:
- The app runs locally without startup errors
- Teen, employer, and admin flows are clearly separated and functional
- A teen can browse jobs, apply, and view progress
- An employer can post jobs and review applicants
- An admin can view high-level analytics and manage users or content
- The experience feels polished, safe, and motivating for the target audience
