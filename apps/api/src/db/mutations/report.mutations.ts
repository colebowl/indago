import { db } from '../../providers/db/index'
import { reportSectionAnswers } from '../../providers/db/schema'

export async function upsertReportSectionAnswer(
  propertyId: string,
  questionId: string,
  aiAnswer: string,
) {
  await db
    .insert(reportSectionAnswers)
    .values({
      propertyId,
      questionId,
      aiAnswer,
      synthesizedAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [reportSectionAnswers.propertyId, reportSectionAnswers.questionId],
      set: {
        aiAnswer,
        synthesizedAt: new Date(),
        updatedAt: new Date(),
      },
    })
}
