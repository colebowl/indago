import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DollarSign, Calculator } from 'lucide-react'

interface PTTCalculatorProps {
  details: Record<string, unknown>
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(amount)
}

export function PTTCalculator({ details }: PTTCalculatorProps) {
  const basePTT = details.basePTT as {
    firstBracket: { range: string; rate: string; amount: number }
    secondBracket: { range: string; rate: string; amount: number }
    thirdBracket: { range: string; rate: string; amount: number }
    total: number
  } | undefined

  const totalPayable = details.totalPayable as number | undefined
  const purchasePrice = details.purchasePrice as number | undefined
  const firstTimeBuyer = details.firstTimeBuyerExemption as {
    eligible: boolean
    exemptionAmount: number
    note?: string
  } | undefined

  if (!basePTT || typeof basePTT === 'number') return null

  return (
    <Card className="mt-3 p-4 bg-muted/30">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider">PTT Breakdown</span>
      </div>

      <div className="space-y-2 text-xs">
        {purchasePrice && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Purchase Price</span>
            <span className="font-semibold">{formatCurrency(purchasePrice)}</span>
          </div>
        )}

        <Separator />

        {basePTT.firstBracket && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{basePTT.firstBracket.range}</span>
            <span>{basePTT.firstBracket.rate} = {formatCurrency(basePTT.firstBracket.amount)}</span>
          </div>
        )}
        {basePTT.secondBracket && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{basePTT.secondBracket.range}</span>
            <span>{basePTT.secondBracket.rate} = {formatCurrency(basePTT.secondBracket.amount)}</span>
          </div>
        )}
        {basePTT.thirdBracket && basePTT.thirdBracket.amount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{basePTT.thirdBracket.range}</span>
            <span>{basePTT.thirdBracket.rate} = {formatCurrency(basePTT.thirdBracket.amount)}</span>
          </div>
        )}

        <Separator />

        {firstTimeBuyer && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">First-Time Buyer Exemption</span>
            <span className={firstTimeBuyer.eligible && firstTimeBuyer.exemptionAmount > 0 ? 'text-green-700 font-medium' : 'text-muted-foreground'}>
              {firstTimeBuyer.eligible && firstTimeBuyer.exemptionAmount > 0
                ? `−${formatCurrency(firstTimeBuyer.exemptionAmount)}`
                : 'Not applicable'}
            </span>
          </div>
        )}
        {firstTimeBuyer?.note && (
          <p className="text-[10px] text-muted-foreground italic">{firstTimeBuyer.note}</p>
        )}

        <Separator />

        <div className="flex justify-between items-center">
          <span className="font-semibold flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-primary" />
            Total PTT Payable
          </span>
          <span className="text-base font-bold text-primary">
            {formatCurrency(totalPayable ?? basePTT.total)}
          </span>
        </div>
      </div>
    </Card>
  )
}
