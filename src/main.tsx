import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { requestPersistentStorage } from './storage/persist'
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
