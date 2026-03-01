import type { BuyerType } from '@indago/types'
import { BUYER_TYPE_CONFIGS } from '@indago/types'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Home,
  TrendingUp,
  CalendarDays,
  Hammer,
  Users,
  ArrowDownToLine,
} from 'lucide-react'

const ICON_MAP: Record<string, typeof Home> = {
  Home,
  TrendingUp,
  CalendarDays,
  Hammer,
  Users,
  ArrowDownToLine,
}

interface BuyerTypeSelectorProps {
  value: BuyerType | null
  onChange: (type: BuyerType) => void
}

export function BuyerTypeSelector({ value, onChange }: BuyerTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {BUYER_TYPE_CONFIGS.map((config) => {
        const Icon = ICON_MAP[config.icon] ?? Home
        const isSelected = value === config.type

        return (
          <Card
            key={config.type}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => onChange(config.type)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onChange(config.type)
              }
            }}
            className={cn(
              'p-4 cursor-pointer transition-all hover:shadow-md',
              isSelected
                ? 'ring-2 ring-primary bg-accent border-primary'
                : 'hover:border-primary/30',
            )}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{config.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
