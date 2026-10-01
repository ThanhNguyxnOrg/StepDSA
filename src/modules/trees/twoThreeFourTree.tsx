import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface TTFNodeData {
  id: string;
  keys: number[];
  children: TTFNodeData[];
}

export interface TwoThreeFourTreeState {
  root: TTFNodeData | null;
  activeVal: number | null;
  activeNodeId: string | null;
  splitOccurred: boolean;
  message: string;
}

function cloneTTF(node: TTFNodeData | null): TTFNodeData | null {
  if (!node) return null;
  return {
    id: node.id,
    keys: [...node.keys],
    children: node.children.map((c) => cloneTTF(c)!),
  };
}

export const twoThreeFourTreeModule: AlgorithmModule<
  { keys: number[] },
  TwoThreeFourTreeState
> = {
  id: 'two-three-four-tree',
  title: '2-3 & 2-3-4 Tree (B-Tree Order 4 with Symmetric Splitting)',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(log N) balanced multiway search',
    timeAverage: 'O(log N) insert, delete, search',
    timeWorst: 'O(log N) strict height balance guaranteed',
    spaceAuxiliary: 'O(N) multi-key node representation',
    worstCaseCondition: 'Strictly bounded height between log4(N) and log2(N)',
  },
  theory: {
    overview:
      'A 2-3-4 tree (also known as a 2-4 tree) is a self-balancing B-Tree of order 4 where every internal node contains 1, 2, or 3 keys and has 2, 3, or 4 children. Red-Black trees are isomorphic representations of 2-3-4 trees.',
    whyItWorks:
      'In a 2-3-4 tree, top-down preemptive splitting breaks any 4-node (3 keys, 4 children) into two 2-nodes and pushes the middle key up into the parent as we traverse down. This guarantees that parent nodes always have room for a promoted key, eliminating cascading split propagation.',
    invariant:
      'Uniform Depth Invariant: All leaf nodes reside at the exact same depth. Every internal node with k keys has exactly k + 1 children.',
    pitfalls: [
      'Confusing top-down 2-3-4 tree splits (which split 4-nodes on the way down) with bottom-up B-tree splits (which split full nodes on the way back up).',
      'Forgetting that a 2-3-4 tree node with k keys must maintain strictly sorted order of keys: key[0] < key[1] < key[2].',
    ],
  },
  defaultInput: {
    keys: [10, 20, 30, 40, 50, 25],
  },
  presets: [
    {
      id: 'ascending-insertion',
      label: 'Ascending Insertion (Cascading Promotions)',
      description: 'Sequential keys triggering top-down preemptive 4-node splits',
      data: {
        keys: [10, 20, 30, 40, 50, 60, 70],
      },
    },
    {
      id: 'root-split',
      label: 'Root Split (10, 20, 30 -> 40)',
      description: 'Full root 4-node splitting to create new root layer',
      data: {
        keys: [10, 20, 30, 40],
      },
    },
  ],
  codeSnippets: {
    cpp: `struct Node234 {
    vector<int> keys;
    vector<Node234*> children;
    bool isLeaf() const { return children.empty(); }
};

void splitChild(Node234* parent, int i, Node234* fullChild) {
    int mid = fullChild->keys[1];
    Node234* rightSibling = new Node234();
    rightSibling->keys.push_back(fullChild->keys[2]);
    if (!fullChild->isLeaf()) {
        rightSibling->children.push_back(fullChild->children[2]);
        rightSibling->children.push_back(fullChild->children[3]);
        fullChild->children.resize(2);
    }
    fullChild->keys.resize(1);
    parent->children.insert(parent->children.begin() + i + 1, rightSibling);
    parent->keys.insert(parent->keys.begin() + i, mid);
}`,
    python: `class Node234:
    def __init__(self, keys=None, children=None):
        self.keys = keys or []
        self.children = children or []

    def is_leaf(self):
        return len(self.children) == 0

def split_child(parent, idx, child):
    mid_key = child.keys[1]
    right = Node234([child.keys[2]])
    if not child.is_leaf():
        right.children = child.children[2:]
        child.children = child.children[:2]
    child.keys = [child.keys[0]]
    parent.keys.insert(idx, mid_key)
    parent.children.insert(idx + 1, right)`,
    typescript: `interface Node234 {
  keys: number[];
  children: Node234[];
}

function splitChild(parent: Node234, idx: number, child: Node234): void {
  const mid = child.keys[1];
  const right: Node234 = { keys: [child.keys[2]], children: child.children.slice(2) };
  child.keys = [child.keys[0]];
  child.children = child.children.slice(0, 2);
  parent.keys.splice(idx, 0, mid);
  parent.children.splice(idx + 1, 0, right);
}`,
    java: `class Node234 {
    int[] keys = new int[3];
    Node234[] children = new Node234[4];
    int numKeys = 0;
}`,
    pseudocode: `function insertNonFull(node, val):
    if node.isLeaf():
        insertKeySorted(node, val)
    else:
        childIdx = findChild(node, val)
        if node.children[childIdx].isFull():
            splitChild(node, childIdx)
            if val > node.keys[childIdx]: childIdx++
        insertNonFull(node.children[childIdx], val)`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<TwoThreeFourTreeState>[] = [];
    let root: TTFNodeData | null = null;
    let nodeCount = 0;

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: TwoThreeFourTreeState,
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
      `Initialized empty 2-3-4 Tree. Ready to insert ${input.keys.length} keys with top-down symmetric splitting.`,
      {
        root: null,
        activeVal: null,
        activeNodeId: null,
        splitOccurred: false,
        message: 'Empty 2-3-4 tree created.',
      },
      {
        action: 'INIT',
        variables: { totalKeys: input.keys.length },
        callStack: [{ name: 'init', params: { count: input.keys.length } }],
      }
    );

    for (let kIdx = 0; kIdx < input.keys.length; kIdx++) {
      const val = input.keys[kIdx];

      if (!root) {
        nodeCount++;
        root = { id: `ttf-${nodeCount}`, keys: [val], children: [] };
        addFrame(
          4,
          `Created root node containing key ${val} (2-node: 1 key, 0 children).`,
          {
            root: cloneTTF(root),
            activeVal: val,
            activeNodeId: root.id,
            splitOccurred: false,
            message: `Root 2-node initialized with key [${val}].`,
          },
          {
            action: 'CREATE_ROOT',
            variables: { val, rootKeys: [val].join(',') },
            callStack: [{ name: 'insert', params: { val } }],
          }
        );
        continue;
      }

      // Check if root is 4-node (3 keys) -> split root
      if (root.keys.length === 3) {
        nodeCount += 3;
        const midKey = root.keys[1];
        const leftNode: TTFNodeData = {
          id: `ttf-${nodeCount - 2}`,
          keys: [root.keys[0]],
          children: root.children.slice(0, 2),
        };
        const rightNode: TTFNodeData = {
          id: `ttf-${nodeCount - 1}`,
          keys: [root.keys[2]],
          children: root.children.slice(2),
        };
        const newRoot: TTFNodeData = {
          id: `ttf-${nodeCount}`,
          keys: [midKey],
          children: [leftNode, rightNode],
        };
        root = newRoot;

        addFrame(
          7,
          `Root was full 4-node [${leftNode.keys[0]}, ${midKey}, ${rightNode.keys[0]}]. Split root: promoted middle key ${midKey} to new root.`,
          {
            root: cloneTTF(root),
            activeVal: val,
            activeNodeId: root.id,
            splitOccurred: true,
            message: `Preemptive split: Root 4-node partitioned, promoting ${midKey} upwards.`,
          },
          {
            action: 'SPLIT_ROOT',
            variables: { midKey, newRootId: root.id },
            callStack: [{ name: 'splitRoot', params: { midKey } }],
          }
        );
      }

      // Traverse down
      let curr = root;
      while (curr.children.length > 0) {
        let childIdx = 0;
        while (childIdx < curr.keys.length && val > curr.keys[childIdx]) {
          childIdx++;
        }

        const child = curr.children[childIdx];
        if (child.keys.length === 3) {
          nodeCount += 2;
          const mid = child.keys[1];
          const rightSibling: TTFNodeData = {
            id: `ttf-${nodeCount}`,
            keys: [child.keys[2]],
            children: child.children.slice(2),
          };
          child.keys = [child.keys[0]];
          child.children = child.children.slice(0, 2);

          curr.keys.splice(childIdx, 0, mid);
          curr.children.splice(childIdx + 1, 0, rightSibling);

          addFrame(
            11,
            `Encountered full child 4-node on path. Preemptively split child: promoted ${mid} into parent.`,
            {
              root: cloneTTF(root),
              activeVal: val,
              activeNodeId: curr.id,
              splitOccurred: true,
              message: `Split full child node; promoted ${mid} into parent.`,
            },
            {
              action: 'SPLIT_CHILD',
              variables: { mid, parentKeys: curr.keys.join(',') },
              callStack: [{ name: 'splitChild', params: { mid } }],
            }
          );

          if (val > mid) {
            childIdx++;
          }
        }

        curr = curr.children[childIdx];
      }

      // Insert into leaf
      curr.keys.push(val);
      curr.keys.sort((a, b) => a - b);

      addFrame(
        15,
        `Inserted key ${val} into leaf node [${curr.keys.join(' | ')}]. Node is now a ${curr.keys.length + 1}-node.`,
        {
          root: cloneTTF(root),
          activeVal: val,
          activeNodeId: curr.id,
          splitOccurred: false,
          message: `Key ${val} successfully placed into leaf [${curr.keys.join(' | ')}].`,
        },
        {
          action: 'INSERT_LEAF',
          variables: { val, leafKeys: curr.keys.join(',') },
          callStack: [{ name: 'insertLeaf', params: { val, keys: curr.keys.join(',') } }],
        }
      );
    }

    addFrame(
      20,
      `All keys inserted. 2-3-4 Tree maintains strict uniform leaf depth and logarithmic height.`,
      {
        root: cloneTTF(root),
        activeVal: null,
        activeNodeId: null,
        splitOccurred: false,
        message: '2-3-4 Tree is perfectly balanced with uniform leaf depth.',
      },
      {
        action: 'COMPLETE',
        variables: { totalNodes: nodeCount },
        callStack: [{ name: 'complete', params: { total: input.keys.length } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<TwoThreeFourTreeState>) => {
    const { root, activeVal, activeNodeId, splitOccurred, message } = frame.state;

    const renderNode = (node: TTFNodeData | null): React.ReactNode => {
      if (!node) return null;
      const isActive = node.id === activeNodeId;

      return (
        <div key={node.id} className="flex flex-col items-center space-y-3">
          <div
            className={`flex items-center rounded-xl border p-1 shadow-lg transition-all duration-200 ${
              isActive
                ? 'bg-amber-500/20 border-amber-400 shadow-amber-500/20 scale-105'
                : 'bg-slate-900/90 border-slate-700/80 shadow-slate-950/50'
            }`}
          >
            {node.keys.map((k, idx) => {
              const isTargetVal = k === activeVal;
              return (
                <div key={`k-${idx}`} className="flex items-center">
                  <div
                    className={`px-3 py-1.5 font-mono text-xs font-bold rounded-lg border ${
                      isTargetVal
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    {k}
                  </div>
                  {idx < node.keys.length - 1 && (
                    <div className="w-[1px] h-5 bg-slate-700 mx-1" />
                  )}
                </div>
              );
            })}
          </div>

          {node.children.length > 0 && (
            <div className="flex gap-4 pt-2 border-t border-slate-800 justify-center">
              {node.children.map((c) => renderNode(c))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* Tree Canvas */}
        <div className="w-full flex flex-col items-center justify-center p-8 bg-slate-950 border border-slate-800 rounded-2xl min-h-[300px] overflow-x-auto shadow-2xl">
          {root ? (
            renderNode(root)
          ) : (
            <span className="text-slate-600 font-mono text-sm italic">Empty 2-3-4 Tree</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700" />
            <span>2-Node (1 Key, 2 Ptrs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-4 rounded bg-slate-800 border border-slate-700" />
            <span>3-Node (2 Keys, 3 Ptrs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-4 rounded bg-slate-800 border border-slate-700" />
            <span>4-Node (3 Keys, 4 Ptrs)</span>
          </div>
          {splitOccurred && (
            <div className="flex items-center gap-1.5 text-amber-300 font-bold animate-pulse">
              <span>★ Preemptive Split Triggered</span>
            </div>
          )}
        </div>
      </div>
    );
  },
};
