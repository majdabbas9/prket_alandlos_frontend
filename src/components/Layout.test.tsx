import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { STORE_INFO, mockApi, renderApp } from '@/test/utils';

const footer = () => screen.getByRole('contentinfo');
const header = () => screen.getByRole('banner');

describe('site navigation', () => {
  it('reaches every page from the top navigation', async () => {
    mockApi();
    const { user } = renderApp('/');

    await user.click(within(header()).getAllByRole('link', { name: 'المنتجات' })[0]);
    expect(window.location.pathname).toBe('/products');

    await user.click(within(header()).getAllByRole('link', { name: 'تواصلوا معنا' })[0]);
    expect(window.location.pathname).toBe('/contact');

    await user.click(within(header()).getAllByRole('link', { name: 'الرئيسية' })[0]);
    expect(window.location.pathname).toBe('/');
  });

  it('opens and closes the mobile menu', async () => {
    mockApi();
    const { user } = renderApp('/');
    const toggle = within(header()).getByRole('button', { name: 'فتح/إغلاق القائمة' });

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Choosing a page closes the menu again
    const drawerLinks = within(header()).getAllByRole('link', { name: 'المنتجات' });
    await user.click(drawerLinks[drawerLinks.length - 1]);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(window.location.pathname).toBe('/products');
  });
});

describe('footer', () => {
  it("shows the store's contact details and hours from the backend", async () => {
    mockApi();
    renderApp('/');

    expect(await within(footer()).findByText('وصف المتجر من الخادم')).toBeVisible();
    expect(within(footer()).getByRole('link', { name: '04-6000000' })).toHaveAttribute(
      'href',
      'tel:04-6000000',
    );
    expect(within(footer()).getByRole('link', { name: 'wa.me/+972500000000' })).toHaveAttribute(
      'href',
      'https://wa.me/+972500000000',
    );
    expect(within(footer()).getByText('السبت — الخميس')).toBeVisible();
    expect(within(footer()).getByText('9:00 صباحًا — 7:00 مساءً')).toBeVisible();
  });

  it('offers Instagram always and WhatsApp only when the store has a WhatsApp number', async () => {
    mockApi({ info: { ar: { ...STORE_INFO.ar, whatsappLink: '' } } });
    renderApp('/');

    expect(await within(footer()).findByText('وصف المتجر من الخادم')).toBeVisible();
    expect(within(footer()).getByRole('link', { name: 'إنستغرام' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/prket_alandlos/',
    );
    expect(within(footer()).queryByRole('link', { name: 'واتساب' })).toBeNull();
  });

  it('shows the WhatsApp social link when the store has a number', async () => {
    mockApi();
    renderApp('/');

    expect(await within(footer()).findByRole('link', { name: 'واتساب' })).toHaveAttribute(
      'href',
      'https://wa.me/+972500000000',
    );
  });

  it('shows the current year in the copyright line', () => {
    mockApi();
    renderApp('/');

    expect(
      within(footer()).getByText(
        `© ${new Date().getFullYear()} بركيه الأندلس. جميع الحقوق محفوظة.`,
      ),
    ).toBeVisible();
  });
});
