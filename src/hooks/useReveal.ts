import { useEffect, useRef } from 'react'

/**
 * Adiciona a classe `is-visible` quando o elemento entra na tela.
 * Use junto com a classe utilitária `.reveal` (index.css).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const show = () => el.classList.add('is-visible')
    const rect = el.getBoundingClientRect()
    // Já visível ao montar (ou sem suporte): revela sem esperar o observer.
    if (!('IntersectionObserver' in window) || rect.top < window.innerHeight) {
      requestAnimationFrame(show)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
