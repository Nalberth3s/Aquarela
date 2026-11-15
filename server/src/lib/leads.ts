import type pg from 'pg'

/** Só dígitos, sem o DDI 55 — "(62) 99535-8008" e "+55 62 995358008" viram "62995358008". */
export function phoneDigits(phone?: string | null): string {
  const d = (phone ?? '').replace(/\D/g, '')
  return /^55\d{10,11}$/.test(d) ? d.slice(2) : d
}

/**
 * Encontra o interessado pelo e-mail ou telefone (ou cria um novo) e atualiza
 * o último contato. Quem estava arquivado e voltou a escrever reaparece como "novo".
 */
export async function upsertLead(
  db: pg.PoolClient,
  input: { name: string; email?: string | null; phone?: string | null; source: 'contato' | 'pre_matricula' },
): Promise<string> {
  const digits = phoneDigits(input.phone)
  const email = input.email?.trim().toLowerCase() || null
  const { rows } = await db.query<{ id: string }>(
    `select id from leads
      where ($1::text is not null and lower(email) = $1) or ($2 <> '' and phone_digits = $2)
      order by last_contact_at desc limit 1`,
    [email, digits],
  )
  if (rows[0]) {
    await db.query(
      `update leads set name = $2, email = coalesce(email, $3), phone = coalesce(phone, nullif($4, '')),
         phone_digits = case when phone_digits = '' then $5 else phone_digits end, last_contact_at = now(),
         status = case when status = 'arquivado' then 'novo' else status end
       where id = $1`,
      [rows[0].id, input.name.trim(), email, input.phone ?? '', digits],
    )
    return rows[0].id
  }
  const created = await db.query<{ id: string }>(
    `insert into leads (name, email, phone, phone_digits, first_source) values ($1, $2, $3, $4, $5) returning id`,
    [input.name.trim(), email, input.phone || null, digits, input.source],
  )
  return created.rows[0].id
}
