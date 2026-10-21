import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/client/client.js'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não definida')
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({ adapter })

export * from '../generated/client/client.js'
