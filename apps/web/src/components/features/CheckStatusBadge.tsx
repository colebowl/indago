import type { CheckStatus } from '@indago/types'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Circle, AlertCircle, Mail, SkipForward, Loader2 } from 'lucide-react'

const STATUS_CONFIG: Record<CheckStatus, { label: string; variant: 'complete' | 'progress' | 'not-started' | 'needs-input' | 'awaiting' | 'skipped' | 'destructive'; icon: typeof CheckCircle2 }> = {
  complete: { label: 'Complete', variant: 'complete', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', variant: 'progress', icon: Loader2 },
  not_started: { label: 'Not Started', variant: 'not-started', icon: Circle },
  needs_input: { label: 'Needs Input', variant: 'needs-input', icon: AlertCircle },
  awaiting_response: { label: 'Awaiting Response', variant: 'awaiting', icon: Mail },
  error: { label: 'Error', variant: 'destructive', icon: AlertCircle },
  skipped: { label: 'Skipped', variant: 'skipped', icon: SkipForward },
}

export function CheckStatusBadge({ status }: { status: CheckStatus }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className={`h-3 w-3 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  )
}
