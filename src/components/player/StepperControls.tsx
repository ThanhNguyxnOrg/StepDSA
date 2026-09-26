import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, RotateCcw, FastForward } from 'lucide-react';
import { PlaybackController, ExecutionFrame } from '../../core/types';

interface StepperControlsProps {
  controller: PlaybackController;
  currentFrame: ExecutionFrame | null;
}

export const StepperControls: React.FC<StepperControlsProps> = ({ controller, currentFrame }) => {
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

  return (
    <div className="bg-[#111827] border-t border-[#1F293D] px-4 py-3 flex flex-col gap-2.5">
      {/* Top row: Timeline Scrubber & Milestone tracker */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono font-medium text-slate-400 w-16 text-right shrink-0">
          <strong className="text-white">{currentStep + 1}</strong> / {totalSteps}
        </span>

        {/* Interactive Scrub Track */}
        <div className="relative flex-1 flex items-center group">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full h-2 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
          />
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
        {/* Left: Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            title="Reset to Start (Key: R)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1F2937] text-slate-300 hover:text-white hover:bg-[#374151] text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
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
        </div>

        {/* Right: Speed Toggle */}
        <div className="flex items-center gap-2">
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
