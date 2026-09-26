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
  const isArrayAccepting =
    currentModule.category === 'sorting' ||
    currentModule.category === 'linked-lists' ||
    [
      'linear-search',
      'binary-search',
      'rotated-sorted-array',
      'two-pointers-water',
      'sliding-window-max-sum',
      'queue-visualizer',
      'monotonic-stack',
      'binary-heap',
      'bst-insert',
      'avl-tree',
      'tree-traversals',
      'kadanes-algorithm',
      'house-robber',
    ].includes(currentModule.id);

  const isStringAccepting = [
    'balanced-parentheses',
    'longest-palindromic-substring',
  ].includes(currentModule.id);

  const isBinarySearch = currentModule.id === 'binary-search';

  // Extract array representation if applicable
  const currentArray: number[] = Array.isArray(currentData)
    ? currentData
    : Array.isArray(currentData?.array)
    ? currentData.array
    : Array.isArray(currentData?.values)
    ? currentData.values
    : Array.isArray(currentData?.valuesToInsert)
    ? currentData.valuesToInsert
    : Array.isArray(currentData?.nums)
    ? currentData.nums
    : [];

  const [customText, setCustomText] = useState<string>(() => {
    if (isArrayAccepting && currentArray.length > 0) return currentArray.join(', ');
    if (isStringAccepting && typeof currentData === 'string') return currentData;
    return '';
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [arraySize, setArraySize] = useState<number>(
    currentArray.length > 0 ? currentArray.length : 10
  );

  // Sync customText when currentData changes
  useEffect(() => {
    setErrorMsg(null);
    if (isArrayAccepting && currentArray.length > 0) {
      setCustomText(currentArray.join(', '));
      setArraySize(currentArray.length);
    } else if (isStringAccepting && typeof currentData === 'string') {
      setCustomText(currentData);
    }
  }, [currentData, currentModule.id]);

  // Size change handler that IMMEDIATELY updates array and timeline
  const handleSizeChange = (newSize: number) => {
    setArraySize(newSize);
    setErrorMsg(null);

    if (isBinarySearch) {
      const sorted = generateSortedArray(newSize);
      setCustomText(sorted.join(', '));
      onApplyData(sorted);
    } else {
      const newArr = generateRandomArray(newSize);
      setCustomText(newArr.join(', '));
      onApplyData(newArr);
    }
  };

  // Preset generators for sorting modules without explicit presets
  const sortingPresets = [
    { label: 'Random', icon: Shuffle, fn: () => generateRandomArray(arraySize) },
    { label: 'Nearly Sorted', icon: TrendingUp, fn: () => generateNearlySortedArray(arraySize) },
    { label: 'Reversed', icon: TrendingDown, fn: () => generateReversedArray(arraySize) },
    { label: 'Few Unique', icon: Layers, fn: () => generateFewUniqueArray(arraySize) },
    { label: 'Sorted', icon: CheckCheck, fn: () => generateSortedArray(arraySize) },
  ];

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();

    if (isArrayAccepting) {
      const result = parseCustomArray(customText);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setErrorMsg(null);
        onApplyData(result.data);
      }
    } else if (isStringAccepting) {
      const trimmed = customText.trim();
      if (!trimmed) {
        setErrorMsg('Input string cannot be empty.');
      } else {
        setErrorMsg(null);
        onApplyData(trimmed);
      }
    }
  };

  const handleApplyPreset = (data: any) => {
    setErrorMsg(null);
    onApplyData(data);
  };

  const hasModulePresets = currentModule.presets && currentModule.presets.length > 0;
  const showSortingPresets = !hasModulePresets && (currentModule.category === 'sorting' || isArrayAccepting);

  return (
    <div className="bg-[#0B0F19] border-b border-[#1F293D] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* 1. Presets / Curated Scenarios */}
      <div className="flex flex-wrap items-center gap-1.5 py-0.5">
        <span className="text-slate-400 font-medium flex items-center gap-1 mr-1 text-[11px] uppercase tracking-wider font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#06B6D4]" /> Presets:
        </span>

        {/* Module defined curated presets */}
        {hasModulePresets ? (
          currentModule.presets!.map((preset) => (
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
        ) : showSortingPresets ? (
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
        ) : (
          <span className="text-slate-500 font-mono text-[11px] italic">Default configured</span>
        )}

        {/* Size Selector for Array-Accepting modules */}
        {isArrayAccepting && (
          <div className="flex items-center gap-1.5 border-l border-[#1F293D] pl-2 ml-1 text-slate-400 text-[11px]">
            <button
              onClick={() => handleSizeChange(arraySize)}
              title="Regenerate numbers"
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

      {/* 2. Custom Input Form (Array numbers or String) */}
      {(isArrayAccepting || isStringAccepting) && (
        <form onSubmit={handleApplyCustom} className="flex items-center gap-2 flex-1 max-w-md min-w-[260px]">
          <div className="relative flex-1">
            <input
              type="text"
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={
                isArrayAccepting
                  ? 'Custom numbers (e.g. 45, 12, 89, 3)'
                  : "Custom string (e.g. '({[]})' or 'racecar')"
              }
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
