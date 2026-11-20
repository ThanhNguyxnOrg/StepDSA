import React from 'react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

/* ─── state ─── */
interface DecisionNode {
  id: number;
  depth: number;
  included: number[];
  sum: number;
  status: 'exploring' | 'pruned' | 'solution' | 'backtrack' | 'pending';
  label: string;
  left?: number;  // include branch
  right?: number; // exclude branch
}

interface BDTState {
  nodes: DecisionNode[];
  message: string;
  phase: string;
  activeNodeId?: number;
  target: number;
  items: number[];
}

type BDTInput = { items: number[]; target: number };

function cloneNodes(ns: DecisionNode[]): DecisionNode[] {
  return ns.map(n => ({ ...n, included: [...n.included] }));
}

/* ─── timeline ─── */
const MAX_LEN = 6; // 2^6 = 64 decision nodes max — keeps the tree watchable
const MAX_ABS = 99;
const DEFAULT_INPUT: BDTInput = { items: [2, 3, 5, 7], target: 7 };

interface NormalisedInput {
  items: number[];
  target: number;
  notes: string[];
}

/**
 * Subset-sum pruning (sum > target) is only sound with non-negative items:
 * negative values are dropped, items are clamped to ±MAX_ABS, and the input is
 * truncated to MAX_LEN items so the decision tree stays watchable. Every
 * adjustment is reported as a note so the INIT frame can state it honestly.
 * An empty item list is a valid run: only the empty subset exists.
 */
function normalise(input: BDTInput | undefined): NormalisedInput {
  const notes: string[] = [];
  const raw = input && typeof input === 'object' ? input : DEFAULT_INPUT;
  const rawItems = Array.isArray(raw.items) ? raw.items : DEFAULT_INPUT.items;

  const usable = rawItems.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value) && Math.round(value) >= 0
  );

  if (rawItems.length > 0 && usable.length === 0) {
    notes.push('no non-negative items in the input, so the default items are used');
    return { items: [...DEFAULT_INPUT.items], target: Math.round(raw.target) || DEFAULT_INPUT.target, notes };
  }
  if (usable.length < rawItems.length) {
    notes.push(`${rawItems.length - usable.length} negative or non-numeric item(s) dropped (pruning assumes non-negative items)`);
  }

  const clamped = usable.map((value) => {
    const rounded = Math.min(MAX_ABS, Math.round(value));
    if (rounded !== Math.round(value)) {
      notes.push(`item ${Math.round(value)} clamped to ${rounded} (max ${MAX_ABS})`);
    }
    return rounded;
  });

  let items = clamped;
  if (items.length > MAX_LEN) {
    notes.push(`${items.length} items truncated to ${MAX_LEN} so the decision tree stays watchable`);
    items = items.slice(0, MAX_LEN);
  }

  const target = typeof raw.target === 'number' && Number.isFinite(raw.target)
    ? Math.round(raw.target)
    : DEFAULT_INPUT.target;

  return { items, target, notes };
}

