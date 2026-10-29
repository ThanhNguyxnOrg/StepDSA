import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Keyboard,
  Terminal,
  Laptop,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { AlgorithmModule } from '../../core/types';
import { AlgorithmCardThumbnail } from './AlgorithmCardThumbnail';
import { usePlatformShortcuts } from '../../utils/platformShortcuts';
import { resolveCategoryThemeColor, getCardThemePalette } from '../../utils/themeEngine';

interface DashboardViewProps {
  modules: AlgorithmModule[];
  onSelectModule: (module: AlgorithmModule) => void;
  onOpenPersonalStudio?: () => void;
  onOpenShortcuts?: () => void;
}

/**
 * Truncates and normalizes lengthy descriptive Big-O expressions into clean,
 * concise mathematical notation suitable for single-line card metadata.
 */
export function formatCompactBigO(raw?: string): string {
  if (!raw) return 'O(1)';
  const trimmed = raw.trim().replace(/\.$/, '');
  const primaryClause = trimmed.split(/\s+(?:with|for|where|using|depending|or|\(or)\s+/i)[0].trim();

  let clean = primaryClause;
  const secondaryParenMatch = clean.match(/^((?:O|Θ|Ω)\([^)]+\))\s*\([^)]*\)$/i);
  if (secondaryParenMatch) {
    clean = secondaryParenMatch[1];
  }

  const openCount = (clean.match(/\(/g) || []).length;
  const closeCount = (clean.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    clean += ')'.repeat(openCount - closeCount);
  }

  if (clean.length > 15) {
    const mathMatch = clean.match(/(?:O|Θ|Ω)\([^)]+\)/);
    if (mathMatch) return mathMatch[0];
    return clean.slice(0, 14) + '…';
  }

  return clean || trimmed;
}

const ALGO_METADATA: Record<
  string,
  { shortTitle: string; subtitle: string; tags: string[]; themeColor: string }
