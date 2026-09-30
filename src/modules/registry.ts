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

// Level-5 Comprehensive Curriculum Expansions
import { jumpSearchModule } from './searching/jumpSearch';
import { interpolationSearchModule } from './searching/interpolationSearch';
import { exponentialSearchModule } from './searching/exponentialSearch';
import { cocktailShakerSortModule } from './sorting/cocktailShakerSort';
import { quickselectModule } from './sorting/quickselect';
import { shellsortModule } from './sorting/shellsort';
import { bucketSortModule } from './sorting/bucketSort';
import { stackVisualizerModule } from './stack/stackVisualizer';
import { circularQueueModule } from './stack/circularQueue';
import { dequeVisualizerModule } from './stack/dequeVisualizer';
import { circularLinkedListModule } from './linkedList/circularLinkedList';
import { middleLinkedListModule } from './linkedList/middleLinkedList';
import { levelOrderTraversalModule } from './trees/levelOrderTraversal';
import { maxHeapModule } from './trees/maxHeap';
import { segmentTreeModule } from './trees/segmentTree';
import { bipartiteCheckModule } from './graphs/bipartiteCheck';
import { floodFillModule } from './graphs/floodFill';
import { climbingStairsModule } from './dp/climbingStairs';
import { uniquePathsModule } from './dp/uniquePaths';
import { jumpGameModule } from './arrays/jumpGame';
import { ternarySearchModule } from './searching/ternarySearch';
import { mergeTwoListsModule } from './linkedList/mergeTwoLists';
import { removeNthFromEndModule } from './linkedList/removeNthFromEnd';
import { shuntingYardModule } from './stack/shuntingYard';
import { mergeIntervalsModule } from './arrays/mergeIntervals';
import { fractionalKnapsackModule } from './arrays/fractionalKnapsack';
import { binarySearchAnswerModule } from './searching/binarySearchAnswer';
import { intersectionLinkedListModule } from './linkedList/intersectionLinkedList';
import { postfixEvaluationModule } from './stack/postfixEvaluation';
import { slidingWindowMaxModule } from './stack/slidingWindowMax';
import { bstDeleteModule } from './trees/bstDelete';
import { subsetSumModule } from './dp/subsetSum';
import { naiveSearchModule } from './strings/naiveSearch';
import { boyerMooreModule } from './strings/boyerMoore';
import { gasStationModule } from './arrays/gasStation';
import { zeroOneBFSModule } from './graphs/zeroOneBFS';
import { unboundedKnapsackModule } from './dp/unboundedKnapsack';
import { bogosortModule } from './sorting/bogosort';
import { lpsModule } from './dp/lps';
import { matrixChainMultiplicationModule } from './dp/matrixChainMultiplication';
import { tarjanSCCModule } from './graphs/tarjanSCC';
import { huffmanCodingModule } from './trees/huffmanCoding';
import { countSetBitsModule } from './math/countSetBits';
import { subsetsModule } from './arrays/subsets';
import { dropSortModule } from './sorting/dropSort';
import { stoogeSortModule } from './sorting/stoogeSort';
import { sleepSortModule } from './sorting/sleepSort';
import { introsortModule } from './sorting/introsort';
import { timsortModule } from './sorting/timsort';
import { singleNumberModule } from './math/singleNumber';
import { topologicalSortDFSModule } from './graphs/topologicalSortDFS';
import { extendedGcdModule } from './math/extendedGcd';
import { bridgeFindingModule } from './graphs/bridgeFinding';
import { ratInAMazeModule } from './arrays/ratInAMaze';
import { fenwickTreeModule } from './trees/fenwickTree';
import { countInversionsModule } from './arrays/countInversions';
import { articulationPointsModule } from './graphs/articulationPoints';
import { kosarajuModule } from './graphs/kosaraju';
import { wordSearchModule } from './arrays/wordSearch';
import { transitiveClosureModule } from './graphs/transitiveClosure';
import { graphColoringModule } from './graphs/graphColoring';
import { edmondsKarpModule } from './graphs/edmondsKarp';
import { hierholzerModule } from './graphs/hierholzer';
import { treapModule } from './trees/treap';
import { splayTreeModule } from './trees/splayTree';
import { manacherModule } from './strings/manacher';
import { primeFactorizationModule } from './math/primeFactorization';

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
  // New Curriculum Modules
  jumpSearchModule,
  interpolationSearchModule,
  exponentialSearchModule,
  cocktailShakerSortModule,
  quickselectModule,
  shellsortModule,
  bucketSortModule,
  stackVisualizerModule,
  circularQueueModule,
  dequeVisualizerModule,
  circularLinkedListModule,
  middleLinkedListModule,
  levelOrderTraversalModule,
  maxHeapModule,
  segmentTreeModule,
  bipartiteCheckModule,
  floodFillModule,
  climbingStairsModule,
  uniquePathsModule,
  jumpGameModule,
  ternarySearchModule,
  mergeTwoListsModule,
  removeNthFromEndModule,
  shuntingYardModule,
  mergeIntervalsModule,
  fractionalKnapsackModule,
  binarySearchAnswerModule,
  intersectionLinkedListModule,
  postfixEvaluationModule,
  slidingWindowMaxModule,
  bstDeleteModule,
  subsetSumModule,
  naiveSearchModule,
  boyerMooreModule,
  gasStationModule,
  zeroOneBFSModule,
  unboundedKnapsackModule,
  bogosortModule,
  lpsModule,
  matrixChainMultiplicationModule,
  tarjanSCCModule,
  huffmanCodingModule,
  countSetBitsModule,
  subsetsModule,
  dropSortModule,
  stoogeSortModule,
  sleepSortModule,
  introsortModule,
  timsortModule,
  singleNumberModule,
  topologicalSortDFSModule,
  extendedGcdModule,
  bridgeFindingModule,
  ratInAMazeModule,
  fenwickTreeModule,
  countInversionsModule,
  articulationPointsModule,
  kosarajuModule,
  wordSearchModule,
  transitiveClosureModule,
  graphColoringModule,
  edmondsKarpModule,
  hierholzerModule,
  treapModule,
  splayTreeModule,
  manacherModule,
  primeFactorizationModule,
];

export const defaultModule = quicksortModule;

export function getModuleById(id: string): AlgorithmModule | undefined {
  return allModules.find((m) => m.id === id);
}
