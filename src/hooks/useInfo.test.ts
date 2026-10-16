import { describe, expect, it } from 'vitest';
import { parseOpeningTime } from './useInfo';

// The admin enters opening hours as one free-text line per language; the site shows the days
// and the hours on separate lines.
describe('parseOpeningTime', () => {
  it('splits English hours with AM/PM', () => {
    expect(parseOpeningTime('Sunday — Thursday 9:00 AM — 7:00 PM')).toEqual({
      days: 'Sunday — Thursday',
      time: '9:00 AM — 7:00 PM',
    });
  });

  it('splits Arabic hours with Arabic meridiem markers', () => {
    expect(parseOpeningTime('السبت — الخميس 9:00 صباحًا — 7:00 مساءً')).toEqual({
      days: 'السبت — الخميس',
      time: '9:00 صباحًا — 7:00 مساءً',
    });
  });

  it('splits Hebrew hours written in 24-hour format', () => {
    expect(parseOpeningTime('ראשון — חמישי 10:00 — 18:00')).toEqual({
      days: 'ראשון — חמישי',
      time: '10:00 — 18:00',
    });
  });

  it('keeps a single-digit hour range', () => {
    expect(parseOpeningTime('Daily 8:30am — 5:00pm')).toEqual({
      days: 'Daily',
      time: '8:30am — 5:00pm',
    });
  });

  it('shows free text as-is when it has no time range', () => {
    expect(parseOpeningTime('Closed for holidays')).toEqual({
      days: 'Closed for holidays',
      time: '',
    });
  });
});