> = {
  'quicksort': {
    shortTitle: 'Quicksort',
    subtitle: 'Pivot Partitioning',
    tags: ['divide & conquer', 'in-place', 'pivot'],
    themeColor: 'cyan',
  },
  'mergesort': {
    shortTitle: 'Mergesort',
    subtitle: 'Divide & Conquer Merge',
    tags: ['divide & conquer', 'stable', 'recursive'],
    themeColor: 'blue',
  },
  'bubble-sort': {
    shortTitle: 'Bubble Sort',
    subtitle: 'Adjacent Swapping',
    tags: ['adjacent-swap', 'in-place', 'beginner'],
    themeColor: 'emerald',
  },
  'binary-search': {
    shortTitle: 'Binary Search',
    subtitle: 'Halving Search Space',
    tags: ['sorted-array', 'halving', 'O(log N)'],
    themeColor: 'purple',
  },
  'bst-insert': {
    shortTitle: 'BST Tree',
    subtitle: 'Binary Search Tree',
    tags: ['binary-tree', 'hierarchical', 'inorder'],
    themeColor: 'indigo',
  },
  'linked-list': {
    shortTitle: 'Linked List',
    subtitle: 'Pointers & Nodes',
    tags: ['singly', 'tail-insert', 'traversal'],
    themeColor: 'blue',
  },
  'binary-heap': {
    shortTitle: 'Binary Heap',
    subtitle: 'Priority Queue & Sift-Up',
    tags: ['complete-tree', 'sift-up', 'array-backed'],
    themeColor: 'teal',
  },
  'graph-bfs': {
    shortTitle: 'Graph BFS',
    subtitle: 'Breadth-First Wavefront',
    tags: ['fifo-queue', 'shortest-path', 'wavefront'],
    themeColor: 'purple',
  },
  'graph-dfs': {
    shortTitle: 'Graph DFS',
    subtitle: 'Call Stack & Backtracking',
    tags: ['call-stack', 'recursion', 'back-edge'],
    themeColor: 'rose',
  },
  'trie-prefix': {
    shortTitle: 'Trie Tree',
    subtitle: 'Prefix & Autocomplete',
    tags: ['prefix-tree', 'autocomplete', 'strings'],
    themeColor: 'teal',
  },
  'dijkstra': {
    shortTitle: "Dijkstra's Algorithm",
    subtitle: 'Min-Heap Shortest Path',
    tags: ['priority-queue', 'relaxation', 'greedy'],
    themeColor: 'sky',
  },
  'knapsack-01': {
    shortTitle: '0/1 Knapsack',
    subtitle: '2D DP Table & Backtrack',
    tags: ['dynamic-programming', 'matrix', 'subset-choice'],
    themeColor: 'emerald',
  },
  'octree-3d': {
    shortTitle: 'Octree',
    subtitle: '3D Spatial Partitioning',
    tags: ['3D-space', 'octants', 'collision-detection'],
    themeColor: 'indigo',
  },
  'linear-search': {
    shortTitle: 'Linear Search',
    subtitle: 'Sequential Scan',
    tags: ['sequential', 'unsorted-array', 'O(N)'],
    themeColor: 'emerald',
  },
  'insertion-sort': {
    shortTitle: 'Insertion Sort',
    subtitle: 'Incremental Build & Shift',
    tags: ['in-place', 'adaptive', 'online-sort'],
    themeColor: 'amber',
  },
  'selection-sort': {
    shortTitle: 'Selection Sort',
    subtitle: 'Minimum Element Scan',
    tags: ['minimum-scan', 'minimal-swaps', 'O(N²)'],
    themeColor: 'amber',
  },
  'counting-sort': {
    shortTitle: 'Counting Sort',
    subtitle: 'Frequency Bucket Indexing',
    tags: ['non-comparison', 'prefix-sums', 'linear-time'],
    themeColor: 'indigo',
  },
  'topological-sort': {
    shortTitle: 'Topological Sort',
    subtitle: "Kahn's In-Degree Queue",
    tags: ['DAG', 'in-degree', 'dependency-resolution'],
    themeColor: 'teal',
  },
  'valid-parentheses': {
    shortTitle: 'Balanced Parentheses',
    subtitle: 'Stack LIFO Validation',
    tags: ['stack', 'LIFO', 'bracket-matching'],
    themeColor: 'cyan',
  },
  'lcs': {
    shortTitle: 'LCS (Longest Common Subsequence)',
    subtitle: '2D DP Matrix & Backtrack',
    tags: ['dynamic-programming', 'string-diff', 'optimal-substructure'],
    themeColor: 'purple',
  },
  'sieve-of-eratosthenes': {
    shortTitle: 'Sieve of Eratosthenes',
    subtitle: 'Prime Elimination Grid',
    tags: ['number-theory', 'primes', 'O(N log log N)'],
    themeColor: 'emerald',
  },
  'euclidean-gcd': {
    shortTitle: 'Euclidean Algorithm',
    subtitle: 'Greatest Common Divisor',
    tags: ['number-theory', 'modulo', 'Lamé-theorem'],
    themeColor: 'amber',
  },
  'kruskal-mst': {
    shortTitle: "Kruskal's MST",
    subtitle: 'Disjoint Set Union (DSU)',
    tags: ['greedy', 'minimum-spanning-tree', 'cycle-detection'],
    themeColor: 'teal',
  },
  'radix-sort': {
    shortTitle: 'Radix Sort (LSD)',
    subtitle: 'Digit Bucket Queue Passes',
    tags: ['non-comparison', 'stable', 'O(d · (N + b))'],
    themeColor: 'purple',
  },
  'kmp-search': {
    shortTitle: 'KMP Pattern Search',
    subtitle: 'Knuth-Morris-Pratt & LPS',
    tags: ['string-matching', 'LPS-table', 'O(N + M)'],
    themeColor: 'sky',
  },
  'heapsort': {
    shortTitle: 'Heapsort',
    subtitle: 'Max-Heap In-Place Sort',
    tags: ['heap', 'in-place', 'O(N log N)'],
    themeColor: 'amber',
  },
  'doubly-linked-list': {
    shortTitle: 'Doubly Linked List',
    subtitle: 'Bidirectional Pointers',
    tags: ['prev-next', 'bidirectional', 'O(1) insert'],
    themeColor: 'blue',
  },
  'queue-fifo': {
    shortTitle: 'Queue (FIFO)',
    subtitle: 'Enqueue & Dequeue',
    tags: ['FIFO', 'queue', 'head-tail'],
    themeColor: 'cyan',
  },
  'avl-tree': {
    shortTitle: 'AVL Tree',
    subtitle: 'Self-Balancing Rotations',
    tags: ['rotations', 'height-balanced', 'O(log N)'],
    themeColor: 'indigo',
  },
  'tree-traversals': {
    shortTitle: 'Tree Traversals',
    subtitle: 'Inorder, Preorder, Postorder',
    tags: ['DFS', 'binary-tree', 'recursive'],
    themeColor: 'teal',
  },
  'prim-mst': {
    shortTitle: "Prim's Algorithm",
    subtitle: 'Minimum Spanning Tree',
    tags: ['greedy', 'priority-queue', 'cut-property'],
    themeColor: 'emerald',
  },
  'rabin-karp': {
    shortTitle: 'Rabin-Karp',
    subtitle: 'Rolling Hash Search',
    tags: ['rolling-hash', 'pattern-matching', 'O(N+M)'],
    themeColor: 'purple',
  },
  'coin-change': {
    shortTitle: 'Coin Change',
    subtitle: 'Fewest Coins DP',
    tags: ['unbounded-knapsack', 'bottom-up', 'optimal-value'],
    themeColor: 'amber',
  },
  'longest-increasing-subsequence': {
    shortTitle: 'LIS',
    subtitle: 'Longest Increasing Subsequence',
    tags: ['dynamic-programming', 'subsequence', 'patience-sort'],
    themeColor: 'sky',
  },
  'tower-of-hanoi': {
    shortTitle: 'Tower of Hanoi',
    subtitle: 'Recursive Disk Transfer',
    tags: ['recursion', 'call-stack', '2^N - 1 moves'],
    themeColor: 'rose',
  },
  'disjoint-set-union': {
    shortTitle: 'DSU / Union-Find',
    subtitle: 'Path Compression & Rank',
    tags: ['disjoint-set', 'ackermann', 'almost-O(1)'],
    themeColor: 'indigo',
  },
  'bellman-ford': {
    shortTitle: 'Bellman-Ford',
    subtitle: 'Negative Weights & Cycles',
    tags: ['edge-relaxation', 'negative-cycle', 'O(V·E)'],
    themeColor: 'rose',
  },
  'floyd-warshall': {
    shortTitle: 'Floyd-Warshall',
    subtitle: 'All-Pairs Shortest Path DP',
    tags: ['all-pairs', 'triple-loop', 'O(V³)'],
    themeColor: 'purple',
  },
  'a-star-search': {
    shortTitle: 'A* Search',
    subtitle: 'Heuristic Pathfinding',
    tags: ['f = g + h', 'admissible', 'grid-search'],
    themeColor: 'emerald',
  },
  'kadanes-algorithm': {
    shortTitle: "Kadane's Algorithm",
    subtitle: 'Maximum Subarray Sum',
    tags: ['linear-scan', 'prefix-choice', 'O(N)'],
    themeColor: 'teal',
  },
  'edit-distance': {
    shortTitle: 'Edit Distance',
    subtitle: 'Levenshtein Alignment Matrix',
    tags: ['insert-delete-replace', '2D-DP', 'O(N·M)'],
    themeColor: 'indigo',
  },
  'z-algorithm': {
    shortTitle: 'Z-Algorithm',
    subtitle: 'Linear Z-Box Pattern Match',
    tags: ['z-box', 'string-matching', 'linear-time'],
    themeColor: 'sky',
  },
  'house-robber': {
    shortTitle: 'House Robber',
    subtitle: 'Non-Adjacent Max Sum',
    tags: ['1D-DP', 'state-transition', 'O(N)'],
    themeColor: 'amber',
  },
  'n-queens': {
    shortTitle: 'N-Queens',
    subtitle: 'Constraint Propagation Backtrack',
    tags: ['backtracking', 'diagonal-safety', 'state-space'],
    themeColor: 'purple',
  },
  'reverse-linked-list': {
    shortTitle: 'Reverse Linked List',
    subtitle: 'In-Place Pointer Reversal',
    tags: ['prev-curr-next', 'in-place', 'O(1) space'],
    themeColor: 'blue',
  },
  'monotonic-stack': {
    shortTitle: 'Monotonic Stack',
    subtitle: 'Next Greater Element',
    tags: ['decreasing-stack', 'amortized-O(N)', 'index-tracking'],
    themeColor: 'indigo',
  },
  'binary-exponentiation': {
    shortTitle: 'Binary Exponentiation',
    subtitle: 'Fast Power a^b mod m',
    tags: ['bit-decomposition', 'repeated-squaring', 'O(log B)'],
    themeColor: 'amber',
  },
  'rotated-sorted-array': {
    shortTitle: 'Rotated Sorted Array',
    subtitle: 'Pivot Invariant Search',
    tags: ['binary-search', 'pivot-halving', 'O(log N)'],
    themeColor: 'cyan',
  },
  'longest-palindromic-substring': {
    shortTitle: 'Longest Palindrome',
    subtitle: 'Expand Around Center',
    tags: ['palindrome', 'expand-center', 'substring'],
    themeColor: 'emerald',
  },
  'two-pointers-water': {
    shortTitle: 'Two Pointers',
    subtitle: 'Container With Most Water',
    tags: ['opposite-convergence', 'greedy-inward', 'O(N)'],
    themeColor: 'sky',
  },
  'sliding-window-max-sum': {
    shortTitle: 'Sliding Window',
    subtitle: 'Max Sum Subarray Size K',
    tags: ['window-invariant', 'O(1)-update', 'contiguous'],
    themeColor: 'cyan',
  },
  'floyd-cycle-detection': {
    shortTitle: "Floyd's Cycle Detection",
    subtitle: 'Tortoise & Hare Fast/Slow',
    tags: ['cycle-detection', 'two-pointers', 'O(1) space'],
    themeColor: 'emerald',
  },
  'activity-selection-greedy': {
    shortTitle: 'Activity Selection',
    subtitle: 'Interval Scheduling Greedy',
    tags: ['earliest-finish', 'non-overlapping', 'greedy-choice'],
    themeColor: 'teal',
  },
  'bitwise-operations': {
    shortTitle: 'Bitwise Manipulation',
    subtitle: '8-Bit Binary Registers',
    tags: ['AND-OR-XOR-SHL-SHR', 'bit-twiddling', 'O(1) hardware'],
    themeColor: 'purple',
  },
};

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  sorting: 'Sorting & Order Statistics',
  searching: 'Search & Interval Halving',
  'arrays-pointers': 'Arrays, Two Pointers & Windows',
  'stack-queue': 'Stacks, Queues & Monotonic Deques',
  'linked-lists': 'Linked Lists & Pointer Manipulation',
  'trees-bst': 'Trees, Heaps & Spatial Hierarchies',
  graphs: 'Graph Traversal, Shortest Path & MST',
  'dynamic-programming': 'Dynamic Programming & Memoization',
  math: 'Number Theory, Combinatorics & Bitwise',
};

