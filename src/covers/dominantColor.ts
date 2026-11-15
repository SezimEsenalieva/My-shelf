import { hslToHex } from '../domain/color'

/**
 * Преобладающий цвет картинки по массиву пикселей (RGBA подряд, как отдаёт canvas).
 * Раскладываем пиксели по «корзинам» похожих цветов и берём самую полную.
 * Почти белые, почти чёрные и серые пиксели (поля, текст) почти не учитываем.
 */
export function dominantColor(pixels: Uint8ClampedArray | number[]): string | undefined {
  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>()

  for (let i = 0; i + 3 < pixels.length; i += 4) {
    const r = pixels[i] ?? 0
    const g = pixels[i + 1] ?? 0
    const b = pixels[i + 2] ?? 0
    const alpha = pixels[i + 3] ?? 0
    if (alpha < 128) continue

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    // Вес: насыщенные цвета важнее серых, крайности почти не учитываем.
    let weight = 0.2 + saturation
    if (max > 240 && min > 225) weight = 0.02
    if (max < 25) weight = 0.05

    // 4 бита на канал → 4096 корзин
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
    const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 }
    bucket.count += weight
    bucket.r += r * weight
    bucket.g += g * weight
    bucket.b += b * weight
    buckets.set(key, bucket)
  }

  let best: { count: number; r: number; g: number; b: number } | undefined
  for (const bucket of buckets.values()) if (!best || bucket.count > best.count) best = bucket
  if (!best || best.count === 0) return undefined

  const hex = (v: number) =>
    Math.round(v / best.count)
      .toString(16)
      .padStart(2, '0')
  return `#${hex(best.r)}${hex(best.g)}${hex(best.b)}`
}

/** Делаем цвет пригодным для корешка: не слишком светлым и не слишком тёмным. */
export function toSpineColor(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16)
  const r = ((value >> 16) & 0xff) / 255
  const g = ((value >> 8) & 0xff) / 255
  const b = (value & 0xff) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6)
    else if (max === g) h = 60 * ((b - r) / d + 2)
    else h = 60 * ((r - g) / d + 4)
  }
  if (h < 0) h += 360
  const lightness = Math.min(Math.max(l * 100, 18), 78)
  return hslToHex(h, Math.min(s * 100, 85), lightness)
}
