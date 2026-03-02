import Fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './config/env'
import { registerCors } from './plugins/cors'
import { registerMultipart } from './plugins/multipart'
import { registerAllChecks } from './checks/register'
import { propertyRoutes } from './routes/v1/properties/index'
import { checkRoutes } from './routes/v1/checks/index'

registerAllChecks()

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // Allow empty body when Content-Type is application/json (e.g. n8n POST with no body)
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    if (body === '' || body === undefined) {
      return done(null, {})
    }
    try {
      const json = JSON.parse(body as string)
      done(null, json)
    } catch (err) {
      done(err as Error, undefined)
    }
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: error.flatten().fieldErrors,
      })
    }

    app.log.error(error)
    return reply.status(500).send({ error: 'Internal Server Error' })
  })

  await registerCors(app)
  await registerMultipart(app)

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  await app.register(propertyRoutes, { prefix: '/v1/properties' })
  await app.register(checkRoutes, { prefix: '/v1/properties' })

  return app
}
