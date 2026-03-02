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

export function CheckStatusBadge({
  status,
  showSpinner,
}: {
  status: CheckStatus
  /** When false, don't show spinner for in_progress (e.g. section has no actively running child checks). Defaults to true for in_progress. */
  showSpinner?: boolean
}) {
  const config = STATUS_CONFIG[status]
  const isInProgressNoSpinner = status === 'in_progress' && (showSpinner === false)
  const Icon = isInProgressNoSpinner ? Clock : config.icon
  const shouldSpin = status === 'in_progress' && (showSpinner ?? true)

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className={`h-3 w-3 ${shouldSpin ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  )
}
