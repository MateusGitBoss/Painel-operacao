import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { ResumoDia } from '../api/tipos'
import { useResumoVendas } from '../dados/consultas'
import { useDados } from '../dados/contexto'
import { dataLocalIso, formatarCentavos, formatarNumero } from '../dominio/formatacao'
import { completarHoras } from '../dominio/vendas'
import { Carregando, MensagemErro } from './Estados'

function Indicador({ titulo, valor, alerta }: { titulo: string; valor: string; alerta?: boolean }) {
  return (
    <div className={alerta ? 'indicador indicador-alerta' : 'indicador'}>
      <span className="indicador-titulo">{titulo}</span>
      <strong className="indicador-valor">{valor}</strong>
    </div>
  )
}

function Conteudo({ resumo }: { resumo: ResumoDia }) {
  if (resumo.vendas_aprovadas === 0 && resumo.reembolsos === 0) {
    return <p className="estado">Nenhuma venda neste dia.</p>
  }
  return (
    <>
      <div className="indicadores">
        <Indicador titulo="Vendas aprovadas" valor={formatarNumero(resumo.vendas_aprovadas)} />
        <Indicador titulo="Faturamento" valor={formatarCentavos(resumo.faturamento_centavos)} />
        <Indicador titulo="Ticket médio" valor={formatarCentavos(resumo.ticket_medio_centavos)} />
        <Indicador
          titulo="Reembolsos"
          valor={formatarNumero(resumo.reembolsos)}
          alerta={resumo.reembolsos > 0}
        />
        <Indicador
          titulo="Chargebacks"
          valor={formatarNumero(resumo.chargebacks)}
          alerta={resumo.chargebacks > 0}
        />
      </div>

      <h3>Vendas por hora</h3>
      <div className="grafico" aria-label="Gráfico de vendas por hora">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={completarHoras(resumo)}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="hora" interval={2} fontSize={12} />
            <YAxis allowDecimals={false} width={32} fontSize={12} />
            <Tooltip formatter={(valor) => [valor, 'vendas']} />
            <Bar dataKey="vendas" fill="var(--cor-destaque)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>Por produto</h3>
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th className="num">Vendas</th>
            <th className="num">Faturamento</th>
          </tr>
        </thead>
        <tbody>
          {[...resumo.por_produto]
            .sort((a, b) => b.valor_centavos - a.valor_centavos)
            .map((p) => (
              <tr key={p.produto}>
                <td>{p.produto}</td>
                <td className="num">{formatarNumero(p.quantidade)}</td>
                <td className="num">{formatarCentavos(p.valor_centavos)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  )
}

export function VendasDoDia() {
  const { agora } = useDados()
  const hoje = dataLocalIso(agora())
  const [dia, setDia] = useState(hoje)
  const { data, error, isPending, refetch } = useResumoVendas(dia)

  return (
    <>
      <label className="campo-data">
        Dia{' '}
        <input
          type="date"
          value={dia}
          max={hoje}
          onChange={(evento) => setDia(evento.target.value || hoje)}
        />
      </label>
      {isPending ? (
        <Carregando texto="Carregando vendas…" />
      ) : error ? (
        <MensagemErro erro={error} tentarDeNovo={() => void refetch()} />
      ) : (
        <Conteudo resumo={data} />
      )}
    </>
  )
}
