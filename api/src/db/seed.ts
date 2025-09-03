import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import {
  users,
  issues,
  tags,
  issueTags,
  entries,
} from './schema.ts'
import { faker } from '@faker-js/faker'

const pool = new Pool({
  connectionString:'postgresql://neondb_owner:npg_uO4ZXkgQY1It@ep-jolly-boat-adumffug-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
})
const db = drizzle(pool)

async function seed() {
  // Truncate all tables (disable referential integrity temporarily)
  await db.execute(
    `TRUNCATE TABLE "issueTags", "entries", "issues", "tags", "users" RESTART IDENTITY CASCADE;`
  )

  // Users
  const userData = Array.from({ length: 1000 }, () => ({
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  }))
  const usersInserted = await db.insert(users).values(userData).returning()

  // Tags
  const tagData = Array.from({ length: 100 }, () => ({
    name: faker.word.noun() + faker.number.int({ min: 1, max: 999 }),
    color: faker.color.human(),
  }))
  const tagsInserted = await db.insert(tags).values(tagData).returning()

  // Issues
  const issueData = Array.from({ length: 2000 }, () => ({
    userId: faker.helpers.arrayElement(usersInserted).id,
    name: faker.lorem.words({ min: 2, max: 5 }),
    description: faker.lorem.sentence(),
    isActive: faker.datatype.boolean(),
  }))
  const issuesInserted = await db.insert(issues).values(issueData).returning()

  // Entries
  const entryData = Array.from({ length: 4000 }, () => ({
    issueId: faker.helpers.arrayElement(issuesInserted).id,
    completionDate: faker.date.recent(),
    note: faker.lorem.sentence(),
  }))
  await db.insert(entries).values(entryData)

  // IssueTags (link issues and tags)
  const issueTagsData = Array.from({ length: 3000 }, () => ({
    issueId: faker.helpers.arrayElement(issuesInserted).id,
    tagId: faker.helpers.arrayElement(tagsInserted).id,
  }))
  await db.insert(issueTags).values(issueTagsData)
}

seed()
  .then(() => {
    console.log('Seeding completed.')
  })
  .catch((error) => {
    console.error('Seeding failed:', error)
  })