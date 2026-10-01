import React from 'react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

/* ─── state ─── */
interface TwoThreeNode {
  keys: number[];
  children: number[]; // indices into nodes[]
  id: number;
  highlight?: 'active' | 'split' | 'done';
}

interface TTState {
  nodes: TwoThreeNode[];
  rootIdx: number;
  message: string;
  phase: string;
  insertedKey?: number;
}

type TTInput = { keys: number[] };

/* ─── helpers ─── */
function cloneNodes(ns: TwoThreeNode[]): TwoThreeNode[] {
  return ns.map(n => ({ ...n, keys: [...n.keys], children: [...n.children] }));
}

function snap(
  nodes: TwoThreeNode[], rootIdx: number, step: number, total: number,
  codeLine: number, explanation: string, action: string, phase: string,
  insertedKey?: number,
): ExecutionFrame<TTState> {
  const isMilestone = action === 'init' || action === 'complete' || action === 'split' || action === 'create-root';
  return {
    stepIndex: step,
    totalSteps: total,
    codeLine,
    explanation,
    action,
    isMilestone,
    milestoneTitle: action === 'init' ? '2-3 Tree Initialized' : action === 'complete' ? '2-3 Tree Complete' : action === 'split' ? 'Node Split' : action === 'create-root' ? 'Root Created' : undefined,
    soundCue: { type: action === 'init' ? 'start' : action === 'complete' ? 'complete' : action === 'split' ? 'swap' : 'step' },
    variables: { rootIdx, key: insertedKey ?? null, totalNodes: nodes.length, phase },
    callStack: [{ name: 'twoThreeTree.step', params: { phase, key: insertedKey ?? null }, line: codeLine, isCurrent: true }],
    conditionEval: { expr: `rootIdx >= 0`, result: rootIdx >= 0 },
    state: { nodes: cloneNodes(nodes), rootIdx, message: explanation, phase, insertedKey },
  };
}

