import type { ReactNode } from 'react'

import { DadosContext, type Dados } from './contexto'

// A fonte de dados (API real ou demonstração) é injetada aqui. Os componentes não sabem
// de onde vêm os dados, e os testes passam uma fonte falsa sem precisar de servidor.
export function ProvedorDados({ valor, children }: { valor: Dados; children: ReactNode }) {
  return <DadosContext value={valor}>{children}</DadosContext>
}
