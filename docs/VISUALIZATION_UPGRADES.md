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
avl-tree ✅ · bst ✅ · bst-delete ✅ · tree-traversals ✅ · level-order-traversal ✅ · binary-heap ✅ · max-heap ✅ · trie ✅ · ternary-search-tree ✅ · segment-tree ✅ · fenwick-tree ✅ · red-black-tree ✅ · treap ✅ · splay-tree ✅ · b-tree ✅ · two-three-tree ✅ · two-three-four-tree ✅ · skip-list ✅ · tree-map ✅ · kd-tree ✅ · interval-tree ✅ · radix-tree ✅ · octree-3d ✅ · suffix-tree ✅
All 26 tree modules are done. `recursion-trees` moved to the DP batch (category
`dynamic-programming`) — it is now the recursion-tree vs memo-DAG module.

Octree notes: real capacity-1 / max-depth-6 insertion (reject outside, overflow →
subdivide → redistribute → route), explicit depth-cap frame for coincident points,
sphere range query with AABB pruning and exact distance checks, orbitable 3D stage.

Suffix-tree notes: real Ukkonen construction (active point, remainder, suffix links,
edge splits, implicit leaf growth) instead of the earlier Rule-2-only stub — one frame
per phase start / active-edge reset / canonicalisation walk-down / leaf creation /
suffix-link assignment / Rule 3 stop / edge split / extension update / phase complete;
`$` sentinel normalisation, 24-char visual cap, checkpoints `suffix-tree-rule3-stop`
and `suffix-tree-first-split`, lexicographic child order, suffix-link arcs on the stage.

### Graphs (27)
bfs ✅ · dijkstra ✅ · dfs ✅ · bellman-ford ✅ · floyd-warshall ✅ · a-star ✅ · zero-one-bfs ✅ · topological-sort ✅ · topological-sort-dfs ✅ · kruskal ✅ · prim ✅ · boruvka ✅ · dsu ✅ · tarjan-scc ✅ · kosaraju ✅ · articulation-points ✅ · bridge-finding ✅ · bipartite-check ✅ · edmonds-karp ✅ · dinic ✅ · hopcroft-karp ✅ · hierholzer ✅ · hamiltonian-path ✅ · transitive-closure ✅ · graph-coloring ✅ · flood-fill ✅ · graph-representations ✅ /
line-intersection → ⬜ (module is category math; covered in the M1 geometry batch)

### DP (18)
coin-change ✅ · recursion-trees ✅ · longest-common-subsequence ✅ · edit-distance ✅ ·
knapsack-01 ✅ · lis ✅ · unbounded-knapsack ✅ /
subset-sum / matrix-chain / house-robber /
climbing-stairs / unique-paths / kadane / lps / tsp-held-karp / burst-balloons /
longest-palindromic-substring / tree-diameter-dp → ⬜

Unbounded-knapsack notes: the old module merged every candidate test into one
frame, hid the packing in the final frame, kept `itemChoiceCount` empty during the
fill and mis-mapped code lines. Now every (capacity, item) pair is `ITEM_TRY` with
the honest `wt[i] <= w` test, a fitting item gets `CANDIDATE` (dp[w-wt] + val vs
dp[w], explicitly noting the sub-answer may already contain this very item) and a
winning candidate is `UPDATE` + `LINK` writing the value and parent pointer
separately. The reconstruction walks the parent chain one copy per frame
(`WALK_START` / `PICK` / `MOVE`), so seeing the same item picked twice — the
unbounded hallmark — is a milestone (`Same Item Reused`). Parent labels sit under
every dp cell; copy counts appear on the item cards. Checkpoints
`unbounded-candidate-vs-best` and `unbounded-walk-jump`; milestones First Update /
Table Complete / First Copy Picked / Same Item Reused / Knapsack Solved. Five
snippets re-aligned to 17 shared lines; input normalisation clamps capacity 1..15,
items <=5, weight 1..15 (weight 0 would loop the walk forever), value 1..99, an
explicitly empty item list is a valid value-0 run, and a 'reuse beats unique'
preset contrasts with the 0/1 variant.

