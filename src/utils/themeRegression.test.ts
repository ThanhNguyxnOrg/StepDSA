import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
const callStackPanel = readFileSync(
  resolve(process.cwd(), 'src/components/debugger/CallStackPanel.tsx'),
  'utf8'
);

function themeBlock(theme: string): string {
  const start = css.indexOf(`html[data-theme="${theme}"] :not(.algo-card-thumbnail)`);
  expect(start, `missing ${theme} theme block`).toBeGreaterThanOrEqual(0);
  const nextTheme = css.indexOf('/* ═', start + 10);
  return css.slice(start, nextTheme === -1 ? undefined : nextTheme);
}

function escapeTailwindClass(className: string): string {
  return className.replace(/[\[\]#]/g, (character) => `\\${character}`);
}

function isDarkSurface(className: string): boolean {
  const match = className.match(/bg-\[#([0-9A-Fa-f]{6})\]/);
  if (!match) return false;
  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 80;
}

describe('theme CSS regressions', () => {
  it('CallStackPanel dark surfaces are overridden by every non-midnight theme', () => {
    const usedBackgrounds = Array.from(
      new Set(
        Array.from(callStackPanel.matchAll(/bg-\[#[0-9A-Fa-f]{6}\]/g)).map((match) => match[0])
      )
    ).filter(isDarkSurface);
    expect(usedBackgrounds).toContain('bg-[#0E1420]');

    const expectedSurfaceColors: Record<string, string> = {
      daylight: '#FFFFFF',
      visualgo: '#0B1F3A',
      dracula: '#1C1829',
    };

    for (const [theme, surfaceColor] of Object.entries(expectedSurfaceColors)) {
      const block = themeBlock(theme);
      for (const className of usedBackgrounds) {
        expect(
          block.includes(escapeTailwindClass(className)),
          `${theme} does not override ${className} used by CallStackPanel`
        ).toBe(true);
      }
      expect(block).toContain(surfaceColor);
    }
  });

  it('Daylight Paper uses a light dock surface instead of the midnight black dock', () => {
    const daylight = themeBlock('daylight');
    expect(daylight).toContain(escapeTailwindClass('bg-[#0E1420]'));
    expect(daylight).toContain('#FFFFFF');
  });
});
