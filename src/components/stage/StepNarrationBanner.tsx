import React from 'react';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ExecutionFrame } from '../../core/types';

interface StepNarrationBannerProps {
  frame: ExecutionFrame | null;
}

export const StepNarrationBanner: React.FC<StepNarrationBannerProps> = ({ frame }) => {
  if (!frame) return null;

  return (
    <div className="w-full bg-[#111827]/90 border border-[#1F293D] rounded-xl p-3.5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Step Explanation Text */}
      <div className="flex items-start gap-2.5 flex-1">
        <div className="mt-0.5 p-1 rounded-md bg-[#10B981]/15 text-[#10B981] shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
            Step {frame.stepIndex + 1} of {frame.totalSteps}
          </span>
          <p className="text-sm font-medium text-slate-100 leading-snug">
            {frame.explanation}
          </p>
        </div>
      </div>

      {/* Invariant Assertion Badge (if provided) */}
      {frame.invariantStatus && (
        <div
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium ${
            frame.invariantStatus.isValid
              ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
              : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
          }`}
        >
          {frame.invariantStatus.isValid ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{frame.invariantStatus.label}</span>
        </div>
      )}
    </div>
  );
};
