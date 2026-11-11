import { generateTitleResponseSchema } from '@/modules/ia/schemas.js'
import { linkCodeParamsSchema } from '@/modules/links/schemas.js'
import { errorResponseSchema } from '@/utils/errors.js'
import { tp } from '@/utils/tp.js'

export const iaRoute = tp(async (app) => {
  app.post(
    '/links/:code/titulo',
    {
      schema: {
        tags: ['ia'],
        summary: 'Gera com IA um título curto para o link e salva no campo title',
        params: linkCodeParamsSchema,
        response: {
          200: generateTitleResponseSchema,
          404: errorResponseSchema,
          503: errorResponseSchema,
        },
      },
    },
    async (request) => app.services.ia.generateLinkTitle(request.params.code),
  )
})
