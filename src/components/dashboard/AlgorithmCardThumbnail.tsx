import React from 'react';

interface AlgorithmCardThumbnailProps {
  moduleId: string;
  category: string;
}

export const AlgorithmCardThumbnail: React.FC<AlgorithmCardThumbnailProps> = ({ moduleId }) => {
  switch (moduleId) {
    case 'bubble-sort':
      return (
        <div className="w-full h-36 bg-gradient-to-br from-emerald-950/40 via-[#0d1f1d] to-[#0B0F19] rounded-xl flex items-end justify-center gap-2 p-4 border border-emerald-500/20 overflow-hidden relative group-hover:border-emerald-500/50 transition-all">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Adjacent Swapping
          </div>
          {/* Animated Bars */}
          <div className="w-5 bg-emerald-500/30 rounded-t h-12 transition-all duration-500 group-hover:h-8" />
          <div className="w-5 bg-amber-400/80 rounded-t h-20 animate-pulse transition-all duration-500 group-hover:translate-x-7" />
          <div className="w-5 bg-emerald-400 rounded-t h-16 transition-all duration-500 group-hover:-translate-x-7" />
          <div className="w-5 bg-emerald-500/40 rounded-t h-24" />
          <div className="w-5 bg-emerald-500/60 rounded-t h-28" />
        </div>
      );

    case 'quicksort':
      return (
        <div className="w-full h-36 bg-gradient-to-br from-cyan-950/40 via-[#0e212b] to-[#0B0F19] rounded-xl flex items-end justify-center gap-2 p-4 border border-cyan-500/20 overflow-hidden relative group-hover:border-cyan-500/50 transition-all">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Lomuto Partitioning
          </div>
          <div className="w-5 bg-cyan-600/40 rounded-t h-10" />
          <div className="w-5 bg-cyan-500/50 rounded-t h-16" />
          <div className="w-5 bg-amber-400 rounded-t h-26 relative">
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-300">P</span>
          </div>
          <div className="w-5 bg-cyan-400/70 rounded-t h-20" />
          <div className="w-5 bg-emerald-400 rounded-t h-28 shadow-lg shadow-emerald-400/20" />
        </div>
      );

    case 'mergesort':
      return (
        <div className="w-full h-36 bg-gradient-to-br from-blue-950/40 via-[#101b33] to-[#0B0F19] rounded-xl flex flex-col justify-center items-center gap-3 p-4 border border-blue-500/20 overflow-hidden relative group-hover:border-blue-500/50 transition-all">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-blue-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            Divide & Conquer
          </div>
          {/* Top unsorted split */}
          <div className="flex gap-4">
            <div className="flex gap-1 p-1 bg-blue-500/10 border border-blue-500/30 rounded">
              <span className="w-4 h-5 bg-blue-400/40 rounded text-[9px] flex items-center justify-center font-mono">4</span>
              <span className="w-4 h-5 bg-blue-400/60 rounded text-[9px] flex items-center justify-center font-mono">7</span>
            </div>
            <div className="flex gap-1 p-1 bg-cyan-500/10 border border-cyan-500/30 rounded">
              <span className="w-4 h-5 bg-cyan-400/40 rounded text-[9px] flex items-center justify-center font-mono">1</span>
              <span className="w-4 h-5 bg-cyan-400/60 rounded text-[9px] flex items-center justify-center font-mono">3</span>
            </div>
          </div>
          {/* Downward merge arrow */}
          <div className="text-[10px] text-slate-500 font-mono">↓ Merged Result</div>
          {/* Bottom merged sorted */}
          <div className="flex gap-1 p-1 bg-emerald-500/10 border border-emerald-500/40 rounded shadow-sm">
            <span className="w-5 h-6 bg-emerald-400/30 text-emerald-300 rounded text-[10px] font-bold flex items-center justify-center font-mono">1</span>
            <span className="w-5 h-6 bg-emerald-400/40 text-emerald-300 rounded text-[10px] font-bold flex items-center justify-center font-mono">3</span>
            <span className="w-5 h-6 bg-emerald-400/60 text-emerald-300 rounded text-[10px] font-bold flex items-center justify-center font-mono">4</span>
            <span className="w-5 h-6 bg-emerald-400/80 text-emerald-200 rounded text-[10px] font-bold flex items-center justify-center font-mono">7</span>
          </div>
        </div>
      );

    case 'binary-search':
      return (
        <div className="w-full h-36 bg-gradient-to-br from-purple-950/40 via-[#1e1133] to-[#0B0F19] rounded-xl flex flex-col justify-center items-center gap-2 p-4 border border-purple-500/20 overflow-hidden relative group-hover:border-purple-500/50 transition-all">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-purple-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            O(log N) Halving
          </div>
          <div className="flex gap-1.5 mt-3">
            <div className="w-7 h-10 rounded border border-slate-700/50 bg-slate-800/30 opacity-40 flex flex-col items-center justify-center text-[10px] font-mono text-slate-500 line-through">
              2
            </div>
            <div className="w-7 h-10 rounded border border-slate-700/50 bg-slate-800/30 opacity-40 flex flex-col items-center justify-center text-[10px] font-mono text-slate-500 line-through">
              5
            </div>
            <div className="w-8 h-12 rounded border-2 border-purple-400 bg-purple-500/30 flex flex-col items-center justify-center text-xs font-mono font-bold text-white shadow-lg shadow-purple-500/30 scale-110">
              8
              <span className="text-[8px] text-purple-300 -mt-0.5">MID</span>
            </div>
            <div className="w-7 h-10 rounded border border-purple-500/30 bg-purple-900/20 flex flex-col items-center justify-center text-[10px] font-mono text-purple-200">
              12
            </div>
            <div className="w-7 h-10 rounded border border-purple-500/30 bg-purple-900/20 flex flex-col items-center justify-center text-[10px] font-mono text-purple-200">
              19
            </div>
          </div>
          <div className="text-[10px] text-purple-300/80 font-mono mt-1">target = 8 → MATCH</div>
        </div>
      );

    case 'two-pointers':
      return (
        <div className="w-full h-36 bg-gradient-to-br from-amber-950/40 via-[#261b0c] to-[#0B0F19] rounded-xl flex flex-col justify-center items-center gap-2 p-4 border border-amber-500/20 overflow-hidden relative group-hover:border-amber-500/50 transition-all">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Inward Convergence
          </div>
          <div className="flex items-end gap-2 h-16 mt-3">
            <div className="w-5 bg-amber-400 rounded-t h-12 relative flex flex-col items-center shadow-lg shadow-amber-400/20">
              <span className="absolute -top-4 text-[9px] font-bold text-amber-300">L →</span>
            </div>
            <div className="w-4 bg-slate-700/50 rounded-t h-8" />
            <div className="w-4 bg-slate-700/50 rounded-t h-10" />
            <div className="w-4 bg-slate-700/50 rounded-t h-6" />
            <div className="w-5 bg-cyan-400 rounded-t h-14 relative flex flex-col items-center shadow-lg shadow-cyan-400/20">
              <span className="absolute -top-4 text-[9px] font-bold text-cyan-300">← R</span>
            </div>
          </div>
          <div className="text-[10px] text-amber-300/80 font-mono">Max Water Area = 48</div>
        </div>
      );

    case 'sliding-window':
      return (
        <div className="w-full h-36 bg-gradient-to-br from-teal-950/40 via-[#0e2424] to-[#0B0F19] rounded-xl flex flex-col justify-center items-center gap-2 p-4 border border-teal-500/20 overflow-hidden relative group-hover:border-teal-500/50 transition-all">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-teal-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            Constant Size K Window
          </div>
          <div className="flex gap-1.5 mt-3 items-center relative">
            {/* Sliding window bounding border */}
            <div className="absolute -inset-1.5 border-2 border-teal-400 rounded-lg bg-teal-500/10 pointer-events-none transition-all" style={{ left: '32px', width: '80px' }} />
            <div className="w-6 h-8 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono flex items-center justify-center text-slate-400">2</div>
            <div className="w-6 h-8 rounded bg-teal-600/30 border border-teal-400 text-[10px] font-mono flex items-center justify-center font-bold text-white">1</div>
            <div className="w-6 h-8 rounded bg-teal-600/30 border border-teal-400 text-[10px] font-mono flex items-center justify-center font-bold text-white">5</div>
            <div className="w-6 h-8 rounded bg-teal-600/30 border border-teal-400 text-[10px] font-mono flex items-center justify-center font-bold text-white">1</div>
            <div className="w-6 h-8 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono flex items-center justify-center text-slate-400">3</div>
          </div>
          <div className="text-[10px] text-teal-300 font-mono mt-1">sum = [1+5+1] = 7 (k=3)</div>
        </div>
      );

    case 'bst':
      return (
        <div className="w-full h-36 bg-gradient-to-br from-indigo-950/40 via-[#161433] to-[#0B0F19] rounded-xl flex flex-col justify-center items-center p-3 border border-indigo-500/20 overflow-hidden relative group-hover:border-indigo-500/50 transition-all">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            Binary Search Tree
          </div>
          <svg viewBox="0 0 120 70" className="w-32 h-20 mt-3">
            {/* Branches */}
            <line x1="60" y1="14" x2="30" y2="38" stroke="#6366F1" strokeWidth="2" strokeDasharray="2 2" opacity="0.6" />
            <line x1="60" y1="14" x2="90" y2="38" stroke="#6366F1" strokeWidth="2" strokeDasharray="2 2" opacity="0.6" />
            <line x1="30" y1="38" x2="15" y2="58" stroke="#6366F1" strokeWidth="1.5" opacity="0.4" />
            <line x1="90" y1="38" x2="105" y2="58" stroke="#6366F1" strokeWidth="1.5" opacity="0.4" />

            {/* Nodes */}
            <circle cx="60" cy="14" r="8" fill="#4F46E5" stroke="#818CF8" strokeWidth="2" />
            <text x="60" y="17" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle">50</text>

            <circle cx="30" cy="38" r="7" fill="#312E81" stroke="#6366F1" strokeWidth="1.5" />
            <text x="30" y="41" fill="#FFF" fontSize="7" textAnchor="middle">30</text>

            <circle cx="90" cy="38" r="7" fill="#059669" stroke="#34D399" strokeWidth="2" className="animate-pulse" />
            <text x="90" y="41" fill="#FFF" fontSize="7" fontWeight="bold" textAnchor="middle">70</text>

            <circle cx="15" cy="58" r="5" fill="#1E1B4B" stroke="#4338CA" strokeWidth="1" />
            <text x="15" y="60.5" fill="#CBD5E1" fontSize="6" textAnchor="middle">20</text>

            <circle cx="105" cy="58" r="5" fill="#1E1B4B" stroke="#4338CA" strokeWidth="1" />
            <text x="105" y="60.5" fill="#CBD5E1" fontSize="6" textAnchor="middle">85</text>
          </svg>
        </div>
      );

    default:
      return (
        <div className="w-full h-36 bg-slate-900/60 rounded-xl flex items-center justify-center border border-slate-800">
          <span className="text-xs font-mono text-slate-500">Visualization Sandbox</span>
        </div>
      );
  }
};
