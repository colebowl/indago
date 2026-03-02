import type { CheckModule, ActivationRule, PropertyRecord } from './types'

export class CheckRegistry {
  private checks = new Map<string, CheckModule>()

  register(module: CheckModule): void {
    if (this.checks.has(module.definition.id)) {
      throw new Error(`Check "${module.definition.id}" is already registered`)
    }
    this.checks.set(module.definition.id, module)
  }

  getCheck(id: string): CheckModule | undefined {
    return this.checks.get(id)
  }

  getAllChecks(): CheckModule[] {
    return Array.from(this.checks.values())
  }

  getActiveChecks(property: PropertyRecord): CheckModule[] {
    return this.getAllChecks().filter((module) =>
      this.isActive(module, property),
    )
  }

  private isActive(module: CheckModule, property: PropertyRecord): boolean {
    const { activationRules } = module.definition
    if (activationRules.length === 0) return true
    return activationRules.every((rule) => this.evaluateRule(rule, property))
  }

  private evaluateRule(rule: ActivationRule, property: PropertyRecord): boolean {
    const value = (property as unknown as Record<string, unknown>)[rule.field]

    switch (rule.operator) {
      case 'equals':
        return value === rule.value
      case 'not_equals':
        return value !== rule.value
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(value)
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(value)
      case 'less_than':
        return typeof value === 'number' && typeof rule.value === 'number' && value < rule.value
      case 'greater_than':
        return typeof value === 'number' && typeof rule.value === 'number' && value > rule.value
      default:
        return false
    }
  }
}

export const registry = new CheckRegistry()
