import { useEffect, useRef, useState } from 'react'

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/**
 * Rascunho salvo automaticamente no navegador (conveniência local do formulário;
 * não substitui o "Salvar rascunho" do servidor). Retorna o valor inicial
 * recuperado e o momento do último salvamento.
 */
export function useLocalDraft<T>(key: string, value: T, enabled = true) {
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const first = useRef(true)

  useEffect(() => {
    if (!enabled) return
    if (first.current) {
      first.current = false
      return
    }
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
        setSavedAt(new Date())
      } catch {
        /* armazenamento indisponível */
      }
    }, 600)
    return () => window.clearTimeout(id)
  }, [key, value, enabled])

  return {
    savedAt,
    restore: () => read<T>(key),
    clear: () => {
      try {
        window.localStorage.removeItem(key)
      } catch {
        /* noop */
      }
    },
  }
}
