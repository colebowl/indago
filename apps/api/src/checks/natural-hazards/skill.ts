import type {
  CheckContext,
  CheckSkill,
  SkillCheckResult,
  Source,
} from '../types'

const MOCK_SOURCES: Source[] = [
  {
    name: 'Natural Resources Canada — Seismic Hazard Map',
    url: 'https://earthquakescanada.nrcan.gc.ca/hazard-alea/index-en.php',
    type: 'data',
    note: 'Simulated result',
  },
  {
    name: 'PreparedBC — Know Your Hazards',
    url: 'https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc',
    type: 'data',
    note: 'Simulated result',
  },
  {
    name: 'Health Canada — Radon',
    url: 'https://www.canada.ca/en/health-canada/services/health-risks-safety/radiation/radon.html',
    type: 'data',
    note: 'Simulated result',
  },
  {
    name: 'BCCDC — Radon',
    url: 'https://www.bccdc.ca/health-info/database/radon',
    type: 'data',
    note: 'Simulated result',
  },
]

/**
 * Generates deterministic mock natural hazard data based on property address.
 * Tier 2 check — returns realistic simulated data for demo.
 */
function generateMockHazards(property: CheckContext['property']) {
  const addrHash =
    (property.address?.length ?? 0) +
    (property.municipality?.length ?? 0) +
    (property.propertyType?.length ?? 0)
  const isUrban =
    property.municipality?.toLowerCase().includes('vancouver') ||
    property.municipality?.toLowerCase().includes('victoria') ||
    addrHash % 3 === 0

  return {
    earthquake: {
      risk: 'moderate' as const,
      zone: 4,
      note: 'Greater Vancouver / BC South Coast is in seismic zone 4 (moderate to high). Consider earthquake insurance.',
    },
    flood: {
      risk: isUrban ? ('low' as const) : ('moderate' as const),
      note: isUrban
        ? 'Property is not in a designated floodplain.'
        : 'Verify against local flood hazard maps — some BC areas have flood exposure.',
    },
    wildfire: {
      risk: isUrban ? ('low' as const) : ('moderate' as const),
      note: isUrban
        ? 'Urban location; not in wildfire-urban interface.'
        : 'Interface/urban fringe areas may have elevated wildfire risk. Check local mapping.',
    },
    radon: {
      risk: 'low' as const,
      estimatedLevel: '< 100 Bq/m³',
      note: 'BC lower mainland generally below Health Canada guideline of 200 Bq/m³. Testing recommended for peace of mind.',
    },
    landslide: {
      risk: 'low' as const,
      note: 'Relatively flat terrain. Steep slopes or coastal bluffs would require geotechnical assessment.',
    },
  }
}

export async function execute(context: CheckContext): Promise<SkillCheckResult> {
  const { property } = context
  const hazards = generateMockHazards(property)

  const overallRisk =
    hazards.wildfire.risk === 'moderate' || hazards.flood.risk === 'moderate'
      ? 'low'
      : 'none'

  return {
    status: 'complete',
    riskLevel: overallRisk === 'none' ? undefined : overallRisk,
    summary: `Simulated hazard assessment: earthquake zone 4, flood ${hazards.flood.risk}, wildfire ${hazards.wildfire.risk}, radon ${hazards.radon.risk}.`,
    details: hazards,
    sources: MOCK_SOURCES,
  }
}

export const skill: CheckSkill = { execute }
