import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Keyboard,
  Laptop,
  Play,
  Compass,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  usePlatformShortcuts,
  PlatformOSMode,
  ShortcutDefinition,
} from '../../utils/platformShortcuts';
import { StepDSALogo } from '../brand/StepDSALogo';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OS_MODES: { id: PlatformOSMode; label: string; badge: string }[] = [
  { id: 'auto', label: 'Auto-Detect', badge: 'OS' },
  { id: 'mac', label: 'macOS', badge: 'Cmd Opt' },
  { id: 'windows', label: 'Windows', badge: 'Ctrl Alt' },
  { id: 'linux', label: 'Linux', badge: 'Ctrl Alt' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const shortcuts = usePlatformShortcuts();
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [lastMatchedId, setLastMatchedId] = useState<string | null>(null);

  // Live physical keyboard listener for interactive keycap feedback
  useEffect(() => {
    if (!isOpen) {
      setPressedKeys([]);
      setLastMatchedId(null);
      return;
    }

    const formatKeyEvent = (e: KeyboardEvent): string[] => {
      const active: string[] = [];
      const isMac = shortcuts.os === 'mac';
      if (e.metaKey || e.ctrlKey) active.push(isMac ? 'Cmd' : 'Ctrl');
      if (e.altKey) active.push(isMac ? 'Opt' : 'Alt');
      if (e.shiftKey && e.key !== 'Shift' && e.key !== '?') {
        active.push('Shift');
      }

      if (e.code === 'Space') active.push('Space');
      else if (e.key === 'ArrowRight') active.push('→');
      else if (e.key === 'ArrowLeft') active.push('←');
      else if (e.key === 'ArrowUp') active.push('↑');
      else if (e.key === 'ArrowDown') active.push('↓');
      else if (e.key === 'Home') active.push('Home');
      else if (e.key === 'End') active.push('End');
      else if (e.key === '?') active.push('?');
      else if (e.key.length === 1) active.push(e.key.toUpperCase());

      return active;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      const active = formatKeyEvent(e);
      if (active.length > 0) {
        setPressedKeys(active);

        // Check if it matches any shortcut in catalog
        const matched = shortcuts.catalog.find((item) => {
          if (item.id === 'speed-presets') {
            return active.length === 1 && ['1', '2', '3', '4'].includes(active[0]);
          }
          if (item.id === 'zoom-stage') {
            return active.length === 1 && ['+', '=', '-', '_', '0'].includes(active[0]);
          }
          if (item.keys.length !== active.length) return false;
          return item.keys.every(
            (k, idx) => k.toUpperCase() === active[idx]?.toUpperCase()
          );
        });

        if (matched) {
          setLastMatchedId(matched.id);
        }
      }
    };

    const handleKeyUp = () => {
      setTimeout(() => setPressedKeys([]), 350);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, onClose, shortcuts.os, shortcuts.catalog]);

  if (!isOpen) return null;

  const playbackShortcuts = shortcuts.catalog.filter((s) => s.category === 'playback');
  const navigationShortcuts = shortcuts.catalog.filter((s) => s.category === 'navigation');
  const workbenchShortcuts = shortcuts.catalog.filter((s) => s.category === 'workbench');

  const renderKeycapGroup = (item: ShortcutDefinition) => {
    const isMatched = lastMatchedId === item.id;
    return (
      <div className="flex items-center gap-1 shrink-0">
        {item.keys.map((keyLabel, idx) => {
          const isKeyActive = pressedKeys.some(
            (pk) => pk.toUpperCase() === keyLabel.toUpperCase()
          );
          return (
            <React.Fragment key={`${item.id}-${keyLabel}-${idx}`}>
              {idx > 0 && item.id !== 'speed-presets' && item.id !== 'zoom-stage' && (
                <span className="text-[10px] font-mono text-slate-500">+</span>
              )}
              <motion.kbd
                animate={
                  isKeyActive || isMatched
                    ? { scale: 1.08, y: -1 }
                    : { scale: 1, y: 0 }
                }
                transition={{ type: 'spring', stiffness: 460, damping: 24 }}
                className={`min-w-[26px] h-6 px-2 rounded-md text-[11px] font-mono font-bold inline-flex items-center justify-center border border-b-2 transition-colors select-none ${
                  isKeyActive || isMatched
                    ? 'bg-[#10B981] text-[#0B0F19] border-emerald-300 shadow-sm shadow-[#10B981]/30'
                    : 'bg-[#1E293B] text-slate-100 border-[#334155] border-b-[#475569] shadow-2xs'
                }`}
              >
                {keyLabel}
              </motion.kbd>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderShortcutRow = (item: ShortcutDefinition) => {
    const isMatched = lastMatchedId === item.id;
    return (
      <motion.div
        key={item.id}
        layout
        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-colors ${
          isMatched
            ? 'bg-[#10B981]/12 border-[#10B981]/40'
            : 'bg-[#0B0F19]/60 border-[#1F293D]/80 hover:border-slate-700'
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">{item.label}</span>
            {isMatched && (
              <span className="text-[10px] font-mono text-[#10B981] font-semibold">
                Matched
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {item.description}
          </p>
        </div>
        {renderKeycapGroup(item)}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="w-full max-w-4xl bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#1E293B] bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StepDSALogo size="sm" showText={false} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    OS-Adaptive Keyboard Shortcuts
                  </h2>
                  <span className="text-xs font-mono text-[#10B981]">
                    · {shortcuts.osName} Keymap
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatically detected host OS ({shortcuts.detectedOS === 'mac' ? 'macOS' : shortcuts.detectedOS === 'linux' ? 'Linux' : 'Windows'}) · Press any key right now to test live bindings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* OS Segmented Mode Selector with Spring Pill */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B0F19] border border-[#1F293D]">
                {OS_MODES.map((m) => {
                  const isSelected = shortcuts.mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => shortcuts.setOSMode(m.id)}
                      className={`relative px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer z-10 flex items-center gap-1 ${
                        isSelected
                          ? 'text-[#0B0F19] font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="os-shortcut-mode-pill"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          className="absolute inset-0 rounded-lg bg-[#10B981] -z-10"
                        />
                      )}
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Keyboard Shortcuts Modal"
                className="p-2 rounded-lg bg-[#1E293B] text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Live Keypress Tester Banner */}
          <div className="px-6 py-2.5 border-b border-[#1E293B] bg-[#0B0F19]/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Keyboard className="w-4 h-4 text-[#06B6D4]" />
              <span>
                Active Keymap:{' '}
                <strong className="text-white">{shortcuts.osName}</strong> (
                <code className="text-cyan-300 font-mono">
                  {shortcuts.modKey}
                </code>{' '}
                modifier,{' '}
                <code className="text-cyan-300 font-mono">
                  {shortcuts.shiftKey}
                </code>{' '}
                action jump,{' '}
                <code className="text-cyan-300 font-mono">
                  {shortcuts.altKey}
                </code>{' '}
                milestone jump)
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              {pressedKeys.length > 0 ? (
                <div className="flex items-center gap-1.5 text-[#10B981]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Detected Input:</span>
                  {pressedKeys.map((k, i) => (
                    <kbd
                      key={`${k}-${i}`}
                      className="px-1.5 py-0.5 rounded bg-[#10B981] text-[#0B0F19] font-bold"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              ) : (
                <span className="text-slate-500">
                  Press any shortcut key to highlight its binding...
                </span>
              )}
            </div>
          </div>

          {/* Body: Two-Column Structured Grid */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Playback & Time-Travel */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-[#1E293B]">
                <Play className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  1. Timeline Playback & Time-Travel
                </h3>
              </div>
              <div className="space-y-2">
                {playbackShortcuts.map(renderShortcutRow)}
              </div>
            </div>

            {/* Right Column: Global Navigation & Workbench Controls */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-[#1E293B]">
                  <Compass className="w-4 h-4 text-[#06B6D4]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    2. Global Search & Navigation
                  </h3>
                </div>
                <div className="space-y-2">
                  {navigationShortcuts.map(renderShortcutRow)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-[#1E293B]">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    3. Workbench Panels & Audio
                  </h3>
                </div>
                <div className="space-y-2">
                  {workbenchShortcuts.map(renderShortcutRow)}
                </div>
              </div>

              {/* Pro Tip Card */}
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1F293D] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Laptop className="w-4 h-4 text-[#10B981]" />
                  <span>Cross-Platform Parity</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  StepDSA binds both <strong className="text-slate-200">Cmd (Command)</strong> and{' '}
                  <strong className="text-slate-200">Ctrl</strong> simultaneously so external mechanical keyboards on macOS or Apple Magic Keyboards on Windows/Linux work seamlessly without remapping.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#1E293B] bg-[#111827] flex items-center justify-between text-xs text-slate-400">
            <span>
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">?</kbd> anywhere in the Workbench to open this reference
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#10B981] text-[#0B0F19] font-bold hover:bg-[#059669] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
