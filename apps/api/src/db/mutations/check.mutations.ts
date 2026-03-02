import { eq, and } from 'drizzle-orm'
import { db } from '../../providers/db/index'
import { checkResults, inquiries } from '../../providers/db/schema'
import { DEFAULT_MAX_RETRIES } from '../../providers/db/schema'

type InsertCheckResult = typeof checkResults.$inferInsert
type InsertInquiry = typeof inquiries.$inferInsert

export async function upsertCheckResult(
  data: Omit<InsertCheckResult, 'retryCount' | 'maxRetries'> & {
    retryCount?: number
    maxRetries?: number
  },
) {
  const { retryCount: incomingRetryCount, maxRetries: incomingMaxRetries, ...rest } = data as InsertCheckResult & { retryCount?: number; maxRetries?: number }

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

  let retryCount: number
  let maxRetries: number

  if (data.status === 'error' && existing[0]) {
    retryCount = (existing[0].retryCount ?? 0) + 1
    maxRetries = existing[0].maxRetries ?? DEFAULT_MAX_RETRIES
  } else if (data.status === 'error') {
    retryCount = incomingRetryCount ?? 1
    maxRetries = incomingMaxRetries ?? DEFAULT_MAX_RETRIES
  } else {
    retryCount = 0
    maxRetries = incomingMaxRetries ?? existing[0]?.maxRetries ?? DEFAULT_MAX_RETRIES
  }

  const payload = { ...rest, retryCount, maxRetries }

  if (existing[0]) {
    const rows = await db
      .update(checkResults)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(checkResults.id, existing[0].id))
      .returning()
    return rows[0]!
  }

  const rows = await db.insert(checkResults).values(payload).returning()
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
