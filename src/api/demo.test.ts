import { expect, test, vi } from 'vitest'

import { criarClienteDemo, resumoDemo } from './demo'

const AGORA = new Date('2026-10-09T15:00:00')

test('resumo de hoje só conta vendas até a hora atual', () => {
  const hoje = resumoDemo('2026-10-09', AGORA)
  const ontem = resumoDemo('2026-10-08', AGORA)
  expect(Math.max(...hoje.por_hora.map((h) => h.hora))).toBeLessThanOrEqual(15)
  expect(ontem.vendas_aprovadas).toBeGreaterThan(hoje.vendas_aprovadas)
})

test('totais do resumo batem com a soma por produto', () => {
  const r = resumoDemo('2026-10-08', AGORA)
  const soma = r.por_produto.reduce((t, p) => t + p.valor_centavos, 0)
  expect(r.faturamento_centavos).toBe(soma)
  expect(r.ticket_medio_centavos).toBe(Math.round(soma / r.vendas_aprovadas))
})

test('cliente demo filtra execuções por fonte', async () => {
  vi.useFakeTimers()
  const cliente = criarClienteDemo(() => AGORA)
  const promessa = cliente.execucoes('livros')
  await vi.advanceTimersByTimeAsync(200)
  const execucoes = await promessa
  vi.useRealTimers()
  expect(execucoes.length).toBeGreaterThan(0)
  expect(execucoes.every((e) => e.fonte === 'livros')).toBe(true)
})
