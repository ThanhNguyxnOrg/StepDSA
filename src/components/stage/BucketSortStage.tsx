import React from 'react';
import { motion } from 'motion/react';
import { ElementStatus } from '../../core/types';
import { ArrayElement } from './ArrayStage';
import { groupPointersByIndex } from '../../utils/stageLayout';

/**
 * Bucket-sort specific stage: the live array row on top and the bucket
 * columns below, kept in lockstep with the algorithm phases:
 *   scatter  -> each value visibly drops into its value-range bucket
 *   sort     -> the active bucket is sorted in place (amber)
 *   gather   -> buckets are drained in ascending index order into the array
 */

export type BucketSortPhase = 'scatter' | 'sort' | 'gather' | 'done';

export interface BucketSortView {
  buckets: number[][];
  numBuckets: number;
  bucketRange: number;
  minVal: number;
  activeBucket: number | null;
  writeIdx: number;
  phase: BucketSortPhase;
  statusLabel?: string;
}

export interface BucketSortStageState {
  array: ArrayElement[];
  pointers?: Record<string, number>;
  bucketView?: BucketSortView;
}

const PHASE_CHIP_CLS: Record<BucketSortPhase, string> = {
  scatter: 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200',
  sort: 'bg-amber-500/15 border-amber-500/50 text-amber-200',
  gather: 'bg-violet-500/15 border-violet-500/50 text-violet-200',
  done: 'bg-emerald-500/20 border-emerald-400/60 text-emerald-100',
};

const CELL_STATUS_CLS: Record<ElementStatus, string> = {
  default: 'bg-[#1E293B]/70 border-[#334155] text-slate-200',
  comparing: 'bg-[#F59E0B]/25 border-[#F59E0B] text-amber-200',
  swapping: 'bg-[#F43F5E]/25 border-[#F43F5E] text-rose-200',
  active: 'bg-[#06B6D4]/30 border-[#06B6D4] text-cyan-100',
  selected: 'bg-[#06B6D4]/30 border-[#06B6D4] text-cyan-100',
  sorted: 'bg-[#10B981]/25 border-[#10B981] text-emerald-200',
  pivot: 'bg-[#8B5CF6]/25 border-[#8B5CF6] text-violet-200',
  discarded: 'bg-[#1F2937]/25 border-dashed border-[#374151] text-slate-600 opacity-50',
};

const POINTER_BADGE_CLS: Record<string, string> = {
  pivot: 'bg-[#8B5CF6] text-white border-[#A78BFA]',
  target: 'bg-[#F59E0B] text-[#0B0F19] border-[#FBBF24]',
  left: 'bg-[#06B6D4] text-[#0B0F19] border-[#22D3EE]',
  right: 'bg-[#10B981] text-[#0B0F19] border-[#34D399]',
};

interface BucketSortStageProps {
  state: BucketSortStageState;
  projection: '2d' | 'isometric';
}

