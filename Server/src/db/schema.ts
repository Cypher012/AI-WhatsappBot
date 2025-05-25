import { pgEnum, pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Define the gender enum
export const genderEnum = pgEnum('gender', ['male', 'female']);

export const usersTable = pgTable('birthday', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 256 }).notNull().unique(),
  birthdayDate: timestamp('birthday_date', { withTimezone: false }).notNull(),
  gender: genderEnum('gender').notNull(), // use the enum here
  profileUrl: varchar('profile_url', { length: 256 }),
  profilePublicId: varchar("profile_public_id").notNull(),
  createdAt: timestamp('created_at', { withTimezone: false })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .notNull()
    .default(sql`now()`),
});
