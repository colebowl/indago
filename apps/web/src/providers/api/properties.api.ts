import type { Property, CreatePropertyInput, ReportSummary } from '@indago/types'
import { apiRequest } from './client'

export interface PropertyWithChecks extends Property {
  checks: unknown[]
}

export async function listProperties(): Promise<Property[]> {
  return apiRequest<Property[]>('/v1/properties')
}

export async function getProperty(id: string): Promise<PropertyWithChecks> {
  return apiRequest<PropertyWithChecks>(`/v1/properties/${id}`)
}

export async function createProperty(input: CreatePropertyInput): Promise<Property> {
  return apiRequest<Property>('/v1/properties', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function deleteProperty(id: string): Promise<void> {
  await apiRequest(`/v1/properties/${id}`, { method: 'DELETE' })
}

export async function runAllChecks(id: string): Promise<void> {
  await apiRequest(`/v1/properties/${id}/run-all-checks`, { method: 'POST' })
}

export async function getReport(id: string): Promise<ReportSummary> {
  return apiRequest<ReportSummary>(`/v1/properties/${id}/report`)
}

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function uploadDocument(
  propertyId: string,
  file: File,
): Promise<{ id: string; fileName: string; filePath: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/v1/properties/${propertyId}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Upload failed')
    throw new Error(text || 'Upload failed')
  }
  return res.json()
}
