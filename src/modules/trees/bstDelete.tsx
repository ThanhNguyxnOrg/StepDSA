import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { TreeStage, TreeStageState, TreeNode } from '../../components/stage/TreeStage';

export const bstDeleteModule: AlgorithmModule<
  { initialValues: number[]; keyToDelete: number },
  TreeStageState
> = {
  id: 'bst-delete',
  title: 'BST Deletion (Inorder Successor Re-linking O(H))',
  category: 'trees-bst',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(log N)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(H) recursion stack',
    worstCaseCondition: 'Degenerate skew tree where target is leaf at maximum depth',
  },
  theory: {
    overview:
      'Deletion in a Binary Search Tree (BST) removes a node while strictly preserving the BST invariant. The procedure handles three structural topologies: (1) Leaf Node, (2) Node with Single Child, and (3) Node with Two Children.',
    whyItWorks:
      'When removing a node with two children, swapping its key with its in-order successor (the minimum node in its right subtree) guarantees that the replacement value is strictly greater than all left descendants and strictly less than all other right descendants.',
    invariant:
      'BST Deletion Invariant: For every remaining node X, X.left.keys < X.key < X.right.keys remains globally invariant across all recursive deletions.',
    pitfalls: [
      'Forgetting to update the parent pointer when removing a single-child node.',
      'Failing to recursively delete the inorder successor from the right subtree after copying its value.',
      'Deleting the root node when the tree only has 1 node.',
    ],
  },
  presets: [
    {
      id: 'delete-two-children',
      label: 'Delete Node with 2 Children (Delete 50 - Root)',
      description: 'Finds successor 62, replaces root, and unlinks 62',
      data: { initialValues: [50, 25, 75, 12, 37, 62, 87], keyToDelete: 50 },
    },
    {
      id: 'delete-leaf',
      label: 'Delete Leaf Node (Delete 12)',
      description: 'Zero children: unlinks directly from parent 25',
      data: { initialValues: [50, 25, 75, 12, 37, 62, 87], keyToDelete: 12 },
    },
    {
      id: 'delete-single-child',
      label: 'Delete Single Child Node (Delete 25)',
      description: 'One child: promotes child directly to replace 25',
      data: { initialValues: [50, 25, 75, 37, 62, 87], keyToDelete: 25 },
    },
  ],
  defaultInput: { initialValues: [50, 25, 75, 12, 37, 62, 87], keyToDelete: 50 },
  codeSnippets: {
    python: `def deleteNode(root, key):
    if not root: return None
    if key < root.val:
        root.left = deleteNode(root.left, key)
    elif key > root.val:
        root.right = deleteNode(root.right, key)
    else:
        # Case 1 & 2: 0 or 1 child
        if not root.left: return root.right
        if not root.right: return root.left
        # Case 3: 2 children - find inorder successor
        succ = root.right
        while succ.left: succ = succ.left
        root.val = succ.val
        root.right = deleteNode(root.right, succ.val)
    return root`,
    typescript: `function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  if (!root) return null;
  if (key < root.val) {
    root.left = deleteNode(root.left, key);
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key);
  } else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let succ = root.right;
    while (succ.left) succ = succ.left;
    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
  }
  return root;
}`,
    cpp: `TreeNode* deleteNode(TreeNode* root, int key) {
    if (!root) return nullptr;
    if (key < root->val) root->left = deleteNode(root->left, key);
    else if (key > root->val) root->right = deleteNode(root->right, key);
    else {
        if (!root->left) { TreeNode* r = root->right; delete root; return r; }
        if (!root->right) { TreeNode* l = root->left; delete root; return l; }
        TreeNode* succ = root->right;
        while (succ->left) succ = succ->left;
        root->val = succ->val;
        root->right = deleteNode(root->right, succ->val);
    }
    return root;
}`,
    java: `public TreeNode deleteNode(TreeNode root, int key) {
    if (root == null) return null;
    if (key < root.val) root.left = deleteNode(root.left, key);
    else if (key > root.val) root.right = deleteNode(root.right, key);
    else {
        if (root.left == null) return root.right;
        if (root.right == null) return root.left;
        TreeNode succ = root.right;
        while (succ.left != null) succ = succ.left;
        root.val = succ.val;
        root.right = deleteNode(root.right, succ.val);
    }
    return root;
}`,
    pseudocode: `function deleteNode(root, key):
    if root is null: return null
    if key < root.val: root.left = deleteNode(root.left, key)
    else if key > root.val: root.right = deleteNode(root.right, key)
    else:
        if root.left is null: return root.right
        if root.right is null: return root.left
        succ = findMin(root.right)
        root.val = succ.val
        root.right = deleteNode(root.right, succ.val)
    return root`,
  },

  generateTimeline: (input: {
    initialValues: number[];
    keyToDelete: number;
  }): ExecutionFrame<TreeStageState>[] => {
    const values = input.initialValues.length > 0 ? input.initialValues : [50, 25, 75, 12, 37, 62, 87];
    const key = input.keyToDelete ?? 50;

    // Build internal BST representation
    interface InternalNode {
      id: string;
      value: number;
      left: InternalNode | null;
      right: InternalNode | null;
    }

    let internalRoot: InternalNode | null = null;
    let nodeSeq = 0;

    const insertInternal = (root: InternalNode | null, v: number): InternalNode => {
      if (!root) return { id: `node-${++nodeSeq}`, value: v, left: null, right: null };
      if (v < root.value) root.left = insertInternal(root.left, v);
      else if (v > root.value) root.right = insertInternal(root.right, v);
      return root;
    };

    for (const v of values) {
      internalRoot = insertInternal(internalRoot, v);
    }

    const computePositions = (
      root: InternalNode | null,
      x = 50,
      y = 15,
      spread = 22,
      depth = 0
    ): TreeNode[] => {
      if (!root) return [];
      const leftNodes = computePositions(root.left, x - spread, y + 22, spread * 0.55, depth + 1);
      const rightNodes = computePositions(root.right, x + spread, y + 22, spread * 0.55, depth + 1);
      const currNode: TreeNode = {
        id: root.id,
        value: root.value,
        x,
        y,
        status: 'default',
        leftId: root.left ? root.left.id : undefined,
        rightId: root.right ? root.right.id : undefined,
      };
      return [currNode, ...leftNodes, ...rightNodes];
    };

    const frames: ExecutionFrame<TreeStageState>[] = [];
    const initialTreeNodes = computePositions(internalRoot);

    // Frame 0: Initial state
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `BST loaded with ${values.length} nodes. Commencing search and deletion of key = ${key}.`,
      variables: { targetKey: key, treeNodes: initialTreeNodes.length, rootVal: internalRoot?.value ?? 0 },
      callStack: [
        { name: `deleteNode(root, ${key})`, params: { key, root: internalRoot?.value ?? 0 }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        nodes: initialTreeNodes.map((n) => ({ ...n })),
        targetValue: key,
      },
    });

    // Simulate search path to key
    let curr = internalRoot;
    const path: InternalNode[] = [];
    while (curr && curr.value !== key) {
      path.push(curr);
      const currVal = curr.value;
      const nextDir = key < currVal ? 'left' : 'right';

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: key < currVal ? 3 : 5,
        explanation: `Target key ${key} ${key < currVal ? '<' : '>'} current node ${currVal}. Traverse ${nextDir} subtree.`,
        variables: { currentVal: currVal, targetKey: key, direction: nextDir },
        conditionEval: {
          expr: `${key} ${key < currVal ? '<' : '>'} ${currVal}`,
          result: true,
        },
        callStack: [
          { name: `deleteNode(${currVal}, ${key})`, params: { curr: currVal, key }, line: key < currVal ? 3 : 5, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          nodes: computePositions(internalRoot).map((n) => ({
            ...n,
            status: n.id === curr?.id ? 'comparing' : 'default',
          })),
          targetValue: key,
        },
      });

      curr = key < currVal ? curr.left : curr.right;
    }

    if (!curr) {
      // Key not found
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 2,
        isMilestone: true,
        milestoneTitle: `Key ${key} Not Found`,
        explanation: `Reached null leaf without finding key ${key}. Tree structure unchanged.`,
        variables: { found: 'false' },
        callStack: [
          { name: 'returnNull()', params: {}, line: 2, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          nodes: computePositions(internalRoot),
          targetValue: key,
        },
      });
    } else {
      // Key found! Highlight target
      const targetNode = curr;
      const hasLeft = targetNode.left !== null;
      const hasRight = targetNode.right !== null;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        isMilestone: true,
        milestoneTitle: `Located Node (${key})`,
        explanation: `Located target node ${key}. Topology: ${
          hasLeft && hasRight
            ? 'Two Children (Case 3)'
            : hasLeft || hasRight
            ? 'Single Child (Case 2)'
            : 'Leaf Node (Case 1)'
        }.`,
        variables: { targetVal: key, hasLeft: String(hasLeft), hasRight: String(hasRight) },
        callStack: [
          { name: `foundNode(${key})`, params: { val: key, children: hasLeft && hasRight ? 2 : hasLeft || hasRight ? 1 : 0 }, line: 7, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          nodes: computePositions(internalRoot).map((n) => ({
            ...n,
            status: n.id === targetNode.id ? 'active' : 'default',
          })),
          targetValue: key,
        },
      });

      if (!hasLeft && !hasRight) {
        // Case 1: Leaf
        const deleteLeaf = (r: InternalNode | null): InternalNode | null => {
          if (!r) return null;
          if (r.id === targetNode.id) return null;
          r.left = deleteLeaf(r.left);
          r.right = deleteLeaf(r.right);
          return r;
        };
        internalRoot = deleteLeaf(internalRoot);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          isMilestone: true,
          milestoneTitle: `Leaf Node (${key}) Unlinked`,
          explanation: `Leaf node ${key} has no children. Unlinked directly from parent pointer.`,
          variables: { removedLeaf: key, remainingNodes: computePositions(internalRoot).length },
          callStack: [
            { name: `unlinkLeaf(${key})`, params: { unlinked: key }, line: 9, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nodes: computePositions(internalRoot).map((n) => ({ ...n, status: 'sorted' })),
            targetValue: key,
          },
        });
      } else if (!hasLeft || !hasRight) {
        // Case 2: One child
        const child = (targetNode.left || targetNode.right)!;
        const spliceOne = (r: InternalNode | null): InternalNode | null => {
          if (!r) return null;
          if (r.id === targetNode.id) return child;
          r.left = spliceOne(r.left);
          r.right = spliceOne(r.right);
          return r;
        };
        internalRoot = spliceOne(internalRoot);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          isMilestone: true,
          milestoneTitle: `Promoted Child (${child.value})`,
          explanation: `Node ${key} has single child ${child.value}. Promoted child directly into parent reference.`,
          variables: { removedNode: key, promotedChild: child.value },
          callStack: [
            { name: `spliceChild(${key})`, params: { child: child.value }, line: 10, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nodes: computePositions(internalRoot).map((n) => ({
              ...n,
              status: n.value === child.value ? 'active' : 'default',
            })),
            targetValue: key,
          },
        });
      } else {
        // Case 3: Two children -> find successor
        let succ = targetNode.right!;
        while (succ.left) succ = succ.left;
        const succVal = succ.value;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          isMilestone: true,
          milestoneTitle: `Inorder Successor Found (${succVal})`,
          explanation: `Target ${key} has two children. Located inorder successor ${succVal} (smallest value in right subtree).`,
          variables: { targetNode: key, inorderSuccessor: succVal },
          callStack: [
            { name: `findSuccessor(${key})`, params: { succ: succVal }, line: 13, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nodes: computePositions(internalRoot).map((n) => ({
              ...n,
              status: n.value === succVal ? 'comparing' : n.id === targetNode.id ? 'active' : 'default',
            })),
            targetValue: succVal,
          },
        });

        // Copy successor value to target
        targetNode.value = succVal;

        // Delete successor from right subtree
        const deleteSuccessor = (r: InternalNode | null, sVal: number): InternalNode | null => {
          if (!r) return null;
          if (r.value === sVal) return r.right;
          r.left = deleteSuccessor(r.left, sVal);
          r.right = deleteSuccessor(r.right, sVal);
          return r;
        };
        targetNode.right = deleteSuccessor(targetNode.right, succVal);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 15,
          isMilestone: true,
          milestoneTitle: `Replaced with Successor (${succVal})`,
          explanation: `Copied successor value ${succVal} into target node position, and pruned old successor leaf from right subtree. BST invariant fully restored!`,
          variables: { newRootVal: succVal, prunedVal: succVal },
          callStack: [
            { name: `completeReplacement(${succVal})`, params: { value: succVal }, line: 15, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nodes: computePositions(internalRoot).map((n) => ({
              ...n,
              status: n.value === succVal ? 'sorted' : 'default',
            })),
            targetValue: succVal,
          },
        });
      }
    }

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<TreeStageState>, projection: '2d' | 'isometric') => {
    return <TreeStage state={frame.state} projection={projection} />;
  },
};
