import type { ShelfItem } from './types'

/** Приводим текст к виду для сравнения: регистр, ё/е, знаки препинания, лишние пробелы. */
export function normalizeText(text: string | undefined): string {
  return (text ?? '')
    .toLowerCase()
    .replaceAll('ё', 'е')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // убираем надстрочные знаки: é → e
    .replace(/[^\p{L}\p{N}]+/gu, ' ') // всё, кроме букв и цифр, — в пробел
    .trim()
}

type Candidate = Pick<ShelfItem, 'title' | 'author' | 'source' | 'sourceId'>

/**
 * Есть ли такая запись на полке: тот же источник и id,
 * или совпадают название и автор (если у одной из записей автор не указан — только название).
 */
export function findDuplicate(
  items: readonly ShelfItem[],
  candidate: Candidate,
): ShelfItem | undefined {
  const title = normalizeText(candidate.title)
  const author = normalizeText(candidate.author)

  return items.find((item) => {
    if (
      candidate.sourceId &&
      item.source === candidate.source &&
      item.sourceId === candidate.sourceId
    ) {
      return true
    }
    if (normalizeText(item.title) !== title) return false
    const itemAuthor = normalizeText(item.author)
    return !itemAuthor || !author || itemAuthor === author
  })
}
