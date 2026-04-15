# Issue Tracker + Sales CRM

A full-stack monorepo consisting of:

- **`/api`** — Node.js / Express REST API backed by a local **SQLite** database (Drizzle ORM)
- **`/frontend`** — Mobile-first **Next.js 16** Sales CRM PWA (React 19, Tailwind CSS v4, Zustand)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Prerequisites](#3-prerequisites)
4. [Quick Start](#4-quick-start)
5. [API Reference](#5-api-reference)
6. [Database Schema](#6-database-schema)
7. [Frontend Pages](#7-frontend-pages)
8. [Environment Variables](#8-environment-variables)
9. [Useful Scripts](#9-useful-scripts)
10. [From-Scratch Tutorial](#10-from-scratch-tutorial)

---

## 1. Project Overview

### API (`/api`)
A JSON REST API that tracks **issues** (tasks / habits), **entries** (completions), **tags**, and **users**. Built with:

| Tech | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server |
| TypeScript + `tsx` | Type-safe source with ESM support |
| Drizzle ORM | Type-safe SQL query builder |
| `better-sqlite3` | Embedded SQLite driver |
| Zod | Request validation schemas |
| `@faker-js/faker` | Seed script dummy data |
| Vitest | Unit / integration tests |
| Jose | JWT auth utilities |
| bcrypt | Password hashing |

### Frontend (`/frontend`)
A mobile-first Sales CRM web app. Designed for field sales agents to log leads, track follow-ups, and manage their shift. Built with:

| Tech | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework + routing |
| React 19 | UI library |
| Tailwind CSS v4 | Utility-first styling |
| Zustand (+ persist) | Client-side state (localStorage) |
| Lucide React | Icon set |

---

## 2. Repository Structure

```
issue-tracker/
├── api/                        # Express REST API
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle table definitions
│   │   │   ├── connection.ts   # SQLite database connection
│   │   │   └── seed.ts         # Faker-powered seed script
│   │   ├── middlewares/
│   │   │   └── validation.ts   # Zod request validation middleware
│   │   ├── routes/
│   │   │   ├── authRoutes.ts   # POST /api/auth/*
│   │   │   ├── issueRoutes.ts  # GET/POST /api/issues
│   │   │   ├── tagRoutes.ts    # CRUD /api/tags
│   │   │   └── userRoutes.ts   # CRUD /api/users
│   │   ├── server.ts           # Express app setup
│   │   └── index.ts            # Server entry point
│   ├── env.ts                  # Env schema + validation (Zod)
│   ├── drizzle.config.ts       # Drizzle Kit config
│   ├── .env                    # Local env vars (gitignored)
│   ├── .env.example            # Template for .env
│   ├── dev.db                  # SQLite database file (gitignored)
│   └── package.json
│
├── frontend/                   # Next.js Sales CRM
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── login/          # Login screen
│   │   │   ├── verify-otp/     # OTP verification (new device)
│   │   │   ├── forgot-password/
│   │   │   ├── change-password/
│   │   │   ├── shift-start/    # Shift start screen
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── leads/          # Lead list + filters
│   │   │   ├── lead-detail/    # Lead detail + activity log
│   │   │   ├── add-lead/       # Add / edit lead form
│   │   │   ├── follow-ups/     # Today's follow-up list
│   │   │   ├── settings/       # App settings
│   │   │   ├── sync/           # Data sync screen
│   │   │   ├── fingerprint-settings/
│   │   │   └── checkin/
│   │   ├── components/
│   │   │   ├── bottom-nav.tsx  # Persistent bottom navigation
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── snackbar.tsx
│   │   │   └── loading-overlay.tsx
│   │   └── lib/
│   │       └── store.ts        # Zustand global state
│   └── package.json
│
└── README.md
```

---

## 3. Prerequisites

| Tool | Min Version |
|---|---|
| Node.js | 20 LTS |
| npm | 9+ |

No external database or Docker is required — the API uses an embedded SQLite file.

---

## 4. Quick Start

### Clone & install

```bash
git clone https://github.com/farhankarim/issue-tracker.git
cd issue-tracker
```

### Start the API

```bash
cd api

# Install dependencies
npm install

# Copy env template and edit if needed
cp .env.example .env

# Push the SQLite schema (creates dev.db)
npm run db:push

# Seed dummy data (50 users, 100 issues, 20 tags, 200 entries, 150 issue-tag links)
npm run db:seed

# Start the dev server (hot-reload)
npm run dev
```

API is now running at **http://localhost:3000**

Smoke-test with:

```bash
curl http://localhost:3000/health
# { "status": "OK", "timestamp": "...", "service": "Issue Tracker API" }
```

### Start the Frontend

Open a second terminal:

```bash
cd frontend

npm install
npm run dev
```

Frontend is now running at **http://localhost:3001** (or the next available port).

Open it in a browser and log in with:

| Field | Value |
|---|---|
| Login ID | `user01` |
| Password | `Admin@12345` |

---

## 5. API Reference

Base URL: `http://localhost:3000`

### Health Check

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns service status |

### Authentication — `/api/auth`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in |
| `POST` | `/api/auth/logout` | Log out |
| `POST` | `/api/auth/refresh` | Refresh JWT token |

### Users — `/api/users`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get a single user |
| `POST` | `/api/users` | Create a user |
| `PUT` | `/api/users/:id` | Update a user |
| `DELETE` | `/api/users/:id` | Delete a user |

### Issues — `/api/issues`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/issues` | List all issues |
| `POST` | `/api/issues` | Create an issue |
| `POST` | `/api/issues/:id/complete` | Mark an issue complete |
| `GET` | `/api/issues/:id/stats` | Get stats for an issue |

**Create issue — request body:**

```json
{
  "title": "Fix login bug",
  "description": "The login page throws a 500 on empty password.",
  "status": "open"
}
```

`status` must be one of: `open`, `in_progress`, `closed`.

### Tags — `/api/tags`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/tags` | List all tags |
| `POST` | `/api/tags` | Create a tag |
| `GET` | `/api/tags/:id` | Get a tag |
| `PUT` | `/api/tags/:id` | Update a tag |
| `DELETE` | `/api/tags/:id` | Delete a tag |

---

## 6. Database Schema

All tables are stored in a local SQLite file (`api/dev.db`).

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT (UUID) | Primary key |
| `email` | TEXT | Unique |
| `username` | TEXT | Unique |
| `password` | TEXT | Hashed |
| `first_name` | TEXT | Optional |
| `last_name` | TEXT | Optional |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp |

### `issues`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT (UUID) | Primary key |
| `user_id` | TEXT | FK → `users.id` (cascade delete) |
| `name` | TEXT | Issue title |
| `description` | TEXT | Optional |
| `is_active` | INTEGER (boolean) | Defaults to `true` |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp |

### `entries`

Represents a single completion record for an issue.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT (UUID) | Primary key |
| `issue_id` | TEXT | FK → `issues.id` (cascade delete) |
| `completion_date` | INTEGER | Unix timestamp |
| `note` | TEXT | Optional |
| `created_at` | INTEGER | Unix timestamp |

### `tags`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT (UUID) | Primary key |
| `name` | TEXT | Unique |
| `color` | TEXT | Hex color, defaults to `#6b7280` |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp |

### `issueTags`

Join table between issues and tags.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT (UUID) | Primary key |
| `issue_id` | TEXT | FK → `issues.id` (cascade delete) |
| `tag_id` | TEXT | FK → `tags.id` (cascade delete) |
| `created_at` | INTEGER | Unix timestamp |

### Entity Relationship Diagram

```
users ──< issues ──< entries
               └──< issueTags >── tags
```

---

## 7. Frontend Pages

All pages use **client-side state** via Zustand (persisted to `localStorage`). There is currently no live connection to the backend API — the frontend operates standalone with in-memory dummy leads.

| Route | Description |
|---|---|
| `/` | Redirects to `/login` |
| `/login` | Login with ID + password or fingerprint |
| `/verify-otp` | OTP step for new device registration |
| `/forgot-password` | Password reset entry |
| `/change-password` | Change current password |
| `/shift-start` | Start / resume a shift before accessing the app |
| `/dashboard` | Summary cards (calls, visits, follow-ups) + speed-dial FAB |
| `/leads` | Lead list with search, channel, and status filters |
| `/lead-detail` | Full lead card with activity log |
| `/add-lead` | Form to create or edit a lead |
| `/follow-ups` | Today's scheduled follow-up calls and visits |
| `/settings` | Account, security, dark mode, sync, shift status |
| `/sync` | Manual data sync screen |
| `/checkin` | Location check-in |
| `/fingerprint-settings` | Manage biometric login |

### Default login credentials (hardcoded for demo)

| Field | Value |
|---|---|
| Login ID | `user01` |
| Password | `Admin@12345` |

After 3 failed attempts the account is blocked for **15 minutes**. After 5 failed attempts it is **permanently blocked** until the app's localStorage is cleared.

---

## 8. Environment Variables

Copy `api/.env.example` to `api/.env` and set the values:

```env
NODE_ENV=development
APP_STAGE=dev          # dev | test | production
PORT=3000
DATABASE_URL=./dev.db  # Path to SQLite file
JWT_SECRET=change-this-to-a-secure-secret-min-32-chars!!
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

> `DATABASE_URL` is a **file path** for SQLite, not a connection string.

---

## 9. Useful Scripts

### API (`cd api`)

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Node.js `--watch` hot-reload |
| Start | `npm start` | Production start |
| Tests | `npm test` | Run Vitest test suite |
| Test watch | `npm run test:watch` | Vitest interactive mode |
| Coverage | `npm run test:coverage` | Generate coverage report |
| Push schema | `npm run db:push` | Apply schema to SQLite via Drizzle Kit |
| Studio | `npm run db:studio` | Open Drizzle Studio (database GUI) |
| Seed | `npm run db:seed` | Insert dummy data |

### Frontend (`cd frontend`)

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Next.js dev with HMR |
| Build | `npm run build` | Production build |
| Start | `npm start` | Serve production build |
| Lint | `npm run lint` | ESLint |

---

## 10. From-Scratch Tutorial

This section walks through creating the entire project from scratch, explaining every decision.

---

### Step 1 — Scaffold the monorepo

```bash
mkdir issue-tracker && cd issue-tracker
mkdir api frontend
git init
```

Create a root `.gitignore`:

```
node_modules/
*.db
.env
dist/
.next/
```

---

### Step 2 — Bootstrap the API

```bash
cd api
npm init -y
```

Edit `package.json` — set `"type": "module"` and add scripts:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.ts",
    "start": "node src/index.ts",
    "test": "vitest run",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "node --import tsx/esm src/db/seed.ts"
  }
}
```

Install runtime dependencies:

```bash
npm install express cors helmet morgan bcrypt jose zod \
  drizzle-orm better-sqlite3 drizzle-zod \
  custom-env @epic-web/remember @faker-js/faker
```

Install dev dependencies:

```bash
npm install -D typescript tsx drizzle-kit \
  @types/node @types/express @types/bcrypt @types/cors \
  @types/better-sqlite3 vitest supertest @types/supertest \
  cross-env
```

---

### Step 3 — TypeScript config

Create `api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "include": ["src", "env.ts", "drizzle.config.ts"]
}
```

---

### Step 4 — Environment management

Create `api/env.ts`:

```ts
import { env as loadEnv } from 'custom-env'
import { z } from 'zod'

process.env.APP_STAGE = process.env.APP_STAGE || 'dev'
const isDevelopment = process.env.APP_STAGE === 'dev'
const isTesting = process.env.APP_STAGE === 'test'

if (isDevelopment) loadEnv()
else if (isTesting) loadEnv('test')

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_STAGE: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
})

export type Env = z.infer<typeof envSchema>
const env = envSchema.parse(process.env)

export const isProd = () => env.APP_STAGE === 'production'
export const isDev = () => env.APP_STAGE === 'dev'
export const isTest = () => env.APP_STAGE === 'test'

export { env }
export default env
```

> **Why Zod for env?** It validates the process environment at startup and gives type-safe access to every variable. The app crashes immediately with a clear error instead of silently using `undefined`.

Create `api/.env`:

```env
NODE_ENV=development
APP_STAGE=dev
PORT=3000
DATABASE_URL=./dev.db
JWT_SECRET=change-this-to-a-secure-secret-min-32-chars!!
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

---

### Step 5 — Define the database schema

Create `api/src/db/schema.ts`:

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()).notNull(),
  updateAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()).notNull(),
})

export const issues = sqliteTable('issues', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()).notNull(),
})

export const entries = sqliteTable('entries', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  issueId: text('issue_id')
    .references(() => issues.id, { onDelete: 'cascade' }).notNull(),
  completionDate: integer('completion_date', { mode: 'timestamp' })
    .$defaultFn(() => new Date()).notNull(),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()).notNull(),
})

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  color: text('color').default('#6b7280'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()).notNull(),
  updateAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()).notNull(),
})

export const issueTags = sqliteTable('issueTags', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  issueId: text('issue_id')
    .references(() => issues.id, { onDelete: 'cascade' }).notNull(),
  tagId: text('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()).notNull(),
})

// Relations (used by Drizzle's relational query API)
export const userRelations = relations(users, ({ many }) => ({
  issues: many(issues),
}))

export const issuesRelations = relations(issues, ({ one, many }) => ({
  user: one(users, { fields: [issues.userId], references: [users.id] }),
  entries: many(entries),
  issueTags: many(issueTags),
}))
```

> **SQLite type mapping:** SQLite has no native UUID, boolean, or timestamp types. Drizzle maps them to `text`, `integer` with a `mode` option so you still get the correct TypeScript types.

---

### Step 6 — Database connection

Create `api/drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit'
import env from './env.ts'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: { url: env.DATABASE_URL },
  verbose: true,
  strict: true,
})
```

Create `api/src/db/connection.ts`:

```ts
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema.ts'
import { env } from '../../env.ts'

const sqlite = new Database(env.DATABASE_URL)
sqlite.pragma('journal_mode = WAL')  // better write performance
sqlite.pragma('foreign_keys = ON')   // enforce FK constraints

export const db = drizzle(sqlite, { schema })
export default db
```

Apply the schema to create `dev.db`:

```bash
npm run db:push
# Drizzle Kit will print the SQL and ask for confirmation
```

---

### Step 7 — Seed dummy data

Create `api/src/db/seed.ts`:

```ts
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { users, issues, tags, issueTags, entries } from './schema.ts'
import { faker } from '@faker-js/faker'

const DB_PATH = process.env.DATABASE_URL || './dev.db'
const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
const db = drizzle(sqlite)

async function seed() {
  // Delete in FK-safe order: children before parents
  db.run('DELETE FROM issueTags')
  db.run('DELETE FROM entries')
  db.run('DELETE FROM issues')
  db.run('DELETE FROM tags')
  db.run('DELETE FROM users')

  const usersInserted = await db.insert(users).values(
    Array.from({ length: 50 }, () => ({
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }))
  ).returning()

  const tagsInserted = await db.insert(tags).values(
    Array.from({ length: 20 }, () => ({
      name: faker.word.noun() + faker.number.int({ min: 1, max: 999 }),
      color: faker.color.rgb({ format: 'hex' }),
    }))
  ).returning()

  const issuesInserted = await db.insert(issues).values(
    Array.from({ length: 100 }, () => ({
      userId: faker.helpers.arrayElement(usersInserted).id,
      name: faker.lorem.words({ min: 2, max: 5 }),
      description: faker.lorem.sentence(),
      isActive: faker.datatype.boolean(),
    }))
  ).returning()

  await db.insert(entries).values(
    Array.from({ length: 200 }, () => ({
      issueId: faker.helpers.arrayElement(issuesInserted).id,
      completionDate: faker.date.recent(),
      note: faker.lorem.sentence(),
    }))
  )

  await db.insert(issueTags).values(
    Array.from({ length: 150 }, () => ({
      issueId: faker.helpers.arrayElement(issuesInserted).id,
      tagId: faker.helpers.arrayElement(tagsInserted).id,
    }))
  )

  console.log('Seeding completed.')
}

seed()
  .then(() => sqlite.close())
  .catch((e) => { console.error(e); sqlite.close(); process.exit(1) })
```

Run it:

```bash
npm run db:seed
# Tables cleared.
# Inserted 50 users.
# Inserted 20 tags.
# Inserted 100 issues.
# Inserted 200 entries.
# Inserted 150 issue-tag links.
# Seeding completed.
```

---

### Step 8 — Validation middleware

Create `api/src/middlewares/validation.ts`:

```ts
import type { Request, Response, NextFunction } from 'express'
import { type ZodSchema, ZodError } from 'zod'

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: e.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        })
      }
      next(e)
    }
  }
}
```

> The middleware replaces `req.body` with the **parsed** (and narrowed) value, so downstream handlers receive the correct TypeScript type.

---

### Step 9 — Routes

Create `api/src/routes/issueRoutes.ts`:

```ts
import { Router } from 'express'
import { validateBody } from '../middlewares/validation.ts'
import { z } from 'zod'

const createIssueSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(5).max(1000),
  status: z.enum(['open', 'in_progress', 'closed']),
})

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'Get all issues' })
})

router.post('/', validateBody(createIssueSchema), (req, res) => {
  res.status(201).json({ message: 'issue created', data: req.body })
})

router.post('/:id/complete', (req, res) => {
  res.json({ message: `Mark issue ${req.params.id} complete` })
})

router.get('/:id/stats', (req, res) => {
  res.json({ message: `Get stats for issue ${req.params.id}` })
})

export default router
```

Repeat the same pattern for `authRoutes.ts`, `userRoutes.ts`, and `tagRoutes.ts`.

---

### Step 10 — Express server

Create `api/src/server.ts`:

```ts
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import authRoutes from './routes/authRoutes.ts'
import issueRoutes from './routes/issueRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import tagRoutes from './routes/tagRoutes.ts'
import { isTest } from '../env.ts'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev', { skip: () => isTest() }))

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/tags', tagRoutes)

export { app }
export default app
```

Create `api/src/index.ts`:

```ts
import { app } from './server.ts'
import { env } from '../env.ts'

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
})
```

---

### Step 11 — Bootstrap the frontend

```bash
cd ../frontend
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir   # we'll add src manually
```

Restructure into `src/app`, `src/components`, `src/lib` directories.

Install additional packages:

```bash
npm install zustand lucide-react
```

---

### Step 12 — Global state with Zustand

Create `frontend/src/lib/store.ts` using Zustand with the `persist` middleware so state survives page refreshes:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      // ... all state and actions
    }),
    { name: 'sales-crm-storage' }  // localStorage key
  )
)
```

> **Why Zustand?** It is minimal, has no boilerplate, and the `persist` middleware gives you offline state for free — critical for a field sales app that may have intermittent connectivity.

---

### Step 13 — Build the Login page

Key points from `frontend/src/app/login/page.tsx`:

1. Read `isLoggedIn` and account state from the store.
2. On successful login call `login(user)` — sets `isLoggedIn: true` in the store.
3. Redirect to `/verify-otp?flow=NewUser` for a new device, or `/shift-start` for a registered one.
4. After 3 wrong attempts → temporary 15-minute block (`blockAccount(Date.now() + 15*60*1000)`).
5. After 5 wrong attempts → permanent block.

---

### Step 14 — Bottom navigation

`frontend/src/components/bottom-nav.tsx` renders four tabs:

```ts
const tabs = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Leads',     icon: Users,           href: '/leads'     },
  { label: 'Follow-ups',icon: CalendarCheck,   href: '/follow-ups'},
  { label: 'Settings',  icon: Settings,        href: '/settings'  },
]
```

Pass the `activeTab` prop using the capitalized label string exactly:

```tsx
<BottomNav activeTab="Dashboard" />
<BottomNav activeTab="Leads" />
<BottomNav activeTab="Follow-ups" />
<BottomNav activeTab="Settings" />
```

---

### Step 15 — Pages that use `useSearchParams`

Any page that calls `useSearchParams()` (e.g. `/verify-otp`, `/checkin`) must wrap its content in a `<Suspense>` boundary to avoid Next.js 16 prerender errors:

```tsx
import { Suspense } from 'react'

function VerifyOtpContent() {
  const searchParams = useSearchParams()
  // ...
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpContent />
    </Suspense>
  )
}
```

---

### Step 16 — Dark mode

Toggle dark mode by adding/removing the `dark` class on `document.documentElement`:

```ts
// In settings page
useEffect(() => {
  if (darkMode) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}, [darkMode])
```

Define your CSS custom properties in `globals.css` under both `:root` and `.dark` selectors, and reference them throughout components with `var(--primary)`, `var(--surface)`, etc.

---

### Step 17 — Explore the database with Drizzle Studio

```bash
cd api
npm run db:studio
```

Opens a browser-based GUI at `https://local.drizzle.studio` where you can browse and edit all tables visually.

---

## Troubleshooting

**`DATABASE_URL` error on startup**  
Make sure `api/.env` exists and `DATABASE_URL` is set to a valid file path such as `./dev.db`.

**`dev.db` does not exist**  
Run `npm run db:push` inside `api/` to create it from the schema.

**Seed fails with FK constraint**  
This can happen if you interrupt a previous seed. Run the seed again — it deletes all rows in FK-safe order before inserting.

**Frontend shows blank screen on `/dashboard`**  
The dashboard redirects to `/shift-start` when no shift is active. Start a shift first.

**`useSearchParams` error in Next.js**  
Wrap the component that calls `useSearchParams()` inside `<Suspense>` — see [Step 15](#step-15--pages-that-use-usesearchparams).

---

## License

MIT
