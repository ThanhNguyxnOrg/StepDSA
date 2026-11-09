import React from 'react';
import { motion } from 'motion/react';
import { ElementStatus } from '../../core/types';
import { ArrayElement } from './ArrayStage';
import { groupPointersByIndex } from '../../utils/stageLayout';

/**
 * Merge-sort specific stage: renders the divide-and-conquer decomposition as
 * rows of segment boxes (one row per recursion depth) over the live array.
 *
 * - Dividing a range makes its two child segments appear on the next row
 *   (the array visually "breaks apart"), aligned exactly under the parent.
 * - During a merge, the two source segments are tinted LEFT/RIGHT, the parent
 *   is tinted MERGING, and copy-back highlights fill the parent cells.
 * - When a range is finished its box turns emerald (MERGED) while the consumed
 *   children dim out, so the fragments visibly rejoin level by level.
 *
 * Cells always render the live `state.array` values/statuses, so this stage
 * never invents a parallel memory model.
 */

export type MergeSortNodePhase =
  | 'ready'
  | 'splitting'
  | 'base'
  | 'left'
  | 'right'
  | 'merging'
  | 'sorted'
  | 'consumed';

export type MergeSortStatusKind =
  | 'init'
  | 'divide'
  | 'base'
  | 'merge'
  | 'compare'
  | 'append'
  | 'copy'
  | 'merged'
  | 'done';

export type MergeSortMergePhase = 'merge' | 'compare' | 'append' | 'copy';

export interface MergeSortNodeView {
  id: string;
  left: number;
  right: number;
  depth: number;
  phase: MergeSortNodePhase;
}

export interface MergeSortMergeCursor {
  left: number;
  mid: number;
  right: number;
  i?: number;
  j?: number;
  copyTo?: number;
  phase: MergeSortMergePhase;
}

export interface MergeSortView {
  nodes: MergeSortNodeView[];
  merge?: MergeSortMergeCursor | null;
  statusLabel?: string;
  statusKind?: MergeSortStatusKind;
}

export interface MergeSortStageState {
  array: ArrayElement[];
  pointers?: Record<string, number>;
  mergeView?: MergeSortView;
}

/* ── Pure row layout (exported for tests) ─────────────────────────────────── */

export interface MergeSortRowItem {
  kind: 'node' | 'gap';
  left: number;
  right: number;
  node?: MergeSortNodeView;
}

export interface MergeSortRow {
  depth: number;
  items: MergeSortRowItem[];
}

/**
 * Groups segment nodes into depth rows and fills every uncovered range with
 * explicit gap placeholders so all rows stay horizontally aligned: a row's
 * items always partition [0, n-1] in order.
 */
export function buildMergeSortRows(view: MergeSortView, n: number): MergeSortRow[] {
  const byDepth = new Map<number, MergeSortNodeView[]>();
  for (const node of view.nodes) {
    if (!byDepth.has(node.depth)) byDepth.set(node.depth, []);
    byDepth.get(node.depth)!.push(node);
  }

  return [...byDepth.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([depth, nodes]) => {
      const sorted = [...nodes].sort((a, b) => a.left - b.left);
      const items: MergeSortRowItem[] = [];
      let cursor = 0;
      for (const node of sorted) {
        if (node.left > cursor) {
          items.push({ kind: 'gap', left: cursor, right: node.left - 1 });
        }
        items.push({ kind: 'node', left: node.left, right: node.right, node });
        cursor = node.right + 1;
      }
      if (cursor < n) {
        items.push({ kind: 'gap', left: cursor, right: n - 1 });
      }
      return { depth, items };
    });
}

/* ── Styling maps ─────────────────────────────────────────────────────────── */

const STATUS_KIND_CLS: Record<MergeSortStatusKind, string> = {
  init: 'bg-slate-800/80 border-slate-600 text-slate-200',
  divide: 'bg-fuchsia-500/15 border-fuchsia-500/50 text-fuchsia-200',
  base: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200',
  merge: 'bg-violet-500/15 border-violet-500/50 text-violet-200',
  compare: 'bg-amber-500/15 border-amber-500/50 text-amber-200',
  append: 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200',
  copy: 'bg-sky-500/15 border-sky-500/50 text-sky-200',
  merged: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200',
  done: 'bg-emerald-500/20 border-emerald-400/60 text-emerald-100',
};

const PHASE_BOX_CLS: Record<MergeSortNodePhase, string> = {
  ready: 'border-slate-700/80 bg-slate-900/30',
  splitting: 'border-fuchsia-400/80 bg-fuchsia-500/10 ring-1 ring-fuchsia-400/50',
  base: 'border-emerald-500/60 bg-emerald-500/5',
  left: 'border-cyan-400/80 bg-cyan-500/10',
  right: 'border-amber-400/80 bg-amber-500/10',
  merging: 'border-violet-400/80 bg-violet-500/10',
  sorted: 'border-emerald-400/80 bg-emerald-500/10 shadow-lg shadow-emerald-500/10',
  consumed: 'border-slate-800 bg-slate-900/20',
};

