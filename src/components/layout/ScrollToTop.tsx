import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Volta ao topo a cada troca de rota (exceto quando há âncora). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}
