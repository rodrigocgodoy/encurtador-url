import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'

const envPath = resolve(import.meta.dirname, '../../../../.env')

if (existsSync(envPath)) {
  process.loadEnvFile(envPath)
}

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3333),
  // Base usada para montar o shortUrl (sem barra no final)
  PUBLIC_URL: z
    .url()
    .default('http://localhost:3333')
    .transform((value) => value.replace(/\/+$/, '')),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.url(),
  CORS_ORIGIN: z
    .string()
    .default('*')
    .transform((value) => (value === '*' ? true : value.split(',').map((origin) => origin.trim()))),
  // Opcional: sem ela, as rotas de IA respondem 503. Vazio no .env conta como ausente
  ANTHROPIC_API_KEY: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
})

const parsed = environmentSchema.safeParse(process.env)

if (!parsed.success) {
  throw new Error(`Variáveis de ambiente inválidas:\n${z.prettifyError(parsed.error)}`)
}

export const env = parsed.data
