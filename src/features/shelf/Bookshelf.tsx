import { useEffect, useState, type CSSProperties } from 'react'
import { textColorFor } from '../../domain/color'
import { spineSize, titleFontSize } from '../../domain/spine'
import { arrangeShelf, spineStyle } from '../../domain/spineStyle'
import type { ShelfItem } from '../../domain/types'
import { t } from '../../i18n'
import './Bookshelf.css'

interface BookshelfProps {
  items: readonly ShelfItem[]
  /** Запись, обложка которой сейчас открыта: её корешок «уехал» с полки. */
  openId?: string
  onOpen: (item: ShelfItem, origin: HTMLElement) => void
}

/** Режим «Полка»: белый крашеный шкаф, корешки стоят, иногда наклоняются или лежат стопкой. */
export function Bookshelf({ items, openId, onOpen }: BookshelfProps) {
  return (
    <ul className="bookcase" aria-label={t.shelf.label}>
      {arrangeShelf(items).map((slot) =>
        slot.kind === 'standing' ? (
          <li key={slot.item.id} className="bookcase__slot">
            <Spine item={slot.item} open={slot.item.id === openId} onOpen={onOpen} />
          </li>
        ) : (
          <li key={slot.items[0]?.id} className="bookcase__slot bookcase__slot--stack">
            {slot.items.map((item) => (
              <Spine key={item.id} item={item} open={item.id === openId} onOpen={onOpen} lying />
            ))}
          </li>
        ),
      )}
    </ul>
  )
}

interface SpineProps {
  item: ShelfItem
  open: boolean
  onOpen: BookshelfProps['onOpen']
  lying?: boolean
}

function Spine({ item, open, onOpen, lying = false }: SpineProps) {
  const { height, width } = spineSize(item)
  const style = spineStyle(item)
  const art = useCoverUrl(item)
  // Картинку с обложки показываем на современных изданиях, мягких обложках, манге и комиксах.
  const showArt = art && style.variant !== 'classic'
  const ink = textColorFor(item.spineColor)
  const author = item.author ? shortAuthor(item.author) : undefined
  // Надпись идёт вдоль корешка (его высота), поперёк — толщина. Для лежащей книги так же.
  const along = height
  const showAuthor = author && width >= 24
  const decor = style.variant === 'classic' ? 44 : style.variant === 'manga' ? along * 0.22 + 8 : 24
  const titleSize = titleFontSize({
    title: item.title,
    length: along,
    thickness: width,
    reserved: decor + (showAuthor ? Math.min(along * 0.42, author.length * 5.6) + 6 : 0),
  })

  const css = {
    width: lying ? height : width,
    height: lying ? width : height,
    marginRight:
      style.gap + (style.lean ? Math.round(height * Math.sin((style.lean * Math.PI) / 180)) : 0),
    transform: style.lean ? `rotate(${style.lean}deg)` : undefined,
    backgroundColor: item.spineColor,
    color: ink,
    '--spine-color': item.spineColor,
    '--ink': ink,
    '--art': showArt ? `url("${art}")` : undefined,
    '--title-size': `${titleSize}px`,
  } as CSSProperties

  return (
    <button
      type="button"
      className={[
        'spine',
        `spine--${style.variant}`,
        `spine--${style.material}`,
        lying && 'spine--lying',
        showArt && 'spine--art',
        ink !== '#1f1a15' && 'spine--dark',
      ]
        .filter(Boolean)
        .join(' ')}
      style={css}
      data-open={open || undefined}
      aria-label={t.shelf.spineLabel(item.title, item.author, t.types[item.type])}
      onClick={(e) => onOpen(item, e.currentTarget)}
    >
      <span className="spine__top" aria-hidden="true">
        {style.variant === 'comic' && item.title.trim().charAt(0).toUpperCase()}
      </span>
      <span className="spine__title" aria-hidden="true">
        {item.title}
      </span>
      {showAuthor && (
        <span className="spine__author" aria-hidden="true">
          {author}
        </span>
      )}
      <span className="spine__bottom" aria-hidden="true" />
    </button>
  )
}

/** На корешке обычно только фамилия: «Михаил Булгаков» → «Булгаков». */
function shortAuthor(author: string): string {
  const parts = author.trim().split(/\s+/)
  return parts.length > 1 ? (parts[parts.length - 1] ?? author) : author
}

/** Ссылка на обложку для корешка: сохранённая копия или адрес в интернете. */
function useCoverUrl(item: ShelfItem): string | undefined {
  const [blobUrl, setBlobUrl] = useState<string>()
  const blob = item.coverBlob
  useEffect(() => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ссылка на Blob создаётся только здесь
    setBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [blob])
  return blob ? blobUrl : item.coverUrl
}
