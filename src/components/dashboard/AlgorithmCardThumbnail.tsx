import React from 'react';

interface AlgorithmCardThumbnailProps {
  moduleId: string;
  category: string;
}

export const AlgorithmCardThumbnail: React.FC<AlgorithmCardThumbnailProps> = ({ moduleId, category }) => {
  switch (moduleId) {
    case 'bubble-sort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          {/* VisuAlgo Header Label */}
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Adjacent Swapping</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>

          {/* Looping Animated Bars */}
          <div className="flex items-end justify-center gap-3 h-24 pb-1">
            <div className="w-6 bg-white/70 rounded-t h-10" />
            <div className="w-6 bg-amber-300 rounded-t h-20 anim-swap-a shadow-md shadow-black/20" />
            <div className="w-6 bg-white rounded-t h-14 anim-swap-b shadow-md shadow-black/20" />
            <div className="w-6 bg-white/80 rounded-t h-24" />
            <div className="w-6 bg-white/90 rounded-t h-28" />
          </div>
        </div>
      );

    case 'valid-parentheses':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#6366F1] to-[#4F46E5] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Stack LIFO Matching</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>

          <div className="flex items-center justify-center gap-4 h-24">
            <div className="w-20 h-20 bg-black/30 border-2 border-indigo-300 rounded-b-xl flex flex-col-reverse p-1.5 gap-1 items-center shadow-inner">
              <span className="w-full py-1 bg-white text-indigo-950 font-mono font-bold text-xs rounded text-center shadow">{'['}</span>
              <span className="w-full py-1 bg-cyan-300 text-indigo-950 font-mono font-bold text-xs rounded text-center shadow animate-pulse">{'{'}</span>
            </div>
            <div className="flex flex-col gap-1 text-xs font-mono text-indigo-200">
              <span>push '{'{'}'</span>
              <span className="text-emerald-300 font-bold">pop '{'}'}' match!</span>
            </div>
          </div>
        </div>
      );

    case 'lcs':
    case 'longest-common-subsequence':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#9333EA] to-[#7E22CE] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>2D DP Alignment</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>

          <div className="flex items-center justify-center gap-3 h-24 font-mono">
            <div className="grid grid-cols-3 gap-1 p-2 bg-black/30 rounded-lg border border-purple-400/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent anim-scan pointer-events-none" />
              <div className="w-6 h-6 rounded bg-purple-900/60 flex items-center justify-center text-xs text-purple-300">0</div>
              <div className="w-6 h-6 rounded bg-purple-900/60 flex items-center justify-center text-xs text-purple-300">1</div>
              <div className="w-6 h-6 rounded bg-purple-900/60 flex items-center justify-center text-xs text-purple-300">1</div>
              <div className="w-6 h-6 rounded bg-purple-900/60 flex items-center justify-center text-xs text-purple-300">1</div>
              <div className="w-6 h-6 rounded bg-emerald-400 text-purple-950 font-extrabold flex items-center justify-center text-xs shadow-md anim-pulse-fade">2</div>
              <div className="w-6 h-6 rounded bg-purple-900/60 flex items-center justify-center text-xs text-purple-300">2</div>
            </div>
            <div className="flex flex-col gap-1 text-[11px] text-purple-100">
              <span className="text-emerald-300 font-bold anim-arrow-flow">↖ match: 'E'=='E'</span>
              <span className="text-purple-200">LCS="ONE" (len 3)</span>
            </div>
          </div>
        </div>
      );

    case 'sieve-of-eratosthenes':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Prime Elimination Grid</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>

          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono">
            <div className="grid grid-cols-4 gap-1.5 p-2 bg-black/25 rounded-lg border border-emerald-400/30">
              <div className="w-7 h-7 rounded bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-center shadow anim-pulse-fade">2</div>
              <div className="w-7 h-7 rounded bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-center shadow anim-pulse-fade">3</div>
              <div className="w-7 h-7 rounded bg-rose-500/30 text-rose-200 line-through text-xs flex items-center justify-center opacity-60">4</div>
              <div className="w-7 h-7 rounded bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-center shadow anim-pulse-fade">5</div>
            </div>
            <div className="text-[10px] text-emerald-100 flex items-center gap-1">
              <span className="text-amber-300 font-bold animate-pulse">cross-out 2k</span>
              <span>→ primes survive</span>
            </div>
          </div>
        </div>
      );

    case 'selection-sort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Minimum Element Scan</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>

          <div className="flex items-end justify-center gap-3 h-24 pb-1">
            <div className="w-6 bg-emerald-400 rounded-t h-10 border-t-2 border-emerald-200" />
            <div className="w-6 bg-emerald-400 rounded-t h-16 border-t-2 border-emerald-200" />
            <div className="w-6 bg-white/50 rounded-t h-26" />
            <div className="w-6 bg-rose-400 rounded-t h-8 relative shadow-lg shadow-black/30 animate-pulse">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-extrabold text-rose-200">MIN</span>
            </div>
            <div className="w-6 bg-white/60 rounded-t h-22" />
          </div>
        </div>
      );

    case 'quicksort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Pivot Partitioning</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>

          <div className="flex items-end justify-center gap-3 h-24 pb-1">
            <div className="w-6 bg-white/60 rounded-t h-12" />
            <div className="w-6 bg-white/70 rounded-t h-16" />
            <div className="w-6 bg-amber-300 rounded-t h-26 relative shadow-md shadow-black/20">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-amber-100">PIVOT</span>
            </div>
            <div className="w-6 bg-sky-200 rounded-t h-20 anim-swap-a" />
            <div className="w-6 bg-white rounded-t h-28 anim-swap-b" />
          </div>
        </div>
      );

    case 'mergesort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-100 uppercase tracking-wider">
            <span>Divide & Conquer Merge</span>
            <span className="w-2 h-2 rounded-full bg-blue-300 animate-ping" />
          </div>

          <div className="flex flex-col items-center justify-center gap-2 h-24">
            {/* Split Halves */}
            <div className="flex gap-4">
              <div className="flex gap-1 p-1 bg-white/20 rounded shadow-sm">
                <span className="w-5 h-6 bg-white text-blue-900 rounded text-xs font-mono font-bold flex items-center justify-center">4</span>
                <span className="w-5 h-6 bg-white text-blue-900 rounded text-xs font-mono font-bold flex items-center justify-center">7</span>
              </div>
              <div className="flex gap-1 p-1 bg-white/20 rounded shadow-sm">
                <span className="w-5 h-6 bg-white text-blue-900 rounded text-xs font-mono font-bold flex items-center justify-center">1</span>
                <span className="w-5 h-6 bg-white text-blue-900 rounded text-xs font-mono font-bold flex items-center justify-center">3</span>
              </div>
            </div>

            {/* Merge Arrow */}
            <span className="text-white text-xs font-bold font-mono anim-arrow-flow">↓ merging</span>

            {/* Merged Sorted Array */}
            <div className="flex gap-1 p-1 bg-emerald-400/30 rounded border border-emerald-300 shadow-md">
              <span className="w-6 h-6 bg-white text-emerald-900 rounded text-xs font-mono font-bold flex items-center justify-center">1</span>
              <span className="w-6 h-6 bg-white text-emerald-900 rounded text-xs font-mono font-bold flex items-center justify-center">3</span>
              <span className="w-6 h-6 bg-white text-emerald-900 rounded text-xs font-mono font-bold flex items-center justify-center">4</span>
              <span className="w-6 h-6 bg-white text-emerald-900 rounded text-xs font-mono font-bold flex items-center justify-center">7</span>
            </div>
          </div>
        </div>
      );

    case 'insertion-sort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Incremental Insertion</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>

          <div className="flex items-end justify-center gap-3 h-24 pb-1">
            <div className="w-6 bg-emerald-400 rounded-t h-12 border-t-2 border-emerald-200" />
            <div className="w-6 bg-emerald-400 rounded-t h-18 border-t-2 border-emerald-200" />
            <div className="w-6 bg-amber-400 rounded-t h-14 relative shadow-lg shadow-black/30 animate-bounce">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-extrabold text-amber-200">KEY</span>
            </div>
            <div className="w-6 bg-white/40 rounded-t h-24" />
            <div className="w-6 bg-white/50 rounded-t h-28" />
          </div>
        </div>
      );

    case 'topological-sort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Kahn DAG In-Degree</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>

          <div className="flex items-center justify-center gap-3 h-24">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-400 bg-emerald-400/20 flex items-center justify-center font-mono font-bold text-xs text-emerald-200 shadow-md">
              0
            </div>
            <span className="text-white text-xs font-mono font-bold anim-arrow-flow">→</span>
            <div className="w-10 h-10 rounded-full border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center font-mono font-bold text-xs text-amber-200 shadow-md">
              1
            </div>
            <span className="text-white text-xs font-mono font-bold anim-arrow-flow">→</span>
            <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-cyan-400/20 flex items-center justify-center font-mono font-bold text-xs text-cyan-200 shadow-md">
              2
            </div>
          </div>
        </div>
      );

    case 'linked-list':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#1D4ED8] to-[#1E40AF] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-100 uppercase tracking-wider">
            <span>Singly Linked List</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>

          <div className="flex items-center justify-center gap-2 h-24">
            <div className="flex items-stretch rounded-lg bg-white shadow-md overflow-hidden border border-blue-300">
              <span className="px-2.5 py-1.5 font-mono text-xs font-bold text-blue-950">HEAD</span>
              <span className="px-2 py-1.5 bg-blue-100 font-mono text-xs text-blue-800">12</span>
            </div>
            <span className="font-mono text-white text-sm font-bold anim-arrow-flow">→</span>
            <div className="flex items-stretch rounded-lg bg-white shadow-md overflow-hidden border border-blue-300">
              <span className="px-2.5 py-1.5 font-mono text-xs font-bold text-blue-950">45</span>
            </div>
            <span className="font-mono text-white text-sm font-bold anim-arrow-flow">→</span>
            <div className="flex items-stretch rounded-lg bg-emerald-400 text-emerald-950 shadow-md overflow-hidden border border-white font-bold">
              <span className="px-2 py-1.5 font-mono text-xs">99</span>
            </div>
            <span className="font-mono text-white text-sm font-bold">→</span>
            <span className="text-[10px] font-mono text-blue-200">NULL</span>
          </div>
        </div>
      );

    case 'binary-heap':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0D9488] to-[#0F766E] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Binary Max Heap Sift-Up</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>

          <svg viewBox="0 0 140 70" className="w-40 h-24 mx-auto">
            <line x1="70" y1="16" x2="38" y2="40" stroke="#99F6E4" strokeWidth="2" />
            <line x1="70" y1="16" x2="102" y2="40" stroke="#99F6E4" strokeWidth="2" />
            <line x1="38" y1="40" x2="22" y2="60" stroke="#5EEAD4" strokeWidth="1.5" />
            <line x1="38" y1="40" x2="54" y2="60" stroke="#5EEAD4" strokeWidth="1.5" />

            <circle cx="70" cy="16" r="9" fill="#FFFFFF" className="anim-pulse-fade" />
            <text x="70" y="19.5" textAnchor="middle" fill="#115E59" fontSize="8" fontWeight="extrabold" fontFamily="monospace">95</text>

            <circle cx="38" cy="40" r="7.5" fill="#CCFBF1" />
            <text x="38" y="43" textAnchor="middle" fill="#115E59" fontSize="7" fontWeight="bold" fontFamily="monospace">75</text>

            <circle cx="102" cy="40" r="7.5" fill="#CCFBF1" />
            <text x="102" y="43" textAnchor="middle" fill="#115E59" fontSize="7" fontWeight="bold" fontFamily="monospace">80</text>

            <circle cx="54" cy="60" r="6.5" fill="#FDE047" />
            <text x="54" y="62.5" textAnchor="middle" fill="#000" fontSize="6.5" fontWeight="extrabold" fontFamily="monospace">90</text>
            <path d="M 50 52 L 42 44" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="2 1" />

            <circle cx="22" cy="60" r="6" fill="#99F6E4" />
            <text x="22" y="62" textAnchor="middle" fill="#115E59" fontSize="5.5" fontFamily="monospace">60</text>
          </svg>

          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-teal-100">
            <span>parent: ⌊(i-1)/2⌋</span>
            <span className="text-amber-300 font-bold">siftUp(90)</span>
          </div>
        </div>
      );

    case 'graph-bfs':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#7C3AED] to-[#6D28D9] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>Graph BFS Traversal</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>

          <svg viewBox="0 0 160 80" className="w-48 h-24 mx-auto">
            {/* Edges */}
            <line x1="30" y1="40" x2="80" y2="20" stroke="#DDD6FE" strokeWidth="2.5" />
            <line x1="30" y1="40" x2="80" y2="60" stroke="#DDD6FE" strokeWidth="2.5" />
            <line x1="80" y1="20" x2="130" y2="40" stroke="#DDD6FE" strokeWidth="2.5" />
            <line x1="80" y1="60" x2="130" y2="40" stroke="#DDD6FE" strokeWidth="2.5" />

            {/* Nodes */}
            <circle cx="30" cy="40" r="12" fill="#FFFFFF" stroke="#C4B5FD" strokeWidth="2" className="anim-pulse-fade" />
            <text x="30" y="44" textAnchor="middle" fill="#5B21B6" fontSize="10" fontWeight="bold" fontFamily="monospace">0</text>

            <circle cx="80" cy="20" r="10" fill="#E9D5FF" stroke="#FFFFFF" strokeWidth="2" />
            <text x="80" y="23.5" textAnchor="middle" fill="#5B21B6" fontSize="9" fontWeight="bold" fontFamily="monospace">1</text>

            <circle cx="80" cy="60" r="10" fill="#E9D5FF" stroke="#FFFFFF" strokeWidth="2" />
            <text x="80" y="63.5" textAnchor="middle" fill="#5B21B6" fontSize="9" fontWeight="bold" fontFamily="monospace">2</text>

            <circle cx="130" cy="40" r="10" fill="#C4B5FD" stroke="#FFFFFF" strokeWidth="2" />
            <text x="130" y="43.5" textAnchor="middle" fill="#5B21B6" fontSize="9" fontWeight="bold" fontFamily="monospace">3</text>
          </svg>
        </div>
      );

    case 'linear-search':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4338CA] to-[#3730A3] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Sequential Scan</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>

          <div className="flex items-center justify-center gap-2 h-24">
            <div className="w-8 h-10 rounded bg-white/20 opacity-40 flex items-center justify-center text-xs font-mono text-white/50">
              14
            </div>
            <div className="w-8 h-10 rounded bg-white/20 opacity-40 flex items-center justify-center text-xs font-mono text-white/50">
              33
            </div>
            <div className="w-9 h-11 rounded bg-amber-400 border-2 border-white flex flex-col items-center justify-center text-xs font-mono font-bold text-slate-900 shadow-lg shadow-black/40 animate-bounce">
              <span>35</span>
              <span className="text-[7px] uppercase font-mono font-extrabold text-amber-950">MATCH</span>
            </div>
            <div className="w-8 h-10 rounded bg-white/40 flex items-center justify-center text-xs font-mono text-white">
              19
            </div>
          </div>
        </div>
      );

    case 'binary-search':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>O(log N) Halving</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>

          <div className="flex flex-col items-center justify-center gap-2 h-24">
            <div className="flex gap-1.5">
              <div className="w-7 h-10 rounded bg-white/20 opacity-40 flex items-center justify-center text-xs font-mono text-white/50 line-through">
                2
              </div>
              <div className="w-7 h-10 rounded bg-white/20 opacity-40 flex items-center justify-center text-xs font-mono text-white/50 line-through">
                5
              </div>
              <div className="w-8 h-12 rounded bg-amber-300 flex flex-col items-center justify-center text-xs font-mono font-extrabold text-black shadow-lg scale-110 anim-pulse-fade">
                8
                <span className="text-[8px] font-bold">MID</span>
              </div>
              <div className="w-7 h-10 rounded bg-white/40 flex items-center justify-center text-xs font-mono text-white font-bold">
                12
              </div>
              <div className="w-7 h-10 rounded bg-white/40 flex items-center justify-center text-xs font-mono text-white font-bold">
                19
              </div>
            </div>
            <div className="text-[10px] text-indigo-200 font-mono">target = 8 → MATCHED</div>
          </div>
        </div>
      );

    case 'two-pointers':
    case 'two-pointers-water':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Inward Convergence</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>

          <div className="flex flex-col items-center justify-center gap-1 h-24">
            <div className="flex items-end gap-2.5 h-16">
              <div className="w-6 bg-white rounded-t h-12 relative flex flex-col items-center anim-pointer-l shadow-md">
                <span className="absolute -top-4 text-[9px] font-bold text-amber-200">L →</span>
              </div>
              <div className="w-4 bg-white/40 rounded-t h-6" />
              <div className="w-4 bg-white/50 rounded-t h-9" />
              <div className="w-4 bg-white/40 rounded-t h-5" />
              <div className="w-6 bg-white rounded-t h-16 relative flex flex-col items-center anim-pointer-r shadow-md">
                <span className="absolute -top-4 text-[9px] font-bold text-amber-200">← R</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-100 font-semibold">Max Water Area = 48</span>
          </div>
        </div>
      );

    case 'sliding-window':
    case 'sliding-window-max-sum':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Dynamic Window of Size K</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>

          <div className="flex flex-col items-center justify-center gap-2 h-24">
            <div className="flex gap-1.5 items-center relative">
              {/* Animated Sliding Window Box */}
              <div className="absolute -inset-1 border-2 border-white rounded-lg bg-white/20 anim-window-slide pointer-events-none" style={{ width: '84px' }} />
              <div className="w-7 h-9 rounded bg-white/30 text-xs font-mono flex items-center justify-center text-white">2</div>
              <div className="w-7 h-9 rounded bg-white text-xs font-mono font-extrabold flex items-center justify-center text-teal-950 shadow">1</div>
              <div className="w-7 h-9 rounded bg-white text-xs font-mono font-extrabold flex items-center justify-center text-teal-950 shadow">5</div>
              <div className="w-7 h-9 rounded bg-white text-xs font-mono font-extrabold flex items-center justify-center text-teal-950 shadow">1</div>
              <div className="w-7 h-9 rounded bg-white/30 text-xs font-mono flex items-center justify-center text-white">3</div>
            </div>
            <span className="text-[10px] font-mono text-teal-100">Window sum = [1+5+1] = 7 (k=3)</span>
          </div>
        </div>
      );

    case 'bst-insert':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#6366F1] to-[#4F46E5] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Binary Search Tree</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>

          <svg viewBox="0 0 120 60" className="w-36 h-24 mx-auto">
            <line x1="60" y1="12" x2="30" y2="34" stroke="#E0E7FF" strokeWidth="2" />
            <line x1="60" y1="12" x2="90" y2="34" stroke="#E0E7FF" strokeWidth="2" />
            <line x1="30" y1="34" x2="15" y2="52" stroke="#E0E7FF" strokeWidth="1.5" />
            <line x1="90" y1="34" x2="105" y2="52" stroke="#E0E7FF" strokeWidth="1.5" />

            <circle cx="60" cy="12" r="8" fill="#FFFFFF" />
            <text x="60" y="15.5" fill="#3730A3" fontSize="8" fontWeight="bold" textAnchor="middle">50</text>

            <circle cx="30" cy="34" r="7" fill="#E0E7FF" />
            <text x="30" y="37" fill="#3730A3" fontSize="7" fontWeight="bold" textAnchor="middle">30</text>

            <circle cx="90" cy="34" r="7" fill="#FDE047" className="anim-pulse-fade" />
            <text x="90" y="37" fill="#000" fontSize="7" fontWeight="extrabold" textAnchor="middle">70</text>

            <circle cx="15" cy="52" r="5.5" fill="#E0E7FF" />
            <text x="15" y="54.5" fill="#3730A3" fontSize="6" textAnchor="middle">20</text>

            <circle cx="105" cy="52" r="5.5" fill="#E0E7FF" />
            <text x="105" y="54.5" fill="#3730A3" fontSize="6" textAnchor="middle">85</text>
          </svg>
        </div>
      );

    case 'octree-3d':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4338CA] to-[#312E81] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>3D Spatial Partitioning</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>

          <svg viewBox="0 0 120 70" className="w-36 h-24 mx-auto">
            {/* 3D Wireframe Cube with Split Planes */}
            <polygon points="60,10 95,25 60,40 25,25" fill="rgba(99,102,241,0.15)" stroke="#818CF8" strokeWidth="1.5" />
            <polygon points="25,25 60,40 60,65 25,50" fill="rgba(79,70,229,0.2)" stroke="#818CF8" strokeWidth="1.5" />
            <polygon points="95,25 60,40 60,65 95,50" fill="rgba(67,56,202,0.25)" stroke="#818CF8" strokeWidth="1.5" />
            {/* Subdividing Midlines */}
            <line x1="60" y1="10" x2="60" y2="40" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="42.5" y1="17.5" x2="77.5" y2="32.5" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
            {/* 3D Points */}
            <circle cx="48" cy="28" r="3.5" fill="#34D399" className="anim-pulse-fade" />
            <circle cx="75" cy="42" r="3" fill="#F43F5E" />
            <circle cx="35" cy="45" r="3" fill="#38BDF8" />
          </svg>
        </div>
      );

    case 'dijkstra':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0F766E] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Min-Heap Shortest Path</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>

          <svg viewBox="0 0 160 80" className="w-48 h-24 mx-auto">
            {/* Edges with weights */}
            <line x1="25" y1="40" x2="80" y2="18" stroke="#38BDF8" strokeWidth="2.5" />
            <line x1="25" y1="40" x2="80" y2="62" stroke="#34D399" strokeWidth="3" />
            <line x1="80" y1="62" x2="135" y2="40" stroke="#34D399" strokeWidth="3" strokeDasharray="3 3" />
            <line x1="80" y1="18" x2="135" y2="40" stroke="#BAE6FD" strokeWidth="2" />

            {/* Edge weight tags */}
            <text x="48" y="24" fill="#E0F2FE" fontSize="8" fontFamily="monospace" fontWeight="bold">4</text>
            <text x="48" y="60" fill="#A7F3D0" fontSize="8" fontFamily="monospace" fontWeight="bold">2</text>

            {/* Nodes */}
            <circle cx="25" cy="40" r="11" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
            <text x="25" y="43.5" textAnchor="middle" fill="#0369A1" fontSize="9" fontWeight="bold" fontFamily="monospace">A</text>

            <circle cx="80" cy="18" r="10" fill="#BAE6FD" stroke="#FFFFFF" strokeWidth="2" />
            <text x="80" y="21.5" textAnchor="middle" fill="#0369A1" fontSize="8" fontWeight="bold" fontFamily="monospace">B:4</text>

            <circle cx="80" cy="62" r="11" fill="#34D399" stroke="#FFFFFF" strokeWidth="2.5" className="anim-pulse-fade" />
            <text x="80" y="65.5" textAnchor="middle" fill="#064E3B" fontSize="8" fontWeight="extrabold" fontFamily="monospace">C:2</text>

            <circle cx="135" cy="40" r="10" fill="#E0F2FE" stroke="#FFFFFF" strokeWidth="2" />
            <text x="135" y="43.5" textAnchor="middle" fill="#0369A1" fontSize="8" fontWeight="bold" fontFamily="monospace">D</text>
          </svg>
        </div>
      );

    case 'knapsack-01':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#065F46] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>2D DP Matrix Table</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>

          <div className="flex items-center justify-center gap-3 h-24">
            {/* Mini DP Grid */}
            <div className="grid grid-cols-4 gap-1 p-1.5 bg-black/25 rounded-lg border border-emerald-400/40 font-mono text-[10px]">
              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-white/70">0</div>
              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-white/70">1</div>
              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-white/70">1</div>
              <div className="w-6 h-6 rounded bg-cyan-400/40 border border-cyan-300 text-cyan-100 flex items-center justify-center font-bold">4</div>

              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-white/70">0</div>
              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-white/70">1</div>
              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-white/70">4</div>
              <div className="w-6 h-6 rounded bg-amber-300 text-emerald-950 font-extrabold flex items-center justify-center shadow-lg anim-pulse-fade">
                7
              </div>
            </div>

            <div className="flex flex-col gap-1 text-[10px] font-mono text-emerald-100">
              <span className="font-bold text-white">dp[i][w] = max</span>
              <span className="text-cyan-200">↑ exclude: 4</span>
              <span className="text-amber-200 font-bold">↗ include: 7</span>
            </div>
          </div>
        </div>
      );

    case 'graph-dfs':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#E11D48] to-[#9F1239] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-rose-100 uppercase tracking-wider">
            <span>DFS & Cycle Detection</span>
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping" />
          </div>

          <svg viewBox="0 0 160 80" className="w-48 h-24 mx-auto">
            {/* Tree edges */}
            <line x1="30" y1="40" x2="80" y2="18" stroke="#FECDD3" strokeWidth="2.5" />
            <line x1="80" y1="18" x2="130" y2="40" stroke="#FECDD3" strokeWidth="2.5" />
            <line x1="30" y1="40" x2="80" y2="62" stroke="#FECDD3" strokeWidth="2.5" />

            {/* Back edge (Cycle) with flowing dashes */}
            <path d="M 130 40 Q 80 8 30 40" fill="none" stroke="#FDE047" strokeWidth="2.5" className="anim-dash" />

            {/* Nodes */}
            <circle cx="30" cy="40" r="11" fill="#FFFFFF" stroke="#BE123C" strokeWidth="2" />
            <text x="30" y="43.5" textAnchor="middle" fill="#9F1239" fontSize="9" fontWeight="bold" fontFamily="monospace">0</text>

            <circle cx="80" cy="18" r="10" fill="#FFE4E6" stroke="#FFFFFF" strokeWidth="2" />
            <text x="80" y="21.5" textAnchor="middle" fill="#9F1239" fontSize="8" fontWeight="bold" fontFamily="monospace">1</text>

            <circle cx="130" cy="40" r="10" fill="#FDE047" stroke="#FFFFFF" strokeWidth="2.5" className="anim-pulse-fade" />
            <text x="130" y="43.5" textAnchor="middle" fill="#000" fontSize="8" fontWeight="extrabold" fontFamily="monospace">3</text>

            <circle cx="80" cy="62" r="10" fill="#FFE4E6" stroke="#FFFFFF" strokeWidth="2" />
            <text x="80" y="65.5" textAnchor="middle" fill="#9F1239" fontSize="8" fontWeight="bold" fontFamily="monospace">2</text>
          </svg>
        </div>
      );

    case 'trie-prefix':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0E7490] to-[#155E75] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Prefix Tree & Autocomplete</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>

          <svg viewBox="0 0 160 80" className="w-48 h-24 mx-auto">
            {/* Trie Branches */}
            <line x1="80" y1="12" x2="45" y2="35" stroke="#CFFAFE" strokeWidth="2" />
            <line x1="80" y1="12" x2="115" y2="35" stroke="#CFFAFE" strokeWidth="2" />
            <line x1="45" y1="35" x2="25" y2="60" stroke="#CFFAFE" strokeWidth="1.5" />
            <line x1="45" y1="35" x2="65" y2="60" stroke="#22D3EE" strokeWidth="2.5" />
            <line x1="115" y1="35" x2="115" y2="60" stroke="#CFFAFE" strokeWidth="1.5" />

            {/* Root */}
            <circle cx="80" cy="12" r="7" fill="#FFFFFF" />
            <text x="80" y="15" textAnchor="middle" fill="#155E75" fontSize="7" fontWeight="bold">*</text>

            {/* Level 1 */}
            <circle cx="45" cy="35" r="8" fill="#A5F3FC" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="45" y="38" textAnchor="middle" fill="#155E75" fontSize="8" fontWeight="bold" fontFamily="monospace">c</text>

            <circle cx="115" cy="35" r="8" fill="#CFFAFE" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="115" y="38" textAnchor="middle" fill="#155E75" fontSize="8" fontWeight="bold" fontFamily="monospace">d</text>

            {/* Level 2 Leaves */}
            <circle cx="25" cy="60" r="7" fill="#A5F3FC" />
            <text x="25" y="63" textAnchor="middle" fill="#155E75" fontSize="7" fontWeight="bold" fontFamily="monospace">a</text>

            {/* Word endings with green star */}
            <circle cx="65" cy="60" r="8" fill="#34D399" stroke="#FFFFFF" strokeWidth="2" className="anim-pulse-fade" />
            <text x="65" y="63" textAnchor="middle" fill="#064E3B" fontSize="8" fontWeight="extrabold" fontFamily="monospace">t★</text>

            <circle cx="115" cy="60" r="8" fill="#34D399" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="115" y="63" textAnchor="middle" fill="#064E3B" fontSize="8" fontWeight="bold" fontFamily="monospace">o★</text>
          </svg>
        </div>
      );

    case 'counting-sort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#3730A3] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Frequency Bucket Indexing</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 relative">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded bg-indigo-950/70 border border-indigo-400/50 flex items-center justify-center text-xs font-mono font-bold text-indigo-200 shadow">
                1: <span className="text-emerald-300 ml-1 anim-pulse-fade">2</span>
              </div>
              <div className="w-8 h-8 rounded bg-indigo-950/70 border border-indigo-400/50 flex items-center justify-center text-xs font-mono font-bold text-indigo-200 shadow">
                2: <span className="text-amber-300 ml-1 anim-pulse-fade">3</span>
              </div>
              <div className="w-8 h-8 rounded bg-indigo-950/70 border border-indigo-400/50 flex items-center justify-center text-xs font-mono font-bold text-indigo-200 shadow">
                3: <span className="text-sky-300 ml-1 anim-pulse-fade">1</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-indigo-200 bg-indigo-950/70 border border-indigo-300/30 px-2 py-0.5 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>count[x] → prefix_sum → output</span>
            </div>
          </div>
        </div>
      );

    case 'kruskal-mst':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0F766E] to-[#115E59] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Disjoint Set MST Union</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <svg viewBox="0 0 160 80" className="w-48 h-24 mx-auto">
            <line x1="30" y1="25" x2="80" y2="20" stroke="#34D399" strokeWidth="2.5" />
            <line x1="80" y1="20" x2="130" y2="35" stroke="#34D399" strokeWidth="2.5" />
            <line x1="30" y1="25" x2="60" y2="60" stroke="#34D399" strokeWidth="2.5" />
            {/* Rejected cycle edge flowing with anim-dash */}
            <line x1="80" y1="20" x2="60" y2="60" stroke="#F87171" strokeWidth="2" className="anim-dash" />
            <line x1="60" y1="60" x2="130" y2="35" stroke="#34D399" strokeWidth="2.5" />

            <circle cx="30" cy="25" r="7" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="80" cy="20" r="7" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="130" cy="35" r="7" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="60" cy="60" r="7" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="1.5" />

            <text x="30" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">A</text>
            <text x="80" y="23" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">B</text>
            <text x="130" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">C</text>
            <text x="60" y="63" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">D</text>
          </svg>
        </div>
      );

    case 'euclidean-gcd':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#B45309] to-[#78350F] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Greatest Common Divisor</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono">
            <div className="text-xs text-amber-200">
              gcd(<span className="text-white font-bold">252</span>, <span className="text-sky-300 font-bold">105</span>)
            </div>
            <div className="text-[11px] text-amber-300 flex items-center gap-1">
              <span>252 = 2 × 105 +</span>
              <span className="text-rose-300 font-bold animate-pulse">42</span>
            </div>
            <div className="text-[10px] bg-black/40 border border-emerald-400/40 px-2.5 py-0.5 rounded text-emerald-300 font-bold shadow anim-pulse-fade">
              GCD = 21
            </div>
          </div>
        </div>
      );

    case 'radix-sort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>LSD Digit Buckets</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-black/40 text-purple-200 text-xs font-bold border border-purple-400/40">17<strong className="text-amber-300 anim-pulse-fade">0</strong></span>
              <span className="px-2 py-1 rounded bg-black/40 text-purple-200 text-xs font-bold border border-purple-400/40">80<strong className="text-amber-300 anim-pulse-fade">2</strong></span>
              <span className="px-2 py-1 rounded bg-black/40 text-purple-200 text-xs font-bold border border-purple-400/40">02<strong className="text-amber-300 anim-pulse-fade">4</strong></span>
              <span className="px-2 py-1 rounded bg-black/40 text-purple-200 text-xs font-bold border border-purple-400/40">04<strong className="text-amber-300 anim-pulse-fade">5</strong></span>
            </div>
            <div className="text-[10px] text-purple-200/80">pass 1: [1s] → pass 2: [10s] → pass 3: [100s]</div>
          </div>
        </div>
      );

    case 'kmp-search':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>LPS Table Skip O(N+M)</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400">T:</span>
              <span className="bg-sky-950/70 border border-sky-400/40 px-2 py-0.5 rounded text-white font-bold">A B A B C A B</span>
            </div>
            <div className="flex items-center gap-1 text-xs anim-window-slide">
              <span className="text-slate-400">P:</span>
              <span className="bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 rounded text-amber-200 font-bold">A B C</span>
            </div>
            <div className="text-[10px] text-sky-200">π[j-1] prevents text backtracking</div>
          </div>
        </div>
      );

    case 'heapsort':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Max-Heap In-Place Sort</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>

          <svg viewBox="0 0 140 70" className="w-40 h-24 mx-auto">
            <line x1="70" y1="16" x2="40" y2="40" stroke="#FDE68A" strokeWidth="2" />
            <line x1="70" y1="16" x2="100" y2="40" stroke="#FDE68A" strokeWidth="2" />
            <line x1="40" y1="40" x2="24" y2="60" stroke="#FCD34D" strokeWidth="1.5" />
            <line x1="40" y1="40" x2="56" y2="60" stroke="#FCD34D" strokeWidth="1.5" />

            <circle cx="70" cy="16" r="9" fill="#FFFFFF" className="anim-pulse-fade" />
            <text x="70" y="19.5" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="extrabold" fontFamily="monospace">99</text>

            <circle cx="40" cy="40" r="7.5" fill="#FEF3C7" />
            <text x="40" y="43" textAnchor="middle" fill="#92400E" fontSize="7" fontWeight="bold" fontFamily="monospace">72</text>

            <circle cx="100" cy="40" r="7.5" fill="#FEF3C7" />
            <text x="100" y="43" textAnchor="middle" fill="#92400E" fontSize="7" fontWeight="bold" fontFamily="monospace">64</text>

            <circle cx="24" cy="60" r="6" fill="#FDE68A" />
            <text x="24" y="62" textAnchor="middle" fill="#92400E" fontSize="5.5" fontFamily="monospace">35</text>

            <circle cx="56" cy="60" r="6" fill="#10B981" />
            <text x="56" y="62" textAnchor="middle" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="monospace">12</text>

            <path d="M 64 22 C 40 30, 48 50, 52 56" fill="none" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="2 2" className="anim-arrow-flow" />
          </svg>

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-amber-100">
            <span className="text-amber-300 font-bold">swap(root, last)</span>
            <span>& siftDown(0)</span>
          </div>
        </div>
      );

    case 'doubly-linked-list':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#1D4ED8] to-[#1E40AF] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-100 uppercase tracking-wider">
            <span>Bidirectional Pointers</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono text-xs">
            <span className="text-[10px] text-blue-300">NULL</span>
            <span className="text-white font-bold">⇄</span>
            <div className="px-2 py-1 bg-white text-blue-950 rounded shadow font-bold">[10]</div>
            <span className="text-cyan-300 font-bold anim-arrow-flow">⇄</span>
            <div className="px-2 py-1 bg-cyan-300 text-blue-950 rounded shadow font-bold">[25]</div>
            <span className="text-white font-bold">⇄</span>
            <div className="px-2 py-1 bg-white text-blue-950 rounded shadow font-bold">[40]</div>
          </div>
        </div>
      );

    case 'queue-fifo':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0891B2] to-[#0E7490] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>FIFO Enqueue & Dequeue</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono">
            <div className="text-[10px] text-cyan-200 flex flex-col items-center">
              <span>HEAD</span>
              <span className="anim-arrow-flow">↓ pop</span>
            </div>
            <div className="flex border-y-2 border-cyan-300/80 px-2 py-1 gap-1.5 bg-black/20 rounded">
              <span className="w-7 h-7 bg-white text-cyan-950 font-bold rounded flex items-center justify-center text-xs shadow">1</span>
              <span className="w-7 h-7 bg-cyan-200 text-cyan-950 font-bold rounded flex items-center justify-center text-xs shadow">2</span>
              <span className="w-7 h-7 bg-cyan-300 text-cyan-950 font-bold rounded flex items-center justify-center text-xs shadow">3</span>
            </div>
            <div className="text-[10px] text-cyan-200 flex flex-col items-center">
              <span>TAIL</span>
              <span className="anim-arrow-flow">push →</span>
            </div>
          </div>
        </div>
      );

    case 'avl-tree':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>AVL Balance & Rotations</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>

          <svg viewBox="0 0 140 70" className="w-40 h-24 mx-auto">
            <line x1="70" y1="16" x2="40" y2="40" stroke="#C7D2FE" strokeWidth="2" />
            <line x1="70" y1="16" x2="100" y2="40" stroke="#C7D2FE" strokeWidth="2" />
            <line x1="40" y1="40" x2="24" y2="60" stroke="#818CF8" strokeWidth="1.5" />

            {/* Rotation Arc Arrow */}
            <path d="M 46 22 A 20 20 0 0 1 88 22" fill="none" stroke="#FDE047" strokeWidth="2" strokeDasharray="3 2" className="anim-arrow-flow" />
            <polygon points="86,18 92,23 85,26" fill="#FDE047" />

            {/* Root Node (40) */}
            <circle cx="70" cy="16" r="9" fill="#FFFFFF" className="anim-pulse-fade" />
            <text x="70" y="19" textAnchor="middle" fill="#312E81" fontSize="8" fontWeight="extrabold" fontFamily="monospace">40</text>
            <rect x="80" y="8" width="26" height="10" rx="3" fill="#F59E0B" />
            <text x="93" y="15.5" textAnchor="middle" fill="#1E1B4B" fontSize="6.5" fontWeight="extrabold" fontFamily="monospace">BF:+2</text>

            {/* Left Child (20) */}
            <circle cx="40" cy="40" r="8" fill="#C7D2FE" />
            <text x="40" y="43" textAnchor="middle" fill="#312E81" fontSize="7.5" fontWeight="bold" fontFamily="monospace">20</text>

            {/* Right Child (50) */}
            <circle cx="100" cy="40" r="8" fill="#C7D2FE" />
            <text x="100" y="43" textAnchor="middle" fill="#312E81" fontSize="7.5" fontWeight="bold" fontFamily="monospace">50</text>

            {/* Grandchild (10) */}
            <circle cx="24" cy="60" r="6" fill="#A5B4FC" />
            <text x="24" y="62.5" textAnchor="middle" fill="#312E81" fontSize="6" fontWeight="bold" fontFamily="monospace">10</text>
          </svg>

          <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-indigo-200">
            <span className="text-amber-300 font-bold">↻ Right Rotation</span>
            <span>restores O(log N)</span>
          </div>
        </div>
      );

    case 'tree-traversals':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0D9488] to-[#0F766E] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Inorder Preorder Postorder</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>

          <svg viewBox="0 0 140 70" className="w-40 h-24 mx-auto">
            <line x1="70" y1="16" x2="38" y2="38" stroke="#99F6E4" strokeWidth="2" />
            <line x1="70" y1="16" x2="102" y2="38" stroke="#99F6E4" strokeWidth="2" />
            <line x1="38" y1="38" x2="22" y2="58" stroke="#5EEAD4" strokeWidth="1.5" />
            <line x1="38" y1="38" x2="54" y2="58" stroke="#5EEAD4" strokeWidth="1.5" />

            {/* Animated Traversal Wave Tracker */}
            <circle cx="22" cy="58" r="10" fill="none" stroke="#FDE047" strokeWidth="2" className="anim-pulse-fade" />

            {/* Root Node A */}
            <circle cx="70" cy="16" r="8.5" fill="#FFFFFF" />
            <text x="70" y="19" textAnchor="middle" fill="#115E59" fontSize="8" fontWeight="bold" fontFamily="monospace">A</text>

            {/* Left Subtree B */}
            <circle cx="38" cy="38" r="8" fill="#CCFBF1" />
            <text x="38" y="41" textAnchor="middle" fill="#115E59" fontSize="7.5" fontWeight="bold" fontFamily="monospace">B</text>

            {/* Right Subtree C */}
            <circle cx="102" cy="38" r="8" fill="#CCFBF1" />
            <text x="102" y="41" textAnchor="middle" fill="#115E59" fontSize="7.5" fontWeight="bold" fontFamily="monospace">C</text>

            {/* Leaves D & E */}
            <circle cx="22" cy="58" r="6.5" fill="#2DD4BF" />
            <text x="22" y="60.5" textAnchor="middle" fill="#042F2E" fontSize="6.5" fontWeight="bold" fontFamily="monospace">D</text>

            <circle cx="54" cy="58" r="6.5" fill="#99F6E4" />
            <text x="54" y="60.5" textAnchor="middle" fill="#115E59" fontSize="6.5" fontWeight="bold" fontFamily="monospace">E</text>
          </svg>

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-teal-100">
            <span className="px-1.5 py-0.5 rounded bg-black/30 border border-teal-300/30">
              <strong className="text-amber-300">D</strong> → B → E → <strong className="text-white">A</strong> → C
            </span>
          </div>
        </div>
      );

    case 'prim-mst':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Greedy MST Cut Property</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24 font-mono">
            <div className="w-8 h-8 rounded-full bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center justify-center shadow">U</div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-amber-300 font-bold">w=2</span>
              <span className="text-white text-xs font-bold">───▶</span>
              <span className="text-[9px] text-emerald-200">min edge</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white text-emerald-950 font-bold text-xs flex items-center justify-center shadow animate-pulse">V</div>
          </div>
        </div>
      );

    case 'rabin-karp':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#9333EA] to-[#7E22CE] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>Rolling Hash Pattern Search</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 bg-black/40 rounded border border-purple-400/40 text-purple-200">Text: "A B C D E"</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-purple-100">
              <span className="px-1.5 py-0.5 bg-amber-400 text-purple-950 rounded font-bold">Hash = 412</span>
              <span>==</span>
              <span className="px-1.5 py-0.5 bg-emerald-400 text-purple-950 rounded font-bold">Target = 412</span>
            </div>
            <div className="text-[10px] text-purple-200/80">O(1) Rolling Window Update</div>
          </div>
        </div>
      );

    case 'coin-change':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Fewest Coins Bottom-Up DP</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-300 text-amber-950 font-bold text-xs flex items-center justify-center shadow">1¢</span>
              <span className="w-7 h-7 rounded-full bg-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center shadow">2¢</span>
              <span className="w-7 h-7 rounded-full bg-white text-amber-950 font-bold text-xs flex items-center justify-center shadow">5¢</span>
            </div>
            <div className="text-xs text-amber-100 bg-black/30 px-2.5 py-1 rounded border border-amber-400/40">
              dp[11] = <strong className="text-emerald-300">3</strong> <span className="text-[10px] text-amber-200">(5 + 5 + 1)</span>
            </div>
          </div>
        </div>
      );

    case 'longest-increasing-subsequence':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Longest Increasing Subsequence</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex gap-1.5 text-xs">
              <span className="w-6 h-6 rounded bg-sky-950/60 text-slate-400 flex items-center justify-center">10</span>
              <span className="w-6 h-6 rounded bg-emerald-400 text-sky-950 font-bold flex items-center justify-center shadow">2</span>
              <span className="w-6 h-6 rounded bg-emerald-400 text-sky-950 font-bold flex items-center justify-center shadow">5</span>
              <span className="w-6 h-6 rounded bg-emerald-400 text-sky-950 font-bold flex items-center justify-center shadow">7</span>
              <span className="w-6 h-6 rounded bg-emerald-400 text-sky-950 font-bold flex items-center justify-center shadow">18</span>
            </div>
            <div className="text-xs text-sky-100 font-bold">LIS Length = 4</div>
          </div>
        </div>
      );

    case 'tower-of-hanoi':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#E11D48] to-[#BE123C] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-rose-100 uppercase tracking-wider">
            <span>Recursive Disk Transfer</span>
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping" />
          </div>
          <div className="flex items-end justify-center gap-6 h-24 pb-1">
            <div className="flex flex-col items-center">
              <div className="w-1 h-14 bg-rose-300/60 relative flex flex-col-reverse items-center">
                <div className="w-10 h-3 bg-white rounded-sm shadow-md" />
                <div className="w-7 h-3 bg-amber-300 rounded-sm shadow-md" />
              </div>
              <span className="text-[10px] font-mono text-rose-200 mt-1 font-bold">A</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-1 h-14 bg-rose-300/60 relative flex flex-col-reverse items-center" />
              <span className="text-[10px] font-mono text-rose-200 mt-1 font-bold">B</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-1 h-14 bg-rose-300/60 relative flex flex-col-reverse items-center">
                <div className="w-4 h-3 bg-emerald-300 rounded-sm shadow-md animate-bounce" />
              </div>
              <span className="text-[10px] font-mono text-rose-200 mt-1 font-bold">C</span>
            </div>
          </div>
        </div>
      );

    case 'disjoint-set-union':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Path Compression & Union</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>

          <svg viewBox="0 0 140 70" className="w-40 h-24 mx-auto">
            {/* Standard Branch */}
            <line x1="70" y1="16" x2="42" y2="40" stroke="#C7D2FE" strokeWidth="2" />
            <line x1="42" y1="40" x2="24" y2="60" stroke="#818CF8" strokeWidth="1.5" />

            {/* Compressed Direct Branch */}
            <path d="M 100 58 Q 85 30 72 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 2" className="anim-arrow-flow" />
            <polygon points="70,22 75,26 71,28" fill="#38BDF8" />

            {/* Root 1 */}
            <circle cx="70" cy="16" r="9" fill="#10B981" />
            <text x="70" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="extrabold" fontFamily="monospace">1</text>
            <text x="70" y="6" textAnchor="middle" fill="#A7F3D0" fontSize="6" fontWeight="bold" fontFamily="monospace">ROOT</text>

            {/* Child 2 */}
            <circle cx="42" cy="40" r="7.5" fill="#E0E7FF" />
            <text x="42" y="43" textAnchor="middle" fill="#312E81" fontSize="7" fontWeight="bold" fontFamily="monospace">2</text>

            {/* Leaf 3 */}
            <circle cx="24" cy="60" r="6" fill="#C7D2FE" />
            <text x="24" y="62" textAnchor="middle" fill="#312E81" fontSize="5.5" fontFamily="monospace">3</text>

            {/* Compressed Child 4 */}
            <circle cx="100" cy="60" r="7" fill="#38BDF8" className="anim-pulse-fade" />
            <text x="100" y="62.5" textAnchor="middle" fill="#0C4A6E" fontSize="6.5" fontWeight="extrabold" fontFamily="monospace">4</text>
          </svg>

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-indigo-200">
            <span className="text-cyan-300 font-bold">find(4): parent[4]=1</span>
            <span>(O(α(N)))</span>
          </div>
        </div>
      );

    case 'bellman-ford':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#BE123C] to-[#9F1239] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-rose-100 uppercase tracking-wider">
            <span>Negative Weights & Cycle Check</span>
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24 font-mono">
            <div className="w-8 h-8 rounded-full bg-white text-rose-950 font-bold text-xs flex items-center justify-center shadow">u: 5</div>
            <div className="flex flex-col items-center">
              <span className="text-amber-300 text-[10px] font-bold">w = -3</span>
              <span className="text-white text-xs font-bold anim-arrow-flow">───▶</span>
              <span className="text-[9px] text-rose-200">relax: 5 + (-3)</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-400 text-rose-950 font-bold text-xs flex items-center justify-center shadow">v: 2</div>
          </div>
        </div>
      );

    case 'floyd-warshall':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#7E22CE] to-[#6B21A8] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>All-Pairs Shortest Path Matrix</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 h-24 font-mono">
            <div className="grid grid-cols-3 gap-1 bg-black/30 p-1.5 rounded border border-purple-400/40">
              <span className="w-6 h-6 bg-purple-950/60 text-purple-300 rounded text-xs flex items-center justify-center">0</span>
              <span className="w-6 h-6 bg-purple-950/60 text-purple-300 rounded text-xs flex items-center justify-center">3</span>
              <span className="w-6 h-6 bg-emerald-400 text-purple-950 font-bold rounded text-xs flex items-center justify-center shadow">5</span>
              <span className="w-6 h-6 bg-purple-950/60 text-purple-300 rounded text-xs flex items-center justify-center">2</span>
              <span className="w-6 h-6 bg-purple-950/60 text-purple-300 rounded text-xs flex items-center justify-center">0</span>
              <span className="w-6 h-6 bg-purple-950/60 text-purple-300 rounded text-xs flex items-center justify-center">4</span>
            </div>
            <div className="text-[10px] text-purple-200">D[i][j] = min(D[i][j], D[i][k] + D[k][j])</div>
          </div>
        </div>
      );

    case 'a-star-search':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Heuristic Pathfinding (f = g + h)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24 font-mono">
            <div className="w-8 h-8 rounded bg-emerald-300 text-emerald-950 font-bold text-xs flex items-center justify-center shadow">S</div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-amber-300 font-bold">f = 4 + 2</span>
              <span className="text-white text-xs font-bold anim-arrow-flow">─────▶</span>
              <span className="text-[9px] text-emerald-200">optimal hop</span>
            </div>
            <div className="w-8 h-8 rounded bg-white text-emerald-950 font-bold text-xs flex items-center justify-center shadow animate-pulse">🎯</div>
          </div>
        </div>
      );

    case 'kadanes-algorithm':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0D9488] to-[#0F766E] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Maximum Subarray Sum</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex gap-1 items-center relative p-1">
              <span className="w-6 h-7 rounded bg-black/30 text-teal-200 text-xs flex items-center justify-center opacity-70">-2</span>
              {/* Animated contiguous max subarray window */}
              <div className="flex gap-1 p-0.5 rounded border border-emerald-300 bg-emerald-400/20 anim-pulse-fade shadow-md">
                <span className="w-6 h-7 rounded bg-emerald-400 text-teal-950 font-extrabold text-xs flex items-center justify-center shadow">4</span>
                <span className="w-6 h-7 rounded bg-emerald-400 text-teal-950 font-extrabold text-xs flex items-center justify-center shadow">-1</span>
                <span className="w-6 h-7 rounded bg-emerald-400 text-teal-950 font-extrabold text-xs flex items-center justify-center shadow">2</span>
                <span className="w-6 h-7 rounded bg-emerald-400 text-teal-950 font-extrabold text-xs flex items-center justify-center shadow">1</span>
              </div>
              <span className="w-6 h-7 rounded bg-black/30 text-teal-200 text-xs flex items-center justify-center opacity-70">-5</span>
            </div>
            <div className="text-xs text-white font-bold bg-black/40 border border-teal-300/30 px-2.5 py-0.5 rounded flex items-center gap-1.5">
              <span className="text-amber-300">max_ending_here</span>
              <span>→ Sum = 6</span>
            </div>
          </div>
        </div>
      );

    case 'edit-distance':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Levenshtein Distance Matrix</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24 font-mono">
            <div className="grid grid-cols-3 gap-1 bg-black/35 p-1.5 rounded border border-indigo-400/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent anim-scan pointer-events-none" />
              <span className="w-6 h-6 bg-indigo-950/60 text-indigo-300 rounded text-xs flex items-center justify-center">0</span>
              <span className="w-6 h-6 bg-indigo-950/60 text-indigo-300 rounded text-xs flex items-center justify-center">1</span>
              <span className="w-6 h-6 bg-indigo-950/60 text-indigo-300 rounded text-xs flex items-center justify-center">2</span>
              <span className="w-6 h-6 bg-indigo-950/60 text-indigo-300 rounded text-xs flex items-center justify-center">1</span>
              <span className="w-6 h-6 bg-emerald-400 text-indigo-950 font-extrabold rounded text-xs flex items-center justify-center shadow anim-pulse-fade">1</span>
              <span className="w-6 h-6 bg-indigo-950/60 text-indigo-300 rounded text-xs flex items-center justify-center">2</span>
            </div>
            <div className="flex flex-col gap-1 text-[10px] text-indigo-100">
              <span className="text-amber-300 font-bold anim-arrow-flow">↖ diag-match: 0 cost</span>
              <span className="text-indigo-200">min(ins, del, rep)</span>
            </div>
          </div>
        </div>
      );

    case 'z-algorithm':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0284C7] to-[#0369A1] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-100 uppercase tracking-wider">
            <span>Linear Z-Box Match</span>
            <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex gap-1 relative p-1 rounded bg-black/25">
              <span className="w-6 h-6 bg-black/40 text-slate-300 rounded text-xs flex items-center justify-center">a</span>
              <span className="w-6 h-6 bg-black/40 text-slate-300 rounded text-xs flex items-center justify-center">a</span>
              <span className="w-6 h-6 bg-sky-950 text-sky-200 border border-sky-300 rounded text-xs flex items-center justify-center font-bold">b</span>
              <div className="flex gap-1 p-0.5 rounded border border-amber-300 anim-pulse-fade">
                <span className="w-6 h-6 bg-amber-400 text-sky-950 rounded text-xs flex items-center justify-center font-extrabold shadow">a</span>
                <span className="w-6 h-6 bg-amber-400 text-sky-950 rounded text-xs flex items-center justify-center font-extrabold shadow">a</span>
              </div>
            </div>
            <div className="text-[10px] text-sky-100 font-bold">Z-Box [l, r] = length 2 prefix match</div>
          </div>
        </div>
      );

    case 'house-robber':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Non-Adjacent Max Sum DP</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex gap-2">
              <div className="px-2 py-1 bg-black/30 rounded text-xs text-amber-200 flex flex-col items-center opacity-60"><span>🏠</span><span>2</span></div>
              <div className="px-2 py-1 bg-emerald-400 text-amber-950 rounded text-xs font-extrabold flex flex-col items-center shadow-lg anim-pulse-fade"><span>💰</span><span>7</span></div>
              <div className="px-2 py-1 bg-black/30 rounded text-xs text-amber-200 flex flex-col items-center opacity-60"><span>🏠</span><span>9</span></div>
              <div className="px-2 py-1 bg-emerald-400 text-amber-950 rounded text-xs font-extrabold flex flex-col items-center shadow-lg anim-pulse-fade"><span>💰</span><span>3</span></div>
              <div className="px-2 py-1 bg-black/30 rounded text-xs text-amber-200 flex flex-col items-center opacity-60"><span>🏠</span><span>1</span></div>
            </div>
            <div className="text-[10px] text-amber-100 font-bold bg-black/30 px-2 py-0.5 rounded">Max Loot = 10 (7 + 3 non-adjacent)</div>
          </div>
        </div>
      );

    case 'n-queens':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#7E22CE] to-[#6B21A8] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>Backtracking Board Constraints</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24">
            <div className="grid grid-cols-4 gap-0.5 p-1 bg-black/40 rounded border border-purple-400/40">
              <span className="w-5 h-5 bg-purple-900/60 rounded-xs flex items-center justify-center text-xs">·</span>
              <span className="w-5 h-5 bg-amber-400 text-purple-950 rounded-xs flex items-center justify-center text-xs font-bold shadow anim-pulse-fade">♛</span>
              <span className="w-5 h-5 bg-purple-900/60 rounded-xs flex items-center justify-center text-xs">·</span>
              <span className="w-5 h-5 bg-purple-900/60 rounded-xs flex items-center justify-center text-xs">·</span>
              <span className="w-5 h-5 bg-purple-900/60 rounded-xs flex items-center justify-center text-xs">·</span>
              <span className="w-5 h-5 bg-purple-900/60 rounded-xs flex items-center justify-center text-xs">·</span>
              <span className="w-5 h-5 bg-purple-900/60 rounded-xs flex items-center justify-center text-xs">·</span>
              <span className="w-5 h-5 bg-amber-400 text-purple-950 rounded-xs flex items-center justify-center text-xs font-bold shadow anim-pulse-fade">♛</span>
            </div>
            <div className="text-[10px] font-mono text-purple-200 flex flex-col gap-0.5">
              <span className="text-amber-300 font-bold">col / diag check</span>
              <span>safe placement</span>
            </div>
          </div>
        </div>
      );

    case 'reverse-linked-list':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#1D4ED8] to-[#1E40AF] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-100 uppercase tracking-wider">
            <span>In-Place Pointer Inversion</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-2 h-24 font-mono">
            <span className="px-2 py-1 bg-white text-blue-950 rounded font-bold text-xs shadow">1</span>
            <span className="text-amber-300 font-bold text-sm anim-arrow-flow">◀──</span>
            <span className="px-2 py-1 bg-cyan-300 text-blue-950 rounded font-bold text-xs shadow anim-pulse-fade">2</span>
            <span className="text-amber-300 font-bold text-sm anim-arrow-flow">◀──</span>
            <span className="px-2 py-1 bg-white text-blue-950 rounded font-bold text-xs shadow">3</span>
          </div>
        </div>
      );

    case 'monotonic-stack':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#4F46E5] to-[#4338CA] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-100 uppercase tracking-wider">
            <span>Next Greater Element</span>
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-4 h-24 font-mono">
            <div className="w-16 h-20 bg-black/30 border-2 border-indigo-300 rounded-b-xl flex flex-col-reverse p-1 gap-1 items-center">
              <span className="w-full py-0.5 bg-white text-indigo-950 font-bold text-xs rounded text-center">80</span>
              <span className="w-full py-0.5 bg-indigo-200 text-indigo-950 font-bold text-xs rounded text-center">60</span>
              <span className="w-full py-0.5 bg-amber-300 text-indigo-950 font-bold text-xs rounded text-center animate-pulse">40</span>
            </div>
            <div className="text-[10px] text-indigo-200 flex flex-col gap-0.5">
              <span>Stack: Monotonic ↓</span>
              <span className="text-emerald-300 font-bold">pop 40 on 75</span>
            </div>
          </div>
        </div>
      );

    case 'binary-exponentiation':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#D97706] to-[#B45309] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-100 uppercase tracking-wider">
            <span>Fast Modular Power a^b mod m</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="text-xs font-bold text-white bg-black/35 border border-amber-400/40 px-3 py-1 rounded shadow flex items-center gap-1">
              <span>3<sup>13</sup> =</span>
              <span className="text-amber-300 anim-pulse-fade">3<sup>8</sup></span>
              <span>·</span>
              <span className="text-amber-300 anim-pulse-fade">3<sup>4</sup></span>
              <span>·</span>
              <span className="text-amber-300 anim-pulse-fade">3<sup>1</sup></span>
            </div>
            <div className="text-[10px] text-amber-200 font-bold anim-arrow-flow">O(log B) repeated squaring</div>
          </div>
        </div>
      );

    case 'rotated-sorted-array':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0891B2] to-[#0E7490] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-100 uppercase tracking-wider">
            <span>Pivot Invariant Binary Search</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex gap-1 items-end relative">
              <span className="w-5 h-9 bg-white text-cyan-950 font-bold text-xs flex items-center justify-center rounded">4</span>
              <span className="w-5 h-12 bg-white text-cyan-950 font-bold text-xs flex items-center justify-center rounded">5</span>
              <span className="w-5 h-14 bg-white text-cyan-950 font-bold text-xs flex items-center justify-center rounded">6</span>
              <span className="w-1 h-14 bg-rose-400 mx-1 anim-pulse-fade shadow-sm shadow-rose-300" />
              <span className="w-5 h-6 bg-cyan-200 text-cyan-950 font-bold text-xs flex items-center justify-center rounded">0</span>
              <span className="w-5 h-8 bg-cyan-200 text-cyan-950 font-bold text-xs flex items-center justify-center rounded">1</span>
              <span className="w-5 h-10 bg-cyan-200 text-cyan-950 font-bold text-xs flex items-center justify-center rounded">2</span>
            </div>
            <div className="text-[10px] text-cyan-100 font-bold flex items-center gap-1">
              <span className="text-rose-300">cliff pivot</span>
              <span>→ binary search sorted half</span>
            </div>
          </div>
        </div>
      );

    case 'longest-palindromic-substring':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Expand Around Center</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex gap-2 items-center">
              <span className="text-amber-300 font-bold text-xs anim-pointer-l">← L</span>
              <span className="w-6 h-6 rounded bg-emerald-300 text-emerald-950 font-bold text-xs flex items-center justify-center">a</span>
              <span className="w-7 h-7 rounded bg-white text-emerald-950 font-bold text-sm flex items-center justify-center shadow anim-pulse-fade">b</span>
              <span className="w-6 h-6 rounded bg-emerald-300 text-emerald-950 font-bold text-xs flex items-center justify-center">a</span>
              <span className="text-amber-300 font-bold text-xs anim-pointer-r">R →</span>
            </div>
            <div className="text-[10px] text-emerald-100 font-bold">outward expansion matches "aba"</div>
          </div>
        </div>
      );

    case 'floyd-cycle-detection':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#059669] to-[#047857] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-100 uppercase tracking-wider">
            <span>Tortoise & Hare Cycle Pointer</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="flex items-center justify-center gap-3 h-24 font-mono">
            <div className="w-7 h-7 rounded-full bg-white text-emerald-950 font-bold text-xs flex items-center justify-center shadow">1</div>
            <span className="text-white text-xs anim-arrow-flow">→</span>
            <div className="w-16 h-16 rounded-full border-2 border-emerald-300 border-dashed flex items-center justify-center relative anim-spin-slow">
              <span className="absolute top-0 text-[10px] bg-amber-300 text-emerald-950 px-1 rounded font-bold">🐢 1x</span>
              <span className="absolute bottom-0 text-[10px] bg-cyan-300 text-emerald-950 px-1 rounded font-bold">🐇 2x</span>
              <span className="text-[9px] text-white font-bold">CYCLE</span>
            </div>
          </div>
        </div>
      );

    case 'activity-selection-greedy':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#0D9488] to-[#0F766E] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-100 uppercase tracking-wider">
            <span>Interval Scheduling Greedy</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <div className="flex flex-col justify-center gap-1.5 h-24 font-mono px-4 relative overflow-hidden">
            <div className="absolute inset-y-0 w-1 bg-amber-300/80 anim-scan shadow-lg shadow-amber-300 pointer-events-none" />
            <div className="h-4 bg-emerald-400 text-teal-950 rounded text-[9px] font-bold px-2 flex items-center justify-between shadow w-3/4">
              <span>[1..4] ✓</span>
            </div>
            <div className="h-4 bg-rose-400/40 text-rose-200 line-through rounded text-[9px] font-bold px-2 flex items-center justify-between w-2/3 ml-6">
              <span>[3..5] ✗</span>
            </div>
            <div className="h-4 bg-emerald-400 text-teal-950 rounded text-[9px] font-bold px-2 flex items-center justify-between shadow w-1/2 ml-20">
              <span>[5..7] ✓</span>
            </div>
          </div>
        </div>
      );

    case 'bitwise-operations':
      return (
        <div className="w-full h-40 bg-gradient-to-b from-[#7E22CE] to-[#6B21A8] rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-100 uppercase tracking-wider">
            <span>8-Bit Register Manipulation</span>
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-ping" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 h-24 font-mono">
            <div className="flex gap-1 relative p-1 rounded bg-black/30">
              <span className="w-5 h-6 bg-black/40 text-purple-300 rounded text-xs flex items-center justify-center">0</span>
              <span className="w-5 h-6 bg-black/40 text-purple-300 rounded text-xs flex items-center justify-center">0</span>
              <span className="w-5 h-6 bg-emerald-400 text-purple-950 font-bold rounded text-xs flex items-center justify-center shadow">1</span>
              <span className="w-5 h-6 bg-black/40 text-purple-300 rounded text-xs flex items-center justify-center">0</span>
              <span className="w-5 h-6 bg-emerald-400 text-purple-950 font-bold rounded text-xs flex items-center justify-center shadow">1</span>
              <span className="w-5 h-6 bg-emerald-400 text-purple-950 font-bold rounded text-xs flex items-center justify-center shadow">1</span>
              <span className="w-5 h-6 bg-black/40 text-purple-300 rounded text-xs flex items-center justify-center">0</span>
              {/* Lowest set bit glowing */}
              <span className="w-5 h-6 bg-amber-400 text-purple-950 font-extrabold rounded text-xs flex items-center justify-center shadow-lg anim-pulse-fade">1</span>
            </div>
            <div className="text-[10px] text-purple-200 flex items-center gap-1.5">
              <span className="text-amber-300 font-bold anim-arrow-flow">isolate: x & -x</span>
              <span>→ lowest set bit</span>
            </div>
          </div>
        </div>
      );

    default: {
      const getCategoryGradient = (cat: string) => {
        switch (cat) {
          case 'sorting':
            return 'from-[#059669] to-[#047857] text-emerald-100';
          case 'searching':
            return 'from-[#0284C7] to-[#0369A1] text-sky-100';
          case 'linked-lists':
            return 'from-[#1D4ED8] to-[#1E40AF] text-blue-100';
          case 'trees-bst':
            return 'from-[#4F46E5] to-[#4338CA] text-indigo-100';
          case 'graphs':
            return 'from-[#0E7490] to-[#155E75] text-cyan-100';
          case 'dynamic-programming':
            return 'from-[#9333EA] to-[#7E22CE] text-purple-100';
          case 'math':
            return 'from-[#D97706] to-[#B45309] text-amber-100';
          case 'stack-queue':
            return 'from-[#6366F1] to-[#4F46E5] text-indigo-100';
          default:
            return 'from-[#1F2937] to-[#111827] text-slate-200';
        }
      };

      const grad = getCategoryGradient(category);

      return (
        <div className={`w-full h-40 bg-gradient-to-b ${grad} rounded-xl flex flex-col justify-between p-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition-transform`}>
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider">
            <span>{category.replace('-', ' ')}</span>
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
          <div className="flex items-center justify-center h-24">
            <div className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/20 text-xs font-mono font-bold text-white shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Interactive StepDSA Sandbox</span>
            </div>
          </div>
        </div>
      );
    }
  }
};
