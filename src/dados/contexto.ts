import { createContext, use } from 'react'

import type { FonteDeDados } from '../api/cliente'

export interface Dados {
  fonte: FonteDeDados
  modoDemo: boolean
  intervaloAtualizacaoMs: number
  agora: () => Date
}

export const DadosContext = createContext<Dados | null>(null)

export function useDados(): Dados {
  const dados = use(DadosContext)
  if (!dados) throw new Error('useDados precisa estar dentro de <ProvedorDados>')
  return dados
}
