# Life RPG — Gamified Real-World Productivity SaaS

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)](#)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](#)
[![Tests Passing](https://img.shields.io/badge/Tests-35%20Passing-brightgreen.svg)](#)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black.svg)](#)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-336791.svg)](#)

> **Life RPG** transforms real-world productivity into an epic fantasy progression system. Study, work, exercise, and habits become quests that reward Experience Points (XP), virtual Gold, attribute advancement, and unlockable cosmetics.

---

## 1. Product Vision & Core Psychological Loop

Life RPG addresses the core flaw of conventional to-do list applications: the lack of tactile feedback, intrinsic motivation, and progression.

```
       ┌────────────────────────┐
       │   CREATE QUEST/HABIT   │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │   FULFILL REAL TRIAL   │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ GAIN AUTHORITATIVE XP  │
       │ & GOLD VIA TRANSACTION │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │  LEVEL UP & UNLOCK     │
       │  ACHIEVEMENTS & FRAMES │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ ADVANCE DAILY STREAK   │
       │ & RETURN TOMORROW      │
       └────────────────────────┘
```

---

## 2. Distinctive Visual Identity

- **Design Aesthetic**: *"Modern Fantasy RPG × Premium Productivity"*
- **Atmosphere**: Deep obsidian surfaces (`#0B0F17`, `#111827`), glowing arcane borders, golden treasury typography, and solar parchment daylight themes.
- **Audio Feedback**: Procedural Web Audio API sound synthesizer with zero external audio assets, zero latency, and zero broken links.
- **Micro-Interactions**: Fluid Framer Motion animations, canvas-confetti particle bursts upon Level-Up, and glowing streak indicators.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15+ (App Router, Server Actions, REST API Route Handlers) |
| **Language** | TypeScript (Strict Mode enabled, zero `any`) |
| **Styling** | Tailwind CSS with custom RPG design tokens |
| **Animation** | Framer Motion & Canvas-Confetti |
| **Icons** | Lucide React |
| **Audio** | Native Browser Web Audio API procedural synthesis |
| **Database** | PostgreSQL (Supabase compatible) |
| **ORM** | Prisma ORM with relational integrity & migrations |
| **Validation** | Zod schemas across all APIs and forms |
| **Testing** | Vitest, React Testing Library, and E2E Journey Suites |
| **Security** | Jose JWT authentication with HTTP-only cookies & Bcrypt password hashing |

---

## 4. Key Systems & Features

### 4.1 Server-Authoritative Progression Engine
- **Non-Linear Leveling Curve**:
  $$\text{XP\_TO\_LEVEL}(N) = \left\lfloor 100 \times (N - 1)^{1.5} \right\rfloor$$
  Leveling up requires exponentially greater discipline and output.
- **Anti-Cheating Assurance**: The client never dictates XP or Gold amounts. Rewards are determined strictly server-side inside atomic database transactions.

### 4.2 Timezone-Aware Daily Streak Engine
- Tracks consecutive days of activity without falling prey to raw UTC offsets or daylight saving jumps.
- Multiple quest completions on the same day maintain the streak without duplicate inflation.

### 4.3 RPG Attributes
Quests directly advance one of six core attributes:
- 📖 **Intellect**: Study, coding, reading, knowledge tasks.
- 🏋️ **Strength**: Gym, weightlifting, physical conditioning.
- 🔥 **Discipline**: Habit consistency, early morning routines, deep work.
- 🎨 **Creativity**: Art, design, writing, problem-solving.
- 🌿 **Vitality**: Hydration, sleep, nutrition, recovery.
- 🤝 **Social**: Communication, leadership, community service.

### 4.4 Virtual Economy & Merchant Bazaar
- **Currency (Gold)**: Earned through quest completions and unlocked achievements.
- **Bazaar Goods**: Avatar frames, honorary titles, and realm themes.
- **Ledger Security**: Double-entry transaction ledgers (`currency_transactions`) and database check constraints prevent negative gold balances and duplicate acquisitions.

### 4.5 Centralized Achievement System
Automatic server-side unlocks for:
- ⚔️ **First Steps**: Fulfill your first quest.
- 🔥 **Week Warrior**: Maintain a 7-day daily streak.
- 🛡️ **Centurion**: Earn 1,000 total XP.
- 👑 **Quest Master**: Complete 25 quests.
- 📜 **Grand Scholar**: Reach 500 Intellect XP.
- 💪 **Powerhouse**: Reach 500 Strength XP.

---

## 5. Architecture & Database Schema

The database is structured in PostgreSQL via Prisma:

- `users`: Core account identity and hashed credentials.
- `profiles`: Display preferences, avatar, timezone, and sound settings.
- `characters`: Level, cumulative total XP, gold balance, equipped cosmetics.
- `attributes`: Per-attribute XP ledger and tier levels.
- `quests`: Task title, description, category, difficulty, attribute, cadence, status.
- `quest_completions`: Immutable record of completions with idempotency constraints.
- `xp_transactions`: Immutable double-entry ledger of all XP grants.
- `currency_transactions`: Immutable ledger of all gold debits and credits.
- `streaks`: Current streak, longest streak, and last localized active calendar date.
- `shop_items` & `user_inventory`: Cosmetic catalog and verified player ownership.
- `achievements` & `user_achievements`: Milestone criteria and unlock timestamps.

Detailed system design diagrams and progression formulas are documented in [ARCHITECTURE.md](file:///D:/Projects/LifeRPG/ARCHITECTURE.md).

---

## 6. Directory Structure

```
LifeRPG/
├── prisma/
│   ├── schema.prisma       # PostgreSQL models, relational constraints, indexes
│   └── seed.ts             # Catalog seed script for categories, shop & achievements
├── src/
│   ├── app/
│   │   ├── (auth)/         # Public auth: /login, /signup, /forgot-password
│   │   ├── (dashboard)/    # Protected: /dashboard, /quests, /character, /inventory,
│   │   │                   #            /shop, /achievements, /history, /settings, /onboarding
│   │   ├── api/            # Server REST API endpoints with auth & Zod guards
│   │   ├── globals.css     # Dark/light fantasy design system tokens
│   │   └── layout.tsx      # Root application shell
│   ├── components/
│   │   ├── layout/         # Desktop Sidebar, TopBar, and Mobile Bottom Nav
│   │   ├── progression/    # LevelUpModal, XPProgressBar, StreakFlame
│   │   ├── providers/      # GameProvider (synchronized optimistic state)
│   │   ├── quests/         # CreateQuestModal, QuestCard, Filters
│   │   └── ui/             # ToastNotification, Badges, Buttons
│   ├── lib/
│   │   ├── auth/           # JWT, session extraction, bcrypt password hashing
│   │   ├── db/             # Prisma client singleton
│   │   ├── game-engine/    # Progression math, streak evaluation, achievement checks
│   │   ├── sound/          # Procedural Web Audio API synthesizer
│   │   └── validation/     # Zod schemas for quests, auth, and shop
│   └── server/
│       └── repositories/   # GameRepository with PostgreSQL transactions & demo fallback
├── tests/
│   ├── unit/               # Non-linear XP curve, streak, and reward unit tests
│   ├── integration/        # Auth, quest completion, ledger, shop, and inventory tests
│   └── e2e/                # Critical user journey (Signup -> Quest -> LevelUp -> Refresh)
├── ARCHITECTURE.md         # Comprehensive engineering specification
└── package.json
```

---

## 7. Local Development & Installation

### Prerequisites
- Node.js 18+ (tested through Node 24.14)
- npm or pnpm

### 1. Clone and Install
```bash
git clone https://github.com/your-username/LifeRPG.git
cd LifeRPG
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configuration settings:
```ini
# PostgreSQL connection string (Supabase / local Postgres)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/liferpg?schema=public"

# Session JWT Secret (minimum 32 characters)
JWT_SECRET="liferpg_development_secret_key_minimum_32_chars_123456789"

# Enables instant zero-config testing & development mode
DEMO_STORAGE_FALLBACK="true"
```

### 3. Generate Database Client & Seed Catalog
```bash
npm run db:generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Verification & Test Suite

Life RPG includes a comprehensive automated test suite covering unit math, integration transactions, anti-cheat boundaries, and end-to-end user journeys.

```bash
# Run all 35 unit, integration, security, and E2E tests
npm test

# Run TypeScript typecheck
npm run typecheck

# Run ESLint check
npm run lint

# Run production build
npm run build
```

---

## 9. Deployment to Production

### Deploying on Vercel + Supabase
1. **Database Setup**: Create a new project in [Supabase](https://supabase.com). Copy the PostgreSQL connection URI from Project Settings -> Database.
2. **Push Schema**: Run `npx prisma db push` to synchronize all tables, indexes, and constraints to Supabase PostgreSQL.
3. **Seed Catalog**: Run `npx tsx prisma/seed.ts` to populate shop items, categories, and achievement definitions.
4. **Vercel Deployment**:
   - Push repository to GitHub.
   - Import project in [Vercel](https://vercel.com).
   - Set environment variables:
     - `DATABASE_URL`: Your Supabase connection string with pooled port 6543 / transaction mode.
     - `JWT_SECRET`: A high-entropy 64-character secret.
     - `DEMO_STORAGE_FALLBACK`: Set to `"false"` in production.
   - Deploy!

---

## 10. Security & Anti-Cheating Architecture

1. **No Client-Side Authority**: The client UI is purely a presentation layer. Sending modified XP or Gold in request bodies is rejected by server Zod schemas.
2. **Idempotency Keys**: Rapid clicks or network retries on quest completions use idempotency tokens and unique compound constraints to prevent double-awarding.
3. **Tenant Boundary Isolation**: All database queries enforce `WHERE user_id = session.user.id`. Cross-user access returns 404 or 401.
4. **HTTP-Only Cookies**: Session tokens are transmitted via SameSite=Lax, Secure, HTTP-Only cookies to protect against XSS token harvesting.

---

## 11. Demonstration Walkthrough (90–120 Seconds)

1. Open [http://localhost:3000](http://localhost:3000).
2. Click **"Enter Realm Demo"** or **"1-Click Demo Adventurer"** on `/login` to auto-provision a hero with starter quests.
3. Complete the quick onboarding step (choose focus attribute, theme, and hero handle).
4. Arrive at the **Command Center Dashboard**: Note your Level 1 status, 0 XP, streak counter, and active quests.
5. Click **"Fulfill Trial"** on a quest:
   - Hear the procedural Web Audio chime.
   - Watch the XP progress bar animate.
   - Watch Gold increase in real time.
   - See streak increment to 1 Day.
6. Click **"Scribe Quest"**: Create a custom **Hard** or **Epic** quest.
7. Complete the newly created quest:
   - Trigger the **Level-Up Celebration Modal** with canvas confetti and arpeggio fanfare!
   - Claim rewards.
8. Navigate to **Bazaar & Shop** (`/shop`): Purchase an Avatar Frame or Honorary Title with your earned gold.
9. Navigate to **Inventory** (`/inventory`): Click **"Equip"** to adorn your hero with your new crest.
10. Refresh the browser (`F5`): Observe that all character levels, XP, streak, inventory, and achievements persist cleanly from the backend!
