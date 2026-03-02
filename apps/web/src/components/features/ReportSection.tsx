import { useState } from 'react'
import type { ReportSection as ReportSectionType } from '@indago/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CheckStatusBadge } from './CheckStatusBadge'
import { CheckItem } from './CheckItem'
import { SourceList } from './SourceCitation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export function ReportSection({ section }: { section: ReportSectionType }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/30 transition-colors p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{section.question}</h3>
                {section.aiAnswer && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {section.aiAnswer}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CheckStatusBadge
                  status={section.status}
                  showSpinner={section.status === 'in_progress' && section.checks.some(c => c.status === 'in_progress')}
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
            {section.sources.length > 0 && (
              <SourceList sources={section.sources} />
            )}

            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Individual Checks ({section.checks.length})
              </p>
              <div className="divide-y">
                {section.checks.map((check) => (
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
