import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/services'

interface AsyncState<T> {
  data: T | undefined
  loading: boolean
  error: string | null
}

/**
 * Executa uma função assíncrona (normalmente um método de service) e
 * expõe dados, carregamento e erro. Reexecuta quando `deps` mudam.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: null })
  const fnRef = useRef(fn)
  fnRef.current = fn
  const requestId = useRef(0)

  const run = useCallback(async () => {
    const id = ++requestId.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fnRef.current()
      if (id === requestId.current) setState({ data, loading: false, error: null })
    } catch (err) {
      if (id === requestId.current) setState({ data: undefined, loading: false, error: getErrorMessage(err) })
    }
  }, [])

  useEffect(() => {
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { ...state, reload: run, setData: (data: T) => setState((s) => ({ ...s, data })) }
}
