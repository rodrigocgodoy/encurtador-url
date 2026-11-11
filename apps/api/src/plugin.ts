import { STATUS_CODES } from 'node:http'
import cors from '@fastify/cors'
import type { FastifyError, FastifyInstance } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { routes } from '@/routes.js'
import { createServices } from '@/services.js'
import { env } from '@/utils/environment.js'
import { HttpError } from '@/utils/errors.js'

// Erros de cliente (< 500) e HttpError lançados de propósito (ex.: 503) voltam com a mensagem;
// qualquer outro erro vira 500 genérico
function isExposableError(error: unknown): error is FastifyError & { statusCode: number } {
  if (error instanceof HttpError) return true
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    error.statusCode < 500
  )
}

export async function plugin(app: FastifyInstance) {
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.decorate('services', createServices())

  await app.register(cors, { origin: env.CORS_ORIGIN })

  // Único ponto de tratamento de erro: nunca devolve stack para o cliente
  app.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Dados de entrada inválidos',
        issues: error.validation.map((issue) => ({
          path: issue.instancePath,
          message: issue.message,
        })),
      })
    }

    if (isResponseSerializationError(error)) {
      request.log.error({ err: error, issues: error.cause.issues }, 'resposta fora do schema')
    } else if (isExposableError(error)) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: STATUS_CODES[error.statusCode] ?? 'Error',
        message: error.message,
      })
    } else {
      request.log.error({ err: error }, 'erro não tratado')
    }

    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Erro interno do servidor',
    })
  })

  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Rota ${request.method} ${request.url} não encontrada`,
    })
  })

  await app.register(routes)
}
