import type { CheckDefinition } from '../types'

export const definition: CheckDefinition = {
  id: 'ocp-status',
  category: 'land-use-zoning',
  name: 'Official Community Plan Status',
  description: 'Research OCP adoption, review status, and planning goals for the area',
  whyItMatters:
    'The Official Community Plan shapes future development — rezoning potential, infrastructure plans, and municipal priorities for the neighbourhood.',
  dataMode: 'programmatic',
  dataSource: 'Municipal OCP documents and planning portals',
  tier: 1,
  activationRules: [],
  dependsOn: ['listing-intake'],
  relatedQuestions: [
    'What am I allowed to do with this property?',
    'What could change in the future?',
  ],
  estimatedCost: '$0 — AI web search',
}
