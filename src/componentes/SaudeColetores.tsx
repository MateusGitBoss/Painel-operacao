import { useFontes } from '../dados/consultas'
import { useDados } from '../dados/contexto'
import { formatarNumero, tempoAtras } from '../dominio/formatacao'
import { avaliarSaude, ordenarPorGravidade, ROTULO_SAUDE } from '../dominio/saude'
import { Carregando, MensagemErro } from './Estados'

interface Props {
  selecionada: string | undefined
  aoSelecionar: (nome: string | undefined) => void
}

export function SaudeColetores({ selecionada, aoSelecionar }: Props) {
  const { agora } = useDados()
  const { data, error, isPending, refetch } = useFontes()

  if (isPending) return <Carregando texto="Carregando coletores…" />
  if (error) return <MensagemErro erro={error} tentarDeNovo={() => void refetch()} />

  const momento = agora()
  const problemas = data.filter((f) => !['ok', 'inativa'].includes(avaliarSaude(f, momento)))

  return (
    <>
      <p className="resumo-linha">
        {problemas.length === 0
          ? 'Todos os coletores rodaram bem na última execução.'
          : `${problemas.length} de ${data.length} coletores precisam de atenção.`}
      </p>
      <table>
        <thead>
          <tr>
            <th>Fonte</th>
            <th>Situação</th>
            <th>Última execução</th>
            <th className="num">Itens na última</th>
            <th className="num">Itens no banco</th>
          </tr>
        </thead>
        <tbody>
          {ordenarPorGravidade(data, momento).map((f) => {
            const saude = avaliarSaude(f, momento)
            const ativa = selecionada === f.nome
            return (
              <tr key={f.nome} className={ativa ? 'selecionada' : undefined}>
                <td>
                  <button
                    type="button"
                    className="link"
                    aria-pressed={ativa}
                    onClick={() => aoSelecionar(ativa ? undefined : f.nome)}
                  >
                    {f.nome}
                  </button>
                </td>
                <td>
                  <span className={`selo selo-${saude}`}>{ROTULO_SAUDE[saude]}</span>
                </td>
                <td>{f.ultima_execucao_em ? tempoAtras(f.ultima_execucao_em, momento) : '—'}</td>
                <td className="num">
                  {f.ultimos_itens === null ? '—' : formatarNumero(f.ultimos_itens)}
                </td>
                <td className="num">{formatarNumero(f.total_itens)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
