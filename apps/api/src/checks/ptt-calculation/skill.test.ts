import { describe, it, expect } from 'vitest'
import {
  calculateBasePTT,
  firstTimeBuyerExemption,
  newlyBuiltExemption,
  execute,
} from './skill'
import type { CheckContext, PropertyRecord } from '../types'

function mockContext(overrides: Partial<PropertyRecord>): CheckContext {
  const property: PropertyRecord = {
    id: 'test-id',
    listingUrl: null,
    address: '123 Test St',
    municipality: 'Vancouver',
    province: 'BC',
    propertyType: 'detached',
    yearBuilt: 1990,
    lotSize: null,
    price: null,
    pid: null,
    waterSource: null,
    sewerType: null,
    isStrata: false,
    buyerType: 'first_time',
    buyerGoal: null,
    isFirstTimeBuyer: false,
    listingData: null,
    zoningData: null,
    ocpData: null,
    ...overrides,
  }
  return {
    property,
    existingResults: new Map(),
    llm: {} as CheckContext['llm'],
  }
}

describe('calculateBasePTT', () => {
  it('returns 0 for price <= 0', () => {
    expect(calculateBasePTT(0)).toBe(0)
    expect(calculateBasePTT(-100)).toBe(0)
  })

  it('calculates 1% on first $200K', () => {
    expect(calculateBasePTT(100_000)).toBe(1_000)
    expect(calculateBasePTT(200_000)).toBe(2_000)
  })

  it('calculates 1% + 2% on $200K-$2M', () => {
    expect(calculateBasePTT(400_000)).toBe(6_000)
    expect(calculateBasePTT(500_000)).toBe(8_000)
    expect(calculateBasePTT(1_000_000)).toBe(18_000)
    expect(calculateBasePTT(2_000_000)).toBe(38_000)
  })

  it('calculates full tiers including 3% above $2M', () => {
    expect(calculateBasePTT(2_500_000)).toBe(53_000)
    expect(calculateBasePTT(3_000_000)).toBe(68_000)
  })

  it('exactly $500K (first-time buyer threshold)', () => {
    expect(calculateBasePTT(500_000)).toBe(8_000)
  })

  it('exactly $525K (first-time buyer phase-out end)', () => {
    expect(calculateBasePTT(525_000)).toBe(8_500)
  })
})

describe('firstTimeBuyerExemption', () => {
  it('full exemption under $500K', () => {
    expect(firstTimeBuyerExemption(400_000, 4_000)).toBe(4_000)
    expect(firstTimeBuyerExemption(500_000, 8_000)).toBe(8_000)
  })

  it('no exemption at or above $525K', () => {
    expect(firstTimeBuyerExemption(525_000, 8_500)).toBe(0)
    expect(firstTimeBuyerExemption(600_000, 10_000)).toBe(0)
  })

  it('partial exemption between $500K and $525K', () => {
    const basePTT = 8_000
    const exemptAt5125 = firstTimeBuyerExemption(512_500, basePTT)
    expect(exemptAt5125).toBeGreaterThan(0)
    expect(exemptAt5125).toBeLessThan(basePTT)
  })
})

describe('newlyBuiltExemption', () => {
  it('full exemption under $750K', () => {
    expect(newlyBuiltExemption(600_000, 10_000)).toBe(10_000)
    expect(newlyBuiltExemption(750_000, 14_750)).toBe(14_750)
  })

  it('no exemption at or above $800K', () => {
    expect(newlyBuiltExemption(800_000, 16_000)).toBe(0)
    expect(newlyBuiltExemption(1_000_000, 18_000)).toBe(0)
  })

  it('partial exemption between $750K and $800K', () => {
    const basePTT = 15_000
    const exemptAt775 = newlyBuiltExemption(775_000, basePTT)
    expect(exemptAt775).toBeGreaterThan(0)
    expect(exemptAt775).toBeLessThan(basePTT)
  })
})

describe('execute', () => {
  it('returns needs_input when price is missing', async () => {
    const ctx = mockContext({ price: null })
    const result = await execute(ctx)
    expect(result.status).toBe('needs_input')
    expect(result.guidance).toBeDefined()
  })

  it('returns needs_input when price is 0', async () => {
    const ctx = mockContext({ price: 0 })
    const result = await execute(ctx)
    expect(result.status).toBe('needs_input')
  })

  it('calculates PTT for non-first-time buyer', async () => {
    const ctx = mockContext({ price: 500_000, isFirstTimeBuyer: false })
    const result = await execute(ctx)
    expect(result.status).toBe('complete')
    expect(result.details.basePTT.total).toBe(8_000)
    expect(result.details.firstTimeBuyerExemption.exemptionAmount).toBe(0)
    expect(result.details.totalPayable).toBe(8_000)
  })

  it('applies first-time buyer exemption under $500K', async () => {
    const ctx = mockContext({
      price: 400_000,
      isFirstTimeBuyer: true,
    })
    const result = await execute(ctx)
    expect(result.status).toBe('complete')
    expect(result.details.totalPayable).toBe(0)
    expect(result.details.firstTimeBuyerExemption.exemptionAmount).toBe(6_000)
  })

  it('applies partial first-time buyer exemption at $512.5K', async () => {
    const ctx = mockContext({
      price: 512_500,
      isFirstTimeBuyer: true,
    })
    const result = await execute(ctx)
    expect(result.status).toBe('complete')
    expect(result.details.totalPayable).toBeLessThan(8_125)
    expect(result.details.totalPayable).toBeGreaterThan(0)
  })

  it('no exemption for first-time buyer above $525K', async () => {
    const ctx = mockContext({
      price: 600_000,
      isFirstTimeBuyer: true,
    })
    const result = await execute(ctx)
    expect(result.status).toBe('complete')
    expect(result.details.totalPayable).toBe(10_000)
    expect(result.details.firstTimeBuyerExemption.exemptionAmount).toBe(0)
  })

  it('calculates correctly for $2M+ property', async () => {
    const ctx = mockContext({ price: 2_500_000, isFirstTimeBuyer: false })
    const result = await execute(ctx)
    expect(result.status).toBe('complete')
    expect(result.details.basePTT.total).toBe(53_000)
    expect(result.details.totalPayable).toBe(53_000)
  })
})