LIS notes: the old module had no pedagogy, one frame per comparison with the whole
reconstruction collapsed into the final frame, and code lines that pointed at blank
lines in three of the five snippets. Now the base cases are explicit (`BASE_DP`
dp[:]=1, `BASE_PARENT` parent[:]=-1), every fitting pair is three honest frames —
`PAIR_COMPARE` (strict `nums[j] < nums[i]`), `CHECK_BETTER` (candidate vs current,
with a tie note) and `UPDATE` + `LINK` writing dp and the parent pointer separately —
and the reconstruction is real: a linear argmax scan (`SCAN_COMPARE` / `NEW_BEST`,
ties keep the earlier end), `LENGTH`, then `WALK_PICK` / `WALK_MOVE` following parent
pointers end → start, `REVERSE`, `DONE`. Parent labels (`←p`, root = -1) sit under
every dp cell and the recovered chain is highlighted with #order badges. Checkpoints
`lis-extend-or-keep` (first genuine unequal candidate) and `lis-parent-jump` (parent
pointer vs adjacency); milestones Base Case / First Extension / Fill Complete /
Longest Chain Found / LIS Reconstructed. All five snippets re-aligned to 22 shared
lines; input normalisation drops non-numeric values with a note, clamps to ±999,
truncates beyond 10 elements, and an explicitly empty sequence is a valid 2-frame
answer-0 run.

Knapsack-01 notes: the old module wrote every cell in a single frame and hid the
reconstruction in the final frame. Now each fitting cell is two frames —
`CELL_COMPARE` (reads exclude dp[i-1][w] and include val[i] + dp[i-1][w-wt[i]]
with both dependency cells highlighted) then `CELL_DECIDE` (writes the max and
reports the winning branch) — while `CELL_TOO_HEAVY` explicitly inherits the row
above and shows the failed `wt[i-1] <= w` test. The reconstruction is one frame
per row (`BT_CHECK` comparing dp[i][w] with dp[i-1][w], then `BT_TAKE` subtracting
the weight), so the recovered selection grows visibly. Checkpoints
`knapsack-include-or-exclude` (first genuine unequal branch) and
`knapsack-backtrack-first-decision`; milestones First Fitting Item / First Include /
Table Complete / First Item Selected / Knapsack Solved. The five snippets were
re-aligned to 15 shared lines; input normalisation clamps capacity 1..12, items ≤6,
weight 1..12, value 1..99, an explicitly empty item list is a valid 2-frame
value-0 run, and unusable items fall back to the documented default with a note.

Edit-distance notes: the borders dp[i][0] = i and dp[0][j] = j are now filled one cell per
frame (`BASE_ROW` / `BASE_COL`) instead of being pre-filled invisibly, each inner cell
reports the three candidate costs and the winning operation (with a tie note), the
recovered edit script — previously never shown — is walked one operation per frame
(`BT_KEEP` / `BT_DELETE` / `BT_INSERT` / `BT_REPLACE`) and displayed as chips, and
`edit-distance-cheapest-op` / `edit-distance-backtrack-first-step` checkpoints ask for the
prediction at a genuine three-way choice. Tests re-apply the recovered script and assert it
transforms word1 into word2 with exactly dp[m][n] edits.

LCS notes: the table fill keeps one frame per cell but now carries the exact
dependencies (diagonal on a match, top+left on a max) plus WHAT/WHY/WHAT-NEXT with
the real values; the reconstruction — previously a single hidden step — is one frame
per move (`BT_TAKE` on a match, `BT_MOVE` with the up/left decision and its
conditionEval), the taken stack grows visibly, `lcs-max-choice` /
`lcs-backtrack-first-step` checkpoints, milestones First Match / Table Complete /
LCS Reconstructed. All 5 snippets were re-aligned so every action's codeLine lands on
the same statement in pseudocode, Python, TS, C++ and Java (verified in tests);
empty/cleaned/oversized inputs are normalised with the adjustment reported.

Recursion-trees notes (VisuAlgo-inspired, rebuilt from scratch): the old module ran
mergesort code in "quicksort" mode and emitted no frames at all while building the
backtracking tree. It is now the *overlapping subproblems → memoisation* hub:
node = (argument tuple, returned value), colours for computing / returned / base case /
**repeat** (plain recursion) / **memo reuse** (DAG), memo-table chip row, live stats
(calls, distinct subproblems, repeated, base visits, memo hits, calls avoided),
`fib(5)` naive reports the reference 15 calls / 3 repeated / 8 base visits and
memoised `fib(6)` reports 7 distinct / 0 repeated / 2 base visits / 4 hits / 18 calls
avoided; checkpoints `recursion-trees-first-repeat`, `-memo-miss`, `-memo-hit`;
presets fib(5)/fib(6)/fib(6)+memo/C(5,3)/C(6,3)+memo/paths(3,3)+memo; category moved to
`dynamic-programming`. The mergesort/quicksort/backtracking recursion specialisations
live in their own modules and now cross-link through `relatedModules`.

