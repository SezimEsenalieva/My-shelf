import { useId, useState, type FormEvent } from 'react'
import { ITEM_TYPES, type ItemType } from '../../domain/types'
import { t } from '../../i18n'
import { shelfRepository } from '../../storage/repository'
import './ManualAddForm.css'

interface ManualAddFormProps {
  onAdded: () => void
  /** Название подставляется из строки поиска. */
  initialTitle?: string
}

/** Форма ручного добавления: название (обязательно), автор, тип. */
export function ManualAddForm({ onAdded, initialTitle = '' }: ManualAddFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [author, setAuthor] = useState('')
  const [type, setType] = useState<ItemType>('book')
  const [showTitleError, setShowTitleError] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [saving, setSaving] = useState(false)
  const id = useId()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setShowTitleError(true)
      return
    }
    setSaving(true)
    setSaveError(false)
    try {
      await shelfRepository.add({ title, author, type, source: 'manual' })
      onAdded()
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  const titleInvalid = showTitleError && !title.trim()

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="form__field">
        <span className="form__label">{t.add.fieldTitle}</span>
        <input
          className="form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
          enterKeyHint="next"
          aria-invalid={titleInvalid}
          aria-describedby={titleInvalid ? `${id}-title-error` : undefined}
        />
        {titleInvalid && (
          <span id={`${id}-title-error`} className="form__error" role="alert">
            {t.add.titleRequired}
          </span>
        )}
      </label>

      <label className="form__field">
        <span className="form__label">{t.add.fieldAuthor}</span>
        <input
          className="form__input"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          enterKeyHint="done"
        />
      </label>

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

      {saveError && (
        <p className="form__error" role="alert">
          {t.add.error}
        </p>
      )}

      <button type="submit" className="button button--primary" disabled={saving}>
        {t.add.submit}
      </button>
    </form>
  )
}
