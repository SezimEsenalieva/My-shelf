import { showList } from './helpers.ts'
import { expect, test, type Page } from '@playwright/test'
import { goOffline, mockCatalogs } from './catalogs.ts'

async function openSearch(page: Page) {
  await page.getByRole('button', { name: 'Добавить', exact: true }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Поиск' })
  await expect(dialog).toBeVisible()
  return dialog
}

function results(page: Page) {
  return page.getByRole('list', { name: 'Результаты поиска' }).getByRole('button')
}

test.describe('поиск в интернете', () => {
  test.beforeEach(async ({ page }) => {
    await mockCatalogs(page)
    await page.goto('./')
  })

  test('«Мастер и Маргарита»: книга с обложкой попадает на полку', async ({ page }) => {
    const dialog = await openSearch(page)
    await expect(dialog.getByRole('searchbox')).toBeFocused()
    await dialog.getByRole('searchbox').fill('Мастер и Маргарита')

    const first = results(page).first()
    await expect(first).toContainText('Мастер и Маргарита')
    await expect(first).toContainText('Михаил Булгаков')
    await expect(first).toContainText('Книга')
    await expect(first).toContainText('FantLab')
    // Google Books в тестах отвечает 429 — остальные результаты всё равно видны, без лишних подписей.
    await expect(dialog.getByText(/Не ответили/)).toHaveCount(0)

    await first.click()
    await expect(dialog.getByRole('heading', { name: 'Мастер и Маргарита' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Поставить на полку' }).click()
    await expect(dialog).toBeHidden()

    const row = (await showList(page)).getByRole('listitem').first()
    await expect(row).toContainText('Мастер и Маргарита')
    // Обложка сохранена копией и показана картинкой, а не заглушкой.
    await expect(row.locator('img.cover')).toBeVisible()
  })

  test('тип определяется автоматически: манга, манхва, маньхуа', async ({ page }) => {
    const dialog = await openSearch(page)
    const input = dialog.getByRole('searchbox')

    for (const [query, title, type] of [
      ['One Piece', 'One Piece', 'Манга'],
      ['Solo Leveling', 'Solo Leveling', 'Манхва'],
      ["The King's Avatar", "The King's Avatar", 'Маньхуа'],
    ] as const) {
      await input.fill(query)
      const first = results(page).first()
      await expect(first).toContainText(title)
      await expect(first).toContainText(type)
      await expect(first).toContainText('AniList')
    }
  })

  test('тип можно поправить перед добавлением', async ({ page }) => {
    const dialog = await openSearch(page)
    await dialog.getByRole('searchbox').fill('Solo Leveling')
    await results(page).first().click()
    await dialog.getByLabel('Тип').selectOption('other')
    await dialog.getByRole('button', { name: 'Поставить на полку' }).click()
    await expect(await showList(page)).toContainText('Другое')
  })

  test('повторное добавление показывает «Уже на полке»', async ({ page }) => {
    let dialog = await openSearch(page)
    await dialog.getByRole('searchbox').fill('One Piece')
    await results(page).first().click()
    await dialog.getByRole('button', { name: 'Поставить на полку' }).click()
    await expect(dialog).toBeHidden()

    dialog = await openSearch(page)
    await dialog.getByRole('searchbox').fill('One Piece')
    await results(page).first().click()
    await expect(dialog.getByText('Уже на полке')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Всё равно добавить' })).toBeVisible()
  })

  test('фильтр «Книги» не показывает мангу из AniList', async ({ page }) => {
    const dialog = await openSearch(page)
    await dialog.getByRole('radio', { name: 'Книги' }).click()
    await dialog.getByRole('searchbox').fill('One Piece')
    await expect(results(page).first()).toContainText('Open Library')
    await expect(page.getByRole('list', { name: 'Результаты поиска' })).not.toContainText('AniList')
  })

  test('если ничего не нашлось — можно добавить вручную', async ({ page }) => {
    const dialog = await openSearch(page)
    await dialog.getByRole('searchbox').fill('Неизвестная книга')
    await expect(dialog.getByText('Ничего не нашлось')).toBeVisible()
    await dialog.getByRole('button', { name: 'Добавить вручную' }).click()
    // Название подставилось из поиска
    await expect(dialog.getByLabel('Название')).toHaveValue('Неизвестная книга')
    await dialog.getByRole('button', { name: 'Поставить на полку' }).click()
    await expect(await showList(page)).toContainText('Неизвестная книга')
  })
})

test('русская книга из FantLab: «Скорбь Сатаны»', async ({ page }) => {
  await mockCatalogs(page)
  await page.goto('./')
  const dialog = await openSearch(page)
  await dialog.getByRole('searchbox').fill('Скорбь Сатаны')
  const first = results(page).first()
  await expect(first).toContainText('Скорбь Сатаны')
  await expect(first).toContainText('Мария Корелли')
  await expect(first).toContainText('FantLab')
})

test('без интернета поиск пишет «Нет подключения»', async ({ page }) => {
  await goOffline(page)
  await page.goto('./')
  const dialog = await openSearch(page)
  await dialog.getByRole('searchbox').fill('Дюна')
  await expect(dialog.getByText(/Нет подключения/)).toBeVisible()
})
