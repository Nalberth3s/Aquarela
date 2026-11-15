import path from 'node:path'

export const config = {
  port: Number(process.env.PORT ?? 3333),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://aquarela:aquarela@localhost:5432/aquarela',
  jwtSecret: process.env.JWT_SECRET ?? 'troque-este-segredo-em-producao',
  /** URL pública da API, usada para montar o endereço dos arquivos enviados. */
  publicUrl: (process.env.PUBLIC_URL ?? 'http://localhost:3333').replace(/\/$/, ''),
  uploadsDir: path.resolve(process.env.UPLOADS_DIR ?? 'uploads'),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
  /** Tamanho máximo de upload (bytes). */
  maxUploadBytes: 20 * 1024 * 1024,
  /**
   * Acesso de desenvolvedor (aba "Banco" da coordenação). Só existe quando as duas
   * variáveis estão definidas; a senha fica guardada apenas como hash bcrypt.
   */
  dev: {
    email: (process.env.DEV_EMAIL ?? '').trim().toLowerCase(),
    passwordHash: process.env.DEV_PASSWORD_HASH ?? '',
  },
}
