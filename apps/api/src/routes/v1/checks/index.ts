import type { FastifyInstance } from 'fastify'
import {
  handleListChecks,
  handleExecuteCheck,
  handleUpdateCheckStatus,
} from './handlers'

export async function checkRoutes(app: FastifyInstance) {
  app.get('/:id/checks', handleListChecks)
  app.post('/:id/checks/:checkId/execute', handleExecuteCheck)
  app.patch('/:id/checks/:checkId', handleUpdateCheckStatus)
}
