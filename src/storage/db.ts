import Dexie, { type EntityTable } from 'dexie'
import type { ShelfItem } from '../domain/types'

// IndexedDB — база данных, встроенная в браузер. Dexie делает работу с ней удобной.
// Данные хранятся только на этом устройстве.

export type ShelfDb = Dexie & {
  items: EntityTable<ShelfItem, 'id'>
}

export function createDb(name = 'my-shelf'): ShelfDb {
  const db = new Dexie(name) as ShelfDb
  // Версия 1. Перечислены поля, по которым база умеет быстро искать и сортировать.
  // Если структура поменяется, добавим db.version(2) — старые данные при этом сохранятся.
  db.version(1).stores({
    items: 'id, addedAt, title, author, type, [source+sourceId]',
  })
  return db
}
