import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { translate, type Lang, type TranslationKey } from './translations';
import { LanguageContext, type LanguageContextValue } from './LanguageContext';

const STORAGE_KEY = 'prket-alandlos-lang';

/** Saved user choice first, then browser language, then English. */
function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ar' || saved === 'he') return saved;
    const browser = (navigator.language || '').toLowerCase();
    if (browser.startsWith('ar')) return 'ar';
    if (browser.startsWith('he')) return 'he';
  } catch {
    // localStorage unavailable — fall through to English
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  useLayoutEffect(() => {
    const dir: 'ltr' | 'rtl' = lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = translate(lang, 'meta.title');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', translate(lang, 'meta.description'));
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage failures — the language still applies for this session
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      dir: lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr',
      setLang,
      t: (key: TranslationKey, params?: Record<string, string | number>) =>
        translate(lang, key, params),
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
