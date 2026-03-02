import type {
  ReportSummary,
  ReportSection,
  ForYouInsight,
  CheckResult,
  CheckDefinitionSchema,
  Source,
  BuyerInsight,
} from '@indago/types'
import type { LLMProvider } from '../providers/llm'
import { findPropertyById } from '../db/queries/property.queries'
import { findChecksByPropertyId } from '../db/queries/check.queries'
import { findReportSectionAnswersByPropertyId } from '../db/queries/report.queries'
import { upsertReportSectionAnswer } from '../db/mutations/report.mutations'
import { registry } from '../checks/registry'
import { BUYER_QUESTIONS } from '../checks/categories'
import type { CheckCategory } from '../checks/types'

type DbCheckRow = Awaited<ReturnType<typeof findChecksByPropertyId>>[number]

function definitionToSchema(def: {
  id: string
  category: CheckCategory
  name: string
  description: string
  whyItMatters: string
  dataSource: string
  tier: 1 | 2 | 3
  relatedQuestions: string[]
  dataMode?: string
  sourceUrl?: string
  estimatedCost?: string
  dependsOn?: string[]
  isSimulated?: boolean
}): CheckDefinitionSchema {
  return {
    id: def.id,
    category: def.category,
    name: def.name,
    description: def.description,
    whyItMatters: def.whyItMatters,
    dataMode: (def.dataMode ?? 'programmatic') as 'programmatic' | 'manual' | 'ask',
    dataSource: def.dataSource,
    sourceUrl: def.sourceUrl,
    tier: def.tier,
    relatedQuestions: def.relatedQuestions,
    estimatedCost: def.estimatedCost,
    dependsOn: def.dependsOn,
    isSimulated: def.isSimulated,
  }
}

