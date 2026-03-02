import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  createProperty,
  getProperty,
  listProperties,
  removeProperty,
  runAllChecks,
} from '../../../services/property.service.js'
import { insertInquiry, updateInquiry } from '../../../db/mutations/check.mutations.js'
import { findInquiriesByPropertyId } from '../../../db/queries/check.queries.js'
import {
  CreatePropertyBody,
  PropertyIdParams,
  InquiryIdParams,
  CreateInquiryBody,
  UpdateInquiryBody,
} from './schema.js'

export async function handleCreateProperty(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = CreatePropertyBody.parse(request.body)
  const property = await createProperty(body)
  return reply.status(201).send(property)
}

export async function handleListProperties(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const properties = await listProperties()
  return reply.send(properties)
}

export async function handleGetProperty(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = PropertyIdParams.parse(request.params)
  const property = await getProperty(id)

  if (!property) {
    return reply.status(404).send({ error: 'Property not found' })
  }

  return reply.send(property)
}

export async function handleDeleteProperty(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = PropertyIdParams.parse(request.params)
  const deleted = await removeProperty(id)

  if (!deleted) {
    return reply.status(404).send({ error: 'Property not found' })
  }

  return reply.status(204).send()
}

export async function handleRunAllChecks(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = PropertyIdParams.parse(request.params)
  const result = await runAllChecks(id)

  if (!result) {
    return reply.status(404).send({ error: 'Property not found' })
  }

  return reply.send(result)
}

export async function handleCreateInquiry(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = PropertyIdParams.parse(request.params)
  const body = CreateInquiryBody.parse(request.body)

  const inquiry = await insertInquiry({
    propertyId: id,
    checkResultId: body.checkResultId ?? null,
    recipientName: body.recipientName ?? null,
    recipientEmail: body.recipientEmail ?? null,
    recipientOrg: body.recipientOrg ?? null,
    subject: body.subject,
    body: body.body,
    referenceId: body.referenceId,
  })

  return reply.status(201).send(inquiry)
}

export async function handleUpdateInquiry(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { inquiryId } = InquiryIdParams.parse(request.params)
  const body = UpdateInquiryBody.parse(request.body)

  const inquiry = await updateInquiry(inquiryId, body)

  if (!inquiry) {
    return reply.status(404).send({ error: 'Inquiry not found' })
  }

  return reply.send(inquiry)
}

export async function handleGetReport(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = PropertyIdParams.parse(request.params)
  // Report service will be implemented in Task 25
  return reply.send({
    propertyId: id,
    message: 'Report generation not yet implemented',
  })
}

export async function handleGetPTT(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = PropertyIdParams.parse(request.params)
  // PTT calculation will be implemented in Task 20
  return reply.send({
    propertyId: id,
    message: 'PTT calculation not yet implemented',
  })
}

export async function handleUploadDocument(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = PropertyIdParams.parse(request.params)
  // Document upload will be implemented in Task 23
  return reply.send({
    propertyId: id,
    message: 'Document upload not yet implemented',
  })
}
