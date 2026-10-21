import { buildApp } from '@/app.js'
import { env } from '@/utils/environment.js'

const app = await buildApp({ logger: { level: env.LOG_LEVEL } })

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
