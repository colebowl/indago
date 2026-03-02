import type { CheckContext, CheckSkill, SkillCheckResult, Source } from '../types'

const PTT_SOURCE: Source = {
  name: 'BC Property Transfer Tax Act',
  url: 'https://www2.gov.bc.ca/gov/content/taxes/property-taxes/property-transfer-tax',
  type: 'rule',
  note: 'Rates and exemptions as per current legislation',
}

export function calculateBasePTT(price: number): number {
  if (price <= 0) return 0
  let tax = 0
  if (price > 2_000_000) {
    tax += (price - 2_000_000) * 0.03
    price = 2_000_000
  }
  if (price > 200_000) {
    tax += (price - 200_000) * 0.02
    price = 200_000
  }
  tax += price * 0.01
  return Math.round(tax)
}

/**
 * First-time buyer exemption: full under $500K, phases out $500K–$525K, none above $525K.
 * Returns the amount of tax exempted (0 to basePTT).
 */
export function firstTimeBuyerExemption(
  purchasePrice: number,
  basePTT: number,
): number {
  if (purchasePrice <= 500_000) return basePTT
  if (purchasePrice >= 525_000) return 0
  const phaseOutRatio = (purchasePrice - 500_000) / 25_000
  return Math.round(basePTT * (1 - phaseOutRatio))
}

/**
 * Newly built exemption: full under $750K, phases out $750K–$800K, none above $800K.
 */
export function newlyBuiltExemption(
  purchasePrice: number,
  basePTT: number,
): number {
  if (purchasePrice <= 750_000) return basePTT
  if (purchasePrice >= 800_000) return 0
  const phaseOutRatio = (purchasePrice - 750_000) / 50_000
  return Math.round(basePTT * (1 - phaseOutRatio))
}

export async function execute(context: CheckContext): Promise<SkillCheckResult> {
  const { property } = context
  const price = property.price

  if (price === null || price === undefined || price <= 0) {
    return {
      status: 'needs_input',
      summary: 'Property price is required to calculate PTT.',
      details: {
        message:
          'The listing price has not been extracted yet. Run the listing-intake check first, or enter the purchase price manually.',
      },
      sources: [PTT_SOURCE],
      guidance: {
        type: 'manual_lookup',
        steps: [
          'Obtain the purchase price from the listing or your offer.',
          'Re-run this check once the property has a price.',
        ],
      },
    }
  }

  const basePTT = calculateBasePTT(price)
  const isFirstTimeBuyer = property.isFirstTimeBuyer === true

  let exemptionAmount = 0
  let exemptionType: string | null = null

  if (isFirstTimeBuyer && price <= 525_000) {
    exemptionAmount = firstTimeBuyerExemption(price, basePTT)
    exemptionType = 'first_time_buyer'
  }

  const estimatedPTT = Math.max(0, basePTT - exemptionAmount)

  const firstTierAmount = Math.round(Math.min(price, 200_000) * 0.01)
  const secondTierAmount = Math.round(
    Math.max(0, Math.min(price, 2_000_000) - 200_000) * 0.02,
  )
  const thirdTierAmount = Math.round(Math.max(0, price - 2_000_000) * 0.03)

  const breakdown = {
    purchasePrice: price,
    totalPayable: estimatedPTT,
    basePTT: {
      firstBracket: {
        range: '$0 – $200,000',
        rate: '1%',
        amount: firstTierAmount,
      },
      secondBracket: {
        range: '$200,000 – $2,000,000',
        rate: '2%',
        amount: secondTierAmount,
      },
      thirdBracket: {
        range: '$2,000,000+',
        rate: '3%',
        amount: thirdTierAmount,
      },
      total: basePTT,
    },
    firstTimeBuyerExemption: {
      eligible: isFirstTimeBuyer && price <= 525_000,
      exemptionAmount,
      note:
        isFirstTimeBuyer && price <= 525_000 && exemptionAmount > 0
          ? 'Principal residence under $525K'
          : undefined,
    },
  }

  const summary =
    exemptionAmount > 0
      ? `Estimated PTT: $${estimatedPTT.toLocaleString()} ($${exemptionAmount.toLocaleString()} exemption applied)`
      : `Estimated PTT: $${estimatedPTT.toLocaleString()} (no exemptions applied)`

  const sources: Source[] = [PTT_SOURCE]

  if (isFirstTimeBuyer && price <= 525_000) {
    sources.push({
      name: 'First-Time Home Buyer Program',
      url: 'https://www2.gov.bc.ca/gov/content/taxes/property-taxes/property-transfer-tax/exemptions/first-time-home-buyers',
      type: 'rule',
      note: 'Exemption for principal residence under $525K',
    })
  }

  const result: SkillCheckResult = {
    status: 'complete',
    riskLevel: estimatedPTT > 0 ? 'none' : 'none',
    summary,
    details: breakdown,
    sources,
  }
  return result
}

export const skill: CheckSkill = { execute }
