import { expect, test } from '@playwright/test'

test('главная страница открывается', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveTitle('Моя полка')
  await expect(page.getByRole('heading', { name: 'Моя полка' })).toBeVisible()
})
