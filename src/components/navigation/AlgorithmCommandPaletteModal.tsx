import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, CornerDownLeft, Sparkles, Filter } from 'lucide-react';
import { AlgorithmModule, AlgorithmCategory } from '../../core/types';

interface AlgorithmCommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: AlgorithmModule[];
  currentModule: AlgorithmModule;
  onSelectModule: (module: AlgorithmModule) => void;
}

const CATEGORY_TABS: { key: 'all' | AlgorithmCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'sorting', label: 'Sorting' },
  { key: 'searching', label: 'Searching' },
  { key: 'arrays-pointers', label: 'Arrays & Pointers' },
  { key: 'trees-bst', label: 'Trees & BST' },
  { key: 'graphs', label: 'Graphs' },
  { key: 'dynamic-programming', label: 'Dynamic Programming' },
  { key: 'stack-queue', label: 'Stacks & Queues' },
  { key: 'linked-lists', label: 'Linked Lists' },
  { key: 'math', label: 'Math' },
];

export const AlgorithmCommandPaletteModal: React.FC<AlgorithmCommandPaletteModalProps> = ({
  isOpen,
  onClose,
  modules,
  currentModule,
  onSelectModule,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | AlgorithmCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open & bind Escape / shortcut
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Parse title into Primary Name + Subtitle (clean separation)
  const formatTitle = (fullTitle: string) => {
    const match = fullTitle.match(/^([^(]+)(?:\((.*)\))?$/);
    if (match) {
      return {
        primary: match[1].trim(),
        subtitle: match[2]?.trim() || '',
      };
    }
    return { primary: fullTitle, subtitle: '' };
  };

  // Filter modules
  const filteredModules = useMemo(() => {
    const q = query.toLowerCase().trim();
    return modules.filter((mod) => {
      const matchesCategory = activeCategory === 'all' || mod.category === activeCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      const titleMatch = mod.title.toLowerCase().includes(q);
      const idMatch = mod.id.toLowerCase().includes(q);
      const complexityMatch = mod.complexity?.timeAverage?.toLowerCase().includes(q);
      const catMatch = mod.category.toLowerCase().includes(q);

      return titleMatch || idMatch || complexityMatch || catMatch;
    });
  }, [modules, query, activeCategory]);

  // Handle arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredModules.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredModules.length) % Math.max(1, filteredModules.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredModules[selectedIndex]) {
        onSelectModule(filteredModules[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1E293B] bg-slate-900/60">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search 160+ algorithms, patterns, complexities (e.g. 'heap', 'tree', 'O(1)')..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#1E293B] bg-slate-900/40 overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveCategory(tab.key);
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Algorithm Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40 max-h-[50vh]"
        >
          {filteredModules.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No matching algorithms found</p>
              <p className="text-xs text-slate-500 mt-1">Try another search keyword or switch category filters.</p>
            </div>
          ) : (
            filteredModules.map((mod, index) => {
              const isSelected = index === selectedIndex;
              const isCurrent = currentModule.id === mod.id;
              const { primary, subtitle } = formatTitle(mod.title);

              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    onSelectModule(mod);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 shadow-sm'
                      : isCurrent
                      ? 'bg-slate-900/50 border border-slate-800/80'
                      : 'hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                          : isSelected
                          ? 'bg-emerald-500'
                          : 'bg-slate-600'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold truncate ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                          {primary}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      {subtitle && (
                        <p className="text-xs text-slate-400 truncate mt-0.5 font-normal">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {mod.complexity?.timeAverage && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                        {mod.complexity.timeAverage}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        mod.difficulty === 'Beginner'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          : mod.difficulty === 'Intermediate'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          : 'bg-purple-950/40 text-purple-400 border-purple-800/40'
                      }`}
                    >
                      {mod.difficulty}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-4 h-4 text-emerald-400 hidden sm:inline-block ml-1" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-[#1E293B] bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-white">{filteredModules.length}</strong> of{' '}
              {modules.length} algorithms
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-500">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">↵</kbd> to select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
