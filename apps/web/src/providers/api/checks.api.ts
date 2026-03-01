import type { CheckResult } from '@indago/types'
import { MOCK_CHECK_RESULTS } from '@/mocks/checks'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

export async function getCheckResults(propertyId: string): Promise<CheckResult[]> {
  await delay(500)
  return MOCK_CHECK_RESULTS.filter(c => c.propertyId === propertyId)
}

export async function executeCheck(
  _propertyId: string,
  _checkId: string,
): Promise<CheckResult> {
  await delay(1500)
  return MOCK_CHECK_RESULTS[0]
}

export async function updateCheckStatus(
  _propertyId: string,
  _checkId: string,
  _status: string,
): Promise<void> {
  await delay(300)
}
