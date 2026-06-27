# CLAUDE.md

# TeenWork

## Vision

TeenWork is an AI-powered platform connecting teenagers with employers in Israel.

The platform helps teenagers:

* Find jobs
* Build professional profiles
* Receive AI career guidance
* Communicate with employers
* Learn workplace skills

Employers can:

* Publish jobs
* Review candidates
* Communicate with applicants
* Manage recruitment

---

# Technology Stack

Frontend

* React 19
* TypeScript
* Vite

Backend

* Firebase
* Firestore
* Firebase Authentication
* Cloud Functions
* Firebase Storage

AI

* Google Gemini
* Firebase AI Logic

Version Control

* Git
* GitHub

---

# Development Principles

Always:

* Write clean TypeScript.
* Prefer reusable components.
* Keep business logic outside UI.
* Use feature-based architecture.
* Never duplicate code.
* Keep files small.
* Use async/await.
* Prefer composition over inheritance.

---

# Project Structure

src/

components/
pages/
hooks/
services/
firebase/
ai/
types/
utils/
assets/

functions/

public/

---

# Firestore Collections

users
companies
jobs
applications
messages
notifications

---

# User Types

Teen

Employer

Administrator

---

# Authentication

Firebase Authentication

Supported providers:

* Google
* Email & Password

---

# UI Language

Primary language:

Hebrew (RTL)

Secondary language:

English

---

# Design Rules

Modern

Mobile first

Accessible

Fast

Minimal

---

# AI Features

The AI assistant should:

* Recommend jobs.
* Improve CV.
* Prepare for interviews.
* Recommend salary expectations.
* Suggest career paths.

---

# Coding Rules

Never modify existing working code without explanation.

Always explain architectural changes.

Generate reusable components.

Avoid unnecessary dependencies.

---

# Git Workflow

Create feature branches.

Commit frequently.

Write meaningful commit messages.

Never commit secrets.

Never commit API keys.

Ignore node_modules.

Ignore .env.local.

Ignore firebase-debug.log.

---

# Current Priority

1. Authentication

2. Firestore

3. User Profiles

4. Jobs

5. AI Assistant

6. Employer Dashboard

7. Notifications

8. Deployment

---

# Mission

Build the best AI-powered employment platform for teenagers in Israel.
