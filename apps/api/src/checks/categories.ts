import type { CheckCategory } from './types'

export const CHECK_CATEGORIES = {
  'ownership-title': {
    id: 'ownership-title' as CheckCategory,
    label: 'Ownership & Title',
    description: 'Who owns what — charges, liens, easements, and encumbrances on the title',
  },
  'physical-structure': {
    id: 'physical-structure' as CheckCategory,
    label: 'Physical Structure',
    description: 'Age, condition, systems, and structural integrity of the building',
  },
  'land-natural-hazards': {
    id: 'land-natural-hazards' as CheckCategory,
    label: 'Land & Natural Hazards',
    description: 'Flood zones, wildfire risk, slope stability, and geotechnical concerns',
  },
  'environmental-legacy': {
    id: 'environmental-legacy' as CheckCategory,
    label: 'Environmental Legacy',
    description: 'Contamination history, underground storage tanks, and site remediation',
  },
  'land-use-zoning': {
    id: 'land-use-zoning' as CheckCategory,
    label: 'Land Use & Zoning',
    description: 'Zoning designation, permitted uses, ADU eligibility, OCP direction',
  },
  'financial': {
    id: 'financial' as CheckCategory,
    label: 'Financial',
    description: 'Transfer taxes, exemptions, strata fees, and cost surprises',
  },
  'neighbourhood-context': {
    id: 'neighbourhood-context' as CheckCategory,
    label: 'Neighbourhood Context',
    description: 'Schools, transit, crime, noise, and nearby development plans',
  },
  'regulatory-compliance': {
    id: 'regulatory-compliance' as CheckCategory,
    label: 'Regulatory Compliance',
    description: 'Permits, bylaws, rental restrictions, and short-term rental rules',
  },
  'transaction-risk': {
    id: 'transaction-risk' as CheckCategory,
    label: 'Transaction Risk',
    description: 'Contract terms, disclosure gaps, and deal-specific red flags',
  },
} as const

export type CategoryInfo = (typeof CHECK_CATEGORIES)[keyof typeof CHECK_CATEGORIES]

export const BUYER_QUESTIONS = [
  {
    id: 'safety',
    question: 'Is this property safe?',
    categories: ['physical-structure', 'land-natural-hazards'] as CheckCategory[],
  },
  {
    id: 'ownership',
    question: 'Do I actually own what I think I\'m buying?',
    categories: ['ownership-title', 'transaction-risk'] as CheckCategory[],
  },
  {
    id: 'allowed',
    question: 'What am I allowed to do with this property?',
    categories: ['land-use-zoning', 'regulatory-compliance'] as CheckCategory[],
  },
  {
    id: 'rental',
    question: 'Can I rent this out or Airbnb it?',
    categories: ['land-use-zoning', 'regulatory-compliance'] as CheckCategory[],
  },
  {
    id: 'costs',
    question: 'Am I going to get hit with surprise costs?',
    categories: ['financial', 'physical-structure'] as CheckCategory[],
  },
  {
    id: 'history',
    question: 'What happened on this land before?',
    categories: ['environmental-legacy'] as CheckCategory[],
  },
  {
    id: 'neighbourhood',
    question: 'What\'s the neighbourhood really like?',
    categories: ['neighbourhood-context'] as CheckCategory[],
  },
  {
    id: 'future',
    question: 'What could change in the future?',
    categories: ['land-use-zoning', 'neighbourhood-context'] as CheckCategory[],
  },
  {
    id: 'damage',
    question: 'Is there any existing damage or issues?',
    categories: ['physical-structure'] as CheckCategory[],
  },
  {
    id: 'legal',
    question: 'Are there any legal complications?',
    categories: ['ownership-title', 'transaction-risk', 'regulatory-compliance'] as CheckCategory[],
  },
] as const

export type BuyerQuestion = (typeof BUYER_QUESTIONS)[number]
