import { pgTable, serial, text, real, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dreamsTable = pgTable("dreams", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "string" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // emotions (0–10 each)
  emotionAngry:   real("emotion_angry").notNull().default(0),
  emotionSad:     real("emotion_sad").notNull().default(0),
  emotionDisgust: real("emotion_disgust").notNull().default(0),
  emotionHappy:   real("emotion_happy").notNull().default(0),
  emotionPeaceful:real("emotion_peaceful").notNull().default(0),
  emotionNeutral: real("emotion_neutral").notNull().default(0),
  // dream qualities (0–10)
  lucidity:       real("lucidity").notNull().default(0),
  clarity:        real("clarity").notNull().default(0),
  nightmareFactor:real("nightmare_factor").notNull().default(0),
  // soft-delete / archive
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt:  timestamp("created_at",  { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp("updated_at",  { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDreamSchema = createInsertSchema(dreamsTable).omit({
  id: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDream = z.infer<typeof insertDreamSchema>;
export type Dream = typeof dreamsTable.$inferSelect;
