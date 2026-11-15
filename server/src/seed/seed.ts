import { readFile } from 'node:fs/promises'
import { transaction, queryOne } from '../lib/db.ts'

/**
 * Carga inicial SOMENTE dos textos institucionais do site (dados da escola, segmentos,
 * atividades, rotina, FAQ e galeria de fotos reais). Roda uma única vez, no primeiro boot.
 * Calendário, equipe, turmas, alunos e contas começam vazios: a coordenação cadastra tudo.
 */
export async function seedIfEmpty(log: (msg: string) => void) {
  const already = await queryOne('select 1 from school_settings where id = 1')
  if (already) return

  const content = JSON.parse(await readFile(new URL('./content.json', import.meta.url), 'utf8'))

  await transaction(async (db) => {
    await db.query('insert into school_settings (id, info) values (1, $1)', [content.info])

    for (const key of ['segments', 'activities', 'structure', 'routine', 'pillars', 'values', 'faq', 'media']) {
      await db.query('insert into site_content (key, data) values ($1, $2)', [key, JSON.stringify(content[key])])
    }
  })
  log('conteúdo inicial do site carregado')
}
