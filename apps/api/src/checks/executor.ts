import type {
  CheckModule,
  CheckContext,
  LLMProvider,
  PropertyRecord,
  SkillCheckResult,
} from './types'
import type { CheckRegistry } from './registry'
import { upsertCheckResult } from '../db/mutations/check.mutations'
import { findChecksByPropertyId } from '../db/queries/check.queries'

export class CheckExecutor {
  constructor(
    private llm: LLMProvider,
    private registry: CheckRegistry,
  ) {}

  async executeCheck(
    checkId: string,
    property: PropertyRecord,
  ): Promise<SkillCheckResult> {
    const module = this.registry.getCheck(checkId)
    if (!module) {
      throw new Error(`Check "${checkId}" not found in registry`)
    }

    await this.markInProgress(property.id, module)

    try {
      const result = await this.runByTier(module, property)
      await this.persistResult(property.id, module, result)
      return result
    } catch (err) {
      const errorResult = this.buildErrorResult(err)
      await this.persistResult(property.id, module, errorResult)
      throw err
    }
  }

  async executeAllChecks(property: PropertyRecord): Promise<SkillCheckResult[]> {
    const activeChecks = this.registry.getActiveChecks(property)
    const ordered = this.resolveExecutionOrder(activeChecks)
    const results: SkillCheckResult[] = []
    const resultMap = new Map<string, SkillCheckResult>()

    for (const group of ordered) {
      const groupResults = await Promise.all(
        group.map(async (module) => {
          try {
            await this.markInProgress(property.id, module)
            const result = await this.runByTier(module, property, resultMap)
            await this.persistResult(property.id, module, result)
            resultMap.set(module.definition.id, result)
            return result
          } catch (err) {
            const errorResult = this.buildErrorResult(err)
            await this.persistResult(property.id, module, errorResult)
            resultMap.set(module.definition.id, errorResult)
            return errorResult
          }
        }),
      )
      results.push(...groupResults)
    }

    return results
  }

  private async runByTier(
    module: CheckModule,
    property: PropertyRecord,
    existingResults?: Map<string, SkillCheckResult>,
  ): Promise<SkillCheckResult> {
    const { tier } = module.definition

    if (tier === 3) {
      return this.buildTier3Result(module)
    }

    const context = await this.buildContext(property, existingResults)
    return module.skill.execute(context)
  }

  private buildTier3Result(module: CheckModule): SkillCheckResult {
    return {
      status: 'complete',
      riskLevel: 'none',
      summary: module.definition.description,
      details: {
        tier: 3,
        name: module.definition.name,
        whyItMatters: module.definition.whyItMatters,
        dataSource: module.definition.dataSource,
        estimatedCost: module.definition.estimatedCost,
      },
      sources: [],
    }
  }

  private async buildContext(
    property: PropertyRecord,
    existingResults?: Map<string, SkillCheckResult>,
  ): Promise<CheckContext> {
    const results = existingResults ?? new Map<string, SkillCheckResult>()

    if (results.size === 0) {
      const dbResults = await findChecksByPropertyId(property.id)
      for (const row of dbResults) {
        if (row.status === 'complete' || row.status === 'needs_input' || row.status === 'awaiting_response') {
          results.set(row.checkId, {
            status: row.status as SkillCheckResult['status'],
            riskLevel: (row.riskLevel as SkillCheckResult['riskLevel']) ?? undefined,
            summary: row.summary ?? '',
            details: (row.details as Record<string, unknown>) ?? {},
            sources: (row.sources as SkillCheckResult['sources']) ?? [],
            guidance: (row.guidance as SkillCheckResult['guidance']) ?? undefined,
            insight: (row.insight as SkillCheckResult['insight']) ?? undefined,
          })
        }
      }
    }

    return {
      property,
      existingResults: results,
      llm: this.llm,
    }
  }

  private async markInProgress(
    propertyId: string,
    module: CheckModule,
  ): Promise<void> {
    await upsertCheckResult({
      propertyId,
      checkId: module.definition.id,
      status: 'in_progress',
      tier: module.definition.tier,
    })
  }

  private async persistResult(
    propertyId: string,
    module: CheckModule,
    result: SkillCheckResult,
  ): Promise<void> {
    await upsertCheckResult({
      propertyId,
      checkId: module.definition.id,
      status: result.status,
      riskLevel: result.riskLevel ?? null,
      summary: result.summary,
      details: result.details,
      sources: result.sources,
      guidance: result.guidance ?? null,
      insight: result.insight ?? null,
      tier: module.definition.tier,
      completedAt: result.status === 'complete' ? new Date() : null,
    })
  }

  private buildErrorResult(err: unknown): SkillCheckResult {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      status: 'error',
      summary: `Check failed: ${message}`,
      details: { error: message },
      sources: [],
    }
  }

  /**
   * Groups checks into execution waves, respecting `dependsOn` ordering.
   * Checks with no dependencies (or whose dependencies are already resolved)
   * run in the first wave; those depending on wave-1 checks run in wave 2, etc.
   */
  private resolveExecutionOrder(checks: CheckModule[]): CheckModule[][] {
    const checkIds = new Set(checks.map((c) => c.definition.id))
    const remaining = new Map(checks.map((c) => [c.definition.id, c]))
    const resolved = new Set<string>()
    const waves: CheckModule[][] = []

    while (remaining.size > 0) {
      const wave: CheckModule[] = []

      for (const [id, module] of remaining) {
        const deps = module.definition.dependsOn ?? []
        const unmetDeps = deps.filter((d) => checkIds.has(d) && !resolved.has(d))

        if (unmetDeps.length === 0) {
          wave.push(module)
        }
      }

      if (wave.length === 0) {
        // Circular dependency or unresolvable deps — run everything remaining
        waves.push(Array.from(remaining.values()))
        break
      }

      for (const module of wave) {
        remaining.delete(module.definition.id)
        resolved.add(module.definition.id)
      }

      waves.push(wave)
    }

    return waves
  }
}
