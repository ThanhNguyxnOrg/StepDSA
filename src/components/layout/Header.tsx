import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Compass,
  ChevronDown,
  Info,
  Terminal,
  Keyboard,
  Palette,
  Sun,
  Moon,
  Sparkles,
  Check,
} from 'lucide-react';
import { AlgorithmModule } from '../../core/types';
import { StepDSALogo } from '../brand/StepDSALogo';
import { AlgorithmCommandPaletteModal } from '../navigation/AlgorithmCommandPaletteModal';
import { usePlatformShortcuts } from '../../utils/platformShortcuts';
import { AppThemeId, AppThemeConfig, APP_THEMES, THEME_ORDER } from '../../utils/themeEngine';

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
  onOpenShortcuts?: () => void;
  themeId?: AppThemeId;
  onSelectTheme?: (theme: AppThemeId) => void;
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
  onOpenShortcuts,
  themeId = 'midnight',
  onSelectTheme,
}) => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const shortcuts = usePlatformShortcuts();
  const activeTheme: AppThemeConfig = APP_THEMES[themeId] || APP_THEMES.midnight;

  // Global keyboard shortcut: Ctrl+K (Windows/Linux) or Cmd+K (macOS) opens/toggles Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        onOpenShortcuts?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenShortcuts]);

  // Close theme dropdown on outside click
  useEffect(() => {
    if (!themeMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [themeMenuOpen]);

  const cleanTitle = currentModule.title.split('(')[0].trim();

  return (
    <header className="h-14 border-b border-[#1F293D] bg-[#0B0F19]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 overflow-x-clip">
      {/* Brand & Main Navigation Tabs with Framer Motion spring indicator */}
      <div className="flex items-center gap-2.5 lg:gap-4 shrink-0">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="group text-left cursor-pointer shrink-0 whitespace-nowrap"
        >
          <StepDSALogo size="sm" showText={true} />
        </button>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-0.5 p-0.5 sm:p-1 rounded-lg bg-[#111827] border border-[#1F293D] relative shrink-0">
          {(['dashboard', 'visualizer'] as const).map((view) => {
            const isActive = currentView === view;
            return (
              <button
                key={view}
                type="button"
                onClick={() => onNavigate(view)}
                className={`relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 lg:px-3 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 z-10 ${
                  isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="header-active-tab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-md bg-[#1E293B] border border-slate-700/80 shadow-xs -z-10"
                  />
                )}
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                    isActive ? 'bg-[#10B981]' : 'bg-transparent'
                  }`}
                />
                {view === 'dashboard' ? (
                  <>
                    <span className="sm:hidden whitespace-nowrap">Hub</span>
                    <span className="hidden sm:inline whitespace-nowrap">Explore Hub</span>
                  </>
                ) : (
                  <span className="whitespace-nowrap">Workbench</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
        {/* Universal Quick Switcher (Works on both Dashboard & Workbench via Ctrl+K / Cmd+K) */}
        <div className="relative shrink-0">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 text-xs font-medium transition-colors text-slate-200 hover:text-white group cursor-pointer whitespace-nowrap shrink-0"
            title={`Quick Search Algorithms (${shortcuts.quickSearch})`}
          >
            <Compass className="w-3.5 h-3.5 text-[#10B981] group-hover:rotate-45 transition-transform shrink-0" />
            <span className="max-w-[96px] sm:max-w-[130px] xl:max-w-[160px] truncate font-semibold text-white">
              {cleanTitle}
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#1E293B] text-emerald-300 border border-slate-700 shrink-0">
              {shortcuts.quickSearch}
            </kbd>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
          </motion.button>
        </div>

        {/* Studio Multi-Theme Switcher (Midnight · Daylight Paper · VisuAlgo Ocean · Dracula Cyber) */}
        {onSelectTheme && (
          <div className="relative shrink-0" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => setThemeMenuOpen((prev) => !prev)}
              aria-label={`Studio Theme: ${activeTheme.name}`}
              title={`Switch Studio Theme (Current: ${activeTheme.name})`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 text-xs font-mono font-medium text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {activeTheme.isLight ? (
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : themeId === 'visualgo' ? (
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              ) : themeId === 'dracula' ? (
                <Palette className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              )}
              <span className="hidden xl:inline">{activeTheme.shortLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            <AnimatePresence>
              {themeMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-[#111827] border border-[#1F293D] shadow-2xl p-1.5 z-50"
                >
                  <div className="px-2.5 py-1.5 text-[11px] font-medium text-slate-400 border-b border-[#1F293D] mb-1 flex items-center justify-between">
                    <span>Color palette</span>
                    <span className="font-mono text-[10px] text-[#10B981]">4 themes</span>
                  </div>
                  {THEME_ORDER.map((id) => {
                    const cfg = APP_THEMES[id];
                    const isSelected = id === themeId;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          onSelectTheme(id);
                          setThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#10B981]/15 border border-[#10B981]/40 text-white'
                            : 'hover:bg-[#1F2937] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: cfg.swatchBg }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: cfg.swatchAccent }}
                            />
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white leading-tight">
                              {cfg.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {cfg.inspiration}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Auto-Detected OS & Interactive Keyboard Shortcuts Studio Trigger */}
        <div className="hidden md:flex items-center rounded-lg bg-[#111827] border border-[#1F293D] overflow-hidden shrink-0 whitespace-nowrap">
          <button
            type="button"
            onClick={shortcuts.toggleOS}
            title={`Detected OS: ${shortcuts.osName} (${shortcuts.isAutoDetected ? 'Auto-Detected' : 'Manual Override'}). Click to switch between macOS (Cmd) and Windows/Linux (Ctrl)`}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono text-slate-300 hover:text-cyan-300 hover:bg-[#1E293B]/60 transition-colors cursor-pointer border-r border-[#1F293D] whitespace-nowrap shrink-0"
          >
            <span>{shortcuts.osName}</span>
            <kbd className="text-[10px] px-1 rounded bg-[#1E293B] text-cyan-300 border border-slate-700 font-bold">
              {shortcuts.modKey}
            </kbd>
          </button>

          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              title={`Open Interactive Keyboard Shortcuts Reference (${shortcuts.shortcutsHelp})`}
              aria-label="Keyboard Shortcuts Reference"
              className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-mono text-slate-300 hover:text-[#10B981] hover:bg-[#1E293B]/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <kbd className="text-[10px] px-1 rounded bg-[#1E293B] text-slate-300 border border-slate-700">
                ?
              </kbd>
            </button>
          )}
        </div>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          title={
            isMuted
              ? `Unmute Audio Synthesizer (${shortcuts.toggleMute})`
              : `Mute Audio Synthesizer (${shortcuts.toggleMute})`
          }
          aria-label={isMuted ? 'Unmute Audio Synthesizer' : 'Mute Audio Synthesizer'}
          className="p-2 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer shrink-0"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#10B981]" />
          )}
        </button>

        {/* Personal Code Studio Trigger */}
        {onOpenPersonalStudio && (
          <button
            type="button"
            onClick={onOpenPersonalStudio}
            title="Personal Code Studio: Trace & Visualize Your Own Code Locally"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-900/40 text-xs font-semibold font-mono transition-colors shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden xl:inline">CLI Studio</span>
          </button>
        )}

        {/* About Modal Button */}
        <button
          type="button"
          onClick={onOpenAbout}
          title="About StepDSA & Philosophy"
          aria-label="About StepDSA"
          className="p-2 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer shrink-0"
        >
          <Info className="w-4 h-4 text-[#06B6D4]" />
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/ThanhNguyxnOrg/StepDSA"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span className="hidden 2xl:inline">GitHub</span>
        </a>
      </div>

      {/* Algorithm Command Palette Modal (Ctrl+K / Cmd+K Quick Switcher) */}
      <AlgorithmCommandPaletteModal
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        modules={modules}
        currentModule={currentModule}
        onSelectModule={onSelectModule}
      />
    </header>
  );
};
