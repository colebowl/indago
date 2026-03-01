import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useProperty } from '@/hooks/useProperty'
import { useReport } from '@/hooks/useReport'
import { BUYER_TYPE_CONFIGS } from '@indago/types'
import { groupChecksByCategory } from '@/lib/categories'
import { ProgressBar } from '@/components/features/ProgressBar'
import { ForYouSummary } from '@/components/features/ForYouSummary'
import { SummarizedView } from '@/components/features/SummarizedView'
import { FullReportView } from '@/components/features/FullReportView'
import { KnowYourNeighbours } from '@/components/features/KnowYourNeighbours'
import { ChatWithReport } from '@/components/features/ChatWithReport'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Home, DollarSign, Calendar, LayoutList, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

function generatePropertyImage(text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
    <rect width="300" height="200" fill="#1a9a8a" rx="4"/>
    <text x="150" y="90" fill="white" font-family="system-ui" font-size="14" text-anchor="middle">${text}</text>
    <rect x="60" y="110" width="80" height="60" fill="white" fill-opacity="0.2" rx="2"/>
    <rect x="160" y="110" width="80" height="60" fill="white" fill-opacity="0.2" rx="2"/>
    <rect x="110" y="130" width="80" height="40" fill="white" fill-opacity="0.15" rx="2"/>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const MOCK_PROPERTY_IMAGES: Record<string, string> = {
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': generatePropertyImage('123 Main St'),
  'b2c3d4e5-f6a7-8901-bcde-f12345678901': generatePropertyImage('456 Oak Ave'),
}

function formatPrice(price: number | null): string {
  if (!price) return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(price)
}

type ReportView = 'summarized' | 'full'

export function PropertyReportPage() {
  const { id } = useParams<{ id: string }>()
  const { data: property, isLoading: propLoading } = useProperty(id)
  const { data: report, isLoading: reportLoading } = useReport(id)
  const [view, setView] = useState<ReportView>('summarized')

  const allChecks = useMemo(() => {
    if (!report) return []
    const checks = report.sections.flatMap(s => s.checks)
    return Array.from(new Map(checks.map(c => [c.checkId, c])).values())
  }, [report])

  const categoryGroups = useMemo(() => {
    if (!report) return []
    return groupChecksByCategory(allChecks, report.sections)
  }, [report, allChecks])

  if (propLoading || reportLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    )
  }

  if (!property || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    )
  }

  const buyerConfig = BUYER_TYPE_CONFIGS.find(b => b.type === property.buyerType)
  const imageUrl = MOCK_PROPERTY_IMAGES[property.id]

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">
      {/* Property Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={property.address}
              className="w-24 h-24 sm:w-32 sm:h-24 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-lg font-bold leading-tight">{property.address}</h1>
                <p className="text-sm text-primary font-medium mt-0.5">
                  {property.municipality}
                </p>
              </div>
              {buyerConfig && (
                <Badge variant="secondary" className="shrink-0">{buyerConfig.label}</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              {property.propertyType && (
                <span className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  {property.propertyType}
                </span>
              )}
              {property.yearBuilt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {property.yearBuilt}
                </span>
              )}
              {property.price && (
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <DollarSign className="h-3 w-3" />
                  {formatPrice(property.price)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Due diligence progress</span>
            <span>{report.completedChecks} of {report.totalChecks} checks</span>
          </div>
          <ProgressBar value={report.completionPercent} showLabel={false} />
        </div>
      </div>

      {/* For You Summary */}
      <ForYouSummary insights={report.forYou} allChecks={allChecks} />

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Due Diligence Report
        </h2>
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setView('summarized')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
              view === 'summarized'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutList className="h-3.5 w-3.5" />
            Summary
          </button>
          <button
            onClick={() => setView('full')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
              view === 'full'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Full Report
          </button>
        </div>
      </div>

      {/* Report Content */}
      {view === 'summarized' ? (
        <SummarizedView groups={categoryGroups} />
      ) : (
        <FullReportView groups={categoryGroups} />
      )}

      {/* Coming Soon stubs */}
      <ChatWithReport />
      <KnowYourNeighbours />
    </div>
  )
}
