import { expect, test } from 'vitest'

import { lerConfiguracao } from './config'

test('sem URLs entra em modo demonstração', () => {
  expect(lerConfiguracao({}).modoDemo).toBe(true)
  expect(lerConfiguracao({ VITE_COLETOR_API_URL: 'http://a' }).modoDemo).toBe(true)
})

test('com as duas URLs usa as APIs', () => {
  const config = lerConfiguracao({
    VITE_COLETOR_API_URL: ' http://a ',
    VITE_VENDAS_API_URL: 'http://b',
  })
  expect(config).toMatchObject({ modoDemo: false, coletorUrl: 'http://a', vendasUrl: 'http://b' })
})

test('modo demo pode ser forçado', () => {
  const config = lerConfiguracao({
    VITE_COLETOR_API_URL: 'http://a',
    VITE_VENDAS_API_URL: 'http://b',
    VITE_MODO_DEMO: 'true',
  })
  expect(config.modoDemo).toBe(true)
})
