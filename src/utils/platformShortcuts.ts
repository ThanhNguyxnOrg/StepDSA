import { useState, useEffect, useMemo, useCallback } from 'react';

export type PlatformOS = 'mac' | 'windows' | 'linux';
export type PlatformOSMode = 'auto' | PlatformOS;

/**
 * Pure helper to detect operating system from navigator.platform / userAgent / vendor.
 * Prioritizes Apple/macOS, then Linux (excluding Android), then Windows.
 */
export function detectPlatformOS(
  platformStr = '',
  userAgentStr = '',
  vendorStr = ''
): PlatformOS {
  const combined = `${platformStr} ${userAgentStr} ${vendorStr}`.toLowerCase();
  if (
    combined.includes('mac') ||
    combined.includes('darwin') ||
    combined.includes('iphone') ||
    combined.includes('ipad') ||
    combined.includes('ipod') ||
    combined.includes('apple computer')
  ) {
    return 'mac';
  }
  if (
    (combined.includes('linux') ||
      combined.includes('x11') ||
      combined.includes('ubuntu') ||
      combined.includes('fedora') ||
      combined.includes('debian') ||
      combined.includes('cros')) &&
    !combined.includes('android')
  ) {
    return 'linux';
  }
  return 'windows';
}

/**
 * Inspects browser runtime signals (userAgentData, platform, userAgent, vendor)
 * to determine the host OS accurately.
 */
export function detectBrowserRuntimeOS(): PlatformOS {
  if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
    return 'windows';
  }
  const nav = window.navigator as any;
  const uaDataPlatform = nav?.userAgentData?.platform || '';
  const legacyPlatform = nav?.platform || '';
  const userAgent = nav?.userAgent || '';
  const vendor = nav?.vendor || '';

  return detectPlatformOS(`${uaDataPlatform} ${legacyPlatform}`, userAgent, vendor);
}

export interface ShortcutDefinition {
  id: string;
  category: 'navigation' | 'playback' | 'workbench';
  label: string;
  description: string;
  keys: string[];
  comboText: string;
}

export interface PlatformShortcutLabels {
  os: PlatformOS;
  detectedOS: PlatformOS;
  mode: PlatformOSMode;
  isAutoDetected: boolean;
  osName: string;
  osShortBadge: string;
  modKey: string;
  shiftKey: string;
  altKey: string;
  enterKey: string;
  escapeKey: string;
  quickSearch: string;
  QuickSearchKeys: string[];
  shortcutsHelp: string;
  playPause: string;
  nextStep: string;
  prevStep: string;
  nextAction: string;
  NextActionKeys: string[];
  prevAction: string;
  PrevActionKeys: string[];
  nextMilestone: string;
  NextMilestoneKeys: string[];
  prevMilestone: string;
  PrevMilestoneKeys: string[];
  jumpStart: string;
  JumpStartKeys: string[];
  jumpEnd: string;
  JumpEndKeys: string[];
  reset: string;
  autoPace: string;
  toggleMute: string;
  toggleDock: string;
  toggleTheory: string;
  toggleLegend: string;
  catalog: ShortcutDefinition[];
}

/**
 * Pure helper returning OS-appropriate shortcut key labels and structured keycap definitions.
 * Uses universally supported 'Cmd' / 'Opt' / 'Shift' labels for macOS so fonts without Apple technical
 * glyphs never render missing-glyph tofu boxes.
 */
