import React from 'react';
import { Info, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { ExecutionFrame } from '../../core/types';
import { VariableWatcher } from './VariableWatcher';

export interface StepNarrationBannerProps {
  frame: ExecutionFrame | null;
}

/**
 * Heuristically infers or formats a high-level cognitive subtitle
 * so learners absorb the strategic intent before reading mechanical details.
 */
export function inferIntuitionSubtitle(frame: ExecutionFrame): string {
  if (frame.subtitle) {
    return frame.subtitle;
  }

  if (frame.isMilestone && frame.milestoneTitle) {
    return `⭐ ${frame.milestoneTitle}`;
  }

  const action = frame.action?.toLowerCase() || '';
  const explanation = frame.explanation?.toLowerCase() || '';

  if (action === 'swap' || explanation.includes('swap')) {
    return '🔄 SWAP: Reordering active elements';
  }

  if (action === 'compare' || explanation.includes('compare') || frame.conditionEval) {
    return '🔍 COMPARE: Evaluating candidate elements';
  }

  if (action.includes('lookup') || explanation.includes('hash') || explanation.includes('lookup') || explanation.includes('complement')) {
    return '⚡ HASH LOOKUP: O(1) Complement Check';
  }

  if (explanation.includes('sorted') || action.includes('sort')) {
    return '✅ INVARIANT ACHIEVED: Region finalized';
  }

  if (explanation.includes('pivot') || action.includes('pivot')) {
    return '🎯 PIVOT SELECTION: Partitioning search space';
  }

  if (explanation.includes('base case')) {
    return '🛑 BASE CASE: Halting recursive call';
  }

  if (action) {
    return `▶ ACTION: ${action.toUpperCase()}`;
  }

  return '⚙️ ALGORITHM PROGRESSION';
}

export const StepNarrationBanner: React.FC<StepNarrationBannerProps> = ({ frame }) => {
  if (!frame) return null;

  const subtitle = inferIntuitionSubtitle(frame);

  return (
    <div className="w-full bg-[#111827]/90 border border-[#1F293D] rounded-xl p-3 shadow-md flex flex-col gap-2.5">
      {/* Top Row: Dual-Layer Strategic Subtitle & Invariant */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left: Strategic Subtitle + Step Counter + Technical Explanation */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1 rounded-md bg-[#10B981]/15 text-[#10B981] shrink-0">
            <Info className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-hidden">
            {/* Step Counter Badge */}
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded-md border border-[#10B981]/30 shrink-0 whitespace-nowrap">
              Step {frame.stepIndex + 1}/{frame.totalSteps}
            </span>

            {/* Strategic Intuition Badge */}
            <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-300 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{subtitle}</span>
            </span>

            {/* Granular Code/Step Explanation */}
            <span
              className="text-xs sm:text-sm font-medium text-slate-200 truncate min-w-0"
              title={frame.explanation}
            >
              {frame.explanation}
            </span>
          </div>
        </div>

        {/* Right: Invariant Assertion Badge (if provided) */}
        {frame.invariantStatus && (() => {
          const inv =
            typeof frame.invariantStatus === 'string'
              ? { isValid: true, label: frame.invariantStatus }
              : frame.invariantStatus;

          return (
            <div
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium ${
                inv.isValid
                  ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                  : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
              }`}
            >
              {inv.isValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{inv.label}</span>
            </div>
          );
        })()}
      </div>

      {/* Bottom Row: Live Variable Watcher Chips */}
      <div className="border-t border-[#1F293D]/60 pt-1.5">
        <VariableWatcher frame={frame} />
      </div>
    </div>
  );
};
