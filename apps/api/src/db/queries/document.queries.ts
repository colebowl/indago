import { eq, desc } from 'drizzle-orm'
import { db } from '../../providers/db/index'
import { uploadedDocuments } from '../../providers/db/schema'

export async function findDocumentsByPropertyId(propertyId: string) {
  return db
    .select()
    .from(uploadedDocuments)
    .where(eq(uploadedDocuments.propertyId, propertyId))
    .orderBy(desc(uploadedDocuments.createdAt))
}

/**
 * Find the most recent PDF document uploaded for a property (used by title-search check).
 */
export async function findLatestTitleDocument(propertyId: string) {
  const docs = await findDocumentsByPropertyId(propertyId)
  const pdf = docs.find(
    (d) =>
      d.fileType === 'application/pdf' || d.fileType.toLowerCase().includes('pdf'),
  )
  return pdf ?? null
}
