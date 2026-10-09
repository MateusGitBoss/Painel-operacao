import { useExecucoes } from '../dados/consultas'
import { formatarDataHora, formatarDuracao, formatarNumero } from '../dominio/formatacao'
import { Carregando, MensagemErro } from './Estados'

const ROTULO_STATUS = {
  em_andamento: 'Rodando',
  sucesso: 'Sucesso',
  parcial: 'Parcial',
  falha: 'Falha',
} as const

const SELO_STATUS = {
  em_andamento: 'sem-dados',
  sucesso: 'ok',
  parcial: 'atencao',
  falha: 'falha',
} as const

export function ExecucoesRecentes({ fonte }: { fonte: string | undefined }) {
  const { data, error, isPending, refetch } = useExecucoes(fonte)

  if (isPending) return <Carregando texto="Carregando execuções…" />
  if (error) return <MensagemErro erro={error} tentarDeNovo={() => void refetch()} />
  if (data.length === 0) return <p className="estado">Nenhuma execução registrada.</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Início</th>
          <th>Fonte</th>
          <th>Status</th>
          <th className="num">Itens</th>
          <th className="num">Inválidos</th>
          <th className="num">Duração</th>
          <th>Erro</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e) => (
          <tr key={e.id}>
            <td>{formatarDataHora(e.iniciada_em)}</td>
            <td>{e.fonte}</td>
            <td>
              <span className={`selo selo-${SELO_STATUS[e.status]}`}>
                {ROTULO_STATUS[e.status]}
              </span>
            </td>
            <td className="num">{formatarNumero(e.itens_coletados)}</td>
            <td className="num">{formatarNumero(e.itens_invalidos)}</td>
            <td className="num">{formatarDuracao(e.duracao_segundos)}</td>
            <td className="erro">{e.mensagem_erro ?? ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
