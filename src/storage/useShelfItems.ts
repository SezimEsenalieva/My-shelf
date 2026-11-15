import { useLiveQuery } from 'dexie-react-hooks'
import type { ShelfItem } from '../domain/types'
import { shelfRepository } from './repository'

/**
 * Список записей для экранов. Сам обновляется, когда данные в базе меняются.
 * Пока база отвечает (доли секунды при запуске), возвращает undefined.
 */
export function useShelfItems(): ShelfItem[] | undefined {
  return useLiveQuery(() => shelfRepository.list(), [])
}
