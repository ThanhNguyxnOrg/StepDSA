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
  const [viewMode, setViewMode] = React.useState<'bars' | 'cells'>('bars');
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

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Layout Mode Toggle: Bars+Cells vs Compact Cells */}
          <div className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setViewMode('bars')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'bars'
                  ? 'bg-slate-800 border border-slate-700 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Proportional Bar Chart + Array Cells"
            >
              Bars
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cells')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'cells'
                  ? 'bg-slate-800 border border-slate-700 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Memory Cells Only"
            >
              Cells
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
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
            el.status === 'discarded' ||
            (discardedRange !== undefined && idx >= discardedRange[0] && idx <= discardedRange[1]);
          const inActiveWindow =
            !isDiscarded &&
            activeRangeBounds !== null &&
            idx >= activeRangeBounds.low &&
            idx <= activeRangeBounds.high;

          // Theme-native semantic token resolution for bar & cell
          const getSemanticToken = (status: ElementStatus) => {
            switch (status) {
              case 'comparing':
                return {
                  bg: 'var(--sem-comparing-bg)',
                  border: 'var(--sem-comparing-border)',
                  text: 'var(--sem-comparing-text)',
                  solid: 'var(--sem-comparing-solid)',
                  ring: 'shadow-lg ring-2 ring-[#F59E0B]/55',
                };
              case 'swapping':
                return {
                  bg: 'var(--sem-swapping-bg)',
                  border: 'var(--sem-swapping-border)',
                  text: 'var(--sem-swapping-text)',
                  solid: 'var(--sem-swapping-solid)',
                  ring: 'shadow-lg ring-2 ring-[#F43F5E]/65',
                };
              case 'sorted':
                return {
                  bg: 'var(--sem-sorted-bg)',
                  border: 'var(--sem-sorted-border)',
                  text: 'var(--sem-sorted-text)',
                  solid: 'var(--sem-sorted-solid)',
                  ring: 'shadow-md',
                };
              case 'pivot':
                return {
                  bg: 'var(--sem-pivot-bg)',
                  border: 'var(--sem-pivot-border)',
                  text: 'var(--sem-pivot-text)',
                  solid: 'var(--sem-pivot-solid)',
                  ring: 'shadow-lg ring-2 ring-[#8B5CF6]/55',
                };
              case 'active':
              case 'selected':
                return {
                  bg: 'var(--sem-active-bg)',
                  border: 'var(--sem-active-border)',
                  text: 'var(--sem-active-text)',
                  solid: 'var(--sem-active-solid)',
                  ring: 'shadow-md ring-1 ring-[#06B6D4]/55',
                };
              default:
                return {
                  bg: 'var(--sem-default-bg)',
                  border: 'var(--sem-default-border)',
                  text: 'var(--sem-default-text)',
                  solid: 'var(--sem-default-border)',
                  ring: '',
                };
            }
          };

          const sem = getSemanticToken(el.status);
          const barStyle: React.CSSProperties = {
            height: `${barPixelHeight}px`,
            backgroundColor: isDiscarded
              ? 'var(--sem-discarded-bg)'
              : colorMode === 'spectrum'
              ? getElementSpectrumColor(el.value, minValue, maxValue)
              : sem.bg,
            borderColor: isDiscarded
              ? 'var(--sem-discarded-border)'
              : colorMode === 'spectrum'
              ? getElementSpectrumColor(el.value, minValue, maxValue)
              : sem.border,
          };

          const cellStyle: React.CSSProperties = {
            backgroundColor: isDiscarded
              ? 'var(--sem-discarded-bg)'
              : el.status === 'default'
              ? 'var(--sem-default-cell-bg)'
              : sem.bg,
            borderColor: isDiscarded ? 'var(--sem-discarded-border)' : sem.border,
            color: isDiscarded ? 'var(--sem-discarded-text)' : sem.text,
          };

          const glowClass = isDiscarded ? '' : sem.ring;

          return (
            <motion.div
              key={el.id ?? idx}
              layout
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              data-index={idx}
              data-status={isDiscarded ? 'discarded' : el.status}
              onMouseEnter={() => setInspectedIdx(idx)}
              onMouseLeave={() => setInspectedIdx((prev) => (prev === idx ? null : prev))}
              onClick={() => setInspectedIdx((prev) => (prev === idx ? null : idx))}
              className={`flex flex-col items-center flex-1 max-w-[64px] min-w-[34px] relative group cursor-pointer transition-opacity ${
                isDiscarded ? 'opacity-45' : 'opacity-100'
              }`}
            >
              {/* Track 1: Fixed-Height Bar Column Track (184px) in Bars mode */}
              {viewMode === 'bars' && (
                <div className="w-full h-[184px] flex flex-col justify-end items-center border-b border-slate-800/90 pb-1">
                  {/* Value Header above bar */}
                  <motion.span
                    key={`val-${idx}-${el.value}`}
                    initial={{ scale: 1.15, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    style={{
                      color: isDiscarded
                        ? 'var(--sem-discarded-text)'
                        : el.status === 'default'
                        ? 'var(--theme-text-secondary)'
                        : sem.text,
                    }}
                    className={`text-[11px] font-mono font-bold tabular-nums mb-1 leading-none transition-colors ${
                      isDiscarded ? 'line-through' : ''
                    }`}
                  >
                    {el.value}
                  </motion.span>

                  {/* Proportional Vertical Bar */}
                  <motion.div
                    layout
                    animate={{
                      height: barPixelHeight,
                      y: el.status === 'swapping' ? -4 : el.status === 'comparing' ? -2 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    style={barStyle}
                    className={`w-full rounded-t-lg border-2 flex flex-col justify-between items-center py-1 transition-colors ${
                      isDiscarded ? 'border-dashed' : ''
                    } ${glowClass}`}
                  >
                    {!isDiscarded && (el.status === 'sorted' || el.status === 'pivot') ? (
                      <span
                        className="text-[9px] font-mono font-extrabold leading-none"
                        style={{ color: colorMode === 'spectrum' ? '#FFFFFF' : sem.text }}
                      >
                        {el.status === 'sorted' ? '✓' : 'P'}
                      </span>
                    ) : (
                      <span className="h-2" />
                    )}
                    <div
                      className="w-1/3 h-0.5 rounded-full opacity-40"
                      style={{ backgroundColor: isDiscarded ? 'transparent' : sem.border }}
                    />
                  </motion.div>
                </div>
              )}

              {/* Track 2: Crisp Array Memory Cell + Index Subtext + Active Subarray Bracket */}
              <div
                className={`w-full flex flex-col items-center pt-1.5 pb-1 transition-colors ${
                  inActiveWindow
                    ? 'border-b-2 border-cyan-500/70'
                    : 'border-b-2 border-transparent'
                }`}
              >
                <motion.div
                  layout
                  animate={{
                    scale: el.status === 'swapping' ? 1.08 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 25 }}
                  style={cellStyle}
                  className={`w-full ${
                    viewMode === 'cells' ? 'h-12 text-sm' : 'h-7 text-[11px]'
                  } rounded-md border-2 flex items-center justify-center gap-0.5 font-mono font-bold tabular-nums transition-colors ${
                    isDiscarded ? 'border-dashed line-through' : ''
                  } ${viewMode === 'cells' ? glowClass : ''}`}
                >
                  <span>{el.value}</span>
                  {el.status === 'sorted' && !isDiscarded && viewMode === 'cells' && (
                    <span className="text-[9px] opacity-80">✓</span>
                  )}
                </motion.div>
                <span
                  className={`text-[10px] font-mono tabular-nums mt-0.5 leading-none ${
                    inActiveWindow ? 'text-cyan-400 font-semibold' : 'text-slate-500'
                  }`}
                >
                  [{idx}]
                </span>
              </div>

              {/* Track 3: Fixed-Height Pointer Stack Track (56px) — Glides horizontally via layoutId! */}
              <div className="w-full h-[56px] pt-1 flex flex-col items-center justify-start gap-0.5 overflow-visible z-10">
                {elPointers.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[8px] leading-none text-cyan-400 font-mono select-none"
                  >
                    ▲
                  </motion.span>
                )}
                {elPointers.slice(0, 3).map((ptr) => {
                  const badgeStyle: React.CSSProperties =
                    ptr.role === 'pivot'
                      ? {
                          backgroundColor: 'var(--sem-pivot-solid)',
                          color: 'var(--sem-pivot-on-solid)',
                          borderColor: 'var(--sem-pivot-border)',
                        }
                      : ptr.role === 'target'
                      ? {
                          backgroundColor: 'var(--sem-comparing-solid)',
                          color: 'var(--sem-comparing-on-solid)',
                          borderColor: 'var(--sem-comparing-border)',
                        }
                      : ptr.role === 'left'
                      ? {
                          backgroundColor: 'var(--sem-active-solid)',
                          color: 'var(--sem-active-on-solid)',
                          borderColor: 'var(--sem-active-border)',
                        }
                      : {
                          backgroundColor: 'var(--sem-sorted-solid)',
                          color: 'var(--sem-sorted-on-solid)',
                          borderColor: 'var(--sem-sorted-border)',
                        };
                  return (
                    <motion.div
                      key={ptr.name}
                      layoutId={`stage-ptr-${ptr.name}`}
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      style={badgeStyle}
                      className="theme-solid-badge px-1.5 py-0.5 rounded text-[9px] leading-none font-mono font-bold uppercase shadow-xs border whitespace-nowrap"
                    >
                      {ptr.name}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
