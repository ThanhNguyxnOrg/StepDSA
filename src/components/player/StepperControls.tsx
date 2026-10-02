import React, { useMemo } from 'react';
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
} from 'lucide-react';
import { PlaybackController, ExecutionFrame } from '../../core/types';

export interface StepperControlsProps {
  controller: PlaybackController;
  currentFrame: ExecutionFrame | null;
  timeline?: ExecutionFrame[];
}

export const StepperControls: React.FC<StepperControlsProps> = ({
  controller,
  currentFrame,
  timeline,
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
    <div className="bg-[#111827] border-t border-[#1F293D] px-4 py-3 flex flex-col gap-2.5 select-none">
      {/* Top row: Timeline Scrubber & Milestone tracker */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono font-medium text-slate-400 w-16 text-right shrink-0">
          <strong className="text-white">{currentStep + 1}</strong> / {totalSteps}
        </span>

        {/* Interactive Scrub Track with Milestone Bookmark Pins */}
        <div className="relative flex-1 flex items-center group">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full h-2 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
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
                title={`Jump to Milestone: ${m.title}`}
                style={{ left: `${pct}%` }}
                className={`absolute top-1/2 -translate-y-1/2 w-2 h-3.5 -ml-1 rounded-[2px] transition-all transform hover:scale-150 z-10 ${
                  isCurrent
                    ? 'bg-amber-400 ring-2 ring-amber-300 shadow-md shadow-amber-400/50'
                    : 'bg-[#06B6D4] hover:bg-cyan-300 opacity-80'
                }`}
              />
            );
          })}
        </div>

        {/* Milestone Badge (if current frame has one) */}
        {currentFrame?.milestoneTitle ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[11px] font-semibold text-[#10B981] shrink-0">
            <span>★ {currentFrame.milestoneTitle}</span>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-500 w-12 text-right shrink-0">
            {Math.round(progressPercent)}%
          </span>
        )}
      </div>

      {/* Bottom row: Stepper Buttons & Speed selector */}
      <div className="flex items-center justify-between">
        {/* Left: Reset & Milestone Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            title="Reset to Start (Key: R)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1F2937] text-slate-300 hover:text-white hover:bg-[#374151] text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Jump to Prev Milestone (if any) */}
          {prevMilestone && (
            <button
              onClick={() => seekTo(prevMilestone.step)}
              title={`Prev Chapter: ${prevMilestone.title}`}
              className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] hover:bg-[#06B6D4]/20 text-[10px] font-mono font-bold transition-all"
            >
              <Bookmark className="w-3 h-3" />
              <span>Prev Milestone</span>
            </button>
          )}
        </div>

        {/* Center: Playback Stepper controls */}
        <div className="flex items-center gap-2">
          {/* Jump to Start */}
          <button
            onClick={() => seekTo(0)}
            disabled={currentStep === 0}
            title="Jump to Start"
            className="p-2 rounded-lg bg-[#1F2937] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#374151] transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Step Back (Line) */}
          <button
            onClick={stepBackward}
            disabled={currentStep === 0}
            title="Step Back Line (← Arrow Left)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1F2937] text-slate-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#374151] active:-translate-y-0.5 transition-all text-xs font-mono font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Line</span>
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={isPlaying ? pause : play}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shadow-lg transition-all active:scale-95 ${
              isPlaying
                ? 'bg-[#F59E0B] text-[#0B0F19] hover:bg-[#d97706] shadow-[#F59E0B]/20'
                : 'bg-[#10B981] text-[#0B0F19] hover:bg-[#059669] shadow-[#10B981]/25'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Step Forward (Line) */}
          <button
            onClick={stepForward}
            disabled={currentStep >= totalSteps - 1}
            title="Step Forward Line (→ Arrow Right)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1F2937] text-slate-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#374151] active:-translate-y-0.5 transition-all text-xs font-mono font-medium"
          >
            <span className="hidden sm:inline">Line</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Next Action Milestone Button */}
          {controller.stepToNextAction && (
            <button
              onClick={controller.stepToNextAction}
              disabled={currentStep >= totalSteps - 1}
              title="Jump to Next Action / State Mutation (Shift + →)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-[#06B6D4] hover:bg-[#06B6D4]/25 hover:text-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-bold transition-all shadow-sm"
            >
              <span>Action</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Jump to Next Milestone (if any) */}
          {nextMilestone && (
            <button
              onClick={() => seekTo(nextMilestone.step)}
              title={`Next Chapter: ${nextMilestone.title}`}
              className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] hover:bg-[#06B6D4]/20 text-[10px] font-mono font-bold transition-all"
            >
              <span>Next Milestone</span>
              <Bookmark className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right: Auto-Pacing & Speed Toggle */}
        <div className="flex items-center gap-2">
          {controller.toggleAutoPacing && (
            <button
              type="button"
              onClick={controller.toggleAutoPacing}
              title={
                controller.isAutoPacing
                  ? 'Auto-Pacing ON (Smart acceleration & decel pauses on swaps)'
                  : 'Auto-Pacing OFF (Constant playback speed)'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border cursor-pointer ${
                controller.isAutoPacing
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                  : 'bg-[#1F2937] border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${controller.isAutoPacing ? 'text-amber-400 fill-amber-400/30' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Auto-Pace</span>
            </button>
          )}

          <button
            onClick={handleSpeedCycle}
            title="Playback Speed"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1F2937] text-slate-300 hover:text-white hover:bg-[#374151] text-xs font-mono font-semibold transition-colors"
          >
            <FastForward className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>{speed}x</span>
          </button>
        </div>
      </div>
    </div>
  );
};
