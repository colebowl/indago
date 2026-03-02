import { eq, and } from 'drizzle-orm'
import { db } from '../../providers/db/index'
import { checkResults, inquiries } from '../../providers/db/schema'

export async function findChecksByPropertyId(propertyId: string) {
  return db
    .select()
    .from(checkResults)
    .where(eq(checkResults.propertyId, propertyId))
    .orderBy(checkResults.createdAt)
}

export async function findCheckByPropertyAndCheckId(
  propertyId: string,
  checkId: string,
) {
  const rows = await db
    .select()
    .from(checkResults)
    .where(
      and(
        eq(checkResults.propertyId, propertyId),
        eq(checkResults.checkId, checkId),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

export async function findInquiriesByPropertyId(propertyId: string) {
  return db
    .select()
    .from(inquiries)
    .where(eq(inquiries.propertyId, propertyId))
    .orderBy(inquiries.createdAt)
}
