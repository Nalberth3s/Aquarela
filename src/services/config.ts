/**
 * Configuração da camada de dados.
 * Padrão: API real (docker compose). Use VITE_USE_MOCKS=true para o modo demonstração.
 */
export const apiConfig = {
  baseUrl: (import.meta.env.VITE_API_URL ?? 'http://localhost:3333').replace(/\/$/, ''),
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
  /** Latência simulada (ms) dos mocks, para exercitar estados de carregamento. */
  mockLatency: 350,
}
