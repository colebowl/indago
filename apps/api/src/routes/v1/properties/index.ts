import type { FastifyInstance } from 'fastify'
import {
  handleCreateProperty,
  handleListProperties,
  handleGetProperty,
  handleGetPropertyImage,
  handleDeleteProperty,
  handleRunAllChecks,
  handleCreateInquiry,
  handleUpdateInquiry,
  handleGetReport,
  handleGetPTT,
  handleUploadDocument,
} from './handlers'

export async function propertyRoutes(app: FastifyInstance) {
  app.post('/', handleCreateProperty)
  app.get('/', handleListProperties)
  app.get('/:id/image', handleGetPropertyImage)
  app.get('/:id', handleGetProperty)
  app.delete('/:id', handleDeleteProperty)

  app.post('/:id/run-all-checks', handleRunAllChecks)
  app.post('/:id/upload', handleUploadDocument)
  app.get('/:id/report', handleGetReport)
  app.get('/:id/ptt', handleGetPTT)

  app.post('/:id/inquiries', handleCreateInquiry)
  app.patch('/:id/inquiries/:inquiryId', handleUpdateInquiry)
}
