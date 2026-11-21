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

  it('defines complete semantic status and SVG tokens for all 4 dynamic themes', () => {
    const requiredTokens = [
      '--theme-canvas',
      '--theme-surface',
      '--theme-accent',
      '--theme-on-accent',
      '--sem-comparing-bg',
      '--sem-swapping-bg',
      '--sem-sorted-bg',
      '--sem-active-bg',
      '--sem-pivot-bg',
      '--svg-node-bg',
      '--svg-node-text',
      '--svg-edge-default',
    ];
    for (const theme of ['midnight', 'daylight', 'visualgo', 'dracula']) {
      const start = css.indexOf(`html[data-theme="${theme}"] {`);
      expect(start, `missing token declaration for ${theme}`).toBeGreaterThanOrEqual(0);
      const end = css.indexOf('}', start);
      const block = css.slice(start, end);
      for (const token of requiredTokens) {
        expect(block, `${theme} missing ${token}`).toContain(token);
      }
    }
  });

  it('covers high-frequency module dark surfaces across Daylight, VisuAlgo, and Dracula', () => {
    const darkClasses = [
      'bg-slate-900/70',
      'bg-slate-800/40',
      'bg-slate-950/60',
      'bg-slate-700',
      'from-[#0E1525]',
    ];
    for (const theme of ['daylight', 'visualgo', 'dracula']) {
      const block = themeBlock(theme);
      for (const cls of darkClasses) {
        const escaped = cls.replace(/[\[\]#\/]/g, (c) => `\\${c}`);
        expect(block.includes(escaped), `${theme} missing override for ${cls}`).toBe(true);
      }
    }

    // Daylight must also convert dark semantic -950 tints and protect solid badges
    const daylight = themeBlock('daylight');
    for (const semTint of ['bg-emerald-950/60', 'bg-cyan-950/60', 'bg-amber-950/60', 'bg-rose-950/80', 'bg-violet-950/40']) {
      const escaped = semTint.replace(/[\[\]#\/]/g, (c) => `\\${c}`);
      expect(daylight.includes(escaped), `daylight missing semantic tint override for ${semTint}`).toBe(true);
    }
    expect(daylight).toContain(':not(.theme-solid-badge)');
  });
});
