import React from 'react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

/* ─── state ─── */
interface PTreeNode {
  id: number;
  arr: number[];
  pivot?: number;
  left?: number;
  right?: number;
  depth: number;
  status: 'pending' | 'partitioning' | 'sorted';
}

interface QPTState {
  nodes: PTreeNode[];
  message: string;
  phase: string;
  activeNodeId?: number;
}

type QPTInput = { array: number[] };

function cloneNodes(ns: PTreeNode[]): PTreeNode[] {
  return ns.map(n => ({ ...n, arr: [...n.arr] }));
}

/* ─── timeline ─── */
const MAX_LEN = 8; // partition tree of 8 elements = 15 nodes max, readable on one screen
const MAX_ABS = 999;
const DEFAULT_INPUT: QPTInput = { array: [35, 10, 65, 25, 50, 80, 5, 45] };

interface NormalisedInput {
  array: number[];
  notes: string[];
}

function normalise(input: QPTInput | undefined): NormalisedInput {
  const notes: string[] = [];
  const raw = input && typeof input === 'object' ? input : DEFAULT_INPUT;
  const rawArray = Array.isArray(raw.array) ? raw.array : DEFAULT_INPUT.array;

  const usable = rawArray.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  if (rawArray.length > 0 && usable.length === 0) {
    notes.push('no usable numbers in the input, so the default array is used');
    return { array: [...DEFAULT_INPUT.array], notes };
  }
  if (usable.length < rawArray.length) {
    notes.push(`${rawArray.length - usable.length} non-numeric value(s) dropped`);
  }

  const clamped = usable.map((value) => {
    const rounded = Math.max(-MAX_ABS, Math.min(MAX_ABS, Math.round(value)));
    if (rounded !== Math.round(value)) {
      notes.push(`value ${Math.round(value)} clamped to ${rounded} (±${MAX_ABS})`);
    }
    return rounded;
  });

  let array = clamped;
  if (array.length > MAX_LEN) {
    notes.push(`${array.length} values truncated to ${MAX_LEN} so the partition tree stays readable`);
    array = array.slice(0, MAX_LEN);
  }

  return { array, notes };
}

