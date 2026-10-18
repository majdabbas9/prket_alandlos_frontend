import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { mockApi, renderApp } from '@/test/utils';

describe('accessibility statement', () => {
  it('is linked from the footer on every page', async () => {
    mockApi();
    const { user } = renderApp('/products');

    await user.click(
      within(screen.getByRole('contentinfo')).getByRole('link', { name: 'بيان إتاحة الوصول' }),
    );

    expect(window.location.pathname).toBe('/accessibility');
    expect(screen.getByRole('heading', { level: 1, name: 'بيان إتاحة الوصول' })).toBeVisible();
  });

  it("gives the store's contact details for accessibility requests", async () => {
    mockApi();
    renderApp('/accessibility');
    const main = screen.getByRole('main');

    expect(await within(main).findByRole('link', { name: '04-6000000' })).toHaveAttribute(
      'href',
      'tel:04-6000000',
    );
    expect(within(main).getByRole('link', { name: 'info@prket.test' })).toHaveAttribute(
      'href',
      'mailto:info@prket.test',
    );
  });

  it('still gives a phone number when the backend is down', () => {
    mockApi({ info: 'error' });
    renderApp('/accessibility');

    expect(
      within(screen.getByRole('main')).getByRole('link', { name: '053-3919190' }),
    ).toHaveAttribute('href', 'tel:053-3919190');
  });
});
