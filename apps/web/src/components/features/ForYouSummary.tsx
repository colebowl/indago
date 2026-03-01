import { useState } from 'react'
import type { ForYouInsight, CheckResult } from '@indago/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { SourceList } from './SourceCitation'
import { CATEGORY_CONFIG, getCategoryForCheck } from '@/lib/categories'
import { useUIStore } from '@/stores/ui.store'
import { Sparkles, ChevronDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function getCheckDisplayName(checkId: string): string {
  const names: Record<string, string> = {
    'listing-intake': 'Listing Extraction',
    'zoning-designation': 'Zoning Designation',
    'ocp-status': 'Official Community Plan',
    'ptt-calculation': 'Property Transfer Tax',
    'title-search': 'Title Search',
    'property-history': 'Property History',
    'natural-hazards': 'Natural Hazards',
  }
  return names[checkId] ?? checkId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

interface ForYouSummaryProps {
  insights: ForYouInsight[]
  allChecks: CheckResult[]
}

export function ForYouSummary({ insights, allChecks }: ForYouSummaryProps) {
  const [open, setOpen] = useState(true)
  const scrollToCheck = useUIStore(s => s.scrollToCheck)

  if (!insights.length) return null

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-primary/20 bg-gradient-to-br from-accent/40 to-background">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/20 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Key Insights
              </CardTitle>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  open && 'rotate-180',
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {insights.map((insight, i) => {
              const primaryCheckId = insight.relatedCheckIds?.[0]
              const category = primaryCheckId
                ? getCategoryForCheck(primaryCheckId, allChecks)
                : null
              const accent = category
                ? CATEGORY_CONFIG[category].accent
                : 'border-primary/40'
              const categoryLabel = category
                ? CATEGORY_CONFIG[category].label
                : null

              return (
                <div key={i} className={cn('pl-4 border-l-2', accent)}>
                  {categoryLabel && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                      {categoryLabel}
                    </p>
                  )}
                  <p className="font-medium text-sm">{insight.headline}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insight.body}</p>
                  <SourceList sources={insight.sources} />

                  {insight.relatedCheckIds && insight.relatedCheckIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {insight.relatedCheckIds.map((checkId) => (
                        <button
                          key={checkId}
                          onClick={(e) => {
                            e.stopPropagation()
                            scrollToCheck(checkId)
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                        >
                          <ArrowRight className="h-3 w-3" />
                          {getCheckDisplayName(checkId)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
