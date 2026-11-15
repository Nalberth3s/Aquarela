import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { seoFiles } from './seo.plugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env }
  // Endereço público do site (usado no Google/compartilhamento). Troque ao publicar.
  const siteUrl = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')
  process.env.VITE_SITE_URL = siteUrl

  return {
    plugins: [react(), tailwindcss(), seoFiles(siteUrl)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      watch: {
        // Material bruto (referência do Stitch, fotos/vídeos originais) não é código:
        // não vigiar evita travar o servidor enquanto arquivos grandes são copiados.
        ignored: ['**/docs/**', '**/fotos e videos/**', '**/server/**'],
        // No Docker (Windows), arquivos montados só avisam mudanças por polling.
        usePolling: env.VITE_POLLING === 'true',
      },
    },
  }
})
