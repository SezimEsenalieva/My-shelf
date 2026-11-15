import { typeFromAniList } from '../domain/detectType'
import { fetchJson } from './http'
import type { SearchResult, SourceAdapter } from './types'

// AniList (GraphQL): https://docs.anilist.co/
// Тип MANGA в AniList включает мангу, манхву, маньхуа и ранобэ.

const QUERY = `
query ($search: String) {
  Page(perPage: 10) {
    media(search: $search, type: MANGA, isAdult: false, sort: SEARCH_MATCH) {
      id
      format
      countryOfOrigin
      title { romaji english native }
      startDate { year }
      coverImage { large medium color }
      staff(perPage: 4, sort: RELEVANCE) { edges { role node { name { full } } } }
    }
  }
}`

interface AniListMedia {
  id: number
  format: string | null
  countryOfOrigin: string | null
  title: { romaji: string | null; english: string | null; native: string | null }
  startDate: { year: number | null }
  coverImage: { large: string | null; medium: string | null; color: string | null }
  staff: { edges: { role: string; node: { name: { full: string } } }[] }
}

interface AniListResponse {
  data?: { Page: { media: AniListMedia[] } }
  errors?: { message: string }[]
}

/** Чем меньше число, тем больше роль похожа на «автора». Переводчики и ассистенты — не авторы. */
function authorRank(role: string): number | undefined {
  const r = role.toLowerCase()
  if (/^original (creator|story)/.test(r)) return 0
  if (r.startsWith('story & art')) return 1
  if (r.startsWith('story')) return 2
  if (r.startsWith('art')) return 3
  return undefined
}

export function pickAuthor(edges: AniListMedia['staff']['edges']): string | undefined {
  let best: { rank: number; name: string } | undefined
  for (const edge of edges) {
    const rank = authorRank(edge.role)
    if (rank !== undefined && (!best || rank < best.rank))
      best = { rank, name: edge.node.name.full }
  }
  return best?.name
}

export function mapAniList(data: AniListResponse): SearchResult[] {
  return (data.data?.Page.media ?? []).map((media) => ({
    source: 'anilist',
    sourceId: String(media.id),
    // Английское название, а если его нет — японское латиницей (ромадзи).
    title: media.title.english ?? media.title.romaji ?? media.title.native ?? '',
    author: pickAuthor(media.staff.edges),
    year: media.startDate.year ?? undefined,
    type: typeFromAniList(media.format, media.countryOfOrigin),
    thumbUrl: media.coverImage.medium ?? undefined,
    coverUrl: media.coverImage.large ?? undefined,
    coverColor: media.coverImage.color ?? undefined,
  }))
}

export const anilist: SourceAdapter = {
  id: 'anilist',
  scopes: ['all', 'comics'],
  async search(query, signal) {
    const data = await fetchJson<AniListResponse>('AniList', 'https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { search: query } }),
      signal,
    })
    return mapAniList(data)
  },
}
