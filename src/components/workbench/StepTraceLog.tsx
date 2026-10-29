import React, { useState, useEffect, useRef } from 'react';
import { ExecutionFrame } from '../../core/types';
import { Bookmark, Sparkles, GitCompare, ArrowLeftRight, CheckCircle2, Play } from 'lucide-react';

interface StepTraceLogProps {
  timeline: ExecutionFrame[];
  currentStep: number;
  onSeekTo: (step: number) => void;
}

export const StepTraceLog: React.FC<StepTraceLogProps> = ({
  timeline,
  currentStep,
  onSeekTo,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'milestones'>('all');
  const activeItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeItemRef.current && typeof activeItemRef.current.scrollIntoView === 'function') {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentStep]);

  const filteredFrames = React.useMemo(() => {
    if (filterMode === 'all') return timeline;
    return timeline.filter(
      (f, idx) =>
        f.isMilestone ||
        Boolean(f.milestoneTitle) ||
        f.action === 'swap' ||
        f.soundCue === 'swap' ||
        idx === 0 ||
        idx === timeline.length - 1
    );
  }, [timeline, filterMode]);

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] overflow-hidden">
      {/* Filter Header */}
      <div className="px-3 py-2 border-b border-[#1F293D] bg-[#111827]/70 flex items-center justify-between gap-2 shrink-0">
        <span className="text-[11px] font-mono text-slate-400">
          Click any step to time-travel
        </span>
        <div className="flex items-center gap-1 bg-[#0B0F19] border border-[#1F293D] rounded-lg p-0.5 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-[#10B981]/20 text-[#10B981] font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({timeline.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('milestones')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'milestones'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Key Events
          </button>
        </div>
      </div>

      {/* Scrollable Trace List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredFrames.map((frame) => {
          const idx = frame.stepIndex;
          const isCurrent = idx === currentStep;
          const isPast = idx < currentStep;
          const expLower = (frame.explanation || '').toLowerCase();
          const isSwap =
            frame.action === 'swap' ||
            frame.soundCue === 'swap' ||
            expLower.includes('swap');
          const isMilestone = Boolean(frame.isMilestone || frame.milestoneTitle);

          return (
            <button
              key={idx}
              ref={isCurrent ? activeItemRef : undefined}
              type="button"
              onClick={() => onSeekTo(idx)}
              className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                isCurrent
                  ? 'bg-[#10B981]/15 border-[#10B981]/60 shadow-sm'
                  : isMilestone
                  ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
                  : isPast
                  ? 'bg-[#111827]/60 border-[#1F293D]/60 opacity-85 hover:opacity-100 hover:border-slate-700'
                  : 'bg-[#0E1420] border-[#1F293D]/40 hover:bg-[#111827] hover:border-slate-700'
              }`}
            >
              {/* Step Index Badge */}
              <div
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tabular-nums shrink-0 mt-0.5 ${
                  isCurrent
                    ? 'bg-[#10B981] text-[#0B0F19]'
                    : isMilestone
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-[#1F2937] text-slate-400'
                }`}
              >
                #{idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isCurrent && <Play className="w-2.5 h-2.5 text-[#10B981] fill-current shrink-0" />}
                    {isMilestone && (
                      <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-0.5 truncate">
                        <Bookmark className="w-2.5 h-2.5 fill-amber-400/30 shrink-0" />
                        {frame.milestoneTitle || 'Milestone'}
                      </span>
                    )}
                    {!isMilestone && isSwap && (
                      <span className="text-[10px] font-mono font-bold text-rose-400 flex items-center gap-0.5">
                        <ArrowLeftRight className="w-2.5 h-2.5 shrink-0" />
                        Swap
                      </span>
                    )}
                    {!isMilestone && !isSwap && frame.conditionEval && (
                      <span className="text-[10px] font-mono font-semibold text-cyan-400 flex items-center gap-0.5 truncate">
                        <GitCompare className="w-2.5 h-2.5 shrink-0" />
                        {frame.conditionEval.expr}
                      </span>
                    )}
                    {!isMilestone && !isSwap && !frame.conditionEval && idx === timeline.length - 1 && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                        Complete
                      </span>
                    )}
                    {!isMilestone && !isSwap && !frame.conditionEval && idx < timeline.length - 1 && (
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                        Step
                      </span>
                    )}
                  </div>

                  {frame.codeLine > 0 && (
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums shrink-0">
                      L{frame.codeLine}
                    </span>
                  )}
                </div>

                <p
                  className={`text-[11px] leading-snug line-clamp-2 ${
                    isCurrent ? 'text-white font-medium' : 'text-slate-300'
                  }`}
                >
                  {frame.explanation}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
