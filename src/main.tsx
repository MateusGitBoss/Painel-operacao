import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { criarClienteHttp } from './api/cliente'
import { criarClienteDemo } from './api/demo'
import App from './App'
import { lerConfiguracao } from './config'
import { ProvedorDados } from './dados/ProvedorDados'
import './index.css'

const config = lerConfiguracao(import.meta.env)
const fonte = config.modoDemo
  ? criarClienteDemo()
  : criarClienteHttp(config.coletorUrl, config.vendasUrl)

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

const raiz = document.getElementById('root')
if (!raiz) throw new Error('Elemento #root não encontrado no index.html')

createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ProvedorDados
        valor={{
          fonte,
          modoDemo: config.modoDemo,
          intervaloAtualizacaoMs: config.intervaloAtualizacaoMs,
          agora: () => new Date(),
        }}
      >
        <App />
      </ProvedorDados>
    </QueryClientProvider>
  </StrictMode>,
)
