import type { CheckModule } from '../types'
import { TIER3_DEFINITIONS, STUB_PERSONA, STUB_SKILL } from './definitions'
import { registry } from '../registry'

function definitionToModule(def: (typeof TIER3_DEFINITIONS)[number]): CheckModule {
  return {
    definition: def,
    persona: STUB_PERSONA,
    skill: STUB_SKILL,
  }
}

export function registerTier3Checks(): void {
  for (const def of TIER3_DEFINITIONS) {
    registry.register(definitionToModule(def))
  }
}

export { TIER3_DEFINITIONS }
