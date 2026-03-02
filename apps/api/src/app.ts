import Fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './config/env.js'
import { registerCors } from './plugins/cors.js'
import { registerMultipart } from './plugins/multipart.js'
import { propertyRoutes } from './routes/v1/properties/index.js'

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

  return app
}
