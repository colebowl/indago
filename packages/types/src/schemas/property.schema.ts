import { z } from 'zod'

export const BuyerType = z.enum([
  'first_time',
  'investor',
  'airbnb',
  'renovation',
  'family',
  'downsizer',
])
export type BuyerType = z.infer<typeof BuyerType>

export const Province = z.enum(['BC'])
export type Province = z.infer<typeof Province>

export const PropertyType = z.enum([
  'detached',
  'townhouse',
  'condo',
  'land',
  'duplex',
  'other',
])
export type PropertyType = z.infer<typeof PropertyType>

export const PropertyAttributes = z.object({
  address: z.string(),
  municipality: z.string().optional(),
  province: Province.default('BC'),
  propertyType: PropertyType.optional(),
  yearBuilt: z.number().int().optional(),
  lotSize: z.string().optional(),
  price: z.number().int().optional(),
  pid: z.string().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().optional(),
  waterSource: z.string().optional(),
  sewerType: z.string().optional(),
  isStrata: z.boolean().default(false),
})
export type PropertyAttributes = z.infer<typeof PropertyAttributes>

export const CreatePropertyInput = z.object({
  listingUrl: z.string().url(),
  buyerType: BuyerType,
  isFirstTimeBuyer: z.boolean().default(false),
  buyerGoal: z.string().optional(),
})
export type CreatePropertyInput = z.infer<typeof CreatePropertyInput>

export const Property = z.object({
  id: z.string().uuid(),
  listingUrl: z.string().url().nullable(),
  primaryImagePath: z.string().nullable().optional(),
  address: z.string(),
  municipality: z.string().nullable(),
  province: Province,
  propertyType: PropertyType.nullable(),
  yearBuilt: z.number().int().nullable(),
  lotSize: z.string().nullable(),
  price: z.number().int().nullable(),
  pid: z.string().nullable(),
  waterSource: z.string().nullable(),
  sewerType: z.string().nullable(),
  isStrata: z.boolean(),
  buyerType: BuyerType,
  buyerGoal: z.string().nullable(),
  isFirstTimeBuyer: z.boolean(),
  listingData: z.record(z.unknown()).nullable(),
  zoningData: z.record(z.unknown()).nullable(),
  ocpData: z.record(z.unknown()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Property = z.infer<typeof Property>