function dbRowToCheckResult(
  row: DbCheckRow,
  definition: ReturnType<typeof definitionToSchema>,
): CheckResult {
  return {
    id: row.id,
    propertyId: row.propertyId,
    checkId: row.checkId,
    status: (row.status ?? 'not_started') as CheckResult['status'],
    riskLevel: row.riskLevel as CheckResult['riskLevel'],
    summary: row.summary,
    details: (row.details as Record<string, unknown>) ?? {},
    sources: (row.sources as Source[]) ?? [],
    guidance: (row.guidance as CheckResult['guidance']) ?? null,
    insight: (row.insight as BuyerInsight) ?? null,
    tier: row.tier,
    retryCount: row.retryCount ?? 0,
    maxRetries: row.maxRetries ?? 3,
    definition,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function notStartedPlaceholder(
  checkId: string,
  definition: ReturnType<typeof definitionToSchema>,
  propertyId: string,
): CheckResult {
  return {
    id: `placeholder-${checkId}`,
    propertyId,
    checkId,
    status: 'not_started',
    riskLevel: null,
    summary: null,
    details: null,
    sources: null,
    guidance: null,
    insight: null,
    tier: definition.tier,
    retryCount: 0,
    maxRetries: 3,
    definition,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function hasRetriesLeft(check: CheckResult): boolean {
  return (
    check.status === 'error' &&
    (check.retryCount ?? 0) < (check.maxRetries ?? 3)
  )
}

function effectiveStatus(check: CheckResult): CheckResult['status'] {
  if (hasRetriesLeft(check)) return 'in_progress'
  return check.status
}

function sectionStatus(
  checks: CheckResult[],
): 'complete' | 'needs_input' | 'awaiting_response' | 'in_progress' | 'not_started' | 'error' {
  const statuses = new Set(checks.map((c) => effectiveStatus(c)))
  if (statuses.has('complete')) return 'complete'
  if (statuses.has('needs_input')) return 'needs_input'
  if (statuses.has('awaiting_response')) return 'awaiting_response'
  if (statuses.has('in_progress')) return 'in_progress'
  if (statuses.has('error')) return 'error'
  return 'not_started'
}

/** Synthesize section answer from completed check summaries. No LLM — report endpoint must not call Anthropic. */
function synthesizeAnswerFallback(checks: CheckResult[], question: string): string | null {
  const completed = checks.filter((c) => c.status === 'complete' || c.status === 'needs_input')
  if (completed.length === 0) return null

  const related = completed.filter(
    (c) => c.definition?.relatedQuestions?.includes(question),
  )
  const toUse = related.length > 0 ? related : completed

  const parts = toUse
    .filter((c) => c.summary)
    .map((c) => c.summary)
    .slice(0, 3)
  return parts.length > 0 ? parts.join(' ') : null
}

const YES_NO_QUESTION_PATTERNS = [/^can i /i, /^is this /i, /^are there /i, /^do i /i, /^am i going to /i]
function isYesNoQuestion(question: string): boolean {
  return YES_NO_QUESTION_PATTERNS.some((p) => p.test(question.trim()))
}

function buildCheckContext(checks: CheckResult[]): string {
  return checks
    .filter(
      (c) =>
        (c.status === 'complete' || c.status === 'needs_input') && (c.summary || c.details),
    )
    .map((c) => {
      const parts: string[] = [`[${c.definition?.name ?? c.checkId}]:`]
      if (c.summary) parts.push(`Summary: ${c.summary}`)
      if (c.details && typeof c.details === 'object') {
        const d = c.details as Record<string, unknown>
        const keyFields = [
          'shortTermRentalAllowed',
          'shortTermRentalBylawReference',
          'permittedUses',
          'reviewStatus',
          'planningGoals',
          'futureDirection',
          'riskLevel',
          'designation',
        ]
        const relevant = keyFields
          .filter((f) => d[f] !== undefined && d[f] !== null)
          .map((f) => `${f}: ${JSON.stringify(d[f])}`)
        if (relevant.length > 0) parts.push(`Details: ${relevant.join('; ')}`)
      }
      return parts.join(' ')
    })
    .join('\n\n')
}

async function synthesizeAnswerWithLLM(
  llm: LLMProvider,
  question: string,
  buyerType: string,
  checks: CheckResult[],
): Promise<string | null> {
  const completed = checks.filter((c) => c.status === 'complete' || c.status === 'needs_input')
  if (completed.length === 0) return null

  const related = completed.filter(
    (c) => c.definition?.relatedQuestions?.includes(question),
  )
  const toUse = related.length > 0 ? related : completed
  const context = buildCheckContext(toUse)
  if (!context.trim()) return null

  const baseSystem = `You are a property due diligence assistant. You answer buyer questions based ONLY on the check results provided. Be concise and accurate. Do not make up information. If the data doesn't clearly support an answer, say so briefly.`
  const yesNoInstructions = `This is a yes/no question. Your answer MUST start with "Yes." or "No." or "Unclear." on its own line, followed by 1-3 short sentences explaining why. Do not repeat the question.`
  const openEndedInstructions = `Consider what would matter to this buyer type (${buyerType}). Focus on changes or concerns most relevant to them. Keep your answer to 2-4 sentences. Be specific rather than generic.`
  const systemPrompt = isYesNoQuestion(question)
    ? `${baseSystem}\n\n${yesNoInstructions}`
    : `${baseSystem}\n\n${openEndedInstructions}`

  const userMessage = `Question: "${question}"\n\nCheck results:\n${context}\n\nAnswer:`
  try {
    const answer = await llm.chat(systemPrompt, userMessage)
    const trimmed = answer?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : null
  } catch {
    return null
  }
}

/** Run LLM synthesis for all report sections and persist. Called after a check completes. */
export async function synthesizeReportAnswersForProperty(
  propertyId: string,
  llm: LLMProvider,
): Promise<void> {
  const property = await findPropertyById(propertyId)
  if (!property) return

  const dbResults = await findChecksByPropertyId(propertyId)
  const dbMap = new Map(dbResults.map((r) => [r.checkId, r]))
  const allModules = registry.getAllChecks()
  const propertyRecord = {
    id: property.id,
    listingUrl: property.listingUrl,
    address: property.address,
    municipality: property.municipality,
    province: property.province,
    propertyType: property.propertyType,
    yearBuilt: property.yearBuilt,
    lotSize: property.lotSize,
    price: property.price,
    pid: property.pid,
    waterSource: property.waterSource,
    sewerType: property.sewerType,
    isStrata: property.isStrata,
    buyerType: property.buyerType,
    buyerGoal: property.buyerGoal,
    isFirstTimeBuyer: property.isFirstTimeBuyer,
    listingData: property.listingData,
    zoningData: property.zoningData,
    ocpData: property.ocpData,
  }
  const activeModules = registry.getActiveChecks(propertyRecord)
  const activeIds = new Set(activeModules.map((m) => m.definition.id))

  const allChecks: CheckResult[] = []
  for (const mod of allModules) {
    const def = definitionToSchema(mod.definition)
    const dbRow = dbMap.get(mod.definition.id)
    if (dbRow) {
      allChecks.push(dbRowToCheckResult(dbRow, def))
    } else if (activeIds.has(mod.definition.id)) {
      allChecks.push(notStartedPlaceholder(mod.definition.id, def, propertyId))
    }
  }

  const buyerType = property.buyerType ?? 'first_time'

  for (const q of BUYER_QUESTIONS) {
    const categorySet = new Set(q.categories as CheckCategory[])
    const sectionChecks = allChecks.filter((c) =>
      c.definition && categorySet.has(c.definition.category as CheckCategory),
    )
    const answer =
      (await synthesizeAnswerWithLLM(llm, q.question, buyerType, sectionChecks)) ??
      synthesizeAnswerFallback(sectionChecks, q.question)
    if (answer) {
      await upsertReportSectionAnswer(propertyId, q.id, answer)
    }
  }
}

function aggregateSources(checks: CheckResult[]): Source[] {
  const seen = new Set<string>()
  const sources: Source[] = []
  for (const c of checks) {
    if (!c.sources) continue
    for (const s of c.sources) {
      const key = `${s.name}|${s.url ?? ''}`
      if (!seen.has(key)) {
        seen.add(key)
        sources.push(s)
      }
    }
  }
  return sources
}

function buildForYouInsights(
  allChecks: CheckResult[],
  buyerType: string,
): ForYouInsight[] {
  const insights: ForYouInsight[] = []
  const completed = allChecks.filter((c) => c.status === 'complete' || c.status === 'needs_input')

  for (const check of completed) {
    if (check.insight && check.insight.buyerType === buyerType) {
      insights.push({
        headline: check.insight.headline,
        body: check.insight.body,
        sources: check.sources ?? [],
        relatedCheckIds: [check.checkId],
      })
    }
  }

  if (insights.length < 4) {
    const synth = synthesizeFromChecks(completed)
    for (const s of synth) {
      if (insights.length >= 6) break
      insights.push(s)
    }
  }

  return insights.slice(0, 6)
}

function synthesizeFromChecks(checks: CheckResult[]): ForYouInsight[] {
  const result: ForYouInsight[] = []
  const keyChecks = ['zoning-designation', 'ocp-status', 'ptt-calculation', 'title-search', 'property-history', 'natural-hazards']
  for (const checkId of keyChecks) {
    const c = checks.find((x) => x.checkId === checkId)
    if (!c || result.some((r) => r.relatedCheckIds.includes(checkId))) continue
    const headline = getHeadlineForCheck(c)
    const body = c.summary ?? c.definition?.description ?? ''
    if (headline && body) {
      result.push({
        headline,
        body,
        sources: c.sources ?? [],
        relatedCheckIds: [checkId],
      })
    }
  }
  return result
}

function getHeadlineForCheck(c: CheckResult): string | null {
  switch (c.checkId) {
    case 'zoning-designation':
      return 'Zoning and permitted uses'
    case 'ocp-status':
      return 'Official Community Plan status'
    case 'ptt-calculation':
      return 'Property Transfer Tax estimate'
    case 'title-search':
      return 'Title search'
    case 'property-history':
      return 'Property history inquiry'
    case 'natural-hazards':
      return 'Natural hazard assessment'
    default:
      return c.definition?.name ?? null
  }
}

export async function generateReport(propertyId: string): Promise<ReportSummary | null> {
  const property = await findPropertyById(propertyId)
  if (!property) return null

  const dbResults = await findChecksByPropertyId(propertyId)
  const dbMap = new Map(dbResults.map((r) => [r.checkId, r]))

  const allModules = registry.getAllChecks()
  const propertyRecord = {
    id: property.id,
    listingUrl: property.listingUrl,
    address: property.address,
    municipality: property.municipality,
    province: property.province,
    propertyType: property.propertyType,
    yearBuilt: property.yearBuilt,
    lotSize: property.lotSize,
    price: property.price,
    pid: property.pid,
    waterSource: property.waterSource,
    sewerType: property.sewerType,
    isStrata: property.isStrata,
    buyerType: property.buyerType,
    buyerGoal: property.buyerGoal,
    isFirstTimeBuyer: property.isFirstTimeBuyer,
    listingData: property.listingData,
    zoningData: property.zoningData,
    ocpData: property.ocpData,
  }

  const activeModules = registry.getActiveChecks(propertyRecord)
  const activeIds = new Set(activeModules.map((m) => m.definition.id))

  const allChecks: CheckResult[] = []
  for (const mod of allModules) {
    const def = definitionToSchema(mod.definition)
    const dbRow = dbMap.get(mod.definition.id)
    if (dbRow) {
      allChecks.push(dbRowToCheckResult(dbRow, def))
    } else if (activeIds.has(mod.definition.id)) {
      allChecks.push(
        notStartedPlaceholder(mod.definition.id, def, propertyId),
      )
    }
  }

  const completedCount = allChecks.filter(
    (c) => c.status === 'complete' || c.status === 'needs_input' || c.status === 'awaiting_response',
  ).length
  const completionPercent =
    allChecks.length > 0 ? Math.round((completedCount / allChecks.length) * 100) : 0

  const storedAnswers = await findReportSectionAnswersByPropertyId(propertyId).then((rows) =>
    new Map(rows.map((r) => [r.questionId, r.aiAnswer])),
  )

  const sections: ReportSection[] = BUYER_QUESTIONS.map((q) => {
    const categorySet = new Set(q.categories as CheckCategory[])
    const sectionChecks = allChecks.filter((c) =>
      c.definition && categorySet.has(c.definition.category as CheckCategory),
    )
    const aiAnswer =
      storedAnswers.get(q.id) ?? synthesizeAnswerFallback(sectionChecks, q.question)
    return {
      questionId: q.id,
      question: q.question,
      status: sectionStatus(sectionChecks),
      aiAnswer,
      sources: aggregateSources(sectionChecks),
      checks: sectionChecks,
    }
  })

  const forYou = buildForYouInsights(allChecks, property.buyerType)

  return {
    propertyId,
    buyerType: property.buyerType as ReportSummary['buyerType'],
    completionPercent,
    totalChecks: allChecks.length,
    completedChecks: completedCount,
    forYou,
    sections,
    generatedAt: new Date().toISOString(),
  }
}

export type PTTResult =
  | { status: 'complete'; breakdown: Record<string, unknown>; summary: string; sources: Source[] }
  | { status: 'needs_input'; message: string; guidance?: { steps: string[] } }

export async function getPTT(propertyId: string): Promise<PTTResult | null> {
  const property = await findPropertyById(propertyId)
  if (!property) return null

  const pttRow = await findChecksByPropertyId(propertyId).then((rows) =>
    rows.find((r) => r.checkId === 'ptt-calculation'),
  )

  if (pttRow && pttRow.status === 'complete' && pttRow.details) {
    return {
      status: 'complete',
      breakdown: pttRow.details as Record<string, unknown>,
      summary: pttRow.summary ?? 'PTT calculated',
      sources: (pttRow.sources as Source[]) ?? [],
    }
  }

  const price = property.price
  const isFirstTimeBuyer = property.isFirstTimeBuyer === true
  if (price == null || price <= 0) {
    return {
      status: 'needs_input',
      message: 'Property price is required. Run the listing-intake check first.',
      guidance: {
        steps: [
          'Obtain the purchase price from the listing or your offer.',
          'Run the listing-intake check to extract property details.',
        ],
      },
    }
  }

  const { execute } = await import('../checks/ptt-calculation/skill')
  const propertyRecord = {
    id: property.id,
    listingUrl: property.listingUrl,
    address: property.address,
    municipality: property.municipality,
    province: property.province,
    propertyType: property.propertyType,
    yearBuilt: property.yearBuilt,
    lotSize: property.lotSize,
    price: property.price,
    pid: property.pid,
    waterSource: property.waterSource,
    sewerType: property.sewerType,
    isStrata: property.isStrata,
    buyerType: property.buyerType,
    buyerGoal: property.buyerGoal,
    isFirstTimeBuyer: property.isFirstTimeBuyer,
    listingData: property.listingData,
    zoningData: property.zoningData,
    ocpData: property.ocpData,
  }
  const result = await execute({
    property: propertyRecord,
    existingResults: new Map(),
    llm: {} as never,
  })

  if (result.status === 'complete') {
    return {
      status: 'complete',
      breakdown: result.details,
      summary: result.summary,
      sources: result.sources,
    }
  }

  return {
    status: 'needs_input',
    message: result.summary,
    guidance: result.guidance ? { steps: result.guidance.steps } : undefined,
  }
}
