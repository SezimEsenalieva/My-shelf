import { colorFromText } from '../../domain/color'
import type { ItemType, ShelfItem } from '../../domain/types'
import { saveCover } from '../../covers/saveCover'
import { shelfRepository } from '../../storage/repository'
import type { SearchResult } from '../../sources/types'

/**
 * Ставим найденную книгу на полку: сохраняем копию обложки и цвет корешка.
 * Цвет: по обложке → цвет из каталога → стабильный цвет из названия.
 */
export async function addFromResult(result: SearchResult, type: ItemType): Promise<ShelfItem> {
  const cover = result.coverUrl ? await saveCover(result.coverUrl) : {}
  const item = {
    title: result.title,
    author: result.author,
    type,
    year: result.year,
    coverUrl: result.coverUrl,
    spineColor: cover.color ?? result.coverColor ?? colorFromText(result.title),
    pageCount: result.pageCount,
    source: result.source,
    sourceId: result.sourceId,
  }
  if (!cover.blob) return shelfRepository.add(item)
  try {
    return await shelfRepository.add({ ...item, coverBlob: cover.blob })
  } catch {
    // Не получилось сохранить копию обложки — сохраняем запись хотя бы со ссылкой.
    return shelfRepository.add(item)
  }
}
