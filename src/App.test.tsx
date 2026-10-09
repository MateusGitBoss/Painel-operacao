import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import App from './App'

test('mostra o título', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Painel de operação' })).toBeInTheDocument()
})
