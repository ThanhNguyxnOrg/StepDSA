import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Clock,
  Database,
  ArrowRight,
  Keyboard,
  Layers,
  Cpu,
  Sliders,
  Terminal,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { AlgorithmModule } from '../../core/types';
import { AlgorithmCardThumbnail } from './AlgorithmCardThumbnail';

interface DashboardViewProps {
  modules: AlgorithmModule[];
  onSelectModule: (module: AlgorithmModule) => void;
  onOpenPersonalStudio?: () => void;
}

// Short, iconic algorithm metadata inspired by VisuAlgo
const ALGO_METADATA: Record<
  string,
  { shortTitle: string; subtitle: string; tags: string[]; themeColor: string }
> = {
  'quicksort': {
    shortTitle: 'Quicksort',
    subtitle: 'Pivot Partitioning',
    tags: ['divide & conquer', 'in-place', 'pivot'],
    themeColor: 'cyan',
  },
  'mergesort': {
    shortTitle: 'Mergesort',
    subtitle: 'Divide & Conquer',
    tags: ['divide & conquer', 'stable', 'recursive'],
    themeColor: 'blue',
  },
  'bubble-sort': {
    shortTitle: 'Bubble Sort',
    subtitle: 'Adjacent Swapping',
    tags: ['adjacent-swap', 'in-place', 'beginner'],
    themeColor: 'emerald',
  },
  'binary-search': {
    shortTitle: 'Binary Search',
    subtitle: 'Halving Search Space',
    tags: ['sorted-array', 'halving', 'O(log N)'],
    themeColor: 'purple',
  },

  'bst-insert': {
    shortTitle: 'BST Tree',
    subtitle: 'Binary Search Tree',
    tags: ['binary-tree', 'hierarchical', 'inorder-traversal'],
    themeColor: 'indigo',
  },
  'linked-list': {
    shortTitle: 'Linked List',
    subtitle: 'Pointers & Nodes',
    tags: ['singly', 'tail-insert', 'traversal'],
    themeColor: 'blue',
  },
  'binary-heap': {
    shortTitle: 'Binary Heap',
    subtitle: 'Priority Queue & Sift-Up',
    tags: ['complete-tree', 'sift-up', 'array-backed'],
    themeColor: 'teal',
  },
  'graph-bfs': {
    shortTitle: 'Graph BFS',
    subtitle: 'Breadth-First Search',
    tags: ['fifo-queue', 'shortest-path', 'wavefront'],
    themeColor: 'purple',
  },
  'graph-dfs': {
    shortTitle: 'Graph DFS',
    subtitle: 'Call Stack & Cycle Detection',
    tags: ['call-stack', 'recursion', 'back-edge'],
    themeColor: 'rose',
  },
  'trie-prefix': {
    shortTitle: 'Trie Tree',
    subtitle: 'Prefix & Autocomplete',
    tags: ['prefix-tree', 'autocomplete', 'strings'],
    themeColor: 'teal',
  },
  'dijkstra': {
    shortTitle: "Dijkstra's Algorithm",
    subtitle: 'Min-Heap Shortest Path',
    tags: ['priority-queue', 'relaxation', 'greedy'],
    themeColor: 'sky',
  },
  'knapsack-01': {
    shortTitle: '0/1 Knapsack',
    subtitle: '2D DP Table & Backtrack',
    tags: ['dynamic-programming', 'matrix', 'subset-choice'],
    themeColor: 'emerald',
  },
  'octree-3d': {
    shortTitle: 'Octree',
    subtitle: '3D Spatial Partitioning',
    tags: ['3D-space', 'octants', 'collision-detection'],
    themeColor: 'indigo',
  },
  'linear-search': {
    shortTitle: 'Linear Search',
    subtitle: 'Sequential Scan',
    tags: ['sequential', 'unsorted-array', 'O(N)'],
    themeColor: 'emerald',
  },
  'insertion-sort': {
    shortTitle: 'Insertion Sort',
    subtitle: 'Incremental Build & Shift',
    tags: ['in-place', 'adaptive', 'online-sort'],
    themeColor: 'amber',
  },
  'selection-sort': {
    shortTitle: 'Selection Sort',
    subtitle: 'Minimum Element Scan',
    tags: ['minimum-scan', 'minimal-swaps', 'O(N²)'],
    themeColor: 'amber',
  },
  'counting-sort': {
    shortTitle: 'Counting Sort',
    subtitle: 'Frequency Bucket Indexing',
    tags: ['non-comparison', 'prefix-sums', 'linear-time'],
    themeColor: 'indigo',
  },
  'topological-sort': {
    shortTitle: 'Topological Sort',
    subtitle: "Kahn's In-Degree Queue",
    tags: ['DAG', 'in-degree', 'dependency-resolution'],
    themeColor: 'teal',
  },
  'valid-parentheses': {
    shortTitle: 'Balanced Parentheses',
    subtitle: 'Stack LIFO Validation',
    tags: ['stack', 'LIFO', 'bracket-matching'],
    themeColor: 'cyan',
  },
  'lcs': {
    shortTitle: 'LCS (Longest Common Subsequence)',
    subtitle: '2D DP Matrix & Backtrack',
    tags: ['dynamic-programming', 'string-diff', 'optimal-substructure'],
    themeColor: 'purple',
  },
  'sieve-of-eratosthenes': {
    shortTitle: 'Sieve of Eratosthenes',
    subtitle: 'Prime Elimination Grid',
    tags: ['number-theory', 'primes', 'O(N log log N)'],
    themeColor: 'emerald',
  },
  'euclidean-gcd': {
    shortTitle: 'Euclidean Algorithm',
    subtitle: 'Greatest Common Divisor',
    tags: ['number-theory', 'modulo', 'Lamé-theorem'],
    themeColor: 'amber',
  },
  'kruskal-mst': {
    shortTitle: "Kruskal's MST",
    subtitle: 'Disjoint Set Union (DSU)',
    tags: ['greedy', 'minimum-spanning-tree', 'cycle-detection'],
    themeColor: 'teal',
  },
  'radix-sort': {
    shortTitle: 'Radix Sort (LSD)',
    subtitle: 'Digit Bucket Queue Passes',
    tags: ['non-comparison', 'stable', 'O(d · (N + b))'],
    themeColor: 'purple',
  },
  'kmp-search': {
    shortTitle: 'KMP Pattern Search',
    subtitle: 'Knuth-Morris-Pratt & LPS',
    tags: ['string-matching', 'LPS-table', 'O(N + M)'],
    themeColor: 'sky',
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  modules,
  onSelectModule,
  onOpenPersonalStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Modules' },
    { id: 'sorting', label: 'Sorting' },
    { id: 'searching', label: 'Searching' },
    { id: 'arrays-pointers', label: 'Pointers & Arrays' },
    { id: 'stack-queue', label: 'Stacks & Queues' },
    { id: 'linked-lists', label: 'Linked Lists' },
    { id: 'trees-bst', label: 'Trees & Heaps' },
    { id: 'graphs', label: 'Graphs' },
    { id: 'dynamic-programming', label: 'Dynamic Programming' },
    { id: 'math', label: 'Math & Number Theory' },
  ];

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const meta = ALGO_METADATA[mod.id];
      const shortName = meta?.shortTitle || mod.title;
      const subtitle = meta?.subtitle || '';
      const tagsStr = meta?.tags.join(' ') || '';

      const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
      const matchesSearch =
        shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tagsStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.complexity.timeAverage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [modules, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-[#F9FAFB] pb-20">
      {/* 1. Hero Section */}
      <section className="relative px-6 pt-12 pb-14 border-b border-[#1F293D] overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[280px] bg-gradient-to-b from-[#10B981]/15 via-[#06B6D4]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-xs font-semibold text-[#10B981] mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Algorithmic Learning & Time-Travel Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
            Master Data Structures & Algorithms{' '}
            <span className="bg-gradient-to-r from-[#10B981] via-[#06B6D4] to-emerald-300 bg-clip-text text-transparent">
              Visually & Interactively
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            StepDSA turns static computer science textbooks into live, interactive mental models.
            Scrub back and forth through execution history with zero lag, inspect multi-language code line-by-line, and explore edge cases.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
            <div className="p-3.5 rounded-xl bg-[#111827]/80 border border-[#1F293D] flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-mono font-bold text-[#10B981]">{modules.length}</span>
              <span className="text-[11px] text-slate-400 font-medium">Curriculum Modules</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111827]/80 border border-[#1F293D] flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-mono font-bold text-[#06B6D4]">0ms</span>
              <span className="text-[11px] text-slate-400 font-medium">Time-Travel Lag</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111827]/80 border border-[#1F293D] flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-mono font-bold text-[#F59E0B]">5</span>
              <span className="text-[11px] text-slate-400 font-medium">Languages Synced</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111827]/80 border border-[#1F293D] flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-mono font-bold text-white">100%</span>
              <span className="text-[11px] text-slate-400 font-medium">Free & Open Source</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 Quick Visual Legend / How to Read StepDSA (for first-time visitors) */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-2">
        <div className="rounded-2xl bg-[#111827]/80 border border-[#1F293D] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-400 text-lg">✦</span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              Cách đọc mô phỏng StepDSA
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-500/20 font-semibold">
              30-Second Guide
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Color Legend */}
            <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-[#1F293D] space-y-2">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Màu sắc
              </h3>
              <div className="space-y-1.5 text-[10px] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-[#10B981] shrink-0" />
                  <span><strong className="text-[#10B981]">Xanh lá</strong> — Đã hoàn thành / Sắp xếp đúng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-[#F59E0B] shrink-0" />
                  <span><strong className="text-[#F59E0B]">Vàng</strong> — Đang so sánh / Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-[#06B6D4] shrink-0" />
                  <span><strong className="text-[#06B6D4]">Cyan</strong> — Con trỏ biên / Queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-[#F43F5E] shrink-0" />
                  <span><strong className="text-[#F43F5E]">Đỏ</strong> — Swap / Loại bỏ / Lỗi</span>
                </div>
              </div>
            </div>

            {/* Pointer Badges */}
            <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-[#1F293D] space-y-2">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#06B6D4]" /> Con trỏ
              </h3>
              <div className="space-y-1.5 text-[10px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-0.5 rounded bg-[#06B6D4] text-[#0B0F19] text-[8px] font-mono font-bold">LEFT</span>
                  <span className="px-1 py-0.5 rounded bg-[#10B981] text-[#0B0F19] text-[8px] font-mono font-bold">RIGHT</span>
                </div>
                <p className="text-slate-400">Nhãn dưới thanh bar = biến đang trỏ vào phần tử đó</p>
                <div className="bg-[#1F2937] px-2 py-1 rounded font-mono text-[10px]">
                  <span className="text-amber-400">WATCH:</span>{' '}
                  <span className="text-white">left = 0</span>{' '}
                  <span className="text-slate-400">[38]</span>
                </div>
                <p className="text-slate-500 text-[9px]">= biến left ở index 0, giá trị 38</p>
              </div>
            </div>

            {/* Step Modes */}
            <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-[#1F293D] space-y-2">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white" /> Chế độ Step
              </h3>
              <div className="space-y-1.5 text-[10px] text-slate-300">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#1F2937] border border-[#374151] text-[9px] font-mono text-white">← →</kbd>
                  <span><strong className="text-white">Line</strong> — Từng dòng code</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-[9px] font-mono text-[#06B6D4]">Shift+→</kbd>
                  <span><strong className="text-[#06B6D4]">Action</strong> — Nhảy đến bước đổi state</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#1F2937] border border-[#374151] text-[9px] font-mono text-white">Space</kbd>
                  <span>Play / Pause tự động</span>
                </div>
              </div>
            </div>

            {/* Code Inspector */}
            <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-[#1F293D] space-y-2">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Code Inspector
              </h3>
              <div className="space-y-1.5 text-[10px] text-slate-300">
                <p>Bảng bên phải hiển thị mã nguồn 5 ngôn ngữ, dòng đang chạy sáng xanh.</p>
                <p><strong className="text-white">CALL STACK</strong> — Stack frame đệ quy (giống VS Code debugger).</p>
                <p><strong className="text-white">SCOPE VARIABLES</strong> — Giá trị biến thời gian thực.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Visual Algorithm Catalog (VisuAlgo-inspired layout) */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Category Filter Pills (Wrap cleanly into rows, no scrollbar) */}
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#10B981] text-[#0B0F19] font-bold shadow-md shadow-[#10B981]/20'
                    : 'bg-[#111827] text-slate-300 border border-[#1F293D] hover:bg-[#1F2937] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search algorithm, Big-O, tags..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] focus:border-[#10B981] text-xs text-white placeholder-slate-500 font-sans outline-none transition-colors"
            />
          </div>
        </div>

        {/* Algorithm Cards Grid with Dynamic Thumbnails */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((mod) => {
            const meta = ALGO_METADATA[mod.id] || {
              shortTitle: mod.title,
              subtitle: mod.category,
              tags: [mod.category],
              themeColor: 'emerald',
            };
            const isBeginner = mod.difficulty === 'Beginner';

            return (
              <div
                key={mod.id}
                className="group rounded-2xl bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/60 p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#10B981]/10 hover:-translate-y-1"
              >
                <div>
                  {/* Dynamic Animation Thumbnail */}
                  <div className="mb-3.5">
                    <AlgorithmCardThumbnail moduleId={mod.id} category={mod.category} />
                  </div>

                  {/* Title & Difficulty Header */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#10B981] transition-colors">
                        {meta.shortTitle}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium -mt-0.5">{meta.subtitle}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        isBeginner
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                      }`}
                    >
                      {mod.difficulty}
                    </span>
                  </div>

                  {/* VisuAlgo Style Topic Tags */}
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {meta.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Short Overview */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {mod.theory.overview}
                  </p>
                </div>

                <div>
                  {/* Complexity Metric Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1F293D] mb-3 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{mod.complexity.timeAverage}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Database className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{mod.complexity.spaceAuxiliary}</span>
                    </div>
                  </div>

                  {/* Launch Visualizer Button */}
                  <button
                    onClick={() => onSelectModule(mod)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#1F2937] hover:bg-[#10B981] text-slate-200 hover:text-[#0B0F19] text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 group-hover:bg-[#10B981] group-hover:text-[#0B0F19] shadow-sm"
                  >
                    <span>Launch Visualizer</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-sm font-medium">No algorithms found matching your search.</p>
          </div>
        )}
      </section>

      {/* 3. FUTURE / ADVANCED FEATURE: Personal Code Visualization (Bring Your Own DSA) */}
      <section className="max-w-6xl mx-auto px-6 pt-12">
        <div className="relative rounded-2xl bg-gradient-to-br from-[#12192e] via-[#0f172a] to-[#0B0F19] border border-indigo-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                <span>Advanced Developer Capability</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Personal Code Visualization Studio
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Want to debug and visualize your own custom algorithms? StepDSA provides a local tracing runner that executes on your machine in <strong>Python, TypeScript, C++, or Java</strong>, captures variables and pointer mutations, and plays back the execution step-by-step with zero cloud execution risks.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" /> 100% Local Machine Execution
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" /> Language AST & Debugger Tracing
                </span>
                <span className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-amber-400" /> Deterministic JSON Snapshots
                </span>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="bg-[#0B0F19]/90 border border-slate-800 p-5 rounded-xl shrink-0 lg:w-80 flex flex-col gap-3 shadow-xl">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>LOCAL TRACER CLI</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-indigo-300 select-all overflow-x-auto">
                $ npx @stepdsa/cli trace my_algo.py
              </div>
              <button
                onClick={onOpenPersonalStudio}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Launch CLI Studio & Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Platform Architecture Highlights */}
      <section className="max-w-6xl mx-auto px-6 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[#10B981]">THE ARCHITECTURE</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
            Designed for Deep Understanding, Not Just Eye-Candy
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Most algorithm visualizers fail because they treat visualization as passive animation. StepDSA builds mental models through active participation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Deterministic Snapshot Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Algorithms generate an immutable timeline of states instantly. Step backward, jump to pivots, and scrub without timing race conditions or desync.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/15 text-[#06B6D4] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Dual Code-View Synchronizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Watch real code execute in Python, TypeScript, C++, Java, or Pseudocode with synchronized glowing lines for every pointer swap and branch decision.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Interactive Edge-Case Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stress-test algorithms with custom inputs, reverse sorted arrays, duplicate keys, and worst-case patterns to uncover Big-O bottlenecks firsthand.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Keyboard Shortcuts Quick Reference */}
      <section className="max-w-4xl mx-auto px-6 pt-14">
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F293D] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#1F2937] text-white">
              <Keyboard className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pro Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">Control stepping and time travel without touching your mouse</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F2937] border border-[#1F293D] text-slate-300">
              <kbd className="text-[#10B981] font-bold">Space</kbd> <span>Play/Pause</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F2937] border border-[#1F293D] text-slate-300">
              <kbd className="text-[#10B981] font-bold">→</kbd> <span>Next Step</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F2937] border border-[#1F293D] text-slate-300">
              <kbd className="text-[#10B981] font-bold">←</kbd> <span>Prev Step</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F2937] border border-[#1F293D] text-slate-300">
              <kbd className="text-[#10B981] font-bold">R</kbd> <span>Reset</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
