import { z } from 'zod'
import type {
  CheckContext,
  CheckSkill,
  SkillCheckResult,
  Source,
  UserGuidance,
} from '../types'
import { persona } from './persona'

const PropertyHistorySchema = z.object({
  municipalContact: z.object({
    department: z.string(),
    email: z.union([z.string(), z.null()]),
    phone: z.union([z.string(), z.null()]),
    website: z.union([z.string(), z.null()]),
  }),
  siteRegistryStatus: z.enum(['not_found', 'listed', 'unknown', 'clean']),
  siteRegistryNote: z.string(),
  inquiryDraft: z.object({
    subject: z.string(),
    body: z.string(),
  }),
})

function extractJsonFromResponse(text: string): string {
  const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonBlock) return jsonBlock[1].trim()

  const braceMatch = text.match(/\{[\s\S]*\}/)
  if (braceMatch) return braceMatch[0]

  return text.trim()
}

function generateReferenceId(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `IND-${num}`
}

export async function execute(context: CheckContext): Promise<SkillCheckResult> {
  const { property, llm } = context
  const address = property.address
  const municipality = property.municipality

  if (!address || address === 'Pending...') {
    return {
      status: 'needs_input',
      summary: 'Property address is required for inquiry drafting.',
      details: {
        message:
          'Run the listing-intake check first to populate the address and municipality.',
      },
      sources: [],
      guidance: {
        type: 'ask_someone',
        steps: [
          'Complete the listing intake check to extract the address.',
          'Then re-run this check.',
        ],
      },
    }
  }

  const { text, sources } = await llm.chatWithWebSearch(
    persona.systemPrompt,
    `Find municipal contact and BC Site Registry info for property history inquiry: ${address}, ${municipality ?? 'British Columbia'}. Return only the JSON object.`,
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

  const parseResult = PropertyHistorySchema.safeParse(parsed)
  if (!parseResult.success) {
    return {
      status: 'error',
      summary: 'Failed to parse property history data from AI response.',
      details: {
        message: parseResult.error.message,
        rawPreview: text.slice(0, 500),
      },
      sources: llmSources,
    }
  }

  const data = parseResult.data
  const referenceId = generateReferenceId()

  const subject = data.inquiryDraft.subject.replace('[ADDRESS]', address)
  const body = data.inquiryDraft.body
    .replace(/\[ADDRESS\]/g, address)
    .replace(/\[REFERENCE_ID\]/g, referenceId)

  const contact = data.municipalContact
  const recipientEmail = contact.email ?? undefined
  const recipientOrg = contact.department

  const steps: string[] = [
    `Review the draft email below (Reference ID: ${referenceId})`,
    'Edit subject/body as needed',
    'Copy to your email client and send to the municipal contact',
    'Save the reference ID to track responses',
  ]
  if (contact.website) {
    steps.push(`Contact info: ${contact.website}`)
  }

  const guidance: UserGuidance = {
    type: 'ask_someone',
    steps,
    contactInfo: contact.phone
      ? `${contact.department}: ${contact.phone}`
      : contact.department,
    emailDraft: {
      recipientName: contact.department,
      recipientEmail: recipientEmail ?? undefined,
      recipientOrg,
      subject,
      body,
    },
    trackingId: referenceId,
  }

  const siteRegistrySource: Source = {
    name: 'BC Contaminated Sites Registry',
    url: 'https://www2.gov.bc.ca/gov/content/environment/air-land-water/site-remediation',
    type: 'data',
    note:
      data.siteRegistryStatus === 'listed'
        ? 'Property or area may be in registry — verify'
        : 'BC Site Registry search recommended',
  }

  return {
    status: 'needs_input',
    riskLevel:
      data.siteRegistryStatus === 'listed' ? 'medium' : undefined,
    summary: `Draft inquiry ready for ${municipality ?? 'municipality'}. BC Site Registry: ${data.siteRegistryStatus}.`,
    details: {
      municipalContact: contact,
      siteRegistryStatus: data.siteRegistryStatus,
      siteRegistryNote: data.siteRegistryNote,
      referenceId,
      subject,
      bodyPreview: body.slice(0, 200) + (body.length > 200 ? '...' : ''),
    },
    sources: [siteRegistrySource, ...llmSources],
    guidance,
  }
}

export const skill: CheckSkill = { execute }
