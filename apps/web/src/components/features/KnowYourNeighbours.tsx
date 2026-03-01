import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, TreePine, Factory } from 'lucide-react'

export function KnowYourNeighbours() {
  const checks = [
    { icon: Building2, name: 'Adjacent Property Zoning', desc: 'Check zoning of neighbouring lots for incompatible uses' },
    { icon: Factory, name: 'Industrial Proximity', desc: 'Distance to nearest industrial-zoned property' },
    { icon: TreePine, name: 'Parks & Green Space', desc: 'Nearby parks, trails, and protected areas' },
    { icon: MapPin, name: 'Development Applications', desc: 'Active construction and rezoning nearby' },
  ]

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardHeader className="pb-2 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Know Your Neighbours
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-xs text-muted-foreground mb-3">
          Understanding what surrounds your property is crucial for assessing livability, future value, and potential nuisances.
        </p>
        <div className="space-y-2">
          {checks.map((check) => {
            const Icon = check.icon
            return (
              <div key={check.name} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">{check.name}</span>
                  <span className="hidden sm:inline"> — {check.desc}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
