import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { TreeStage, TreeStageState, TreeNode } from '../../components/stage/TreeStage';

export const bstModule: AlgorithmModule<{ valuesToInsert: number[] }, TreeStageState> = {
  id: 'bst-insert',
  title: 'Binary Search Tree (BST Construction)',
  category: 'trees-bst',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(log N)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Degenerates into linked list if elements inserted in sorted order',
  },
  theory: {
    overview:
      'A Binary Search Tree (BST) is a hierarchical node-based data structure where each node has at most two children. For any given node, all elements in its left subtree are strictly less, and all elements in its right subtree are strictly greater.',
    whyItWorks:
      'The binary search invariant allows search, insertion, and deletion operations to skip half of the remaining subtree at each level, achieving O(log N) average time complexity.',
    invariant:
      'BST Invariant: For every node X in the tree, all nodes in X.left satisfy key < X.key, and all nodes in X.right satisfy key > X.key.',
    pitfalls: [
      'Unbalanced insertions (e.g. inserting 1, 2, 3, 4, 5 in order) produce an O(N) degenerate skew tree.',
      'Self-balancing trees (AVL, Red-Black) maintain O(log N) worst-case height through rotations.',
    ],
  },
  presets: [
    { id: 'balanced', label: 'Balanced Insertion', description: 'Root at 50, even left/right distribution', data: { valuesToInsert: [50, 25, 75, 12, 37, 62, 87] } },
    { id: 'zigzag', label: 'Zig-Zag Tree', description: 'Alternating left and right paths', data: { valuesToInsert: [50, 20, 40, 30, 80, 60, 70] } },
    { id: 'skewed', label: 'Skewed Right', description: 'Demonstrates worst-case degradation', data: { valuesToInsert: [10, 20, 30, 40, 50] } },
  ],
  defaultInput: { valuesToInsert: [50, 25, 75, 12, 37, 62, 87] },
  codeSnippets: {
    python: `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    elif val > root.val:
        root.right = insert(root.right, val)
    return root`,
    typescript: `class TreeNode {
  val: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(val: number) { this.val = val; }
}

function insert(root: TreeNode | null, val: number): TreeNode {
  if (!root) return new TreeNode(val);
  if (val < root.val) {
    root.left = insert(root.left, val);
  } else if (val > root.val) {
    root.right = insert(root.right, val);
  }
  return root;
}`,
    cpp: `struct TreeNode {
    int val;
    TreeNode *left = nullptr;
    TreeNode *right = nullptr;
    TreeNode(int x) : val(x) {}
};

TreeNode* insert(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    if (val < root->val) root->left = insert(root->left, val);
    else if (val > root->val) root->right = insert(root->right, val);
    return root;
}`,
    java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

public TreeNode insert(TreeNode root, int val) {
    if (root == null) return new TreeNode(val);
    if (val < root.val) root.left = insert(root.left, val);
    else if (val > root.val) root.right = insert(root.right, val);
    return root;
}`,
    pseudocode: `function insert(root, val):
    if root is null:
        return new Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else if val > root.val:
        root.right = insert(root.right, val)
    return root`,
  },

  generateTimeline: (input: { valuesToInsert: number[] }): ExecutionFrame<TreeStageState>[] => {
    const frames: ExecutionFrame<TreeStageState>[] = [];
    const values = input.valuesToInsert;

    interface InternalNode {
      id: string;
      value: number;
      level: number;
      left?: InternalNode;
      right?: InternalNode;
    }

    let root: InternalNode | null = null;

    // Helper to calculate coordinates
    function layoutTree(node: InternalNode | null, xMin: number, xMax: number, y: number): TreeNode[] {
      if (!node) return [];
      const x = (xMin + xMax) / 2;
      const current: TreeNode = {
        id: node.id,
        value: node.value,
        x,
        y,
        status: 'default',
        leftId: node.left?.id,
        rightId: node.right?.id,
      };

      const leftNodes = layoutTree(node.left || null, xMin, x, y + 60);
      const rightNodes = layoutTree(node.right || null, x, xMax, y + 60);

      return [current, ...leftNodes, ...rightNodes];
    }

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Starting BST construction for sequence [${values.join(', ')}].`,
      variables: { nextVal: values[0] ?? 0, totalToInsert: values.length, treeSize: 0 },
      callStack: [
        { name: `insert(root, ${values[0] ?? 0})`, params: { val: values[0] ?? 0 }, line: 8, isCurrent: true },
        { name: 'main()', params: { sequenceLength: values.length }, line: 1 },
      ],
      state: { nodes: [], targetValue: values[0] },
    });

    let nodeCounter = 0;

    for (const val of values) {
      const newNodeId = `node-${++nodeCounter}`;

      if (!root) {
        root = { id: newNodeId, value: val, level: 0 };
        const positioned = layoutTree(root, 40, 520, 50);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `Tree is empty. Inserting root node with value ${val}.`,
          isMilestone: true,
          milestoneTitle: `Root Inserted (${val})`,
          variables: { val, rootVal: val, treeSize: 1, isRoot: true },
          callStack: [
            { name: `insert(root, ${val})`, params: { root: 'null', val }, line: 7, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nodes: positioned.map((n) => ({
              ...n,
              status: n.id === newNodeId ? 'sorted' : 'default',
            })),
            targetValue: val,
          },
        });
      } else {
        let curr: InternalNode = root;
        let parent: InternalNode | null = null;
        let branch: 'left' | 'right' = 'left';

        while (curr) {
          parent = curr;
          const currentPos = layoutTree(root, 40, 520, 50);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 9,
            explanation: `Comparing insert value ${val} with current node ${curr.value}.`,
            variables: {
              insertVal: val,
              currNode: curr.value,
              direction: val < curr.value ? 'left' : 'right',
            },
            callStack: [
              {
                name: `insert(${curr.value}, ${val})`,
                params: { curr: curr.value, val },
                line: 9,
                isCurrent: true,
              },
              { name: 'main()', params: {}, line: 1 },
            ],
            conditionEval: {
              expr: `${val} < ${curr.value}`,
              result: val < curr.value,
            },
            state: {
              nodes: currentPos.map((n) => ({
                ...n,
                status: n.id === curr.id ? 'comparing' : 'default',
              })),
              targetValue: val,
            },
          });

          if (val < curr.value) {
            branch = 'left';
            if (!curr.left) break;
            curr = curr.left;
          } else {
            branch = 'right';
            if (!curr.right) break;
            curr = curr.right;
          }
        }

        const insertedNode: InternalNode = { id: newNodeId, value: val, level: (parent?.level || 0) + 1 };
        if (branch === 'left') {
          parent!.left = insertedNode;
        } else {
          parent!.right = insertedNode;
        }

        const updatedPos = layoutTree(root, 40, 520, 50);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Attached new node ${val} as ${branch} child of parent ${parent?.value}.`,
          isMilestone: true,
          milestoneTitle: `Inserted ${val}`,
          variables: {
            insertedVal: val,
            parentVal: parent?.value ?? 0,
            branch,
            treeSize: nodeCounter,
          },
          callStack: [
            {
              name: `insert(${parent?.value}, ${val})`,
              params: { parent: parent?.value ?? 0, val, branch },
              line: 11,
              isCurrent: true,
            },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nodes: updatedPos.map((n) => ({
              ...n,
              status: n.id === newNodeId ? 'sorted' : 'default',
            })),
            targetValue: val,
          },
        });
      }
    }

    const total = frames.length;
    return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <TreeStage state={frame.state} projection={projection} />;
  },
};
