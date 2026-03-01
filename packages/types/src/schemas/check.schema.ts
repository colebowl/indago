import { z } from 'zod'
import { BuyerType } from './property.schema'

export const CheckCategory = z.enum([
  'ownership-title',
  'physical-structure',
  'land-natural-hazards',
  'environmental-legacy',
  'land-use-zoning',
  'financial',
  'neighbourhood-context',
  'regulatory-compliance',
  'transaction-risk',
])
export type CheckCategory = z.infer<typeof CheckCategory>

export const DataMode = z.enum(['programmatic', 'manual', 'ask'])
export type DataMode = z.infer<typeof DataMode>

export const CheckStatus = z.enum([
  'not_started',
  'in_progress',
  'complete',
  'needs_input',
  'awaiting_response',
  'error',
  'skipped',
])
export type CheckStatus = z.infer<typeof CheckStatus>

export const RiskLevel = z.enum(['none', 'low', 'medium', 'high', 'very_high'])
export type RiskLevel = z.infer<typeof RiskLevel>

export const SourceType = z.enum(['data', 'rule', 'ai_inference'])
export type SourceType = z.infer<typeof SourceType>

export const Source = z.object({
  name: z.string(),
  url: z.string().optional(),
  retrievedAt: z.string().optional(),
  type: SourceType,
  note: z.string().optional(),
})
export type Source = z.infer<typeof Source>

export const EmailDraft = z.object({
  recipientName: z.string().optional(),
  recipientEmail: z.string().optional(),
  recipientOrg: z.string().optional(),
  subject: z.string(),
  body: z.string(),
})
export type EmailDraft = z.infer<typeof EmailDraft>

export const UserGuidance = z.object({
  type: z.enum(['manual_lookup', 'ask_someone', 'upload_document']),
  steps: z.array(z.string()),
  url: z.string().optional(),
  contactInfo: z.string().optional(),
  emailDraft: EmailDraft.optional(),
  trackingId: z.string().optional(),
})
export type UserGuidance = z.infer<typeof UserGuidance>

export const BuyerInsight = z.object({
  buyerType: BuyerType,
  headline: z.string(),
  body: z.string(),
  implications: z.array(z.string()),
})
export type BuyerInsight = z.infer<typeof BuyerInsight>

export const CheckDefinitionSchema = z.object({
  id: z.string(),
  category: CheckCategory,
  name: z.string(),
  description: z.string(),
  whyItMatters: z.string(),
  dataMode: DataMode,
  dataSource: z.string(),
  sourceUrl: z.string().optional(),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  relatedQuestions: z.array(z.string()),
  estimatedCost: z.string().optional(),
  dependsOn: z.array(z.string()).optional(),
})
export type CheckDefinitionSchema = z.infer<typeof CheckDefinitionSchema>

export const CheckResult = z.object({
  id: z.string().uuid(),
  propertyId: z.string().uuid(),
  checkId: z.string(),
  status: CheckStatus,
  riskLevel: RiskLevel.nullable(),
  summary: z.string().nullable(),
  details: z.record(z.unknown()).nullable(),
  sources: z.array(Source).nullable(),
  guidance: UserGuidance.nullable(),
  insight: BuyerInsight.nullable(),
  tier: z.number().int(),
  definition: CheckDefinitionSchema.optional(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type CheckResult = z.infer<typeof CheckResult>
