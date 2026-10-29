import { useState, useEffect, useCallback } from 'react';

export type AppThemeId = 'midnight' | 'daylight' | 'visualgo' | 'dracula';

export interface AppThemeConfig {
  id: AppThemeId;
  name: string;
  shortLabel: string;
  inspiration: string;
  isLight: boolean;
  swatchBg: string;
  swatchAccent: string;
}

export const APP_THEMES: Record<AppThemeId, AppThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Studio',
    shortLabel: 'Midnight',
    inspiration: 'StepDSA Default · Deep Slate & Emerald',
    isLight: false,
    swatchBg: '#0B0F19',
    swatchAccent: '#10B981',
  },
  daylight: {
    id: 'daylight',
    name: 'Daylight Paper',
    shortLabel: 'Daylight',
    inspiration: 'Academic Paper & Textbook Light Mode',
    isLight: true,
    swatchBg: '#F8FAFC',
    swatchAccent: '#059669',
  },
  visualgo: {
    id: 'visualgo',
    name: 'VisuAlgo Ocean',
    shortLabel: 'VisuAlgo',
    inspiration: 'NUS VisuAlgo · Deep Ocean & Cyan-Amber',
    isLight: false,
    swatchBg: '#071426',
    swatchAccent: '#06B6D4',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Cyber',
    shortLabel: 'Dracula',
    inspiration: 'NeetCode & Dracula IDE · Obsidian & Violet',
    isLight: false,
    swatchBg: '#13111C',
    swatchAccent: '#A855F7',
  },
};

export const THEME_ORDER: AppThemeId[] = ['midnight', 'daylight', 'visualgo', 'dracula'];

const STORAGE_KEY = 'stepdsa-app-theme';

export function resolveThemeConfig(themeId?: string | null): AppThemeConfig {
  if (themeId && themeId in APP_THEMES) {
    return APP_THEMES[themeId as AppThemeId];
  }
  return APP_THEMES.midnight;
}

export function getNextThemeId(current: AppThemeId): AppThemeId {
  const idx = THEME_ORDER.indexOf(current);
  if (idx === -1) return 'midnight';
  return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
}

export interface CategoryThemePalette {
  themeColor: string;
  borderHover: string;
  titleHover: string;
  badgeText: string;
  badgeBg: string;
  badgeBorder: string;
  buttonHoverBg: string;
  buttonHoverText: string;
  glowShadow: string;
  accentHex: string;
}

const CATEGORY_DEFAULT_COLOR: Record<string, string> = {
  sorting: 'emerald',
  searching: 'sky',
  'arrays-pointers': 'cyan',
  'stack-queue': 'indigo',
  'linked-lists': 'blue',
  'trees-bst': 'indigo',
  graphs: 'teal',
  'dynamic-programming': 'purple',
  math: 'amber',
};

