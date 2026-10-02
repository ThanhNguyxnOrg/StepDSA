import React from 'react';

/**
 * Returns a bespoke, dynamically animated thumbnail for advanced and specialized algorithm modules.
 * If the module is handled, returns a JSX.Element; otherwise returns null.
 */
export function renderExtraThumbnail(moduleId: string, _category?: string): React.JSX.Element | null {
  switch (moduleId) {
    /* ════════════════════════════════════════════════════════════════
       1. ARRAYS & ADVANCED POINTER STRUCTURES
       ════════════════════════════════════════════════════════════════ */
    case 'sparse-table':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Range Minimum Query O(1)</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="grid grid-cols-4 gap-1 p-2 bg-black/30 rounded-lg border border-teal-400/40 shadow-inner">
              <div className="w-6 h-6 rounded bg-teal-900/80 text-teal-300 flex items-center justify-center text-[10px]">2⁰</div>
              <div className="w-6 h-6 rounded bg-teal-400 text-teal-950 font-extrabold flex items-center justify-center text-[10px] shadow animate-pulse">2¹</div>
              <div className="w-6 h-6 rounded bg-teal-900/80 text-teal-300 flex items-center justify-center text-[10px]">2²</div>
              <div className="w-6 h-6 rounded bg-amber-400 text-teal-950 font-extrabold flex items-center justify-center text-[10px] shadow">MIN</div>
            </div>
            <div className="text-[10px] text-teal-200 flex items-center gap-1">
              <span className="text-amber-300 font-bold">RMQ[L, R]</span>
              <span>= min(M[L][k], M[R-2^k+1][k])</span>
            </div>
          </div>
        </div>
      );

    case 'dynamic-array':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#1E40AF] to-[#1D4ED8] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-100 uppercase tracking-wider">
            <span>Amortized Growth 2×</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-1 items-center">
              <span className="text-[10px] text-blue-200">Cap 4:</span>
              <div className="flex gap-0.5 p-1 bg-black/30 rounded border border-blue-400/30">
                <div className="w-4 h-5 rounded-sm bg-blue-400" />
                <div className="w-4 h-5 rounded-sm bg-blue-400" />
                <div className="w-4 h-5 rounded-sm bg-blue-400" />
                <div className="w-4 h-5 rounded-sm bg-rose-400 animate-pulse" />
              </div>
            </div>
            <span className="text-cyan-300 text-[10px] font-bold">↓ Reallocate 2× to Cap 8</span>
            <div className="flex gap-0.5 p-1 bg-black/40 rounded border border-cyan-400/50">
              <div className="w-3.5 h-4 rounded-sm bg-blue-300" />
              <div className="w-3.5 h-4 rounded-sm bg-blue-300" />
              <div className="w-3.5 h-4 rounded-sm bg-blue-300" />
              <div className="w-3.5 h-4 rounded-sm bg-blue-300" />
              <div className="w-3.5 h-4 rounded-sm bg-emerald-400 animate-pulse" />
              <div className="w-3.5 h-4 rounded-sm bg-white/20" />
              <div className="w-3.5 h-4 rounded-sm bg-white/20" />
              <div className="w-3.5 h-4 rounded-sm bg-white/20" />
            </div>
          </div>
        </div>
      );

    case 'dynamic-rehashing':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#854D0E] to-[#713F12] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Load Factor Rehash</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24 font-mono text-xs">
            <div className="flex flex-col gap-1 p-1.5 bg-black/40 rounded border border-amber-500/40">
              <div className="px-1.5 py-0.5 rounded bg-rose-500/80 text-white text-[9px] font-bold">α = 0.85</div>
              <div className="text-[9px] text-amber-200">Table: 4</div>
            </div>
            <span className="text-amber-300 text-sm animate-pulse">➔</span>
            <div className="flex flex-col gap-1 p-1.5 bg-black/40 rounded border border-emerald-500/40">
              <div className="px-1.5 py-0.5 rounded bg-emerald-500 text-emerald-950 text-[9px] font-bold">α = 0.42</div>
              <div className="text-[9px] text-emerald-200">Table: 8</div>
            </div>
          </div>
        </div>
      );

    case 'hash-table-chaining':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Bucket Chaining</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex items-center gap-1">
              <div className="w-7 h-5 rounded bg-black/40 border border-teal-300 flex items-center justify-center text-[10px] text-teal-200">[0]</div>
              <span className="text-teal-300">→</span>
              <div className="px-1.5 py-0.5 rounded bg-teal-400 text-teal-950 font-bold text-[9px]">K1</div>
              <span className="text-teal-300">→</span>
              <div className="px-1.5 py-0.5 rounded bg-amber-300 text-teal-950 font-bold text-[9px] animate-pulse">K2</div>
            </div>
            <div className="flex items-center gap-1 opacity-70">
              <div className="w-7 h-5 rounded bg-black/40 border border-teal-300 flex items-center justify-center text-[10px] text-teal-200">[1]</div>
              <span className="text-teal-300">→</span>
              <div className="px-1.5 py-0.5 rounded bg-teal-200 text-teal-950 font-bold text-[9px]">K3</div>
            </div>
          </div>
        </div>
      );

    case 'hash-table-open-addressing':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#312E81] to-[#1E1B4B] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Linear Probing H(k)+i</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex gap-1 p-2 bg-black/40 rounded-lg border border-indigo-400/40">
              <div className="w-6 h-7 rounded bg-indigo-800 text-indigo-200 flex items-center justify-center text-[10px]">Occ</div>
              <div className="w-6 h-7 rounded bg-rose-500/70 text-white flex items-center justify-center text-[10px] animate-pulse">Col</div>
              <div className="w-6 h-7 rounded bg-emerald-400 text-indigo-950 font-bold flex items-center justify-center text-[10px] shadow">Slot</div>
            </div>
          </div>
        </div>
      );

    case 'merge-intervals':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#1E3A8A] to-[#172554] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-100 uppercase tracking-wider">
            <span>Interval Overlap Sweep</span>
            <span className="w-2 h-2 rounded-full bg-blue-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-2">
              <div className="w-16 h-3 rounded bg-blue-400 text-[8px] flex items-center justify-center text-blue-950 font-bold">[1, 4]</div>
              <div className="w-16 h-3 rounded bg-amber-300 text-[8px] flex items-center justify-center text-blue-950 font-bold animate-pulse">[3, 6]</div>
            </div>
            <span className="text-cyan-300 text-[10px]">↓ Merged Range</span>
            <div className="w-28 h-4 rounded bg-emerald-400 text-[9px] flex items-center justify-center text-emerald-950 font-extrabold shadow">[1, 6]</div>
          </div>
        </div>
      );

    case 'count-inversions':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Divide & Inversion Count</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-white text-teal-950 font-bold text-[10px]">[8, 4]</span>
              <span className="text-amber-300 font-bold text-sm">✕</span>
              <span className="px-2 py-0.5 rounded bg-amber-300 text-teal-950 font-bold text-[10px]">[2, 1]</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-black/40 border border-teal-400/40 text-[10px] text-teal-200">
              Cross Inversions: <span className="text-emerald-300 font-bold">+4</span>
            </div>
          </div>
        </div>
      );

    /* ════════════════════════════════════════════════════════════════
       2. SEARCHING & STRING ALGORITHMS
       ════════════════════════════════════════════════════════════════ */
    case 'suffix-array-kasai':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0369A1] to-[#075985] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Suffix Array & LCP</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex gap-1 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-sky-400 text-sky-950 font-bold">SA: [5, 3, 1, 0, 4, 2]</span>
            </div>
            <div className="flex items-end gap-1 h-10 p-1 bg-black/30 rounded border border-sky-400/30">
              <div className="w-4 bg-white/60 h-4 rounded-t" />
              <div className="w-4 bg-sky-300 h-7 rounded-t animate-pulse" />
              <div className="w-4 bg-emerald-400 h-9 rounded-t shadow" />
              <div className="w-4 bg-sky-300 h-5 rounded-t" />
              <div className="w-4 bg-white/60 h-3 rounded-t" />
            </div>
            <span className="text-[9px] text-sky-200 font-bold">Kasai LCP Height Array</span>
          </div>
        </div>
      );

    case 'binary-search-answer':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Answer Space Bisect</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-1 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/80 text-white">F</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/80 text-white">F</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/80 text-white">F</span>
              <div className="w-0.5 h-6 bg-amber-400 animate-pulse" />
              <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-emerald-950 font-bold shadow">T</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-400/80 text-emerald-950 font-bold">T</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-400/80 text-emerald-950 font-bold">T</span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold">First Valid Answer Point</span>
          </div>
        </div>
      );

    case 'exponential-search':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Doubling Bound Jump</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-white text-sky-950 text-[9px] font-bold">i=1</span>
              <span className="text-sky-300 text-[10px]">↷</span>
              <span className="px-1.5 py-0.5 rounded bg-white text-sky-950 text-[9px] font-bold">i=2</span>
              <span className="text-sky-300 text-[10px]">↷</span>
              <span className="px-1.5 py-0.5 rounded bg-white text-sky-950 text-[9px] font-bold">i=4</span>
              <span className="text-sky-300 text-[10px]">↷</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-300 text-sky-950 text-[9px] font-extrabold animate-pulse">i=8</span>
            </div>
            <span className="text-[10px] text-sky-200">Bounded to [4, 8] Range</span>
          </div>
        </div>
      );

    case 'interpolation-search':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Slope Probing O(log log N)</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-36 h-1.5 bg-sky-900 rounded-full relative">
              <div className="absolute left-1/4 -top-1 w-3 h-3 rounded-full bg-amber-300 animate-pulse shadow ring-2 ring-white" />
            </div>
            <span className="text-[10px] text-sky-200">pos = lo + [(x-A[lo])/(A[hi]-A[lo])]*(hi-lo)</span>
          </div>
        </div>
      );

    case 'jump-search':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0369A1] to-[#075985] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Block Hopping √N</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex gap-1 items-center">
              <div className="w-7 h-7 rounded bg-white text-sky-950 font-bold flex items-center justify-center text-[10px]">0</div>
              <span className="text-sky-300 font-bold">+√N</span>
              <div className="w-7 h-7 rounded bg-white text-sky-950 font-bold flex items-center justify-center text-[10px]">4</div>
              <span className="text-sky-300 font-bold">+√N</span>
              <div className="w-7 h-7 rounded bg-amber-300 text-sky-950 font-extrabold flex items-center justify-center text-[10px] animate-pulse">8</div>
            </div>
          </div>
        </div>
      );

    case 'ternary-search':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Tri-Section O(log3 N)</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <span className="text-[9px] text-sky-200">L</span>
            <div className="px-2 py-0.5 rounded bg-cyan-400 text-sky-950 font-bold text-[9px] shadow animate-pulse">m1</div>
            <span className="text-sky-300 text-[10px]">|</span>
            <div className="px-2 py-0.5 rounded bg-amber-300 text-sky-950 font-bold text-[9px] shadow animate-pulse">m2</div>
            <span className="text-[9px] text-sky-200">R</span>
          </div>
        </div>
      );

    case 'aho-corasick':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Dictionary Trie Automaton</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-white text-cyan-950 font-bold text-[10px] flex items-center justify-center">Root</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-400 text-cyan-950 font-bold text-[9px] flex items-center justify-center">h</div>
              <span className="text-amber-300 text-[10px] font-bold animate-pulse">⤾ fail</span>
              <div className="w-5 h-5 rounded-full bg-amber-300 text-cyan-950 font-bold text-[9px] flex items-center justify-center shadow">e</div>
            </div>
          </div>
        </div>
      );

    case 'boyer-moore':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Bad Character Heuristic</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex gap-1 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-black/30 border border-cyan-400/40 text-cyan-200">E X A M P L E</span>
            </div>
            <span className="text-amber-300 text-[10px] font-bold">← Scan Right-to-Left</span>
            <div className="px-2 py-0.5 rounded bg-amber-300 text-cyan-950 font-bold text-[10px] shadow">
              Shift +4 positions
            </div>
          </div>
        </div>
      );

    case 'manachers-algorithm':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Linear Palindrome O(N)</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-1 text-[10px]">
              <span className="text-indigo-300">#</span>
              <span className="text-white font-bold">a</span>
              <span className="text-indigo-300">#</span>
              <span className="text-amber-300 font-extrabold px-1 rounded bg-black/30">b</span>
              <span className="text-indigo-300">#</span>
              <span className="text-white font-bold">a</span>
              <span className="text-indigo-300">#</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-emerald-400 text-indigo-950 font-bold text-[9px] shadow animate-pulse">
              Radius P[i] = 3
            </div>
          </div>
        </div>
      );

    case 'suffix-automaton':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#581C87] to-[#3B0764] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>Minimal DAWG Automaton</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-6 h-6 rounded-full bg-white text-purple-950 font-bold text-[10px] flex items-center justify-center">S0</div>
            <span className="text-purple-300">→</span>
            <div className="w-6 h-6 rounded-full bg-purple-300 text-purple-950 font-bold text-[10px] flex items-center justify-center">S1</div>
            <span className="text-purple-300">→</span>
            <div className="w-6 h-6 rounded-full bg-amber-400 text-purple-950 font-bold text-[10px] flex items-center justify-center shadow animate-pulse">S2</div>
          </div>
        </div>
      );

    case 'naive-string-matching':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Slide & Compare O(NM)</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-1 text-[10px] text-white">
              <span>A</span><span>B</span><span>C</span><span>A</span><span>B</span><span>C</span>
            </div>
            <div className="flex gap-1 text-[10px] text-amber-300 ml-4 font-bold border-b-2 border-amber-300 pb-0.5">
              <span>A</span><span>B</span><span>C</span>
            </div>
          </div>
        </div>
      );

    /* ════════════════════════════════════════════════════════════════
       3. TREES & BALANCED SEARCH TREES
       ════════════════════════════════════════════════════════════════ */
    case 'tree-map':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Red-Black Key-Value Map</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="px-2 py-0.5 rounded bg-black/60 border border-white/40 text-white font-bold text-[10px] shadow">
              [K: 15 | V: "Alpha"]
            </div>
            <div className="w-24 h-1.5 border-t-2 border-l-2 border-r-2 border-indigo-300/60 rounded-t" />
            <div className="flex justify-between w-32">
              <div className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[9px] shadow animate-pulse">
                10: Red
              </div>
              <div className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/20 text-slate-200 font-bold text-[9px] shadow">
                25: Black
              </div>
            </div>
          </div>
        </div>
      );

    case 'red-black-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Color Balance Rotations</span>
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="w-6 h-6 rounded-full bg-black border-2 border-slate-400 text-white font-bold text-[10px] flex items-center justify-center shadow">B</div>
            <div className="w-20 h-1.5 border-t-2 border-l-2 border-r-2 border-indigo-300/60 rounded-t" />
            <div className="flex justify-between w-24">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow animate-pulse">R</div>
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow animate-pulse">R</div>
            </div>
          </div>
        </div>
      );

    case 'b-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Order-M Disk Indexing</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-1 p-1 bg-black/40 rounded border border-indigo-400/40">
              <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[9px] font-bold">10</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-indigo-950 text-[9px] font-extrabold">25</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[9px] font-bold">40</span>
            </div>
            <div className="flex justify-between w-32 text-[8px] text-indigo-200">
              <span>{'<10'}</span>
              <span>{'10-25'}</span>
              <span>{'25-40'}</span>
              <span>{'>40'}</span>
            </div>
          </div>
        </div>
      );

    case 'two-three-tree':
    case 'two-three-four-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>2-3 Symmetric Split</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="px-2 py-0.5 rounded bg-amber-300 text-indigo-950 font-bold text-[10px] shadow">
              [ 15 | 30 ]
            </div>
            <div className="w-24 h-1.5 border-t-2 border-l-2 border-r-2 border-indigo-300/60 rounded-t" />
            <div className="flex justify-between w-32 text-[8px]">
              <div className="px-1 py-0.5 rounded bg-white text-indigo-950 font-bold">[ 5 ]</div>
              <div className="px-1 py-0.5 rounded bg-white text-indigo-950 font-bold">[ 20 ]</div>
              <div className="px-1 py-0.5 rounded bg-white text-indigo-950 font-bold">[ 45 ]</div>
            </div>
          </div>
        </div>
      );

    case 'segment-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Range Sum & Point Update</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="px-2 py-0.5 rounded bg-emerald-400 text-indigo-950 font-bold text-[10px] shadow">
              [0, 7] = ∑36
            </div>
            <div className="w-20 h-1.5 border-t-2 border-l-2 border-r-2 border-indigo-300/60 rounded-t" />
            <div className="flex justify-between w-28 text-[8px]">
              <div className="px-1.5 py-0.5 rounded bg-white/90 text-indigo-950 font-bold">[0, 3]</div>
              <div className="px-1.5 py-0.5 rounded bg-amber-300 text-indigo-950 font-bold shadow animate-pulse">[4, 7]</div>
            </div>
          </div>
        </div>
      );

    case 'fenwick-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Binary Indexed Tree</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-1 text-[9px]">
              <span className="px-1.5 py-0.5 rounded bg-white text-indigo-950 font-bold">T[1]</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-400 text-white font-bold">T[2]</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-300 text-indigo-950 font-extrabold shadow animate-pulse">T[4]</span>
            </div>
            <span className="text-[10px] text-cyan-300 font-bold">idx += idx & (-idx)</span>
          </div>
        </div>
      );

    case 'interval-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>1D Range Overlap Augment</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="px-2 py-0.5 rounded bg-white text-indigo-950 font-bold text-[9px] shadow">
              [15, 20] (max: 30)
            </div>
            <div className="w-20 h-1.5 border-t-2 border-l-2 border-r-2 border-indigo-300/60 rounded-t" />
            <div className="flex justify-between w-28 text-[8px]">
              <div className="px-1 py-0.5 rounded bg-indigo-300 text-indigo-950 font-bold">[10, 30]</div>
              <div className="px-1 py-0.5 rounded bg-amber-300 text-indigo-950 font-bold shadow animate-pulse">[17, 19]</div>
            </div>
          </div>
        </div>
      );

    case 'kd-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>K-D Spatial Point Cut</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-16 h-16 bg-black/40 border border-indigo-300 relative rounded">
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-rose-400" />
              <div className="absolute left-1/2 right-0 top-1/2 h-0.5 bg-cyan-400" />
              <div className="w-2 h-2 rounded-full bg-amber-300 absolute top-2 left-2 animate-pulse" />
            </div>
            <div className="text-[9px] text-indigo-200">
              <div>Split X</div>
              <div>Split Y</div>
            </div>
          </div>
        </div>
      );

    case 'splay-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Zig-Zag Self Adjust</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="text-[10px] text-indigo-200">Queried Leaf</div>
            <span className="text-amber-300 font-bold text-base animate-pulse">⤴</span>
            <div className="px-2 py-1 rounded bg-amber-300 text-indigo-950 font-bold text-[10px] shadow">
              Rotated to Root!
            </div>
          </div>
        </div>
      );

    case 'treap':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Cartesian BST + Heap</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="px-2 py-0.5 rounded bg-emerald-400 text-indigo-950 font-bold text-[9px] shadow">
              Key: 10, Prio: 99
            </div>
            <div className="w-16 h-1.5 border-t-2 border-l-2 border-r-2 border-indigo-300/60 rounded-t" />
            <div className="flex justify-between w-24 text-[8px]">
              <div className="px-1 py-0.5 rounded bg-white text-indigo-950 font-bold">K: 5, P: 80</div>
              <div className="px-1 py-0.5 rounded bg-white text-indigo-950 font-bold">K: 15, P: 72</div>
            </div>
          </div>
        </div>
      );

    case 'radix-tree':
    case 'ternary-search-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Compressed Trie Edges</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="px-2 py-1 rounded bg-white text-indigo-950 font-bold text-[10px]">"test"</div>
            <span className="text-cyan-300">→</span>
            <div className="px-2 py-1 rounded bg-amber-300 text-indigo-950 font-bold text-[10px] animate-pulse">"ing"</div>
          </div>
        </div>
      );

    case 'skip-list':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Express Lanes O(log N)</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1 h-24 font-mono text-xs">
            <div className="flex gap-4 items-center">
              <span className="text-[8px] text-cyan-300">L3:</span>
              <div className="w-3 h-3 rounded bg-amber-300" />
              <div className="w-12 h-0.5 bg-amber-300 animate-pulse" />
              <div className="w-3 h-3 rounded bg-amber-300" />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-[8px] text-indigo-200">L1:</span>
              <div className="w-2.5 h-2.5 rounded bg-white" />
              <div className="w-4 h-0.5 bg-white/60" />
              <div className="w-2.5 h-2.5 rounded bg-white" />
              <div className="w-4 h-0.5 bg-white/60" />
              <div className="w-2.5 h-2.5 rounded bg-white" />
            </div>
          </div>
        </div>
      );

    case 'huffman-coding':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Min-Heap Prefix Tree</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="px-2 py-0.5 rounded bg-white text-indigo-950 font-bold text-[9px] shadow">Freq: 100</div>
            <div className="w-20 h-1.5 border-t-2 border-l-2 border-r-2 border-indigo-300/60 rounded-t" />
            <div className="flex justify-between w-28 text-[8px]">
              <div className="px-1.5 py-0.5 rounded bg-emerald-400 text-indigo-950 font-bold">'A' (0)</div>
              <div className="px-1.5 py-0.5 rounded bg-amber-300 text-indigo-950 font-bold shadow animate-pulse">'B' (1)</div>
            </div>
          </div>
        </div>
      );

    case 'level-order-traversal':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>BFS Level Waves</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="px-2 py-0.5 rounded bg-amber-300 text-indigo-950 font-bold text-[9px] shadow">Level 0: [1]</div>
            <div className="px-2 py-0.5 rounded bg-cyan-300 text-indigo-950 font-bold text-[9px] shadow animate-pulse">Level 1: [2, 3]</div>
            <div className="px-2 py-0.5 rounded bg-white text-indigo-950 font-bold text-[9px]">Level 2: [4, 5, 6]</div>
          </div>
        </div>
      );

    case 'bst-delete':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Inorder Successor Re-link</span>
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center line-through text-[10px]">Del</div>
            <span className="text-amber-300 text-sm animate-pulse">⤾</span>
            <div className="px-2 py-1 rounded bg-emerald-400 text-indigo-950 font-bold text-[10px] shadow">
              Successor
            </div>
          </div>
        </div>
      );

    /* ════════════════════════════════════════════════════════════════
       4. GRAPHS & FLOWS
       ════════════════════════════════════════════════════════════════ */
    case 'hamiltonian-path':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>NP-Complete Path Visit</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-cyan-950 font-bold text-[9px] flex items-center justify-center shadow animate-pulse">V1</div>
            <span className="text-amber-300 font-bold">→</span>
            <div className="w-6 h-6 rounded-full bg-amber-400 text-cyan-950 font-bold text-[9px] flex items-center justify-center shadow animate-pulse">V2</div>
            <span className="text-amber-300 font-bold">→</span>
            <div className="w-6 h-6 rounded-full bg-amber-400 text-cyan-950 font-bold text-[9px] flex items-center justify-center shadow animate-pulse">V3</div>
            <span className="text-amber-300 font-bold">→</span>
            <div className="w-6 h-6 rounded-full bg-amber-400 text-cyan-950 font-bold text-[9px] flex items-center justify-center shadow animate-pulse">V4</div>
          </div>
        </div>
      );

    case 'topological-sort-dfs':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>DFS Finish-Time Ordering</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-6 h-6 rounded-full bg-white text-cyan-950 font-bold text-[10px] flex items-center justify-center">0</div>
            <span className="text-cyan-300">→</span>
            <div className="w-6 h-6 rounded-full bg-cyan-300 text-cyan-950 font-bold text-[10px] flex items-center justify-center">1</div>
            <span className="text-cyan-300">→</span>
            <div className="w-6 h-6 rounded-full bg-emerald-400 text-cyan-950 font-bold text-[10px] flex items-center justify-center shadow animate-pulse">2</div>
          </div>
        </div>
      );

    case 'tarjan-scc':
    case 'kosaraju-scc':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Strongly Connected Cycle</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="p-2 rounded-xl bg-black/40 border border-cyan-400/50 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-cyan-400 text-cyan-950 font-bold text-[9px] flex items-center justify-center shadow">A</div>
              <span className="text-cyan-300 text-xs animate-pulse">⇄</span>
              <div className="w-5 h-5 rounded-full bg-amber-300 text-cyan-950 font-bold text-[9px] flex items-center justify-center shadow">B</div>
            </div>
            <span className="text-[10px] text-cyan-200 font-bold">SCC #1</span>
          </div>
        </div>
      );

    case 'bipartite-check':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>2-Coloring BFS Check</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24 font-mono text-xs">
            <div className="flex flex-col gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-400 text-cyan-950 font-bold text-[10px] flex items-center justify-center shadow">C1</div>
              <div className="w-6 h-6 rounded-full bg-cyan-400 text-cyan-950 font-bold text-[10px] flex items-center justify-center shadow">C1</div>
            </div>
            <span className="text-white text-xs animate-pulse">⤫</span>
            <div className="flex flex-col gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-cyan-950 font-bold text-[10px] flex items-center justify-center shadow">C2</div>
              <div className="w-6 h-6 rounded-full bg-amber-400 text-cyan-950 font-bold text-[10px] flex items-center justify-center shadow">C2</div>
            </div>
          </div>
        </div>
      );

    case 'bridge-finding':
    case 'articulation-points':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Cut Edge & Bridge Low-Link</span>
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-6 h-6 rounded-full bg-white text-cyan-950 font-bold text-[10px] flex items-center justify-center">U</div>
            <div className="w-10 h-1 bg-rose-500 animate-pulse shadow-md" />
            <div className="w-6 h-6 rounded-full bg-amber-300 text-cyan-950 font-bold text-[10px] flex items-center justify-center shadow">V</div>
          </div>
        </div>
      );

    case 'dinics-algorithm':
    case 'edmonds-karp':
    case 'hopcroft-karp':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Maximum Flow & Matching</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-6 h-6 rounded bg-cyan-400 text-cyan-950 font-bold text-[10px] flex items-center justify-center">Source</div>
            <span className="text-amber-300 font-bold animate-pulse">4/10 ➔</span>
            <div className="w-6 h-6 rounded bg-emerald-400 text-cyan-950 font-bold text-[10px] flex items-center justify-center shadow">Sink</div>
          </div>
        </div>
      );

    case 'zero-one-bfs':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>0-1 Deque Shortest Path</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex gap-2">
              <div className="px-2 py-0.5 rounded bg-emerald-400 text-cyan-950 font-bold text-[9px]">w=0 (Push Front)</div>
            </div>
            <div className="flex gap-2">
              <div className="px-2 py-0.5 rounded bg-amber-300 text-cyan-950 font-bold text-[9px]">w=1 (Push Back)</div>
            </div>
          </div>
        </div>
      );

    /* ════════════════════════════════════════════════════════════════
       5. DYNAMIC PROGRAMMING & GEOMETRY
       ════════════════════════════════════════════════════════════════ */
    case 'tree-diameter-dp':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#7E22CE] to-[#581C87] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>Tree Diameter Longest Path</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 font-bold text-[9px] flex items-center justify-center shadow">L1</div>
            <div className="w-12 h-1 bg-amber-300 animate-pulse shadow" />
            <div className="w-6 h-6 rounded-full bg-white text-purple-950 font-bold text-[10px] flex items-center justify-center shadow">Root</div>
            <div className="w-12 h-1 bg-amber-300 animate-pulse shadow" />
            <div className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 font-bold text-[9px] flex items-center justify-center shadow">L2</div>
          </div>
        </div>
      );

    case 'closest-pair-points':
    case 'closest-pair-of-points':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Divide & 2D Strip Scan</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <div className="relative w-36 h-24 flex items-center justify-center font-mono">
            <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400 left-1/2 -translate-x-1/2" />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 absolute top-4 left-6 animate-pulse" />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 absolute top-6 right-6 animate-pulse" />
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400 absolute bottom-4 left-14 shadow-lg animate-ping" />
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400 absolute bottom-5 right-12 shadow-lg animate-ping" />
          </div>
        </div>
      );

    case 'convex-hull':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Graham Scan Convex Polygon</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <div className="relative w-32 h-24 flex items-center justify-center font-mono">
            <div className="w-20 h-16 border-2 border-amber-300 rounded-lg rotate-12 relative">
              <div className="w-2 h-2 rounded-full bg-white absolute -top-1 -left-1" />
              <div className="w-2 h-2 rounded-full bg-white absolute -top-1 -right-1" />
              <div className="w-2 h-2 rounded-full bg-white absolute -bottom-1 -left-1" />
              <div className="w-2 h-2 rounded-full bg-white absolute -bottom-1 -right-1" />
              <div className="w-1.5 h-1.5 rounded-full bg-teal-200 absolute top-3 left-4 opacity-50" />
            </div>
          </div>
        </div>
      );

    case 'line-intersection':
    case 'point-in-polygon':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Cross-Product CCW Test</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <div className="relative w-32 h-24 flex items-center justify-center">
            <div className="w-20 h-0.5 bg-white/70 rotate-45 absolute" />
            <div className="w-20 h-0.5 bg-white/70 -rotate-45 absolute" />
            <div className="w-3 h-3 rounded-full bg-rose-400 ring-2 ring-white animate-ping z-10" />
          </div>
        </div>
      );

    /* ════════════════════════════════════════════════════════════════
       6. STACK, QUEUE, LINKED LISTS & MATH
       ════════════════════════════════════════════════════════════════ */
    case 'circular-linked-list':
    case 'circular-queue':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#1D4ED8] to-[#1E40AF] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-100 uppercase tracking-wider">
            <span>Ring Buffer Traversal</span>
            <span className="w-2 h-2 rounded-full bg-blue-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center h-24 font-mono">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-300 flex items-center justify-center relative animate-spin [animation-duration:8s]">
              <div className="w-3 h-3 rounded-full bg-amber-300 absolute -top-1.5" />
              <div className="w-3 h-3 rounded-full bg-white absolute -bottom-1.5" />
            </div>
          </div>
        </div>
      );

    case 'deque-visualizer':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#6366F1] to-[#4F46E5] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Double-Ended Queue</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <span className="text-amber-300 text-xs animate-pulse">⇄ Front</span>
            <div className="flex gap-1 p-1 bg-black/40 rounded border border-indigo-400">
              <div className="w-5 h-6 rounded bg-indigo-400" />
              <div className="w-5 h-6 rounded bg-indigo-300" />
              <div className="w-5 h-6 rounded bg-indigo-200" />
            </div>
            <span className="text-cyan-300 text-xs animate-pulse">Back ⇄</span>
          </div>
        </div>
      );

    case 'sliding-window-maximum':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#6366F1] to-[#4F46E5] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Monotonic Deque Window</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-1 p-1 bg-black/40 rounded">
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-slate-300">1</span>
              <div className="flex gap-1 p-0.5 rounded border-2 border-amber-300 bg-amber-400/20">
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-indigo-950 font-bold">3</span>
                <span className="px-1.5 py-0.5 rounded bg-white text-indigo-950">-1</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-slate-300">-3</span>
            </div>
            <span className="text-emerald-300 text-[10px] font-bold">Window Max = 3</span>
          </div>
        </div>
      );

    case 'single-number':
    case 'count-set-bits':
    case 'submask-enumeration':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#B45309] to-[#92400E] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Bit Manipulation XOR</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-1">
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200">A</span>
              <span className="text-amber-300 font-bold">^</span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200">A</span>
              <span className="text-amber-300 font-bold">=</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-amber-950 font-bold shadow animate-pulse">0</span>
            </div>
            <span className="text-[10px] text-amber-200">Cancellation Property</span>
          </div>
        </div>
      );

    /* ════════════════════════════════════════════════════════════════
       7. ADDITIONAL SORTING & HYBRID VARIANTS
       ════════════════════════════════════════════════════════════════ */
    case 'timsort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Adaptive Natural Runs</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 rounded bg-white text-emerald-950 font-bold text-[9px]">Run A (len 32)</span>
              <span className="text-amber-300 font-bold animate-pulse">⤾ Merge</span>
              <span className="px-2 py-0.5 rounded bg-amber-300 text-emerald-950 font-bold text-[9px]">Run B (len 64)</span>
            </div>
            <div className="text-[10px] text-emerald-200">Galloping Mode Triggered</div>
          </div>
        </div>
      );

    case 'quickselect':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>K-th Order Statistic O(N)</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex gap-1 items-center">
              <span className="px-1.5 py-0.5 rounded bg-white/30 text-sky-200 line-through text-[9px]">{`[ < Pivot ]`}</span>
              <span className="px-2 py-1 rounded bg-amber-300 text-sky-950 font-extrabold text-[10px] shadow animate-pulse">Target k=3</span>
              <span className="px-1.5 py-0.5 rounded bg-white/30 text-sky-200 text-[9px]">{`[ > Pivot ]`}</span>
            </div>
            <span className="text-[10px] text-sky-200">Discard Unneeded Partition</span>
          </div>
        </div>
      );

    case 'introsort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Hybrid Quick + Heapsort</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <span className="px-1.5 py-0.5 rounded bg-white text-emerald-950 font-bold text-[9px]">Quicksort</span>
            <span className="text-amber-300 text-[10px] font-bold animate-pulse">{`depth > 2logN ➔`}</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-emerald-950 font-bold text-[9px] shadow">Heapsort</span>
          </div>
        </div>
      );

    case 'shellsort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Diminishing Gap Sorting</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex gap-3">
              <div className="w-5 h-7 rounded bg-white text-emerald-950 font-bold flex items-center justify-center text-[10px]">A[0]</div>
              <div className="w-5 h-7 rounded bg-amber-300 text-emerald-950 font-bold flex items-center justify-center text-[10px] shadow animate-pulse">A[4]</div>
            </div>
            <span className="text-[10px] text-emerald-200 font-bold">Gap h = 4 ➔ h = 1</span>
          </div>
        </div>
      );

    case 'bucket-sort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Scatter-Gather Bins</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="p-1.5 rounded-b-lg border-2 border-emerald-300 bg-black/40 text-[9px] text-center">
              <div>B[0]</div>
              <div className="w-4 h-2 bg-emerald-400 rounded mt-1" />
            </div>
            <div className="p-1.5 rounded-b-lg border-2 border-amber-300 bg-black/40 text-[9px] text-center animate-pulse shadow">
              <div>B[1]</div>
              <div className="w-4 h-4 bg-amber-400 rounded mt-1" />
            </div>
            <div className="p-1.5 rounded-b-lg border-2 border-emerald-300 bg-black/40 text-[9px] text-center">
              <div>B[2]</div>
              <div className="w-4 h-2 bg-emerald-400 rounded mt-1" />
            </div>
          </div>
        </div>
      );

    case 'cocktail-shaker-sort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Bidirectional Bubble</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-1.5 items-center">
              <span className="text-cyan-300 font-bold">Forward ➔</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="text-amber-300 font-bold">← Backward</span>
            </div>
          </div>
        </div>
      );

    case 'bogosort':
    case 'sleep-sort':
    case 'stooge-sort':
    case 'drop-sort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Esoteric / Randomized Sort</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-400/40 text-emerald-200">
              <span className="text-amber-300 font-bold animate-pulse">🎲 Shuffle / Drop / Timer</span>
            </div>
          </div>
        </div>
      );

    /* ════════════════════════════════════════════════════════════════
       8. ADDITIONAL DYNAMIC PROGRAMMING & GRID
       ════════════════════════════════════════════════════════════════ */
    case 'climbing-stairs':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#9333EA] to-[#7E22CE] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>Fibonacci Recurrence DP</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="flex items-end justify-center gap-1.5 h-24 pb-2 font-mono text-xs">
            <div className="w-6 h-6 bg-white/40 rounded-t flex items-center justify-center text-[9px] text-white">S1</div>
            <div className="w-6 h-10 bg-white/60 rounded-t flex items-center justify-center text-[9px] text-white">S2</div>
            <div className="w-6 h-14 bg-white/80 rounded-t flex items-center justify-center text-[9px] text-purple-950 font-bold">S3</div>
            <div className="w-6 h-18 bg-emerald-400 rounded-t flex items-center justify-center text-[9px] text-purple-950 font-bold shadow animate-pulse">S4</div>
          </div>
        </div>
      );

    case 'matrix-chain-multiplication':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#9333EA] to-[#7E22CE] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>Optimal Parenthesization</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="px-2 py-1 rounded bg-black/40 border border-purple-400 text-purple-200 text-[10px]">
              ((A₁ × A₂) × (A₃ × A₄))
            </div>
            <span className="text-[10px] text-emerald-300 font-bold">Min Scalar Operations</span>
          </div>
        </div>
      );

    case 'subset-sum':
    case 'unbounded-knapsack':
    case 'burst-balloons':
    case 'tsp-held-karp':
    case 'unique-paths':
    case 'lps':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#9333EA] to-[#7E22CE] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>State Transition Table</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-2 bg-black/30 rounded-lg border border-purple-400/40 font-mono text-xs">
            <div className="w-6 h-6 rounded bg-purple-900 text-purple-200 flex items-center justify-center text-[9px]">T</div>
            <div className="w-6 h-6 rounded bg-purple-900 text-purple-200 flex items-center justify-center text-[9px]">F</div>
            <div className="w-6 h-6 rounded bg-emerald-400 text-purple-950 font-extrabold flex items-center justify-center text-[9px] shadow animate-pulse">OPT</div>
          </div>
        </div>
      );

    /* ════════════════════════════════════════════════════════════════
       9. ADDITIONAL LINKED LISTS, STACK & MATH
       ════════════════════════════════════════════════════════════════ */
    case 'middle-linked-list':
    case 'remove-nth-node-from-end':
    case 'merge-two-sorted-lists':
    case 'intersection-of-two-linked-lists':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#1D4ED8] to-[#1E40AF] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-100 uppercase tracking-wider">
            <span>Fast & Slow Pointers</span>
            <span className="w-2 h-2 rounded-full bg-blue-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="w-6 h-6 rounded bg-white text-blue-950 font-bold flex items-center justify-center text-[10px]">1</div>
            <span className="text-cyan-300">→</span>
            <div className="w-6 h-6 rounded bg-amber-300 text-blue-950 font-extrabold flex items-center justify-center text-[10px] shadow animate-pulse">Mid</div>
            <span className="text-cyan-300">→</span>
            <div className="w-6 h-6 rounded bg-white text-blue-950 font-bold flex items-center justify-center text-[10px]">3</div>
          </div>
        </div>
      );

    case 'postfix-evaluation':
    case 'shunting-yard':
    case 'stack-lifo':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#6366F1] to-[#4F46E5] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Operand Stack LIFO</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-12 h-16 bg-black/40 border-2 border-indigo-300 rounded-b flex flex-col-reverse p-1 gap-1">
              <span className="w-full py-0.5 bg-white text-indigo-950 text-center rounded text-[9px] font-bold">5</span>
              <span className="w-full py-0.5 bg-amber-300 text-indigo-950 text-center rounded text-[9px] font-bold animate-pulse">9</span>
            </div>
            <span className="text-emerald-300 text-xs font-bold">+ Eval</span>
          </div>
        </div>
      );

    case 'extended-gcd':
    case 'permutations-combinations':
    case 'prime-factorization':
    case 'strassen-matrix':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Mathematical Transform</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="px-2.5 py-1 rounded bg-black/40 border border-amber-300 text-amber-200 text-[10px]">
              ax + by = gcd(a, b)
            </div>
            <span className="text-[10px] text-emerald-300 font-bold animate-pulse">Bezout Coefficients</span>
          </div>
        </div>
      );

    /* ════════════════════════════════════════════════════════════════
       10. GREEDY, BACKTRACKING & TOPOLOGY COMPLETION
       ════════════════════════════════════════════════════════════════ */
    case 'fractional-knapsack':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Value/Weight Density Ratio</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="flex gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-emerald-950 font-bold text-[9px] shadow">v/w=6.0</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-emerald-950 font-bold text-[9px] shadow">v/w=4.2</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-300 text-emerald-950 font-extrabold text-[9px] shadow animate-pulse">80% take</span>
            </div>
            <div className="text-[10px] text-emerald-200">Greedy Density Selection</div>
          </div>
        </div>
      );

    case 'gas-station':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Circuit Deficit Balance</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-teal-300 flex items-center justify-center relative animate-spin [animation-duration:10s]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-1" />
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 absolute -bottom-1" />
            </div>
            <div className="text-[10px] text-teal-200">
              <div>Tank: <span className="text-emerald-300 font-bold">+5</span></div>
              <div className="text-amber-300 font-bold animate-pulse">Start: Station 3</div>
            </div>
          </div>
        </div>
      );

    case 'jump-game':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Max Reachable Frontier</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="flex gap-1.5 items-end">
              <div className="w-6 h-6 rounded bg-white text-sky-950 font-bold flex items-center justify-center text-[10px]">2</div>
              <div className="w-6 h-6 rounded bg-white text-sky-950 font-bold flex items-center justify-center text-[10px]">3</div>
              <div className="w-6 h-6 rounded bg-white text-sky-950 font-bold flex items-center justify-center text-[10px]">1</div>
              <div className="w-6 h-6 rounded bg-emerald-400 text-sky-950 font-extrabold flex items-center justify-center text-[10px] shadow animate-pulse">Goal</div>
            </div>
            <span className="text-[10px] text-cyan-300 font-bold">Max Reach = 4 (Goal Reachable)</span>
          </div>
        </div>
      );

    case 'rat-in-a-maze':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#B45309] to-[#92400E] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Grid Maze Backtracking</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded border border-amber-400/40">
              <div className="w-5 h-5 rounded bg-emerald-400 text-amber-950 font-bold flex items-center justify-center text-[9px] shadow animate-pulse">S</div>
              <div className="w-5 h-5 rounded bg-emerald-400 text-amber-950 font-bold flex items-center justify-center text-[9px] shadow animate-pulse">→</div>
              <div className="w-5 h-5 rounded bg-rose-500/80 text-white font-bold flex items-center justify-center text-[9px]">✕</div>
              <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-[9px]">0</div>
              <div className="w-5 h-5 rounded bg-emerald-400 text-amber-950 font-bold flex items-center justify-center text-[9px] shadow animate-pulse">↓</div>
              <div className="w-5 h-5 rounded bg-emerald-400 text-amber-950 font-extrabold flex items-center justify-center text-[9px] shadow">G</div>
            </div>
          </div>
        </div>
      );

    case 'subsets':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#7E22CE] to-[#581C87] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>Include / Exclude 2ⁿ Tree</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="px-2 py-0.5 rounded bg-white text-purple-950 font-bold text-[9px] shadow">Item 1</div>
            <div className="w-20 h-1.5 border-t-2 border-l-2 border-r-2 border-purple-300/60 rounded-t" />
            <div className="flex justify-between w-28 text-[8px]">
              <div className="px-1.5 py-0.5 rounded bg-emerald-400 text-purple-950 font-bold shadow animate-pulse">+Include</div>
              <div className="px-1.5 py-0.5 rounded bg-white/40 text-purple-200">-Exclude</div>
            </div>
          </div>
        </div>
      );

    case 'sudoku-solver':
    case 'word-search':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#B45309] to-[#92400E] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Exact Constraint Grid DFS</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="grid grid-cols-3 gap-1 p-1.5 bg-black/40 rounded border border-amber-300 shadow">
              <div className="w-5 h-5 rounded bg-white text-amber-950 font-bold flex items-center justify-center text-[10px]">5</div>
              <div className="w-5 h-5 rounded bg-amber-300 text-amber-950 font-extrabold flex items-center justify-center text-[10px] animate-pulse">3</div>
              <div className="w-5 h-5 rounded bg-white text-amber-950 font-bold flex items-center justify-center text-[10px]">9</div>
              <div className="w-5 h-5 rounded bg-white/20 text-slate-400 flex items-center justify-center text-[10px]">.</div>
              <div className="w-5 h-5 rounded bg-emerald-400 text-amber-950 font-bold flex items-center justify-center text-[10px] shadow">7</div>
              <div className="w-5 h-5 rounded bg-white/20 text-slate-400 flex items-center justify-center text-[10px]">.</div>
            </div>
          </div>
        </div>
      );

    case 'flood-fill':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Concentric Grid Flood Fill</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="grid grid-cols-3 gap-1 p-1.5 bg-black/40 rounded border border-cyan-400/40">
              <div className="w-5 h-5 rounded bg-cyan-400 text-cyan-950 font-bold flex items-center justify-center text-[9px] shadow animate-pulse">🌊</div>
              <div className="w-5 h-5 rounded bg-cyan-400 text-cyan-950 font-bold flex items-center justify-center text-[9px] shadow animate-pulse">🌊</div>
              <div className="w-5 h-5 rounded bg-white/20 text-slate-400 flex items-center justify-center text-[9px]">0</div>
              <div className="w-5 h-5 rounded bg-cyan-400 text-cyan-950 font-bold flex items-center justify-center text-[9px] shadow animate-pulse">🌊</div>
              <div className="w-5 h-5 rounded bg-amber-400 text-cyan-950 font-bold flex items-center justify-center text-[9px] shadow">Start</div>
              <div className="w-5 h-5 rounded bg-white/20 text-slate-400 flex items-center justify-center text-[9px]">0</div>
            </div>
          </div>
        </div>
      );

    case 'graph-coloring':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Welsh-Powell Degree Coloring</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <div className="w-6 h-6 rounded-full bg-rose-400 text-cyan-950 font-bold text-[10px] flex items-center justify-center shadow">C1</div>
            <span className="text-white">─</span>
            <div className="w-6 h-6 rounded-full bg-amber-400 text-cyan-950 font-bold text-[10px] flex items-center justify-center shadow animate-pulse">C2</div>
            <span className="text-white">─</span>
            <div className="w-6 h-6 rounded-full bg-emerald-400 text-cyan-950 font-bold text-[10px] flex items-center justify-center shadow">C3</div>
          </div>
        </div>
      );

    case 'graph-representations':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Matrix vs List Topo</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24 font-mono text-xs">
            <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded border border-cyan-400/40 text-[9px] text-center">
              <span className="text-cyan-200">0 1</span>
              <span className="text-cyan-200">1 0</span>
            </div>
            <span className="text-cyan-300 font-bold">⇄</span>
            <div className="text-[9px] text-cyan-100">
              <div>[0] → 1</div>
              <div>[1] → 0</div>
            </div>
          </div>
        </div>
      );

    case 'recursion-trees':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Recursion Topology Hub</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1 h-24 font-mono text-xs">
            <div className="px-2 py-0.5 rounded bg-emerald-400 text-emerald-950 font-bold text-[9px]">T(N)</div>
            <div className="w-24 h-1.5 border-t-2 border-l-2 border-r-2 border-emerald-300/60 rounded-t" />
            <div className="flex justify-between w-28 text-[8px]">
              <div className="px-1.5 py-0.5 rounded bg-white text-emerald-950 font-bold shadow">T(N/2)</div>
              <div className="px-1.5 py-0.5 rounded bg-amber-300 text-emerald-950 font-bold shadow animate-pulse">T(N/2)</div>
            </div>
          </div>
        </div>
      );

    case 'binary-tree-topologies':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Full vs Complete Trees</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="w-5 h-5 rounded-full bg-cyan-300 text-indigo-950 font-bold text-[9px] flex items-center justify-center shadow">Root</div>
            <div className="w-16 h-1 border-t-2 border-l-2 border-r-2 border-indigo-300/60 rounded-t" />
            <div className="flex justify-between w-20">
              <div className="w-4 h-4 rounded-full bg-white text-indigo-950 font-bold text-[8px] flex items-center justify-center">L</div>
              <div className="w-4 h-4 rounded-full bg-amber-300 text-indigo-950 font-bold text-[8px] flex items-center justify-center shadow animate-pulse">R</div>
            </div>
          </div>
        </div>
      );

    case 'max-heap-build':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#B45309] to-[#92400E] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Bottom-Up Heapify O(N)</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="w-7 h-7 rounded-full bg-amber-300 text-amber-950 font-black text-[11px] flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              99
            </div>
            <div className="w-20 h-1 border-t-2 border-l-2 border-r-2 border-amber-200/60 rounded-t" />
            <div className="flex justify-between w-24">
              <div className="w-6 h-6 rounded-full bg-white/90 text-amber-950 font-bold text-[10px] flex items-center justify-center shadow">42</div>
              <div className="w-6 h-6 rounded-full bg-emerald-400 text-amber-950 font-bold text-[10px] flex items-center justify-center shadow animate-pulse">88</div>
            </div>
            <span className="text-[9px] text-amber-200 font-mono tracking-tight">Sift-Down (Sink) Violation</span>
          </div>
        </div>
      );

    case 'transitive-closure':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Warshall Reachability Matrix</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24 font-mono text-xs">
            <div className="grid grid-cols-3 gap-1 p-2 bg-black/40 rounded-lg border border-teal-400/40">
              <span className="w-5 h-5 rounded bg-teal-900/60 text-teal-300 flex items-center justify-center text-[10px]">1</span>
              <span className="w-5 h-5 rounded bg-teal-900/60 text-teal-300 flex items-center justify-center text-[10px]">1</span>
              <span className="w-5 h-5 rounded bg-teal-900/60 text-teal-300 flex items-center justify-center text-[10px]">0</span>
              <span className="w-5 h-5 rounded bg-teal-900/60 text-teal-300 flex items-center justify-center text-[10px]">0</span>
              <span className="w-5 h-5 rounded bg-teal-900/60 text-teal-300 flex items-center justify-center text-[10px]">1</span>
              <span className="w-5 h-5 rounded bg-amber-400 text-teal-950 font-bold flex items-center justify-center text-[10px] shadow animate-pulse">1</span>
              <span className="w-5 h-5 rounded bg-teal-900/60 text-teal-300 flex items-center justify-center text-[10px]">0</span>
              <span className="w-5 h-5 rounded bg-teal-900/60 text-teal-300 flex items-center justify-center text-[10px]">0</span>
              <span className="w-5 h-5 rounded bg-teal-900/60 text-teal-300 flex items-center justify-center text-[10px]">1</span>
            </div>
            <div className="flex flex-col text-[10px] text-teal-200">
              <span className="font-bold text-white">i ➔ k ➔ j</span>
              <span className="text-amber-300">R[i][j] |= R[i][k]&R[k][j]</span>
            </div>
          </div>
        </div>
      );

    case 'hierholzer-eulerian':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#6366F1] to-[#4F46E5] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Hierholzer Eulerian Circuit</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center h-24 relative">
            <svg className="w-36 h-20" viewBox="0 0 144 80">
              <path d="M 20 40 L 72 15 L 124 40 L 72 65 Z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
              <path d="M 20 40 L 124 40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3,3" />
              {/* Animated Eulerian Walk */}
              <path d="M 20 40 L 72 15 L 124 40 L 72 65 L 20 40" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="160" strokeDashoffset="40" className="animate-pulse" />
              <circle cx="20" cy="40" r="7" fill="#67E8F9" />
              <text x="20" y="43" fill="#0C4A6E" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
              <circle cx="72" cy="15" r="7" fill="#FFFFFF" />
              <text x="72" y="18" fill="#1E1B4B" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
              <circle cx="124" cy="40" r="7" fill="#67E8F9" />
              <text x="124" y="43" fill="#0C4A6E" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
              <circle cx="72" cy="65" r="7" fill="#FDE047" className="animate-pulse" />
              <text x="72" y="68" fill="#1E1B4B" fontSize="9" fontWeight="bold" textAnchor="middle">4</text>
            </svg>
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-indigo-200 bg-indigo-950/60 px-1.5 py-0.5 rounded">
              All deg(v) even
            </div>
          </div>
        </div>
      );

    case 'boruvka-mst':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Borůvka Concurrent MST</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24 font-mono text-xs">
            <div className="flex flex-col items-center gap-1">
              <div className="px-2 py-1 rounded-md bg-white/20 border border-sky-300/40 text-white text-[10px] flex items-center gap-1 shadow">
                <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse" />
                <span>Tree A</span>
              </div>
              <span className="text-[9px] text-sky-200">min edge: 2</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-emerald-300 font-black text-sm animate-pulse">➔ ⚡ ➔</span>
              <span className="text-[8px] text-emerald-200">Merge</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="px-2 py-1 rounded-md bg-white/20 border border-sky-300/40 text-white text-[10px] flex items-center gap-1 shadow">
                <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
                <span>Tree B</span>
              </div>
              <span className="text-[9px] text-sky-200">min edge: 2</span>
            </div>
          </div>
        </div>
      );

    case 'suffix-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#1E293B] to-[#0F172A] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform border border-cyan-500/20">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-200 uppercase tracking-wider">
            <span>Ukkonen Suffix Tree</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono text-xs">
            <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-lg animate-pulse">
              $
            </div>
            <div className="w-24 h-1 border-t-2 border-l-2 border-r-2 border-cyan-400/50 rounded-t" />
            <div className="flex justify-between w-28 text-[9px]">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-400/40 text-cyan-300 font-bold shadow">
                "banana$"
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-400/40 text-emerald-300 font-bold shadow animate-pulse">
                "na$"
              </span>
            </div>
            <span className="text-[8px] text-slate-400">O(N) Online Linear Construction</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}


