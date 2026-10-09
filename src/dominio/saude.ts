import type { Fonte } from '../api/tipos'

export type Saude = 'ok' | 'atencao' | 'falha' | 'atrasada' | 'sem-dados' | 'inativa'

// A coleta roda uma vez por dia. Mais de 26h sem execução = o agendamento não rodou.
export const LIMITE_ATRASO_HORAS = 26

export function avaliarSaude(fonte: Fonte, agora: Date): Saude {
  if (!fonte.ativa) return 'inativa'
  if (!fonte.ultimo_status || !fonte.ultima_execucao_em) return 'sem-dados'

  const horas = (agora.getTime() - new Date(fonte.ultima_execucao_em).getTime()) / 3_600_000
  // Atraso vem antes do status: um "sucesso" de 3 dias atrás esconde um robô parado
  if (horas > LIMITE_ATRASO_HORAS) return 'atrasada'

  switch (fonte.ultimo_status) {
    case 'falha':
      return 'falha'
    case 'parcial':
      return 'atencao'
    default:
      return 'ok'
  }
}

export const ROTULO_SAUDE: Record<Saude, string> = {
  ok: 'OK',
  atencao: 'Atenção',
  falha: 'Falhou',
  atrasada: 'Atrasada',
  'sem-dados': 'Sem execuções',
  inativa: 'Desligada',
}

const GRAVIDADE: Record<Saude, number> = {
  falha: 0,
  atrasada: 1,
  atencao: 2,
  'sem-dados': 3,
  ok: 4,
  inativa: 5,
}

/** Problemas primeiro: quem abre o painel quer ver o que precisa de ação. */
export function ordenarPorGravidade(fontes: Fonte[], agora: Date): Fonte[] {
  return [...fontes].sort(
    (a, b) =>
      GRAVIDADE[avaliarSaude(a, agora)] - GRAVIDADE[avaliarSaude(b, agora)] ||
      a.nome.localeCompare(b.nome),
  )
}
