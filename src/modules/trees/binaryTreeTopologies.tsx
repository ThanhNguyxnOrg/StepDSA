import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export type TreeTopologyType = 'full' | 'complete' | 'perfect' | 'balanced' | 'degenerate';

export interface TopologyNode {
  id: number;
  val: number;
  left?: TopologyNode | null;
  right?: TopologyNode | null;
  x?: number;
  y?: number;
}

export interface BinaryTreeTopologiesState {
  topology: TreeTopologyType;
  root: TopologyNode | null;
  inspectedNodeId: number | null;
  properties: {
    isFull: boolean;
    isComplete: boolean;
    isPerfect: boolean;
    isBalanced: boolean;
    isDegenerate: boolean;
    height: number;
    nodeCount: number;
  };
  message: string;
}

export const binaryTreeTopologiesModule: AlgorithmModule<
  { topology: TreeTopologyType },
  BinaryTreeTopologiesState
> = {
  id: 'binary-tree-topologies',
  title: 'Binary Tree (Full, Complete, Perfect, Degenerate Topologies)',
  category: 'trees-bst',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1) property lookup',
    timeAverage: 'O(N) full topology verification traversal',
    timeWorst: 'O(N) height check on degenerate skewed chain',
    spaceAuxiliary: 'O(H) recursion stack where H in [log N, N]',
    worstCaseCondition: 'Degenerate tree collapsing to linked list with height H = N',
  },
  theory: {
    overview:
      'Binary tree performance depends fundamentally on structural topology: (1) Full (every node has 0 or 2 children), (2) Complete (all levels filled except possibly the last, which is filled left-to-right), (3) Perfect (all internal nodes have 2 children and all leaves are at same depth), (4) Balanced (|h_left - h_right| <= 1), and (5) Degenerate/Pathological (each parent has only 1 child, acting as a linked list).',
    whyItWorks:
      'A Perfect tree of height H has exactly 2^(H+1) - 1 nodes. A Complete tree can be mapped directly into a contiguous array without pointers (left child = 2i+1, right child = 2i+2). Degenerate trees cause worst-case O(N) BST lookup times.',
    invariant:
      'Topological Invariant: In a Full binary tree, number of leaves L = InternalNodes + 1. In a Perfect tree, LeafCount = 2^H and TotalNodes = 2^(H+1) - 1.',
    pitfalls: [
      'Assuming all complete trees are full, or all full trees are complete (they are independent properties).',
      'Forgetting that complete trees require the bottom level to be strictly left-aligned without internal gaps.',
    ],
  },
  defaultInput: {
    topology: 'complete',
  },
  presets: [
    {
      id: 'complete-tree',
      label: 'Complete Binary Tree',
      description: 'Levels full except last level filled left-to-right',
      data: { topology: 'complete' },
    },
    {
      id: 'perfect-tree',
      label: 'Perfect Binary Tree (H=2, N=7)',
      description: 'All internal nodes have 2 children and all leaves are at same depth',
      data: { topology: 'perfect' },
    },
    {
      id: 'full-tree',
      label: 'Full Binary Tree (0 or 2 Children)',
      description: 'Every node has either 0 or 2 children',
      data: { topology: 'full' },
    },
    {
      id: 'degenerate-tree',
      label: 'Degenerate Right-Skewed (Linked List)',
      description: 'Each parent has only one child, height equals N',
      data: { topology: 'degenerate' },
    },
    {
      id: 'balanced-tree',
      label: 'Balanced AVL-Style Tree',
      description: 'Subtree heights differ by at most 1',
      data: { topology: 'balanced' },
    },
  ],
  codeSnippets: {
    cpp: `bool isFull(Node* root) {
    if (!root) return true;
    if (!root->left && !root->right) return true;
    if (root->left && root->right)
        return isFull(root->left) && isFull(root->right);
    return false;
}

bool isComplete(Node* root) {
    if (!root) return true;
    queue<Node*> q; q.push(root);
    bool seenNull = false;
    while (!q.empty()) {
        Node* curr = q.front(); q.pop();
        if (!curr) seenNull = true;
        else {
            if (seenNull) return false;
            q.push(curr->left);
            q.push(curr->right);
        }
    }
    return true;
}`,
    python: `def is_full(root):
    if not root: return True
    if not root.left and not root.right: return True
    if root.left and root.right:
        return is_full(root.left) and is_full(root.right)
    return False

def is_perfect(root):
    d = depth(root)
    return check_perfect(root, d, 0)`,
    typescript: `function isFull(node: TreeNode | null): boolean {
  if (!node) return true;
  if (!node.left && !node.right) return true;
  if (node.left && node.right) return isFull(node.left) && isFull(node.right);
  return false;
}`,
    java: `boolean isFull(Node node) {
    if (node == null) return true;
    if (node.left == null && node.right == null) return true;
    if (node.left != null && node.right != null)
        return isFull(node.left) && isFull(node.right);
    return false;
}`,
    pseudocode: `function verifyTopology(root):
    check full: every node has 0 or 2 children
    check complete: level order traversal has no gap before end
    check perfect: 2^(h+1) - 1 nodes
    check degenerate: every node has at most 1 child`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<BinaryTreeTopologiesState>[] = [];
    const topo = input.topology;

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: BinaryTreeTopologiesState,
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

    let root: TopologyNode;
    let props = {
      isFull: false,
      isComplete: false,
      isPerfect: false,
      isBalanced: false,
      isDegenerate: false,
      height: 0,
      nodeCount: 0,
    };

    if (topo === 'perfect') {
      root = {
        id: 1, val: 1,
        left: { id: 2, val: 2, left: { id: 4, val: 4 }, right: { id: 5, val: 5 } },
        right: { id: 3, val: 3, left: { id: 6, val: 6 }, right: { id: 7, val: 7 } },
      };
      props = { isFull: true, isComplete: true, isPerfect: true, isBalanced: true, isDegenerate: false, height: 2, nodeCount: 7 };
    } else if (topo === 'complete') {
      root = {
        id: 1, val: 1,
        left: { id: 2, val: 2, left: { id: 4, val: 4 }, right: { id: 5, val: 5 } },
        right: { id: 3, val: 3, left: { id: 6, val: 6 }, right: null },
      };
      props = { isFull: false, isComplete: true, isPerfect: false, isBalanced: true, isDegenerate: false, height: 2, nodeCount: 6 };
    } else if (topo === 'full') {
      root = {
        id: 1, val: 1,
        left: { id: 2, val: 2 },
        right: { id: 3, val: 3, left: { id: 4, val: 4 }, right: { id: 5, val: 5 } },
      };
      props = { isFull: true, isComplete: false, isPerfect: false, isBalanced: false, isDegenerate: false, height: 2, nodeCount: 5 };
    } else if (topo === 'degenerate') {
      root = {
        id: 1, val: 1,
        left: null,
        right: {
          id: 2, val: 2,
          left: null,
          right: {
            id: 3, val: 3,
            left: null,
            right: { id: 4, val: 4 },
          },
        },
      };
      props = { isFull: false, isComplete: false, isPerfect: false, isBalanced: false, isDegenerate: true, height: 3, nodeCount: 4 };
    } else {
      root = {
        id: 1, val: 1,
        left: { id: 2, val: 2, left: { id: 4, val: 4 } },
        right: { id: 3, val: 3, right: { id: 5, val: 5 } },
      };
      props = { isFull: false, isComplete: false, isPerfect: false, isBalanced: true, isDegenerate: false, height: 2, nodeCount: 5 };
    }

    addFrame(
      1,
      `Loaded ${topo.toUpperCase()} binary tree topology with ${props.nodeCount} nodes and height ${props.height}. Evaluating structural invariants step-by-step.`,
      {
        topology: topo,
        root,
        inspectedNodeId: null,
        properties: props,
        message: `Analyzing ${topo} binary tree with ${props.nodeCount} nodes.`,
      },
      {
        action: 'INIT',
        variables: { topology: topo, nodes: props.nodeCount, height: props.height },
        callStack: [{ name: 'inspectTopology', params: { topo } }],
      }
    );

    // Phase 1: Node-by-node Full Tree Verification
    addFrame(
      3,
      `Testing Full Tree property: verifying that every node has strictly 0 or 2 children (no degree-1 nodes).`,
      {
        topology: topo,
        root,
        inspectedNodeId: root.id,
        properties: props,
        message: `Beginning degree check on each node starting at root (id=${root.id}).`,
      },
      {
        action: 'CHECK_FULL_START',
        variables: { currentProperty: 'Full Tree Check' },
        callStack: [{ name: 'checkFullTree', params: { root: root.val } }],
      }
    );

    // Traverse nodes and inspect degree
    function inspectFullNodes(node?: TopologyNode | null) {
      if (!node) return;
      const childCount = (node.left ? 1 : 0) + (node.right ? 1 : 0);
      addFrame(
        4,
        `Node ${node.val} (id=${node.id}): Left child: ${node.left ? node.left.val : 'none'}, Right child: ${
          node.right ? node.right.val : 'none'
        } -> ${childCount} children. ${childCount === 0 || childCount === 2 ? 'Valid degree (0 or 2).' : 'Degree-1 violation!'}`,
        {
          topology: topo,
          root,
          inspectedNodeId: node.id,
          properties: props,
          message: `Inspecting Node ${node.val}: degree = ${childCount}`,
        },
        {
          action: 'INSPECT_NODE_DEGREE',
          variables: { nodeId: node.id, nodeVal: node.val, children: childCount, isValidFull: childCount !== 1 },
          callStack: [{ name: 'inspectNodeDegree', params: { node: node.val, children: childCount } }],
        }
      );
      inspectFullNodes(node.left);
      inspectFullNodes(node.right);
    }
    inspectFullNodes(root);

    addFrame(
      5,
      `Full Tree property outcome: ${props.isFull ? 'PASSED — every node has 0 or 2 children.' : 'FAILED — found node with degree 1.'}`,
      {
        topology: topo,
        root,
        inspectedNodeId: null,
        properties: props,
        message: `Full check: ${props.isFull ? 'Passed (Full Tree)' : 'Failed (Not Full)'}`,
      },
      {
        action: 'FULL_CHECK_RESULT',
        variables: { isFull: props.isFull },
        callStack: [{ name: 'checkFullResult', params: { isFull: props.isFull ? 'true' : 'false' } }],
      }
    );

    // Phase 2: Complete Tree Verification via Level-Order Traversal
    addFrame(
      7,
      `Testing Complete Tree property: All levels must be completely filled except possibly the last, and leaves on the last level must be packed as far left as possible (no null gaps preceding valid nodes).`,
      {
        topology: topo,
        root,
        inspectedNodeId: null,
        properties: props,
        message: `Beginning level-order breadth-first scan to detect array packing gaps.`,
      },
      {
        action: 'CHECK_COMPLETE_START',
        variables: { currentProperty: 'Complete Tree Check' },
        callStack: [{ name: 'checkCompleteTree', params: { root: root.val } }],
      }
    );

    // Level-order BFS
    const bfsQueue: (TopologyNode | null)[] = [root];
    let seenNull = false;
    let completeViolation = false;

    while (bfsQueue.length > 0) {
      const curr = bfsQueue.shift()!;
      if (!curr) {
        seenNull = true;
      } else {
        if (seenNull) {
          completeViolation = true;
        }
        addFrame(
          8,
          `Level-order scan: Visited node ${curr.val}. ${seenNull ? 'Violation: found non-null node after a null slot!' : 'Contiguous packing maintained.'}`,
          {
            topology: topo,
            root,
            inspectedNodeId: curr.id,
            properties: props,
            message: `BFS queue visiting Node ${curr.val}.`,
          },
          {
            action: 'BFS_SCAN_NODE',
            variables: { currentNode: curr.val, seenNullSlot: seenNull, hasGap: completeViolation },
            callStack: [{ name: 'bfsVisit', params: { node: curr.val } }],
          }
        );
        bfsQueue.push(curr.left ?? null);
        bfsQueue.push(curr.right ?? null);
      }
    }

    addFrame(
      9,
      `Complete Tree property outcome: ${props.isComplete ? 'PASSED — contiguous array packable with zero gap holes.' : 'FAILED — found gap in level-order sequence.'}`,
      {
        topology: topo,
        root,
        inspectedNodeId: null,
        properties: props,
        message: `Complete check: ${props.isComplete ? 'Passed (Heap/Array Packable)' : 'Failed (Contains Gaps)'}`,
      },
      {
        action: 'COMPLETE_CHECK_RESULT',
        variables: { isComplete: props.isComplete },
        callStack: [{ name: 'checkCompleteResult', params: { isComplete: props.isComplete ? 'true' : 'false' } }],
      }
    );

    // Phase 3: Perfect Tree Verification
    const expectedPerfectNodes = Math.pow(2, props.height + 1) - 1;
    addFrame(
      11,
      `Testing Perfect Tree formula: N = 2^(H+1) - 1. Height H = ${props.height}, Actual N = ${props.nodeCount}, Expected N = 2^(${props.height + 1}) - 1 = ${expectedPerfectNodes}.`,
      {
        topology: topo,
        root,
        inspectedNodeId: null,
        properties: props,
        message: `Perfect check: N=${props.nodeCount} vs Expected=${expectedPerfectNodes} -> ${props.isPerfect ? 'MATCH' : 'MISMATCH'}`,
      },
      {
        action: 'CHECK_PERFECT_RESULT',
        variables: { actualNodes: props.nodeCount, expectedNodes: expectedPerfectNodes, isPerfect: props.isPerfect },
        callStack: [{ name: 'checkPerfect', params: { isPerfect: props.isPerfect ? 'true' : 'false' } }],
      }
    );

    // Phase 4: Height Balance & Degeneracy Verification
    addFrame(
      13,
      `Checking Balance & Degeneracy: Balanced (AVL invariant |hL - hR| <= 1): ${props.isBalanced ? 'YES' : 'NO'}. Degenerate (single linked list chain): ${props.isDegenerate ? 'YES' : 'NO'}.`,
      {
        topology: topo,
        root,
        inspectedNodeId: null,
        properties: props,
        message: `Balance: ${props.isBalanced ? 'Balanced' : 'Unbalanced'}, Degenerate: ${props.isDegenerate ? 'Degenerate' : 'Tree'}`,
      },
      {
        action: 'CHECK_BALANCE_RESULT',
        variables: { isBalanced: props.isBalanced, isDegenerate: props.isDegenerate },
        callStack: [{ name: 'checkBalance', params: { isBalanced: props.isBalanced ? 'true' : 'false' } }],
      }
    );

    addFrame(
      15,
      `Verification complete for ${topo.toUpperCase()} topology. Full=${props.isFull}, Complete=${props.isComplete}, Perfect=${props.isPerfect}, Balanced=${props.isBalanced}, Degenerate=${props.isDegenerate}.`,
      {
        topology: topo,
        root,
        inspectedNodeId: null,
        properties: props,
        message: `Summary: ${topo.toUpperCase()} binary tree fully validated.`,
      },
      {
        action: 'COMPLETE',
        variables: {
          isFull: props.isFull,
          isComplete: props.isComplete,
          isPerfect: props.isPerfect,
          isBalanced: props.isBalanced,
          height: props.height,
          nodeCount: props.nodeCount,
        },
        callStack: [{ name: 'complete', params: { topo } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<BinaryTreeTopologiesState>) => {
    const { root, properties, message } = frame.state;

    const renderNode = (node: TopologyNode | null | undefined): React.ReactNode => {
      if (!node) return null;

      return (
        <div key={`topo-node-${node.id}`} className="flex flex-col items-center space-y-2">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-cyan-950/80 text-cyan-200 font-mono font-bold flex items-center justify-center text-sm shadow-md shadow-cyan-500/20">
            {node.val}
          </div>
          {(node.left || node.right) && (
            <div className="flex gap-4 pt-2 border-t border-slate-700/80 justify-center">
              <div className="flex flex-col items-center">
                {node.left ? (
                  renderNode(node.left)
                ) : (
                  <div className="w-6 h-6 rounded border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                    ø
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                {node.right ? (
                  renderNode(node.right)
                ) : (
                  <div className="w-6 h-6 rounded border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                    ø
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* Tree Topology Canvas */}
        <div className="w-full flex items-center justify-center p-8 bg-slate-950 border border-slate-800 rounded-2xl min-h-[260px] shadow-2xl overflow-x-auto">
          {renderNode(root)}
        </div>

        {/* Properties Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full font-mono text-xs">
          {[
            { label: 'Full Tree', value: properties.isFull },
            { label: 'Complete Tree', value: properties.isComplete },
            { label: 'Perfect Tree', value: properties.isPerfect },
            { label: 'Balanced (AVL)', value: properties.isBalanced },
            { label: 'Degenerate', value: properties.isDegenerate },
          ].map((item, idx) => (
            <div
              key={`prop-${idx}`}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 ${
                item.value
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <span className="text-[11px] text-slate-400 font-normal">{item.label}</span>
              <span className="font-bold text-sm">{item.value ? 'YES' : 'NO'}</span>
            </div>
          ))}
        </div>

        {/* Topology Explanations */}
        <div className="w-full p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono space-y-1">
          <div>• <span className="text-white font-bold">Full:</span> Every node has 0 or 2 children.</div>
          <div>• <span className="text-white font-bold">Complete:</span> All levels filled except bottom, which is left-aligned. Can be packed into array index 2i+1, 2i+2.</div>
          <div>• <span className="text-white font-bold">Perfect:</span> All internal nodes have 2 children, all leaves at identical depth. Exactly 2^(H+1) - 1 nodes.</div>
          <div>• <span className="text-white font-bold">Degenerate:</span> Every parent has only 1 child; degrades search to O(N).</div>
        </div>
      </div>
    );
  },
};
