import { textColorFor } from '../domain/color'
import './CoverPlaceholder.css'

interface CoverPlaceholderProps {
  title: string
  color: string
  size?: 'small' | 'large'
}

/** Обложка-заглушка: название на цветном фоне. Для записей без картинки. */
export function CoverPlaceholder({ title, color, size = 'small' }: CoverPlaceholderProps) {
  return (
    <div
      className={`cover-placeholder cover-placeholder--${size}`}
      style={{ backgroundColor: color, color: textColorFor(color) }}
      aria-hidden="true"
    >
      <span className="cover-placeholder__title">{title}</span>
    </div>
  )
}