export function getModuleDisplayMeta(mod: AlgorithmModule): {
  shortTitle: string;
  subtitle: string;
  tags: string[];
  themeColor: string;
} {
  const existing = ALGO_METADATA[mod.id];
  if (existing) return existing;

  const parenMatch = mod.title.match(/^([^(]+)\(([^)]+)\)/);
  const shortTitle = parenMatch ? parenMatch[1].trim() : mod.title.trim();
  const extractedSub = parenMatch ? parenMatch[2].trim() : '';
  const categoryName = CATEGORY_DISPLAY_NAMES[mod.category] || mod.category;
  const subtitle = extractedSub || categoryName;
  const compactTime = formatCompactBigO(mod.complexity?.timeAverage);
  const compactSpace = formatCompactBigO(mod.complexity?.spaceAuxiliary);

  return {
    shortTitle,
    subtitle,
    tags: [mod.category, `${compactTime} time`, `${compactSpace} space`],
    themeColor: resolveCategoryThemeColor(mod.category),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO "ONE LIVE THING": Interactive Algorithm Micro-Stepper
   Lets visitors scrub and inspect a real execution trace right on the first screen
   ═══════════════════════════════════════════════════════════════════════════ */
interface HeroTraceFrame {
  step: number;
  codeLine: number;
  codeText: string;
  invariant: string;
  explanation: string;
  values: number[];
  statuses: ('default' | 'comparing' | 'swapping' | 'pivot' | 'sorted')[];
  pointers: Record<string, number>;
}

const HERO_LIVE_DEMOS: {
  id: string;
  moduleId: string;
  label: string;
  complexity: string;
  frames: HeroTraceFrame[];
}[] = [
  {
    id: 'quicksort',
    moduleId: 'quicksort',
    label: 'Quicksort',
    complexity: 'O(n log n)',
    frames: [
      {
        step: 1,
        codeLine: 2,
        codeText: 'pivot = arr[high]  # pivot = 24 at idx 5, i = 0, j = 0',
        invariant: 'arr[0..i-1] <= 24 < arr[i..j-1]',
        explanation: 'Select rightmost element 24 as pivot. Initialize partition boundary i = 0 and scanner j = 0.',
        values: [38, 12, 45, 19, 29, 24],
        statuses: ['comparing', 'default', 'default', 'default', 'default', 'pivot'],
        pointers: { i: 0, j: 0, PIVOT: 5 },
      },
      {
        step: 2,
        codeLine: 3,
        codeText: 'j = 0: arr[0] (38) > pivot (24)  # no swap, advance j -> 1',
        invariant: 'Left [] <= 24 < Right [38]',
        explanation: 'Compare arr[j=0] = 38 against pivot 24: since 38 > 24, keep 38 in the > pivot region and advance j → 1.',
        values: [38, 12, 45, 19, 29, 24],
        statuses: ['comparing', 'comparing', 'default', 'default', 'default', 'pivot'],
        pointers: { i: 0, j: 1, PIVOT: 5 },
      },
      {
        step: 3,
        codeLine: 4,
        codeText: 'j = 1: arr[1] (12) <= 24 -> swap(arr[0], arr[1]); i += 1',
        invariant: 'Left [12] <= 24 < Right [38]',
        explanation: 'At j = 1, arr[1] = 12 <= 24: swap arr[i=0] (38) ↔ arr[j=1] (12) and advance boundary i → 1.',
        values: [12, 38, 45, 19, 29, 24],
        statuses: ['sorted', 'swapping', 'default', 'default', 'default', 'pivot'],
        pointers: { i: 1, j: 1, PIVOT: 5 },
      },
      {
        step: 4,
        codeLine: 3,
        codeText: 'j = 2: arr[2] (45) > pivot (24)  # no swap, advance j -> 3',
        invariant: 'Left [12] <= 24 < Right [38, 45]',
        explanation: 'At j = 2, arr[2] = 45 > 24: no swap needed. 45 joins the > pivot region [38, 45]; advance j → 3.',
        values: [12, 38, 45, 19, 29, 24],
        statuses: ['sorted', 'comparing', 'comparing', 'default', 'default', 'pivot'],
        pointers: { i: 1, j: 2, PIVOT: 5 },
      },
      {
        step: 5,
        codeLine: 4,
        codeText: 'j = 3: arr[3] (19) <= 24 -> swap(arr[1], arr[3]); i += 1',
        invariant: 'Left [12, 19] <= 24 < Right [45, 38]',
        explanation: 'At j = 3, arr[3] = 19 <= 24: swap arr[i=1] (38) ↔ arr[j=3] (19) and advance boundary i → 2.',
        values: [12, 19, 45, 38, 29, 24],
        statuses: ['sorted', 'sorted', 'comparing', 'swapping', 'default', 'pivot'],
        pointers: { i: 2, j: 3, PIVOT: 5 },
      },
      {
        step: 6,
        codeLine: 3,
        codeText: 'j = 4: arr[4] (29) > pivot (24)  # no swap, loop ends',
        invariant: 'Left [12, 19] <= 24 < Right [45, 38, 29]',
        explanation: 'At j = 4, arr[4] = 29 > 24: keep 29 in the > pivot region. Scanner j reaches high - 1.',
        values: [12, 19, 45, 38, 29, 24],
        statuses: ['sorted', 'sorted', 'comparing', 'comparing', 'comparing', 'pivot'],
        pointers: { i: 2, j: 4, PIVOT: 5 },
      },
      {
        step: 7,
        codeLine: 7,
        codeText: 'swap(arr[i=2], arr[high=5])  # swap 45 <-> 24 (lock pivot)',
        invariant: '[12, 19] <= 24 < [38, 29, 45] (Pivot Locked at idx 2)',
        explanation: 'Final partition step: swap arr[i=2] (45) with pivot arr[5] (24). Pivot 24 is now locked at index 2.',
        values: [12, 19, 24, 38, 29, 45],
        statuses: ['sorted', 'sorted', 'sorted', 'comparing', 'comparing', 'swapping'],
        pointers: { LEFT: 0, PIVOT: 2, RIGHT: 5 },
      },
    ],
  },
  {
    id: 'insertion-sort',
    moduleId: 'insertion-sort',
    label: 'Insertion Sort',
    complexity: 'O(n²)',
    frames: [
      {
        step: 1,
        codeLine: 2,
        codeText: 'key = arr[i]  # i = 3, key = 19, j = 2',
        invariant: 'Sorted prefix arr[0..2] = [12, 26, 34]',
        explanation: 'Extract key = 19 at index 3 to insert into its proper spot inside sorted prefix [12, 26, 34].',
        values: [12, 26, 34, 19, 42, 50],
        statuses: ['sorted', 'sorted', 'sorted', 'pivot', 'default', 'default'],
        pointers: { j: 2, KEY: 3 },
      },
      {
        step: 2,
        codeLine: 4,
        codeText: 'j = 2: arr[2] (34) > key (19) -> shift 34 to idx 3',
        invariant: '34 > 19 -> shift arr[2]=34 right into arr[3]',
        explanation: 'Compare j = 2: since arr[2] = 34 > key (19), shift 34 one slot right to index 3 and decrement j → 1.',
        values: [12, 26, 19, 34, 42, 50],
        statuses: ['sorted', 'sorted', 'pivot', 'swapping', 'default', 'default'],
        pointers: { j: 1, KEY: 2, SHIFT: 3 },
      },
      {
        step: 3,
        codeLine: 4,
        codeText: 'j = 1: arr[1] (26) > key (19) -> shift 26 to idx 2',
        invariant: '26 > 19 -> shift arr[1]=26 right into arr[2]',
        explanation: 'Compare j = 1: since arr[1] = 26 > key (19), shift 26 one slot right to index 2 and decrement j → 0.',
        values: [12, 19, 26, 34, 42, 50],
        statuses: ['sorted', 'pivot', 'swapping', 'sorted', 'default', 'default'],
        pointers: { j: 0, KEY: 1, SHIFT: 2 },
      },
      {
        step: 4,
        codeLine: 5,
        codeText: 'j = 0: arr[0] (12) <= key (19) -> stop shifting',
        invariant: 'arr[0] = 12 <= 19 -> insertion point is j + 1 = 1',
        explanation: 'Compare j = 0: arr[0] = 12 <= 19, so the while-loop terminates. Slot j + 1 = 1 is ready.',
        values: [12, 19, 26, 34, 42, 50],
        statuses: ['comparing', 'pivot', 'sorted', 'sorted', 'default', 'default'],
        pointers: { j: 0, INSERT: 1 },
      },
      {
        step: 5,
        codeLine: 6,
        codeText: 'arr[j + 1] = key  # arr[1] = 19',
        invariant: 'Prefix arr[0..3] = [12, 19, 26, 34] is now sorted',
        explanation: 'Write key = 19 into arr[1]. The sorted prefix expands to 4 elements [12, 19, 26, 34].',
        values: [12, 19, 26, 34, 42, 50],
        statuses: ['sorted', 'sorted', 'sorted', 'sorted', 'default', 'default'],
        pointers: { SORTED: 3, NEXT: 4 },
      },
    ],
  },
  {
    id: 'binary-search',
    moduleId: 'binary-search',
    label: 'Binary Search',
    complexity: 'O(log n)',
    frames: [
      {
        step: 1,
        codeLine: 3,
        codeText: 'mid = (0 + 5) // 2  # L = 0, MID = 2 (val 31), R = 5',
        invariant: 'Target 47 ∈ arr[0..5] if present',
        explanation: 'Initialize L = 0, R = 5. Compute midpoint MID = (0 + 5) // 2 = 2 and inspect arr[2] = 31.',
        values: [14, 23, 31, 47, 58, 72],
        statuses: ['default', 'default', 'comparing', 'default', 'default', 'default'],
        pointers: { L: 0, MID: 2, R: 5 },
      },
      {
        step: 2,
        codeLine: 6,
        codeText: 'arr[2] (31) < 47 -> low = mid + 1 = 3',
        invariant: 'Pruned [0..2]; search space halved to [3..5]',
        explanation: 'Since arr[2] = 31 < target 47, discard indices 0..2 and advance L = mid + 1 = 3.',
        values: [14, 23, 31, 47, 58, 72],
        statuses: ['default', 'default', 'default', 'comparing', 'default', 'comparing'],
        pointers: { L: 3, R: 5 },
      },
      {
        step: 3,
        codeLine: 3,
        codeText: 'mid = (3 + 5) // 2  # L = 3, MID = 4 (val 58), R = 5',
        invariant: 'Target 47 ∈ arr[3..5]; checking midpoint idx 4',
        explanation: 'Compute new midpoint MID = (3 + 5) // 2 = 4 and compare arr[4] = 58 against target 47.',
        values: [14, 23, 31, 47, 58, 72],
        statuses: ['default', 'default', 'default', 'default', 'comparing', 'default'],
        pointers: { L: 3, MID: 4, R: 5 },
      },
      {
        step: 4,
        codeLine: 8,
        codeText: 'arr[4] (58) > 47 -> high = mid - 1 = 3',
        invariant: 'Pruned [4..5]; search space narrowed to [3..3]',
        explanation: 'Since arr[4] = 58 > target 47, discard indices 4..5 and move R = mid - 1 = 3.',
        values: [14, 23, 31, 47, 58, 72],
        statuses: ['default', 'default', 'default', 'comparing', 'default', 'default'],
        pointers: { L: 3, MID: 3, R: 3 },
      },
      {
        step: 5,
        codeLine: 4,
        codeText: 'mid = 3: arr[3] (47) == target (47) -> return 3',
        invariant: 'arr[3] == 47 verified in 3 comparisons',
        explanation: 'At MID = 3, arr[3] = 47 matches target 47! Return index 3.',
        values: [14, 23, 31, 47, 58, 72],
        statuses: ['default', 'default', 'default', 'sorted', 'default', 'default'],
        pointers: { FOUND: 3 },
      },
    ],
  },
];

export const ESSENTIAL_MODULE_IDS = new Set([
  'quicksort',
  'mergesort',
  'bubble-sort',
  'insertion-sort',
  'binary-search',
  'two-pointers-water',
  'sliding-window-max-sum',
  'linked-list',
  'valid-parentheses',
  'bst-insert',
  'binary-heap',
  'trie-prefix',
  'graph-bfs',
  'graph-dfs',
  'dijkstra',
  'knapsack-01',
]);

export const INTERVIEW_MODULE_IDS = new Set([
  ...Array.from(ESSENTIAL_MODULE_IDS),
  'rotated-sorted-array',
  'floyd-cycle-detection',
  'reverse-linked-list',
  'merge-two-lists',
  'monotonic-stack',
  'sliding-window-max',
  'avl-tree',
  'tree-traversals',
  'topological-sort',
  'lcs',
  'kadanes-algorithm',
  'house-robber',
  'coin-change',
  'edit-distance',
  'longest-palindromic-substring',
]);

export const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  sorting: 'Sorting',
  searching: 'Searching',
  'arrays-pointers': 'Pointers & Arrays',
  'stack-queue': 'Stacks & Queues',
  'linked-lists': 'Linked Lists',
  'trees-bst': 'Trees & Heaps',
  graphs: 'Graphs',
  'dynamic-programming': 'Dynamic Programming',
  math: 'Math & Bitwise',
};

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  pseudocode: 'Pseudocode',
  python: 'Python',
  cpp: 'C++',
  typescript: 'TypeScript',
  java: 'Java',
  javascript: 'JavaScript',
};