export function getPlatformShortcutLabels(
  os: PlatformOS,
  mode: PlatformOSMode = 'auto',
  detectedOS: PlatformOS = os
): PlatformShortcutLabels {
  const isMac = os === 'mac';
  const modKey = isMac ? 'Cmd' : 'Ctrl';
  const shiftKey = 'Shift';
  const altKey = isMac ? 'Opt' : 'Alt';
  const enterKey = 'Enter';
  const escapeKey = 'Esc';
  const osName = os === 'mac' ? 'macOS' : os === 'linux' ? 'Linux' : 'Windows';
  const osShortBadge = mode === 'auto' ? `${osName} (Auto)` : `${osName}`;

  const QuickSearchKeys = isMac ? ['Cmd', 'K'] : ['Ctrl', 'K'];
  const NextActionKeys = ['Shift', '→'];
  const PrevActionKeys = ['Shift', '←'];
  const NextMilestoneKeys = isMac ? ['Opt', '→'] : ['Alt', '→'];
  const PrevMilestoneKeys = isMac ? ['Opt', '←'] : ['Alt', '←'];
  const JumpStartKeys = isMac ? ['Cmd', '←'] : ['Home'];
  const JumpEndKeys = isMac ? ['Cmd', '→'] : ['End'];

  const catalog: ShortcutDefinition[] = [
    {
      id: 'play-pause',
      category: 'playback',
      label: 'Play / Pause Execution',
      description: 'Start or pause deterministic timeline playback',
      keys: ['Space'],
      comboText: 'Space',
    },
    {
      id: 'step-forward',
      category: 'playback',
      label: 'Step Forward (1 CPU Line)',
      description: 'Advance exactly one atomic execution frame forward',
      keys: ['→'],
      comboText: '→',
    },
    {
      id: 'step-backward',
      category: 'playback',
      label: 'Step Backward (1 CPU Line)',
      description: 'Rewind one atomic execution frame backward in time',
      keys: ['←'],
      comboText: '←',
    },
    {
      id: 'next-action',
      category: 'playback',
      label: 'Jump to Next Action / Swap',
      description: 'Skip intermediate checks to the next mutation or swap',
      keys: NextActionKeys,
      comboText: 'Shift+→',
    },
    {
      id: 'prev-action',
      category: 'playback',
      label: 'Jump to Previous Action',
      description: 'Rewind directly to the prior state mutation or swap',
      keys: PrevActionKeys,
      comboText: 'Shift+←',
    },
    {
      id: 'next-milestone',
      category: 'playback',
      label: 'Next Algorithm Milestone',
      description: 'Jump to the next major phase or partition bookmark',
      keys: NextMilestoneKeys,
      comboText: isMac ? 'Opt+→' : 'Alt+→',
    },
    {
      id: 'prev-milestone',
      category: 'playback',
      label: 'Previous Algorithm Milestone',
      description: 'Jump back to the previous major phase bookmark',
      keys: PrevMilestoneKeys,
      comboText: isMac ? 'Opt+←' : 'Alt+←',
    },
    {
      id: 'jump-start',
      category: 'playback',
      label: 'Jump to First Frame',
      description: 'Rewind immediately to Step 1',
      keys: JumpStartKeys,
      comboText: isMac ? 'Cmd+←' : 'Home',
    },
    {
      id: 'jump-end',
      category: 'playback',
      label: 'Jump to Final Frame',
      description: 'Fast-forward immediately to completion state',
      keys: JumpEndKeys,
      comboText: isMac ? 'Cmd+→' : 'End',
    },
    {
      id: 'reset',
      category: 'playback',
      label: 'Reset Timeline',
      description: 'Pause and reset simulation to initial input state',
      keys: ['R'],
      comboText: 'R',
    },
    {
      id: 'speed-presets',
      category: 'playback',
      label: 'Playback Speed Presets',
      description: 'Set speed directly to 0.5x, 1x, 1.5x, or 2x',
      keys: ['1', '2', '3', '4'],
      comboText: '1–4',
    },
    {
      id: 'auto-pace',
      category: 'playback',
      label: 'Toggle Smart Auto-Pacing',
      description: 'Automatically decelerate on swaps and accelerate scans',
      keys: ['A'],
      comboText: 'A',
    },
    {
      id: 'quick-search',
      category: 'navigation',
      label: 'Algorithm Command Palette',
      description: 'Instant fuzzy search across all registered algorithms & Big-O',
      keys: QuickSearchKeys,
      comboText: isMac ? 'Cmd+K' : 'Ctrl+K',
    },
    {
      id: 'shortcuts-modal',
      category: 'navigation',
      label: 'Keyboard Shortcuts Studio',
      description: 'Open this interactive OS hotkey reference & key tester',
      keys: ['?'],
      comboText: '?',
    },
    {
      id: 'toggle-dock',
      category: 'workbench',
      label: 'Toggle Code & Status Dock',
      description: 'Expand or collapse the right-hand VisuAlgo inspector dock',
      keys: ['D'],
      comboText: 'D',
    },
    {
      id: 'toggle-theory',
      category: 'workbench',
      label: 'Toggle Theory & Invariants Drawer',
      description: 'Open or close the left mathematical invariant drawer',
      keys: ['T'],
      comboText: 'T',
    },
    {
      id: 'toggle-legend',
      category: 'workbench',
      label: 'Toggle Visual Color Legend',
      description: 'Inspect semantic color rules and pointer role badges',
      keys: ['L'],
      comboText: 'L',
    },
    {
      id: 'toggle-mute',
      category: 'workbench',
      label: 'Mute / Unmute Synthesizer',
      description: 'Toggle harmonic audio feedback during comparisons',
      keys: ['M'],
      comboText: 'M',
    },
    {
      id: 'toggle-projection',
      category: 'workbench',
      label: 'Toggle 2D / 3D Isometric View',
      description: 'Switch between flat 2D canvas and 3D architectural isometric deck',
      keys: ['V'],
      comboText: 'V',
    },
    {
      id: 'sibling-switch',
      category: 'navigation',
      label: 'Prev / Next Category Algorithm',
      description: 'Cycle through sibling algorithms in the active CS domain',
      keys: ['[', ']'],
      comboText: '[ / ]',
    },
    {
      id: 'stage-zoom',
      category: 'workbench',
      label: 'Zoom In / Out / Reset Stage',
      description: 'Adjust visualizer canvas zoom scale (75% – 125%) or reset to 100%',
      keys: ['+', '-', '0'],
      comboText: '+ / - / 0',
    },
    {
      id: 'cli-studio',
      category: 'navigation',
      label: 'Open Personal Code Studio',
      description: 'Launch live Python / C++ / JS code tracer & CLI setup',
      keys: ['C'],
      comboText: 'C',
    },
  ];

  return {
    os,
    detectedOS,
    mode,
    isAutoDetected: mode === 'auto',
    osName,
    osShortBadge,
    modKey,
    shiftKey,
    altKey,
    enterKey,
    escapeKey,
    quickSearch: isMac ? 'Cmd+K' : 'Ctrl+K',
    QuickSearchKeys,
    shortcutsHelp: '?',
    playPause: 'Space',
    nextStep: '→',
    prevStep: '←',
    nextAction: 'Shift+→',
    NextActionKeys,
    prevAction: 'Shift+←',
    PrevActionKeys,
    nextMilestone: isMac ? 'Opt+→' : 'Alt+→',
    NextMilestoneKeys,
    prevMilestone: isMac ? 'Opt+←' : 'Alt+←',
    PrevMilestoneKeys,
    jumpStart: isMac ? 'Cmd+←' : 'Home',
    JumpStartKeys,
    jumpEnd: isMac ? 'Cmd+→' : 'End',
    JumpEndKeys,
    reset: 'R',
    autoPace: 'A',
    toggleMute: 'M',
    toggleDock: 'D',
    toggleTheory: 'T',
    toggleLegend: 'L',
    catalog,
  };
}

