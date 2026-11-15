import Dexie, { type EntityTable } from 'dexie'
import type { ShelfItem } from '../domain/types'

// IndexedDB — база данных, встроенная в браузер. Dexie делает работу с ней удобной.
// Данные хранятся только на этом устройстве.

/**
 * Как запись лежит в базе. Обложка хранится не как Blob, а как массив байтов:
 * Safari в некоторых режимах (приватная вкладка) отказывается сохранять Blob в IndexedDB.
 */
export type StoredItem = Omit<ShelfItem, 'coverBlob'> & {
  cover?: { data: ArrayBuffer; type: string }
}

export type ShelfDb = Dexie & {
  items: EntityTable<StoredItem, 'id'>
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

/** Запись из базы → запись для экранов (байты обложки снова становятся Blob). */
export function fromStored({ cover, ...rest }: StoredItem): ShelfItem {
  return cover ? { ...rest, coverBlob: new Blob([cover.data], { type: cover.type }) } : rest
}

/** Запись для экранов → запись для базы. */
export async function toStored({ coverBlob, ...rest }: ShelfItem): Promise<StoredItem> {
  if (!coverBlob) return rest
  return { ...rest, cover: { data: await coverBlob.arrayBuffer(), type: coverBlob.type } }
}
