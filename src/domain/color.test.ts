import { describe, expect, it } from 'vitest'
import { colorFromText, luminance, textColorFor } from './color'

describe('colorFromText', () => {
  it('для одного и того же названия всегда даёт один цвет', () => {
    expect(colorFromText('Мастер и Маргарита')).toBe(colorFromText('Мастер и Маргарита'))
  })

  it('не зависит от регистра и пробелов по краям', () => {
    expect(colorFromText('  One Piece ')).toBe(colorFromText('one piece'))
  })

  it('даёт цвет в формате #rrggbb', () => {
    expect(colorFromText('Solo Leveling')).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('разным названиям чаще всего даёт разные цвета', () => {
    const titles = ['Дюна', 'Война и мир', 'Берсерк', 'Наруто', 'Ведьмак', 'Хоббит']
    expect(new Set(titles.map(colorFromText)).size).toBeGreaterThan(4)
  })
})

describe('textColorFor', () => {
  it('на тёмном фоне выбирает светлый текст', () => {
    expect(luminance(textColorFor('#1a2b3c'))).toBeGreaterThan(0.5)
  })

  it('на светлом фоне выбирает тёмный текст', () => {
    expect(luminance(textColorFor('#f0e0a0'))).toBeLessThan(0.1)
  })
})
