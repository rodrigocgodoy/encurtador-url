import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/client/client.js'

// Este módulo pode ser avaliado antes do environment.ts da API (ordem dos imports ESM),
// então carrega o .env da raiz por conta própria, como o prisma.config.ts
const envPath = resolve(import.meta.dirname, '../../../.env')

if (existsSync(envPath) && !process.env.DATABASE_URL) {
  process.loadEnvFile(envPath)
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não definida')
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({ adapter })

export * from '../generated/client/client.js'
