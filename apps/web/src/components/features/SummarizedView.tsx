import { useState, useEffect } from 'react'
import type { CategoryGroup } from '@/lib/categories'
import { getCategoryOverallStatus, getCategoryRiskScore } from '@/lib/categories'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CheckStatusBadge } from './CheckStatusBadge'
import { RiskScoreBadge } from './RiskLevelBadge'
import { CheckItem } from './CheckItem'
import { useUIStore } from '@/stores/ui.store'
import { ChevronDown, MessageCircleQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'

function CategorySection({ group }: { group: CategoryGroup }) {
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
                      {completedCount} of {group.checks.length} checks complete
                    </p>
                    {riskScore && riskScore.level !== 'none' && (
                      <RiskScoreBadge score={riskScore.score} level={riskScore.level} />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CheckStatusBadge
                  status={status}
                  showSpinner={status === 'in_progress' && group.checks.some(c => c.status === 'in_progress')}
                />
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
            {group.questions.some(q => q.answer) && (
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Key Questions
                </p>
                <div className="space-y-2.5">
                  {group.questions
                    .filter(q => q.answer)
                    .map((q, i) => (
                      <div key={i} className="pl-3 border-l-2 border-primary/30">
                        <p className="text-xs font-semibold flex items-center gap-1.5">
                          <MessageCircleQuestion className="h-3 w-3 text-primary shrink-0" />
                          {q.question}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-[18px]">{q.answer}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Checks ({group.checks.length})
              </p>
              <div className="space-y-2">
                {group.checks.map((check) => (
                  <CheckItem key={check.checkId} check={check} />
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function SummarizedView({ groups }: { groups: CategoryGroup[] }) {
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <CategorySection key={group.category} group={group} />
      ))}
    </div>
  )
}
