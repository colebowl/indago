import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2, Circle, Globe, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface RunningStep {
  label: string
  source: string
  status: 'complete' | 'running' | 'pending'
  result?: string
}

interface CheckRunningProps {
  checkId: string
  startedAt: string
}

const STEPS_BY_CHECK: Record<string, RunningStep[]> = {
  'natural-hazards': [
    { label: 'Seismic hazard assessment', source: 'NRCan Seismic Hazard API', status: 'complete', result: 'Zone 4 — moderate to high' },
    { label: 'Flood zone mapping', source: 'BC Flood Hazard Maps', status: 'complete', result: 'Not in designated floodplain' },
    { label: 'Wildfire interface check', source: 'BC Wildfire Service', status: 'running' },
    { label: 'Radon risk estimate', source: 'Health Canada Radon Data', status: 'pending' },
    { label: 'Landslide susceptibility', source: 'BC Geological Survey', status: 'pending' },
  ],
  'zoning-designation': [
    { label: 'Identify municipality', source: 'BC Assessment', status: 'complete', result: 'City of Vancouver' },
    { label: 'Locate zoning by-law', source: 'Web search', status: 'complete', result: 'Found zoning portal' },
    { label: 'Fetch district schedule', source: 'vancouver.ca', status: 'running' },
    { label: 'Parse permitted uses', source: 'AI analysis', status: 'pending' },
  ],
  'ocp-status': [
    { label: 'Find municipality OCP', source: 'Web search', status: 'complete', result: 'Vancouver Plan (2022)' },
    { label: 'Locate area designation', source: 'vancouverplan.ca', status: 'running' },
    { label: 'Analyze planning goals', source: 'AI analysis', status: 'pending' },
  ],
}

const DEFAULT_STEPS: RunningStep[] = [
  { label: 'Gathering data sources', source: 'Web search', status: 'complete', result: 'Found 3 sources' },
  { label: 'Fetching data', source: 'External API', status: 'running' },
  { label: 'Analyzing results', source: 'AI analysis', status: 'pending' },
]

function formatElapsed(startedAt: string): string {
  const elapsed = Date.now() - new Date(startedAt).getTime()
  const seconds = Math.floor(elapsed / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}

export function CheckRunning({ checkId, startedAt }: CheckRunningProps) {
  const steps = STEPS_BY_CHECK[checkId] ?? DEFAULT_STEPS
  const completedCount = steps.filter(s => s.status === 'complete').length
  const progress = Math.round(((completedCount + 0.5) / steps.length) * 100)
  const [elapsed, setElapsed] = useState(formatElapsed(startedAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(formatElapsed(startedAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-primary font-medium">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Running check...
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {elapsed}
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />

      <div className="space-y-1">
        {steps.map((step, i) => {
          const StepIcon =
            step.status === 'complete' ? CheckCircle2 :
            step.status === 'running' ? Loader2 :
            Circle

          return (
            <div
              key={i}
              className={cn(
                'flex items-start gap-2.5 py-1.5 px-2 rounded-md transition-colors',
                step.status === 'running' && 'bg-accent/40',
              )}
            >
              <StepIcon
                className={cn(
                  'h-3.5 w-3.5 mt-0.5 shrink-0',
                  step.status === 'complete' && 'text-green-600',
                  step.status === 'running' && 'text-primary animate-spin',
                  step.status === 'pending' && 'text-muted-foreground/40',
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn(
                    'text-xs font-medium',
                    step.status === 'pending' && 'text-muted-foreground/60',
                  )}>
                    {step.label}
                  </p>
                  {step.result && (
                    <span className="text-[10px] text-green-600 font-medium shrink-0 truncate max-w-[40%]">
                      {step.result}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Globe className="h-2.5 w-2.5 text-muted-foreground/50" />
                  <span className={cn(
                    'text-[10px]',
                    step.status === 'running' ? 'text-primary/70' : 'text-muted-foreground/50',
                  )}>
                    {step.source}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
