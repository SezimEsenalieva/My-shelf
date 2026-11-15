import { t } from '../i18n'

export function App() {
  const builtAt = new Date(__BUILD_TIME__).toLocaleString('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return (
    <main className="placeholder">
      <h1>{t.appName}</h1>
      <div className="placeholder__shelf" aria-hidden="true">
        <span style={{ height: 96, width: 22, background: '#b5523b' }} />
        <span style={{ height: 80, width: 16, background: '#3f6b5c' }} />
        <span style={{ height: 108, width: 28, background: '#d9a441' }} />
        <span style={{ height: 72, width: 14, background: '#4a5a8a' }} />
      </div>
      <p className="placeholder__title">{t.placeholder.title}</p>
      <p className="placeholder__subtitle">{t.placeholder.subtitle}</p>
      <p className="placeholder__build">
        {t.placeholder.builtAt} {builtAt}
      </p>
    </main>
  )
}
