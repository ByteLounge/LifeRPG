# Life RPG — Architecture & System Design Document

## 1. Executive Summary
**Life RPG** is a production-grade full-stack productivity web application that gamifies real-life habits and tasks using RPG progression systems. It transforms daily tasks into quests that yield Experience Points (XP), virtual currency (Gold), attribute development, streak continuity, and unlockable achievements and cosmetics.

This document details the architectural specifications across data models, server-authoritative engines, user experience flows, security boundaries, and validation criteria.

---

## 2. Core Architecture Principles
1. **Server-Authoritative Game Engine**: The client is strictly an optimistic presentation layer. XP, Gold, Attribute growth, Levels, Streaks, and Achievements are calculated and committed exclusively on the server inside atomic database transactions.
2. **Double-Ledger Immutability**: Progression XP and virtual currency are recorded as immutable transaction ledgers (`xp_transactions`, `currency_transactions`). Current balances are authoritative aggregates or synchronized balances guarded by database constraints.
3. **Idempotency & Concurrency Control**: Quest completions use idempotency keys and unique compound constraints (`quest_id`, `calendar_date` for repeatables or single-completion locks for one-offs) to prevent double-awarding from rapid clicks, network retries, or concurrent requests.
4. **Tenant Isolation**: Every database query and mutation strictly asserts `user_id = session.user.id`. No foreign ID access is permitted.
5. **Aesthetic Excellence ("Modern Fantasy RPG × Premium Productivity")**: A rich, cohesive dark fantasy design system with responsive layouts (desktop sidebar + mobile bottom navigation), accessible keyboard interactions, fluid Framer Motion micro-animations, and optional Web Audio synthetic sound effects.

---

## 3. Technology Stack

- **Framework**: Next.js 15 (App Router, Server Actions & REST API Route Handlers)
- **Language**: TypeScript (strict mode enabled)
- **Styling & UI**: Tailwind CSS, Framer Motion, Lucide React icons, Radix UI primitives
- **Database & ORM**: PostgreSQL via Prisma ORM (with typed migrations, connection pooling, and relational integrity)
- **Authentication**: Secure Session / Supabase Auth compatible token system with HTTP-only cookies
- **Validation**: Zod schema validation on all inputs and API boundaries
- **Testing**: Vitest & React Testing Library for unit/integration tests, Playwright for end-to-end tests
- **Sound**: Native Web Audio API procedural synthesis (zero external audio asset latency or 404s)

---

## 4. Database Schema Specification

### 4.1 Entities & Relational Design

```
+-------------------------------------------------------------+
|                          users                              |
| id (UUID, PK), email (UQ), password_hash, created_at, ...   |
+-------------------------------------------------------------+
                               | 1:1
+-------------------------------------------------------------+
|                         profiles                            |
| id (PK), user_id (FK, UQ), display_name, avatar, title_id   |
| theme, sound_enabled, timezone, created_at, updated_at      |
+-------------------------------------------------------------+
                               | 1:1
+-------------------------------------------------------------+
|                        characters                           |
| id (PK), user_id (FK, UQ), name, level, total_xp, gold      |
| equipped_frame_id, equipped_title_id, equipped_theme_id     |
+-------------------------------------------------------------+
                               | 1:N
+-------------------------------------------------------------+
|                        attributes                           |
| id (PK), character_id (FK), type (STRENGTH, INTELLECT, ...)|
| current_xp, level, updated_at                               |
+-------------------------------------------------------------+
                               | 1:N
+-------------------------------------------------------------+
|                          quests                             |
| id (PK), user_id (FK), title, description, category_id      |
| difficulty (EASY, MEDIUM, HARD, EPIC), attribute_type       |
| estimated_minutes, repeat_type (NONE, DAILY, WEEKLY)        |
| due_date, status (ACTIVE, COMPLETED, ARCHIVED)              |
+-------------------------------------------------------------+
                               | 1:N
+-------------------------------------------------------------+
|                     quest_completions                       |
| id (PK), quest_id (FK), user_id (FK), completed_at          |
| xp_earned, gold_earned, attribute_xp_earned, completion_date|
| idempotency_key (UQ)                                        |
+-------------------------------------------------------------+
                               | 1:N
+-------------------------------------------------------------+
|                      xp_transactions                        |
| id (PK), user_id (FK), amount, source_type, source_id, date |
+-------------------------------------------------------------+
                               | 1:N
+-------------------------------------------------------------+
|                   currency_transactions                     |
| id (PK), user_id (FK), amount, type (CREDIT/DEBIT), source  |
+-------------------------------------------------------------+
                               | 1:1
+-------------------------------------------------------------+
|                         streaks                             |
| id (PK), user_id (FK, UQ), current_streak, longest_streak   |
| last_active_date (YYYY-MM-DD), updated_at                   |
+-------------------------------------------------------------+
                               | 1:N
+-------------------------------------------------------------+
|                    user_achievements                        |
| id (PK), user_id (FK), achievement_id (FK), unlocked_at     |
| UNIQUE(user_id, achievement_id)                             |
+-------------------------------------------------------------+
                               | 1:N
+-------------------------------------------------------------+
|                      user_inventory                         |
| id (PK), user_id (FK), item_id (FK), is_equipped, acquired  |
| UNIQUE(user_id, item_id)                                    |
+-------------------------------------------------------------+
```

---

## 5. Progression Formulas & Math Specification

### 5.1 Level Curve Formula
Levels require exponential XP growth according to:
$$\text{XP\_TO\_LEVEL}(N) = \left\lfloor 100 \times N^{1.5} \right\rfloor$$

