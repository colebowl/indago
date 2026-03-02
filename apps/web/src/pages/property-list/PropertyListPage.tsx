import { Link } from 'react-router-dom'
import { useProperties, useDeleteProperty } from '@/hooks/useProperty'
import { PropertyCard } from '@/components/features/PropertyCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search } from 'lucide-react'

export function PropertyListPage() {
  const { data: properties, isLoading, error } = useProperties()
  const deleteProperty = useDeleteProperty()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Properties</h1>
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-36 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load properties</p>
      </div>
    )
  }

  if (!properties?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Search className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-1">No properties yet</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Add your first property to start your due diligence research. Paste a listing URL and we'll do the rest.
        </p>
        <Button asChild>
          <Link to="/add" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Property
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Properties</h1>
        <Button asChild size="sm" className="gap-1.5">
          <Link to="/add">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Property</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onDelete={(id) => deleteProperty.mutate(id)}
          />
        ))}
      </div>
    </div>
  )
}
