import React from 'react';
import { motion } from 'motion/react';
import { ElementStatus } from '../../core/types';
import { ArrayElement } from './ArrayStage';
import { computeHeapLayout, groupPointersByIndex } from '../../utils/stageLayout';

/**
 * Heapsort-specific stage: the compact array backing store on top and the
 * complete binary tree topology below, kept in lockstep with the live array.
 *
 * - During the build phase the whole array is the heap (tree shows all nodes).
 * - During extraction the tree shrinks with `heapSize`; the locked sorted
 *   suffix lives only in the array row (it has left the heap).
 * - Sift-down comparisons highlight the current node, the child being compared,
 *   and the child that won, so `largest` is visible before the swap happens.
 */

export type HeapSortPhase = 'build' | 'extract' | 'done';

export type HeapSortStatusKind =
  | 'init'
  | 'build'
  | 'inspect'
  | 'compare'
  | 'swap'
  | 'noswap'
  | 'extract'
  | 'lock'
  | 'done';

export interface HeapSortView {
  /** Active heap occupies array indices [0..heapSize-1]. */
  heapSize: number;
  phase: HeapSortPhase;
  statusLabel?: string;
  statusKind?: HeapSortStatusKind;
  currentNode?: number;
  leftChild?: number;
  rightChild?: number;
  /** Child index that currently holds the winning (larger) value, if any. */
  chosenChild?: number;
  /** Indices participating in an imminent swap (current + chosen child). */
  swapping?: number[];
}

export interface HeapSortStageState {
  array: ArrayElement[];
  pointers?: Record<string, number>;
  heapView?: HeapSortView;
}

