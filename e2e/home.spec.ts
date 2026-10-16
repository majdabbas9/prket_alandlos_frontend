import { expect, test } from '@playwright/test';
import { catalogue, expectImageLoaded, storeInfo } from './support';

test.describe('home page', () => {
  test("shows the store's hero, photo and showroom details", async ({ page }) => {
    const infoP = storeInfo(page, 'ar');
    await page.goto('/');
    const info = await infoP;

    if (info.heroTitle)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(info.heroTitle);
    await expectImageLoaded(page.getByRole('img', { name: /أرضيات باركيه فاخرة/ }));

    const main = page.getByRole('main');
    if (info.showroomTitle) {
      await expect(main.getByRole('heading', { level: 2, name: info.showroomTitle })).toBeVisible();
    }
    await expect(main.getByText(info.location, { exact: true }).first()).toBeVisible();
  });

  test('the logo loads', async ({ page }) => {
    await page.goto('/');
    await expectImageLoaded(
      page.getByRole('banner').getByRole('img', { name: 'شعار بركيه الأندلس' }),
    );
  });

  test('"explore the collection" leads to the catalogue', async ({ page }) => {
    await page.goto('/');
    const products = catalogue(page);

    await page
      .getByRole('main')
      .getByRole('link', { name: /استكشفوا المجموعة/ })
      .click();

    await expect(page).toHaveURL(/\/products$/);
    await products;
    await expect(page.getByText('تعذّر تحميل المنتجات')).toHaveCount(0);
  });

  test('"visit our showroom" leads to the contact details', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('main').getByRole('link', { name: 'زوروا صالة العرض' }).click();

    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('main').getByRole('link', { name: /اتصلوا بنا/ })).toBeVisible();
  });
});

test.describe('links into the site', () => {
  // Shared / bookmarked links must work, not only in-app navigation (SPA fallback on the host)
  for (const path of ['/products', '/contact']) {
    test(`${path} opens directly and survives a reload`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      await page.reload();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }

  test('an unknown address still shows the store, not an error page', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(
      page.getByRole('main').getByRole('link', { name: /استكشفوا المجموعة/ }),
    ).toBeVisible();
  });
});
