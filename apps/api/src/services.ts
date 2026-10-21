import { HealthService } from '@/modules/health/service.js'

declare module 'fastify' {
  interface FastifyInstance {
    services: {
      health: HealthService
    }
  }
}

export function createServices() {
  return {
    health: new HealthService(),
  }
}
