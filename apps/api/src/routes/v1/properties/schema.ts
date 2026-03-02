import { z } from 'zod'

export const CreatePropertyBody = z.object({
  listingUrl: z.string().url(),
  buyerType: z.enum([
    'first_time',
    'investor',
    'airbnb',
    'renovation',
    'family',
    'downsizer',
  ]),
  isFirstTimeBuyer: z.boolean().default(false),
  buyerGoal: z.string().optional(),
})
export type CreatePropertyBody = z.infer<typeof CreatePropertyBody>

export const PropertyIdParams = z.object({
  id: z.string().uuid(),
})
export type PropertyIdParams = z.infer<typeof PropertyIdParams>

export const InquiryIdParams = z.object({
  id: z.string().uuid(),
  inquiryId: z.string().uuid(),
})
export type InquiryIdParams = z.infer<typeof InquiryIdParams>

export const CreateInquiryBody = z.object({
  checkResultId: z.string().uuid().optional(),
  recipientName: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientOrg: z.string().optional(),
  subject: z.string(),
  body: z.string(),
  referenceId: z.string(),
})
export type CreateInquiryBody = z.infer<typeof CreateInquiryBody>

export const UpdateInquiryBody = z.object({
  status: z.enum(['drafted', 'sent', 'responded']).optional(),
  responseSummary: z.string().optional(),
})
export type UpdateInquiryBody = z.infer<typeof UpdateInquiryBody>
