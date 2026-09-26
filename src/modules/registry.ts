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
import { octree3dModule } from './trees/octree3d';

export const allModules: AlgorithmModule[] = [
  quicksortModule,
  mergesortModule,
  bubbleSortModule,
  binarySearchModule,
  twoPointersModule,
  slidingWindowModule,
  bstModule,
  singlyLinkedListModule,
  binaryHeapModule,
  bfsTraversalModule,
  octree3dModule,
];

export const defaultModule = quicksortModule;

export function getModuleById(id: string): AlgorithmModule | undefined {
  return allModules.find((m) => m.id === id);
}
