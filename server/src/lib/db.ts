import pg from 'pg'
import { config } from '../config.ts'

// Datas (date) chegam como texto YYYY-MM-DD, sem conversão de fuso.
pg.types.setTypeParser(1082, (v) => v)

export const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10 })

type Params = unknown[]

export async function query<T = Record<string, unknown>>(sql: string, params: Params = []): Promise<T[]> {
  const result = await pool.query(sql, params)
  return result.rows as T[]
}

export async function queryOne<T = Record<string, unknown>>(sql: string, params: Params = []): Promise<T | undefined> {
  return (await query<T>(sql, params))[0]
}

/** Executa várias operações numa transação. */
export async function transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('begin')
    const result = await fn(client)
    await client.query('commit')
    return result
  } catch (err) {
    await client.query('rollback')
    throw err
  } finally {
    client.release()
  }
}
