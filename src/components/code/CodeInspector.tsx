import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  Copy,
  Check,
  Terminal,
  ListOrdered,
  BookOpen,
  Clock,
  Database,
  ShieldCheck,
  AlertCircle,
  PanelRightClose,
  ArrowRight,
} from 'lucide-react';
import { AlgorithmModule, ExecutionFrame, SupportedLanguage } from '../../core/types';
import { CallStackPanel } from '../debugger/CallStackPanel';
import { StepTraceLog } from '../workbench/StepTraceLog';
import { resolveActiveCodeLine } from '../../utils/codeLineResolver';
import { deriveStepIntuition, inferIntuitionSubtitle } from '../stage/StepNarrationBanner';

interface CodeInspectorProps {
  codeSnippets: Record<SupportedLanguage, string>;
  activeLine: number;
  frame: ExecutionFrame | null;
  moduleName: string;
  isOpen: boolean;
  onToggle: () => void;
  module?: AlgorithmModule;
  timeline?: ExecutionFrame[];
  currentStep?: number;
  onSeekTo?: (step: number) => void;
  activeTab?: 'code' | 'trace' | 'theory';
  onTabChange?: (tab: 'code' | 'trace' | 'theory') => void;
}

const LANGUAGES: { id: SupportedLanguage; label: string }[] = [
  { id: 'pseudocode', label: 'Pseudo' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'typescript', label: 'TS' },
  { id: 'java', label: 'Java' },
];

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  codeSnippets,
  frame,
  moduleName,
  isOpen,
  onToggle,
  module,
  timeline = [],
  currentStep = 0,
  onSeekTo,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('pseudocode');
  const [copied, setCopied] = useState(false);
  const [internalTab, setInternalTab] = useState<'code' | 'trace' | 'theory'>('code');
  const [showInsightDetails, setShowInsightDetails] = useState(false);
  const activeLineRef = useRef<HTMLDivElement>(null);

  const currentTab = controlledTab ?? internalTab;
  const setTab = (t: 'code' | 'trace' | 'theory') => {
    setInternalTab(t);
    onTabChange?.(t);
  };

  const rawCode = codeSnippets[selectedLang] || codeSnippets.python || '';
  const lines = rawCode.split('\n');

  // Resolve guaranteed in-bounds, non-empty line for whichever language tab is selected
  const resolvedActiveLine = resolveActiveCodeLine(rawCode, frame, timeline);

  // Previous frame for computing live variable deltas (Before -> After)
  const prevFrame = useMemo(() => {
    if (currentStep > 0 && timeline[currentStep - 1]) {
      return timeline[currentStep - 1];
    }
    return null;
  }, [timeline, currentStep]);

  useEffect(() => {
    if (currentTab === 'code' && activeLineRef.current && typeof activeLineRef.current.scrollIntoView === 'function') {
      activeLineRef.current.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }, [resolvedActiveLine, currentTab, selectedLang]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const intuitionNote = frame ? deriveStepIntuition(frame) : null;
  const phaseLabel = frame ? inferIntuitionSubtitle(frame) : 'Ready';
  const condEval = frame?.conditionEval || frame?.state?.conditionEval;
  const activeInvariantText = frame?.invariantNote || module?.theory?.invariant;

  return (
    <aside className="w-full h-[44%] md:h-full md:w-[330px] lg:w-[380px] xl:w-[410px] shrink-0 border-t md:border-t-0 md:border-l border-[#1F293D] bg-[#0B0F19] flex flex-col overflow-hidden z-10 select-none">
      {/* 1. Compact Step Insight Panel: What Happened, Branch Condition & Expandable Invariant */}
      <div className="shrink-0 p-2.5 bg-[#111827] border-b border-[#1F293D]">
        <div className="flex items-center justify-between gap-1.5 mb-1.5 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-[#10B981] tabular-nums shrink-0">
              Step {currentStep + 1}/{Math.max(1, timeline.length)}
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-amber-300 font-semibold truncate">{phaseLabel}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {(intuitionNote || activeInvariantText) && (
              <button
                type="button"
                onClick={() => setShowInsightDetails((prev) => !prev)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  showInsightDetails
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                    : 'bg-[#1F2937] text-slate-300 hover:text-white'
                }`}
                title="Toggle Step Intuition & Loop Invariant"
              >
                {showInsightDetails ? 'Hide Invariant' : 'Invariant ▾'}
              </button>
            )}
            <button
              type="button"
              onClick={onToggle}
              title="Collapse Inspector Dock (Key: D)"
              aria-label="Collapse Inspector Dock"
              className="p-1 rounded hover:bg-[#1F2937] text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Cause & Effect Breakdown */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentStep}-${frame?.explanation?.slice(0, 24)}`}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.12 }}
            className="space-y-1.5 select-text"
          >
            {/* What happened */}
            <p className="text-xs text-white leading-snug font-medium">
              {frame?.explanation || 'Ready to step through the algorithm execution.'}
            </p>

            {/* Branch Guard Evaluation (always visible when present, compact single line) */}
            {condEval && (
              <div className="flex items-center gap-1.5 font-mono text-[11px] pt-0.5">
                <span className="text-slate-400">Condition:</span>
                <code className="text-cyan-300 font-semibold truncate">
                  {condEval.expr || condEval.condition}
                </code>
                {condEval.result !== undefined && (
                  <>
                    <span className="text-slate-500">→</span>
                    <strong
                      className={
                        String(condEval.result) === 'true'
                          ? 'text-[#10B981]'
                          : 'text-rose-400'
                      }
                    >
                      {String(condEval.result).toUpperCase()}
                    </strong>
                  </>
                )}
              </div>
            )}

            {/* Expandable Pedagogical Intuition & Active Loop Invariant */}
            {showInsightDetails && (intuitionNote || activeInvariantText) && (
              <div className="pt-1.5 border-t border-[#1F293D] space-y-1.5 text-[11px]">
                {intuitionNote && (
                  <p className="text-slate-300 leading-snug">
                    <strong className="font-mono text-cyan-400 mr-1">Intuition:</strong>
                    <span>{intuitionNote}</span>
                  </p>
                )}
                {activeInvariantText && (
                  <div className="px-2 py-1 rounded bg-[#0B0F19] border border-[#1F293D] text-[10.5px] font-mono text-slate-300 leading-snug">
                    <span className="text-[#10B981] font-bold mr-1">Invariant:</span>
                    <span>{activeInvariantText}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Dock Tab Switcher (Code & State | Step History | Theory & Proof) */}
      <div className="h-8 px-2 border-b border-[#1F293D] flex items-center justify-between bg-[#0B0F19] shrink-0">
        <div className="flex items-center gap-1 w-full">
          <button
            type="button"
            onClick={() => setTab('code')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'code'
                ? 'bg-[#111827] text-white border border-[#1F293D]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Code & State</span>
          </button>

          {timeline.length > 0 && onSeekTo && (
            <button
              type="button"
              onClick={() => setTab('trace')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'trace'
                  ? 'bg-[#111827] text-white border border-[#1F293D]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Trace ({timeline.length})</span>
            </button>
          )}

          {module && (
            <button
              type="button"
              onClick={() => setTab('theory')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'theory'
                  ? 'bg-[#111827] text-white border border-[#1F293D]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Theory & Proof</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: CODE & LIVE VARIABLE DELTAS / CALL STACK */}
      {currentTab === 'code' && (
        <>
          {/* Language Selector Bar */}
          <div className="px-2.5 py-1 border-b border-[#1F293D] bg-[#111827] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLang(lang.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#10B981] text-[#0B0F19] font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                L{resolvedActiveLine}/{lines.length}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Source Code"
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 hover:text-white bg-[#1F2937] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-[#10B981]" />
                    <span className="text-[#10B981]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Lines Scroll Area: one shared scrollbar scrolls the whole block
              (VSCode-style) with synchronized line highlight (min-h-[140px]). */}
          <div className="flex-1 min-h-[140px] overflow-auto py-1.5 font-mono text-xs leading-relaxed select-text">
            <div className="min-w-max">
              {lines.map((lineText, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = lineNum === resolvedActiveLine;

                return (
                  <div
                    key={lineNum}
                    ref={isHighlighted ? activeLineRef : null}
                    className={`flex items-start px-3 py-0.5 transition-colors relative ${
                      isHighlighted
                        ? 'text-white font-semibold bg-[#10B981]/15 border-l-2 border-[#10B981]'
                        : 'text-slate-400 hover:bg-[#111827]/60'
                    }`}
                  >
                    <span
                      className={`w-7 shrink-0 text-right pr-3 select-none text-[10px] tabular-nums ${
                        isHighlighted ? 'text-[#10B981] font-bold' : 'text-slate-600'
                      }`}
                    >
                      {lineNum}
                    </span>
                    <pre className="whitespace-pre flex-1 font-mono">
                      <code>{lineText || ' '}</code>
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Variable Watch with Before -> After Delta Highlighting & Call Stack */}
          <div className="border-t border-[#1F293D] bg-[#111827] flex flex-col max-h-36 overflow-y-auto shrink-0">
            <CallStackPanel frame={frame} moduleName={moduleName} compact={true} />

            <div className="p-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-[#10B981]" />
                  <span>Live Variables & State Deltas</span>
                </span>
                <span className="text-slate-500">Before → After</span>
              </div>

              {frame && frame.variables && Object.keys(frame.variables).length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(frame.variables).map(([key, value]) => {
                    const formattedVal =
                      typeof value === 'object' ? JSON.stringify(value) : String(value);
                    const prevValRaw = prevFrame?.variables?.[key];
                    const prevFormatted =
                      prevValRaw !== undefined
                        ? typeof prevValRaw === 'object'
                          ? JSON.stringify(prevValRaw)
                          : String(prevValRaw)
                        : null;
                    const hasChanged = prevFormatted !== null && prevFormatted !== formattedVal;

                    return (
                      <div
                        key={key}
                        className={`px-2 py-1 rounded bg-[#0B0F19] border flex items-center justify-between text-[11px] font-mono overflow-hidden tabular-nums ${
                          hasChanged ? 'border-[#10B981]/50' : 'border-[#1F293D]'
                        }`}
                      >
                        <span className="text-slate-400 truncate mr-1">{key}</span>
                        <div className="flex items-center gap-1 truncate">
                          {hasChanged && (
                            <>
                              <span className="text-slate-500 line-through text-[10px] truncate max-w-[44px]">
                                {prevFormatted}
                              </span>
                              <ArrowRight className="w-2.5 h-2.5 text-[#10B981] shrink-0" />
                            </>
                          )}
                          <span
                            className={`font-semibold truncate ${
                              hasChanged ? 'text-[#10B981]' : 'text-amber-300'
                            }`}
                          >
                            {formattedVal}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[11px] font-mono text-slate-500">
                  No local variables tracked in this frame
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: INTERACTIVE STEP TRACE LOG (Time-Travel History) */}
      {currentTab === 'trace' && onSeekTo && (
        <StepTraceLog
          timeline={timeline}
          currentStep={currentStep}
          onSeekTo={onSeekTo}
        />
      )}

      {/* TAB 3: DEEP ALGORITHM THEORY, INVARIANT & COMPLEXITY PROOF */}
      {currentTab === 'theory' && module && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs select-text">
          <div>
            <div className="text-[11px] font-mono text-[#10B981] font-semibold">
              {module.category} · {module.difficulty}
            </div>
            <h3 className="text-base font-bold text-white mt-1">{module.title}</h3>
            <p className="text-slate-300 leading-relaxed mt-1.5">{module.theory.overview}</p>
          </div>

          {/* 1. Core Invariant & Why It Works */}
          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1F293D] space-y-2">
            <div className="flex items-center gap-1.5 text-[#10B981] font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Core Algorithmic Invariant</span>
            </div>
            <p className="text-white leading-relaxed font-mono text-[11px]">
              {module.theory.invariant}
            </p>
            {module.theory.whyItWorks && (
              <p className="text-slate-300 leading-relaxed text-xs pt-1 border-t border-[#1F293D]">
                {module.theory.whyItWorks}
              </p>
            )}
          </div>

          {/* 2. Step-by-Step Execution Mechanics */}
          {module.theory.steps && module.theory.steps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Step-by-Step Mental Model
              </h4>
              <ol className="space-y-2 list-decimal list-inside text-slate-200 leading-relaxed text-xs">
                {module.theory.steps.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 3. Asymptotic Time & Space Complexity */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Time & Space Complexity
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] tabular-nums">
              <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F293D]">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#10B981]" /> Best Time
                </span>
                <div className="text-[#10B981] font-bold mt-1">{module.complexity.timeBest}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F293D]">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#F59E0B]" /> Average Time
                </span>
                <div className="text-amber-400 font-bold mt-1">{module.complexity.timeAverage}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F293D]">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#F43F5E]" /> Worst Time
                </span>
                <div className="text-rose-400 font-bold mt-1">{module.complexity.timeWorst}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F293D]">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Database className="w-3 h-3 text-[#06B6D4]" /> Aux Space
                </span>
                <div className="text-cyan-400 font-bold mt-1">
                  {module.complexity.spaceAuxiliary}
                </div>
              </div>
            </div>
            {module.complexity.worstCaseCondition && (
              <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F293D] text-[11px] font-mono text-slate-300">
                <strong className="text-amber-400">Worst-case trigger:</strong>{' '}
                <span>{module.complexity.worstCaseCondition}</span>
              </div>
            )}
          </div>

          {/* 4. Edge Cases & Pitfalls */}
          {(module.theory.watchOut || (module.theory.pitfalls && module.theory.pitfalls.length > 0)) && (
            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1F293D] space-y-2">
              <div className="flex items-center gap-1.5 text-[#F59E0B] font-semibold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Edge Cases & Implementation Pitfalls</span>
              </div>
              {module.theory.watchOut && (
                <p className="text-slate-300 leading-relaxed text-xs">{module.theory.watchOut}</p>
              )}
              {module.theory.pitfalls && module.theory.pitfalls.length > 0 && (
                <ul className="space-y-1 text-slate-300 list-disc list-inside text-xs">
                  {module.theory.pitfalls.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
