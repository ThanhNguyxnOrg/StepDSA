import React from 'react';
import { BookOpen, ShieldCheck, AlertCircle, Clock, Database, X } from 'lucide-react';
import { AlgorithmModule } from '../../core/types';

interface TheoryDrawerProps {
  module: AlgorithmModule;
  isOpen: boolean;
  onToggle: () => void;
}

export const TheoryDrawer: React.FC<TheoryDrawerProps> = ({ module, isOpen, onToggle }) => {
  if (!isOpen) return null;

  return (
    <aside className="w-88 shrink-0 border-r border-[#1F293D] bg-[#0B0F19] flex flex-col h-full overflow-hidden z-10 transition-all">
      {/* Drawer Header */}
      <div className="h-11 px-4 border-b border-[#1F293D] flex items-center justify-between bg-[#111827]/80 shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-200">
          <BookOpen className="w-4 h-4 text-[#10B981]" />
          <span>THEORY & INVARIANT</span>
        </div>
        <button
          onClick={onToggle}
          title="Close Theory Panel"
          className="p-1 rounded hover:bg-[#1F2937] text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Title & Badges */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
              {module.category}
            </span>
            <span className="text-[10px] font-medium text-slate-400 bg-[#1F2937] px-2 py-0.5 rounded">
              {module.difficulty}
            </span>
          </div>
          <h2 className="text-base font-bold text-white leading-snug">{module.title}</h2>
        </div>

        {/* Complexity Grid */}
        <div className="rounded-xl bg-[#111827] border border-[#1F293D] p-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-semibold mb-1">
                <Clock className="w-3 h-3 text-[#06B6D4]" />
                <span>Time Complexity</span>
              </div>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Best:</span>
                  <span className="text-[#10B981] font-bold">{module.complexity.timeBest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg:</span>
                  <span className="text-white font-bold">{module.complexity.timeAverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Worst:</span>
                  <span className="text-[#F43F5E] font-bold">{module.complexity.timeWorst}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-semibold mb-1">
                <Database className="w-3 h-3 text-[#F59E0B]" />
                <span>Space Complexity</span>
              </div>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Auxiliary:</span>
                  <span className="text-[#F59E0B] font-bold">{module.complexity.spaceAuxiliary}</span>
                </div>
              </div>
            </div>
          </div>

          {module.complexity.worstCaseCondition && (
            <div className="pt-2 border-t border-[#1F293D] text-[10px] font-mono text-slate-400">
              <span className="text-amber-300 font-semibold">Worst trigger:</span>{' '}
              <span>{module.complexity.worstCaseCondition}</span>
            </div>
          )}
        </div>

        {/* Conceptual Overview */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#06B6D4]" /> Conceptual Overview
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{module.theory.overview}</p>
        </div>

        {/* Core Invariant */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> Core Invariant
          </h3>
          <div className="rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 p-3">
            <p className="text-xs font-mono text-[#10B981] font-semibold leading-relaxed">
              {module.theory.invariant}
            </p>
          </div>
          {module.theory.whyItWorks && (
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{module.theory.whyItWorks}</p>
          )}
        </div>

        {/* Pitfalls & Gotchas */}
        {module.theory.pitfalls && module.theory.pitfalls.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" /> Gotchas & Edge Cases
            </h3>
            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
              {module.theory.pitfalls.map((pitfall, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span>{pitfall}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};
