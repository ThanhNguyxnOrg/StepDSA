import { useState, useMemo, useEffect } from 'react';
import { allModules, defaultModule } from './modules/registry';
import { AlgorithmModule } from './core/types';
import { useTimelinePlayback } from './core/timeline';
import { Header } from './components/layout/Header';
import { TheoryDrawer } from './components/layout/TheoryDrawer';
import { CodeInspector } from './components/code/CodeInspector';
import { StepperControls } from './components/player/StepperControls';
import { StepNarrationBanner } from './components/stage/StepNarrationBanner';
import { PlaygroundBar } from './components/playground/PlaygroundBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AboutModal } from './components/about/AboutModal';
import { PersonalCodeStudioModal } from './components/developer/PersonalCodeStudioModal';
import { soundEngine } from './utils/soundEngine';
import { BookOpen, Code2, HelpCircle } from 'lucide-react';
import { VisualLegendModal } from './components/workbench/VisualLegendModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'visualizer'>('dashboard');
  const [currentModule, setCurrentModule] = useState<AlgorithmModule>(defaultModule);
  const [currentData, setCurrentData] = useState<any>(defaultModule.defaultInput);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [theoryOpen, setTheoryOpen] = useState<boolean>(false); // Collapsed by default for spacious stage
  const [codeOpen, setCodeOpen] = useState<boolean>(true); // Code open for synchronized tracking
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [personalStudioOpen, setPersonalStudioOpen] = useState<boolean>(false);
  const [legendOpen, setLegendOpen] = useState<boolean>(false);

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
    reset,
  } = controller;

  // Sound triggering effect
  useEffect(() => {
    if (!currentFrame || isMuted || currentView !== 'visualizer') return;

    if (currentFrame.isMilestone) {
      soundEngine.playCompleteSound();
    } else {
      const elements: any[] = currentFrame.state?.array || [];
      const activeEl = elements.find((el) => el.status === 'comparing' || el.status === 'swapping');
      if (activeEl && typeof activeEl.value === 'number') {
        soundEngine.playValueTone(activeEl.value, 1, 100);
      }
    }
  }, [currentStep, currentFrame, isMuted, currentView]);

  // Global Keyboard Shortcuts (Space, Arrows, Shift+Arrows, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView !== 'visualizer') return;

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) pause();
        else play();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey && stepToNextAction) {
          stepToNextAction();
        } else {
          stepForward();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey && stepToPrevAction) {
          stepToPrevAction();
        } else {
          stepBackward();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, stepForward, stepBackward, stepToNextAction, stepToPrevAction, reset, currentView]);

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleApplyPlaygroundData = (newData: any) => {
    if (Array.isArray(newData)) {
      if (currentModule.id === 'binary-search') {
        const sorted = [...newData].sort((a, b) => a - b);
        setCurrentData({ array: sorted, target: sorted[Math.floor(sorted.length / 2)] });
      } else if (currentModule.id === 'linear-search') {
        setCurrentData({ array: newData, target: newData[Math.floor(newData.length / 2)] ?? 10 });
      } else if (currentModule.id === 'rotated-sorted-array') {
        setCurrentData({ array: newData, target: newData[0] ?? 0 });
      } else if (currentModule.id === 'bst-insert') {
        setCurrentData({ valuesToInsert: newData });
      } else if (currentModule.id === 'avl-tree' || currentModule.id === 'tree-traversals') {
        setCurrentData({ values: newData });
      } else if (currentModule.id === 'kadanes-algorithm') {
        setCurrentData({ array: newData });
      } else if (currentModule.id === 'house-robber') {
        setCurrentData({ nums: newData });
      } else if (currentModule.id === 'sliding-window-max-sum') {
        const k = Math.min(3, Math.max(1, Math.floor(newData.length / 2)));
        setCurrentData({ array: newData, k });
      } else {
        setCurrentData(newData);
      }
    } else {
      setCurrentData(newData);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0B0F19] text-[#F9FAFB] overflow-hidden font-sans">
      {/* 1. Header with View Tabs, Algorithm Quick-Picker, and Audio/Theme settings */}
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
      />

      {/* 2. Main Content: Dashboard or Visualizer Workbench */}
      {currentView === 'dashboard' ? (
        <DashboardView
          modules={allModules}
          onSelectModule={handleSelectModule}
          onOpenPersonalStudio={() => setPersonalStudioOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Playground Preset Bar */}
          <PlaygroundBar
            currentModule={currentModule}
            onApplyData={handleApplyPlaygroundData}
            currentData={currentData}
          />

          {/* Workbench Body */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Drawer: Theory & Invariant */}
            <TheoryDrawer
              module={currentModule}
              isOpen={theoryOpen}
              onToggle={() => setTheoryOpen(!theoryOpen)}
            />

            {/* Central Stage & Controls */}
            <main className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden bg-radial from-[#111827]/40 to-[#0B0F19]">
              {/* Top sub-bar with Quick Panel Toggles */}
              <div className="shrink-0 px-4 py-2 flex items-center justify-between border-b border-[#1F293D]/60 bg-[#111827]/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTheoryOpen(!theoryOpen)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      theoryOpen ? 'bg-[#10B981]/20 text-[#10B981] font-semibold' : 'text-slate-400 hover:text-white hover:bg-[#1F2937]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Theory Panel</span>
                  </button>
                  <button
                    onClick={() => setCodeOpen(!codeOpen)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      codeOpen ? 'bg-[#06B6D4]/20 text-[#06B6D4] font-semibold' : 'text-slate-400 hover:text-white hover:bg-[#1F2937]'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Code Inspector</span>
                  </button>
                  <button
                    onClick={() => setLegendOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-amber-400/90 hover:text-amber-300 hover:bg-amber-400/10 transition-colors border border-amber-500/20"
                    title="Visual Legend & Interface Guide"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Visual Legend</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  {currentModule.category.toUpperCase()} · {currentModule.complexity.timeAverage}
                </div>
              </div>

              {/* Step Explanation Banner */}
              <div className="shrink-0 p-3 pb-0 max-w-5xl mx-auto w-full">
                <StepNarrationBanner frame={currentFrame} />
              </div>

              {/* Visual Stage */}
              <div className="flex-1 min-h-0 flex items-center justify-center relative overflow-hidden px-4">
                {currentFrame ? (
                  currentModule.renderStage(currentFrame, '2d')
                ) : (
                  <div className="text-slate-500 font-mono text-sm">Generating execution timeline...</div>
                )}
              </div>

              {/* Bottom Stepper Controls (shrink-0 to prevent viewport clipping) */}
              <div className="shrink-0">
                <StepperControls controller={controller} currentFrame={currentFrame} />
              </div>
            </main>

            {/* Right Drawer: Multi-Language Code Inspector & Call Stack Debugger */}
            <CodeInspector
              codeSnippets={currentModule.codeSnippets}
              activeLine={currentFrame?.codeLine || 1}
              frame={currentFrame}
              moduleName={currentModule.title}
              isOpen={codeOpen}
              onToggle={() => setCodeOpen(!codeOpen)}
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
    </div>
  );
}
