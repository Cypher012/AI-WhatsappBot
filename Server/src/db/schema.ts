import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const usersTable = pgTable('birthday', {
  id: uuid('id').primaryKey().defaultRandom(), // auto-generates a UUID
  name: varchar('name', { length: 256 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 256 }).notNull().unique(),
  birthdayDate: timestamp('birthday_date', { withTimezone: false }).notNull(),
  profileUrl: varchar('profile_url', { length: 256 }), // optional
  createdAt: timestamp('created_at', { withTimezone: false })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .notNull()
    .default(sql`now()`),
});
