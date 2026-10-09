import type { Execucao, Fonte, ResumoDia } from './tipos'

export class ErroApi extends Error {
  readonly status: number | null

  constructor(mensagem: string, status: number | null = null) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
  }
}

/** GET com tempo limite: API fora do ar não pode deixar o painel "carregando" para sempre. */
export async function buscarJson<T>(url: string, timeoutMs = 10_000): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  } catch (erro) {
    // AbortSignal.timeout rejeita com um erro de nome 'TimeoutError'
    const nome = (erro as { name?: unknown } | null)?.name
    const motivo = nome === 'TimeoutError' ? 'tempo esgotado' : 'falha de rede'
    throw new ErroApi(`Não foi possível acessar ${new URL(url).host} (${motivo})`)
  }
  if (!resposta.ok) {
    throw new ErroApi(`${new URL(url).host} respondeu ${resposta.status}`, resposta.status)
  }
  return (await resposta.json()) as T
}

function montarUrl(
  base: string,
  caminho: string,
  parametros: Record<string, string | undefined> = {},
) {
  const url = new URL(caminho, base.endsWith('/') ? base : `${base}/`)
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== '') url.searchParams.set(chave, valor)
  }
  return url.toString()
}

export interface FonteDeDados {
  fontes(): Promise<Fonte[]>
  execucoes(fonte?: string): Promise<Execucao[]>
  resumoVendas(dia: string): Promise<ResumoDia>
}

export function criarClienteHttp(coletorUrl: string, vendasUrl: string): FonteDeDados {
  return {
    fontes: () => buscarJson<Fonte[]>(montarUrl(coletorUrl, 'fontes')),
    execucoes: (fonte) =>
      buscarJson<Execucao[]>(montarUrl(coletorUrl, 'execucoes', { fonte, limite: '20' })),
    resumoVendas: (dia) => buscarJson<ResumoDia>(montarUrl(vendasUrl, 'vendas/resumo', { dia })),
  }
}
