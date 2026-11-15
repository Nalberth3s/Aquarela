/** Erro padronizado da camada de dados — usado por mocks e pelo cliente HTTP. */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status = 500, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message
  return 'Algo não saiu como esperado. Tente novamente.'
}