export const BucketSortStage: React.FC<BucketSortStageProps> = ({
  state,
  projection,
}) => {
  const array = state.array || [];
  const n = array.length;
  const view = state.bucketView;
  const pointers = state.pointers || {};

  const pointersByIndex = React.useMemo(() => groupPointersByIndex(pointers), [pointers]);

  if (!view || n === 0) {
    return (
      <div className="w-full flex-1 flex items-center justify-center text-slate-500 font-mono text-sm">
        Generate a timeline to see the bucket view.
      </div>
    );
  }

  const { buckets, numBuckets, bucketRange, minVal, activeBucket, writeIdx, phase } = view;

  const bucketState = (b: number): 'active' | 'sorted' | 'gathered' | 'idle' => {
    if (activeBucket === b && phase !== 'done') return 'active';
    if (phase === 'sort' && activeBucket !== null && b < activeBucket) return 'sorted';
    if (phase === 'gather' && activeBucket !== null && b < activeBucket) return 'gathered';
    if (phase === 'done') return 'gathered';
    return 'idle';
  };

  return (
    <div className="w-full flex-1 max-h-full flex flex-col min-h-0 select-none">
      {/* Status strip */}
      <div className="shrink-0 px-3 sm:px-4 pt-2 pb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#1F293D]/40">
        {view.statusLabel && (
          <span
            data-testid="bs-status"
            className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-wide ${PHASE_CHIP_CLS[phase]}`}
          >
            {view.statusLabel}
          </span>
        )}
        <span className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900/60 text-[10px] font-mono text-slate-300">
          range <span className="text-cyan-300 font-bold tabular-nums">[{minVal}..{minVal + numBuckets * bucketRange - 1}]</span>
          {' · '}bucket size <span className="text-cyan-300 font-bold tabular-nums">{bucketRange}</span>
          {' · '}gathered <span className="text-emerald-300 font-bold tabular-nums">{writeIdx}</span>/{n}
        </span>
        <div className="hidden md:flex items-center gap-2 ml-auto text-[9px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-cyan-400 bg-cyan-500/20 inline-block" />
            scattering
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-amber-400 bg-amber-500/20 inline-block" />
            sorting bucket
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-violet-400 bg-violet-500/20 inline-block" />
            gathering
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-emerald-400 bg-emerald-500/20 inline-block" />
            sorted ✓
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-3 pb-3 pt-2">
        <div
          className={`mx-auto flex flex-col gap-3 ${
            projection === 'isometric' ? 'stage-isometric' : 'stage-flat'
          }`}
          style={{ minWidth: Math.max(560, n * 58) }}
        >
          {/* Array row */}
          <div>
            <div className="text-[10px] font-mono text-slate-500 px-1 pb-1">
              Array · write cursor at [{writeIdx}]
            </div>
            <div className="flex items-stretch" data-testid="bs-array-row">
              {array.map((el, idx) => {
                const status: ElementStatus = (el?.status as ElementStatus) || 'default';
                const badges = pointersByIndex[idx] || [];
                return (
                  <div
                    key={idx}
                    data-cell-index={idx}
                    className="flex-1 min-w-0 px-[1px] flex flex-col"
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      className={`h-8 min-w-0 rounded-[3px] border flex items-center justify-center text-[10px] font-mono font-bold tabular-nums overflow-hidden transition-colors duration-200 ${CELL_STATUS_CLS[status]}`}
                    >
                      <span className="truncate px-0.5">{el?.value ?? '·'}</span>
                    </motion.div>
                    <span className="text-center text-[9px] font-mono text-slate-500 leading-tight">
                      [{idx}]
                    </span>
                    <div className="h-[15px] flex flex-col items-center gap-[1px] overflow-visible">
                      {badges.slice(0, 2).map((badge) => (
                        <span
                          key={badge.name}
                          data-pointer={badge.name}
                          className={`px-[3px] py-[1px] rounded-xs border text-[8px] leading-none font-mono font-bold uppercase whitespace-nowrap ${
                            POINTER_BADGE_CLS[badge.role] || POINTER_BADGE_CLS.right
                          }`}
                        >
                          {badge.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bucket columns */}
          <div>
            <div className="text-[10px] font-mono text-slate-500 px-1 pb-1">
              Buckets · value ranges partition [{minVal}..{minVal + numBuckets * bucketRange - 1}]
            </div>
            <div className="flex items-stretch gap-1.5" data-testid="bs-buckets-row">
              {Array.from({ length: numBuckets }, (_, b) => {
                const bucket = buckets[b] || [];
                const st = bucketState(b);
                const lo = minVal + b * bucketRange;
                const hi = minVal + (b + 1) * bucketRange - 1;
                return (
                  <div
                    key={b}
                    data-bucket={b}
                    data-bucket-state={st}
                    className={`flex-1 min-w-0 rounded-lg border p-1.5 flex flex-col transition-all duration-200 ${
                      st === 'active'
                        ? phase === 'scatter'
                          ? 'border-cyan-400/80 bg-cyan-500/10 ring-1 ring-cyan-400/40'
                          : phase === 'sort'
                          ? 'border-amber-400/80 bg-amber-500/10 ring-1 ring-amber-400/40'
                          : 'border-violet-400/80 bg-violet-500/10 ring-1 ring-violet-400/40'
                        : st === 'sorted'
                        ? 'border-emerald-500/60 bg-emerald-500/5'
                        : st === 'gathered'
                        ? 'border-slate-800 bg-slate-900/20 opacity-45'
                        : 'border-slate-800 bg-slate-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between px-0.5 pb-1 border-b border-slate-800/70">
                      <span className="text-[9px] font-mono font-bold text-slate-300">
                        B{b}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 tabular-nums">
                        [{lo}..{hi}]
                      </span>
                      {st === 'sorted' && <span className="text-[9px] text-[#10B981]">✓</span>}
                      {st === 'gathered' && <span className="text-[9px] text-slate-500">✓</span>}
                    </div>
                    <div className="flex flex-col-reverse items-center gap-1 pt-1.5 min-h-[96px]">
                      {bucket.length === 0 ? (
                        <span className="text-[9px] font-mono text-slate-600 italic">
                          empty
                        </span>
                      ) : (
                        bucket.map((val, pos) => (
                          <motion.div
                            key={`${val}-${pos}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                            className={`w-full py-0.5 text-center font-mono text-[10px] font-bold rounded border ${
                              st === 'active'
                                ? 'bg-slate-800 text-white border-slate-600'
                                : st === 'sorted'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                                : 'bg-indigo-950/70 text-indigo-300 border-indigo-700/50'
                            }`}
                          >
                            {val}
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