const STORAGE_KEY = 'stepdsa_os_mode_v2';
const EVENT_NAME = 'stepdsa:os-mode-change';

/**
 * React hook that auto-detects OS shortcuts (including high-entropy client hints)
 * and supports manual OS preview mode ('auto' | 'mac' | 'windows' | 'linux').
 */
export function usePlatformShortcuts() {
  const [detectedOS, setDetectedOS] = useState<PlatformOS>(() => detectBrowserRuntimeOS());

  const [mode, setModeState] = useState<PlatformOSMode>(() => {
    if (typeof window === 'undefined') return 'auto';
    const saved = window.localStorage.getItem(STORAGE_KEY) as PlatformOSMode | null;
    if (saved === 'auto' || saved === 'mac' || saved === 'windows' || saved === 'linux') {
      return saved;
    }
    return 'auto';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nav = window.navigator as any;
    if (nav?.userAgentData?.getHighEntropyValues) {
      nav.userAgentData
        .getHighEntropyValues(['platform'])
        .then((entropy: { platform?: string }) => {
          if (entropy?.platform) {
            const refined = detectPlatformOS(entropy.platform, nav.userAgent || '', nav.vendor || '');
            setDetectedOS(refined);
          }
        })
        .catch(() => {
          // Ignore if permission denied
        });
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<PlatformOSMode>).detail;
      if (detail) setModeState(detail);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const setOSMode = useCallback((nextMode: PlatformOSMode) => {
    setModeState(nextMode);
    if (typeof window !== 'undefined') {
      if (nextMode === 'auto') {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, nextMode);
      }
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: nextMode }));
    }
  }, []);

  const effectiveOS: PlatformOS = mode === 'auto' ? detectedOS : mode;

  const toggleOS = useCallback(() => {
    const order: PlatformOSMode[] = ['mac', 'windows', 'linux', 'auto'];
    const curIdx = order.indexOf(mode);
    const next =
      curIdx === -1
        ? effectiveOS === 'mac'
          ? 'windows'
          : effectiveOS === 'windows'
          ? 'linux'
          : 'mac'
        : order[(curIdx + 1) % order.length];
    setOSMode(next);
  }, [mode, effectiveOS, setOSMode]);

  const labels = useMemo(
    () => getPlatformShortcutLabels(effectiveOS, mode, detectedOS),
    [effectiveOS, mode, detectedOS]
  );

  return {
    ...labels,
    setOSMode,
    toggleOS,
  };
}
