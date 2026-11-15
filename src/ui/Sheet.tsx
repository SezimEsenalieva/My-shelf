import { useEffect, useRef, type ReactNode } from 'react'
import { t } from '../i18n'
import './Sheet.css'

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Панель, которая выезжает снизу поверх экрана (как в приложениях iOS).
 * Построена на встроенном элементе <dialog>: он сам удерживает фокус внутри
 * и правильно озвучивается VoiceOver.
 */
export function Sheet({ open, title, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
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
        <div className="sheet__panel">
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
