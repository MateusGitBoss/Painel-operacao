import type { ResumoDia } from '../api/tipos'

/** Preenche as 24 horas: hora sem venda aparece como zero no gráfico, e não some. */
export function completarHoras(resumo: ResumoDia) {
  const porHora = new Map(resumo.por_hora.map((h) => [h.hora, h]))
  return Array.from({ length: 24 }, (_, hora) => ({
    hora: `${String(hora).padStart(2, '0')}h`,
    vendas: porHora.get(hora)?.quantidade ?? 0,
  }))
}
