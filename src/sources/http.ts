import { SourceError } from './types'

/** Запрос JSON с понятной ошибкой, если каталог ответил не 200. */
export async function fetchJson<T>(
  source: string,
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...init.headers },
  })
  if (!response.ok) throw new SourceError(source, response.status)
  return (await response.json()) as T
}

/** Год из строки вида «2014-05-01» или «1987». */
export function parseYear(value: string | number | null | undefined): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  const match = value?.match(/\d{4}/)
  return match ? Number(match[0]) : undefined
}

/** Картинки только по https (иначе Safari их заблокирует). */
export function toHttps(url: string | undefined): string | undefined {
  return url?.replace(/^http:\/\//, 'https://')
}
