import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { ErroApi, type FonteDeDados } from './api/cliente'
import { execucoesDemo, fontesDemo, resumoDemo } from './api/demo'
import App from './App'
import { AGORA, renderizar } from './test/renderizar'

function fonteFalsa(parcial: Partial<FonteDeDados> = {}): FonteDeDados {
  return {
    fontes: vi.fn(async () => fontesDemo(AGORA)),
    execucoes: vi.fn(async (fonte?: string) =>
      execucoesDemo(AGORA).filter((e) => !fonte || e.fonte === fonte),
    ),
    resumoVendas: vi.fn(async (dia: string) => resumoDemo(dia, AGORA)),
    ...parcial,
  }
}

describe('painel', () => {
  test('mostra coletores com problema primeiro', async () => {
    renderizar(<App />, fonteFalsa())
    const secao = screen.getByRole('region', { name: 'Saúde dos coletores' })

    expect(await within(secao).findByText('1 de 2 coletores precisam de atenção.')).toBeVisible()
    const linhas = within(secao).getAllByRole('row').slice(1)
    expect(within(linhas[0]).getByText('citacoes')).toBeVisible()
    expect(within(linhas[0]).getByText('Atenção')).toBeVisible()
    expect(within(linhas[1]).getByText('OK')).toBeVisible()
  })

  test('mostra os números de vendas do dia', async () => {
    renderizar(<App />, fonteFalsa())
    const secao = screen.getByRole('region', { name: 'Vendas do dia' })

    expect(await within(secao).findByText('Vendas aprovadas')).toBeVisible()
    expect(within(secao).getByText('Curso Lojista Digital')).toBeVisible()
    expect(within(secao).getByLabelText('Dia')).toHaveValue('2026-10-09')
  })

  test('clicar numa fonte filtra as execuções', async () => {
    const fonte = fonteFalsa()
    renderizar(<App />, fonte)
    const usuario = userEvent.setup()

    await usuario.click(await screen.findByRole('button', { name: 'livros' }))

    expect(await screen.findByRole('heading', { name: 'Execuções recentes: livros' })).toBeVisible()
    await waitFor(() => expect(fonte.execucoes).toHaveBeenLastCalledWith('livros'))
    const execucoes = screen.getByRole('region', { name: /Execuções recentes/ })
    expect(within(execucoes).queryByText('citacoes')).not.toBeInTheDocument()
    expect(await within(execucoes).findByText(/TimeoutError/)).toBeVisible()

    // Clicar de novo tira o filtro
    await usuario.click(screen.getByRole('button', { name: 'livros' }))
    expect(screen.getByRole('heading', { name: 'Execuções recentes' })).toBeVisible()
  })

  test('erro da API aparece com botão para tentar de novo', async () => {
    const fontes = vi
      .fn<FonteDeDados['fontes']>()
      .mockRejectedValueOnce(new ErroApi('coletor.exemplo respondeu 500', 500))
      .mockResolvedValue(fontesDemo(AGORA))
    renderizar(<App />, fonteFalsa({ fontes }))

    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveTextContent('coletor.exemplo respondeu 500')

    await userEvent.setup().click(within(alerta).getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByText('1 de 2 coletores precisam de atenção.')).toBeVisible()
  })

  test('selo de demonstração só no modo demo', () => {
    const { unmount } = renderizar(<App />, fonteFalsa(), true)
    expect(screen.getByText('Dados de demonstração')).toBeVisible()
    unmount()
    renderizar(<App />, fonteFalsa(), false)
    expect(screen.queryByText('Dados de demonstração')).not.toBeInTheDocument()
  })
})