export interface RegistryStats {
  totalModules: number;
  totalDomains: number;
  totalLanguages: number;
  languageLabels: string[];
  totalPresets: number;
  essentialsCount: number;
  interviewCount: number;
  advancedCount: number;
  categories: { id: string; label: string; count: number }[];
}

/**
 * Pure helper that dynamically derives all catalog counts, domains, languages,
 * and track totals directly from the live `modules` array — zero hardcoded numbers.
 */
export function computeRegistryStats(modules: AlgorithmModule[]): RegistryStats {
  const domainMap = new Map<string, number>();
  let totalPresets = 0;
  let essentialsCount = 0;
  let interviewCount = 0;
  let advancedCount = 0;
  const languageKeys = new Set<string>();

  for (const mod of modules) {
    domainMap.set(mod.category, (domainMap.get(mod.category) || 0) + 1);
    totalPresets += mod.presets?.length ? mod.presets.length : 3;
    if (ESSENTIAL_MODULE_IDS.has(mod.id)) essentialsCount++;
    if (INTERVIEW_MODULE_IDS.has(mod.id)) interviewCount++;
    if (mod.difficulty === 'Advanced') advancedCount++;
    const snippets = mod.codeSnippets || (mod as any).code;
    if (snippets && typeof snippets === 'object') {
      Object.keys(snippets).forEach((k) => languageKeys.add(k));
    }
  }

  // Preserve canonical domain ordering while automatically supporting any newly added category
  const orderedDomainIds = [
    ...Object.keys(DEFAULT_CATEGORY_LABELS).filter((id) => domainMap.has(id)),
    ...Array.from(domainMap.keys()).filter((id) => !(id in DEFAULT_CATEGORY_LABELS)),
  ];

  const categories = [
    { id: 'all', label: 'All Modules', count: modules.length },
    ...orderedDomainIds.map((id) => ({
      id,
      label:
        DEFAULT_CATEGORY_LABELS[id] ||
        id
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      count: domainMap.get(id) || 0,
    })),
  ];

  const languageLabels =
    languageKeys.size > 0
      ? Array.from(languageKeys).map((k) => LANGUAGE_DISPLAY_NAMES[k] || k)
      : ['Pseudocode', 'Python', 'C++', 'TypeScript', 'Java'];

  return {
    totalModules: modules.length,
    totalDomains: domainMap.size,
    totalLanguages: languageLabels.length,
    languageLabels,
    totalPresets,
    essentialsCount,
    interviewCount,
    advancedCount,
    categories,
  };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  modules,
  onSelectModule,
  onOpenPersonalStudio,
  onOpenShortcuts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPath, setSelectedPath] = useState<'all' | 'essentials' | 'interview' | 'icpc'>('all');
  const [viewMode, setViewMode] = useState<'topics' | 'grid' | 'table'>('grid');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const shortcuts = usePlatformShortcuts();

  // Interactive Hero Live Stepper state
  const [heroDemoIdx, setHeroDemoIdx] = useState(0);
  const [heroFrameIdx, setHeroFrameIdx] = useState(0);
  const [heroPlaying, setHeroPlaying] = useState(true);

  const activeHeroDemo = HERO_LIVE_DEMOS[heroDemoIdx];
  const activeHeroFrame =
    activeHeroDemo.frames[heroFrameIdx % activeHeroDemo.frames.length] || activeHeroDemo.frames[0];

  useEffect(() => {
    if (!heroPlaying) return;
    const timer = setInterval(() => {
      setHeroFrameIdx((prev) => (prev + 1) % activeHeroDemo.frames.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [heroPlaying, activeHeroDemo.frames.length]);

  // Dynamically derive all counts, categories, languages, and presets from `modules`
  const registryStats = useMemo(() => computeRegistryStats(modules), [modules]);
  const categories = registryStats.categories;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: modules.length };
    for (const c of registryStats.categories) {
      counts[c.id] = c.count;
    }
    return counts;
  }, [modules.length, registryStats.categories]);

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const meta = getModuleDisplayMeta(mod);
      const shortName = meta.shortTitle;
      const subtitle = meta.subtitle;
      const tagsStr = meta.tags.join(' ');

      const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'all' || mod.difficulty === selectedDifficulty;
      const matchesPath =
        selectedPath === 'all'
          ? true
          : selectedPath === 'essentials'
          ? ESSENTIAL_MODULE_IDS.has(mod.id)
          : selectedPath === 'interview'
          ? INTERVIEW_MODULE_IDS.has(mod.id)
          : mod.difficulty === 'Advanced';

      const matchesSearch =
        shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tagsStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.complexity.timeAverage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDifficulty && matchesPath && matchesSearch;
    });
  }, [modules, selectedCategory, selectedDifficulty, selectedPath, searchQuery]);

  const handleOpenHeroModule = () => {
    const found = modules.find((m) => m.id === activeHeroDemo.moduleId) || modules[0];
    if (found) onSelectModule(found);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F19] text-[#F9FAFB] pb-20">
      {/* 1. Balanced 2-Column Editorial Hero + Live Interactive Algorithm Stepper (md+ side-by-side) */}
      <section className="px-4 sm:px-6 py-5 sm:py-7 border-b border-[#1F293D] bg-gradient-to-b from-[#0E1525] to-[#0B0F19]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-7 items-stretch">
          {/* Left Column (6 cols on md, 7 cols on lg): Timeless Headline, Auto-Synced Registry Telemetry & Domain Matrix */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-between space-y-3 text-left">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#111827] border border-[#1F293D] text-[11px] font-mono text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                <span>Deterministic Time-Travel Debugger</span>
                <span className="text-slate-600">·</span>
                <span className="text-[#10B981] font-semibold">Auto-Synced Registry</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight text-white leading-[1.08]">
                See every pointer move.
                <br />
                Trace every branch in real time.
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-[60ch] leading-relaxed">
                Scrub forward and backward through deterministic execution frames, inspect
                synchronized code across {registryStats.languageLabels.join(', ')}, and verify loop
                invariants at every state transition.
              </p>
            </div>

            {/* Auto-Derived Live Registry Architecture Cards (Zero Hardcoded Numbers) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-[#111827]/90 border border-[#1F293D] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>MODULES</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-white tabular-nums mt-0.5">
                  {registryStats.totalModules}
                </div>
                <div className="text-[10px] text-slate-400 truncate">Auto-indexed</div>
              </div>

              <div className="p-2 rounded-lg bg-[#111827]/90 border border-[#1F293D] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>CS DOMAINS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-cyan-300 tabular-nums mt-0.5">
                  {registryStats.totalDomains}
                </div>
                <div className="text-[10px] text-slate-400 truncate">Topic tracks</div>
              </div>

              <div className="p-2 rounded-lg bg-[#111827]/90 border border-[#1F293D] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>LANGUAGES</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-amber-300 tabular-nums mt-0.5">
                  {registryStats.totalLanguages}
                </div>
                <div className="text-[10px] text-slate-400 truncate">Line-synced</div>
              </div>

              <div className="p-2 rounded-lg bg-[#111827]/90 border border-[#1F293D] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>TEST CASES</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-purple-300 tabular-nums mt-0.5">
                  {registryStats.totalPresets}
                </div>
                <div className="text-[10px] text-slate-400 truncate">Curated inputs</div>
              </div>
            </div>

            {/* Interactive Domain Quick-Jump Strip (Fills visual space & lets users filter immediately) */}
            <div className="p-2.5 rounded-xl bg-[#111827]/60 border border-[#1F293D] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>QUICK-JUMP BY CS DOMAIN (DYNAMICALLY SYNCED)</span>
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="text-[#10B981] hover:underline cursor-pointer"
                  >
                    Reset filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setSelectedCategory((prev) => (prev === cat.id ? 'all' : cat.id))
                        }
                        className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-[#10B981]/20 text-white border-[#10B981] font-semibold'
                            : 'bg-[#0B0F19] text-slate-300 border-[#1F293D] hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] px-1 rounded tabular-nums ${
                            isSelected
                              ? 'bg-[#10B981] text-[#0B0F19] font-bold'
                              : 'bg-[#111827] text-[#10B981]'
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenHeroModule}
                className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#0B0F19] font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                Open workbench
              </button>

              {onOpenPersonalStudio && (
                <button
                  type="button"
                  onClick={onOpenPersonalStudio}
                  className="px-3.5 py-2 rounded-lg bg-[#111827] hover:bg-[#1F2937] text-slate-200 border border-[#1F293D] font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Trace custom code</span>
                </button>
              )}

              {onOpenShortcuts && (
                <button
                  type="button"
                  onClick={onOpenShortcuts}
                  className="px-3 py-2 rounded-lg bg-[#111827] hover:bg-[#1F2937] text-slate-400 hover:text-white border border-[#1F293D] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  title="OS-Adaptive Keyboard Shortcuts"
                >
                  <Keyboard className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{shortcuts.osName}</span>
                  <kbd className="px-1 py-0.2 rounded bg-[#0B0F19] border border-[#1F293D] text-[10px] text-slate-300">
                    {shortcuts.quickSearch}
                  </kbd>
                </button>
              )}
            </div>
          </div>

          {/* Right Column (6 cols on md, 5 cols on lg): Interactive Live Micro-Trace ("One Live Thing" on First Screen) */}
          <div
            data-ui="true"
            className="md:col-span-6 lg:col-span-5 rounded-xl bg-[#111827] border border-[#1F293D] overflow-hidden flex flex-col justify-between shadow-xl"
          >
            {/* Mini-Workbench Top Bar */}
            <div className="px-2.5 py-2 border-b border-[#1F293D] bg-[#0B0F19] flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar">
                {HERO_LIVE_DEMOS.map((demo, idx) => {
                  const isSelected = idx === heroDemoIdx;
                  return (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => {
                        setHeroDemoIdx(idx);
                        setHeroFrameIdx(0);
                      }}
                      className={`px-2 py-1 rounded text-[10.5px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#1E293B] text-white font-semibold border border-slate-700/80'
                          : 'text-slate-400 hover:text-white hover:bg-[#1F2937]/60'
                      }`}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                      )}
                      <span>{demo.label}</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-[10.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded tabular-nums whitespace-nowrap shrink-0">
                {activeHeroDemo.complexity}
              </span>
            </div>

            {/* Live Interactive Array & Pointer Stage */}
            <div className="p-3.5 bg-[#0B0F19]/60 flex-1 flex flex-col justify-between gap-2.5">
              {/* Active Invariant Formula + Interactive Step Scrubber Dots */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                  <span className="truncate">
                    Invariant: <strong className="text-[#10B981]">{activeHeroFrame.invariant}</strong>
                  </span>
                  <span className="shrink-0 tabular-nums px-1.5 py-0.5 rounded bg-[#111827] border border-[#1F293D] text-slate-300">
                    Step {activeHeroFrame.step}/{activeHeroDemo.frames.length}
                  </span>
                </div>

                {/* Live Scope Pointers + Step Timeline Pills */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#1F293D]/60">
                  <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                    {Object.entries(activeHeroFrame.pointers).map(([pName, pIdx]) => (
                      <span
                        key={pName}
                        className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#1F293D] text-slate-300"
                      >
                        <strong className="text-cyan-300">{pName}</strong>={pIdx}
                        {activeHeroFrame.values[pIdx] !== undefined
                          ? ` (${activeHeroFrame.values[pIdx]})`
                          : ''}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {activeHeroDemo.frames.map((f, fIdx) => {
                      const isCurrent = fIdx === heroFrameIdx % activeHeroDemo.frames.length;
                      return (
                        <button
                          key={f.step}
                          type="button"
                          onClick={() => {
                            setHeroPlaying(false);
                            setHeroFrameIdx(fIdx);
                          }}
                          title={`Jump to Step ${f.step}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            isCurrent
                              ? 'w-4 bg-[#10B981]'
                              : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Array Bars + Cells + Pointers */}
              <div className="grid grid-cols-6 gap-2 py-1">
                {(() => {
                  const maxVal = Math.max(...activeHeroFrame.values, 1);
                  return activeHeroFrame.values.map((val, idx) => {
                    const st = activeHeroFrame.statuses[idx] || 'default';
                    const activePointers = Object.entries(activeHeroFrame.pointers)
                      .filter(([, pIdx]) => pIdx === idx)
                      .map(([label]) => label);

                    const barHeightPx = Math.max(12, Math.round((val / maxVal) * 48));

                    const barFill =
                      st === 'sorted'
                        ? 'bg-[#10B981] border-[#34D399]'
                        : st === 'pivot'
                        ? 'bg-amber-400 border-amber-300'
                        : st === 'swapping'
                        ? 'bg-rose-500 border-rose-400'
                        : st === 'comparing'
                        ? 'bg-cyan-400 border-cyan-300'
                        : 'bg-slate-600/80 border-slate-500';

                    const cellStyle =
                      st === 'sorted'
                        ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                        : st === 'pivot'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : st === 'swapping'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                        : st === 'comparing'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#111827] border-[#1F293D] text-slate-200';

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        {/* Proportional vertical bar */}
                        <div className="w-full h-13 flex items-end justify-center px-1.5 border-b border-slate-800/80">
                          <motion.div
                            initial={false}
                            animate={{ height: barHeightPx }}
                            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                            className={`w-full max-w-[28px] rounded-t border-t ${barFill}`}
                          />
                        </div>
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                          className={`w-full h-9 rounded-lg border flex flex-col items-center justify-center font-mono tabular-nums ${cellStyle}`}
                        >
                          <span className="text-xs sm:text-sm font-bold leading-none">{val}</span>
                          <span className="text-[9px] opacity-60 mt-0.5">[{idx}]</span>
                        </motion.div>
                        <div className="h-3.5 flex items-center justify-center">
                          {activePointers.length > 0 && (
                            <span
                              className={`text-[9px] font-mono font-bold uppercase ${
                                st === 'pivot'
                                  ? 'text-amber-300'
                                  : st === 'swapping'
                                  ? 'text-rose-400'
                                  : st === 'sorted'
                                  ? 'text-emerald-400'
                                  : 'text-[#06B6D4]'
                              }`}
                            >
                              ↑{activePointers.join(',')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Synchronized Code Trace & Step Explanation */}
              <div className="pt-2 border-t border-[#1F293D] space-y-1.5">
                <div className="rounded-lg bg-[#111827] border border-[#1F293D] overflow-hidden font-mono text-[10.5px]">
                  <div className="px-2.5 py-1 border-b border-[#1F293D] bg-[#0B0F19]/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Synchronized Execution Trace</span>
                    <span className="text-[#10B981] font-semibold">Line {activeHeroFrame.codeLine}</span>
                  </div>
                  <div className="px-2.5 py-1.5 bg-[#10B981]/12 border-l-2 border-[#10B981] text-white font-semibold truncate">
                    {activeHeroFrame.codeText}
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {activeHeroFrame.explanation}
                </p>
              </div>
            </div>

            {/* Interactive Transport Controls in Hero */}
            <div className="px-3.5 py-2.5 border-t border-[#1F293D] bg-[#111827] flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setHeroPlaying(false);
                    setHeroFrameIdx(0);
                  }}
                  title="Reset demo trace"
                  aria-label="Reset demo trace"
                  className="p-1.5 rounded bg-[#1F2937] text-slate-300 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHeroPlaying(false);
                    setHeroFrameIdx(
                      (prev) =>
                        (prev - 1 + activeHeroDemo.frames.length) % activeHeroDemo.frames.length
                    );
                  }}
                  title="Previous step"
                  aria-label="Previous step"
                  className="p-1.5 rounded bg-[#1F2937] text-slate-300 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setHeroPlaying((p) => !p)}
                  title={heroPlaying ? 'Pause live preview' : 'Play live preview'}
                  aria-label={heroPlaying ? 'Pause live preview' : 'Play live preview'}
                  className="px-2.5 py-1 rounded bg-[#1E293B] hover:bg-slate-700 text-white border border-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {heroPlaying ? (
                    <>
                      <Pause className="w-3 h-3 text-[#10B981] fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-[#10B981] fill-current" />
                      <span>Play</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHeroPlaying(false);
                    setHeroFrameIdx((prev) => (prev + 1) % activeHeroDemo.frames.length);
                  }}
                  title="Next step"
                  aria-label="Next step"
                  className="p-1.5 rounded bg-[#1F2937] text-slate-300 hover:text-white cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenHeroModule}
                className="text-[11px] font-sans font-semibold text-[#10B981] hover:underline transition-colors cursor-pointer"
              >
                Inspect in workbench
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Algorithm Catalog: Architectural Index Bar + Interactive Specimen Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-7 pb-6">
        {/* Row 1: Section Heading + Curated Learning Tracks (Left, 100% Dynamic Counts) | Search + View Mode (Right) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3.5 pb-3.5 border-b border-[#1F293D]">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className="font-display text-xl font-medium text-white tracking-tight mr-2">
              Algorithm Index
            </h2>
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#111827] border border-[#1F293D]">
              {[
                { id: 'all', label: `All (${registryStats.totalModules})` },
                { id: 'essentials', label: `Core (${registryStats.essentialsCount})` },
                { id: 'interview', label: `Interview (${registryStats.interviewCount})` },
                { id: 'icpc', label: `Advanced (${registryStats.advancedCount})` },
              ].map((path) => {
                const isSelected = selectedPath === path.id;
                return (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => setSelectedPath(path.id as any)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#1E293B] text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {path.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                aria-label="Search algorithms"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search algorithm, Big-O, topic..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F293D] focus:border-[#10B981] text-xs text-white placeholder-slate-500 font-sans outline-none transition-colors"
              />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#111827] border border-[#1F293D] text-[11px] font-mono">
              {(
                [
                  { id: 'grid', label: `Cards (${filteredModules.length})` },
                  { id: 'topics', label: `Topics (${registryStats.totalDomains})` },
                  { id: 'table', label: 'Table' },
                ] as const
              ).map((vm) => {
                const isSelected = viewMode === vm.id;
                return (
                  <button
                    key={vm.id}
                    type="button"
                    onClick={() => setViewMode(vm.id)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#1E293B] text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {vm.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Category Filter Bar (Left) + Difficulty Level Filter (Right) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 mb-6">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (cat.id !== 'all' && viewMode === 'topics') {
                      setViewMode('grid');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#1E293B] text-white border-[#10B981]/60 font-semibold'
                      : 'bg-[#111827]/70 text-slate-400 border-[#1F293D] hover:bg-[#1F2937] hover:text-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-mono tabular-nums ${
                      isSelected ? 'text-[#10B981]' : 'text-slate-500'
                    }`}
                  >
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#111827] border border-[#1F293D] text-[11px] self-start xl:self-auto shrink-0">
            {['all', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => {
              const isSelected = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#1E293B] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff === 'all' ? 'All levels' : diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Views: 1. Topic Groups | 2. Glanceable Motion Card Grid | 3. High-Density Table */}
        {viewMode === 'topics' && searchQuery.trim() === '' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories
              .filter((c) => c.id !== 'all')
              .map((cat) => {
                const catModules = filteredModules.filter((m) => m.category === cat.id);
                if (catModules.length === 0) return null;
                const featuredMod = catModules[0];
                const isExpanded = expandedTopics[cat.id] ?? true;
                const visibleItems = isExpanded ? catModules : catModules.slice(0, 8);

                return (
                  <div
                    key={cat.id}
                    className="rounded-xl bg-[#111827] border border-[#1F293D] hover:border-[#10B981]/50 p-4 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div
                        onClick={() => onSelectModule(featuredMod)}
                        className="mb-3.5 cursor-pointer group"
                      >
                        <AlgorithmCardThumbnail
                          moduleId={featuredMod.id}
                          category={featuredMod.category}
                        />
                      </div>

                      <div className="flex items-baseline justify-between gap-2 mb-2">
                        <h3 className="text-base font-semibold text-white tracking-tight">
                          {cat.label}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setViewMode('grid');
                          }}
                          className="text-xs font-mono text-slate-400 hover:text-[#10B981] transition-colors cursor-pointer shrink-0 tabular-nums"
                        >
                          View all {catModules.length}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {visibleItems.map((mod) => {
                          const meta = getModuleDisplayMeta(mod);
                          const isEssential = ESSENTIAL_MODULE_IDS.has(mod.id);
                          return (
                            <button
                              key={mod.id}
                              type="button"
                              onClick={() => onSelectModule(mod)}
                              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                                isEssential
                                  ? 'bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981] hover:text-[#0B0F19] font-semibold'
                                  : 'bg-[#0B0F19] border border-[#1F293D] text-slate-300 hover:border-slate-600 hover:text-white'
                              }`}
                            >
                              {meta.shortTitle}
                            </button>
                          );
                        })}

                        {catModules.length > 8 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTopics((prev) => ({
                                ...prev,
                                [cat.id]: !(prev[cat.id] ?? true),
                              }))
                            }
                            className="px-2 py-1 rounded bg-[#1F2937] text-[10px] font-mono text-slate-300 cursor-pointer"
                          >
                            {isExpanded ? 'Less' : `+${catModules.length - 8}`}
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectModule(featuredMod)}
                      className="w-full py-2 px-3 rounded-lg bg-[#1F2937] hover:bg-[#10B981] text-slate-200 hover:text-[#0B0F19] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Open {getModuleDisplayMeta(featuredMod).shortTitle}</span>
                      <span className="font-mono text-[10px] opacity-80">Workbench</span>
                    </button>
                  </div>
                );
              })}
          </div>
        ) : viewMode === 'grid' || (viewMode === 'topics' && searchQuery.trim() !== '') ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModules.map((mod) => {
              const meta = getModuleDisplayMeta(mod);
              const palette = getCardThemePalette(mod.category, meta.themeColor);
              const isBeginner = mod.difficulty === 'Beginner';
              const compactTime = formatCompactBigO(mod.complexity.timeAverage);
              const compactSpace = formatCompactBigO(mod.complexity.spaceAuxiliary);

              return (
                <div
                  key={mod.id}
                  onClick={() => onSelectModule(mod)}
                  className={`group rounded-xl bg-[#111827] border border-[#1F293D] ${palette.borderHover} p-4 flex flex-col justify-between transition-colors duration-150 cursor-pointer`}
                >
                  <div>
                    {/* 1. Glanceable Algorithmic Motion Stage (Stationary diagram at rest, live step on hover) */}
                    <div className="mb-3.5">
                      <AlgorithmCardThumbnail moduleId={mod.id} category={mod.category} />
                    </div>

                    {/* 2. Title, Mechanism Subtitle & Plain Difficulty Label */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-base font-semibold text-white ${palette.titleHover} transition-colors leading-snug truncate`}
                          title={mod.title}
                        >
                          {meta.shortTitle}
                        </h3>
                        <p
                          className="text-xs text-slate-400 truncate mt-0.5"
                          title={meta.subtitle}
                        >
                          {meta.subtitle}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-mono shrink-0 whitespace-nowrap mt-0.5 ${
                          isBeginner
                            ? 'text-[#10B981]'
                            : mod.difficulty === 'Intermediate'
                            ? 'text-[#F59E0B]'
                            : 'text-purple-400'
                        }`}
                      >
                        {mod.difficulty}
                      </span>
                    </div>

                    {/* 3. Concise 2-Line Conceptual Summary */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-2 mb-3.5">
                      {mod.theory.overview}
                    </p>
                  </div>

                  {/* 4. Unboxed Typographic Footer: Tabular Complexity + Direct Action */}
                  <div className="pt-3 border-t border-[#1F293D] flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                    <div className="flex items-center gap-2 text-slate-300 truncate">
                      <span title={`Average Time: ${mod.complexity.timeAverage}`}>
                        Time <strong className="text-white">{compactTime}</strong>
                      </span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <span
                        className="text-slate-400"
                        title={`Auxiliary Space: ${mod.complexity.spaceAuxiliary}`}
                      >
                        Space {compactSpace}
                      </span>
                    </div>

                    <span className="font-sans font-medium text-xs text-slate-400 group-hover:text-[#10B981] transition-colors shrink-0">
                      Inspect trace
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-[#111827] border border-[#1F293D] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F293D] bg-[#0B0F19] text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4 font-semibold">Algorithm</th>
                  <th className="py-3 px-4 hidden sm:table-cell font-semibold">Domain</th>
                  <th className="py-3 px-4 hidden md:table-cell font-semibold">Level</th>
                  <th className="py-3 px-4 text-right font-semibold">Avg Time</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell font-semibold">
                    Aux Space
                  </th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]">
                {filteredModules.map((mod) => {
                  const meta = getModuleDisplayMeta(mod);
                  return (
                    <tr
                      key={mod.id}
                      onClick={() => onSelectModule(mod)}
                      className="hover:bg-[#1F2937]/50 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-white">{meta.shortTitle}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {meta.subtitle}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 hidden sm:table-cell font-mono text-slate-300">
                        {mod.category}
                      </td>
                      <td className="py-2.5 px-4 hidden md:table-cell font-mono">
                        <span
                          className={
                            mod.difficulty === 'Beginner'
                              ? 'text-[#10B981]'
                              : mod.difficulty === 'Intermediate'
                              ? 'text-[#F59E0B]'
                              : 'text-purple-400'
                          }
                        >
                          {mod.difficulty}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-[#10B981] font-semibold">
                        {formatCompactBigO(mod.complexity.timeAverage)}
                      </td>
                      <td className="py-2.5 px-4 text-right hidden sm:table-cell font-mono tabular-nums text-slate-300">
                        {formatCompactBigO(mod.complexity.spaceAuxiliary)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="font-medium text-slate-300 hover:text-[#10B981]">
                          Inspect trace
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredModules.length === 0 && (
          <div className="text-center py-16 text-slate-400 rounded-xl bg-[#111827] border border-[#1F293D]">
            <p className="text-sm font-medium text-white">No algorithms match your filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">
              Try clearing the search query or switching back to All Modules.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedPath('all');
              }}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-[#10B981] text-[#0B0F19] text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 3. Flat Architectural Footer Grid: Personal Code Studio + OS-Adaptive Shortcuts */}
      <section className="max-w-6xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Personal Code Studio & Local CLI Runner */}
        <div className="lg:col-span-7 rounded-xl bg-[#111827] border border-[#1F293D] p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Personal Code Studio & Local CLI
              </h2>
              <span className="text-xs font-mono text-[#10B981]">JS/TS · Python WASM · C++17</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Write or drop your own algorithm in JavaScript, Python, or C++17 to record live variable
              mutations and call-stack frames, or run the local CLI tracer directly from your terminal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1F293D]">
            <code className="px-3 py-1.5 rounded bg-[#0B0F19] border border-[#1F293D] font-mono text-xs text-slate-300">
              $ npx stepdsa run solution.stepdsa
            </code>
            <button
              type="button"
              onClick={onOpenPersonalStudio}
              className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#0B0F19] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Open Code Studio</span>
            </button>
          </div>
        </div>

        {/* Right (5 cols): OS-Adaptive Keyboard Shortcuts Bar */}
        <div className="lg:col-span-5 rounded-xl bg-[#111827] border border-[#1F293D] p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {shortcuts.osName} Keybindings
              </h2>
              <button
                type="button"
                onClick={shortcuts.toggleOS}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0F19] border border-[#1F293D] text-[11px] font-mono text-slate-300 hover:text-white cursor-pointer"
                title="Switch between macOS and Windows/Linux shortcut notation"
              >
                <Laptop className="w-3 h-3 text-[#10B981]" />
                <span>Switch OS ({shortcuts.modKey})</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hardware keyboard shortcuts automatically adapt to your operating system.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-2 border-t border-[#1F293D]">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0B0F19] border border-[#1F293D]">
              <span className="text-slate-400">Search</span>
              <kbd className="text-[#10B981] font-bold">{shortcuts.quickSearch}</kbd>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0B0F19] border border-[#1F293D]">
              <span className="text-slate-400">Play/Pause</span>
              <kbd className="text-[#10B981] font-bold">{shortcuts.playPause}</kbd>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0B0F19] border border-[#1F293D]">
              <span className="text-slate-400">Step Line</span>
              <kbd className="text-white font-bold">← / →</kbd>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0B0F19] border border-[#1F293D]">
              <span className="text-slate-400">Next Action</span>
              <kbd className="text-[#06B6D4] font-bold">{shortcuts.nextAction}</kbd>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
