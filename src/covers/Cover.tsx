import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { CoverPlaceholder } from './CoverPlaceholder'
import './Cover.css'

interface CoverProps {
  title: string
  color: string
  /** Сохранённая копия обложки — показываем её в первую очередь (работает без интернета). */
  blob?: Blob
  /** Ссылка на обложку в интернете. */
  url?: string
  size?: 'small' | 'large'
}

/** Обложка: сохранённая копия → картинка по ссылке → заглушка с названием. */
export function Cover({ title, color, blob, url, size = 'small' }: CoverProps) {
  // Что не загрузилось — запоминаем, чтобы показать заглушку.
  const [failed, setFailed] = useState<Blob | string>()
  const source = blob ?? url

  if (!source || failed === source) {
    return <CoverPlaceholder title={title} color={color} size={size} />
  }

  const common = {
    className: `cover cover--${size}`,
    alt: '',
    decoding: 'async' as const,
    style: { backgroundColor: color },
    onError: () => setFailed(source),
  }
  return typeof source === 'string' ? (
    <img {...common} src={source} loading="lazy" />
  ) : (
    <BlobImage {...common} blob={source} />
  )
}

/**
 * Картинка из Blob. Браузер показывает её по временной ссылке blob:…,
 * которую мы удаляем, когда картинка уходит с экрана (чтобы не копить память).
 */
function BlobImage({ blob, ...props }: { blob: Blob } & ComponentProps<'img'>) {
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const img = ref.current
    if (!img) return
    const objectUrl = URL.createObjectURL(blob)
    img.src = objectUrl
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])
  return <img ref={ref} {...props} />
}
