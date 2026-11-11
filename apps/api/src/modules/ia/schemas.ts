import { z } from 'zod'

export const TITLE_MAX_LENGTH = 120

export const generateTitleResponseSchema = z.object({
  code: z.string().describe('Código curto do link'),
  title: z.string().describe('Título sugerido pela IA e salvo no link'),
})

export type GenerateTitleResponse = z.infer<typeof generateTitleResponseSchema>
