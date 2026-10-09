import { expect, test } from 'vitest'

import {
  dataLocalIso,
  formatarCentavos,
  formatarDuracao,
  formatarNumero,
  tempoAtras,
} from './formatacao'

const AGORA = new Date('2026-10-09T12:00:00Z')

test('centavos viram reais', () => {
  // Intl usa espaço não separável entre R$ e o valor
  expect(formatarCentavos(49700).replace(/\s/g, ' ')).toBe('R$ 497,00')
  expect(formatarCentavos(123456789).replace(/\s/g, ' ')).toBe('R$ 1.234.567,89')
})

test('número com separador de milhar', () => {
  expect(formatarNumero(1000)).toBe('1.000')
})

test('duração', () => {
  expect(formatarDuracao(null)).toBe('—')
  expect(formatarDuracao(42.4)).toBe('42 s')
  expect(formatarDuracao(125)).toBe('2 min 5 s')
})

test.each([
  ['2026-10-09T11:59:40Z', 'agora'],
  ['2026-10-09T11:30:00Z', 'há 30 min'],
  ['2026-10-09T02:00:00Z', 'há 10 h'],
  ['2026-10-06T12:00:00Z', 'há 3 dias'],
])('tempoAtras(%s) = %s', (iso, esperado) => {
  expect(tempoAtras(iso, AGORA)).toBe(esperado)
})

test('data local AAAA-MM-DD', () => {
  expect(dataLocalIso(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
})
