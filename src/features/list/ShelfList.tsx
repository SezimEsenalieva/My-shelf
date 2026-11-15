import { Cover } from '../../covers/Cover'
import type { ShelfItem } from '../../domain/types'
import { t } from '../../i18n'
import './ShelfList.css'

interface ShelfListProps {
  items: readonly ShelfItem[]
  openId?: string
  onOpen: (item: ShelfItem, origin: HTMLElement) => void
}

/** Режим «Список»: строка = обложка слева, справа название, автор и тип. */
export function ShelfList({ items, openId, onOpen }: ShelfListProps) {
  return (
    <ul className="shelf-list" aria-label={t.list.label}>
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className="shelf-list__row"
            data-open={item.id === openId || undefined}
            onClick={(e) => {
              const cover = e.currentTarget.querySelector<HTMLElement>('.shelf-list__cover')
              onOpen(item, cover ?? e.currentTarget)
            }}
          >
            <span className="shelf-list__cover">
              <Cover
                title={item.title}
                color={item.spineColor}
                blob={item.coverBlob}
                url={item.coverUrl}
              />
            </span>
            <span className="shelf-list__info">
              <span className="shelf-list__title">{item.title}</span>
              <span className="shelf-list__author">{item.author ?? t.list.noAuthor}</span>
              <span className="type-badge">{t.types[item.type]}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
