import type { CheckDefinition } from '../types'

export const definition: CheckDefinition = {
  id: 'zoning-designation',
  category: 'land-use-zoning',
  name: 'Zoning Designation',
  description: 'Identifies municipal zoning and permitted uses for the property',
  whyItMatters:
    'Zoning determines what you can legally do with the property — build, renovate, add a suite, or rent short-term. Different designations have different rules.',
  dataMode: 'programmatic',
  dataSource: 'Municipal zoning bylaws and maps',
  tier: 1,
  activationRules: [],
  dependsOn: ['listing-intake'],
  relatedQuestions: [
    'What am I allowed to do with this property?',
    'Can I rent this out or Airbnb it?',
  ],
  estimatedCost: '$0 — AI web search',
}
