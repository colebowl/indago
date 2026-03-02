import { Link } from 'react-router-dom'
import type { Property } from '@indago/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from './ProgressBar'
import { MapPin, Home, Calendar, DollarSign, Trash2 } from 'lucide-react'
import { BUYER_TYPE_CONFIGS } from '@indago/types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
function getPropertyImageUrl(property: Property): string | null {
  if (!property.primaryImagePath) return null
  return `${API_BASE}/v1/properties/${property.id}/image`
}

interface PropertyCardProps {
  property: Property
  completionPercent?: number
  onDelete?: (id: string) => void
}

function formatPrice(price: number | null): string {
  if (!price) return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(price)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function PropertyImagePlaceholder({ address }: { address: string }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
    <rect width="400" height="200" fill="#1a9a8a" rx="4"/>
    <text x="200" y="95" fill="white" font-family="system-ui" font-size="13" text-anchor="middle">${address.slice(0, 30)}${address.length > 30 ? '…' : ''}</text>
    <rect x="80" y="110" width="90" height="70" fill="white" fill-opacity="0.2" rx="2"/>
    <rect x="190" y="110" width="90" height="70" fill="white" fill-opacity="0.2" rx="2"/>
    <rect x="140" y="135" width="90" height="50" fill="white" fill-opacity="0.15" rx="2"/>
  </svg>`
  return (
    <img
      src={`data:image/svg+xml,${encodeURIComponent(svg)}`}
      alt=""
      className="w-full h-40 object-cover rounded-t-lg"
    />
  )
}

export function PropertyCard({ property, completionPercent = 0, onDelete }: PropertyCardProps) {
  const buyerConfig = BUYER_TYPE_CONFIGS.find(b => b.type === property.buyerType)
  const imageUrl = getPropertyImageUrl(property)

  return (
    <div className="relative group">
      <Link to={`/property/${property.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="w-full h-40 object-cover"
            />
          ) : (
            <PropertyImagePlaceholder address={property.address} />
          )}
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
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (window.confirm(`Delete ${property.address}? All check results and uploaded documents will be removed. This cannot be undone.`)) {
              onDelete(property.id)
            }
          }}
          className="absolute bottom-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Delete property"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
