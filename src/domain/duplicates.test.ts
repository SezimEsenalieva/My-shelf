import { describe, expect, it } from 'vitest'
import { findDuplicate, normalizeText } from './duplicates'
import type { ShelfItem } from './types'

const item = (over: Partial<ShelfItem>): ShelfItem => ({
  id: 'x',
  title: 'Мастер и Маргарита',
  author: 'Михаил Булгаков',
  type: 'book',
  spineColor: '#123456',
  source: 'openlibrary',
  sourceId: '/works/OL1W',
  addedAt: 1,
  ...over,
})

describe('normalizeText', () => {
  it('убирает регистр, ё, знаки препинания и лишние пробелы', () => {
    expect(normalizeText('  Ёжик в ТУМАНЕ!  ')).toBe('ежик в тумане')
    expect(normalizeText("The King's Avatar")).toBe('the king s avatar')
    expect(normalizeText('Pokémon')).toBe('pokemon')
  })
})

describe('findDuplicate', () => {
  const shelf = [item({})]

  it('тот же источник и id', () => {
    expect(
      findDuplicate(shelf, { title: 'Другое', source: 'openlibrary', sourceId: '/works/OL1W' }),
    ).toBeDefined()
  })

  it('то же название и автор из другого источника', () => {
    expect(
      findDuplicate(shelf, {
        title: 'мастер и маргарита.',
        author: 'михаил булгаков',
        source: 'googlebooks',
        sourceId: 'abc',
      }),
    ).toBeDefined()
  })

  it('то же название, автор не указан', () => {
    expect(findDuplicate(shelf, { title: 'Мастер и Маргарита', source: 'manual' })).toBeDefined()
  })

  it('то же название, но другой автор — не дубликат', () => {
    expect(
      findDuplicate(shelf, { title: 'Мастер и Маргарита', author: 'Другой', source: 'manual' }),
    ).toBeUndefined()
  })

  it('другое название — не дубликат', () => {
    expect(
      findDuplicate(shelf, { title: 'Белая гвардия', author: 'Михаил Булгаков', source: 'manual' }),
    ).toBeUndefined()
  })
})
