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
| shellsort | ✅ | held-key auxiliary, per-shift/per-decrement frames, both guard outcomes, gap-chain highlight, checkpoint, code-line fixes |
| counting-sort | ✅ | pedagogy on all phases, duplicate-slot checkpoint, stability explained per placement |
| radix-sort | ✅ | per-bucket drain frames (never bulk), drained buckets emptied, collect-order checkpoint |
| bucket-sort | ✅ | new BucketSortStage (array + range-labelled bucket columns), per-bucket sorted frames, ordered gather, range-invariant checkpoint |
| quickselect | ✅ | window-entry + pivot frames, no-op swap branch, rank-decision checkpoint, code-line fixes |
| timsort | ✅ | run-scan/reversal/extension/merge pedagogy, per-compare checkpoint, best-case O(N) regression |
| introsort | ✅ | heapsort fallback actually reachable (scaled depth, documented), engine-dispatch checkpoint, insertion-complete frame, code-line fixes |
| bogosort | ✅ | rejection frames, independence checkpoint, honest forced-permutation rail |
| stooge-sort | ✅ | base-case frame, boundary conditionEval, third-branch checkpoint |
| drop-sort | ✅ | guard conditionEval, survival checkpoint, "data loss" honesty notes |
| sleep-sort | ✅ | wake-order checkpoint, tick/append pedagogy, tie-race caveat |

### Searching (8)

| Module | Status | Notes |
| --- | --- | --- |
| binary-search | ✅ | invariant + eliminated-range pedagogy, halving checkpoint, NOT_FOUND code-line fix |
| linear-search | ✅ | growing verified-prefix invariant, prefix checkpoint, match/not-found pedagogy |
| jump-search | ✅ | √N rationale, block-skip checkpoint, all code lines remapped (was 16 > 13 lines) |
| interpolation-search | ✅ | value-ratio probe rationale, probe-ratio checkpoint, degenerate equal-span branch, all code lines remapped (was 16 > 9 lines) |
| exponential-search | ✅ | doubling rationale, O(log p) checkpoint, bracketed-window pedagogy, helper pseudocode expanded (was 16 > 6 lines) |
| ternary-search | ✅ | two-probe tri-section pedagogy, 2/3-elimination checkpoint, honest "binary is faster" note, code lines remapped (was 15 > 11 lines) |
| rotated-sorted-array | ✅ | sorted-half reasoning, half-choice checkpoint, invalid-input guard pedagogy, code lines remapped (was 16 > 12 lines) |
| binary-search-answer | ✅ | answer-space explanation, monotone-predicate checkpoint, pile-hour breakdown pedagogy, code lines remapped (was 15 > 12 lines) |

### Trees (26)
avl-tree ✅ · bst / bst-delete / tree-traversals / level-order-traversal / binary-heap /
max-heap / trie / segment-tree / fenwick-tree / red-black-tree / treap / splay-tree /
b-tree / two-three-tree / two-three-four-tree / skip-list / tree-map / kd-tree /
interval-tree / radix-tree / tst / ternary-search-tree / octree-3d / suffix-tree / recursion-trees → ⬜

### Graphs (27)
bfs ✅ · dijkstra ✅ · dfs ✅ · bellman-ford ✅ · floyd-warshall ✅ · a-star ✅ · zero-one-bfs ✅ · topological-sort ✅ · topological-sort-dfs ✅ · kruskal ✅ · prim ✅ · boruvka ✅ · dsu ✅ · tarjan-scc ✅ · kosaraju ✅ · articulation-points ✅ · bridge-finding ✅ · bipartite-check ✅ · edmonds-karp ✅ /
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

1. **S1 — sorting mechanics ✅ COMPLETE (18/18):** insertion, mergesort, quicksort,
   heapsort, selection, bubble, cocktail, counting, radix, bucket, shellsort,
   quickselect, timsort, introsort, bogosort, stooge-sort, drop-sort, sleep-sort.
2. **S2 — searching ✅ COMPLETE (8/8):** binary, linear, jump, interpolation,
   exponential, ternary, rotated-sorted-array, binary-search-answer (eliminated-range
   shading where applicable; code-line remaps fixed 6 modules).
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
