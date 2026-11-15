import { expect, test } from '@playwright/test'
import { addManually, showList } from './helpers.ts'

test.describe('режим «Полка»', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./')
    await addManually(page, { title: 'Мастер и Маргарита', author: 'Михаил Булгаков' })
    await addManually(page, { title: 'Берсерк', author: 'Кэнтаро Миура', type: 'manga' })
  })

  test('корешки стоят на полке и подписаны для VoiceOver', async ({ page }) => {
    const shelf = page.getByRole('list', { name: 'Полка' })
    await expect(shelf).toBeVisible()
    await expect(
      shelf.getByRole('button', { name: 'Мастер и Маргарита, Михаил Булгаков, Книга' }),
    ).toBeVisible()
    await expect(shelf.getByRole('button', { name: 'Берсерк, Кэнтаро Миура, Манга' })).toBeVisible()
  })

  test('манга ниже книги', async ({ page }) => {
    const shelf = page.getByRole('list', { name: 'Полка' })
    const book = await shelf.getByRole('button', { name: /^Мастер/ }).boundingBox()
    const manga = await shelf.getByRole('button', { name: /^Берсерк/ }).boundingBox()
    expect(manga?.height).toBeLessThan(book?.height ?? 0)
  })

  test('нажатие на корешок открывает обложку, × закрывает', async ({ page }) => {
    await page.getByRole('button', { name: /^Мастер и Маргарита/ }).click()
    const card = page.getByRole('dialog', { name: 'Мастер и Маргарита' })
    await expect(card).toBeVisible()
    await expect(card.getByRole('heading', { name: 'Мастер и Маргарита' })).toBeVisible()
    await expect(card.getByText('Михаил Булгаков')).toBeVisible()
    await expect(card.getByText(/^Добавлено/)).toBeVisible()

    await card.getByRole('button', { name: 'Закрыть' }).click()
    await expect(card).toBeHidden()
    await expect(page.getByRole('button', { name: /^Мастер и Маргарита/ })).toBeVisible()
  })

  test('тап по затемнённому фону закрывает карточку', async ({ page }) => {
    await page.getByRole('button', { name: /^Берсерк/ }).click()
    const card = page.getByRole('dialog', { name: 'Берсерк' })
    await expect(card).toBeVisible()
    await page.mouse.click(10, 300)
    await expect(card).toBeHidden()
  })

  test('из списка открывается та же карточка', async ({ page }) => {
    const list = await showList(page)
    await list.getByRole('button', { name: /Берсерк/ }).click()
    await expect(page.getByRole('dialog', { name: 'Берсерк' })).toBeVisible()
  })

  test('выбранный режим запоминается после перезапуска', async ({ page }) => {
    await showList(page)
    await page.reload()
    await expect(page.getByRole('list', { name: 'Прочитанное' })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Список' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
})

test('с «Уменьшением движения» карточка открывается без анимации', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await addManually(page, { title: 'Дюна' })
  await page.getByRole('button', { name: /^Дюна/ }).click()
  const card = page.getByRole('dialog', { name: 'Дюна' })
  await expect(card).toBeVisible()
  const running = await page.evaluate(() => document.getAnimations().length)
  expect(running).toBe(0)
})
