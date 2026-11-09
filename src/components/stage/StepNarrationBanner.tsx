import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb, HelpCircle, ArrowRight } from 'lucide-react';
import { ExecutionFrame, PredictionCheckpoint } from '../../core/types';
import { VariableWatcher } from './VariableWatcher';

export interface StepNarrationBannerProps {
  frame: ExecutionFrame | null;
  compact?: boolean;
}

/**
 * Formats a clean, un-ornamented phase label (no emojis) so learners
 * immediately identify the algorithmic operation of the current frame.
 */
export function inferIntuitionSubtitle(frame: ExecutionFrame): string {
  if (frame.subtitle) {
    return frame.subtitle;
  }
  if (frame.isMilestone && frame.milestoneTitle) {
    return frame.milestoneTitle;
  }
  const action = frame.action?.toLowerCase() || '';
  const explanation = frame.explanation?.toLowerCase() || '';

  if (action === 'swap' || explanation.includes('swap')) {
    return 'Swap · Reorder elements';
  }
  if (action === 'compare' || explanation.includes('compare') || frame.conditionEval) {
    return 'Compare · Evaluate guard';
  }
  if (
    action.includes('lookup') ||
    explanation.includes('hash') ||
    explanation.includes('lookup') ||
    explanation.includes('complement')
  ) {
    return 'Hash Lookup · O(1) check';
  }
  if (explanation.includes('sorted') || action.includes('sort')) {
    return 'Invariant Verified · Region settled';
  }
  if (explanation.includes('pivot') || action.includes('pivot')) {
    return 'Partition · Pivot boundary';
  }
  if (explanation.includes('base case')) {
    return 'Base Case · Return up stack';
  }
  if (action) {
    return `Operation · ${action}`;
  }
  return 'Step Execution';
}

/**
 * Provides a concise English pedagogical intuition summary for the current frame
 * so learners immediately grasp WHY the algorithm performs this step and which invariant holds.
 */
export function deriveStepIntuition(frame: ExecutionFrame): string {
  const action = frame.action?.toLowerCase() || '';
  const exp = frame.explanation?.toLowerCase() || '';

  if (frame.stepIndex === 0) {
    return 'Initialize base memory state and boundary pointers before entering the main loop invariant.';
  }
  if (action === 'swap' || exp.includes('swap')) {
    return 'Exchange the two out-of-order elements to restore the local ordering invariant.';
  }
  if (exp.includes('pivot') || action.includes('pivot')) {
    return 'Partition around the chosen pivot so elements <= pivot settle on the left and elements > pivot settle on the right.';
  }
  if (exp.includes('mid') && (exp.includes('discard') || exp.includes('left') || exp.includes('right'))) {
    return 'Prune half of the remaining search interval based on the monotonic midpoint comparison.';
  }
  if (action === 'compare' || exp.includes('compar') || frame.conditionEval) {
    const cond = frame.conditionEval;
    const exprText = cond?.expr || cond?.condition;
    if (exprText) {
      return `Evaluate guard [${exprText}] -> ${String(cond?.result).toUpperCase()} to determine the next branch transition.`;
    }
    return 'Compare values at the active pointers to decide whether to advance or mutate state.';
  }
  if (exp.includes('queue') || exp.includes('enqueue') || exp.includes('dequeue')) {
    return 'Update the FIFO frontier queue to explore vertices strictly in order of hop distance from the source.';
  }
  if (exp.includes('relax') || exp.includes('dist')) {
    return 'Triangle-inequality relaxation: test whether routing through the current vertex yields a strictly shorter path.';
  }
  if (exp.includes('insert') || exp.includes('attach')) {
    return 'Link the new node into the data structure while preserving structural parent-child invariants.';
  }
  if (exp.includes('complete') || exp.includes('sorted') || exp.includes('verified')) {
    return 'Global invariant satisfied — the target region or entire structure has reached its final verified state.';
  }
  return 'Execute the active statement and synchronize pointer positions across the memory stage.';
}

/**
 * Interactive prediction checkpoint. It never mutates the timeline; it only
 * asks the learner to commit to an answer before the next frame is revealed.
 */
