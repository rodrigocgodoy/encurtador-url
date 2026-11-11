import { HealthService } from '@/modules/health/service.js'
import { IaService } from '@/modules/ia/service.js'
import { LinksService } from '@/modules/links/service.js'

declare module 'fastify' {
  interface FastifyInstance {
    services: {
      health: HealthService
      links: LinksService
      ia: IaService
    }
  }
}

export function createServices() {
  return {
    health: new HealthService(),
    links: new LinksService(),
    ia: new IaService(),
  }
}
