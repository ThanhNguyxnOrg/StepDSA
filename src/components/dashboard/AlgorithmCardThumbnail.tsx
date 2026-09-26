import React from 'react';

interface AlgorithmCardThumbnailProps {
  moduleId: string;
  category: string;
}

export const AlgorithmCardThumbnail: React.FC<AlgorithmCardThumbnailProps> = ({ moduleId }) => {
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
            <span>Binary Max Heap</span>
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>

          <div className="flex flex-col items-center justify-center gap-1.5 h-24">
            <div className="w-7 h-7 rounded-full bg-white text-teal-950 font-mono text-xs font-extrabold flex items-center justify-center shadow-md anim-pulse-fade">
              95
            </div>
            <div className="flex gap-10">
              <div className="w-6 h-6 rounded-full bg-teal-200 text-teal-950 font-mono text-[10px] font-bold flex items-center justify-center shadow">
                75
              </div>
              <div className="w-6 h-6 rounded-full bg-teal-200 text-teal-950 font-mono text-[10px] font-bold flex items-center justify-center shadow">
                80
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-[9px] font-mono text-teal-200">left: 2i+1</span>
              <span className="text-[9px] font-mono text-teal-200">right: 2i+2</span>
            </div>
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

            {/* Back edge (Cycle) */}
            <path d="M 130 40 Q 80 8 30 40" fill="none" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="3 3" />

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

    default:
      return (
        <div className="w-full h-40 bg-slate-800 rounded-xl flex items-center justify-center">
          <span className="text-xs font-mono text-slate-400">Interactive Sandbox</span>
        </div>
      );
  }
};
