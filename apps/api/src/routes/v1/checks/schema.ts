import { z } from 'zod'

export const PropertyIdParams = z.object({
  id: z.string().uuid(),
})
export type PropertyIdParams = z.infer<typeof PropertyIdParams>

export const CheckIdParams = z.object({
  id: z.string().uuid(),
  checkId: z.string().min(1),
})
export type CheckIdParams = z.infer<typeof CheckIdParams>

export const UpdateCheckStatusBody = z.object({
  status: z.enum([
    'not_started',
    'in_progress',
    'complete',
    'needs_input',
    'awaiting_response',
    'error',
    'skipped',
  ]),
})
export type UpdateCheckStatusBody = z.infer<typeof UpdateCheckStatusBody>

export function toCheckResultResponse(row: {
  id: string
  propertyId: string
  checkId: string
  status: string
  riskLevel: string | null
  summary: string | null
  details: unknown
  sources: unknown
  guidance: unknown
  insight: unknown
  tier: number
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: row.id,
    propertyId: row.propertyId,
    checkId: row.checkId,
    status: row.status,
    riskLevel: row.riskLevel,
    summary: row.summary,
    details: row.details,
    sources: row.sources,
    guidance: row.guidance,
    insight: row.insight,
    tier: row.tier,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
