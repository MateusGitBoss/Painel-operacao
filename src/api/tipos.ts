// Formatos devolvidos pelas APIs do coletor-diario e do webhook-vendas.
// Datas chegam como texto ISO 8601; a conversão para Date acontece só na hora de exibir.

export type StatusExecucao = 'em_andamento' | 'sucesso' | 'parcial' | 'falha'

/** GET /fontes do coletor-diario: cada site monitorado com sua última execução. */
export interface Fonte {
  nome: string
  url_base: string
  ativa: boolean
  ultima_execucao_id: string | null
  ultimo_status: StatusExecucao | null
  ultima_execucao_em: string | null
  ultimos_itens: number | null
  total_itens: number
}

/** GET /execucoes do coletor-diario. */
export interface Execucao {
  id: string
  fonte: string
  iniciada_em: string
  finalizada_em: string | null
  status: StatusExecucao
  itens_coletados: number
  itens_invalidos: number
  mensagem_erro: string | null
  duracao_segundos: number | null
}

export interface VendaPorHora {
  hora: number
  quantidade: number
  valor_centavos: number
}

export interface VendaPorProduto {
  produto: string
  quantidade: number
  valor_centavos: number
}

/** GET /vendas/resumo do webhook-vendas: só números agregados, sem dado de cliente. */
export interface ResumoDia {
  dia: string
  vendas_aprovadas: number
  faturamento_centavos: number
  reembolsos: number
  chargebacks: number
  ticket_medio_centavos: number
  por_hora: VendaPorHora[]
  por_produto: VendaPorProduto[]
}
