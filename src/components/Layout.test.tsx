import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
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

describe('keyboard access', () => {
  it('lets keyboard users skip straight to the page content', async () => {
    mockApi();
    const { user } = renderApp('/');

    await user.tab();
    const skip = screen.getByRole('link', { name: 'تخطَّ إلى المحتوى الرئيسي' });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });
});

describe('page changes', () => {
  it('opens each new page at the top', async () => {
    mockApi();
    const { user } = renderApp('/');
    const scrollTo = vi.mocked(window.scrollTo);
    scrollTo.mockClear();

    await user.click(within(header()).getAllByRole('link', { name: 'تواصلوا معنا' })[0]);

    expect(window.location.pathname).toBe('/contact');
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it('shows a placeholder icon instead of a broken logo when the logo fails to load', () => {
    mockApi();
    renderApp('/');
    const logo = within(header()).getByRole('img', { name: 'شعار بركيه الأندلس' });
    const placeholder = logo.parentElement!.querySelector<HTMLElement>('.logo-fallback')!;

    fireEvent.error(logo);

    expect(logo).not.toBeVisible();
    expect(placeholder.style.display).toBe('flex');
  });
});

describe('footer', () => {
  it('still gives working contact details when the backend is down', () => {
    mockApi({ info: 'error' });
    renderApp('/');

    expect(within(footer()).getByRole('link', { name: '053-3919190' })).toHaveAttribute(
      'href',
      'tel:053-3919190',
    );
    expect(within(footer()).getByRole('link', { name: 'إنستغرام' })).toBeInTheDocument();
    expect(within(footer()).getAllByRole('link', { name: 'المنتجات' })[0]).toHaveAttribute(
      'href',
      '/products',
    );
  });

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
