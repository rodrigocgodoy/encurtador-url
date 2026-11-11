import type { FastifyInstance } from 'fastify'
import { healthRoute } from '@/modules/health/route.js'
import { linksRoute } from '@/modules/links/route.js'

export async function routes(app: FastifyInstance) {
  await app.register(healthRoute)
  await app.register(linksRoute)
}
