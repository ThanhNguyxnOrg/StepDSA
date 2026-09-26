import React from 'react';
import { Sparkles, Layers, Box, Volume2, VolumeX, Compass, ChevronDown } from 'lucide-react';
import { AlgorithmModule, AlgorithmCategory } from '../../core/types';

interface HeaderProps {
  currentModule: AlgorithmModule;
  modules: AlgorithmModule[];
  onSelectModule: (module: AlgorithmModule) => void;
  projectionMode: '2d' | 'isometric';
  onToggleProjection: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  modules,
  onSelectModule,
  projectionMode,
  onToggleProjection,
  isMuted,
  onToggleSound,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Group modules by category
  const categories: Record<AlgorithmCategory, AlgorithmModule[]> = {
    'sorting': [],
    'searching': [],
    'arrays-pointers': [],
    'trees-bst': [],
    'graphs': [],
    'dynamic-programming': [],
    'linked-lists': [],
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
  };

  return (
    <header className="h-16 border-b border-[#1F293D] bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Module Selector */}
      <div className="flex items-center gap-4">
        <a href="./" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#10B981] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#10B981]/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Step<span className="text-[#10B981]">DSA</span>
            </span>
            <span className="text-[10px] text-[#9CA3AF] -mt-1 font-mono tracking-wider">TIME-TRAVEL ENGINE</span>
          </div>
        </a>

        {/* Algorithm Picker Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 text-sm font-medium transition-colors text-slate-200 hover:text-white"
          >
            <Compass className="w-4 h-4 text-[#10B981]" />
            <span>{currentModule.title}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#111827] border border-[#1F293D] shadow-2xl p-2 z-50 max-h-[80vh] overflow-y-auto">
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
                            <span>{mod.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F293D] text-slate-400">
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
      </div>

      {/* Center / Action Toggles */}
      <div className="flex items-center gap-2">
        {/* Projection Toggle: 2D vs 2.5D Isometric */}
        <button
          onClick={onToggleProjection}
          title={`Switch to ${projectionMode === '2d' ? '2.5D Isometric Mode' : '2D Flat Mode'}`}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            projectionMode === 'isometric'
              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 shadow-sm'
              : 'bg-[#111827] text-slate-400 border border-[#1F293D] hover:text-white hover:border-slate-600'
          }`}
        >
          {projectionMode === 'isometric' ? (
            <>
              <Box className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="hidden sm:inline">2.5D Isometric</span>
            </>
          ) : (
            <>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">2D Flat</span>
            </>
          )}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={isMuted ? 'Unmute Audio Synthesizer' : 'Mute Audio Synthesizer'}
          className="p-2 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-[#10B981]" />}
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
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
};
