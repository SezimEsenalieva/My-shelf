import { useState } from 'react'

export type ViewMode = 'shelf' | 'list'

const KEY = 'my-shelf:view'

/** Выбранный режим «Полка / Список». Запоминается в браузере и восстанавливается при запуске. */
export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(() => {
    try {
      return localStorage.getItem(KEY) === 'list' ? 'list' : 'shelf'
    } catch {
      return 'shelf'
    }
  })

  function update(next: ViewMode) {
    setMode(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Хранилище недоступно (например, приватный режим) — просто не запоминаем.
    }
  }

  return [mode, update]
}
