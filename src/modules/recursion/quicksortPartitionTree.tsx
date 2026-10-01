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
function generateTimeline(input: QPTInput): ExecutionFrame<QPTState>[] {
  const frames: ExecutionFrame<QPTState>[] = [];
  const nodes: PTreeNode[] = [];
  let nextId = 0;
  let step = 0;

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

  function quicksort(arr: number[], depth: number, stack: string[] = []): number {
    const id = nextId++;
    const idx = nodes.length;
    nodes.push({ id, arr: [...arr], depth, status: 'pending' });
    const currentStack = [...stack, `quicksort([${arr}], d=${depth})`];

    push(
      1,
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
      push(
        2,
        `Base case: [${arr}]`,
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

    // partition with last element as pivot
    const pivot = arr[arr.length - 1];
    nodes[idx].pivot = pivot;
    nodes[idx].status = 'partitioning';
    push(
      3,
      `Pivot = ${pivot} from [${arr}]`,
      'choose-pivot',
      'partition',
      id,
      currentStack,
      { pivot, arr: JSON.stringify(arr) },
      { condition: `pivot = arr[${arr.length - 1}] (${pivot})`, result: true },
      'compare'
    );

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
    push(
      8,
      `Sorted: [${sorted}] at depth ${depth}`,
      'sorted',
      'sorted',
      id,
      currentStack,
      { depth, pivot, sorted: JSON.stringify(sorted) },
      { condition: `sub-tree sorted around pivot ${pivot}`, result: true },
      'pop',
      depth === 0
    );

    return idx;
  }

  push(0, 'Begin Quicksort Partition Tree', 'init', 'init', undefined, ['quicksortPartitionTree()'], { input: JSON.stringify(input.array) }, { condition: 'start', result: true }, 'step');
  quicksort([...input.array], 0);
  push(10, 'Quicksort complete — partition tree fully resolved', 'complete', 'complete', undefined, ['quicksortPartitionTree()'], { sortedResult: JSON.stringify(nodes[0]?.arr ?? []) }, { condition: 'complete', result: true }, 'finish', true);

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
  if len(arr) <= 1: return arr
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
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const less = arr.slice(0, -1).filter(x => x <= pivot);
  const greater = arr.slice(0, -1).filter(x => x > pivot);
  return [...quicksort(less), pivot, ...quicksort(greater)];
}`,
    cpp: `vector<int> quicksort(vector<int> arr) {
  if (arr.size() <= 1) return arr;
  int pivot = arr.back();
  vector<int> less, greater;
  for (int i = 0; i < arr.size()-1; i++)
    (arr[i] <= pivot ? less : greater).push_back(arr[i]);
  auto l = quicksort(less);
  auto r = quicksort(greater);
  l.push_back(pivot);
  l.insert(l.end(), r.begin(), r.end());
  return l;
}`,
    java: `int[] quicksort(int[] arr) {
  if (arr.length <= 1) return arr;
  int pivot = arr[arr.length - 1];
  List<Integer> less = new ArrayList<>(), greater = new ArrayList<>();
  for (int i = 0; i < arr.length - 1; i++)
    (arr[i] <= pivot ? less : greater).add(arr[i]);
  int[] l = quicksort(toArray(less));
  int[] r = quicksort(toArray(greater));
  // concatenate l + pivot + r
  return concat(l, pivot, r);
}`,
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
