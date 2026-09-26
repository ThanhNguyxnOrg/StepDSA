import React from 'react';
import { BookOpen, ShieldCheck, AlertCircle, Clock, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { AlgorithmModule } from '../../core/types';

interface TheoryDrawerProps {
  module: AlgorithmModule;
  isOpen: boolean;
  onToggle: () => void;
}

export const TheoryDrawer: React.FC<TheoryDrawerProps> = ({ module, isOpen, onToggle }) => {
  return (
    <aside
      className={`relative transition-all duration-300 ease-in-out border-r border-[#1F293D] bg-[#0B0F19] flex flex-col ${
        isOpen ? 'w-full md:w-80 lg:w-96' : 'w-12'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggle}
        title={isOpen ? 'Collapse Theory Panel' : 'Expand Theory Panel'}
        className="absolute -right-3.5 top-6 z-20 w-7 h-7 rounded-full bg-[#1F2937] border border-[#1F293D] text-slate-300 hover:text-white flex items-center justify-center hover:bg-[#374151] shadow-md transition-colors"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isOpen ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Header & Badges */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/20">
                {module.category}
              </span>
              <span className="text-[11px] font-medium text-slate-400 bg-[#1F2937] px-2 py-0.5 rounded-full">
                {module.difficulty}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">{module.title}</h2>
          </div>

          {/* Complexity Matrix */}
          <div className="rounded-xl bg-[#111827] border border-[#1F293D] p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-[#1F293D] pb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#06B6D4]" /> Time Complexity
              </span>
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#F59E0B]" /> Space Complexity
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Best:</span>
                  <span className="text-[#10B981] font-semibold">{module.complexity.timeBest}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Avg:</span>
                  <span className="text-white font-semibold">{module.complexity.timeAverage}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Worst:</span>
                  <span className="text-[#F43F5E] font-semibold">{module.complexity.timeWorst}</span>
                </div>
              </div>
              <div className="space-y-1 border-l border-[#1F293D] pl-2.5">
                <div className="flex justify-between text-slate-400">
                  <span>Auxiliary:</span>
                  <span className="text-[#F59E0B] font-semibold">{module.complexity.spaceAuxiliary}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-1 leading-tight">
                  Worst trigger: {module.complexity.worstCaseCondition}
                </div>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#06B6D4]" /> Conceptual Overview
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">{module.theory.overview}</p>
          </div>

          {/* Why it works / Intuition */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> Core Invariant
            </h3>
            <div className="p-3 rounded-lg bg-[#111827] border-l-2 border-[#10B981] text-xs text-slate-200 leading-relaxed font-mono">
              {module.theory.invariant}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">{module.theory.whyItWorks}</p>
          </div>

          {/* Pitfalls & Edge cases */}
          {module.theory.pitfalls.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" /> Gotchas & Edge Cases
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                {module.theory.pitfalls.map((pitfall, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-slate-300">{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center py-6 gap-6 text-slate-400">
          <BookOpen className="w-5 h-5 text-[#10B981]" />
          <div className="writing-vertical text-xs font-mono tracking-widest uppercase rotate-180 text-slate-500">
            THEORY & INVARIANTS
          </div>
        </div>
      )}
    </aside>
  );
};
