import { afterEach, describe, expect, test, vi } from 'vitest'

import { buscarJson, criarClienteHttp, ErroApi } from './cliente'

afterEach(() => vi.unstubAllGlobals())

// Recebe uma função: cada chamada ganha uma Response nova (o corpo só pode ser lido uma vez)
function stubFetch(criar: () => Response | Error) {
  const fetchFalso = vi.fn(async () => {
    const resposta = criar()
    if (resposta instanceof Error) throw resposta
    return resposta
  })
  vi.stubGlobal('fetch', fetchFalso)
  return fetchFalso
}

describe('buscarJson', () => {
  test('devolve o JSON', async () => {
    stubFetch(() => Response.json([{ nome: 'livros' }]))
    await expect(buscarJson('https://api.exemplo/fontes')).resolves.toEqual([{ nome: 'livros' }])
  })

  test('status de erro vira ErroApi com o código', async () => {
    stubFetch(() => new Response('falhou', { status: 503 }))
    const erro = await buscarJson('https://api.exemplo/fontes').catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ErroApi)
    expect(erro).toMatchObject({ status: 503, message: 'api.exemplo respondeu 503' })
  })

  test('falha de rede vira mensagem legível', async () => {
    stubFetch(() => new TypeError('Failed to fetch'))
    await expect(buscarJson('https://api.exemplo/fontes')).rejects.toThrow(
      'Não foi possível acessar api.exemplo (falha de rede)',
    )
  })

  test('tempo esgotado', async () => {
    stubFetch(() => Object.assign(new Error('demorou'), { name: 'TimeoutError' }))
    await expect(buscarJson('https://api.exemplo/fontes')).rejects.toThrow('tempo esgotado')
  })
})

describe('criarClienteHttp', () => {
  test('monta as URLs das duas APIs', async () => {
    const fetchFalso = stubFetch(() => Response.json([]))
    const cliente = criarClienteHttp('https://coletor.exemplo', 'https://vendas.exemplo/api/')

    await cliente.fontes()
    await cliente.execucoes('livros')
    await cliente.execucoes()
    await cliente.resumoVendas('2026-10-09')

    const urls = fetchFalso.mock.calls.map((chamada) => String((chamada as unknown[])[0]))
    expect(urls).toEqual([
      'https://coletor.exemplo/fontes',
      'https://coletor.exemplo/execucoes?fonte=livros&limite=20',
      'https://coletor.exemplo/execucoes?limite=20',
      'https://vendas.exemplo/api/vendas/resumo?dia=2026-10-09',
    ])
  })
})
