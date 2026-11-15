import type { Plugin } from 'vite'

/** Páginas públicas que o Google deve indexar. */
const PUBLIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/sobre', priority: '0.8', changefreq: 'monthly' },
  { path: '/proposta-pedagogica', priority: '0.8', changefreq: 'monthly' },
  { path: '/atividades', priority: '0.7', changefreq: 'monthly' },
  { path: '/estrutura', priority: '0.7', changefreq: 'monthly' },
  { path: '/galeria', priority: '0.6', changefreq: 'weekly' },
  { path: '/calendario', priority: '0.7', changefreq: 'weekly' },
  { path: '/matriculas', priority: '0.9', changefreq: 'monthly' },
  { path: '/contato', priority: '0.8', changefreq: 'yearly' },
]

function sitemap(siteUrl: string) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = PUBLIC_ROUTES.map(
    (r) =>
      `  <url><loc>${siteUrl}${r.path}</loc><lastmod>${today}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`,
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function robots(siteUrl: string) {
  return [
    'User-agent: *',
    'Allow: /',
    '# Área interna e login não aparecem na busca',
    'Disallow: /area',
    'Disallow: /entrar',
    'Disallow: /primeiro-acesso',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
}

/**
 * Gera /sitemap.xml e /robots.txt com o endereço do site (VITE_SITE_URL):
 * servidos no desenvolvimento e gravados no build.
 */
export function seoFiles(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, '')
  return {
    name: 'aquarela-seo-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8')
          return res.end(sitemap(base))
        }
        if (req.url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          return res.end(robots(base))
        }
        next()
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(base) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots(base) })
    },
  }
}
