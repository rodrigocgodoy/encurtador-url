import type { HealthResponse } from '@/modules/health/schemas.js'

export class HealthService {
  check(): HealthResponse {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  }
}
