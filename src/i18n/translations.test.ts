import { describe, expect, it } from 'vitest';
import { LANGS, translate, translations, type Lang, type TranslationKey } from './translations';

const keys = Object.keys(translations.en) as TranslationKey[];
const placeholders = (s: string): string[] => (s.match(/\{\w+\}/g) ?? []).sort();

describe('translations', () => {
  it('offers Arabic, Hebrew and English in the language switcher', () => {
    expect(LANGS.map((l) => l.code).sort()).toEqual(['ar', 'en', 'he']);
  });

  it.each<Lang>(['ar', 'he'])('%s translates every UI string', (lang) => {
    const missing = keys.filter((k) => !translations[lang][k]?.trim());
    expect(missing).toEqual([]);
  });

  // A translation may leave a placeholder out (Arabic "one product" has no {count}), but one
  // English doesn't fill in would show up literally on the page
  it.each<Lang>(['ar', 'he'])('%s only uses {placeholders} that English fills in', (lang) => {
    const broken = keys.filter((k) => {
      const known = placeholders(translations.en[k]);
      return placeholders(translations[lang][k]).some((p) => !known.includes(p));
    });
    expect(broken).toEqual([]);
  });

  it('keeps the numbers in the product count wherever English has them', () => {
    expect(translate('ar', 'products.showingMany', { count: 12 })).toContain('12');
    expect(translate('he', 'products.showingMany', { count: 12 })).toContain('12');
    expect(translate('he', 'products.showResults', { count: 4 })).toContain('4');
  });

  it('fills in placeholders', () => {
    expect(translate('ar', 'products.showingMany', { count: 7 })).toBe('عرض 7 من المنتجات');
    expect(translate('en', 'footer.rights', { year: 2026 })).toBe(
      '© 2026 Prket Alandlos. All rights reserved.',
    );
  });

  it('falls back to English for a string missing in another language', () => {
    const saved = translations.he['nav.home'];
    translations.he['nav.home'] = '';
    try {
      expect(translate('he', 'nav.home')).toBe('Home');
    } finally {
      translations.he['nav.home'] = saved;
    }
  });
});
