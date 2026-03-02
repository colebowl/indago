import type { CheckDefinition } from '../types'

export const definition: CheckDefinition = {
  id: 'property-history',
  category: 'environmental-legacy',
  name: 'Property History Inquiry',
  description: 'Drafts inquiry email for environmental/property history and tracks correspondence',
  whyItMatters:
    'Past uses — fuel storage, industrial activity, contamination — can affect the property. Municipalities and the BC Site Registry hold historical records.',
  dataMode: 'ask',
  dataSource: 'Municipal records, BC Site Registry',
  sourceUrl: 'https://www2.gov.bc.ca/gov/content/environment/air-land-water/site-remediation',
  tier: 1,
  activationRules: [],
  dependsOn: ['listing-intake'],
  relatedQuestions: ['What happened on this land before?'],
  estimatedCost: '$0 — inquiry drafted; response may take 1–4 weeks',
}
