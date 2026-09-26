import React, { useState } from 'react';
import { Volume2, VolumeX, Compass, ChevronDown, LayoutDashboard, Info, Terminal } from 'lucide-react';
import { AlgorithmModule, AlgorithmCategory } from '../../core/types';
import { StepDSALogo } from '../brand/StepDSALogo';

interface HeaderProps {
  currentView: 'dashboard' | 'visualizer';
  onNavigate: (view: 'dashboard' | 'visualizer') => void;
  currentModule: AlgorithmModule;
  modules: AlgorithmModule[];
  onSelectModule: (module: AlgorithmModule) => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenAbout: () => void;
  onOpenPersonalStudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentModule,
  modules,
  onSelectModule,
  isMuted,
  onToggleSound,
  onOpenAbout,
  onOpenPersonalStudio,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const categories: Record<AlgorithmCategory, AlgorithmModule[]> = {
    'sorting': [],
    'searching': [],
    'arrays-pointers': [],
    'trees-bst': [],
    'graphs': [],
    'dynamic-programming': [],
    'linked-lists': [],
    'math': [],
    'stack-queue': [],
  };

  modules.forEach((mod) => {
    if (categories[mod.category]) {
      categories[mod.category].push(mod);
    }
  });

  const categoryLabels: Record<AlgorithmCategory, string> = {
    'sorting': 'Sorting Algorithms',
    'searching': 'Searching & Halving',
    'arrays-pointers': 'Two Pointers & Arrays',
    'trees-bst': 'Trees & BST',
    'graphs': 'Graph Algorithms',
    'dynamic-programming': 'Dynamic Programming',
    'linked-lists': 'Linked Lists',
    'math': 'Math & Number Theory',
    'stack-queue': 'Stacks & Queues',
  };

  return (
    <header className="h-16 border-b border-[#1F293D] bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Main Navigation Tabs */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="group text-left"
        >
          <StepDSALogo size="sm" showText={true} />
        </button>

        {/* View Switcher Tabs */}
        <nav className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-[#1F293D]">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'dashboard'
                ? 'bg-[#10B981] text-[#0B0F19] shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Explore Hub</span>
          </button>
          <button
            onClick={() => onNavigate('visualizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'visualizer'
                ? 'bg-[#10B981] text-[#0B0F19] shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Workbench</span>
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* If in Visualizer, show Algorithm Selector Dropdown & 2.5D toggle */}
        {currentView === 'visualizer' && (
          <>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 text-xs sm:text-sm font-medium transition-colors text-slate-200 hover:text-white"
              >
                <Compass className="w-4 h-4 text-[#10B981]" />
                <span className="max-w-[140px] sm:max-w-[200px] truncate">{currentModule.title}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 sm:left-0 mt-2 w-72 rounded-xl bg-[#111827] border border-[#1F293D] shadow-2xl p-2 z-50 max-h-[75vh] overflow-y-auto">
                    {Object.entries(categories).map(([catKey, catMods]) => {
                      if (catMods.length === 0) return null;
                      return (
                        <div key={catKey} className="mb-2 last:mb-0">
                          <div className="px-2.5 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                            {categoryLabels[catKey as AlgorithmCategory]}
                          </div>
                          <div className="space-y-0.5">
                            {catMods.map((mod) => (
                              <button
                                key={mod.id}
                                onClick={() => {
                                  onSelectModule(mod);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                                  currentModule.id === mod.id
                                    ? 'bg-[#10B981]/20 text-[#10B981] font-semibold'
                                    : 'text-slate-300 hover:bg-[#1F2937] hover:text-white'
                                }`}
                              >
                                <span className="truncate pr-2">{mod.title}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F293D] text-slate-400 shrink-0">
                                  {mod.difficulty}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={isMuted ? 'Unmute Audio Synthesizer' : 'Mute Audio Synthesizer'}
          className="p-2 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-[#10B981]" />}
        </button>

        {/* Personal Code Studio Trigger */}
        {onOpenPersonalStudio && (
          <button
            onClick={onOpenPersonalStudio}
            title="Personal Code Studio: Trace & Visualize Your Own Code Locally"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-900/40 text-xs font-semibold font-mono transition-colors shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">CLI Studio</span>
          </button>
        )}

        {/* About Modal Button */}
        <button
          onClick={onOpenAbout}
          title="About StepDSA & Philosophy"
          className="p-2 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
        >
          <Info className="w-4 h-4 text-[#06B6D4]" />
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/ThanhNguyxnOrg/StepDSA"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="hidden lg:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
};
