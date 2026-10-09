import { useQuery } from '@tanstack/react-query'

import { useDados } from './contexto'

// TanStack Query cuida de cache, estado de carregamento/erro, nova tentativa e atualização
// periódica. Sem ele, cada componente teria seu próprio useEffect + useState para isso.

export function useFontes() {
  const { fonte, intervaloAtualizacaoMs } = useDados()
  return useQuery({
    queryKey: ['fontes'],
    queryFn: () => fonte.fontes(),
    refetchInterval: intervaloAtualizacaoMs,
  })
}

export function useExecucoes(nomeFonte?: string) {
  const { fonte, intervaloAtualizacaoMs } = useDados()
  return useQuery({
    queryKey: ['execucoes', nomeFonte ?? 'todas'],
    queryFn: () => fonte.execucoes(nomeFonte),
    refetchInterval: intervaloAtualizacaoMs,
  })
}

export function useResumoVendas(dia: string) {
  const { fonte, intervaloAtualizacaoMs } = useDados()
  return useQuery({
    queryKey: ['resumo-vendas', dia],
    queryFn: () => fonte.resumoVendas(dia),
    refetchInterval: intervaloAtualizacaoMs,
  })
}
