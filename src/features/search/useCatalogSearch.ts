import { useEffect, useState } from 'react'
import { searchAll, type SearchOutcome } from '../../sources/searchAll'
import type { SearchScope } from '../../sources/types'

const DEBOUNCE_MS = 400
const MIN_LENGTH = 2

export type SearchState =
  { status: 'idle' } | { status: 'loading' } | ({ status: 'done' } & SearchOutcome)

/**
 * Поиск по каталогам с задержкой: запрос уходит через 400 мс после того,
 * как человек перестал печатать. Старый запрос отменяется, если начался новый.
 */
export function useCatalogSearch(query: string, scope: SearchScope): SearchState {
  const trimmed = query.trim()
  const key = `${scope}|${trimmed}`
  // Запоминаем последний ответ вместе с тем, на какой запрос он пришёл.
  const [last, setLast] = useState<{ key: string; outcome: SearchOutcome }>()

  useEffect(() => {
    if (trimmed.length < MIN_LENGTH) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      void searchAll(trimmed, scope, controller.signal).then((outcome) => {
        if (!controller.signal.aborted) setLast({ key: `${scope}|${trimmed}`, outcome })
      })
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed, scope])

  if (trimmed.length < MIN_LENGTH) return { status: 'idle' }
  if (last?.key === key) return { status: 'done', ...last.outcome }
  return { status: 'loading' }
}
