# Issue Tracker API

A Node.js REST API for the Issue Tracker application, built with Express, Drizzle ORM, and TypeScript.

## Stack

- **Runtime**: Node.js (ESM + TypeScript via `--experimental-strip-types`)
- **Framework**: Express 5
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (e.g. [Neon](https://neon.tech), Supabase, or local)
- **Auth**: JWT (`jose`) + bcrypt
- **Validation**: Zod
- **Testing**: Vitest

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://user:pass@host/db`) |
| `JWT_SECRET` | Random secret ≥ 32 characters (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `PORT` | Port to listen on (default: `3000`) |
| `JWT_EXPIRES_IN` | Token TTL (default: `7d`) |
| `BCRYPT_ROUNDS` | Hash rounds (default: `12`) |

### 3. Push the schema to your database

```bash
npm run db:push
```

### 4. (Optional) Seed the database

```bash
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

## Running Tests

Create a `.env.test` file with a separate test database URL, then:

```bash
npm run test
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get user |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/issues` | List issues |
| POST | `/api/issues` | Create issue |
| POST | `/api/issues/:id/complete` | Mark issue complete |
| GET | `/api/issues/:id/stats` | Get issue stats |
| GET | `/api/tags` | List tags |
| POST | `/api/tags` | Create tag |
| GET | `/api/tags/:id` | Get tag |
| PUT | `/api/tags/:id` | Update tag |
| DELETE | `/api/tags/:id` | Delete tag |
