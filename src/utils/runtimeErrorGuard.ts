/**
 * Transforms a property descriptor for `window.fetch` so that if an environment
 * shim defines `fetch` with only a getter (or `writable: false`), third-party
 * browser extensions (such as request interceptors) that assign `window.fetch = ...`
 * do not crash the page with:
 * `TypeError: Cannot set property fetch of #<Window> which has only a getter`
 */
export function ensureWritableFetchDescriptor(
  desc: PropertyDescriptor | undefined
): PropertyDescriptor | undefined {
  if (!desc || typeof desc !== 'object') return desc;

  if ('get' in desc && typeof desc.get === 'function' && typeof desc.set !== 'function') {
    const getter = desc.get;
    let overrideFn: typeof fetch | null = null;
    return {
      configurable: true,
      enumerable: desc.enumerable !== false,
      get(this: unknown) {
        return overrideFn ?? getter.call(this);
      },
      set(fn: unknown) {
        if (typeof fn === 'function') {
          overrideFn = fn as typeof fetch;
        }
      },
    };
  }

  if ('value' in desc && desc.writable === false) {
    return {
      configurable: true,
      enumerable: desc.enumerable !== false,
      writable: true,
      value: desc.value,
    };
  }

  return desc;
}

/**
 * Identifies benign errors thrown by injected browser extensions (e.g.
 * `chrome-extension://...`) or read-only `window.fetch` assignment attempts.
 */
export function isBenignExtensionOrFetchError(
  message?: unknown,
  filename?: unknown,
  stack?: unknown
): boolean {
  const combined = `${String(message ?? '')} ${String(filename ?? '')} ${String(stack ?? '')}`;
  return (
    combined.includes('Cannot set property fetch') ||
    combined.includes('chrome-extension://') ||
    combined.includes('moz-extension://') ||
    combined.includes('safari-extension://')
  );
}

/**
 * Installs runtime guards on `window.fetch` and global error events in browser environments.
 */
export function installRuntimeErrorGuard(targetWindow: Window & typeof globalThis = window): void {
  if (typeof targetWindow === 'undefined') return;

  try {
    const existing = Object.getOwnPropertyDescriptor(targetWindow, 'fetch');
    if (existing && existing.configurable !== false) {
      const patched = ensureWritableFetchDescriptor(existing);
      if (patched) {
        Object.defineProperty(targetWindow, 'fetch', patched);
      }
    }
  } catch {
    // Ignore if descriptor is non-configurable
  }

  targetWindow.addEventListener(
    'error',
    (event: ErrorEvent) => {
      const err = event?.error as Error | undefined;
      if (isBenignExtensionOrFetchError(event?.message, event?.filename, err?.stack)) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true
  );

  targetWindow.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      const reason = event?.reason as { message?: string; stack?: string } | undefined;
      if (
        isBenignExtensionOrFetchError(
          reason?.message ?? String(reason ?? ''),
          '',
          reason?.stack
        )
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true
  );
}
