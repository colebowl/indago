import { env } from '../config/env.js'
import {
  findAllProperties,
  findPropertyById,
  findPropertyWithChecks,
} from '../db/queries/property.queries.js'
import {
  insertProperty,
  updateProperty,
  deleteProperty,
} from '../db/mutations/property.mutations.js'

interface CreatePropertyInput {
  listingUrl: string
  buyerType: string
  isFirstTimeBuyer: boolean
  buyerGoal?: string
}

export async function createProperty(input: CreatePropertyInput) {
  const property = await insertProperty({
    listingUrl: input.listingUrl,
    address: 'Pending...', // populated by listing-intake check
    buyerType: input.buyerType,
    isFirstTimeBuyer: input.isFirstTimeBuyer,
    buyerGoal: input.buyerGoal ?? null,
  })

  triggerChecks(property.id).catch((err) => {
    console.error('Failed to trigger checks for property', property.id, err)
  })

  return property
}

export async function getProperty(id: string) {
  return findPropertyWithChecks(id)
}

export async function listProperties() {
  return findAllProperties()
}

export async function removeProperty(id: string) {
  return deleteProperty(id)
}

export { updateProperty }

async function triggerChecks(propertyId: string) {
  if (env.N8N_WEBHOOK_URL) {
    try {
      const res = await fetch(env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })
      if (res.ok) return
      console.warn('n8n webhook returned non-OK, falling back to in-process')
    } catch {
      console.warn('n8n webhook unreachable, falling back to in-process')
    }
  }

  // In-process fallback — will be implemented with check executor in Task 17+
  console.info(`In-process check execution for property ${propertyId} (not yet implemented)`)
}

export async function runAllChecks(propertyId: string) {
  const property = await findPropertyById(propertyId)
  if (!property) return null

  await triggerChecks(propertyId)
  return { propertyId, triggered: true }
}
