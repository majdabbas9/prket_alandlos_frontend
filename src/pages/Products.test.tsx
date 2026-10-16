import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { API, API_PRODUCTS, STORE_INFO, mockApi, renderApp } from '@/test/utils';

const PRODUCT_NAMES = /^(Natural Oak|Chevron Walnut|Brushed Herringbone)$/;
/** Product names in the order the catalogue shows them */
const shownOrder = () =>
  screen.getAllByRole('article').map((card) => card.getAttribute('aria-label'));

describe('product catalogue', () => {
  it('lists every product from the backend with its specs', async () => {
    mockApi();
    renderApp('/products');

    expect(await screen.findAllByRole('article')).toHaveLength(3);
    expect(screen.getByText('عرض 3 من المنتجات')).toBeInTheDocument();

    const oak = screen.getByRole('article', { name: 'Natural Oak' });
    expect(within(oak).getByRole('heading', { name: 'Natural Oak' })).toBeVisible();
    expect(within(oak).getByText('14 mm')).toBeInTheDocument();
    expect(within(oak).getByText('180 × 2200 mm')).toBeInTheDocument();
    expect(within(oak).getByText('Pale oak with a soft matt lacquer.')).toBeInTheDocument();
    expect(within(oak).getAllByText('Matt').length).toBeGreaterThan(0);
    expect(within(oak).getByText('Oak')).toBeInTheDocument();
  });

  it('shows the price per m² when the store shows prices', async () => {
    mockApi();
    renderApp('/products');

    const walnut = await screen.findByRole('article', { name: 'Chevron Walnut' });
    expect(within(walnut).getByText('$142')).toBeInTheDocument();
    expect(within(walnut).getByText('/ م²')).toBeInTheDocument();
  });

  it('hides every price when the admin turned prices off', async () => {
    mockApi({ info: { ar: { ...STORE_INFO.ar, showPrice: false } } });
    renderApp('/products');

    await screen.findAllByRole('article');
    // showPrice arrives with the store info, after the products may already be on screen
    await expect.poll(() => screen.queryByText('$95')).toBeNull();
    expect(screen.queryByText(/\$\d+/)).toBeNull();
    expect(screen.queryByText('/ م²')).toBeNull();
  });

  it('shows the tag the admin set on a product', async () => {
    mockApi();
    renderApp('/products');

    const walnut = await screen.findByRole('article', { name: 'Chevron Walnut' });
    expect(within(walnut).getByText('Premium')).toBeInTheDocument();
    expect(
      within(screen.getByRole('article', { name: 'Natural Oak' })).queryByText('Premium'),
    ).toBeNull();
  });

  it('loads photos from the CDN when the backend gives a URL, else through the API', async () => {
    mockApi();
    renderApp('/products');

    const walnut = await screen.findByRole('article', { name: 'Chevron Walnut' });
    expect(within(walnut).getByRole('img')).toHaveAttribute(
      'src',
      'https://images.test/products/walnut_thumb.jpg',
    );
    const oak = screen.getByRole('article', { name: 'Natural Oak' });
    expect(within(oak).getByRole('img')).toHaveAttribute(
      'src',
      `${API}/api/products/photo?key=${encodeURIComponent('products/oak_thumb.jpg')}`,
    );
    // No thumbnail: the card uses the full photo
    const herring = screen.getByRole('article', { name: 'Brushed Herringbone' });
    expect(within(herring).getByRole('img')).toHaveAttribute(
      'src',
      `${API}/api/products/photo?key=${encodeURIComponent('products/herring.jpg')}`,
    );
  });

  it('keeps the admin-defined order under "Featured"', async () => {
    mockApi();
    renderApp('/products');
    await screen.findAllByRole('article');

    expect(shownOrder()).toEqual(['Natural Oak', 'Chevron Walnut', 'Brushed Herringbone']);
  });

  it('sorts by price, both ways, and by name', async () => {
    mockApi();
    const { user } = renderApp('/products');
    await screen.findAllByRole('article');
    const sort = screen.getByLabelText('ترتيب حسب');

    await user.selectOptions(sort, 'price-asc');
    expect(shownOrder()).toEqual(['Natural Oak', 'Brushed Herringbone', 'Chevron Walnut']);

    await user.selectOptions(sort, 'price-desc');
    expect(shownOrder()).toEqual(['Chevron Walnut', 'Brushed Herringbone', 'Natural Oak']);

    await user.selectOptions(sort, 'name-asc');
    expect(shownOrder()).toEqual(['Brushed Herringbone', 'Chevron Walnut', 'Natural Oak']);

    await user.selectOptions(sort, 'featured');
    expect(shownOrder()).toEqual(['Natural Oak', 'Chevron Walnut', 'Brushed Herringbone']);
  });

  it('uses the singular wording for a single product', async () => {
    mockApi({ products: [API_PRODUCTS[0]] });
    renderApp('/products');
    await screen.findAllByRole('article');

    expect(screen.getByText('عرض منتج واحد')).toBeInTheDocument();
  });

  it('fills in sensible defaults for a product saved with missing fields', async () => {
    mockApi({ products: [{ id: 'bare' }] });
    renderApp('/products');

    const card = await screen.findByRole('article', { name: 'Untitled Product' });
    expect(within(card).getByText('15 mm')).toBeInTheDocument();
    expect(within(card).getByText('190 × 1900 mm')).toBeInTheDocument();
    expect(within(card).getByText('$0')).toBeInTheDocument();
  });

  it('tells the visitor when the catalogue could not be loaded', async () => {
    mockApi({ products: 'error' });
    renderApp('/products');

    expect(await screen.findByText('تعذّر تحميل المنتجات')).toBeVisible();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('tells the visitor when the backend cannot be reached at all', async () => {
    mockApi({ products: 'network-error' });
    renderApp('/products');

    expect(await screen.findByText('تعذّر تحميل المنتجات')).toBeVisible();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('treats a malformed backend reply as a load failure', async () => {
    mockApi({ products: { status: 200, body: { success: false } } });
    renderApp('/products');

    expect(await screen.findByText('تعذّر تحميل المنتجات')).toBeVisible();
  });

  it('shows the empty-catalogue message when there are no products', async () => {
    mockApi({ products: [] });
    renderApp('/products');

    expect(await screen.findByText('لا توجد أرضيات تطابق هذه الفلاتر')).toBeVisible();
    expect(screen.getByText('عرض 0 من المنتجات')).toBeInTheDocument();
  });
});

describe('filters', () => {
  it('opens the filter drawer, counts chosen filters and clears them', async () => {
    mockApi();
    const { user } = renderApp('/products');
    await screen.findAllByRole('article');

    await user.click(screen.getByRole('button', { name: 'الفلاتر' }));
    const showResults = screen.getByRole('button', { name: 'عرض 3 نتيجة' });
    const drawer = showResults.parentElement!;

    await user.click(within(drawer).getByRole('button', { name: 'Oak' }));
    await user.click(within(drawer).getByRole('button', { name: 'Matt' }));
    // The badge on the filters button counts the active filters
    expect(screen.getByRole('button', { name: /الفلاتر\s*2/ })).toBeInTheDocument();

    await user.click(within(drawer).getByRole('button', { name: 'مسح جميع الفلاتر' }));
    expect(within(drawer).queryByRole('button', { name: 'مسح جميع الفلاتر' })).toBeNull();

    await user.click(showResults);
    expect(screen.queryByRole('button', { name: 'إغلاق الفلاتر' })).toBeNull();
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });
});

describe('product details and inquiry', () => {
  it('opens a product with its full specs and price', async () => {
    mockApi();
    const { user } = renderApp('/products');

    const walnut = await screen.findByRole('article', { name: 'Chevron Walnut' });
    await user.click(within(walnut).getByRole('button', { name: 'عرض التفاصيل' }));

    expect(screen.getByRole('heading', { level: 2, name: 'Chevron Walnut' })).toBeVisible();
    expect(screen.getByText('Walnut laid in a sharp chevron.')).toBeVisible();
    expect(screen.getByText('$142')).toBeVisible();
    expect(screen.getByText('Chevron')).toBeVisible(); // wood type
    expect(screen.getByText('Brushed')).toBeVisible(); // finish
    expect(screen.getByText('90 × 450 mm')).toBeVisible();
    // The detail view shows the full photo, not the thumbnail
    expect(screen.getByRole('img', { name: 'Chevron Walnut' })).toHaveAttribute(
      'src',
      'https://images.test/products/walnut.jpg',
    );
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('returns to the full collection', async () => {
    mockApi();
    const { user } = renderApp('/products');
    const oak = await screen.findByRole('article', { name: 'Natural Oak' });
    await user.click(within(oak).getByRole('button', { name: 'عرض التفاصيل' }));

    await user.click(screen.getByRole('button', { name: 'العودة إلى المجموعة' }));

    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('sends an interested visitor to the contact page', async () => {
    mockApi();
    const { user } = renderApp('/products');
    const oak = await screen.findByRole('article', { name: 'Natural Oak' });
    await user.click(within(oak).getByRole('button', { name: 'عرض التفاصيل' }));

    await user.click(screen.getByRole('link', { name: 'استفسروا عن هذه الأرضية' }));

    expect(window.location.pathname).toBe('/contact');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'عنوان التواصل من الخادم' }),
    ).toBeVisible();
  });
});

describe('product names', () => {
  it('stays as stored by the admin whatever the site language', async () => {
    mockApi();
    renderApp('/products', { lang: 'en' });

    const names = await screen.findAllByRole('heading', { name: PRODUCT_NAMES });
    expect(names).toHaveLength(3);
    expect(screen.getByText('Showing 3 products')).toBeInTheDocument();
  });
});
