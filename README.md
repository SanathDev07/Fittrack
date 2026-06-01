# FitTrack 💪

A full-stack workout tracking app built with **Next.js 15**, **Prisma**, and **PostgreSQL**.

Built as part of a take-home assignment — designed to showcase multi-user resource sharing, access control, and end-to-end CRUD workflows.

---

## 📋 Table of Contents

- [What is FitTrack?](#what-is-fittrack)
- [Tech Stack](#tech-stack)
- [How to Run Locally](#how-to-run-locally)
- [Features](#features)
- [Access Rules](#access-rules)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Project Structure](#project-structure)
- [Tradeoffs & Notes](#tradeoffs--notes)
- [Future Enhancements](#future-enhancements)
- [AI Tools Used](#ai-tools-used)

---

## What is FitTrack?

FitTrack is a workout tracking web app where multiple users can:
- Create and manage their own workout routines
- Share routines publicly with the community
- Log their completed workouts
- Set personal fitness goals
- Browse and clone other users' public routines

The key feature beyond basic CRUD is the **shared resource model** — public routines are visible and usable by all users, but only the owner can edit or delete them.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | NextAuth.js (JWT strategy) |
| Styling | Tailwind CSS |
| Password Hashing | bcryptjs |

---

## 🚀 How to Run Locally

Follow these steps one by one:

### Step 1 — Clone the repo
```bash
git clone https://github.com/SanathDev07/Fittrack.git
cd fittrack
```

### Step 2 — Install dependencies
```bash
npm install
```
> This installs all packages the app needs (Next.js, Prisma, NextAuth, etc.)

### Step 3 — Set up PostgreSQL
Make sure PostgreSQL is installed and running on your machine.

Create a new database called `fittrack`:
```sql
CREATE DATABASE fittrack;
```

### Step 4 — Create the `.env` file
Create a file called `.env` in the root of the project and add:
```env
DATABASE_URL="postgresql://YOUR_DB_USERNAME:YOUR_DB_PASSWORD@localhost:5432/fittrack"
NEXTAUTH_SECRET="any-random-string-you-choose"
NEXTAUTH_URL="http://localhost:3000"
```

**What each line means:**
- `DATABASE_URL` — tells the app how to connect to your PostgreSQL database. Replace `YOUR_DB_USERNAME` and `YOUR_DB_PASSWORD` with your actual PostgreSQL credentials (commonly `postgres` / `postgres` for local installs)
- `NEXTAUTH_SECRET` — a secret key used to encrypt login sessions. Can be any random string (e.g. `mysecret123`)
- `NEXTAUTH_URL` — the URL where the app runs locally. Always `http://localhost:3000` for local development

### Step 5 — Run database migrations
```bash
npx prisma migrate dev
```
> This creates all the tables (Users, Routines, Exercises, WorkoutLogs, Goals) in your database automatically

### Step 6 — Start the app
```bash
npm run dev
```

### Step 7 — Open in browser
Go to `http://localhost:3000`

You'll see the app running! Create an account and start exploring.

---

## ✅ Features

- **Authentication** — Signup and signin with email & password
- **Create Routines** — Add workout routines with exercises (sets, reps, duration)
- **Edit & Delete Routines** — Full control over your own routines
- **Public & Private Routines** — Choose who can see your routine
- **Community Page** — Browse all public routines from all users
- **Clone Routine** — Copy any public routine to your own account
- **Log Workouts** — Mark a routine as completed with personal notes
- **Goal Tracking** — Set calorie, workout, and weight goals
- **Dashboard** — See your stats, goals progress, and workout history
- **Analytics Chart** — Visual chart of your workout activity

---

## 🔐 Access Rules

This is the core of the permission system — goes beyond "users only see their own data":

| Action | Owner | Other Logged-in Users | Guest (not logged in) |
|--------|-------|-----------------------|----------------------|
| View public routine | ✅ Yes | ✅ Yes | ✅ Yes |
| View private routine | ✅ Yes | ❌ No | ❌ No |
| Edit routine | ✅ Yes | ❌ No | ❌ No |
| Delete routine | ✅ Yes | ❌ No | ❌ No |
| Log a workout | ✅ Yes | ✅ Yes | ❌ No |
| Clone a routine | ✅ Yes | ✅ Yes | ❌ No |
| Set goals | ✅ Yes | N/A | ❌ No |

---

## 🏗 Architecture

Here is how all the pieces of FitTrack connect together:

```
┌─────────────────────────────────────────────────────┐
│                   Browser (User)                     │
│         Next.js Pages & React Components             │
└────────────────────────┬────────────────────────────┘
                         │ HTTP requests
                         ▼
┌─────────────────────────────────────────────────────┐
│              Next.js API Routes                      │
│                                                      │
│  /api/auth        → NextAuth (login/logout/session)  │
│  /api/register    → Create new user account          │
│  /api/routines    → CRUD for workout routines        │
│  /api/logs        → Log completed workouts           │
│  /api/goals       → Manage user fitness goals        │
│  /api/dashboard   → Fetch user-specific dashboard    │
└────────────────────────┬────────────────────────────┘
                         │ Prisma queries
                         ▼
┌─────────────────────────────────────────────────────┐
│                 Prisma ORM                           │
│   Translates JavaScript code into SQL queries        │
│   Handles migrations and schema management           │
└────────────────────────┬────────────────────────────┘
                         │ SQL
                         ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Database                     │
│                                                      │
│  Tables: Users, Routines, Exercises,                 │
│          WorkoutLogs, Goals                          │
└─────────────────────────────────────────────────────┘

Authentication Flow:
──────────────────
User logs in → NextAuth verifies credentials → 
JWT token stored in session cookie → 
Every API route checks session to identify the user →
Access rules applied based on user ID vs resource owner ID
```

**Key architectural decisions:**
- **App Router (Next.js 15)** — used for cleaner file-based routing and server components
- **JWT sessions** — stateless auth, no session table needed in the database
- **Prisma as ORM** — type-safe queries, easy migrations, clean schema definition
- **API routes as backend** — all business logic and database access lives in `/api`, keeping frontend components clean

---

## 🗄 Data Model

Here's how the database is structured:

```
User
 ├── id, name, email, password (hashed)
 ├── owns many → Routines
 ├── has many → WorkoutLogs
 └── has one → Goal

Routine
 ├── id, title, description, visibility (public/private)
 ├── belongs to → User (owner)
 ├── has many → Exercises
 └── has many → WorkoutLogs

Exercise
 ├── id, name, sets, reps, duration
 └── belongs to → Routine

WorkoutLog
 ├── id, notes, createdAt
 ├── belongs to → User
 └── belongs to → Routine

Goal
 ├── id, calorieTarget, workoutTarget, weightTarget
 └── belongs to → User
```

---

## 📁 Project Structure

```
fittrack/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth login handler
│   │   ├── register/             # Signup API
│   │   ├── routines/             # CRUD for routines
│   │   │   ├── [id]/             # Get, update, delete one routine
│   │   │   └── clone/            # Clone a routine
│   │   ├── logs/                 # Workout logging API
│   │   ├── goals/                # Goals API
│   │   └── dashboard/routines/   # Fetch only logged-in user's routines
│   ├── auth/
│   │   ├── signin/               # Sign in page
│   │   └── signup/               # Sign up page
│   ├── routines/
│   │   ├── [id]/                 # Routine detail page
│   │   │   └── edit/             # Edit routine page
│   │   └── new/                  # Create routine page
│   ├── dashboard/                # User dashboard
│   │   └── goals/                # Goals management page
│   └── components/               # Reusable UI components
├── prisma/
│   └── schema.prisma             # Database schema
├── lib/
│   └── prisma.js                 # Prisma client singleton
└── .env                          # Environment variables (not committed)
```

---

## ⚖️ Tradeoffs & Notes

These are honest decisions I made given the time constraint:

**`alert()` instead of toast notifications**
Used browser `alert()` for success/error feedback to keep things simple. In production I'd use a library like `react-hot-toast` for a better user experience.

**No pagination**
The community routines page loads all public routines at once. This works fine for small data but would need cursor-based pagination at scale.

**Full routine logging vs per-exercise tracking**
Workout logs capture the whole session with notes rather than tracking individual sets and reps per exercise. This was a deliberate simplification — good enough for this use case, but a production app would track per-exercise progress over time.

**No email verification**
Users can sign up with any email without verification. In production this would be a security requirement.

**Goals are static targets**
Goals store a target number (e.g. burn 2000 calories/day) but don't log daily progress history. A future improvement would be daily progress tracking with trend charts.

**`prisma.config.ts` conflict**
Next.js 15 auto-generates a `prisma.config.ts` that conflicts with Prisma setup. Fixed by replacing its contents with `export {}`.

**Next.js 15 async params**
Next.js 15 requires route params to be awaited differently than older versions:
```javascript
// Required in Next.js 15
export async function GET(request, context) {
  const params = await context.params
}
```
This was a non-obvious bug that took debugging to identify.

---

## 🚀 Future Enhancements

Given more time, here is what I would build next:

**Better UX**
- Replace `alert()` with toast notifications for smoother feedback
- Add loading skeletons while data is fetching
- Make the app fully mobile responsive

**Richer Features**
- Per-exercise workout logging (track sets/reps completed vs planned)
- Daily goal progress tracking with history charts
- Follow other users and see their public activity
- Comments or likes on public routines
- Workout streak tracking (e.g. 7-day streak badge)

**Performance & Scale**
- Pagination on the community routines page
- Search and filter routines by muscle group or difficulty
- Infinite scroll for workout history

**Security & Production Readiness**
- Email verification on signup
- Password reset flow
- Rate limiting on API routes
- Proper error boundaries in the UI
- Environment-based config with `.env.example` file

**Testing**
- Unit tests for API route logic
- Integration tests for auth and access rules
- E2E tests with Playwright for key user flows

---

## 🤖 AI Tools Used

Used **Claude (Anthropic)** as a collaborative coding partner throughout development — this is intentional and reflects how I'd work on a real team.

**What AI helped with:**
- Initial project setup and boilerplate (NextAuth config, Prisma schema)
- Generating UI components and API route structure
- Identifying the Next.js 15 async params bug
- Suggesting the clone routine feature as an addition

**What I drove independently:**
- Choosing the app domain (workout tracker) and overall feature set
- Designing the data model and relationships
- Defining the access rules and permission logic
- Deciding what to build vs. what to skip given time constraints
- Reviewing, understanding, and modifying all generated code before using it

The approach: use AI to move fast on execution, while keeping ownership of architecture and product decisions.

---

## 👤 Author

Sanath — built for RelyMD take-home assignment