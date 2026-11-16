import { describe, it, expect } from 'vitest';
import { buildPermalink, parsePermalinkStep, clampFrameIndex } from './permalink';

describe('permalink helpers (share-link deep links)', () => {
  describe('buildPermalink', () => {
    it('sets module + step and drops the #trace hash, preserving other query params', () => {
      const url = buildPermalink({
        moduleId: 'bubble-sort',
        step: 4,
        base: 'https://example.com/app?autostart=1#trace=abc',
      });
      expect(url).toBe('https://example.com/app?autostart=1&module=bubble-sort&step=4');
    });

    it('omits step=0 so links to the start stay canonical', () => {
      const url = buildPermalink({
        moduleId: 'bubble-sort',
        step: 0,
        base: 'https://example.com/app?module=old&step=9',
      });
      expect(url).toBe('https://example.com/app?module=bubble-sort');
    });

    it('ignores invalid step values', () => {
      const url = buildPermalink({
        moduleId: 'quick-sort',
        step: Number.NaN,
        base: 'https://example.com/',
      });
      expect(url).toBe('https://example.com/?module=quick-sort');
    });
  });

  describe('parsePermalinkStep', () => {
    it('parses a valid 0-based step', () => {
      expect(parsePermalinkStep('?module=bubble-sort&step=12')).toBe(12);
      expect(parsePermalinkStep('?step=0')).toBe(0);
    });

    it('returns null for missing, empty or invalid values', () => {
      expect(parsePermalinkStep('?module=bubble-sort')).toBeNull();
      expect(parsePermalinkStep('?step=')).toBeNull();
      expect(parsePermalinkStep('?step=-3')).toBeNull();
      expect(parsePermalinkStep('?step=abc')).toBeNull();
      expect(parsePermalinkStep('?step=4x')).toBeNull();
    });
  });

  describe('clampFrameIndex', () => {
    it('clamps into timeline bounds', () => {
      expect(clampFrameIndex(4, 10)).toBe(4);
      expect(clampFrameIndex(99, 10)).toBe(9);
      expect(clampFrameIndex(-5, 10)).toBe(0);
      expect(clampFrameIndex(3, 0)).toBe(0);
    });
  });
});
