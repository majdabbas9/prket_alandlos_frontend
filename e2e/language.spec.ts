import { expect, test } from './fixtures';
import { LANG_KEY, storeInfo, visitAs } from './support';

test.describe('site language', () => {
  test('a first-time visitor gets the site in Arabic, right-to-left', async ({ page }) => {
    const info = storeInfo(page, 'ar');
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page).toHaveTitle('بركيه الأندلس — أرضيات خشبية خالدة');
    await expect(page.getByRole('banner').getByRole('link', { name: 'المنتجات' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'العربية' }).first()).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Store copy comes from the backend in Arabic too
    const { heroTitle } = await info;
    if (heroTitle) {
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heroTitle);
    }
  });

  test('switching to English sticks across pages and reloads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    const english = storeInfo(page, 'en');
    await page.getByRole('button', { name: 'English' }).first().click();
    await english;

    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page).toHaveTitle('Prket Alandlos — Timeless Wood Flooring');
    expect(await page.evaluate((k) => localStorage.getItem(k), LANG_KEY)).toBe('en');

    await page.getByRole('banner').getByRole('link', { name: 'Products' }).first().click();
    await expect(page).toHaveURL(/\/products$/);
    // The page heading is editable in the admin, so check the built-in UI labels instead
    await expect(page.getByLabel('Sort by')).toBeVisible();
    await expect(page.getByLabel('ترتيب حسب')).toHaveCount(0);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByLabel('Sort by')).toBeVisible();
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Contact Us' }).first(),
    ).toBeVisible();
  });

  test('switching language changes the static labels on every part of the page', async ({
    page,
  }) => {
    await page.goto('/contact');
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: 'إنستغرام' })).toBeVisible();

    await page.getByRole('button', { name: 'English' }).first().click();

    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Home' }).first(),
    ).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: /Call us/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Instagram' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'English' }).first()).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('a visitor can switch to Hebrew and back to Arabic', async ({ page }) => {
    await visitAs(page, 'en');
    await page.goto('/contact');

    await page.getByRole('button', { name: 'עברית' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('banner').getByRole('link', { name: 'צרו קשר' })).toBeVisible();

    await page.getByRole('button', { name: 'العربية' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'تواصلوا معنا' }),
    ).toBeVisible();
  });
});
