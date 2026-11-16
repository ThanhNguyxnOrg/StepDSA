/**
 * Permalink helpers — shareable deep links to a module + step + custom input.
 *
 * Kế thừa từ khảo sát (docs/research/PRODUCT_TEARDOWN.md, ROUND3_CLASSICS.md):
 * - Python Tutor: "Generate permanent link" (code nằm trong URL).
 * - VisuAlgo: nút "Share" trên mọi module.
 * - algorithm-visualizer: `?visualizationId=` để replay đúng trạng thái.
 * - Graph Online: "Copy graph link" (giữ nguyên đồ thị người dùng đã vẽ).
 *
 * StepDSA dùng query `?module=<id>&step=<n>&input=<lz-string>`:
 * - `step` là chỉ số frame 0-based, khớp tham số `?step=` đã hỗ trợ khi tải trang.
 * - `input` là JSON của input đã nén bằng LZString, để mở lại đúng mảng/đồ thị
 *   người học đã nhập thay vì rơi về preset mặc định.
 */

import LZString from 'lz-string';

const FALLBACK_ORIGIN = 'https://stepdsa.example';

export interface PermalinkOptions {
  /** Module id (ví dụ `bubble-sort`). */
  moduleId: string;
  /** Chỉ số frame 0-based; 0 hoặc giá trị không hợp lệ sẽ bỏ tham số để URL gọn. */
  step?: number | null;
  /** Input đã encode bằng `encodePermalinkInput`; null/rỗng sẽ bỏ tham số. */
  input?: string | null;
  /** URL nền (giữ các query khác như `autostart=1`); mặc định lấy URL hiện tại. */
  base?: string | URL;
}

function resolveBase(base?: string | URL): URL {
  if (base instanceof URL) return new URL(base.toString());
  if (typeof base === 'string') {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : FALLBACK_ORIGIN;
    return new URL(base, origin);
  }
  if (typeof window !== 'undefined' && window.location?.href) {
    return new URL(window.location.href);
  }
  return new URL(`${FALLBACK_ORIGIN}/`);
}

/**
 * Encode a module input into a URL-safe payload.
 * Returns null when the value cannot be serialised (functions, cycles, `undefined`).
 */
export function encodePermalinkInput(data: unknown): string | null {
  try {
    const json = JSON.stringify(data);
    if (!json || json === 'null' || json === 'undefined') return null;
    const encoded = LZString.compressToEncodedURIComponent(json);
    return encoded || null;
  } catch {
    return null;
  }
}

/** Decode an `input` payload; returns null when the payload is missing or malformed. */
export function decodePermalinkInput(raw: string | null | undefined): unknown | null {
  if (!raw || raw.trim() === '') return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(raw);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Read the raw `input` query param; returns null when missing/blank. */
export function parsePermalinkInput(search: string): string | null {
  const raw = new URLSearchParams(search).get('input');
  return raw && raw.trim() !== '' ? raw : null;
}

/** Stable JSON for comparing inputs regardless of object key order. */
export function stableStringify(value: unknown): string {
  const normalize = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(normalize);
    if (node && typeof node === 'object') {
      const source = node as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(source).sort()) out[key] = normalize(source[key]);
      return out;
    }
    return node;
  };
  try {
    return JSON.stringify(normalize(value));
  } catch {
    return '';
  }
}

/** True when two inputs describe the same data (key order insensitive). */
export function inputsEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

/**
 * Build a shareable permalink. The `#trace=` hash is always dropped (trace dài,
 * không phù hợp URL). `input` is omitted when absent so default-preset links stay short.
 */
export function buildPermalink({ moduleId, step, input, base }: PermalinkOptions): string {
  const url = resolveBase(base);
  url.hash = '';
  url.searchParams.set('module', moduleId);
  if (typeof step === 'number' && Number.isFinite(step) && step > 0) {
    url.searchParams.set('step', String(Math.floor(step)));
  } else {
    url.searchParams.delete('step');
  }
  if (input && input.trim() !== '') {
    url.searchParams.set('input', input);
  } else {
    url.searchParams.delete('input');
  }
  return url.toString();
}

/** Parse the 0-based `step` query param; returns null when missing or invalid. */
export function parsePermalinkStep(search: string): number | null {
  const raw = new URLSearchParams(search).get('step');
  if (raw === null || raw.trim() === '') return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

/** Clamp a frame index into `[0, totalSteps - 1]`; safe for empty timelines. */
export function clampFrameIndex(index: number, totalSteps: number): number {
  if (!Number.isFinite(index) || totalSteps <= 0) return 0;
  return Math.min(Math.max(0, Math.floor(index)), totalSteps - 1);
}