function generateTimeline(input: QPTInput): ExecutionFrame<QPTState>[] {
  const { array, notes } = normalise(input);
  const frames: ExecutionFrame<QPTState>[] = [];
  const nodes: PTreeNode[] = [];
  let nextId = 0;
  let step = 0;

  let balanceCheckpointAdded = false;
  let composeCheckpointAdded = false;
  let firstBaseMilestoneUsed = false;

  function push(
    codeLine: number,
    explanation: string,
    action: string,
    phase: string,
    activeId?: number,
    callStack: string[] = ['quicksortPartitionTree()'],
    variables: Record<string, string | number | boolean | null> = {},
    conditionEval?: { condition: string; result: boolean },
    soundCue?: 'step' | 'swap' | 'compare' | 'pop' | 'fail' | 'finish',
    isMilestone?: boolean,
    milestoneTitle?: string,
    checkpoint?: ExecutionFrame<QPTState>['checkpoint']
  ) {
    const pedagogyByAction: Record<string, { what: string; why: string; whatNext: string }> = {
      init: {
        what: `The full array [${array.join(', ')}] must be partitioned recursively until every leaf holds one element.`,
        why: 'Each partition places its pivot at its final rank, so the tree topology directly shows whether quicksort is balanced or degenerate.',
        whatNext: `Call quicksort on the whole array with the last element as pivot.`,
      },
      call: {
        what: `A new recursive call opens on a subarray of ${variables['arr.length']} element(s).`,
        why: 'The base-case guard runs first: arrays of length ≤ 1 are already sorted and need no partition.',
        whatNext: 'If the array is longer, pick the pivot and split into less-than and greater-than groups.',
      },
      base: {
        what: 'A leaf is reached: an array of length ≤ 1 is trivially sorted.',
        why: 'Leaves are the recursion base case — the sorted subarray is returned unchanged.',
        whatNext: 'The parent call composes this leaf with its pivot and the sibling subtree.',
      },
      'choose-pivot': {
        what: `The pivot is the last element of the current subarray: ${variables.pivot}.`,
        why: 'Choosing the last element is the classic Lomuto convention — simple, but it makes already-sorted input degenerate into a linear chain.',
        whatNext: 'Scan every other element into the less-than and greater-than partitions.',
      },
      partition: {
        what: 'The subarray is split: everything ≤ pivot goes left, everything > pivot goes right.',
        why: 'This single pass is the entire quicksort workhorse — after it, the pivot has its final global rank.',
        whatNext: 'Recurse on both partitions, then compose around the pivot.',
      },
      sorted: {
        what: 'The subarray is sorted: left subtree + pivot + right subtree.',
        why: 'Because both children return sorted arrays, concatenating them around the pivot preserves global order.',
        whatNext: 'Return to the parent — this node is now final.',
      },
      complete: {
        what: 'Every partition has been resolved: the whole tree is built.',
        why: 'The sorted root proves the recursive invariant held at every node.',
        whatNext: 'Compare the balanced preset with the sorted-input worst case to see the degenerate chain.',
      },
    };

    frames.push({
      stepIndex: step++,
      totalSteps: 0,
      codeLine,
      explanation,
      action,
      callStack,
      variables,
      conditionEval,
      soundCue,
      isMilestone,
      milestoneTitle,
      pedagogy: pedagogyByAction[action] ?? pedagogyByAction.call,
      ...(checkpoint ? { checkpoint } : {}),
      state: { nodes: cloneNodes(nodes), message: explanation, phase, activeNodeId: activeId },
    });
  }

  function quicksort(arr: number[], depth: number, stack: string[] = []): number {
    const id = nextId++;
    const idx = nodes.length;
    nodes.push({ id, arr: [...arr], depth, status: 'pending' });
    const currentStack = [...stack, `quicksort([${arr}], d=${depth})`];

    push(
      2,
      `Call quicksort([${arr}]) depth=${depth}`,
      'call',
      'partition',
      id,
      currentStack,
      { depth, 'arr.length': arr.length, arr: JSON.stringify(arr) },
      { condition: `arr.length (${arr.length}) <= 1`, result: arr.length <= 1 },
      'step'
    );

    if (arr.length <= 1) {
      nodes[idx].status = 'sorted';
      const baseMilestone = !firstBaseMilestoneUsed ? 'First Base Case' : undefined;
      if (baseMilestone) firstBaseMilestoneUsed = true;
      push(
        3,
        `Base case: [${arr}]`,
        'base',
        'base',
        id,
        currentStack,
        { depth, baseResult: JSON.stringify(arr) },
        { condition: 'arr.length <= 1 (base case)', result: true },
        'pop',
        !!baseMilestone,
        baseMilestone
      );
      return idx;
    }

    // partition with last element as pivot
    const pivot = arr[arr.length - 1];
    nodes[idx].pivot = pivot;
    nodes[idx].status = 'partitioning';
    const balanceCheckpoint: ExecutionFrame<QPTState>['checkpoint'] | undefined = !balanceCheckpointAdded
      ? {
          id: 'quicksort-tree-balance',
          question: `The pivot is always the LAST element of each subarray. What happens to the partition tree on already-sorted input?`,
          options: [
            'It degenerates into a linear chain — O(N²)',
            'It stays perfectly balanced — O(N log N)',
          ],
          correctIndex: 0,
          explanation:
            'On sorted input the last element is always the largest, so one partition is empty every time: the tree becomes a linear chain, which is the classic O(N²) worst case.',
          hint: 'What if the pivot is always the maximum of the current range?',
        }
      : undefined;

    push(
      4,
      `Pivot = ${pivot} from [${arr}]`,
      'choose-pivot',
      'partition',
      id,
      currentStack,
      { pivot, arr: JSON.stringify(arr) },
      { condition: `pivot = arr[${arr.length - 1}] (${pivot})`, result: true },
      'compare',
      undefined,
      undefined,
      balanceCheckpoint
    );
    if (balanceCheckpoint) balanceCheckpointAdded = true;

    const less: number[] = [];
    const greater: number[] = [];
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] <= pivot) less.push(arr[i]);
      else greater.push(arr[i]);
    }

    push(
      5,
      `Partition: less=[${less}], pivot=${pivot}, greater=[${greater}]`,
      'partition',
      'partition',
      id,
      currentStack,
      { pivot, less: JSON.stringify(less), greater: JSON.stringify(greater) },
      { condition: `less count: ${less.length}, greater count: ${greater.length}`, result: true },
      'swap'
    );

    let leftIdx: number | undefined;
    let rightIdx: number | undefined;

    if (less.length > 0) {
      leftIdx = quicksort(less, depth + 1, currentStack);
      nodes[idx].left = leftIdx;
    }
    if (greater.length > 0) {
      rightIdx = quicksort(greater, depth + 1, currentStack);
      nodes[idx].right = rightIdx;
    }

    // compose sorted result
    const sorted = [
      ...(leftIdx !== undefined ? nodes[leftIdx].arr : []),
      pivot,
      ...(rightIdx !== undefined ? nodes[rightIdx].arr : []),
    ];
    nodes[idx].arr = sorted;
    nodes[idx].status = 'sorted';
    const composeCheckpoint: ExecutionFrame<QPTState>['checkpoint'] | undefined = !composeCheckpointAdded
      ? {
          id: 'quicksort-tree-compose',
          question: `This node now holds a sorted subarray. How is it composed?`,
          options: [
            'quicksort(less) + [pivot] + quicksort(greater)',
            'quicksort(greater) + [pivot] + quicksort(less)',
            'Just quicksort(less) — the right side is dropped',
          ],
          correctIndex: 0,
          explanation:
            'Because both children return sorted arrays, concatenating them around the pivot preserves global order — that is the quicksort invariant in one line.',
          hint: 'Which side of the pivot holds the LARGER values?',
        }
      : undefined;

    push(
      7,
      `Sorted: [${sorted}] at depth ${depth}`,
      'sorted',
      'sorted',
      id,
      currentStack,
      { depth, pivot, sorted: JSON.stringify(sorted) },
      { condition: `sub-tree sorted around pivot ${pivot}`, result: true },
      'pop',
      false,
      undefined,
      composeCheckpoint
    );
    if (composeCheckpoint) composeCheckpointAdded = true;

    return idx;
  }

  push(
    1,
    'Begin Quicksort Partition Tree' + (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
    'init',
    'init',
    undefined,
    ['quicksortPartitionTree()'],
    { input: JSON.stringify(array) },
    { condition: 'start', result: true },
    'step'
  );
  quicksort([...array], 0);
  push(7, 'Quicksort complete — partition tree fully resolved', 'complete', 'complete', undefined, ['quicksortPartitionTree()'], { sortedResult: JSON.stringify(nodes[0]?.arr ?? []) }, { condition: 'complete', result: true }, 'finish', true, 'Complete');

  const total = frames.length;
  frames.forEach((f, i) => { f.stepIndex = i; f.totalSteps = total; });
  return frames;
}