/* ─── timeline ─── */
function generateTimeline(input: TTInput): ExecutionFrame<TTState>[] {
  const frames: ExecutionFrame<TTState>[] = [];
  let nodes: TwoThreeNode[] = [];
  let rootIdx = -1;
  let nextId = 0;
  let step = 0;

  function makeNode(keys: number[], children: number[] = []): number {
    const id = nextId++;
    nodes.push({ keys, children, id });
    return nodes.length - 1;
  }

  function clearHighlights() {
    nodes.forEach(n => (n.highlight = undefined));
  }

  function insertKey(key: number) {
    clearHighlights();
    if (rootIdx === -1) {
      rootIdx = makeNode([key]);
      nodes[rootIdx].highlight = 'done';
      frames.push(snap(nodes, rootIdx, step++, 0, 1,
        `Create root with key ${key}`, 'create-root', 'insert', key));
      return;
    }

    // find leaf path
    const path: number[] = [];
    let cur = rootIdx;
    while (nodes[cur].children.length > 0) {
      nodes[cur].highlight = 'active';
      path.push(cur);
      frames.push(snap(nodes, rootIdx, step++, 0, 3,
        `Traverse node [${nodes[cur].keys}] looking for position of ${key}`, 'traverse', 'search', key));
      const n = nodes[cur];
      if (key < n.keys[0]) cur = n.children[0];
      else if (n.keys.length === 1 || key < n.keys[1]) cur = n.children[1];
      else cur = n.children[2];
      clearHighlights();
    }
    path.push(cur);
    nodes[cur].highlight = 'active';
    frames.push(snap(nodes, rootIdx, step++, 0, 5,
      `Reached leaf [${nodes[cur].keys}], insert ${key}`, 'reach-leaf', 'insert', key));

    // insert into leaf
    nodes[cur].keys.push(key);
    nodes[cur].keys.sort((a, b) => a - b);

    if (nodes[cur].keys.length <= 2) {
      nodes[cur].highlight = 'done';
      frames.push(snap(nodes, rootIdx, step++, 0, 6,
        `Key ${key} fits in node → [${nodes[cur].keys}]`, 'insert-fit', 'done', key));
      return;
    }

    // need to split upward
    let splitIdx = cur;
    while (splitIdx !== -1) {
      const nd = nodes[splitIdx];
      if (nd.keys.length <= 2) break;

      const midKey = nd.keys[1];
      const leftKeys = [nd.keys[0]];
      const rightKeys = [nd.keys[2]];

      nd.highlight = 'split';
      frames.push(snap(nodes, rootIdx, step++, 0, 8,
        `Node [${nd.keys}] overflows → split, push ${midKey} up`, 'split', 'split', key));

      const leftChildren = nd.children.length > 0 ? nd.children.slice(0, 2) : [];
      const rightChildren = nd.children.length > 0 ? nd.children.slice(2, 4) : [];

      nd.keys = leftKeys;
      nd.children = leftChildren;
      const rightIdx = makeNode(rightKeys, rightChildren);

      // find parent
      const parentPath = path.slice(0, path.indexOf(splitIdx));
      const parentIdx = parentPath.length > 0 ? parentPath[parentPath.length - 1] : -1;

      if (parentIdx === -1) {
        // split root
        const newRoot = makeNode([midKey], [splitIdx, rightIdx]);
        rootIdx = newRoot;
        nodes[newRoot].highlight = 'done';
        frames.push(snap(nodes, rootIdx, step++, 0, 10,
          `New root created with key ${midKey}`, 'new-root', 'done', key));
        break;
      } else {
        // push midKey into parent
        const parent = nodes[parentIdx];
        parent.keys.push(midKey);
        parent.keys.sort((a, b) => a - b);
        const childPos = parent.children.indexOf(splitIdx);
        parent.children.splice(childPos + 1, 0, rightIdx);
        parent.highlight = 'active';
        frames.push(snap(nodes, rootIdx, step++, 0, 12,
          `Push ${midKey} into parent [${parent.keys}]`, 'push-up', 'split', key));
        splitIdx = parentIdx;
      }
    }
    clearHighlights();
  }

  frames.push(snap(nodes, rootIdx, step++, 0, 0,
    'Begin 2-3 Tree construction', 'init', 'init'));

  for (const key of input.keys) {
    insertKey(key);
  }

  clearHighlights();
  frames.push(snap(nodes, rootIdx, step++, 0, 14,
    '2-3 Tree construction complete', 'complete', 'complete'));

  const total = frames.length;
  frames.forEach((f, i) => { f.stepIndex = i; f.totalSteps = total; });
  return frames;
}

