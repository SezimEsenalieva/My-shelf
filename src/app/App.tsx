import { useState } from 'react'
import { CoverViewer } from '../features/card/CoverViewer'
import { ShelfList } from '../features/list/ShelfList'
import { SearchPanel } from '../features/search/SearchPanel'
import { Bookshelf } from '../features/shelf/Bookshelf'
import type { ShelfItem } from '../domain/types'
import { t } from '../i18n'
import { useShelfItems } from '../storage/useShelfItems'
import { Sheet } from '../ui/Sheet'
import { useViewMode, type ViewMode } from './useViewMode'
import './App.css'

const VIEWS: ViewMode[] = ['shelf', 'list']

export function App() {
  const items = useShelfItems()
  const [view, setView] = useViewMode()
  const [adding, setAdding] = useState(false)
  const [opened, setOpened] = useState<{ id: string; origin: HTMLElement; fromSpine: boolean }>()

  // Берём запись из свежего списка, чтобы карточка показывала актуальные данные.
  const openedItem = opened && items?.find((item) => item.id === opened.id)

  function open(fromSpine: boolean) {
    return (item: ShelfItem, origin: HTMLElement) => setOpened({ id: item.id, origin, fromSpine })
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">{t.appName}</h1>
          {items && items.length > 0 && <p className="app__count">{t.list.count(items.length)}</p>}
        </div>
        <button
          type="button"
          className="icon-button icon-button--accent"
          aria-label={t.header.add}
          onClick={() => setAdding(true)}
        >
          +
        </button>
      </header>

      {items && items.length > 0 && (
        <div className="segmented app__views" role="radiogroup" aria-label={t.view.label}>
          {VIEWS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={view === value}
              className="segmented__option"
              onClick={() => setView(value)}
            >
              {t.view[value]}
            </button>
          ))}
        </div>
      )}

      <main className="app__content">
        {items === undefined ? (
          <p className="app__loading">{t.common.loading}</p>
        ) : items.length === 0 ? (
          <EmptyShelf onAdd={() => setAdding(true)} />
        ) : view === 'shelf' ? (
          <Bookshelf items={items} openId={opened?.id} onOpen={open(true)} />
        ) : (
          <ShelfList items={items} openId={opened?.id} onOpen={open(false)} />
        )}
      </main>

      <footer className="app__footer">
        {t.footer.builtAt}{' '}
        {new Date(__BUILD_TIME__).toLocaleString('ru-RU', {
          dateStyle: 'long',
          timeStyle: 'short',
        })}
      </footer>

      <Sheet open={adding} title={t.search.title} onClose={() => setAdding(false)} tall>
        <SearchPanel items={items ?? []} onDone={() => setAdding(false)} />
      </Sheet>

      <CoverViewer
        item={openedItem}
        origin={opened?.origin}
        fromSpine={opened?.fromSpine}
        onClose={() => setOpened(undefined)}
      />
    </div>
  )
}

function EmptyShelf({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty">
      <div className="empty__bookcase" aria-hidden="true">
        <div className="empty__board" />
        <div className="empty__board" />
        <div className="empty__board" />
      </div>
      <p className="empty__title">{t.empty.title}</p>
      <button type="button" className="button button--primary" onClick={onAdd}>
        + {t.empty.action}
      </button>
    </div>
  )
}
