// Цвета для корешков и заглушек обложек.

/**
 * Стабильный цвет из текста: одно и то же название всегда даёт один и тот же цвет.
 * Берём «хэш» строки (число, вычисленное из её букв) и превращаем его в оттенок.
 */
export function colorFromText(text: string): string {
  let hash = 0
  for (const char of text.trim().toLowerCase()) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) | 0
  }
  const hue = Math.abs(hash) % 360
  // Насыщенность и яркость в «книжном» диапазоне: не кислотные и не слишком тёмные.
  const saturation = 30 + (Math.abs(hash >> 9) % 21) // 30–50 %
  const lightness = 30 + (Math.abs(hash >> 17) % 19) // 30–48 %
  return hslToHex(hue, saturation, lightness)
}

export function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100
  const light = l / 100
  const a = sat * Math.min(light, 1 - light)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const value = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

/** Относительная яркость цвета по стандарту WCAG (0 — чёрный, 1 — белый). */
export function luminance(hex: string): number {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const r = toLinear((value >> 16) & 0xff)
  const g = toLinear((value >> 8) & 0xff)
  const b = toLinear(value & 0xff)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const LIGHT_TEXT = '#fbf7f0'
const DARK_TEXT = '#1f1a15'

/** Светлый или тёмный текст — тот, что контрастнее на этом фоне. */
export function textColorFor(background: string): string {
  const bg = luminance(background)
  const contrast = (fg: string) => {
    const l = luminance(fg)
    return (Math.max(l, bg) + 0.05) / (Math.min(l, bg) + 0.05)
  }
  return contrast(LIGHT_TEXT) >= contrast(DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT
}
