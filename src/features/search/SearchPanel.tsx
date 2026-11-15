import { useState } from 'react'
import { Cover } from '../../covers/Cover'
import { colorFromText } from '../../domain/color'
import type { ShelfItem } from '../../domain/types'
import { t } from '../../i18n'
import type { SearchResult, SearchScope } from '../../sources/types'
import { ManualAddForm } from '../add/ManualAddForm'
import { ConfirmResult } from './ConfirmResult'
import { useCatalogSearch } from './useCatalogSearch'
import './SearchPanel.css'

const SCOPES: SearchScope[] = ['all', 'books', 'comics']

interface SearchPanelProps {
  items: readonly ShelfItem[]
  onDone: () => void
}

type View = { name: 'search' } | { name: 'confirm'; result: SearchResult } | { name: 'manual' }

/** Содержимое панели «+»: поиск → подтверждение, или ручное добавление. */
export function SearchPanel({ items, onDone }: SearchPanelProps) {
  const [view, setView] = useState<View>({ name: 'search' })
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>('all')
  const search = useCatalogSearch(query, scope)

  if (view.name === 'confirm') {
    return (
      <ConfirmResult
        result={view.result}
        items={items}
        onBack={() => setView({ name: 'search' })}
        onAdded={onDone}
      />
    )
  }

  if (view.name === 'manual') {
    return (
      <div className="search__scroll">
        <BackButton onClick={() => setView({ name: 'search' })} />
        <h3 className="search__subtitle">{t.add.title}</h3>
        <ManualAddForm onAdded={onDone} initialTitle={query.trim()} />
      </div>
    )
  }

  return (
    <div className="search">
      <div className="search__controls">
        <div className="segmented" role="radiogroup" aria-label={t.search.scopeLabel}>
          {SCOPES.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={scope === value}
              className="segmented__option"
              onClick={() => setScope(value)}
            >
              {t.search.scopes[value]}
            </button>
          ))}
        </div>
        <input
          className="form__input search__input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search.inputPlaceholder}
          aria-label={t.search.inputLabel}
          autoFocus
          data-autofocus
          autoComplete="off"
          autoCorrect="off"
          enterKeyHint="search"
        />
      </div>

      <div className="search__scroll">
        <SearchStatus state={search} />

        {search.status === 'done' && search.results.length > 0 && (
          <ul className="search__results" aria-label={t.search.resultsLabel}>
            {search.results.map((result) => (
              <li key={`${result.source}:${result.sourceId}`}>
                <button
                  type="button"
                  className="search__result"
                  onClick={() => setView({ name: 'confirm', result })}
                >
                  <Cover
                    title={result.title}
                    color={result.coverColor ?? colorFromText(result.title)}
                    url={result.thumbUrl}
                  />
                  <span className="search__info">
                    <span className="search__title">{result.title}</span>
                    <span className="search__meta">
                      {[result.author, result.year].filter(Boolean).join(' · ')}
                    </span>
                    <span className="search__tags">
                      <span className="type-badge">{t.types[result.type]}</span>
                      <span className="source-label">{t.sources[result.source]}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className="button button--secondary search__manual"
          onClick={() => setView({ name: 'manual' })}
        >
          {t.search.manualAdd}
        </button>
      </div>
    </div>
  )
}

function SearchStatus({ state }: { state: ReturnType<typeof useCatalogSearch> }) {
  let text: string | undefined
  if (state.status === 'idle') text = t.search.hint
  if (state.status === 'loading') text = t.search.searching
  if (state.status === 'done') {
    if (state.offline) text = t.search.offline
    else if (state.results.length === 0) text = t.search.nothingFound
  }
  const failedNote =
    state.status === 'done' && !state.offline && state.failed.length > 0
      ? t.search.failed(state.failed.map((s) => t.sources[s]).join(', '))
      : undefined

  return (
    <div aria-live="polite">
      {text && <p className="search__status">{text}</p>}
      {failedNote && <p className="search__note">{failedNote}</p>}
    </div>
  )
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="text-button" onClick={onClick}>
      ‹ {t.search.back}
    </button>
  )
}
