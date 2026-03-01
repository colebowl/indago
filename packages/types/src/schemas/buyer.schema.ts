import { z } from 'zod'
import { BuyerType } from './property.schema'
import type { CheckCategory } from './check.schema'

export const BuyerTypeConfig = z.object({
  type: BuyerType,
  label: z.string(),
  description: z.string(),
  icon: z.string(),
  priorityCategories: z.array(z.string()),
})
export type BuyerTypeConfig = z.infer<typeof BuyerTypeConfig>

export const BUYER_TYPE_CONFIGS: readonly BuyerTypeConfig[] = [
  {
    type: 'first_time',
    label: 'First-Time Buyer',
    description: 'Living in it — safety, costs, neighbourhood',
    icon: 'Home',
    priorityCategories: ['financial', 'physical-structure', 'neighbourhood-context'],
  },
  {
    type: 'investor',
    label: 'Investor / Rental',
    description: 'Rental restrictions, bylaws, vacancy tax',
    icon: 'TrendingUp',
    priorityCategories: ['land-use-zoning', 'financial', 'regulatory-compliance'],
  },
  {
    type: 'airbnb',
    label: 'Airbnb / Short-Term',
    description: 'STR bylaws, strata, licensing',
    icon: 'CalendarDays',
    priorityCategories: ['land-use-zoning', 'regulatory-compliance', 'financial'],
  },
  {
    type: 'renovation',
    label: 'Renovation / Flip',
    description: 'Zoning, permits, heritage, structure',
    icon: 'Hammer',
    priorityCategories: ['land-use-zoning', 'physical-structure', 'environmental-legacy'],
  },
  {
    type: 'family',
    label: 'Family Relocation',
    description: 'Schools, safety, parks, commute',
    icon: 'Users',
    priorityCategories: ['neighbourhood-context', 'physical-structure', 'land-natural-hazards'],
  },
  {
    type: 'downsizer',
    label: 'Downsizer',
    description: 'Strata fees, accessibility, walkability',
    icon: 'ArrowDownToLine',
    priorityCategories: ['financial', 'neighbourhood-context', 'physical-structure'],
  },
] as const

export const BUYER_QUESTIONS = [
  { id: 'safety', question: 'Is this property safe?', categories: ['physical-structure', 'land-natural-hazards'] as CheckCategory[] },
  { id: 'ownership', question: 'Do I actually own what I think I\'m buying?', categories: ['ownership-title', 'transaction-risk'] as CheckCategory[] },
  { id: 'allowed', question: 'What am I allowed to do with this property?', categories: ['land-use-zoning', 'regulatory-compliance'] as CheckCategory[] },
  { id: 'rental', question: 'Can I rent this out or Airbnb it?', categories: ['land-use-zoning', 'regulatory-compliance'] as CheckCategory[] },
  { id: 'costs', question: 'Am I going to get hit with surprise costs?', categories: ['financial', 'physical-structure'] as CheckCategory[] },
  { id: 'history', question: 'What happened on this land before?', categories: ['environmental-legacy'] as CheckCategory[] },
  { id: 'neighbourhood', question: 'What\'s the neighbourhood really like?', categories: ['neighbourhood-context'] as CheckCategory[] },
  { id: 'future', question: 'What could change in the future?', categories: ['land-use-zoning', 'neighbourhood-context'] as CheckCategory[] },
  { id: 'damage', question: 'Is there any existing damage or issues?', categories: ['physical-structure'] as CheckCategory[] },
  { id: 'legal', question: 'Are there any legal complications?', categories: ['ownership-title', 'transaction-risk', 'regulatory-compliance'] as CheckCategory[] },
] as const
