import { env } from '../config/env'
import {
  findAllProperties,
  findPropertyById,
  findPropertyWithChecks,
} from '../db/queries/property.queries'
import {
  insertProperty,
  updateProperty,
  deleteProperty,
} from '../db/mutations/property.mutations'

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

/** Notifies n8n to trigger checks. Checks run ONLY via n8n -> POST /checks/{checkId}/execute. */
async function triggerChecks(propertyId: string) {
  const property = await findPropertyById(propertyId)
  if (!property) return

  if (!env.N8N_WEBHOOK_URL) {
    console.warn('N8N_WEBHOOK_URL not set — checks will not run. Configure n8n to trigger /checks/{checkId}/execute.')
    return
  }

  try {
    const payload = {
      propertyId,
      listingUrl: property.listingUrl,
      address: property.address,
      buyerType: property.buyerType,
      isFirstTimeBuyer: property.isFirstTimeBuyer,
    }
    const res = await fetch(env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.warn('n8n webhook returned non-OK:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('n8n webhook unreachable:', err)
  }
}

/** Triggers checks via n8n only. Checks run ONLY via POST /checks/{checkId}/execute. */
export async function runAllChecks(propertyId: string) {
  const property = await findPropertyById(propertyId)
  if (!property) return null

  if (!env.N8N_WEBHOOK_URL) {
    throw new Error(
      'N8N_WEBHOOK_URL not set. Checks must be triggered by n8n calling POST /checks/{checkId}/execute.',
    )
  }

  const payload = {
    propertyId,
    listingUrl: property.listingUrl,
    address: property.address,
    buyerType: property.buyerType,
    isFirstTimeBuyer: property.isFirstTimeBuyer,
  }
  const res = await fetch(env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`n8n webhook failed (${res.status}): ${text || res.statusText}`)
  }

  return { propertyId, triggered: true }
}
