import type { CheckCategory, CheckResult, RiskLevel, ReportSection } from '@indago/types'
import {
  Shield,
  Home,
  Mountain,
  Leaf,
  MapPinned,
  DollarSign,
  Building2,
  Scale,
  FileWarning,
} from 'lucide-react'

export const CATEGORY_CONFIG: Record<CheckCategory, { label: string; icon: typeof Shield; accent: string }> = {
  'ownership-title': { label: 'Ownership & Title', icon: Shield, accent: 'border-blue-500' },
  'physical-structure': { label: 'Physical Structure', icon: Home, accent: 'border-slate-500' },
  'land-natural-hazards': { label: 'Land & Natural Hazards', icon: Mountain, accent: 'border-amber-500' },
  'environmental-legacy': { label: 'Environmental Legacy', icon: Leaf, accent: 'border-emerald-500' },
  'land-use-zoning': { label: 'Land Use & Zoning', icon: MapPinned, accent: 'border-teal-500' },
  'financial': { label: 'Financial', icon: DollarSign, accent: 'border-violet-500' },
  'neighbourhood-context': { label: 'Neighbourhood', icon: Building2, accent: 'border-rose-500' },
  'regulatory-compliance': { label: 'Regulatory & Compliance', icon: Scale, accent: 'border-indigo-500' },
  'transaction-risk': { label: 'Transaction Risk', icon: FileWarning, accent: 'border-orange-500' },
}

export function getCategoryForCheck(checkId: string, checks: CheckResult[]): CheckCategory | null {
  const check = checks.find(c => c.checkId === checkId)
  return check?.definition?.category ?? null
}

const CATEGORY_ORDER: CheckCategory[] = [
  'land-use-zoning',
  'ownership-title',
  'financial',
  'environmental-legacy',
  'land-natural-hazards',
  'physical-structure',
  'neighbourhood-context',
  'regulatory-compliance',
  'transaction-risk',
]

export interface CategoryGroup {
  category: CheckCategory
  label: string
  icon: typeof Shield
  checks: CheckResult[]
  questions: { question: string; answer: string | null }[]
}

export function groupChecksByCategory(
  checks: CheckResult[],
  sections: ReportSection[],
): CategoryGroup[] {
  const grouped = new Map<CheckCategory, CheckResult[]>()

  for (const check of checks) {
    const category = check.definition?.category
    if (!category) continue
    const existing = grouped.get(category) ?? []
    existing.push(check)
    grouped.set(category, existing)
  }

  const questionsByCategory = new Map<CheckCategory, { question: string; answer: string | null }[]>()
  for (const section of sections) {
    for (const check of section.checks) {
      const category = check.definition?.category
      if (!category) continue
      if (!questionsByCategory.has(category)) {
        questionsByCategory.set(category, [])
      }
      const existing = questionsByCategory.get(category)!
      const alreadyAdded = existing.some(q => q.question === section.question)
      if (!alreadyAdded) {
        existing.push({ question: section.question, answer: section.aiAnswer })
      }
    }
  }

  return CATEGORY_ORDER
    .filter(cat => grouped.has(cat))
    .map(cat => {
      const config = CATEGORY_CONFIG[cat]
      return {
        category: cat,
        label: config.label,
        icon: config.icon,
        checks: grouped.get(cat)!,
        questions: questionsByCategory.get(cat) ?? [],
      }
    })
}

const RISK_SCORES: Record<RiskLevel, number> = {
  none: 1,
  low: 2,
  medium: 3,
  high: 4,
  very_high: 5,
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  very_high: 'Very High',
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  none: 'text-green-600 bg-green-50 border-green-200',
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  very_high: 'text-red-600 bg-red-50 border-red-200',
}

export function getCategoryRiskScore(checks: CheckResult[]): { score: number; label: string; level: RiskLevel } | null {
  const assessed = checks.filter(c => c.riskLevel != null)
  if (assessed.length === 0) return null

  const total = assessed.reduce((sum, c) => sum + RISK_SCORES[c.riskLevel!], 0)
  const avg = total / assessed.length
  const rounded = Math.round(avg * 10) / 10

  let level: RiskLevel = 'none'
  if (avg >= 4.5) level = 'very_high'
  else if (avg >= 3.5) level = 'high'
  else if (avg >= 2.5) level = 'medium'
  else if (avg >= 1.5) level = 'low'

  return { score: rounded, label: RISK_LABELS[level], level }
}

export function getCategoryOverallStatus(checks: CheckResult[]): CheckResult['status'] {
  if (checks.some(c => c.status === 'error')) return 'error'
  if (checks.every(c => c.status === 'complete')) return 'complete'
  if (checks.every(c => c.status === 'not_started')) return 'not_started'
  if (checks.some(c => c.status === 'needs_input')) return 'needs_input'
  if (checks.some(c => c.status === 'in_progress')) return 'in_progress'
  if (checks.some(c => c.status === 'awaiting_response')) return 'awaiting_response'
  if (checks.some(c => c.status === 'complete')) return 'in_progress'
  return 'not_started'
}
