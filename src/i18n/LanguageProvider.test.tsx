import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { mockApi, renderApp } from '@/test/utils';

describe('site language', () => {
  it('opens in Arabic, right-to-left, for a first-time visitor', async () => {
    mockApi();
    renderApp('/');

    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.title).toBe('بركيه الأندلس — أرضيات خشبية خالدة');
    expect(screen.getAllByRole('link', { name: 'الرئيسية' }).length).toBeGreaterThan(0);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'أرضيات من الخادم' }),
    ).toBeVisible();
  });

  it('asks the backend for Arabic store info by default', async () => {
    const fetchMock = mockApi();
    renderApp('/');

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const infoCalls = fetchMock.mock.calls
      .map(([url]) => new URL(String(url)))
      .filter((u) => u.pathname === '/api/info');
    expect(infoCalls.length).toBeGreaterThan(0);
    expect(infoCalls.every((u) => u.searchParams.get('lang') === 'ar')).toBe(true);
  });

  it("ignores the browser's language and still defaults to Arabic", () => {
    const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'language')!;
    Object.defineProperty(Navigator.prototype, 'language', {
      get: () => 'he-IL',
      configurable: true,
    });
    try {
      mockApi();
      renderApp('/');
      expect(document.documentElement.lang).toBe('ar');
    } finally {
      Object.defineProperty(Navigator.prototype, 'language', original);
    }
  });

  it("remembers a returning visitor's choice", () => {
    mockApi();
    renderApp('/', { lang: 'en' });

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThan(0);
  });

  it('falls back to Arabic when the saved choice is not a supported language', () => {
    localStorage.setItem('prket-alandlos-lang', 'fr');
    mockApi();
    renderApp('/');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('switches to English, reloads the store copy in English and remembers it', async () => {
    mockApi();
    const { user } = renderApp('/');
    await screen.findByRole('heading', { level: 1, name: 'أرضيات من الخادم' });

    await user.click(screen.getAllByRole('button', { name: 'English' })[0]);

    expect(document.documentElement.dir).toBe('ltr');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Floors from the server' }),
    ).toBeVisible();
    expect(localStorage.getItem('prket-alandlos-lang')).toBe('en');
    expect(screen.getAllByRole('button', { name: 'English' })[0]).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switches to Hebrew, which is also right-to-left', async () => {
    mockApi();
    const { user } = renderApp('/', { lang: 'en' });

    await user.click(screen.getAllByRole('button', { name: 'עברית' })[0]);

    expect(document.documentElement.lang).toBe('he');
    expect(document.documentElement.dir).toBe('rtl');
    expect(await screen.findByRole('heading', { level: 1, name: 'רצפות מהשרת' })).toBeVisible();
  });
});