export const PredictionCheckpointCard: React.FC<{
  checkpoint: PredictionCheckpoint;
  compact?: boolean;
}> = ({ checkpoint, compact = false }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedIndex(null);
  }, [checkpoint.id, checkpoint.question]);

  const answered = selectedIndex !== null;
  const isCorrect = selectedIndex === checkpoint.correctIndex;

  return (
    <div
      data-testid="prediction-checkpoint"
      className={`rounded-lg border border-amber-500/30 bg-amber-500/5 ${
        compact ? 'px-2 py-1.5' : 'px-3 py-2'
      }`}
    >
      <div className="flex items-start gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-amber-200 leading-snug">
            {checkpoint.question}
          </p>
          {checkpoint.hint && !answered && (
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{checkpoint.hint}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {checkpoint.options.map((option, idx) => {
              const isChosen = selectedIndex === idx;
              const isRight = answered && idx === checkpoint.correctIndex;
              const isWrongChoice = answered && isChosen && !isRight;
              return (
                <button
                  key={`${option}-${idx}`}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  disabled={answered}
                  aria-pressed={isChosen}
                  className={`px-2 py-0.5 rounded border text-[10px] font-mono transition-colors ${
                    isRight
                      ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200 font-bold'
                      : isWrongChoice
                      ? 'border-rose-400/60 bg-rose-500/20 text-rose-200'
                      : answered
                      ? 'border-[#1F293D] text-slate-500'
                      : 'border-[#1F293D] text-slate-300 hover:border-amber-400/50 hover:text-amber-200 cursor-pointer'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {answered && (
            <p
              aria-live="polite"
              className={`mt-1.5 text-[10.5px] leading-snug ${
                isCorrect ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              <strong className="font-mono mr-1">{isCorrect ? 'Correct.' : 'Not quite.'}</strong>
              {checkpoint.explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const PedagogyLine: React.FC<{
  label: string;
  text: string;
  tone: 'what' | 'why' | 'next';
}> = ({ label, text, tone }) => {
  const color =
    tone === 'what' ? 'text-slate-200' : tone === 'why' ? 'text-cyan-300' : 'text-emerald-300';
  return (
    <p className="text-[11px] leading-snug">
      <strong className={`font-mono mr-1 ${color}`}>{label}:</strong>
      <span className="text-slate-300">{text}</span>
    </p>
  );
};

export const StepNarrationBanner: React.FC<StepNarrationBannerProps> = ({
  frame,
  compact = false,
}) => {
  const [showIntuition, setShowIntuition] = useState<boolean>(!compact);

  if (!frame) return null;

  const subtitle = inferIntuitionSubtitle(frame);
  const pedagogy = frame.pedagogy;
  const intuitionHint = pedagogy?.why || deriveStepIntuition(frame);
  const guardExpr = frame.conditionEval?.expr || frame.conditionEval?.condition;

  if (compact) {
    return (
      <div className="w-full shrink-0 bg-[#111827]/90 border-b border-[#1F293D] px-3 sm:px-4 py-1.5 flex flex-col gap-1 select-none">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
          {/* Left: Step Counter + Phase Action + Narrative Sentence */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-mono font-bold tabular-nums text-[#10B981] shrink-0">
              Step {frame.stepIndex + 1}/{frame.totalSteps}
            </span>
            <span className="text-slate-600 shrink-0" aria-hidden="true">
              ·
            </span>
            <span className="font-mono font-semibold text-amber-300 shrink-0 hidden sm:inline">
              {subtitle}
            </span>
            <span className="text-slate-600 shrink-0 hidden sm:inline" aria-hidden="true">
              —
            </span>
            <p className="text-slate-100 font-medium truncate" title={frame.explanation}>
              {frame.explanation}
            </p>
          </div>

          {/* Right: Live Guard Pill + Invariant Status + Why Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {guardExpr && (
              <span className="px-2 py-0.5 rounded bg-[#0B0F19] border border-[#1F293D] text-[11px] font-mono flex items-center gap-1">
                <code className="text-slate-300">{guardExpr}</code>
                <span className="text-slate-500">→</span>
                <strong
                  className={
                    frame.conditionEval?.result === true || frame.conditionEval?.result === 'true'
                      ? 'text-[#10B981]'
                      : 'text-rose-400'
                  }
                >
                  {String(frame.conditionEval?.result).toUpperCase()}
                </strong>
              </span>
            )}

            {frame.invariantStatus &&
              (() => {
                const inv =
                  typeof frame.invariantStatus === 'string'
                    ? { isValid: true, label: frame.invariantStatus }
                    : frame.invariantStatus;
                return (
                  <span
                    className={`hidden lg:flex items-center gap-1 text-[11px] font-mono ${
                      inv.isValid ? 'text-[#10B981]' : 'text-[#F59E0B]'
                    }`}
                  >
                    {inv.isValid ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                    )}
                    <span className="max-w-[220px] truncate">{inv.label}</span>
                  </span>
                );
              })()}

            <button
              type="button"
              onClick={() => setShowIntuition(!showIntuition)}
              title="Show or hide why this step happens"
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer whitespace-nowrap ${
                showIntuition
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-[#0B0F19] border-[#1F293D] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3 h-3 text-cyan-400" />
              <span>Why this step</span>
            </button>
          </div>
        </div>

        {showIntuition && (
          <div className="flex flex-col gap-0.5 pl-0.5">
            {pedagogy?.what && <PedagogyLine label="What" text={pedagogy.what} tone="what" />}
            <div className="flex items-start gap-1.5 text-[11px] text-slate-300">
              <strong className="font-mono text-cyan-400 shrink-0">
                {pedagogy?.why ? 'Why' : 'Intuition'}:
              </strong>
              <span className="leading-snug">{intuitionHint}</span>
            </div>
            {pedagogy?.whatNext && (
              <div className="flex items-start gap-1.5 text-[11px]">
                <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-snug">
                  <strong className="font-mono text-emerald-300 mr-1">Next:</strong>
                  {pedagogy.whatNext}
                </span>
              </div>
            )}
          </div>
        )}

        {frame.checkpoint && (
          <PredictionCheckpointCard checkpoint={frame.checkpoint} compact />
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111827] border border-[#1F293D] rounded-xl px-4 py-2.5 flex flex-col gap-1.5">
      {/* Row 1: Unboxed Typographic Metadata & Guard Evaluation */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold tabular-nums text-[#10B981]">
            Step {frame.stepIndex + 1}/{frame.totalSteps}
          </span>
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="font-semibold text-amber-300">{subtitle}</span>

          {guardExpr && (
            <>
              <span className="text-slate-600" aria-hidden="true">
                ·
              </span>
              <span className="text-[11px] font-mono flex items-center gap-1">
                <span className="text-slate-400">Guard:</span>
                <code className="text-slate-200">{guardExpr}</code>
                <span className="text-slate-500">→</span>
                <strong
                  className={
                    frame.conditionEval?.result === true || frame.conditionEval?.result === 'true'
                      ? 'text-[#10B981]'
                      : 'text-rose-400'
                  }
                >
                  {String(frame.conditionEval?.result).toUpperCase()}
                </strong>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {frame.invariantStatus &&
            (() => {
              const inv =
                typeof frame.invariantStatus === 'string'
                  ? { isValid: true, label: frame.invariantStatus }
                  : frame.invariantStatus;
              return (
                <span
                  className={`flex items-center gap-1 text-[11px] font-mono ${
                    inv.isValid ? 'text-[#10B981]' : 'text-[#F59E0B]'
                  }`}
                >
                  {inv.isValid ? (
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                  )}
                  <span>{inv.label}</span>
                </span>
              );
            })()}

          <button
            type="button"
            onClick={() => setShowIntuition(!showIntuition)}
            title="Toggle step intuition note"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer whitespace-nowrap ${
              showIntuition
                ? 'bg-[#0B0F19] border-[#1F293D] text-cyan-300'
                : 'bg-[#0B0F19] border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3 h-3" />
            <span>Why this step</span>
          </button>
        </div>
      </div>

      {/* Row 2: Full Step Explanation + Pedagogical Why-Line */}
      <div className="flex flex-col gap-1">
        <p className="text-xs sm:text-[13px] font-medium text-white leading-relaxed break-words">
          {frame.explanation}
        </p>
        {showIntuition && (
          <div className="space-y-0.5">
            {pedagogy?.what && <PedagogyLine label="What" text={pedagogy.what} tone="what" />}
            <p className="text-[11px] text-slate-300 font-sans leading-snug">
              <strong className="font-mono text-cyan-400 mr-1.5">
                {pedagogy?.why ? 'Why' : 'Intuition'}:
              </strong>
              <span>{intuitionHint}</span>
            </p>
            {pedagogy?.whatNext && (
              <PedagogyLine label="Next" text={pedagogy.whatNext} tone="next" />
            )}
          </div>
        )}

        {frame.checkpoint && <PredictionCheckpointCard checkpoint={frame.checkpoint} />}
      </div>

      {/* Row 3: Live Variable Watcher */}
      <div className="border-t border-[#1F293D] pt-1.5">
        <VariableWatcher frame={frame} />
      </div>
    </div>
  );
};
