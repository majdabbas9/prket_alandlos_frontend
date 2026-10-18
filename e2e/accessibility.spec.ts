import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';
import { visitAs, type Lang } from './support';

// Automated WCAG 2.1 A/AA checks (Israeli Standard 5568 is based on WCAG AA) on every page, in
// every language. Reduced motion makes the scroll-reveal content visible without scrolling.
const PAGES = ['/', '/products', '/contact', '/accessibility'];
const LANGS: Lang[] = ['ar', 'he', 'en'];

test.use({ reducedMotion: 'reduce' });

for (const lang of LANGS) {
  for (const path of PAGES) {
    test(`${path} (${lang}) has no detectable accessibility violations`, async ({ page }) => {
      await visitAs(page, lang);
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual(
        [],
      );
    });
  }
}
