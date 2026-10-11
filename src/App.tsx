import { useState } from 'react'

import { ExecucoesRecentes } from './componentes/ExecucoesRecentes'
import { SaudeColetores } from './componentes/SaudeColetores'
import { VendasDoDia } from './componentes/VendasDoDia'
import { useDados } from './dados/contexto'

// Demonstrações estáticas dos projetos que alimentam este painel
const DEMOS = [
  { nome: 'Coletor diário', url: 'https://coletor-diario.vercel.app' },
  { nome: 'Webhook de vendas', url: 'https://webhook-vendas-one.vercel.app' },
  { nome: 'Orçamento SINAPI', url: 'https://orcamento-sinapi-puce.vercel.app' },
  { nome: 'Código', url: 'https://github.com/MateusGitBoss/Painel-operacao' },
]

export default function App() {
  const { modoDemo } = useDados()
  const [fonteSelecionada, setFonteSelecionada] = useState<string>()

  return (
    <>
      <header className="topo">
        <h1>Painel de operação</h1>
        {modoDemo && (
          <span
            className="selo selo-sem-dados"
            title="Configure as URLs das APIs para ver dados reais"
          >
            Dados de demonstração
          </span>
        )}
        <nav aria-label="Outras demonstrações" className="demos">
          {DEMOS.map((demo) => (
            <a key={demo.url} href={demo.url} target="_blank" rel="noreferrer">
              {demo.nome}
            </a>
          ))}
        </nav>
      </header>

      <main className="grade">
        <section aria-labelledby="titulo-coletores" className="cartao">
          <h2 id="titulo-coletores">Saúde dos coletores</h2>
          <SaudeColetores selecionada={fonteSelecionada} aoSelecionar={setFonteSelecionada} />
        </section>

        <section aria-labelledby="titulo-vendas" className="cartao">
          <h2 id="titulo-vendas">Vendas do dia</h2>
          <VendasDoDia />
        </section>

        <section aria-labelledby="titulo-execucoes" className="cartao cartao-largo">
          <h2 id="titulo-execucoes">
            Execuções recentes{fonteSelecionada ? `: ${fonteSelecionada}` : ''}
          </h2>
          <ExecucoesRecentes fonte={fonteSelecionada} />
        </section>
      </main>
    </>
  )
}
