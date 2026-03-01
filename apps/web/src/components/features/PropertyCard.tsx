import { Link } from 'react-router-dom'
import type { Property } from '@indago/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from './ProgressBar'
import { MapPin, Home, Calendar, DollarSign } from 'lucide-react'
import { BUYER_TYPE_CONFIGS } from '@indago/types'

interface PropertyCardProps {
  property: Property
  completionPercent?: number
}

function formatPrice(price: number | null): string {
  if (!price) return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(price)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function PropertyCard({ property, completionPercent = 0 }: PropertyCardProps) {
  const buyerConfig = BUYER_TYPE_CONFIGS.find(b => b.type === property.buyerType)

  return (
    <Link to={`/property/${property.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{property.address}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{property.municipality ?? 'Unknown municipality'}</span>
              </div>
            </div>
            {buyerConfig && (
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {buyerConfig.label}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
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

          <ProgressBar value={completionPercent} />

          <p className="text-[10px] text-muted-foreground mt-2">
            Updated {formatDate(property.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
