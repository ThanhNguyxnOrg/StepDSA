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
function generateTimeline(input: MRTInput): ExecutionFrame<MRTState>[] {
  const frames: ExecutionFrame<MRTState>[] = [];
  const nodes: TreeNode[] = [];
  let nextId = 0;
  let step = 0;

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
    isMilestone?: boolean
  ) {
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
      state: { nodes: cloneNodes(nodes), message: explanation, phase, activeNodeId: activeId },
    });
  }

  function mergesort(arr: number[], depth: number, stack: string[] = []): number {
    const id = nextId++;
    const idx = nodes.length;
    nodes.push({ id, arr: [...arr], depth, status: 'pending' });
    const currentStack = [...stack, `mergesort([${arr}], d=${depth})`];

    push(
      1,
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
      push(
        2,
        `Base case: [${arr}] — return`,
        'base',
        'base',
        id,
        currentStack,
        { depth, baseResult: JSON.stringify(arr) },
        { condition: 'arr.length <= 1 (base case)', result: true },
        'pop',
        true
      );
      return idx;
    }

    const mid = Math.floor(arr.length / 2);
    const leftArr = arr.slice(0, mid);
    const rightArr = arr.slice(mid);

    nodes[idx].status = 'splitting';
    push(
      3,
      `Split [${arr}] → [${leftArr}] | [${rightArr}]`,
      'split',
      'split',
      id,
      currentStack,
      { mid, leftArr: JSON.stringify(leftArr), rightArr: JSON.stringify(rightArr) },
      { condition: 'mid = floor(len / 2)', result: true },
      'step'
    );

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

    push(
      6,
      `Merge [${l}] + [${r}] → [${merged}]`,
      'merge',
      'merge',
      id,
      currentStack,
      { left: JSON.stringify(l), right: JSON.stringify(r), merged: JSON.stringify(merged) },
      { condition: 'merge left and right subtrees', result: true },
      'swap'
    );

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
      depth === 0
    );

    return idx;
  }

  push(0, 'Begin Mergesort Recursion Tree', 'init', 'init', undefined, ['mergesortRecursionTree()'], { input: JSON.stringify(input.array) }, { condition: 'start', result: true }, 'step');
  mergesort([...input.array], 0);
  push(9, 'Mergesort complete — all frames resolved', 'complete', 'complete', undefined, ['mergesortRecursionTree()'], { sortedResult: JSON.stringify(nodes[0]?.arr ?? []) }, { condition: 'complete', result: true }, 'finish', true);

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
    pitfalls: ['Tree depth is always ⌈log₂ N⌉', 'Total nodes in the tree: 2N − 1', 'Stack depth equals tree depth — can stack-overflow on huge inputs without iterative conversion'],
  },
  codeSnippets: {
    pseudocode: `function mergesort(arr):
  if len(arr) <= 1: return arr
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
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergesort(arr.slice(0, mid));
  const right = mergesort(arr.slice(mid));
  return merge(left, right);
}`,
    cpp: `vector<int> mergesort(vector<int> arr) {
  if (arr.size() <= 1) return arr;
  int mid = arr.size() / 2;
  auto left = mergesort({arr.begin(), arr.begin()+mid});
  auto right = mergesort({arr.begin()+mid, arr.end()});
  return merge(left, right);
}`,
    java: `int[] mergesort(int[] arr) {
  if (arr.length <= 1) return arr;
  int mid = arr.length / 2;
  int[] left = mergesort(Arrays.copyOfRange(arr, 0, mid));
  int[] right = mergesort(Arrays.copyOfRange(arr, mid, arr.length));
  return merge(left, right);
}`,
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
