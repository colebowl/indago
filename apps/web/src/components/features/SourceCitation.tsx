import { useState } from 'react'
import type { Source } from '@indago/types'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ExternalLink, Database, BookOpen, Brain, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_CONFIG = {
  data: { label: 'Data', icon: Database, color: 'text-blue-600' },
  rule: { label: 'Rule', icon: BookOpen, color: 'text-green-700' },
  ai_inference: { label: 'AI Interpretation', icon: Brain, color: 'text-purple-600' },
} as const

export function SourceCitation({ source }: { source: Source }) {
  const config = TYPE_CONFIG[source.type]
  const Icon = config.icon

  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground">
      <Icon className={`h-3 w-3 mt-0.5 shrink-0 ${config.color}`} />
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline inline-flex items-center gap-0.5"
          >
            {source.name}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        ) : (
          <span className="font-medium">{source.name}</span>
        )}
        <span className={`text-[10px] px-1 py-0.5 rounded ${config.color} bg-opacity-10`}>
          {config.label}
        </span>
        {source.note && (
          <span className="italic">— {source.note}</span>
        )}
      </div>
    </div>
  )
}

export function SourceList({ sources }: { sources: Source[] }) {
  if (!sources.length) return null
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3 pt-3 border-t">
      <CollapsibleTrigger className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full text-left">
        <ChevronRight className={cn('h-3 w-3 shrink-0 transition-transform', open && 'rotate-90')} />
        Sources ({sources.length})
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-1.5 pl-4">
          {sources.map((s, i) => (
            <SourceCitation key={i} source={s} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
