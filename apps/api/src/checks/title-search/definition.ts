import type { CheckDefinition } from '../types'

export const definition: CheckDefinition = {
  id: 'title-search',
  category: 'ownership-title',
  name: 'LTSA Title Search',
  description: 'Guides manual title search or parses uploaded title documents',
  whyItMatters:
    'The title search reveals charges, liens, easements, and encumbrances that could affect ownership. What you see is not always what you get.',
  dataMode: 'manual',
  dataSource: 'Land Title and Survey Authority (myLTSA.ca)',
  sourceUrl: 'https://www.myltsa.ca',
  tier: 1,
  activationRules: [],
  relatedQuestions: ['Do I actually own what I think I\'m buying?'],
  estimatedCost: '~$15 per title search',
}
