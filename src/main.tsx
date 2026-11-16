import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { requestPersistentStorage } from './storage/persist'
// Книжные шрифты с кириллицей встроены в приложение — работают и без интернета.
import '@fontsource/pt-serif/400.css'
import '@fontsource/pt-serif/700.css'
import '@fontsource/oswald/600.css'
import '@fontsource/playfair-display/700.css'
import './styles/global.css'

const root = document.getElementById('root')
if (!root) throw new Error('Не найден элемент #root')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Просим браузер не удалять данные полки.
void requestPersistentStorage()
