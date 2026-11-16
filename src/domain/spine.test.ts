import { describe, expect, it } from 'vitest'
import { MAX_SPINE_HEIGHT, seededRandom, spineSize, titleFontSize } from './spine'

describe('spineSize', () => {
  it('для одной записи размер всегда одинаковый', () => {
    const item = { id: 'abc', type: 'book' as const }
    expect(spineSize(item)).toEqual(spineSize(item))
  })

  it('толщина книги зависит от числа страниц', () => {
    const thin = spineSize({ id: 'a', type: 'book', pageCount: 200 })
    const thick = spineSize({ id: 'a', type: 'book', pageCount: 500 })
    expect(thick.width).toBeGreaterThan(thin.width)
  })

  it('толщина ограничена разумными пределами', () => {
    expect(spineSize({ id: 'a', type: 'book', pageCount: 5000 }).width).toBe(50)
    expect(spineSize({ id: 'a', type: 'book', pageCount: 10 }).width).toBe(22)
  })

  it('манга ниже книг, комиксы выше и тоньше манги', () => {
    for (const id of ['1', '2', '3', '4', '5']) {
      const book = spineSize({ id, type: 'book' })
      const manga = spineSize({ id, type: 'manga' })
      const comic = spineSize({ id, type: 'comic' })
      expect(manga.height).toBeLessThan(book.height)
      expect(comic.height).toBeGreaterThan(manga.height)
      expect(comic.width).toBeLessThan(manga.width)
    }
  })

  it('ни один корешок не выше полки', () => {
    for (const type of ['book', 'comic', 'manga', 'manhwa', 'manhua', 'ranobe', 'other'] as const) {
      for (let i = 0; i < 50; i++) {
        expect(spineSize({ id: `id-${i}`, type }).height).toBeLessThanOrEqual(MAX_SPINE_HEIGHT)
      }
    }
  })
})

describe('seededRandom', () => {
  it('выдаёт число от 0 до 1 и разное для разных строк', () => {
    const values = ['a', 'b', 'c', 'd'].map((s) => seededRandom(s))
    for (const v of values) expect(v).toBeGreaterThanOrEqual(0)
    for (const v of values) expect(v).toBeLessThan(1)
    expect(new Set(values).size).toBe(4)
  })
})

describe('titleFontSize', () => {
  const base = { length: 180, thickness: 40, reserved: 40 }

  it('короткое название — крупно, но не больше 13 px', () => {
    expect(titleFontSize({ ...base, title: 'Дюна' })).toBe(13)
  })

  it('длинное название — мельче', () => {
    const short = titleFontSize({ ...base, title: 'Война и мир' })
    const long = titleFontSize({ ...base, title: 'Гарри Поттер и философский камень' })
    expect(long).toBeLessThan(short)
  })

  it('не мельче 8 px и не толще корешка', () => {
    expect(titleFontSize({ ...base, title: 'А'.repeat(200) })).toBe(8)
    expect(titleFontSize({ ...base, thickness: 14, title: 'Maus' })).toBeLessThanOrEqual(14 * 0.62)
  })
})
