import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, dreamsTable } from "@workspace/db";
import {
  CreateDreamBody,
  UpdateDreamBody,
} from "@workspace/api-zod";

const router = Router();

function toApiDream(row: typeof dreamsTable.$inferSelect) {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    description: row.description,
    emotions: {
      angry: row.emotionAngry,
      sad: row.emotionSad,
      disgust: row.emotionDisgust,
      happy: row.emotionHappy,
      peaceful: row.emotionPeaceful,
      neutral: row.emotionNeutral,
    },
    lucidity: row.lucidity,
    clarity: row.clarity,
    nightmareFactor: row.nightmareFactor,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// GET /dreams
router.get("/dreams", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(dreamsTable)
    .orderBy(desc(dreamsTable.date));
  res.json(rows.map(toApiDream));
});

// GET /dreams/stats  — must be registered before /dreams/:id
router.get("/dreams/stats", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(dreamsTable)
    .orderBy(desc(dreamsTable.date));

  const totalEntries = rows.length;

  if (totalEntries === 0) {
    res.json({
      totalEntries: 0,
      currentStreak: 0,
      longestStreak: 0,
      avgLucidity: 0,
      avgClarity: 0,
      avgNightmareFactor: 0,
      avgEntryLength: 0,
      nightmareFrequency: 0,
      avgEmotions: {
        angry: 0,
        sad: 0,
        disgust: 0,
        happy: 0,
        peaceful: 0,
        neutral: 0,
      },
    });
    return;
  }

  // Averages
  const avg = (vals: number[]) =>
    vals.reduce((s, v) => s + v, 0) / vals.length;

  const avgLucidity = avg(rows.map((r) => r.lucidity));
  const avgClarity = avg(rows.map((r) => r.clarity));
  const avgNightmareFactor = avg(rows.map((r) => r.nightmareFactor));
  const avgEntryLength = avg(
    rows.map((r) => r.description.trim().split(/\s+/).filter(Boolean).length),
  );
  const nightmareFrequency =
    rows.filter((r) => r.nightmareFactor >= 7).length / totalEntries;

  const avgEmotions = {
    angry: avg(rows.map((r) => r.emotionAngry)),
    sad: avg(rows.map((r) => r.emotionSad)),
    disgust: avg(rows.map((r) => r.emotionDisgust)),
    happy: avg(rows.map((r) => r.emotionHappy)),
    peaceful: avg(rows.map((r) => r.emotionPeaceful)),
    neutral: avg(rows.map((r) => r.emotionNeutral)),
  };

  // Streak calculation — rows already sorted by date DESC
  // Deduplicate dates first (only one entry per day counts)
  const uniqueDates = [
    ...new Set(rows.map((r) => r.date)),
  ].sort((a, b) => (a < b ? 1 : -1)); // most recent first

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function dayDiff(dateStr: string): number {
    const d = new Date(dateStr + "T00:00:00");
    return Math.round((today.getTime() - d.getTime()) / 86400000);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Check if there's an entry today or yesterday to start current streak
  const firstDiff = dayDiff(uniqueDates[0]);
  if (firstDiff <= 1) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff =
        new Date(uniqueDates[i - 1] + "T00:00:00").getTime() -
        new Date(uniqueDates[i] + "T00:00:00").getTime();
      const daysBetween = Math.round(diff / 86400000);
      if (daysBetween === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Longest streak
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff =
      new Date(uniqueDates[i - 1] + "T00:00:00").getTime() -
      new Date(uniqueDates[i] + "T00:00:00").getTime();
    const daysBetween = Math.round(diff / 86400000);
    if (daysBetween === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  res.json({
    totalEntries,
    currentStreak,
    longestStreak,
    avgLucidity,
    avgClarity,
    avgNightmareFactor,
    avgEntryLength,
    nightmareFrequency,
    avgEmotions,
  });
});

// POST /dreams
router.post("/dreams", async (req, res): Promise<void> => {
  const parsed = CreateDreamBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid dream body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const body = parsed.data;
  const [row] = await db
    .insert(dreamsTable)
    .values({
      date: body.date,
      title: body.title,
      description: body.description,
      emotionAngry: body.emotions.angry,
      emotionSad: body.emotions.sad,
      emotionDisgust: body.emotions.disgust,
      emotionHappy: body.emotions.happy,
      emotionPeaceful: body.emotions.peaceful,
      emotionNeutral: body.emotions.neutral,
      lucidity: body.lucidity,
      clarity: body.clarity,
      nightmareFactor: body.nightmareFactor,
    })
    .returning();

  res.status(201).json(toApiDream(row));
});

// GET /dreams/:id
router.get("/dreams/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .select()
    .from(dreamsTable)
    .where(eq(dreamsTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Dream not found" });
    return;
  }

  res.json(toApiDream(row));
});

// PATCH /dreams/:id
router.patch("/dreams/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateDreamBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid dream update body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const body = parsed.data;
  const updates: Partial<typeof dreamsTable.$inferInsert> = {};

  if (body.date !== undefined) updates.date = body.date;
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.lucidity !== undefined) updates.lucidity = body.lucidity;
  if (body.clarity !== undefined) updates.clarity = body.clarity;
  if (body.nightmareFactor !== undefined)
    updates.nightmareFactor = body.nightmareFactor;
  if (body.emotions !== undefined) {
    updates.emotionAngry = body.emotions.angry;
    updates.emotionSad = body.emotions.sad;
    updates.emotionDisgust = body.emotions.disgust;
    updates.emotionHappy = body.emotions.happy;
    updates.emotionPeaceful = body.emotions.peaceful;
    updates.emotionNeutral = body.emotions.neutral;
  }

  const [row] = await db
    .update(dreamsTable)
    .set(updates)
    .where(eq(dreamsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Dream not found" });
    return;
  }

  res.json(toApiDream(row));
});

// DELETE /dreams/:id
router.delete("/dreams/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [row] = await db
    .delete(dreamsTable)
    .where(eq(dreamsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Dream not found" });
    return;
  }

  res.status(204).send();
});

export default router;
