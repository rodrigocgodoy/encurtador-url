import { z } from 'zod'
import {
  createLinkBodySchema,
  linkCodeParamsSchema,
  linkListResponseSchema,
  linkResponseSchema,
} from '@/modules/links/schemas.js'
import { errorResponseSchema } from '@/utils/errors.js'
import { tp } from '@/utils/tp.js'

export const linksRoute = tp(async (app) => {
  app.post(
    '/links',
    {
      schema: {
        tags: ['links'],
        summary: 'Encurta uma URL',
        body: createLinkBodySchema,
        response: { 201: linkResponseSchema, 400: errorResponseSchema },
      },
    },
    async (request, reply) => {
      const link = await app.services.links.create(request.body)
      return reply.status(201).send(link)
    },
  )

  app.get(
    '/links',
    {
      schema: {
        tags: ['links'],
        summary: 'Lista os links, do mais recente para o mais antigo',
        response: { 200: linkListResponseSchema },
      },
    },
    async () => app.services.links.list(),
  )

  app.get(
    '/links/:code',
    {
      schema: {
        tags: ['links'],
        summary: 'Detalha um link pelo código',
        params: linkCodeParamsSchema,
        response: { 200: linkResponseSchema, 404: errorResponseSchema },
      },
    },
    async (request) => app.services.links.findByCode(request.params.code),
  )

  app.get(
    '/r/:code',
    {
      schema: {
        hide: true,
        tags: ['links'],
        summary: 'Redireciona para a URL de destino e registra o clique',
        params: linkCodeParamsSchema,
        response: { 302: z.null(), 404: errorResponseSchema },
      },
    },
    async (request, reply) => {
      const url = await app.services.links.resolve(request.params.code, {
        userAgent: request.headers['user-agent'] ?? null,
        referer: request.headers.referer ?? null,
      })
      return reply.redirect(url, 302)
    },
  )
})
