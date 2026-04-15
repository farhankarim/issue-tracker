import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema.ts'
import { env } from '../../env.ts'

const sqlite = new Database(env.DATABASE_URL)

// Enable WAL mode and foreign key enforcement
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

export default db