function generateTimeline(input: BDTInput): ExecutionFrame<BDTState>[] {
  const { items, target, notes } = normalise(input);
  const frames: ExecutionFrame<BDTState>[] = [];
  const nodes: DecisionNode[] = [];
  let nextId = 0;
  let step = 0;

  let pruneCheckpointAdded = false;
  let branchCheckpointAdded = false;
  let firstSolutionMilestoneUsed = false;
  let firstPruneMilestoneUsed = false;

  function push(
    codeLine: number,
    explanation: string,
    action: string,
    phase: string,
    activeId: number | undefined,
    callStack: string[] = ['backtrackingDecisionTree()'],
    variables: Record<string, string | number | boolean | null> = {},
    conditionEval?: { condition: string; result: boolean },
    soundCue?: 'step' | 'swap' | 'compare' | 'pop' | 'fail' | 'finish',
    isMilestone?: boolean,
    checkpoint?: ExecutionFrame<BDTState>['checkpoint'],
    milestoneTitle?: string
  ) {
    const pedagogyByAction: Record<string, { what: string; why: string; whatNext: string }> = {
      init: {
        what: `The full item list [${items.join(', ')}] must be searched for a subset summing exactly to ${target}.`,
        why: 'Backtracking explores include/exclude choices one item at a time; the running sum makes pruning sound only because items are non-negative.',
        whatNext: `Start at idx = 0 with an empty included list and sum = 0.`,
      },
      explore: {
        what: `A new node opens: included = [${variables.included}], running sum = ${variables.sum}.`,
        why: 'Each node first checks the goal test — matching the target ends this branch successfully before any further choice.',
        whatNext: 'If the sum does not match, check the prune guard, then choose include or exclude.',
      },
      solution: {
        what: `This branch reached a valid subset: [${variables.solution}].`,
        why: 'The running sum equals the target exactly, so the node is a genuine solution — no further recursion is needed here.',
        whatNext: 'Return to the parent and explore the sibling branch.',
      },
      prune: {
        what: 'This branch is cut: it can never reach the target.',
        why: 'With non-negative items, a running sum above the target can only grow, so every descendant of this node is guaranteed to fail.',
        whatNext: 'Return to the parent; the sibling branch may still succeed.',
      },
      include: {
        what: `Branch LEFT: include the current item, then recurse one level deeper.`,
        why: 'Depth-first search must try the item present before trying the item absent — this ordering is what makes the tree complete.',
        whatNext: 'Recurse with the enlarged sum, then backtrack (restore) before excluding.',
      },
      restore: {
        what: 'Backtrack: remove the item just added before trying the exclude branch.',
        why: 'Restoring the parent state is what makes backtracking correct — each branch must see the same included list as its parent had.',
        whatNext: 'Now try the exclude branch with the restored state.',
      },
      exclude: {
        what: `Branch RIGHT: exclude the current item and recurse with the same sum.`,
        why: 'Excluding is the complementary decision; both must be tried for the search to be exhaustive.',
        whatNext: 'Return to the parent after both children complete.',
      },
      complete: {
        what: 'Every node has been visited: the whole decision tree is explored.',
        why: 'Depth-first include/exclude enumeration plus sound pruning guarantees no solution was skipped.',
        whatNext: 'Review the solution nodes (green) versus pruned nodes (red) in the tree.',
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
      pedagogy: pedagogyByAction[action] ?? pedagogyByAction.explore,
      ...(checkpoint ? { checkpoint } : {}),
      state: { nodes: cloneNodes(nodes), message: explanation, phase, activeNodeId: activeId, target, items },
    });
  }

  function backtrack(idx: number, included: number[], sum: number, depth: number, stack: string[] = []): number {
    const id = nextId++;
    const nodeIdx = nodes.length;
    const label = `Σ=${sum}`;
    nodes.push({ id, depth, included: [...included], sum, status: 'exploring', label });
    const currentStack = [...stack, `backtrack(idx=${idx}, sum=${sum})`];

    push(
      2,
      `Explore: included=[${included}], sum=${sum}, depth=${depth}`,
      'explore',
      'explore',
      id,
      currentStack,
      { idx, sum, target, depth, included: JSON.stringify(included) },
      { condition: `sum (${sum}) == target (${target})`, result: sum === target },
      'step'
    );

    if (sum === target) {
      nodes[nodeIdx].status = 'solution';
      const solutionMilestone = !firstSolutionMilestoneUsed ? 'First Solution Found' : undefined;
      if (solutionMilestone) firstSolutionMilestoneUsed = true;
      push(
        3,
        `✓ Solution found! [${included}] = ${target}`,
        'solution',
        'solution',
        id,
        currentStack,
        { sum, target, solution: JSON.stringify(included) },
        { condition: 'sum === target (match found)', result: true },
        'pop',
        !!solutionMilestone,
        undefined,
        solutionMilestone
      );
      return nodeIdx;
    }

    if (sum > target || idx >= items.length) {
      nodes[nodeIdx].status = 'pruned';
      const pruneMilestone = !firstPruneMilestoneUsed ? 'First Prune' : undefined;
      if (pruneMilestone) firstPruneMilestoneUsed = true;

      const pruneCheckpoint: ExecutionFrame<BDTState>['checkpoint'] | undefined = !pruneCheckpointAdded
        ? {
            id: 'backtracking-prune-rule',
            question: `This node has sum = ${sum} against target ${target}. Why is it pruned?`,
            options: [
              'The item list is exhausted — no more choices',
              'A running sum above the target can only grow, so every descendant fails',
              'Pruning is random and depends on luck',
            ],
            correctIndex: 1,
            explanation:
              'Because items are non-negative, adding more items can never decrease the sum — once it passes the target, the whole subtree is dead.',
            hint: 'Could a later include ever bring the sum back down?',
          }
        : undefined;

      push(
        5,
        sum > target ? `✗ Pruned: sum ${sum} > target ${target}` : `✗ No more items at idx ${idx}`,
        'prune',
        'prune',
        id,
        currentStack,
        { sum, target, idx, limit: items.length },
        { condition: sum > target ? 'sum > target (overflow)' : 'idx >= items.length (exhausted)', result: false },
        'fail',
        !!pruneMilestone,
        pruneCheckpoint,
        pruneMilestone
      );
      if (pruneCheckpoint) pruneCheckpointAdded = true;
      return nodeIdx;
    }

    // include items[idx]
    const nextIncluded = [...included, items[idx]];
    const includeCheckpoint: ExecutionFrame<BDTState>['checkpoint'] | undefined = !branchCheckpointAdded
      ? {
          id: 'backtracking-include-vs-exclude',
          question: `At idx = ${idx} (item ${items[idx]}), which branch does the search try FIRST?`,
          options: [
            'Exclude — skip the item, then include later',
            'Include — take the item, then exclude on the way back',
          ],
          correctIndex: 1,
          explanation: `Depth-first search takes the item first (left branch), then backtracks and excludes it. That ordering is what makes the tree complete.`,
          hint: 'Which branch is the LEFT child in this tree?',
        }
      : undefined;

    push(
      8,
      `Include ${items[idx]} → sum=${sum + items[idx]}`,
      'include',
      'explore',
      id,
      currentStack,
      { nextItem: items[idx], projectedSum: sum + items[idx] },
      { condition: 'try branch including items[idx]', result: true },
      'swap',
      undefined,
      includeCheckpoint
    );
    if (includeCheckpoint) branchCheckpointAdded = true;
    const leftIdx = backtrack(idx + 1, nextIncluded, sum + items[idx], depth + 1, currentStack);
    nodes[nodeIdx].left = leftIdx;

    // restore the parent state before excluding — the essence of backtracking
    push(
      10,
      `Backtrack: remove ${items[idx]} from included (restore sum = ${sum})`,
      'restore',
      'backtrack',
      id,
      currentStack,
      { restoredItem: items[idx], restoredSum: sum },
      { condition: 'restore parent state before excluding', result: true },
      'step'
    );

    // exclude items[idx]
    nodes[nodeIdx].status = 'backtrack';
    push(
      12,
      `Exclude ${items[idx]}: recurse with sum = ${sum} unchanged`,
      'exclude',
      'backtrack',
      id,
      currentStack,
      { excludedItem: items[idx], sum },
      { condition: 'try branch excluding items[idx]', result: true },
      'step'
    );
    const rightIdx = backtrack(idx + 1, included, sum, depth + 1, currentStack);
    nodes[nodeIdx].right = rightIdx;

    // final status
    const leftSol = nodes[leftIdx].status === 'solution';
    const rightSol = nodes[rightIdx].status === 'solution';
    nodes[nodeIdx].status = leftSol || rightSol ? 'solution' : 'backtrack';

    return nodeIdx;
  }

  push(
    1,
    `Backtracking: find subsets of [${items.join(', ')}] that sum to ${target}` +
      (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
    'init',
    'init',
    undefined,
    ['backtrackingDecisionTree()'],
    { items: JSON.stringify(items), target },
    { condition: 'start', result: true },
    'step'
  );
  backtrack(0, [], 0, 0);
  push(12, 'State-space exploration complete', 'complete', 'complete', undefined, ['backtrackingDecisionTree()'], { target }, { condition: 'complete', result: true }, 'finish', true, undefined, 'Complete Exploration');

  const total = frames.length;
  frames.forEach((f, i) => { f.stepIndex = i; f.totalSteps = total; });
  return frames;
}

/* ─── render ─── */
function renderStage(frame: ExecutionFrame<BDTState>): React.ReactNode {
  const { nodes, message, activeNodeId, target } = frame.state;
  if (nodes.length === 0) {
    return React.createElement('div', {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' },
    }, message);
  }

  interface LN { idx: number; x: number; y: number }
  const layout: LN[] = [];
  const q: { idx: number; depth: number; left: number; right: number }[] = [
    { idx: 0, depth: 0, left: 0, right: 950 },
  ];
  while (q.length > 0) {
    const { idx, depth, left, right } = q.shift()!;
    const x = (left + right) / 2;
    const y = 30 + depth * 75;
    layout.push({ idx, x, y });
    const nd = nodes[idx];
    const mid = (left + right) / 2;
    if (nd.left !== undefined) q.push({ idx: nd.left, depth: depth + 1, left, right: mid });
    if (nd.right !== undefined) q.push({ idx: nd.right, depth: depth + 1, left: mid, right });
  }

  const lMap = new Map<number, LN>();
  layout.forEach(l => lMap.set(l.idx, l));

  const edges: React.ReactNode[] = [];
  const circles: React.ReactNode[] = [];

  const colorMap: Record<string, string> = {
    exploring: '#3b82f6',
    pruned: '#ef4444',
    solution: '#10b981',
    backtrack: '#6b7280',
    pending: '#334155',
  };

  layout.forEach(l => {
    const nd = nodes[l.idx];
    const isActive = nd.id === activeNodeId;
    const fill = colorMap[nd.status] || '#334155';
    const r = 20;

    circles.push(
      React.createElement('g', { key: `n-${l.idx}` },
        React.createElement('circle', {
          cx: l.x, cy: l.y, r, fill, stroke: isActive ? '#fbbf24' : '#475569',
          strokeWidth: isActive ? 2.5 : 1,
        }),
        React.createElement('text', {
          x: l.x, y: l.y + 4, textAnchor: 'middle', fill: '#f1f5f9', fontSize: 10,
          fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
        }, nd.label),
      ),
    );

    // edge labels
    if (nd.left !== undefined) {
      const cl = lMap.get(nd.left);
      if (cl) {
        edges.push(
          React.createElement('line', {
            key: `e-${l.idx}-l`, x1: l.x - 8, y1: l.y + r, x2: cl.x + 8, y2: cl.y - r,
            stroke: '#22c55e', strokeWidth: 1.5, strokeDasharray: '4,2',
          }),
          React.createElement('text', {
            key: `el-${l.idx}`, x: (l.x + cl.x) / 2 - 12, y: (l.y + cl.y) / 2 - 4,
            fill: '#22c55e', fontSize: 9, fontWeight: 600,
          }, '✓'),
        );
      }
    }
    if (nd.right !== undefined) {
      const cl = lMap.get(nd.right);
      if (cl) {
        edges.push(
          React.createElement('line', {
            key: `e-${l.idx}-r`, x1: l.x + 8, y1: l.y + r, x2: cl.x - 8, y2: cl.y - r,
            stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '4,2',
          }),
          React.createElement('text', {
            key: `er-${l.idx}`, x: (l.x + cl.x) / 2 + 8, y: (l.y + cl.y) / 2 - 4,
            fill: '#ef4444', fontSize: 9, fontWeight: 600,
          }, '✗'),
        );
      }
    }
  });

  return React.createElement('div', { style: { width: '100%', height: '100%', position: 'relative' } },
    React.createElement('div', {
      style: { position: 'absolute', top: 8, right: 16, color: '#94a3b8', fontSize: 12, fontFamily: 'Inter, sans-serif' },
    }, `Target: ${target}`),
    React.createElement('svg', { width: '100%', height: '100%', viewBox: '0 0 950 500', preserveAspectRatio: 'xMidYMid meet' },
      ...edges, ...circles,
    ),
    React.createElement('div', {
      style: { position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', color: '#94a3b8', fontSize: 12 },
    },
      React.createElement('span', { style: { color: '#22c55e' } }, '● Solution '),
      React.createElement('span', { style: { color: '#ef4444' } }, '● Pruned '),
      React.createElement('span', { style: { color: '#3b82f6' } }, '● Exploring '),
      React.createElement('span', { style: { color: '#6b7280' } }, '● Backtrack'),
    ),
    React.createElement('div', {
      style: { position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center', color: '#cbd5e1', fontSize: 13, fontFamily: 'Inter, sans-serif' },
    }, message),
  );
}

/* ─── module ─── */
export const backtrackingDecisionTreeModule: AlgorithmModule<BDTInput, BDTState> = {
  id: 'backtracking-decision-tree',
  title: 'Backtracking State-Space Decision Tree',
  category: 'sorting',
  difficulty: 'Advanced',
  relatedModules: [
    { id: 'recursion-trees', label: 'Recursion Trees & Memoisation' },
    { id: 'n-queens', label: 'N-Queens' },
    { id: 'word-search', label: 'Word Search' },
  ],
  complexity: {
    timeBest: 'O(2^N)',
    timeAverage: 'O(2^N)',
    timeWorst: 'O(2^N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'No pruning possible — all branches explored',
  },
  theory: {
    overview: 'Visualizes the complete decision tree of a backtracking algorithm (subset sum). Each node represents a decision state. Left branches include an item, right branches exclude it. Pruned branches are shown in red.',
    whyItWorks: 'Backtracking systematically explores all possible decisions (include/exclude) and prunes branches where the partial solution already exceeds the target, avoiding exponential blowup in practice.',
    invariant: 'At each node, the running sum equals the sum of all included items so far. Pruning occurs when sum > target.',
    pitfalls: ['Without pruning, tree has 2^N leaves', 'Pruning effectiveness depends on item ordering', 'Green ✓ branches include the item, red ✗ branches exclude'],
  },
  codeSnippets: {
    pseudocode: `function backtrack(idx, included, sum):
    if sum == target:
        record included as a solution
        return
    if sum > target or idx >= N:
        return  (prune)
    include items[idx]:
        included = included + [items[idx]]
        backtrack(idx + 1, included, sum + items[idx])
        remove items[idx] from included
    exclude items[idx]:
        backtrack(idx + 1, included, sum)`,
    python: `def backtrack(idx, included, current_sum):
    if current_sum == target:
        solutions.append(included[:])
        return
    if current_sum > target or idx >= len(items):
        return  # prune
    # include items[idx]
    included.append(items[idx])
    backtrack(idx + 1, included, current_sum + items[idx])
    included.pop()
    # exclude items[idx]
    backtrack(idx + 1, included, current_sum)`,
    typescript: `function backtrack(idx: number, included: number[], sum: number): void {
  if (sum === target) {
    solutions.push([...included]);
    return; }
  if (sum > target || idx >= items.length) {
    return; }
  // include items[idx]
  included.push(items[idx]);
  backtrack(idx + 1, included, sum + items[idx]);
  included.pop();
  // exclude items[idx]
  backtrack(idx + 1, included, sum); }`,
    cpp: `void backtrack(int idx, vector<int>& included, int sum) {
  if (sum == target) {
    solutions.push_back(included);
    return; }
  if (sum > target || idx >= (int)items.size()) {
    return; }
  // include items[idx]
  included.push_back(items[idx]);
  backtrack(idx + 1, included, sum + items[idx]);
  included.pop_back();
  // exclude items[idx]
  backtrack(idx + 1, included, sum); }`,
    java: `void backtrack(int idx, List<Integer> included, int sum) {
  if (sum == target) {
    solutions.add(new ArrayList<>(included));
    return; }
  if (sum > target || idx >= items.length) {
    return; }
  // include items[idx]
  included.add(items[idx]);
  backtrack(idx + 1, included, sum + items[idx]);
  included.remove(included.size() - 1);
  // exclude items[idx]
  backtrack(idx + 1, included, sum); }`,
  },

  presets: [
    { id: 'small', label: 'Small (4 items, target 7)', description: 'Small set for clear tree', data: { items: [2, 3, 5, 7], target: 7 } },
    { id: 'medium', label: 'Medium (5 items, target 10)', description: 'More branches and pruning', data: { items: [3, 4, 5, 2, 8], target: 10 } },
    { id: 'prune-heavy', label: 'Prune-Heavy (4 items, target 5)', description: 'Many branches get pruned early', data: { items: [6, 3, 2, 8], target: 5 } },
  ],
  defaultInput: { items: [2, 3, 5, 7], target: 7 },
  generateTimeline,
  renderStage,
};
