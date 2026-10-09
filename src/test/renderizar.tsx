import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'

import type { FonteDeDados } from '../api/cliente'
import { ProvedorDados } from '../dados/ProvedorDados'

export const AGORA = new Date('2026-10-09T15:00:00')

export function renderizar(ui: ReactNode, fonte: FonteDeDados, modoDemo = false) {
  // retry: false para o teste de erro não esperar novas tentativas
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ProvedorDados valor={{ fonte, modoDemo, intervaloAtualizacaoMs: 0, agora: () => AGORA }}>
        {ui}
      </ProvedorDados>
    </QueryClientProvider>,
  )
}
