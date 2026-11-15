import { apiConfig } from '../config'
import { ApiError } from './errors'

/**
 * Cliente HTTP da API (server/). Guarda o token JWT no navegador e o envia
 * em todas as chamadas. Respostas de erro da API vêm como { message, code }.
 */
const TOKEN_KEY = 'aquarela.token'

export const tokenStore = {
  get(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string | null) {
    try {
      if (token) window.localStorage.setItem(TOKEN_KEY, token)
      else window.localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* armazenamento indisponível */
    }
  },
}

/** Disparado quando a API recusa o token (sessão expirada). */
export const UNAUTHORIZED_EVENT = 'aquarela:unauthorized'

async function request<T>(method: string, path: string, body?: unknown, isForm = false): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${apiConfig.baseUrl}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se o sistema está rodando.', 0, 'NETWORK')
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    if (response.status === 401 && token) {
      tokenStore.set(null)
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(payload.message ?? 'Algo deu errado. Tente novamente.', response.status, payload.code)
  }
  // Respostas sem corpo (204, 201 vazio…) não são JSON.
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/** Monta a query string ignorando valores vazios. */
export function qs(params: Record<string, string | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) search.set(k, v)
  const s = search.toString()
  return s ? `?${s}` : ''
}

export const httpClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body ?? {}),
  delete: <T>(path: string) => request<T>('DELETE', path),
  /** Envia um arquivo para /api/uploads e devolve a URL pública. */
  async upload(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const { url } = await request<{ url: string }>('POST', '/uploads', form, true)
    return url
  },
}
