import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

// Tipa a rota com o ZodTypeProvider: body, params e response inferidos dos schemas
export function tp(plugin: FastifyPluginAsyncZod): FastifyPluginAsyncZod {
  return plugin
}
