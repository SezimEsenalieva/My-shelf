/// <reference types="vite/client" />

/** Время сборки (ISO-строка), подставляется Vite при сборке. */
declare const __BUILD_TIME__: string

interface ImportMetaEnv {
  /** Необязательный ключ Google Books (подставляется при сборке из настроек репозитория). */
  readonly VITE_GOOGLE_BOOKS_KEY?: string
}
