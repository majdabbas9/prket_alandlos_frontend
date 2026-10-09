import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Car } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useInfo, parseOpeningTime } from '@/hooks/useInfo';
import { useLanguage } from '@/i18n/LanguageContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';
const HERO_IMG = `${SERVER_URL}/api/homepage-image`;

const DEFAULT_STATS = [
  { value: '30+', labelKey: 'home.statsYears' as const },
  { value: '1,200', labelKey: 'home.statsFloors' as const },
  { value: '9', labelKey: 'home.statsCollections' as const },
  { value: '4.9', labelKey: 'home.statsRating' as const },
];

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

export default function Home() {
  const { t } = useLanguage();
  const { info } = useInfo();
  const parsedHours = info ? parseOpeningTime(info.storeOpeningTime) : null;
  const statsToRender =
    info?.stats && info.stats.length > 0
      ? info.stats
      : DEFAULT_STATS.map((s) => ({ value: s.value, label: t(s.labelKey) }));

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt={t('home.heroImgAlt')}
            className="h-full w-full object-cover animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/55 to-ink-950/20 rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
        </div>

        <div className="container-wide relative z-10 pt-28">
          <div className="max-w-2xl">
            <p
              className="eyebrow animate-fade-up text-brass-300"
              style={{ animationDelay: '0.1s' }}
            >
              {info?.heroEyebrow || t('home.fallbackHeroEyebrow')}
            </p>
            <h1
              className="mt-5 font-display text-5xl font-700 leading-[1.05] text-sand-50 animate-fade-up sm:text-6xl lg:text-7xl whitespace-pre-line"
              style={{ animationDelay: '0.2s' }}
            >
              {info?.heroTitle || t('home.fallbackHeroTitle')}
            </h1>
            <p
              className="mt-6 max-w-xl text-lg leading-relaxed text-sand-100/85 animate-fade-up"
              style={{ animationDelay: '0.35s' }}
            >
              {info?.heroDescription || t('home.fallbackHeroDescription')}
            </p>
            <div
              className="mt-9 flex flex-wrap items-center gap-4 animate-fade-up"
              style={{ animationDelay: '0.5s' }}
            >
              <Link to="/products" className="btn-primary group">
                {t('home.exploreCollection')}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sand-50/30 px-7 py-3.5 text-sm font-medium tracking-wide text-sand-50 transition-all duration-300 hover:border-sand-50 hover:bg-sand-50/10"
              >
                {t('home.visitShowroom')}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container-wide pb-10">
            <div className="hidden gap-10 rounded-2xl border border-sand-50/15 bg-ink-950/30 px-8 py-6 backdrop-blur-md sm:grid sm:grid-cols-4">
              {statsToRender.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-700 text-sand-50">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-sand-100/70">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About / Craftsmanship */}
      {/*<section className="py-24 lg:py-32">
        <div className="container-wide grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-card">
                <img
                  src={ABOUT_IMG}
                  alt="Craftsman finishing a parquet floor"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-8 -right-4 hidden max-w-[14rem] rounded-2xl border border-ink-200 bg-sand-50 p-6 shadow-lift sm:block">
                <div className="flex items-center gap-1 text-brass-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm font-medium text-ink-900">
                  “The floor transformed our home. The craftsmanship is unmatched.”
                </p>
                <p className="mt-2 text-xs text-ink-500">— Elena R., Verified Client</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              <p className="eyebrow">Our Craft</p>
              <h2 className="mt-4 font-display text-4xl font-700 leading-tight text-walnut-900 sm:text-5xl">
                Three decades of devotion to the wood beneath your feet
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-ink-600">
                At Prket Alandlos, we believe a floor is the foundation of a home's
                character. For over thirty years our workshop has selected each board
                by eye, brushed every grain by hand, and finished each surface with
                natural oils that deepen with age.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-ink-600">
                We source exclusively from FSC-certified European forests, never
                compromising on the sustainability of our materials or the longevity
                of our craft. The result is flooring that doesn't just cover a room —
                it defines it.
              </p>

              <div className="mt-10 space-y-5">
                {VALUES.map((v) => (
                  <div key={v.title} className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-walnut-800/8 text-walnut-800">
                      <v.icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-600 text-walnut-900">{v.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-600">{v.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>*/}

      {/* Visit Us / Location */}
      <section className="bg-ink-950 py-24 text-sand-100 lg:py-32">
        <div className="container-wide">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow text-brass-300">
                {info?.showroomEyebrow || t('home.fallbackShowroomEyebrow')}
              </p>
              <h2 className="mt-4 font-display text-4xl font-700 text-sand-50 sm:text-5xl">
                {info?.showroomTitle || t('home.fallbackShowroomTitle')}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-sand-100/70">
                {info?.showroomDescription || t('home.fallbackShowroomDescription')}
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <Reveal>
              <div className="h-full rounded-2xl border border-sand-100/10 bg-sand-100/5 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-brass-400/40 hover:bg-sand-100/10">
                <MapPin className="h-7 w-7 text-brass-400" />
                <h3 className="mt-5 font-display text-xl font-600 text-sand-50">
                  {t('home.ourAddress')}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-sand-100/70">
                  {info?.location || 'kafr kanna, Isreal'}
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full rounded-2xl border border-sand-100/10 bg-sand-100/5 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-brass-400/40 hover:bg-sand-100/10">
                <Clock className="h-7 w-7 text-brass-400" />
                <h3 className="mt-5 font-display text-xl font-600 text-sand-50">
                  {t('home.openingHours')}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-sand-100/70">
                  {parsedHours ? (
                    <li>
                      <div>{parsedHours.days}</div>
                      <div className="text-xs text-sand-100/50 mt-0.5">{parsedHours.time}</div>
                    </li>
                  ) : (
                    <>
                      <li>{t('home.fallbackHoursSunThu')}</li>
                      <li>{t('home.fallbackHoursFriSat')}</li>
                    </>
                  )}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="h-full rounded-2xl border border-sand-100/10 bg-sand-100/5 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-brass-400/40 hover:bg-sand-100/10">
                <Car className="h-7 w-7 text-brass-400" />
                <h3 className="mt-5 font-display text-xl font-600 text-sand-50">
                  {t('home.gettingHere')}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-sand-100/70">
                  {t('home.gettingHereText', {
                    location: info?.location.split(',')[0] || 'kafr kanna',
                  })}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Map placeholder */}
          <Reveal delay={120}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-sand-100/10 shadow-card">
              <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-ink-900 to-walnut-900">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(214,190,138,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(214,190,138,0.15) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                  }}
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-4">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass-400 text-ink-950 shadow-lift">
                    <MapPin className="h-7 w-7" />
                  </span>
                  <p className="mt-4 font-display text-lg font-600 text-sand-50">
                    {t('home.showroomName')}
                  </p>
                  <p className="mt-1 text-sm text-sand-100/60">
                    {info?.location || 'kafr kanna, Isreal'}
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-3">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(info?.location || 'Alandlos Parquet Kafr Kanna')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-brass-400 px-5 py-2 text-xs font-bold uppercase tracking-wider text-ink-950 transition-all duration-300 hover:bg-brass-300 hover:scale-105 active:scale-95 shadow-md"
                    >
                      {t('home.googleMaps')}
                    </a>
                    <a
                      href={`https://waze.com/ul?q=${encodeURIComponent(info?.location || 'Alandlos Parquet Kafr Kanna')}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-sky-400 hover:scale-105 active:scale-95 shadow-md"
                    >
                      {t('home.waze')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/*<Reveal>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/contact" className="btn-primary">
                <Phone className="h-4 w-4" />
                contact 
              </Link>
              <a
                href={`mailto:${info?.email || 'contact@prketalandlos.com'}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sand-50/30 px-7 py-3.5 text-sm font-medium tracking-wide text-sand-50 transition-all duration-300 hover:border-sand-50 hover:bg-sand-50/10"
              >
                <Mail className="h-4 w-4" />
                {info?.email || 'contact@prketalandlos.com'}
              </a>
            </div>
          </Reveal>}*/}
        </div>
      </section>
    </>
  );
}
