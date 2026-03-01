import { useState, useRef, useEffect } from 'react'
import type { CheckResult } from '@indago/types'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CheckStatusBadge } from './CheckStatusBadge'
import { RiskLevelBadge, RiskNotAssessed } from './RiskLevelBadge'
import { SourceList } from './SourceCitation'
import { TitleUpload } from './TitleUpload'
import { InquiryDrafter } from './InquiryDrafter'
import { PTTCalculator } from './PTTCalculator'
import { CheckRunning } from './CheckRunning'
import { useUIStore } from '@/stores/ui.store'
import { ChevronRight } from 'lucide-react'
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
    'building-permits': 'Building Permit History',
    'heritage-designation': 'Heritage Designation',
    'flood-zone': 'Flood Zone Mapping',
    'soil-stability': 'Soil & Geotechnical',
    'water-quality': 'Water Quality',
    'neighbourhood-safety': 'Neighbourhood Safety',
    'schools-proximity': 'Schools & Education',
    'strata-review': 'Strata Documentation',
    'insurance-assessment': 'Insurance Assessment',
    'development-applications': 'Nearby Development',
  }
  return names[checkId] ?? checkId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function hasExpandableContent(check: CheckResult): boolean {
  if (check.tier === 3) return false
  if (check.status === 'in_progress') return true
  if (check.summary) return true
  if (check.insight) return true
  if (check.sources && check.sources.length > 0) return true
  if (check.guidance) return true
  return false
}

export function CheckItem({ check }: { check: CheckResult }) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isTier3 = check.tier === 3
  const def = check.definition
  const expandable = hasExpandableContent(check)

  const scrollTarget = useUIStore(s => s.scrollTarget)
  const clearScrollTarget = useUIStore(s => s.clearScrollTarget)

  useEffect(() => {
    if (scrollTarget !== check.checkId) return

    if (expandable) setOpen(true)

    requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlight(true)
      setTimeout(() => setHighlight(false), 2000)
      clearScrollTarget()
    })
  }, [scrollTarget, check.checkId, expandable, clearScrollTarget])

  return (
    <div
      ref={ref}
      id={`check-${check.checkId}`}
      className={cn(
        'rounded-lg border bg-card transition-shadow duration-500',
        highlight && 'ring-2 ring-primary/50 shadow-md',
      )}
    >
      <Collapsible open={open} onOpenChange={expandable ? setOpen : undefined}>
        <CollapsibleTrigger asChild disabled={!expandable}>
          <button
            className={cn(
              'w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors rounded-lg',
              expandable && 'cursor-pointer hover:bg-accent/30',
              !expandable && 'cursor-default',
            )}
          >
            {expandable && (
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform',
                  open && 'rotate-90',
                )}
              />
            )}
            {!expandable && <div className="w-3.5 shrink-0" />}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{getCheckDisplayName(check.checkId)}</p>
              {isTier3 && def && (
                <p className="text-[11px] text-muted-foreground mt-0.5 italic">{def.whyItMatters}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {check.riskLevel != null ? (
                <RiskLevelBadge level={check.riskLevel} />
              ) : check.status !== 'not_started' && !isTier3 ? (
                <RiskNotAssessed />
              ) : null}
              <CheckStatusBadge status={check.status} />
            </div>
          </button>
        </CollapsibleTrigger>

        {expandable && (
          <CollapsibleContent>
            <div className="px-3 pb-3 pt-0 ml-[26px] space-y-2.5 border-t border-border/50">
              {check.status === 'in_progress' && (
                <CheckRunning checkId={check.checkId} startedAt={check.createdAt} />
              )}

              {check.summary && !isTier3 && check.status !== 'in_progress' && (
                <p className="text-xs text-muted-foreground pt-2.5">{check.summary}</p>
              )}

              {check.checkId === 'title-search' && check.status === 'needs_input' && check.guidance && (
                <TitleUpload guidance={check.guidance} propertyId={check.propertyId} />
              )}

              {check.checkId === 'property-history' && check.guidance?.emailDraft && (
                <InquiryDrafter
                  emailDraft={check.guidance.emailDraft}
                  trackingId={check.guidance.trackingId}
                  steps={check.guidance.steps}
                />
              )}

              {check.checkId === 'ptt-calculation' && check.status === 'complete' && check.details && (
                <PTTCalculator details={check.details} />
              )}

              {check.insight && (
                <div className="p-2.5 rounded-md bg-accent/60 border border-primary/10">
                  <p className="text-xs font-semibold text-primary">{check.insight.headline}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{check.insight.body}</p>
                  {check.insight.implications.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {check.insight.implications.map((imp, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">&bull;</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {check.sources && check.sources.length > 0 && <SourceList sources={check.sources} />}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  )
}