/* ─── render ─── */
function renderStage(frame: ExecutionFrame<QPTState>): React.ReactNode {
  const { nodes, message, activeNodeId } = frame.state;
  if (nodes.length === 0) {
    return React.createElement('div', {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' },
    }, message);
  }

  interface LN { idx: number; x: number; y: number }
  const layout: LN[] = [];
  const q: { idx: number; depth: number; left: number; right: number }[] = [
    { idx: 0, depth: 0, left: 0, right: 900 },
  ];
  while (q.length > 0) {
    const { idx, depth, left, right } = q.shift()!;
    const x = (left + right) / 2;
    const y = 30 + depth * 85;
    layout.push({ idx, x, y });
    const nd = nodes[idx];
    const mid = (left + right) / 2;
    if (nd.left !== undefined) q.push({ idx: nd.left, depth: depth + 1, left, right: mid });
    if (nd.right !== undefined) q.push({ idx: nd.right, depth: depth + 1, left: mid, right });
  }

  const lMap = new Map<number, LN>();
  layout.forEach(l => lMap.set(l.idx, l));

  const edges: React.ReactNode[] = [];
  const boxes: React.ReactNode[] = [];

  layout.forEach(l => {
    const nd = nodes[l.idx];
    const isActive = nd.id === activeNodeId;
    const bg = isActive
      ? (nd.status === 'partitioning' ? '#f59e0b' : '#3b82f6')
      : nd.status === 'sorted' ? '#10b981' : '#334155';
    const w = Math.max(60, nd.arr.length * 26 + 20);

    boxes.push(
      React.createElement('g', { key: `n-${l.idx}` },
        React.createElement('rect', {
          x: l.x - w / 2, y: l.y - 18, width: w, height: 36, rx: 6,
          fill: bg, stroke: isActive ? '#e2e8f0' : '#475569', strokeWidth: isActive ? 2 : 1,
        }),
        nd.pivot !== undefined && React.createElement('circle', {
          cx: l.x + w / 2 - 10, cy: l.y - 18, r: 8, fill: '#ef4444',
        }),
        nd.pivot !== undefined && React.createElement('text', {
          x: l.x + w / 2 - 10, y: l.y - 14, textAnchor: 'middle', fill: '#fff', fontSize: 9, fontWeight: 700,
        }, String(nd.pivot)),
        React.createElement('text', {
          x: l.x, y: l.y + 5, textAnchor: 'middle', fill: '#f1f5f9', fontSize: 12,
          fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
        }, `[${nd.arr.join(',')}]`),
      ),
    );

    [nd.left, nd.right].forEach(child => {
      if (child !== undefined) {
        const cl = lMap.get(child);
        if (cl) {
          edges.push(React.createElement('line', {
            key: `e-${l.idx}-${child}`, x1: l.x, y1: l.y + 18, x2: cl.x, y2: cl.y - 18,
            stroke: '#475569', strokeWidth: 1.5,
          }));
        }
      }
    });
  });

  return React.createElement('div', { style: { width: '100%', height: '100%', position: 'relative' } },
    React.createElement('svg', { width: '100%', height: '100%', viewBox: '0 0 900 500', preserveAspectRatio: 'xMidYMid meet' },
      ...edges, ...boxes,
    ),
    React.createElement('div', {
      style: { position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', color: '#94a3b8', fontSize: 13, fontFamily: 'Inter, sans-serif' },
    }, message),
  );
}

/* ─── module ─── */
export const quicksortPartitionTreeModule: AlgorithmModule<QPTInput, QPTState> = {
  id: 'quicksort-partition-tree',
  title: 'Quicksort Partition Tree (Pivot-Selection Tree Topology)',
  category: 'sorting',
  difficulty: 'Intermediate',
  relatedModules: [
    { id: 'recursion-trees', label: 'Recursion Trees & Memoisation' },
    { id: 'mergesort-recursion-tree', label: 'Mergesort Call Tree' },
    { id: 'quicksort', label: 'Quicksort' },
  ],
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(log N)',
    worstCaseCondition: 'Already sorted input with last-element pivot → unbalanced tree',
  },
  theory: {
    overview: 'Visualizes the recursive partition tree of quicksort. Each node shows the subarray being processed and its chosen pivot. The tree topology reveals whether partitioning is balanced or degenerate.',
    whyItWorks: 'Quicksort picks a pivot, partitions elements into less-than and greater-than groups, then recurses. The partition tree shape directly determines performance: balanced trees → O(N log N), skewed trees → O(N²).',
    invariant: 'After partitioning, all elements left of pivot are ≤ pivot, all right are > pivot.',
    pitfalls: ['Worst case: sorted input + last-element pivot → linear depth', 'Pivot shown as red badge on each node', 'Randomized pivot selection avoids worst case in practice'],
  },
  codeSnippets: {
    pseudocode: `function quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[last]
    less = [x for x in arr if x <= pivot]
    greater = [x for x in arr if x > pivot]
    return quicksort(less) + [pivot] + quicksort(greater)`,
    python: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[-1]
    less = [x for x in arr[:-1] if x <= pivot]
    greater = [x for x in arr[:-1] if x > pivot]
    return quicksort(less) + [pivot] + quicksort(greater)`,
    typescript: `function quicksort(arr: number[]): number[] {
  if (arr.length <= 1) {
    return arr; }
  const pivot = arr[arr.length - 1];
  const less = arr.slice(0, -1).filter(x => x <= pivot);
  const greater = arr.slice(0, -1).filter(x => x > pivot);
  return [...quicksort(less), pivot, ...quicksort(greater)]; }`,
    cpp: `vector<int> quicksort(vector<int> arr) {
  if (arr.size() <= 1) {
    return arr; }
  int pivot = arr.back();
  vector<int> less; for (int i = 0; i < (int)arr.size() - 1; i++) if (arr[i] <= pivot) less.push_back(arr[i]);
  vector<int> greater; for (int i = 0; i < (int)arr.size() - 1; i++) if (arr[i] > pivot) greater.push_back(arr[i]);
  auto l = quicksort(less); l.push_back(pivot); l.insert(l.end(), quicksort(greater).begin(), quicksort(greater).end()); return l; }`,
    java: `int[] quicksort(int[] arr) {
  if (arr.length <= 1) {
    return arr; }
  int pivot = arr[arr.length - 1];
  List<Integer> less = new ArrayList<>(); for (int x : arr) if (x <= pivot) less.add(x);
  List<Integer> greater = new ArrayList<>(); for (int x : arr) if (x > pivot) greater.add(x);
  return concat(quicksort(toArray(less)), pivot, quicksort(toArray(greater))); }`,
  },

  presets: [
    { id: 'balanced', label: 'Balanced (8 elements)', description: 'Reasonably balanced partition tree', data: { array: [35, 10, 65, 25, 50, 80, 5, 45] } },
    { id: 'worstcase', label: 'Worst Case (6 sorted)', description: 'Already sorted → degenerate linear tree', data: { array: [1, 2, 3, 4, 5, 6] } },
    { id: 'random', label: 'Random (7 elements)', description: 'Random input', data: { array: [42, 17, 89, 3, 56, 28, 71] } },
  ],
  defaultInput: { array: [35, 10, 65, 25, 50, 80, 5, 45] },
  generateTimeline,
  renderStage,
};
