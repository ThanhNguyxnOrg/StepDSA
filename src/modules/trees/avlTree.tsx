import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { TreeStage, TreeStageState, TreeNode } from '../../components/stage/TreeStage';

interface AVLNodeInternal {
  id: string;
  val: number;
  height: number;
  left: AVLNodeInternal | null;
  right: AVLNodeInternal | null;
}

export const avlTreeModule: AlgorithmModule<{ values: number[] }, TreeStageState> = {
  id: 'avl-tree',
  title: 'AVL Tree (Self-Balancing Rotations)',
  category: 'trees-bst',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(log N)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(log N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Strictly bounded height <= 1.44 log2(N); all operations guaranteed O(log N)',
  },
  theory: {
    overview:
      'An AVL Tree is a strictly self-balancing Binary Search Tree where the heights of the two child subtrees of any node differ by at most one (Balance Factor in {-1, 0, +1}). Whenever an insertion or deletion violates this invariant, tree rotations (LL, RR, LR, RL) restore balance in O(1) time per node.',
    whyItWorks:
      'Tree rotations alter pointer references to change tree topology and reduce height while preserving the fundamental BST in-order traversal ordering.',
    invariant:
      'For every node X: |Height(X.left) - Height(X.right)| <= 1, and all left keys < X.val < all right keys.',
    pitfalls: [
      'Forgetting to update node heights during rotations leads to erroneous balance factors in ancestor frames.',
      'Double rotations (LR, RL) require rotating the child first before rotating the unbalanced parent.',
    ],
  },
  presets: [
    {
      id: 'right-heavy',
      label: 'RR Case (Left Rotation)',
      description: 'Consecutive ascending insertions [10, 20, 30]',
      data: { values: [10, 20, 30] },
    },
    {
      id: 'left-heavy',
      label: 'LL Case (Right Rotation)',
      description: 'Consecutive descending insertions [30, 20, 10]',
      data: { values: [30, 20, 10] },
    },
    {
      id: 'double-lr',
      label: 'LR Case (Double Rotation)',
      description: 'Zigzag insertion [30, 10, 20]',
      data: { values: [30, 10, 20] },
    },
    {
      id: 'balanced-multi',
      label: 'Multi-Node AVL',
      description: 'Sequence: [10, 20, 30, 40, 50, 25]',
      data: { values: [10, 20, 30, 40, 50, 25] },
    },
  ],
  defaultInput: { values: [10, 20, 30, 40, 50, 25] },
  codeSnippets: {
    python: `def right_rotate(y):
    x = y.left
    T2 = x.right
    x.right = y
    y.left = T2
    y.height = 1 + max(get_h(y.left), get_h(y.right))
    x.height = 1 + max(get_h(x.left), get_h(x.right))
    return x

def left_rotate(x):
    y = x.right
    T2 = y.left
    y.left = x
    x.right = T2
    x.height = 1 + max(get_h(x.left), get_h(x.right))
    y.height = 1 + max(get_h(y.left), get_h(y.right))
    return y`,
    typescript: `function rightRotate(y: AVLNode): AVLNode {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  y.height = 1 + Math.max(getH(y.left), getH(y.right));
  x.height = 1 + Math.max(getH(x.left), getH(x.right));
  return x;
}

function leftRotate(x: AVLNode): AVLNode {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  x.height = 1 + Math.max(getH(x.left), getH(x.right));
  y.height = 1 + Math.max(getH(y.left), getH(y.right));
  return y;
}`,
    cpp: `Node* rightRotate(Node* y) {
    Node* x = y->left;
    Node* T2 = x->right;
    x->right = y;
    y->left = T2;
    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;
    return x;
}

Node* leftRotate(Node* x) {
    Node* y = x->right;
    Node* T2 = y->left;
    y->left = x;
    x->right = T2;
    x->height = max(height(x->left), height(x->right)) + 1;
    y->height = max(height(y->left), height(y->right)) + 1;
    return y;
}`,
    java: `Node rightRotate(Node y) {
    Node x = y.left;
    Node T2 = x.right;
    x.right = y;
    y.left = T2;
    y.height = Math.max(height(y.left), height(y.right)) + 1;
    x.height = Math.max(height(x.left), height(x.right)) + 1;
    return x;
}

Node leftRotate(Node x) {
    Node y = x.right;
    Node T2 = y.left;
    y.left = x;
    x.right = T2;
    x.height = Math.max(height(x.left), height(x.right)) + 1;
    y.height = Math.max(height(y.left), height(y.right)) + 1;
    return y;
}`,
    pseudocode: `function rightRotate(y):
    x = y.left
    T2 = x.right
    x.right = y
    y.left = T2
    updateHeight(y)
    updateHeight(x)
    return x`,
  },

  generateTimeline: (input: { values: number[] }): ExecutionFrame<TreeStageState>[] => {
    const frames: ExecutionFrame<TreeStageState>[] = [];
    const values = input.values;

    const getHeight = (n: AVLNodeInternal | null): number => (n ? n.height : 0);
    const getBalance = (n: AVLNodeInternal | null): number =>
      n ? getHeight(n.left) - getHeight(n.right) : 0;

    let root: AVLNodeInternal | null = null;

    const flattenTree = (
      r: AVLNodeInternal | null,
      x = 350,
      y = 50,
      offset = 120,
      activeVal?: number,
      pivotVal?: number
    ): TreeNode[] => {
      if (!r) return [];
      const current: TreeNode = {
        id: r.id,
        value: r.val,
        x,
        y,
        status:
          r.val === pivotVal
            ? 'pivot'
            : r.val === activeVal
            ? 'active'
            : 'default',
        leftId: r.left ? r.left.id : undefined,
        rightId: r.right ? r.right.id : undefined,
      };

      const leftNodes = r.left
        ? flattenTree(r.left, x - offset, y + 65, offset / 1.8, activeVal, pivotVal)
        : [];
      const rightNodes = r.right
        ? flattenTree(r.right, x + offset, y + 65, offset / 1.8, activeVal, pivotVal)
        : [];

      return [current, ...leftNodes, ...rightNodes];
    };

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `AVL Tree initialized. Will insert ${values.length} keys: [${values.join(', ')}]. Height balanced invariant strictly maintained.`,
      isMilestone: true,
      milestoneTitle: 'AVL Start',
      soundCue: 'start',
      scopeVariables: { totalKeys: values.length, nextKey: values[0] ?? 0 },
      callStack: [
        { name: `insert(root, ${values[0] ?? 0})`, params: { val: values[0] ?? 0 }, line: 5, isCurrent: true },
        { name: 'main()', params: { totalKeys: values.length }, line: 1 },
      ],
      state: { nodes: [], targetValue: values[0] },
    });

    const rightRotate = (y: AVLNodeInternal): AVLNodeInternal => {
      const x = y.left!;
      const T2 = x.right;
      x.right = y;
      y.left = T2;
      y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
      x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
      return x;
    };

    const leftRotate = (x: AVLNodeInternal): AVLNodeInternal => {
      const y = x.right!;
      const T2 = y.left;
      y.left = x;
      x.right = T2;
      x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
      y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
      return y;
    };

    const insert = (node: AVLNodeInternal | null, val: number): AVLNodeInternal => {
      if (!node) {
        return {
          id: `avl-${val}`,
          val,
          height: 1,
          left: null,
          right: null,
        };
      }

      if (val < node.val) {
        node.left = insert(node.left, val);
      } else if (val > node.val) {
        node.right = insert(node.right, val);
      } else {
        return node;
      }

      node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
      const balance = getBalance(node);

      // LL Case
      if (balance > 1 && val < node.left!.val) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 1,
          explanation: `⚠️ Balance violation at node ${node.val} (BF = +${balance}). Left-Left (LL) condition detected. Performing RIGHT ROTATION.`,
          isMilestone: true,
          milestoneTitle: `Right Rotate (${node.val})`,
          soundCue: 'swap',
          scopeVariables: { unbalancedNode: node.val, balanceFactor: balance, rotation: 'Right' },
          state: { nodes: flattenTree(root, 350, 50, 120, undefined, node.val) },
        });
        return rightRotate(node);
      }

      // RR Case
      if (balance < -1 && val > node.right!.val) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `⚠️ Balance violation at node ${node.val} (BF = ${balance}). Right-Right (RR) condition detected. Performing LEFT ROTATION.`,
          isMilestone: true,
          milestoneTitle: `Left Rotate (${node.val})`,
          soundCue: 'swap',
          scopeVariables: { unbalancedNode: node.val, balanceFactor: balance, rotation: 'Left' },
          state: { nodes: flattenTree(root, 350, 50, 120, undefined, node.val) },
        });
        return leftRotate(node);
      }

      // LR Case
      if (balance > 1 && val > node.left!.val) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 1,
          explanation: `⚠️ Balance violation at node ${node.val} (BF = +${balance}). Left-Right (LR) condition. 1) Left rotate child ${node.left!.val}.`,
          isMilestone: true,
          milestoneTitle: `LR: Left Rotate Child (${node.left!.val})`,
          soundCue: 'swap',
          scopeVariables: { unbalancedNode: node.val, balanceFactor: balance, step: 'Child left rotate' },
          state: { nodes: flattenTree(root, 350, 50, 120, node.left!.val, node.val) },
        });
        node.left = leftRotate(node.left!);
        return rightRotate(node);
      }

      // RL Case
      if (balance < -1 && val < node.right!.val) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `⚠️ Balance violation at node ${node.val} (BF = ${balance}). Right-Left (RL) condition. 1) Right rotate child ${node.right!.val}.`,
          isMilestone: true,
          milestoneTitle: `RL: Right Rotate Child (${node.right!.val})`,
          soundCue: 'swap',
          scopeVariables: { unbalancedNode: node.val, balanceFactor: balance, step: 'Child right rotate' },
          state: { nodes: flattenTree(root, 350, 50, 120, node.right!.val, node.val) },
        });
        node.right = rightRotate(node.right!);
        return leftRotate(node);
      }

      return node;
    };

    for (const val of values) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 1,
        explanation: `Inserting key ${val} into AVL tree. Walking BST path from root.`,
        soundCue: 'compare',
        isMilestone: true,
        milestoneTitle: `Insert ${val}`,
        scopeVariables: { insertingKey: val },
        state: { nodes: flattenTree(root, 350, 50, 120, val) },
      });

      root = insert(root, val);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Key ${val} placed. Subtree balance factors checked and verified within {-1, 0, +1}.`,
        soundCue: 'sorted',
        scopeVariables: { insertedKey: val, rootVal: root.val, treeHeight: root.height },
        state: { nodes: flattenTree(root, 350, 50, 120) },
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      explanation: `🎉 All keys successfully inserted! AVL Tree height is optimal (Height: ${root?.height || 0}).`,
      isMilestone: true,
      milestoneTitle: 'AVL Construction Done',
      soundCue: 'complete',
      scopeVariables: { finalHeight: root?.height || 0, balanceInvariant: 'Strictly Maintained' },
      state: { nodes: flattenTree(root, 350, 50, 120) },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <TreeStage state={frame.state} projection={projection} />;
  },
};
