// Configuração lida no build pelo Vite (variáveis que começam com VITE_).
// Atenção: tudo aqui vai parar no JavaScript público. Nunca coloque token ou senha.

export interface Configuracao {
  modoDemo: boolean
  coletorUrl: string
  vendasUrl: string
  intervaloAtualizacaoMs: number
}

export function lerConfiguracao(env: Record<string, string | boolean | undefined>): Configuracao {
  const coletorUrl = String(env.VITE_COLETOR_API_URL ?? '').trim()
  const vendasUrl = String(env.VITE_VENDAS_API_URL ?? '').trim()
  // Sem as duas URLs não há de onde buscar: o painel usa os dados de demonstração
  const modoDemo = env.VITE_MODO_DEMO === 'true' || !coletorUrl || !vendasUrl
  return { modoDemo, coletorUrl, vendasUrl, intervaloAtualizacaoMs: 60_000 }
}
