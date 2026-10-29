import { TreeNode } from '../components/stage/TreeStage';

export interface ResolvedTreeLayout {
  nodes: (TreeNode & { depth: number; childRole?: 'root' | 'left' | 'right' })[];
  width: number;
  height: number;
}

/**
 * Resolves horizontal and vertical overlaps in binary/n-ary tree visualizations.
 * Guarantees that nodes on the same level maintain at least `minHorizontalGap` px distance
 * and computes a responsive bounding box (width, height) that never clips deep or skewed trees.
 */
export function resolveTreeNodesOverlap(
  rawNodes: TreeNode[],
  minHorizontalGap: number = 56,
  baseWidth: number = 600,
  levelHeight: number = 68
): ResolvedTreeLayout {
  if (!rawNodes || rawNodes.length === 0) {
    return { nodes: [], width: baseWidth, height: 320 };
  }

  const nodeMap = new Map<string, TreeNode>();
  const parentMap = new Map<string, { parentId: string; role: 'left' | 'right' }>();

  for (const n of rawNodes) {
    nodeMap.set(n.id, n);
  }

  for (const n of rawNodes) {
    if (n.leftId && nodeMap.has(n.leftId)) {
      parentMap.set(n.leftId, { parentId: n.id, role: 'left' });
    }
    if (n.rightId && nodeMap.has(n.rightId)) {
      parentMap.set(n.rightId, { parentId: n.id, role: 'right' });
    }
  }

  // Identify roots (nodes with no incoming parent edge)
  const roots = rawNodes.filter((n) => !parentMap.has(n.id));
  const hasExplicitLinks = parentMap.size > 0 && roots.length > 0;

  // Assign depths: either by tree traversal or by clustering existing y coordinates
  const depthMap = new Map<string, number>();

  if (hasExplicitLinks) {
    const visited = new Set<string>();
    const assignDepth = (id: string, depth: number) => {
      if (visited.has(id)) return;
      visited.add(id);
      depthMap.set(id, depth);
      const node = nodeMap.get(id);
      if (!node) return;
      if (node.leftId && nodeMap.has(node.leftId)) assignDepth(node.leftId, depth + 1);
      if (node.rightId && nodeMap.has(node.rightId)) assignDepth(node.rightId, depth + 1);
    };

    for (const r of roots) {
      assignDepth(r.id, 0);
    }
    // Fallback for any disconnected nodes
    for (const n of rawNodes) {
      if (!depthMap.has(n.id)) {
        depthMap.set(n.id, 0);
      }
    }
  } else {
    // Cluster by existing y-coordinate sorted order
    const uniqueYs = Array.from(new Set(rawNodes.map((n) => Math.round(n.y / 25) * 25))).sort(
      (a, b) => a - b
    );
    for (const n of rawNodes) {
      const bucket = Math.round(n.y / 25) * 25;
      const d = Math.max(0, uniqueYs.indexOf(bucket));
      depthMap.set(n.id, d);
    }
  }

  // Group nodes by depth level
  const levels = new Map<number, TreeNode[]>();
  let maxDepth = 0;
  for (const n of rawNodes) {
    const d = depthMap.get(n.id) ?? 0;
    if (d > maxDepth) maxDepth = d;
    if (!levels.has(d)) levels.set(d, []);
    levels.get(d)!.push({ ...n });
  }

  // Check if any same-level nodes are too close horizontally or out of bounds
  let needsRebalance = false;
  for (const [, levelNodes] of levels.entries()) {
    const sorted = [...levelNodes].sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].x - sorted[i - 1].x < minHorizontalGap) {
        needsRebalance = true;
        break;
      }
    }
  }

  const clonedNodes = rawNodes.map((n) => ({
    ...n,
    depth: depthMap.get(n.id) ?? 0,
    childRole: (parentMap.get(n.id)?.role ?? (roots.some((r) => r.id === n.id) ? 'root' : undefined)) as
      | 'root'
      | 'left'
      | 'right'
      | undefined,
  }));

  const clonedMap = new Map(clonedNodes.map((n) => [n.id, n]));

  // If explicit binary links exist and nodes collide (or tree is deep), use inorder rank + parent centering
  if (hasExplicitLinks && (needsRebalance || maxDepth >= 4 || rawNodes.length > 7)) {
    let rank = 0;
    const visitedInorder = new Set<string>();
    const inorderAssign = (id: string | undefined) => {
      if (!id || visitedInorder.has(id) || !clonedMap.has(id)) return;
      visitedInorder.add(id);
      const node = clonedMap.get(id)!;
      if (node.leftId) inorderAssign(node.leftId);
      node.x = 48 + rank * minHorizontalGap;
      rank++;
      if (node.rightId) inorderAssign(node.rightId);
    };

    for (const r of roots) {
      inorderAssign(r.id);
    }
    for (const n of clonedNodes) {
      if (!visitedInorder.has(n.id)) {
        n.x = 48 + rank * minHorizontalGap;
        rank++;
      }
    }

    // Center parents over their children when both children exist and it doesn't cause overlap
    for (let d = maxDepth; d >= 0; d--) {
      const levelList = clonedNodes
        .filter((n) => n.depth === d)
        .sort((a, b) => a.x - b.x);

      for (const n of levelList) {
        const left = n.leftId ? clonedMap.get(n.leftId) : undefined;
        const right = n.rightId ? clonedMap.get(n.rightId) : undefined;
        if (left && right) {
          n.x = (left.x + right.x) / 2;
        } else if (left && !right) {
          n.x = Math.max(n.x, left.x + minHorizontalGap * 0.55);
        } else if (right && !left) {
          n.x = Math.min(n.x, right.x - minHorizontalGap * 0.55);
        }
      }

      // Enforce minimum horizontal gap on each level after centering
      levelList.sort((a, b) => a.x - b.x);
      for (let i = 1; i < levelList.length; i++) {
        if (levelList[i].x - levelList[i - 1].x < minHorizontalGap) {
          levelList[i].x = levelList[i - 1].x + minHorizontalGap;
        }
      }
    }
  } else {
    // Even without rebalancing the whole tree, strictly enforce minHorizontalGap per level
    for (let d = 0; d <= maxDepth; d++) {
      const levelList = clonedNodes
        .filter((n) => n.depth === d)
        .sort((a, b) => a.x - b.x);
      for (let i = 1; i < levelList.length; i++) {
        if (levelList[i].x - levelList[i - 1].x < minHorizontalGap) {
          const deficit = minHorizontalGap - (levelList[i].x - levelList[i - 1].x);
          levelList[i - 1].x -= deficit / 2;
          levelList[i].x += deficit / 2;
        }
      }
      // Second forward pass in case 3+ nodes were bunched together
      for (let i = 1; i < levelList.length; i++) {
        if (levelList[i].x - levelList[i - 1].x < minHorizontalGap) {
          levelList[i].x = levelList[i - 1].x + minHorizontalGap;
        }
      }
    }
  }

  // Normalize vertical coordinates by depth and recenter horizontally
  for (const n of clonedNodes) {
    n.y = 46 + n.depth * levelHeight;
  }

  const minX = Math.min(...clonedNodes.map((n) => n.x));
  const maxX = Math.max(...clonedNodes.map((n) => n.x));
  const spanX = maxX - minX;
  const computedWidth = Math.max(baseWidth, spanX + 110);
  const offsetX = (computedWidth - spanX) / 2 - minX;

  for (const n of clonedNodes) {
    n.x = Math.round(n.x + offsetX);
  }

  const maxY = Math.max(...clonedNodes.map((n) => n.y));
  const computedHeight = Math.max(300, maxY + 64);

  return {
    nodes: clonedNodes,
    width: computedWidth,
    height: computedHeight,
  };
}

