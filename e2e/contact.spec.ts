import { expect, test } from './fixtures';
import { storeInfo, whatsappHref } from './support';

test.describe('contact page', () => {
  test("gives the store's real phone, WhatsApp and address", async ({ page }) => {
    const infoP = storeInfo(page, 'ar');
    await page.goto('/contact');
    const info = await infoP;
    const main = page.getByRole('main');

    if (info.contactTitle) {
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(info.contactTitle);
    }

    const call = main.getByRole('link', { name: /اتصلوا بنا/ });
    await expect(call).toHaveAttribute('href', `tel:${info.phone}`);
    await expect(call.getByText(info.phone, { exact: true })).toHaveAttribute('dir', 'ltr');

    const whatsapp = main.getByRole('link', { name: /راسلونا عبر واتساب/ });
    await expect(whatsapp).toHaveAttribute('href', whatsappHref(info.whatsappLink));
    // Always an absolute link, even when the admin saved it without a scheme
    await expect(whatsapp).toHaveAttribute('href', /^https?:\/\/\S+/);

    await expect(main.getByText(info.location, { exact: true }).first()).toBeVisible();
  });

  test('directions open Google Maps and Waze at the store address', async ({ page }) => {
    const infoP = storeInfo(page, 'ar');
    await page.goto('/contact');
    const q = encodeURIComponent((await infoP).location);
    const main = page.getByRole('main');

    await expect(main.getByRole('link', { name: 'خرائط جوجل' })).toHaveAttribute(
      'href',
      `https://maps.google.com/?q=${q}`,
    );
    await expect(main.getByRole('link', { name: 'ويز' })).toHaveAttribute(
      'href',
      `https://waze.com/ul?q=${q}&navigate=yes`,
    );
    await expect(main.getByRole('link', { name: 'خرائط جوجل' })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  test('footer shows the same contact details on every page', async ({ page }) => {
    const infoP = storeInfo(page, 'ar');
    await page.goto('/products');
    const info = await infoP;
    const footer = page.getByRole('contentinfo');

    await expect(footer.getByRole('link', { name: info.phone, exact: true })).toHaveAttribute(
      'href',
      `tel:${info.phone}`,
    );
    // The address in the contact list; the store description above it may be the same text
    await expect(
      footer.getByRole('listitem').getByText(info.location, { exact: true }),
    ).toBeVisible();
    await expect(footer.getByRole('link', { name: 'إنستغرام' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/prket_alandlos/',
    );
  });
});
