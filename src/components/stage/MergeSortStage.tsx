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
  auxiliary?: {
    type?: string;
    name?: string;
    data?: any[];
    activeIndex?: number;
    note?: string;
  };
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

const PHASE_CHIP: Partial<Record<MergeSortNodePhase, { text: string; shortText: string; cls: string }>> = {
  splitting: { text: 'SPLIT', shortText: 'SPLIT', cls: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/50' },
  base: { text: 'BASE ✓', shortText: 'BASE', cls: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50' },
  left: { text: 'LEFT HALF', shortText: 'LEFT', cls: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50' },
  right: { text: 'RIGHT HALF', shortText: 'RIGHT', cls: 'bg-amber-500/20 text-amber-200 border-amber-400/50' },
  merging: { text: 'MERGING', shortText: 'MERGE', cls: 'bg-violet-500/20 text-violet-200 border-violet-400/50' },
  sorted: { text: 'MERGED ✓', shortText: '✓', cls: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/60' },
  consumed: { text: '✓', shortText: '✓', cls: 'bg-slate-800/80 text-slate-400 border-slate-600' },
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
  pivot: 'theme-solid-badge bg-[#8B5CF6] text-white border-[#A78BFA]',
  target: 'theme-solid-badge bg-[#F59E0B] text-[#0B0F19] border-[#FBBF24]',
  left: 'theme-solid-badge bg-[#06B6D4] text-[#0B0F19] border-[#22D3EE]',
  right: 'theme-solid-badge bg-[#10B981] text-[#0B0F19] border-[#34D399]',
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
  const activeStepNum =
    statusKind === 'init' || statusKind === 'divide' || statusKind === 'base'
      ? 1
      : statusKind === 'merge' || statusKind === 'compare' || statusKind === 'append'
      ? 2
      : 3;

  const tempBuffer: number[] = Array.isArray(state.auxiliary?.data)
    ? state.auxiliary!.data.map((x: any) => (typeof x === 'object' && x !== null && 'value' in x ? x.value : x))
    : [];
  const tempActiveIdx = state.auxiliary?.activeIndex;
  const activeMerge = view.merge;

  return (
    <div className="w-full flex-1 max-h-full flex flex-col min-h-0 select-none">
      {/* Status + 3-Phase Divide-and-Conquer Progress Strip */}
      <div className="shrink-0 px-3 sm:px-4 pt-2 pb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[#1F293D]/40">
        {view.statusLabel && (
          <span
            data-testid="ms-status"
            className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-wide ${STATUS_KIND_CLS[statusKind]}`}
          >
            {view.statusLabel}
          </span>
        )}

        {/* Macro Divide -> Compare -> Merge Back Flow Indicator */}
        <div className="hidden sm:flex items-center gap-1 text-[9.5px] font-mono">
          {[
            { num: 1, label: '1. Split Apart' },
            { num: 2, label: '2. Compare → Temp' },
            { num: 3, label: '3. Merge Back' },
          ].map((step, i) => {
            const isActive = activeStepNum === step.num;
            return (
              <React.Fragment key={step.num}>
                {i > 0 && <span className="text-slate-500">→</span>}
                <span
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--theme-accent-soft)',
                          borderColor: 'var(--theme-accent-border)',
                          color: 'var(--theme-accent-text)',
                        }
                      : undefined
                  }
                  className={`px-1.5 py-0.5 rounded border ${
                    isActive
                      ? 'font-bold'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center gap-2 ml-auto text-[9px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-fuchsia-400/80 bg-fuchsia-500/20 inline-block" />
            splitting
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-cyan-400/80 bg-cyan-500/20 inline-block" />
            left half
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-amber-400/80 bg-amber-500/20 inline-block" />
            right half
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border border-emerald-400/80 bg-emerald-500/20 inline-block" />
            merged ✓
          </span>
        </div>
      </div>

      {/* Divide & Merge Tree Rows with Physical Separation + Split/Merge SVG Fork Connectors */}
      <div className="flex-1 min-h-0 overflow-auto px-3 pb-3 pt-2">
        <div
          className={`mx-auto flex flex-col gap-0.5 ${
            projection === 'isometric' ? 'stage-isometric' : 'stage-flat'
          }`}
          style={{ minWidth: Math.max(540, n * 62) }}
        >
          {rows.map((row, rowIdx) => {
            const hasBadges = row.items.some(
              (item) =>
                item.kind === 'node' && item.node && BADGE_PHASES.includes(item.node.phase)
            );
            const nextRow = rows[rowIdx + 1];

            // Compute SVG parent->child split/merge fork lines between this row and nextRow
            const connectors: {
              key: string;
              px: number;
              cx: number;
              mode: 'split' | 'merge-left' | 'merge-right' | 'sorted' | 'idle';
            }[] = [];

            if (nextRow) {
              const parentNodes = row.items
                .filter((it) => it.kind === 'node' && it.node)
                .map((it) => it.node!);
              const childNodes = nextRow.items
                .filter((it) => it.kind === 'node' && it.node)
                .map((it) => it.node!);

              for (const child of childNodes) {
                const parent = parentNodes.find(
                  (p) => child.left >= p.left && child.right <= p.right
                );
                if (!parent) continue;
                const px = ((parent.left + parent.right + 1) / (2 * n)) * 100;
                const cx = ((child.left + child.right + 1) / (2 * n)) * 100;
                let mode: 'split' | 'merge-left' | 'merge-right' | 'sorted' | 'idle' = 'idle';
                if (parent.phase === 'splitting') mode = 'split';
                else if (parent.phase === 'merging' && child.phase === 'left') mode = 'merge-left';
                else if (parent.phase === 'merging' && child.phase === 'right') mode = 'merge-right';
                else if (parent.phase === 'sorted') mode = 'sorted';
                connectors.push({ key: `${parent.id}->${child.id}`, px, cx, mode });
              }
            }

            return (
              <React.Fragment key={row.depth}>
                <div
                  data-testid={`ms-row-${row.depth}`}
                  className="flex items-stretch gap-1.5"
                >
                  <div
                    className="w-8 shrink-0 pt-1 text-right pr-1 text-[10px] font-mono text-slate-500"
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
                          className="rounded-md border border-dashed border-slate-800/50 bg-slate-900/10 mx-1"
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

                {/* SVG Fork / Merge Branch Connectors between depth rows */}
                {nextRow && connectors.length > 0 && (
                  <div className="flex items-stretch gap-1.5 h-4 pointer-events-none">
                    <div className="w-8 shrink-0" />
                    <div className="flex-1 relative">
                      <svg
                        viewBox="0 0 100 20"
                        preserveAspectRatio="none"
                        className="w-full h-full overflow-visible"
                      >
                        {connectors.map((c) => {
                          const stroke =
                            c.mode === 'split'
                              ? '#E879F9'
                              : c.mode === 'merge-left'
                              ? 'var(--sem-active-solid)'
                              : c.mode === 'merge-right'
                              ? 'var(--sem-comparing-solid)'
                              : c.mode === 'sorted'
                              ? 'var(--sem-sorted-solid)'
                              : 'var(--svg-edge-default)';
                          const isActiveBranch =
                            c.mode === 'split' ||
                            c.mode === 'merge-left' ||
                            c.mode === 'merge-right';
                          return (
                            <path
                              key={c.key}
                              d={`M ${c.px} 1 C ${c.px} 11, ${c.cx} 9, ${c.cx} 19`}
                              fill="none"
                              style={{ stroke }}
                              strokeWidth={isActiveBranch ? 1.8 : 1}
                              strokeOpacity={isActiveBranch ? 0.95 : 0.45}
                              strokeDasharray={
                                c.mode === 'split' || c.mode === 'merge-left' || c.mode === 'merge-right'
                                  ? '3 2'
                                  : undefined
                              }
                              vectorEffect="non-scaling-stroke"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Embedded Live Merge Arena: LEFT [i] vs RIGHT [j] -> TEMP BUFFER */}
          {activeMerge && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              data-testid="ms-merge-arena"
              className="mt-2 ml-9 rounded-xl border border-[#1F293D] bg-[#111827] px-3 py-2 shadow-sm flex flex-col gap-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono">
                <span className="font-bold text-purple-400 uppercase tracking-wide">
                  Merge Arena · Combining [{activeMerge.left}..{activeMerge.mid}] + [{activeMerge.mid + 1}..{activeMerge.right}]
                </span>
                <span className="text-slate-400 tabular-nums">
                  {activeMerge.phase === 'copy'
                    ? `Copying temp[] → arr[${activeMerge.copyTo ?? activeMerge.left}]`
                    : `Comparing front pointers i=${activeMerge.i ?? '—'}, j=${activeMerge.j ?? '—'}`}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
                {/* Left sorted half */}
                <div
                  style={{
                    backgroundColor: 'var(--sem-active-bg)',
                    borderColor: 'var(--sem-active-border)',
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
                >
                  <span style={{ color: 'var(--sem-active-text)' }} className="text-[9.5px] font-bold mr-0.5">
                    LEFT:
                  </span>
                  {Array.from(
                    { length: activeMerge.mid - activeMerge.left + 1 },
                    (_, offset) => {
                      const idx = activeMerge.left + offset;
                      const isFront = activeMerge.i === idx;
                      const isConsumed =
                        activeMerge.i !== undefined && idx < activeMerge.i && activeMerge.phase !== 'copy';
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded border text-xs font-bold tabular-nums transition-all ${
                            isFront
                              ? 'bg-[#06B6D4] text-[#0B0F19] border-[#22D3EE] theme-solid-badge scale-105 shadow-sm'
                              : isConsumed
                              ? 'opacity-35 line-through border-dashed border-slate-600 text-slate-400'
                              : 'bg-[#1E293B] border-[#334155] text-slate-200'
                          }`}
                        >
                          {array[idx]?.value ?? '·'}
                        </span>
                      );
                    }
                  )}
                </div>

                <span className="text-[11px] font-bold text-amber-400">
                  {activeMerge.phase === 'copy' ? '⇒ COPY' : 'vs'}
                </span>

                {/* Right sorted half */}
                <div
                  style={{
                    backgroundColor: 'var(--sem-comparing-bg)',
                    borderColor: 'var(--sem-comparing-border)',
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
                >
                  <span style={{ color: 'var(--sem-comparing-text)' }} className="text-[9.5px] font-bold mr-0.5">
                    RIGHT:
                  </span>
                  {Array.from(
                    { length: activeMerge.right - activeMerge.mid },
                    (_, offset) => {
                      const idx = activeMerge.mid + 1 + offset;
                      const isFront = activeMerge.j === idx;
                      const isConsumed =
                        activeMerge.j !== undefined && idx < activeMerge.j && activeMerge.phase !== 'copy';
                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded border text-xs font-bold tabular-nums transition-all ${
                            isFront
                              ? 'bg-[#F59E0B] text-[#0B0F19] border-[#FBBF24] theme-solid-badge scale-105 shadow-sm'
                              : isConsumed
                              ? 'opacity-35 line-through border-dashed border-slate-600 text-slate-400'
                              : 'bg-[#1E293B] border-[#334155] text-slate-200'
                          }`}
                        >
                          {array[idx]?.value ?? '·'}
                        </span>
                      );
                    }
                  )}
                </div>

                <span className="text-slate-400 font-bold">→</span>

                {/* Live Temp Buffer Output */}
                <div
                  style={{
                    backgroundColor: 'var(--sem-sorted-bg)',
                    borderColor: 'var(--sem-sorted-border)',
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border min-w-[110px]"
                >
                  <span style={{ color: 'var(--sem-sorted-text)' }} className="text-[9.5px] font-bold mr-0.5">
                    TEMP:
                  </span>
                  {tempBuffer.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic">empty</span>
                  ) : (
                    tempBuffer.map((val, tIdx) => (
                      <span
                        key={`${tIdx}-${val}`}
                        className={`px-2 py-0.5 rounded border text-xs font-bold tabular-nums ${
                          tempActiveIdx === tIdx
                            ? 'bg-[#10B981] text-[#0B0F19] border-[#34D399] theme-solid-badge scale-105 shadow-sm'
                            : 'bg-[#1E293B] border-[#334155] text-emerald-300'
                        }`}
                      >
                        {val}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
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
      className={`relative rounded-lg border-2 p-1 transition-all duration-300 ${
        node.depth === 0 ? 'mx-0.5' : node.depth === 1 ? 'mx-1' : 'mx-1.5'
      } ${PHASE_BOX_CLS[node.phase]}`}
    >
      {/* Header: range + phase chip / merged check */}
      <div className="flex items-center justify-between gap-1 px-0.5 leading-none min-h-[14px]">
        <span className="text-[9px] font-mono tabular-nums text-slate-400 shrink-0 whitespace-nowrap">
          [{node.left}..{node.right}]
        </span>
        {chip && (
          <span
            className={`px-1 py-[1px] rounded-xs border text-[8px] font-mono font-bold tracking-wide whitespace-nowrap shrink-0 ${chip.cls}`}
          >
            {len === 1 ? chip.shortText : chip.text}
          </span>
        )}
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
