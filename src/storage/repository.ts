import { colorFromText } from '../domain/color'
import type { NewShelfItem, ShelfItem, ShelfItemChanges } from '../domain/types'
import { createDb, fromStored, toStored, type ShelfDb } from './db'

/**
 * «Репозиторий» — единственное место, через которое экраны читают и меняют полку.
 * Экраны не знают, где лежат данные (IndexedDB, сервер, файл). Если когда-нибудь
 * появится синхронизация, поменяется только этот слой.
 */
export interface ShelfRepository {
  list(): Promise<ShelfItem[]>
  get(id: string): Promise<ShelfItem | undefined>
  add(item: NewShelfItem): Promise<ShelfItem>
  update(id: string, changes: ShelfItemChanges): Promise<void>
  remove(id: string): Promise<void>
}

export class DexieShelfRepository implements ShelfRepository {
  readonly db: ShelfDb

  constructor(db: ShelfDb = createDb()) {
    this.db = db
  }

  /** Все записи, новые сверху. */
  async list(): Promise<ShelfItem[]> {
    const rows = await this.db.items.orderBy('addedAt').reverse().toArray()
    return rows.map(fromStored)
  }

  async get(id: string): Promise<ShelfItem | undefined> {
    const row = await this.db.items.get(id)
    return row && fromStored(row)
  }

  async add(input: NewShelfItem): Promise<ShelfItem> {
    const title = input.title.trim()
    if (!title) throw new Error('У записи должно быть название')
    const author = input.author?.trim() || undefined

    const item: ShelfItem = {
      ...input,
      id: crypto.randomUUID(),
      title,
      author,
      spineColor: input.spineColor ?? colorFromText(title),
      addedAt: Date.now(),
    }
    await this.db.items.add(await toStored(item))
    return item
  }

  async update(id: string, changes: ShelfItemChanges): Promise<void> {
    const clean: ShelfItemChanges = { ...changes }
    if (clean.title !== undefined) {
      clean.title = clean.title.trim()
      if (!clean.title) throw new Error('У записи должно быть название')
    }
    if (clean.author !== undefined) clean.author = clean.author.trim() || undefined
    await this.db.items.update(id, clean)
  }

  async remove(id: string): Promise<void> {
    await this.db.items.delete(id)
  }
}

/** Общий репозиторий приложения. */
export const shelfRepository = new DexieShelfRepository()
