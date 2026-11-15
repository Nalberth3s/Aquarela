import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

export class HttpError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, message: string, code = 'ERROR') {
    super(message)
    this.status = status
    this.code = code
  }
}

export const notFound = (what = 'Registro') => new HttpError(404, `${what} não encontrado.`, 'NOT_FOUND')
export const forbidden = (message = 'Você não tem permissão para esta ação.') => new HttpError(403, message, 'FORBIDDEN')

/** Respostas de erro sempre no formato { message, code }. */
export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, req, reply) => {
    if (err instanceof HttpError) return reply.status(err.status).send({ message: err.message, code: err.code })
    if (err instanceof ZodError) {
      const first = err.issues[0]
      const field = first?.path.join('.')
      return reply
        .status(422)
        .send({ message: first ? `${field ? `${field}: ` : ''}${first.message}` : 'Dados inválidos.', code: 'VALIDATION' })
    }
    const pgCode = (err as { code?: string }).code
    if (pgCode === '23505') return reply.status(409).send({ message: 'Já existe um registro com esses dados.', code: 'CONFLICT' })
    if (pgCode === '22P02') return reply.status(404).send({ message: 'Registro não encontrado.', code: 'NOT_FOUND' })
    const status = (err as { statusCode?: number }).statusCode
    if (status && status < 500) return reply.status(status).send({ message: (err as Error).message, code: 'REQUEST' })
    req.log.error(err)
    return reply.status(500).send({ message: 'Erro interno. Tente novamente.', code: 'INTERNAL' })
  })
}
