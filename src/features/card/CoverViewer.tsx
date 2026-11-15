import { useLayoutEffect, useRef, type PointerEvent } from 'react'
import { Cover } from '../../covers/Cover'
import type { ShelfItem } from '../../domain/types'
import { t } from '../../i18n'
import { animateFromOrigin, prefersReducedMotion } from './flip'
import './CoverViewer.css'

interface CoverViewerProps {
  /** Открытая запись. undefined — карточка закрыта. */
  item?: ShelfItem
  /** Откуда «вылетает» обложка: корешок на полке или миниатюра в списке. */
  origin?: HTMLElement | null
  /** true, если origin — корешок (тогда в начале анимации видна его краска). */
  fromSpine?: boolean
  onClose: () => void
}

const SWIPE_CLOSE_PX = 90

/** Карточка с крупной обложкой поверх полки или списка. */
export function CoverViewer({ item, origin, fromSpine = false, onClose }: CoverViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const faceRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)
  const swipeRef = useRef<{ startY: number; dy: number } | null>(null)

  // Открытие: показываем <dialog> и запускаем анимацию «корешок → обложка».
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!item || !dialog) return
    closingRef.current = false
    if (!dialog.open) dialog.showModal()
    if (prefersReducedMotion()) return
    animateFromOrigin({
      origin,
      cover: coverRef.current,
      face: fromSpine ? faceRef.current : null,
      backdrop: backdropRef.current,
      details: detailsRef.current,
      direction: 'open',
    })
  }, [item, origin, fromSpine])

  async function close() {
    if (closingRef.current) return
    closingRef.current = true
    if (!prefersReducedMotion()) {
      await animateFromOrigin({
        origin,
        cover: coverRef.current,
        face: fromSpine ? faceRef.current : null,
        backdrop: backdropRef.current,
        details: detailsRef.current,
        direction: 'close',
      })
    }
    dialogRef.current?.close()
    onClose()
  }

  // Свайп вниз закрывает карточку.
  function onPointerDown(e: PointerEvent) {
    if (e.pointerType === 'mouse') return
    swipeRef.current = { startY: e.clientY, dy: 0 }
  }
  function onPointerMove(e: PointerEvent) {
    const swipe = swipeRef.current
    const card = e.currentTarget as HTMLElement
    if (!swipe) return
    swipe.dy = Math.max(0, e.clientY - swipe.startY)
    card.style.transform = `translateY(${swipe.dy}px)`
    if (backdropRef.current) {
      backdropRef.current.style.opacity = String(Math.max(0.3, 1 - swipe.dy / 400))
    }
  }
  function onPointerEnd(e: PointerEvent) {
    const swipe = swipeRef.current
    const card = e.currentTarget as HTMLElement
    swipeRef.current = null
    if (!swipe) return
    card.style.transform = ''
    if (backdropRef.current) backdropRef.current.style.opacity = ''
    if (swipe.dy > SWIPE_CLOSE_PX) void close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="viewer"
      aria-label={item?.title}
      onCancel={(e) => {
        e.preventDefault()
        void close()
      }}
    >
      {item && (
        <>
          <div ref={backdropRef} className="viewer__backdrop" onClick={() => void close()} />
          <button
            type="button"
            className="icon-button viewer__close"
            aria-label={t.common.close}
            onClick={() => void close()}
          >
            ×
          </button>
          <div
            className="viewer__card"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
          >
            <div ref={coverRef} className="viewer__cover">
              <Cover
                title={item.title}
                color={item.spineColor}
                blob={item.coverBlob}
                url={item.coverUrl}
                size="large"
              />
              <div
                ref={faceRef}
                className="viewer__face"
                style={{ backgroundColor: item.spineColor }}
              />
            </div>
            <div ref={detailsRef} className="viewer__details">
              <h2 className="viewer__title">{item.title}</h2>
              {item.author && <p className="viewer__author">{item.author}</p>}
              <p className="viewer__meta">
                <span className="type-badge">{t.types[item.type]}</span>
                {item.year && <span>{item.year}</span>}
              </p>
              <p className="viewer__added">{t.card.added(new Date(item.addedAt))}</p>
            </div>
          </div>
        </>
      )}
    </dialog>
  )
}
