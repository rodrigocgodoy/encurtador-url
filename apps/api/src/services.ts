import { HealthService } from '@/modules/health/service.js'
import { LinksService } from '@/modules/links/service.js'

declare module 'fastify' {
  interface FastifyInstance {
    services: {
      health: HealthService
      links: LinksService
    }
  }
}

export function createServices() {
  return {
    health: new HealthService(),
    links: new LinksService(),
  }
}
