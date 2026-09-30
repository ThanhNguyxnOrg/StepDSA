import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export type NodeColor = 'RED' | 'BLACK';

export interface RBNode {
  key: number;
  color: NodeColor;
  left: RBNode | null;
  right: RBNode | null;
}

export interface RedBlackTreeState {
  tree: RBNode | null;
  activeKey: number | null;
  recolorEvent: string | null;
  rotationEvent: string | null;
  insertedKey: number | null;
}

export const redBlackTreeModule: AlgorithmModule<
  { keys: number[] },
  RedBlackTreeState
> = {
  id: 'red-black-tree',
  title: 'Red-Black Tree (Color Invariants & Recoloring Rotations O(log N))',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(log N)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(log N)',
    spaceAuxiliary: 'O(N) node storage and O(log N) recursion stack',
    worstCaseCondition: 'Strictly bounded by 2 * log2(N + 1) height across all inputs',
  },
  theory: {
    overview:
      'A Red-Black Tree is a self-balancing binary search tree that uses node coloring (Red or Black) and recoloring/rotation rules to guarantee maximum height <= 2 * log2(N + 1).',
    whyItWorks:
      'Five core properties enforce balance: (1) Every node is Red or Black. (2) Root is Black. (3) Leaves are Black. (4) If a node is Red, both children are Black (no two consecutive Reds). (5) Every path from any node to its descendant leaves contains the same number of Black nodes (Black-Height).',
    invariant:
      'Black-Height Invariant: Every path from the root to any null leaf contains an identical count of Black nodes.',
    pitfalls: [
      'Violating property 4 by inserting a new node as Black (always insert as Red, then fix).',
      'Forgetting to enforce root as Black after recoloring propagations.',
    ],
  },
  presets: [
    {
      id: 'classic-rb-inserts',
      label: 'Sequential Insert: [10, 20, 30, 15, 25]',
      description: 'Triggers uncle recoloring and left-right rotations',
      data: { keys: [10, 20, 30, 15, 25] },
    },
    {
      id: 'descending-keys',
      label: 'Strictly Descending: [50, 40, 30, 20, 10]',
      description: 'Right rotations resolve repeated Red-Red left collisions',
      data: { keys: [50, 40, 30, 20, 10] },
    },
  ],
  defaultInput: { keys: [10, 20, 30, 15, 25] },
  codeSnippets: {
    cpp: `void insertFixup(Node*& root, Node* z) {
    while (z->parent && z->parent->color == RED) {
        if (z->parent == z->parent->parent->left) {
            Node* y = z->parent->parent->right; // Uncle
            if (y && y->color == RED) { // Case 1: Uncle is Red
                z->parent->color = BLACK;
                y->color = BLACK;
                z->parent->parent->color = RED;
                z = z->parent->parent;
            } else {
                if (z == z->parent->right) { // Case 2: Triangle
                    z = z->parent;
                    leftRotate(root, z);
                }
                z->parent->color = BLACK; // Case 3: Line
                z->parent->parent->color = RED;
                rightRotate(root, z->parent->parent);
            }
        } else { /* Symmetric right branch */ }
    }
    root->color = BLACK;
}`,
    python: `def insert_fixup(root, z):
    while z.parent and z.parent.color == 'RED':
        if z.parent == z.parent.parent.left:
            uncle = z.parent.parent.right
            if uncle and uncle.color == 'RED':
                z.parent.color = 'BLACK'
                uncle.color = 'BLACK'
                z.parent.parent.color = 'RED'
                z = z.parent.parent
            else:
                if z == z.parent.right:
                    z = z.parent
                    left_rotate(root, z)
                z.parent.color = 'BLACK'
                z.parent.parent.color = 'RED'
                right_rotate(root, z.parent.parent)
        else: # Symmetric case
            ...
    root.color = 'BLACK'`,
    typescript: `function insertFixup(root: RBNode, z: RBNode): RBNode {
  // Case 1: Uncle is Red -> Recolor parent, uncle, and grandparent
  // Case 2: Uncle is Black (triangle) -> Rotate child
  // Case 3: Uncle is Black (line) -> Rotate grandparent & swap colors
  root.color = 'BLACK';
  return root;
}`,
    java: `void insertFixup(Node z) {
    while (z.parent != null && z.parent.color == RED) {
        if (z.parent == z.parent.parent.left) {
            Node uncle = z.parent.parent.right;
            if (uncle != null && uncle.color == RED) {
                z.parent.color = BLACK; uncle.color = BLACK;
                z.parent.parent.color = RED; z = z.parent.parent;
            } else {
                if (z == z.parent.right) { z = z.parent; leftRotate(z); }
                z.parent.color = BLACK; z.parent.parent.color = RED;
                rightRotate(z.parent.parent);
            }
        }
    }
    root.color = BLACK;
}`,
    pseudocode: `function insertFixup(root, z):
    while z.parent.color == RED:
        if uncle is RED:
            recolor parent and uncle BLACK
            recolor grandparent RED
            z = grandparent
        else:
            if z is inner child: rotate parent
            recolor parent BLACK, grandparent RED
            rotate grandparent
    root.color = BLACK`,
  },
  generateTimeline: (input: { keys: number[] }): ExecutionFrame<RedBlackTreeState>[] => {
    const rawKeys = input?.keys?.length ? input.keys : [10, 20, 30, 15, 25];
    const frames: ExecutionFrame<RedBlackTreeState>[] = [];

    // Internal node with parent pointers for full Red-Black logic
    interface InternalNode {
      key: number;
      color: NodeColor;
      left: InternalNode | null;
      right: InternalNode | null;
      parent: InternalNode | null;
    }

    function toRBNode(n: InternalNode | null): RBNode | null {
      if (!n) return null;
      return {
        key: n.key,
        color: n.color,
        left: toRBNode(n.left),
        right: toRBNode(n.right),
      };
    }

    let root: InternalNode | null = null;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      state: {
        tree: null,
        activeKey: null,
        recolorEvent: null,
        rotationEvent: null,
        insertedKey: null,
      },
      callStack: [{ name: 'initRBTree', params: { totalKeys: rawKeys.length } }],
      variables: { totalKeys: rawKeys.length, status: 'Empty tree' },
      explanation: `Initialized Red-Black tree. Ready to insert [${rawKeys.join(', ')}].`,
    });

    function leftRotate(x: InternalNode) {
      const y = x.right!;
      x.right = y.left;
      if (y.left) y.left.parent = x;
      y.parent = x.parent;
      if (!x.parent) root = y;
      else if (x === x.parent.left) x.parent.left = y;
      else x.parent.right = y;
      y.left = x;
      x.parent = y;
    }

    function rightRotate(y: InternalNode) {
      const x = y.left!;
      y.left = x.right;
      if (x.right) x.right.parent = y;
      x.parent = y.parent;
      if (!y.parent) root = x;
      else if (y === y.parent.left) y.parent.left = x;
      else y.parent.right = x;
      x.right = y;
      y.parent = x;
    }

    for (const key of rawKeys) {
      const z: InternalNode = {
        key,
        color: 'RED',
        left: null,
        right: null,
        parent: null,
      };

      let y: InternalNode | null = null;
      let x = root;
      while (x) {
        y = x;
        if (z.key < x.key) x = x.left;
        else x = x.right;
      }
      z.parent = y;
      if (!y) root = z;
      else if (z.key < y.key) y.left = z;
      else y.right = z;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 10,
        action: 'INSERT_RED',
        state: {
          tree: toRBNode(root),
          activeKey: key,
          recolorEvent: null,
          rotationEvent: null,
          insertedKey: key,
        },
        callStack: [{ name: 'insert', params: { key, color: 'RED' } }],
        variables: { insertedKey: key, initialColor: 'RED' },
        explanation: `Inserted key ${key} as RED leaf. Checking Red-Black properties.`,
      });

      // Fixup logic
      let curr = z;
      while (curr.parent && curr.parent.color === 'RED') {
        const grandParent = curr.parent.parent;
        if (!grandParent) break;

        if (curr.parent === grandParent.left) {
          const uncle = grandParent.right;
          if (uncle && uncle.color === 'RED') {
            curr.parent.color = 'BLACK';
            uncle.color = 'BLACK';
            grandParent.color = 'RED';
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 15,
              action: 'RECOLOR_CASE_1',
              state: {
                tree: toRBNode(root),
                activeKey: curr.key,
                recolorEvent: `Uncle ${uncle.key} is RED: recolored parent & uncle to BLACK, grandparent ${grandParent.key} to RED`,
                rotationEvent: null,
                insertedKey: key,
              },
              callStack: [{ name: 'recolor', params: { parent: curr.parent.key, uncle: uncle.key, grandParent: grandParent.key } }],
              variables: { case: 'Case 1 (Red Uncle)', parent: curr.parent.key, uncle: uncle.key },
              explanation: `Case 1: Uncle ${uncle.key} is RED. Recolor parent and uncle to BLACK, grandparent ${grandParent.key} to RED.`,
            });
            curr = grandParent;
          } else {
            if (curr === curr.parent.right) {
              curr = curr.parent;
              leftRotate(curr);
              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 18,
                action: 'ROTATE_CASE_2',
                state: {
                  tree: toRBNode(root),
                  activeKey: curr.key,
                  recolorEvent: null,
                  rotationEvent: `Left rotate on ${curr.key} to transform triangle to line`,
                  insertedKey: key,
                },
                callStack: [{ name: 'leftRotate', params: { pivot: curr.key } }],
                variables: { case: 'Case 2 (Triangle)', pivot: curr.key },
                explanation: `Case 2: Inner triangle formed. Left rotate on ${curr.key} to align into linear path.`,
              });
            }
            if (curr.parent) curr.parent.color = 'BLACK';
            grandParent.color = 'RED';
            rightRotate(grandParent);
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 22,
              action: 'ROTATE_CASE_3',
              state: {
                tree: toRBNode(root),
                activeKey: curr.key,
                recolorEvent: `Recolor parent BLACK, grandparent ${grandParent.key} RED`,
                rotationEvent: `Right rotate on ${grandParent.key}`,
                insertedKey: key,
              },
              callStack: [{ name: 'rightRotate', params: { pivot: grandParent.key } }],
              variables: { case: 'Case 3 (Line)', pivot: grandParent.key },
              explanation: `Case 3: Linear Red-Red conflict. Right rotated on ${grandParent.key} and swapped colors.`,
            });
          }
        } else {
          // Symmetric right side
          const uncle = grandParent.left;
          if (uncle && uncle.color === 'RED') {
            curr.parent.color = 'BLACK';
            uncle.color = 'BLACK';
            grandParent.color = 'RED';
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 15,
              action: 'RECOLOR_CASE_1_SYM',
              state: {
                tree: toRBNode(root),
                activeKey: curr.key,
                recolorEvent: `Symmetric: Uncle ${uncle.key} is RED: recolored parent & uncle to BLACK, grandparent ${grandParent.key} to RED`,
                rotationEvent: null,
                insertedKey: key,
              },
              callStack: [{ name: 'recolor', params: { parent: curr.parent.key, uncle: uncle.key, grandParent: grandParent.key } }],
              variables: { case: 'Case 1 (Symmetric)', parent: curr.parent.key, uncle: uncle.key },
              explanation: `Symmetric Case 1: Recolor parent and uncle to BLACK, grandparent to RED.`,
            });
            curr = grandParent;
          } else {
            if (curr === curr.parent.left) {
              curr = curr.parent;
              rightRotate(curr);
              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 18,
                action: 'ROTATE_CASE_2_SYM',
                state: {
                  tree: toRBNode(root),
                  activeKey: curr.key,
                  recolorEvent: null,
                  rotationEvent: `Right rotate on ${curr.key}`,
                  insertedKey: key,
                },
                callStack: [{ name: 'rightRotate', params: { pivot: curr.key } }],
                variables: { case: 'Case 2 (Symmetric Triangle)', pivot: curr.key },
                explanation: `Symmetric Case 2: Right rotate on ${curr.key}.`,
              });
            }
            if (curr.parent) curr.parent.color = 'BLACK';
            grandParent.color = 'RED';
            leftRotate(grandParent);
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 22,
              action: 'ROTATE_CASE_3_SYM',
              state: {
                tree: toRBNode(root),
                activeKey: curr.key,
                recolorEvent: `Recolor parent BLACK, grandparent ${grandParent.key} RED`,
                rotationEvent: `Left rotate on ${grandParent.key}`,
                insertedKey: key,
              },
              callStack: [{ name: 'leftRotate', params: { pivot: grandParent.key } }],
              variables: { case: 'Case 3 (Symmetric Line)', pivot: grandParent.key },
              explanation: `Symmetric Case 3: Left rotate on ${grandParent.key}.`,
            });
          }
        }
      }

      if (root && root.color !== 'BLACK') {
        root.color = 'BLACK';
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 25,
          action: 'ROOT_BLACK',
          state: {
            tree: toRBNode(root),
            activeKey: root.key,
            recolorEvent: 'Root recolored to BLACK',
            rotationEvent: null,
            insertedKey: key,
          },
          callStack: [{ name: 'enforceRootBlack', params: { rootKey: root.key } }],
          variables: { rootKey: root.key, color: 'BLACK' },
          explanation: `Enforced Property 2: Root node ${root.key} recolored to BLACK.`,
        });
      }
    }

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<RedBlackTreeState>) => {
    const { tree, activeKey, recolorEvent, rotationEvent, insertedKey } = frame.state;

    interface VisualRBNode {
      key: number;
      color: NodeColor;
      x: number;
      y: number;
      left: VisualRBNode | null;
      right: VisualRBNode | null;
    }

    function layoutTree(
      node: RBNode | null,
      x: number,
      y: number,
      dx: number
    ): VisualRBNode | null {
      if (!node) return null;
      return {
        key: node.key,
        color: node.color,
        x,
        y,
        left: layoutTree(node.left, x - dx, y + 60, dx * 0.55),
        right: layoutTree(node.right, x + dx, y + 60, dx * 0.55),
      };
    }

    const visualRoot = layoutTree(tree, 240, 45, 110);
    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const nodesList: { key: number; color: NodeColor; x: number; y: number }[] = [];

    function collectVisuals(vn: VisualRBNode | null) {
      if (!vn) return;
      nodesList.push({ key: vn.key, color: vn.color, x: vn.x, y: vn.y });
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
        <div className="flex flex-col gap-2 w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Current Insert:</span>
              <span className="font-mono text-sm font-bold bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-0.5 rounded">
                Key {insertedKey ?? 'None'}
              </span>
            </div>
            {rotationEvent && (
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded animate-pulse">
                {rotationEvent}
              </span>
            )}
          </div>
          {recolorEvent && (
            <div className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-1 rounded">
              {recolorEvent}
            </div>
          )}
        </div>

        {/* Tree SVG */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 w-full">
          <svg width="480" height="280" className="overflow-visible">
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

            {nodesList.map((n) => {
              const isTarget = activeKey === n.key;
              const isRed = n.color === 'RED';

              return (
                <g key={n.key} className="transition-all duration-300">
                  {isTarget && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="26"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="20"
                    fill={isRed ? '#dc2626' : '#020617'}
                    stroke={isTarget ? '#fbbf24' : isRed ? '#ef4444' : '#475569'}
                    strokeWidth="3"
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    fill={isRed ? '#fef2f2' : '#f8fafc'}
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {n.key}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-red-500 inline-block" />
            <span>RED Node (No two consecutive REDs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-950 border border-slate-600 inline-block" />
            <span>BLACK Node (Identical path Black-Height)</span>
          </div>
        </div>
      </div>
    );
  },
};
