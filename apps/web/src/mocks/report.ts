import type { ReportSummary, CheckResult } from '@indago/types'
import { MOCK_CHECK_RESULTS, MOCK_TIER3_DEFINITIONS } from './checks'

const PROPERTY_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const tier3AsResults: CheckResult[] = MOCK_TIER3_DEFINITIONS.map((def, i) => ({
  id: `c003-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
  propertyId: PROPERTY_ID,
  checkId: def.id,
  status: 'not_started' as const,
  riskLevel: null,
  summary: null,
  details: null,
  sources: null,
  guidance: null,
  insight: null,
  tier: 3,
  definition: def,
  completedAt: null,
  createdAt: '2026-03-01T10:30:00Z',
  updatedAt: '2026-03-01T10:30:00Z',
}))

const allChecks = [...MOCK_CHECK_RESULTS, ...tier3AsResults]
const completedChecks = allChecks.filter(c => c.status === 'complete')

export const MOCK_REPORT: ReportSummary = {
  propertyId: PROPERTY_ID,
  buyerType: 'first_time',
  completionPercent: Math.round((completedChecks.length / allChecks.length) * 100),
  totalChecks: allChecks.length,
  completedChecks: completedChecks.length,
  forYou: [
    {
      headline: 'You can build a laneway house on this lot',
      body: 'The RS-1 zoning and 33ft lot width mean you\'re eligible for a laneway house, which could generate $2,000-2,500/mo in rental income or provide multi-generational living.',
      sources: [
        { name: 'RS-1 District Schedule', url: 'https://bylaws.vancouver.ca/zoning/zoning-by-law-district-schedule-rs-1.pdf', type: 'rule' },
      ],
      relatedCheckIds: ['zoning-designation'],
    },
    {
      headline: 'The city plans to allow up to 6 units here',
      body: 'Vancouver Plan (2022) designates this neighbourhood for multiplex development. While rezoning hasn\'t happened yet, this could significantly increase your property\'s development potential and value over time.',
      sources: [
        { name: 'Vancouver Plan', url: 'https://vancouverplan.ca', type: 'data' },
      ],
      relatedCheckIds: ['ocp-status'],
    },
    {
      headline: 'Budget ~$35K for Property Transfer Tax',
      body: 'At $1.85M, you won\'t qualify for the first-time buyer PTT exemption (caps at $525K). Plan for $34,980 in PTT due on closing day.',
      sources: [
        { name: 'BC Property Transfer Tax Act', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96378_01', type: 'rule' },
      ],
      relatedCheckIds: ['ptt-calculation'],
    },
    {
      headline: 'Get the title search done soon',
      body: 'The LTSA title search will reveal any charges, liens, or easements on the property. It costs ~$15 and takes minutes to do online — don\'t skip this step.',
      sources: [],
      relatedCheckIds: ['title-search'],
    },
  ],
  sections: [
    {
      questionId: 'allowed',
      question: 'What am I allowed to do with this property?',
      status: 'complete',
      aiAnswer: 'This RS-1 zoned property allows a single-family dwelling with secondary suite and laneway house. Short-term rentals are not permitted. The Vancouver Plan envisions multiplex zoning for this area in the future.',
      sources: [
        { name: 'City of Vancouver Zoning By-law', url: 'https://vancouver.ca/your-government/zoning-development-by-law.aspx', type: 'data' },
      ],
      checks: allChecks.filter(c => ['zoning-designation', 'ocp-status', 'heritage-designation'].includes(c.checkId)),
    },
    {
      questionId: 'ownership',
      question: 'Do I actually own what I think I\'m buying?',
      status: 'needs_input',
      aiAnswer: 'Title search is needed to confirm ownership, charges, liens, and easements. Follow the LTSA instructions to retrieve the title document.',
      sources: [],
      checks: allChecks.filter(c => ['title-search'].includes(c.checkId)),
    },
    {
      questionId: 'costs',
      question: 'Am I going to get hit with surprise costs?',
      status: 'complete',
      aiAnswer: 'Property Transfer Tax will be $34,980 at this price point. No first-time buyer exemption applies. Insurance and maintenance costs for a 1952 home should be budgeted carefully.',
      sources: [
        { name: 'BC PTT Act', type: 'rule' },
      ],
      checks: allChecks.filter(c => ['ptt-calculation', 'insurance-assessment', 'strata-review'].includes(c.checkId)),
    },
    {
      questionId: 'history',
      question: 'What happened on this land before?',
      status: 'needs_input',
      aiAnswer: 'No contamination records found in the BC Site Registry — a positive sign. Municipal inquiry recommended to confirm full land use history.',
      sources: [
        { name: 'BC Site Registry', url: 'https://apps.nrs.gov.bc.ca/pub/srs/', type: 'data' },
      ],
      checks: allChecks.filter(c => ['property-history'].includes(c.checkId)),
    },
    {
      questionId: 'safety',
      question: 'Is this property safe?',
      status: 'complete',
      aiAnswer: 'Moderate earthquake risk typical for Greater Vancouver (Zone 4). Low flood, wildfire, and radon risk. Consider earthquake insurance and a structural inspection for this 1952 home.',
      sources: [
        { name: 'NRCan Seismic Hazard', type: 'data', note: 'Simulated' },
      ],
      checks: allChecks.filter(c => ['natural-hazards', 'flood-zone', 'soil-stability', 'water-quality'].includes(c.checkId)),
    },
    {
      questionId: 'rental',
      question: 'Can I rent this out or Airbnb it?',
      status: 'complete',
      aiAnswer: 'You can rent a secondary suite or laneway house long-term. Short-term rentals (Airbnb) are not permitted under current RS-1 zoning bylaws.',
      sources: [
        { name: 'City of Vancouver STR Regulations', type: 'rule' },
      ],
      checks: allChecks.filter(c => ['zoning-designation'].includes(c.checkId)),
    },
    {
      questionId: 'neighbourhood',
      question: 'What\'s the neighbourhood really like?',
      status: 'not_started',
      aiAnswer: null,
      sources: [],
      checks: allChecks.filter(c => ['neighbourhood-safety', 'schools-proximity', 'development-applications'].includes(c.checkId)),
    },
    {
      questionId: 'future',
      question: 'What could change in the future?',
      status: 'complete',
      aiAnswer: 'Vancouver Plan signals significant density increases in this neighbourhood. Nearby development applications should be monitored. Current RS-1 zoning may transition to multiplex zoning.',
      sources: [
        { name: 'Vancouver Plan', url: 'https://vancouverplan.ca', type: 'data' },
      ],
      checks: allChecks.filter(c => ['ocp-status', 'development-applications'].includes(c.checkId)),
    },
    {
      questionId: 'damage',
      question: 'Is there any existing damage or issues?',
      status: 'not_started',
      aiAnswer: null,
      sources: [],
      checks: allChecks.filter(c => ['building-permits', 'soil-stability'].includes(c.checkId)),
    },
    {
      questionId: 'legal',
      question: 'Are there any legal complications?',
      status: 'needs_input',
      aiAnswer: 'Title search needed to identify any legal encumbrances. No contamination liens found in BC Site Registry.',
      sources: [],
      checks: allChecks.filter(c => ['title-search', 'strata-review'].includes(c.checkId)),
    },
  ],
  generatedAt: '2026-03-01T11:00:00Z',
}
