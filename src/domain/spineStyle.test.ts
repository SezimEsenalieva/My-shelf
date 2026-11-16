import { describe, expect, it } from 'vitest'
import { arrangeShelf, spineStyle, spineVariant } from './spineStyle'
import type { ItemType } from './types'

const ids = Array.from({ length: 400 }, (_, i) => `id-${i}`)

describe('spineStyle', () => {
  it('для одной книги оформление всегда одинаковое', () => {
    expect(spineStyle({ id: 'x', type: 'book' })).toEqual(spineStyle({ id: 'x', type: 'book' }))
  })

  it('манга, манхва и маньхуа — стиль manga, комиксы — comic', () => {
    for (const type of ['manga', 'manhwa', 'manhua'] as ItemType[]) {
      expect(spineVariant({ id: 'a', type })).toBe('manga')
    }
    expect(spineVariant({ id: 'a', type: 'comic' })).toBe('comic')
  })

  it('у книг встречаются все три книжных стиля', () => {
    const variants = new Set(ids.map((id) => spineVariant({ id, type: 'book' })))
    expect(variants).toEqual(new Set(['classic', 'modern', 'paperback']))
  })

  it('наклонённых и лежачих книг немного', () => {
    const styles = ids.map((id) => spineStyle({ id, type: 'book' }))
    const leaning = styles.filter((s) => s.lean > 0).length
    const lying = styles.filter((s) => s.lying).length
    expect(leaning).toBeGreaterThan(10)
    expect(leaning).toBeLessThan(80)
    expect(lying).toBeGreaterThan(5)
    expect(lying).toBeLessThan(60)
  })

  it('манга и комиксы не лежат и не наклоняются', () => {
    for (const id of ids) {
      for (const type of ['manga', 'comic'] as ItemType[]) {
        const s = spineStyle({ id, type })
        expect(s.lying).toBe(false)
        expect(s.lean).toBe(0)
      }
    }
  })
})

describe('arrangeShelf', () => {
  it('сохраняет все записи и их порядок', () => {
    const items = ids.slice(0, 120).map((id) => ({ id, type: 'book' as const }))
    const flat = arrangeShelf(items).flatMap((s) => (s.kind === 'stack' ? s.items : [s.item]))
    expect(flat).toEqual(items)
  })

  it('в стопке не больше трёх книг', () => {
    const items = ids.map((id) => ({ id, type: 'book' as const }))
    for (const slot of arrangeShelf(items)) {
      if (slot.kind === 'stack') expect(slot.items.length).toBeLessThanOrEqual(3)
    }
  })
})
