import {
  AlgorithmModule,
  CallStackFrame,
  ExecutionFrame,
  PredictionCheckpoint,
  SoundCue,
  StepPedagogy,
} from '../../core/types';

export type RecursionFn = 'fib' | 'binomial' | 'grid-paths';

export interface RecursionTreesInput {
  /** Which recursive definition to expand. */
  fn?: RecursionFn;
  /** Primary argument: fib(n), binomial n, grid-paths rows. */
  n?: number;
  /** Secondary argument: binomial k, grid-paths columns. Ignored by fib. */
  k?: number;
  /** When true results are stored and reused, so the call tree becomes a DAG. */
  memo?: boolean;
}

export interface RecTreeNode {
  id: string;
  /** Printed signature, e.g. `fib(4)` or `C(5,3)`. */
  label: string;
  argsKey: string;
  depth: number;
  parentId: string | null;
  childIds: string[];
  status: 'computing' | 'done';
  base: boolean;
  /** Naive mode: this invocation repeats an argument that was solved before. */
  repeated: boolean;
  /** First invocation with the same argument (naive overlapping subproblem). */
  repeatedOf?: string;
  /** Memo mode: the value came from the table, so this node never expanded. */
  reusedFrom?: string;
  value?: number;
}

export interface MemoEntry {
  key: string;
  label: string;
  value: number;
  nodeId: string;
}

export interface RecursionTreesState {
  fn: RecursionFn;
  memoOn: boolean;
  nodes: RecTreeNode[];
  activeNodeId: string | null;
  /** Ancestor chain of the frame that is running now, root first. */
  pathIds: string[];
  memoTable: MemoEntry[];
  lastStoredKey: string | null;
  /** Memo reuse drawn on the current frame: `from` is the lookup frame. */
  reuseEdge: { from: string; to: string } | null;
  maxDepth: number;
  stats: {
    calls: number;
    distinct: number;
    repeated: number;
    baseVisits: number;
    memoHits: number;
    memoEntries: number;
    callsAvoided: number;
  };
  message: string;
}

interface RootSpec {
  args: number[];
  notes: string[];
}

interface FnSpec {
  id: RecursionFn;
  label: string;
  /** Default arguments when the user does not supply them. */
  defaults: { n: number; k: number };
  callLabel: (args: number[]) => string;
  key: (args: number[]) => string;
  isBase: (args: number[]) => boolean;
  baseValue: (args: number[]) => number;
  childArgs: (args: number[]) => number[][];
  combine: (values: number[]) => number;
  baseHint: (args: number[]) => string;
  /** Calls a naive expansion of this argument would make (deterministic helper). */
  subtreeCalls: (args: number[]) => number;
  /** Clamp user arguments so the timeline stays readable; report every clamp. */
  makeRoot: (n: number, k: number, memoOn: boolean) => RootSpec;
}

const fibCallsCache = new Map<number, number>();
function fibSubtreeCalls(n: number): number {
  if (n <= 1) return 1;
  const cached = fibCallsCache.get(n);
  if (cached !== undefined) return cached;
  const total = 1 + fibSubtreeCalls(n - 1) + fibSubtreeCalls(n - 2);
  fibCallsCache.set(n, total);
  return total;
}

const binomialCallsCache = new Map<string, number>();
function binomialSubtreeCalls(n: number, k: number): number {
  if (k === 0 || k === n) return 1;
  const cacheKey = `${n},${k}`;
  const cached = binomialCallsCache.get(cacheKey);
  if (cached !== undefined) return cached;
  const total = 1 + binomialSubtreeCalls(n - 1, k - 1) + binomialSubtreeCalls(n - 1, k);
  binomialCallsCache.set(cacheKey, total);
  return total;
}

