import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface VisualLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_LEGEND = [
  {
    color: 'bg-[#10B981]',
    border: 'border-[#10B981]/50',
    name: 'Emerald / Green',
    meaning: 'Sorted · Settled · Valid · Confirmed',
    example: 'Element in correct sorted position, node fully traversed, or accepted MST edge.',
  },
  {
    color: 'bg-[#F59E0B]',
    border: 'border-[#F59E0B]/50',
    name: 'Amber / Yellow',
    meaning: 'Active · Comparing · Current',
    example: 'Comparing 2 elements, inspecting current node, or testing candidate edge.',
  },
  {
    color: 'bg-[#06B6D4]',
    border: 'border-[#06B6D4]/50',
    name: 'Cyan / Blue',
    meaning: 'Range · Boundary · Queue · Pointer',
    example: 'left/right search boundary, BFS queue frontier, or doubly-linked pointer.',
  },
  {
    color: 'bg-[#8B5CF6]',
    border: 'border-[#8B5CF6]/50',
    name: 'Violet / Purple',
    meaning: 'Pivot · Special Role · Key Element',
    example: 'Partition pivot in Quicksort, root key in BST/AVL, or hash window anchor.',
  },
  {
    color: 'bg-[#F43F5E]',
    border: 'border-[#F43F5E]/50',
    name: 'Rose / Red',
    meaning: 'Swapping · Mismatch · Cycle · Discarded',
    example: 'Two elements being swapped, discarded element, or cycle rejection.',
  },
];

const POINTER_BADGES = [
  { badge: 'LEFT', color: 'bg-[#06B6D4] text-[#0B0F19]', desc: 'Left pointer / lower bound index' },
  { badge: 'RIGHT', color: 'bg-[#10B981] text-[#0B0F19]', desc: 'Right pointer / upper bound index' },
  { badge: 'MID', color: 'bg-[#F59E0B] text-[#0B0F19]', desc: 'Midpoint index (Binary Search / Divide & Conquer)' },
  { badge: 'PIVOT', color: 'bg-[#8B5CF6] text-white', desc: 'Pivot partition element (Quicksort)' },
  { badge: 'I', color: 'bg-[#06B6D4] text-[#0B0F19]', desc: 'Primary loop iterator pointer' },
  { badge: 'J', color: 'bg-[#10B981] text-[#0B0F19]', desc: 'Secondary / comparison pointer' },
];

const KEYBOARD_SHORTCUTS = [
  { keys: 'Space', action: 'Play / Pause automatic execution' },
  { keys: '← →', action: 'Step backward / forward one CPU instruction line' },
  { keys: 'Shift + ← →', action: 'Step backward / forward to next visual milestone' },
  { keys: 'R', action: 'Reset execution to initial state' },
];

export const VisualLegendModal: React.FC<VisualLegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] mx-4 rounded-2xl bg-[#111827] border border-[#1F293D] shadow-2xl shadow-black/40 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-[#1F293D] bg-[#0B0F19]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-amber-400">✦</span> Visual Legend & Interface Guide
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Visual telemetry cheat sheet and UI convention guide for StepDSA
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#1F2937] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Section 1: Color Semantics */}
          <section>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Color Semantics
            </h3>
            <div className="space-y-2">
              {COLOR_LEGEND.map((item) => (
                <div
                  key={item.name}
                  className={`flex items-start gap-3 p-3 rounded-xl bg-[#0B0F19]/60 border ${item.border}`}
                >
                  <div className={`w-4 h-4 rounded-md ${item.color} shrink-0 mt-0.5`} />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">— {item.meaning}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Pointer Badges */}
          <section>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
              Pointer Badges (Array & Graph Indices)
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Badges rendered beneath elements indicate which variable pointers currently reference that index.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POINTER_BADGES.map((item) => (
                <div key={item.badge} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#0B0F19]/60 border border-[#1F293D]">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${item.color} shrink-0`}>
                    {item.badge}
                  </span>
                  <span className="text-[11px] text-slate-300">{item.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: WATCH Expression */}
          <section>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              WATCH Expression (Live Variable Evaluation)
            </h3>
            <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-amber-400 font-mono font-semibold">⌁ WATCH:</span>
                <code className="text-[11px] font-mono text-white bg-[#1F2937] px-2 py-0.5 rounded">
                  left = 0 [38]
                </code>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Indicates variable <code className="text-cyan-300 font-mono">left</code> currently holds index{' '}
                <code className="text-white font-mono">0</code>, and the element at that index contains value{' '}
                <code className="text-amber-300 font-mono">[38]</code>.
                <br />
                Syntax: <code className="text-slate-300 font-mono">variable_name = index [value_at_index]</code>
              </p>
            </div>
          </section>

          {/* Section 4: Step Modes */}
          <section>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              Stepping Modes — Line vs Action
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-[#1F2937] text-xs font-mono font-bold text-white">‹ Line ›</span>
                  <span className="text-[10px] text-slate-500 font-mono">← →</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Discrete CPU instruction line — steps 1 code line per click, identical to F10 in an IDE debugger.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#06B6D4]/5 border border-[#06B6D4]/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-[#06B6D4]/15 text-xs font-mono font-bold text-[#06B6D4] border border-[#06B6D4]/40">Action ⏭</span>
                  <span className="text-[10px] text-slate-500 font-mono">Shift + →</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Visual milestone jump — skips non-mutating lines and jumps directly to state changes, like Shift+F10.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Keyboard Shortcuts */}
          <section>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5 text-slate-400" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-1.5">
              {KEYBOARD_SHORTCUTS.map((item) => (
                <div key={item.keys} className="flex items-center gap-3 p-2 rounded-lg bg-[#0B0F19]/60 border border-[#1F293D]">
                  <kbd className="px-2 py-0.5 rounded bg-[#1F2937] border border-[#374151] text-[11px] font-mono font-bold text-white min-w-[70px] text-center shrink-0">
                    {item.keys}
                  </kbd>
                  <span className="text-[11px] text-slate-300">{item.action}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: Code Inspector panel explanation */}
          <section>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
              Code Inspector & Call Stack
            </h3>
            <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1F293D] space-y-2">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-white">Code Inspector</strong> (right pane) displays synchronized source code across 5 languages 
                (C++, Python, TypeScript, Java, Pseudocode). The active execution line is highlighted in emerald.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-white">CALL STACK</strong> displays recursive frame depth — identical to an IDE debugger window 
                in VS Code. <strong className="text-white">SCOPE VARIABLES</strong> displays real-time values of local variables 
                at the current step.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3 border-t border-[#1F293D] bg-[#0B0F19] flex items-center justify-between">
          <p className="text-[10px] text-slate-500">
            Press <kbd className="px-1 py-0.5 rounded bg-[#1F2937] border border-[#374151] text-[10px] font-mono text-slate-300">Esc</kbd> or click outside to dismiss
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#10B981] text-[#0B0F19] text-xs font-bold hover:bg-[#059669] transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
