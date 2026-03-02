import type { FastifyRequest, FastifyReply } from 'fastify'
import { createReadStream, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import {
  createProperty,
  getProperty,
  listProperties,
  removeProperty,
  runAllChecks,
} from '../../../services/property.service'
import {
  generateReport,
  getPTT,
} from '../../../services/report.service'
import { insertInquiry, updateInquiry } from '../../../db/mutations/check.mutations'
import { findPropertyById } from '../../../db/queries/property.queries'
import { insertUploadedDocument } from '../../../db/mutations/document.mutations'
import {
  CreatePropertyBody,
  PropertyIdParams,
  InquiryIdParams,
  CreateInquiryBody,
  UpdateInquiryBody,
} from './schema'

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

export async function handleGetPropertyImage(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = PropertyIdParams.parse(request.params)
  const property = await findPropertyById(id)

  if (!property?.primaryImagePath) {
    return reply.status(404).send({ error: 'Property image not found' })
  }

  const absolutePath = property.primaryImagePath.startsWith('/')
    ? property.primaryImagePath
    : join(process.cwd(), property.primaryImagePath)

  if (!existsSync(absolutePath)) {
    return reply.status(404).send({ error: 'Image file not found' })
  }

  const ext = absolutePath.split('.').pop()?.toLowerCase()
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg'
  return reply
    .header('Content-Type', contentType)
    .header('Cache-Control', 'public, max-age=86400')
    .send(createReadStream(absolutePath))
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
  const report = await generateReport(id)

  if (!report) {
    return reply.status(404).send({ error: 'Property not found' })
  }

  return reply.send(report)
}

export async function handleGetPTT(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = PropertyIdParams.parse(request.params)
  const result = await getPTT(id)

  if (!result) {
    return reply.status(404).send({ error: 'Property not found' })
  }

  return reply.send(result)
}

export async function handleUploadDocument(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = PropertyIdParams.parse(request.params)

  const property = await findPropertyById(id)
  if (!property) {
    return reply.status(404).send({ error: 'Property not found' })
  }

  const data = await request.file()
  if (!data) {
    return reply.status(400).send({
      error: 'No file uploaded',
      message: 'Send a multipart form with a file field',
    })
  }

  const ext = data.filename.split('.').pop()?.toLowerCase() || 'pdf'
  const storedName = `${randomUUID()}.${ext}`
  const uploadDir = join(process.cwd(), 'uploads', id)
  const filePath = join(uploadDir, storedName)
  const relativePath = join('uploads', id, storedName)

  await mkdir(uploadDir, { recursive: true })
  await pipeline(data.file, createWriteStream(filePath))

  const doc = await insertUploadedDocument({
    propertyId: id,
    fileName: data.filename,
    fileType: data.mimetype,
    filePath: relativePath,
  })

  return reply.status(201).send(doc)
}
