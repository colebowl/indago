import { z } from 'zod'
import type { CheckContext, CheckSkill, SkillCheckResult, Source } from '../types'
import { updateProperty } from '../../db/mutations/property.mutations'
import { persona } from './persona'

const ZoningSourceSchema = z.object({
  name: z.string(),
  url: z.union([z.string(), z.null()]),
  note: z.union([z.string(), z.null()]),
})

const ZoningExtractionSchema = z.object({
  designation: z.union([z.string(), z.null()]),
  designationName: z.union([z.string(), z.null()]),
  permittedUses: z
    .union([z.array(z.string()), z.null()])
    .transform((v) => v ?? []),
  aduEligible: z.union([z.boolean(), z.null()]),
  aduBylawReference: z.union([z.string(), z.null()]),
  secondarySuiteEligible: z.union([z.boolean(), z.null()]),
  shortTermRentalAllowed: z.union([z.boolean(), z.null()]),
  shortTermRentalBylawReference: z.union([z.string(), z.null()]),
  notes: z.union([z.string(), z.null()]),
  sources: z
    .union([z.array(ZoningSourceSchema), z.null()])
    .transform((v) => v ?? []),
})

function extractJsonFromResponse(text: string): string {
  const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonBlock) return jsonBlock[1].trim()

  const braceMatch = text.match(/\{[\s\S]*\}/)
  if (braceMatch) return braceMatch[0]

  return text.trim()
}

export async function execute(context: CheckContext): Promise<SkillCheckResult> {
  const { property, llm } = context
  const address = property.address
  const listingData = property.listingData as { regionalDistrict?: string | null } | null
  const regionalDistrict = listingData?.regionalDistrict ?? null
  const municipality = property.municipality

  // Use regional district when present — properties in CVRD, CRD, etc. are zoned by the RD, not the nearest city
  const jurisdiction = regionalDistrict ?? municipality ?? 'British Columbia'

  if (!address || address === 'Pending...') {
    return {
      status: 'needs_input',
      summary: 'Property address is required for zoning lookup.',
      details: {
        message:
          'Run the listing-intake check first to populate the address and municipality.',
      },
      sources: [],
      guidance: {
        type: 'manual_lookup',
        steps: [
          'Complete the listing intake check to extract the address.',
          'Then re-run this check.',
        ],
      },
    }
  }

  const { text, sources } = await llm.chatWithWebSearch(
    persona.systemPrompt,
    `Find zoning information for this property: ${address}, ${jurisdiction}. Return only the JSON object.`,
  )

  const llmSources: Source[] = sources.map((s) => ({
    name: s.name,
    url: s.url,
    retrievedAt: s.retrievedAt,
    type: 'data' as const,
    note: s.note,
  }))

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

  const parseResult = ZoningExtractionSchema.safeParse(parsed)
  if (!parseResult.success) {
    return {
      status: 'error',
      summary: 'Failed to parse zoning data from AI response.',
      details: {
        message: parseResult.error.message,
        rawPreview: text.slice(0, 500),
      },
      sources: llmSources,
    }
  }

  const data = parseResult.data
  const listingZoning = (property.listingData as { zoningDescription?: string; zoningType?: string; regionalDistrict?: string } | null) ?? {}
  const zoningData = {
    designation: data.designation ?? listingZoning.zoningDescription ?? null,
    designationName: data.designationName ?? listingZoning.zoningType ?? null,
    permittedUses: data.permittedUses,
    aduEligible: data.aduEligible,
    aduBylawReference: data.aduBylawReference,
    secondarySuiteEligible: data.secondarySuiteEligible,
    shortTermRentalAllowed: data.shortTermRentalAllowed,
    shortTermRentalBylawReference: data.shortTermRentalBylawReference,
    notes: data.notes,
    sources: data.sources,
  }

  await updateProperty(property.id, { zoningData })

  const designation = data.designation ?? listingZoning.zoningDescription ?? null
  const designationName = data.designationName ?? listingZoning.zoningType ?? null

  const summaryParts: string[] = []
  if (designation) summaryParts.push(`Zoning: ${designation}`)
  if (designationName && !summaryParts.length) summaryParts.push(designationName)
  if (data.permittedUses?.length) summaryParts.push(`${data.permittedUses.length} permitted uses`)
  if (data.aduEligible === true) summaryParts.push('ADU eligible')
  if (data.secondarySuiteEligible === true) summaryParts.push('Secondary suite eligible')
  if (data.shortTermRentalAllowed === false) summaryParts.push('STR restricted')
  if (data.notes) summaryParts.push(data.notes)

  const resultSources: Source[] = data.sources.map((s) => ({
    name: s.name,
    url: s.url ?? undefined,
    type: 'data' as const,
    note: s.note ?? undefined,
  }))
  if (resultSources.length === 0) {
    resultSources.push(...llmSources)
  }

  const summary =
    summaryParts.length > 0
      ? summaryParts.join('. ')
      : designation
        ? `Zoning: ${designation} (${jurisdiction})`
        : `Zoning lookup for ${address}, ${jurisdiction} — check details for results`

  return {
    status: 'complete',
    riskLevel: 'none',
    summary,
    details: zoningData,
    sources: resultSources,
  }
}

export const skill: CheckSkill = { execute }