/* ─── render ─── */
function renderStage(frame: ExecutionFrame<TTState>): React.ReactNode {
  const { nodes, rootIdx, message } = frame.state;
  if (rootIdx === -1 || nodes.length === 0) {
    return React.createElement('div', {
      style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' },
    }, 'Empty 2-3 Tree');
  }

  // BFS for layout
  interface LayoutNode { idx: number; x: number; y: number; depth: number; }
  const layout: LayoutNode[] = [];
  const queue: { idx: number; depth: number; left: number; right: number }[] = [
    { idx: rootIdx, depth: 0, left: 0, right: 800 },
  ];
  while (queue.length > 0) {
    const { idx, depth, left, right } = queue.shift()!;
    const x = (left + right) / 2;
    const y = 40 + depth * 90;
    layout.push({ idx, x, y, depth });
    const nd = nodes[idx];
    if (nd.children.length > 0) {
      const w = (right - left) / nd.children.length;
      nd.children.forEach((c, i) => {
        queue.push({ idx: c, depth: depth + 1, left: left + i * w, right: left + (i + 1) * w });
      });
    }
  }

  const layoutMap = new Map<number, LayoutNode>();
  layout.forEach(l => layoutMap.set(l.idx, l));

  const edges: React.ReactNode[] = [];
  const rects: React.ReactNode[] = [];

  layout.forEach(l => {
    const nd = nodes[l.idx];
    const bg = nd.highlight === 'active' ? '#3b82f6' : nd.highlight === 'split' ? '#f59e0b' : nd.highlight === 'done' ? '#10b981' : '#334155';
    const w = nd.keys.length === 1 ? 50 : 90;

    rects.push(
      React.createElement('g', { key: `n-${l.idx}` },
        React.createElement('rect', {
          x: l.x - w / 2, y: l.y - 18, width: w, height: 36, rx: 6,
          fill: bg, stroke: '#64748b', strokeWidth: 1.5,
        }),
        ...nd.keys.map((k, ki) =>
          React.createElement('text', {
            key: ki, x: l.x - w / 2 + (ki + 0.5) * (w / nd.keys.length), y: l.y + 5,
            textAnchor: 'middle', fill: '#f1f5f9', fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
          }, String(k)),
        ),
        nd.keys.length === 2 && React.createElement('line', {
          x1: l.x, y1: l.y - 14, x2: l.x, y2: l.y + 14, stroke: '#64748b', strokeWidth: 1, opacity: 0.5,
        }),
      ),
    );

    nd.children.forEach(c => {
      const cl = layoutMap.get(c);
      if (cl) {
        edges.push(
          React.createElement('line', {
            key: `e-${l.idx}-${c}`, x1: l.x, y1: l.y + 18, x2: cl.x, y2: cl.y - 18,
            stroke: '#475569', strokeWidth: 1.5,
          }),
        );
      }
    });
  });

  return React.createElement('div', { style: { width: '100%', height: '100%', position: 'relative' } },
    React.createElement('svg', { width: '100%', height: '100%', viewBox: '0 0 800 500', preserveAspectRatio: 'xMidYMid meet' },
      ...edges, ...rects,
    ),
    React.createElement('div', {
      style: { position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', color: '#94a3b8', fontSize: 13, fontFamily: 'Inter, sans-serif' },
    }, message),
  );
}

/* ─── module ─── */
export const twoThreeTreeModule: AlgorithmModule<TTInput, TTState> = {
  id: 'two-three-tree',
  title: '2-3 Tree (Balanced Multi-Way Search Tree)',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(log N)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(log N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Guaranteed balanced — all leaves at same depth',
  },
  theory: {
    overview: 'A 2-3 tree is a balanced search tree where every internal node has 2 or 3 children and all leaves are at the same depth. 2-nodes contain one key and two children; 3-nodes contain two keys and three children.',
    whyItWorks: 'Insertions that overflow a 3-node into a temporary 4-node trigger a split-and-promote operation that pushes the median key upward, maintaining perfect balance. The tree only grows in height when the root splits.',
    invariant: 'All leaves are at the same depth. Every internal node has 2 or 3 children. Keys within each node are sorted.',
    pitfalls: ['Splitting can cascade all the way to the root', 'More complex than BST but guarantees O(log N) worst case', 'Deletion requires merge/redistribute operations'],
  },
  codeSnippets: {
    pseudocode: `function insert(tree, key):
  leaf = findLeaf(tree, key)
  add key to leaf
  while leaf has 3 keys:     // overflow
    mid = leaf.keys[1]
    split leaf into left, right
    push mid into parent
    leaf = parent
  if root was split:
    create new root with mid`,
    python: `class Node:
    def __init__(self, keys=None, children=None):
        self.keys = keys or []
        self.children = children or []

def insert(root, key):
    if root is None:
        return Node([key])
    leaf, path = find_leaf(root, key)
    leaf.keys.append(key)
    leaf.keys.sort()
    while len(leaf.keys) > 2:
        mid = leaf.keys[1]
        left = Node([leaf.keys[0]], leaf.children[:2])
        right = Node([leaf.keys[2]], leaf.children[2:])
        if not path:
            return Node([mid], [left, right])
        parent = path.pop()
        i = parent.children.index(leaf)
        parent.keys.insert(i, mid)
        parent.children[i:i+1] = [left, right]
        leaf = parent
    return root`,
    typescript: `function insert(root: Node | null, key: number): Node {
  if (!root) return new Node([key]);
  const [leaf, path] = findLeaf(root, key);
  leaf.keys.push(key);
  leaf.keys.sort((a, b) => a - b);
  let current = leaf;
  while (current.keys.length > 2) {
    const mid = current.keys[1];
    const left = new Node([current.keys[0]], current.children.slice(0, 2));
    const right = new Node([current.keys[2]], current.children.slice(2));
    if (path.length === 0) return new Node([mid], [left, right]);
    const parent = path.pop()!;
    const i = parent.children.indexOf(current);
    parent.keys.splice(i, 0, mid);
    parent.children.splice(i, 1, left, right);
    current = parent;
  }
  return root;
}`,
    cpp: `struct Node {
  vector<int> keys;
  vector<Node*> children;
};

Node* insert(Node* root, int key) {
  if (!root) return new Node{{key}, {}};
  auto [leaf, path] = findLeaf(root, key);
  leaf->keys.push_back(key);
  sort(leaf->keys.begin(), leaf->keys.end());
  while (leaf->keys.size() > 2) {
    int mid = leaf->keys[1];
    auto* left = new Node{{leaf->keys[0]}, {leaf->children.begin(), leaf->children.begin()+2}};
    auto* right = new Node{{leaf->keys[2]}, {leaf->children.begin()+2, leaf->children.end()}};
    if (path.empty()) return new Node{{mid}, {left, right}};
    auto* parent = path.back(); path.pop_back();
    int i = find(parent->children, leaf) - parent->children.begin();
    parent->keys.insert(parent->keys.begin()+i, mid);
    parent->children.erase(parent->children.begin()+i);
    parent->children.insert(parent->children.begin()+i, right);
    parent->children.insert(parent->children.begin()+i, left);
    leaf = parent;
  }
  return root;
}`,
    java: `class Node {
  List<Integer> keys = new ArrayList<>();
  List<Node> children = new ArrayList<>();
}

Node insert(Node root, int key) {
  if (root == null) { Node n = new Node(); n.keys.add(key); return n; }
  Deque<Node> path = findLeaf(root, key);
  Node leaf = path.removeLast();
  leaf.keys.add(key);
  Collections.sort(leaf.keys);
  while (leaf.keys.size() > 2) {
    int mid = leaf.keys.get(1);
    Node left = new Node(); left.keys.add(leaf.keys.get(0));
    Node right = new Node(); right.keys.add(leaf.keys.get(2));
    // split children...
    if (path.isEmpty()) {
      Node r = new Node(); r.keys.add(mid);
      r.children.add(left); r.children.add(right);
      return r;
    }
    Node parent = path.removeLast();
    int i = parent.children.indexOf(leaf);
    parent.keys.add(i, mid);
    parent.children.set(i, left);
    parent.children.add(i + 1, right);
    leaf = parent;
  }
  return root;
}`,
  },
  presets: [
    { id: 'small', label: 'Small (6 keys)', description: 'Insert 6 keys into empty 2-3 tree', data: { keys: [10, 20, 5, 15, 25, 30] } },
    { id: 'sequential', label: 'Sequential (8 keys)', description: 'Insert keys 1-8 sequentially', data: { keys: [1, 2, 3, 4, 5, 6, 7, 8] } },
    { id: 'splits', label: 'Many Splits (10 keys)', description: 'Triggers multiple cascading splits', data: { keys: [50, 25, 75, 10, 30, 60, 80, 5, 15, 35] } },
  ],
  defaultInput: { keys: [10, 20, 5, 15, 25, 30] },
  generateTimeline,
  renderStage,
};
