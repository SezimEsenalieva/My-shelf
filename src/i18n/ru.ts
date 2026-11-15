import type { ItemType } from '../domain/types'

// Все тексты интерфейса — здесь. Чтобы добавить другой язык,
// достаточно создать такой же файл (например, ky.ts) с теми же ключами.

const types: Record<ItemType, string> = {
  book: 'Книга',
  comic: 'Комикс',
  manga: 'Манга',
  manhwa: 'Манхва',
  manhua: 'Маньхуа',
  ranobe: 'Ранобэ',
  other: 'Другое',
}

export const ru = {
  appName: 'Моя полка',
  types,
  common: {
    close: 'Закрыть',
    loading: 'Загрузка…',
  },
  header: {
    add: 'Добавить',
  },
  empty: {
    title: 'Добавьте первую прочитанную книгу',
    action: 'Добавить',
  },
  list: {
    label: 'Прочитанное',
    count: (n: number) => `${n} ${plural(n, 'запись', 'записи', 'записей')}`,
    noAuthor: 'Автор не указан',
  },
  footer: {
    builtAt: 'Версия от',
  },
  add: {
    title: 'Добавить вручную',
    fieldTitle: 'Название',
    fieldAuthor: 'Автор',
    fieldType: 'Тип',
    titleRequired: 'Введите название',
    submit: 'Поставить на полку',
    error: 'Не получилось сохранить. Попробуйте ещё раз.',
  },
} as const

export type Strings = typeof ru

/** Русские окончания: 1 запись, 2 записи, 5 записей. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
