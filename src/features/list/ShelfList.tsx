import { CoverPlaceholder } from '../../covers/CoverPlaceholder'
import type { ShelfItem } from '../../domain/types'
import { t } from '../../i18n'
import './ShelfList.css'

interface ShelfListProps {
  items: ShelfItem[]
}

/** Режим «Список»: строка = обложка слева, справа название, автор и тип. */
export function ShelfList({ items }: ShelfListProps) {
  return (
    <ul className="shelf-list" aria-label={t.list.label}>
      {items.map((item) => (
        <li key={item.id} className="shelf-list__row">
          <CoverPlaceholder title={item.title} color={item.spineColor} />
          <div className="shelf-list__info">
            <span className="shelf-list__title">{item.title}</span>
            <span className="shelf-list__author">{item.author ?? t.list.noAuthor}</span>
            <span className="type-badge">{t.types[item.type]}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
