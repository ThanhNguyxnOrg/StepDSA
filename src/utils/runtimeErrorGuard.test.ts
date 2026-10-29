import { describe, it, expect } from 'vitest';
import {
  ensureWritableFetchDescriptor,
  isBenignExtensionOrFetchError,
} from './runtimeErrorGuard';

describe('runtimeErrorGuard', () => {
  it('converts a getter-only fetch descriptor into a getter+setter descriptor', () => {
    const fakeFetch = () => Promise.resolve('original');
    const getterOnly: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      get() {
        return fakeFetch;
      },
    };

    const target: Record<string, unknown> = {};
    const patched = ensureWritableFetchDescriptor(getterOnly);
    expect(patched).toBeTruthy();
    Object.defineProperty(target, 'fetch', patched!);

    expect(target.fetch).toBe(fakeFetch);

    // Simulating a Chrome extension assigning `window.fetch = interceptor`
    const interceptor = () => Promise.resolve('intercepted');
    expect(() => {
      target.fetch = interceptor;
    }).not.toThrow();
    expect(target.fetch).toBe(interceptor);
  });

  it('converts non-writable value descriptor into writable descriptor', () => {
    const fakeFetch = () => Promise.resolve('original');
    const nonWritable: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      writable: false,
      value: fakeFetch,
    };

    const target: Record<string, unknown> = {};
    const patched = ensureWritableFetchDescriptor(nonWritable);
    expect(patched).toBeTruthy();
    Object.defineProperty(target, 'fetch', patched!);

    const interceptor = () => Promise.resolve('intercepted');
    expect(() => {
      target.fetch = interceptor;
    }).not.toThrow();
    expect(target.fetch).toBe(interceptor);
  });

  it('identifies chrome-extension and fetch getter errors accurately', () => {
    expect(
      isBenignExtensionOrFetchError(
        'TypeError: Cannot set property fetch of #<Window> which has only a getter',
        'chrome-extension://eppiocemhmnlbhjplcgkofciiegomcon/libs/requests.js',
        ''
      )
    ).toBe(true);
    expect(
      isBenignExtensionOrFetchError(
        'ReferenceError: foo is not defined',
        'http://localhost:3000/src/App.tsx',
        ''
      )
    ).toBe(false);
  });
});
