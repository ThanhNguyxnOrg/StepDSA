import { allModules } from '../src/modules/registry';
import * as fs from 'fs';
import * as path from 'path';

const missing = [
  'rabin-karp', 'z-algorithm', 'queue-fifo', 'n-queens', 'kadanes-algorithm',
  'coin-change', 'longest-increasing-subsequence', 'edit-distance', 'tree-traversals',
  'doubly-linked-list', 'bellman-ford', 'floyd-warshall', 'a-star-search', 'prim-mst',
  'disjoint-set-union', 'reverse-linked-list', 'monotonic-stack', 'binary-exponentiation',
  'longest-palindromic-substring', 'two-pointers-water', 'activity-selection-greedy',
  'bitwise-operations', 'shellsort', 'bucket-sort', 'stack-lifo', 'circular-queue',
  'level-order-traversal', 'max-heap-build', 'segment-tree', 'bipartite-check',
  'climbing-stairs', 'unique-paths', 'two-three-tree', 'mergesort-recursion-tree',
  'quicksort-partition-tree', 'backtracking-decision-tree'
];

const files: string[] = [];
function walk(dir: string) {
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) files.push(p);
  }
}
walk('./src/modules');

const mapping: Record<string, string> = {};
for (const id of missing) {
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes(`id: '${id}'`)) {
      mapping[id] = f;
      break;
    }
  }
}
console.log(JSON.stringify(mapping, null, 2));
