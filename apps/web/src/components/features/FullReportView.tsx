import { useState, useEffect } from 'react'
import type { CategoryGroup } from '@/lib/categories'
import { getCategoryOverallStatus, getCategoryRiskScore } from '@/lib/categories'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CheckStatusBadge } from './CheckStatusBadge'
import { RiskScoreBadge } from './RiskLevelBadge'
import { CheckItem } from './CheckItem'
import { useUIStore } from '@/stores/ui.store'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

function FullCategorySection({ group }: { group: CategoryGroup }) {
  const [open, setOpen] = useState(false)
  const Icon = group.icon
  const status = getCategoryOverallStatus(group.checks)
  const completedCount = group.checks.filter(c => c.status === 'complete').length
  const riskScore = getCategoryRiskScore(group.checks)

  const scrollTarget = useUIStore(s => s.scrollTarget)

  useEffect(() => {
    if (!scrollTarget) return
    const hasTarget = group.checks.some(c => c.checkId === scrollTarget)
    if (hasTarget && !open) {
      setOpen(true)
    }
  }, [scrollTarget, group.checks, open])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card id={`category-${group.category}`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/30 transition-colors p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{group.label}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">
                      {completedCount}/{group.checks.length} checks
                    </p>
                    {riskScore && (
                      <RiskScoreBadge score={riskScore.score} level={riskScore.level} />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CheckStatusBadge status={status} />
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    open && 'rotate-180',
                  )}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="space-y-2">
              {group.checks.map((check) => (
                <CheckItem key={check.checkId} check={check} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function FullReportView({ groups }: { groups: CategoryGroup[] }) {
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <FullCategorySection key={group.category} group={group} />
      ))}
    </div>
  )
}
