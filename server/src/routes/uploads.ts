import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { FastifyInstance } from 'fastify'
import { config } from '../config.ts'
import { requireStaff } from '../lib/auth.ts'
import { HttpError } from '../lib/errors.ts'

const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
  ['video/mp4', '.mp4'],
])

/** Upload de fotos (diário, eventos, equipe). Devolve a URL pública do arquivo. */
export async function uploadRoutes(app: FastifyInstance) {
  app.post('/uploads', async (req) => {
    await requireStaff(req)
    const file = await req.file()
    if (!file) throw new HttpError(422, 'Nenhum arquivo enviado.')
    const ext = ALLOWED.get(file.mimetype)
    if (!ext) throw new HttpError(422, 'Formato não permitido. Envie JPG, PNG, WEBP ou MP4.', 'INVALID_FILE')

    const month = new Date().toISOString().slice(0, 7)
    const dir = path.join(config.uploadsDir, month)
    await mkdir(dir, { recursive: true })
    const name = `${randomUUID()}${ext}`
    await pipeline(file.file, createWriteStream(path.join(dir, name)))
    if (file.file.truncated) throw new HttpError(413, 'Arquivo muito grande (máx. 20 MB).', 'TOO_LARGE')

    return { url: `${config.publicUrl}/uploads/${month}/${name}` }
  })
}
