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
      isMilestone: true,
      milestoneTitle: 'BST Initialized',
      soundCue: { type: 'start' },
      variables: { targetKey: key, treeNodes: initialTreeNodes.length, rootVal: internalRoot?.value ?? 0 },
      callStack: [
        { name: `deleteNode(root, ${key})`, params: { key, root: internalRoot?.value ?? 0 }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      conditionEval: { expr: `root !== null`, result: true },
      state: {
        nodes: initialTreeNodes.map((n) => ({ ...n })),
        targetValue: key,
      },
    });

    // Simulate search path to key
    let curr = internalRoot;

    // Frame: Inspect initial candidate node at root
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Inspect node ${curr ? curr.value : 'null'}. Compare key (${key}) with node value (${curr?.value}).`,
      soundCue: { type: 'compare' },
      variables: { currentVal: curr?.value ?? 'null', targetKey: key },
      conditionEval: { expr: `node.val === key`, result: curr?.value === key },
      callStack: [
        { name: `deleteNode(${curr?.value}, ${key})`, params: { curr: curr?.value ?? 'null', key }, line: 2, isCurrent: true },
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
        soundCue: { type: 'step' },
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
        // Case 3: Two children -> find inorder successor step-by-step
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          action: 'ENTER_CASE_3',
          isMilestone: true,
          milestoneTitle: `Case 3: Two Children on Node ${key}`,
          explanation: `Node ${key} has both left child (${targetNode.left?.value}) and right child (${targetNode.right?.value}). Strategy: replace ${key} with its Inorder Successor (the smallest value in its right subtree).`,
          variables: { targetVal: key, strategy: 'Inorder Successor Replacement', rightSubtreeRoot: targetNode.right?.value ?? 0 },
          callStack: [
            { name: `findInorderSuccessor(root.right=${targetNode.right?.value})`, params: { rightRoot: targetNode.right?.value ?? 0 }, line: 12, isCurrent: true },
            { name: `deleteNode(${key})`, params: { key }, line: 7 },
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

        // Step 1 of Case 3: Step into right child
        let succTracker: InternalNode = targetNode.right!;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          action: 'SUCCESSOR_TRAVERSE_START',
          explanation: `Step into right subtree root ${succTracker.value}. Minimum value in right subtree will be found by traversing left as far as possible.`,
          variables: { currentSubtree: succTracker.value, currentCandidateMin: succTracker.value },
          callStack: [
            { name: `traverseLeft(${succTracker.value})`, params: { curr: succTracker.value }, line: 13, isCurrent: true },
            { name: `deleteNode(${key})`, params: { key }, line: 7 },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nodes: computePositions(internalRoot).map((n) => ({
              ...n,
              status: n.id === succTracker.id ? 'comparing' : n.id === targetNode.id ? 'active' : 'default',
            })),
            targetValue: succTracker.value,
          },
        });

        // Traverse down left children
        while (succTracker.left) {
          succTracker = succTracker.left;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 13,
            action: 'SUCCESSOR_TRAVERSE_LEFT',
            explanation: `Found left child ${succTracker.value} < candidate. Traversing left to smaller value ${succTracker.value}.`,
            variables: { currentCandidateMin: succTracker.value },
            callStack: [
              { name: `traverseLeft(${succTracker.value})`, params: { curr: succTracker.value }, line: 13, isCurrent: true },
              { name: `deleteNode(${key})`, params: { key }, line: 7 },
              { name: 'main()', params: {}, line: 1 },
            ],
            state: {
              nodes: computePositions(internalRoot).map((n) => ({
                ...n,
                status: n.id === succTracker.id ? 'comparing' : n.id === targetNode.id ? 'active' : 'default',
              })),
              targetValue: succTracker.value,
            },
          });
        }

        const succVal = succTracker.value;
        const succId = succTracker.id;

        // Frame: Inorder successor confirmed
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          action: 'SUCCESSOR_CONFIRMED',
          isMilestone: true,
          milestoneTitle: `Successor Identified: ${succVal}`,
          soundCue: { type: 'pivot' },
          explanation: `Node ${succVal} has no left child: confirmed as Inorder Successor (next value in sorted sequence).`,
          variables: { targetNode: key, inorderSuccessor: succVal },
          callStack: [
            { name: `successorConfirmed(${succVal})`, params: { succ: succVal }, line: 13, isCurrent: true },
            { name: `deleteNode(${key})`, params: { key }, line: 7 },
            { name: 'main()', params: {}, line: 1 },
          ],
          conditionEval: { expr: `succ.left === null`, result: true },
          state: {
            nodes: computePositions(internalRoot).map((n) => ({
              ...n,
              status: n.id === succId ? 'comparing' : n.id === targetNode.id ? 'active' : 'default',
            })),
            targetValue: succVal,
          },
        });

        // Step 2 of Case 3: Copy successor value to target node
        targetNode.value = succVal;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          action: 'OVERWRITE_VALUE',
          isMilestone: true,
          milestoneTitle: `Copy Value: ${key} -> ${succVal}`,
          soundCue: { type: 'swap' },
          explanation: `Copied successor value ${succVal} into target node (formerly ${key}). Node ${succVal} is now temporarily duplicated.`,
          variables: { oldTargetValue: key, newTargetValue: succVal, duplicatedValue: succVal },
          callStack: [
            { name: `copyValue(target.val = ${succVal})`, params: { val: succVal }, line: 14, isCurrent: true },
            { name: `deleteNode(${key})`, params: { key }, line: 7 },
            { name: 'main()', params: {}, line: 1 },
          ],
          conditionEval: { expr: `root.val = succ.val`, result: true },
          state: {
            nodes: computePositions(internalRoot).map((n) => ({
              ...n,
              status: n.id === targetNode.id ? 'active' : n.id === succId ? 'comparing' : 'default',
            })),
            targetValue: succVal,
          },
        });

        // Step 3 of Case 3: Recursively delete successor from right subtree
        const deleteSuccessor = (r: InternalNode | null, sId: string): InternalNode | null => {
          if (!r) return null;
          if (r.id === sId) return r.right; // Successor has at most a right child!
          r.left = deleteSuccessor(r.left, sId);
          r.right = deleteSuccessor(r.right, sId);
          return r;
        };
        targetNode.right = deleteSuccessor(targetNode.right, succId);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 15,
          action: 'PRUNE_OLD_SUCCESSOR',
          isMilestone: true,
          milestoneTitle: `Pruned Old Successor Node`,
          soundCue: { type: 'discard' },
          explanation: `Recursively spliced out original successor node from right subtree. Tree is valid BST again without duplicate ${succVal}.`,
          variables: { removedSuccessorId: succId, rootValue: internalRoot?.value ?? 0 },
          callStack: [
            { name: `deleteNode(root.right, ${succVal})`, params: { val: succVal }, line: 15, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          conditionEval: { expr: `deleteNode(root.right, succ.val)`, result: true },
          state: {
            nodes: computePositions(internalRoot).map((n) => ({
              ...n,
              status: n.id === targetNode.id ? 'sorted' : 'default',
            })),
            targetValue: succVal,
          },
        });

        // Frame: Invariant verification
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 16,
          action: 'VERIFY_BST_INVARIANT',
          isMilestone: true,
          milestoneTitle: 'BST Invariant Verified',
          soundCue: { type: 'complete' },
          invariantStatus: {
            label: 'BST Invariant: Left < Current < Right holds globally',
            isValid: true,
          },
          explanation: `🎉 Deletion complete! BST invariant verified: left subtree elements < ${succVal} < right subtree elements.`,
          variables: { deletedKey: key, newSubtreeRoot: succVal, totalNodesRemaining: computePositions(internalRoot).length },
          callStack: [
            { name: 'verifyInvariant()', params: {}, line: 16, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nodes: computePositions(internalRoot).map((n) => ({
              ...n,
              status: 'sorted',
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
