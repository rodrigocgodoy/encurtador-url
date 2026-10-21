import Fastify from 'fastify'
import { plugin } from '@/plugin.js'
import { env } from '@/utils/environment.js'

const app = Fastify({ logger: { level: env.LOG_LEVEL } })

await app.register(plugin)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    app.log.info({ signal }, 'encerrando')
    await app.close()
    process.exit(0)
  })
}

try {
  await app.listen({ host: env.HOST, port: env.PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
