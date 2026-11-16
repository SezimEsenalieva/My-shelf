// «Предметная область» — описание того, с чем работает приложение,
// без привязки к экранам и базе данных.

/** Тип издания. У каждой записи ровно один тип. */
export const ITEM_TYPES = ['book', 'comic', 'manga', 'manhwa', 'manhua', 'ranobe', 'other'] as const

export type ItemType = (typeof ITEM_TYPES)[number]

/** Откуда взята запись: из каталога или добавлена вручную. */
export type ItemSource = 'manual' | 'openlibrary' | 'googlebooks' | 'anilist' | 'fantlab'

/** Одна запись на полке. */
export interface ShelfItem {
  id: string
  title: string
  author?: string
  type: ItemType
  year?: number
  /** Ссылка на обложку в интернете. */
  coverUrl?: string
  /** Сохранённая на телефоне копия обложки (для работы без интернета). */
  coverBlob?: Blob
  /** Цвет корешка в формате #rrggbb. */
  spineColor: string
  pageCount?: number
  source: ItemSource
  /** id записи в каталоге-источнике (для ручных записей нет). */
  sourceId?: string
  /** Когда поставлена на полку (миллисекунды с 1970 года). */
  addedAt: number
}

/** Данные, которые нужны, чтобы создать новую запись. Остальное заполнится само. */
export type NewShelfItem = Omit<ShelfItem, 'id' | 'addedAt' | 'spineColor'> & {
  spineColor?: string
}

/** Поля, которые можно изменить у существующей записи. */
export type ShelfItemChanges = Partial<Pick<ShelfItem, 'title' | 'author' | 'type'>>
