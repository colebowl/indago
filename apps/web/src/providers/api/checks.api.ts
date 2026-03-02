import type { CheckResult } from '@indago/types'
import { apiRequest } from './client'

export async function getCheckResults(propertyId: string): Promise<CheckResult[]> {
  return apiRequest<CheckResult[]>(`/v1/properties/${propertyId}/checks`)
}

export async function executeCheck(
  propertyId: string,
  checkId: string,
): Promise<CheckResult> {
  return apiRequest<CheckResult>(
    `/v1/properties/${propertyId}/checks/${checkId}/execute`,
    { method: 'POST' },
  )
}

export async function updateCheckStatus(
  propertyId: string,
  checkId: string,
  status: string,
): Promise<void> {
  await apiRequest(`/v1/properties/${propertyId}/checks/${checkId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
