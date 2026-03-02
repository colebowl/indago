import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { z } from 'zod'
import type { CheckContext, CheckSkill, SkillCheckResult, Source } from '../types'
import { updateProperty } from '../../db/mutations/property.mutations'
import { persona } from './persona'

const ListingExtractionSchema = z.object({
  address: z.union([z.string(), z.null()]),
  municipality: z.union([z.string(), z.null()]),
  regionalDistrict: z.union([z.string(), z.null()]),
  propertyType: z
    .union([
      z.enum(['detached', 'townhouse', 'condo', 'land', 'duplex', 'other']),
      z.null(),
    ]),
  yearBuilt: z.union([z.number(), z.null()]),
  lotSize: z.union([z.string(), z.null()]),
  price: z.union([z.number(), z.null()]),
  pid: z.union([z.string(), z.null()]),
  mlsNumber: z.union([z.string(), z.null()]).optional(),
  bedrooms: z.union([z.number(), z.null()]),
  bathrooms: z.union([z.number(), z.null()]),
  waterSource: z.union([z.string(), z.null()]),
  sewerType: z.union([z.string(), z.null()]),
  isStrata: z.union([z.boolean(), z.null()]),
  zoningDescription: z.union([z.string(), z.null()]),
  zoningType: z.union([z.string(), z.null()]),
  primaryImageUrl: z
    .union([z.string(), z.null()])
    .optional()
    .default(null)
    .transform((v): string | null => {
      if (v == null || typeof v !== 'string') return null
      const trimmed = v.trim()
      if (!trimmed) return null
      try {
        new URL(trimmed)
        return trimmed
      } catch {
        try {
          new URL(trimmed, 'https://www.realtor.ca')
          return trimmed
        } catch {
          return null
        }
      }
    }),
})

function extractJsonFromResponse(text: string): string {
  const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonBlock) return jsonBlock[1].trim()

  const braceMatch = text.match(/\{[\s\S]*\}/)
  if (braceMatch) return braceMatch[0]

  return text.trim()
}

const LISTING_FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-CA,en;q=0.9',
  Referer: 'https://www.realtor.ca/',
}

/** Extracts text content for LLM from listing page HTML (JSON-LD, meta, visible text). Max ~80k chars. */
function extractListingContentFromHtml(html: string): string {
  const parts: string[] = []

  // 1. JSON-LD blocks — often contain structured listing data
    const ldMatches = html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    )
    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1])
        parts.push('JSON-LD:', JSON.stringify(parsed, null, 0))
      } catch {
        parts.push('JSON-LD raw:', m[1].slice(0, 5000))
      }
    }

    // 2. Meta tags (og:, twitter:, description) — handle both attribute orders
    const metaPatterns = [
      /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']+)["']/gi,
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']([^"']+)["']/gi,
    ]
    const metaLines: string[] = []
    const metaSeen = new Set<string>()
    for (let i = 0; i < metaPatterns.length; i++) {
      const re = metaPatterns[i]
      for (const m of html.matchAll(re)) {
        const key = i === 0 ? m[1] : m[2]
        const val = i === 0 ? m[2] : m[1]
        const k = `${key}:${val}`
        if (!metaSeen.has(k)) {
          metaSeen.add(k)
          metaLines.push(`${key}: ${val}`)
        }
      }
    }
    if (metaLines.length) parts.push('Meta:', metaLines.join('\n'))

    // 3. Visible text — strip tags, collapse whitespace
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    const body = bodyMatch ? bodyMatch[1] : html
    const noScript = body.replace(/<script[\s\S]*?<\/script>/gi, '')
    const text = noScript.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (text.length > 2000) parts.push('Page text:', text.slice(0, 60_000))

  return parts.join('\n\n---\n\n').slice(0, 80_000) || html.slice(0, 80_000)
}

async function fetchListingPageHtml(listingUrl: string): Promise<{ html: string; ok: boolean }> {
  try {
    const res = await fetch(listingUrl, {
      headers: LISTING_FETCH_HEADERS,
      redirect: 'follow',
    })
    if (!res.ok) return { html: '', ok: false }
    const html = await res.text()
    if (/Incapsula|Request unsuccessful/i.test(html)) return { html: '', ok: false }
    return { html, ok: true }
  } catch {
    return { html: '', ok: false }
  }
}

/**
 * Fetches the listing page HTML and extracts the primary image URL.
 * Tries: og:image, twitter:image, JSON-LD schema, and common real estate image patterns.
 */