export interface HeapNodeCoord {
  x: number;
  y: number;
  depth: number;
}

/**
 * Computes non-overlapping Complete Binary Tree coordinates for a Binary Heap of any size N.
 * Fixes the bug where heaps with >7 elements had missing coordinates.
 */
export function computeHeapLayout(
  count: number,
  minLeafGap: number = 52,
  levelHeight: number = 62
): { coords: HeapNodeCoord[]; width: number; height: number } {
  if (count <= 0) {
    return { coords: [], width: 420, height: 220 };
  }

  const maxDepth = Math.floor(Math.log2(count));
  const maxLeaves = Math.pow(2, maxDepth);
  const width = Math.max(420, maxLeaves * minLeafGap + 64);
  const height = Math.max(200, (maxDepth + 1) * levelHeight + 40);

  const coords: HeapNodeCoord[] = [];
  for (let idx = 0; idx < count; idx++) {
    const depth = Math.floor(Math.log2(idx + 1));
    const nodesInLevel = Math.pow(2, depth);
    const indexInLevel = idx - (nodesInLevel - 1);
    const usableWidth = width - 48;
    const x = 24 + ((indexInLevel + 0.5) / nodesInLevel) * usableWidth;
    const y = 34 + depth * levelHeight;
    coords.push({ x: Math.round(x), y: Math.round(y), depth });
  }

  return { coords, width, height };
}

export interface PointerBadgeItem {
  name: string;
  role: 'pivot' | 'left' | 'right' | 'target';
}

/**
 * Groups pointer names by array index in a deterministic order so multiple pointers
 * on the same index stack vertically inside a fixed-height track without shifting bar baselines.
 */
export function groupPointersByIndex(
  pointers: Record<string, number> | undefined
): Record<number, PointerBadgeItem[]> {
  const result: Record<number, PointerBadgeItem[]> = {};
  if (!pointers) return result;

  const classifyPointer = (name: string): PointerBadgeItem['role'] => {
    const lower = name.toLowerCase();
    if (lower.includes('pivot')) return 'pivot';
    if (lower.includes('mid') || lower.includes('target') || lower.includes('curr')) return 'target';
    if (lower === 'left' || lower === 'l' || lower === 'i' || lower === 'low' || lower === 'slow' || lower === 'start') {
      return 'left';
    }
    return 'right';
  };

  for (const [name, idx] of Object.entries(pointers)) {
    if (typeof idx === 'number' && idx >= 0) {
      if (!result[idx]) result[idx] = [];
      result[idx].push({ name, role: classifyPointer(name) });
    }
  }

  return result;
}
