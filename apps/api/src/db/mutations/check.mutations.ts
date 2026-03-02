import { eq, and } from 'drizzle-orm'
import { db } from '../../providers/db/index.js'
import { checkResults, inquiries } from '../../providers/db/schema.js'

type InsertCheckResult = typeof checkResults.$inferInsert
type InsertInquiry = typeof inquiries.$inferInsert

export async function upsertCheckResult(data: InsertCheckResult) {
  const existing = await db
    .select()
    .from(checkResults)
    .where(
      and(
        eq(checkResults.propertyId, data.propertyId),
        eq(checkResults.checkId, data.checkId),
      ),
    )
    .limit(1)

  if (existing[0]) {
    const rows = await db
      .update(checkResults)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(checkResults.id, existing[0].id))
      .returning()
    return rows[0]!
  }

  const rows = await db.insert(checkResults).values(data).returning()
  return rows[0]!
}

export async function updateCheckStatus(
  propertyId: string,
  checkId: string,
  status: string,
) {
  const rows = await db
    .update(checkResults)
    .set({
      status,
      updatedAt: new Date(),
      completedAt: status === 'complete' ? new Date() : undefined,
    })
    .where(
      and(
        eq(checkResults.propertyId, propertyId),
        eq(checkResults.checkId, checkId),
      ),
    )
    .returning()

  return rows[0] ?? null
}

export async function insertInquiry(data: InsertInquiry) {
  const rows = await db.insert(inquiries).values(data).returning()
  return rows[0]!
}

export async function updateInquiry(
  id: string,
  data: Partial<Omit<InsertInquiry, 'id'>>,
) {
  const rows = await db
    .update(inquiries)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(inquiries.id, id))
    .returning()

  return rows[0] ?? null
}
