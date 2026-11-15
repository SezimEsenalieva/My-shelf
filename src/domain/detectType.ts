import type { ItemType } from './types'

// Автоматическое определение типа по данным каталога (таблица «Типы изданий» в ТЗ).
// Тип потом можно поменять вручную на экране подтверждения.

/** AniList: сначала смотрим формат (ранобэ), потом страну происхождения. */
export function typeFromAniList(format: string | null, country: string | null): ItemType {
  if (format === 'NOVEL') return 'ranobe'
  switch (country) {
    case 'JP':
      return 'manga'
    case 'KR':
      return 'manhwa'
    case 'CN':
    case 'TW':
      return 'manhua'
    default:
      return 'other'
  }
}

/** Google Books: жанры вида «Comics & Graphic Novels / Manga / …». */
export function typeFromGoogleCategories(categories: readonly string[] = []): ItemType {
  const all = categories.join(' | ').toLowerCase()
  if (all.includes('comics & graphic novels')) {
    if (/\bmanga\b/.test(all)) return 'manga'
    return 'comic'
  }
  return 'book'
}

/** Open Library: темы (subjects) вида «form:manga», «Comics & graphic novels». */
export function typeFromOpenLibrarySubjects(subjects: readonly string[] = []): ItemType {
  const all = subjects.join(' | ').toLowerCase()
  if (/\bmanga\b/.test(all)) return 'manga'
  if (/\bcomic|graphic novel/.test(all)) return 'comic'
  return 'book'
}
