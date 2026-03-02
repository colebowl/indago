import { eq } from 'drizzle-orm'
import { db } from '../../providers/db/index.js'
import { properties, checkResults } from '../../providers/db/schema.js'

export async function findAllProperties() {
  return db.select().from(properties).orderBy(properties.createdAt)
}

export async function findPropertyById(id: string) {
  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1)

  return rows[0] ?? null
}

export async function findPropertyWithChecks(id: string) {
  const property = await findPropertyById(id)
  if (!property) return null

  const checks = await db
    .select()
    .from(checkResults)
    .where(eq(checkResults.propertyId, id))
    .orderBy(checkResults.createdAt)

  return { ...property, checks }
}
