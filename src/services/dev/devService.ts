export interface TableStat {
  name: string
  rows: number
}

/**
 * Acesso de desenvolvedor (aba "Banco" da coordenação). Exige a sessão de coordenação
 * e, além dela, o e-mail e a senha de desenvolvedor configurados no servidor.
 */
export interface DevService {
  /** O servidor tem o acesso de desenvolvedor configurado? */
  status(): Promise<{ enabled: boolean }>
  /** Confere e-mail/senha de dev e devolve um token curto (15 min) + contagem das tabelas. */
  unlock(email: string, password: string): Promise<{ devToken: string; tables: TableStat[] }>
  tables(devToken: string): Promise<{ tables: TableStat[] }>
  /** Apaga todas as tabelas e fotos enviadas; o sistema volta ao primeiro acesso. */
  resetDatabase(devToken: string): Promise<{ ok: true; tables: number }>
}
