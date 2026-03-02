import type { CheckDefinition } from '../types'

export const definition: CheckDefinition = {
  id: 'natural-hazards',
  category: 'land-natural-hazards',
  name: 'Natural Hazards',
  description: 'Assess earthquake, flood, wildfire, radon, and landslide risks',
  whyItMatters:
    'Natural hazard exposure affects safety, insurance costs, and property value.',
  dataMode: 'programmatic',
  dataSource: 'NRCan, PreparedBC, Health Canada, BCCDC',
  tier: 2,
  activationRules: [],
  relatedQuestions: ['Is this property safe?'],
  estimatedCost: '$0 — simulated for demo',
  isSimulated: true,
}
