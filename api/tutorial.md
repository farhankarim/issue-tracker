# Issue Tracker API — Complete Course

> A hands-on, beginner-friendly guide to building a production-grade REST API
> with **Node.js**, **TypeScript**, **Express 5**, **Drizzle ORM**, **Zod**, and
> **Vitest**. We walk through every single file in the project so you
> understand not just *what* it does, but *why* every decision was made.

---

## Table of Contents

1. [What Are We Building?](#1-what-are-we-building)
2. [Prerequisites](#2-prerequisites)
3. [Project Structure at a Glance](#3-project-structure-at-a-glance)
4. [Technology Stack Overview](#4-technology-stack-overview)
5. [Getting the Project Running](#5-getting-the-project-running)
6. [Environment Configuration — `env.ts`](#6-environment-configuration--envts)
7. [Database Schema — `src/db/schema.ts`](#7-database-schema--srcdbschemats)
8. [Database Connection — `src/db/connection.ts`](#8-database-connection--srcdbconnectionts)
9. [Seeding Fake Data — `src/db/seed.ts`](#9-seeding-fake-data--srcdbseedts)
10. [The Express Server — `src/server.ts`](#10-the-express-server--srcserverts)
11. [The Entry Point — `src/index.ts`](#11-the-entry-point--srcindexts)
12. [Validation Middleware — `src/middlewares/validation.ts`](#12-validation-middleware--srcmiddlewaresvalidationts)
13. [Routes — `src/routes/`](#13-routes--srcroutes)
    - [Auth Routes](#auth-routes--srcRoutesauthRoutests)
    - [User Routes](#user-routes--srcRoutesuserRoutests)
    - [Issue Routes](#issue-routes--srcroutesissueroutests)
    - [Tag Routes](#tag-routes--srcroutestagRoutests)
14. [Drizzle Configuration — `drizzle.config.ts`](#14-drizzle-configuration--drizzleconfigts)
15. [TypeScript Configuration — `tsconfig.json`](#15-typescript-configuration--tsconfigjson)
16. [Testing with Vitest — `vitest.config.ts` & `tests/`](#16-testing-with-vitest--vitestconfigts--tests)
17. [All NPM Scripts Explained](#17-all-npm-scripts-explained)
18. [HTTP Concepts Every API Developer Needs](#18-http-concepts-every-api-developer-needs)
19. [How Authentication Works (JWT + bcrypt)](#19-how-authentication-works-jwt--bcrypt)
20. [Project Conventions & Code Style](#20-project-conventions--code-style)
21. [Next Steps — Implementing the Stubs](#21-next-steps--implementing-the-stubs)
22. [CRUD Deep Dive — Concept Reference](#22-crud-deep-dive--concept-reference)
23. [Users — CRUD Operations & UI](#23-users--crud-operations--ui)
24. [Issues — CRUD Operations & UI](#24-issues--crud-operations--ui)
25. [Tags — CRUD Operations & UI](#25-tags--crud-operations--ui)
26. [Auth — Operations & UI](#26-auth--operations--ui)
27. [Connecting a Frontend to the API](#27-connecting-a-frontend-to-the-api)

---

## 1. What Are We Building?

We are building the **back-end API** for an Issue Tracker application — think
of a lightweight version of GitHub Issues or Jira.

The system allows users to:

- **Register / log in** with an email and password.
- **Create issues** (bugs, tasks, anything you want to track).
- **Mark issues complete** and log *entries* (completion events with notes).
- **Tag issues** so they can be categorised and filtered.

The API follows the **REST** (Representational State Transfer) architectural
style, which means:

- Everything is a **resource** (users, issues, tags …).
- We interact with resources using standard **HTTP verbs** (`GET`, `POST`,
  `PUT`, `DELETE`).
- We communicate using **JSON** (JavaScript Object Notation).

---

## 2. Prerequisites

Before you start you should have a basic understanding of:

| Topic | Why you need it |
|---|---|
| JavaScript (ES2020+) | All our code compiles down to JS |
| Basic command-line usage | Running scripts and installing packages |
| What an API is | We're building one |

You will need the following software installed:

```
Node.js  ≥ 22      (uses --experimental-strip-types to run .ts files directly)
npm      ≥ 10
git
A PostgreSQL database  (local via Docker, or a cloud service like Neon)
```

> **Tip — Neon is free**: If you don't want to install PostgreSQL locally,
> sign up at [neon.tech](https://neon.tech) and create a free project. You'll
> get a `postgresql://` connection string instantly.

---

## 3. Project Structure at a Glance

```
api/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Drizzle table definitions (your "model layer")
│   │   ├── connection.ts      # Creates a single database connection / pool
│   │   └── seed.ts            # Populates the database with fake data
│   ├── middlewares/
│   │   └── validation.ts      # Reusable Zod-powered request validators
│   ├── routes/
│   │   ├── authRoutes.ts      # /api/auth  — register, login, logout, refresh
│   │   ├── userRoutes.ts      # /api/users — CRUD on users
│   │   ├── issueRoutes.ts     # /api/issues — create, list, complete, stats
│   │   └── tagRoutes.ts       # /api/tags  — CRUD on tags
│   ├── server.ts              # Configures Express (middleware + routes)
│   └── index.ts               # Starts the HTTP server (listens on a port)
├── tests/
│   └── setup/
│       └── globalSetup.ts     # Runs once before all Vitest test suites
├── .env.example               # Template — copy to .env and fill in values
├── .gitignore
├── .prettierrc                # Code formatting rules
├── drizzle.config.ts          # Drizzle-kit CLI config (push, studio, migrate)
├── env.ts                     # Validates ALL environment variables with Zod
├── index.js                   # Legacy JS entry point (ignore for new code)
├── package.json
├── router.js                  # Legacy JS router (ignore for new code)
├── server.js                  # Legacy JS server (ignore for new code)
├── tsconfig.json              # TypeScript compiler options
└── vitest.config.ts           # Test runner config
```

> **Note on the `.js` files**: `server.js`, `router.js`, and `index.js` are
> earlier iterations of the project kept for reference. All new code lives
> inside the `src/` directory using TypeScript (`.ts` files).

---

## 4. Technology Stack Overview

### Node.js

Node.js lets you run JavaScript on the server. Version 22+ ships with
`--experimental-strip-types` which allows running `.ts` files *directly*
without a compilation step (TypeScript types are simply stripped out at
runtime). This is why the `dev` script is just `node --watch src/index.ts`.

### TypeScript

TypeScript is a superset of JavaScript that adds static type checking. A
variable annotated as `string` cannot accidentally hold a number — TypeScript
catches that mistake before your code ever runs.

We configure TypeScript via `tsconfig.json` (see [Section 15](#15-typescript-configuration--tsconfigjson)).

### Express 5

Express is the most popular HTTP framework for Node.js. Version 5 (released
2024) adds built-in async error handling: if a route handler throws, Express
automatically forwards the error to the error handler instead of crashing.

Key concepts:
- **`app`** — the Express application object.
- **Middleware** — functions that run between a request and response.
- **Router** — a mini-app that handles a subset of routes.

### Drizzle ORM

An ORM (Object-Relational Mapper) lets you interact with a SQL database using
JavaScript/TypeScript objects instead of raw SQL strings.

Drizzle's philosophy is **"SQL-in-TypeScript"**: your schema looks like SQL,
queries look like SQL, but everything is type-safe and auto-completed in your
editor.

### Zod

Zod is a schema validation library. You declare the shape of data you expect
(for example "this JSON object must have an `email` string and a `password`
at least 8 characters long"), and Zod throws a descriptive error if the
incoming data doesn't match.

We use Zod in two places:
1. To validate **environment variables** — the app refuses to start with bad config.
2. To validate **request bodies** — we reject bad input before it touches the database.

### jose (JWT)

`jose` is a JavaScript implementation of the JOSE standard (JSON Object Signing
and Encryption). We use it to create and verify **JSON Web Tokens (JWTs)** for
authentication. See [Section 19](#19-how-authentication-works-jwt--bcrypt) for
a full explanation.

### bcrypt

A one-way hashing algorithm specifically designed for passwords. We never store
plain-text passwords — we always store the bcrypt hash.

### Morgan

HTTP request logger. Every incoming request is logged to the console in
development, which helps you debug.

### Helmet

Sets a collection of security-related HTTP response headers. Protects against
common web vulnerabilities like clickjacking, MIME sniffing, etc.

### CORS

Cross-Origin Resource Sharing. Allows a web browser running on
`http://localhost:3001` to call your API on `http://localhost:3000`. Without
this, browsers block the request.

---

## 5. Getting the Project Running

### Step 1 — Clone and install dependencies

```bash
git clone <your-repo-url>
cd api
npm install
```

`npm install` reads `package.json` and downloads every library listed under
`dependencies` and `devDependencies` into the `node_modules/` folder.

### Step 2 — Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` in your editor and fill in:

```
DATABASE_URL=postgresql://user:password@localhost:5432/issue_tracker
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

The rest of the variables have sensible defaults and don't need changing during
development.

### Step 3 — Push the schema to your database

```bash
npm run db:push
```

This reads your Drizzle schema (`src/db/schema.ts`) and creates the tables in
your PostgreSQL database. No migration files needed — Drizzle computes the
diff automatically.

### Step 4 — (Optional) Seed with fake data

```bash
npm run db:seed
```

Populates the database with 1,000 users, 100 tags, 2,000 issues, 4,000 entries,
and 3,000 issue-tag relationships using the `@faker-js/faker` library.

### Step 5 — Start the development server

```bash
npm run dev
```

You should see:

```
server running on port: 3000
```

### Step 6 — Verify it works

Open your browser or use `curl`:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2026-04-17T13:00:00.000Z",
  "service": "Issue Tracker API"
}
```

---

## 6. Environment Configuration — `env.ts`

**File**: `api/env.ts`

```ts
import { env as loadEnv } from 'custom-env'
import { z } from 'zod'
```

`custom-env` is a tiny library that loads `.env.{stage}` files. In development
(`APP_STAGE=dev`) it loads `.env`. In test (`APP_STAGE=test`) it loads
`.env.test`. In production it does nothing — you set environment variables
through your hosting platform.

```ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_STAGE: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().positive().default(3000),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  JWT_SECRET: z.string().min(32, 'Must be 32 chars long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
})
```

This Zod schema is the **single source of truth** for what the app needs to
run. Notice:

- `z.coerce.number()` — environment variables are always strings; `coerce`
  converts `"3000"` to the number `3000` automatically.
- `.startsWith('postgresql://')` — catches a mistyped connection string early.
- `.min(32)` on `JWT_SECRET` — a short secret would make your JWTs insecure.

```ts
try {
  env = envSchema.parse(process.env)
} catch (e) {
  // ... log the specific missing/invalid variable, then:
  process.exit(1)
}
```

If any variable is missing or wrong, the process prints a clear error and
**exits immediately**. This is the "fail fast" pattern — a misconfigured app
should never silently start.

```ts
export const isProd = () => env.APP_STAGE === 'production'
export const isDev = () => env.APP_STAGE === 'dev'
export const isTest = () => env.APP_STAGE === 'test'
```

Convenient helper functions used throughout the codebase to check the
environment.

### Key takeaway

> Validate your config at startup. Never let the app run with undefined or
> invalid values.

---

## 7. Database Schema — `src/db/schema.ts`

**File**: `api/src/db/schema.ts`

Drizzle schemas are pure TypeScript — they live in your codebase, not in a
migration file. Let's walk through each table.

### `users`

```ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updateAt: timestamp('updated_at').defaultNow().notNull(),
})
```

- `uuid` — a universally unique identifier. Better than auto-increment integers
  for public-facing APIs because they can't be guessed.
- `.defaultRandom()` — the database generates the UUID automatically on insert.
- `.unique()` — enforces uniqueness at the database level (not just in code).
- `varchar(255)` vs `text` — `varchar` with a length limit enforces a maximum
  at the DB level; `text` is unlimited.

### `issues`

```ts
export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

- `.references(() => users.id, { onDelete: 'cascade' })` — this is a **foreign
  key**. Every issue belongs to a user. The arrow function (`() => users.id`)
  avoids circular reference issues during module initialisation.
- `onDelete: 'cascade'` — if a user is deleted, all their issues are deleted
  automatically.
- `isActive` — soft delete / archiving pattern. Instead of physically deleting
  rows, we set `isActive = false`.

### `entries`

An entry is a "completion event" — every time you mark progress on an issue,
a new entry row is created with a note and timestamp. This lets you track
history.

### `tags`

Plain label records with a name and a hex color.

### `issueTags`

This is a **junction table** (also called a bridge table or pivot table) that
implements a **many-to-many relationship** between issues and tags. One issue
can have many tags; one tag can appear on many issues.

```
issues ──< issueTags >── tags
```

### Relations

```ts
export const issuesRelations = relations(issues, ({ one, many }) => ({
  user: one(users, { fields: [issues.userId], references: [users.id] }),
  entries: many(entries),
  issueTags: many(issueTags),
}))
```

Drizzle `relations()` are **not enforced in the database** — they are metadata
for Drizzle's query builder so it knows how to JOIN tables when you ask for
related data.

### Inferred TypeScript types

```ts
export type User = typeof users.$inferSelect
export type Habit = typeof issues.$inferSelect   // naming inconsistency in the source
```

`$inferSelect` generates a TypeScript type from the table definition. You get
full type safety in query results without ever writing an interface manually.

### drizzle-zod

```ts
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
```

`drizzle-zod` automatically generates Zod schemas from your Drizzle table
definitions. These can be used directly for route validation, so your
validation always stays in sync with your schema.

---

## 8. Database Connection — `src/db/connection.ts`

**File**: `api/src/db/connection.ts`

```ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.ts'
import { env, isProd } from '../../env.ts'
import { remember } from '@epic-web/remember'
```

### Connection Pool (`pg.Pool`)

A **connection pool** maintains a fixed number of open database connections
and reuses them across requests. Opening a new TCP connection to PostgreSQL
for every HTTP request would be far too slow.

### `@epic-web/remember`

```ts
client = remember('dbPool', () => createPool())
```

Node.js `--watch` mode restarts the module system on file changes. Without
`remember`, every restart would create a new pool, leaking the old connections.
`remember` caches the pool globally (outside the module system) so it survives
hot reloads.

In production, we always create a fresh pool (no hot-reloading in prod).

### `drizzle({ client, schema })`

Creates the Drizzle query builder, passing both the connection and the schema
so it can provide type-safe query results.

```ts
export const db = drizzle({ client, schema })
```

Import `db` anywhere in the project to run queries.

---

## 9. Seeding Fake Data — `src/db/seed.ts`

**File**: `api/src/db/seed.ts`

```bash
npm run db:seed
```

The seed script uses `@faker-js/faker` to generate realistic-looking fake data
for development and testing.

```ts
const userData = Array.from({ length: 1000 }, () => ({
  email: faker.internet.email(),
  username: faker.internet.username(),
  // ...
}))
const usersInserted = await db.insert(users).values(userData).returning()
```

- `Array.from({ length: 1000 }, fn)` — creates an array of 1,000 items by
  calling the factory function for each index.
- `.returning()` — PostgreSQL returns the inserted rows; we need the generated
  `id` values so we can reference them in subsequent inserts.

The seeding order matters:
1. `users` first (needed by issues)
2. `tags` (independent)
3. `issues` (need `userId`)
4. `entries` (need `issueId`)
5. `issueTags` (need both `issueId` and `tagId`)

---

## 10. The Express Server — `src/server.ts`

**File**: `api/src/server.ts`

This file configures the Express application. It does **not** start listening
on a port — that job belongs to `index.ts`. This separation is important for
testing: you can import `app` without binding to a port.

```ts
const app = express()
```

### Middleware chain

```ts
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev', { skip: () => isTest() }))
```

Middleware runs in **order**. Every request passes through each `app.use()`
call before reaching a route handler.

| Middleware | What it does |
|---|---|
| `helmet()` | Sets secure HTTP headers |
| `cors()` | Adds CORS headers so browsers can call the API |
| `express.json()` | Parses `application/json` request bodies |
| `express.urlencoded()` | Parses `application/x-www-form-urlencoded` bodies (HTML forms) |
| `morgan('dev')` | Logs each request: method, URL, status code, duration |

`morgan` skips logging during tests (`isTest()`) to keep test output clean.

### Health check

```ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Issue Tracker API',
  })
})
```

A health endpoint is standard practice. Load balancers and monitoring tools
hit this endpoint periodically to know the service is alive.

### Route mounting

```ts
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/tags', tagRoutes)
```

Each router handles only routes relative to its mount point. For example
`userRoutes` defines `router.get('/')` and it becomes `GET /api/users/`.

---

## 11. The Entry Point — `src/index.ts`

**File**: `api/src/index.ts`

```ts
import { app } from './server.ts'
import { env } from '../env.ts'

app.listen(env.PORT, () => {
  console.log(`server running on port: ${env.PORT}`)
})
```

This is the **last** file to execute. It calls `app.listen()` which binds the
HTTP server to a TCP port and starts accepting connections.

Why is this separate from `server.ts`? So that tests can import `app` and run
HTTP requests against it using `supertest` without actually binding to a port
(which could conflict with other tests or instances).

---

## 12. Validation Middleware — `src/middlewares/validation.ts`

**File**: `api/src/middlewares/validation.ts`

This file exports three higher-order functions that create Express middleware
using a Zod schema.

### `validateBody(schema)`

```ts
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body)
      req.body = validatedData   // replaces body with parsed (type-safe) data
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
      next(e)  // unexpected error → pass to error handler
    }
  }
}
```

**Higher-order function** means a function that *returns* another function.
`validateBody` accepts a schema and returns a middleware function. The returned
function is what Express calls.

The response on validation failure looks like:

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "String must contain at least 2 character(s)" },
    { "field": "status", "message": "Invalid enum value" }
  ]
}
```

This tells the API consumer exactly what is wrong, field by field.

### `validateParams(schema)` and `validateQuery(schema)`

Same pattern, applied to URL parameters (`req.params`) and query strings
(`req.query`) respectively.

### Usage in routes

```ts
router.post('/', validateBody(createIssueSchema), (req, res) => {
  // req.body is now guaranteed to match createIssueSchema
})
```

The middleware runs before the route handler. If validation fails, `next()` is
never called and the route handler never runs — the 400 response is sent
immediately.

---

## 13. Routes — `src/routes/`

Routes map HTTP verb + URL patterns to handler functions. Each route file
creates a `Router` instance and exports it; `server.ts` mounts it under a
prefix.

### Auth Routes — `src/routes/authRoutes.ts`

```ts
router.post('/register', ...)   // POST /api/auth/register
router.post('/login', ...)      // POST /api/auth/login
router.post('/logout', ...)     // POST /api/auth/logout
router.post('/refresh', ...)    // POST /api/auth/refresh
```

All auth actions use `POST` because they create a resource or perform an
action that changes server state (creating a session, invalidating a token).

> **Current status**: These routes return stub responses like
> `{ message: 'User registered' }`. Implementing the full logic is the next
> step (see [Section 21](#21-next-steps--implementing-the-stubs)).

### User Routes — `src/routes/userRoutes.ts`

```ts
router.get('/', ...)         // GET    /api/users        — list all users
router.get('/:id', ...)      // GET    /api/users/:id    — get one user
router.post('/', ...)        // POST   /api/users        — create user
router.put('/:id', ...)      // PUT    /api/users/:id    — replace user
router.delete('/:id', ...)   // DELETE /api/users/:id    — delete user
```

`:id` is a **URL parameter**. Express captures the value from the URL and
makes it available as `req.params.id`.

This pattern is called **CRUD** (Create, Read, Update, Delete) and maps to:

| CRUD | HTTP Verb | Meaning |
|---|---|---|
| Create | POST | Add new data |
| Read | GET | Fetch data (never modifies) |
| Update | PUT / PATCH | Modify existing data |
| Delete | DELETE | Remove data |

### Issue Routes — `src/routes/issueRoutes.ts`

```ts
const createIssueSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(5).max(1000),
  status: z.enum(['open', 'in_progress', 'closed']),
})
```

Notice that `createIssueSchema` is defined **inside** the route file. For a
small schema that's only used in one place this is fine.

```ts
router.post('/', validateBody(createIssueSchema), (req, res) => {
  res.status(201).json({ message: 'issue created' })
})
```

`201 Created` is the correct status code when a new resource is created. `200
OK` would be wrong here.

```ts
router.post('/:id/complete', ...)    // POST /api/issues/:id/complete
router.get('/:id/stats', ...)        // GET  /api/issues/:id/stats
```

Nested routes represent **actions on a resource** (complete) or **sub-resources**
(stats).

### Tag Routes — `src/routes/tagRoutes.ts`

Standard CRUD for tags. No special validation yet.

---

## 14. Drizzle Configuration — `drizzle.config.ts`

**File**: `api/drizzle.config.ts`

```ts
import { defineConfig } from 'drizzle-kit'
import env from './env.ts'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: { url: env.DATABASE_URL },
  verbose: true,
  strict: true,
})
```

This file is only used by the **drizzle-kit CLI** (`npm run db:push`,
`npm run db:studio`).

| Option | Meaning |
|---|---|
| `schema` | Path to your Drizzle table definitions |
| `out` | Where to write SQL migration files |
| `dialect` | Database type |
| `dbCredentials` | Connection string (read from `env.ts`) |
| `verbose` | Print every SQL statement executed |
| `strict` | Abort if anything would cause data loss |

### The `db:push` command

```bash
npm run db:push
```

Drizzle reads your schema, connects to your database, inspects what tables
exist, and **pushes the differences**. Great for development — no migration
files to manage. In production you'd use `drizzle-kit generate` + `migrate`
to have a versioned migration history.

### The `db:studio` command

```bash
npm run db:studio
```

Opens Drizzle Studio — a browser-based GUI for browsing and editing your
database tables. Useful during development.

---

## 15. TypeScript Configuration — `tsconfig.json`

**File**: `api/tsconfig.json`

```json
{
  "compilerOptions": {
    "noEmit": true,
    "target": "esnext",
    "module": "nodenext",
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true,
    "types": ["vitest/globals"],
    "strict": true
  }
}
```

| Option | Explanation |
|---|---|
| `noEmit: true` | Don't produce `.js` output files — Node.js strips types at runtime |
| `target: "esnext"` | Use the latest JavaScript features |
| `module: "nodenext"` | Use Node.js native ESM (`.ts` imports must include the `.ts` extension) |
| `rewriteRelativeImportExtensions` | Allows `./foo.ts` imports (required with `nodenext`) |
| `erasableSyntaxOnly` | Disallows TypeScript features that can't be simply stripped (enums, decorators) |
| `verbatimModuleSyntax` | Forces explicit `import type` for type-only imports |
| `allowImportingTsExtensions` | Allows `import './foo.ts'` (needed since we don't emit JS) |
| `types: ["vitest/globals"]` | Makes `describe`, `it`, `expect` etc. available globally in tests |
| `strict: true` | Enables all strict type checks (no implicit `any`, strict null checks, etc.) |

---

## 16. Testing with Vitest — `vitest.config.ts` & `tests/`

**Files**: `api/vitest.config.ts`, `api/tests/setup/globalSetup.ts`

### Why Vitest?

Vitest is a modern test runner built on top of Vite. It's fast, it understands
TypeScript natively, and its API is compatible with Jest (so most resources
about Jest apply).

### Configuration

```ts
export default defineConfig({
  test: {
    globals: true,           // no need to import describe/it/expect
    globalSetup: ['./tests/setup/globalSetup.ts'],
    clearMocks: true,        // reset mock call history between tests
    restoreMocks: true,      // restore spied functions after each test
    pool: 'threads',
    poolOptions: {
      threads: { singleThread: true }  // run tests sequentially (safe for DB tests)
    }
  },
})
```

`singleThread: true` ensures tests run one at a time. This is important when
tests share a real database — running in parallel could cause two tests to
interfere with each other's data.

### Global setup

```ts
// tests/setup/globalSetup.ts
export async function setup() {
  process.env.APP_STAGE = 'test'
  process.env.NODE_ENV = 'test'
}

export async function teardown() {
  // nothing to clean up at the global level
}
```

`setup()` runs **once before any test file**. It sets the stage to `test` so
that `env.ts` loads `.env.test` for your test database URL.

### Running tests

```bash
npm run test          # run all tests once
npm run test:watch    # re-run on file changes
npm run test:coverage # generate coverage report
```

### Writing a test (example)

```ts
// tests/health.test.ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/server.ts'

describe('GET /health', () => {
  it('returns 200 OK', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('OK')
  })
})
```

`supertest` lets you make HTTP requests against your Express app in tests
**without starting a real server** — it wires directly into the Node.js HTTP
stack.

---

## 17. All NPM Scripts Explained

Defined in `package.json`:

| Script | Command | When to use |
|---|---|---|
| `npm run dev` | `node --watch src/index.ts` | Local development — auto-restarts on change |
| `npm start` | `node src/index.ts` | Production start (no watch mode) |
| `npm run test` | `vitest run` | Run all tests once (CI) |
| `npm run test:watch` | `vitest` | Run tests in watch mode (local dev) |
| `npm run test:coverage` | `vitest run --coverage` | Generate HTML coverage report |
| `npm run db:push` | `drizzle-kit push` | Apply schema changes to database |
| `npm run db:studio` | `drizzle-kit studio` | Open Drizzle's browser GUI |
| `npm run db:seed` | `node src/db/seed.ts` | Populate database with fake data |

---

## 18. HTTP Concepts Every API Developer Needs

### Status Codes

Your API must use the right status code — it tells the client what happened.

| Code | Name | Use it when |
|---|---|---|
| `200` | OK | Request succeeded, returning data |
| `201` | Created | New resource created |
| `204` | No Content | Success, nothing to return (e.g. DELETE) |
| `400` | Bad Request | Client sent invalid data |
| `401` | Unauthorised | No/invalid auth token provided |
| `403` | Forbidden | Authenticated but not allowed |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate (e.g. email already registered) |
| `422` | Unprocessable Entity | Validation error (alternative to 400) |
| `500` | Internal Server Error | Something unexpected went wrong on the server |

### Request anatomy

```
POST /api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{
  "email": "alice@example.com",
  "password": "hunter2"
}
```

- **Method** — `POST`
- **Path** — `/api/auth/login`
- **Headers** — metadata (content type, auth token, etc.)
- **Body** — the JSON payload

### Response anatomy

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { "id": "...", "email": "alice@example.com" }
}
```

---

## 19. How Authentication Works (JWT + bcrypt)

### Password storage with bcrypt

You **must never** store plain-text passwords.

When a user registers:
1. Take the plain-text password (`hunter2`).
2. Run it through `bcrypt.hash(password, rounds)` → produces a hash like
   `$2b$12$abcdef...`.
3. Store the hash in the `users.password` column.

When a user logs in:
1. Fetch the user by email.
2. Run `bcrypt.compare(plainTextPassword, storedHash)`.
3. bcrypt hashes the input and compares it against the stored hash. Returns
   `true` or `false`.
4. If `false`, return `401 Unauthorized`.

The `BCRYPT_ROUNDS` setting (default `12`) controls how slow the hashing is.
Higher = more CPU time = harder for attackers to brute force. 12 is the
recommended baseline.

### JSON Web Tokens (JWT)

A JWT is a compact, self-contained token that proves who you are.

**Structure**: `header.payload.signature` (each part is base64url-encoded)

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkLTEyMyIsImV4cCI6MTcxNDAwMDAwMH0.abc123
```

- **Header**: algorithm used (e.g. `HS256`)
- **Payload**: claims — `sub` (subject = user ID), `exp` (expiry timestamp),
  and any other data you want
- **Signature**: HMAC-SHA256 of header + payload using `JWT_SECRET`

**Login flow**:
1. User submits email + password.
2. Server verifies credentials.
3. Server calls `jose.SignJWT({ sub: user.id }).sign(secret)`.
4. Returns the token to the client.

**Authenticated request flow**:
1. Client stores token (localStorage, cookie, etc.)
2. Client sends token in header: `Authorization: Bearer <token>`
3. Server calls `jose.jwtVerify(token, secret)` — throws if expired or tampered.
4. Extracts `sub` (user ID) from payload.
5. Proceeds with the request.

**Why JWTs are secure**: The signature is computed using the secret key. Anyone
can decode the payload (it's just base64) but cannot *forge* a valid signature
without knowing `JWT_SECRET`. If anyone modifies even one character of the
payload, the signature check fails.

---

## 20. Project Conventions & Code Style

### Prettier

The project uses [Prettier](https://prettier.io) for automatic code formatting.
Config is in `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true
}
```

- No semicolons at the end of lines.
- Single quotes for strings (not double quotes).

Format all files:
```bash
npx prettier --write .
```

### ESM (ECMAScript Modules)

`"type": "module"` in `package.json` means all `.js`/`.ts` files use ESM
syntax (`import`/`export`) not CommonJS (`require`/`module.exports`).

Consequence: imports of local files **must include the file extension**:

```ts
// ✅ correct
import { db } from './db/connection.ts'

// ❌ wrong — Node.js can't resolve this in ESM
import { db } from './db/connection'
```

### File naming

| What | Convention | Example |
|---|---|---|
| Route files | camelCase + `Routes` | `authRoutes.ts` |
| Schema | lowercase | `schema.ts` |
| Config | camelCase + type | `drizzle.config.ts` |

### No semicolons

The project consistently omits semicolons (Prettier enforces this). JavaScript's
Automatic Semicolon Insertion (ASI) handles it.

---

## 21. Next Steps — Implementing the Stubs

Every route in the project currently returns a placeholder response. Here's
the roadmap for completing the API, in order of dependency.

### Phase 1 — Auth

Implement `POST /api/auth/register`:
1. Parse and validate body (use `drizzle-zod`'s `insertUserSchema`).
2. Check if email/username already exists — return `409` if so.
3. Hash the password with `bcrypt`.
4. Insert the user into the database.
5. Return `201` with the new user (excluding the password field!).

Implement `POST /api/auth/login`:
1. Find user by email — return `401` if not found.
2. `bcrypt.compare(password, user.password)` — return `401` if wrong.
3. Sign a JWT using `jose`.
4. Return `200` with the token.

Implement `POST /api/auth/logout`:
- If using stateless JWTs, you typically return `200` and let the client
  discard the token. For server-side invalidation, maintain a token blocklist.

### Phase 2 — Auth Middleware

Create an `authenticate` middleware in `src/middlewares/authenticate.ts`:
1. Read `Authorization` header.
2. Strip `Bearer ` prefix to get the raw token.
3. Call `jwtVerify(token, secret)`.
4. Attach the decoded payload (user ID) to `req.user`.
5. Call `next()`.

Mount this middleware on protected routes:
```ts
app.use('/api/users', authenticate, userRoutes)
app.use('/api/issues', authenticate, issueRoutes)
```

### Phase 3 — CRUD Handlers

For each resource (users, issues, tags), implement:

- `GET /` — `db.select().from(table)` with optional pagination.
- `GET /:id` — `db.select().from(table).where(eq(table.id, id))`, return `404`
  if not found.
- `POST /` — validate body, `db.insert(table).values(data).returning()`.
- `PUT /:id` — validate body, `db.update(table).set(data).where(eq(table.id, id))`.
- `DELETE /:id` — `db.delete(table).where(eq(table.id, id))`.

### Phase 4 — Issue-specific logic

- `POST /api/issues/:id/complete` — insert an `entries` row for the issue.
- `GET /api/issues/:id/stats` — aggregate query: count entries per day/week.

### Phase 5 — Tests

For each route group, write tests in `tests/`:

```
tests/
  auth.test.ts
  users.test.ts
  issues.test.ts
  tags.test.ts
```

Use `supertest` to make requests and assert the responses. Use a test database
(configure `DATABASE_URL` in `.env.test`). Before each test, run a transaction
and roll it back after so every test starts clean.

---

## Appendix A — Common Error Messages

| Error | Cause | Fix |
|---|---|---|
| `Invalid env var: DATABASE_URL` | No `.env` file or wrong URL format | Copy `.env.example` to `.env` and fill in values |
| `Invalid env var: JWT_SECRET` | Secret too short or missing | Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `connect ECONNREFUSED 127.0.0.1:5432` | PostgreSQL not running | Start your local Postgres or check Neon connection string |
| `relation "users" does not exist` | Schema not applied | Run `npm run db:push` |
| `No test files found` | No `.test.ts` files exist yet | Write your first test |

---

## Appendix B — Recommended Learning Resources

| Topic | Resource |
|---|---|
| TypeScript | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) |
| Express.js | [expressjs.com/guide](https://expressjs.com/en/guide/routing.html) |
| Drizzle ORM | [orm.drizzle.team/docs](https://orm.drizzle.team/docs/overview) |
| Zod | [zod.dev](https://zod.dev) |
| PostgreSQL | [postgresql.org/docs](https://www.postgresql.org/docs/) |
| JWT | [jwt.io introduction](https://jwt.io/introduction) |
| REST API design | [restfulapi.net](https://restfulapi.net) |
| HTTP status codes | [developer.mozilla.org/HTTP/Status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) |

---

---

## 22. CRUD Deep Dive — Concept Reference

CRUD stands for **Create, Read, Update, Delete**. These four operations map
directly to SQL statements and HTTP verbs, and together they cover almost
everything a REST API needs to do.

### The big picture

```
Browser / Mobile App
        │
        │  HTTP request  (verb + URL + JSON body)
        ▼
   Express Router
        │
        │  1. Auth middleware  — is the user logged in?
        │  2. Validation middleware — is the data valid?
        ▼
   Route Handler
        │
        │  3. Drizzle query  — talk to PostgreSQL
        ▼
   PostgreSQL
        │
        │  rows (typed TypeScript objects)
        ▼
   Route Handler
        │
        │  4. Format response  — pick the right status code + shape
        ▼
Browser / Mobile App
```

### The four operations and their SQL equivalents

| CRUD | HTTP Verb | SQL | Idempotent? |
|---|---|---|---|
| Create | `POST` | `INSERT` | No — each call creates a new row |
| Read | `GET` | `SELECT` | Yes — safe to repeat |
| Update | `PUT` / `PATCH` | `UPDATE` | `PUT` yes, `PATCH` yes (if well-designed) |
| Delete | `DELETE` | `DELETE` | Yes — deleting twice has the same result |

**Idempotent** means calling the operation twice produces the same result as
calling it once. `GET` is idempotent — reading data twice doesn't change
anything.

### Drizzle query patterns you will use repeatedly

#### SELECT all rows

```ts
import { db } from '../db/connection.ts'
import { issues } from '../db/schema.ts'

const allIssues = await db.select().from(issues)
// SQL: SELECT * FROM issues
```

#### SELECT with a WHERE clause

```ts
import { eq } from 'drizzle-orm'

const issue = await db.select().from(issues).where(eq(issues.id, id))
// SQL: SELECT * FROM issues WHERE id = $1
```

`eq` is Drizzle's equality operator. There are others: `ne` (not equal), `gt`
(greater than), `lt` (less than), `and`, `or`, `like`, `inArray`, etc.

#### INSERT and return the created row

```ts
const [newIssue] = await db
  .insert(issues)
  .values({ userId, name, description, isActive: true })
  .returning()
// SQL: INSERT INTO issues (...) VALUES (...) RETURNING *
```

`.returning()` tells PostgreSQL to hand back the inserted row including the
auto-generated `id` and `createdAt`. We destructure the array to get the
single inserted row.

#### UPDATE

```ts
const [updated] = await db
  .update(issues)
  .set({ name: newName, updatedAt: new Date() })
  .where(eq(issues.id, id))
  .returning()
// SQL: UPDATE issues SET name = $1, updated_at = $2 WHERE id = $3 RETURNING *
```

#### DELETE

```ts
await db.delete(issues).where(eq(issues.id, id))
// SQL: DELETE FROM issues WHERE id = $1
```

For a soft delete, use `UPDATE` instead:

```ts
await db.update(issues).set({ isActive: false }).where(eq(issues.id, id))
```

#### SELECT with a JOIN (related data)

```ts
import { eq } from 'drizzle-orm'

const issueWithUser = await db.query.issues.findFirst({
  where: eq(issues.id, id),
  with: { user: true, issueTags: { with: { tag: true } } },
})
```

This uses Drizzle's relational query API (`db.query`). It requires that you
pass `schema` to `drizzle()` (which our `connection.ts` already does).

#### Pagination

```ts
const PAGE_SIZE = 20

const page = Number(req.query.page) || 1
const offset = (page - 1) * PAGE_SIZE

const rows = await db
  .select()
  .from(issues)
  .limit(PAGE_SIZE)
  .offset(offset)
  .orderBy(issues.createdAt)
```

### Consistent response shapes

Always return data in a predictable shape. A good convention:

```json
// Single resource
{
  "data": { "id": "...", "name": "..." }
}

// Collection
{
  "data": [...],
  "meta": { "total": 42, "page": 1, "pageSize": 20 }
}

// Error
{
  "error": "Not Found",
  "message": "Issue with id abc123 does not exist"
}
```

---

## 23. Users — CRUD Operations & UI

### Resource overview

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Auto-generated, primary key |
| `email` | string | Unique, max 255 chars |
| `username` | string | Unique, max 50 chars |
| `password` | string | bcrypt hash — never return this |
| `firstName` | string (optional) | |
| `lastName` | string (optional) | |
| `createdAt` | timestamp | Auto set on insert |
| `updatedAt` | timestamp | Should be updated on every change |

---

### CREATE User

**API endpoint**: `POST /api/users`

**What it does**: Creates a new user account in the database.

#### Request

```http
POST /api/users
Content-Type: application/json

{
  "email": "alice@example.com",
  "username": "alice42",
  "password": "SuperSecret!1",
  "firstName": "Alice",
  "lastName": "Smith"
}
```

#### Validation rules (implement with Zod)

```ts
const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
})
```

#### Implementation steps

```ts
// 1. Validate body (middleware handles this)
// 2. Check for duplicate email/username
const existing = await db
  .select()
  .from(users)
  .where(or(eq(users.email, body.email), eq(users.username, body.username)))

if (existing.length > 0) {
  return res.status(409).json({ error: 'Email or username already taken' })
}

// 3. Hash the password
const hashedPassword = await bcrypt.hash(body.password, env.BCRYPT_ROUNDS)

// 4. Insert
const [user] = await db
  .insert(users)
  .values({ ...body, password: hashedPassword })
  .returning()

// 5. Return 201 — omit the password field!
const { password: _, ...safeUser } = user
return res.status(201).json({ data: safeUser })
```

#### Success response (`201 Created`)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "username": "alice42",
    "firstName": "Alice",
    "lastName": "Smith",
    "createdAt": "2026-04-17T13:00:00.000Z",
    "updatedAt": "2026-04-17T13:00:00.000Z"
  }
}
```

#### Error responses

| Situation | Status | Body |
|---|---|---|
| Invalid body | `400` | `{ "error": "Validation failed", "details": [...] }` |
| Email/username taken | `409` | `{ "error": "Email or username already taken" }` |
| DB error | `500` | `{ "error": "Internal Server Error" }` |

---

#### UI — Registration Page

```
+------------------------------------------+
|             Create an account            |
+------------------------------------------+
|  Email                                   |
|  +------------------------------------+  |
|  | alice@example.com                  |  |
|  +------------------------------------+  |
|                                          |
|  Username                                |
|  +------------------------------------+  |
|  | alice42                            |  |
|  +------------------------------------+  |
|                                          |
|  Password                                |
|  +------------------------------------+  |
|  | ............                       |  |
|  +------------------------------------+  |
|                                          |
|  First name (optional)  Last name        |
|  +--------------+  +------------------+  |
|  | Alice        |  | Smith            |  |
|  +--------------+  +------------------+  |
|                                          |
|  +----------------------------------+    |
|  |          Create account          |    |
|  +----------------------------------+    |
|                                          |
|  Already have an account? Sign in ->     |
+------------------------------------------+
```

**What happens when the button is clicked:**
1. Frontend validates the form locally (show inline errors before the request).
2. `POST /api/users` is called with the form data.
3. On `201` — redirect to login page with a success toast.
4. On `409` — highlight the email/username field with "already taken" message.
5. On `400` — show per-field errors returned in `details[]`.

---

### READ Users

#### List all users — `GET /api/users`

**What it does**: Returns a paginated list of all users.

```http
GET /api/users?page=1
Authorization: Bearer <token>
```

**Implementation:**

```ts
const page = Number(req.query.page) || 1
const limit = 20
const offset = (page - 1) * limit

const rows = await db
  .select({
    id: users.id,
    email: users.email,
    username: users.username,
    firstName: users.firstName,
    lastName: users.lastName,
    createdAt: users.createdAt,
  })
  .from(users)
  .limit(limit)
  .offset(offset)
  .orderBy(users.createdAt)

return res.json({ data: rows, meta: { page, pageSize: limit } })
```

> **Security note**: never select the `password` column in list/detail
> endpoints. Select only the specific columns you need.

#### Success response (`200 OK`)

```json
{
  "data": [
    { "id": "...", "email": "alice@example.com", "username": "alice42", ... },
    { "id": "...", "email": "bob@example.com",   "username": "bob99",   ... }
  ],
  "meta": { "page": 1, "pageSize": 20 }
}
```

---

#### Get one user — `GET /api/users/:id`

```http
GET /api/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Implementation:**

```ts
const { id } = req.params

const [user] = await db
  .select({ id: users.id, email: users.email, username: users.username,
            firstName: users.firstName, lastName: users.lastName, createdAt: users.createdAt })
  .from(users)
  .where(eq(users.id, id))

if (!user) {
  return res.status(404).json({ error: 'User not found' })
}

return res.json({ data: user })
```

#### Success response (`200 OK`)

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "username": "alice42",
    "firstName": "Alice",
    "lastName": "Smith",
    "createdAt": "2026-04-17T13:00:00.000Z"
  }
}
```

| Error situation | Status |
|---|---|
| `:id` not a valid UUID | `400` (validate with `z.string().uuid()`) |
| User doesn't exist | `404` |

---

#### UI — User List Page

```
+----------------------------------------------------------+
|  Users                                    [+ New User]   |
+----------------------------------------------------------+
|  Search by name or email...                              |
+--------+------------------+------------+-----------------+
|  ID    |  Email           |  Username  |  Joined         |
+--------+------------------+------------+-----------------+
|  ...00 | alice@example.com| alice42    | Apr 17, 2026    |
|  ...01 | bob@example.com  | bob99      | Apr 16, 2026    |
+--------+------------------+------------+-----------------+
|  < Prev   Page 1 of 50   Next >                         |
+----------------------------------------------------------+
```

- Each row is a link to `GET /api/users/:id`.
- "New User" button opens the registration form.
- Search box filters by calling `GET /api/users?search=alice` (requires adding
  a `search` query parameter to the API).
- Pagination buttons update the `?page=` query parameter.

---

#### UI — User Profile Page

```
+-------------------------------------+
|  <- Back to users                   |
+-------------------------------------+
|  [User icon]  Alice Smith           |
|  @alice42                           |
|  alice@example.com                  |
|  Joined: April 17, 2026             |
+-------------------------------------+
|  [Edit Profile]    [Delete Account] |
+-------------------------------------+
```

---

### UPDATE User

**API endpoint**: `PUT /api/users/:id`

**What it does**: Replaces the editable fields of a user record.

```http
PUT /api/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Alicia",
  "lastName": "Smith",
  "username": "alicia42"
}
```

**Validation schema:**

```ts
const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
})
```

> **Note**: email and password changes should be separate, carefully protected
> endpoints with additional verification steps (e.g. confirm current password
> before changing it).

**Implementation:**

```ts
const [updated] = await db
  .update(users)
  .set({ ...req.body, updateAt: new Date() })
  .where(eq(users.id, req.params.id))
  .returning()

if (!updated) return res.status(404).json({ error: 'User not found' })

const { password: _, ...safeUser } = updated
return res.json({ data: safeUser })
```

#### Success response (`200 OK`)

```json
{
  "data": { "id": "...", "username": "alicia42", "firstName": "Alicia", ... }
}
```

---

#### UI — Edit Profile Form

```
+------------------------------------------+
|  <- Cancel         Edit Profile    [Save] |
+------------------------------------------+
|  Username                                |
|  +------------------------------------+  |
|  | alicia42                           |  |
|  +------------------------------------+  |
|                                          |
|  First name               Last name      |
|  +-----------------+  +---------------+  |
|  | Alicia          |  | Smith         |  |
|  +-----------------+  +---------------+  |
+------------------------------------------+
```

**Behaviour:**
- The form is pre-filled by calling `GET /api/users/:id` when the page loads.
- "Save" calls `PUT /api/users/:id` with only the changed fields.
- On success, update the UI state and show a "Profile updated!" toast.
- On `409` (username taken), highlight the field.

---

### DELETE User

**API endpoint**: `DELETE /api/users/:id`

**What it does**: Permanently removes a user and (via `onDelete: 'cascade'`)
all their issues and related entries.

```http
DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Implementation:**

```ts
const result = await db.delete(users).where(eq(users.id, req.params.id)).returning()

if (result.length === 0) {
  return res.status(404).json({ error: 'User not found' })
}

return res.status(204).send()
```

`204 No Content` — success, but there's nothing to return.

#### UI — Delete Confirmation Modal

```
+-----------------------------------------------------+
|  [!] Delete account?                                |
|                                                     |
|  This will permanently delete Alice's account and   |
|  all 47 issues tracked under it. This cannot be     |
|  undone.                                            |
|                                                     |
|  Type your username to confirm:                     |
|  +-------------------------------------------+     |
|  | alice42                                   |     |
|  +-------------------------------------------+     |
|                                                     |
|  [Cancel]                   [Delete permanently]   |
+-----------------------------------------------------+
```

**Behaviour:**
- "Delete permanently" is disabled until the username is typed correctly.
- On confirm, call `DELETE /api/users/:id`.
- On `204`, clear the auth token and redirect to the home page.

---

## 24. Issues — CRUD Operations & UI

Issues are the core resource of the application. Every issue belongs to one
user and can have many tags and many completion entries.

### Resource overview

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Auto-generated |
| `userId` | UUID | Foreign key -> users.id |
| `name` | string | Short title, max 100 chars |
| `description` | text | Optional long description |
| `isActive` | boolean | `true` = open/active, `false` = archived |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

---

### CREATE Issue

**API endpoint**: `POST /api/issues`

```http
POST /api/issues
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Fix broken login button",
  "description": "The login button on mobile doesn't respond to taps on iOS 17.",
  "isActive": true
}
```

**Validation schema** (from `issueRoutes.ts`, extended):

```ts
const createIssueSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
})
```

**Implementation:**

```ts
// req.user.id comes from the auth middleware (JWT payload)
const [issue] = await db
  .insert(issues)
  .values({
    userId: req.user.id,
    name: req.body.name,
    description: req.body.description,
    isActive: req.body.isActive ?? true,
  })
  .returning()

return res.status(201).json({ data: issue })
```

#### Success response (`201 Created`)

```json
{
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Fix broken login button",
    "description": "The login button on mobile...",
    "isActive": true,
    "createdAt": "2026-04-17T13:10:00.000Z",
    "updatedAt": "2026-04-17T13:10:00.000Z"
  }
}
```

---

#### UI — New Issue Form

```
+-----------------------------------------------+
|  <- Back          New Issue              [Save] |
+-----------------------------------------------+
|  Title *                                      |
|  +-----------------------------------------+  |
|  | Fix broken login button                 |  |
|  +-----------------------------------------+  |
|                                               |
|  Description                                  |
|  +-----------------------------------------+  |
|  | The login button on mobile doesn't...   |  |
|  |                                         |  |
|  +-----------------------------------------+  |
|                                               |
|  Tags  [+ Add tag]                            |
|  +----------+  +--------+                     |
|  | [R] bug  |  | [M] iOS|                     |
|  +----------+  +--------+                     |
+-----------------------------------------------+
```

**Behaviour:**
1. User fills in the form.
2. "Save" calls `POST /api/issues`.
3. On `201` — navigate to the new issue's detail page.
4. Tags: call `POST /api/issues/:id/tags` (or attach via `issueTags` in one
   transaction) after creating the issue.

---

### READ Issues

#### List all issues — `GET /api/issues`

```http
GET /api/issues?page=1&active=true
Authorization: Bearer <token>
```

**Implementation with filtering:**

```ts
const page = Number(req.query.page) || 1
const showActive = req.query.active !== 'false'

const rows = await db
  .select()
  .from(issues)
  .where(
    and(
      eq(issues.userId, req.user.id),
      eq(issues.isActive, showActive)
    )
  )
  .limit(20)
  .offset((page - 1) * 20)
  .orderBy(issues.createdAt)

return res.json({ data: rows })
```

---

#### UI — Issues List Page

```
+------------------------------------------------------------+
|  My Issues                               [+ New Issue]     |
+------------------------------------------------------------+
|  [Active v]  Search...                                     |
+------------------------------------------------------------+
|  [doc] Fix broken login button              Apr 17   [+]  |
|        [R] bug  [M] iOS                                    |
+------------------------------------------------------------+
|  [doc] Update README with setup instructions Apr 16   [ ] |
|        [B] docs                                            |
+------------------------------------------------------------+
|  < Prev   Page 1 of 5   Next >                             |
+------------------------------------------------------------+
```

- Clicking a row navigates to `GET /api/issues/:id`.
- The `[Active v]` dropdown switches between `?active=true` and `?active=false`
  (archived issues).
- `[+]` = has at least one completion entry; `[ ]` = no entries yet.

---

#### Get one issue — `GET /api/issues/:id`

```http
GET /api/issues/7c9e6679-7425-40de-944b-e07fc1f90ae7
Authorization: Bearer <token>
```

**Implementation (with related tags):**

```ts
const issue = await db.query.issues.findFirst({
  where: eq(issues.id, req.params.id),
  with: {
    issueTags: { with: { tag: true } },
    entries: { orderBy: (e, { desc }) => [desc(e.completionDate)] },
  },
})

if (!issue) return res.status(404).json({ error: 'Issue not found' })

// Ownership check
if (issue.userId !== req.user.id) {
  return res.status(403).json({ error: 'Forbidden' })
}

return res.json({ data: issue })
```

#### Success response (`200 OK`)

```json
{
  "data": {
    "id": "7c9e6679...",
    "name": "Fix broken login button",
    "description": "...",
    "isActive": true,
    "createdAt": "...",
    "issueTags": [
      { "tag": { "id": "...", "name": "bug", "color": "#ef4444" } }
    ],
    "entries": [
      { "id": "...", "completionDate": "2026-04-17T14:00:00.000Z", "note": "Fixed on Android" }
    ]
  }
}
```

---

#### UI — Issue Detail Page

```
+------------------------------------------------------------+
|  <- Issues        Fix broken login button    [Edit] [...]  |
+------------------------------------------------------------+
|  [R] bug   [M] iOS                                        |
|                                                            |
|  The login button on mobile doesn't respond to taps on     |
|  iOS 17. Observed on iPhone 14 Pro with latest Safari.     |
|                                                            |
|  +----------------------+                                  |
|  |  [+] Mark complete   |                                  |
|  +----------------------+                                  |
+------------------------------------------------------------+
|  Completion History (3)                                    |
|  ----------------------------------------------------------  |
|  Apr 17 14:00  "Fixed on Android"                          |
|  Apr 15 09:30  "Reproduced - filed ticket with Apple"      |
|  Apr 14 22:00  "Started investigating"                     |
+------------------------------------------------------------+
```

- "[Edit]" opens the edit form.
- "[...]" opens a dropdown with Archive/Delete.
- "Mark complete" calls `POST /api/issues/:id/complete` and opens a small
  modal asking for an optional note.

---

### UPDATE Issue

**API endpoint**: `PUT /api/issues/:id`

```http
PUT /api/issues/7c9e6679-7425-40de-944b-e07fc1f90ae7
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Fix broken login button on iOS 17",
  "description": "Updated description with more details."
}
```

**Validation schema:**

```ts
const updateIssueSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
})
```

**Implementation:**

```ts
const [updated] = await db
  .update(issues)
  .set({ ...req.body, updatedAt: new Date() })
  .where(and(eq(issues.id, req.params.id), eq(issues.userId, req.user.id)))
  .returning()

if (!updated) return res.status(404).json({ error: 'Issue not found' })

return res.json({ data: updated })
```

> **Security note**: always add `eq(issues.userId, req.user.id)` to the WHERE
> clause. This prevents one user from editing another user's issues.

---

#### UI — Edit Issue Form

Same layout as the New Issue Form, pre-populated with existing values. "Save"
calls `PUT /api/issues/:id`.

---

### ARCHIVE / SOFT DELETE Issue

Rather than deleting the row, we set `isActive = false`. This preserves the
history of entries.

**Implementation** (reuses the `PUT` endpoint with `isActive: false`, or a
dedicated `PATCH`):

```ts
await db
  .update(issues)
  .set({ isActive: false, updatedAt: new Date() })
  .where(and(eq(issues.id, req.params.id), eq(issues.userId, req.user.id)))
```

---

### COMPLETE Issue — `POST /api/issues/:id/complete`

This is not a standard CRUD operation — it's an **action**. It creates a new
`entries` row for the issue.

```http
POST /api/issues/7c9e6679-7425-40de-944b-e07fc1f90ae7/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "Fixed on Android — iOS patch pending.",
  "completionDate": "2026-04-17T14:00:00.000Z"
}
```

**Implementation:**

```ts
const issueExists = await db
  .select({ id: issues.id })
  .from(issues)
  .where(and(eq(issues.id, req.params.id), eq(issues.userId, req.user.id)))

if (issueExists.length === 0) {
  return res.status(404).json({ error: 'Issue not found' })
}

const [entry] = await db
  .insert(entries)
  .values({
    issueId: req.params.id,
    note: req.body.note,
    completionDate: req.body.completionDate
      ? new Date(req.body.completionDate)
      : new Date(),
  })
  .returning()

return res.status(201).json({ data: entry })
```

---

#### UI — Mark Complete Modal

```
+------------------------------------------+
|  [+] Mark as Complete                    |
+------------------------------------------+
|  Add a note (optional)                   |
|  +------------------------------------+  |
|  | Fixed on Android - iOS patch...    |  |
|  +------------------------------------+  |
|                                          |
|  Completion date                         |
|  +------------------------------------+  |
|  | 2026-04-17   14:00                 |  |
|  +------------------------------------+  |
|                                          |
|  [Cancel]                  [Log it [+]]  |
+------------------------------------------+
```

---

### GET Issue Stats — `GET /api/issues/:id/stats`

Returns aggregated data about completion entries for an issue.

**Implementation (aggregate query):**

```ts
import { count, sql } from 'drizzle-orm'

// Total entries
const [{ total }] = await db
  .select({ total: count() })
  .from(entries)
  .where(eq(entries.issueId, req.params.id))

// Entries per week (last 8 weeks)
const weekly = await db.execute(sql`
  SELECT
    DATE_TRUNC('week', completion_date) AS week,
    COUNT(*) AS completions
  FROM entries
  WHERE issue_id = ${req.params.id}
    AND completion_date >= NOW() - INTERVAL '8 weeks'
  GROUP BY 1
  ORDER BY 1 DESC
`)

return res.json({ data: { total, weekly: weekly.rows } })
```

#### UI — Stats View (part of Issue Detail)

```
  [chart] Stats
  ----------------------------------------
  Total completions: 14

  Weekly activity (last 8 weeks):
  Week of Apr 14  ||||||||  5
  Week of Apr 7   ||||      3
  Week of Mar 31  ||        2
  ...
```

---

## 25. Tags — CRUD Operations & UI

Tags are simple labels that can be applied to many issues. They have a name
and a colour.

### Resource overview

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Auto-generated |
| `name` | string | Unique, max 50 chars |
| `color` | string | Hex colour, default `#6b7280` |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

---

### CREATE Tag

**API endpoint**: `POST /api/tags`

```http
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "bug",
  "color": "#ef4444"
}
```

**Validation schema:**

```ts
const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color like #ef4444')
    .default('#6b7280'),
})
```

**Implementation:**

```ts
const [tag] = await db.insert(tags).values(req.body).returning()
return res.status(201).json({ data: tag })
```

#### Success response (`201 Created`)

```json
{
  "data": {
    "id": "a3bb1890-...",
    "name": "bug",
    "color": "#ef4444",
    "createdAt": "2026-04-17T13:20:00.000Z"
  }
}
```

| Error | Status |
|---|---|
| Duplicate name | `409` |
| Invalid hex color | `400` |

---

#### UI — Tag Creation Form

```
+------------------------------------------+
|  New Tag                                 |
+------------------------------------------+
|  Name                                    |
|  +------------------------------------+  |
|  | bug                                |  |
|  +------------------------------------+  |
|                                          |
|  Colour                                  |
|  +----------------------+                |
|  | [R] #ef4444          |  [Pick...]    |
|  +----------------------+                |
|                                          |
|  Preview: +----------+                  |
|           | [R] bug  |                  |
|           +----------+                  |
|                                          |
|  [Cancel]                  [Create Tag]  |
+------------------------------------------+
```

- The colour picker updates the preview badge in real time.
- "Create Tag" calls `POST /api/tags`.

---

### READ Tags

#### List all tags — `GET /api/tags`

```http
GET /api/tags
Authorization: Bearer <token>
```

**Implementation:**

```ts
const allTags = await db.select().from(tags).orderBy(tags.name)
return res.json({ data: allTags })
```

#### Success response (`200 OK`)

```json
{
  "data": [
    { "id": "...", "name": "bug",      "color": "#ef4444" },
    { "id": "...", "name": "docs",     "color": "#3b82f6" },
    { "id": "...", "name": "feature",  "color": "#10b981" }
  ]
}
```

---

#### Get one tag — `GET /api/tags/:id`

```http
GET /api/tags/a3bb1890-...
Authorization: Bearer <token>
```

Returns the tag plus all issues that have it (useful for a "filter by tag"
page):

```ts
const tag = await db.query.tags.findFirst({
  where: eq(tags.id, req.params.id),
  with: {
    issueTags: {
      with: { issue: true },
    },
  },
})

if (!tag) return res.status(404).json({ error: 'Tag not found' })
return res.json({ data: tag })
```

---

#### UI — Tags Management Page

```
+----------------------------------------------------+
|  Tags                               [+ New Tag]    |
+--------+------------------+----------+-------------+
|  Color |  Name            |  Issues  |  Actions    |
+--------+------------------+----------+-------------+
|  [R]   | bug              |  12      | [Edit][Del] |
|  [B]   | docs             |   4      | [Edit][Del] |
|  [G]   | feature          |   8      | [Edit][Del] |
+--------+------------------+----------+-------------+
```

Clicking a tag name navigates to a filtered issues list:
`GET /api/issues?tagId=a3bb1890-...` (requires adding `tagId` filtering).

---

### UPDATE Tag

**API endpoint**: `PUT /api/tags/:id`

```http
PUT /api/tags/a3bb1890-...
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "bug-fix",
  "color": "#f97316"
}
```

**Validation schema:**

```ts
const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})
```

**Implementation:**

```ts
const [updated] = await db
  .update(tags)
  .set({ ...req.body, updateAt: new Date() })
  .where(eq(tags.id, req.params.id))
  .returning()

if (!updated) return res.status(404).json({ error: 'Tag not found' })
return res.json({ data: updated })
```

---

#### UI — Edit Tag Form (inline or modal)

```
+------------------------------------------+
|  Edit Tag                                |
+------------------------------------------+
|  Name        +----------------------+   |
|              | bug-fix              |   |
|              +----------------------+   |
|  Colour      [O] #f97316  [Pick...]     |
|                                          |
|  [Cancel]               [Save Changes]  |
+------------------------------------------+
```

---

### DELETE Tag

**API endpoint**: `DELETE /api/tags/:id`

```http
DELETE /api/tags/a3bb1890-...
Authorization: Bearer <token>
```

**Implementation:**

```ts
const result = await db
  .delete(tags)
  .where(eq(tags.id, req.params.id))
  .returning()

if (result.length === 0) return res.status(404).json({ error: 'Tag not found' })

return res.status(204).send()
```

Deleting a tag also removes all `issueTags` rows that reference it (via
`onDelete: 'cascade'` in the schema) — the issues themselves are unaffected.

#### UI — Delete Tag Confirmation

```
+---------------------------------------------------+
|  [!] Delete tag "bug"?                            |
|                                                   |
|  This will remove the tag from all 12 issues      |
|  that currently use it. The issues themselves     |
|  won't be deleted.                                |
|                                                   |
|  [Cancel]                     [Delete tag]        |
+---------------------------------------------------+
```

---

## 26. Auth — Operations & UI

Authentication is different from CRUD — it manages identity, not a resource
you interact with directly.

### REGISTER — `POST /api/auth/register`

Creates a new user account and immediately signs them in.

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "alice@example.com",
  "username": "alice42",
  "password": "SuperSecret!1",
  "firstName": "Alice",
  "lastName": "Smith"
}
```

**Full implementation flow:**

```ts
// 1. Validate
const body = registerSchema.parse(req.body)

// 2. Check uniqueness
const conflict = await db.select().from(users)
  .where(or(eq(users.email, body.email), eq(users.username, body.username)))
if (conflict.length > 0) {
  return res.status(409).json({ error: 'Email or username already in use' })
}

// 3. Hash password
const hash = await bcrypt.hash(body.password, env.BCRYPT_ROUNDS)

// 4. Insert user
const [user] = await db.insert(users).values({ ...body, password: hash }).returning()

// 5. Issue JWT
const token = await new SignJWT({ sub: user.id })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime(env.JWT_EXPIRES_IN)
  .sign(new TextEncoder().encode(env.JWT_SECRET))

// 6. Return user (no password) + token
const { password: _, ...safeUser } = user
return res.status(201).json({ data: { user: safeUser, token } })
```

#### Success response (`201 Created`)

```json
{
  "data": {
    "user": { "id": "...", "email": "alice@example.com", ... },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

#### UI — Sign Up Page

```
+------------------------------------------+
|    [Bug icon] Issue Tracker              |
|                                          |
|          Create your account            |
+------------------------------------------+
|  Email *                                 |
|  +------------------------------------+  |
|  +------------------------------------+  |
|                                          |
|  Username *                              |
|  +------------------------------------+  |
|  +------------------------------------+  |
|                                          |
|  Password *                              |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  [v] At least 8 characters              |
|                                          |
|  +----------------------------------+    |
|  |         Sign Up                  |    |
|  +----------------------------------+    |
|                                          |
|        Already have an account?          |
|             Sign in ->                   |
+------------------------------------------+
```

---

### LOGIN — `POST /api/auth/login`

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "SuperSecret!1"
}
```

**Implementation:**

```ts
const { email, password } = loginSchema.parse(req.body)

// Find user
const [user] = await db.select().from(users).where(eq(users.email, email))
if (!user) {
  // Use a generic message — don't confirm whether the email exists
  return res.status(401).json({ error: 'Invalid email or password' })
}

// Verify password
const valid = await bcrypt.compare(password, user.password)
if (!valid) {
  return res.status(401).json({ error: 'Invalid email or password' })
}

// Issue JWT
const token = await new SignJWT({ sub: user.id })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime(env.JWT_EXPIRES_IN)
  .sign(new TextEncoder().encode(env.JWT_SECRET))

const { password: _, ...safeUser } = user
return res.json({ data: { user: safeUser, token } })
```

> **Security note**: always return the same error message (`"Invalid email or
> password"`) whether the email doesn't exist or the password is wrong. This
> prevents **user enumeration** — an attacker finding out which emails are
> registered.

#### Success response (`200 OK`)

```json
{
  "data": {
    "user": { "id": "...", "email": "alice@example.com", ... },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

#### UI — Sign In Page

```
+------------------------------------------+
|    [Bug icon] Issue Tracker              |
|                                          |
|            Welcome back                 |
+------------------------------------------+
|  Email                                   |
|  +------------------------------------+  |
|  | alice@example.com                  |  |
|  +------------------------------------+  |
|                                          |
|  Password                                |
|  +------------------------------------+  |
|  | ............               [eye]  |  |
|  +------------------------------------+  |
|                                          |
|  +----------------------------------+    |
|  |         Sign In                  |    |
|  +----------------------------------+    |
|                                          |
|  [X] Invalid email or password          |  <- shown on 401
|                                          |
|   Don't have an account? Sign up ->     |
+------------------------------------------+
```

**Behaviour after successful login:**
1. Store the JWT — either in `localStorage` or a `HttpOnly` cookie.
2. Store the user object in your frontend state.
3. Redirect to the Issues list page.

---

### LOGOUT — `POST /api/auth/logout`

With stateless JWTs, logout is handled entirely on the client:

```ts
router.post('/logout', (req, res) => {
  // With stateless JWTs, the server has nothing to do.
  // The client deletes its stored token.
  return res.json({ message: 'Logged out' })
})
```

**Client-side:**
```ts
// Simply remove the token from storage
localStorage.removeItem('token')
// Redirect to sign-in page
window.location.href = '/login'
```

For **server-side invalidation** (more secure — needed for "log out all
devices"), maintain a token blocklist in the database or Redis:

```ts
// On logout, store the token's jti (JWT ID) claim in a blocklist table
// On every authenticated request, check the blocklist before proceeding
```

---

### TOKEN REFRESH — `POST /api/auth/refresh`

JWTs expire (default: 7 days). Token refresh lets clients get a new token
without asking the user to log in again.

**How it works:**

The server issues two tokens on login:
1. **Access token** — short-lived (15 minutes), used for every API call.
2. **Refresh token** — long-lived (7-30 days), stored securely, only sent to
   `POST /api/auth/refresh`.

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Implementation:**

```ts
// 1. Verify the refresh token
const { payload } = await jwtVerify(
  body.refreshToken,
  new TextEncoder().encode(env.JWT_SECRET)
)

// 2. Check it's a refresh token (use a custom claim: { type: 'refresh' })
if (payload.type !== 'refresh') {
  return res.status(401).json({ error: 'Invalid token type' })
}

// 3. Issue a new short-lived access token
const newAccessToken = await new SignJWT({ sub: payload.sub })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('15m')
  .sign(secret)

return res.json({ data: { token: newAccessToken } })
```

---

## 27. Connecting a Frontend to the API

This section shows you how any frontend (plain HTML+JS, React, Vue, etc.)
communicates with the API we've built.

### The `fetch` function

The browser's built-in `fetch` is all you need for HTTP requests:

```ts
// Basic GET
const res = await fetch('http://localhost:3000/api/issues')
const { data } = await res.json()
console.log(data) // array of issues
```

### Sending JSON

```ts
const res = await fetch('http://localhost:3000/api/issues', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  },
  body: JSON.stringify({
    name: 'Fix broken login button',
    description: 'Taps ignored on iOS 17',
  }),
})

if (!res.ok) {
  const err = await res.json()
  console.error(err.error, err.details)
  return
}

const { data } = await res.json()
console.log('Created:', data)
```

### Token storage

| Method | Security | When to use |
|---|---|---|
| `localStorage` | Vulnerable to XSS | Simple prototypes only |
| `sessionStorage` | Same as localStorage, cleared on tab close | Short sessions |
| `HttpOnly` cookie | JS can't read it — XSS safe | Production apps |
| In-memory (variable) | No persistence — most secure | SPAs that don't need page refresh |

For production use an `HttpOnly` cookie: the browser automatically sends it
with every request, and JavaScript can never steal it.

### A reusable API client (TypeScript example)

```ts
// src/api.ts

const BASE_URL = 'http://localhost:3000'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error ?? `HTTP ${res.status}`)
  }

  // 204 No Content has no body
  if (res.status === 204) return undefined as T

  return res.json()
}

// Typed helper functions for each resource
export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ data: { token: string; user: User } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: RegisterPayload) =>
      apiFetch<{ data: { token: string; user: User } }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  issues: {
    list: (page = 1) =>
      apiFetch<{ data: Issue[] }>(`/api/issues?page=${page}`),
    get: (id: string) =>
      apiFetch<{ data: Issue }>(`/api/issues/${id}`),
    create: (payload: CreateIssuePayload) =>
      apiFetch<{ data: Issue }>('/api/issues', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateIssuePayload) =>
      apiFetch<{ data: Issue }>(`/api/issues/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    complete: (id: string, note?: string) =>
      apiFetch<{ data: Entry }>(`/api/issues/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
    delete: (id: string) =>
      apiFetch<void>(`/api/issues/${id}`, { method: 'DELETE' }),
  },
  tags: {
    list: () => apiFetch<{ data: Tag[] }>('/api/tags'),
    create: (payload: CreateTagPayload) =>
      apiFetch<{ data: Tag }>('/api/tags', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateTagPayload) =>
      apiFetch<{ data: Tag }>(`/api/tags/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      apiFetch<void>(`/api/tags/${id}`, { method: 'DELETE' }),
  },
}
```

**Usage:**

```ts
// Login
const { data } = await api.auth.login('alice@example.com', 'SuperSecret!1')
localStorage.setItem('token', data.token)

// Create an issue
const { data: newIssue } = await api.issues.create({
  name: 'Fix broken login button',
  description: 'Taps ignored on iOS 17',
})

// Handle errors
try {
  await api.issues.delete('some-id')
} catch (err) {
  alert(err.message) // "Issue not found"
}
```

### Handling token expiry

```ts
// Wrap every API call - if we get a 401, try refreshing the token once
async function fetchWithRefresh<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    return await apiFetch<T>(path, options)
  } catch (err) {
    if (err.message === 'Unauthorized') {
      // Try to get a new access token
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw err

      const { data } = await api.auth.refresh(refreshToken)
      localStorage.setItem('token', data.token)

      // Retry the original request with the new token
      return apiFetch<T>(path, options)
    }
    throw err
  }
}
```

### CRUD to UI action to API call cheatsheet

| User action | UI event | API call |
|---|---|---|
| Click "Sign Up" | Form submit | `POST /api/auth/register` |
| Click "Sign In" | Form submit | `POST /api/auth/login` |
| Click "Sign Out" | Button click | `POST /api/auth/logout` + clear token |
| Open issues list | Page load | `GET /api/issues` |
| Open issue detail | Row click | `GET /api/issues/:id` |
| Click "New Issue" + save | Form submit | `POST /api/issues` |
| Click "Edit" + save | Form submit | `PUT /api/issues/:id` |
| Click "Archive" | Button click | `PUT /api/issues/:id` with `{ isActive: false }` |
| Click "Delete" + confirm | Modal confirm | `DELETE /api/issues/:id` |
| Click "Mark complete" + save | Modal confirm | `POST /api/issues/:id/complete` |
| Open stats | Tab click | `GET /api/issues/:id/stats` |
| Open tags list | Page load | `GET /api/tags` |
| Click "New Tag" + save | Form submit | `POST /api/tags` |
| Click "Edit tag" + save | Form submit | `PUT /api/tags/:id` |
| Click "Delete tag" + confirm | Modal confirm | `DELETE /api/tags/:id` |

---

*End of tutorial. Happy coding! 🚀*
