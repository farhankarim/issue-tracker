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
  // Clear tables respecting FK order (children first)
  db.run('DELETE FROM issueTags')
  db.run('DELETE FROM entries')
  db.run('DELETE FROM issues')
  db.run('DELETE FROM tags')
  db.run('DELETE FROM users')

  console.log('Tables cleared.')

  // Users
  const userData = Array.from({ length: 50 }, () => ({
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  }))
  const usersInserted = await db.insert(users).values(userData).returning()
  console.log(`Inserted ${usersInserted.length} users.`)

  // Tags
  const tagData = Array.from({ length: 20 }, () => ({
    name: faker.word.noun() + faker.number.int({ min: 1, max: 999 }),
    color: faker.color.rgb({ format: 'hex' }),
  }))
  const tagsInserted = await db.insert(tags).values(tagData).returning()
  console.log(`Inserted ${tagsInserted.length} tags.`)

  // Issues
  const issueData = Array.from({ length: 100 }, () => ({
    userId: faker.helpers.arrayElement(usersInserted).id,
    name: faker.lorem.words({ min: 2, max: 5 }),
    description: faker.lorem.sentence(),
    isActive: faker.datatype.boolean(),
  }))
  const issuesInserted = await db.insert(issues).values(issueData).returning()
  console.log(`Inserted ${issuesInserted.length} issues.`)

  // Entries
  const entryData = Array.from({ length: 200 }, () => ({
    issueId: faker.helpers.arrayElement(issuesInserted).id,
    completionDate: faker.date.recent(),
    note: faker.lorem.sentence(),
  }))
  await db.insert(entries).values(entryData)
  console.log(`Inserted ${entryData.length} entries.`)

  // IssueTags
  const issueTagsData = Array.from({ length: 150 }, () => ({
    issueId: faker.helpers.arrayElement(issuesInserted).id,
    tagId: faker.helpers.arrayElement(tagsInserted).id,
  }))
  await db.insert(issueTags).values(issueTagsData)
  console.log(`Inserted ${issueTagsData.length} issue-tag links.`)
}

seed()
  .then(() => {
    console.log('Seeding completed.')
    sqlite.close()
  })
  .catch((error) => {
    console.error('Seeding failed:', error)
    sqlite.close()
    process.exit(1)
  })