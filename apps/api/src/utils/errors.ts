import { z } from 'zod'

// Erros de cliente: o error handler global em plugin.ts lê o statusCode e responde
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Recurso não encontrado') {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message = 'Serviço indisponível') {
    super(503, message)
    this.name = 'ServiceUnavailableError'
  }
}

// Formato que o error handler devolve; usado no `response` das rotas
export const errorResponseSchema = z.object({
  statusCode: z.number().int(),
  error: z.string(),
  message: z.string(),
  issues: z
    .array(z.object({ path: z.string(), message: z.string() }))
    .optional()
    .describe('Presente só em erros de validação (400)'),
})
