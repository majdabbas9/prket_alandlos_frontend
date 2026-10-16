import { test as base, type Page, type Route } from '@playwright/test';

// Every spec imports `test` from here.
//
// Normally the specs run against a real backend (CI: the deployed site and its API) and read the
// data the page itself loaded (see support.ts), so they never depend on what the admin published.
//
// E2E_MOCK_API=1 replaces that backend with a small fake one (below), so the suite can run
// against a local `vite build && vite preview` without the API or Docker:
//   E2E_MOCK_API=1 npx playwright test           (bash)
//   $env:E2E_MOCK_API=1; npx playwright test     (PowerShell)
export const MOCK_API = !!process.env.E2E_MOCK_API;

/** Matches requests to the backend API (whatever host it is on) */
export const isApi =
  (path?: string) =>
  (url: URL): boolean =>
    path ? url.pathname === path : url.pathname.startsWith('/api/');

// A cross-origin fetch only accepts a fulfilled response with CORS headers
const CORS = { 'access-control-allow-origin': '*' };

/** Answers the page's request to `path` with `body` (JSON) and `status`, instead of the backend. */
export async function stubApi(page: Page, path: string, status: number, body: unknown) {
  await page.route(isApi(path), (route) => route.fulfill({ status, json: body, headers: CORS }));
}

/** Makes every backend call fail as if the API were unreachable. */
export async function apiDown(page: Page) {
  await page.route(isApi(), (route) => route.abort('connectionrefused'));
}

// --- Fake backend (E2E_MOCK_API only) --------------------------------------------------------

// 1×1 PNG: decodes to a real image (naturalWidth > 0)
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const info = (lang: string) => ({
  lang,
  showPrice: true,
  storeOpeningTime: 'Sunday — Thursday 9:00 AM — 7:00 PM',
  email: 'shop@example.test',
  phone: '04-1234567',
  whatsappLink: 'wa.me/+972500000001',
  location: `Fake Street 1, Town (${lang})`,
  description: `Store description (${lang})`,
  heroTitle: `Hero title (${lang})`,
  showroomTitle: `Showroom title (${lang})`,
  contactTitle: `Contact title (${lang})`,
  stats: [{ value: '10+', label: `Years (${lang})` }],
});

const products = [
  { id: 'a', title: 'Fake Oak', price: 120, imageKey: 'p/a.png', thumbKey: 'p/a_t.png' },
  {
    id: 'b',
    title: 'Fake Walnut',
    price: 80,
    description: 'A fake walnut floor.',
    plankSize: '90 × 600 mm',
    imageKey: 'p/b.png',
    tag: 'New',
  },
  { id: 'c', title: 'Fake Ash', price: 150, imageKey: 'p/c.png' },
  { id: 'd', title: 'Fake Birch', price: 95, imageKey: 'p/d.png' },
];

async function fakeBackend(route: Route) {
  const url = new URL(route.request().url());
  const ok = (data: unknown) => route.fulfill({ json: { success: true, data }, headers: CORS });
  const image = () => route.fulfill({ body: PNG, contentType: 'image/png', headers: CORS });

  switch (url.pathname) {
    case '/api/info':
      return ok(info(url.searchParams.get('lang') || 'en'));
    case '/api/products':
      return ok(products);
    case '/api/homepage-image':
      return url.searchParams.get('info') === 'true' ? ok({ version: 'v1' }) : image();
    case '/api/logo':
    case '/api/products/photo':
      return image();
    default:
      return route.fulfill({ status: 404, json: { success: false }, headers: CORS });
  }
}

export const test = base.extend<{ fakeBackend: void; consoleErrors: string[] }>({
  fakeBackend: [
    async ({ page }, run) => {
      // Registered first, so a spec's own page.route() for a failure case takes precedence
      if (MOCK_API) await page.route(isApi(), fakeBackend);
      await run();
    },
    { auto: true },
  ],

  /** Errors the page logged or threw (uncaught exceptions, failed resources, console.error) */
  consoleErrors: async ({ page }, run) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    await run(errors);
  },
});

export { expect } from '@playwright/test';
