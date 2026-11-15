import type { Locator, Page } from '@playwright/test'

/** Переключиться в режим «Список» и вернуть его. */
export async function showList(page: Page): Promise<Locator> {
  await page.getByRole('radio', { name: 'Список' }).click()
  return page.getByRole('list', { name: 'Прочитанное' })
}

/** Добавить запись вручную через «+» → «Добавить вручную». */
export async function addManually(
  page: Page,
  { title, author = '', type = 'book' }: { title: string; author?: string; type?: string },
): Promise<void> {
  await page.getByRole('button', { name: 'Добавить', exact: true }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Поиск' })
  await dialog.getByRole('button', { name: 'Добавить вручную' }).click()
  await dialog.getByLabel('Название').fill(title)
  await dialog.getByLabel('Автор').fill(author)
  await dialog.getByLabel('Тип').selectOption(type)
  await dialog.getByRole('button', { name: 'Поставить на полку' }).click()
  await dialog.waitFor({ state: 'hidden' })
}
