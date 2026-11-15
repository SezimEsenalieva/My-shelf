import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { createDb } from './db'
import { DexieShelfRepository } from './repository'

// fake-indexeddb — «ненастоящая» IndexedDB в памяти, чтобы тестировать без браузера.

let repo: DexieShelfRepository
let dbCounter = 0

beforeEach(() => {
  repo = new DexieShelfRepository(createDb(`test-${++dbCounter}`))
})

describe('DexieShelfRepository', () => {
  it('добавляет запись и заполняет id, дату и цвет корешка', async () => {
    const item = await repo.add({ title: 'Мастер и Маргарита', type: 'book', source: 'manual' })

    expect(item.id).toBeTruthy()
    expect(item.addedAt).toBeGreaterThan(0)
    expect(item.spineColor).toMatch(/^#[0-9a-f]{6}$/)
    expect(await repo.get(item.id)).toMatchObject({ title: 'Мастер и Маргарита', type: 'book' })
  })

  it('убирает лишние пробелы и пустого автора', async () => {
    const item = await repo.add({ title: '  Дюна ', author: '   ', type: 'book', source: 'manual' })
    expect(item.title).toBe('Дюна')
    expect(item.author).toBeUndefined()
  })

  it('не добавляет запись без названия', async () => {
    await expect(repo.add({ title: '   ', type: 'book', source: 'manual' })).rejects.toThrow()
    expect(await repo.list()).toHaveLength(0)
  })

  it('возвращает список, новые записи сверху', async () => {
    const first = await repo.add({ title: 'Первая', type: 'book', source: 'manual' })
    await repo.db.items.update(first.id, { addedAt: 1000 })
    await repo.add({ title: 'Вторая', type: 'manga', source: 'manual' })

    const titles = (await repo.list()).map((i) => i.title)
    expect(titles).toEqual(['Вторая', 'Первая'])
  })

  it('изменяет и удаляет запись', async () => {
    const item = await repo.add({ title: 'Берсерк', type: 'book', source: 'manual' })

    await repo.update(item.id, { type: 'manga', author: 'Кэнтаро Миура' })
    expect(await repo.get(item.id)).toMatchObject({ type: 'manga', author: 'Кэнтаро Миура' })

    await repo.remove(item.id)
    expect(await repo.get(item.id)).toBeUndefined()
  })
})
