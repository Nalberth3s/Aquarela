import { ApiError } from '../api/errors'
import { apiConfig } from '../config'

/** Simula uma chamada de rede: aguarda e devolve uma cópia dos dados. */
export function respond<T>(data: T, latency = apiConfig.mockLatency): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), latency)
  })
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** Acesso seguro ao localStorage (pode estar indisponível em modo privado). */
export const safeStorage = {
  read<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },
  write(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* armazenamento indisponível: a demo segue apenas em memória */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* noop */
    }
  },
}

/** Recursos de gestão existem só com o servidor (docker compose up). */
export function notInDemo(): Promise<never> {
  return Promise.reject(new ApiError('Disponível apenas com o servidor ligado (docker compose up).', 501, 'NOT_AVAILABLE'))
}
