import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface LCAInput {
  p: number;
  q: number;
}

interface StaticTreeNode {
  val: number;
  left?: StaticTreeNode;
  right?: StaticTreeNode;
  x: number;
  y: number;
}

export interface LCAState {
  p: number;
  q: number;
  current: number | null;
  visited: number[];
  returns: Record<number, number | null>;
  lcaNode: number | null;
}

const TREE_ROOT: StaticTreeNode = {
  val: 3,
  x: 260,
  y: 42,
  left: {
    val: 5,
    x: 145,
    y: 112,
    left: { val: 6, x: 80, y: 186 },
    right: {
      val: 2,
      x: 205,
      y: 186,
      left: { val: 7, x: 168, y: 256 },
      right: { val: 4, x: 242, y: 256 },
    },
  },
  right: {
    val: 1,
    x: 375,
    y: 112,
    left: { val: 0, x: 325, y: 186 },
    right: { val: 8, x: 430, y: 186 },
  },
};

function flattenTree(node: StaticTreeNode | undefined, list: StaticTreeNode[] = [], edges: { from: StaticTreeNode; to: StaticTreeNode }[] = []) {
  if (!node) return { list, edges };
  list.push(node);
  if (node.left) {
    edges.push({ from: node, to: node.left });
    flattenTree(node.left, list, edges);
  }
  if (node.right) {
    edges.push({ from: node, to: node.right });
    flattenTree(node.right, list, edges);
  }
  return { list, edges };
}

const { list: ALL_NODES, edges: ALL_EDGES } = flattenTree(TREE_ROOT);
const VALID_VALS = new Set(ALL_NODES.map((n) => n.val));

