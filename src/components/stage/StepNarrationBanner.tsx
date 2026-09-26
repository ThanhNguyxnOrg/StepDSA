import React from 'react';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ExecutionFrame } from '../../core/types';
import { VariableWatcher } from './VariableWatcher';

interface StepNarrationBannerProps {
  frame: ExecutionFrame | null;
}

export const StepNarrationBanner: React.FC<StepNarrationBannerProps> = ({ frame }) => {
  if (!frame) return null;

  return (
    <div className="w-full bg-[#111827]/90 border border-[#1F293D] rounded-xl p-3 shadow-md flex flex-col gap-2.5">
      {/* Top Row: Narration & Invariant */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Step Explanation Text on SAME LINE */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="p-1 rounded-md bg-[#10B981]/15 text-[#10B981] shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex items-center gap-2.5 overflow-hidden" title={frame.explanation}>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded-md border border-[#10B981]/30 shrink-0 whitespace-nowrap">
              Step {frame.stepIndex + 1}/{frame.totalSteps}
            </span>
            <span className="text-sm font-semibold text-slate-100 truncate">
              {frame.explanation}
            </span>
          </div>
        </div>

        {/* Invariant Assertion Badge (if provided) */}
        {frame.invariantStatus && (() => {
          const inv = typeof frame.invariantStatus === 'string'
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

