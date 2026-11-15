import { useEffect } from 'react'

const BASE = 'Aquarela do Saber'
const DEFAULT_TITLE = `${BASE} · Educação Infantil em Senador Canedo`
const DEFAULT_DESCRIPTION =
  'Centro Educacional Aquarela do Saber — Educação Infantil em Senador Canedo - GO. Berçário, Maternal e Jardim com acolhimento, afeto e intencionalidade pedagógica.'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Título, descrição e metadados de compartilhamento/busca da página.
 * `noindex` mantém páginas internas (login, área da escola) fora do Google.
 */
export function useDocumentTitle(title?: string, description?: string, options: { noindex?: boolean } = {}) {
  const { noindex = false } = options
  useEffect(() => {
    const fullTitle = title ? `${title} · ${BASE}` : DEFAULT_TITLE
    const desc = description ?? DEFAULT_DESCRIPTION
    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', window.location.origin + window.location.pathname)
    // Área interna, login e primeiro acesso nunca entram na busca.
    const privatePath = /^\/(area|entrar|primeiro-acesso)(\/|$)/.test(window.location.pathname)
    setMeta('name', 'robots', noindex || privatePath ? 'noindex, nofollow' : 'index, follow')
    setCanonical(window.location.origin + window.location.pathname)
  }, [title, description, noindex])
}
