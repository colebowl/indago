import type { CheckDefinition } from '../types'

export const definition: CheckDefinition = {
  id: 'ptt-calculation',
  category: 'financial',
  name: 'BC Property Transfer Tax',
  description: 'Calculates BC Property Transfer Tax with applicable exemptions',
  whyItMatters:
    'Property Transfer Tax can add thousands to your purchase. First-time buyers and newly built homes may qualify for exemptions that significantly reduce or eliminate the tax.',
  dataMode: 'programmatic',
  dataSource: 'BC Property Transfer Tax Act',
  sourceUrl: 'https://www2.gov.bc.ca/gov/content/taxes/property-taxes/property-transfer-tax',
  tier: 1,
  activationRules: [],
  relatedQuestions: ['Am I going to get hit with surprise costs?'],
  dependsOn: ['listing-intake'],
  estimatedCost: '$0 — calculated from public rules',
}
