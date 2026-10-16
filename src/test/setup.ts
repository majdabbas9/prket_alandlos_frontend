import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no IntersectionObserver (used by useScrollReveal): report everything as visible
class ImmediateIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal('IntersectionObserver', ImmediateIntersectionObserver);

// jsdom doesn't implement scrolling
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.stubGlobal('IntersectionObserver', ImmediateIntersectionObserver);
});
