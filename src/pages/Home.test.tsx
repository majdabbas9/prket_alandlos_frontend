import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { API, mockApi, renderApp } from '@/test/utils';

describe('home page', () => {
  it("shows the store's hero copy and stats from the backend", async () => {
    mockApi();
    renderApp('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'أرضيات من الخادم' }),
    ).toBeVisible();
    expect(screen.getByText('باركيه منذ 1994')).toBeVisible();
    expect(screen.getByText('وصف البطل من الخادم')).toBeVisible();
    expect(screen.getByText('25+')).toBeInTheDocument();
    expect(screen.getByText('سنة خبرة')).toBeInTheDocument();
  });

  it('shows the showroom section with address and opening hours', async () => {
    mockApi();
    renderApp('/');

    expect(
      await screen.findByRole('heading', { name: 'عنوان صالة العرض من الخادم' }),
    ).toBeVisible();
    const address = screen.getByRole('heading', { name: 'عنواننا' }).parentElement!;
    expect(within(address).getByText('كفر كنا، شارع الرئيسي')).toBeVisible();
    const hours = screen.getAllByRole('heading', { name: 'ساعات العمل' })[0].parentElement!;
    expect(within(hours).getByText('السبت — الخميس')).toBeVisible();
    expect(within(hours).getByText('9:00 صباحًا — 7:00 مساءً')).toBeVisible();
    // Parking note names the town: the address up to its first ASCII comma
    expect(
      screen.getByText('مواقف مجانية لجميع زوّار صالة العرض. نقع في كفر كنا، شارع الرئيسي.'),
    ).toBeVisible();
  });

  it('is fully readable in Arabic when the backend is down', async () => {
    mockApi({ info: 'error' });
    renderApp('/');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('أناقة خالدة');
    expect(screen.getByText('سنوات من الحِرفة')).toBeInTheDocument();
    expect(screen.getByText('الأحد — الخميس: 9:00 صباحًا — 7:00 مساءً')).toBeVisible();
  });

  it('loads the current version of the hero photo through the API when no image CDN is configured', async () => {
    mockApi({ homepageVersion: 'abc123' });
    renderApp('/');

    // Versioned, so a new upload by the admin never shows the browser's cached copy
    expect(await screen.findByRole('img', { name: /أرضيات باركيه فاخرة/ })).toHaveAttribute(
      'src',
      `${API}/api/homepage-image?v=abc123`,
    );
  });

  it('switches to the new hero photo when the admin uploads one while the page is open', async () => {
    // jsdom never loads images; let preloads finish at once
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null;
        set src(_: string) {
          queueMicrotask(() => this.onload?.());
        }
      },
    );
    mockApi({ homepageVersion: 'old' });
    renderApp('/');
    const hero = await screen.findByRole('img', { name: /أرضيات باركيه فاخرة/ });
    expect(hero).toHaveAttribute('src', `${API}/api/homepage-image?v=old`);

    // The admin uploads a new image; the visitor comes back to the tab
    mockApi({ homepageVersion: 'new' });
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() =>
      expect(screen.getByRole('img', { name: /أرضيات باركيه فاخرة/ })).toHaveAttribute(
        'src',
        `${API}/api/homepage-image?v=new`,
      ),
    );
  });

  it('still shows the hero photo when its version cannot be looked up', async () => {
    mockApi({ homepageVersion: 'error' });
    renderApp('/');

    expect(await screen.findByRole('img', { name: /أرضيات باركيه فاخرة/ })).toHaveAttribute(
      'src',
      `${API}/api/homepage-image`,
    );
  });

  it('takes a visitor from the hero to the collection', async () => {
    mockApi();
    const { user } = renderApp('/');

    const main = screen.getByRole('main');
    await user.click(within(main).getByRole('link', { name: /استكشفوا المجموعة/ }));

    expect(window.location.pathname).toBe('/products');
    expect(await screen.findAllByRole('article')).toHaveLength(3);
  });

  it('takes a visitor from the hero to the showroom contact details', async () => {
    mockApi();
    const { user } = renderApp('/');

    await user.click(
      within(screen.getByRole('main')).getByRole('link', { name: 'زوروا صالة العرض' }),
    );

    expect(window.location.pathname).toBe('/contact');
  });

  it('shows the home page for unknown addresses', async () => {
    mockApi();
    renderApp('/no-such-page');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'أرضيات من الخادم' }),
    ).toBeVisible();
  });
});
