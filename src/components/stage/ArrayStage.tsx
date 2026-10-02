import React from 'react';
import { motion } from 'motion/react';
import { ElementStatus } from '../../core/types';
import { ActiveExpressionCallout } from './ActiveExpressionCallout';
import { ComparisonArc } from './ComparisonArc';

export function getElementSpectrumColor(val: number, minVal: number, maxVal: number): string {
  const range = maxVal - minVal || 1;
  const ratio = Math.max(0, Math.min(1, (val - minVal) / range));
  // Hue from 250 (Deep Indigo/Violet) through 140 (Emerald) to 0 (Rose/Red)
  const hue = Math.round(250 - ratio * 250);
  return `hsl(${hue}, 85%, 45%)`;
}

export interface ArrayElement {
  id: string | number;
  value: number;
  status: ElementStatus;
}

export interface ArrayStageState {
  array: ArrayElement[];
  pointers?: Record<string, number>;
  discardedRange?: [number, number]; // e.g. for Binary Search
  target?: number;
  auxiliary?: any;
  conditionEval?: {
    expr?: string;
    condition?: string;
    result?: any;
    formatted?: string;
  };
  action?: string;
}

const EMPTY_POINTERS: Record<string, number> = {};

interface ArrayStageProps {
  state: ArrayStageState;
  projection: '2d' | 'isometric';
  conditionEval?: {
    expr?: string;
    condition?: string;
    result?: any;
    formatted?: string;
  };
  action?: string;
}

