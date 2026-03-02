import { useEffect, useState } from 'react'
import type { SimulatedCheck } from '@/hooks/useCheckSimulation'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Loader2, Clock, Circle, AlertCircle, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChecklistLoadingProps {
  checks: SimulatedCheck[]
  completedCount: number
  totalChecks: number
  progressPercent: number
  isComplete: boolean
}

function ChecklistItem({ check, index }: { check: SimulatedCheck; index: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80)
    return () => clearTimeout(timer)
  }, [index])

  const Icon =
    check.status === 'complete' ? CheckCircle2 :
    check.status === 'needs_input' ? AlertCircle :
    check.status === 'running' ? Loader2 :
    Circle

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-500',
        !visible && 'opacity-0 translate-y-2',
        visible && 'opacity-100 translate-y-0',
        check.status === 'running' && 'bg-accent/50',
        check.status === 'complete' && 'bg-green-50/50',
        check.status === 'needs_input' && 'bg-blue-50/50',
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors duration-300',
          check.status === 'complete' && 'text-status-complete',
          check.status === 'needs_input' && 'text-status-needs-input',
          check.status === 'running' && 'text-primary animate-spin',
          check.status === 'waiting' && 'text-muted-foreground/30',
        )}
      />

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium transition-colors duration-300',
          check.status === 'waiting' && 'text-muted-foreground/50',
          check.status === 'running' && 'text-foreground',
          (check.status === 'complete' || check.status === 'needs_input') && 'text-foreground',
        )}>
          {check.label}
        </p>
        <p className={cn(
          'text-[11px] transition-colors duration-300',
          check.status === 'running' ? 'text-primary/70' : 'text-muted-foreground/50',
        )}>
          {check.source}
        </p>
      </div>

      {check.result && (
        <span className={cn(
          'text-xs font-medium shrink-0 max-w-[40%] truncate transition-all duration-500',
          check.status === 'complete' && 'text-status-complete',
          check.status === 'needs_input' && 'text-status-needs-input',
        )}>
          {check.result}
        </span>
      )}
    </div>
  )
}

export function ChecklistLoading({
  checks,
  completedCount,
  totalChecks,
  progressPercent,
  isComplete,
}: ChecklistLoadingProps) {
  return (
    <Card className={cn(
      'border-primary/20 overflow-hidden transition-all duration-700',
      isComplete && 'border-status-complete/30',
    )}>
      <div className={cn(
        'h-1 transition-colors duration-700',
        isComplete ? 'bg-status-complete' : 'bg-primary',
      )} />
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center transition-colors duration-700',
            isComplete ? 'bg-green-100' : 'bg-accent',
          )}>
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-status-complete animate-check-appear" />
            ) : (
              <Search className="h-5 w-5 text-primary animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold">
              {isComplete ? 'Analysis complete' : 'Analyzing your property…'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isComplete
                ? 'Your due diligence report is ready'
                : `${completedCount} of ${totalChecks} checks complete`
              }
            </p>
          </div>
        </div>

        <Progress value={progressPercent} className="h-2" />

        <div className="space-y-0.5">
          {checks.map((check, i) => (
            <ChecklistItem key={check.id} check={check} index={i} />
          ))}
        </div>

        {isComplete && (
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Completed in ~9 seconds
          </div>
        )}
      </CardContent>
    </Card>
  )
}
