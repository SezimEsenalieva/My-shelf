import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('показывает название приложения и пустую полку', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Моя полка' })).toBeTruthy()
    expect(await screen.findByText('Добавьте первую прочитанную книгу')).toBeTruthy()
  })
})
