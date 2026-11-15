import { useState } from 'react'
import { Cover } from '../../covers/Cover'
import { colorFromText } from '../../domain/color'
import { findDuplicate } from '../../domain/duplicates'
import { ITEM_TYPES, type ItemType, type ShelfItem } from '../../domain/types'
import { t } from '../../i18n'
import type { SearchResult } from '../../sources/types'
import { addFromResult } from './addFromResult'
import { BackButton } from './SearchPanel'

interface ConfirmResultProps {
  result: SearchResult
  items: readonly ShelfItem[]
  onBack: () => void
  onAdded: () => void
}

/** Экран подтверждения: большая обложка, данные, выбор типа → «Поставить на полку». */
export function ConfirmResult({ result, items, onBack, onAdded }: ConfirmResultProps) {
  const [type, setType] = useState<ItemType>(result.type)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const duplicate = findDuplicate(items, result)

  async function handleAdd() {
    setSaving(true)
    setError(false)
    try {
      await addFromResult(result, type)
      onAdded()
    } catch {
      setError(true)
      setSaving(false)
    }
  }

  return (
    <div className="search__scroll confirm">
      <BackButton onClick={onBack} />
      <div className="confirm__cover">
        <Cover
          title={result.title}
          color={result.coverColor ?? colorFromText(result.title)}
          url={result.coverUrl}
          size="large"
        />
      </div>
      <h3 className="confirm__title">{result.title}</h3>
      {result.author && <p className="confirm__author">{result.author}</p>}

      <dl className="confirm__facts">
        {result.year && (
          <div>
            <dt>{t.confirm.year}</dt>
            <dd>{result.year}</dd>
          </div>
        )}
        {result.pageCount && (
          <div>
            <dt>{t.confirm.pages}</dt>
            <dd>{result.pageCount}</dd>
          </div>
        )}
        <div>
          <dt>{t.confirm.source}</dt>
          <dd>{t.sources[result.source]}</dd>
        </div>
      </dl>

      <label className="form__field">
        <span className="form__label">{t.add.fieldType}</span>
        <select
          className="form__input"
          value={type}
          onChange={(e) => setType(e.target.value as ItemType)}
        >
          {ITEM_TYPES.map((value) => (
            <option key={value} value={value}>
              {t.types[value]}
            </option>
          ))}
        </select>
      </label>

      {duplicate && (
        <div className="notice" role="status">
          <strong>{t.confirm.duplicate}</strong>
          <span>{t.confirm.duplicateHint}</span>
        </div>
      )}

      {error && (
        <p className="form__error" role="alert">
          {t.add.error}
        </p>
      )}

      <button
        type="button"
        className={`button ${duplicate ? 'button--secondary' : 'button--primary'}`}
        disabled={saving}
        onClick={handleAdd}
      >
        {saving ? t.confirm.saving : duplicate ? t.confirm.addAnyway : t.confirm.add}
      </button>
    </div>
  )
}
