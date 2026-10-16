import { expect, test, stubApi } from './fixtures';
import type { Page } from '@playwright/test';
import { catalogue, expectImageLoaded, productName, storeInfo, type ApiProduct } from './support';

/** Opens the catalogue and returns what the backend served it */
async function openCatalogue(page: Page) {
  const products = catalogue(page);
  const info = storeInfo(page, 'ar');
  await page.goto('/products');
  return { products: await products, info: await info };
}

const cards = (page: Page) => page.getByRole('article');
/** "$95" at the start of the price ("$95/ م²"), not matching "$950" */
const priceText = (p: ApiProduct) => new RegExp(`^\\$${p.price || 0}(?!\\d)`);
const shownNames = (page: Page) =>
  cards(page).evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')));

test.describe('product catalogue', () => {
  test('shows every product the store has published', async ({ page }) => {
    const { products } = await openCatalogue(page);

    await expect(page.getByText('تعذّر تحميل المنتجات')).toHaveCount(0);
    if (products.length === 0) {
      // An empty catalogue gets the empty state, not a blank page
      await expect(page.getByText('لا توجد أرضيات تطابق هذه الفلاتر')).toBeVisible();
      return;
    }
    await expect(cards(page)).toHaveCount(products.length);
    await expect(
      page.getByText(
        products.length === 1 ? 'عرض منتج واحد' : `عرض ${products.length} من المنتجات`,
      ),
    ).toBeVisible();
    for (const p of products) {
      await expect(
        page.getByRole('article', { name: productName(p), exact: true }).first(),
      ).toBeAttached();
    }
  });

  test('every product card has a name, a photo and a way to open it', async ({ page }) => {
    const { products } = await openCatalogue(page);
    test.skip(products.length === 0, 'catalogue is empty');
    await expect(cards(page)).toHaveCount(products.length);

    for (const card of await cards(page).all()) {
      await expect(card.getByRole('heading', { level: 3 })).not.toBeEmpty();
      await expect(card.locator('img')).toHaveAttribute('src', /\S/);
      await expect(card.getByRole('button', { name: 'عرض التفاصيل' })).toBeEnabled();
    }
  });

  test('prices follow the store setting', async ({ page }) => {
    const { products, info } = await openCatalogue(page);
    test.skip(products.length === 0, 'catalogue is empty');

    const first = products[0];
    const card = page.getByRole('article', { name: productName(first), exact: true }).first();
    const price = card.getByText(priceText(first));
    if (info.showPrice) {
      await expect(price).toBeVisible();
      await expect(card.getByText('/ م²')).toBeVisible();
    } else {
      await expect(card.getByRole('heading')).toBeVisible();
      await expect(card.getByText('/ م²')).toHaveCount(0);
      await expect(page.getByText(/^\$\d+/)).toHaveCount(0);
    }
  });

  test('product photos load', async ({ page }) => {
    const { products } = await openCatalogue(page);
    test.skip(products.length === 0, 'catalogue is empty');

    // First row (loaded eagerly) and the last card (lazy, loads on scroll)
    const sample = [0, 1, 2, products.length - 1].filter(
      (i, at, all) => i < products.length && all.indexOf(i) === at,
    );
    for (const i of sample) {
      await expectImageLoaded(cards(page).nth(i).locator('img'));
    }
  });

  test('sorting by price and name', async ({ page }) => {
    const { products } = await openCatalogue(page);
    test.skip(products.length < 2, 'needs at least two products to sort');
    await expect(cards(page)).toHaveCount(products.length);

    const byPrice = (a: ApiProduct, b: ApiProduct) => (a.price || 0) - (b.price || 0);
    const names = (list: ApiProduct[]) => list.map(productName);
    const sort = page.getByLabel('ترتيب حسب');

    await sort.selectOption('price-asc');
    expect(await shownNames(page)).toEqual(names([...products].sort(byPrice)));

    await sort.selectOption('price-desc');
    expect(await shownNames(page)).toEqual(names([...products].sort((a, b) => byPrice(b, a))));

    await sort.selectOption('name-asc');
    expect(await shownNames(page)).toEqual(
      names([...products].sort((a, b) => productName(a).localeCompare(productName(b), 'en-US'))),
    );

    await sort.selectOption('featured');
    expect(await shownNames(page)).toEqual(names(products));
  });
});

// The backend's answer is replaced in the browser, so these never depend on (or touch) real data
test.describe('when the catalogue is unavailable', () => {
  test('a backend failure shows an error, not an empty or broken page', async ({ page }) => {
    await stubApi(page, '/api/products', 500, { success: false });
    await page.goto('/products');

    await expect(page.getByText('تعذّر تحميل المنتجات')).toBeVisible();
    await expect(cards(page)).toHaveCount(0);
    // The rest of the site still works
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('banner').getByRole('link', { name: 'تواصلوا معنا' }).first().click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('a store with no products shows the empty state', async ({ page }) => {
    await stubApi(page, '/api/products', 200, { success: true, data: [] });
    await page.goto('/products');

    await expect(page.getByText('لا توجد أرضيات تطابق هذه الفلاتر')).toBeVisible();
    await expect(page.getByText('عرض 0 من المنتجات')).toBeVisible();
    await expect(cards(page)).toHaveCount(0);
  });
});

test.describe('from product to inquiry', () => {
  test('a visitor opens a floor, reads its specs and asks about it', async ({ page }) => {
    const { products, info } = await openCatalogue(page);
    test.skip(products.length === 0, 'catalogue is empty');
    const product = products[0];
    const name = productName(product);

    await page
      .getByRole('article', { name, exact: true })
      .first()
      .getByRole('button', { name: 'عرض التفاصيل' })
      .click();

    await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'المواصفات' })).toBeVisible();
    if (product.description) await expect(page.getByText(product.description)).toBeVisible();
    if (product.plankSize)
      await expect(page.getByText(product.plankSize, { exact: true })).toBeVisible();
    if (info.showPrice) await expect(page.getByText(priceText(product))).toBeVisible();
    await expectImageLoaded(page.getByRole('img', { name, exact: true }));

    const contactInfo = storeInfo(page, 'ar');
    await page.getByRole('link', { name: 'استفسروا عن هذه الأرضية' }).click();
    await expect(page).toHaveURL(/\/contact$/);
    const { phone } = await contactInfo;
    await expect(page.getByRole('main').getByRole('link', { name: /اتصلوا بنا/ })).toHaveAttribute(
      'href',
      `tel:${phone}`,
    );
  });

  test('a visitor can go back from a floor to the whole collection', async ({ page }) => {
    const { products } = await openCatalogue(page);
    test.skip(products.length === 0, 'catalogue is empty');

    await cards(page).first().getByRole('button', { name: 'عرض التفاصيل' }).click();
    await expect(cards(page)).toHaveCount(0);

    await page.getByRole('button', { name: 'العودة إلى المجموعة' }).click();
    await expect(cards(page)).toHaveCount(products.length);
  });
});
