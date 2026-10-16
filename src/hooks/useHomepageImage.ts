import { useEffect, useState } from 'react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';
const IMAGES_URL = (import.meta.env.VITE_IMAGES_URL || '').replace(/\/+$/, '');
// Straight from the R2 images domain when set, else streamed through the API
const HOMEPAGE_IMAGE_URL = IMAGES_URL
  ? `${IMAGES_URL}/homePage/homepageImage`
  : `${SERVER_URL}/api/homepage-image`;

// How often an open, visible page re-checks for a new hero image
export const HOMEPAGE_IMAGE_RECHECK_MS = 5 * 60 * 1000;

/**
 * URL of the hero image, versioned with the backend's current image version (`?v=<etag>`).
 * The image lives at a fixed key, so without the version a browser or the CDN keeps serving
 * its cached copy after the admin uploads a new one. Returns null until the version is known
 * (so the old image is never shown first), and the unversioned URL if the lookup fails.
 *
 * Visitors who keep the page open get a new upload too: the version is re-checked whenever
 * the tab becomes visible again and periodically while it stays visible. A new image is
 * downloaded before it replaces the old one, so the hero never goes blank.
 */
export function useHomepageImage() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let current: string | null = null;

    const show = (next: string) => {
      if (cancelled || next === current) return;
      const first = current === null;
      current = next;
      if (first) return setSrc(next);
      const img = new Image();
      img.onload = () => {
        if (!cancelled && current === next) setSrc(next);
      };
      img.src = next;
    };

    const check = () =>
      fetch(`${SERVER_URL}/api/homepage-image?info=true`, { cache: 'no-cache' })
        .then((res) => (res.ok ? res.json() : null))
        .then((body) => {
          const version: string | undefined = body?.data?.version;
          if (version) show(`${HOMEPAGE_IMAGE_URL}?v=${encodeURIComponent(version)}`);
          // Without a version, keep what is shown; only the first load needs a fallback
          else if (current === null) show(HOMEPAGE_IMAGE_URL);
        })
        .catch(() => {
          if (current === null) show(HOMEPAGE_IMAGE_URL);
        });

    const onVisibility = () => {
      if (document.visibilityState === 'visible') check();
    };

    check();
    document.addEventListener('visibilitychange', onVisibility);
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') check();
    }, HOMEPAGE_IMAGE_RECHECK_MS);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(timer);
    };
  }, []);

  return src;
}
