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
} from 'lucide-react';
import { AlgorithmModule } from '../../core/types';

interface DashboardViewProps {
  modules: AlgorithmModule[];
  onSelectModule: (module: AlgorithmModule) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ modules, onSelectModule }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Algorithms' },
    { id: 'sorting', label: 'Sorting' },
    { id: 'searching', label: 'Searching' },
    { id: 'arrays-pointers', label: 'Two Pointers' },
    { id: 'trees-bst', label: 'Trees & BST' },
  ];

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
      const matchesSearch =
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.theory.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.complexity.timeAverage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [modules, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-[#F9FAFB] pb-16">
      {/* 1. Hero Section */}
      <section className="relative px-6 pt-12 pb-14 border-b border-[#1F293D] overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-[#10B981]/10 via-[#06B6D4]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-xs font-semibold text-[#10B981] mb-5 shadow-sm">
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
            Stop passively watching static videos. StepDSA brings algorithms to life with an interactive narrative textbook, zero-latency time-travel debugger, synchronized multi-language code inspector, and sandbox playgrounds.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
            <div className="p-3.5 rounded-xl bg-[#111827]/80 border border-[#1F293D] flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-mono font-bold text-[#10B981]">{modules.length}</span>
              <span className="text-[11px] text-slate-400 font-medium">Core Algorithms</span>
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
              <span className="text-[11px] text-slate-400 font-medium">Free & Client-Side</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search & Category Filters */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
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
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search algorithm, Big-O..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] focus:border-[#10B981] text-xs text-white placeholder-slate-500 font-sans outline-none transition-colors"
            />
          </div>
        </div>

        {/* Algorithm Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModules.map((mod) => {
            const isBeginner = mod.difficulty === 'Beginner';
            return (
              <div
                key={mod.id}
                className="group relative rounded-2xl bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#10B981]/10 hover:-translate-y-1"
              >
                <div>
                  {/* Category & Difficulty Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded border border-[#06B6D4]/20">
                      {mod.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isBeginner
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                      }`}
                    >
                      {mod.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-[#10B981] transition-colors mb-2">
                    {mod.title}
                  </h3>

                  {/* Short overview */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {mod.theory.overview}
                  </p>
                </div>

                <div>
                  {/* Big-O Badges */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#1F293D] mb-4 text-xs font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-[#10B981]" />
                      <span>{mod.complexity.timeAverage}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 border-l border-[#1F293D] pl-3">
                      <Database className="w-3 h-3 text-[#F59E0B]" />
                      <span>{mod.complexity.spaceAuxiliary}</span>
                    </span>
                  </div>

                  {/* Launch Visualizer Button */}
                  <button
                    onClick={() => onSelectModule(mod)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#1F2937] hover:bg-[#10B981] text-slate-200 hover:text-[#0B0F19] text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 group-hover:bg-[#10B981] group-hover:text-[#0B0F19]"
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
            <p className="text-sm">No algorithms found matching your search.</p>
          </div>
        )}
      </section>

      {/* 3. Platform Architecture & Features Showcase */}
      <section className="max-w-6xl mx-auto px-6 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
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

      {/* 4. Keyboard Shortcuts Quick Reference */}
      <section className="max-w-4xl mx-auto px-6 pt-16">
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
