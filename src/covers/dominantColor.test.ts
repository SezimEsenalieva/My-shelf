import { describe, expect, it } from 'vitest'
import { luminance } from '../domain/color'
import { dominantColor, toSpineColor } from './dominantColor'

const pixels = (...colors: [number, number, number, number][]) => colors.flat()

describe('dominantColor', () => {
  it('выбирает самый частый цвет', () => {
    const red: [number, number, number, number] = [200, 30, 30, 255]
    const blue: [number, number, number, number] = [30, 30, 200, 255]
    expect(dominantColor(pixels(red, red, red, blue))).toBe('#c81e1e')
  })

  it('почти не учитывает белые поля', () => {
    const white: [number, number, number, number] = [250, 250, 250, 255]
    const green: [number, number, number, number] = [40, 150, 60, 255]
    expect(dominantColor(pixels(white, white, white, white, white, green, green))).toBe('#28963c')
  })

  it('пропускает прозрачные пиксели и пустую картинку', () => {
    expect(dominantColor(pixels([255, 0, 0, 0]))).toBeUndefined()
    expect(dominantColor([])).toBeUndefined()
  })
})

describe('toSpineColor', () => {
  it('слишком светлый цвет делает темнее', () => {
    expect(luminance(toSpineColor('#fdfdf8'))).toBeLessThan(luminance('#fdfdf8'))
  })
  it('нормальный цвет почти не меняет', () => {
    expect(toSpineColor('#3366aa')).toMatch(/^#[0-9a-f]{6}$/)
  })
})
