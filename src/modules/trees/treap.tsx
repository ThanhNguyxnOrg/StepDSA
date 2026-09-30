import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface TreapNode {
  key: number;
  priority: number;
  left: TreapNode | null;
  right: TreapNode | null;
}

export interface TreapState {
  tree: TreapNode | null;
  activeKey: number | null;
  rotationType: 'LEFT' | 'RIGHT' | 'NONE';
  insertedKey: number | null;
  insertedPriority: number | null;
}

function cloneTreap(node: TreapNode | null): TreapNode | null {
  if (!node) return null;
  return {
    key: node.key,
    priority: node.priority,
    left: cloneTreap(node.left),
    right: cloneTreap(node.right),
  };
}

export const treapModule: AlgorithmModule<
  { keys: { key: number; priority: number }[] },
  TreapState
> = {
  id: 'treap',
  title: 'Treap (Cartesian Randomized BST & Heap Hybrid O(log N))',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(log N)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N) node storage and recursion call stack',
    worstCaseCondition: 'Pathological priority generation matching sorted keys (probability 1 / N!)',
  },
  theory: {
    overview:
      'A Treap (Tree + Heap) is a Cartesian binary search tree where each node possesses two attributes: a search key K and a numerical priority P. It maintains the BST invariant on keys and the Max-Heap invariant on priorities.',
    whyItWorks:
      'By assigning randomly generated priorities independently from keys, the expected tree structure matches a random BST built from a random permutation, guaranteeing O(log N) expected height, search, insert, and delete times.',
    invariant:
      'Cartesian Dual Invariant: Keys strictly satisfy BST ordering (Left.key < Key < Right.key), and Priorities strictly satisfy Max-Heap ordering (Parent.priority >= Child.priority).',
    pitfalls: [
      'Using a predictable or biased pseudorandom number generator for priorities.',
      'Performing incorrect pointer updates during left or right rotations.',
    ],
  },
  presets: [
    {
      id: 'classic-treap-build',
      label: 'Sequential Keys with Random Priorities',
      description: 'Insert [10, 20, 30, 40, 50] with priorities triggering balance rotations',
      data: {
        keys: [
          { key: 30, priority: 70 },
          { key: 10, priority: 90 },
          { key: 50, priority: 40 },
          { key: 20, priority: 85 },
          { key: 40, priority: 95 },
        ],
      },
    },
    {
      id: 'unbalanced-key-sequence',
      label: 'Ascending Keys [1..5] with Varied Priorities',
      description: 'Rotations prevent degenerate O(N) line degeneration',
      data: {
        keys: [
          { key: 1, priority: 20 },
          { key: 2, priority: 80 },
          { key: 3, priority: 50 },
          { key: 4, priority: 90 },
          { key: 5, priority: 30 },
        ],
      },
    },
  ],
  defaultInput: {
    keys: [
      { key: 30, priority: 70 },
      { key: 10, priority: 90 },
      { key: 50, priority: 40 },
      { key: 20, priority: 85 },
      { key: 40, priority: 95 },
    ],
  },
  codeSnippets: {
    cpp: `struct Node {
    int key, priority;
    Node *left = nullptr, *right = nullptr;
    Node(int k, int p) : key(k), priority(p) {}
};

Node* rotateRight(Node* y) {
    Node* x = y->left;
    y->left = x->right;
    x->right = y;
    return x;
}

Node* rotateLeft(Node* x) {
    Node* y = x->right;
    x->right = y->left;
    y->left = x;
    return y;
}

Node* insert(Node* root, int key, int priority) {
    if (!root) return new Node(key, priority);
    if (key < root->key) {
        root->left = insert(root->left, key, priority);
        if (root->left->priority > root->priority) root = rotateRight(root);
    } else {
        root->right = insert(root->right, key, priority);
        if (root->right->priority > root->priority) root = rotateLeft(root);
    }
    return root;
}`,
    python: `class TreapNode:
    def __init__(self, key, priority):
        self.key, self.priority = key, priority
        self.left = self.right = None

def rotate_right(y):
    x = y.left
    y.left = x.right
    x.right = y
    return x

def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = x
    return y

def insert(root, key, priority):
    if not root: return TreapNode(key, priority)
    if key < root.key:
        root.left = insert(root.left, key, priority)
        if root.left.priority > root.priority: root = rotate_right(root)
    else:
        root.right = insert(root.right, key, priority)
        if root.right.priority > root.priority: root = rotate_left(root)
    return root`,
    typescript: `interface TreapNode {
  key: number; priority: number;
  left: TreapNode | null; right: TreapNode | null;
}
function rotateRight(y: TreapNode): TreapNode {
  const x = y.left!; y.left = x.right; x.right = y; return x;
}
function rotateLeft(x: TreapNode): TreapNode {
  const y = x.right!; x.right = y.left; y.left = x; return y;
}
function insert(root: TreapNode | null, key: number, priority: number): TreapNode {
  if (!root) return { key, priority, left: null, right: null };
  if (key < root.key) {
    root.left = insert(root.left, key, priority);
    if (root.left.priority > root.priority) return rotateRight(root);
  } else {
    root.right = insert(root.right, key, priority);
    if (root.right.priority > root.priority) return rotateLeft(root);
  }
  return root;
}`,
    java: `class TreapNode {
    int key, priority;
    TreapNode left, right;
    TreapNode(int k, int p) { key = k; priority = p; }
}
TreapNode rotateRight(TreapNode y) {
    TreapNode x = y.left; y.left = x.right; x.right = y; return x;
}
TreapNode rotateLeft(TreapNode x) {
    TreapNode y = x.right; x.right = y.left; y.left = x; return y;
}
TreapNode insert(TreapNode root, int key, int priority) {
    if (root == null) return new TreapNode(key, priority);
    if (key < root.key) {
        root.left = insert(root.left, key, priority);
        if (root.left.priority > root.priority) root = rotateRight(root);
    } else {
        root.right = insert(root.right, key, priority);
        if (root.right.priority > root.priority) root = rotateLeft(root);
    }
    return root;
}`,
    pseudocode: `function insert(root, key, priority):
    if root is null: return new Node(key, priority)
    if key < root.key:
        root.left = insert(root.left, key, priority)
        if root.left.priority > root.priority:
            root = rotateRight(root)
    else:
        root.right = insert(root.right, key, priority)
        if root.right.priority > root.priority:
            root = rotateLeft(root)
    return root`,
  },
  generateTimeline: (input: {
    keys: { key: number; priority: number }[];
  }): ExecutionFrame<TreapState>[] => {
    const rawKeys = input?.keys?.length
      ? input.keys
      : [
          { key: 30, priority: 70 },
          { key: 10, priority: 90 },
          { key: 50, priority: 40 },
          { key: 20, priority: 85 },
          { key: 40, priority: 95 },
        ];

    const frames: ExecutionFrame<TreapState>[] = [];
    let root: TreapNode | null = null;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      state: {
        tree: null,
        activeKey: null,
        rotationType: 'NONE',
        insertedKey: null,
        insertedPriority: null,
      },
      callStack: [{ name: 'treapInit', params: { totalKeys: rawKeys.length } }],
      variables: { totalNodesToInsert: rawKeys.length, status: 'Empty tree' },
      explanation: `Initialized empty Treap. Will sequentially insert ${rawKeys.length} Cartesian (key, priority) nodes.`,
    });

    function rightRotate(y: TreapNode): TreapNode {
      const x = y.left!;
      y.left = x.right;
      x.right = y;
      return x;
    }

    function leftRotate(x: TreapNode): TreapNode {
      const y = x.right!;
      x.right = y.left;
      y.left = x;
      return y;
    }

    function insertNode(current: TreapNode | null, key: number, priority: number): TreapNode {
      if (!current) {
        return { key, priority, left: null, right: null };
      }

      if (key < current.key) {
        current.left = insertNode(current.left, key, priority);
        if (current.left.priority > current.priority) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 24,
            action: 'ROTATE_RIGHT',
            state: {
              tree: cloneTreap(root),
              activeKey: key,
              rotationType: 'RIGHT',
              insertedKey: key,
              insertedPriority: priority,
            },
            callStack: [{ name: 'rotateRight', params: { pivotNode: current.key, childKey: current.left.key } }],
            variables: {
              pivot: current.key,
              child: current.left.key,
              childPriority: current.left.priority,
              parentPriority: current.priority,
              rule: 'Child priority > parent priority violates Max-Heap',
            },
            explanation: `Child priority (${current.left.priority}) > parent (${current.priority}). Right rotate around key ${current.key}.`,
          });
          current = rightRotate(current);
        }
      } else {
        current.right = insertNode(current.right, key, priority);
        if (current.right.priority > current.priority) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 28,
            action: 'ROTATE_LEFT',
            state: {
              tree: cloneTreap(root),
              activeKey: key,
              rotationType: 'LEFT',
              insertedKey: key,
              insertedPriority: priority,
            },
            callStack: [{ name: 'rotateLeft', params: { pivotNode: current.key, childKey: current.right.key } }],
            variables: {
              pivot: current.key,
              child: current.right.key,
              childPriority: current.right.priority,
              parentPriority: current.priority,
              rule: 'Child priority > parent priority violates Max-Heap',
            },
            explanation: `Child priority (${current.right.priority}) > parent (${current.priority}). Left rotate around key ${current.key}.`,
          });
          current = leftRotate(current);
        }
      }

      return current;
    }

    for (const item of rawKeys) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 20,
        action: 'START_INSERT',
        state: {
          tree: cloneTreap(root),
          activeKey: item.key,
          rotationType: 'NONE',
          insertedKey: item.key,
          insertedPriority: item.priority,
        },
        callStack: [{ name: 'insert', params: { key: item.key, priority: item.priority } }],
        variables: { key: item.key, priority: item.priority },
        explanation: `Insert node with Key = ${item.key} and Priority = ${item.priority} as standard BST leaf.`,
      });

      root = insertNode(root, item.key, item.priority);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 32,
        action: 'INSERT_COMPLETE',
        state: {
          tree: cloneTreap(root),
          activeKey: item.key,
          rotationType: 'NONE',
          insertedKey: item.key,
          insertedPriority: item.priority,
        },
        callStack: [{ name: 'insert', params: { key: item.key, status: 'BALANCED' } }],
        variables: { rootKey: root ? root.key : 'null', rootPriority: root ? root.priority : 0 },
        explanation: `Node (${item.key}, p=${item.priority}) positioned and both BST + Heap invariants restored.`,
      });
    }

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<TreapState>) => {
    const { tree, activeKey, rotationType, insertedKey, insertedPriority } = frame.state;

    interface VisualTreapNode {
      key: number;
      priority: number;
      x: number;
      y: number;
      left: VisualTreapNode | null;
      right: VisualTreapNode | null;
    }

    function layoutTree(
      node: TreapNode | null,
      x: number,
      y: number,
      dx: number
    ): VisualTreapNode | null {
      if (!node) return null;
      return {
        key: node.key,
        priority: node.priority,
        x,
        y,
        left: layoutTree(node.left, x - dx, y + 60, dx * 0.55),
        right: layoutTree(node.right, x + dx, y + 60, dx * 0.55),
      };
    }

    const visualRoot = layoutTree(tree, 240, 45, 110);

    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const nodesList: { key: number; priority: number; x: number; y: number }[] = [];

    function collectVisuals(vn: VisualTreapNode | null) {
      if (!vn) return;
      nodesList.push({ key: vn.key, priority: vn.priority, x: vn.x, y: vn.y });
      if (vn.left) {
        edges.push({ x1: vn.x, y1: vn.y, x2: vn.left.x, y2: vn.left.y });
        collectVisuals(vn.left);
      }
      if (vn.right) {
        edges.push({ x1: vn.x, y1: vn.y, x2: vn.right.x, y2: vn.right.y });
        collectVisuals(vn.right);
      }
    }
    collectVisuals(visualRoot);

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-3xl mx-auto">
        {/* Banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Current Node:</span>
            {insertedKey !== null ? (
              <span className="font-mono text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded">
                Key: {insertedKey} | Priority: {insertedPriority}
              </span>
            ) : (
              <span className="text-slate-500 text-xs italic">Idle</span>
            )}
          </div>
          {rotationType !== 'NONE' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded animate-pulse">
                {rotationType} ROTATION
              </span>
            </div>
          )}
        </div>

        {/* Tree SVG */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 w-full">
          <svg width="480" height="280" className="overflow-visible">
            {/* Edges */}
            {edges.map((e, idx) => (
              <line
                key={idx}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}

            {/* Nodes */}
            {nodesList.map((n) => {
              const isActive = activeKey === n.key;

              return (
                <g key={n.key} className="transition-all duration-300">
                  {isActive && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="26"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="20"
                    fill={isActive ? '#1e293b' : '#0f172a'}
                    stroke={isActive ? '#f59e0b' : '#06b6d4'}
                    strokeWidth="3"
                  />
                  <text
                    x={n.x}
                    y={n.y - 2}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    k:{n.key}
                  </text>
                  <text
                    x={n.x}
                    y={n.y + 11}
                    textAnchor="middle"
                    fill="#a7f3d0"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    p:{n.priority}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-500/20 border border-cyan-400 inline-block" />
            <span>Key (k) satisfies BST Invariant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-400 inline-block" />
            <span>Priority (p) satisfies Max-Heap Invariant</span>
          </div>
        </div>
      </div>
    );
  },
};
