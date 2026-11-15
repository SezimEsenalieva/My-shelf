import type { CSSProperties } from 'react'
import { textColorFor } from '../../domain/color'
import { spineSize } from '../../domain/spine'
import type { ShelfItem } from '../../domain/types'
import { t } from '../../i18n'
import './Bookshelf.css'

interface BookshelfProps {
  items: readonly ShelfItem[]
  /** Запись, обложка которой сейчас открыта: её корешок «уехал» с полки. */
  openId?: string
  onOpen: (item: ShelfItem, origin: HTMLElement) => void
}

/** Режим «Полка»: книжный шкаф, корешки стоят вертикально и переносятся на следующую полку. */
export function Bookshelf({ items, openId, onOpen }: BookshelfProps) {
  return (
    <ul className="bookcase" aria-label={t.shelf.label}>
      {items.map((item) => (
        <li key={item.id} className="bookcase__slot">
          <Spine item={item} open={item.id === openId} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  )
}

interface SpineProps {
  item: ShelfItem
  open: boolean
  onOpen: BookshelfProps['onOpen']
}

function Spine({ item, open, onOpen }: SpineProps) {
  const { height, width } = spineSize(item)
  const style = {
    height,
    width,
    backgroundColor: item.spineColor,
    color: textColorFor(item.spineColor),
  } satisfies CSSProperties

  return (
    <button
      type="button"
      className="spine"
      style={style}
      data-open={open || undefined}
      aria-label={t.shelf.spineLabel(item.title, item.author, t.types[item.type])}
      onClick={(e) => onOpen(item, e.currentTarget)}
    >
      <span className="spine__title" aria-hidden="true">
        {item.title}
      </span>
      {item.author && width >= 26 && (
        <span className="spine__author" aria-hidden="true">
          {item.author}
        </span>
      )}
    </button>
  )
}
