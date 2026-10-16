import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '@/App';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import type { StoreInfo } from '@/hooks/useInfo';
import type { Lang } from '@/i18n/translations';

export const API = 'http://api.test';

/** Store info as the backend returns it, per language. */
export const STORE_INFO: Record<Lang, StoreInfo> = {
  ar: {
    lang: 'ar',
    showPrice: true,
    storeOpeningTime: 'السبت — الخميس 9:00 صباحًا — 7:00 مساءً',
    email: 'info@prket.test',
    phone: '04-6000000',
    whatsappLink: 'wa.me/+972500000000',
    location: 'كفر كنا، شارع الرئيسي',
    description: 'وصف المتجر من الخادم',
    heroEyebrow: 'باركيه منذ 1994',
    heroTitle: 'أرضيات من الخادم',
    heroDescription: 'وصف البطل من الخادم',
    showroomEyebrow: 'صالة العرض',
    showroomTitle: 'عنوان صالة العرض من الخادم',
    showroomDescription: 'وصف صالة العرض',
    contactEyebrow: 'تواصل',
    contactTitle: 'عنوان التواصل من الخادم',
    contactDescription: 'وصف التواصل',
    stats: [{ value: '25+', label: 'سنة خبرة' }],
  },
  en: {
    lang: 'en',
    showPrice: true,
    storeOpeningTime: 'Saturday — Thursday 9:00 AM — 7:00 PM',
    email: 'info@prket.test',
    phone: '04-6000000',
    whatsappLink: 'wa.me/+972500000000',
    location: 'Kafr Kanna, Main Street',
    heroTitle: 'Floors from the server',
    contactTitle: 'Contact title from the server',
    showroomTitle: 'Showroom title from the server',
  },
  he: {
    lang: 'he',
    showPrice: true,
    storeOpeningTime: 'שבת — חמישי 9:00 — 19:00',
    email: 'info@prket.test',
    phone: '04-6000000',
    whatsappLink: 'wa.me/+972500000000',
    location: 'כפר כנא, הרחוב הראשי',
    heroTitle: 'רצפות מהשרת',
  },
};

/** Raw products as GET /api/products returns them (backend field names). */
export const API_PRODUCTS = [
  {
    id: 'p1',
    title: 'Natural Oak',
    woodType: 'Oak',
    finish: 'Matt',
    thickness: '14 mm',
    plankSize: '180 × 2200 mm',
    description: 'Pale oak with a soft matt lacquer.',
    price: 95,
    imageKey: 'products/oak.jpg',
    thumbKey: 'products/oak_thumb.jpg',
  },
  {
    id: 'p2',
    title: 'Chevron Walnut',
    woodType: 'Chevron',
    finish: 'Brushed',
    thickness: '15 mm',
    plankSize: '90 × 450 mm',
    description: 'Walnut laid in a sharp chevron.',
    price: 142,
    imageUrl: 'https://images.test/products/walnut.jpg',
    thumbUrl: 'https://images.test/products/walnut_thumb.jpg',
    tag: 'Premium',
  },
  {
    id: 'p3',
    title: 'Brushed Herringbone',
    woodType: 'Herringbone',
    finish: 'Glossy',
    thickness: '15 mm',
    plankSize: '120 × 600 mm',
    description: 'Classic herringbone.',
    price: 119,
    imageKey: 'products/herring.jpg',
  },
];

type Reply = { status?: number; body: unknown } | 'network-error';

export interface ApiMockOptions {
  /** Per-language info, or a failure for every /api/info call */
  info?: Partial<Record<Lang, StoreInfo>> | 'error';
  products?: unknown[] | 'error' | 'network-error' | { status: number; body: unknown };
  /** Current hero image version, or a failure of the metadata lookup */
  homepageVersion?: string | 'error';
}

/**
 * Stubs global fetch with a fake backend. Returns the vi.fn so tests can inspect calls.
 * Unknown URLs fail like an unreachable server.
 */
export function mockApi({
  info = STORE_INFO,
  products = API_PRODUCTS,
  homepageVersion = 'v1',
}: ApiMockOptions = {}) {
  const reply = (r: Reply) =>
    r === 'network-error'
      ? Promise.reject(new TypeError('Failed to fetch'))
      : Promise.resolve(
          new Response(JSON.stringify(r.body), {
            status: r.status ?? 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = new URL(String(input));
    if (url.pathname === '/api/info') {
      if (info === 'error') return reply('network-error');
      const lang = (url.searchParams.get('lang') || 'en') as Lang;
      const data = info[lang];
      return reply(
        data
          ? { body: { success: true, data } }
          : { status: 400, body: { success: false, error: 'bad lang' } },
      );
    }
    if (url.pathname === '/api/homepage-image' && url.searchParams.get('info') === 'true') {
      if (homepageVersion === 'error') return reply('network-error');
      return reply({ body: { success: true, data: { version: homepageVersion } } });
    }
    if (url.pathname === '/api/products') {
      if (products === 'error') return reply({ status: 500, body: { success: false } });
      if (products === 'network-error') return reply('network-error');
      if (!Array.isArray(products)) return reply(products);
      return reply({ body: { success: true, data: products } });
    }
    return reply('network-error');
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Renders the whole app (router, layout, language provider) at `path`. */
export function renderApp(path = '/', { lang }: { lang?: Lang } = {}) {
  if (lang) localStorage.setItem('prket-alandlos-lang', lang);
  window.history.pushState({}, '', path);
  const user = userEvent.setup();
  const utils = render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );
  return { user, ...utils };
}
