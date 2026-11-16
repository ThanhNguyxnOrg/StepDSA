/**
 * Permalink helpers — shareable deep links to a module + step.
 *
 * Kế thừa từ khảo sát (docs/research/PRODUCT_TEARDOWN.md):
 * - Python Tutor: "Generate permanent link" (code nằm trong URL).
 * - VisuAlgo: nút "Share" trên mọi module.
 * - algorithm-visualizer: `?visualizationId=` để replay đúng trạng thái.
 *
 * StepDSA dùng query `?module=<id>&step=<n>` — `step` là chỉ số frame 0-based,
 * khớp tham số `?step=` đã hỗ trợ khi tải trang (App.tsx).
 */

const FALLBACK_ORIGIN = 'https://stepdsa.example';

export interface PermalinkOptions {
  /** Module id (ví dụ `bubble-sort`). */
  moduleId: string;
  /** Chỉ số frame 0-based; 0 hoặc giá trị không hợp lệ sẽ bỏ tham số để URL gọn. */
  step?: number | null;
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

/** Build a shareable permalink. The `#trace=` hash is always dropped (trace dài, không phù hợp URL). */
export function buildPermalink({ moduleId, step, base }: PermalinkOptions): string {
  const url = resolveBase(base);
  url.hash = '';
  url.searchParams.set('module', moduleId);
  if (typeof step === 'number' && Number.isFinite(step) && step > 0) {
    url.searchParams.set('step', String(Math.floor(step)));
  } else {
    url.searchParams.delete('step');
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
