import React, { useState, useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';
import {
  generateRandomArray,
  generateNearlySortedArray,
  generateReversedArray,
  generateFewUniqueArray,
  generateSortedArray,
  parseCustomArray,
} from '../../utils/arrayGenerators';
import { AlgorithmModule } from '../../core/types';

interface PlaygroundBarProps {
  currentModule: AlgorithmModule;
  onApplyData: (data: any) => void;
  currentData: any;
}

export const PlaygroundBar: React.FC<PlaygroundBarProps> = ({
  currentModule,
  onApplyData,
  currentData,
}) => {
  const isSortingOrArray =
    currentModule.category === 'sorting' ||
    currentModule.id === 'linear-search' ||
    currentModule.id === 'counting-sort';

  const isBinarySearch = currentModule.id === 'binary-search';

  // Extract array representation if applicable
  const currentArray: number[] = Array.isArray(currentData)
    ? currentData
    : currentData?.array && Array.isArray(currentData.array)
    ? currentData.array
    : [];

  const [customText, setCustomText] = useState<string>(
    currentArray.length > 0 ? currentArray.join(', ') : ''
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [arraySize, setArraySize] = useState<number>(
    currentArray.length > 0 ? currentArray.length : 10
  );

  // Sync customText when currentData changes
  useEffect(() => {
    if (isSortingOrArray || isBinarySearch) {
      if (currentArray.length > 0) {
        setCustomText(currentArray.join(', '));
        setArraySize(currentArray.length);
      }
    }
  }, [currentData, currentModule.id]);

  // Size change handler that IMMEDIATELY updates array and timeline
  const handleSizeChange = (newSize: number) => {
    setArraySize(newSize);
    setErrorMsg(null);

    if (isBinarySearch) {
      const sorted = generateSortedArray(newSize);
      const target = sorted[Math.floor(sorted.length / 2)];
      setCustomText(sorted.join(', '));
      onApplyData({ array: sorted, target });
    } else {
      const newArr = generateRandomArray(newSize);
      setCustomText(newArr.join(', '));
      onApplyData(newArr);
    }
  };

  // Preset generators for sorting & linear search
  const sortingPresets = [
    { label: 'Random', icon: Shuffle, fn: () => generateRandomArray(arraySize) },
    { label: 'Nearly Sorted', icon: TrendingUp, fn: () => generateNearlySortedArray(arraySize) },
    { label: 'Reversed', icon: TrendingDown, fn: () => generateReversedArray(arraySize) },
    { label: 'Few Unique', icon: Layers, fn: () => generateFewUniqueArray(arraySize) },
    { label: 'Sorted', icon: CheckCheck, fn: () => generateSortedArray(arraySize) },
  ];

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSortingOrArray && !isBinarySearch) return;

    const result = parseCustomArray(customText);
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setErrorMsg(null);
      if (isBinarySearch) {
        const sorted = [...result.data].sort((a, b) => a - b);
        setCustomText(sorted.join(', '));
        onApplyData({ array: sorted, target: sorted[Math.floor(sorted.length / 2)] });
      } else {
        onApplyData(result.data);
      }
    }
  };

  const handleApplyPreset = (data: any) => {
    setErrorMsg(null);
    onApplyData(data);
  };

  return (
    <div className="bg-[#0B0F19] border-b border-[#1F293D] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* 1. If Module has native custom presets (Graphs, Trees, DP, Math, Binary Search) */}
      <div className="flex flex-wrap items-center gap-1.5 py-0.5">
        <span className="text-slate-400 font-medium flex items-center gap-1 mr-1 text-[11px] uppercase tracking-wider font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#06B6D4]" /> Presets:
        </span>

        {/* If the module has curated presets in its definition, show them! */}
        {currentModule.presets && currentModule.presets.length > 0 ? (
          currentModule.presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.data)}
              title={preset.description}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 text-slate-300 hover:text-white font-medium transition-colors whitespace-nowrap text-[11px]"
            >
              <Sparkles className="w-3 h-3 text-[#10B981]" />
              <span>{preset.label}</span>
            </button>
          ))
        ) : isSortingOrArray ? (
          sortingPresets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.label}
                onClick={() => {
                  const arr = preset.fn();
                  setCustomText(arr.join(', '));
                  onApplyData(arr);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 text-slate-300 hover:text-white font-medium transition-colors whitespace-nowrap text-[11px]"
              >
                <Icon className="w-3 h-3 text-[#10B981]" />
                <span>{preset.label}</span>
              </button>
            );
          })
        ) : null}

        {/* Size Selector ONLY for Array / Sorting / Binary Search modules */}
        {(isSortingOrArray || isBinarySearch) && (
          <div className="flex items-center gap-1.5 border-l border-[#1F293D] pl-2 ml-1 text-slate-400 text-[11px]">
            <button
              onClick={() => handleSizeChange(arraySize)}
              title="Regenerate random numbers"
              className="p-1 rounded-md bg-[#111827] border border-[#1F293D] hover:border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 transition-colors mr-1"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <span className="font-mono text-slate-400">Size:</span>
            {[6, 8, 10, 14].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => handleSizeChange(sz)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  arraySize === sz
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-bold'
                    : 'hover:bg-[#1F2937] text-slate-400'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Custom Input Form ONLY for Array / Sorting / Binary Search modules */}
      {(isSortingOrArray || isBinarySearch) && (
        <form onSubmit={handleApplyCustom} className="flex items-center gap-2 flex-1 max-w-md min-w-[260px]">
          <div className="relative flex-1">
            <input
              type="text"
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Custom numbers (e.g. 45, 12, 89, 3)"
              className="w-full bg-[#111827] border border-[#1F293D] focus:border-[#10B981] rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500 font-mono outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981] hover:text-[#0B0F19] font-semibold text-xs transition-all flex items-center gap-1 shrink-0"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </form>
      )}

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