export const ArrayStage: React.FC<ArrayStageProps> = ({
  state,
  projection,
  conditionEval: propConditionEval,
  action: propAction,
}) => {
  const rawArray = state.array || [];
  const pointers = state.pointers || EMPTY_POINTERS;
  const discardedRange = state.discardedRange;
  const activeConditionEval = propConditionEval || state.conditionEval;
  const activeAction = propAction || state.action;

  // Defensive normalization: Guarantee every element has an id, numeric value, and status
  const array: ArrayElement[] = React.useMemo(() => {
    return (rawArray || []).map((el: any, idx: number) => {
      if (typeof el === 'object' && el !== null && typeof el.value === 'number') {
        return el;
      }
      const val = typeof el === 'number' ? el : (typeof el?.value === 'number' ? el.value : Number(el) || 0);
      const isPointed = pointers && Object.values(pointers).includes(idx);
      return {
        id: `el-${idx}`,
        value: val,
        status: isPointed ? 'comparing' : 'default',
      };
    });
  }, [rawArray, pointers]);

  const [colorMode, setColorMode] = React.useState<'classic' | 'spectrum'>('classic');
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [arcCoords, setArcCoords] = React.useState<{ x1: number; x2: number } | null>(null);

  // Identify active comparing or swapping pair for ComparisonArc
  const comparingIndices: number[] = [];
  const swappingIndices: number[] = [];
  array.forEach((el, idx) => {
    if (el.status === 'comparing') comparingIndices.push(idx);
    if (el.status === 'swapping') swappingIndices.push(idx);
  });

  const activePair =
    swappingIndices.length >= 2
      ? { idx1: swappingIndices[0], idx2: swappingIndices[1], status: 'swapping' as const }
      : comparingIndices.length >= 2
      ? { idx1: comparingIndices[0], idx2: comparingIndices[1], status: 'comparing' as const }
      : null;

  React.useEffect(() => {
    if (!activePair || !stageRef.current) {
      setArcCoords(null);
      return;
    }

    const updateCoords = () => {
      if (!stageRef.current) return;
      const stageRect = stageRef.current.getBoundingClientRect();
      const col1 = stageRef.current.querySelector<HTMLElement>(`[data-index="${activePair.idx1}"]`);
      const col2 = stageRef.current.querySelector<HTMLElement>(`[data-index="${activePair.idx2}"]`);
      if (col1 && col2) {
        const rect1 = col1.getBoundingClientRect();
        const rect2 = col2.getBoundingClientRect();
        let x1 = rect1.left + rect1.width / 2 - stageRect.left;
        let x2 = rect2.left + rect2.width / 2 - stageRect.left;

        // Fallback for jsdom / unlaid-out test environments
        if (Math.abs(x1 - x2) < 1 && array.length > 1) {
          const totalWidth = stageRect.width || 600;
          x1 = ((activePair.idx1 + 0.5) / array.length) * totalWidth;
          x2 = ((activePair.idx2 + 0.5) / array.length) * totalWidth;
        }

        setArcCoords({ x1, x2 });
      } else {
        // Direct calculation fallback
        const totalWidth = stageRect.width || 600;
        const x1 = ((activePair.idx1 + 0.5) / array.length) * totalWidth;
        const x2 = ((activePair.idx2 + 0.5) / array.length) * totalWidth;
        setArcCoords({ x1, x2 });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [array.length, activePair?.idx1, activePair?.idx2, activePair?.status]);

  if (array.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 min-h-[320px]">
        <div className="flex flex-col items-center justify-center max-w-sm p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
          <div className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-500 mb-3 text-lg">
            📊
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 mb-1">
            Array Workspace Ready
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Apply a preset above or press Step to populate elements.
          </span>
        </div>
      </div>
    );
  }

  // Calculate min & max values for height scaling and spectrum colors
  const minValue = Math.min(...array.map((el) => el.value));
  const maxValue = Math.max(1, ...array.map((el) => el.value));

  // Invert pointer map to easily lookup all pointers sitting on index i
  const pointersAtIndex: Record<number, string[]> = {};
  Object.entries(pointers).forEach(([name, idx]) => {
    if (idx !== undefined && idx !== null && idx >= 0 && idx < array.length) {
      if (!pointersAtIndex[idx]) pointersAtIndex[idx] = [];
      pointersAtIndex[idx].push(name);
    }
  });

  // Calculate arc label
  let arcLabel: string | null = null;
  if (activePair) {
    if (activePair.status === 'swapping') {
      arcLabel = activeAction || 'SWAP';
    } else if (activeConditionEval?.formatted) {
      arcLabel = activeConditionEval.formatted;
    } else if (activeConditionEval?.expr) {
      arcLabel = activeConditionEval.expr;
    } else {
      arcLabel = `${array[activePair.idx1]?.value} ⇄ ${array[activePair.idx2]?.value}`;
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4 overflow-x-auto min-h-[320px]">
      {/* Top Bar: Active Expression Callout & Spectrum / Classic Mode Toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-2">
        <div className="flex-1 flex justify-center">
          <ActiveExpressionCallout
            elements={array}
            conditionEval={activeConditionEval}
            action={activeAction}
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono shrink-0 ml-2">
          <button
            type="button"
            onClick={() => setColorMode('classic')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              colorMode === 'classic'
                ? 'bg-slate-800 text-cyan-400 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Classic DSA Status Colors"
          >
            Bars
          </button>
          <button
            type="button"
            onClick={() => setColorMode('spectrum')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
              colorMode === 'spectrum'
                ? 'bg-gradient-to-r from-indigo-500/30 via-emerald-500/30 to-rose-500/30 text-white font-bold border border-white/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Rainbow Spectrum Heatmap"
          >
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 via-emerald-400 to-rose-400 inline-block" />
            Rainbow
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className={`w-full max-w-4xl flex items-end justify-center gap-2 sm:gap-3 transition-all duration-500 relative pt-10 ${
          projection === 'isometric' ? 'stage-isometric py-8' : 'stage-flat'
        }`}
      >
        {/* Dynamic Curved SVG Comparison Arc */}
        {activePair && arcCoords && (
          <ComparisonArc
            x1={arcCoords.x1}
            x2={arcCoords.x2}
            distance={Math.abs(activePair.idx2 - activePair.idx1)}
            status={activePair.status}
            label={arcLabel}
          />
        )}

        {array.map((el, idx) => {
          const heightPercent = Math.max(18, Math.round((el.value / maxValue) * 100));
          const elPointers = pointersAtIndex[idx] || [];

          const isDiscarded =
            discardedRange && idx >= discardedRange[0] && idx <= discardedRange[1];

          // Determine styles based on status and colorMode
          let bgClass = 'bg-[#1E293B] border-[#334155] text-slate-200';
          let glowClass = '';
          const customStyle: React.CSSProperties = { height: `${heightPercent * 2.2}px` };

          if (isDiscarded) {
            bgClass = 'bg-[#1F2937]/30 border-dashed border-[#374151] text-slate-600 opacity-30';
          } else if (colorMode === 'spectrum') {
            const spectrumColor = getElementSpectrumColor(el.value, minValue, maxValue);
            customStyle.backgroundColor = spectrumColor;
            customStyle.borderColor = spectrumColor;

            switch (el.status) {
              case 'comparing':
                glowClass = 'shadow-lg shadow-[#F59E0B]/35 ring-2 ring-[#F59E0B]';
                break;
              case 'swapping':
                glowClass = 'shadow-lg shadow-[#F43F5E]/45 ring-2 ring-[#F43F5E] animate-pulse';
                break;
              case 'sorted':
                glowClass = 'shadow-md shadow-[#10B981]/30 ring-2 ring-[#10B981]';
                break;
              case 'pivot':
                glowClass = 'shadow-lg shadow-[#8B5CF6]/40 ring-2 ring-[#8B5CF6]';
                break;
              case 'active':
                glowClass = 'shadow-md shadow-[#06B6D4]/30 ring-1 ring-[#06B6D4]';
                break;
            }
          } else {
            switch (el.status) {
              case 'comparing':
                bgClass = 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]';
                glowClass = 'shadow-lg shadow-[#F59E0B]/20 ring-2 ring-[#F59E0B]/50';
                break;
              case 'swapping':
                bgClass = 'bg-[#F43F5E]/20 border-[#F43F5E] text-[#F43F5E]';
                glowClass = 'shadow-lg shadow-[#F43F5E]/30 ring-2 ring-[#F43F5E]/60';
                break;
              case 'sorted':
                bgClass = 'bg-[#10B981]/25 border-[#10B981] text-[#10B981]';
                glowClass = 'shadow-lg shadow-[#10B981]/25';
                break;
              case 'pivot':
                bgClass = 'bg-[#8B5CF6]/25 border-[#8B5CF6] text-[#A78BFA]';
                glowClass = 'shadow-lg shadow-[#8B5CF6]/30 ring-2 ring-[#8B5CF6]/60';
                break;
              case 'active':
                bgClass = 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#06B6D4]';
                glowClass = 'shadow-md shadow-[#06B6D4]/20 ring-1 ring-[#06B6D4]/50';
                break;
            }
          }

          return (
            <div
              key={el.id ?? idx}
              data-index={idx}
              className="flex flex-col items-center flex-1 max-w-[56px] min-w-[28px] relative group"
            >
              {/* Value Header */}
              <span
                className={`text-[11px] sm:text-xs font-mono font-bold mb-1.5 transition-colors ${
                  el.status === 'sorted'
                    ? 'text-[#10B981]'
                    : el.status === 'pivot'
                    ? 'text-[#A78BFA]'
                    : el.status === 'comparing'
                    ? 'text-[#F59E0B]'
                    : el.status === 'swapping'
                    ? 'text-[#F43F5E]'
                    : 'text-slate-300'
                }`}
              >
                {el.value}
              </span>

              {/* Vertical Bar */}
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                style={customStyle}
                className={`w-full rounded-t-lg sm:rounded-t-xl border flex flex-col justify-end items-center pb-2 transition-all ${bgClass} ${glowClass}`}
              >
                {/* Visual bar gradient line */}
                <div className="w-1/3 h-1 rounded-full bg-white/20 mb-1" />
              </motion.div>

              {/* Index Subtext */}
              <span className="text-[10px] font-mono text-slate-500 mt-1 select-none">
                [{idx}]
              </span>

              {/* Pointer Badges: Compact, never overflow into adjacent columns */}
              <div className="mt-1 flex flex-row items-center justify-center gap-0.5 flex-wrap min-h-[18px] z-10 max-w-full overflow-hidden">
                {elPointers.map((pName) => (
                  <motion.div
                    key={pName}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-1 py-0.5 rounded text-[8px] leading-none font-mono font-bold uppercase shadow-sm border whitespace-nowrap ${
                      pName === 'pivot'
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                        : pName === 'left' || pName === 'i' || pName === 'low'
                        ? 'bg-[#06B6D4] text-[#0B0F19] border-[#06B6D4]'
                        : 'bg-[#10B981] text-[#0B0F19] border-[#10B981]'
                    }`}
                  >
                    {pName}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
