import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react'
import { t } from '../i18n'
import './Sheet.css'

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** Высокая панель почти на весь экран (для поиска). */
  tall?: boolean
}

/**
 * Панель, которая выезжает снизу поверх экрана (как в приложениях iOS).
 * Построена на встроенном элементе <dialog>: он сам удерживает фокус внутри
 * и правильно озвучивается VoiceOver.
 */
export function Sheet({ open, title, onClose, children, tall = false }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  // useLayoutEffect срабатывает сразу, ещё внутри нажатия на кнопку, —
  // только так iPhone соглашается показать клавиатуру для поля ввода.
  useLayoutEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // <dialog> сам ставит фокус на первую кнопку; переносим его на нужное поле.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  useFollowVisualViewport(ref, open)

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // Тап по затемнённому фону (вне панели) закрывает её.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {open && (
        <div className={`sheet__panel${tall ? ' sheet__panel--tall' : ''}`}>
          <header className="sheet__header">
            <h2 className="sheet__title">{title}</h2>
            <button
              type="button"
              className="icon-button"
              aria-label={t.common.close}
              onClick={onClose}
            >
              ×
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  )
}

/**
 * На iPhone клавиатура не уменьшает страницу, а закрывает её низ, и Safari сдвигает
 * видимую область. Поэтому панель подстраивается под видимую часть экрана (visualViewport):
 * верх панели — у верха видимой области, высота — до клавиатуры.
 */
function useFollowVisualViewport(ref: RefObject<HTMLDialogElement | null>, open: boolean) {
  useEffect(() => {
    const dialog = ref.current
    const viewport = window.visualViewport
    if (!open || !dialog || !viewport) return

    const update = () => {
      dialog.style.setProperty('--vv-top', `${viewport.offsetTop}px`)
      dialog.style.setProperty('--vv-height', `${viewport.height}px`)
    }
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [ref, open])
}
