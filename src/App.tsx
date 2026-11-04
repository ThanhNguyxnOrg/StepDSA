import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LZString from 'lz-string';
import { allModules, defaultModule } from './modules/registry';
import { AlgorithmModule } from './core/types';
import { useTimelinePlayback } from './core/timeline';
import { adaptTraceSnapshotToModule } from './core/studio/universalAdapter';
import { Header } from './components/layout/Header';
import { TheoryDrawer } from './components/layout/TheoryDrawer';
import { CodeInspector } from './components/code/CodeInspector';
import { StepperControls } from './components/player/StepperControls';
import { MemoryShelf } from './components/stage/MemoryShelf';
import { StepNarrationBanner } from './components/stage/StepNarrationBanner';
import {
  PlaygroundBar,
  detectNumericArrayField,
  detectStringField,
} from './components/playground/PlaygroundBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AboutModal } from './components/about/AboutModal';
import { PersonalCodeStudioModal } from './components/developer/PersonalCodeStudioModal';
import { soundEngine } from './utils/soundEngine';
import {
  BookOpen,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  Box,
  PanelRightOpen,
  Layers,
} from 'lucide-react';
import { VisualLegendModal } from './components/workbench/VisualLegendModal';
import { KeyboardShortcutsModal } from './components/navigation/KeyboardShortcutsModal';
import { useOperationalMetrics } from './core/useOperationalMetrics';
import { OperationalMetricsBar } from './components/stage/OperationalMetricsBar';
import { usePlatformShortcuts } from './utils/platformShortcuts';
import { useAppTheme, APP_THEMES } from './utils/themeEngine';

const CATEGORY_LABELS: Record<string, string> = {
  sorting: 'Sorting',
  searching: 'Searching',
  'arrays-pointers': 'Arrays & Pointers',
  'stack-queue': 'Stacks & Queues',
  'linked-lists': 'Linked Lists',
  'trees-bst': 'Trees & Heaps',
  graphs: 'Graphs',
  'dynamic-programming': 'Dynamic Programming',
  math: 'Math & Bitwise',
};

