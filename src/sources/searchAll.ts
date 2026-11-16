import { anilist } from './anilist'
import { fantLab } from './fantlab'
import { googleBooks } from './googleBooks'
import { openLibrary } from './openLibrary'
import type { SearchResult, SearchScope, SourceAdapter } from './types'

/** Все подключённые каталоги. Порядок = приоритет при смешивании результатов. */
export const ALL_SOURCES: readonly SourceAdapter[] = [anilist, fantLab, openLibrary, googleBooks]

export interface SearchOutcome {
  results: SearchResult[]
  /** Источники, которые не ответили. */
  failed: SearchResult['source'][]
  /** Не ответил ни один источник, и похоже, что нет интернета. */
  offline: boolean
}

/**
 * Ищем во всех подходящих каталогах одновременно. Если какой-то упал,
 * показываем результаты остальных.
 */
export async function searchAll(
  query: string,
  scope: SearchScope,
  signal?: AbortSignal,
  sources: readonly SourceAdapter[] = ALL_SOURCES,
): Promise<SearchOutcome> {
  const active = sources.filter((s) => s.scopes.includes(scope))
  const settled = await Promise.allSettled(active.map((s) => s.search(query, signal)))

  const lists: SearchResult[][] = []
  const failed: SearchResult['source'][] = []
  let networkErrors = 0

  settled.forEach((result, i) => {
    const source = active[i]
    if (!source) return
    if (result.status === 'fulfilled') {
      lists.push(filterForScope(result.value, scope))
    } else {
      failed.push(source.id)
      // TypeError в fetch — это «не удалось соединиться» (нет сети, CORS)
      if (result.reason instanceof TypeError) networkErrors++
    }
  })

  const offline =
    failed.length === active.length &&
    (networkErrors === active.length || (typeof navigator !== 'undefined' && !navigator.onLine))

  return { results: interleave(lists), failed, offline }
}

/** В фильтре «Комиксы и манга» берём из книжных каталогов только комиксы и мангу. */
function filterForScope(results: SearchResult[], scope: SearchScope): SearchResult[] {
  if (scope !== 'comics') return results
  return results.filter((r) => r.type !== 'book')
}

/** Смешиваем списки по очереди: 1-й из первого, 1-й из второго, 2-й из первого… */
export function interleave<T>(lists: T[][]): T[] {
  const out: T[] = []
  const longest = Math.max(0, ...lists.map((l) => l.length))
  for (let i = 0; i < longest; i++) {
    for (const list of lists) {
      const item = list[i]
      if (item !== undefined) out.push(item)
    }
  }
  return out
}
