import { z } from 'zod'
import type { CheckContext, CheckSkill, SkillCheckResult, Source } from '../types'
import { updateProperty } from '../../db/mutations/property.mutations'
import { persona } from './persona'

const OCPSourceSchema = z.object({
  name: z.string(),
  url: z.union([z.string(), z.null()]),
  note: z.union([z.string(), z.null()]),
})

const OCPExtractionSchema = z.object({
  adoptionDate: z.union([z.string(), z.null()]),
  lastUpdated: z.union([z.string(), z.null()]),
  reviewStatus: z.union([z.string(), z.null()]),
  areaDesignation: z.union([z.string(), z.null()]),
  planningGoals: z.array(z.string()),
  futureDirection: z.union([z.string(), z.null()]),
  notes: z.union([z.string(), z.null()]),
  sources: z.array(OCPSourceSchema),
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
  const municipality = property.municipality

  if (!address || address === 'Pending...') {
    return {
      status: 'needs_input',
      summary: 'Property address is required for OCP lookup.',
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
    `Find Official Community Plan (OCP) information for this property: ${address}, ${municipality ?? 'British Columbia'}. Return only the JSON object.`,
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

  const parseResult = OCPExtractionSchema.safeParse(parsed)
  if (!parseResult.success) {
    return {
      status: 'error',
      summary: 'Failed to parse OCP data from AI response.',
      details: {
        message: parseResult.error.message,
        rawPreview: text.slice(0, 500),
      },
      sources: llmSources,
    }
  }

  const data = parseResult.data
  const ocpData = {
    adoptionDate: data.adoptionDate,
    lastUpdated: data.lastUpdated,
    reviewStatus: data.reviewStatus,
    areaDesignation: data.areaDesignation,
    planningGoals: data.planningGoals,
    futureDirection: data.futureDirection,
    notes: data.notes,
    sources: data.sources,
  }

  await updateProperty(property.id, { ocpData })

  const summaryParts: string[] = []
  if (data.reviewStatus) summaryParts.push(`Status: ${data.reviewStatus}`)
  if (data.areaDesignation) summaryParts.push(`Area: ${data.areaDesignation}`)
  if (data.planningGoals?.length) summaryParts.push(`${data.planningGoals.length} planning goals`)

  const resultSources: Source[] = data.sources.map((s) => ({
    name: s.name,
    url: s.url ?? undefined,
    type: 'data' as const,
    note: s.note ?? undefined,
  }))
  if (resultSources.length === 0) {
    resultSources.push(...llmSources)
  }

  return {
    status: 'complete',
    riskLevel: 'none',
    summary:
      summaryParts.length > 0
        ? summaryParts.join('. ')
        : `OCP research complete for ${municipality ?? 'area'}`,
    details: ocpData,
    sources: resultSources,
  }
}

export const skill: CheckSkill = { execute }
