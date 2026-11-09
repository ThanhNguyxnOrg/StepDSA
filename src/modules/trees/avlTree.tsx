import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { TreeStage, TreeStageState, TreeNode } from '../../components/stage/TreeStage';

interface AVLNodeInternal {
  id: string;
  val: number;
  height: number;
  left: AVLNodeInternal | null;
  right: AVLNodeInternal | null;
}

type ChildSide = 'left' | 'right' | 'root';

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
    python: `def insert(node, val):
    if node is None:
        return AVLNode(val)

    if val < node.val:
        node.left = insert(node.left, val)
    elif val > node.val:
        node.right = insert(node.right, val)
    else:
        return node  # duplicate ignored

    update_height(node)
    balance = get_height(node.left) - get_height(node.right)
    if balance > 1 and val < node.left.val:
        return rotate_right(node)

    if balance < -1 and val > node.right.val:
        return rotate_left(node)

    if balance > 1 and val > node.left.val:
        node.left = rotate_left(node.left)
        return rotate_right(node)

    if balance < -1 and val < node.right.val:
        node.right = rotate_right(node.right)
        return rotate_left(node)

    return node


def rotate_right(y):
    x = y.left
    T2 = x.right
    x.right = y
    y.left = T2
    update_height(y)
    update_height(x)
    return x


def rotate_left(x):
    y = x.right
    T2 = y.left
    y.left = x
    x.right = T2
    update_height(x)
    update_height(y)
    return y


def update_height(n):
    n.height = 1 + max(get_height(n.left), get_height(n.right))


def get_height(n):
    return 0 if n is None else n.height
`,
    typescript: `function insert(node: AVLNode | null, val: number): AVLNode {
  if (node === null) {
    return new AVLNode(val);
  }
  if (val < node.val) {
    node.left = insert(node.left, val);
  } else if (val > node.val) {
    node.right = insert(node.right, val);
  } else {
    return node; // duplicate ignored
  }
  updateHeight(node);
  const balance = getHeight(node.left) - getHeight(node.right);
  if (balance > 1 && val < node.left!.val) {
    return rotateRight(node);
  }
  if (balance < -1 && val > node.right!.val) {
    return rotateLeft(node);
  }
  if (balance > 1 && val > node.left!.val) {
    node.left = rotateLeft(node.left!);
    return rotateRight(node);
  }
  if (balance < -1 && val < node.right!.val) {
    node.right = rotateRight(node.right!);
    return rotateLeft(node);
  }
  return node;
}

function rotateRight(y: AVLNode): AVLNode {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeft(x: AVLNode): AVLNode {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function updateHeight(n: AVLNode): void {
  n.height = 1 + Math.max(getHeight(n.left), getHeight(n.right));
}

function getHeight(n: AVLNode | null): number {
  return n === null ? 0 : n.height;
}`,
    cpp: `Node* insert(Node* node, int val) {
    if (node == nullptr) {
        return new Node(val);
    }
    if (val < node->val) {
        node->left = insert(node->left, val);
    } else if (val > node->val) {
        node->right = insert(node->right, val);
    } else {
        return node; // duplicate ignored
    }
    updateHeight(node);
    int balance = height(node->left) - height(node->right);
    if (balance > 1 && val < node->left->val) {
        return rotateRight(node);
    }
    if (balance < -1 && val > node->right->val) {
        return rotateLeft(node);
    }
    if (balance > 1 && val > node->left->val) {
        node->left = rotateLeft(node->left);
        return rotateRight(node);
    }
    if (balance < -1 && val < node->right->val) {
        node->right = rotateRight(node->right);
        return rotateLeft(node);
    }
    return node;
}

Node* rotateRight(Node* y) {
    Node* x = y->left;
    Node* T2 = x->right;
    x->right = y;
    y->left = T2;
    updateHeight(y);
    updateHeight(x);
    return x;
}

Node* rotateLeft(Node* x) {
    Node* y = x->right;
    Node* T2 = y->left;
    y->left = x;
    x->right = T2;
    updateHeight(x);
    updateHeight(y);
    return y;
}

void updateHeight(Node* n) {
    n->height = 1 + max(height(n->left), height(n->right));
}

int height(Node* n) {
    return n == nullptr ? 0 : n->height;
}`,
    java: `Node insert(Node node, int val) {
    if (node == null) {
        return new Node(val);
    }
    if (val < node.val) {
        node.left = insert(node.left, val);
    } else if (val > node.val) {
        node.right = insert(node.right, val);
    } else {
        return node; // duplicate ignored
    }
    updateHeight(node);
    int balance = height(node.left) - height(node.right);
    if (balance > 1 && val < node.left.val) {
        return rotateRight(node);
    }
    if (balance < -1 && val > node.right.val) {
        return rotateLeft(node);
    }
    if (balance > 1 && val > node.left.val) {
        node.left = rotateLeft(node.left);
        return rotateRight(node);
    }
    if (balance < -1 && val < node.right.val) {
        node.right = rotateRight(node.right);
        return rotateLeft(node);
    }
    return node;
}

Node rotateRight(Node y) {
    Node x = y.left;
    Node T2 = x.right;
    x.right = y;
    y.left = T2;
    updateHeight(y);
    updateHeight(x);
    return x;
}

Node rotateLeft(Node x) {
    Node y = x.right;
    Node T2 = y.left;
    y.left = x;
    x.right = T2;
    updateHeight(x);
    updateHeight(y);
    return y;
}

void updateHeight(Node n) {
    n.height = 1 + Math.max(height(n.left), height(n.right));
}

int height(Node n) {
    return n == null ? 0 : n.height;
}`,
    pseudocode: `function insert(node, val):
    if node == null:
        return new Node(val)

    if val < node.val:
        node.left = insert(node.left, val)
    else if val > node.val:
        node.right = insert(node.right, val)
    else:
        return node  # duplicate ignored

    updateHeight(node)
    balance = height(node.left) - height(node.right)
    if balance > 1 and val < node.left.val:
        return rotateRight(node)

    if balance < -1 and val > node.right.val:
        return rotateLeft(node)

    if balance > 1 and val > node.left.val:
        node.left = rotateLeft(node.left)
        return rotateRight(node)

    if balance < -1 and val < node.right.val:
        node.right = rotateRight(node.right)
        return rotateLeft(node)

    return node


function rotateRight(y):
    x = y.left
    T2 = x.right
    x.right = y
    y.left = T2
    updateHeight(y)
    updateHeight(x)
    return x


function rotateLeft(x):
    y = x.right
    T2 = y.left
    y.left = x
    x.right = T2
    updateHeight(x)
    updateHeight(y)
    return y


function updateHeight(n):
    n.height = 1 + max(height(n.left), height(n.right))


function height(n):
    return n == null ? 0 : n.height
`,
  },

  generateTimeline: (input: { values: number[] }): ExecutionFrame<TreeStageState>[] => {
    const frames: ExecutionFrame<TreeStageState>[] = [];
    const values = input.values;

    const getHeight = (n: AVLNodeInternal | null): number => (n ? n.height : 0);
    const getBalance = (n: AVLNodeInternal | null): number =>
      n ? getHeight(n.left) - getHeight(n.right) : 0;

    let root: AVLNodeInternal | null = null;
    let nextNodeId = 0;
    let rotationCheckpointAdded = false;

    type RuntimeEntry = { name: string; params: Record<string, any>; line?: number };

    const runtimeStack: RuntimeEntry[] = [];

    const flattenTree = (
      r: AVLNodeInternal | null,
      x = 350,
      y = 50,
      offset = 120,
      activeVal?: number,
      pivotVal?: number,
      sortedVal?: number,
      allSorted = false
    ): TreeNode[] => {
      if (!r) return [];
      const current: TreeNode = {
        id: r.id,
        value: r.val,
        x,
        y,
        status: allSorted
          ? 'sorted'
          : r.val === pivotVal
          ? 'pivot'
          : r.val === activeVal
          ? 'active'
          : r.val === sortedVal
          ? 'sorted'
          : 'default',
        annotation: `h${r.height} bf${getBalance(r)}`,
        leftId: r.left ? r.left.id : undefined,
        rightId: r.right ? r.right.id : undefined,
      };

      const leftNodes = r.left
        ? flattenTree(r.left, x - offset, y + 65, offset / 1.8, activeVal, pivotVal, sortedVal, allSorted)
        : [];
      const rightNodes = r.right
        ? flattenTree(r.right, x + offset, y + 65, offset / 1.8, activeVal, pivotVal, sortedVal, allSorted)
        : [];

      return [current, ...leftNodes, ...rightNodes];
    };

    const stackSnapshot = (codeLine: number) => [
      {
        name: 'main',
        params: { values: values.join(', ') },
        line: 1,
        isCurrent: runtimeStack.length === 0,
      },
      ...runtimeStack.map((entry, index) => ({
        ...entry,
        line: index === runtimeStack.length - 1 ? codeLine : entry.line,
        isCurrent: index === runtimeStack.length - 1,
      })),
    ];

    const pushFrame = (options: {
      codeLine: number;
      explanation: string;
      activeVal?: number;
      pivotVal?: number;
      sortedVal?: number;
      allSorted?: boolean;
      targetValue?: number;
      milestone?: string;
      soundCue?: ExecutionFrame['soundCue'];
      variables?: Record<string, any>;
      conditionEval?: { expr: string; result: boolean };
      pedagogy?: ExecutionFrame['pedagogy'];
      checkpoint?: ExecutionFrame['checkpoint'];
      message?: string;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: options.codeLine,
        explanation: options.explanation,
        isMilestone: !!options.milestone,
        milestoneTitle: options.milestone,
        soundCue: options.soundCue ?? { type: 'step' },
        variables: options.variables,
        conditionEval: options.conditionEval,
        pedagogy: options.pedagogy,
        checkpoint: options.checkpoint,
        callStack: stackSnapshot(options.codeLine),
        state: {
          nodes: flattenTree(
            root,
            350,
            50,
            120,
            options.activeVal,
            options.pivotVal,
            options.sortedVal,
            options.allSorted
          ),
          targetValue: options.targetValue,
          message: options.message,
        },
      });
    };

    const rotationCheckpoint = (caseName: string, nodeVal: number, childVal: number) => {
      if (rotationCheckpointAdded) return undefined;
      rotationCheckpointAdded = true;
      const isDouble = caseName === 'LR' || caseName === 'RL';
      const options = isDouble
        ? [
            'Rotate the child, then rotate the parent',
            'Rotate the parent twice in the same direction',
            'Only recalculate heights; no rotation',
          ]
        : caseName === 'LL'
        ? ['Right rotation at the unbalanced node', 'Left rotation at the unbalanced node', 'No rotation needed']
        : ['Left rotation at the unbalanced node', 'Right rotation at the unbalanced node', 'No rotation needed'];
      return {
        id: `avl-${caseName.toLowerCase()}-checkpoint`,
        question: `Node ${nodeVal} has a ${caseName} imbalance. What restores the AVL invariant?`,
        options,
        correctIndex: 0,
        explanation: isDouble
          ? `The inner child ${childVal} must first be rotated so the path becomes straight; then the unbalanced node ${nodeVal} is rotated in the opposite direction.`
          : caseName === 'LL'
          ? `The left-left chain is fixed by one right rotation at ${nodeVal}; the left child becomes the new subtree root.`
          : `The right-right chain is fixed by one left rotation at ${nodeVal}; the right child becomes the new subtree root.`,
        hint: 'A single rotation fixes a straight chain; a zig-zag needs two rotations.',
      };
    };

    const attachToParent = (
      newRoot: AVLNodeInternal,
      parent: AVLNodeInternal | null,
      side: ChildSide
    ) => {
      if (!parent || side === 'root') {
        root = newRoot;
      } else if (side === 'left') {
        parent.left = newRoot;
      } else {
        parent.right = newRoot;
      }
    };

    const rotateRight = (
      y: AVLNodeInternal,
      parent: AVLNodeInternal | null,
      side: ChildSide
    ): AVLNodeInternal => {
      runtimeStack.push({ name: 'rotateRight', params: { y: y.val }, line: 31 });
      const x = y.left!;
      const t2 = x.right;

      pushFrame({
        codeLine: 31,
        explanation: `Right rotation at ${y.val}: its left subtree is too tall (BF = +${getBalance(
          y
        )}). The left child ${x.val} will become the new subtree root.`,
        activeVal: x.val,
        pivotVal: y.val,
        targetValue: y.val,
        milestone: `Right Rotate ${y.val}`,
        soundCue: { type: 'pivot' },
        variables: {
          unbalancedNode: y.val,
          balanceFactor: getBalance(y),
          newSubtreeRoot: x.val,
          T2: t2 ? t2.val : 'null',
        },
        pedagogy: {
          what: `A right rotation is chosen because the imbalance is left-left: ${y.val} has a taller left subtree.`,
          why: 'Rotating right lifts the left child and pushes the old root down on the right, reducing the left-heavy height without changing in-order order.',
          whatNext: `Capture x = ${x.val} and its right subtree T2, then rewire the three pointers.`,
        },
      });

      pushFrame({
        codeLine: 32,
        explanation: `Captured x = ${x.val} and T2 = ${t2 ? t2.val : 'null'} before changing any pointer.`,
        activeVal: x.val,
        pivotVal: y.val,
        targetValue: y.val,
        variables: { x: x.val, T2: t2 ? t2.val : 'null', y: y.val },
        pedagogy: {
          what: `x is the future root; T2 is x's right subtree that must move to y's left side.`,
          why: 'Saving T2 first prevents losing that subtree when x.right is overwritten.',
          whatNext: `Set x.right = ${y.val} and y.left = T2, then attach ${x.val} to the parent slot.`,
        },
      });

      x.right = y;
      y.left = t2;
      attachToParent(x, parent, side);

      pushFrame({
        codeLine: 34,
        explanation: `Rewired pointers: x.right = ${y.val} and y.left = ${t2 ? t2.val : 'null'}. ${x.val} is now the subtree root.`,
        activeVal: x.val,
        pivotVal: y.val,
        targetValue: y.val,
        milestone: `Rewired ${x.val} above ${y.val}`,
        soundCue: { type: 'swap' },
        variables: { newRoot: x.val, oldRoot: y.val, movedSubtree: t2 ? t2.val : 'null' },
        pedagogy: {
          what: `The parent pointer now reaches ${x.val}; ${y.val} is its right child.`,
          why: 'Both assignments are required together: x.right=y makes x the parent, and y.left=T2 preserves the BST interval that x used to own.',
          whatNext: `Recalculate heights bottom-up: first ${y.val}, then ${x.val}.`,
        },
      });

      y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
      pushFrame({
        codeLine: 36,
        explanation: `Updated height of ${y.val} to ${y.height} after its children changed.`,
        activeVal: y.val,
        pivotVal: x.val,
        targetValue: y.val,
        variables: { node: y.val, newHeight: y.height, leftHeight: getHeight(y.left), rightHeight: getHeight(y.right) },
        pedagogy: {
          what: `${y.val} is now a child, so its height must be recomputed before the new root's height.`,
          why: 'The new root height depends on y.height; updating bottom-up keeps both annotations correct.',
          whatNext: `Update the height of new root ${x.val}.`,
        },
      });

      x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
      pushFrame({
        codeLine: 37,
        explanation: `Updated height of ${x.val} to ${x.height}. The rotated subtree is balanced again.`,
        activeVal: x.val,
        pivotVal: y.val,
        targetValue: y.val,
        variables: { node: x.val, newHeight: x.height, leftHeight: getHeight(x.left), rightHeight: getHeight(x.right) },
        pedagogy: {
          what: `The new root ${x.val} has height ${x.height}.`,
          why: 'Height annotations are part of the AVL invariant; stale heights would produce wrong balance factors at ancestors.',
          whatNext: `Return ${x.val} to the caller so the parent slot can use it.`,
        },
      });

      pushFrame({
        codeLine: 38,
        explanation: `rotateRight returned ${x.val}; the subtree rooted at ${y.val} is now balanced.`,
        activeVal: x.val,
        pivotVal: y.val,
        targetValue: y.val,
        soundCue: { type: 'sorted' },
        variables: { returnedRoot: x.val, subtreeHeight: x.height },
        pedagogy: {
          what: `The rotation is complete and ${x.val} is returned as the replacement subtree root.`,
          why: 'The caller receives the new root and links it into the same parent slot, preserving the rest of the tree.',
          whatNext: 'Continue unwinding the insertion recursion and rechecking ancestor balance factors.',
        },
      });

      runtimeStack.pop();
      return x;
    };

    const rotateLeft = (
      x: AVLNodeInternal,
      parent: AVLNodeInternal | null,
      side: ChildSide
    ): AVLNodeInternal => {
      runtimeStack.push({ name: 'rotateLeft', params: { x: x.val }, line: 41 });
      const y = x.right!;
      const t2 = y.left;

      pushFrame({
        codeLine: 41,
        explanation: `Left rotation at ${x.val}: its right subtree is too tall (BF = ${getBalance(
          x
        )}). The right child ${y.val} will become the new subtree root.`,
        activeVal: y.val,
        pivotVal: x.val,
        targetValue: x.val,
        milestone: `Left Rotate ${x.val}`,
        soundCue: { type: 'pivot' },
        variables: {
          unbalancedNode: x.val,
          balanceFactor: getBalance(x),
          newSubtreeRoot: y.val,
          T2: t2 ? t2.val : 'null',
        },
        pedagogy: {
          what: `A left rotation is chosen because the imbalance is right-right: ${x.val} has a taller right subtree.`,
          why: 'Rotating left lifts the right child and pushes the old root down on the left, reducing the right-heavy height while preserving in-order order.',
          whatNext: `Capture y = ${y.val} and its left subtree T2, then rewire the three pointers.`,
        },
      });

      pushFrame({
        codeLine: 42,
        explanation: `Captured y = ${y.val} and T2 = ${t2 ? t2.val : 'null'} before changing any pointer.`,
        activeVal: y.val,
        pivotVal: x.val,
        targetValue: x.val,
        variables: { y: y.val, T2: t2 ? t2.val : 'null', x: x.val },
        pedagogy: {
          what: `y is the future root; T2 is y's left subtree that must move to x's right side.`,
          why: 'Saving T2 first prevents losing that subtree when y.left is overwritten.',
          whatNext: `Set y.left = ${x.val} and x.right = T2, then attach ${y.val} to the parent slot.`,
        },
      });

      y.left = x;
      x.right = t2;
      attachToParent(y, parent, side);

      pushFrame({
        codeLine: 44,
        explanation: `Rewired pointers: y.left = ${x.val} and x.right = ${t2 ? t2.val : 'null'}. ${y.val} is now the subtree root.`,
        activeVal: y.val,
        pivotVal: x.val,
        targetValue: x.val,
        milestone: `Rewired ${y.val} above ${x.val}`,
        soundCue: { type: 'swap' },
        variables: { newRoot: y.val, oldRoot: x.val, movedSubtree: t2 ? t2.val : 'null' },
        pedagogy: {
          what: `The parent pointer now reaches ${y.val}; ${x.val} is its left child.`,
          why: 'Both assignments are required together: y.left=x makes y the parent, and x.right=T2 preserves the BST interval that y used to own.',
          whatNext: `Recalculate heights bottom-up: first ${x.val}, then ${y.val}.`,
        },
      });

      x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
      pushFrame({
        codeLine: 46,
        explanation: `Updated height of ${x.val} to ${x.height} after its children changed.`,
        activeVal: x.val,
        pivotVal: y.val,
        targetValue: x.val,
        variables: { node: x.val, newHeight: x.height, leftHeight: getHeight(x.left), rightHeight: getHeight(x.right) },
        pedagogy: {
          what: `${x.val} is now a child, so its height must be recomputed before the new root's height.`,
          why: 'The new root height depends on x.height; updating bottom-up keeps both annotations correct.',
          whatNext: `Update the height of new root ${y.val}.`,
        },
      });

      y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
      pushFrame({
        codeLine: 47,
        explanation: `Updated height of ${y.val} to ${y.height}. The rotated subtree is balanced again.`,
        activeVal: y.val,
        pivotVal: x.val,
        targetValue: x.val,
        variables: { node: y.val, newHeight: y.height, leftHeight: getHeight(y.left), rightHeight: getHeight(y.right) },
        pedagogy: {
          what: `The new root ${y.val} has height ${y.height}.`,
          why: 'Height annotations are part of the AVL invariant; stale heights would produce wrong balance factors at ancestors.',
          whatNext: `Return ${y.val} to the caller so the parent slot can use it.`,
        },
      });

      pushFrame({
        codeLine: 48,
        explanation: `rotateLeft returned ${y.val}; the subtree rooted at ${x.val} is now balanced.`,
        activeVal: y.val,
        pivotVal: x.val,
        targetValue: x.val,
        soundCue: { type: 'sorted' },
        variables: { returnedRoot: y.val, subtreeHeight: y.height },
        pedagogy: {
          what: `The rotation is complete and ${y.val} is returned as the replacement subtree root.`,
          why: 'The caller receives the new root and links it into the same parent slot, preserving the rest of the tree.',
          whatNext: 'Continue unwinding the insertion recursion and rechecking ancestor balance factors.',
        },
      });

      runtimeStack.pop();
      return y;
    };

    const insert = (
      node: AVLNodeInternal | null,
      val: number,
      parent: AVLNodeInternal | null,
      side: ChildSide
    ): AVLNodeInternal => {
      runtimeStack.push({
        name: 'insert',
        params: { node: node ? node.val : 'null', val },
        line: 2,
      });

      if (!node) {
        const created: AVLNodeInternal = {
          id: `avl-${val}-${nextNodeId++}`,
          val,
          height: 1,
          left: null,
          right: null,
        };
        attachToParent(created, parent, side);
        pushFrame({
          codeLine: 3,
          explanation: `Reached an empty child slot: created node ${val} with height 1 and attached it to ${
            parent ? parent.val : 'the root'
          }.`,
          activeVal: val,
          sortedVal: val,
          targetValue: val,
          milestone: `Create ${val}`,
          soundCue: { type: 'insert' },
          variables: { newNode: val, height: 1, attachedTo: parent ? parent.val : 'root' },
          pedagogy: {
            what: `The BST search ended at a null child, so ${val} becomes a new leaf.`,
            why: 'A leaf is the only place where a new key can be inserted without breaking the BST ordering.',
            whatNext: 'Return up the recursion, updating heights and checking balance factors.',
          },
        });
        runtimeStack.pop();
        return created;
      }

      const goesLeft = val < node.val;
      const goesRight = val > node.val;

      if (goesLeft) {
        pushFrame({
          codeLine: 5,
          explanation: `At node ${node.val}: ${val} < ${node.val}, so the insertion path goes left.`,
          activeVal: node.val,
          targetValue: val,
          variables: { current: node.val, inserting: val, direction: 'left' },
          conditionEval: { expr: `${val} < ${node.val}`, result: true },
          pedagogy: {
            what: `The BST comparison chooses the left subtree.`,
            why: 'All keys in the left subtree are smaller than the current node, so the search space shrinks to that side.',
            whatNext: `Recurse into node ${node.val}'s left child.`,
          },
        });
      } else if (goesRight) {
        pushFrame({
          codeLine: 7,
          explanation: `At node ${node.val}: ${val} > ${node.val}, so the insertion path goes right.`,
          activeVal: node.val,
          targetValue: val,
          variables: { current: node.val, inserting: val, direction: 'right' },
          conditionEval: { expr: `${val} > ${node.val}`, result: true },
          pedagogy: {
            what: `The BST comparison chooses the right subtree.`,
            why: 'All keys in the right subtree are larger than the current node, so the search space shrinks to that side.',
            whatNext: `Recurse into node ${node.val}'s right child.`,
          },
        });
      } else {
        pushFrame({
          codeLine: 9,
          explanation: `Key ${val} already exists at node ${node.val}; AVL insertion ignores duplicates.`,
          activeVal: node.val,
          targetValue: val,
          soundCue: { type: 'discard' },
          variables: { duplicate: val, node: node.val },
          conditionEval: { expr: `${val} == ${node.val}`, result: true },
          pedagogy: {
            what: `The search found an equal key, so no new node is created.`,
            why: 'A set-like AVL tree stores each key once; inserting a duplicate would not change the logical contents.',
            whatNext: 'Return the existing node unchanged.',
          },
        });
        runtimeStack.pop();
        return node;
      }

      if (goesLeft) {
        node.left = insert(node.left, val, node, 'left');
        pushFrame({
          codeLine: 6,
          explanation: `Returned from the left subtree: ${val} is attached under ${node.val}.`,
          activeVal: val,
          sortedVal: val,
          targetValue: val,
          variables: { parent: node.val, childSide: 'left', inserted: val },
          pedagogy: {
            what: `The left child pointer of ${node.val} now reaches the updated subtree containing ${val}.`,
            why: 'The recursive call returns the subtree root, which may have changed because of a rotation.',
            whatNext: `Recompute the height of ${node.val}.`,
          },
        });
      } else {
        node.right = insert(node.right, val, node, 'right');
        pushFrame({
          codeLine: 8,
          explanation: `Returned from the right subtree: ${val} is attached under ${node.val}.`,
          activeVal: val,
          sortedVal: val,
          targetValue: val,
          variables: { parent: node.val, childSide: 'right', inserted: val },
          pedagogy: {
            what: `The right child pointer of ${node.val} now reaches the updated subtree containing ${val}.`,
            why: 'The recursive call returns the subtree root, which may have changed because of a rotation.',
            whatNext: `Recompute the height of ${node.val}.`,
          },
        });
      }

      const oldHeight = node.height;
      node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
      pushFrame({
        codeLine: 12,
        explanation: `Updated height of ${node.val}: ${oldHeight} -> ${node.height}.`,
        activeVal: node.val,
        targetValue: val,
        variables: { node: node.val, oldHeight, newHeight: node.height },
        pedagogy: {
          what: `The height of ${node.val} is recomputed from its two children.`,
          why: 'Insertion can increase a subtree height by at most one, but every ancestor on the path must refresh its cached height.',
          whatNext: `Compute the balance factor of ${node.val} to see whether a rotation is needed.`,
        },
      });

      const balance = getBalance(node);
      const balanced = Math.abs(balance) <= 1;
      pushFrame({
        codeLine: 13,
        explanation: `Balance factor at ${node.val} = height(left) - height(right) = ${balance}. ${
          balanced ? 'This is within {-1, 0, +1}.' : 'This violates the AVL invariant.'
        }`,
        activeVal: node.val,
        pivotVal: balanced ? undefined : node.val,
        targetValue: val,
        variables: {
          node: node.val,
          leftHeight: getHeight(node.left),
          rightHeight: getHeight(node.right),
          balanceFactor: balance,
          balanced,
        },
        conditionEval: { expr: `|BF| <= 1 (|${balance}| <= 1)`, result: balanced },
        pedagogy: {
          what: `The balance factor compares the two subtree heights.`,
          why: 'AVL only permits -1, 0, or +1; anything outside means the subtree must rotate before it returns to its parent.',
          whatNext: balanced
            ? 'No rotation here; return this node to the caller.'
            : 'Classify the imbalance as LL, RR, LR, or RL and rotate.',
        },
      });

      if (balance > 1 && val < node.left!.val) {
        pushFrame({
          codeLine: 14,
          explanation: `LL case at ${node.val}: BF = +${balance} and the new key ${val} lies in the left-left path. A right rotation is required.`,
          activeVal: node.left!.val,
          pivotVal: node.val,
          targetValue: val,
          milestone: `LL Imbalance at ${node.val}`,
          soundCue: { type: 'compare' },
          variables: { unbalancedNode: node.val, balanceFactor: balance, case: 'LL', child: node.left!.val },
          conditionEval: { expr: `balance > 1 && ${val} < ${node.left!.val}`, result: true },
          checkpoint: rotationCheckpoint('LL', node.val, node.left!.val),
          pedagogy: {
            what: `The insertion went left of ${node.val}, then left again inside that subtree.`,
            why: 'A straight left-left chain is fixed by one right rotation at the unbalanced node.',
            whatNext: `Rotate right at ${node.val}.`,
          },
        });
        const newRoot = rotateRight(node, parent, side);
        runtimeStack.pop();
        return newRoot;
      }

      if (balance < -1 && val > node.right!.val) {
        pushFrame({
          codeLine: 17,
          explanation: `RR case at ${node.val}: BF = ${balance} and the new key ${val} lies in the right-right path. A left rotation is required.`,
          activeVal: node.right!.val,
          pivotVal: node.val,
          targetValue: val,
          milestone: `RR Imbalance at ${node.val}`,
          soundCue: { type: 'compare' },
          variables: { unbalancedNode: node.val, balanceFactor: balance, case: 'RR', child: node.right!.val },
          conditionEval: { expr: `balance < -1 && ${val} > ${node.right!.val}`, result: true },
          checkpoint: rotationCheckpoint('RR', node.val, node.right!.val),
          pedagogy: {
            what: `The insertion went right of ${node.val}, then right again inside that subtree.`,
            why: 'A straight right-right chain is fixed by one left rotation at the unbalanced node.',
            whatNext: `Rotate left at ${node.val}.`,
          },
        });
        const newRoot = rotateLeft(node, parent, side);
        runtimeStack.pop();
        return newRoot;
      }

      if (balance > 1 && val > node.left!.val) {
        pushFrame({
          codeLine: 20,
          explanation: `LR case at ${node.val}: BF = +${balance}, but the new key ${val} is in the left child's right subtree. The child must rotate left first.`,
          activeVal: node.left!.val,
          pivotVal: node.val,
          targetValue: val,
          milestone: `LR Imbalance at ${node.val}`,
          soundCue: { type: 'compare' },
          variables: { unbalancedNode: node.val, balanceFactor: balance, case: 'LR', child: node.left!.val },
          conditionEval: { expr: `balance > 1 && ${val} > ${node.left!.val}`, result: true },
          checkpoint: rotationCheckpoint('LR', node.val, node.left!.val),
          pedagogy: {
            what: `The path bends: left into ${node.left!.val}, then right toward ${val}.`,
            why: 'A single right rotation would leave the inner subtree on the wrong side; the child must first become left-heavy.',
            whatNext: `Left-rotate child ${node.left!.val}, then right-rotate ${node.val}.`,
          },
        });
        node.left = rotateLeft(node.left!, node, 'left');
        pushFrame({
          codeLine: 21,
          explanation: `Child left rotation finished: ${node.val}'s left child is now ${node.left!.val}. The path is straight, so the parent can rotate right.`,
          activeVal: node.left!.val,
          pivotVal: node.val,
          targetValue: val,
          variables: { parent: node.val, newLeftChild: node.left!.val, case: 'LR' },
          pedagogy: {
            what: `The inner zig-zag has been converted into a left-left chain.`,
            why: 'Double rotations are just two single rotations: straighten the child path first, then rotate the unbalanced node.',
            whatNext: `Right-rotate ${node.val} to finish the LR case.`,
          },
        });
        const newRoot = rotateRight(node, parent, side);
        runtimeStack.pop();
        return newRoot;
      }

      if (balance < -1 && val < node.right!.val) {
        pushFrame({
          codeLine: 24,
          explanation: `RL case at ${node.val}: BF = ${balance}, but the new key ${val} is in the right child's left subtree. The child must rotate right first.`,
          activeVal: node.right!.val,
          pivotVal: node.val,
          targetValue: val,
          milestone: `RL Imbalance at ${node.val}`,
          soundCue: { type: 'compare' },
          variables: { unbalancedNode: node.val, balanceFactor: balance, case: 'RL', child: node.right!.val },
          conditionEval: { expr: `balance < -1 && ${val} < ${node.right!.val}`, result: true },
          checkpoint: rotationCheckpoint('RL', node.val, node.right!.val),
          pedagogy: {
            what: `The path bends: right into ${node.right!.val}, then left toward ${val}.`,
            why: 'A single left rotation would leave the inner subtree on the wrong side; the child must first become right-heavy.',
            whatNext: `Right-rotate child ${node.right!.val}, then left-rotate ${node.val}.`,
          },
        });
        node.right = rotateRight(node.right!, node, 'right');
        pushFrame({
          codeLine: 25,
          explanation: `Child right rotation finished: ${node.val}'s right child is now ${node.right!.val}. The path is straight, so the parent can rotate left.`,
          activeVal: node.right!.val,
          pivotVal: node.val,
          targetValue: val,
          variables: { parent: node.val, newRightChild: node.right!.val, case: 'RL' },
          pedagogy: {
            what: `The inner zig-zag has been converted into a right-right chain.`,
            why: 'Double rotations are just two single rotations: straighten the child path first, then rotate the unbalanced node.',
            whatNext: `Left-rotate ${node.val} to finish the RL case.`,
          },
        });
        const newRoot = rotateLeft(node, parent, side);
        runtimeStack.pop();
        return newRoot;
      }

      pushFrame({
        codeLine: 28,
        explanation: `Node ${node.val} is balanced (BF = ${balance}); return it unchanged to its parent.`,
        activeVal: node.val,
        targetValue: val,
        variables: { node: node.val, balanceFactor: balance, height: node.height },
        pedagogy: {
          what: `No rotation is needed at ${node.val}.`,
          why: 'Its subtrees differ in height by at most one, so the AVL invariant already holds here.',
          whatNext: 'Return to the caller and continue checking ancestors.',
        },
      });
      runtimeStack.pop();
      return node;
    };

    // --- Initial frame -------------------------------------------------
    pushFrame({
      codeLine: 1,
      explanation: `AVL Tree initialized. Will insert ${values.length} keys: [${values.join(
        ', '
      )}]. Each insertion walks the BST path, updates heights, and rotates only when |BF| > 1.`,
      targetValue: values[0],
      milestone: 'AVL Start',
      soundCue: { type: 'start' },
      variables: { totalKeys: values.length, nextKey: values[0] ?? 0 },
      pedagogy: {
        what: `The tree is empty; every key will be inserted through the same recursive procedure.`,
        why: 'AVL trees maintain balance during insertion rather than rebuilding the tree afterwards.',
        whatNext: `Insert the first key ${values[0] ?? 0}; it becomes the root.`,
      },
    });

    for (let valueIndex = 0; valueIndex < values.length; valueIndex++) {
      const val = values[valueIndex];
      pushFrame({
        codeLine: 1,
        explanation: `Insert key ${val}. Start at the root and follow BST comparisons until a null child slot is reached.`,
        targetValue: val,
        milestone: `Insert ${val}`,
        soundCue: { type: 'compare' },
        variables: { insertingKey: val, root: root ? root.val : 'null', treeHeight: root ? root.height : 0 },
        pedagogy: {
          what: `The insertion procedure is called with key ${val}.`,
          why: 'The BST search determines the only leaf slot where the key can be placed.',
          whatNext: 'Compare the key with the current node and descend left or right.',
        },
      });

      root = insert(root, val, null, 'root');

      pushFrame({
        codeLine: 1,
        explanation: `Insertion of ${val} complete. Root is ${root?.val ?? 'null'} with height ${
          root?.height ?? 0
        }; every node on the insertion path has been rebalanced.`,
        targetValue: val,
        sortedVal: val,
        variables: { insertedKey: val, rootVal: root?.val ?? 'null', treeHeight: root?.height ?? 0 },
        pedagogy: {
          what: `The recursive insertion has unwound completely.`,
          why: 'Each ancestor updated its height and rotated if necessary before returning, so the whole tree is balanced again.',
          whatNext:
            valueIndex === values.length - 1
              ? 'All keys are inserted; inspect the final height and balance annotations.'
              : `Insert the next key ${values[valueIndex + 1]}.`,
        },
      });
    }

    pushFrame({
      codeLine: 1,
      explanation: `🎉 All keys inserted. AVL height is ${root?.height ?? 0} with every node satisfying |BF| <= 1.`,
      targetValue: values[values.length - 1],
      allSorted: true,
      milestone: 'AVL Construction Done',
      soundCue: { type: 'complete' },
      variables: {
        finalHeight: root?.height ?? 0,
        balanceInvariant: 'Strictly Maintained',
        nodeCount: values.length,
      },
      pedagogy: {
        what: 'The final tree is shown with each node annotated by height and balance factor.',
        why: 'AVL guarantees O(log N) height, which is why search, insert, and delete stay logarithmic.',
        whatNext: 'Try the LL, RR, LR, and RL presets to compare single and double rotations.',
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <TreeStage state={frame.state} projection={projection} />;
  },
};
