import { seededRandom } from './spine'
import type { ShelfItem } from './types'

// Оформление корешка. Выбирается по записи «случайно», но всегда одинаково для одной книги,
// чтобы полка выглядела живой и не менялась от запуска к запуску.

/**
 * Стиль корешка:
 * - classic — твёрдый переплёт, тиснение «под золото», шрифт с засечками;
 * - modern — современное издание, узкий шрифт заглавными;
 * - paperback — мягкая обложка, спокойный шрифт с засечками, значок издательства;
 * - manga — белая плашка сверху со значком, глянец;
 * - comic — высокий тонкий корешок, квадратный «логотип» сверху.
 */
export type SpineVariant = 'classic' | 'modern' | 'paperback' | 'manga' | 'comic'

/** Фактура материала. */
export type SpineMaterial = 'cloth' | 'leather' | 'matte' | 'glossy'

export interface SpineStyle {
  variant: SpineVariant
  material: SpineMaterial
  /** Наклон в градусах (0 — стоит ровно). Положительный — опирается на соседа справа. */
  lean: number
  /** Лежит горизонтально (в стопке). */
  lying: boolean
  /** Дополнительный промежуток справа, px. */
  gap: number
}

type Item = Pick<ShelfItem, 'id' | 'type'>

export function spineVariant(item: Item): SpineVariant {
  switch (item.type) {
    case 'manga':
    case 'manhwa':
    case 'manhua':
      return 'manga'
    case 'comic':
      return 'comic'
    default: {
      const r = seededRandom(item.id, 11)
      if (r < 0.35) return 'classic'
      if (r < 0.75) return 'modern'
      return 'paperback'
    }
  }
}

function materialFor(variant: SpineVariant, id: string): SpineMaterial {
  switch (variant) {
    case 'classic':
      return seededRandom(id, 12) < 0.5 ? 'cloth' : 'leather'
    case 'modern':
      return 'matte'
    default:
      return 'glossy'
  }
}

/** Может ли книга лежать или наклоняться — только «книжные» типы. */
const isBookLike = (type: ShelfItem['type']) =>
  type === 'book' || type === 'ranobe' || type === 'other'

export function spineStyle(item: Item): SpineStyle {
  const variant = spineVariant(item)
  const lyingRoll = seededRandom(item.id, 13)
  const leanRoll = seededRandom(item.id, 14)
  const lying = isBookLike(item.type) && lyingRoll < 0.08
  const lean =
    !lying && isBookLike(item.type) && leanRoll < 0.1
      ? Math.round(3 + seededRandom(item.id, 15) * 4) // 3–7°
      : 0
  return {
    variant,
    material: materialFor(variant, item.id),
    lean,
    lying,
    gap: Math.round(seededRandom(item.id, 16) * 4),
  }
}

/**
 * Раскладка по полке: подряд идущие «лежачие» книги собираются в стопку (до 3 штук).
 * Остальные стоят по одной. Порядок записей сохраняется.
 */
export type ShelfSlot<T> = { kind: 'standing'; item: T } | { kind: 'stack'; items: T[] }

export function arrangeShelf<T extends Item>(items: readonly T[]): ShelfSlot<T>[] {
  const slots: ShelfSlot<T>[] = []
  for (const item of items) {
    const last = slots[slots.length - 1]
    if (spineStyle(item).lying) {
      if (last?.kind === 'stack' && last.items.length < 3) last.items.push(item)
      else slots.push({ kind: 'stack', items: [item] })
    } else {
      slots.push({ kind: 'standing', item })
    }
  }
  return slots
}