const PALETTES: Record<string, CategoryThemePalette> = {
  emerald: {
    themeColor: 'emerald',
    borderHover: 'hover:border-emerald-500/60',
    titleHover: 'group-hover:text-emerald-400',
    badgeText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    buttonHoverBg: 'hover:bg-emerald-500 group-hover:bg-emerald-500',
    buttonHoverText: 'hover:text-slate-950 group-hover:text-slate-950',
    glowShadow: 'hover:shadow-emerald-500/10',
    accentHex: '#10B981',
  },
  sky: {
    themeColor: 'sky',
    borderHover: 'hover:border-sky-500/60',
    titleHover: 'group-hover:text-sky-400',
    badgeText: 'text-sky-400',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/30',
    buttonHoverBg: 'hover:bg-sky-400 group-hover:bg-sky-400',
    buttonHoverText: 'hover:text-slate-950 group-hover:text-slate-950',
    glowShadow: 'hover:shadow-sky-500/10',
    accentHex: '#38BDF8',
  },
  cyan: {
    themeColor: 'cyan',
    borderHover: 'hover:border-cyan-500/60',
    titleHover: 'group-hover:text-cyan-400',
    badgeText: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
    buttonHoverBg: 'hover:bg-cyan-400 group-hover:bg-cyan-400',
    buttonHoverText: 'hover:text-slate-950 group-hover:text-slate-950',
    glowShadow: 'hover:shadow-cyan-500/10',
    accentHex: '#06B6D4',
  },
  blue: {
    themeColor: 'blue',
    borderHover: 'hover:border-blue-500/60',
    titleHover: 'group-hover:text-blue-400',
    badgeText: 'text-blue-400',
    badgeBg: 'bg-blue-500/10',
    badgeBorder: 'border-blue-500/30',
    buttonHoverBg: 'hover:bg-blue-500 group-hover:bg-blue-500',
    buttonHoverText: 'hover:text-white group-hover:text-white',
    glowShadow: 'hover:shadow-blue-500/10',
    accentHex: '#3B82F6',
  },
  indigo: {
    themeColor: 'indigo',
    borderHover: 'hover:border-indigo-500/60',
    titleHover: 'group-hover:text-indigo-400',
    badgeText: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10',
    badgeBorder: 'border-indigo-500/30',
    buttonHoverBg: 'hover:bg-indigo-500 group-hover:bg-indigo-500',
    buttonHoverText: 'hover:text-white group-hover:text-white',
    glowShadow: 'hover:shadow-indigo-500/10',
    accentHex: '#6366F1',
  },
  purple: {
    themeColor: 'purple',
    borderHover: 'hover:border-purple-500/60',
    titleHover: 'group-hover:text-purple-400',
    badgeText: 'text-purple-400',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    buttonHoverBg: 'hover:bg-purple-500 group-hover:bg-purple-500',
    buttonHoverText: 'hover:text-white group-hover:text-white',
    glowShadow: 'hover:shadow-purple-500/10',
    accentHex: '#A855F7',
  },
  teal: {
    themeColor: 'teal',
    borderHover: 'hover:border-teal-500/60',
    titleHover: 'group-hover:text-teal-400',
    badgeText: 'text-teal-400',
    badgeBg: 'bg-teal-500/10',
    badgeBorder: 'border-teal-500/30',
    buttonHoverBg: 'hover:bg-teal-400 group-hover:bg-teal-400',
    buttonHoverText: 'hover:text-slate-950 group-hover:text-slate-950',
    glowShadow: 'hover:shadow-teal-500/10',
    accentHex: '#14B8A6',
  },
  amber: {
    themeColor: 'amber',
    borderHover: 'hover:border-amber-500/60',
    titleHover: 'group-hover:text-amber-400',
    badgeText: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    buttonHoverBg: 'hover:bg-amber-400 group-hover:bg-amber-400',
    buttonHoverText: 'hover:text-slate-950 group-hover:text-slate-950',
    glowShadow: 'hover:shadow-amber-500/10',
    accentHex: '#F59E0B',
  },
  rose: {
    themeColor: 'rose',
    borderHover: 'hover:border-rose-500/60',
    titleHover: 'group-hover:text-rose-400',
    badgeText: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
    buttonHoverBg: 'hover:bg-rose-500 group-hover:bg-rose-500',
    buttonHoverText: 'hover:text-white group-hover:text-white',
    glowShadow: 'hover:shadow-rose-500/10',
    accentHex: '#F43F5E',
  },
};

export function resolveCategoryThemeColor(category: string, explicitColor?: string): string {
  if (explicitColor && PALETTES[explicitColor]) {
    return explicitColor;
  }
  return CATEGORY_DEFAULT_COLOR[category] || 'emerald';
}

export function getCardThemePalette(category: string, explicitColor?: string): CategoryThemePalette {
  const key = resolveCategoryThemeColor(category, explicitColor);
  return PALETTES[key] || PALETTES.emerald;
}

export function useAppTheme() {
  const [themeId, setThemeIdState] = useState<AppThemeId>(() => {
    if (typeof window === 'undefined') return 'midnight';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return resolveThemeConfig(saved).id;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', themeId);
    try {
      window.localStorage.setItem(STORAGE_KEY, themeId);
    } catch {
      // ignore storage errors
    }
  }, [themeId]);

  const setTheme = useCallback((next: AppThemeId) => {
    setThemeIdState(resolveThemeConfig(next).id);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeIdState((prev) => getNextThemeId(prev));
  }, []);

  return {
    themeId,
    theme: APP_THEMES[themeId],
    allThemes: THEME_ORDER.map((id) => APP_THEMES[id]),
    setTheme,
    cycleTheme,
  };
}
