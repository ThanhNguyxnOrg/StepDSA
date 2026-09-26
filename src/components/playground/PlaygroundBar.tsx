import React, { useState } from 'react';
import {
  Shuffle,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCheck,
  PlayCircle,
  SlidersHorizontal,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  generateRandomArray,
  generateNearlySortedArray,
  generateReversedArray,
  generateFewUniqueArray,
  generateSortedArray,
  parseCustomArray,
} from '../../utils/arrayGenerators';

interface PlaygroundBarProps {
  onApplyData: (data: number[]) => void;
  currentData: number[];
}

export const PlaygroundBar: React.FC<PlaygroundBarProps> = ({ onApplyData, currentData }) => {
  const [customText, setCustomText] = useState<string>(currentData.join(', '));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [arraySize, setArraySize] = useState<number>(10);

  const presets = [
    { label: 'Random', icon: Shuffle, fn: () => generateRandomArray(arraySize) },
    { label: 'Nearly Sorted', icon: TrendingUp, fn: () => generateNearlySortedArray(arraySize) },
    { label: 'Reversed', icon: TrendingDown, fn: () => generateReversedArray(arraySize) },
    { label: 'Few Unique', icon: Layers, fn: () => generateFewUniqueArray(arraySize) },
    { label: 'Sorted', icon: CheckCheck, fn: () => generateSortedArray(arraySize) },
  ];

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseCustomArray(customText);
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setErrorMsg(null);
      onApplyData(result.data);
    }
  };

  const handlePresetSelect = (generator: () => number[]) => {
    const data = generator();
    setCustomText(data.join(', '));
    setErrorMsg(null);
    onApplyData(data);
  };

  return (
    <div className="bg-[#0B0F19] border-b border-[#1F293D] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Presets & Randomizer */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-slate-400 font-medium flex items-center gap-1 mr-1 text-[11px] uppercase tracking-wider font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#06B6D4]" /> Presets:
        </span>
        {presets.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.label}
              onClick={() => handlePresetSelect(preset.fn)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 text-slate-300 hover:text-white font-medium transition-colors whitespace-nowrap text-[11px]"
            >
              <Icon className="w-3 h-3 text-[#10B981]" />
              <span>{preset.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => handlePresetSelect(() => generateRandomArray(arraySize))}
          title="Regenerate random numbers"
          className="p-1 rounded-md bg-[#111827] border border-[#1F293D] hover:border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="hidden sm:flex items-center gap-1 border-l border-[#1F293D] pl-2 ml-1 text-slate-400 text-[11px]">
          <span>Size:</span>
          {[8, 10, 14].map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setArraySize(sz)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                arraySize === sz ? 'bg-[#10B981]/20 text-[#10B981] font-bold' : 'hover:bg-[#1F2937] text-slate-400'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input Form */}
      <form onSubmit={handleApplyCustom} className="flex items-center gap-2 flex-1 max-w-md min-w-[260px]">
        <div className="relative flex-1">
          <input
            type="text"
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Custom array (e.g. 45, 12, 89, 3)"
            className="w-full bg-[#111827] border border-[#1F293D] focus:border-[#10B981] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981] hover:text-[#0B0F19] font-semibold text-xs transition-all flex items-center gap-1 shrink-0"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Apply</span>
        </button>
      </form>

      {/* Error alert toast */}
      {errorMsg && (
        <div className="w-full px-3 py-1.5 rounded-lg bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-[#F43F5E] flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
