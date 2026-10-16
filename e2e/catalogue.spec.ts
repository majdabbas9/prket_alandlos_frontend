import { expect, test, type Page } from '@playwright/test';
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
