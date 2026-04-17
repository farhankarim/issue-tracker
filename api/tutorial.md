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

*End of tutorial. Happy coding! 🚀*
