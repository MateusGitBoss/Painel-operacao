import { fireEvent, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

import type { FonteDeDados } from '../api/cliente'
import type { ResumoDia } from '../api/tipos'
import { AGORA, renderizar } from '../test/renderizar'
import { completarHoras } from '../dominio/vendas'
import { VendasDoDia } from './VendasDoDia'

const VAZIO: ResumoDia = {
  dia: '2026-10-09',
  vendas_aprovadas: 0,
  faturamento_centavos: 0,
  reembolsos: 0,
  chargebacks: 0,
  ticket_medio_centavos: 0,
  por_hora: [],
  por_produto: [],
}

function fonte(resumo: ResumoDia): FonteDeDados {
  return {
    fontes: vi.fn(),
    execucoes: vi.fn(),
    resumoVendas: vi.fn(async () => resumo),
  }
}

test('completa as 24 horas com zero', () => {
  const horas = completarHoras({
    ...VAZIO,
    por_hora: [{ hora: 20, quantidade: 7, valor_centavos: 1 }],
  })
  expect(horas).toHaveLength(24)
  expect(horas[0]).toEqual({ hora: '00h', vendas: 0 })
  expect(horas[20]).toEqual({ hora: '20h', vendas: 7 })
})

test('dia sem venda', async () => {
  renderizar(<VendasDoDia />, fonte(VAZIO))
  expect(await screen.findByText('Nenhuma venda neste dia.')).toBeVisible()
})

test('reembolso e chargeback ficam destacados', async () => {
  renderizar(
    <VendasDoDia />,
    fonte({
      ...VAZIO,
      vendas_aprovadas: 10,
      faturamento_centavos: 497000,
      ticket_medio_centavos: 49700,
      reembolsos: 2,
      chargebacks: 1,
      por_produto: [{ produto: 'Curso', quantidade: 10, valor_centavos: 497000 }],
    }),
  )
  const reembolsos = (await screen.findByText('Reembolsos')).parentElement
  expect(reembolsos).toHaveClass('indicador-alerta')
  expect(screen.getByText('Vendas aprovadas').parentElement).not.toHaveClass('indicador-alerta')
})

test('trocar o dia busca de novo', async () => {
  const dados = fonte(VAZIO)
  renderizar(<VendasDoDia />, dados)
  await screen.findByText('Nenhuma venda neste dia.')

  fireEvent.change(screen.getByLabelText('Dia'), { target: { value: '2026-10-01' } })

  await screen.findByText('Nenhuma venda neste dia.')
  expect(dados.resumoVendas).toHaveBeenLastCalledWith('2026-10-01')
  expect(AGORA.getDate()).toBe(9)
})
