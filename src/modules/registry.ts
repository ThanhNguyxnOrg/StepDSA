import { AlgorithmModule } from '../core/types';
import { quicksortModule } from './sorting/quicksort';
import { mergesortModule } from './sorting/mergesort';
import { binarySearchModule } from './searching/binarySearch';
import { twoPointersModule } from './arrays/twoPointers';
import { bstModule } from './trees/bst';

export const allModules: AlgorithmModule[] = [
  quicksortModule,
  mergesortModule,
  binarySearchModule,
  twoPointersModule,
  bstModule,
];

export const defaultModule = quicksortModule;

export function getModuleById(id: string): AlgorithmModule | undefined {
  return allModules.find((m) => m.id === id);
}
