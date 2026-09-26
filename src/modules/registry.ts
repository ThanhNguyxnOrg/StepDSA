import { AlgorithmModule } from '../core/types';
import { quicksortModule } from './sorting/quicksort';
import { mergesortModule } from './sorting/mergesort';
import { bubbleSortModule } from './sorting/bubbleSort';
import { binarySearchModule } from './searching/binarySearch';
import { twoPointersModule } from './arrays/twoPointers';
import { slidingWindowModule } from './arrays/slidingWindow';
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

export const allModules: AlgorithmModule[] = [
  quicksortModule,
  mergesortModule,
  insertionSortModule,
  selectionSortModule,
  bubbleSortModule,
  linearSearchModule,
  binarySearchModule,
  twoPointersModule,
  slidingWindowModule,
  bstModule,
  trieModule,
  singlyLinkedListModule,
  binaryHeapModule,
  bfsTraversalModule,
  dfsTraversalModule,
  topologicalSortModule,
  dijkstraModule,
  knapsackModule,
  octree3dModule,
];

export const defaultModule = quicksortModule;

export function getModuleById(id: string): AlgorithmModule | undefined {
  return allModules.find((m) => m.id === id);
}
