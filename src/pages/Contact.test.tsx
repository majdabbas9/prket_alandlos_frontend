import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { STORE_INFO, mockApi, renderApp } from '@/test/utils';

const main = () => screen.getByRole('main');

describe('contact page', () => {
  it("shows the store's own heading from the backend", async () => {
    mockApi();
    renderApp('/contact');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'عنوان التواصل من الخادم' }),
    ).toBeVisible();
  });

  it('lets a visitor call the store', async () => {
    mockApi();
    renderApp('/contact');

    const call = await screen.findByRole('link', { name: /اتصلوا بنا/ });
    await expect.poll(() => call.getAttribute('href')).toBe('tel:04-6000000');
    // Opening hours next to the number, split into days and time
    expect(within(call).getByText('السبت — الخميس, 9:00 صباحًا — 7:00 مساءً')).toBeVisible();
    // Digits must read left-to-right inside the Arabic page
    expect(within(call).getByText('04-6000000')).toHaveAttribute('dir', 'ltr');
  });

  it('turns a bare WhatsApp link into an https link', async () => {
    mockApi();
    renderApp('/contact');

    const whatsapp = await screen.findByRole('link', { name: /راسلونا عبر واتساب/ });
    await expect.poll(() => whatsapp.getAttribute('href')).toBe('https://wa.me/+972500000000');
  });

  it('keeps a WhatsApp link that already has a scheme', async () => {
    mockApi({
      info: { ar: { ...STORE_INFO.ar, whatsappLink: 'https://wa.me/972511111111' } },
    });
    renderApp('/contact');

    const whatsapp = await screen.findByRole('link', { name: /راسلونا عبر واتساب/ });
    await expect.poll(() => whatsapp.getAttribute('href')).toBe('https://wa.me/972511111111');
  });

  it('shows the store hours and address', async () => {
    mockApi();
    renderApp('/contact');

    const hours = (await within(main()).findByRole('heading', { name: 'ساعات العمل' }))
      .parentElement!;
    expect(await within(hours).findByText('السبت — الخميس')).toBeVisible();
    expect(within(hours).getByText('9:00 صباحًا — 7:00 مساءً')).toBeVisible();

    const findUs = within(main()).getByRole('heading', { name: 'كيف تجدوننا' }).parentElement!;
    expect(within(findUs).getByText('كفر كنا، شارع الرئيسي')).toBeVisible();
  });

  it('links to Google Maps and Waze for the store address', async () => {
    mockApi();
    renderApp('/contact');

    const location = encodeURIComponent('كفر كنا، شارع الرئيسي');
    await expect
      .poll(() => screen.getByRole('link', { name: 'خرائط جوجل' }).getAttribute('href'))
      .toBe(`https://maps.google.com/?q=${location}`);
    expect(screen.getByRole('link', { name: 'ويز' })).toHaveAttribute(
      'href',
      `https://waze.com/ul?q=${location}&navigate=yes`,
    );
  });

  it('still shows working contact details in Arabic when the backend is down', async () => {
    mockApi({ info: 'error' });
    renderApp('/contact');

    expect(screen.getByRole('heading', { level: 1, name: 'لنتحدث عن أرضيتكم' })).toBeVisible();
    expect(screen.getByRole('link', { name: /اتصلوا بنا/ })).toHaveAttribute(
      'href',
      'tel:053-3919190',
    );
    expect(screen.getByRole('link', { name: /راسلونا عبر واتساب/ })).toHaveAttribute(
      'href',
      'https://wa.me/+972533919190',
    );
    const hours = within(main()).getByRole('heading', { name: 'ساعات العمل' }).parentElement!;
    expect(within(hours).getByText('الأحد — الخميس')).toBeVisible();
    expect(within(hours).getByText('الجمعة — السبت')).toBeVisible();
  });
});
