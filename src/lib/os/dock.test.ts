import { describe, it, expect } from 'vitest';
import { magnify } from './dock';

describe('magnify', () => {
  it('returns 1.5 at distance 0 (max magnification)', () => {
    expect(magnify(0)).toBe(1.5);
  });

  it('returns 1 at distance >= radius (96px)', () => {
    expect(magnify(96)).toBe(1);
  });

  it('returns 1 at distance beyond radius (200px)', () => {
    expect(magnify(200)).toBe(1);
  });

  it('is monotonically decreasing from 0 to 96', () => {
    let prev = magnify(0);
    for (let d = 1; d <= 96; d++) {
      const curr = magnify(d);
      expect(curr).toBeLessThanOrEqual(prev);
      prev = curr;
    }
  });

  it('respects custom max option', () => {
    expect(magnify(0, { max: 2.0 })).toBe(2.0);
  });

  it('respects custom radius option', () => {
    expect(magnify(48, { radius: 48 })).toBe(1);
  });

  it('returns value between 1 and max for intermediate distances', () => {
    const val = magnify(48);
    expect(val).toBeGreaterThan(1);
    expect(val).toBeLessThan(1.5);
  });
});
