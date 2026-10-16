import { expect, test } from './fixtures';
import { catalogue } from './support';

// Checks that hold whatever the admin has published: each page loads cleanly and the site can be
// navigated, without looking at the store's content.
const PAGES = [
  { path: '/', nav: 'الرئيسية' },
  { path: '/products', nav: 'المنتجات' },
  { path: '/contact', nav: 'تواصلوا معنا' },
];

test.describe('every page', () => {
  for (const { path, nav } of PAGES) {
    test(`${path} loads without errors`, async ({ page, consoleErrors }) => {
      const products = path === '/products' ? catalogue(page) : null;
      await page.goto(path);
      await products;

      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
      await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
      // The current page is marked in the navigation
      await expect(
        page.getByRole('banner').getByRole('link', { name: nav }).first(),
      ).toHaveAttribute('aria-current', 'page');

      await page.waitForLoadState('networkidle');
      expect(consoleErrors).toEqual([]);
    });
  }
});

test.describe('navigation', () => {
  test('the header reaches every page, and back/forward work', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');

    await header.getByRole('link', { name: 'المنتجات' }).first().click();
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByLabel('ترتيب حسب')).toBeVisible();

    await header.getByRole('link', { name: 'تواصلوا معنا' }).first().click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('main').getByRole('link', { name: /اتصلوا بنا/ })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByLabel('ترتيب حسب')).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/contact$/);

    // The logo goes home
    await header.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('main').getByRole('link', { name: /استكشفوا المجموعة/ }),
    ).toBeVisible();
  });

  test('a new page opens at the top, not where the last one was scrolled', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    await page.getByRole('contentinfo').getByRole('link', { name: 'تواصلوا معنا' }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });
});
