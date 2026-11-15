import { useLayoutEffect, useRef, type ReactNode } from 'react'
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
