import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { z } from 'zod'
import type {
  CheckContext,
  CheckSkill,
  SkillCheckResult,
  Source,
  UserGuidance,
} from '../types'
import { findLatestTitleDocument } from '../../db/queries/document.queries'
import { persona } from './persona'

const TitleAnalysisSchema = z.object({
  summary: z.string(),
  charges: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      implication: z.string(),
    }),
  ),
  liens: z.array(
    z.object({
      party: z.string(),
      amount: z.union([z.string(), z.null()]),
      notes: z.string(),
    }),
  ),
  easements: z.array(
    z.object({
      type: z.string(),
      benefits: z.string(),
      burdens: z.string(),
      notes: z.string(),
    }),
  ),
  covenants: z.array(
    z.object({
      description: z.string(),
      implication: z.string(),
    }),
  ),
  riskLevel: z.enum(['none', 'low', 'medium', 'high']),
  recommendations: z.array(z.string()),
})

function extractJsonFromResponse(text: string): string {
  const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonBlock) return jsonBlock[1].trim()

  const braceMatch = text.match(/\{[\s\S]*\}/)
  if (braceMatch) return braceMatch[0]

  return text.trim()
}

const LTSA_SOURCE: Source = {
  name: 'Land Title and Survey Authority of BC',
  url: 'https://www.myltsa.ca',
  type: 'data',
  note: 'Official BC title search portal',
}

export async function execute(context: CheckContext): Promise<SkillCheckResult> {
  const { property, llm } = context

  const titleDoc = await findLatestTitleDocument(property.id)

  if (!titleDoc) {
    const steps: string[] = [
      'Create an account at myLTSA.ca (or use existing)',
      `Search for the parcel using PID: ${property.pid || 'obtain from listing or assessment notice'}`,
      'Purchase and download the title search document (PDF)',
      'Upload the PDF to this property',
      'Re-run this check to get an AI analysis',
    ]

    const guidance: UserGuidance = {
      type: 'upload_document',
      steps,
      url: 'https://www.myltsa.ca',
      contactInfo: 'LTSA Customer Service',
    }

    return {
      status: 'needs_input',
      summary: 'Upload a title search PDF to analyze charges, liens, and easements.',
      details: {
        message:
          'No title document has been uploaded. Follow the steps to obtain and upload a title search from myLTSA.ca.',
        pid: property.pid,
        estimatedCost: '~$15 per title',
      },
      sources: [LTSA_SOURCE],
      guidance,
    }
  }

  const absolutePath = titleDoc.filePath.startsWith('/')
    ? titleDoc.filePath
    : join(process.cwd(), titleDoc.filePath)

  let buffer: Buffer
  try {
    buffer = await readFile(absolutePath)
  } catch (err) {
    return {
      status: 'error',
      summary: 'Could not read the uploaded title document.',
      details: {
        message: err instanceof Error ? err.message : 'File read failed',
        filePath: titleDoc.filePath,
      },
      sources: [LTSA_SOURCE],
    }
  }

  const base64 = buffer.toString('base64')
  const mimeType = titleDoc.fileType || 'application/pdf'

  const text = await llm.parseDocument(
    persona.systemPrompt,
    base64,
    mimeType,
  )

  const jsonStr = extractJsonFromResponse(text)
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    return {
      status: 'error',
      summary: 'AI response was not valid JSON.',
      details: { rawPreview: text.slice(0, 500) },
      sources: [LTSA_SOURCE],
    }
  }

  const parseResult = TitleAnalysisSchema.safeParse(parsed)
  if (!parseResult.success) {
    return {
      status: 'error',
      summary: 'Failed to parse title analysis from AI response.',
      details: {
        message: parseResult.error.message,
        rawPreview: text.slice(0, 500),
      },
      sources: [LTSA_SOURCE],
    }
  }

  const data = parseResult.data

  return {
    status: 'complete',
    riskLevel: data.riskLevel,
    summary: data.summary,
    details: {
      charges: data.charges,
      liens: data.liens,
      easements: data.easements,
      covenants: data.covenants,
      recommendations: data.recommendations,
    },
    sources: [
      LTSA_SOURCE,
      {
        name: 'Uploaded title document',
        type: 'data' as const,
        note: titleDoc.fileName,
      },
    ],
  }
}

export const skill: CheckSkill = { execute }
