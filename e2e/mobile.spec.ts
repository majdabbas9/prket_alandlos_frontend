import { expect, test } from './fixtures';
import { catalogue, storeInfo } from './support';

// Runs in the "mobile" project (phone viewport): most visitors browse on a phone.
test.describe('on a phone', () => {
  test('the menu reaches the catalogue and the contact page', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    const menu = header.getByRole('button', { name: 'فتح/إغلاق القائمة' });

    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    const products = catalogue(page);
    await header.getByRole('link', { name: 'المنتجات' }).click();
    await expect(page).toHaveURL(/\/products$/);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('article')).toHaveCount((await products).length);

    await menu.click();
    await header.getByRole('link', { name: 'تواصلوا معنا' }).click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('the language can be changed from the menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('banner').getByRole('button', { name: 'فتح/إغلاق القائمة' }).click();
    await page.getByRole('banner').getByRole('button', { name: 'English' }).click();

    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Products' })).toBeVisible();
  });

  test('the filter drawer opens and closes back to the results', async ({ page }) => {
    const products = catalogue(page);
    await page.goto('/products');
    const count = (await products).length;

    await page.getByRole('button', { name: 'الفلاتر' }).click();
    const showResults = page.getByRole('button', { name: `عرض ${count} نتيجة` });
    await expect(showResults).toBeVisible();
    await expect(page.getByRole('button', { name: 'إغلاق الفلاتر' })).toBeVisible();

    await showResults.click();
    await expect(showResults).toHaveCount(0);
    await expect(page.getByRole('article')).toHaveCount(count);

    await page.getByRole('button', { name: 'الفلاتر' }).click();
    await page.getByRole('button', { name: 'إغلاق الفلاتر' }).click();
    await expect(page.getByRole('button', { name: 'إغلاق الفلاتر' })).toHaveCount(0);
  });

  test('a visitor can tap to call the store', async ({ page }) => {
    const infoP = storeInfo(page, 'ar');
    await page.goto('/contact');
    const { phone } = await infoP;

    const call = page.getByRole('main').getByRole('link', { name: /اتصلوا بنا/ });
    await call.scrollIntoViewIfNeeded();
    await expect(call).toBeInViewport();
    await expect(call).toHaveAttribute('href', `tel:${phone}`);
  });
});
