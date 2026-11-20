import React from 'react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

/* ─── state ─── */
interface TreeNode {
  id: number;
  arr: number[];
  left?: number;
  right?: number;
  depth: number;
  status: 'pending' | 'splitting' | 'merging' | 'merged';
}

interface MRTState {
  nodes: TreeNode[];
  message: string;
  phase: string;
  activeNodeId?: number;
}

type MRTInput = { array: number[] };

function cloneNodes(ns: TreeNode[]): TreeNode[] {
  return ns.map(n => ({ ...n, arr: [...n.arr] }));
}

/* ─── timeline ─── */
const MAX_LEN = 8; // full binary tree of 8 elements = 15 nodes, readable on one screen
const MAX_ABS = 999;
const DEFAULT_INPUT: MRTInput = { array: [38, 27, 43, 3, 9, 82, 10, 45] };

interface NormalisedInput {
  array: number[];
  notes: string[];
}

function normalise(input: MRTInput | undefined): NormalisedInput {
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
    notes.push(`${array.length} values truncated to ${MAX_LEN} so the recursion tree stays readable`);
    array = array.slice(0, MAX_LEN);
  }

  return { array, notes };
}

function generateTimeline(input: MRTInput): ExecutionFrame<MRTState>[] {
  const { array, notes } = normalise(input);
  const frames: ExecutionFrame<MRTState>[] = [];
  const nodes: TreeNode[] = [];
  let nextId = 0;
  let step = 0;

  let depthCheckpointAdded = false;
  let mergeCheckpointAdded = false;
  let firstBaseMilestoneUsed = false;
  let firstMergeMilestoneUsed = false;

  function push(
    codeLine: number,
    explanation: string,
    action: string,
    phase: string,
    activeId?: number,
    callStack: string[] = ['mergesortRecursionTree()'],
    variables: Record<string, string | number | boolean | null> = {},
    conditionEval?: { condition: string; result: boolean },
    soundCue?: 'step' | 'swap' | 'compare' | 'pop' | 'fail' | 'finish',
    isMilestone?: boolean,
    milestoneTitle?: string,
    checkpoint?: ExecutionFrame<MRTState>['checkpoint']
  ) {
    const pedagogyByAction: Record<string, { what: string; why: string; whatNext: string }> = {
      init: {
        what: `The full array [${array.join(', ')}] must be split recursively, then merged back in sorted order.`,
        why: 'Mergesort is the only main sort with a guaranteed O(N log N): halving gives log N levels, and merging costs N per level.',
        whatNext: `Call mergesort on the whole array and split at mid = floor(N / 2).`,
      },
      call: {
        what: `A new recursive call opens on a subarray of ${variables['arr.length']} element(s).`,
        why: 'The base-case guard runs first: arrays of length ≤ 1 are already sorted and need no split.',
        whatNext: 'If the array is longer, split it at the midpoint and recurse on both halves.',
      },
      base: {
        what: 'A leaf is reached: an array of length ≤ 1 is trivially sorted.',
        why: 'Leaves are the recursion base case — the sorted subarray is returned unchanged.',
        whatNext: 'The parent call merges this leaf with the sibling subtree.',
      },
      split: {
        what: `The subarray splits at mid = ${variables.mid}: left [${variables.leftArr}] and right [${variables.rightArr}].`,
        why: 'Halving is what guarantees ceil(log₂ N) levels — the log N half of O(N log N).',
        whatNext: 'Recurse on both halves, then merge the two sorted results.',
      },
      merge: {
        what: 'The two sorted halves merge into one sorted array.',
        why: 'Because both children return sorted arrays, a two-pointer merge combines them in linear time without re-sorting.',
        whatNext: 'Return to the parent — this node is now final.',
      },
      complete: {
        what: 'Every frame has been resolved: the whole recursion tree is built.',
        why: 'The sorted root proves the recursive invariant held at every node.',
        whatNext: 'Compare the depth of this tree with the quicksort partition tree — mergesort is always balanced.',
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

  function mergesort(arr: number[], depth: number, stack: string[] = []): number {
    const id = nextId++;
    const idx = nodes.length;
    nodes.push({ id, arr: [...arr], depth, status: 'pending' });
    const currentStack = [...stack, `mergesort([${arr}], d=${depth})`];

    push(
      2,
      `Call mergesort([${arr}]) at depth ${depth}`,
      'call',
      'split',
      id,
      currentStack,
      { depth, 'arr.length': arr.length, arr: JSON.stringify(arr) },
      { condition: `arr.length (${arr.length}) <= 1`, result: arr.length <= 1 },
      'step'
    );

    if (arr.length <= 1) {
      nodes[idx].status = 'merged';
      const baseMilestone = !firstBaseMilestoneUsed ? 'First Base Case' : undefined;
      if (baseMilestone) firstBaseMilestoneUsed = true;
      push(
        3,
        `Base case: [${arr}] — return`,
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

    const mid = Math.floor(arr.length / 2);
    const leftArr = arr.slice(0, mid);
    const rightArr = arr.slice(mid);

    nodes[idx].status = 'splitting';
    const depthCheckpoint: ExecutionFrame<MRTState>['checkpoint'] | undefined = !depthCheckpointAdded
      ? {
          id: 'mergesort-tree-depth',
          question: `The array of ${arr.length} elements is halved every call. How deep does the recursion tree get?`,
          options: [
            `About log₂(${arr.length}) levels — halving every time`,
            `${arr.length} levels — one element per level`,
            `2 × ${arr.length} levels — two elements per level`,
          ],
          correctIndex: 0,
          explanation: `Each call halves the range, so after about log₂(${arr.length}) levels every leaf holds one element. That logarithmic depth is why mergesort is O(N log N).`,
          hint: 'How many times can you halve something before only one element remains?',
        }
      : undefined;

    push(
      4,
      `Split [${arr}] → [${leftArr}] | [${rightArr}]`,
      'split',
      'split',
      id,
      currentStack,
      { mid, leftArr: JSON.stringify(leftArr), rightArr: JSON.stringify(rightArr) },
      { condition: 'mid = floor(len / 2)', result: true },
      'step',
      undefined,
      undefined,
      depthCheckpoint
    );
    if (depthCheckpoint) depthCheckpointAdded = true;

    const leftIdx = mergesort(leftArr, depth + 1, currentStack);
    const rightIdx = mergesort(rightArr, depth + 1, currentStack);

    nodes[idx].left = leftIdx;
    nodes[idx].right = rightIdx;

    // merge
    nodes[idx].status = 'merging';
    const merged: number[] = [];
    let i = 0, j = 0;
    const l = nodes[leftIdx].arr;
    const r = nodes[rightIdx].arr;
    while (i < l.length && j < r.length) merged.push(l[i] <= r[j] ? l[i++] : r[j++]);
    while (i < l.length) merged.push(l[i++]);
    while (j < r.length) merged.push(r[j++]);

    const mergeCheckpoint: ExecutionFrame<MRTState>['checkpoint'] | undefined = !mergeCheckpointAdded
      ? {
          id: 'mergesort-merge-invariant',
          question: `This node is about to merge [${l}] and [${r}]. Are both halves already sorted at merge time?`,
          options: [
            'Yes — both children returned sorted arrays before the merge',
            'No — the merge has to re-sort them from scratch',
          ],
          correctIndex: 0,
          explanation:
            'The recursion returns sorted subarrays, so the merge is a simple two-pointer zip — no element ever needs to be compared more than once per level.',
          hint: 'What did each child call return before this merge runs?',
        }
      : undefined;

    const mergeMilestone = !firstMergeMilestoneUsed ? 'First Merge Complete' : undefined;
    if (mergeMilestone) firstMergeMilestoneUsed = true;

    push(
      7,
      `Merge [${l}] + [${r}] → [${merged}]`,
      'merge',
      'merge',
      id,
      currentStack,
      { left: JSON.stringify(l), right: JSON.stringify(r), merged: JSON.stringify(merged) },
      { condition: 'merge left and right subtrees', result: true },
      'swap',
      !!mergeMilestone,
      mergeMilestone,
      mergeCheckpoint
    );
    if (mergeCheckpoint) mergeCheckpointAdded = true;

    nodes[idx].arr = merged;
    nodes[idx].status = 'merged';
    push(
      7,
      `Merged result: [${merged}] at depth ${depth}`,
      'merged',
      'merged',
      id,
      currentStack,
      { depth, result: JSON.stringify(merged) },
      { condition: `depth ${depth} subarray sorted`, result: true },
      'pop',
      false,
      undefined,
      undefined
    );

    return idx;
  }

  push(
    1,
    'Begin Mergesort Recursion Tree' + (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
    'init',
    'init',
    undefined,
    ['mergesortRecursionTree()'],
    { input: JSON.stringify(array) },
    { condition: 'start', result: true },
    'step'
  );
  mergesort([...array], 0);
  push(7, 'Mergesort complete — all frames resolved', 'complete', 'complete', undefined, ['mergesortRecursionTree()'], { sortedResult: JSON.stringify(nodes[0]?.arr ?? []) }, { condition: 'complete', result: true }, 'finish', true, 'Complete');

  const total = frames.length;
  frames.forEach((f, i) => { f.stepIndex = i; f.totalSteps = total; });
  return frames;
}

/* ─── render ─── */
function renderStage(frame: ExecutionFrame<MRTState>): React.ReactNode {
  const { nodes, message, activeNodeId } = frame.state;
  if (nodes.length === 0) {
    return React.createElement('div', {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' },
    }, message);
  }

  // layout via BFS from root (idx 0)
  interface LN { idx: number; x: number; y: number }
  const layout: LN[] = [];
  const q: { idx: number; depth: number; left: number; right: number }[] = [
    { idx: 0, depth: 0, left: 0, right: 900 },
  ];
  while (q.length > 0) {
    const { idx, depth, left, right } = q.shift()!;
    const x = (left + right) / 2;
    const y = 30 + depth * 80;
    layout.push({ idx, x, y });
    const nd = nodes[idx];
    if (nd.left !== undefined) {
      const mid = (left + right) / 2;
      q.push({ idx: nd.left, depth: depth + 1, left, right: mid });
    }
    if (nd.right !== undefined) {
      const mid = (left + right) / 2;
      q.push({ idx: nd.right, depth: depth + 1, left: mid, right });
    }
  }

  const lMap = new Map<number, LN>();
  layout.forEach(l => lMap.set(l.idx, l));

  const edges: React.ReactNode[] = [];
  const boxes: React.ReactNode[] = [];

  layout.forEach(l => {
    const nd = nodes[l.idx];
    const isActive = nd.id === activeNodeId;
    const bg = isActive
      ? (nd.status === 'merging' ? '#f59e0b' : '#3b82f6')
      : nd.status === 'merged' ? '#10b981' : '#334155';
    const w = Math.max(50, nd.arr.length * 28 + 16);

    boxes.push(
      React.createElement('g', { key: `n-${l.idx}` },
        React.createElement('rect', {
          x: l.x - w / 2, y: l.y - 16, width: w, height: 32, rx: 6,
          fill: bg, stroke: isActive ? '#e2e8f0' : '#475569', strokeWidth: isActive ? 2 : 1,
        }),
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
            key: `e-${l.idx}-${child}`, x1: l.x, y1: l.y + 16, x2: cl.x, y2: cl.y - 16,
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
export const mergesortRecursionTreeModule: AlgorithmModule<MRTInput, MRTState> = {
  id: 'mergesort-recursion-tree',
  title: 'Mergesort Recursion Call Tree',
  category: 'sorting',
  difficulty: 'Intermediate',
  relatedModules: [
    { id: 'recursion-trees', label: 'Recursion Trees & Memoisation' },
    { id: 'quicksort-partition-tree', label: 'Quicksort Partition Tree' },
    { id: 'mergesort', label: 'Mergesort' },
  ],
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Always O(N log N) — array split evenly',
  },
  theory: {
    overview: 'Visualizes the recursive call tree of mergesort. Each node represents a recursive call frame, showing the subarray being processed. The tree splits top-down and merges bottom-up.',
    whyItWorks: 'Mergesort divides the array into halves recursively (log N depth), then merges sorted halves back up. The call tree makes the O(N log N) structure visible: N work at each of log N levels.',
    invariant: 'At each merge step, both left and right child subarrays are already sorted before merging.',
    pitfalls: ['Tree depth is always ceil(log₂ N)', 'Total nodes in the tree: 2N − 1', 'Stack depth equals tree depth — can stack-overflow on huge inputs without iterative conversion'],
  },
  codeSnippets: {
    pseudocode: `function mergesort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) / 2
    left = mergesort(arr[0..mid])
    right = mergesort(arr[mid..end])
    return merge(left, right)`,
    python: `def mergesort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = mergesort(arr[:mid])
    right = mergesort(arr[mid:])
    return merge(left, right)`,
    typescript: `function mergesort(arr: number[]): number[] {
  if (arr.length <= 1) {
    return arr; }
  const mid = Math.floor(arr.length / 2);
  const left = mergesort(arr.slice(0, mid));
  const right = mergesort(arr.slice(mid));
  return merge(left, right); }`,
    cpp: `vector<int> mergesort(vector<int> arr) {
  if (arr.size() <= 1) {
    return arr; }
  int mid = arr.size() / 2;
  auto left = mergesort({arr.begin(), arr.begin()+mid});
  auto right = mergesort({arr.begin()+mid, arr.end()});
  return merge(left, right); }`,
    java: `int[] mergesort(int[] arr) {
  if (arr.length <= 1) {
    return arr; }
  int mid = arr.length / 2;
  int[] left = mergesort(Arrays.copyOfRange(arr, 0, mid));
  int[] right = mergesort(Arrays.copyOfRange(arr, mid, arr.length));
  return merge(left, right); }`,
  },

  presets: [
    { id: 'small', label: 'Small (4 elements)', description: 'Short array to see basic tree', data: { array: [38, 27, 43, 3] } },
    { id: 'medium', label: 'Medium (8 elements)', description: 'Full binary recursion tree depth 3', data: { array: [38, 27, 43, 3, 9, 82, 10, 45] } },
    { id: 'reversed', label: 'Reversed (6 elements)', description: 'Worst-case ordered input', data: { array: [6, 5, 4, 3, 2, 1] } },
  ],
  defaultInput: { array: [38, 27, 43, 3, 9, 82, 10, 45] },
  generateTimeline,
  renderStage,
};
