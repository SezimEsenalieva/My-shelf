import type { ShelfItem } from './types'

// Размеры корешка. Разные типы изданий выглядят по-разному, чтобы полка была «живой»:
// книги — высокие, толщина по числу страниц; манга и манхва — ниже и уже;
// западные комиксы — высокие и тонкие.

export interface SpineSize {
  /** Высота в пикселях. */
  height: number
  /** Толщина в пикселях. */
  width: number
}

/** Самый высокий корешок — под него рассчитана высота полки. */
export const MAX_SPINE_HEIGHT = 184

interface Range {
  height: [number, number]
  width: [number, number]
  /** Сколько страниц приходится на 1 px толщины. */
  pagesPerPx?: number
}

const RANGES: Record<ShelfItem['type'], Range> = {
  book: { height: [156, 184], width: [22, 50], pagesPerPx: 12 },
  ranobe: { height: [140, 152], width: [20, 34], pagesPerPx: 12 },
  comic: { height: [170, 182], width: [12, 18] },
  manga: { height: [118, 130], width: [18, 28] },
  manhwa: { height: [118, 134], width: [18, 28] },
  manhua: { height: [118, 134], width: [18, 28] },
  other: { height: [140, 176], width: [18, 40], pagesPerPx: 12 },
}

/** Стабильное «случайное» число 0…1 из строки: для одной записи всегда одно и то же. */
export function seededRandom(seed: string, salt = 0): number {
  let hash = 2166136261 ^ salt
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % 10000) / 10000
}

const between = ([min, max]: [number, number], t: number) => Math.round(min + (max - min) * t)

export function spineSize(item: Pick<ShelfItem, 'id' | 'type' | 'pageCount'>): SpineSize {
  const range = RANGES[item.type]
  const height = between(range.height, seededRandom(item.id, 1))
  const [minWidth, maxWidth] = range.width
  const width =
    item.pageCount && range.pagesPerPx
      ? Math.min(maxWidth, Math.max(minWidth, Math.round(item.pageCount / range.pagesPerPx)))
      : between(range.width, seededRandom(item.id, 2))
  return { height, width }
}
