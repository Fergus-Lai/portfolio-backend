import {
  pgTable,
  integer,
  uuid,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: uuid().primaryKey().defaultRandom(),
  created_at: timestamp().defaultNow().notNull(),
  title: varchar("title"),
  name: varchar("name"),
  email: varchar("email"),
  message: varchar("message"),
});
