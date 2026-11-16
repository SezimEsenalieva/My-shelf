import { readFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import type { Page } from '@playwright/test'

// Подменённые ответы каталогов для e2e-тестов: настоящие запросы в интернет не уходят.

const fixture = (name: string): unknown =>
  JSON.parse(
    readFileSync(new URL(`../../src/sources/__fixtures__/${name}`, import.meta.url), 'utf8'),
  )

const EMPTY_OL = { numFound: 0, docs: [] }
const EMPTY_ANILIST = { data: { Page: { media: [] } } }

function openLibraryFor(q: string): unknown {
  if (q.includes('мастер')) return fixture('openlibrary-master.json')
  if (q.includes('one piece')) return fixture('openlibrary-onepiece.json')
  return EMPTY_OL
}

function fantLabFor(q: string): unknown {
  if (q.includes('мастер')) return fixture('fantlab-master.json')
  if (q.includes('скорбь')) return fixture('fantlab-satana.json')
  return []
}

function aniListFor(q: string): unknown {
  if (q.includes('one piece')) return fixture('anilist-onepiece.json')
  if (q.includes('solo leveling')) return fixture('anilist-sololeveling.json')
  if (q.includes('king')) return fixture('anilist-kingsavatar.json')
  return EMPTY_ANILIST
}

export interface CatalogOptions {
  /** Ответ Google Books: по умолчанию 429, как сейчас без ключа. */
  googleStatus?: number
}

export async function mockCatalogs(page: Page, options: CatalogOptions = {}): Promise<void> {
  const json = (body: unknown, status = 200) => ({
    status,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  })

  await page.route('https://openlibrary.org/search.json**', (route) => {
    const q = new URL(route.request().url()).searchParams.get('q')?.toLowerCase() ?? ''
    return route.fulfill(json(openLibraryFor(q)))
  })

  await page.route('https://api.fantlab.ru/**', (route) => {
    const q = new URL(route.request().url()).searchParams.get('q')?.toLowerCase() ?? ''
    return route.fulfill(json(fantLabFor(q)))
  })

  await page.route('https://graphql.anilist.co/**', (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'content-type, accept',
          'Access-Control-Allow-Methods': 'POST',
        },
      })
    }
    const body = route.request().postDataJSON() as { variables: { search: string } }
    return route.fulfill(json(aniListFor(body.variables.search.toLowerCase())))
  })

  await page.route('https://www.googleapis.com/books/**', (route) => {
    const status = options.googleStatus ?? 429
    return route.fulfill(
      status === 200
        ? json(fixture('googlebooks-mixed.json'))
        : json({ error: { code: status } }, status),
    )
  })

  // Картинки обложек: маленький однотонный PNG, чтобы проверить сохранение копии и цвет.
  const cover = solidPng(40, 60, [40, 90, 160])
  await page.route(
    /covers\.openlibrary\.org|s4\.anilist\.co|books\.google\.com|fantlab\.ru\/images/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: cover,
      }),
  )
}

/** Отключаем «интернет»: все запросы к каталогам падают с сетевой ошибкой. */
export async function goOffline(page: Page): Promise<void> {
  await page.route(/openlibrary\.org|anilist\.co|googleapis\.com|fantlab\.ru/, (route) =>
    route.abort('internetdisconnected'),
  )
}

/** Минимальный PNG одного цвета. */
function solidPng(width: number, height: number, [r, g, b]: [number, number, number]): Buffer {
  const row = Buffer.alloc(1 + width * 3)
  for (let x = 0; x < width; x++) row.set([r, g, b], 1 + x * 3)
  const raw = Buffer.concat(Array.from({ length: height }, () => row))

  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(body))
    return Buffer.concat([length, body, crc])
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header.set([8, 2, 0, 0, 0], 8) // 8 бит, RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff
  for (const byte of data) {
    crc ^= byte
    for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
  }
  return (crc ^ 0xffffffff) >>> 0
}
