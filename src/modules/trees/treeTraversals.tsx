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
    pseudocode: `function traverseAll(root, mode):
    seq = []
    traverse(root, mode, seq)
    return seq
function traverse(root, mode, seq):
    if root is null: return
    if mode == PREORDER: seq.append(root.val)
    traverse(root.left, mode, seq)
    if mode == INORDER: seq.append(root.val)
    traverse(root.right, mode, seq)
    if mode == POSTORDER: seq.append(root.val)`,
  },

  generateTimeline: (input: TreeTraversalInput): ExecutionFrame<TreeTraversalState>[] => {
    const frames: ExecutionFrame<TreeTraversalState>[] = [];
    const { values, mode } = input;

    // Build BST from values. Ids come from a counter so duplicate values never collide;
    // duplicate keys are ignored by the strict < / > comparisons below.
    let root: TreeTraversalInternalNode | null = null;
    let nodeSeq = 0;
    const bstInsert = (
      node: TreeTraversalInternalNode | null,
      val: number
    ): TreeTraversalInternalNode => {
      if (!node) return { id: `node-${++nodeSeq}`, val, left: null, right: null };
      if (val < node.val) node.left = bstInsert(node.left, val);
      else if (val > node.val) node.right = bstInsert(node.right, val);
      return node;
    };
    values.forEach((v) => {
      root = bstInsert(root, v);
    });
    const countNodes = (node: TreeTraversalInternalNode | null): number =>
      node ? 1 + countNodes(node.left) + countNodes(node.right) : 0;
    const nodeCount = countNodes(root);

    const flatten = (
      r: TreeTraversalInternalNode | null,
      x = 350,
      y = 50,
      offset = 120,
      activeId?: string,
      visitedVals: Set<string> = new Set()
    ): TreeNode[] => {
      if (!r) return [];
      const current: TreeNode = {
        id: r.id,
        value: r.val,
        x,
        y,
        status:
          r.id === activeId
            ? 'active'
            : visitedVals.has(r.id)
            ? 'sorted'
            : 'default',
        leftId: r.left ? r.left.id : undefined,
        rightId: r.right ? r.right.id : undefined,
      };

      const leftNodes = r.left
        ? flatten(r.left, x - offset, y + 65, offset / 1.8, activeId, visitedVals)
        : [];
      const rightNodes = r.right
        ? flatten(r.right, x + offset, y + 65, offset / 1.8, activeId, visitedVals)
        : [];

      return [current, ...leftNodes, ...rightNodes];
    };

    const visitedList: number[] = [];
    const visitedSet = new Set<string>();
    let checkpointAdded = false;

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized ${mode.toUpperCase()} tree traversal on ${nodeCount} nodes. seq = [].`,
      isMilestone: true,
      milestoneTitle: `Start ${mode.toUpperCase()}`,
      soundCue: { type: 'start' },
      variables: { mode, totalNodes: nodeCount, rootVal: (root as any)?.val ?? null },
      callStack: [{ name: `${mode}Traversal`, params: { mode }, line: 2, isCurrent: true }],
      conditionEval: { expr: `root !== null`, result: Boolean(root) },
      scopeVariables: { mode, totalNodes: nodeCount },
      pedagogy: {
        what: `All three traversals visit the same nodes — only the moment of recording differs.`,
        why: 'PREORDER records before the recursive calls, INORDER between them, POSTORDER after; that single difference produces preorder/inorder/postorder.',
        whatNext: `Call traverse on the root and watch where ${mode.toUpperCase()} records each value.`,
      },
      state: {
        nodes: flatten(root, 350, 50, 120),
        visitedSequence: [],
        currentMode: mode,
      },
    });

    const runTraversal = (
      node: TreeTraversalInternalNode | null,
      depth: number,
      branch: string
    ) => {
      if (!node) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Base case: ${branch} is NULL at depth ${depth}. return — control goes back to the previous stack frame.`,
          soundCue: { type: 'step' },
          variables: { depth, node: 'NULL', branch },
          callStack: [{ name: `${mode}Helper`, params: { node: 'null', branch, depth }, line: 6, isCurrent: true }],
          conditionEval: { expr: `node == null`, result: true },
          scopeVariables: { depth, node: 'NULL', branch },
          pedagogy: {
            what: `The recursion tried to descend into ${branch}, but there is no node there.`,
            why: 'NULL children are the base case that stops the recursion; every leaf produces two of them.',
            whatNext: 'Return to the parent frame and continue its remaining steps.',
          },
          state: {
            nodes: flatten(root, 350, 50, 120, undefined, visitedSet),
            visitedSequence: [...visitedList],
            currentMode: mode,
            actionPhase: `Base Case (NULL ${branch})`,
          },
        });
        return;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Entering recursive call for node ${node.val} (depth ${depth}, via ${branch}).`,
        soundCue: { type: 'compare' },
        variables: { currentNode: node.val, depth, branch, hasLeft: !!node.left, hasRight: !!node.right },
        callStack: [{ name: `${mode}Helper`, params: { node: node.val, depth }, line: 5, isCurrent: true }],
        conditionEval: { expr: `node !== null`, result: true },
        scopeVariables: { currentNode: node.val, depth, branch },
        pedagogy: {
          what: `traverse(${node.val}) starts; depth ${depth} frames are already on the stack.`,
          why: 'The recursion order left→right is fixed; only the recording point depends on the mode.',
          whatNext: mode === 'preorder' ? `Record ${node.val} now (preorder: before children).` : `Descend into the left child first.`,
        },
        state: {
          nodes: flatten(root, 350, 50, 120, node.id, visitedSet),
          visitedSequence: [...visitedList],
          currentMode: mode,
          actionPhase: `Enter Node ${node.val}`,
        },
      });

      if (mode === 'preorder') {
        visitedList.push(node.val);
        visitedSet.add(node.id);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `Preorder visit (N): Recording node ${node.val} into sequence before its subtrees.`,
          soundCue: { type: 'swap' },
          isMilestone: true,
          milestoneTitle: `Visit ${node.val}`,
          variables: { recorded: node.val, sequence: visitedList.join(' → '), visitedCount: visitedList.length },
          callStack: [{ name: 'recordNode', params: { val: node.val }, line: 7, isCurrent: true }],
          conditionEval: { expr: `mode == 'preorder'`, result: true },
          scopeVariables: { recorded: node.val, sequence: visitedList.join(' → ') },
          pedagogy: {
            what: `${node.val} is recorded before either child is processed.`,
            why: 'Node-first recording is what makes preorder useful for copying trees or prefix expressions.',
            whatNext: 'Descend into the left child, then the right.',
          },
          checkpoint: !checkpointAdded
            ? {
                id: 'tree-traversal-order',
                question: 'Why do preorder, inorder and postorder produce different sequences if they all visit every node?',
                options: [
                  'They record the node at different recursion moments: before the children, between them, or after them',
                  'Each mode visits a different subset of the tree',
                ],
                correctIndex: 0,
                explanation:
                  'The traversal walk is identical; only the position of the visit line changes. On a BST, recording between the recursive calls (inorder) yields values in sorted order — that is its signature property.',
              }
            : undefined,
          state: {
            nodes: flatten(root, 350, 50, 120, node.id, visitedSet),
            visitedSequence: [...visitedList],
            currentMode: mode,
            actionPhase: `Preorder Record ${node.val}`,
          },
        });
        checkpointAdded = true;
      }

      // Left
      runTraversal(node.left, depth + 1, `left child of ${node.val}`);

      if (mode === 'inorder') {
        visitedList.push(node.val);
        visitedSet.add(node.id);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `Inorder visit (N): the left subtree is fully recorded, so ${node.val} goes next — between left and right.`,
          soundCue: { type: 'swap' },
          isMilestone: true,
          milestoneTitle: `Visit ${node.val}`,
          variables: { recorded: node.val, sequence: visitedList.join(' → '), visitedCount: visitedList.length },
          callStack: [{ name: 'recordNode', params: { val: node.val }, line: 9, isCurrent: true }],
          conditionEval: { expr: `mode == 'inorder'`, result: true },
          scopeVariables: { recorded: node.val, sequence: visitedList.join(' → ') },
          pedagogy: {
            what: `${node.val} is recorded after its left subtree and before its right subtree.`,
            why: 'On a BST this interleaving produces sorted output — the classic reason inorder is used to read keys in order.',
            whatNext: 'Descend into the right subtree.',
          },
          checkpoint: !checkpointAdded
            ? {
                id: 'tree-traversal-order',
                question: 'Why do preorder, inorder and postorder produce different sequences if they all visit every node?',
                options: [
                  'They record the node at different recursion moments: before the children, between them, or after them',
                  'Each mode visits a different subset of the tree',
                ],
                correctIndex: 0,
                explanation:
                  'The traversal walk is identical; only the position of the visit line changes. On a BST, recording between the recursive calls (inorder) yields values in sorted order — that is its signature property.',
              }
            : undefined,
          state: {
            nodes: flatten(root, 350, 50, 120, node.id, visitedSet),
            visitedSequence: [...visitedList],
            currentMode: mode,
            actionPhase: `Inorder Record ${node.val}`,
          },
        });
        checkpointAdded = true;
      }

      // Right
      runTraversal(node.right, depth + 1, `right child of ${node.val}`);

      if (mode === 'postorder') {
        visitedList.push(node.val);
        visitedSet.add(node.id);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Postorder visit (N): both subtrees are fully recorded, so ${node.val} comes last.`,
          soundCue: { type: 'swap' },
          isMilestone: true,
          milestoneTitle: `Visit ${node.val}`,
          variables: { recorded: node.val, sequence: visitedList.join(' → '), visitedCount: visitedList.length },
          callStack: [{ name: 'recordNode', params: { val: node.val }, line: 11, isCurrent: true }],
          conditionEval: { expr: `mode == 'postorder'`, result: true },
          scopeVariables: { recorded: node.val, sequence: visitedList.join(' → ') },
          pedagogy: {
            what: `${node.val} is recorded after both children are done.`,
            why: 'Children-first recording makes postorder the natural choice for freeing a tree or evaluating expression trees bottom-up.',
            whatNext: 'Return from this call; the parent continues or records itself.',
          },
          checkpoint: !checkpointAdded
            ? {
                id: 'tree-traversal-order',
                question: 'Why do preorder, inorder and postorder produce different sequences if they all visit every node?',
                options: [
                  'They record the node at different recursion moments: before the children, between them, or after them',
                  'Each mode visits a different subset of the tree',
                ],
                correctIndex: 0,
                explanation:
                  'The traversal walk is identical; only the position of the visit line changes. On a BST, recording between the recursive calls (inorder) yields values in sorted order — that is its signature property.',
              }
            : undefined,
          state: {
            nodes: flatten(root, 350, 50, 120, node.id, visitedSet),
            visitedSequence: [...visitedList],
            currentMode: mode,
            actionPhase: `Postorder Record ${node.val}`,
          },
        });
        checkpointAdded = true;
      }
    };

    runTraversal(root, 1, 'root of the tree');

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Return seq: ${mode.toUpperCase()} traversal complete! Result: [${visitedList.join(', ')}].`,
      isMilestone: true,
      milestoneTitle: 'Traversal Complete',
      soundCue: { type: 'complete' },
      variables: { completedSequence: visitedList.join(', '), totalVisited: visitedList.length },
      callStack: [{ name: `${mode}Traversal.done`, params: { count: visitedList.length }, line: 4, isCurrent: true }],
      conditionEval: { expr: `visitedList.length == totalNodes`, result: visitedList.length === nodeCount },
      scopeVariables: { result: visitedList.join(' → ') },
      pedagogy: {
        what: `The driver returns seq = [${visitedList.join(', ')}] after all ${nodeCount} nodes were recorded exactly once.`,
        why: 'The recursion finished when the last NULL base case returned; the sequence order is exactly the recording order.',
        whatNext: mode === 'inorder' ? 'Notice the sequence is sorted — that is the BST inorder property.' : 'Switch mode to compare the recording order.',
      },
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
