import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface BTreeNodeData {
  id: string;
  keys: number[];
  children: BTreeNodeData[];
  isLeaf: boolean;
}

export interface BTreeState {
  root: BTreeNodeData | null;
  activeKey: number | null;
  activeNodeId: string | null;
  splitNodeId: string | null;
  order: number;
}

function cloneBTree(node: BTreeNodeData | null): BTreeNodeData | null {
  if (!node) return null;
  return {
    id: node.id,
    keys: [...node.keys],
    isLeaf: node.isLeaf,
    children: node.children.map(cloneBTree).filter((c): c is BTreeNodeData => c !== null),
  };
}

export const bTreeModule: AlgorithmModule<
  { keys: number[]; order: number },
  BTreeState
> = {
  id: 'b-tree',
  title: 'B-Tree (Order-M Balanced Multi-Way Disk Indexing O(log N))',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(log N)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(log N)',
    spaceAuxiliary: 'O(N) multi-key block storage',
    worstCaseCondition: 'All nodes minimally filled at ceil(M/2) keys, maximizing multi-way tree height',
  },
  theory: {
    overview:
      'A B-Tree is a self-balancing search tree in which each node can contain multiple keys and more than two children. Optimized for disk and block-storage architectures, it minimizes expensive I/O operations by maintaining large node fanouts.',
    whyItWorks:
      'By maintaining the invariant that every non-root node has at least ceil(M/2) children and at most M children, all leaf nodes remain at the exact same depth. Node overflow triggers a median key push to the parent and a node split.',
    invariant:
      'Multi-Way Balancing Invariant: All leaf nodes are at identical depth. Every internal node with k keys has exactly k + 1 children with keys sorted strictly in ascending order.',
    pitfalls: [
      'Violating minimum key bounds during deletion without borrowing or merging siblings.',
      'Incorrect median selection during odd vs. even order node splitting.',
    ],
  },
  presets: [
    {
      id: 'btree-order3-insert',
      label: 'Order 3 (2-3 Tree) Insertions',
      description: 'Sequential inserts triggering root and internal splits with max 2 keys per node',
      data: {
        keys: [10, 20, 5, 6, 12, 30, 7, 17],
        order: 3,
      },
    },
    {
      id: 'btree-sorted-stream',
      label: 'Monotonically Increasing Stream',
      description: 'Inserts [1, 2, 3, 4, 5, 6, 7] demonstrating symmetric upward right splits',
      data: {
        keys: [1, 2, 3, 4, 5, 6, 7],
        order: 3,
      },
    },
  ],
  defaultInput: {
    keys: [10, 20, 5, 6, 12, 30, 7, 17],
    order: 3,
  },
  codeSnippets: {
    cpp: `class BTreeNode {
    int* keys;
    int t; // Min degree
    BTreeNode** C;
    int n;
    bool leaf;
public:
    BTreeNode(int _t, bool _leaf);
    void insertNonFull(int k);
    void splitChild(int i, BTreeNode* y);
};

void BTreeNode::splitChild(int i, BTreeNode* y) {
    BTreeNode* z = new BTreeNode(y->t, y->leaf);
    z->n = t - 1;
    for (int j = 0; j < t - 1; j++) z->keys[j] = y->keys[j + t];
    if (!y->leaf) {
        for (int j = 0; j < t; j++) z->C[j] = y->C[j + t];
    }
    y->n = t - 1;
    for (int j = n; j >= i + 1; j--) C[j + 1] = C[j];
    C[i + 1] = z;
    for (int j = n - 1; j >= i; j--) keys[j + 1] = keys[j];
    keys[i] = y->keys[t - 1];
    n++;
}`,
    python: `class BTreeNode:
    def __init__(self, leaf=True):
        self.leaf = leaf
        self.keys = []
        self.children = []

class BTree:
    def __init__(self, t=2):
        self.root = BTreeNode()
        self.t = t

    def insert(self, k):
        root = self.root
        if len(root.keys) == (2 * self.t) - 1:
            s = BTreeNode(leaf=False)
            self.root = s
            s.children.append(root)
            self.split_child(s, 0)
            self.insert_non_full(s, k)
        else:
            self.insert_non_full(root, k)`,
    typescript: `interface BTreeNode {
  keys: number[];
  children: BTreeNode[];
  isLeaf: boolean;
}

function insertNonFull(node: BTreeNode, k: number, M: number): void {
  let i = node.keys.length - 1;
  if (node.isLeaf) {
    node.keys.push(k);
    node.keys.sort((a, b) => a - b);
  } else {
    while (i >= 0 && k < node.keys[i]) i--;
    i++;
    if (node.children[i].keys.length === M - 1) {
      splitChild(node, i, node.children[i], M);
      if (k > node.keys[i]) i++;
    }
    insertNonFull(node.children[i], k, M);
  }
}`,
    java: `class BTreeNode {
    int[] keys;
    int t;
    BTreeNode[] children;
    int n;
    boolean leaf;

    public void splitChild(int i, BTreeNode y) {
        BTreeNode z = new BTreeNode(y.t, y.leaf);
        z.n = t - 1;
        for (int j = 0; j < t - 1; j++) z.keys[j] = y.keys[j + t];
        if (!y.leaf) {
            for (int j = 0; j < t; j++) z.children[j] = y.children[j + t];
        }
        y.n = t - 1;
        for (int j = n; j >= i + 1; j--) children[j + 1] = children[j];
        children[i + 1] = z;
        for (int j = n - 1; j >= i; j--) keys[j + 1] = keys[j];
        keys[i] = y.keys[t - 1];
        n++;
    }
}`,
    pseudocode: `function insert(root, key, M):
    if root is full:
        newRoot = new Node(leaf=false)
        newRoot.children.append(root)
        splitChild(newRoot, 0, root)
        root = newRoot
    insertNonFull(root, key, M)`,
  },
  generateTimeline: (input: {
    keys: number[];
    order: number;
  }): ExecutionFrame<BTreeState>[] => {
    const rawKeys = input?.keys?.length ? input.keys : [10, 20, 5, 6, 12, 30, 7, 17];
    const order = input?.order && input.order >= 3 ? input.order : 3;
    const maxKeys = order - 1;

    let nodeCounter = 0;
    function makeNode(isLeaf = true): BTreeNodeData {
      return {
        id: `node-${++nodeCounter}`,
        keys: [],
        children: [],
        isLeaf,
      };
    }

    const frames: ExecutionFrame<BTreeState>[] = [];
    let root: BTreeNodeData = makeNode(true);

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        root: cloneBTree(root),
        activeKey: null,
        activeNodeId: root.id,
        splitNodeId: null,
        order,
      },
      callStack: [{ name: 'bTreeInit', params: { order, totalKeys: rawKeys.length } }],
      variables: { order, maxKeysPerNode: maxKeys, status: 'Initialized empty B-Tree root' },
      explanation: `Initialized empty B-Tree of Order ${order} (each node can hold max ${maxKeys} keys).`,
    });

    function splitChild(parent: BTreeNodeData, index: number, child: BTreeNodeData) {
      const midIdx = Math.floor(child.keys.length / 2);
      const medianKey = child.keys[midIdx];

      const rightNode = makeNode(child.isLeaf);
      rightNode.keys = child.keys.slice(midIdx + 1);
      child.keys = child.keys.slice(0, midIdx);

      if (!child.isLeaf) {
        rightNode.children = child.children.slice(midIdx + 1);
        child.children = child.children.slice(0, midIdx + 1);
      }

      parent.children.splice(index + 1, 0, rightNode);
      parent.keys.splice(index, 0, medianKey);

      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 18,
        action: 'SPLIT',
        state: {
          root: cloneBTree(root),
          activeKey: medianKey,
          activeNodeId: parent.id,
          splitNodeId: child.id,
          order,
        },
        callStack: [{ name: 'splitChild', params: { medianKey, parentId: parent.id } }],
        variables: { medianPushed: medianKey, newChildId: rightNode.id },
        explanation: `Node capacity exceeded. Pushed median key ${medianKey} up into parent [${parent.keys.join(', ')}].`,
      });
    }

    function insertNonFull(node: BTreeNodeData, key: number) {
      if (node.isLeaf) {
        node.keys.push(key);
        node.keys.sort((a, b) => a - b);

        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 24,
          action: 'INSERT_KEY',
          state: {
            root: cloneBTree(root),
            activeKey: key,
            activeNodeId: node.id,
            splitNodeId: null,
            order,
          },
          callStack: [{ name: 'insertNonFull', params: { key, nodeId: node.id } }],
          variables: { insertedKey: key, nodeKeys: node.keys.join(',') },
          explanation: `Inserted key ${key} into leaf node [${node.keys.join(', ')}].`,
        });
      } else {
        let i = node.keys.length - 1;
        while (i >= 0 && key < node.keys[i]) {
          i--;
        }
        i++;

        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 12,
          action: 'TRAVERSE',
          state: {
            root: cloneBTree(root),
            activeKey: key,
            activeNodeId: node.children[i].id,
            splitNodeId: null,
            order,
          },
          callStack: [{ name: 'traverseChild', params: { key, childIndex: i } }],
          variables: { targetChildIndex: i, childNodeId: node.children[i].id },
          explanation: `Navigating down child index ${i} for key ${key}.`,
        });

        if (node.children[i].keys.length >= order) {
          splitChild(node, i, node.children[i]);
          if (key > node.keys[i]) {
            i++;
          }
        }
        insertNonFull(node.children[i], key);
      }
    }

    for (const key of rawKeys) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 5,
        action: 'START_INSERT',
        state: {
          root: cloneBTree(root),
          activeKey: key,
          activeNodeId: root.id,
          splitNodeId: null,
          order,
        },
        callStack: [{ name: 'insert', params: { key } }],
        variables: { incomingKey: key },
        explanation: `Starting insertion for key ${key} into B-Tree.`,
      });

      if (root.keys.length >= order) {
        const newRoot = makeNode(false);
        newRoot.children.push(root);
        splitChild(newRoot, 0, root);
        root = newRoot;
      }
      insertNonFull(root, key);
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 30,
      action: 'COMPLETE',
      state: {
        root: cloneBTree(root),
        activeKey: null,
        activeNodeId: null,
        splitNodeId: null,
        order,
      },
      callStack: [{ name: 'bTreeComplete', params: { totalInserted: rawKeys.length } }],
      variables: { completed: true, totalKeysInserted: rawKeys.length },
      explanation: `All ${rawKeys.length} keys successfully inserted into balanced B-Tree of Order ${order}.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<BTreeState>) => {
    const { root, activeKey, activeNodeId, splitNodeId, order } = frame.state;

    interface LayoutNode {
      id: string;
      keys: number[];
      isLeaf: boolean;
      x: number;
      y: number;
      width: number;
      children: LayoutNode[];
    }

    function calculateLayout(
      node: BTreeNodeData | null,
      depth: number,
      leftBound: number,
      rightBound: number
    ): LayoutNode | null {
      if (!node) return null;
      const x = (leftBound + rightBound) / 2;
      const y = depth * 80 + 50;
      const width = Math.max(70, node.keys.length * 36 + 20);

      const numChildren = node.children.length;
      const childLayouts: LayoutNode[] = [];

      if (numChildren > 0) {
        const sliceWidth = (rightBound - leftBound) / numChildren;
        node.children.forEach((c, idx) => {
          const cLeft = leftBound + idx * sliceWidth;
          const cRight = cLeft + sliceWidth;
          const childLayout = calculateLayout(c, depth + 1, cLeft, cRight);
          if (childLayout) childLayouts.push(childLayout);
        });
      }

      return {
        id: node.id,
        keys: node.keys,
        isLeaf: node.isLeaf,
        x,
        y,
        width,
        children: childLayouts,
      };
    }

    const layout = calculateLayout(root, 0, 40, 720);

    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const flatNodes: LayoutNode[] = [];

    function collect(node: LayoutNode | null) {
      if (!node) return;
      flatNodes.push(node);
      for (const child of node.children) {
        edges.push({ x1: node.x, y1: node.y + 18, x2: child.x, y2: child.y - 18 });
        collect(child);
      }
    }
    collect(layout);

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Target Key:</span>
            {activeKey !== null ? (
              <span className="font-mono text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded">
                Key {activeKey}
              </span>
            ) : (
              <span className="text-slate-500 text-xs italic">Idle</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Order (M): <strong className="text-cyan-400">{order}</strong></span>
            <span>Max Keys / Node: <strong className="text-indigo-400">{order - 1}</strong></span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[360px] flex items-center justify-center">
          <svg className="w-[760px] h-[340px]" viewBox="0 0 760 340">
            {edges.map((e, idx) => (
              <line
                key={`edge-${idx}`}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            ))}

            {flatNodes.map((n) => {
              const isActive = n.id === activeNodeId;
              const isSplit = n.id === splitNodeId;
              const bgFill = isSplit
                ? '#7f1d1d'
                : isActive
                ? '#1e293b'
                : '#0f172a';
              const strokeColor = isSplit
                ? '#ef4444'
                : isActive
                ? '#38bdf8'
                : '#334155';

              return (
                <g key={n.id} transform={`translate(${n.x - n.width / 2}, ${n.y - 18})`}>
                  <rect
                    width={n.width}
                    height="36"
                    rx="8"
                    fill={bgFill}
                    stroke={strokeColor}
                    strokeWidth={isActive || isSplit ? '2.5' : '1.5'}
                    className="transition-all duration-300 shadow-md"
                  />
                  {n.keys.map((k, kIdx) => {
                    const keyX = (kIdx + 1) * (n.width / (n.keys.length + 1));
                    const isKeyActive = k === activeKey;
                    return (
                      <g key={`${n.id}-key-${k}`}>
                        <rect
                          x={keyX - 14}
                          y="4"
                          width="28"
                          height="28"
                          rx="4"
                          fill={isKeyActive ? '#f59e0b' : '#1e1e38'}
                          stroke={isKeyActive ? '#d97706' : '#475569'}
                          strokeWidth="1"
                        />
                        <text
                          x={keyX}
                          y="22"
                          textAnchor="middle"
                          fill={isKeyActive ? '#000000' : '#f8fafc'}
                          fontSize="12"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {k}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