### Linked lists (9)
reverse-linked-list ✅ · singly / doubly / circular / middle / merge-two-lists /
remove-nth-from-end / intersection / floyd-cycle-detection → ⬜

### Stack & queue (9)
balanced-parentheses / stack / queue / circular-queue / deque / monotonic-stack /
shunting-yard / postfix-evaluation / sliding-window-max → ⬜

### Strings (9)
kmp / rabin-karp / z-algorithm / naive-search / boyer-moore / aho-corasick /
suffix-array-kasai / suffix-automaton → ⬜ · suffix-tree ✅ (Ukkonen, see Trees notes)

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
sweep-line-intersections / lps → ⬜ (recursion-trees now lives in the DP batch above)

## Cross-module navigation (2026-11-16)

- **`relatedModules`** — optional field on `AlgorithmModule`; TheoryDrawer renders a
  "Variants & Related" chip row when `onSelectModule` is supplied. Populated for 20
  modules (sorting family, BST/AVL/RB/trie/heap, BFS/DFS/Dijkstra/Kruskal/A*,
  coin-change, stack/queue, linked list, linear/binary search, hash chaining).
  Learnt from sortvisualizer ("variants" of Bubble Sort) and USFCA implementation
  variants (Stack Array vs Linked List, heap families, DP strategies).
- **Integrity test** in `src/modules/modules.test.ts` fails if any `relatedModules.id`
  does not resolve to a registered module or points at itself.
- **`?input=` permalink** (LZString) — see `docs/research/ROUND3_CLASSICS.md` §5.

## Batch plan (execution order)

1. **S1 — sorting mechanics ✅ COMPLETE (18/18):** insertion, mergesort, quicksort,
   heapsort, selection, bubble, cocktail, counting, radix, bucket, shellsort,
   quickselect, timsort, introsort, bogosort, stooge-sort, drop-sort, sleep-sort.
2. **S2 — searching ✅ COMPLETE (8/8):** binary, linear, jump, interpolation,
   exponential, ternary, rotated-sorted-array, binary-search-answer (eliminated-range
   shading where applicable; code-line remaps fixed 6 modules).
3. **G1 ✅ COMPLETE:** bfs, dijkstra, dfs, bellman-ford, floyd-warshall, a-star,
   zero-one-bfs, topological-sort, topological-sort-dfs (split frames, pedagogy,
   checkpoints, code-line remaps).
4. **G2 ✅ COMPLETE (graphs 26/27):** kruskal, prim, boruvka, dsu, tarjan-scc, kosaraju,
   articulation-points, bridge-finding, bipartite-check, edmonds-karp, dinic,
   hopcroft-karp, hierholzer, hamiltonian-path, transitive-closure, graph-coloring,
   flood-fill, graph-representations. `line-intersection` is category math → M1.
5. **T1 — balanced trees:** red-black, treap, splay (rotation animations).
6. **T2 — specialized trees:** segment, fenwick, b-tree family, trie family, kd/interval.
7. **DP1 — table DP:** recursion-trees ✅, longest-common-subsequence ✅,
   edit-distance ✅, knapsack-01 ✅, lis ✅, unbounded-knapsack ✅, subset-sum, matrix-chain.
8. **DP2 — grid/sequence DP + backtracking:** unique-paths, house-robber, n-queens,
   sudoku, word-search, rat-in-maze.
9. **L1 — linked lists:** pointer-diagram stages for the remaining 8.
10. **ST1 — stack/queue internals:** capacity rings, push/pop frames, monotonic stack.
11. **H1 — hashing:** bucket chains, probe sequences, rehash waves.
12. **STR1 — string matching:** pattern sliding + failure links.
13. **M1 — math/geometry:** sieve grid, GCD table, Hanoi pegs, convex hull sweep.

Each batch lands with: module frames + stage + tests + audit-clean + docs update.
