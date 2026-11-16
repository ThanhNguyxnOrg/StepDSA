import { describe, it, expect } from 'vitest';
import {
  buildPermalink,
  clampFrameIndex,
  decodePermalinkInput,
  encodePermalinkInput,
  inputsEqual,
  parsePermalinkInput,
  parsePermalinkStep,
} from './permalink';

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

    it('carries a custom input payload and drops it when absent', () => {
      const withInput = buildPermalink({
        moduleId: 'bubble-sort',
        step: 3,
        input: 'N4IgzgrgtghgLgUwB4gFwFYDmBLAJgSwDsA',
        base: 'https://example.com/?module=old&input=stale',
      });
      expect(withInput).toContain('input=N4IgzgrgtghgLgUwB4gFwFYDmBLAJgSwDsA');
      expect(withInput).toContain('step=3');

      const withoutInput = buildPermalink({
        moduleId: 'bubble-sort',
        step: 3,
        input: null,
        base: 'https://example.com/?input=stale',
      });
      expect(withoutInput).toBe('https://example.com/?module=bubble-sort&step=3');
    });
  });

  describe('custom input encoding', () => {
    it('round-trips arrays, objects and strings', () => {
      const values = [9, 4, 7, 1, 12];
      expect(decodePermalinkInput(encodePermalinkInput(values))).toEqual(values);

      const graph = { nodes: ['A', 'B', 'C'], edges: [['A', 'B']], start: 'A' };
      expect(decodePermalinkInput(encodePermalinkInput(graph))).toEqual(graph);

      expect(decodePermalinkInput(encodePermalinkInput('stepdsa'))).toBe('stepdsa');
    });

    it('returns null for empty or malformed payloads', () => {
      expect(encodePermalinkInput(undefined)).toBeNull();
      expect(decodePermalinkInput(null)).toBeNull();
      expect(decodePermalinkInput('')).toBeNull();
      expect(decodePermalinkInput('not-a-real-payload')).toBeNull();
    });

    it('reads the raw input query param', () => {
      expect(parsePermalinkInput('?module=bubble-sort&input=abc123')).toBe('abc123');
      expect(parsePermalinkInput('?module=bubble-sort')).toBeNull();
      expect(parsePermalinkInput('?input=')).toBeNull();
    });

    it('compares inputs regardless of object key order', () => {
      expect(inputsEqual({ a: 1, b: [2, 3] }, { b: [2, 3], a: 1 })).toBe(true);
      expect(inputsEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(inputsEqual([1, 2], [2, 1])).toBe(false);
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
