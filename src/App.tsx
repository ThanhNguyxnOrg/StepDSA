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
import { soundEngine } from './utils/soundEngine';
import { BookOpen, Code2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'visualizer'>('dashboard');
  const [currentModule, setCurrentModule] = useState<AlgorithmModule>(defaultModule);
  const [currentData, setCurrentData] = useState<any>(defaultModule.defaultInput);
  const [projectionMode, setProjectionMode] = useState<'2d' | 'isometric'>('2d');
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [theoryOpen, setTheoryOpen] = useState<boolean>(false); // Collapsed by default for spacious stage
  const [codeOpen, setCodeOpen] = useState<boolean>(true); // Code open for synchronized tracking
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);

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
  const { currentFrame, currentStep, isPlaying, play, pause, stepForward, stepBackward, reset } = controller;

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

  // Global Keyboard Shortcuts (Space, Arrows, R)
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
        stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, stepForward, stepBackward, reset, currentView]);

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleToggleProjection = () => {
    setProjectionMode((prev) => (prev === '2d' ? 'isometric' : '2d'));
  };

  // Convert currentData to number array for the array playground if applicable
  const arrayData = useMemo(() => {
    if (Array.isArray(currentData)) return currentData;
    if (currentData && Array.isArray(currentData.array)) return currentData.array;
    if (currentData && Array.isArray(currentData.valuesToInsert)) return currentData.valuesToInsert;
    return [10, 20, 30, 40, 50];
  }, [currentData]);

  const handleApplyPlaygroundData = (newData: number[]) => {
    if (currentModule.id === 'binary-search') {
      setCurrentData({ array: newData, target: newData[Math.floor(newData.length / 2)] });
    } else if (currentModule.id === 'bst-insert') {
      setCurrentData({ valuesToInsert: newData });
    } else if (currentModule.id === 'sliding-window') {
      setCurrentData({ array: newData, k: 3 });
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
        projectionMode={projectionMode}
        onToggleProjection={handleToggleProjection}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenAbout={() => setAboutOpen(true)}
      />

      {/* 2. Main Content: Dashboard or Visualizer Workbench */}
      {currentView === 'dashboard' ? (
        <DashboardView modules={allModules} onSelectModule={handleSelectModule} />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Playground Preset Bar */}
          <PlaygroundBar onApplyData={handleApplyPlaygroundData} currentData={arrayData} />

          {/* Workbench Body */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Drawer: Theory & Invariant */}
            <TheoryDrawer
              module={currentModule}
              isOpen={theoryOpen}
              onToggle={() => setTheoryOpen(!theoryOpen)}
            />

            {/* Central Stage & Controls */}
            <main className="flex-1 flex flex-col justify-between overflow-hidden bg-radial from-[#111827]/40 to-[#0B0F19]">
              {/* Top sub-bar with Quick Panel Toggles */}
              <div className="px-4 py-2 flex items-center justify-between border-b border-[#1F293D]/60 bg-[#111827]/30">
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
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  {currentModule.category.toUpperCase()} · {currentModule.complexity.timeAverage}
                </div>
              </div>

              {/* Step Explanation Banner */}
              <div className="p-3 pb-0 max-w-5xl mx-auto w-full">
                <StepNarrationBanner frame={currentFrame} />
              </div>

              {/* Visual Stage */}
              <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4">
                {currentFrame ? (
                  currentModule.renderStage(currentFrame, projectionMode)
                ) : (
                  <div className="text-slate-500 font-mono text-sm">Generating execution timeline...</div>
                )}
              </div>

              {/* Bottom Stepper Controls */}
              <StepperControls controller={controller} currentFrame={currentFrame} />
            </main>

            {/* Right Drawer: Multi-Language Code Inspector */}
            <CodeInspector
              codeSnippets={currentModule.codeSnippets}
              activeLine={currentFrame?.codeLine || 1}
              isOpen={codeOpen}
              onToggle={() => setCodeOpen(!codeOpen)}
            />
          </div>
        </div>
      )}

      {/* 3. About Modal */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
