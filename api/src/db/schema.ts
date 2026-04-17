import {
  sqliteTable,
  text,
  integer,
} from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updateAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
})

export const issues = sqliteTable('issues', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
})

export const entries = sqliteTable('entries', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  issueId: text('issue_id')
    .references(() => issues.id, { onDelete: 'cascade' })
    .notNull(),
  completionDate: integer('completion_date', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
})

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  color: text('color').default('#6b7280'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updateAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
})

export const issueTags = sqliteTable('issueTags', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  issueId: text('issue_id')
    .references(() => issues.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: text('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
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