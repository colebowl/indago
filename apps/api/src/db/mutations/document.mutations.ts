import { db } from '../../providers/db/index'
import { uploadedDocuments } from '../../providers/db/schema'

type InsertDocument = typeof uploadedDocuments.$inferInsert

export async function insertUploadedDocument(data: InsertDocument) {
  const rows = await db.insert(uploadedDocuments).values(data).returning()
  return rows[0]!
}
