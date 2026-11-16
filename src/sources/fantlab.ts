import type { ItemType } from '../domain/types'
import { fetchJson } from './http'
import type { SearchResult, SourceAdapter } from './types'

// FantLab — большая русскоязычная база книг: https://api.fantlab.ru
// Ключ не нужен, запросы из браузера разрешены (CORS).
// Обложки отдаются без разрешения CORS: их можно показать, но не сохранить копией.

interface FantLabWork {
  work_id: number
  name?: string
  rusname?: string
  autor_rusname?: string
  all_autor_rusname?: string
  all_autor_name?: string
  year?: number
  /** Вид произведения: novel, story, comix, article, essay… */
  name_eng?: string
  pic_edition_id?: number
  pic_edition_id_auto?: number
}

/** API отвечает то списком, то объектом с полем matches. */
type FantLabResponse = FantLabWork[] | { matches?: FantLabWork[] }

/** Статьи, эссе и рецензии о книгах — это не книги, их не показываем. */
const NOT_BOOKS = new Set(['article', 'essay', 'review', 'interview', 'other'])

function typeFromFantLab(kind: string | undefined): ItemType {
  const k = (kind ?? '').toLowerCase()
  if (k.includes('manga')) return 'manga'
  if (k.includes('comi') || k.includes('graphic')) return 'comic'
  return 'book'
}

export function mapFantLab(data: FantLabResponse): SearchResult[] {
  const works = Array.isArray(data) ? data : (data.matches ?? [])
  return works
    .filter((w) => (w.rusname || w.name) && !NOT_BOOKS.has(w.name_eng ?? ''))
    .map((w) => {
      const pic = w.pic_edition_id || w.pic_edition_id_auto
      const cover = pic
        ? (size: string) => `https://fantlab.ru/images/editions/${size}/${pic}`
        : undefined
      return {
        source: 'fantlab',
        sourceId: String(w.work_id),
        title: w.rusname || w.name || '',
        author: w.autor_rusname || w.all_autor_rusname || w.all_autor_name || undefined,
        year: w.year || undefined,
        type: typeFromFantLab(w.name_eng),
        thumbUrl: cover?.('small'),
        coverUrl: cover?.('big'),
      }
    })
}

export const fantLab: SourceAdapter = {
  id: 'fantlab',
  scopes: ['all', 'books'],
  async search(query, signal) {
    const url = `https://api.fantlab.ru/search-works?page=1&q=${encodeURIComponent(query)}`
    return mapFantLab(await fetchJson<FantLabResponse>('FantLab', url, { signal }))
  },
}
