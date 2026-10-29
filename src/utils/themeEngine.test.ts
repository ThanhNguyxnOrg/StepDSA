import { describe, it, expect } from 'vitest';
import {
  resolveThemeConfig,
  getNextThemeId,
  resolveCategoryThemeColor,
  getCardThemePalette,
  THEME_ORDER,
} from './themeEngine';

describe('themeEngine', () => {
  it('resolves valid theme configs and falls back to midnight', () => {
    expect(resolveThemeConfig('daylight').id).toBe('daylight');
    expect(resolveThemeConfig('daylight').isLight).toBe(true);
    expect(resolveThemeConfig('visualgo').id).toBe('visualgo');
    expect(resolveThemeConfig('dracula').id).toBe('dracula');
    expect(resolveThemeConfig('unknown-theme').id).toBe('midnight');
    expect(resolveThemeConfig(null).id).toBe('midnight');
  });

  it('cycles through all 4 studio themes deterministically', () => {
    expect(THEME_ORDER.length).toBe(4);
    expect(getNextThemeId('midnight')).toBe('daylight');
    expect(getNextThemeId('daylight')).toBe('visualgo');
    expect(getNextThemeId('visualgo')).toBe('dracula');
    expect(getNextThemeId('dracula')).toBe('midnight');
  });

  it('maps each algorithm category to its signature VisuAlgo palette when no explicit color is provided', () => {
    expect(resolveCategoryThemeColor('sorting')).toBe('emerald');
    expect(resolveCategoryThemeColor('searching')).toBe('sky');
    expect(resolveCategoryThemeColor('arrays-pointers')).toBe('cyan');
    expect(resolveCategoryThemeColor('stack-queue')).toBe('indigo');
    expect(resolveCategoryThemeColor('linked-lists')).toBe('blue');
    expect(resolveCategoryThemeColor('trees-bst')).toBe('indigo');
    expect(resolveCategoryThemeColor('graphs')).toBe('teal');
    expect(resolveCategoryThemeColor('dynamic-programming')).toBe('purple');
    expect(resolveCategoryThemeColor('math')).toBe('amber');
  });

  it('returns complete Tailwind class tokens for card theme palettes', () => {
    const dpPalette = getCardThemePalette('dynamic-programming');
    expect(dpPalette.themeColor).toBe('purple');
    expect(dpPalette.borderHover).toContain('purple');
    expect(dpPalette.buttonHoverBg).toContain('purple');

    const overridePalette = getCardThemePalette('graphs', 'rose');
    expect(overridePalette.themeColor).toBe('rose');
    expect(overridePalette.titleHover).toContain('rose');
  });
});
