import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Сайт живёт по адресу https://sezimesenalieva.github.io/My-shelf/,
// поэтому все пути к файлам должны начинаться с /My-shelf/.
const base = '/My-shelf/'

export default defineConfig({
  base,
  plugins: [react()],
  define: {
    // Время сборки показываем на экране, чтобы на телефоне было видно,
    // что открылась свежая версия.
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
