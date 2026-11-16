import { afterEach, describe, expect, it, vi } from 'vitest'
import { anilist, mapAniList } from './anilist'
import { mapFantLab } from './fantlab'
import { mapGoogleBooks } from './googleBooks'
import { mapOpenLibrary } from './openLibrary'
import { interleave, searchAll } from './searchAll'
import type { SearchResult, SourceAdapter } from './types'
import olMaster from './__fixtures__/openlibrary-master.json'
import olOnePiece from './__fixtures__/openlibrary-onepiece.json'
import gbMixed from './__fixtures__/googlebooks-mixed.json'
import alOnePiece from './__fixtures__/anilist-onepiece.json'
import alSolo from './__fixtures__/anilist-sololeveling.json'
import alKing from './__fixtures__/anilist-kingsavatar.json'
import flSatana from './__fixtures__/fantlab-satana.json'
import flMaster from './__fixtures__/fantlab-master.json'

// Ответы каталогов сохранены заранее (папка __fixtures__), поэтому тесты не ходят в интернет.

describe('Open Library', () => {
  it('«Мастер и Маргарита» — книга с обложкой', () => {
    const [first] = mapOpenLibrary(olMaster)
    expect(first).toMatchObject({
      source: 'openlibrary',
      title: 'Мастер и Маргарита',
      author: 'Михаил Булгаков',
      year: 1966,
      type: 'book',
      pageCount: 439,
    })
    expect(first?.coverUrl).toMatch(/^https:\/\/covers\.openlibrary\.org\/b\/id\/\d+-L\.jpg$/)
  })

  it('манга определяется по темам', () => {
    expect(mapOpenLibrary(olOnePiece)[0]?.type).toBe('manga')
  })
})

describe('FantLab', () => {
  it('«Скорбь Сатаны» — книга на русском с обложкой (ответ-список)', () => {
    expect(mapFantLab(flSatana)[0]).toMatchObject({
      source: 'fantlab',
      title: 'Скорбь Сатаны',
      author: 'Мария Корелли',
      year: 1895,
      type: 'book',
      coverUrl: 'https://fantlab.ru/images/editions/big/39429',
    })
  })

  it('«Мастер и Маргарита» — ответ в поле matches, статьи о книге отсеяны', () => {
    const results = mapFantLab(flMaster)
    expect(results[0]).toMatchObject({ title: 'Мастер и Маргарита', author: 'Михаил Булгаков' })
    expect(results).toHaveLength(1)
  })

  it('без обложки ссылки нет', () => {
    expect(
      mapFantLab([{ work_id: 1, rusname: 'Без обложки', pic_edition_id_auto: 0 }])[0]?.coverUrl,
    ).toBeUndefined()
  })
})

describe('Google Books', () => {
  const results = mapGoogleBooks(gbMixed)

  it('книга, манга и комикс', () => {
    expect(results.map((r) => r.type)).toEqual(['book', 'manga', 'comic'])
  })

  it('ссылки на обложки переводятся на https', () => {
    expect(results[0]?.coverUrl).toMatch(/^https:\/\//)
  })

  it('год берётся из даты публикации', () => {
    expect(results[0]?.year).toBe(2014)
  })

  it('пустой ответ — пустой список', () => {
    expect(mapGoogleBooks({})).toEqual([])
  })
})

describe('AniList', () => {
  it('«One Piece» — манга, автор Eiichirou Oda', () => {
    expect(mapAniList(alOnePiece)[0]).toMatchObject({
      title: 'One Piece',
      type: 'manga',
      author: 'Eiichirou Oda',
      year: 1997,
    })
  })

  it('ранобэ по формату NOVEL', () => {
    const ace = mapAniList(alOnePiece).find((r) => r.title.includes('Ace'))
    expect(ace?.type).toBe('ranobe')
  })

  it('«Solo Leveling» — манхва', () => {
    expect(mapAniList(alSolo)[0]).toMatchObject({ title: 'Solo Leveling', type: 'manhwa' })
  })

  it('«The King’s Avatar» — маньхуа, автор оригинала Hudie Lan', () => {
    expect(mapAniList(alKing)[0]).toMatchObject({
      title: "The King's Avatar",
      type: 'manhua',
      author: 'Hudie Lan',
    })
  })

  it('отправляет GraphQL-запрос методом POST', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(alSolo)))
    vi.stubGlobal('fetch', fetchMock)
    await anilist.search('Solo Leveling')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://graphql.anilist.co')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string).variables).toEqual({ search: 'Solo Leveling' })
  })
})

describe('searchAll', () => {
  afterEach(() => vi.unstubAllGlobals())

  const result = (
    source: SearchResult['source'],
    title: string,
    type: SearchResult['type'] = 'book',
  ) => ({ source, sourceId: title, title, type }) satisfies SearchResult

  const fake = (
    id: SearchResult['source'],
    scopes: SourceAdapter['scopes'],
    impl: () => Promise<SearchResult[]>,
  ): SourceAdapter => ({ id, scopes, search: impl })

  it('если один источник упал, показывает остальные', async () => {
    const outcome = await searchAll('x', 'all', undefined, [
      fake('anilist', ['all'], async () => [result('anilist', 'A')]),
      fake('googlebooks', ['all'], async () => {
        throw new Error('429')
      }),
    ])
    expect(outcome.results.map((r) => r.title)).toEqual(['A'])
    expect(outcome.failed).toEqual(['googlebooks'])
    expect(outcome.offline).toBe(false)
  })

  it('если все упали с сетевой ошибкой — нет подключения', async () => {
    const outcome = await searchAll('x', 'all', undefined, [
      fake('anilist', ['all'], async () => {
        throw new TypeError('Failed to fetch')
      }),
      fake('openlibrary', ['all'], async () => {
        throw new TypeError('Failed to fetch')
      }),
    ])
    expect(outcome.offline).toBe(true)
  })

  it('учитывает фильтр: в «Книгах» не спрашивает AniList', async () => {
    const aniSearch = vi.fn(async () => [])
    await searchAll('x', 'books', undefined, [
      fake('anilist', ['all', 'comics'], aniSearch),
      fake('openlibrary', ['all', 'books'], async () => []),
    ])
    expect(aniSearch).not.toHaveBeenCalled()
  })

  it('в «Комиксах и манге» убирает обычные книги из книжных каталогов', async () => {
    const outcome = await searchAll('x', 'comics', undefined, [
      fake('googlebooks', ['comics'], async () => [
        result('googlebooks', 'Роман'),
        result('googlebooks', 'Watchmen', 'comic'),
      ]),
    ])
    expect(outcome.results.map((r) => r.title)).toEqual(['Watchmen'])
  })

  it('смешивает результаты по очереди', () => {
    expect(interleave([[1, 2, 3], [10], [20, 21]])).toEqual([1, 10, 20, 2, 21, 3])
  })
})
