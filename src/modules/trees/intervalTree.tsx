import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface IntervalItem {
  id: number;
  low: number;
  high: number;
  label?: string;
}

export interface IntervalTreeNode {
  id: string;
  interval: IntervalItem;
  maxHigh: number;
  left: IntervalTreeNode | null;
  right: IntervalTreeNode | null;
}

export interface IntervalTreeState {
  intervals: IntervalItem[];
  root: IntervalTreeNode | null;
  activeIntervalId: number | null;
  activeNodeId: string | null;
  queryInterval: { low: number; high: number } | null;
  overlappingIntervals: IntervalItem[];
  message: string;
}

function cloneITNode(node: IntervalTreeNode | null): IntervalTreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    interval: { ...node.interval },
    maxHigh: node.maxHigh,
    left: cloneITNode(node.left),
    right: cloneITNode(node.right),
  };
}

export const intervalTreeModule: AlgorithmModule<
  { intervals: { low: number; high: number }[]; query: { low: number; high: number } },
  IntervalTreeState
> = {
  id: 'interval-tree',
  title: 'Interval Tree (Augmented 1D Range Overlap Detection)',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(log N) single overlap query',
    timeAverage: 'O(k + log N) finding all k overlapping intervals',
    timeWorst: 'O(N) un-augmented linear scan',
    spaceAuxiliary: 'O(N) augmented binary search tree',
    worstCaseCondition: 'Degenerate unbalanced tree (solved with AVL/Red-Black augmentation)',
  },
  theory: {
    overview:
      'An Interval Tree is an augmented balanced binary search tree for maintaining a dynamic set of intervals [low, high]. Keys are ordered by interval.low, and each node additionally maintains maxHigh = max(high, left.maxHigh, right.maxHigh).',
    whyItWorks:
      'When searching for an overlap with query [qLow, qHigh]: If left.maxHigh < qLow, no interval in the left subtree can possibly overlap with the query, allowing the entire left branch to be safely pruned in O(1).',
    invariant:
      'Augmentation Invariant: For every node x, x.maxHigh is strictly equal to the maximum high endpoint stored in the entire subtree rooted at x: maxHigh = max(x.high, x.left?.maxHigh ?? -inf, x.right?.maxHigh ?? -inf).',
    pitfalls: [
      'Two intervals [a, b] and [c, d] overlap if and only if a <= d AND c <= b.',
      'Failing to recursively update maxHigh all the way up to the root when inserting or deleting intervals.',
    ],
  },
  defaultInput: {
    intervals: [
      { low: 15, high: 20 },
      { low: 10, high: 30 },
      { low: 17, high: 19 },
      { low: 5, high: 20 },
      { low: 12, high: 15 },
      { low: 30, high: 40 },
    ],
    query: { low: 14, high: 16 },
  },
  presets: [
    {
      id: 'meeting-room-overlaps',
      label: 'Meeting Room Overlaps',
      description: 'Multiple overlapping booking intervals queried against a target meeting window',
      data: {
        intervals: [
          { low: 8, high: 11 },
          { low: 9, high: 10 },
          { low: 13, high: 16 },
          { low: 15, high: 18 },
          { low: 17, high: 21 },
        ],
        query: { low: 10, high: 14 },
      },
    },
    {
      id: 'disjoint-intervals',
      label: 'Disjoint Intervals',
      description: 'Intervals with zero mutual overlaps testing pruning efficiency',
      data: {
        intervals: [
          { low: 2, high: 5 },
          { low: 8, high: 12 },
          { low: 15, high: 20 },
          { low: 25, high: 30 },
        ],
        query: { low: 6, high: 7 },
      },
    },
  ],
  codeSnippets: {
    cpp: `struct Interval { int low, high; };
struct Node {
    Interval i;
    int maxHigh;
    Node *left = nullptr, *right = nullptr;
    Node(Interval iv) : i(iv), maxHigh(iv.high) {}
};

bool overlaps(Interval a, Interval b) {
    return a.low <= b.high && b.low <= a.high;
}

Interval* searchOverlap(Node* root, Interval q) {
    if (!root) return nullptr;
    if (overlaps(root->i, q)) return &(root->i);
    if (root->left && root->left->maxHigh >= q.low)
        return searchOverlap(root->left, q);
    return searchOverlap(root->right, q);
}`,
    python: `class Node:
    def __init__(self, low, high):
        self.low = low
        self.high = high
        self.max = high
        self.left = None
        self.right = None

def overlaps(i1, i2):
    return i1[0] <= i2[1] and i2[0] <= i1[1]

def search_overlap(root, q):
    if not root:
        return None
    if overlaps((root.low, root.high), q):
        return (root.low, root.high)
    if root.left and root.left.max >= q[0]:
        return search_overlap(root.left, q)
    return search_overlap(root.right, q)`,
    typescript: `interface Interval { low: number; high: number; }
interface Node {
  interval: Interval;
  maxHigh: number;
  left: Node | null;
  right: Node | null;
}

function searchOverlap(node: Node | null, q: Interval): Interval | null {
  if (!node) return null;
  if (node.interval.low <= q.high && q.low <= node.interval.high) return node.interval;
  if (node.left && node.left.maxHigh >= q.low) return searchOverlap(node.left, q);
  return searchOverlap(node.right, q);
}`,
    java: `class IntervalNode {
    int low, high, maxHigh;
    IntervalNode left, right;
    IntervalNode(int l, int h) { low = l; high = h; maxHigh = h; }
}

boolean doOverlap(int l1, int h1, int l2, int h2) {
    return l1 <= h2 && l2 <= h1;
}`,
    pseudocode: `function searchOverlap(node, q):
    if node is null:
        return null
    if overlaps(node.interval, q):
        return node.interval
    if node.left != null and node.left.maxHigh >= q.low:
        return searchOverlap(node.left, q)
    else:
        return searchOverlap(node.right, q)`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<IntervalTreeState>[] = [];
    const raw = input.intervals;
    const items: IntervalItem[] = raw.map((iv, idx) => ({ id: idx, low: iv.low, high: iv.high, label: `I${idx}` }));
    let root: IntervalTreeNode | null = null;
    let nodeSeq = 0;

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: IntervalTreeState,
      options?: {
        action?: string;
        variables?: Record<string, string | number | boolean>;
        callStack?: CallStackFrame[];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 0,
        codeLine,
        explanation,
        action: options?.action,
        variables: options?.variables,
        callStack: options?.callStack,
        state,
      });
    };

    addFrame(
      1,
      `Initializing Interval Tree with ${items.length} intervals. Target overlap query: [${input.query.low}, ${input.query.high}].`,
      {
        intervals: items,
        root: null,
        activeIntervalId: null,
        activeNodeId: null,
        queryInterval: input.query,
        overlappingIntervals: [],
        message: 'Empty interval tree ready for sequential insertion.',
      },
      {
        action: 'INIT',
        variables: { totalIntervals: items.length, queryLow: input.query.low, queryHigh: input.query.high },
        callStack: [{ name: 'init', params: { intervals: items.length } }],
      }
    );

    for (let i = 0; i < items.length; i++) {
      const iv = items[i];
      nodeSeq++;
      const newNode: IntervalTreeNode = {
        id: `it-${nodeSeq}`,
        interval: iv,
        maxHigh: iv.high,
        left: null,
        right: null,
      };

      if (!root) {
        root = newNode;
        addFrame(
          4,
          `Inserted root interval [${iv.low}, ${iv.high}]. Initial maxHigh = ${iv.high}.`,
          {
            intervals: items,
            root: cloneITNode(root),
            activeIntervalId: iv.id,
            activeNodeId: newNode.id,
            queryInterval: input.query,
            overlappingIntervals: [],
            message: `Root created: [${iv.low}, ${iv.high}], subtree maxHigh = ${iv.high}.`,
          },
          {
            action: 'INSERT_ROOT',
            variables: { low: iv.low, high: iv.high, maxHigh: iv.high },
            callStack: [{ name: 'insert', params: { low: iv.low, high: iv.high } }],
          }
        );
      } else {
        let curr: IntervalTreeNode | null = root;
        let parent: IntervalTreeNode | null = null;
        let isLeft = false;

        while (curr) {
          parent = curr;
          curr.maxHigh = Math.max(curr.maxHigh, iv.high);
          if (iv.low < curr.interval.low) {
            isLeft = true;
            curr = curr.left;
          } else {
            isLeft = false;
            curr = curr.right;
          }
        }

        if (parent) {
          if (isLeft) parent.left = newNode;
          else parent.right = newNode;
        }

        addFrame(
          8,
          `Inserted [${iv.low}, ${iv.high}] as ${isLeft ? 'left' : 'right'} child of [${parent?.interval.low ?? 0}, ${parent?.interval.high ?? 0}]. Updated ancestor maxHigh values.`,
          {
            intervals: items,
            root: cloneITNode(root),
            activeIntervalId: iv.id,
            activeNodeId: newNode.id,
            queryInterval: input.query,
            overlappingIntervals: [],
            message: `Interval [${iv.low}, ${iv.high}] inserted. Subtree max high recalculated.`,
          },
          {
            action: 'INSERT_CHILD',
            variables: { low: iv.low, high: iv.high, maxHigh: iv.high },
            callStack: [{ name: 'insert', params: { low: iv.low, high: iv.high } }],
          }
        );
      }
    }

    // Search query overlap
    const q = input.query;
    addFrame(
      12,
      `Initiating overlap search for query interval [${q.low}, ${q.high}]. Overlap rule: low1 <= high2 && low2 <= high1.`,
      {
        intervals: items,
        root: cloneITNode(root),
        activeIntervalId: null,
        activeNodeId: null,
        queryInterval: q,
        overlappingIntervals: [],
        message: `Searching for intervals overlapping with [${q.low}, ${q.high}].`,
      },
      {
        action: 'SEARCH_START',
        variables: { qLow: q.low, qHigh: q.high },
        callStack: [{ name: 'searchOverlap', params: { qLow: q.low, qHigh: q.high } }],
      }
    );

    let curr: IntervalTreeNode | null = root;
    const found: IntervalItem[] = [];

    while (curr) {
      const overlaps = curr.interval.low <= q.high && q.low <= curr.interval.high;

      addFrame(
        14,
        `Inspecting node [${curr.interval.low}, ${curr.interval.high}] (maxHigh: ${curr.maxHigh}). Overlaps with [${q.low}, ${q.high}]? ${overlaps ? 'YES' : 'NO'}.`,
        {
          intervals: items,
          root: cloneITNode(root),
          activeIntervalId: curr.interval.id,
          activeNodeId: curr.id,
          queryInterval: q,
          overlappingIntervals: overlaps ? [...found, curr.interval] : [...found],
          message: overlaps
            ? `OVERLAP FOUND: [${curr.interval.low}, ${curr.interval.high}] intersects [${q.low}, ${q.high}]!`
            : `No overlap with [${curr.interval.low}, ${curr.interval.high}]. Checking child pruning.`,
        },
        {
          action: 'TEST_OVERLAP',
          variables: {
            nodeLow: curr.interval.low,
            nodeHigh: curr.interval.high,
            maxHigh: curr.maxHigh,
            overlaps,
          },
          callStack: [{ name: 'inspect', params: { low: curr.interval.low, high: curr.interval.high } }],
        }
      );

      if (overlaps) {
        found.push(curr.interval);
      }

      if (curr.left && curr.left.maxHigh >= q.low) {
        addFrame(
          16,
          `Left child maxHigh (${curr.left.maxHigh}) >= query.low (${q.low}). Traversing left subtree.`,
          {
            intervals: items,
            root: cloneITNode(root),
            activeIntervalId: curr.left.interval.id,
            activeNodeId: curr.left.id,
            queryInterval: q,
            overlappingIntervals: [...found],
            message: `Left branch could contain overlap: left.maxHigh (${curr.left.maxHigh}) >= ${q.low}.`,
          },
          {
            action: 'BRANCH_LEFT',
            variables: { leftMaxHigh: curr.left.maxHigh, qLow: q.low },
            callStack: [{ name: 'branchLeft', params: { leftMax: curr.left.maxHigh } }],
          }
        );
        curr = curr.left;
      } else {
        addFrame(
          18,
          `Left subtree cannot contain overlap (left is null or maxHigh < ${q.low}). Pruning left branch; checking right.`,
          {
            intervals: items,
            root: cloneITNode(root),
            activeIntervalId: curr.right?.interval.id ?? null,
            activeNodeId: curr.right?.id ?? null,
            queryInterval: q,
            overlappingIntervals: [...found],
            message: `Pruning left subtree! Advancing to right child.`,
          },
          {
            action: 'PRUNE_LEFT',
            variables: { qLow: q.low },
            callStack: [{ name: 'branchRight', params: { qLow: q.low } }],
          }
        );
        curr = curr.right;
      }
    }

    addFrame(
      22,
      `Overlap search complete. Found ${found.length} overlapping interval(s).`,
      {
        intervals: items,
        root: cloneITNode(root),
        activeIntervalId: null,
        activeNodeId: null,
        queryInterval: q,
        overlappingIntervals: [...found],
        message: `Search concluded: ${found.length} overlapping interval(s) detected.`,
      },
      {
        action: 'SEARCH_COMPLETE',
        variables: { foundCount: found.length },
        callStack: [{ name: 'finish', params: { foundCount: found.length } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<IntervalTreeState>) => {
    const { intervals, queryInterval, overlappingIntervals, activeIntervalId, message } =
      frame.state;

    const allVals = [
      ...intervals.map((i) => i.low),
      ...intervals.map((i) => i.high),
      queryInterval?.low ?? 0,
      queryInterval?.high ?? 50,
    ];
    const minVal = Math.min(...allVals, 0);
    const maxVal = Math.max(...allVals, 50);
    const span = Math.max(1, maxVal - minVal);

    const getXPercent = (val: number) => ((val - minVal) / span) * 85 + 5;

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* 1D Range Stack Visualizer */}
        <div className="w-full flex flex-col p-5 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            1D Interval Stacking & Overlap Projection
          </span>

          {/* Target Query Interval Bar */}
          {queryInterval && (
            <div className="relative w-full h-10 bg-slate-900/60 border border-rose-800/60 rounded-lg flex items-center p-1">
              <span className="text-[11px] font-mono text-rose-400 font-bold px-2 w-28 shrink-0">
                Query [{queryInterval.low}, {queryInterval.high}]
              </span>
              <div className="relative flex-1 h-6">
                <div
                  className="absolute h-full rounded bg-rose-500/80 border border-rose-300 shadow-md shadow-rose-500/30 flex items-center justify-center text-[10px] font-bold text-white font-mono"
                  style={{
                    left: `${getXPercent(queryInterval.low)}%`,
                    width: `${Math.max(4, getXPercent(queryInterval.high) - getXPercent(queryInterval.low))}%`,
                  }}
                >
                  TARGET
                </div>
              </div>
            </div>
          )}

          {/* Stored Intervals */}
          <div className="space-y-2 pt-2">
            {intervals.map((iv) => {
              const isOverlapping = overlappingIntervals.some((o) => o.id === iv.id);
              const isActive = iv.id === activeIntervalId;

              let barColor = 'bg-cyan-900/60 border-cyan-500/60 text-cyan-200';
              if (isOverlapping) {
                barColor = 'bg-emerald-500/80 border-emerald-300 text-white shadow-lg shadow-emerald-500/30';
              } else if (isActive) {
                barColor = 'bg-amber-500/80 border-amber-300 text-white shadow-lg shadow-amber-500/30';
              }

              return (
                <div
                  key={`iv-bar-${iv.id}`}
                  className="relative w-full h-8 bg-slate-900/40 rounded flex items-center p-1"
                >
                  <span className="text-[11px] font-mono text-slate-400 px-2 w-28 shrink-0">
                    [{iv.low}, {iv.high}]
                  </span>
                  <div className="relative flex-1 h-5">
                    <div
                      className={`absolute h-full rounded border flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-200 ${barColor}`}
                      style={{
                        left: `${getXPercent(iv.low)}%`,
                        width: `${Math.max(4, getXPercent(iv.high) - getXPercent(iv.low))}%`,
                      }}
                    >
                      {isOverlapping ? 'OVERLAP' : `I${iv.id}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-rose-500/80 border border-rose-300" />
            <span>Target Query</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500/80 border border-emerald-300" />
            <span>Confirmed Overlap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-500/80 border border-amber-300" />
            <span>Currently Probing</span>
          </div>
        </div>
      </div>
    );
  },
};
