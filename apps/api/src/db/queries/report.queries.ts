import { eq } from 'drizzle-orm'
import { db } from '../../providers/db/index'
import { reportSectionAnswers } from '../../providers/db/schema'

export async function findReportSectionAnswersByPropertyId(propertyId: string) {
  return db
    .select()
    .from(reportSectionAnswers)
    .where(eq(reportSectionAnswers.propertyId, propertyId))
}
