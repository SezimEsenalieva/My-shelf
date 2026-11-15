import { typeFromOpenLibrarySubjects } from '../domain/detectType'
import { fetchJson } from './http'
import type { SearchResult, SourceAdapter } from './types'

// Open Library: https://openlibrary.org/dev/docs/api/search

interface OpenLibraryDoc {
  key: string
  title?: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number
  number_of_pages_median?: number
  subject?: string[]
}

interface OpenLibraryResponse {
  docs: OpenLibraryDoc[]
}

const FIELDS = 'key,title,author_name,first_publish_year,cover_i,number_of_pages_median,subject'

export function mapOpenLibrary(data: OpenLibraryResponse): SearchResult[] {
  return data.docs
    .filter((doc) => doc.title)
    .map((doc) => {
      const cover = doc.cover_i
        ? (size: string) => `https://covers.openlibrary.org/b/id/${doc.cover_i}-${size}.jpg`
        : undefined
      return {
        source: 'openlibrary',
        sourceId: doc.key,
        title: doc.title ?? '',
        author: doc.author_name?.[0],
        year: doc.first_publish_year,
        type: typeFromOpenLibrarySubjects(doc.subject),
        thumbUrl: cover?.('S'),
        coverUrl: cover?.('L'),
        pageCount: doc.number_of_pages_median,
      }
    })
}

export const openLibrary: SourceAdapter = {
  id: 'openlibrary',
  scopes: ['all', 'books'],
  async search(query, signal) {
    const url =
      `https://openlibrary.org/search.json?limit=10&fields=${FIELDS}` +
      `&q=${encodeURIComponent(query)}`
    return mapOpenLibrary(await fetchJson<OpenLibraryResponse>('Open Library', url, { signal }))
  },
}
