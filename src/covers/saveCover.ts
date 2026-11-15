import { dominantColor, toSpineColor } from './dominantColor'

const MAX_SIDE = 600

export interface SavedCover {
  /** Уменьшенная копия обложки (JPEG) или undefined, если скачать не вышло. */
  blob?: Blob
  /** Цвет корешка, посчитанный по обложке. */
  color?: string
}

/**
 * Скачиваем обложку, уменьшаем до 600 px по длинной стороне и считаем её цвет.
 * Если сайт не разрешает забрать картинку (CORS) или нет сети — возвращаем пустой результат,
 * и тогда на полке хранится только ссылка.
 */
export async function saveCover(url: string, signal?: AbortSignal): Promise<SavedCover> {
  try {
    // cache: 'no-store' — запрашиваем картинку заново. Иначе браузер может взять её
    // из кэша, куда она попала через обычный <img> без разрешения CORS, и отказать.
    const response = await fetch(url, { mode: 'cors', cache: 'no-store', signal })
    if (!response.ok) return {}
    const source = await response.blob()
    if (!source.type.startsWith('image/')) return {}

    const bitmap = await createImageBitmap(source)
    // Open Library отдаёт картинку 1×1, если обложки нет — такую не сохраняем.
    if (bitmap.width < 10 || bitmap.height < 10) return {}

    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return {}
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const color = colorFromCanvas(ctx, width, height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    )
    return { blob: blob ?? undefined, color }
  } catch {
    return {}
  }
}

function colorFromCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): string | undefined {
  try {
    const { data } = ctx.getImageData(0, 0, width, height)
    const color = dominantColor(data)
    return color ? toSpineColor(color) : undefined
  } catch {
    return undefined
  }
}
