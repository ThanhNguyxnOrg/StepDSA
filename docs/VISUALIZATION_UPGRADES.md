# StepDSA — Visualization Upgrade Program ("Nâng cấp hết")

Living tracker for the curriculum-wide visualization upgrade. Each batch follows the
same bar as the completed reference refactors (insertion/merge/quick sort, BFS,
Dijkstra, reverse list, coin change, AVL):

- one meaningful operation per frame (no hidden transitions),
- algorithm-specific stage view when the generic bar row hides the mechanics,
- WHAT / WHY / WHAT-NEXT pedagogy with real values,
- prediction checkpoint where a genuine prediction exists,
- accurate variable / call-stack / code-line synchronization,
- regression tests + clean structural audit (errors = 0).

## Progress table

Status: ✅ deep-refactored · 🔶 stage upgraded, pedagogy/checkpoint partial · ⬜ not started

### Sorting (18)
| Module | Status | Notes |
| --- | --- | --- |
| insertion-sort | ✅ | held-key slot, guard true/false frames, checkpoint |
| mergesort | ✅ | MergeSortStage split-apart/merge-back rows, buffer copy-back frames |
| quicksort | ✅ | false comparisons, no-op swap, recursion frames |
| heapsort | ✅ | HeapSortStage (array + heap tree), per-child comparison frames, snippet re-alignment (0 audit warnings) |
| selection-sort | ✅ | no-swap guard frame, pedagogy everywhere, first-scan checkpoint |
| bubble-sort | ✅ | pedagogy + checkpoint, empty-final-pass false-positive fixed (no bogus early-exit) |
| cocktail-shaker-sort | ✅ | explicit early-exit frame, direction-aware pedagogy, turtle-rescue notes, checkpoint |
| shellsort | ⬜ | |
| counting-sort | ✅ | pedagogy on all phases, duplicate-slot checkpoint, stability explained per placement |
| radix-sort | ✅ | per-bucket drain frames (never bulk), drained buckets emptied, collect-order checkpoint |
| bucket-sort | ⬜ | bucket funnel view |
| quickselect | ⬜ | reuse quicksort partition patterns |
| timsort | ⬜ | |
| introsort | ⬜ | |
| bogosort / stooge-sort / drop-sort / sleep-sort | ⬜ | novelty; lower priority |

### Searching (8) — all currently generic ArrayStage
binary-search, linear-search, jump-search, interpolation-search, exponential-search,
ternary-search, rotated-sorted-array, binary-search-answer → ⬜
(plan: mid/lo/hi frontier + eliminated-range shading; mostly ArrayStage-compatible)

### Trees (26)
avl-tree ✅ · bst / bst-delete / tree-traversals / level-order-traversal / binary-heap /
max-heap / trie / segment-tree / fenwick-tree / red-black-tree / treap / splay-tree /
b-tree / two-three-tree / two-three-four-tree / skip-list / tree-map / kd-tree /
interval-tree / radix-tree / tst / ternary-search-tree / octree-3d / suffix-tree / recursion-trees → ⬜

### Graphs (27)
bfs ✅ · dijkstra ✅ · dfs / topological-sort / topological-sort-dfs / bellman-ford /
floyd-warshall / a-star / kruskal / prim / boruvka / dsu / tarjan-scc / kosaraju /
articulation-points / bridge-finding / bipartite-check / zero-one-bfs / edmonds-karp /
dinic / hopcroft-karp / hierholzer / hamiltonian-path / transitive-closure /
graph-coloring / flood-fill / graph-representations / line-intersection → ⬜

### DP (17)
coin-change ✅ · lcs / lis / edit-distance / knapsack / unbounded-knapsack / subset-sum /
matrix-chain / house-robber / climbing-stairs / unique-paths / jump-game / kadane /
lps / manacher / tsp-held-karp / burst-balloons / longest-palindromic-substring → ⬜

### Linked lists (9)
reverse-linked-list ✅ · singly / doubly / circular / middle / merge-two-lists /
remove-nth-from-end / intersection / floyd-cycle-detection → ⬜

### Stack & queue (9)
balanced-parentheses / stack / queue / circular-queue / deque / monotonic-stack /
shunting-yard / postfix-evaluation / sliding-window-max → ⬜

### Strings (9)
kmp / rabin-karp / z-algorithm / naive-search / boyer-moore / aho-corasick /
suffix-array-kasai / suffix-automaton / suffix-tree → ⬜

### Arrays & hashing (17)
hash-table-chaining / hash-table-open-addressing / dynamic-rehashing / dynamic-array /
two-pointers / sliding-window / prefix-ish (sparse-table, count-inversions,
merge-intervals, activity-selection, fractional-knapsack, gas-station, jump-game,
word-search, subsets, permutations, sudoku, rat-in-maze, submask-enumeration,
binary-tree-topologies) → ⬜

### Math & geometry (18)
sieve / euclidean-gcd / extended-gcd / tower-of-hanoi / n-queens /
binary-exponentiation / bitwise-operations / count-set-bits / single-number /
prime-factorization / strassen-matrix / convex-hull / closest-pair / point-in-polygon /
sweep-line-intersections / recursion-trees / lps → ⬜

## Batch plan (execution order)

1. **S1 — sorting mechanics (in progress):** heapsort ✅, selection ✅, bubble ✅ →
   cocktail, counting, radix, bucket, shellsort, quickselect.
2. **S2 — searching:** mid/lo/hi frontier stage for all 8 search modules.
3. **G1 — graph traversals & shortest paths:** DFS, bellman-ford, floyd-warshall, a-star,
   zero-one-bfs.
4. **G2 — MST & advanced graphs:** kruskal, prim, dsu, tarjan, kosaraju, bridges,
   articulation, bipartite, flow family.
5. **T1 — balanced trees:** red-black, treap, splay (rotation animations).
6. **T2 — specialized trees:** segment, fenwick, b-tree family, trie family, kd/interval.
7. **DP1 — table DP:** lcs, lis, edit-distance, knapsack family, matrix-chain.
8. **DP2 — grid/sequence DP + backtracking:** unique-paths, house-robber, n-queens,
   sudoku, word-search, rat-in-maze.
9. **L1 — linked lists:** pointer-diagram stages for the remaining 8.
10. **ST1 — stack/queue internals:** capacity rings, push/pop frames, monotonic stack.
11. **H1 — hashing:** bucket chains, probe sequences, rehash waves.
12. **STR1 — string matching:** pattern sliding + failure links.
13. **M1 — math/geometry:** sieve grid, GCD table, Hanoi pegs, convex hull sweep.

Each batch lands with: module frames + stage + tests + audit-clean + docs update.
