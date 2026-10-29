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
  Crosshair,
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
  onApplyData: (data: any, customTarget?: number) => void;
  currentData: any;
}

const ARRAY_KEYS = [
  'array',
  'values',
  'valuesToInsert',
  'initialValues',
  'nums',
  'houses',
  'keys',
  'elements',
  'dims',
  'piles',
] as const;

const STRING_KEYS = ['text', 'str', 'expression', 'word'] as const;

export function detectNumericArrayField(data: any): { key: string | null; values: number[] } | null {
  if (Array.isArray(data) && data.every((x) => typeof x === 'number')) {
    return { key: null, values: data };
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const k of ARRAY_KEYS) {
      if (Array.isArray(data[k]) && data[k].every((x: any) => typeof x === 'number')) {
        return { key: k, values: data[k] };
      }
    }
  }
  return null;
}

export function detectStringField(data: any): { key: string | null; value: string } | null {
  if (typeof data === 'string') {
    return { key: null, value: data };
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const k of STRING_KEYS) {
      if (typeof data[k] === 'string') {
        return { key: k, value: data[k] };
      }
    }
  }
  return null;
}

export const PlaygroundBar: React.FC<PlaygroundBarProps> = ({
  currentModule,
  onApplyData,
  currentData,
}) => {
  const detectedArray = detectNumericArrayField(currentData ?? currentModule.defaultInput);
  const detectedString = !detectedArray
    ? detectStringField(currentData ?? currentModule.defaultInput)
    : null;

  const isArrayAccepting = Boolean(detectedArray);
  const isStringAccepting = Boolean(detectedString);

  const hasNumericTarget =
    typeof currentData?.target === 'number' ||
    typeof currentData?.searchTarget === 'number' ||
    typeof currentData?.searchKey === 'number' ||
    typeof currentData?.keyToDelete === 'number';

  const isTargetSearch =
    hasNumericTarget ||
    [
      'linear-search',
      'binary-search',
      'jump-search',
      'interpolation-search',
      'exponential-search',
      'ternary-search',
      'rotated-sorted-array',
    ].includes(currentModule.id);

  const isSortedSearch = [
    'binary-search',
    'jump-search',
    'interpolation-search',
    'exponential-search',
    'ternary-search',
  ].includes(currentModule.id);

  const currentArray: number[] = detectedArray ? detectedArray.values : [];

  const extractedTarget: number | undefined =
    typeof currentData?.target === 'number'
      ? currentData.target
      : typeof currentData?.searchTarget === 'number'
      ? currentData.searchTarget
      : typeof currentData?.searchKey === 'number'
      ? currentData.searchKey
      : typeof currentData?.keyToDelete === 'number'
      ? currentData.keyToDelete
      : undefined;

  const [customText, setCustomText] = useState<string>(() => {
    if (detectedArray && detectedArray.values.length > 0) return detectedArray.values.join(', ');
    if (detectedString) return detectedString.value;
    return '';
  });

  const [targetText, setTargetText] = useState<string>(() =>
    extractedTarget !== undefined ? String(extractedTarget) : ''
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [arraySize, setArraySize] = useState<number>(
    currentArray.length > 0 ? currentArray.length : 8
  );

  // Sync customText and targetText when currentData changes
  useEffect(() => {
    setErrorMsg(null);
    const arrField = detectNumericArrayField(currentData);
    const strField = !arrField ? detectStringField(currentData) : null;
    if (arrField && arrField.values.length > 0) {
      setCustomText(arrField.values.join(', '));
      setArraySize(arrField.values.length);
    } else if (strField) {
      setCustomText(strField.value);
    }
    if (extractedTarget !== undefined) {
      setTargetText(String(extractedTarget));
    } else {
      setTargetText('');
    }
  }, [currentData, currentModule.id, extractedTarget]);

  const handleSizeChange = (newSize: number) => {
    setArraySize(newSize);
    setErrorMsg(null);
    if (isSortedSearch) {
      const sorted = generateSortedArray(newSize);
      const midTarget = sorted[Math.floor(sorted.length / 2)];
      setCustomText(sorted.join(', '));
      setTargetText(String(midTarget));
      onApplyData(sorted, midTarget);
    } else {
      const newArr = generateRandomArray(newSize);
      const midTarget = newArr[Math.floor(newArr.length / 2)];
      setCustomText(newArr.join(', '));
      if (isTargetSearch) setTargetText(String(midTarget));
      onApplyData(newArr, isTargetSearch ? midTarget : undefined);
    }
  };

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
        let parsedTarget: number | undefined = undefined;
        if (isTargetSearch && targetText.trim() !== '') {
          const num = Number(targetText.trim());
          if (Number.isNaN(num)) {
            setErrorMsg('Target value must be a valid number.');
            return;
          }
          parsedTarget = num;
        }
        setErrorMsg(null);
        onApplyData(result.data, parsedTarget);
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
  const showSortingPresets =
    !hasModulePresets && (currentModule.category === 'sorting' || isArrayAccepting);

  return (
    <div className="bg-[#0B0F19] border-b border-[#1F293D] px-3 sm:px-4 py-1.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs select-none shrink-0">
      {/* 1. Presets / Curated Scenarios (horizontally scrollable on compact widths so it never wraps to 2 rows) */}
      <div className="flex items-center gap-1.5 py-0.5 overflow-x-auto no-scrollbar min-w-0 flex-1">
        <span className="text-slate-400 font-medium flex items-center gap-1 mr-0.5 text-[11px] uppercase tracking-wider font-mono shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="hidden sm:inline">Presets:</span>
        </span>

        {hasModulePresets ? (
          currentModule.presets!.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.data)}
              title={preset.description}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 text-slate-300 hover:text-white font-medium transition-colors whitespace-nowrap text-[11px] cursor-pointer shrink-0"
            >
              <Sparkles className="w-3 h-3 text-[#10B981] shrink-0" />
              <span>{preset.label}</span>
            </button>
          ))
        ) : showSortingPresets ? (
          sortingPresets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const arr = preset.fn();
                  setCustomText(arr.join(', '));
                  onApplyData(arr);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 text-slate-300 hover:text-white font-medium transition-colors whitespace-nowrap text-[11px] cursor-pointer shrink-0"
              >
                <Icon className="w-3 h-3 text-[#10B981] shrink-0" />
                <span>{preset.label}</span>
              </button>
            );
          })
        ) : (
          <span className="text-slate-500 font-mono text-[11px] italic shrink-0">Default configured</span>
        )}

        {/* Size Selector for Array-Accepting modules */}
        {isArrayAccepting && (
          <div className="flex items-center gap-1 border-l border-[#1F293D] pl-2 ml-1 text-slate-400 text-[11px] shrink-0">
            <button
              type="button"
              onClick={() => handleSizeChange(arraySize)}
              title="Regenerate random dataset"
              aria-label="Regenerate random dataset"
              className="p-1 rounded-md bg-[#111827] border border-[#1F293D] hover:border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 transition-colors mr-0.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <span className="font-mono text-slate-400 hidden lg:inline">Size:</span>
            {[6, 8, 10, 14].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => handleSizeChange(sz)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums transition-colors cursor-pointer ${
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

      {/* 2. Custom Input Form (Array numbers + optional Search Target, or String) */}
      {(isArrayAccepting || isStringAccepting) && (
        <form
          onSubmit={handleApplyCustom}
          className="flex items-center gap-1.5 shrink-0 w-full md:w-auto md:min-w-[230px] lg:min-w-[280px] xl:min-w-[330px] max-w-md"
        >
          <div className="relative flex-1">
            <input
              type="text"
              aria-label="Custom dataset input"
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={
                isArrayAccepting
                  ? 'Custom numbers (e.g. 45, 12, 89, 3)'
                  : "Custom string (e.g. '({[]})' or 'ABABDABACDABABCABAB')"
              }
              className="w-full bg-[#111827] border border-[#1F293D] focus:border-[#10B981] rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500 font-mono outline-none transition-colors"
            />
          </div>

          {isTargetSearch && (
            <div className="flex items-center gap-1 bg-[#111827] border border-[#1F293D] focus-within:border-amber-400 rounded-lg px-2 py-1 shrink-0">
              <Crosshair className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-[10px] font-mono text-slate-400">Target:</span>
              <input
                type="text"
                aria-label="Target value"
                value={targetText}
                onChange={(e) => {
                  setTargetText(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="42"
                className="w-12 bg-transparent text-xs text-amber-300 font-mono font-bold tabular-nums outline-none text-center"
              />
            </div>
          )}

          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981] hover:text-[#0B0F19] font-semibold text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap"
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
