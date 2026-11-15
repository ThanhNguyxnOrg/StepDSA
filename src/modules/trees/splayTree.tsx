import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SplayNode {
  key: number;
  left: SplayNode | null;
  right: SplayNode | null;
}

export interface SplayTreeState {
  tree: SplayNode | null;
  splayedKey: number | null;
  operation: 'ZIG' | 'ZIG_ZIG' | 'ZIG_ZAG' | 'SEARCH' | 'INSERT' | 'NONE';
  description: string;
}

function cloneSplay(node: SplayNode | null): SplayNode | null {
  if (!node) return null;
  return {
    key: node.key,
    left: cloneSplay(node.left),
    right: cloneSplay(node.right),
  };
}

export const splayTreeModule: AlgorithmModule<
  { keys: number[]; searchKey: number },
  SplayTreeState
> = {
  id: 'splay-tree',
  title: 'Splay Tree (Self-Adjusting Zig-Zig & Zig-Zag Heuristics O(log N Amortized))',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log N) amortized',
    timeWorst: 'O(N) single operation, O(M log N) sequence',
    spaceAuxiliary: 'O(N) node storage and recursion call stack',
    worstCaseCondition: 'Degenerate linear chain before splaying reorganizes the tree',
  },
  theory: {
    overview:
      'A Splay Tree is a self-adjusting binary search tree invented by Daniel Sleator and Robert Tarjan. Every operation (search, insert, delete) moves the accessed element to the root via a sequence of tree rotations called splaying.',
    whyItWorks:
      'Splaying uses three rotation patterns: Zig (parent is root), Zig-Zig (node and parent are both left or right children), and Zig-Zag (node and parent are opposite children). Splaying halves the depth of nearly all nodes along the access path, guaranteeing O(log N) amortized time.',
    invariant:
      'Amortized Balance Invariant: Any sequence of M operations on an N-node splay tree takes O(M log N) total time (Potential function Φ = sum(log size(v))).',
    pitfalls: [
      'Performing two single rotations instead of a true Zig-Zig (rotating grandparent first in Zig-Zig is required to halve path depths).',
      'Assuming individual operations are guaranteed O(log N) worst-case (individual operations can take O(N)).',
    ],
  },
  presets: [
    {
      id: 'classic-splay-search',
      label: 'Search Deep Key 10 in [50, 30, 20, 10]',
      description: 'Splays key 10 all the way to root using Zig-Zig rotations',
      data: {
        keys: [50, 30, 20, 10],
        searchKey: 10,
      },
    },
    {
      id: 'zig-zag-case',
      label: 'Zig-Zag Splay: Keys [50, 20, 35], Search 35',
      description: 'Demonstrates double alternating Zig-Zag rotation',
      data: {
        keys: [50, 20, 35],
        searchKey: 35,
      },
    },
  ],
  defaultInput: {
    keys: [50, 30, 20, 10],
    searchKey: 10,
  },
  codeSnippets: {
    cpp: `Node* rightRotate(Node* x) {
    Node* y = x->left;
    x->left = y->right;
    y->right = x;
    return y;
}
Node* leftRotate(Node* x) {
    Node* y = x->right;
    x->right = y->left;
    y->left = x;
    return y;
}
Node* splay(Node* root, int key) {
    if (!root || root->key == key) return root;
    if (key < root->key) {
        if (!root->left) return root;
        if (key < root->left->key) { // Zig-Zig (Left Left)
            root->left->left = splay(root->left->left, key);
            root = rightRotate(root);
        } else if (key > root->left->key) { // Zig-Zag (Left Right)
            root->left->right = splay(root->left->right, key);
            if (root->left->right) root->left = leftRotate(root->left);
        }
        return (root->left) ? rightRotate(root) : root;
    } else {
        if (!root->right) return root;
        if (key > root->right->key) { // Zig-Zig (Right Right)
            root->right->right = splay(root->right->right, key);
            root = leftRotate(root);
        } else if (key < root->right->key) { // Zig-Zag (Right Left)
            root->right->left = splay(root->right->left, key);
            if (root->right->left) root->right = rightRotate(root->right);
        }
        return (root->right) ? leftRotate(root) : root;
    }
}`,
    python: `def right_rotate(x):
    y = x.left
    x.left = y.right
    y.right = x
    return y

def left_rotate(x):
    y = x.right
    x.right = y.left
    y.left = x
    return y

def splay(root, key):
    if not root or root.key == key: return root
    if key < root.key:
        if not root.left: return root
        if key < root.left.key: # Zig-Zig
            root.left.left = splay(root.left.left, key)
            root = right_rotate(root)
        elif key > root.left.key: # Zig-Zag
            root.left.right = splay(root.left.right, key)
            if root.left.right: root.left = left_rotate(root.left)
        return right_rotate(root) if root.left else root
    else:
        if not root.right: return root
        if key > root.right.key: # Zig-Zig
            root.right.right = splay(root.right.right, key)
            root = left_rotate(root)
        elif key < root.right.key: # Zig-Zag
            root.right.left = splay(root.right.left, key)
            if root.right.left: root.right = right_rotate(root.right)
        return left_rotate(root) if root.right else root`,
    typescript: `function rightRotate(x: SplayNode): SplayNode {
  const y = x.left!; x.left = y.right; y.right = x; return y;
}
function leftRotate(x: SplayNode): SplayNode {
  const y = x.right!; x.right = y.left; y.left = x; return y;
}
function splay(root: SplayNode | null, key: number): SplayNode | null {
  if (!root || root.key === key) return root;
  if (key < root.key) {
    if (!root.left) return root;
    if (key < root.left.key) {
      root.left.left = splay(root.left.left, key);
      root = rightRotate(root);
    } else if (key > root.left.key) {
      root.left.right = splay(root.left.right, key);
      if (root.left.right) root.left = leftRotate(root.left);
    }
    return root.left ? rightRotate(root) : root;
  } else {
    if (!root.right) return root;
    if (key > root.right.key) {
      root.right.right = splay(root.right.right, key);
      root = leftRotate(root);
    } else if (key < root.right.key) {
      root.right.left = splay(root.right.left, key);
      if (root.right.left) root.right = rightRotate(root.right);
    }
    return root.right ? leftRotate(root) : root;
  }
}`,
    java: `SplayNode rightRotate(SplayNode x) {
    SplayNode y = x.left; x.left = y.right; y.right = x; return y;
}
SplayNode leftRotate(SplayNode x) {
    SplayNode y = x.right; x.right = y.left; y.left = x; return y;
}
SplayNode splay(SplayNode root, int key) {
    if (root == null || root.key == key) return root;
    if (key < root.key) {
        if (root.left == null) return root;
        if (key < root.left.key) {
            root.left.left = splay(root.left.left, key);
            root = rightRotate(root);
        } else if (key > root.left.key) {
            root.left.right = splay(root.left.right, key);
            if (root.left.right != null) root.left = leftRotate(root.left);
        }
        return root.left != null ? rightRotate(root) : root;
    } else {
        if (root.right == null) return root;
        if (key > root.right.key) {
            root.right.right = splay(root.right.right, key);
            root = leftRotate(root);
        } else if (key < root.right.key) {
            root.right.left = splay(root.right.left, key);
            if (root.right.left != null) root.right = rightRotate(root.right);
        }
        return root.right != null ? leftRotate(root) : root;
    }
}`,
    pseudocode: `function splay(root, key):
    if root is null: return null
    # Phase 1 — search to build the access path
    path = []; curr = root
    while curr and curr.key != key:
        path.append(curr); curr = key < curr.key ? curr.left : curr.right
    # curr is the target node (or null when absent)
    # Phase 2 — bottom-up splay, two levels per iteration
    # --- Case Zig / Zag: parent is the root ---
    if parent.left == curr: root = rightRotate(parent)     # Zig
    else:
        root = leftRotate(parent)                          # Zag
    # --- Case Zig-Zig: grandparent, parent, node all on the left spine ---
    # Bottom-up order: rotate the grandparent first, then the parent
    # (identify the LL configuration on the access path)
    newG = rightRotate(grandparent)                        # part 1
    attach(greatGrandparent, grandparent, newG)
    newP = rightRotate(newG)                               # part 2
    attach(greatGrandparent, newG, newP)
    # node ascended two levels; continue from its new parent
    # --- Case Zag-Zag: mirrored (right-right) ---
    newG = leftRotate(grandparent)                         # part 1
    attach(greatGrandparent, grandparent, newG)
    newP = leftRotate(newG)                                # part 2
    attach(greatGrandparent, newG, newP)
    # node ascended two levels
    # --- Case Zig-Zag: grandparent left, node right ---
    # (identify the LR configuration)
    # Inner rotation converts the zig-zag into a straight line
    newP = leftRotate(parent); grandparent.left = newP     # inner rotation
    # now straight left-left; outer rotation follows
    newG = rightRotate(grandparent); attach(greatGrandparent, grandparent, newG)  # outer rotation
    # --- Case Zag-Zig: mirrored (right-left) ---
    # (identify the RL configuration)
    # Inner rotation on the parent straightens the chain
    newP = rightRotate(parent); grandparent.right = newP   # inner rotation
    # now straight right-right; outer rotation follows
    newG = leftRotate(grandparent); attach(greatGrandparent, grandparent, newG)   # outer rotation
    # loop while the path still has two or more ancestors
    return root   # the splayed key is now at the root`,
  },
  generateTimeline: (input: {
    keys: number[];
    searchKey: number;
  }): ExecutionFrame<SplayTreeState>[] => {
    const rawKeys = input?.keys?.length ? input.keys : [50, 30, 20, 10];
    const targetKey = input?.searchKey ?? 10;

    const frames: ExecutionFrame<SplayTreeState>[] = [];

    // Helper: basic BST insert
    function bstInsert(node: SplayNode | null, key: number): SplayNode {
      if (!node) return { key, left: null, right: null };
      if (key < node.key) node.left = bstInsert(node.left, key);
      else if (key > node.key) node.right = bstInsert(node.right, key);
      return node;
    }

    let root: SplayNode | null = null;
    for (const k of rawKeys) {
      root = bstInsert(root, k);
    }
    const initialRootVal = root ? (root as SplayNode).key : -1;

    let checkpointAdded = false;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 3,
      action: 'INIT',
      state: {
        tree: cloneSplay(root),
        splayedKey: null,
        operation: 'NONE',
        description: `BST constructed from keys [${rawKeys.join(', ')}]`,
      },
      callStack: [{ name: 'initSplay', params: { searchKey: targetKey, totalNodes: rawKeys.length }, line: 3, isCurrent: true }],
      variables: { searchKey: targetKey, initialRoot: initialRootVal, totalKeys: rawKeys.length },
      pedagogy: {
        what: `Splay search first records the access path, then rebalances bottom-up until the target sits at the root.`,
        why: 'Recently accessed keys become cheap (O(1) at the root); the rebalancing cost amortizes to O(log n) per operation without storing heights.',
        whatNext: `Search for ${targetKey} while collecting every node on the path.`,
      },
      explanation: `Initialized BST with keys [${rawKeys.join(', ')}]. Beginning search and splay for target key ${targetKey}.`,
    });

    // Phase 1: Search traversal to target node
    let searchCurr: SplayNode | null = root;
    const path: SplayNode[] = [];

    while (searchCurr) {
      path.push(searchCurr);
      const isTarget = searchCurr.key === targetKey;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        action: 'SEARCH',
        state: {
          tree: cloneSplay(root),
          splayedKey: targetKey,
          operation: 'SEARCH',
          description: `Inspecting node ${searchCurr.key} (searching for ${targetKey})`,
        },
        callStack: [{ name: 'splaySearch', params: { current: searchCurr.key, target: targetKey }, line: 5, isCurrent: true }],
        variables: { currentNode: searchCurr.key, targetKey, pathLength: path.length },
        conditionEval: {
          expr: `${targetKey} === ${searchCurr.key}`,
          result: isTarget,
        },
        pedagogy: {
          what: isTarget
            ? `${targetKey} found — the access path has ${path.length} node(s).`
            : `${targetKey} is ${targetKey < searchCurr.key ? 'smaller' : 'larger'} than ${searchCurr.key}, so the walk continues ${targetKey < searchCurr.key ? 'left' : 'right'}.`,
          why: 'The whole path is remembered: splay rotations need the parent and grandparent of every node on it.',
          whatNext: isTarget ? 'Start bottom-up rotations from the deepest pair.' : 'Inspect the next node and append it to the path.',
        },
        explanation: isTarget
          ? `🎯 Located target key ${targetKey}! Ready to commence bottom-up splay rotations.`
          : targetKey < searchCurr.key
          ? `Target key ${targetKey} < node ${searchCurr.key}. Descending into left subtree.`
          : `Target key ${targetKey} > node ${searchCurr.key}. Descending into right subtree.`,
      });

      if (isTarget) break;
      searchCurr = targetKey < searchCurr.key ? searchCurr.left : searchCurr.right;
    }

    if (!searchCurr) {
      // Key not present in tree, splay last accessed node
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        action: 'SEARCH',
        state: {
          tree: cloneSplay(root),
          splayedKey: targetKey,
          operation: 'NONE',
          description: `Key ${targetKey} not found in tree`,
        },
        callStack: [{ name: 'splaySearch', params: { status: 'NOT_FOUND' }, line: 7, isCurrent: true }],
        variables: { targetKey, found: false },
        pedagogy: {
          what: `The search fell off a null child: ${targetKey} is not in the tree.`,
          why: 'Splay trees still splay the last accessed node — the one the failed search inspected most deeply.',
          whatNext: 'Apply the same bottom-up rotation cases to that last node.',
        },
        explanation: `Key ${targetKey} does not exist in BST. Splaying last accessed node to root.`,
      });
    }

    function rightRotate(x: SplayNode): SplayNode {
      const y = x.left!;
      x.left = y.right;
      y.right = x;
      return y;
    }

    function leftRotate(x: SplayNode): SplayNode {
      const y = x.right!;
      x.right = y.left;
      y.left = x;
      return y;
    }

    // Helper to reconnect rotated subtree to great-grandparent or root
    function attach(parentSub: SplayNode | null, oldNode: SplayNode, newNode: SplayNode) {
      if (!parentSub) {
        root = newNode;
      } else if (parentSub.left === oldNode) {
        parentSub.left = newNode;
      } else if (parentSub.right === oldNode) {
        parentSub.right = newNode;
      }
    }

    // Phase 2: Bottom-up splay rotations
    while (path.length > 1) {
      const curr = path[path.length - 1];
      const parent = path[path.length - 2];

      if (path.length === 2) {
        // Case: ZIG / ZAG (Parent is Root)
        if (parent.left === curr) {
          root = rightRotate(parent);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            action: 'ZIG',
            isMilestone: true,
            milestoneTitle: `Zig (Right Rotate) Root ${parent.key}`,
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG',
              description: `Zig (right rotation) around root ${parent.key}`,
            },
            callStack: [{ name: 'zig', params: { root: parent.key, child: curr.key }, line: 10, isCurrent: true }],
            variables: { step: 'Zig', newRoot: root.key },
            pedagogy: {
              what: `Zig: one right rotation at the root ${parent.key} lifts ${curr.key} to the top.`,
              why: 'The target is exactly one level below the root, so a single rotation completes the splay.',
              whatNext: 'The access path is exhausted — splay is done.',
            },
            checkpoint: !checkpointAdded
              ? {
                  id: 'splay-access-path',
                  question: 'Why does splay move the accessed node to the root instead of just balancing locally?',
                  options: [
                    'Deep nodes are expensive to reach repeatedly; hoisting the accessed node shortens the whole path, which amortizes to O(log n) per operation',
                    'Because it keeps the height perfectly balanced like an AVL tree',
                  ],
                  correctIndex: 0,
                  explanation:
                    'Splay trees trade exact balance for adaptivity: every access restructures the tree along its own path. The potential argument shows total cost O((m+n) log n) over m operations, even though a single search can be linear.',
                }
              : undefined,
            explanation: `Zig (single right rotation) applied on root ${parent.key}. Target ${curr.key} is now at root!`,
          });
          checkpointAdded = true;
        } else {
          root = leftRotate(parent);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            action: 'ZIG',
            isMilestone: true,
            milestoneTitle: `Zag (Left Rotate) Root ${parent.key}`,
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG',
              description: `Zag (left rotation) around root ${parent.key}`,
            },
            callStack: [{ name: 'zag', params: { root: parent.key, child: curr.key }, line: 12, isCurrent: true }],
            variables: { step: 'Zag', newRoot: root.key },
            pedagogy: {
              what: `Zag: mirror of the zig case — one left rotation at the root ${parent.key}.`,
              why: 'Mirror cases share the same logic with left/right swapped throughout.',
              whatNext: 'Splay complete for this access.',
            },
            explanation: `Zag (single left rotation) applied on root ${parent.key}. Target ${curr.key} is now at root!`,
          });
        }
        path.pop();
        path[0] = curr;
      } else {
        // Case: Double rotation (Grandparent exists)
        const grandparent = path[path.length - 3];
        const greatGrandparent = path.length >= 4 ? path[path.length - 4] : null;

        const isParentLeft = grandparent.left === parent;
        const isCurrLeft = parent.left === curr;

        if (isParentLeft && isCurrLeft) {
          // Zig-Zig (Left-Left)
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 15,
            action: 'ZIG_ZIG',
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZIG',
              description: `Identified Zig-Zig (Left-Left) on G=${grandparent.key}, P=${parent.key}, N=${curr.key}`,
            },
            callStack: [{ name: 'splayZigZig', params: { G: grandparent.key, P: parent.key, N: curr.key }, line: 15, isCurrent: true }],
            variables: { case: 'Zig-Zig (LL)', grandparent: grandparent.key, parent: parent.key, node: curr.key },
            pedagogy: {
              what: `All three nodes lie on the left spine (G=${grandparent.key}, P=${parent.key}, N=${curr.key}).`,
              why: 'For zig-zig the bottom-up order matters: rotating G first avoids creating a temporary zig-zag. The result halves the depth of N and much of its path — the core of splay\'s amortized guarantee.',
              whatNext: `Rotate grandparent ${grandparent.key} right first.`,
            },
            checkpoint: !checkpointAdded
              ? {
                  id: 'splay-access-path',
                  question: 'Why does splay move the accessed node to the root instead of just balancing locally?',
                  options: [
                    'Deep nodes are expensive to reach repeatedly; hoisting the accessed node shortens the whole path, which amortizes to O(log n) per operation',
                    'Because it keeps the height perfectly balanced like an AVL tree',
                  ],
                  correctIndex: 0,
                  explanation:
                    'Splay trees trade exact balance for adaptivity: every access restructures the tree along its own path. The potential argument shows total cost O((m+n) log n) over m operations, even though a single search can be linear.',
                }
              : undefined,
            explanation: `Identified Zig-Zig (Left-Left). Rule: rotate Grandparent ${grandparent.key} right FIRST, then rotate Parent ${parent.key} right.`,
          });
          checkpointAdded = true;

          // Step 1: Rotate grandparent right
          const newGSub = rightRotate(grandparent);
          attach(greatGrandparent, grandparent, newGSub);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 16,
            action: 'ZIG_ZIG',
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZIG',
              description: `Zig-Zig Part 1: Right rotated Grandparent ${grandparent.key}`,
            },
            callStack: [{ name: 'rotateG', params: { rotated: grandparent.key, newSubRoot: newGSub.key }, line: 16, isCurrent: true }],
            variables: { step: 'Zig-Zig Part 1', newSubRoot: newGSub.key },
            pedagogy: {
              what: `Part 1: grandparent ${grandparent.key} rotated right; ${newGSub.key} roots the intermediate subtree.`,
              why: 'Bottom-up rotation keeps the key order valid at every intermediate state — there is never a broken BST.',
              whatNext: `Rotate the intermediate root right (part 2).`,
            },
            explanation: `Zig-Zig Part 1 complete: Grandparent ${grandparent.key} right-rotated around ${newGSub.key}.`,
          });

          // Step 2: Rotate parent right
          const finalSub = rightRotate(newGSub);
          attach(greatGrandparent, newGSub, finalSub);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 18,
            action: 'ZIG_ZIG',
            isMilestone: true,
            milestoneTitle: `Zig-Zig Complete -> Subtree Root ${finalSub.key}`,
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZIG',
              description: `Zig-Zig Part 2: Right rotated Parent ${parent.key}`,
            },
            callStack: [{ name: 'rotateP', params: { rotated: parent.key, newSubRoot: finalSub.key }, line: 18, isCurrent: true }],
            variables: { step: 'Zig-Zig Part 2', subtreeRoot: finalSub.key },
            pedagogy: {
              what: `Part 2: the second right rotation puts ${curr.key} on top of this subtree.`,
              why: 'Two rotations moved the node up two levels — the amortized potential drop funds the whole operation.',
              whatNext: 'Continue splaying from the node\'s new parent.',
            },
            explanation: `Zig-Zig Part 2 complete: Parent right-rotated. Node ${curr.key} ascended 2 levels closer to root!`,
          });
        } else if (!isParentLeft && !isCurrLeft) {
          // Zag-Zag (Right-Right)
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 21,
            action: 'ZIG_ZIG',
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZIG',
              description: `Identified Zag-Zag (Right-Right) on G=${grandparent.key}, P=${parent.key}, N=${curr.key}`,
            },
            callStack: [{ name: 'splayZagZag', params: { G: grandparent.key, P: parent.key, N: curr.key }, line: 21, isCurrent: true }],
            variables: { case: 'Zag-Zag (RR)', grandparent: grandparent.key, parent: parent.key, node: curr.key },
            pedagogy: {
              what: `Mirror case: G=${grandparent.key}, P=${parent.key}, N=${curr.key} all on the right spine.`,
              why: 'Same bottom-up order with left/right swapped; correctness carries over by symmetry.',
              whatNext: `Rotate grandparent ${grandparent.key} left first.`,
            },
            explanation: `Identified Zag-Zag (Right-Right). Rule: rotate Grandparent ${grandparent.key} left FIRST, then rotate Parent ${parent.key} left.`,
          });

          const newGSub = leftRotate(grandparent);
          attach(greatGrandparent, grandparent, newGSub);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 22,
            action: 'ZIG_ZIG',
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZIG',
              description: `Zag-Zag Part 1: Left rotated Grandparent ${grandparent.key}`,
            },
            callStack: [{ name: 'rotateG', params: { rotated: grandparent.key, newSubRoot: newGSub.key }, line: 22, isCurrent: true }],
            variables: { step: 'Zag-Zag Part 1', newSubRoot: newGSub.key },
            pedagogy: {
              what: `Part 1: grandparent ${grandparent.key} rotated left.`,
              why: 'Identical mechanics to zig-zig part 1, mirrored.',
              whatNext: 'Rotate the intermediate root left (part 2).',
            },
            explanation: `Zag-Zag Part 1 complete: Grandparent ${grandparent.key} left-rotated around ${newGSub.key}.`,
          });

          const finalSub = leftRotate(newGSub);
          attach(greatGrandparent, newGSub, finalSub);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 24,
            action: 'ZIG_ZIG',
            isMilestone: true,
            milestoneTitle: `Zag-Zag Complete -> Subtree Root ${finalSub.key}`,
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZIG',
              description: `Zag-Zag Part 2: Left rotated Parent ${parent.key}`,
            },
            callStack: [{ name: 'rotateP', params: { rotated: parent.key, newSubRoot: finalSub.key }, line: 24, isCurrent: true }],
            variables: { step: 'Zag-Zag Part 2', subtreeRoot: finalSub.key },
            pedagogy: {
              what: `Part 2 lifts ${curr.key} two levels up.`,
              why: 'Both rotations are required — stopping after part 1 would leave the grandparent as the subtree root and the node only one level higher.',
              whatNext: 'Continue the splay loop from the new parent.',
            },
            explanation: `Zag-Zag Part 2 complete: Parent left-rotated. Node ${curr.key} ascended 2 levels closer to root!`,
          });
        } else if (isParentLeft && !isCurrLeft) {
          // Zig-Zag (Left-Right)
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 28,
            action: 'ZIG_ZAG',
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZAG',
              description: `Identified Zig-Zag (Left-Right) on G=${grandparent.key}, P=${parent.key}, N=${curr.key}`,
            },
            callStack: [{ name: 'splayZigZag', params: { G: grandparent.key, P: parent.key, N: curr.key }, line: 28, isCurrent: true }],
            variables: { case: 'Zig-Zag (LR)', grandparent: grandparent.key, parent: parent.key, node: curr.key },
            pedagogy: {
              what: `The path bends: N=${curr.key} is the right child of P=${parent.key}, which is the left child of G=${grandparent.key}.`,
              why: 'Zig-zig rotations would not fix a zig-zag; the chain must first be straightened into left-left.',
              whatNext: `Inner rotation: left-rotate parent ${parent.key}.`,
            },
            explanation: `Identified Zig-Zag (Left-Right). Rule: rotate Parent ${parent.key} left FIRST, then rotate Grandparent ${grandparent.key} right.`,
          });

          const newPSub = leftRotate(parent);
          grandparent.left = newPSub;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 30,
            action: 'ZIG_ZAG',
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZAG',
              description: `Zig-Zag Part 1: Left rotated Parent ${parent.key}`,
            },
            callStack: [{ name: 'innerRotate', params: { rotated: parent.key, child: newPSub.key }, line: 30, isCurrent: true }],
            variables: { step: 'Zig-Zag Part 1', child: newPSub.key },
            pedagogy: {
              what: `Inner rotation: ${parent.key} rotated left, so ${newPSub.key} takes its place and the chain becomes left-left.`,
              why: 'Straightening first means the outer rotation can reuse the same geometry as zig-zig.',
              whatNext: `Outer rotation: right-rotate grandparent ${grandparent.key}.`,
            },
            explanation: `Zig-Zag Part 1: Inner left-rotation on Parent ${parent.key} straightened chain into Left-Left.`,
          });

          const finalSub = rightRotate(grandparent);
          attach(greatGrandparent, grandparent, finalSub);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 32,
            action: 'ZIG_ZAG',
            isMilestone: true,
            milestoneTitle: `Zig-Zag Complete -> Subtree Root ${finalSub.key}`,
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZAG',
              description: `Zig-Zag Part 2: Right rotated Grandparent ${grandparent.key}`,
            },
            callStack: [{ name: 'outerRotate', params: { rotated: grandparent.key, root: finalSub.key }, line: 32, isCurrent: true }],
            variables: { step: 'Zig-Zag Part 2', subtreeRoot: finalSub.key },
            pedagogy: {
              what: `Outer rotation completes the double rotation; ${curr.key} is now this subtree's root.`,
              why: 'Two opposite rotations move the node up two levels — the same amortized progress as zig-zig.',
              whatNext: 'Continue splaying from the node\'s new parent.',
            },
            explanation: `Zig-Zag Part 2: Outer right-rotation on Grandparent ${grandparent.key} completed. Node ${curr.key} is now subtree root!`,
          });
        } else {
          // Zag-Zig (Right-Left)
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 34,
            action: 'ZIG_ZAG',
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZAG',
              description: `Identified Zag-Zig (Right-Left) on G=${grandparent.key}, P=${parent.key}, N=${curr.key}`,
            },
            callStack: [{ name: 'splayZagZig', params: { G: grandparent.key, P: parent.key, N: curr.key }, line: 34, isCurrent: true }],
            variables: { case: 'Zag-Zig (RL)', grandparent: grandparent.key, parent: parent.key, node: curr.key },
            pedagogy: {
              what: `Mirror zig-zag: N=${curr.key} is the left child of P=${parent.key}, the right child of G=${grandparent.key}.`,
              why: 'The inner rotation straightens the bend; the outer rotation then applies the zag-zag geometry.',
              whatNext: `Inner rotation: right-rotate parent ${parent.key}.`,
            },
            explanation: `Identified Zag-Zig (Right-Left). Rule: rotate Parent ${parent.key} right FIRST, then rotate Grandparent ${grandparent.key} left.`,
          });

          const newPSub = rightRotate(parent);
          grandparent.right = newPSub;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 36,
            action: 'ZIG_ZAG',
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZAG',
              description: `Zag-Zig Part 1: Right rotated Parent ${parent.key}`,
            },
            callStack: [{ name: 'innerRotate', params: { rotated: parent.key, child: newPSub.key }, line: 36, isCurrent: true }],
            variables: { step: 'Zag-Zig Part 1', child: newPSub.key },
            pedagogy: {
              what: `Inner rotation makes the chain right-right around ${newPSub.key}.`,
              why: 'Same two-step recipe, mirrored left/right.',
              whatNext: `Outer rotation: left-rotate grandparent ${grandparent.key}.`,
            },
            explanation: `Zag-Zig Part 1: Inner right-rotation on Parent ${parent.key} straightened chain into Right-Right.`,
          });

          const finalSub = leftRotate(grandparent);
          attach(greatGrandparent, grandparent, finalSub);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 38,
            action: 'ZIG_ZAG',
            isMilestone: true,
            milestoneTitle: `Zag-Zig Complete -> Subtree Root ${finalSub.key}`,
            state: {
              tree: cloneSplay(root),
              splayedKey: curr.key,
              operation: 'ZIG_ZAG',
              description: `Zag-Zig Part 2: Left rotated Grandparent ${grandparent.key}`,
            },
            callStack: [{ name: 'outerRotate', params: { rotated: grandparent.key, root: finalSub.key }, line: 38, isCurrent: true }],
            variables: { step: 'Zag-Zig Part 2', subtreeRoot: finalSub.key },
            pedagogy: {
              what: `Outer rotation completes the pair; ${curr.key} roots the subtree.`,
              why: 'All four double-rotation shapes are now covered — every two-level splay step uses exactly one of them.',
              whatNext: 'Loop continues until the node reaches the root.',
            },
            explanation: `Zag-Zig Part 2: Outer left-rotation on Grandparent completed. Node ${curr.key} is now subtree root!`,
          });
        }

        // Pop parent and grandparent; replace with curr
        path.pop();
        path.pop();
        path[path.length - 1] = curr;
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 40,
      action: 'COMPLETE',
      isMilestone: true,
      milestoneTitle: `Splay Success: ${targetKey} is at Root`,
      state: {
        tree: cloneSplay(root),
        splayedKey: targetKey,
        operation: 'NONE',
        description: `Key ${targetKey} successfully splayed to tree root`,
      },
      callStack: [{ name: 'splay', params: { status: 'DONE', root: root ? root.key : 'null' }, line: 40, isCurrent: true }],
      variables: { targetKey, newRoot: root ? root.key : 'null', finalDepth: 0 },
      pedagogy: {
        what: `return root: ${targetKey} is the new tree root.`,
        why: 'Every rotation pair moved the node two levels up, and the access path shortened as a whole — future searches for hot keys get faster, which is the adaptivity splay trees are known for.',
        whatNext: 'Compare with AVL/red-black: those guarantee worst-case height, splay optimizes amortized access.',
      },
      explanation: `🎉 Splay complete! Target key ${targetKey} is now the root of the tree. Subsequent lookups for this key will now take O(1) time.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<SplayTreeState>) => {
    const { tree, splayedKey, operation, description } = frame.state;

    interface VisualSplayNode {
      key: number;
      x: number;
      y: number;
      left: VisualSplayNode | null;
      right: VisualSplayNode | null;
    }

    function layoutTree(
      node: SplayNode | null,
      x: number,
      y: number,
      dx: number
    ): VisualSplayNode | null {
      if (!node) return null;
      return {
        key: node.key,
        x,
        y,
        left: layoutTree(node.left, x - dx, y + 60, dx * 0.55),
        right: layoutTree(node.right, x + dx, y + 60, dx * 0.55),
      };
    }

    const visualRoot = layoutTree(tree, 240, 45, 110);
    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const nodesList: { key: number; x: number; y: number }[] = [];

    function collectVisuals(vn: VisualSplayNode | null) {
      if (!vn) return;
      nodesList.push({ key: vn.key, x: vn.x, y: vn.y });
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
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Target Splay Key:</span>
            <span className="font-mono text-sm font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded">
              {splayedKey !== null ? `Key ${splayedKey}` : 'None'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Step:</span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                operation !== 'NONE'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {description}
            </span>
          </div>
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
              const isTarget = splayedKey === n.key;
              const isRoot = tree && tree.key === n.key;

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
                    fill={isRoot ? '#3b0764' : isTarget ? '#78350f' : '#0f172a'}
                    stroke={isRoot ? '#a855f7' : isTarget ? '#fbbf24' : '#475569'}
                    strokeWidth="3"
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {n.key}
                  </text>
                  {isRoot && (
                    <text
                      x={n.x}
                      y={n.y - 25}
                      textAnchor="middle"
                      fill="#d8b4fe"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ROOT
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
