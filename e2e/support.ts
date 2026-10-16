import { expect, type Locator, type Page, type Response } from '@playwright/test';

// The site's data is whatever the admin set, so the tests read the same API responses the page
// loaded and check the page against them instead of hardcoding store details.

export type Lang = 'ar' | 'en' | 'he';

export interface StoreInfo {
  showPrice: boolean;
  storeOpeningTime: string;
  phone: string;
  whatsappLink: string;
  location: string;
  heroTitle?: string;
  contactTitle?: string;
  showroomTitle?: string;
}

export interface ApiProduct {
  id: string;
  title?: string;
  price?: number;
  description?: string;
  thickness?: string;
  plankSize?: string;
}

export const LANG_KEY = 'prket-alandlos-lang';

const isApi = (r: Response, path: string) => new URL(r.url()).pathname === path;

const json = async <T>(res: Response): Promise<T> => {
  expect(res.ok(), `${res.url()} answered HTTP ${res.status()}`).toBe(true);
  const body = await res.json();
  expect(body.success, `${res.url()} returned success=false`).toBe(true);
  return body.data as T;
};

/** Waits for the page's own GET /api/info in `lang`. Start before the navigation. */
export function storeInfo(page: Page, lang: Lang = 'ar') {
  return page
    .waitForResponse(
      (r) => isApi(r, '/api/info') && new URL(r.url()).searchParams.get('lang') === lang,
    )
    .then((r) => json<StoreInfo>(r));
}

/** Waits for the page's own GET /api/products. Start before the navigation. */
export function catalogue(page: Page) {
  return page.waitForResponse((r) => isApi(r, '/api/products')).then((r) => json<ApiProduct[]>(r));
}

/** The name the site shows for a product (same default as src/pages/Products.tsx) */
export const productName = (p: ApiProduct) => p.title || 'Untitled Product';

/** WhatsApp link as the site links it (scheme added when the admin left it out) */
export const whatsappHref = (link: string) => (link.startsWith('http') ? link : `https://${link}`);

/** Opens the site as a visitor who already picked `lang` (skips the Arabic default). */
export async function visitAs(page: Page, lang: Lang) {
  await page.addInitScript(
    ([key, value]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    [LANG_KEY, lang] as const,
  );
}

/** Asserts the image actually downloaded and decoded (not a broken-image icon). */
export async function expectImageLoaded(img: Locator) {
  await img.scrollIntoViewIfNeeded();
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => (el.complete ? el.naturalWidth : 0)))
    .toBeGreaterThan(0);
}