export default function App() {
  const initialUrlParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const initialModule = useMemo(() => {
    const modId = initialUrlParams.get('module');
    if (modId) {
      const normalized = modId.toLowerCase().trim();
      const slugify = (s: string) =>
        s
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      const found =
        allModules.find((m) => m.id.toLowerCase() === normalized) ||
        allModules.find((m) => slugify(m.title.split('(')[0].trim()) === normalized) ||
        allModules.find((m) => slugify(m.title) === normalized) ||
        allModules.find(
          (m) =>
            m.id.toLowerCase().includes(normalized) ||
            normalized.includes(m.id.toLowerCase())
        );
      if (found) return found;
    }
    return defaultModule;
  }, [initialUrlParams]);

  const [currentView, setCurrentView] = useState<'dashboard' | 'visualizer'>(() => {
    if (
      initialUrlParams.get('autostart') === '1' ||
      initialUrlParams.has('module') ||
      initialUrlParams.has('step')
    ) {
      return 'visualizer';
    }
    return 'dashboard';
  });
  const [currentModule, setCurrentModule] = useState<AlgorithmModule>(initialModule);
  const [currentData, setCurrentData] = useState<any>(initialModule.defaultInput);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [theoryOpen, setTheoryOpen] = useState<boolean>(false);
  const [codeOpen, setCodeOpen] = useState<boolean>(true);
  const [inspectorTab, setInspectorTab] = useState<'code' | 'trace' | 'theory'>('code');
  const [projection, setProjection] = useState<'2d' | 'isometric'>('2d');
  const [stageZoom, setStageZoom] = useState<number>(1);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [personalStudioOpen, setPersonalStudioOpen] = useState<boolean>(false);
  const [legendOpen, setLegendOpen] = useState<boolean>(false);
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false);
  const [showAllSiblings, setShowAllSiblings] = useState<boolean>(false);
  const [hotkeyHud, setHotkeyHud] = useState<{ keys: string[]; label: string; id: number } | null>(
    null
  );
  const [cliSession, setCliSession] = useState<{ filename: string; totalSteps: number } | null>(
    null
  );
  const shortcuts = usePlatformShortcuts();
  const { themeId, setTheme } = useAppTheme();

  // Sibling modules in the same category (VisuAlgo-style top category switcher)
  const siblingModules = useMemo(() => {
    return allModules.filter((m) => m.category === currentModule.category);
  }, [currentModule.category]);

  // When module changes, update input to module's defaultInput
  const handleSelectModule = (mod: AlgorithmModule) => {
    setCurrentModule(mod);
    setCurrentData(mod.defaultInput);
    setCurrentView('visualizer');
  };

  // Generate deterministic timeline whenever module or input data changes
  const timeline = useMemo(() => {
    try {
      return currentModule.generateTimeline(currentData);
    } catch {
      return currentModule.generateTimeline(currentModule.defaultInput);
    }
  }, [currentModule, currentData]);

  // Hook into playback controller
  const controller = useTimelinePlayback(timeline);
  const {
    currentFrame,
    currentStep,
    isPlaying,
    play,
    pause,
    stepForward,
    stepBackward,
    stepToNextAction,
    stepToPrevAction,
    seekTo,
    reset,
  } = controller;

  // Seek to ?step=<n> if provided in URL
  useEffect(() => {
    const stepParam = initialUrlParams.get('step');
    if (stepParam !== null) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < timeline.length) {
        seekTo(parsed);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enrich currentFrame so state always carries conditionEval and action for stage components
  const enrichedFrame = useMemo(() => {
    if (!currentFrame) return null;
    if (
      currentFrame.state &&
      typeof currentFrame.state === 'object' &&
      !Array.isArray(currentFrame.state)
    ) {
      return {
        ...currentFrame,
        state: {
          ...currentFrame.state,
          conditionEval: currentFrame.state.conditionEval ?? currentFrame.conditionEval,
          action: currentFrame.state.action ?? currentFrame.action,
        },
      };
    }
    return currentFrame;
  }, [currentFrame]);

  // Live operational metrics tallying comparisons, swaps, accesses, and lookups
  const operationalMetrics = useOperationalMetrics(timeline, currentStep);

  // Sound triggering effect
  useEffect(() => {
    if (!currentFrame || isMuted || currentView !== 'visualizer') return;

    if (currentFrame.isMilestone) {
      soundEngine.playCompleteSound();
    } else if (currentFrame.soundCue) {
      soundEngine.playCue(currentFrame.soundCue);
    } else {
      const elements: any[] = currentFrame.state?.array || [];
      const activeEl = elements.find(
        (el) => el.status === 'comparing' || el.status === 'swapping'
      );
      if (activeEl && typeof activeEl.value === 'number') {
        soundEngine.playValueTone(activeEl.value, 1, 100);
      }
    }
  }, [currentStep, currentFrame, isMuted, currentView]);

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  // Global Keyboard Shortcuts (OS-Adaptive: Space, Arrows, Shift+Arrows, Alt/Opt+Arrows, Cmd/Home/End, 1-4, A, R, M, D, T, L, ?)
  useEffect(() => {
    let hudTimer: ReturnType<typeof setTimeout> | null = null;
    const triggerHud = (keys: string[], label: string) => {
      setHotkeyHud({ keys, label, id: Date.now() });
      if (hudTimer) clearTimeout(hudTimer);
      hudTimer = setTimeout(() => setHotkeyHud(null), 1300);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // '?' opens Keyboard Shortcuts Studio Modal anywhere
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
        return;
      }

      // 'C' opens Personal Code Studio anywhere (when no modal is blocking)
      if (e.code === 'KeyC' && !e.metaKey && !e.ctrlKey && !e.altKey && !shortcutsOpen && !personalStudioOpen) {
        e.preventDefault();
        setPersonalStudioOpen(true);
        triggerHud(['C'], 'Personal Code Studio');
        return;
      }

      // 'H' switches between Explore Hub and Workbench
      if (e.code === 'KeyH' && !e.metaKey && !e.ctrlKey && !e.altKey && !shortcutsOpen && !personalStudioOpen) {
        e.preventDefault();
        setCurrentView((prev) => {
          const next = prev === 'dashboard' ? 'visualizer' : 'dashboard';
          triggerHud(['H'], next === 'dashboard' ? 'Explore Hub' : 'Workbench');
          return next;
        });
        return;
      }

      if (currentView !== 'visualizer' || shortcutsOpen || personalStudioOpen) return;

      // Cmd/Ctrl+ArrowLeft / Home -> Jump to Start; Cmd/Ctrl+ArrowRight / End -> Jump to End
      if (((e.metaKey || e.ctrlKey) && !e.altKey && e.code === 'ArrowLeft') || e.code === 'Home') {
        e.preventDefault();
        seekTo(0);
        triggerHud(shortcuts.JumpStartKeys, 'Jump to First Frame');
        return;
      }
      if (((e.metaKey || e.ctrlKey) && !e.altKey && e.code === 'ArrowRight') || e.code === 'End') {
        e.preventDefault();
        seekTo(Math.max(0, timeline.length - 1));
        triggerHud(shortcuts.JumpEndKeys, 'Jump to Final Frame');
        return;
      }

      // Alt/Option + ArrowRight / ArrowLeft -> Jump to Next / Prev Milestone
      if (e.altKey && !e.metaKey && !e.ctrlKey) {
        if (e.code === 'ArrowRight') {
          e.preventDefault();
          const nextM = timeline.findIndex((f, idx) => idx > currentStep && f.isMilestone);
          if (nextM !== -1) {
            seekTo(nextM);
            triggerHud(shortcuts.NextMilestoneKeys, 'Next Milestone');
          } else if (stepToNextAction) {
            stepToNextAction();
            triggerHud(shortcuts.NextMilestoneKeys, 'Next Milestone');
          }
          return;
        }
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          let prevM = -1;
          for (let i = currentStep - 1; i >= 0; i--) {
            if (timeline[i]?.isMilestone) {
              prevM = i;
              break;
            }
          }
          if (prevM !== -1) {
            seekTo(prevM);
            triggerHud(shortcuts.PrevMilestoneKeys, 'Prev Milestone');
          } else if (stepToPrevAction) {
            stepToPrevAction();
            triggerHud(shortcuts.PrevMilestoneKeys, 'Prev Milestone');
          }
          return;
        }
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          pause();
          triggerHud(['Space'], 'Paused');
        } else {
          play();
          triggerHud(['Space'], 'Playing');
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey && stepToNextAction) {
          stepToNextAction();
          triggerHud(shortcuts.NextActionKeys, 'Next Action');
        } else {
          stepForward();
          triggerHud(['→'], 'Step Forward');
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey && stepToPrevAction) {
          stepToPrevAction();
          triggerHud(shortcuts.PrevActionKeys, 'Prev Action');
        } else {
          stepBackward();
          triggerHud(['←'], 'Step Back');
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
        triggerHud(['R'], 'Reset Timeline');
      } else if (e.code === 'KeyA' && controller.toggleAutoPacing) {
        e.preventDefault();
        controller.toggleAutoPacing();
        triggerHud(['A'], controller.isAutoPacing ? 'Auto-Pace OFF' : 'Auto-Pace ON');
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        e.preventDefault();
        const speeds = [0.5, 1, 1.5, 2];
        const idx = Number(e.code.replace('Digit', '')) - 1;
        const targetSpeed = speeds[idx] || 1;
        controller.setSpeed(targetSpeed);
        triggerHud([String(idx + 1)], `Speed ${targetSpeed}x`);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleSound();
        triggerHud(['M'], isMuted ? 'Audio Unmuted' : 'Audio Muted');
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        setCodeOpen((prev) => {
          triggerHud(['D'], prev ? 'Dock Collapsed' : 'Dock Expanded');
          return !prev;
        });
      } else if (e.code === 'KeyT') {
        e.preventDefault();
        setTheoryOpen((prev) => {
          triggerHud(['T'], prev ? 'Theory Closed' : 'Theory Opened');
          return !prev;
        });
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        setLegendOpen((prev) => {
          triggerHud(['L'], prev ? 'Legend Closed' : 'Legend Opened');
          return !prev;
        });
      } else if (e.code === 'KeyV') {
        e.preventDefault();
        setProjection((prev) => {
          const next = prev === '2d' ? 'isometric' : '2d';
          triggerHud(['V'], next === 'isometric' ? '3D Isometric Deck' : '2D Flat Canvas');
          return next;
        });
      } else if (e.code === 'BracketLeft' && siblingModules.length > 1) {
        e.preventDefault();
        const curIdx = siblingModules.findIndex((m) => m.id === currentModule.id);
        const prevIdx = (curIdx - 1 + siblingModules.length) % siblingModules.length;
        const nextMod = siblingModules[prevIdx];
        handleSelectModule(nextMod);
        triggerHud(['['], nextMod.title.split('(')[0].trim());
      } else if (e.code === 'BracketRight' && siblingModules.length > 1) {
        e.preventDefault();
        const curIdx = siblingModules.findIndex((m) => m.id === currentModule.id);
        const nextIdx = (curIdx + 1) % siblingModules.length;
        const nextMod = siblingModules[nextIdx];
        handleSelectModule(nextMod);
        triggerHud([']'], nextMod.title.split('(')[0].trim());
      } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        e.preventDefault();
        setStageZoom((z) => {
          const next = Math.min(1.25, Math.round((z + 0.1) * 100) / 100);
          triggerHud(['+'], `Zoom ${Math.round(next * 100)}%`);
          return next;
        });
      } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        setStageZoom((z) => {
          const next = Math.max(0.75, Math.round((z - 0.1) * 100) / 100);
          triggerHud(['-'], `Zoom ${Math.round(next * 100)}%`);
          return next;
        });
      } else if (e.code === 'Digit0' || e.code === 'Numpad0') {
        e.preventDefault();
        setStageZoom(1);
        triggerHud(['0'], 'Zoom Reset 100%');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (hudTimer) clearTimeout(hudTimer);
    };
  }, [
    isPlaying,
    play,
    pause,
    stepForward,
    stepBackward,
    stepToNextAction,
    stepToPrevAction,
    seekTo,
    reset,
    currentView,
    isMuted,
    shortcutsOpen,
    personalStudioOpen,
    currentStep,
    timeline,
    shortcuts,
    controller,
    siblingModules,
    currentModule.id,
  ]);

  // Auto-load trace snapshot from URL hash (#trace=<compressed>)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#trace=')) return;

    const encoded = hash.slice('#trace='.length);
    if (!encoded) return;

    try {
      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (!json) {
        console.warn('[StepDSA] Failed to decompress trace data from URL hash.');
        return;
      }
      const parsed = JSON.parse(json);
      const mod = adaptTraceSnapshotToModule(json);
      handleSelectModule(mod);
      setCliSession({
        filename: parsed.meta?.sourceFile || parsed.meta?.title || 'solution.stepdsa',
        totalSteps: parsed.meta?.totalSteps || (parsed.frames ? parsed.frames.length : 0),
      });
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (err) {
      console.warn('[StepDSA] Invalid trace data in URL hash:', err);
    }
  }, []);

  const handleApplyPlaygroundData = (newData: any, customTarget?: number) => {
    const baseData = currentData ?? currentModule.defaultInput;

    if (Array.isArray(newData)) {
      const isSortedReq = [
        'binary-search',
        'jump-search',
        'interpolation-search',
        'exponential-search',
        'ternary-search',
      ].includes(currentModule.id);
      const arr = isSortedReq ? [...newData].sort((a, b) => a - b) : newData;

      if (Array.isArray(baseData)) {
        setCurrentData(arr);
        return;
      }

      const detectedArr = detectNumericArrayField(baseData);
      if (detectedArr && detectedArr.key && baseData && typeof baseData === 'object') {
        const nextObj: Record<string, any> = {
          ...baseData,
          [detectedArr.key]: arr,
        };
        if (customTarget !== undefined || typeof nextObj.target === 'number') {
          nextObj.target = customTarget ?? arr[Math.floor(arr.length / 2)] ?? nextObj.target;
        }
        if (typeof nextObj.searchTarget === 'number') {
          nextObj.searchTarget = customTarget ?? arr[Math.floor(arr.length / 2)];
        }
        if (typeof nextObj.searchKey === 'number') {
          nextObj.searchKey = customTarget ?? arr[Math.floor(arr.length / 2)];
        }
        if (typeof nextObj.keyToDelete === 'number') {
          nextObj.keyToDelete = customTarget ?? arr[Math.floor(arr.length / 2)];
        }
        if (typeof nextObj.k === 'number') {
          nextObj.k = Math.min(nextObj.k, Math.max(1, arr.length));
        }
        setCurrentData(nextObj);
        return;
      }

      setCurrentData(arr);
    } else if (typeof newData === 'string') {
      if (typeof baseData === 'string') {
        setCurrentData(newData);
        return;
      }
      const detectedStr = detectStringField(baseData);
      if (detectedStr && detectedStr.key && baseData && typeof baseData === 'object') {
        setCurrentData({
          ...baseData,
          [detectedStr.key]: newData,
        });
        return;
      }
      setCurrentData(newData);
    } else {
      setCurrentData(newData);
    }
  };

  const displayedSiblings = showAllSiblings ? siblingModules : siblingModules.slice(0, 12);

  const categoryModuleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of allModules) {
      counts[m.category] = (counts[m.category] || 0) + 1;
    }
    return counts;
  }, []);

  const handleCategoryChange = (newCat: string) => {
    const firstInCat = allModules.find((m) => m.category === newCat);
    if (firstInCat) {
      handleSelectModule(firstInCat);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0B0F19] text-[#F9FAFB] overflow-hidden font-sans">
      {/* 1. Header with View Tabs, Algorithm Quick-Picker, and OS-aware Shortcut Badge */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        currentModule={currentModule}
        modules={allModules}
        onSelectModule={handleSelectModule}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenPersonalStudio={() => setPersonalStudioOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        themeId={themeId}
        onSelectTheme={(id) => {
          setTheme(id);
          setHotkeyHud({ keys: ['Theme'], label: APP_THEMES[id].name, id: Date.now() });
        }}
      />

      {/* 2. Main Content: Dashboard or VisuAlgo-Structured Visualizer Workbench */}
      {currentView === 'dashboard' ? (
        <DashboardView
          modules={allModules}
          onSelectModule={handleSelectModule}
          onOpenPersonalStudio={() => setPersonalStudioOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* VisuAlgo-Inspired Category Switcher + Sibling Bar + Live Operational Metrics */}
          <div className="shrink-0 px-3 py-1 bg-[#0F172A] border-b border-[#1F293D] flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
              {/* Interactive Category Selector across all 9 domains (162 modules) */}
              <div className="relative inline-flex items-center shrink-0">
                <Layers className="w-3 h-3 text-emerald-400 absolute left-2 pointer-events-none" />
                <select
                  aria-label="Switch algorithm category"
                  value={currentModule.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="pl-6 pr-5 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider cursor-pointer outline-none appearance-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([catId, label]) => (
                    <option key={catId} value={catId} className="bg-[#0F172A] text-white">
                      {label} ({categoryModuleCounts[catId] || 0})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-1.5 text-[8px] text-emerald-400">
                  ▼
                </span>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
                {displayedSiblings.map((sib) => {
                  const isCurrent = sib.id === currentModule.id;
                  const shortLabel = sib.title.split('(')[0].trim();
                  return (
                    <button
                      key={sib.id}
                      type="button"
                      onClick={() => handleSelectModule(sib)}
                      className={`relative px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isCurrent
                          ? 'text-[#0B0F19] font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
                      }`}
                    >
                      {isCurrent && (
                        <motion.div
                          layoutId="active-sibling-pill"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          className="absolute inset-0 rounded-md bg-[#10B981] -z-0"
                        />
                      )}
                      <span className="relative z-10">{shortLabel}</span>
                    </button>
                  );
                })}
                {siblingModules.length > 12 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSiblings(!showAllSiblings)}
                    className="px-2 py-0.5 rounded bg-[#1E293B] hover:bg-[#334155] text-[10px] font-mono text-cyan-300 cursor-pointer shrink-0"
                  >
                    {showAllSiblings ? 'Show Less' : `+${siblingModules.length - 12} more`}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Operational Metrics + Compact Tool Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {cliSession && (
                <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                  <span>
                    CLI: <strong>{cliSession.filename}</strong>
                  </span>
                </div>
              )}

              <div className="hidden sm:block shrink-0">
                <OperationalMetricsBar
                  metrics={operationalMetrics}
                  complexity={currentModule.complexity?.timeAverage}
                />
              </div>

              <button
                type="button"
                onClick={() => setTheoryOpen(!theoryOpen)}
                className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  theoryOpen
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                    : 'text-slate-400 hover:text-white hover:bg-[#1F2937]'
                }`}
                title="Toggle Left Theory Drawer (Key: T)"
              >
                <BookOpen className="w-3 h-3" />
                <span>Theory</span>
              </button>

              <button
                type="button"
                onClick={() => setLegendOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-amber-300/90 hover:text-amber-200 hover:bg-amber-400/10 border border-amber-500/20 transition-colors cursor-pointer whitespace-nowrap"
                title="Visual Color & Pointer Legend (Key: L)"
              >
                <HelpCircle className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Legend</span>
              </button>

              {!codeOpen && (
                <button
                  type="button"
                  onClick={() => setCodeOpen(true)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4] hover:bg-[#06B6D4]/30 text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap"
                  title="Open Code & Status Dock (Key: D)"
                >
                  <PanelRightOpen className="w-3.5 h-3.5" />
                  <span>Code Dock</span>
                </button>
              )}
            </div>
          </div>

          {/* Compact Single-Row Input / Preset Bar */}
          <PlaygroundBar
            currentModule={currentModule}
            onApplyData={handleApplyPlaygroundData}
            currentData={currentData}
          />

          {/* Workbench Body: Responsive Split (Stacked on Mobile <768px | 2-Column on Tablet/Desktop >=768px) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            {/* Optional Left Drawer: Theory & Invariant */}
            <TheoryDrawer
              module={currentModule}
              isOpen={theoryOpen}
              onToggle={() => setTheoryOpen(!theoryOpen)}
            />

            {/* Central Stage & Bottom Transport Controls */}
            <main className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden bg-radial from-[#111827]/40 to-[#0B0F19]">
              {/* Live On-Canvas Cause-and-Effect Narration Strip */}
              <StepNarrationBanner frame={enrichedFrame} compact />

              {/* Auxiliary Memory Shelf for Hash Maps and Temp Buffers (only renders when present) */}
              <MemoryShelf frame={enrichedFrame} />

              {/* Expansive Visual Stage Canvas */}
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative overflow-auto px-3 sm:px-4">
                {/* 3D Isometric Mode Indicator Pill */}
                {projection === 'isometric' && (
                  <div className="absolute top-2.5 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/90 border border-indigo-500/40 text-indigo-200 text-[10px] font-mono font-bold shadow-lg pointer-events-none">
                    <Box className="w-3 h-3 text-cyan-400" />
                    <span>3D ISOMETRIC DECK</span>
                    <span className="text-indigo-400">· Key: V</span>
                  </div>
                )}

                {/* Live Keypress HUD Toast (Spring-animated feedback on hotkey press) */}
                <AnimatePresence>
                  {hotkeyHud && (
                    <motion.div
                      key={hotkeyHud.id}
                      initial={{ opacity: 0, y: -12, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.94 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                      className="absolute top-3 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A]/95 border border-[#10B981]/40 shadow-xl backdrop-blur-md pointer-events-none"
                    >
                      <div className="flex items-center gap-1">
                        {hotkeyHud.keys.map((k, idx) => (
                          <kbd
                            key={`${k}-${idx}`}
                            className="px-1.5 py-0.5 rounded bg-[#10B981] text-[#0B0F19] text-[10px] font-mono font-bold shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                      <span className="text-xs font-mono font-semibold text-white">
                        {hotkeyHud.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {enrichedFrame ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentModule.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="w-full flex-1 flex items-center justify-center"
                    >
                      <div
                        style={{
                          transform: stageZoom !== 1 ? `scale(${stageZoom})` : undefined,
                          transformOrigin: 'center center',
                        }}
                        className="w-full flex-1 flex items-center justify-center transition-transform duration-150"
                      >
                        <div
                          className={`w-full flex items-center justify-center ${
                            projection === 'isometric' && currentModule.id !== 'octree-3d'
                              ? 'stage-isometric-plane p-3 sm:p-5 my-2 max-w-4xl'
                              : 'stage-flat-plane flex-1'
                          }`}
                        >
                          {currentModule.renderStage(enrichedFrame, projection)}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="text-slate-500 font-mono text-sm">
                    Generating execution timeline...
                  </div>
                )}
              </div>

              {/* Compact Stage Footer: Inline Color Semantics + Canvas Zoom / 2D-3D Controls */}
              <div className="shrink-0 px-3 sm:px-4 py-1 border-t border-[#1F293D]/50 bg-[#0B0F19]/90 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 select-none">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#F59E0B] inline-block" />
                    <span>Comparing</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#F43F5E] inline-block" />
                    <span>Swapping</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#8B5CF6] inline-block" />
                    <span>Pivot</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#10B981] inline-block" />
                    <span>Sorted / Found</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setProjection((prev) => {
                        const next = prev === '2d' ? 'isometric' : '2d';
                        setHotkeyHud({
                          keys: ['V'],
                          label: next === 'isometric' ? '3D Isometric Deck' : '2D Flat Canvas',
                          id: Date.now(),
                        });
                        return next;
                      });
                    }}
                    title="Toggle 2D Flat / 3D Isometric Projection (Shortcut: V)"
                    className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                      projection === 'isometric'
                        ? 'bg-indigo-500/25 border-indigo-400/60 text-indigo-200 font-bold shadow-xs shadow-indigo-500/20'
                        : 'bg-[#111827] border-[#1F293D] text-slate-300 hover:text-white'
                    }`}
                  >
                    <Box className="w-3 h-3 text-cyan-400" />
                    <span>{projection === 'isometric' ? '3D Isometric (V)' : '2D / 3D View (V)'}</span>
                  </button>

                  <div className="flex items-center gap-0.5 bg-[#111827] border border-[#1F293D] rounded px-1 py-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        setStageZoom((z) => Math.max(0.75, Math.round((z - 0.1) * 100) / 100))
                      }
                      title="Zoom Out Stage (Key: -)"
                      aria-label="Zoom Out Stage"
                      className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStageZoom(1)}
                      title="Reset Zoom to 100% (Key: 0)"
                      className="px-1.5 text-[10px] tabular-nums text-slate-300 hover:text-white cursor-pointer"
                    >
                      {Math.round(stageZoom * 100)}%
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStageZoom((z) => Math.min(1.25, Math.round((z + 0.1) * 100) / 100))
                      }
                      title="Zoom In Stage (Key: +)"
                      aria-label="Zoom In Stage"
                      className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Stepper Controls */}
              <div className="shrink-0">
                <StepperControls
                  controller={controller}
                  currentFrame={enrichedFrame}
                  timeline={timeline}
                  onOpenShortcuts={() => setShortcutsOpen(true)}
                />
              </div>
            </main>

            {/* Right Dock: VisuAlgo-Inspired Status Explanation + Code & Variables + Trace + e-Lecture */}
            <CodeInspector
              codeSnippets={currentModule.codeSnippets}
              activeLine={currentFrame?.codeLine || 1}
              frame={enrichedFrame}
              moduleName={currentModule.title}
              isOpen={codeOpen}
              onToggle={() => setCodeOpen(!codeOpen)}
              module={currentModule}
              timeline={timeline}
              currentStep={currentStep}
              onSeekTo={seekTo}
              activeTab={inspectorTab}
              onTabChange={setInspectorTab}
            />
          </div>
        </div>
      )}

      {/* 3. Modals */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <PersonalCodeStudioModal
        isOpen={personalStudioOpen}
        onClose={() => setPersonalStudioOpen(false)}
        onLoadCustomSnapshot={(customMod) => handleSelectModule(customMod)}
      />
      <VisualLegendModal isOpen={legendOpen} onClose={() => setLegendOpen(false)} />
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
