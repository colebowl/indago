import { eq } from 'drizzle-orm'
import { db } from '../../providers/db/index.js'
import { properties } from '../../providers/db/schema.js'

type InsertProperty = typeof properties.$inferInsert

export async function insertProperty(data: InsertProperty) {
  const rows = await db.insert(properties).values(data).returning()
  return rows[0]!
}

export async function updateProperty(
  id: string,
  data: Partial<Omit<InsertProperty, 'id'>>,
) {
  const rows = await db
    .update(properties)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(properties.id, id))
    .returning()

  return rows[0] ?? null
}

export async function deleteProperty(id: string) {
  const rows = await db
    .delete(properties)
    .where(eq(properties.id, id))
    .returning()

  return rows[0] ?? null
}
