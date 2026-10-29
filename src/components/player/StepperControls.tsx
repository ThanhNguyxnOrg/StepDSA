import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FastForward,
  Bookmark,
  Zap,
  Sparkles,
  Keyboard,
} from 'lucide-react';
import { PlaybackController, ExecutionFrame } from '../../core/types';
import { usePlatformShortcuts } from '../../utils/platformShortcuts';

export interface StepperControlsProps {
  controller: PlaybackController;
  currentFrame: ExecutionFrame | null;
  timeline?: ExecutionFrame[];
  onOpenShortcuts?: () => void;
}

export const StepperControls: React.FC<StepperControlsProps> = ({
  controller,
  currentFrame,
  timeline,
  onOpenShortcuts,
}) => {
  const {
    currentStep,
    totalSteps,
    isPlaying,
    speed,
    play,
    pause,
    stepForward,
    stepBackward,
    seekTo,
    setSpeed,
    reset,
  } = controller;

  const shortcuts = usePlatformShortcuts();
  const speedOptions = [0.25, 0.5, 1, 1.5, 2];

  const handleSpeedCycle = () => {
    const currentIndex = speedOptions.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    setSpeed(speedOptions[nextIndex]);
  };

  const progressPercent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  // Extract milestones from timeline
  const milestones = useMemo(() => {
    if (!timeline || timeline.length === 0) return [];
    return timeline
      .map((f, idx) => ({
        step: idx,
        title: f.milestoneTitle || `Milestone @ Step ${idx + 1}`,
        isMilestone: Boolean(f.isMilestone),
      }))
      .filter((m) => m.isMilestone);
  }, [timeline]);

  const prevMilestone = milestones.slice().reverse().find((m) => m.step < currentStep);
  const nextMilestone = milestones.find((m) => m.step > currentStep);

  return (
    <div className="bg-[#111827] border-t border-[#1F293D] px-3 py-1.5 flex items-center justify-between gap-2.5 select-none overflow-x-auto no-scrollbar">
      {/* 1. Left: Primary Playback Transport Controls (Always visible first) */}
      <div className="flex items-center gap-1 shrink-0">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={reset}
          title={`Reset to Start (${shortcuts.reset})`}
          aria-label="Reset timeline"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#1F2937] text-slate-300 hover:text-white hover:bg-[#374151] text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Reset</span>
        </motion.button>

        {/* Jump to Start */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={() => seekTo(0)}
          disabled={currentStep === 0}
          title={`Jump to Start (${shortcuts.jumpStart})`}
          aria-label="Jump to Start"
          className="hidden sm:flex p-1.5 rounded-md bg-[#1F2937] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#374151] transition-colors cursor-pointer"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </motion.button>

        {/* Step Back (Line) */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={stepBackward}
          disabled={currentStep === 0}
          title={`Step Back Line (${shortcuts.prevStep})`}
          aria-label="Step Back"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#1F2937] text-slate-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#374151] transition-all text-[11px] font-mono font-medium cursor-pointer whitespace-nowrap"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Prev</span>
        </motion.button>

        {/* Play / Pause Primary Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 450, damping: 24 }}
          type="button"
          onClick={isPlaying ? pause : play}
          title={
            isPlaying
              ? `Pause (${shortcuts.playPause})`
              : `Play (${shortcuts.playPause})`
          }
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={`h-7 px-3 rounded-md flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold shadow-sm transition-colors cursor-pointer shrink-0 ${
            isPlaying
              ? 'bg-[#F59E0B] text-[#0B0F19] hover:bg-[#d97706]'
              : 'bg-[#10B981] text-[#0B0F19] hover:bg-[#059669]'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </>
          )}
        </motion.button>

        {/* Step Forward (Line) */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={stepForward}
          disabled={currentStep >= totalSteps - 1}
          title={`Step Forward Line (${shortcuts.nextStep})`}
          aria-label="Step Forward"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#1F2937] text-slate-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#374151] transition-all text-[11px] font-mono font-medium cursor-pointer whitespace-nowrap"
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>

        {/* Next Action Milestone Button */}
        {controller.stepToNextAction && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={controller.stepToNextAction}
            disabled={currentStep >= totalSteps - 1}
            title={`Jump to Next Action / State Mutation (${shortcuts.nextAction})`}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-[#06B6D4] hover:bg-[#06B6D4]/25 hover:text-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Action</span>
            <SkipForward className="w-3 h-3" />
          </motion.button>
        )}

        {/* Prev / Next Milestone Quick Jumps */}
        {prevMilestone && (
          <button
            type="button"
            onClick={() => seekTo(prevMilestone.step)}
            title={`Prev Milestone (${shortcuts.prevMilestone}): ${prevMilestone.title}`}
            className="hidden 2xl:flex items-center gap-1 px-1.5 py-1 rounded-md bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] hover:bg-[#06B6D4]/20 text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            <Bookmark className="w-2.5 h-2.5 shrink-0" />
            <span>Prev</span>
          </button>
        )}
        {nextMilestone && (
          <button
            type="button"
            onClick={() => seekTo(nextMilestone.step)}
            title={`Next Milestone (${shortcuts.nextMilestone}): ${nextMilestone.title}`}
            className="hidden 2xl:flex items-center gap-1 px-1.5 py-1 rounded-md bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] hover:bg-[#06B6D4]/20 text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Next</span>
            <Bookmark className="w-2.5 h-2.5 shrink-0" />
          </button>
        )}
      </div>

      {/* 2. Center: Step Counter + Interactive Scrub Track with Milestone Pins + Milestone Badge */}
      <div className="flex items-center gap-2.5 flex-1 min-w-[140px]">
        <span className="text-[11px] font-mono font-medium text-slate-400 shrink-0 tabular-nums">
          <strong className="text-white">{currentStep + 1}</strong>/{totalSteps}
        </span>

        <div className="relative flex-1 flex items-center group min-w-[80px]">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Timeline step scrubber"
            className="w-full h-1.5 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
          />

          {/* Milestone Bookmark Markers along the track */}
          {milestones.map((m) => {
            const pct = totalSteps > 1 ? (m.step / (totalSteps - 1)) * 100 : 0;
            const isCurrent = currentStep === m.step;
            return (
              <button
                key={m.step}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  seekTo(m.step);
                }}
                title={`Jump to Milestone: ${m.title} (${shortcuts.nextMilestone})`}
                style={{ left: `${pct}%` }}
                className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-3 -ml-0.5 rounded-[2px] transition-all transform hover:scale-150 z-10 cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-400 ring-1 ring-amber-300 shadow-sm shadow-amber-400/50'
                    : 'bg-[#06B6D4] hover:bg-cyan-300 opacity-80'
                }`}
              />
            );
          })}
        </div>

        {currentFrame?.milestoneTitle ? (
          <div className="hidden 2xl:flex items-center gap-1 text-[11px] font-mono font-semibold text-[#10B981] shrink-0 max-w-[160px] truncate">
            <Sparkles className="w-3 h-3 text-[#10B981] shrink-0" />
            <span className="truncate">{currentFrame.milestoneTitle}</span>
          </div>
        ) : (
          <span className="hidden xl:inline text-[11px] font-mono text-slate-500 w-9 text-right shrink-0 tabular-nums">
            {Math.round(progressPercent)}%
          </span>
        )}
      </div>

      {/* 3. Right: Auto-Pacing, Speed Selector & Shortcuts Help */}
      <div className="flex items-center gap-1 shrink-0">
        {controller.toggleAutoPacing && (
          <button
            type="button"
            onClick={controller.toggleAutoPacing}
            title={
              controller.isAutoPacing
                ? `Auto-Pacing ON (${shortcuts.autoPace})`
                : `Auto-Pacing OFF (${shortcuts.autoPace})`
            }
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-all border cursor-pointer whitespace-nowrap ${
              controller.isAutoPacing
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-[#1F2937] border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap
              className={`w-3 h-3 shrink-0 ${
                controller.isAutoPacing
                  ? 'text-amber-400 fill-amber-400/30'
                  : 'text-slate-500'
              }`}
            />
            <span className="hidden xl:inline">Auto-Pace</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleSpeedCycle}
          title="Playback Speed (Keys: 1-4)"
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#1F2937] text-slate-300 hover:text-white hover:bg-[#374151] text-[11px] font-mono font-semibold transition-colors cursor-pointer tabular-nums whitespace-nowrap"
        >
          <FastForward className="w-3 h-3 text-[#06B6D4]" />
          <span>{speed}x</span>
        </button>

        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            title={`Keyboard Shortcuts (${shortcuts.osName}) — Press ?`}
            aria-label="Open Keyboard Shortcuts"
            className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded-md bg-[#1F2937] text-slate-300 hover:text-[#10B981] hover:bg-[#374151] text-[11px] font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Keyboard className="w-3 h-3 text-[#10B981]" />
            <kbd className="text-[10px] px-1 rounded bg-[#0B0F19] border border-slate-700 text-slate-300">
              ?
            </kbd>
          </button>
        )}
      </div>
    </div>
  );
};
