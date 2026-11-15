import { expect, test } from '@playwright/test'

test('пустая полка предлагает добавить первую книгу', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveTitle('Моя полка')
  await expect(page.getByText('Добавьте первую прочитанную книгу')).toBeVisible()
})

test('ручное добавление: запись появляется в списке и остаётся после перезагрузки', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Добавить', exact: true }).first().click()

  const dialog = page.getByRole('dialog', { name: 'Добавить вручную' })
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Название').fill('Мастер и Маргарита')
  await dialog.getByLabel('Автор').fill('Михаил Булгаков')
  await dialog.getByLabel('Тип').selectOption('book')
  await dialog.getByRole('button', { name: 'Поставить на полку' }).click()

  await expect(dialog).toBeHidden()
  const rows = page.getByRole('list', { name: 'Прочитанное' }).getByRole('listitem')
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText('Мастер и Маргарита')
  await expect(rows.first()).toContainText('Михаил Булгаков')
  await expect(rows.first()).toContainText('Книга')

  await page.reload()
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText('Мастер и Маргарита')
  await expect(page.getByText('1 запись')).toBeVisible()
})

test('без названия запись не сохраняется', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Добавить', exact: true }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Добавить вручную' })
  await dialog.getByRole('button', { name: 'Поставить на полку' }).click()

  await expect(dialog.getByText('Введите название')).toBeVisible()
  await dialog.getByRole('button', { name: 'Закрыть' }).click()
  await expect(page.getByText('Добавьте первую прочитанную книгу')).toBeVisible()
})
