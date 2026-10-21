import { healthResponseSchema } from '@/modules/health/schemas.js'
import { tp } from '@/utils/tp.js'

export const healthRoute = tp(async (app) => {
  app.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        summary: 'Verifica se a API está no ar',
        response: { 200: healthResponseSchema },
      },
    },
    async () => app.services.health.check(),
  )
})
