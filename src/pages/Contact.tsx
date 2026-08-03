import { useState, type FormEvent } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Car,
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useInfo, parseOpeningTime } from '@/hooks/useInfo';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const { info } = useInfo();
  const parsedHours = info ? parseOpeningTime(info.storeOpeningTime) : null;

  const contactCards = [
    {
      icon: Phone,
      title: 'Call Us',
      lines: [info?.phone || '053-3919190', parsedHours ? `${parsedHours.days}, ${parsedHours.time}` : 'Mon — Sat, 9am to 7pm'],
      href: `tel:${info?.phone || '053-3919190'}`,
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Us',
      lines: [info?.whatsappLink || 'wa.me/+972533919190', 'Click to chat with us'],
      href: info?.whatsappLink ? (info.whatsappLink.startsWith('http') ? info.whatsappLink : `https://${info.whatsappLink}`) : 'https://wa.me/+972533919190',
    },
    {
      icon: MapPin,
      title: 'Visit the Showroom',
      lines: [info?.location || 'kafr kanna, Isreal'],
      href: '#location',
    },
  ];

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  const validate = (data: FormState): Errors => {
    const e: Errors = {};
    if (!data.fullName.trim()) e.fullName = 'Please enter your full name.';
    if (!data.email.trim()) e.email = 'Please enter your email address.';
    else if (!EMAIL_RE.test(data.email)) e.email = 'Please enter a valid email address.';
    if (data.phone && !/^[\d\s()+\-]+$/.test(data.phone)) e.phone = 'Please enter a valid phone number.';
    if (!data.message.trim()) e.message = 'Please tell us how we can help.';
    else if (data.message.trim().length < 10) e.message = 'Your message should be at least 10 characters.';
    return e;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) {
      setErrors(validate(next));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    setTouched({ fullName: true, email: true, phone: true, message: true });
    if (Object.keys(validation).length === 0) {
      setSubmitted(true);
    }
  };

  const resetForm = () => {
    setForm({ fullName: '', email: '', phone: '', message: '' });
    setErrors({});
    setTouched({});
    setSubmitted(false);
  };

  return (
    <>
      {/* Header */}
      <section className="bg-ink-950 pt-36 pb-20 text-sand-100 lg:pt-44 lg:pb-28">
        <div className="container-wide">
          <p className="eyebrow text-brass-300">Get in Touch</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-700 leading-[1.05] text-sand-50 sm:text-6xl">
            Let's talk about your floor
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sand-100/70">
            Whether you're planning a renovation or just exploring finishes, our
            specialists are here to help. Reach out and we'll find the right wood for your space.
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
                  {card.lines.map((line) => (
                    <p key={line} className="mt-1 text-sm leading-relaxed text-ink-500">
                      {line}
                    </p>
                  ))}
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Form + details */}
      <section className="pb-24 lg:pb-32">
        <div className="container-wide grid gap-10 lg:grid-cols-5 lg:gap-14">
          {/* Form */}
          <Reveal className="lg:col-span-3">
            <div className="rounded-2xl border border-ink-200/70 bg-white p-8 shadow-card lg:p-10">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brass-400/15 text-brass-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </span>
                  <h2 className="mt-6 font-display text-3xl font-700 text-walnut-900">Thank you!</h2>
                  <p className="mt-3 max-w-md text-ink-600">
                    Your message has been received. One of our flooring specialists will
                    get back to you within 24 hours.
                  </p>
                  <button type="button" onClick={resetForm} className="mt-8 btn-outline">
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-3xl font-700 text-walnut-900">Send us a message</h2>
                  <p className="mt-2 text-sm text-ink-500">
                    Fill in the form below and we'll be in touch shortly.
                  </p>

                  <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                      <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-ink-800">
                        Full Name <span className="text-brass-600">*</span>
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
                        <input
                          id="fullName"
                          type="text"
                          value={form.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          onBlur={() => handleBlur('fullName')}
                          placeholder="Jane Doe"
                          className={`field-input pl-11 ${
                            errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
                          }`}
                          aria-invalid={!!errors.fullName}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink-800">
                          Email Address <span className="text-brass-600">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
                          <input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            placeholder="jane@example.com"
                            className={`field-input pl-11 ${
                              errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
                            }`}
                            aria-invalid={!!errors.email}
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink-800">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
                          <input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            onBlur={() => handleBlur('phone')}
                            placeholder="+1 (212) 555-0123"
                            className={`field-input pl-11 ${
                              errors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
                            }`}
                            aria-invalid={!!errors.phone}
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="mb-2 block text-sm font-medium text-ink-800">
                        Message / Inquiry <span className="text-brass-600">*</span>
                      </label>
                      <div className="relative">
                        <MessageSquare className="pointer-events-none absolute left-4 top-4 h-4.5 w-4.5 text-ink-400" />
                        <textarea
                          id="message"
                          rows={5}
                          value={form.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          onBlur={() => handleBlur('message')}
                          placeholder="Tell us about your project, room size, or the look you're after…"
                          className={`field-input resize-none pl-11 ${
                            errors.message ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
                          }`}
                          aria-invalid={!!errors.message}
                        />
                      </div>
                      {errors.message && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <button type="submit" className="btn-primary w-full sm:w-auto">
                      <Send className="h-4 w-4" />
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </Reveal>

          {/* Store hours & location */}
          <Reveal delay={120} className="lg:col-span-2">
            <div id="location" className="space-y-6">
              <div className="rounded-2xl border border-ink-200/70 bg-white p-8 shadow-soft">
                <h3 className="flex items-center gap-2 font-display text-2xl font-700 text-walnut-900">
                  <Clock className="h-6 w-6 text-brass-500" />
                  Store Hours
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
                  <li className="flex items-center justify-between py-3">
                    <span className="text-sm text-ink-600">Public Holidays</span>
                    <span className="text-sm font-medium text-brass-700">By appointment</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-ink-200/70 bg-white p-8 shadow-soft">
                <h3 className="flex items-center gap-2 font-display text-2xl font-700 text-walnut-900">
                  <MapPin className="h-6 w-6 text-brass-500" />
                  How to Find Us
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-600">
                  {info?.location || 'kafr kanna, Isreal'}. We're centrally located and easily accessible.
                </p>
                <div className="mt-5 flex items-start gap-3 rounded-xl bg-sand-100/60 p-4">
                  <Car className="mt-0.5 h-5 w-5 shrink-0 text-brass-600" />
                  <p className="text-sm text-ink-700">
                    <span className="font-semibold text-walnut-900">Free parking available</span> on
                    site for all showroom visitors.
                  </p>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="overflow-hidden rounded-2xl border border-ink-200/70 shadow-soft">
                <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-sand-200 to-sand-300">
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(122,90,46,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(122,90,46,0.12) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-walnut-800 text-sand-50 shadow-card">
                      <MapPin className="h-6 w-6" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-walnut-900">Prket Alandlos Showroom</p>
                    <p className="mt-1 text-xs text-ink-500">{info?.location || 'kafr kanna, Isreal'}</p>
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
