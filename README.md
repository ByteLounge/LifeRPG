# 🎮 Life RPG — Gamified Real-World Productivity SaaS

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)](#)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue.svg)](#)
[![Tests Passing](https://img.shields.io/badge/Tests-35%2F35%20Passing-brightgreen.svg)](#)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black.svg)](#)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg)](#)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-336791.svg)](#)
[![Design Style](https://img.shields.io/badge/Style-2D%20Mario%20%2F%20Retro%20NES-E52521.svg)](#)

> **Life RPG** transforms real-world productivity, study sessions, workouts, and daily habits into a nostalgic **2D Mario / 8-bit retro NES** game. Level up your character, advance 6 real-world Life Skills, earn Gold Coins, maintain daily streaks, equip fun cosmetics, and get guided by an animated 2D Mario companion!

---

## 📑 Table of Contents

- [1. Product Vision & Core Gameplay Loop](#1-product-vision--core-gameplay-loop)
- [2. Distinctive 2D Mario Retro NES Design System](#2-distinctive-2d-mario-retro-nes-design-system)
- [3. Key Features & Systems](#3-key-features--systems)
  - [3.1 Plain-English Task & Habit Management](#31-plain-english-task--habit-management)
  - [3.2 6 Core Real-World Life Skills](#32-6-core-real-world-life-skills)
  - [3.3 Timezone-Aware Daily Streak Engine](#33-timezone-aware-daily-streak-engine)
  - [3.4 Virtual Coin Economy & Item Shop](#34-virtual-coin-economy--item-shop)
  - [3.5 Backpack & Cosmetic Customization](#35-backpack--cosmetic-customization)
  - [3.6 Milestone Achievements](#36-milestone-achievements)
  - [3.7 Animated 2D Mario Companion Guide](#37-animated-2d-mario-companion-guide)
  - [3.8 Procedural Chiptune Sound Engine](#38-procedural-chiptune-sound-engine)
- [4. System Architecture](#4-system-architecture)
  - [4.1 Architecture Diagram](#41-architecture-diagram)
  - [4.2 Server-Authoritative Progression](#42-server-authoritative-progression)
  - [4.3 Zero-Latency Sub-50ms Architecture](#43-zero-latency-sub-50ms-architecture)
- [5. Mathematical Formulas & Progression Curves](#5-mathematical-formulas--progression-curves)
- [6. Technology Stack](#6-technology-stack)
- [7. Database Schema & Relational Design](#7-database-schema--relational-design)
- [8. REST API Endpoints Reference](#8-rest-api-endpoints-reference)
- [9. Security & Anti-Cheat Architecture](#9-security--anti-cheat-architecture)
- [10. Project Directory Structure](#10-project-directory-structure)
- [11. Getting Started & Local Development](#11-getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [Installation](#1-clone--install-dependencies)
  - [Environment Configuration](#2-configure-environment-variables)
  - [Instant 1-Click Demo vs Full PostgreSQL Setup](#3-run-modes)
  - [Running the Development Server](#4-run-development-server)
- [12. Automated Test Suite & Quality Assurance](#12-automated-test-suite--quality-assurance)
- [13. Production Deployment Guide](#13-production-deployment-guide)
- [14. License](#14-license)

---

## 1. Product Vision & Core Gameplay Loop

Standard to-do lists and habit trackers fail because checking a box provides fleeting dopamine, lacks tangible progression, and feels like administrative chore work. 

**Life RPG** bridges this psychological gap by mapping real-world effort directly into measurable character progression using proven game design loops:

```mermaid
flowchart TD
    A["Real-World Task or Habit\n(Study, Gym, Deep Work, Reading)"] --> B["Create Task in 'My Tasks'\nSelect Difficulty & Life Skill"]
    B --> C["Take Action in Real Life"]
    C --> D["Check Off Task\n(Tap Question Mark Block / Complete Button)"]
    D --> E["Server Validates Completion & Idempotency Key"]
    E --> F["Double-Entry Transaction Recorded\nXP Granted + Coins Credited"]
    F --> G{"Milestone or Level Up?"}
    G -- Yes --> H["Level-Up Fanfare & Confetti\nUnlock Titles, Frames & Badges"]
    G -- No --> I["Update Localized Daily Streak Flame"]
    H --> I
    I --> J["Spend Coins in Item Shop & Equip in Backpack"]
    J --> K["Come Back Tomorrow to Keep the Streak Alive!"]
```

### Core Design Rules
1. **Simple, Plain-English Terminology**: No confusing fantasy RPG jargon. Words like "trial", "scribe", "bazaar", or "mana" are replaced with plain, intuitive terms: **My Tasks**, **Coins**, **Level**, **Streak**, **Profile & Skills**, **Item Shop**, and **Backpack**.
2. **Server-Authoritative Fairness**: You cannot cheat by spoofing client requests. Every XP increment, Coin debit/credit, streak calculation, and level evaluation is computed and committed on the server.
3. **Instant Zero-Config Experience**: Anyone can test the full application immediately with a single click using the built-in demo hero generator—no PostgreSQL setup required.

---

## 2. Distinctive 2D Mario Retro NES Design System

Life RPG features an authentic **Super Mario NES 8-bit aesthetic** that makes task management playful and nostalgic:

| Aesthetic Element | Specification | Visual Representation |
|---|---|---|
| **Mario Sky Blue** | `#5C94FC` | Clean background headers, badge accents, and skill indicators |
| **Coin Yellow** | `#FBD000` / `#EAB308` | Glowing coin counters, button highlights, and level banners |
| **Mario Red** | `#E52521` | Active task highlights, XP flames, and alert borders |
| **Warp Pipe Green** | `#00A800` | Task completion buttons, success states, and save triggers |
| **Brick Brown** | `#B05C10` / `#944000` | Question mark block card borders, platform accents |
| **Pixel Shadowing** | `4px 4px 0px #000000` | Chunky NES drop-shadows across all pixel boxes and buttons |
| **Pixel Typography** | `Press Start 2P`, `VT323` | Classic arcade typography for headings, levels, and statistics |

### Interactive UI Elements
- **Bouncing Question Mark Blocks (`?`)**: Hit them on the landing page or task list to hear the authentic coin ding and watch rewards register.
- **Pixel Navigation Bar**: Features chunky Mario badges showing Player Name, Level, Total XP, Gold Coin Count, Streak Flame, and Sound Toggles.
- **Responsive Layout**: Desktop full-height sidebar with Mario icons; auto-collapses on mobile into a thumb-friendly bottom navigation bar.

---

## 3. Key Features & Systems

### 3.1 Plain-English Task & Habit Management
- **Cadence Types**:
  - **One-time Tasks**: Standard tasks with optional due dates and estimated completion times.
  - **Daily Habits**: Reset automatically every 24 hours to reinforce daily routines.
  - **Weekly Habits**: Recurring commitments for study goals or gym routines.
- **Difficulty Tiers & Server-Authoritative Rewards**:
  - 🟢 **Easy**: +15 XP, +5 Coins, +10 Skill XP (e.g., *Drink 2L of water*, *Make the bed*)
  - 🔵 **Medium**: +30 XP, +10 Coins, +20 Skill XP (e.g., *Read 20 pages*, *30-minute walk*)
  - 🟠 **Hard**: +60 XP, +25 Coins, +45 Skill XP (e.g., *Complete 2 hours of deep study*, *Heavy gym workout*)
  - 🔴 **Epic**: +120 XP, +50 Coins, +90 Skill XP (e.g., *Ship a project feature*, *Pass an exam*)
- **Filter & Search**: Filter by status (**Active**, **Completed**, **Archived**), search by title, or filter by category and skill.

### 3.2 6 Core Real-World Life Skills
Every task reinforces one of 6 foundational real-life competencies:

| Skill | Icon | Focus Areas | Example Habits & Tasks |
|---|:---:|---|---|
| **Intellect** | 🍄 | Knowledge, Learning & Problem Solving | Coding practice, studying, reading, language practice |
| **Strength** | 🏋️ | Physical Fitness & Bodily Health | Gym workouts, running, pushups, sports |
| **Discipline** | ⭐ | Focus, Consistency & Willpower | Waking up early, avoiding distractions, deep work blocks |
| **Creativity** | 🎨 | Innovation, Expression & Art | Writing, music, graphic design, brainstorming |
| **Vitality** | 🌿 | Recovery, Nutrition & Wellness | 8 hours of sleep, hydration, healthy meals, meditation |
| **Social** | 🤝 | Relationships, Networking & Leadership | Calling family, team meetings, networking, community service |

> **Self-Healing Fallback**: All 6 skills are guaranteed to exist for every account. Even in zero-config demo mode, missing attributes are automatically populated with Level 1 and 0 XP.

### 3.3 Timezone-Aware Daily Streak Engine
- Tracks consecutive days of activity without falling prey to raw UTC offsets or daylight saving shifts.
- Uses the user's localized browser timezone (e.g., `Asia/Kolkata`, `America/New_York`, `UTC`) to determine calendar days (`YYYY-MM-DD`).
- Multiple tasks completed on the same calendar day increment the streak only once, while preserving the completion history.

### 3.4 Virtual Coin Economy & Item Shop
- Earn Gold Coins strictly by checking off real-world tasks and unlocking achievements.
- Spend coins on unlockable profile cosmetics:
  - **Character Titles**: "Novice Adventurer", "Code Wizard", "Iron Lifter", "Scholar of the Realm"
  - **Profile Frames**: "Golden NES Border", "Emerald Leaf Frame", "Arcane Glow", "Fire Flower Frame"
  - **UI Themes**: "Classic Dark", "Super Mario Sky", "Emerald Forest", "Arcane Purple"
- Immutable double-entry ledger (`currency_transactions`) prevents duplicate purchases and negative coin balances.

### 3.5 Backpack & Cosmetic Customization
- The **Backpack** (`/inventory`) displays all items you've unlocked from the Item Shop.
- Click **"Equip"** to activate any title, frame, or theme.
- Equipping updates your Top Bar and Profile instantly and persists across sessions.

### 3.6 Milestone Achievements
10 built-in milestone achievements that unlock automatically upon fulfilling specific criteria:
- ⚔️ **First Steps**: Complete your very first task.
- 🔥 **Week Warrior**: Maintain an unbroken 7-day daily streak.
- 🛡️ **Centurion**: Accumulate 1,000 Total XP.
- 👑 **Quest Master**: Complete 25 tasks.
- 🍄 **Grand Scholar**: Reach 500 Intellect XP.
- 💪 **Powerhouse**: Reach 500 Strength XP.
- ⭐ **Iron Will**: Reach 500 Discipline XP.
- 🎨 **Master Artisan**: Reach 500 Creativity XP.
- 🌿 **Living Legend**: Reach 500 Vitality XP.
- 🤝 **People's Champion**: Reach 500 Social XP.

### 3.7 Animated 2D Mario Companion Guide
A dedicated companion component ([`MarioGuide.tsx`](file:///D:/Projects/LifeRPG/src/components/ui/MarioGuide.tsx)) guides users through every screen:
- **Pixelated 2D Character**: Authentic Mario sprite with breathing bobbing animation (`.animate-mario-bob`) and jump bounce (`.animate-mario-jump`).
- **Route-Aware Guidance**: Automatically displays helpful, plain-English tips depending on whether you are on the Dashboard, My Tasks, Profile & Skills, Item Shop, Backpack, Achievements, or History.
- **Interactive Controls**:
  - `◀` / `▶ Next`: Browse through multiple tips for the current page.
  - `↔`: Toggle Mario between the left and right sides of the screen.
  - `_` / `💬`: Minimize to a subtle corner chat bubble or expand to full guide mode.
  - **Tap Mario to Jump**: Clicking Mario triggers an authentic NES jump sound and jump animation!
- **Responsive Positioning**: Pinned cleanly to screen margins with z-index isolation so it never blocks buttons or inputs.

### 3.8 Procedural Chiptune Sound Engine
Built entirely with the browser's native **Web Audio API** ([`soundEngine.ts`](file:///D:/Projects/LifeRPG/src/lib/sound/soundEngine.ts)):
- **Zero MP3/WAV assets**: 100% procedural square-wave and noise synthesis. Zero network requests, zero broken audio links, zero latency.
- **Audio Synthesized Effects**:
  - `playJump()`: Classic rising 150Hz → 350Hz pitch jump glide.
  - `playCoin()`: Two-tone B5 (987Hz) to E6 (1318Hz) arcade coin ding.
  - `playPowerUp()`: 5-note rising arpeggio (C4-E4-G4-C5-G5).
  - `playLevelUp()`: Multi-oscillator 8-bit fanfare with victory octave leaps.
  - `playPowerDown()`: Downward 300Hz → 90Hz buzz on cancel or errors.
  - `playAchievement()`: Grand major chord triumphal chime.
- **Sound Toggle**: Easy mute button in the top navigation bar, saved to `localStorage` and user profile settings.

---

## 4. System Architecture

### 4.1 Architecture Diagram

```mermaid
graph TB
    subgraph Client["Frontend Client (Next.js 15 + React 19)"]
        UI["2D Mario NES UI & Layout\n(Sidebar, TopBar, MarioGuide)"]
        State["GameProvider (React Context)\nOptimistic UI & Cache"]
        Audio["Web Audio Chiptune Synthesizer"]
        Confetti["Canvas Confetti Celebrations"]
    end

    subgraph API["Next.js Server API Routes (/api/*)"]
        AuthMiddleware["JWT Session Verification\n(HTTP-only Cookies via jose)"]
        ZodValidator["Zod Schema Validation\n(Auth, Quests, Shop, Profile)"]
        RouteHandlers["REST Handlers\n(/character, /quests, /shop, etc.)"]
    end

    subgraph CoreEngine["Server-Authoritative Game Engine"]
        Repo["GameRepository\n(Transactional Logic)"]
        ProgEngine["Progression Engine\n(XP, Levels, Attributes)"]
        StreakEngine["Streak Engine\n(Timezone Calendar Evaluation)"]
        AchEngine["Achievement Engine\n(Automated Milestone Checker)"]
    end

    subgraph Storage["Persistence Layer"]
        DB["PostgreSQL / Supabase\n(Prisma ORM with Migrations)"]
        MemoryStore["GlobalThis In-Memory Store\n(Instant Zero-Config Fallback)"]
    end

    UI --> State
    State --> Audio
    State --> Confetti
    State -->|HTTP Fetch with Cookie| AuthMiddleware
    AuthMiddleware --> ZodValidator
    ZodValidator --> RouteHandlers
    RouteHandlers --> Repo
    Repo --> ProgEngine
    Repo --> StreakEngine
    Repo --> AchEngine
    Repo -->|Prisma Available?| DB
    Repo -->|Fallback Mode| MemoryStore
```

### 4.2 Server-Authoritative Progression
In Life RPG, client requests never specify XP, level, or gold values.
1. When a user clicks complete on a task:
   `POST /api/quests/{id}/complete` sends `{ idempotencyKey: "client_..." }`.
2. The server loads the quest record and verifies:
   - Does this quest belong to the requesting user?
   - Has this quest already been completed today (if daily/weekly)?
   - Is the idempotency key unique?
3. The server computes reward amounts based on the quest's difficulty and attribute category.
4. Inside an atomic transaction:
   - Creates a record in `quest_completions`.
   - Inserts immutable ledger entries in `xp_transactions` and `currency_transactions`.
   - Increments `characters.total_xp` and `characters.gold`.
   - Increments the attribute's `current_xp` in `attributes`.
   - Re-evaluates character level and attribute levels.
   - Evaluates and updates the user's `streaks` record.
   - Checks if any of the 10 milestone achievements were satisfied.
5. The server returns the updated character state, new level, gold earned, and any unlocked achievements to the client.

### 4.3 Zero-Latency Sub-50ms Architecture
To ensure silky-smooth navigation without waiting on remote database roundtrips during local development or demo testing:
- **Global Store Persistence**: Next.js development mode isolates route handler modules. By anchoring the demo data store to `globalThis.memoryStore`, data persists flawlessly across tab switches and API calls.
- **Fast-Fail Database Probing**: If PostgreSQL is offline, `checkPrisma()` detects this on startup with a fast 150ms probe and caches the result on `globalThis.isPrismaAvailable`. Subsequent tab switches return in **sub-30ms**, eliminating the 2.5s network timeouts typical of unhandled database probes.

---

## 5. Mathematical Formulas & Progression Curves

### Character Level Curve
Leveling up uses a non-linear scaling curve so early levels feel brisk and motivating, while higher tiers represent sustained real-world discipline:

$$\text{XP to reach Level } N = \left\lfloor 100 \times (N - 1)^{1.5} \right\rfloor$$

$$\text{Level for given XP} = \left\lfloor 1 + \left( \frac{\text{XP}}{100} \right)^{\frac{2}{3}} \right\rfloor$$

| Level | Total XP Required | Delta from Previous Level |
|:---:|:---:|:---:|
| **Level 1** | 0 XP | — |
| **Level 2** | 100 XP | 100 XP |
| **Level 3** | 282 XP | 182 XP |
| **Level 4** | 519 XP | 237 XP |
| **Level 5** | 800 XP | 281 XP |
| **Level 10** | 2,700 XP | 520 XP |
| **Level 20** | 8,284 XP | 988 XP |

### Attribute Skill Curve
Individual Life Skills (Intellect, Strength, etc.) progress according to a quadratic threshold:

$$\text{Attribute XP for Tier } T = 100 \times (T - 1)^2$$

$$\text{Attribute Tier for given XP} = \left\lfloor 1 + \sqrt{\frac{\text{Attribute XP}}{100}} \right\rfloor$$

---

## 6. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15+ (App Router) | Server-side rendering, API route handlers, optimized bundle splitting |
| **Language** | TypeScript 5.7 (Strict Mode) | Full type safety across frontend components, backend APIs, and repositories |
| **UI Library** | React 19 | Server and Client Components with React hooks |
| **Styling** | Tailwind CSS + Custom Tokens | Pixel NES colors, Mario shadows, responsive breakpoints |
| **Animation** | Framer Motion & Canvas-Confetti | Smooth micro-animations and celebration fireworks |
| **Icons** | Lucide React | Pixel-aligned functional icons |
| **Audio** | Native Browser Web Audio API | Zero-dependency procedural 8-bit chiptune sound engine |
| **Database** | PostgreSQL (Supabase compatible) | Relational integrity, foreign keys, unique constraints, and check guards |
| **ORM** | Prisma ORM 6.4 | Type-safe queries, migrations, connection pooling |
| **Auth** | Jose JWT + BcryptJS | Signed session cookies with HTTP-only, Secure, and SameSite=Lax flags |
| **Validation** | Zod 3.24 | Strict request body validation across all endpoints |
| **Testing** | Vitest 3.0 + React Testing Library | Fast unit math tests, integration suites, and E2E journeys |

---

## 7. Database Schema & Relational Design

The production database is structured into 11 relational models with strict foreign keys and cascading rules:

```
users (id, email, password_hash, created_at, updated_at)
  │
  ├── 1:1 ── profiles (id, user_id, display_name, avatar, timezone, sound_enabled, theme, onboarded)
  ├── 1:1 ── characters (id, user_id, name, level, total_xp, gold, equipped_title_id, equipped_frame_id, equipped_theme_id)
  │            │
  │            └── 1:N ── attributes (id, character_id, type [INTELLECT, STRENGTH...], current_xp, level)
  │
  ├── 1:1 ── streaks (id, user_id, current_streak, longest_streak, last_active_date)
  │
  ├── 1:N ── quests (id, user_id, title, description, category_id, difficulty, attribute_type, cadence, status)
  │            │
  │            └── 1:N ── quest_completions (id, quest_id, user_id, completed_at, xp_earned, gold_earned, idempotency_key)
  │
  ├── 1:N ── xp_transactions (id, user_id, amount, source_type, source_id, created_at)
  ├── 1:N ── currency_transactions (id, user_id, amount, type [CREDIT/DEBIT], source, created_at)
  ├── 1:N ── user_inventory (id, user_id, item_id, is_equipped, acquired_at)
  └── 1:N ── user_achievements (id, user_id, achievement_id, unlocked_at)

shop_items (id, name, description, category, price, icon, preview_value)
achievements (id, code, name, description, icon, reward_xp, reward_gold, criteria_type, criteria_threshold)
```

---

## 8. REST API Endpoints Reference

All API routes are protected by session cookie verification unless marked as **Public**.

| Endpoint | Method | Access | Description |
|---|:---:|:---:|---|
| `/api/auth/register` | `POST` | Public | Register new user with email, password, and character details |
| `/api/auth/login` | `POST` | Public | Authenticate user, issue HTTP-only session cookie |
| `/api/auth/logout` | `POST` | Public | Invalidate session cookie and log out |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current user profile, character stats, streak, and skills |
| `/api/character` | `GET` | Authenticated | Fetch full character progression, level progress, and all 6 life skills |
| `/api/quests` | `GET` | Authenticated | Fetch user tasks with optional `?status=ACTIVE` query parameter |
| `/api/quests` | `POST` | Authenticated | Create a new task (validates difficulty, cadence, and attribute via Zod) |
| `/api/quests/[id]` | `PUT` | Authenticated | Update task details or archive status |
| `/api/quests/[id]` | `DELETE` | Authenticated | Soft-delete / remove a task |
| `/api/quests/[id]/complete` | `POST` | Authenticated | Server-authoritative task completion with idempotency verification |
| `/api/shop` | `GET` | Authenticated | Fetch cosmetic shop catalog and user's current gold balance |
| `/api/shop/purchase` | `POST` | Authenticated | Purchase a cosmetic item with balance verification and ledger debit |
| `/api/inventory` | `GET` | Authenticated | Fetch user's acquired cosmetic inventory |
| `/api/inventory/equip` | `POST` | Authenticated | Equip or unequip an acquired title, frame, or theme |
| `/api/achievements` | `GET` | Authenticated | Fetch all milestone achievements with unlocked status |
| `/api/history` | `GET` | Authenticated | Fetch task completion log with date filtering |
| `/api/onboarding` | `POST` | Authenticated | Complete onboarding preferences (theme, focus skill, hero handle) |

---

## 9. Security & Anti-Cheat Architecture

1. **Zero Client Authority**: The frontend never determines XP gains, gold payouts, or streak milestones. The server calculates and commits all progression inside transactions.
2. **Double-Entry Financial Ledgers**: Every gold and XP mutation creates an immutable audit row in `currency_transactions` and `xp_transactions`. The server checks balances before authorizing purchases.
3. **Idempotency Protection**: Rapid double-clicking or network retries on the complete button cannot award duplicate rewards. Completions require unique idempotency keys and compound unique database constraints (`quest_id` + `calendar_date`).
4. **Strict Tenant Boundaries**: All queries enforce `WHERE user_id = session.userId`. No user can access or modify another player's tasks, inventory, or profile.
5. **Secure Authentication**: Uses high-entropy signed JWTs stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies with 30-day expiration and Bcrypt-hashed passwords.

---

## 10. Project Directory Structure

```
LifeRPG/
├── prisma/
│   ├── schema.prisma             # PostgreSQL schema, models, relational constraints
│   └── seed.ts                   # Seed script for catalog items and achievements
├── src/
│   ├── app/
│   │   ├── (auth)/               # Public authentication pages
│   │   │   ├── login/page.tsx    # Login + 1-Click Demo generator
│   │   │   ├── signup/page.tsx   # Account registration
│   │   │   └── forgot-password/  # Password reset flow
│   │   ├── (dashboard)/          # Authenticated app routes
│   │   │   ├── dashboard/        # Command center with Mario Question Block
│   │   │   ├── quests/           # "My Tasks" management
│   │   │   ├── character/        # "Profile & Skills" (6 Life Skills)
│   │   │   ├── inventory/        # "Backpack" cosmetic equipment
│   │   │   ├── shop/             # "Item Shop"
│   │   │   ├── achievements/     # Milestone achievement showcase
│   │   │   ├── history/          # Task completion history
│   │   │   ├── settings/         # Theme, sound, and profile settings
│   │   │   └── onboarding/       # Starter tutorial & preference setup
│   │   ├── api/                  # 14 REST API route handlers
│   │   ├── globals.css           # 2D Mario NES design tokens & pixel styles
│   │   └── layout.tsx            # App root shell with fonts and sound engine
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # Main wrapper mounting TopBar, Sidebar, MarioGuide
│   │   │   ├── TopBar.tsx        # Mario HUD: Level, Coins, Streak, Sound Toggle
│   │   │   ├── Sidebar.tsx       # Desktop pixel sidebar navigation
│   │   │   └── MobileNav.tsx     # Mobile bottom thumb-bar navigation
│   │   ├── progression/
│   │   │   └── LevelUpModal.tsx  # Arpeggio celebration modal with confetti
│   │   ├── providers/
│   │   │   └── GameProvider.tsx  # Global state, optimistic UI, sound controls
│   │   ├── quests/
│   │   │   └── CreateQuestModal  # Modal to create custom tasks & habits
│   │   └── ui/
│   │       ├── MarioGuide.tsx    # Animated 2D Mario companion guide
│   │       └── Toast.tsx         # Pixel toast notification banner
│   ├── lib/
│   │   ├── auth/                 # JWT sessions, cookies, bcrypt
│   │   ├── db/                   # Prisma database client singleton
│   │   ├── game-engine/          # XP curve math, streak logic, achievement rules
│   │   ├── sound/                # Procedural Web Audio API NES chiptune synthesizer
│   │   └── validation/           # Zod schemas for auth, quests, and shop
│   └── server/
│       └── repositories/         # GameRepository with PostgreSQL & memory fallback
├── tests/
│   ├── unit/                     # Math formulas, XP curve, and streak unit tests
│   ├── integration/              # Game engine transactions, auth, and ledger tests
│   └── e2e/                      # Full user journey (Signup -> Quest -> LevelUp -> Shop)
├── ARCHITECTURE.md               # Detailed architectural specification
├── package.json
└── README.md
```

---

## 11. Getting Started & Local Development

### Prerequisites
- **Node.js**: Version 18.0 or higher (fully compatible with Node 20, 22, and 24)
- **Package Manager**: `npm` (comes with Node.js) or `pnpm`
- **Database** *(Optional)*: PostgreSQL instance (local or remote Supabase). Not strictly required to test or develop thanks to the zero-config demo store.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/LifeRPG.git
cd LifeRPG
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

Review the configuration options:
```ini
# PostgreSQL connection string (Supabase, local PostgreSQL, or Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/liferpg?schema=public"

# High-entropy JWT secret key for session signing (minimum 32 characters)
JWT_SECRET="liferpg_super_secret_session_key_minimum_32_characters_long_12345"

# Enables instant zero-config testing with the built-in memory store fallback
DEMO_STORAGE_FALLBACK="true"
```

### 3. Run Modes

#### Option A: Instant Zero-Config Demo (No Database Required)
You can start immediately without installing or running PostgreSQL. The application automatically detects that PostgreSQL is offline and switches to the built-in in-memory fallback store with zero latency.

#### Option B: Full PostgreSQL / Supabase Setup
If you want persistence across server restarts using a live database:
```bash
# Generate Prisma client types
npm run db:generate

# Push schema directly to your PostgreSQL database
npm run db:push

# Seed catalog items, shop goods, and achievements
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

- Click **"⚡ TRY 1-CLICK DEMO"** on the landing page or login screen to immediately log in with an auto-provisioned hero account!

---

## 12. Automated Test Suite & Quality Assurance

Life RPG maintains a comprehensive **35-test automated test suite** covering pure mathematical logic, database transactions, anti-cheat limits, and end-to-end user journeys:

```bash
# Run all 35 tests via Vitest
npm test
```

### Test Suite Breakdown

| Suite | File | Tests | Coverage Scope |
|---|---|:---:|---|
| **Unit Progression** | `tests/unit/progression.test.ts` | 13 | XP-to-level curves, attribute calculations, level bounds, localized timezone streak edge-cases |
| **Game Engine Integration** | `tests/integration/gameEngine.test.ts` | 7 | User creation, attribute provisioning, atomic task completion, ledger audits, shop purchasing |
| **Security & Edge Cases** | `tests/integration/securityAndEdgeCases.test.ts` | 9 | Idempotency duplicates, negative gold prevention, cross-tenant isolation, level-up calculations |
| **E2E User Journey** | `tests/e2e/criticalUserJourney.test.ts` | 6 | Full journey: Signup → Create Task → Complete Task → Level Up → Refresh Rehydration → Shop Purchase |

### Additional Quality Checks
```bash
# Run strict TypeScript type verification (zero errors)
npm run typecheck

# Run Next.js code quality linter
npm run lint

# Run production build verification
npm run build
```

---

## 13. Production Deployment Guide

### Deploying on Vercel + Supabase (Recommended)

1. **Database Setup (Supabase)**:
   - Create a free project at [supabase.com](https://supabase.com).
   - Go to **Project Settings** → **Database** → **Connection String** (use Node.js / pooled port `6543`).
2. **Push Database Schema & Seed**:
   ```bash
   DATABASE_URL="your-supabase-connection-string" npx prisma db push
   DATABASE_URL="your-supabase-connection-string" npx tsx prisma/seed.ts
   ```
3. **Deploy on Vercel**:
   - Push your repository to GitHub.
   - Import the project into [Vercel](https://vercel.com).
   - In **Environment Variables**, set:
     - `DATABASE_URL`: Your Supabase connection string.
     - `JWT_SECRET`: A secure 64-character random string.
     - `DEMO_STORAGE_FALLBACK`: Set to `"false"` in production.
   - Click **Deploy**!

---

## 14. License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it for personal and commercial projects.
