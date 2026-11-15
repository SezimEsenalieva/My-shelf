import { useState } from 'react'
import { ManualAddForm } from '../features/add/ManualAddForm'
import { ShelfList } from '../features/list/ShelfList'
import { t } from '../i18n'
import { useShelfItems } from '../storage/useShelfItems'
import { Sheet } from '../ui/Sheet'
import './App.css'

export function App() {
  const items = useShelfItems()
  const [adding, setAdding] = useState(false)

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

      <main className="app__content">
        {items === undefined ? (
          <p className="app__loading">{t.common.loading}</p>
        ) : items.length === 0 ? (
          <EmptyShelf onAdd={() => setAdding(true)} />
        ) : (
          <ShelfList items={items} />
        )}
      </main>

      <footer className="app__footer">
        {t.footer.builtAt}{' '}
        {new Date(__BUILD_TIME__).toLocaleString('ru-RU', {
          dateStyle: 'long',
          timeStyle: 'short',
        })}
      </footer>

      <Sheet open={adding} title={t.add.title} onClose={() => setAdding(false)}>
        <ManualAddForm onAdded={() => setAdding(false)} />
      </Sheet>
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
