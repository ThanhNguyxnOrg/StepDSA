import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { TreeStage, TreeStageState, TreeNode } from '../../components/stage/TreeStage';

interface TreeInternalNode {
  id: string;
  val: number;
  left: TreeInternalNode | null;
  right: TreeInternalNode | null;
}

interface LevelOrderState extends TreeStageState {
  visitedLevels: number[][];
  queueItems: number[];
  currentNodeVal?: number;
}

export const levelOrderTraversalModule: AlgorithmModule<number[], LevelOrderState> = {
  id: 'level-order-traversal',
  title: 'Level-Order Traversal (Breadth-First Search Tree)',
  category: 'trees-bst',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(W) max tree width',
    worstCaseCondition: 'Complete binary tree where the bottom level holds N/2 nodes in queue',
  },
  theory: {
    overview:
      'Level-Order Traversal explores a binary tree level by level, from top to bottom (root to leaves) and left to right within each level. It is the tree equivalent of Breadth-First Search (BFS) and uses a FIFO Queue.',
    whyItWorks:
      'Enqueueing the root and iteratively popping each node while pushing its children (left then right) guarantees that all nodes at depth d are processed before any node at depth d + 1.',
    invariant:
      'Level Invariant: For any node dequeued at depth d, all nodes at depth < d have already been visited, and all nodes currently in the queue have depth d or d + 1.',
    pitfalls: [
      'Using a stack instead of a queue converts BFS into depth-first traversal.',
      'Failing to track level size when partitioning the output into distinct sub-arrays per level.',
    ],
  },
  presets: [
    {
      id: 'balanced-3-level',
      label: 'Balanced 3-Level Tree',
      description: 'Levels: [50], [30, 70], [20, 40, 60, 80]',
      data: [50, 30, 70, 20, 40, 60, 80],
    },
    {
      id: 'skewed-tree',
      label: 'Skewed Tree',
      description: 'Zig-zag branching across levels',
      data: [10, 5, 15, 3, 12, 18],
    },
  ],
  defaultInput: [50, 30, 70, 20, 40, 60, 80],
  codeSnippets: {
    python: `from collections import deque

def level_order(root):
    if not root: return []
    result = []
    q = deque([root])
    while q:
        level_size = len(q)
        current_level = []
        for _ in range(level_size):
            node = q.popleft()
            current_level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        result.append(current_level)
    return result`,
    typescript: `function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: number[] = [];
    for (let i = 0; i < levelSize; ++i) {
      const node = queue.shift()!;
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}`,
    cpp: `vector<vector<int>> levelOrder(TreeNode* root) {
    if (!root) return {};
    vector<vector<int>> result;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int levelSize = q.size();
        vector<int> currentLevel;
        for (int i = 0; i < levelSize; ++i) {
            TreeNode* node = q.front(); q.pop();
            currentLevel.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        result.push_back(currentLevel);
    }
    return result;
}`,
    java: `public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    Queue<TreeNode> q = new LinkedList<>();
    q.add(root);
    while (!q.isEmpty()) {
        int levelSize = q.size();
        List<Integer> currentLevel = new ArrayList<>();
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = q.poll();
            currentLevel.add(node.val);
            if (node.left != null) q.add(node.left);
            if (node.right != null) q.add(node.right);
        }
        result.add(currentLevel);
    }
    return result;
}`,
    pseudocode: `function levelOrder(root):
    if root is null: return []
    queue <- [root]
    result <- []
    while queue is not empty:
        node <- dequeue(queue)
        append node.val to result
        if node.left: enqueue(queue, node.left)
        if node.right: enqueue(queue, node.right)
    return result`,
  },
  generateTimeline: (input: number[]) => {
    // Build tree
    const insertBST = (root: TreeInternalNode | null, val: number): TreeInternalNode => {
      if (!root) return { id: `node-${val}`, val, left: null, right: null };
      if (val < root.val) root.left = insertBST(root.left, val);
      else root.right = insertBST(root.right, val);
      return root;
    };

    let root: TreeInternalNode | null = null;
    const vals = input.length > 0 ? input : [50, 30, 70, 20, 40, 60, 80];
    for (const v of vals) root = insertBST(root, v);

    const flattenTree = (
      node: TreeInternalNode | null,
      x = 350,
      y = 50,
      offset = 120,
      activeVal?: number,
      visitedSet = new Set<number>()
    ): TreeNode[] => {
      if (!node) return [];
      const res: TreeNode[] = [
        {
          id: node.id,
          value: node.val,
          x,
          y,
          status:
            node.val === activeVal
              ? 'active'
              : visitedSet.has(node.val)
              ? 'sorted'
              : 'default',
        },
      ];
      if (node.left) {
        res.push(...flattenTree(node.left, x - offset, y + 70, offset / 2, activeVal, visitedSet));
      }
      if (node.right) {
        res.push(...flattenTree(node.right, x + offset, y + 70, offset / 2, activeVal, visitedSet));
      }
      return res;
    };

    const frames: ExecutionFrame<LevelOrderState>[] = [];
    const visitedSet = new Set<number>();
    const visitedLevels: number[][] = [];

    if (!root) {
      frames.push({
        stepIndex: 0,
        totalSteps: 1,
        codeLine: 2,
        explanation: 'Tree is empty. Level order traversal returns empty list.',
        state: { nodes: [], visitedLevels: [], queueItems: [] },
      });
      return frames;
    }

    const queue: TreeInternalNode[] = [root];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Initialized Level-Order BFS. Enqueued root node (${root.val}).`,
      isMilestone: true,
      milestoneTitle: 'Level-Order Initialized',
      soundCue: { type: 'start' },
      variables: { rootVal: root.val, queueSize: 1 },
      callStack: [{ name: 'levelOrder', params: { root: root.val }, line: 4, isCurrent: true }],
      conditionEval: { expr: `queue.length > 0`, result: true },
      state: {
        nodes: flattenTree(root, 350, 50, 120, root.val, visitedSet),
        visitedLevels: [],
        queueItems: [root.val],
        currentNodeVal: root.val,
      },
    });

    while (queue.length > 0) {
      const levelSize = queue.length;
      const currentLevel: number[] = [];

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Starting new level with ${levelSize} node(s) in queue: [${queue
          .map((n) => n.val)
          .join(', ')}].`,
        isMilestone: true,
        milestoneTitle: `Level ${visitedLevels.length + 1} (${levelSize} Nodes)`,
        soundCue: { type: 'step' },
        variables: { currentLevelNumber: visitedLevels.length + 1, levelSize, queueNodes: queue.map((n) => n.val).join(', ') },
        callStack: [{ name: 'processLevel', params: { level: visitedLevels.length + 1, size: levelSize }, line: 6, isCurrent: true }],
        conditionEval: { expr: `queue.length > 0`, result: true },
        state: {
          nodes: flattenTree(root, 350, 50, 120, undefined, visitedSet),
          visitedLevels: [...visitedLevels],
          queueItems: queue.map((n) => n.val),
        },
      });

      for (let i = 0; i < levelSize; ++i) {
        const curr = queue.shift()!;
        visitedSet.add(curr.val);
        currentLevel.push(curr.val);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `Dequeued node (${curr.val}). Appended to current level.`,
          soundCue: { type: 'compare' },
          variables: { dequeuedVal: curr.val, levelItemIndex: i, levelSize },
          callStack: [{ name: 'visitNode', params: { val: curr.val }, line: 9, isCurrent: true }],
          conditionEval: { expr: `i < levelSize (${i} < ${levelSize})`, result: true },
          state: {
            nodes: flattenTree(root, 350, 50, 120, curr.val, visitedSet),
            visitedLevels: [...visitedLevels, [...currentLevel]],
            queueItems: queue.map((n) => n.val),
            currentNodeVal: curr.val,
          },
        });

        if (curr.left) {
          queue.push(curr.left);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 11,
            explanation: `Enqueued left child of (${curr.val}): node (${curr.left.val}).`,
            soundCue: { type: 'swap' },
            variables: { parent: curr.val, child: curr.left.val, side: 'left' },
            callStack: [{ name: 'enqueueChild', params: { parent: curr.val, left: curr.left.val }, line: 11, isCurrent: true }],
            conditionEval: { expr: `curr.left !== null`, result: true },
            state: {
              nodes: flattenTree(root, 350, 50, 120, curr.left.val, visitedSet),
              visitedLevels: [...visitedLevels, [...currentLevel]],
              queueItems: queue.map((n) => n.val),
              currentNodeVal: curr.val,
            },
          });
        }

        if (curr.right) {
          queue.push(curr.right);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            explanation: `Enqueued right child of (${curr.val}): node (${curr.right.val}).`,
            soundCue: { type: 'swap' },
            variables: { parent: curr.val, child: curr.right.val, side: 'right' },
            callStack: [{ name: 'enqueueChild', params: { parent: curr.val, right: curr.right.val }, line: 12, isCurrent: true }],
            conditionEval: { expr: `curr.right !== null`, result: true },
            state: {
              nodes: flattenTree(root, 350, 50, 120, curr.right.val, visitedSet),
              visitedLevels: [...visitedLevels, [...currentLevel]],
              queueItems: queue.map((n) => n.val),
              currentNodeVal: curr.val,
            },
          });
        }
      }

      visitedLevels.push(currentLevel);
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      explanation: `Level-Order Traversal completed! Processed ${visitedLevels.length} levels: [${visitedLevels
        .map((lvl) => `[${lvl.join(', ')}]`)
        .join(', ')}].`,
      isMilestone: true,
      milestoneTitle: 'Traversal Complete',
      soundCue: { type: 'complete' },
      variables: { totalLevels: visitedLevels.length, totalNodes: visitedSet.size },
      callStack: [{ name: 'levelOrder.complete', params: { levels: visitedLevels.length }, line: 14, isCurrent: true }],
      conditionEval: { expr: `queue.length == 0`, result: true },
      state: {
        nodes: flattenTree(root, 350, 50, 120, undefined, visitedSet),
        visitedLevels: [...visitedLevels],
        queueItems: [],
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    const { visitedLevels, queueItems } = frame.state;

    return (
      <div className="flex flex-col w-full h-full">
        {/* Level Stream HUD */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Levels:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {visitedLevels.map((lvl, lIdx) => (
                <div
                  key={lIdx}
                  className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-mono text-xs font-bold"
                >
                  L{lIdx}: [{lvl.join(', ')}]
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Queue:</span>
            <div className="flex items-center gap-1">
              {queueItems.length === 0 ? (
                <span className="text-xs font-mono text-slate-600 italic">Empty</span>
              ) : (
                queueItems.map((val, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/60 text-cyan-300 font-mono text-xs"
                  >
                    {val}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <TreeStage state={frame.state} projection={projection} />
        </div>
      </div>
    );
  },
};
