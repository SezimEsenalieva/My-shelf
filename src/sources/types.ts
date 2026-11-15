import type { ItemSource, ItemType } from '../domain/types'

/** В каких каталогах искать — фильтр над полем поиска. */
export type SearchScope = 'all' | 'books' | 'comics'

/** Один найденный результат, уже приведённый к общему виду. */
export interface SearchResult {
  source: Exclude<ItemSource, 'manual'>
  sourceId: string
  title: string
  author?: string
  year?: number
  type: ItemType
  /** Маленькая обложка для списка результатов. */
  thumbUrl?: string
  /** Большая обложка для экрана подтверждения и для сохранения. */
  coverUrl?: string
  pageCount?: number
  /** Основной цвет обложки, если каталог его знает (AniList). */
  coverColor?: string
}

/**
 * Адаптер каталога. У всех адаптеров одинаковый вид,
 * поэтому новый источник добавляется одним файлом.
 */
export interface SourceAdapter {
  id: SearchResult['source']
  /** Для каких фильтров этот источник подходит. */
  scopes: readonly SearchScope[]
  search(query: string, signal?: AbortSignal): Promise<SearchResult[]>
}

/** Каталог ответил ошибкой (например, 429 — слишком много запросов). */
export class SourceError extends Error {
  readonly status: number
  constructor(source: string, status: number) {
    super(`${source}: ответ ${status}`)
    this.name = 'SourceError'
    this.status = status
  }
}
