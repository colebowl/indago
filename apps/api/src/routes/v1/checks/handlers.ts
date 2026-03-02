import type { FastifyRequest, FastifyReply } from 'fastify'
import { findPropertyById } from '../../../db/queries/property.queries'
import {
  findChecksByPropertyId,
  findCheckByPropertyAndCheckId,
} from '../../../db/queries/check.queries'
import { updateCheckStatus } from '../../../db/mutations/check.mutations'
import { getLLMProvider } from '../../../providers/llm/index'
import { synthesizeReportAnswersForProperty } from '../../../services/report.service'
import { registry } from '../../../checks/registry'
import { CheckExecutor } from '../../../checks/executor'
import type { PropertyRecord } from '../../../checks/types'
import { UpdateCheckStatusBody, toCheckResultResponse } from './schema'

function toPropertyRecord(row: Awaited<ReturnType<typeof findPropertyById>>): PropertyRecord {
  if (!row) throw new Error('Property not found')
  return {
    id: row.id,
    listingUrl: row.listingUrl,
    address: row.address,
    municipality: row.municipality,
    province: row.province,
    propertyType: row.propertyType,
    yearBuilt: row.yearBuilt,
    lotSize: row.lotSize,
    price: row.price,
    pid: row.pid,
    waterSource: row.waterSource,
    sewerType: row.sewerType,
    isStrata: row.isStrata,
    buyerType: row.buyerType,
    buyerGoal: row.buyerGoal,
    isFirstTimeBuyer: row.isFirstTimeBuyer,
    listingData: row.listingData,
    zoningData: row.zoningData,
    ocpData: row.ocpData,
  }
}

export async function handleListChecks(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params
  const property = await findPropertyById(id)
  if (!property) {
    return reply.status(404).send({ error: 'Property not found' })
  }

  const checks = await findChecksByPropertyId(id)
  return reply.send(checks.map(toCheckResultResponse))
}

export async function handleExecuteCheck(
  request: FastifyRequest<{ Params: { id: string; checkId: string } }>,
  reply: FastifyReply,
) {
  const { id: propertyId, checkId } = request.params

  const property = await findPropertyById(propertyId)
  if (!property) {
    return reply.status(404).send({ error: 'Property not found' })
  }

  const module = registry.getCheck(checkId)
  if (!module) {
    return reply.status(404).send({ error: `Check "${checkId}" not found` })
  }

  try {
    const llm = getLLMProvider()
    const executor = new CheckExecutor(llm, registry)
    const propertyRecord = toPropertyRecord(property)
    await executor.executeCheck(checkId, propertyRecord)

    synthesizeReportAnswersForProperty(propertyId, llm).catch((err) => {
      request.log.warn({ err, propertyId }, 'Report answer synthesis failed')
    })

    const row = await findCheckByPropertyAndCheckId(propertyId, checkId)
    if (row) {
      return reply.status(200).send(toCheckResultResponse(row))
    }

    return reply.status(200).send({
      propertyId,
      checkId,
      status: 'in_progress',
      message: 'Check execution started',
    })
  } catch (err) {
    request.log.error(err)
    if (err instanceof Error && err.message.includes('not found')) {
      return reply.status(404).send({ error: err.message })
    }
    throw err
  }
}

export async function handleUpdateCheckStatus(
  request: FastifyRequest<{
    Params: { id: string; checkId: string }
    Body: { status?: string }
  }>,
  reply: FastifyReply,
) {
  const { id: propertyId, checkId } = request.params
  const body = UpdateCheckStatusBody.safeParse(request.body)

  if (!body.success) {
    return reply.status(400).send({
      error: 'Validation Error',
      details: body.error.flatten().fieldErrors,
    })
  }

  const property = await findPropertyById(propertyId)
  if (!property) {
    return reply.status(404).send({ error: 'Property not found' })
  }

  const row = await findCheckByPropertyAndCheckId(propertyId, checkId)
  if (!row) {
    return reply.status(404).send({ error: `Check result for "${checkId}" not found` })
  }

  const updated = await updateCheckStatus(propertyId, checkId, body.data.status)
  if (!updated) {
    return reply.status(404).send({ error: 'Failed to update check status' })
  }

  return reply.send(toCheckResultResponse(updated))
}
