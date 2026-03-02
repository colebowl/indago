import type {
  CheckCategory,
  DataMode,
  Source,
  UserGuidance,
  BuyerInsight,
  BuyerType,
} from '@indago/types'

// Re-export shared types used by check modules
export type { CheckCategory, DataMode, Source, UserGuidance, BuyerInsight, BuyerType }

// LLM Provider — canonical interface lives in providers/llm
import type { LLMProvider } from '../providers/llm/types'
export type { LLMProvider }

// ---------------------------------------------------------------------------
// Activation Rules — declarative conditions that determine if a check applies
// ---------------------------------------------------------------------------

export interface ActivationRule {
  field: string
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'less_than' | 'greater_than'
  value: unknown
}

// ---------------------------------------------------------------------------
// Check Definition — metadata describing what a check does
// ---------------------------------------------------------------------------

export interface CheckDefinition {
  id: string
  category: CheckCategory
  name: string
  description: string
  whyItMatters: string
  dataMode: DataMode
  dataSource: string
  sourceUrl?: string
  tier: 1 | 2 | 3
  activationRules: ActivationRule[]
  relatedQuestions: string[]
  estimatedCost?: string
  dependsOn?: string[]
  /** When true, check results are simulated/mock data for demo purposes */
  isSimulated?: boolean
}

// ---------------------------------------------------------------------------
// Check Persona — the AI personality and instructions for a check
// ---------------------------------------------------------------------------

export interface CheckPersona {
  name: string
  role: string
  systemPrompt: string
  expertise: readonly string[]
  citationGuidance: string
}

// ---------------------------------------------------------------------------
// Check Context — everything a skill needs to execute
// ---------------------------------------------------------------------------

export interface PropertyRecord {
  id: string
  listingUrl: string | null
  address: string
  municipality: string | null
  province: string
  propertyType: string | null
  yearBuilt: number | null
  lotSize: string | null
  price: number | null
  pid: string | null
  waterSource: string | null
  sewerType: string | null
  isStrata: boolean | null
  buyerType: string
  buyerGoal: string | null
  isFirstTimeBuyer: boolean | null
  listingData: unknown
  zoningData: unknown
  ocpData: unknown
}

export interface CheckContext {
  property: PropertyRecord
  existingResults: ReadonlyMap<string, SkillCheckResult>
  llm: LLMProvider
}

// ---------------------------------------------------------------------------
// Skill Check Result — what a skill's execute() returns
// ---------------------------------------------------------------------------

export interface EmailDraft {
  recipientName?: string
  recipientEmail?: string
  recipientOrg?: string
  subject: string
  body: string
}

export interface SkillCheckResult {
  status: 'complete' | 'needs_input' | 'awaiting_response' | 'error'
  riskLevel?: 'none' | 'low' | 'medium' | 'high' | 'very_high'
  summary: string
  details: Record<string, unknown>
  sources: Source[]
  guidance?: UserGuidance
  insight?: BuyerInsight
}

// ---------------------------------------------------------------------------
// Check Skill — the executable logic for a check
// ---------------------------------------------------------------------------

export interface CheckSkill {
  execute(context: CheckContext): Promise<SkillCheckResult>
}

// ---------------------------------------------------------------------------
// Check Module — the bundled unit: definition + persona + skill
// ---------------------------------------------------------------------------

export interface CheckModule {
  definition: CheckDefinition
  persona: CheckPersona
  skill: CheckSkill
}
