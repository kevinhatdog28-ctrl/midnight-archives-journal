import { Router } from "express";
import { eq, desc, isNull, isNotNull } from "drizzle-orm";
import { db, dreamsTable } from "@workspace/db";
import { CreateDreamBody, UpdateDreamBody } from "@workspace/api-zod";

const router = Router();

function parseId(raw: string | string[]): number | null {
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
  return isNaN(id) ? null : id;
}

function toApiDream(row: typeof dreamsTable.$inferSelect) {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    description: row.description,
    emotions: {
      angry:   row.emotionAngry,
      sad:     row.emotionSad,
      disgust: row.emotionDisgust,
      happy:   row.emotionHappy,
      peaceful:row.emotionPeaceful,
      neutral: row.emotionNeutral,
    },
    lucidity:      row.lucidity,
    clarity:       row.clarity,
    nightmareFactor: row.nightmareFactor,
    archivedAt:    row.archivedAt ? row.archivedAt.toISOString() : null,
    createdAt:     row.createdAt.toISOString(),
    updatedAt:     row.updatedAt.toISOString(),
  };
}

// ─── GET /dreams ─────────────────────────────────────────────────────────────
router.get("/dreams", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(dreamsTable)
    .where(isNull(dreamsTable.archivedAt))
    .orderBy(desc(dreamsTable.date));
  res.json(rows.map(toApiDream));
});

// ─── GET /dreams/archived  ── must be before /dreams/:id ─────────────────────
router.get("/dreams/archived", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(dreamsTable)
    .where(isNotNull(dreamsTable.archivedAt))
    .orderBy(desc(dreamsTable.archivedAt));
  res.json(rows.map(toApiDream));
});

// ─── GET /dreams/stats  ── must be before /dreams/:id ────────────────────────
router.get("/dreams/stats", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(dreamsTable)
    .where(isNull(dreamsTable.archivedAt))
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
      avgEmotions: { angry: 0, sad: 0, disgust: 0, happy: 0, peaceful: 0, neutral: 0 },
    });
    return;
  }

  const avg = (vals: number[]) => vals.reduce((s, v) => s + v, 0) / vals.length;

  const avgLucidity         = avg(rows.map((r) => r.lucidity));
  const avgClarity          = avg(rows.map((r) => r.clarity));
  const avgNightmareFactor  = avg(rows.map((r) => r.nightmareFactor));
  const avgEntryLength      = avg(rows.map((r) => r.description.trim().split(/\s+/).filter(Boolean).length));
  const nightmareFrequency  = rows.filter((r) => r.nightmareFactor >= 7).length / totalEntries;
  const avgEmotions = {
    angry:   avg(rows.map((r) => r.emotionAngry)),
    sad:     avg(rows.map((r) => r.emotionSad)),
    disgust: avg(rows.map((r) => r.emotionDisgust)),
    happy:   avg(rows.map((r) => r.emotionHappy)),
    peaceful:avg(rows.map((r) => r.emotionPeaceful)),
    neutral: avg(rows.map((r) => r.emotionNeutral)),
  };

  // Streak calculation — deduplicate dates, most recent first
  const uniqueDates = [...new Set(rows.map((r) => r.date))].sort((a, b) => (a < b ? 1 : -1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDiff = (dateStr: string) =>
    Math.round((today.getTime() - new Date(dateStr + "T00:00:00").getTime()) / 86400000);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak    = 1;

  const firstDiff = dayDiff(uniqueDates[0]);
  if (firstDiff <= 1) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const days = Math.round(
        (new Date(uniqueDates[i - 1] + "T00:00:00").getTime() -
         new Date(uniqueDates[i]     + "T00:00:00").getTime()) / 86400000,
      );
      if (days === 1) currentStreak++;
      else break;
    }
  }

  for (let i = 1; i < uniqueDates.length; i++) {
    const days = Math.round(
      (new Date(uniqueDates[i - 1] + "T00:00:00").getTime() -
       new Date(uniqueDates[i]     + "T00:00:00").getTime()) / 86400000,
    );
    if (days === 1) { tempStreak++; }
    else            { longestStreak = Math.max(longestStreak, tempStreak); tempStreak = 1; }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  res.json({ totalEntries, currentStreak, longestStreak, avgLucidity, avgClarity,
             avgNightmareFactor, avgEntryLength, nightmareFrequency, avgEmotions });
});

// ─── POST /dreams ─────────────────────────────────────────────────────────────
router.post("/dreams", async (req, res): Promise<void> => {
  const parsed = CreateDreamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const body = parsed.data;
  const [row] = await db
    .insert(dreamsTable)
    .values({
      date: body.date, title: body.title, description: body.description,
      emotionAngry: body.emotions.angry, emotionSad: body.emotions.sad,
      emotionDisgust: body.emotions.disgust, emotionHappy: body.emotions.happy,
      emotionPeaceful: body.emotions.peaceful, emotionNeutral: body.emotions.neutral,
      lucidity: body.lucidity, clarity: body.clarity, nightmareFactor: body.nightmareFactor,
    })
    .returning();
  res.status(201).json(toApiDream(row));
});

// ─── GET /dreams/:id ─────────────────────────────────────────────────────────
router.get("/dreams/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db.select().from(dreamsTable).where(eq(dreamsTable.id, id));
  if (!row) { res.status(404).json({ error: "Dream not found" }); return; }
  res.json(toApiDream(row));
});

// ─── PATCH /dreams/:id ───────────────────────────────────────────────────────
router.patch("/dreams/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateDreamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const body = parsed.data;
  const updates: Partial<typeof dreamsTable.$inferInsert> = {};
  if (body.date        !== undefined) updates.date        = body.date;
  if (body.title       !== undefined) updates.title       = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.lucidity    !== undefined) updates.lucidity    = body.lucidity;
  if (body.clarity     !== undefined) updates.clarity     = body.clarity;
  if (body.nightmareFactor !== undefined) updates.nightmareFactor = body.nightmareFactor;
  if (body.emotions !== undefined) {
    updates.emotionAngry   = body.emotions.angry;
    updates.emotionSad     = body.emotions.sad;
    updates.emotionDisgust = body.emotions.disgust;
    updates.emotionHappy   = body.emotions.happy;
    updates.emotionPeaceful= body.emotions.peaceful;
    updates.emotionNeutral = body.emotions.neutral;
  }

  const [row] = await db.update(dreamsTable).set(updates).where(eq(dreamsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Dream not found" }); return; }
  res.json(toApiDream(row));
});

// ─── POST /dreams/:id/archive ────────────────────────────────────────────────
router.post("/dreams/:id/archive", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db
    .update(dreamsTable)
    .set({ archivedAt: new Date() })
    .where(eq(dreamsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Dream not found" }); return; }
  res.json(toApiDream(row));
});

// ─── POST /dreams/:id/restore ────────────────────────────────────────────────
router.post("/dreams/:id/restore", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db
    .update(dreamsTable)
    .set({ archivedAt: null })
    .where(eq(dreamsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Dream not found" }); return; }
  res.json(toApiDream(row));
});

// ─── DELETE /dreams/:id ──────────────────────────────────────────────────────
router.delete("/dreams/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db.delete(dreamsTable).where(eq(dreamsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Dream not found" }); return; }
  res.status(204).send();
});

export default router;
