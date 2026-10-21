import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { buildApp } from '@/app.js'

const outputPath = resolve(import.meta.dirname, '../../openapi.yaml')

// Sobe o app em memória (sem listen) só para coletar os schemas das rotas
const app = await buildApp({ logger: { level: 'info' } })
await app.ready()

await writeFile(outputPath, app.swagger({ yaml: true }))
app.log.info({ outputPath }, 'openapi.yaml gerado')

await app.close()