async function extractPrimaryImageFromListingPage(listingUrl: string, html?: string): Promise<string | null> {
  try {
    let pageHtml = html
    if (!pageHtml) {
      const res = await fetch(listingUrl, {
        headers: LISTING_FETCH_HEADERS,
        redirect: 'follow',
      })
      if (!res.ok) return null
      pageHtml = await res.text()
    }
    if (/Incapsula|Request unsuccessful/i.test(pageHtml)) return null

    // 1. og:image (Open Graph) - multiple attribute orders
    const ogPatterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    ]
    for (const re of ogPatterns) {
      const m = pageHtml.match(re)
      if (m) return normalizeImageUrl(m[1].trim(), listingUrl)
    }

    // 2. twitter:image
    const twitterPatterns = [
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ]
    for (const re of twitterPatterns) {
      const m = pageHtml.match(re)
      if (m) return normalizeImageUrl(m[1].trim(), listingUrl)
    }

    // 3. JSON-LD - RealEstateListing, Product, or Place often have image
    const ldJsonMatches = pageHtml.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    )
    for (const match of ldJsonMatches) {
      try {
        const json = JSON.parse(match[1])
        const arr = Array.isArray(json) ? json : [json]
        for (const obj of arr) {
          const img = obj.image ?? obj.photo ?? obj.thumbnailUrl
          if (img) {
            const url = typeof img === 'string' ? img : img?.[0] ?? img?.url
            if (url && typeof url === 'string')
              return normalizeImageUrl(url.trim(), listingUrl)
          }
        }
      } catch {
        /* skip invalid JSON-LD */
      }
    }

    // 4. Image URLs in HTML — real estate CDNs and common hosting
    const imgRe = /(https?:\/\/[^"'\s<>]+\.(?:jpe?g|png|webp)(?:\?[^"'\s<>]*)?)/gi
    const realEstateDomains = [
      'realtor',
      'remax',
      'crea',
      'mls',
      'photos',
      'listing',
      'cdnhousing',
      's3.',
      'cloudfront',
      'images.',
      'media.',
      'static.',
    ]
    const seen = new Set<string>()
    for (const m of pageHtml.matchAll(imgRe)) {
      const url = m[1].trim()
      if (!url || seen.has(url)) continue
      const lower = url.toLowerCase()
      if (realEstateDomains.some((d) => lower.includes(d))) {
        seen.add(url)
        return normalizeImageUrl(url, listingUrl)
      }
    }

    return null
  } catch {
    return null
  }
}

function normalizeImageUrl(url: string, baseUrl: string): string {
  const trimmed = url.trim()
  if (!trimmed) return url
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  try {
    return new URL(trimmed, baseUrl).href
  } catch {
    return url
  }
}

/**
 * Tries to get the primary image URL from realtor.ca's PropertyDetails API.
 * Works when HTML fetch is blocked by bot protection (Incapsula).
 * Requires PropertyId from URL and MlsNumber from listing (or PropertyId as fallback).
 */
async function fetchPrimaryImageFromRealtorCaApi(
  listingUrl: string,
  mlsNumber: string | null,
): Promise<string | null> {
  try {
    const match = listingUrl.match(/realtor\.ca\/real-estate\/(\d+)/i)
    if (!match) return null
    const propertyId = match[1]
    const referenceNumber = mlsNumber || propertyId
    const apiUrl = `https://api37.realtor.ca/Listing.svc/PropertyDetails?PropertyId=${propertyId}&ApplicationId=37&CultureId=1&HashCode=0&ReferenceNumber=${referenceNumber}`
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
        Referer: 'https://www.realtor.ca/',
      },
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('json')) return null
    const data = (await res.json()) as {
      Property?: { Photo?: Array<{ HighResPath?: string; MedResPath?: string; LowResPath?: string }> }
      ErrorCode?: { Id?: number }
    }
    if (data.ErrorCode?.Id !== 200) return null
    const photos = data.Property?.Photo
    if (!Array.isArray(photos) || photos.length === 0) return null
    const first = photos[0]
    return first.HighResPath ?? first.MedResPath ?? first.LowResPath ?? null
  } catch {
    return null
  }
}

