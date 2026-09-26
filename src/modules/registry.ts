import { AlgorithmModule } from '../core/types';
import { quicksortModule } from './sorting/quicksort';
import { mergesortModule } from './sorting/mergesort';
import { bubbleSortModule } from './sorting/bubbleSort';
import { binarySearchModule } from './searching/binarySearch';
import { bstModule } from './trees/bst';
import { singlyLinkedListModule } from './linkedList/singlyLinkedList';
import { binaryHeapModule } from './trees/binaryHeap';
import { bfsTraversalModule } from './graphs/bfsTraversal';
import { dfsTraversalModule } from './graphs/dfsTraversal';
import { dijkstraModule } from './graphs/dijkstra';
import { trieModule } from './trees/trie';
import { knapsackModule } from './dp/knapsack';
import { octree3dModule } from './trees/octree3d';

import { linearSearchModule } from './searching/linearSearch';
import { insertionSortModule } from './sorting/insertionSort';
import { selectionSortModule } from './sorting/selectionSort';
import { topologicalSortModule } from './graphs/topologicalSort';
import { balancedParenthesesModule } from './stack/balancedParentheses';
import { lcsModule } from './dp/lcs';
import { sieveModule } from './math/sieveOfEratosthenes';
import { countingSortModule } from './sorting/countingSort';
import { radixSortModule } from './sorting/radixSort';
import { kruskalMSTModule } from './graphs/kruskalMST';
import { euclideanGcdModule } from './math/euclideanGcd';
import { kmpModule } from './strings/kmpSearch';

// Level-1 Core Curriculum Additions
import { heapsortModule } from './sorting/heapsort';
import { doublyLinkedListModule } from './linkedList/doublyLinkedList';
import { queueVisualizerModule } from './stack/queueVisualizer';
import { avlTreeModule } from './trees/avlTree';
import { treeTraversalsModule } from './trees/treeTraversals';
import { primMSTModule } from './graphs/primMST';
import { rabinKarpModule } from './strings/rabinKarp';
import { coinChangeModule } from './dp/coinChange';
import { lisModule } from './dp/lis';
import { towerOfHanoiModule } from './math/towerOfHanoi';

// Level-2 Advanced Graph & Shortest Path Additions
import { dsuModule } from './graphs/dsu';
import { bellmanFordModule } from './graphs/bellmanFord';
import { floydWarshallModule } from './graphs/floydWarshall';
import { aStarModule } from './graphs/aStarSearch';

// Level-2 DP, Strings & Backtracking Additions
import { kadanesAlgorithmModule } from './dp/kadanesAlgorithm';
import { editDistanceModule } from './dp/editDistance';
import { zAlgorithmModule } from './strings/zAlgorithm';
import { houseRobberModule } from './dp/houseRobber';
import { nQueensModule } from './math/nQueens';

// Level-3 Essential Interview & Data Structure Additions
import { reverseLinkedListModule } from './linkedList/reverseLinkedList';
import { monotonicStackModule } from './stack/monotonicStack';
import { binaryExponentiationModule } from './math/binaryExponentiation';
import { rotatedSortedArrayModule } from './searching/rotatedSortedArray';
import { longestPalindromicSubstringModule } from './dp/longestPalindromicSubstring';

// Level-4 Canonical Algorithms & Interview Paradigms
import { twoPointersModule } from './arrays/twoPointers';
import { slidingWindowModule } from './arrays/slidingWindow';
import { floydCycleDetectionModule } from './linkedList/floydCycleDetection';
import { activitySelectionModule } from './arrays/activitySelection';
import { bitwiseOperationsModule } from './math/bitwiseOperations';

export const allModules: AlgorithmModule[] = [
  quicksortModule,
  mergesortModule,
  insertionSortModule,
  selectionSortModule,
  bubbleSortModule,
  countingSortModule,
  radixSortModule,
  heapsortModule,
  linearSearchModule,
  binarySearchModule,
  kmpModule,
  rabinKarpModule,
  zAlgorithmModule,
  balancedParenthesesModule,
  queueVisualizerModule,
  sieveModule,
  euclideanGcdModule,
  towerOfHanoiModule,
  nQueensModule,
  kadanesAlgorithmModule,
  houseRobberModule,
  lcsModule,
  coinChangeModule,
  lisModule,
  editDistanceModule,
  knapsackModule,
  bstModule,
  avlTreeModule,
  treeTraversalsModule,
  trieModule,
  singlyLinkedListModule,
  doublyLinkedListModule,
  binaryHeapModule,
  bfsTraversalModule,
  dfsTraversalModule,
  topologicalSortModule,
  dijkstraModule,
  bellmanFordModule,
  floydWarshallModule,
  aStarModule,
  kruskalMSTModule,
  primMSTModule,
  dsuModule,
  octree3dModule,
  reverseLinkedListModule,
  monotonicStackModule,
  binaryExponentiationModule,
  rotatedSortedArrayModule,
  longestPalindromicSubstringModule,
  twoPointersModule,
  slidingWindowModule,
  floydCycleDetectionModule,
  activitySelectionModule,
  bitwiseOperationsModule,
];

export const defaultModule = quicksortModule;

export function getModuleById(id: string): AlgorithmModule | undefined {
  return allModules.find((m) => m.id === id);
}
