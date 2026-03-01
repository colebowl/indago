import type { Property, CreatePropertyInput, ReportSummary } from '@indago/types'
import { MOCK_PROPERTIES } from '@/mocks/properties'
import { MOCK_REPORT } from '@/mocks/report'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function listProperties(): Promise<Property[]> {
  await delay(600)
  return MOCK_PROPERTIES
}

export async function getProperty(id: string): Promise<Property> {
  await delay(400)
  const p = MOCK_PROPERTIES.find(p => p.id === id)
  if (!p) throw new Error(`Property ${id} not found`)
  return p
}

export async function createProperty(input: CreatePropertyInput): Promise<Property> {
  await delay(1200)
  return {
    id: crypto.randomUUID(),
    listingUrl: input.listingUrl,
    address: 'Loading...',
    municipality: null,
    province: 'BC',
    propertyType: null,
    yearBuilt: null,
    lotSize: null,
    price: null,
    pid: null,
    waterSource: null,
    sewerType: null,
    isStrata: false,
    buyerType: input.buyerType,
    buyerGoal: input.buyerGoal ?? null,
    isFirstTimeBuyer: input.isFirstTimeBuyer,
    listingData: null,
    zoningData: null,
    ocpData: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export async function deleteProperty(_id: string): Promise<void> {
  await delay(300)
}

export async function runAllChecks(_id: string): Promise<void> {
  await delay(500)
}

export async function getReport(id: string): Promise<ReportSummary> {
  await delay(800)
  if (id === MOCK_REPORT.propertyId) return MOCK_REPORT
  return { ...MOCK_REPORT, propertyId: id }
}

export async function uploadDocument(
  _propertyId: string,
  _file: File,
): Promise<{ documentId: string }> {
  await delay(2000)
  return { documentId: crypto.randomUUID() }
}
