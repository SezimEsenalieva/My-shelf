import type { ItemSource, ItemType } from '../domain/types'
import type { SearchScope } from '../sources/types'

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

const sources: Record<ItemSource, string> = {
  manual: 'Вручную',
  openlibrary: 'Open Library',
  googlebooks: 'Google Books',
  anilist: 'AniList',
  fantlab: 'FantLab',
}

const scopes: Record<SearchScope, string> = {
  all: 'Всё',
  books: 'Книги',
  comics: 'Комиксы и манга',
}

export const ru = {
  appName: 'Моя полка',
  types,
  sources,
  common: {
    close: 'Закрыть',
    loading: 'Загрузка…',
  },
  header: {
    add: 'Добавить',
  },
  view: {
    label: 'Вид',
    shelf: 'Полка',
    list: 'Список',
  },
  shelf: {
    label: 'Полка',
    spineLabel: (title: string, author: string | undefined, type: string) =>
      [title, author, type].filter(Boolean).join(', '),
  },
  card: {
    added: (date: Date) =>
      `Добавлено ${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`,
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
  search: {
    title: 'Поиск',
    scopes,
    scopeLabel: 'Где искать',
    inputLabel: 'Название или автор',
    inputPlaceholder: 'Название или автор',
    hint: 'Введите хотя бы 2 буквы',
    searching: 'Ищу…',
    nothingFound: 'Ничего не нашлось',
    offline: 'Нет подключения. Поиск заработает, когда появится интернет.',
    failed: (names: string) => `Не ответили: ${names}`,
    resultsLabel: 'Результаты поиска',
    manualAdd: 'Добавить вручную',
    back: 'Назад',
  },
  confirm: {
    duplicate: 'Уже на полке',
    duplicateHint: 'Такая запись уже есть. Можно добавить ещё раз, например другое издание.',
    add: 'Поставить на полку',
    addAnyway: 'Всё равно добавить',
    saving: 'Сохраняю…',
    year: 'Год',
    source: 'Источник',
    pages: 'Страниц',
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
