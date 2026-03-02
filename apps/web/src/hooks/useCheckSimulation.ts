import { useState, useEffect, useCallback, useRef } from 'react'

export type SimulatedCheckStatus = 'waiting' | 'running' | 'complete' | 'needs_input'

export interface SimulatedCheck {
  id: string
  label: string
  source: string
  status: SimulatedCheckStatus
  result?: string
}

interface CheckTimeline {
  id: string
  label: string
  source: string
  startAt: number
  completeAt: number
  finalStatus: SimulatedCheckStatus
  result?: string
}

const CHECK_TIMELINE: CheckTimeline[] = [
  { id: 'listing-intake', label: 'Extracting listing details', source: 'realtor.ca', startAt: 300, completeAt: 2000, finalStatus: 'complete', result: '3 bed · 2 bath · $1.85M' },
  { id: 'zoning-designation', label: 'Researching zoning designation', source: 'City of Vancouver', startAt: 2200, completeAt: 4500, finalStatus: 'complete', result: 'RS-1 — Single Family' },
  { id: 'ocp-status', label: 'Analyzing community plan', source: 'vancouverplan.ca', startAt: 2400, completeAt: 5500, finalStatus: 'complete', result: 'Multiplexes planned' },
  { id: 'ptt-calculation', label: 'Calculating transfer tax', source: 'BC PTT Act', startAt: 2800, completeAt: 4000, finalStatus: 'complete', result: '$34,980 payable' },
  { id: 'title-search', label: 'Preparing title search guidance', source: 'LTSA', startAt: 3500, completeAt: 6500, finalStatus: 'needs_input', result: 'Action needed' },
  { id: 'property-history', label: 'Researching property history', source: 'BC Site Registry', startAt: 4500, completeAt: 7500, finalStatus: 'needs_input', result: 'Email drafted' },
  { id: 'natural-hazards', label: 'Assessing natural hazards', source: 'NRCan · PreparedBC', startAt: 5000, completeAt: 8500, finalStatus: 'complete', result: 'Low-moderate risk' },
]

export function useCheckSimulation(enabled: boolean) {
  const [checks, setChecks] = useState<SimulatedCheck[]>(() =>
    CHECK_TIMELINE.map(t => ({
      id: t.id,
      label: t.label,
      source: t.source,
      status: 'waiting' as const,
    }))
  )
  const [isComplete, setIsComplete] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const reset = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setChecks(CHECK_TIMELINE.map(t => ({
      id: t.id,
      label: t.label,
      source: t.source,
      status: 'waiting',
    })))
    setIsComplete(false)
    setCompletedCount(0)
  }, [])

  useEffect(() => {
    if (!enabled) return

    reset()

    for (const timeline of CHECK_TIMELINE) {
      const startTimer = setTimeout(() => {
        setChecks(prev => prev.map(c =>
          c.id === timeline.id ? { ...c, status: 'running' } : c
        ))
      }, timeline.startAt)

      const completeTimer = setTimeout(() => {
        setChecks(prev => prev.map(c =>
          c.id === timeline.id
            ? { ...c, status: timeline.finalStatus, result: timeline.result }
            : c
        ))
        setCompletedCount(prev => prev + 1)
      }, timeline.completeAt)

      timersRef.current.push(startTimer, completeTimer)
    }

    const doneTimer = setTimeout(() => {
      setIsComplete(true)
    }, CHECK_TIMELINE[CHECK_TIMELINE.length - 1].completeAt + 1200)

    timersRef.current.push(doneTimer)

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [enabled, reset])

  return {
    checks,
    isComplete,
    completedCount,
    totalChecks: CHECK_TIMELINE.length,
    progressPercent: Math.round((completedCount / CHECK_TIMELINE.length) * 100),
  }
}
