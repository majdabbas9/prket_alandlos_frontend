import type { ReactNode } from 'react';
import { useInfo } from '@/hooks/useInfo';
import { useLanguage } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

// Update together with the statement's content
const LAST_UPDATED = '18.10.2026';

const FEATURES: TranslationKey[] = [
  'a11y.feature1',
  'a11y.feature2',
  'a11y.feature3',
  'a11y.feature4',
  'a11y.feature5',
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold text-walnut-900">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export default function Accessibility() {
  const { t } = useLanguage();
  const { info } = useInfo();
  const phone = info?.phone || '053-3919190';

  return (
    <>
      <section className="bg-ink-950 pt-36 pb-20 text-sand-100 lg:pt-44 lg:pb-28">
        <div className="container-wide">
          <p className="eyebrow text-brass-300">{t('a11y.eyebrow')}</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-sand-50 sm:text-6xl">
            {t('a11y.title')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sand-100/70">
            {t('a11y.intro')}
          </p>
        </div>
      </section>

      <div className="container-wide py-16 lg:py-24">
        <div className="max-w-3xl space-y-12 leading-relaxed text-ink-700">
          <Section title={t('a11y.standardTitle')}>
            <p>{t('a11y.standardText')}</p>
          </Section>

          <Section title={t('a11y.featuresTitle')}>
            <ul className="list-disc space-y-2 ps-5">
              {FEATURES.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </Section>

          <Section title={t('a11y.limitationsTitle')}>
            <p>{t('a11y.limitationsText')}</p>
          </Section>

          <Section title={t('a11y.contactTitle')}>
            <p>{t('a11y.contactText')}</p>
            <dl className="space-y-1">
              <div className="flex gap-2">
                <dt className="font-semibold">{t('a11y.phone')}:</dt>
                <dd>
                  <a href={`tel:${phone}`} dir="ltr" className="text-walnut-800 underline">
                    {phone}
                  </a>
                </dd>
              </div>
              {info?.email && (
                <div className="flex gap-2">
                  <dt className="font-semibold">{t('a11y.email')}:</dt>
                  <dd>
                    <a href={`mailto:${info.email}`} className="text-walnut-800 underline">
                      {info.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </Section>

          <p className="text-sm text-ink-500">{t('a11y.updated', { date: LAST_UPDATED })}</p>
        </div>
      </div>
    </>
  );
}
