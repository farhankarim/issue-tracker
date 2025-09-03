import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', {
    length: 255,
  }).notNull(),

  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updateAt: timestamp('updated_at').defaultNow().notNull(),
})

export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // rename for consistency
})

export const entries = pgTable('entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  issueId: uuid('issue_id')
    .references(() => issues.id, {
      onDelete: 'cascade',
    })
    .notNull(),

  completionDate: timestamp('completion_date').defaultNow().notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 50 }).default('#6b7280'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updateAt: timestamp('updated_at').defaultNow().notNull(),
})

export const issueTags = pgTable('issueTags', {
  id: uuid('id').primaryKey().defaultRandom(),
  issueId: uuid('issue_id')
    .references(() => issues.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  tagId: uuid('tag_id')
    .references(() => tags.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const userRelations = relations(users, ({ many }) => ({
  issues: many(issues),
}))

export const issuesRelations = relations(issues, ({ one, many }) => ({
  user: one(users, {
    fields: [issues.userId],
    references: [users.id],
  }),
  entries: many(entries),
  issueTags: many(issueTags),
}))

export const entriesRelations = relations(entries, ({ one }) => ({
  issue: one(issues, {
    fields: [entries.issueId],
    references: [issues.id],
  }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  issueTags: many(issueTags),
}))

export const issueTagsRelations = relations(issueTags, ({ one }) => ({
  issue: one(issues, {
    fields: [issueTags.issueId],
    references: [issues.id],
  }),
  tag: one(tags, {
    fields: [issueTags.tagId],
    references: [tags.id],
  }),
}))

export type User = typeof users.$inferSelect
export type Habit = typeof issues.$inferSelect
export type Entry = typeof entries.$inferSelect
export type Tag = typeof tags.$inferSelect
export type HabitTag = typeof issueTags.$inferSelect


export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)