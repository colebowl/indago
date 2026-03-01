import type { RiskLevel } from '@indago/types'
import { RISK_LABELS, RISK_COLORS } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'

const RISK_ICONS: Record<RiskLevel, typeof ShieldCheck> = {
  none: ShieldCheck,
  low: ShieldCheck,
  medium: ShieldAlert,
  high: ShieldAlert,
  very_high: ShieldAlert,
}

export function RiskLevelBadge({ level }: { level: RiskLevel }) {
  const Icon = RISK_ICONS[level]
  const colors = RISK_COLORS[level]

  return (
    <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded border', colors)}>
      <Icon className="h-3 w-3" />
      {RISK_LABELS[level]}
    </span>
  )
}

export function RiskScoreBadge({ score, level }: { score: number; level: RiskLevel }) {
  const colors = RISK_COLORS[level]

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full border', colors)}>
      <span className="tabular-nums">{score.toFixed(1)}</span>
      <span>/5</span>
    </span>
  )
}

export function RiskNotAssessed() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded border text-muted-foreground bg-muted/50 border-muted">
      <ShieldQuestion className="h-3 w-3" />
      Pending
    </span>
  )
}