const STATUS_KIND_CLS: Record<HeapSortStatusKind, string> = {
  init: 'bg-slate-800/80 border-slate-600 text-slate-200',
  build: 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200',
  inspect: 'bg-slate-800/80 border-slate-500 text-slate-200',
  compare: 'bg-amber-500/15 border-amber-500/50 text-amber-200',
  swap: 'bg-rose-500/15 border-rose-500/50 text-rose-200',
  noswap: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200',
  extract: 'bg-violet-500/15 border-violet-500/50 text-violet-200',
  lock: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200',
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

interface HeapSortStageProps {
  state: HeapSortStageState;
  projection: '2d' | 'isometric';
}

export const HeapSortStage: React.FC<HeapSortStageProps> = ({ state, projection }) => {
  const array = state.array || [];
  const n = array.length;
  const view = state.heapView;
  const pointers = state.pointers || {};

  const pointersByIndex = React.useMemo(() => groupPointersByIndex(pointers), [pointers]);

  const heapSize = Math.max(0, Math.min(view?.heapSize ?? n, n));
  const { coords, width, height } = React.useMemo(
    () => computeHeapLayout(Math.max(1, heapSize), 54, 64),
    [heapSize]
  );

  if (!view || n === 0) {
    return (
      <div className="w-full flex-1 flex items-center justify-center text-slate-500 font-mono text-sm">
        Generate a timeline to see the heap view.
      </div>
    );
  }

  const statusKind = view.statusKind ?? 'init';
  const isSortedOut = (idx: number) =>
    (view.phase === 'extract' || view.phase === 'done') && idx >= heapSize;

  const nodeRole = (idx: number): 'current' | 'child' | 'chosen' | 'root' | 'plain' => {
    if (view.swapping?.includes(idx)) return 'chosen';
    if (idx === view.currentNode) return 'current';
    if (idx === view.chosenChild) return 'chosen';
    if (idx === view.leftChild || idx === view.rightChild) return 'child';
    if (idx === 0) return 'root';
    return 'plain';
  };

  return (
    <div className="w-full flex-1 max-h-full flex flex-col min-h-0 select-none">
      {/* Status + legend strip */}
      <div className="shrink-0 px-3 sm:px-4 pt-2 pb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#1F293D]/40">
        {view.statusLabel && (
          <span
            data-testid="hs-status"
            className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-wide ${STATUS_KIND_CLS[statusKind]}`}
          >
            {view.statusLabel}
          </span>
        )}
        <span className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900/60 text-[10px] font-mono text-slate-300">
          heap size: <span className="text-cyan-300 font-bold tabular-nums">{heapSize}</span> / {n}
        </span>
        <div className="hidden md:flex items-center gap-2 ml-auto text-[9px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-cyan-400 bg-cyan-500/30 inline-block" />
            current
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-500/30 inline-block" />
            child compared
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-rose-400 bg-rose-500/30 inline-block" />
            chosen / swapping
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-emerald-400 bg-emerald-500/25 inline-block" />
            sorted suffix
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-3 pb-3 pt-2">
        <div
          className={`mx-auto flex flex-col items-center gap-2 ${
            projection === 'isometric' ? 'stage-isometric' : 'stage-flat'
          }`}
          style={{ minWidth: Math.max(520, n * 58) }}
        >
          {/* Array backing store */}
          <div className="w-full">
            <div className="text-[10px] font-mono text-slate-500 px-1 pb-1">
              Array backing store · parent(i) = ⌊(i-1)/2⌋ · children 2i+1, 2i+2
            </div>
            <div className="flex items-stretch" data-testid="hs-array-row">
              {array.map((el, idx) => {
                const status: ElementStatus = (el?.status as ElementStatus) || 'default';
                const locked = isSortedOut(idx);
                const badges = pointersByIndex[idx] || [];
                return (
                  <div
                    key={idx}
                    data-cell-index={idx}
                    data-locked={locked ? 'true' : 'false'}
                    className="flex-1 min-w-0 px-[1px] flex flex-col"
                  >
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      className={`h-8 min-w-0 rounded-[3px] border flex items-center justify-center gap-0.5 text-[10px] font-mono font-bold tabular-nums overflow-hidden transition-colors duration-200 ${
                        locked
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                          : CELL_STATUS_CLS[status]
                      }`}
                    >
                      <span className="truncate px-0.5">{el?.value ?? '·'}</span>
                      {locked && <span className="text-[8px] leading-none">✓</span>}
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

          {/* Heap tree topology */}
          <div className="text-[10px] font-mono text-slate-500 self-start px-1">
            Heap tree ({heapSize} active node{heapSize === 1 ? '' : 's'}
            {view.phase !== 'build' ? ' · extracted nodes left the tree' : ''})
          </div>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            data-testid="hs-heap-tree"
            style={{ width: `${Math.min(680, Math.max(380, width))}px`, height: `${height}px` }}
            className="overflow-visible shrink-0"
          >
            {Array.from({ length: heapSize }, (_, idx) => {
              if (idx === 0) return null;
              const parent = Math.floor((idx - 1) / 2);
              const p = coords[parent];
              const c = coords[idx];
              if (!p || !c) return null;
              const active =
                (view.currentNode === idx || view.currentNode === parent) &&
                (view.leftChild === idx ||
                  view.rightChild === idx ||
                  view.currentNode === idx ||
                  view.swapping?.includes(idx));
              return (
                <line
                  key={`edge-${idx}`}
                  x1={p.x}
                  y1={p.y}
                  x2={c.x}
                  y2={c.y}
                  stroke={active ? '#F59E0B' : '#334155'}
                  strokeWidth={active ? 2.5 : 2}
                />
              );
            })}

            {Array.from({ length: heapSize }, (_, idx) => {
              const pos = coords[idx];
              if (!pos) return null;
              const role = nodeRole(idx);
              const fill =
                role === 'chosen'
                  ? '#E11D48'
                  : role === 'current'
                  ? '#0891B2'
                  : role === 'child'
                  ? '#B45309'
                  : role === 'root'
                  ? '#065F46'
                  : '#1E293B';
              const stroke =
                role === 'chosen'
                  ? '#FDA4AF'
                  : role === 'current'
                  ? '#67E8F9'
                  : role === 'child'
                  ? '#FDE047'
                  : role === 'root'
                  ? '#10B981'
                  : '#475569';
              return (
                <g
                  key={`node-${idx}`}
                  data-heap-node={idx}
                  data-role={role}
                  className="transition-all duration-200"
                >
                  <circle cx={pos.x} cy={pos.y} r="17" fill={fill} stroke={stroke} strokeWidth="2" />
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill="#F1F5F9"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {array[idx]?.value ?? '·'}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 28}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    [{idx}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
