import { z } from 'zod'
import { BuyerType } from './property.schema'
import { CheckResult, CheckStatus, Source } from './check.schema'

export const ForYouInsight = z.object({
  headline: z.string(),
  body: z.string(),
  sources: z.array(Source),
  relatedCheckIds: z.array(z.string()),
})
export type ForYouInsight = z.infer<typeof ForYouInsight>

export const ReportSection = z.object({
  questionId: z.string(),
  question: z.string(),
  status: CheckStatus,
  aiAnswer: z.string().nullable(),
  sources: z.array(Source),
  checks: z.array(CheckResult),
})
export type ReportSection = z.infer<typeof ReportSection>

export const ReportSummary = z.object({
  propertyId: z.string().uuid(),
  buyerType: BuyerType,
  completionPercent: z.number().min(0).max(100),
  totalChecks: z.number().int(),
  completedChecks: z.number().int(),
  forYou: z.array(ForYouInsight),
  sections: z.array(ReportSection),
  generatedAt: z.string(),
})
export type ReportSummary = z.infer<typeof ReportSummary>
