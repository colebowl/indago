import { registry } from './registry'
import { pttCalculationModule } from './ptt-calculation/index'
import { listingIntakeModule } from './listing-intake/index'
import { zoningDesignationModule } from './zoning-designation/index'
import { ocpStatusModule } from './ocp-status/index'
import { titleSearchModule } from './title-search/index'
import { propertyHistoryModule } from './property-history/index'
import { naturalHazardsModule } from './natural-hazards/index'
import { registerTier3Checks } from './tier3/index'

export function registerAllChecks(): void {
  registry.register(listingIntakeModule)
  registry.register(pttCalculationModule)
  registry.register(zoningDesignationModule)
  registry.register(ocpStatusModule)
  registry.register(titleSearchModule)
  registry.register(propertyHistoryModule)
  registry.register(naturalHazardsModule)
  registerTier3Checks()
}
