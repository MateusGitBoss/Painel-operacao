import { describe, expect, test } from 'vitest'

import type { Fonte } from '../api/tipos'
import { avaliarSaude, ordenarPorGravidade } from './saude'

const AGORA = new Date('2026-10-09T12:00:00Z')

function fonte(parcial: Partial<Fonte>): Fonte {
  return {
    nome: 'livros',
    url_base: 'https://exemplo',
    ativa: true,
    ultima_execucao_id: 'x',
    ultimo_status: 'sucesso',
    ultima_execucao_em: '2026-10-09T09:00:00Z',
    ultimos_itens: 1000,
    total_itens: 1000,
    ...parcial,
  }
}

describe('avaliarSaude', () => {
  test.each([
    [{}, 'ok'],
    [{ ultimo_status: 'parcial' as const }, 'atencao'],
    [{ ultimo_status: 'falha' as const }, 'falha'],
    [{ ultimo_status: 'em_andamento' as const }, 'ok'],
    [{ ativa: false }, 'inativa'],
    [{ ultimo_status: null, ultima_execucao_em: null }, 'sem-dados'],
  ])('%o -> %s', (parcial, esperado) => {
    expect(avaliarSaude(fonte(parcial), AGORA)).toBe(esperado)
  })

  test('sucesso antigo é atraso: o agendamento parou de rodar', () => {
    expect(avaliarSaude(fonte({ ultima_execucao_em: '2026-10-08T09:00:00Z' }), AGORA)).toBe(
      'atrasada',
    )
  })

  test('25h ainda está dentro da tolerância', () => {
    expect(avaliarSaude(fonte({ ultima_execucao_em: '2026-10-08T11:00:00Z' }), AGORA)).toBe('ok')
  })
})

test('ordena problemas primeiro e depois por nome', () => {
  const fontes = [
    fonte({ nome: 'b-ok' }),
    fonte({ nome: 'a-ok' }),
    fonte({ nome: 'parcial', ultimo_status: 'parcial' }),
    fonte({ nome: 'falha', ultimo_status: 'falha' }),
  ]
  expect(ordenarPorGravidade(fontes, AGORA).map((f) => f.nome)).toEqual([
    'falha',
    'parcial',
    'a-ok',
    'b-ok',
  ])
})
