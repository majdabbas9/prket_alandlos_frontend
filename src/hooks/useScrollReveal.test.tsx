import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useScrollReveal } from './useScrollReveal';

// A controllable IntersectionObserver: the test decides when the element scrolls into view
// (src/test/setup.ts reports everything visible at once, which hides this behaviour).
let observers: FakeObserver[] = [];
class FakeObserver {
  targets = new Set<Element>();
  disconnected = false;
  constructor(private readonly callback: IntersectionObserverCallback) {
    observers.push(this);
  }
  observe(el: Element) {
    this.targets.add(el);
  }
  unobserve(el: Element) {
    this.targets.delete(el);
  }
  disconnect() {
    this.disconnected = true;
    this.targets.clear();
  }
  takeRecords() {
    return [];
  }
  fire(isIntersecting: boolean) {
    const entries = [...this.targets].map(
      (target) => ({ target, isIntersecting }) as IntersectionObserverEntry,
    );
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

function Section() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="section" className={visible ? 'is-visible' : ''}>
      content
    </div>
  );
}

describe('useScrollReveal', () => {
  beforeEach(() => {
    observers = [];
    vi.stubGlobal('IntersectionObserver', FakeObserver);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('reveals a section only once it scrolls into view, and keeps it revealed', () => {
    render(<Section />);
    const section = screen.getByTestId('section');
    const [observer] = observers;

    expect(section).not.toHaveClass('is-visible');
    act(() => observer.fire(false));
    expect(section).not.toHaveClass('is-visible');

    act(() => observer.fire(true));
    expect(section).toHaveClass('is-visible');
    // Stops watching: scrolling away again does not hide it
    expect(observer.targets.size).toBe(0);
  });

  it('stops observing when the section is removed', () => {
    const { unmount } = render(<Section />);
    unmount();
    expect(observers[0].disconnected).toBe(true);
  });
});
