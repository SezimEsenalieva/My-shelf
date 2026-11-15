import { describe, expect, it } from 'vitest'
import {
  typeFromAniList,
  typeFromGoogleCategories,
  typeFromOpenLibrarySubjects,
} from './detectType'

describe('typeFromAniList', () => {
  it.each([
    ['MANGA', 'JP', 'manga'],
    ['MANGA', 'KR', 'manhwa'],
    ['MANGA', 'CN', 'manhua'],
    ['MANGA', 'TW', 'manhua'],
    ['ONE_SHOT', 'JP', 'manga'],
    ['NOVEL', 'JP', 'ranobe'],
    ['NOVEL', 'CN', 'ranobe'],
    ['MANGA', 'FR', 'other'],
    [null, null, 'other'],
  ] as const)('формат %s, страна %s → %s', (format, country, expected) => {
    expect(typeFromAniList(format, country)).toBe(expected)
  })
})

describe('typeFromGoogleCategories', () => {
  it('обычная книга', () => {
    expect(typeFromGoogleCategories(['Fiction'])).toBe('book')
    expect(typeFromGoogleCategories()).toBe('book')
  })
  it('комикс', () => {
    expect(typeFromGoogleCategories(['Comics & Graphic Novels'])).toBe('comic')
  })
  it('манга внутри комиксов', () => {
    expect(typeFromGoogleCategories(['Comics & Graphic Novels / Manga / General'])).toBe('manga')
  })
})

describe('typeFromOpenLibrarySubjects', () => {
  it('манга по теме form:manga', () => {
    expect(typeFromOpenLibrarySubjects(['form:manga', 'form:graphic novel'])).toBe('manga')
  })
  it('комикс', () => {
    expect(typeFromOpenLibrarySubjects(['Comics & graphic novels, crime & mystery'])).toBe('comic')
  })
  it('книга', () => {
    expect(typeFromOpenLibrarySubjects(['Fiction, fantasy, general'])).toBe('book')
  })
})
