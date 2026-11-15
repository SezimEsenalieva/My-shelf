import { typeFromGoogleCategories } from '../domain/detectType'
import { fetchJson, parseYear, toHttps } from './http'
import type { SearchResult, SourceAdapter } from './types'

// Google Books: https://developers.google.com/books/docs/v1/using
// Ключ не обязателен. Если когда-нибудь появится, его можно передать через
// переменную VITE_GOOGLE_BOOKS_KEY при сборке (в коде ключа нет).

interface GoogleVolume {
  id: string
  volumeInfo: {
    title?: string
    authors?: string[]
    publishedDate?: string
    pageCount?: number
    categories?: string[]
    imageLinks?: { smallThumbnail?: string; thumbnail?: string }
  }
}

interface GoogleResponse {
  items?: GoogleVolume[]
}

export function mapGoogleBooks(data: GoogleResponse): SearchResult[] {
  return (data.items ?? [])
    .filter((item) => item.volumeInfo.title)
    .map(({ id, volumeInfo: info }) => {
      const thumb = toHttps(info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail)
      return {
        source: 'googlebooks',
        sourceId: id,
        title: info.title ?? '',
        author: info.authors?.[0],
        year: parseYear(info.publishedDate),
        type: typeFromGoogleCategories(info.categories),
        thumbUrl: thumb,
        coverUrl: thumb,
        pageCount: info.pageCount || undefined,
      }
    })
}

export const googleBooks: SourceAdapter = {
  id: 'googlebooks',
  scopes: ['all', 'books', 'comics'],
  async search(query, signal) {
    const key = import.meta.env.VITE_GOOGLE_BOOKS_KEY
    const url =
      `https://www.googleapis.com/books/v1/volumes?maxResults=10&printType=books` +
      `&q=${encodeURIComponent(query)}` +
      (key ? `&key=${encodeURIComponent(key)}` : '')
    return mapGoogleBooks(await fetchJson<GoogleResponse>('Google Books', url, { signal }))
  },
}