- **Level 1**: $0 \text{ XP}$
- **Level 2**: $100 \text{ XP}$
- **Level 3**: $282 \text{ XP}$
- **Level 4**: $520 \text{ XP}$
- **Level 5**: $800 \text{ XP}$
- **Level 10**: $3,162 \text{ XP}$
- **Level 20**: $8,944 \text{ XP}$
- **Level 50**: $35,355 \text{ XP}$

### 5.2 Quest Difficulty Reward Matrix
Rewards are deterministic based on difficulty level and cannot be overridden by client requests:

| Difficulty | XP Reward | Gold Reward | Attribute XP |
|---|---|---|---|
| **EASY** | 25 XP | 15 Gold | 15 Attribute XP |
| **MEDIUM** | 50 XP | 35 Gold | 30 Attribute XP |
| **HARD** | 100 XP | 80 Gold | 60 Attribute XP |
| **EPIC** | 250 XP | 200 Gold | 150 Attribute XP |

### 5.3 Daily Streak Resolution Engine
Streak evaluation accounts for the user's localized timezone:
1. Normalize current timestamp $T_{\text{now}}$ into localized calendar date $D_{\text{today}}$ (`YYYY-MM-DD`).
2. Fetch `last_active_date` $D_{\text{last}}$ from the user's `streaks` record.
3. Compute day delta $\Delta = D_{\text{today}} - D_{\text{last}}$:
   - If $\Delta == 0$: Quest already completed today; streak maintains current value.
   - If $\Delta == 1$: Consecutive day activity; `current_streak += 1`, `longest_streak = max(longest_streak, current_streak)`.
   - If $\Delta > 1$ or $D_{\text{last}} == \text{null}$: Inactivity gap; `current_streak = 1`.
4. Update `last_active_date = D_{\text{today}}`.

---

## 6. Security Model & Threat Mitigation

| Threat Vector | Mitigation Strategy |
|---|---|
| **Client-Side Reward Tampering** | Rewards are computed exclusively on the server from quest difficulty and global config. Client payloads specifying `xp` or `gold` are rejected. |
| **Double Completion / Replay Attacks** | Completion mutations enforce database-level uniqueness on `(quest_id, completion_date)` for recurring quests, or `status = COMPLETED` checks within an isolation transaction. |
| **IDOR / Tenant Leakage** | All database repository queries enforce `WHERE user_id = :authenticated_user_id`. |
| **Negative Currency Exploits** | Database constraint `CHECK (gold >= 0)` on `characters`, combined with atomic debit transactions verifying balance before inserting inventory records. |
| **Script / XSS Injections** | Strict Zod input sanitization, React JSX standard escaping, and Content-Security-Policy headers. |
| **Brute Force / DoS** | In-memory token bucket rate limiters on auth, quest completion, and purchase endpoints. |

---

## 7. Navigation & Page Map

- **Public**:
  - `/`: Hero landing page, feature showcase, interactive demo preview
  - `/login`: Secure email/password login
  - `/signup`: User registration
  - `/forgot-password`: Password recovery flow
- **Authenticated Shell**:
  - `/onboarding`: Character creation, focus attribute selection, starter kit setup
  - `/dashboard`: Primary hub (Character status card, today's quests, streak flame, attribute summary, daily challenge)
  - `/quests`: Full Quest Journal with filters (Difficulty, Attribute, Status), search, and creation modal
  - `/quests/[id]`: Individual quest detail, editing, and history breakdown
  - `/character`: Comprehensive RPG character sheet, attribute progress bars, equipped cosmetics, title picker
  - `/inventory`: Backpack view of owned avatar frames, titles, badges, and themes with equip/unequip toggles
  - `/shop`: Merchant emporium with items categorized by cosmetic type and purchase verification
  - `/achievements`: Trophy gallery showing unlocked and locked milestones with progress metrics
  - `/history`: Chronological audit ledger of all quest completions, XP gains, purchases, and level-ups
  - `/settings`: Profile details, timezone configuration, theme switcher, and sound toggle

---

## 8. Directory & File Organization

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── quests/
│   │   │   └── [id]/
│   │   ├── character/
│   │   ├── inventory/
│   │   ├── shop/
│   │   ├── achievements/
│   │   ├── history/
│   │   ├── settings/
│   │   └── onboarding/
│   ├── api/
│   │   ├── auth/
│   │   ├── quests/
│   │   ├── character/
│   │   ├── shop/
│   │   ├── inventory/
│   │   ├── achievements/
│   │   └── history/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # Buttons, Inputs, Cards, Dialogs, Badges
│   ├── layout/           # Sidebar, TopNav, MobileNav, Shell
│   ├── quests/           # QuestCard, QuestList, QuestCreateModal, QuestFilter
│   ├── character/        # CharacterCard, AttributeBar, TitleSelector
│   ├── progression/      # XPProgressBar, StreakFlame, LevelUpModal
│   ├── inventory/        # InventoryGrid, ItemCard
│   ├── shop/             # ShopGrid, ShopItemCard, PurchaseModal
│   └── achievements/     # AchievementCard, BadgeGrid
├── lib/
│   ├── auth/             # Session verification, password hashing, JWT/cookie
│   ├── db/               # Prisma client singleton, connection pooling
│   ├── game-engine/      # Centralized progression math, streak logic, achievement evaluator
│   ├── sound/            # Procedural Web Audio API sound synthesizer
│   ├── validation/       # Zod schemas for quests, auth, shop
│   └── utils/            # Date formatting, classNames, helpers
├── types/                # Shared TypeScript interfaces & DTOs
└── tests/                # Unit, integration, and E2E suites
```
