import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { TreeStage, TreeStageState, TreeNode } from '../../components/stage/TreeStage';

interface TreeTraversalInput {
  values: number[];
  mode: 'inorder' | 'preorder' | 'postorder';
}

interface TreeTraversalInternalNode {
  id: string;
  val: number;
  left: TreeTraversalInternalNode | null;
  right: TreeTraversalInternalNode | null;
}

interface TreeTraversalState extends TreeStageState {
  visitedSequence: number[];
  currentMode: string;
  actionPhase?: string;
}

export const treeTraversalsModule: AlgorithmModule<TreeTraversalInput, TreeTraversalState> = {
  id: 'tree-traversals',
  title: 'Binary Tree Traversals (Inorder, Preorder, Postorder)',
  category: 'trees-bst',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(H) recursion stack',
    worstCaseCondition: 'Degenerate tree requires O(N) call stack frames; balanced requires O(log N)',
  },
  theory: {
    overview:
      'Tree traversal is the process of visiting every node in a binary tree exactly once. The three canonical depth-first orders are: Preorder (Node, Left, Right), Inorder (Left, Node, Right), and Postorder (Left, Right, Node). For a Binary Search Tree, Inorder traversal yields elements in strictly sorted ascending order.',
    whyItWorks:
      'Recursive divide-and-conquer splits the tree at root into two independent subproblems (left and right subtrees), maintaining recursive stack frames until leaf nodes are reached.',
    invariant:
      'Every node is entered via call stack, processes its left and right subtrees recursively, and is added to the output list in strict accordance with the traversal discipline.',
    pitfalls: [
      'Call stack overflow on severely skewed trees if recursion depth exceeds system stack limit.',
      'Confusing the visit moment (when output is recorded) with the recursive entry moment.',
    ],
  },
  presets: [
    {
      id: 'inorder-std',
      label: 'Inorder (LNR - Sorted)',
      description: 'Yields ascending sorted keys [20, 30, 40, 50, 60, 70, 80]',
      data: { values: [50, 30, 70, 20, 40, 60, 80], mode: 'inorder' },
    },
    {
      id: 'preorder-std',
      label: 'Preorder (NLR - Prefix)',
      description: 'Useful for tree cloning and serialization',
      data: { values: [50, 30, 70, 20, 40, 60, 80], mode: 'preorder' },
    },
    {
      id: 'postorder-std',
      label: 'Postorder (LRN - Suffix)',
      description: 'Useful for bottom-up cleanup and subtree evaluation',
      data: { values: [50, 30, 70, 20, 40, 60, 80], mode: 'postorder' },
    },
  ],
  defaultInput: { values: [50, 30, 70, 20, 40, 60, 80], mode: 'inorder' },
  codeSnippets: {
    python: `def inorder(root, res):
    if not root:
        return
    inorder(root.left, res)
    res.append(root.val)
    inorder(root.right, res)

def preorder(root, res):
    if not root:
        return
    res.append(root.val)
    preorder(root.left, res)
    preorder(root.right, res)

def postorder(root, res):
    if not root:
        return
    postorder(root.left, res)
    postorder(root.right, res)
    res.append(root.val)`,
    typescript: `function traverse(root: TreeNode | null, mode: 'inorder' | 'preorder' | 'postorder', res: number[]): void {
  if (!root) return;
  if (mode === 'preorder') res.push(root.val);
  traverse(root.left, mode, res);
  if (mode === 'inorder') res.push(root.val);
  traverse(root.right, mode, res);
  if (mode === 'postorder') res.push(root.val);
}`,
    cpp: `void inorder(TreeNode* root, vector<int>& res) {
    if (!root) return;
    inorder(root->left, res);
    res.push_back(root->val);
    inorder(root->right, res);
}`,
    java: `public void inorder(TreeNode root, List<Integer> res) {
    if (root == null) return;
    inorder(root.left, res);
    res.add(root.val);
    inorder(root.right, res);
}`,
    pseudocode: `function traverse(root, mode):
    if root is null: return
    if mode == PREORDER: visit(root)
    traverse(root.left, mode)
    if mode == INORDER: visit(root)
    traverse(root.right, mode)
    if mode == POSTORDER: visit(root)`,
  },

  generateTimeline: (input: TreeTraversalInput): ExecutionFrame<TreeTraversalState>[] => {
    const frames: ExecutionFrame<TreeTraversalState>[] = [];
    const { values, mode } = input;

    // Build BST from values
    let root: TreeTraversalInternalNode | null = null;
    const bstInsert = (
      node: TreeTraversalInternalNode | null,
      val: number
    ): TreeTraversalInternalNode => {
      if (!node) return { id: `node-${val}`, val, left: null, right: null };
      if (val < node.val) node.left = bstInsert(node.left, val);
      else if (val > node.val) node.right = bstInsert(node.right, val);
      return node;
    };
    values.forEach((v) => {
      root = bstInsert(root, v);
    });

    const flatten = (
      r: TreeTraversalInternalNode | null,
      x = 350,
      y = 50,
      offset = 120,
      activeVal?: number,
      visitedVals: Set<number> = new Set()
    ): TreeNode[] => {
      if (!r) return [];
      const current: TreeNode = {
        id: r.id,
        value: r.val,
        x,
        y,
        status:
          r.val === activeVal
            ? 'active'
            : visitedVals.has(r.val)
            ? 'sorted'
            : 'default',
        leftId: r.left ? r.left.id : undefined,
        rightId: r.right ? r.right.id : undefined,
      };

      const leftNodes = r.left
        ? flatten(r.left, x - offset, y + 65, offset / 1.8, activeVal, visitedVals)
        : [];
      const rightNodes = r.right
        ? flatten(r.right, x + offset, y + 65, offset / 1.8, activeVal, visitedVals)
        : [];

      return [current, ...leftNodes, ...rightNodes];
    };

    const visitedList: number[] = [];
    const visitedSet = new Set<number>();

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized ${mode.toUpperCase()} tree traversal on ${values.length} nodes. Call stack initialized.`,
      isMilestone: true,
      milestoneTitle: `Start ${mode.toUpperCase()}`,
      soundCue: 'start',
      scopeVariables: { mode, totalNodes: values.length },
      state: {
        nodes: flatten(root, 350, 50, 120),
        visitedSequence: [],
        currentMode: mode,
      },
    });

    const runTraversal = (node: TreeTraversalInternalNode | null, depth: number) => {
      if (!node) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 2,
          explanation: `Base case: encountered NULL pointer at depth ${depth}. Returning to previous stack frame.`,
          soundCue: 'step',
          scopeVariables: { depth, node: 'NULL' },
          state: {
            nodes: flatten(root, 350, 50, 120, undefined, visitedSet),
            visitedSequence: [...visitedList],
            currentMode: mode,
            actionPhase: 'Base Case (NULL)',
          },
        });
        return;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 1,
        explanation: `Entering recursive call for node ${node.val} (depth ${depth}).`,
        soundCue: 'compare',
        scopeVariables: { currentNode: node.val, depth },
        state: {
          nodes: flatten(root, 350, 50, 120, node.val, visitedSet),
          visitedSequence: [...visitedList],
          currentMode: mode,
          actionPhase: `Enter Node ${node.val}`,
        },
      });

      if (mode === 'preorder') {
        visitedList.push(node.val);
        visitedSet.add(node.val);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `Preorder visit (N): Recording node ${node.val} into sequence.`,
          soundCue: 'sorted',
          isMilestone: true,
          milestoneTitle: `Visit ${node.val}`,
          scopeVariables: { recorded: node.val, sequence: visitedList.join(' → ') },
          state: {
            nodes: flatten(root, 350, 50, 120, node.val, visitedSet),
            visitedSequence: [...visitedList],
            currentMode: mode,
            actionPhase: `Preorder Record ${node.val}`,
          },
        });
      }

      // Left
      runTraversal(node.left, depth + 1);

      if (mode === 'inorder') {
        visitedList.push(node.val);
        visitedSet.add(node.val);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Inorder visit (N): Left subtree complete. Recording node ${node.val} into sequence.`,
          soundCue: 'sorted',
          isMilestone: true,
          milestoneTitle: `Visit ${node.val}`,
          scopeVariables: { recorded: node.val, sequence: visitedList.join(' → ') },
          state: {
            nodes: flatten(root, 350, 50, 120, node.val, visitedSet),
            visitedSequence: [...visitedList],
            currentMode: mode,
            actionPhase: `Inorder Record ${node.val}`,
          },
        });
      }

      // Right
      runTraversal(node.right, depth + 1);

      if (mode === 'postorder') {
        visitedList.push(node.val);
        visitedSet.add(node.val);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Postorder visit (N): Both subtrees processed. Recording node ${node.val} into sequence.`,
          soundCue: 'sorted',
          isMilestone: true,
          milestoneTitle: `Visit ${node.val}`,
          scopeVariables: { recorded: node.val, sequence: visitedList.join(' → ') },
          state: {
            nodes: flatten(root, 350, 50, 120, node.val, visitedSet),
            visitedSequence: [...visitedList],
            currentMode: mode,
            actionPhase: `Postorder Record ${node.val}`,
          },
        });
      }
    };

    runTraversal(root, 1);

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      explanation: `🎉 ${mode.toUpperCase()} traversal complete! Result: [${visitedList.join(', ')}].`,
      isMilestone: true,
      milestoneTitle: 'Traversal Complete',
      soundCue: 'complete',
      scopeVariables: { result: visitedList.join(' → ') },
      state: {
        nodes: flatten(root, 350, 50, 120, undefined, visitedSet),
        visitedSequence: [...visitedList],
        currentMode: mode,
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    const { visitedSequence, currentMode } = frame.state;

    return (
      <div className="flex flex-col w-full h-full">
        {/* Top Sequence Output Ribbon */}
        <div className="px-6 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {currentMode} Stream:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {visitedSequence.length === 0 ? (
                <span className="text-xs font-mono text-slate-600 italic">None yet</span>
              ) : (
                visitedSequence.map((val, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-mono text-xs font-bold shadow-sm"
                  >
                    {val}
                  </span>
                ))
              )}
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            {visitedSequence.length} nodes visited
          </span>
        </div>

        {/* Tree Stage Visualizer */}
        <div className="flex-1 flex flex-col">
          <TreeStage state={frame.state} projection={projection} />
        </div>
      </div>
    );
  },
};
