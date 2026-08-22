import {
  Phone,
  MapPin,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useInfo, parseOpeningTime } from '@/hooks/useInfo';
import { useLanguage } from '@/i18n/LanguageContext';

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Contact() {
  const { t } = useLanguage();
  const { info } = useInfo();
  const parsedHours = info ? parseOpeningTime(info.storeOpeningTime) : null;

  const contactCards = [
    {
      icon: Phone,
      title: t('contact.callUs'),
      lines: [
        info?.phone || '053-3919190',
        parsedHours ? `${parsedHours.days}, ${parsedHours.time}` : t('contact.fallbackHours'),
      ],
      href: `tel:${info?.phone || '053-3919190'}`,
      ltr: true,
    },
    {
      icon: MessageCircle,
      title: t('contact.whatsappUs'),
      lines: [info?.whatsappLink || 'wa.me/+972533919190', t('contact.clickToChat')],
      href: info?.whatsappLink ? (info.whatsappLink.startsWith('http') ? info.whatsappLink : `https://${info.whatsappLink}`) : 'https://wa.me/+972533919190',
      ltr: true,
    },
    {
      icon: MapPin,
      title: t('contact.visitShowroom'),
      lines: [info?.location || 'kafr kanna, Isreal'],
      href: '#location',
      ltr: false,
    },
  ];

  return (
    <>
      {/* Header */}
      <section className="bg-ink-950 pt-36 pb-20 text-sand-100 lg:pt-44 lg:pb-28">
        <div className="container-wide">
          <p className="eyebrow text-brass-300">{info?.contactEyebrow || t('contact.fallbackEyebrow')}</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-700 leading-[1.05] text-sand-50 sm:text-6xl">
            {info?.contactTitle || t('contact.fallbackTitle')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sand-100/70">
            {info?.contactDescription || t('contact.fallbackDescription')}
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <div className="grid gap-6 md:grid-cols-3">
            {contactCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 100}>
                <a
                  href={card.href}
                  className="group flex h-full flex-col rounded-2xl border border-ink-200/70 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-walnut-800/30 hover:shadow-card"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-walnut-800/8 text-walnut-800 transition-colors group-hover:bg-walnut-800 group-hover:text-sand-50">
                    <card.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-600 text-walnut-900">{card.title}</h3>
                  {card.lines.map((line, lineIndex) => (
                    <p
                      key={line}
                      dir={card.ltr && lineIndex === 0 ? 'ltr' : undefined}
                      className="mt-1 text-sm leading-relaxed text-ink-500"
                    >
                      {line}
                    </p>
                  ))}
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Store hours & location */}
      <section className="pb-24 lg:pb-32">
        <div className="container-wide">
          <Reveal>
            <div id="location" className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="rounded-2xl border border-ink-200/70 bg-white p-8 shadow-soft">
                  <h3 className="flex items-center gap-2 font-display text-2xl font-700 text-walnut-900">
                    <Clock className="h-6 w-6 text-brass-500" />
                    {t('contact.storeHours')}
                  </h3>
                  <ul className="mt-5 divide-y divide-ink-100">
                    {parsedHours ? (
                      <li className="flex flex-col gap-1 py-3 justify-center">
                        <span className="text-sm text-ink-600 font-semibold">{parsedHours.days}</span>
                        <span className="text-sm font-medium text-walnut-900">{parsedHours.time}</span>
                      </li>
                    ) : (
                      <>
                        <li className="flex items-center justify-between py-3">
                          <span className="text-sm text-ink-600">Sunday — Thursday</span>
                          <span className="text-sm font-medium text-walnut-900">9:00 AM — 7:00 PM</span>
                        </li>
                        <li className="flex items-center justify-between py-3">
                          <span className="text-sm text-ink-600">Friday — Saturday</span>
                          <span className="text-sm font-medium text-walnut-900">10:00 AM — 9:00 PM</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border border-ink-200/70 bg-white p-8 shadow-soft">
                  <h3 className="flex items-center gap-2 font-display text-2xl font-700 text-walnut-900">
                    <MapPin className="h-6 w-6 text-brass-500" />
                    {t('contact.howToFindUs')}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ink-600">
                    {info?.location || 'kafr kanna, Isreal'}
                  </p>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="overflow-hidden rounded-2xl border border-ink-200/70 shadow-soft h-full flex flex-col justify-between">
                <div className="relative flex-1 min-h-[300px] bg-gradient-to-br from-sand-200 to-sand-300">
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(122,90,46,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(122,90,46,0.12) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-4">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-walnut-800 text-sand-50 shadow-card">
                      <MapPin className="h-6 w-6" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-walnut-900 font-display">{t('home.showroomName')}</p>
                    <p className="mt-1 text-xs text-ink-500">{info?.location || 'kafr kanna, Isreal'}</p>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(info?.location || 'Alandlos Parquet Kafr Kanna')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-walnut-800 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sand-50 transition-all duration-300 hover:bg-walnut-700 hover:scale-105 active:scale-95 shadow-sm"
                      >
                        {t('home.googleMaps')}
                      </a>
                      <a
                        href={`https://waze.com/ul?q=${encodeURIComponent(info?.location || 'Alandlos Parquet Kafr Kanna')}&navigate=yes`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-sky-400 hover:scale-105 active:scale-95 shadow-sm"
                      >
                        {t('home.waze')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
