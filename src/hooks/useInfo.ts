import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export interface Stat {
  value: string;
  label: string;
}

export interface StoreInfo {
  lang?: string;
  showPrice: boolean;
  storeOpeningTime: string;
  email: string;
  phone: string;
  whatsappLink: string;
  location: string;
  description?: string;
  stats?: Stat[];
  showroomEyebrow?: string;
  showroomTitle?: string;
  showroomDescription?: string;
  contactEyebrow?: string;
  contactTitle?: string;
  contactDescription?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';

// AM/PM markers across the supported languages (Arabic/Hebrew meridiem terms included)
const MERIDIEM = "(?:AM|PM|am|pm|صباحًا|مساءً|לפנה״צ|אחה״צ)";

export function parseOpeningTime(timeStr: string) {
  // Meridiem markers are optional so 24-hour formats (e.g. Hebrew "10:00 — 18:00") also parse
  const regex = new RegExp(
    `^(.*?)\\s+(\\d{1,2}:\\d{2}\\s*${MERIDIEM}?\\s*—\\s*\\d{1,2}:\\d{2}\\s*${MERIDIEM}?)$`,
    'i',
  );
  const match = timeStr.match(regex);
  if (match) {
    return {
      days: match[1].trim(),
      time: match[2].trim(),
    };
  }
  return {
    days: timeStr,
    time: '',
  };
}

export function useInfo() {
  const { lang } = useLanguage();
  const [info, setInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/info?lang=${lang}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch store info');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          setInfo(data.data);
        } else {
          throw new Error(data.error || 'Invalid API response');
        }
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lang]);

  return { info, loading, error };
}
