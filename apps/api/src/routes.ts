import type { FastifyInstance } from 'fastify'
import { healthRoute } from '@/modules/health/route.js'

export async function routes(app: FastifyInstance) {
  await app.register(healthRoute)
}
