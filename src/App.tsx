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
import { soundEngine } from './utils/soundEngine';

export default function App() {
  const [currentModule, setCurrentModule] = useState<AlgorithmModule>(defaultModule);
  const [currentData, setCurrentData] = useState<any>(defaultModule.defaultInput);
  const [projectionMode, setProjectionMode] = useState<'2d' | 'isometric'>('2d');
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [theoryOpen, setTheoryOpen] = useState<boolean>(true);
  const [codeOpen, setCodeOpen] = useState<boolean>(true);

  // When module changes, update input to module's defaultInput
  const handleSelectModule = (mod: AlgorithmModule) => {
    setCurrentModule(mod);
    setCurrentData(mod.defaultInput);
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
    if (!currentFrame || isMuted) return;

    if (currentFrame.isMilestone) {
      soundEngine.playCompleteSound();
    } else {
      // Find comparing or swapping elements
      const elements: any[] = currentFrame.state?.array || [];
      const activeEl = elements.find((el) => el.status === 'comparing' || el.status === 'swapping');
      if (activeEl && typeof activeEl.value === 'number') {
        soundEngine.playValueTone(activeEl.value, 1, 100);
      }
    }
  }, [currentStep, currentFrame, isMuted]);

  // Global Keyboard Shortcuts (Space, Arrows, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input or textarea
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
  }, [isPlaying, play, pause, stepForward, stepBackward, reset]);

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
    } else {
      setCurrentData(newData);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0B0F19] text-[#F9FAFB] overflow-hidden font-sans">
      {/* 1. Top Header */}
      <Header
        currentModule={currentModule}
        modules={allModules}
        onSelectModule={handleSelectModule}
        projectionMode={projectionMode}
        onToggleProjection={handleToggleProjection}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
      />

      {/* 2. Playground Input & Preset Bar */}
      <PlaygroundBar onApplyData={handleApplyPlaygroundData} currentData={arrayData} />

      {/* 3. Main 3-Pane Responsive Workbench */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Drawer: Theory & Invariant */}
        <TheoryDrawer
          module={currentModule}
          isOpen={theoryOpen}
          onToggle={() => setTheoryOpen(!theoryOpen)}
        />

        {/* Center Workbench: Stage & Controls */}
        <main className="flex-1 flex flex-col justify-between overflow-hidden bg-radial from-[#111827]/40 to-[#0B0F19]">
          {/* Live Step Explanation Banner */}
          <div className="p-3 pb-0">
            <StepNarrationBanner frame={currentFrame} />
          </div>

          {/* Central Visual Stage */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {currentFrame ? (
              currentModule.renderStage(currentFrame, projectionMode)
            ) : (
              <div className="text-slate-500 font-mono text-sm">Generating execution timeline...</div>
            )}
          </div>

          {/* Bottom Stepper Bar */}
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
  );
}