export const lcaBinaryTreeModule: AlgorithmModule<LCAInput, LCAState> = {
  id: 'lca-binary-tree',
  title: 'Lowest Common Ancestor (Binary Tree DFS)',
  category: 'trees-bst',
  difficulty: 'Intermediate',
  defaultInput: { p: 6, q: 4 },
  presets: [
    { id: 'lca-split', label: 'Split Subtrees (p=6, q=4 → 5)', description: 'p and q sit in opposite subtrees of node 5.', data: { p: 6, q: 4 } },
    { id: 'lca-root', label: 'Across Root (p=7, q=8 → 3)', description: 'Targets lie across the root node 3.', data: { p: 7, q: 8 } },
    { id: 'lca-ancestor', label: 'Ancestor-Descendant (p=5, q=4 → 5)', description: 'Target p=5 is itself an ancestor of q=4.', data: { p: 5, q: 4 } },
    { id: 'lca-right', label: 'Right Subtree (p=0, q=8 → 1)', description: 'Both targets live under node 1 on the right side.', data: { p: 0, q: 8 } },
  ],
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(H)',
    worstCaseCondition: 'DFS visits each node at most once; recursion stack depth equals tree height H.',
  },
  theory: {
    overview:
      'The Lowest Common Ancestor of nodes p and q is the deepest node in the tree that has both p and q as descendants (where a node can be a descendant of itself). Post-order DFS searches left and right subtrees and bubbles up any discovered target.',
    whyItWorks:
      'If both left and right recursive calls return non-null, p and q lie in opposite subtrees of the current node — making the current node their exact Lowest Common Ancestor!',
    invariant:
      'lca(node) returns null if neither p nor q is in node’s subtree, returns node immediately if node == p or q, and returns node when both left and right are non-null.',
    pitfalls: [
      'Assuming the tree is a BST (value comparisons fail on general binary trees).',
      'Forgetting that a node can be its own ancestor (e.g. LCA(5, 4) = 5 when 4 is inside 5’s subtree).',
    ],
  },
  relatedModules: [
    { id: 'tree-traversals', label: 'Tree Traversals (DFS)' },
    { id: 'bst-insert', label: 'Binary Search Tree' },
  ],
  codeSnippets: {
    pseudocode: `function lca(node, p, q):
  if node == null or node == p or node == q:
    return node
  left  = lca(node.left, p, q)
  right = lca(node.right, p, q)
  if left != null and right != null:
    return node   // Found LCA!
  return left != null ? left : right`,
    python: `def lca(node, p, q):
    if not node or node.val == p or node.val == q:
        return node
    left = lca(node.left, p, q)
    right = lca(node.right, p, q)
    if left and right:
        return node
    return left or right`,
    typescript: `function lca(node: TreeNode | null, p: number, q: number): TreeNode | null {
  if (!node || node.val === p || node.val === q) return node;
  const left = lca(node.left, p, q);
  const right = lca(node.right, p, q);
  if (left && right) return node;
  return left ?? right;
}`,
    cpp: `TreeNode* lca(TreeNode* node, int p, int q) {
    if (!node || node->val == p || node->val == q) return node;
    auto* left = lca(node->left, p, q);
    auto* right = lca(node->right, p, q);
    if (left && right) return node;
    return left ? left : right;
}`,
    java: `TreeNode lca(TreeNode node, int p, int q) {
    if (node == null || node.val == p || node.val == q) return node;
    TreeNode left = lca(node.left, p, q);
    TreeNode right = lca(node.right, p, q);
    if (left != null && right != null) return node;
    return left != null ? left : right;
}`,
  },
  generateTimeline: (input: LCAInput): ExecutionFrame<LCAState>[] => {
    const p = VALID_VALS.has(Number(input?.p)) ? Number(input.p) : 6;
    const q = VALID_VALS.has(Number(input?.q)) && Number(input.q) !== p ? Number(input.q) : p === 4 ? 6 : 4;

    const frames: ExecutionFrame<LCAState>[] = [];
    const visited = new Set<number>();
    const returns: Record<number, number | null> = {};
    let lcaNode: number | null = null;
    const stack: { name: string; params: Record<string, any>; line: number; isCurrent?: boolean }[] = [];

    const push = (
      codeLine: number,
      explanation: string,
      opts: {
        current: number | null;
        action?: string;
        soundCue?: ExecutionFrame['soundCue'];
        isMilestone?: boolean;
        milestoneTitle?: string;
        conditionEval?: ExecutionFrame['conditionEval'];
        pedagogy?: ExecutionFrame['pedagogy'];
        checkpoint?: ExecutionFrame['checkpoint'];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine,
        action: opts.action,
        explanation,
        soundCue: opts.soundCue,
        isMilestone: opts.isMilestone,
        milestoneTitle: opts.milestoneTitle,
        conditionEval: opts.conditionEval,
        pedagogy: opts.pedagogy,
        checkpoint: opts.checkpoint,
        invariantStatus: {
          label: lcaNode !== null ? `LCA(${p}, ${q}) = ${lcaNode}` : `Searching for p=${p} & q=${q}`,
          isValid: true,
        },
        callStack: stack.map((s, idx) => ({ ...s, isCurrent: idx === 0 })),
        variables: { p, q, current: opts.current ?? 'null', lca: lcaNode ?? 'pending' },
        state: {
          p,
          q,
          current: opts.current,
          visited: Array.from(visited),
          returns: { ...returns },
          lcaNode,
        },
      });
    };

    push(1, `Start Post-Order DFS from root (3) to find Lowest Common Ancestor of p = ${p} and q = ${q}.`, {
      current: TREE_ROOT.val,
      action: 'init',
      soundCue: 'start',
      isMilestone: true,
      milestoneTitle: `Find LCA(${p}, ${q})`,
      pedagogy: {
        what: `Launch recursive lca(root=3, p=${p}, q=${q}).`,
        why: 'Post-order DFS lets each node combine results from its left and right subtrees.',
        whatNext: 'Check whether root (3) matches p or q, then recurse into left child (5).',
      },
    });

    const dfs = (node: StaticTreeNode | undefined): number | null => {
      if (!node) return null;
      stack.unshift({ name: `lca(${node.val})`, params: { node: node.val, p, q }, line: 2 });
      visited.add(node.val);

      if (node.val === p || node.val === q) {
        returns[node.val] = node.val;
        push(
          3,
          `Base case HIT! Node ${node.val} matches target ${node.val === p ? 'p' : 'q'} → bubble up ${node.val} to parent.`,
          {
            current: node.val,
            action: 'found',
            soundCue: 'success',
            isMilestone: true,
            milestoneTitle: `Found ${node.val === p ? 'p' : 'q'}=${node.val}`,
            conditionEval: { expr: `node (${node.val}) == p || q`, result: true },
            pedagogy: {
              what: `Node ${node.val} is one of our targets, so return ${node.val} immediately without searching deeper.`,
              why: 'If the other target is beneath this node, this node itself is the LCA; otherwise its signal bubbles up to meet the other target.',
              whatNext: 'Return up the call stack to parent.',
            },
          }
        );
        stack.shift();
        return node.val;
      }

      push(4, `Visiting node ${node.val} (not p or q). Recursing into left and right subtrees...`, {
        current: node.val,
        action: 'compare',
        soundCue: 'step',
        conditionEval: { expr: `node (${node.val}) == p || q`, result: false },
        pedagogy: {
          what: `Node ${node.val} is neither p (${p}) nor q (${q}).`,
          why: 'We must ask both subtrees whether they contain p or q.',
          whatNext: node.left ? `Explore left child (${node.left.val}).` : 'Leaf node: return null.',
        },
      });

      const leftRes = dfs(node.left);
      const rightRes = dfs(node.right);

      if (leftRes !== null && rightRes !== null) {
        lcaNode = node.val;
        returns[node.val] = node.val;
        push(
          7,
          `🎯 LCA FOUND at node ${node.val}! Left subtree returned ${leftRes} AND right subtree returned ${rightRes}.`,
          {
            current: node.val,
            action: 'found',
            soundCue: 'sorted',
            isMilestone: true,
            milestoneTitle: `LCA = Node ${node.val}`,
            conditionEval: { expr: `left (${leftRes}) != null && right (${rightRes}) != null`, result: true },
            checkpoint: {
              id: 'lca-both-non-null',
              question: `At node ${node.val}, left returned ${leftRes} and right returned ${rightRes}. What does node ${node.val} return?`,
              options: [
                `Node ${node.val} itself (it is the LCA!)`,
                `null`,
                `Only left (${leftRes})`,
              ],
              correctIndex: 0,
              explanation: `Because p and q were found in different subtrees of node ${node.val}, node ${node.val} is their deepest (lowest) common ancestor.`,
            },
            pedagogy: {
              what: `Both left (${leftRes}) and right (${rightRes}) subtrees returned non-null at node ${node.val}.`,
              why: 'Only the exact split-point ancestor receives a non-null signal from BOTH sides.',
              whatNext: `Bubble LCA = ${node.val} all the way back to the root.`,
            },
          }
        );
        stack.shift();
        return node.val;
      }

      const bubbled = leftRes !== null ? leftRes : rightRes;
      returns[node.val] = bubbled;
      push(
        8,
        `Node ${node.val} combines left=${leftRes ?? 'null'}, right=${rightRes ?? 'null'} → bubbles up ${bubbled ?? 'null'}.`,
        {
          current: node.val,
          action: 'step',
          soundCue: 'step',
          conditionEval: { expr: `left != null && right != null`, result: false },
          pedagogy: {
            what: `Propagated ${bubbled ?? 'null'} upward from node ${node.val}.`,
            why: 'When at most one subtree contains a target (or already found the LCA), we forward that non-null pointer upward.',
            whatNext: 'Continue unwinding the DFS stack.',
          },
        }
      );
      stack.shift();
      return bubbled;
    };

    const finalAns = dfs(TREE_ROOT);
    if (lcaNode === null && finalAns !== null) {
      lcaNode = finalAns;
    }

    push(8, `DFS Complete! Lowest Common Ancestor of (${p}, ${q}) is Node ${lcaNode}.`, {
      current: lcaNode,
      action: 'complete',
      soundCue: 'complete',
      isMilestone: true,
      milestoneTitle: `Final LCA = ${lcaNode}`,
      pedagogy: {
        what: `Confirmed LCA(${p}, ${q}) = ${lcaNode} in a single O(N) post-order traversal.`,
        why: 'Even when one target is an ancestor of the other (like p=5, q=4), early return at p correctly bubbles 5 to the root.',
        whatNext: 'Try another preset such as "Ancestor-Descendant" or "Across Root"!',
      },
    });

    const total = frames.length;
    frames.forEach((f, i) => {
      f.stepIndex = i;
      f.totalSteps = total;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<LCAState>) => {
    const { p, q, current, visited, returns, lcaNode } = frame.state;
    const visitedSet = new Set(visited);

    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-3 p-4 select-none">
        {/* Top Target & LCA HUD */}
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-[#111827] border border-[#1F293D] px-4 py-2 font-mono text-xs shadow-sm">
          <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold">
            Target p = {p}
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold">
            Target q = {q}
          </span>
          <span
            style={
              lcaNode !== null
                ? { backgroundColor: 'var(--sem-sorted-solid)', color: 'var(--sem-sorted-on-solid)' }
                : undefined
            }
            className={`px-2.5 py-0.5 rounded font-bold ${
              lcaNode !== null ? 'theme-solid-badge' : 'bg-[#1E293B] text-slate-400 border border-[#334155]'
            }`}
          >
            LCA = {lcaNode !== null ? `Node ${lcaNode}` : 'searching...'}
          </span>
        </div>

        {/* SVG Binary Tree with Live Return Value Bubbles */}
        <div className="w-full rounded-2xl bg-[#111827] border border-[#1F293D] p-3 flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 510 300" className="w-full max-w-[540px] h-auto overflow-visible">
            {/* Edges */}
            {ALL_EDGES.map((edge, idx) => {
              const childReturned = returns[edge.to.val];
              const isSignalEdge = childReturned !== undefined && childReturned !== null;
              return (
                <line
                  key={idx}
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  style={{
                    stroke: isSignalEdge ? 'var(--sem-sorted-solid)' : 'var(--svg-edge-default)',
                  }}
                  strokeWidth={isSignalEdge ? 3 : 2}
                  strokeDasharray={isSignalEdge ? undefined : undefined}
                />
              );
            })}

            {/* Nodes */}
            {ALL_NODES.map((node) => {
              const isLCA = lcaNode === node.val;
              const isCurrent = current === node.val;
              const isTarget = node.val === p || node.val === q;
              const isVisited = visitedSet.has(node.val);
              const hasReturn = node.val in returns;
              const retVal = returns[node.val];

              const fill = isLCA
                ? 'var(--sem-sorted-bg)'
                : isCurrent
                ? 'var(--sem-comparing-bg)'
                : isTarget
                ? 'var(--sem-active-bg)'
                : 'var(--svg-node-bg)';
              const stroke = isLCA
                ? 'var(--sem-sorted-border)'
                : isCurrent
                ? 'var(--sem-comparing-border)'
                : isTarget
                ? 'var(--sem-active-border)'
                : isVisited
                ? 'var(--sem-pivot-border)'
                : 'var(--svg-node-border)';
              const textFill = isLCA
                ? 'var(--sem-sorted-text)'
                : isCurrent
                ? 'var(--sem-comparing-text)'
                : isTarget
                ? 'var(--sem-active-text)'
                : 'var(--svg-node-text)';

              return (
                <g key={node.val}>
                  {isLCA && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={27}
                      fill="none"
                      style={{ stroke: 'var(--sem-sorted-solid)' }}
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={20}
                    style={{ fill, stroke }}
                    strokeWidth={isLCA || isCurrent || isTarget ? 3 : 2}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    style={{ fill: textFill }}
                    fontSize="14"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.val}
                  </text>

                  {/* Target p / q / LCA tag above node */}
                  {(isTarget || isLCA) && (
                    <g>
                      <rect
                        x={node.x - 18}
                        y={node.y - 36}
                        width={36}
                        height={14}
                        rx={4}
                        style={{
                          fill: isLCA
                            ? 'var(--sem-sorted-solid)'
                            : node.val === p
                            ? 'var(--sem-active-solid)'
                            : 'var(--sem-comparing-solid)',
                        }}
                      />
                      <text
                        x={node.x}
                        y={node.y - 26}
                        textAnchor="middle"
                        className="svg-on-solid"
                        style={{
                          fill: isLCA
                            ? 'var(--sem-sorted-on-solid)'
                            : node.val === p
                            ? 'var(--sem-active-on-solid)'
                            : 'var(--sem-comparing-on-solid)',
                        }}
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {isLCA ? 'LCA ★' : node.val === p ? 'p' : 'q'}
                      </text>
                    </g>
                  )}

                  {/* Bubbled return value pill to the right of node */}
                  {hasReturn && (
                    <g>
                      <rect
                        x={node.x + 17}
                        y={node.y - 8}
                        width={34}
                        height={15}
                        rx={4}
                        style={{
                          fill: 'var(--svg-badge-bg)',
                          stroke: retVal !== null ? 'var(--sem-sorted-border)' : 'var(--svg-edge-default)',
                        }}
                        strokeWidth="1"
                      />
                      <text
                        x={node.x + 34}
                        y={node.y + 2.5}
                        textAnchor="middle"
                        style={{ fill: retVal !== null ? 'var(--sem-sorted-text)' : 'var(--theme-text-muted)' }}
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        ↑{retVal === null ? 'null' : retVal}
                      </text>
                    </g>
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
