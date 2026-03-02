import type { CheckDefinition } from '../types'

export const definition: CheckDefinition = {
  id: 'listing-intake',
  category: 'physical-structure',
  name: 'Listing Data Extraction',
  description: 'Extracts property details from the listing URL using AI web search',
  whyItMatters:
    'Accurate property attributes (address, price, type, year built, etc.) power all other checks. This check must run first to populate the property record.',
  dataMode: 'programmatic',
  dataSource: 'Listing website (e.g. realtor.ca)',
  sourceUrl: 'https://www.realtor.ca',
  tier: 1,
  activationRules: [],
  relatedQuestions: ['Am I going to get hit with surprise costs?'],
  estimatedCost: '$0 — AI web search',
}