export async function execute(context: CheckContext): Promise<SkillCheckResult> {
  const { property, llm } = context
  const listingUrl = property.listingUrl

  if (!listingUrl || typeof listingUrl !== 'string') {
    return {
      status: 'needs_input',
      summary: 'Listing URL is required to extract property data.',
      details: {
        message: 'No listing URL was provided when creating the property.',
      },
      sources: [],
      guidance: {
        type: 'manual_lookup',
        steps: [
          'Create a property with a realtor.ca (or similar) listing URL.',
          'The URL is used to fetch and extract property details automatically.',
        ],
      },
    }
  }

  // Fetch listing page directly — we load the full page so LLM gets images, zoning, and all details
  const { html: pageHtml, ok: pageOk } = await fetchListingPageHtml(listingUrl)
  const extractedImageUrl = await extractPrimaryImageFromListingPage(listingUrl, pageOk ? pageHtml : undefined)

  if (!pageOk || !pageHtml) {
    return {
      status: 'error',
      summary: 'Could not load the listing page. It may be blocked or the URL may be invalid.',
      details: { listingUrl },
      sources: [{ name: 'Listing', url: listingUrl, retrievedAt: new Date().toISOString(), type: 'data' }],
    }
  }

  const pageContent = extractListingContentFromHtml(pageHtml)
  const text = await llm.chat(
    persona.systemPrompt,
    `Below is the full content extracted from the listing page at ${listingUrl}. Extract the property data from it. Return ONLY the JSON object.\n\n---\n\n${pageContent}`,
  )

  const llmSources: Source[] = [
    {
      name: 'Listing page',
      url: listingUrl,
      retrievedAt: new Date().toISOString(),
      type: 'data',
    },
  ]

  const jsonStr = extractJsonFromResponse(text)
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    return {
      status: 'error',
      summary: 'AI response was not valid JSON.',
      details: { rawPreview: text.slice(0, 500) },
      sources: llmSources,
    }
  }
  const parseResult = ListingExtractionSchema.safeParse(parsed)

  if (!parseResult.success) {
    return {
      status: 'error',
      summary: 'Failed to parse listing data from AI response.',
      details: {
        message: parseResult.error.message,
        rawPreview: text.slice(0, 500),
      },
      sources: llmSources,
    }
  }

  const data = parseResult.data
  const listingData: Record<string, unknown> = {
    address: data.address,
    municipality: data.municipality,
    regionalDistrict: data.regionalDistrict,
    propertyType: data.propertyType,
    yearBuilt: data.yearBuilt,
    lotSize: data.lotSize,
    price: data.price,
    pid: data.pid,
    mlsNumber: data.mlsNumber ?? undefined,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    waterSource: data.waterSource,
    sewerType: data.sewerType,
    isStrata: data.isStrata,
    zoningDescription: data.zoningDescription,
    zoningType: data.zoningType,
    primaryImageUrl: data.primaryImageUrl,
  }

  // Resolve relative image URL against listing origin
  function resolveImageUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url
    if (!listingUrl) return url
    try {
      const base = new URL(listingUrl)
      return new URL(url, base.origin).href
    } catch {
      return url
    }
  }

  async function downloadAndSavePrimaryImage(imageUrl: string): Promise<string | null> {
    try {
      const res = await fetch(resolveImageUrl(imageUrl), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
          Referer: listingUrl ?? 'https://www.realtor.ca/',
        },
      })
      if (!res.ok) return null
      const contentType = res.headers.get('content-type') ?? ''
      const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : contentType.includes('png') ? 'png' : 'jpg'
      const buffer = Buffer.from(await res.arrayBuffer())
      const uploadDir = join(process.cwd(), 'uploads', 'properties', property.id)
      await mkdir(uploadDir, { recursive: true })
      const fileName = `primary.${ext}`
      const filePath = join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      return `uploads/properties/${property.id}/${fileName}`
    } catch {
      return null
    }
  }

  let primaryImagePath: string | null = null
  let imageUrlToTry: string | null =
    (data.primaryImageUrl && typeof data.primaryImageUrl === 'string'
      ? data.primaryImageUrl
      : null) ?? extractedImageUrl

  if (!imageUrlToTry && /realtor\.ca/i.test(listingUrl ?? '')) {
    imageUrlToTry = await fetchPrimaryImageFromRealtorCaApi(
      listingUrl!,
      data.mlsNumber ?? null,
    )
  }

  if (imageUrlToTry) {
    primaryImagePath = await downloadAndSavePrimaryImage(imageUrlToTry)
  }

  await updateProperty(property.id, {
    address: data.address ?? property.address,
    municipality: data.municipality ?? property.municipality,
    propertyType: data.propertyType ?? property.propertyType,
    yearBuilt: data.yearBuilt ?? property.yearBuilt,
    lotSize: data.lotSize ?? property.lotSize,
    price: data.price ?? property.price,
    pid: data.pid ?? property.pid,
    waterSource: data.waterSource ?? property.waterSource,
    sewerType: data.sewerType ?? property.sewerType,
    isStrata: data.isStrata ?? property.isStrata,
    ...(primaryImagePath && { primaryImagePath }),
    listingData,
  })

  const extracted: string[] = []
  if (data.address) extracted.push(`address: ${data.address}`)
  if (data.municipality) extracted.push(`municipality: ${data.municipality}`)
  if (data.regionalDistrict) extracted.push(`regional district: ${data.regionalDistrict}`)
  if (data.propertyType) extracted.push(`type: ${data.propertyType}`)
  if (data.zoningDescription) extracted.push(`zoning: ${data.zoningDescription}`)
  if (data.price) extracted.push(`price: $${data.price.toLocaleString()}`)
  if (data.yearBuilt) extracted.push(`year built: ${data.yearBuilt}`)
  if (data.bedrooms != null) extracted.push(`${data.bedrooms} bed`)
  if (data.bathrooms != null) extracted.push(`${data.bathrooms} bath`)

  llmSources.unshift({
    name: 'Listing page',
    url: listingUrl,
    type: 'data',
    note: 'Source listing URL',
  })

  return {
    status: 'complete',
    riskLevel: 'none',
    summary: `Extracted: ${extracted.join(', ') || 'basic property data'}.`,
    details: {
      address: data.address,
      municipality: data.municipality,
      regionalDistrict: data.regionalDistrict,
      propertyType: data.propertyType,
      price: data.price,
      yearBuilt: data.yearBuilt,
      lotSize: data.lotSize,
      pid: data.pid,
      waterSource: data.waterSource,
      sewerType: data.sewerType,
      isStrata: data.isStrata,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      zoningDescription: data.zoningDescription,
      zoningType: data.zoningType,
    },
    sources: llmSources,
  }
}

export const skill: CheckSkill = { execute }