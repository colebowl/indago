import { useState, useCallback } from 'react'
import type { UserGuidance } from '@indago/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  FileText,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
  User,
  Landmark,
  Scale,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TitleUploadProps {
  guidance: UserGuidance
  propertyId: string
}

type UploadPhase = 'waiting' | 'uploading' | 'analyzing' | 'complete'

const MOCK_TITLE_RESULTS = {
  owner: 'JOHN A. DOE AND JANE B. DOE, JOINT TENANTS',
  pid: '015-234-567',
  titleNumber: 'CA1234567',
  registeredDate: 'March 15, 2018',
  legalDescription: 'LOT 12, BLOCK 5, PLAN 12345, DISTRICT LOT 526, GROUP 1, NWD',
  charges: [
    {
      type: 'Mortgage',
      holder: 'Royal Bank of Canada',
      registeredDate: 'March 15, 2018',
      number: 'CA7891011',
      risk: 'none' as const,
    },
    {
      type: 'Covenant',
      holder: 'City of Vancouver',
      registeredDate: 'June 3, 1995',
      number: 'BB1234567',
      risk: 'low' as const,
      note: 'Restricts subdivision — standard for this lot size',
    },
  ],
  easements: [
    {
      type: 'Statutory Right of Way',
      holder: 'BC Hydro',
      registeredDate: 'January 12, 1960',
      note: 'Utility easement along rear property line (1.5m)',
      risk: 'none' as const,
    },
  ],
  liens: [] as { type: string; holder: string; amount: string; risk: 'high' | 'very_high' }[],
  aiSummary:
    'Title is clean with no concerning liens or encumbrances. Standard mortgage registered to RBC. One covenant restricting subdivision (common for RS-1 lots). Utility easement along the rear is typical and should not impact your plans.',
}

const RISK_STYLES = {
  none: 'bg-green-50 text-green-700 border-green-200',
  low: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  very_high: 'bg-red-50 text-red-700 border-red-200',
}

export function TitleUpload({ guidance, propertyId }: TitleUploadProps) {
  const [phase, setPhase] = useState<UploadPhase>('waiting')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(async (_file: File) => {
    setPhase('uploading')
    await new Promise(r => setTimeout(r, 1500))
    setPhase('analyzing')
    await new Promise(r => setTimeout(r, 2500))
    setPhase('complete')
  }, [propertyId])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file?.type === 'application/pdf') handleFile(file)
    },
    [handleFile],
  )

  if (phase === 'complete') {
    const r = MOCK_TITLE_RESULTS
    return (
      <div className="mt-3 space-y-3">
        <Card className="p-3 bg-green-50/50 border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">Title analysis complete</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            Uploaded title_search_015-234-567.pdf &middot; Analyzed by AI
          </p>
        </Card>

        <div className="p-3 rounded-lg border bg-accent/30 space-y-1.5">
          <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            AI Assessment
          </p>
          <p className="text-xs text-muted-foreground">{r.aiSummary}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg border bg-card space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Owner
            </p>
            <p className="font-medium text-[11px] leading-tight">{r.owner}</p>
          </div>
          <div className="p-2.5 rounded-lg border bg-card space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Title #
            </p>
            <p className="font-medium">{r.titleNumber}</p>
            <p className="text-muted-foreground text-[10px]">{r.registeredDate}</p>
          </div>
        </div>

        {r.charges.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
              <Landmark className="h-3 w-3" />
              Charges & Covenants ({r.charges.length})
            </p>
            <div className="space-y-1.5">
              {r.charges.map((charge, i) => (
                <div key={i} className={cn('p-2 rounded border text-xs', RISK_STYLES[charge.risk])}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{charge.type}</span>
                    <Badge variant="outline" className="text-[9px] h-4">{charge.risk === 'none' ? 'No Risk' : charge.risk}</Badge>
                  </div>
                  <p className="text-[11px] mt-0.5">{charge.holder}</p>
                  {charge.note && <p className="text-[11px] mt-0.5 italic">{charge.note}</p>}
                  <p className="text-[10px] opacity-70 mt-0.5">Reg: {charge.registeredDate} &middot; {charge.number}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {r.easements.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
              <Scale className="h-3 w-3" />
              Easements ({r.easements.length})
            </p>
            <div className="space-y-1.5">
              {r.easements.map((easement, i) => (
                <div key={i} className={cn('p-2 rounded border text-xs', RISK_STYLES[easement.risk])}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{easement.type}</span>
                    <Badge variant="outline" className="text-[9px] h-4">No Risk</Badge>
                  </div>
                  <p className="text-[11px] mt-0.5">{easement.holder}</p>
                  {easement.note && <p className="text-[11px] mt-0.5 italic">{easement.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {r.liens.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-1.5 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Liens ({r.liens.length})
            </p>
            {r.liens.map((lien, i) => (
              <div key={i} className="p-2 rounded border border-red-200 bg-red-50 text-xs text-red-700">
                <span className="font-medium">{lien.type}</span> — {lien.holder} ({lien.amount})
              </div>
            ))}
          </div>
        )}

        {r.liens.length === 0 && (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-medium">No liens found on title</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">How to get the title</p>
        <ol className="space-y-1.5">
          {guidance.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-primary shrink-0 w-4 text-right">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {guidance.url && (
          <a
            href={guidance.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium mt-1"
          >
            Open myLTSA.ca <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {phase === 'analyzing' ? (
        <Card className="p-4 border-primary/30 bg-accent/30">
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <div>
              <span className="text-sm font-medium">Analyzing title document...</span>
              <p className="text-xs text-muted-foreground mt-0.5">AI is extracting owner, charges, liens, and easements</p>
            </div>
          </div>
        </Card>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver ? 'border-primary bg-accent/50' : 'border-muted-foreground/20'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            {phase === 'uploading' ? (
              <>
                <FileText className="h-8 w-8 text-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Drag & drop your title PDF here</p>
                <label>
                  <Button variant="outline" size="sm" className="mt-1" asChild>
                    <span>Choose File</span>
                  </Button>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFile(file)
                    }}
                  />
                </label>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
