import React from 'react';
import { motion } from 'motion/react';
import { ElementStatus } from '../../core/types';
import { ComparisonArc } from './ComparisonArc';
import { ActiveExpressionCallout } from './ActiveExpressionCallout';
import { groupPointersByIndex } from '../../utils/stageLayout';

/**
 * Pure helper to compute an HSL rainbow color for a numeric value
 * mapped across the array's [minValue, maxValue] domain.
 */
export function getElementSpectrumColor(
  value: number,
  minVal: number,
  maxVal: number
): string {
  const span = Math.max(1, maxVal - minVal);
  const ratio = Math.max(0, Math.min(1, (value - minVal) / span));
  const hue = Math.round(220 - ratio * 205);
  return `hsl(${hue}, 82%, 56%)`;
}

export interface ArrayElement {
  id: string | number;
  value: number;
  status: ElementStatus;
  label?: string;
}

export interface ArrayStageState {
  array: ArrayElement[];
  pointers?: Record<string, number>;
  discardedRange?: [number, number];
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
      const val =
        typeof el === 'number'
          ? el
          : typeof el?.value === 'number'
          ? el.value
          : Number(el) || 0;
      const isPointed = pointers && Object.values(pointers).includes(idx);
      return {
        id: `el-${idx}`,
        value: val,
        status: isPointed ? 'comparing' : 'default',
      };
    });
  }, [rawArray, pointers]);

  const [colorMode, setColorMode] = React.useState<'classic' | 'spectrum'>('classic');
  const [inspectedIdx, setInspectedIdx] = React.useState<number | null>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [arcCoords, setArcCoords] = React.useState<{ x1: number; x2: number } | null>(null);

  // Identify active comparing, swapping, or pivot-comparing pair for ComparisonArc
  const comparingIndices: number[] = [];
  const swappingIndices: number[] = [];
  let pivotIndex: number | null = null;
  array.forEach((el, idx) => {
    if (el.status === 'comparing') comparingIndices.push(idx);
    if (el.status === 'swapping') swappingIndices.push(idx);
    if (el.status === 'pivot') pivotIndex = idx;
  });

  const activePair =
    swappingIndices.length >= 2
      ? { idx1: swappingIndices[0], idx2: swappingIndices[1], status: 'swapping' as const }
      : comparingIndices.length >= 2
      ? { idx1: comparingIndices[0], idx2: comparingIndices[1], status: 'comparing' as const }
      : comparingIndices.length === 1 && pivotIndex !== null && comparingIndices[0] !== pivotIndex
      ? { idx1: comparingIndices[0], idx2: pivotIndex, status: 'comparing' as const }
      : null;

  React.useEffect(() => {
    if (!activePair || !stageRef.current) {
      setArcCoords(null);
      return;
    }

    const updateCoords = () => {
      if (!stageRef.current) return;
      const stageRect = stageRef.current.getBoundingClientRect();
      const col1 = stageRef.current.querySelector<HTMLElement>(
        `[data-index="${activePair.idx1}"]`
      );
      const col2 = stageRef.current.querySelector<HTMLElement>(
        `[data-index="${activePair.idx2}"]`
      );
      if (col1 && col2) {
        const rect1 = col1.getBoundingClientRect();
        const rect2 = col2.getBoundingClientRect();
        let x1 = rect1.left + rect1.width / 2 - stageRect.left;
        let x2 = rect2.left + rect2.width / 2 - stageRect.left;

        if (Math.abs(x1 - x2) < 1 && array.length > 1) {
          const totalWidth = stageRect.width || 600;
          x1 = ((activePair.idx1 + 0.5) / array.length) * totalWidth;
          x2 = ((activePair.idx2 + 0.5) / array.length) * totalWidth;
        }

        setArcCoords({ x1, x2 });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [activePair?.idx1, activePair?.idx2, activePair?.status, array.length]);

  const maxValue = Math.max(...array.map((el) => Math.abs(el.value)), 10);
  const minValue = Math.min(...array.map((el) => el.value), 0);

  // Group pointers per index using deterministic role sorter
  const pointersByIndex = React.useMemo(() => groupPointersByIndex(pointers), [pointers]);

  // Detect active window / subarray boundaries if present
  const activeRangeBounds = React.useMemo(() => {
    const low = pointers['low'] ?? pointers['left'] ?? pointers['l'] ?? pointers['start'];
    const high = pointers['high'] ?? pointers['right'] ?? pointers['r'] ?? pointers['end'];
    if (typeof low === 'number' && typeof high === 'number' && low <= high) {
      return { low, high };
    }
    return null;
  }, [pointers]);

  // Concise arc label that complements (rather than duplicates) ActiveExpressionCallout
  let arcLabel: string | null = null;
  if (activePair) {
    const v1 = array[activePair.idx1]?.value;
    const v2 = array[activePair.idx2]?.value;
    if (activePair.status === 'swapping') {
      arcLabel = `SWAP ${v1} ↔ ${v2}`;
    } else {
      arcLabel = `${v1} vs ${v2}`;
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-5 overflow-x-auto select-none">
      {/* Top HUD Bar: Active Expression Callout, Target/Window Info & Mode Toggle */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 mb-2 px-2 min-h-[34px]">
        <div className="flex items-center gap-2 flex-wrap">
          <ActiveExpressionCallout
            elements={array}
            conditionEval={activeConditionEval}
            action={activeAction}
          />
          {state.target !== undefined && (
            <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold flex items-center gap-1.5">
              <span className="text-slate-400">Target:</span>
              <span className="font-bold text-white tabular-nums">{state.target}</span>
            </div>
          )}
          {activeRangeBounds && (
            <div className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[11px] font-mono hidden sm:flex items-center gap-1.5">
              <span className="text-slate-400">Active Subarray:</span>
              <span className="font-bold tabular-nums">
                [{activeRangeBounds.low} .. {activeRangeBounds.high}]
              </span>
              <span className="text-slate-500">
                ({activeRangeBounds.high - activeRangeBounds.low + 1} items)
              </span>
            </div>
          )}
          {inspectedIdx !== null && array[inspectedIdx] && (
            <div className="px-2.5 py-1 rounded-md bg-[#111827] border border-slate-700 text-xs font-mono flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold tabular-nums">arr[{inspectedIdx}]</span>
              <span className="text-slate-500">=</span>
              <span className="text-white font-bold tabular-nums">{array[inspectedIdx].value}</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-300 text-[11px]">{array[inspectedIdx].status}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => setColorMode('classic')}
            className={`relative px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap z-10 ${
              colorMode === 'classic'
                ? 'text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Classic Semantic Status Colors"
          >
            {colorMode === 'classic' && (
              <motion.div
                layoutId="array-color-mode"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-md bg-slate-800 border border-slate-700 -z-10"
              />
            )}
            <span>Classic</span>
          </button>
          <button
            type="button"
            onClick={() => setColorMode('spectrum')}
            className={`relative px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap z-10 ${
              colorMode === 'spectrum'
                ? 'text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Value Spectrum Heatmap"
          >
            {colorMode === 'spectrum' && (
              <motion.div
                layoutId="array-color-mode"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-md bg-slate-800 border border-slate-700 -z-10"
              />
            )}
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-rose-400 inline-block" />
            <span>Spectrum</span>
          </button>
        </div>
      </div>

      {/* Main Stage Container with Fixed Baseline Tracks (Zero Vertical Jumping or Text Overlap) */}
      <div
        ref={stageRef}
        className={`w-full max-w-4xl flex items-end justify-center gap-1.5 sm:gap-2.5 transition-all duration-300 relative pt-14 pb-2 px-2 ${
          projection === 'isometric' ? 'stage-isometric py-6' : 'stage-flat'
        }`}
      >
        {/* Dynamic Curved SVG Comparison Arc in Dedicated Top Headroom */}
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
          const absVal = Math.abs(el.value);
          const heightPercent = Math.max(14, Math.round((absVal / maxValue) * 100));
          const barPixelHeight = Math.round((heightPercent / 100) * 156);
          const elPointers = pointersByIndex[idx] || [];
          const isDiscarded =
            discardedRange && idx >= discardedRange[0] && idx <= discardedRange[1];
          const inActiveWindow =
            activeRangeBounds &&
            idx >= activeRangeBounds.low &&
            idx <= activeRangeBounds.high;

          // Determine styles based on status and colorMode
          let bgClass = 'bg-[#1E293B] border-[#334155] text-slate-200';
          let cellBgClass = 'bg-[#111827] border-[#1F293D] text-slate-200';
          let glowClass = '';
          const customStyle: React.CSSProperties = { height: `${barPixelHeight}px` };

          if (isDiscarded) {
            bgClass = 'bg-[#1F2937]/25 border-dashed border-[#374151] text-slate-600 opacity-35';
            cellBgClass = 'bg-[#0B0F19] border-dashed border-[#1F293D] text-slate-600 opacity-45';
          } else if (colorMode === 'spectrum') {
            const spectrumColor = getElementSpectrumColor(el.value, minValue, maxValue);
            customStyle.backgroundColor = spectrumColor;
            customStyle.borderColor = spectrumColor;

            switch (el.status) {
              case 'comparing':
                glowClass = 'shadow-lg shadow-[#F59E0B]/35 ring-2 ring-[#F59E0B]';
                cellBgClass = 'bg-[#F59E0B]/20 border-[#F59E0B] text-amber-200';
                break;
              case 'swapping':
                glowClass = 'shadow-lg shadow-[#F43F5E]/45 ring-2 ring-[#F43F5E]';
                cellBgClass = 'bg-[#F43F5E]/20 border-[#F43F5E] text-rose-200';
                break;
              case 'sorted':
                glowClass = 'shadow-md shadow-[#10B981]/30 ring-2 ring-[#10B981]';
                cellBgClass = 'bg-[#10B981]/20 border-[#10B981] text-emerald-200';
                break;
              case 'pivot':
                glowClass = 'shadow-lg shadow-[#8B5CF6]/40 ring-2 ring-[#8B5CF6]';
                cellBgClass = 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-purple-200';
                break;
              case 'active':
              case 'selected':
                glowClass = 'shadow-md shadow-[#06B6D4]/30 ring-1 ring-[#06B6D4]';
                cellBgClass = 'bg-[#06B6D4]/20 border-[#06B6D4] text-cyan-200';
                break;
            }
          } else {
            switch (el.status) {
              case 'comparing':
                bgClass = 'bg-[#F59E0B]/25 border-[#F59E0B] text-[#F59E0B]';
                cellBgClass = 'bg-[#F59E0B]/20 border-[#F59E0B] text-amber-200';
                glowClass = 'shadow-lg shadow-[#F59E0B]/20 ring-1 ring-[#F59E0B]/50';
                break;
              case 'swapping':
                bgClass = 'bg-[#F43F5E]/25 border-[#F43F5E] text-[#F43F5E]';
                cellBgClass = 'bg-[#F43F5E]/20 border-[#F43F5E] text-rose-200';
                glowClass = 'shadow-lg shadow-[#F43F5E]/30 ring-2 ring-[#F43F5E]/60';
                break;
              case 'sorted':
                bgClass = 'bg-[#10B981]/25 border-[#10B981] text-[#10B981]';
                cellBgClass = 'bg-[#10B981]/20 border-[#10B981] text-emerald-300';
                glowClass = 'shadow-md shadow-[#10B981]/20';
                break;
              case 'pivot':
                bgClass = 'bg-[#8B5CF6]/25 border-[#8B5CF6] text-[#A78BFA]';
                cellBgClass = 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-purple-200';
                glowClass = 'shadow-lg shadow-[#8B5CF6]/30 ring-1 ring-[#8B5CF6]/60';
                break;
              case 'active':
              case 'selected':
                bgClass = 'bg-[#06B6D4]/25 border-[#06B6D4] text-[#06B6D4]';
                cellBgClass = 'bg-[#06B6D4]/20 border-[#06B6D4] text-cyan-200';
                glowClass = 'shadow-md shadow-[#06B6D4]/20 ring-1 ring-[#06B6D4]/50';
                break;
            }
          }

          return (
            <motion.div
              key={el.id ?? idx}
              layout
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              data-index={idx}
              onMouseEnter={() => setInspectedIdx(idx)}
              onMouseLeave={() => setInspectedIdx((prev) => (prev === idx ? null : prev))}
              onClick={() => setInspectedIdx((prev) => (prev === idx ? null : idx))}
              className="flex flex-col items-center flex-1 max-w-[60px] min-w-[32px] relative group cursor-pointer"
            >
              {/* Track 1: Fixed-Height Bar Column Track (184px) so all bars share an exact baseline */}
              <div className="w-full h-[184px] flex flex-col justify-end items-center border-b border-slate-800/90 pb-1">
                {/* Value Header above bar */}
                <motion.span
                  key={`val-${idx}-${el.value}`}
                  initial={{ scale: 1.15, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  className={`text-[11px] font-mono font-bold tabular-nums mb-1 leading-none transition-colors ${
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
                </motion.span>

                {/* Proportional Vertical Bar */}
                <motion.div
                  layout
                  animate={{
                    height: barPixelHeight,
                    y: el.status === 'swapping' ? -3 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  style={customStyle}
                  className={`w-full rounded-t-lg border flex flex-col justify-end items-center pb-1.5 transition-colors ${bgClass} ${glowClass}`}
                >
                  <div className="w-1/3 h-0.5 rounded-full bg-white/25" />
                </motion.div>
              </div>

              {/* Track 2: Crisp Array Memory Cell + Index Subtext + Active Subarray Bracket */}
              <div
                className={`w-full flex flex-col items-center pt-1.5 pb-0.5 ${
                  inActiveWindow ? 'border-b-2 border-cyan-500/50' : 'border-b-2 border-transparent'
                }`}
              >
                <motion.div
                  layout
                  animate={{
                    scale: el.status === 'swapping' ? 1.06 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 25 }}
                  className={`w-full h-6 rounded border flex items-center justify-center text-[11px] font-mono font-bold tabular-nums transition-colors ${cellBgClass}`}
                >
                  {el.value}
                </motion.div>
                <span
                  className={`text-[10px] font-mono tabular-nums mt-0.5 leading-none ${
                    inActiveWindow ? 'text-cyan-400 font-semibold' : 'text-slate-500'
                  }`}
                >
                  [{idx}]
                </span>
              </div>

              {/* Track 3: Fixed-Height Pointer Stack Track (54px) — Glides horizontally via layoutId! */}
              <div className="w-full h-[54px] pt-1 flex flex-col items-center justify-start gap-0.5 overflow-visible z-10">
                {elPointers.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[8px] leading-none text-cyan-400 font-mono select-none"
                  >
                    ▲
                  </motion.span>
                )}
                {elPointers.slice(0, 3).map((ptr) => (
                  <motion.div
                    key={ptr.name}
                    layoutId={`stage-ptr-${ptr.name}`}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className={`px-1.5 py-0.5 rounded text-[9px] leading-none font-mono font-bold uppercase shadow-xs border whitespace-nowrap ${
                      ptr.role === 'pivot'
                        ? 'bg-[#8B5CF6] text-white border-[#A78BFA]'
                        : ptr.role === 'target'
                        ? 'bg-[#F59E0B] text-[#0B0F19] border-[#FBBF24]'
                        : ptr.role === 'left'
                        ? 'bg-[#06B6D4] text-[#0B0F19] border-[#22D3EE]'
                        : 'bg-[#10B981] text-[#0B0F19] border-[#34D399]'
                    }`}
                  >
                    {ptr.name}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
