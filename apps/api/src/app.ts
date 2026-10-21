import swagger from '@fastify/swagger'
import scalar from '@scalar/fastify-api-reference'
import Fastify, { type FastifyServerOptions } from 'fastify'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import { plugin } from '@/plugin.js'
import { env } from '@/utils/environment.js'

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options)

  // Na raiz para que app.swagger() fique disponível fora do plugin (script de openapi)
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Encurtador API',
        description: 'API de um encurtador de URL com analytics',
        version: '1.0.0',
      },
      tags: [{ name: 'health', description: 'Saúde da API' }],
    },
    transform: jsonSchemaTransform,
  })

  if (env.NODE_ENV === 'development') {
    await app.register(scalar, { routePrefix: '/reference' })
  }

  await app.register(plugin)

  return app
}