const PHASE_CHIP: Partial<Record<MergeSortNodePhase, { text: string; cls: string }>> = {
  splitting: { text: 'SPLIT', cls: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/50' },
  base: { text: 'BASE ✓', cls: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50' },
  left: { text: 'LEFT HALF', cls: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50' },
  right: { text: 'RIGHT HALF', cls: 'bg-amber-500/20 text-amber-200 border-amber-400/50' },
  merging: { text: 'MERGING', cls: 'bg-violet-500/20 text-violet-200 border-violet-400/50' },
  sorted: { text: 'MERGED ✓', cls: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/60' },
  consumed: { text: '✓', cls: 'bg-slate-800/80 text-slate-400 border-slate-600' },
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

/** Phases whose boxes may carry pointer badges (keeps other rows calm). */
const BADGE_PHASES: MergeSortNodePhase[] = ['splitting', 'base', 'left', 'right', 'merging'];

/** `copyFrom` indexes the temp buffer, not the array — never draw it under a cell. */
const NON_ARRAY_POINTERS = new Set(['copyFrom']);

/* ── Component ────────────────────────────────────────────────────────────── */

interface MergeSortStageProps {
  state: MergeSortStageState;
  projection: '2d' | 'isometric';
}

export const MergeSortStage: React.FC<MergeSortStageProps> = ({ state, projection }) => {
  const view = state.mergeView;
  const array = state.array || [];
  const n = array.length;
  const pointers = state.pointers || {};

  const pointersByIndex = React.useMemo(() => {
    const filtered: Record<string, number> = {};
    for (const [name, idx] of Object.entries(pointers)) {
      if (!NON_ARRAY_POINTERS.has(name) && typeof idx === 'number') filtered[name] = idx;
    }
    return groupPointersByIndex(filtered);
  }, [pointers]);

  const rows = React.useMemo(
    () => (view ? buildMergeSortRows(view, n) : []),
    [view, n]
  );

  if (!view || n === 0) {
    return (
      <div className="w-full flex-1 flex items-center justify-center text-slate-500 font-mono text-sm">
        Generate a timeline to see the divide-and-merge view.
      </div>
    );
  }

  const statusKind = view.statusKind ?? 'init';

  return (
    <div className="w-full flex-1 max-h-full flex flex-col min-h-0 select-none">
      {/* Status + legend strip */}
      <div className="shrink-0 px-3 sm:px-4 pt-2 pb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#1F293D]/40">
        {view.statusLabel && (
          <span
            data-testid="ms-status"
            className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-wide ${STATUS_KIND_CLS[statusKind]}`}
          >
            {view.statusLabel}
          </span>
        )}
        <div className="hidden md:flex items-center gap-2 ml-auto text-[9px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-cyan-400/80 bg-cyan-500/20 inline-block" />
            left half
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-amber-400/80 bg-amber-500/20 inline-block" />
            right half
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-violet-400/80 bg-violet-500/20 inline-block" />
            merging
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-emerald-400/80 bg-emerald-500/20 inline-block" />
            merged ✓
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-slate-700 bg-slate-900/40 inline-block" />
            waiting
          </span>
        </div>
      </div>

      {/* Depth rows */}
      <div className="flex-1 min-h-0 overflow-auto px-3 pb-3 pt-2">
        <div
          className={`mx-auto flex flex-col gap-2 ${
            projection === 'isometric' ? 'stage-isometric' : 'stage-flat'
          }`}
          style={{ minWidth: Math.max(520, n * 58) }}
        >
          {rows.map((row) => {
            const hasBadges = row.items.some(
              (item) =>
                item.kind === 'node' && item.node && BADGE_PHASES.includes(item.node.phase)
            );
            return (
              <div
                key={row.depth}
                data-testid={`ms-row-${row.depth}`}
                className="flex items-stretch gap-1.5"
              >
                <div
                  className="w-8 shrink-0 pt-0.5 text-right pr-1 text-[10px] font-mono text-slate-500"
                  title={`Recursion depth ${row.depth}`}
                >
                  d{row.depth}
                </div>
                <div className="flex-1 flex items-stretch">
                  {row.items.map((item) =>
                    item.kind === 'gap' ? (
                      <div
                        key={`gap-${item.left}`}
                        data-placeholder="true"
                        title={`Range [${item.left}..${item.right}] resolved at a shallower depth`}
                        style={{ width: `${((item.right - item.left + 1) / n) * 100}%` }}
                        className="rounded-md border border-dashed border-slate-800/70 bg-slate-900/10 mx-[1px]"
                      />
                    ) : (
                      <MergeSortNodeBox
                        key={item.node!.id}
                        node={item.node!}
                        view={view}
                        array={array}
                        n={n}
                        pointersByIndex={pointersByIndex}
                        reserveBadges={hasBadges}
                      />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Segment box ──────────────────────────────────────────────────────────── */

interface MergeSortNodeBoxProps {
  node: MergeSortNodeView;
  view: MergeSortView;
  array: ArrayElement[];
  n: number;
  pointersByIndex: Record<number, { name: string; role: string }[]>;
  reserveBadges: boolean;
}

const MergeSortNodeBox: React.FC<MergeSortNodeBoxProps> = ({
  node,
  view,
  array,
  n,
  pointersByIndex,
  reserveBadges,
}) => {
  const len = node.right - node.left + 1;
  const widthPct = (len / n) * 100;
  const chip = PHASE_CHIP[node.phase];
  const showBadges = BADGE_PHASES.includes(node.phase);

  // Boundary highlighted with a dashed/solid divider: split point or merge mid.
  let boundaryMid: number | null = null;
  if (node.phase === 'splitting') {
    const rightChild = view.nodes.find(
      (x) =>
        x.depth === node.depth + 1 &&
        x.right === node.right &&
        x.left > node.left &&
        x.left <= node.right
    );
    if (rightChild) boundaryMid = rightChild.left - 1;
  } else if (
    node.phase === 'merging' &&
    view.merge &&
    view.merge.left === node.left &&
    view.merge.right === node.right
  ) {
    boundaryMid = view.merge.mid;
  }

  const dividerLeftPct =
    boundaryMid !== null ? ((boundaryMid + 1 - node.left) / len) * 100 : null;

  return (
    <motion.div
      key={node.id}
      data-node-id={node.id}
      data-phase={node.phase}
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: node.phase === 'consumed' ? 0.5 : 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      style={{ width: `${widthPct}%` }}
      className={`relative rounded-md border p-[2px] transition-colors duration-300 mx-[1px] ${PHASE_BOX_CLS[node.phase]}`}
    >
      {/* Header: range + phase chip / merged check */}
      <div className="flex items-center justify-between gap-1 px-0.5 leading-none min-h-[13px]">
        <span className="text-[9px] font-mono tabular-nums text-slate-400 truncate">
          [{node.left}..{node.right}]
        </span>
        {chip && node.right > node.left ? (
          <span
            className={`px-1 py-[1px] rounded-xs border text-[8px] font-mono font-bold tracking-wide whitespace-nowrap ${chip.cls}`}
          >
            {chip.text}
          </span>
        ) : chip ? (
          <span
            className={`px-1 py-[1px] rounded-xs border text-[8px] font-mono font-bold ${chip.cls}`}
          >
            {chip.text}
          </span>
        ) : null}
      </div>

      {/* Cells */}
      <div className="flex mt-[2px]">
        {Array.from({ length: len }, (_, offset) => {
          const idx = node.left + offset;
          const el = array[idx];
          const status: ElementStatus = (el?.status as ElementStatus) || 'default';
          return (
            <div
              key={idx}
              data-cell-index={idx}
              style={{ width: `${100 / len}%` }}
              className={`h-7 min-w-0 rounded-[3px] border flex items-center justify-center text-[10px] font-mono font-bold tabular-nums transition-colors duration-200 overflow-hidden ${CELL_STATUS_CLS[status]}`}
            >
              <span className="truncate px-0.5">{el?.value ?? '·'}</span>
            </div>
          );
        })}
      </div>

      {/* Split / mid divider with label */}
      {dividerLeftPct !== null && (
        <div
          data-divider-mid={boundaryMid}
          className="absolute top-[14px] bottom-0 pointer-events-none"
          style={{ left: `${dividerLeftPct}%` }}
        >
          <div
            className={`w-px h-full border-l border-dashed ${
              node.phase === 'splitting'
                ? 'border-fuchsia-300/80'
                : 'border-violet-200/70'
            }`}
          />
          {node.phase === 'merging' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-1 py-[1px] rounded-xs border border-violet-300/70 bg-violet-600/90 text-white text-[8px] font-mono font-bold whitespace-nowrap">
              mid {boundaryMid}
            </span>
          )}
        </div>
      )}

      {/* Pointer badges — only in the active merge region */}
      {reserveBadges && (
        <div className="h-[16px] mt-[1px] flex">
          {Array.from({ length: len }, (_, offset) => {
            const idx = node.left + offset;
            const badges = showBadges ? pointersByIndex[idx] || [] : [];
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-start gap-[1px] min-w-0 overflow-visible"
                style={{ width: `${100 / len}%` }}
              >
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
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