const gridCallsCache = new Map<string, number>();
function gridSubtreeCalls(r: number, c: number): number {
  if (r === 0 || c === 0) return 1;
  const cacheKey = `${r},${c}`;
  const cached = gridCallsCache.get(cacheKey);
  if (cached !== undefined) return cached;
  const total = 1 + gridSubtreeCalls(r - 1, c) + gridSubtreeCalls(r, c - 1);
  gridCallsCache.set(cacheKey, total);
  return total;
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

const FIB: FnSpec = {
  id: 'fib',
  label: 'Fibonacci',
  defaults: { n: 5, k: 0 },
  callLabel: (args) => `fib(${args[0]})`,
  key: (args) => `fib(${args[0]})`,
  isBase: (args) => args[0] <= 1,
  baseValue: (args) => args[0],
  childArgs: (args) =>
    args[0] <= 1
      ? []
      : [
          [args[0] - 1],
          [args[0] - 2],
        ],
  combine: (values) => values[0] + values[1],
  baseHint: (args) => `fib(${args[0]}) returns ${args[0]} because n <= 1`,
  subtreeCalls: (args) => fibSubtreeCalls(args[0]),
  makeRoot: (n, _k, memoOn) => {
    const cap = memoOn ? 10 : 6;
    const value = clampInt(n, 0, cap);
    const notes: string[] = [];
    if (value !== Math.round(n)) notes.push(`n clamped from ${Math.round(n)} to ${value} (visual limit ${cap})`);
    return { args: [value], notes };
  },
};

const BINOMIAL: FnSpec = {
  id: 'binomial',
  label: 'Binomial coefficient',
  defaults: { n: 5, k: 3 },
  callLabel: (args) => `C(${args[0]},${args[1]})`,
  key: (args) => `C(${args[0]},${args[1]})`,
  isBase: (args) => args[1] === 0 || args[1] === args[0],
  baseValue: () => 1,
  childArgs: (args) =>
    args[1] === 0 || args[1] === args[0]
      ? []
      : [
          [args[0] - 1, args[1] - 1],
          [args[0] - 1, args[1]],
        ],
  combine: (values) => values[0] + values[1],
  baseHint: (args) =>
    args[1] === 0 ? `C(${args[0]},0) = 1 (empty selection)` : `C(${args[0]},${args[0]}) = 1 (take everything)`,
  subtreeCalls: (args) => binomialSubtreeCalls(args[0], args[1]),
  makeRoot: (n, k, memoOn) => {
    const cap = memoOn ? 6 : 5;
    const notes: string[] = [];
    const nValue = clampInt(n, 0, cap);
    if (nValue !== Math.round(n)) notes.push(`n clamped from ${Math.round(n)} to ${nValue} (visual limit ${cap})`);
    const kValue = clampInt(k, 0, nValue);
    if (kValue !== Math.round(k)) notes.push(`k clamped from ${Math.round(k)} to ${kValue} (must satisfy 0 <= k <= n)`);
    return { args: [nValue, kValue], notes };
  },
};

const GRID: FnSpec = {
  id: 'grid-paths',
  label: 'Grid paths',
  defaults: { n: 2, k: 2 },
  callLabel: (args) => `paths(${args[0]},${args[1]})`,
  key: (args) => `paths(${args[0]},${args[1]})`,
  isBase: (args) => args[0] === 0 || args[1] === 0,
  baseValue: () => 1,
  childArgs: (args) =>
    args[0] === 0 || args[1] === 0
      ? []
      : [
          [args[0] - 1, args[1]],
          [args[0], args[1] - 1],
        ],
  combine: (values) => values[0] + values[1],
  baseHint: (args) =>
    args[0] === 0
      ? `paths(0,${args[1]}) = 1: a single row leaves only one way`
      : `paths(${args[0]},0) = 1: a single column leaves only one way`,
  subtreeCalls: (args) => gridSubtreeCalls(args[0], args[1]),
  makeRoot: (n, k, memoOn) => {
    const cap = memoOn ? 3 : 2;
    const notes: string[] = [];
    const r = clampInt(n, 0, cap);
    if (r !== Math.round(n)) notes.push(`rows clamped from ${Math.round(n)} to ${r} (visual limit ${cap})`);
    const c = clampInt(k, 0, cap);
    if (c !== Math.round(k)) notes.push(`columns clamped from ${Math.round(k)} to ${c} (visual limit ${cap})`);
    return { args: [r, c], notes };
  },
};

const SPECS: Record<RecursionFn, FnSpec> = {
  fib: FIB,
  binomial: BINOMIAL,
  'grid-paths': GRID,
};

function cloneNodes(nodes: RecTreeNode[]): RecTreeNode[] {
  return nodes.map((node) => ({ ...node, childIds: [...node.childIds] }));
}

function cloneMemo(memoTable: MemoEntry[]): MemoEntry[] {
  return memoTable.map((entry) => ({ ...entry }));
}

export const recursionTreesModule: AlgorithmModule<RecursionTreesInput, RecursionTreesState> = {
  id: 'recursion-trees',
  title: 'Recursion Trees & Memoisation (Overlapping Subproblems → DAG)',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  relatedModules: [
    { id: 'mergesort-recursion-tree', label: 'Mergesort Call Tree' },
    { id: 'quicksort-partition-tree', label: 'Quicksort Partition Tree' },
    { id: 'backtracking-decision-tree', label: 'Backtracking Decision Tree' },
    { id: 'tower-of-hanoi', label: 'Tower of Hanoi' },
    { id: 'climbing-stairs', label: 'Climbing Stairs (DP)' },
  ],
  complexity: {
    timeBest: 'O(1) per memoised call that hits the table',
    timeAverage: 'One expansion per distinct subproblem when memoised, vs exponential naive',
    timeWorst: 'fib: 2·F(n+1)−1 call nodes naive (fib(6) = 25) vs 2n−1 with memo (fib(6) = 7)',
    spaceAuxiliary: 'O(H) stack frames, plus one memo entry per distinct subproblem',
    worstCaseCondition:
      'Naive recursion over overlapping subproblems: fib(6) expands 25 frames while the memoised version expands 7 and reuses 4',
  },
  theory: {
    overview:
      'A recursion tree draws one node per function invocation: the label is the argument tuple, the value appears when the frame returns, and base cases are the leaves. When different branches repeat the same argument the tree contains duplicate subtrees — overlapping subproblems.',
    whyItWorks:
      'Frames unwind in LIFO order, so a parent can only combine results after both children have returned (the stack-unwinding invariant). Memoisation adds a table keyed by the full argument tuple: the first call computes and stores the value, later calls with the same arguments return it without expanding. Exactly the overlapping subtrees disappear, so the call graph becomes a DAG with one node per distinct subproblem.',
    invariant:
      'Stack unwinding: a frame is still computing until every child frame has returned a value. Memo table: every stored entry equals the value the same argument would produce by recursion.',
    pitfalls: [
      'Not noticing overlapping subproblems: the naive fib tree recomputes fib(3) twice and fib(2) three times, which is why it is exponential.',
      'Keying the memo table on only part of the arguments (e.g. C(n,k) keyed by n alone) returns wrong values — the key must be the full argument tuple.',
      'Forgetting that memoisation trades memory for time: one table entry per distinct subproblem.',
      'Recursion depth equals tree depth, so deep trees can overflow the call stack even when the number of distinct subproblems is small.',
    ],
    steps: [
      'Call a subproblem and push a frame (the node appears in the tree).',
      'If memoisation is on and the arguments are already in the table, return the stored value without expanding.',
      'If the call matches the base case, return the base value — that is a leaf.',
      'Otherwise recurse on the smaller arguments (left, then right) and combine their values.',
      'Store the combined value in the table when memoisation is on, then return it and pop the frame.',
    ],
    watchOut: [
      'Teal/rose nodes marked "repeat" are arguments that were already solved earlier — that is wasted work.',
      'Violet nodes marked "memo" never expanded; the dashed arrow points at the entry that answered them.',
    ],
  },
  defaultInput: { fn: 'fib', n: 5, memo: false },
  presets: [
    {
      id: 'fib-naive-5',
      label: 'fib(5) — naive tree',
      description: '15 calls, 8 base cases and 3 repeated subproblems: the classic exponential tree',
      data: { fn: 'fib', n: 5, memo: false },
    },
    {
      id: 'fib-naive-6',
      label: 'fib(6) — naive tree',
      description: '25 calls: watch the same subproblems reappear deeper in the tree',
      data: { fn: 'fib', n: 6, memo: false },
    },
    {
      id: 'fib-memo-6',
      label: 'fib(6) — memoised DAG',
      description: '7 distinct subproblems, 4 memo hits, 18 calls skipped entirely',
      data: { fn: 'fib', n: 6, memo: true },
    },
    {
      id: 'binomial-naive',
      label: 'C(5,3) — naive tree',
      description: 'Pascal-triangle recursion: 19 calls, overlapping (n,k) pairs',
      data: { fn: 'binomial', n: 5, k: 3, memo: false },
    },
    {
      id: 'binomial-memo',
      label: 'C(6,3) — memoised DAG',
      description: 'Two-argument memo keys: each distinct (n,k) pair is computed once',
      data: { fn: 'binomial', n: 6, k: 3, memo: true },
    },
    {
      id: 'grid-memo',
      label: 'paths(3,3) — memoised DAG',
      description: 'Counting monotone grid paths with a lookup table instead of a tree',
      data: { fn: 'grid-paths', n: 3, k: 3, memo: true },
    },
  ],
  codeSnippets: {
    pseudocode: `function solve(args):
    if memo and args in table: return table[args]
    if is_base(args): value = base_value(args)
    else:
        left  = solve(next_args_1(args))
        right = solve(next_args_2(args))
        value = combine(left, right)
    if memo: table[args] = value
    return value
# Instantiations used by this module:
#   fib(n):     is_base = (n <= 1),               next_args = (n-1), (n-2), combine = left + right
#   C(n,k):     is_base = (k == 0 or k == n),     next_args = (n-1,k-1), (n-1,k)
#   paths(r,c): is_base = (r == 0 or c == 0),     next_args = (r-1,c), (r,c-1)
# With memo = true the table keeps one value per argument tuple (base cases
# included), so overlapping subtrees are solved once and the tree becomes a DAG.`,
    python: `def solve(args):
    if memo and args in table: return table[args]
    if is_base(args): value = base_value(args)
    else:
        left = solve(next_args_1(args))
        right = solve(next_args_2(args))
        value = combine(left, right)
    if memo: table[args] = value
    return value
# Instantiations used by this module:
#   fib(n):     is_base = (n <= 1),           next_args = (n-1), (n-2)
#   C(n,k):     is_base = (k == 0 or k == n), next_args = (n-1,k-1), (n-1,k)
#   paths(r,c): is_base = (r == 0 or c == 0), next_args = (r-1,c), (r,c-1)
# table is a dict: one entry per distinct argument tuple.`,
    typescript: `function solve(args: number[]): number { let value = 0;
  if (memo && table.has(key(args))) return table.get(key(args))!;
  if (isBase(args)) value = baseValue(args);
  else {
    const left = solve(nextArgs1(args));
    const right = solve(nextArgs2(args));
    value = combine(left, right); }
  if (memo) table.set(key(args), value);
  return value;
}
// Instantiations used by this module:
//   fib(n):     isBase = (n <= 1),             nextArgs = (n-1), (n-2)
//   C(n,k):     isBase = (k === 0 || k === n), nextArgs = (n-1,k-1), (n-1,k)
//   paths(r,c): isBase = (r === 0 || c === 0), nextArgs = (r-1,c), (r,c-1)
// table is a Map: one entry per distinct argument tuple.`,
    cpp: `int solve(vector<int> args) { int value = 0;
    if (memo && table.count(key(args))) return table[key(args)];
    if (isBase(args)) value = baseValue(args);
    else {
        int left = solve(nextArgs1(args));
        int right = solve(nextArgs2(args));
        value = combine(left, right); }
    if (memo) table[key(args)] = value;
    return value;
}
// Instantiations used by this module:
//   fib(n):     isBase = (n <= 1),           nextArgs = (n-1), (n-2)
//   C(n,k):     isBase = (k == 0 || k == n), nextArgs = (n-1,k-1), (n-1,k)
//   paths(r,c): isBase = (r == 0 || c == 0), nextArgs = (r-1,c), (r,c-1)
// unordered_map keeps one entry per distinct argument tuple.`,
    java: `static int solve(int[] args) { int value = 0;
    if (memo && table.containsKey(key(args))) return table.get(key(args));
    if (isBase(args)) value = baseValue(args);
    else {
        int left = solve(nextArgs1(args));
        int right = solve(nextArgs2(args));
        value = combine(left, right); }
    if (memo) table.put(key(args), value);
    return value;
}
// Instantiations used by this module:
//   fib(n):     isBase = (n <= 1),           nextArgs = (n-1), (n-2)
//   C(n,k):     isBase = (k == 0 || k == n), nextArgs = (n-1,k-1), (n-1,k)
//   paths(r,c): isBase = (r == 0 || c == 0), nextArgs = (r-1,c), (r,c-1)
// HashMap keeps one entry per distinct argument tuple.`,
  },
  generateTimeline: (input: RecursionTreesInput): ExecutionFrame<RecursionTreesState>[] => {
    const fnId: RecursionFn =
      input?.fn === 'binomial' || input?.fn === 'grid-paths' || input?.fn === 'fib' ? input.fn : 'fib';
    const spec = SPECS[fnId];
    const memoOn = input?.memo === true;

    const rawN = typeof input?.n === 'number' && Number.isFinite(input.n) ? input.n : spec.defaults.n;
    const rawK = typeof input?.k === 'number' && Number.isFinite(input.k) ? input.k : spec.defaults.k;
    const rootSpec = spec.makeRoot(rawN, rawK, memoOn);
    const rootArgs = rootSpec.args;
    const rootLabel = spec.callLabel(rootArgs);

    const nodes: RecTreeNode[] = [];
    const memoTable: MemoEntry[] = [];
    const memoIndex = new Map<string, { nodeId: string; value: number }>();
    const firstSeen = new Map<string, string>();
    const pathIds: string[] = [];

    let calls = 0;
    let distinct = 0;
    let repeated = 0;
    let baseVisits = 0;
    let memoHits = 0;
    let memoEntriesStored = 0;
    let callsAvoided = 0;
    let maxDepth = 0;
    let lastStoredKey: string | null = null;
    let reuseEdge: { from: string; to: string } | null = null;

    let firstBaseMilestone = false;
    let repeatMilestone = false;
    let memoHitMilestone = false;
    let repeatCheckpointAdded = false;
    let memoMissCheckpointAdded = false;
    let memoHitCheckpointAdded = false;

    const frames: ExecutionFrame<RecursionTreesState>[] = [];

    const nodeById = (id: string): RecTreeNode => {
      const found = nodes.find((node) => node.id === id);
      if (!found) throw new Error(`missing recursion-tree node ${id}`);
      return found;
    };

    const stats = () => ({
      calls,
      distinct,
      repeated,
      baseVisits,
      memoHits,
      memoEntries: memoEntriesStored,
      callsAvoided,
    });

    interface SnapshotOverrides {
      activeNodeId?: string | null;
      pathIds?: string[];
      reuseEdge?: { from: string; to: string } | null;
      lastStoredKey?: string | null;
      message?: string;
    }

    const snapshot = (overrides: SnapshotOverrides = {}): RecursionTreesState => {
      const snapshotPath = overrides.pathIds ?? [...pathIds];
      return {
        fn: fnId,
        memoOn,
        nodes: cloneNodes(nodes),
        activeNodeId:
          'activeNodeId' in overrides
            ? (overrides.activeNodeId ?? null)
            : snapshotPath.length > 0
              ? snapshotPath[snapshotPath.length - 1]
              : null,
        pathIds: snapshotPath,
        memoTable: cloneMemo(memoTable),
        lastStoredKey: 'lastStoredKey' in overrides ? (overrides.lastStoredKey ?? null) : lastStoredKey,
        reuseEdge: 'reuseEdge' in overrides ? (overrides.reuseEdge ?? null) : reuseEdge,
        maxDepth,
        stats: stats(),
        message: overrides.message ?? '',
      };
    };

    const callStackSnapshot = (line: number): CallStackFrame[] => {
      if (pathIds.length === 0) {
        return [{ name: 'driver()', params: { call: rootLabel }, line: 1, isCurrent: true }];
      }
      return pathIds.map((id, index) => {
        const node = nodeById(id);
        const top = index === pathIds.length - 1;
        return {
          name: spec.label,
          params: { call: node.label, depth: node.depth },
          line: top ? line : node.depth === 0 ? 1 : 4,
          isCurrent: top,
        };
      });
    };

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<RecursionTreesState>['conditionEval'];
      snapshotOverrides?: SnapshotOverrides;
      milestone?: string;
      soundCue?: SoundCue;
      checkpoint?: PredictionCheckpoint;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state: snapshot(opts.snapshotOverrides),
        callStack: callStackSnapshot(opts.codeLine),
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: calls, accesses: memoIndex.size, lookups: memoHits },
        invariantStatus: {
          label:
            pathIds.length > 1
              ? `Stack unwinding: ${pathIds.length} frames open, innermost ${nodeById(pathIds[pathIds.length - 1]).label}`
              : 'Stack unwinding: no frame can return before all of its children returned',
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    pushFrame({
      codeLine: 1,
      action: 'INIT',
      explanation:
        `Recursion tree for ${rootLabel} (${spec.label}) with memoisation ${memoOn ? 'ON' : 'OFF'}.` +
        (rootSpec.notes.length ? ` Input adjusted: ${rootSpec.notes.join('; ')}.` : ''),
      variables: {
        fn: spec.label,
        root: rootLabel,
        mode: memoOn ? 'memo table (DAG)' : 'plain recursion (tree)',
        memo: memoOn,
        n: rootArgs[0],
        k: rootArgs.length > 1 ? rootArgs[1] : '-',
        naiveSubtreeCalls: spec.subtreeCalls(rootArgs),
      },
      snapshotOverrides: {
        activeNodeId: null,
        pathIds: [],
        message: `No frame is open yet. ${memoOn ? 'The memo table starts empty.' : 'Plain recursion keeps no memory between calls.'}`,
      },
      soundCue: 'start',
      pedagogy: {
        what: `${rootLabel} is the root subproblem; the tree is empty until the first call arrives.`,
        why: 'A recursion tree is built by the calls themselves: every invocation adds one node, every return writes its value.',
        whatNext: memoOn
          ? 'Call the root, look the argument up in the memo table, then recurse.'
          : `Call the root and watch how often smaller arguments such as fib(${Math.max(rootArgs[0] - 3, 0)}) are recomputed.`,
      },
    });

    const solve = (args: number[], depth: number, parentId: string | null, callSiteLine: number | null): number => {
      calls++;
      maxDepth = Math.max(maxDepth, depth);

      const argsKey = spec.key(args);
      const label = spec.callLabel(args);
      const id = `call-${nodes.length}`;
      const isBase = spec.isBase(args);
      const priorId = firstSeen.get(argsKey);
      // In memo mode a repeated argument is a table lookup, not a recomputation,
      // so only plain recursion can contain repeated invocations.
      const isRepeat = !memoOn && priorId !== undefined && !isBase;
      if (priorId === undefined) {
        firstSeen.set(argsKey, id);
        distinct++;
      } else if (!isBase && !memoOn) {
        repeated++;
      }

      const node: RecTreeNode = {
        id,
        label,
        argsKey,
        depth,
        parentId,
        childIds: [],
        status: 'computing',
        base: isBase,
        repeated: isRepeat,
      };
      if (isRepeat) node.repeatedOf = priorId;
      if (isBase) node.value = spec.baseValue(args);
      nodes.push(node);
      if (parentId) nodeById(parentId).childIds.push(id);
      pathIds.push(id);

      const parentLabel = parentId ? nodeById(parentId).label : 'driver()';
      const isRoot = parentId === null;
      const firstRepeat = isRepeat && !repeatMilestone;

      pushFrame({
        codeLine: isRoot ? 1 : callSiteLine ?? 1,
        action: 'CALL',
        explanation: isRoot
          ? `Driver calls ${label}; it becomes the root frame at depth 0.`
          : isRepeat
            ? `${parentLabel} calls ${label} (line ${callSiteLine}) — the same argument was already solved earlier at depth ${priorId ? nodeById(priorId).depth : 0}, but there is no table, so the whole subproblem is recomputed.`
            : `${parentLabel} calls ${label} (line ${callSiteLine}): a new frame is pushed at depth ${depth}.`,
        variables: {
          call: label,
          depth,
          calledFrom: parentLabel,
          callLine: callSiteLine ?? '-',
          repeated: isRepeat,
        },
        snapshotOverrides: { reuseEdge: null, message: `${label} entered — call stack depth ${depth + 1}.` },
        milestone: firstRepeat ? 'Overlapping Subproblem Found' : undefined,
        soundCue: 'step',
        checkpoint:
          firstRepeat && !repeatCheckpointAdded
            ? {
                id: 'recursion-trees-first-repeat',
                question: `${label} is called again even though an earlier branch of this same tree already computed it. Plain recursion keeps no memory. What happens now?`,
                options: [
                  'The earlier result is returned immediately',
                  'The whole subproblem is solved again from scratch',
                  'The call is pruned because the answer is known',
                ],
                correctIndex: 1,
                explanation: `Without a table the runtime repeats ${spec.subtreeCalls(args)} call(s) for this argument alone. That duplicated work is what memoisation removes.`,
                hint: 'Check the mode badge: plain recursion has no table to look up.',
              }
            : undefined,
        pedagogy: {
          what: isRoot
            ? `${label} is now the only frame on the call stack.`
            : isRepeat
              ? `${label} re-enters an argument already solved at depth ${priorId ? nodeById(priorId).depth : 0} — an overlapping subproblem.`
              : `A frame for ${label} was pushed by ${parentLabel}; the call stack is ${depth + 1} frames deep.`,
          why: isBase
            ? `This call already satisfies the base condition, so it becomes a leaf instead of recursing.`
            : isRepeat
              ? 'Nothing is cached, so the runtime must rebuild the whole subtree even though the answer is already known.'
              : 'Frames unwind in LIFO order, so this call must finish before its caller can combine results.',
          whatNext: isBase
            ? `Verify the base condition and return ${spec.baseValue(args)} immediately.`
            : memoOn
              ? `Look ${argsKey} up in the memo table before doing any work.`
              : 'Check the base condition, then make the first recursive call.',
        },
      });

      if (firstRepeat) {
        repeatMilestone = true;
        repeatCheckpointAdded = true;
      }

      if (memoOn) {
        const hit = memoIndex.get(argsKey);
        if (hit) {
          memoHits++;
          callsAvoided += spec.subtreeCalls(args);
          node.status = 'done';
          node.value = hit.value;
          node.reusedFrom = hit.nodeId;
          reuseEdge = { from: id, to: hit.nodeId };

          pushFrame({
            codeLine: 2,
            action: 'MEMO_HIT',
            explanation: `${argsKey} is already in the memo table (= ${hit.value}). Return it straight away — the whole subtree under ${label} never runs.`,
            conditionEval: { condition: `${argsKey} in memo`, result: true },
            variables: {
              call: label,
              memoValue: hit.value,
              answeredBy: 'memo table',
              memoHits,
              callsAvoided,
            },
            snapshotOverrides: { message: `Memo hit: ${argsKey} = ${hit.value} (no recursion).` },
            milestone: !memoHitMilestone ? 'First Memo Reuse' : undefined,
            soundCue: 'success',
            checkpoint: !memoHitCheckpointAdded
              ? {
                  id: 'recursion-trees-memo-hit',
                  question: `${argsKey} is already stored in the table. What should the memoised call do?`,
                  options: [
                    'Recompute it to double-check the table',
                    'Return the stored value and skip the subtree',
                    'Insert a second copy under a new key',
                  ],
                  correctIndex: 1,
                  explanation: `Returning memo[${argsKey}] = ${hit.value} costs one lookup and avoids ${spec.subtreeCalls(args)} invocation(s) that plain recursion would repeat.`,
                  hint: 'That single reuse is the difference between a tree and a DAG.',
                }
              : undefined,
            pedagogy: {
              what: `The lookup succeeded, so ${label} is answered from the table with value ${hit.value}.`,
              why: 'Memoisation is sound because the same argument always produces the same result, so the stored value can be returned as-is.',
              whatNext: 'The frame pops immediately and the caller receives the cached value.',
            },
          });
          if (!memoHitMilestone) memoHitMilestone = true;
          memoHitCheckpointAdded = true;

          pathIds.pop();
          reuseEdge = null;
          return hit.value;
        }

        pushFrame({
          codeLine: 2,
          action: 'MEMO_MISS',
          explanation: `No memo entry for ${argsKey} yet, so ${label} has to be computed (and will be stored).`,
          conditionEval: { condition: `${argsKey} in memo`, result: false },
          variables: { call: label, memoSize: memoEntriesStored, memoHits },
          snapshotOverrides: { message: `${argsKey} is not cached — compute it once, then store it.` },
          soundCue: 'step',
          checkpoint: !memoMissCheckpointAdded
            ? {
                id: 'recursion-trees-memo-miss',
                question: `The table holds no value for ${argsKey}. What must happen before it can be returned?`,
                options: [
                  'Return 0 because the table is empty',
                  'Compute it recursively, then store the result under its arguments',
                  'Skip the call and reuse the parent result',
                ],
                correctIndex: 1,
                explanation:
                  'A memoised call computes the subproblem once and stores it under the full argument tuple, so every later call with those arguments is a lookup.',
                hint: 'The table is a cache: fill it on the way back out of the recursion.',
              }
            : undefined,
          pedagogy: {
            what: `The table has no value for ${argsKey}, so this call must recurse.`,
            why: 'Filling the table on the way out means the expensive part happens at most once per distinct subproblem.',
            whatNext: isBase
              ? 'Check the base condition first — a base case returns without recursing.'
              : 'Verify the base condition, then solve the two smaller arguments.',
          },
        });
        if (!memoMissCheckpointAdded) memoMissCheckpointAdded = true;
      }

      if (isBase) {
        baseVisits++;
        const value = spec.baseValue(args);
        node.status = 'done';
        node.value = value;

        pushFrame({
          codeLine: 3,
          action: 'BASE_CASE',
          explanation: `Base case: ${spec.baseHint(args)}, so ${label} = ${value} without any recursive call.`,
          conditionEval: { condition: `is_base(${label})`, result: true },
          variables: { call: label, baseValue: value, baseVisits },
          milestone: !firstBaseMilestone ? 'First Base Case' : undefined,
          soundCue: 'pop',
          pedagogy: {
            what: `${label} matches the base case and produces the value ${value} directly.`,
            why: 'Base cases stop the recursion; without them the tree would never have leaves or values.',
            whatNext: memoOn
              ? `Store ${label} = ${value} in the table as well so the next call with these arguments is a lookup.`
              : `Return ${value} to ${parentLabel} and pop this frame.`,
          },
        });
        if (!firstBaseMilestone) firstBaseMilestone = true;

        if (memoOn) {
          // Base results are cached too: the second call with the same
          // arguments becomes a table hit instead of a repeated base visit.
          memoIndex.set(argsKey, { nodeId: id, value });
          memoTable.push({ key: argsKey, label, value, nodeId: id });
          memoEntriesStored++;
          lastStoredKey = argsKey;

          pushFrame({
            codeLine: 8,
            action: 'MEMO_STORE',
            explanation: `Store memo[${argsKey}] = ${value} — base-case results are cached too, so a second ${label} call never recurses.`,
            variables: {
              call: label,
              storedKey: argsKey,
              storedValue: value,
              memoEntries: memoEntriesStored,
              baseCase: true,
            },
            soundCue: 'insert',
            pedagogy: {
              what: `${argsKey} = ${value} is written into the table, even though it is a base case.`,
              why: 'Caching base values means a later identical call is answered by one lookup instead of another base visit.',
              whatNext: `Return ${value} to ${parentLabel} and pop this frame.`,
            },
          });
        }

        pushFrame({
          codeLine: 9,
          action: 'RETURN',
          explanation: `${label} = ${value} returns to ${parentLabel}; the frame leaves the call stack.`,
          variables: { call: label, returnedValue: value, baseVisits },
          snapshotOverrides: { message: `Leaf ${label} returned ${value}.` },
          soundCue: 'pop',
          pedagogy: {
            what: `${label} is finished, so its frame pops and hands ${value} upwards.`,
            why: 'Each return frees one stack frame; that is why recursion depth equals the height of this tree.',
            whatNext: 'The caller resumes right after its recursive call.',
          },
        });

        pathIds.pop();
        return value;
      }

      const childArgsList = spec.childArgs(args);
      const childValues: number[] = [];
      childArgsList.forEach((childArgs, childIndex) => {
        const callLine = childIndex === 0 ? 5 : 6;
        const side = childIndex === 0 ? 'left' : 'right';
        const value = solve(childArgs, depth + 1, id, callLine);
        childValues.push(value);
        reuseEdge = null;
        // The assignment completes in the caller: show the value arriving.
        pushFrame({
          codeLine: callLine,
          action: 'ASSIGN',
          explanation: `${label} stores ${side} = ${spec.callLabel(childArgs)} = ${value} (line ${callLine}).`,
          variables: {
            call: label,
            side,
            assignedFrom: spec.callLabel(childArgs),
            assignedValue: value,
            depth,
          },
          snapshotOverrides: { message: `${side} = ${value} is now available inside ${label}.` },
          soundCue: 'step',
          pedagogy: {
            what: `The ${side} child returned, so ${label} binds ${side} = ${value}.`,
            why: 'Both child values must be bound before this frame can combine them — the unwinding order is bottom-up.',
            whatNext:
              childIndex === 0
                ? 'Make the second recursive call (line 6).'
                : 'Combine the two child values.',
          },
        });
      });

      const value = spec.combine(childValues);
      const childLabels = childArgsList.map((childArgs) => spec.callLabel(childArgs));
      pushFrame({
        codeLine: 7,
        action: 'COMBINE',
        explanation: `${label}: combine ${childLabels[0]} = ${childValues[0]} and ${childLabels[1]} = ${childValues[1]} to get value = ${value}.`,
        variables: {
          call: label,
          leftLabel: childLabels[0],
          leftValue: childValues[0],
          rightLabel: childLabels[1],
          rightValue: childValues[1],
          value,
        },
        soundCue: 'compare',
        pedagogy: {
          what: `Both children are back, so ${label} produces ${value} from ${childValues[0]} and ${childValues[1]}.`,
          why: 'This is the combination step of divide and conquer: the parent value is built from solved children.',
          whatNext: memoOn
            ? `Store ${label} = ${value} in the table so no later call repeats this work.`
            : `Return ${value} to ${parentLabel}.`,
        },
      });

      if (memoOn) {
        memoIndex.set(argsKey, { nodeId: id, value });
        memoTable.push({ key: argsKey, label, value, nodeId: id });
        memoEntriesStored++;
        lastStoredKey = argsKey;

        pushFrame({
          codeLine: 8,
          action: 'MEMO_STORE',
          explanation: `Store memo[${argsKey}] = ${value}; that entry now covers ${spec.subtreeCalls(args)} call(s) if the argument reappears.`,
          variables: {
            call: label,
            storedKey: argsKey,
            storedValue: value,
            memoEntries: memoEntriesStored,
            coversCalls: spec.subtreeCalls(args),
          },
          soundCue: 'insert',
          pedagogy: {
            what: `${argsKey} = ${value} is written into the memo table.`,
            why: 'Storing the value while it is known turns every repeated call into a table lookup instead of a subtree.',
            whatNext: `Return ${value} to ${parentLabel}.`,
          },
        });
      }

      node.status = 'done';
      node.value = value;
      pushFrame({
        codeLine: 9,
        action: 'RETURN',
        explanation: `${label} returns ${value} to ${parentLabel} and its frame pops.`,
        variables: { call: label, returnedValue: value, depth, repeated: isRepeat },
        snapshotOverrides: { message: `${label} = ${value} returned; call stack depth back to ${depth}.` },
        soundCue: 'pop',
        pedagogy: {
          what: `${label} is finished with value ${value}, so its frame leaves the call stack.`,
          why: 'Only frames that have combined all children may return; that keeps the tree consistent.',
          whatNext: isRoot
            ? 'The root returned — the recursion is complete.'
            : `Control returns to ${parentLabel} after its recursive call.`,
        },
      });

      pathIds.pop();
      return value;
    };

    const rootValue = solve(rootArgs, 0, null, null);
    reuseEdge = null;

    const naiveCalls = spec.subtreeCalls(rootArgs);
    pushFrame({
      codeLine: 9,
      action: 'DONE',
      explanation: memoOn
        ? `${rootLabel} = ${rootValue}. ${calls} invocations (${memoHits} answered by the memo table), ${distinct} distinct subproblems, ${baseVisits} base-case visit(s), ${repeated} recomputation(s); ${callsAvoided} of the naive ${naiveCalls} calls were skipped.`
        : `${rootLabel} = ${rootValue}. ${calls} invocations, ${distinct} distinct subproblems, ${repeated} repeated invocation(s) and ${baseVisits} base-case visit(s) — the same subproblems keep reappearing.`,
      variables: {
        root: rootLabel,
        rootValue,
        calls,
        distinct,
        repeated,
        baseVisits,
        memoHits,
        memoEntries: memoEntriesStored,
        callsAvoided,
        naiveCalls,
        maxDepth,
      },
      snapshotOverrides: {
        activeNodeId: null,
        pathIds: [],
        reuseEdge: null,
        lastStoredKey: null,
        message: memoOn
          ? `Done: ${distinct} distinct subproblems solved, ${memoHits} reuse(s), ${callsAvoided} calls avoided.`
          : `Done: ${calls} calls for only ${distinct} distinct subproblems.`,
      },
      milestone: 'Recursion Complete',
      soundCue: 'finish',
      pedagogy: {
        what: memoOn
          ? `${distinct} distinct subproblems solved ${calls} time(s) in total, with ${memoHits} lookup(s) replacing whole subtrees.`
          : `${calls} frames ran to produce only ${distinct} distinct subproblems: ${repeated} invocation(s) were pure repetition.`,
        why: memoOn
          ? 'Because each entry is stored under its full argument tuple, the call graph is a DAG — one node per distinct subproblem.'
          : 'Naive recursion has no memory, so every repeated argument rebuilds a subtree that was already solved.',
        whatNext: memoOn
          ? 'Compare with the naive preset: same answer, exponentially fewer calls.'
          : 'Switch the memo flag on (preset "memoised DAG") and watch the repeated subtrees disappear.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<RecursionTreesState>) => {
    const {
      fn,
      memoOn,
      nodes,
      activeNodeId,
      pathIds,
      memoTable,
      lastStoredKey,
      reuseEdge,
      stats,
      message,
    } = frame.state;

    const modeBadge = (
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-300 uppercase">
          {fn}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 font-bold uppercase ${
            memoOn
              ? 'bg-violet-500/20 text-violet-200 border border-violet-500/40'
              : 'bg-amber-500/15 text-amber-200 border border-amber-500/40'
          }`}
        >
          {memoOn ? 'memo table (DAG)' : 'plain recursion (tree)'}
        </span>
      </div>
    );

    if (nodes.length === 0) {
      return (
        <div className="flex w-full max-w-5xl flex-col items-center gap-4 p-4">
          {modeBadge}
          <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-2 text-center font-mono text-xs text-slate-200">
            {message}
          </div>
          <div className="flex min-h-[240px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950 text-sm text-slate-400">
            Press next: the first call will create the root node of the recursion tree.
          </div>
        </div>
      );
    }

    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const widthOf = (node: RecTreeNode) => Math.max(58, node.label.length * 6.8 + 20);

    const positions = new Map<string, { x: number; y: number }>();
    let cursorX = 0;
    let deepest = 0;
    const place = (id: string): number => {
      const node = nodeMap.get(id)!;
      deepest = Math.max(deepest, node.depth);
      const kids = node.childIds.filter((childId) => nodeMap.has(childId));
      let x: number;
      if (kids.length === 0) {
        const half = widthOf(node) / 2;
        x = cursorX + half;
        cursorX += widthOf(node) + 18;
      } else {
        const childXs = kids.map(place);
        x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
      }
      positions.set(id, { x, y: 66 + node.depth * 94 });
      return x;
    };
    const rootNode = nodes[0];
    place(rootNode.id);

    const width = Math.max(680, cursorX + 40);
    const height = Math.max(280, 66 + deepest * 94 + 52);

    const pathSet = new Set(pathIds);
    const activePath = pathIds.map((id) => nodeMap.get(id)).filter(Boolean) as RecTreeNode[];

    const statusStyle = (node: RecTreeNode) => {
      if (node.reusedFrom) return { fill: '#2E1065', stroke: '#A78BFA', text: '#DDD6FE' };
      if (node.repeated) return { fill: '#4C0519', stroke: '#FB7185', text: '#FECDD3' };
      if (node.base && node.status === 'done') return { fill: '#082F49', stroke: '#38BDF8', text: '#BAE6FD' };
      if (node.status === 'done') return { fill: '#022C22', stroke: '#10B981', text: '#A7F3D0' };
      return { fill: '#1E1B4B', stroke: '#818CF8', text: '#C7D2FE' };
    };

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 p-4">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          {modeBadge}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              calls <span className="font-bold text-cyan-300">{stats.calls}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              distinct <span className="font-bold text-emerald-300">{stats.distinct}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              repeated <span className={`font-bold ${stats.repeated > 0 ? 'text-rose-300' : 'text-slate-400'}`}>{stats.repeated}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              base visits <span className="font-bold text-sky-300">{stats.baseVisits}</span>
            </span>
            {memoOn && (
              <>
                <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
                  memo hits <span className="font-bold text-violet-300">{stats.memoHits}</span>
                </span>
                <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
                  avoided <span className="font-bold text-violet-300">{stats.callsAvoided}</span>
                </span>
              </>
            )}
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              depth <span className="font-bold text-amber-300">{frame.state.maxDepth}</span>
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-2 text-center font-mono text-xs text-slate-200">
          {message}
        </div>

        {memoOn && (
          <div className="w-full rounded-xl border border-violet-900/60 bg-violet-950/20 p-2">
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-violet-300">
              <span>Memo table (argument → value)</span>
              <span>{memoTable.length} entr{memoTable.length === 1 ? 'y' : 'ies'}</span>
            </div>
            {memoTable.length === 0 ? (
              <div className="font-mono text-[11px] text-slate-500">
                empty — the first call will compute and store its result here
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {memoTable.map((entry) => (
                  <span
                    key={entry.key}
                    className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${
                      entry.key === lastStoredKey
                        ? 'border-violet-300 bg-violet-500/30 text-violet-100 font-bold'
                        : 'border-violet-900 bg-slate-950 text-violet-200'
                    }`}
                  >
                    {entry.key} = {entry.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-2 shadow-inner">
          <svg className="block" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <marker
                id="recursion-reuse-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#A78BFA" />
              </marker>
            </defs>

            {nodes.map((node) => {
              if (!node.parentId) return null;
              const from = positions.get(node.parentId);
              const to = positions.get(node.id);
              if (!from || !to) return null;
              const onPath = pathSet.has(node.parentId) && pathSet.has(node.id);
              return (
                <line
                  key={`edge-${node.id}`}
                  x1={from.x}
                  y1={from.y + 18}
                  x2={to.x}
                  y2={to.y - 20}
                  stroke={onPath ? '#A78BFA' : '#475569'}
                  strokeWidth={onPath ? 2.2 : 1.4}
                />
              );
            })}

            {nodes
              .filter((node) => node.reusedFrom && nodeMap.has(node.reusedFrom))
              .map((node) => {
                const from = positions.get(node.id)!;
                const to = positions.get(node.reusedFrom!)!;
                const highlighted = reuseEdge?.from === node.id;
                const mx = (from.x + to.x) / 2;
                const my = Math.min(from.y, to.y) - 34;
                return (
                  <g key={`reuse-${node.id}`}>
                    <path
                      d={`M ${from.x} ${from.y + 6} Q ${mx} ${my} ${to.x} ${to.y - 22}`}
                      fill="none"
                      stroke={highlighted ? '#C4B5FD' : '#7C3AED'}
                      strokeWidth={highlighted ? 2.4 : 1.2}
                      strokeDasharray="5 4"
                      opacity={highlighted ? 1 : 0.6}
                      markerEnd="url(#recursion-reuse-arrow)"
                    />
                    {highlighted && (
                      <text
                        x={mx}
                        y={my + 4}
                        textAnchor="middle"
                        fill="#DDD6FE"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="700"
                      >
                        memo
                      </text>
                    )}
                  </g>
                );
              })}

            {nodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;
              const style = statusStyle(node);
              const isActive = node.id === activeNodeId;
              const w = widthOf(node);
              const onPath = pathSet.has(node.id);
              const badge = node.reusedFrom
                ? `memo ${node.value ?? ''}`
                : node.repeated
                  ? 'repeat'
                  : node.base
                    ? `base ${node.value ?? ''}`
                    : node.value !== undefined
                      ? `= ${node.value}`
                      : '…';
              return (
                <g key={node.id}>
                  {isActive && (
                    <rect
                      x={pos.x - w / 2 - 4}
                      y={pos.y - 22}
                      width={w + 8}
                      height={44}
                      rx={10}
                      fill="none"
                      stroke="#FBBF24"
                      strokeWidth={1.6}
                      opacity={0.85}
                    />
                  )}
                  <rect
                    x={pos.x - w / 2}
                    y={pos.y - 18}
                    width={w}
                    height={36}
                    rx={8}
                    fill={style.fill}
                    stroke={isActive ? '#FBBF24' : onPath ? '#A78BFA' : style.stroke}
                    strokeWidth={isActive || onPath ? 2.2 : 1.4}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 3}
                    textAnchor="middle"
                    fill={style.text}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    {node.label}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 11}
                    textAnchor="middle"
                    fill={node.repeated ? '#FDA4AF' : node.reusedFrom ? '#C4B5FD' : '#94A3B8'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight={node.reusedFrom || node.repeated ? 700 : 500}
                  >
                    {badge}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-indigo-400 bg-indigo-950" /> computing
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-emerald-400 bg-emerald-950" /> returned
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-sky-400 bg-sky-950" /> base case
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-rose-400 bg-rose-950" /> repeated (no memo)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm border border-violet-400 bg-violet-950" /> memo reuse
            </span>
            <span>⇢ dashed arrow = value taken from the table (tree → DAG)</span>
          </div>
          {activePath.length > 0 && (
            <span className="text-slate-500">
              stack: {activePath.map((node) => node.label).join(' → ')}
            </span>
          )}
        </div>
      </div>
    );
  },
};
