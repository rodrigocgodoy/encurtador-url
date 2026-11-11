import { z } from 'zod'

export const CODE_LENGTH = 6

export const createLinkBodySchema = z.object({
  url: z.url({ protocol: /^https?$/ }).describe('URL de destino (http ou https)'),
})

export const linkCodeParamsSchema = z.object({
  code: z.string().min(1).max(16).describe('Código curto do link'),
})

export const linkResponseSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  url: z.url(),
  title: z.string().nullable(),
  shortUrl: z.url().describe('URL curta pronta para compartilhar'),
  clicks: z.number().int().nonnegative().describe('Total de cliques registrados'),
  createdAt: z.iso.datetime(),
})

export const linkListResponseSchema = z.array(linkResponseSchema)

export type CreateLinkBody = z.infer<typeof createLinkBodySchema>
export type LinkResponse = z.infer<typeof linkResponseSchema>

export type ClickInput = {
  userAgent: string | null
  referer: string | null
}
