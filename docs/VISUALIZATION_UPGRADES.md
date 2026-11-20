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
knapsack-01 ✅ · lis ✅ · unbounded-knapsack ✅ · subset-sum ✅ ·
matrix-chain ✅ · house-robber ✅ · unique-paths ✅ · climbing-stairs ✅ ·
kadanes-algorithm ✅ /
climbing-stairs / unique-paths / kadane / lps / tsp-held-karp / burst-balloons /
longest-palindromic-substring / tree-diameter-dp → ⬜

Kadane notes: the old module crashed on an empty array, folded the restart
decision and the record update into one frame, and never explained the negative
prefix heuristic. Now the seeds are explicit (`SETUP_CUR` currentSum = nums[0],
`SETUP_MAX` maxSum = nums[0] with the all-negative pitfall, `WINDOW_INIT` for the
two windows), every element gets `CHECK_PREFIX` (currentSum < 0, the entire
heuristic in one conditionEval) followed by `RESTART` + `WINDOW_START` or
`EXTEND`, then `CHECK_MAX` and — on a new record — `NEW_MAX` + `RECORD_WINDOW`.
The running window and the best window are tracked and drawn separately.
Checkpoints `kadane-negative-prefix` (drop vs drag the dead prefix) and
`kadane-new-max`; milestones Base Window Seeded / First Prefix Restart / New
Global Max / Max Subarray Found. The sidebar cross-checks against a brute-force
O(N^2) reference. Five snippets re-aligned to 18 shared lines; input
normalisation drops non-numeric values with a note, clamps to +/-999, caps at 10
elements, and an explicitly empty array is a valid 2-frame answer-0 run.

Climbing-stairs notes: the old module never showed the `n <= 2` guard that its own
snippets start with, made every write a milestone and mis-mapped five
differently-shaped snippets. Now the guard is frame 0 (`INIT` with the honest
`n <= 2` evaluation, and an n <= 2 input ends in a 2-frame `SMALL_DONE` run), the
base cases are explicit (`BASE_ONE` dp[1] = 1 with sequence [1], `BASE_TWO`
dp[2] = 2 with [1+1] and [2]), and every step reads its two branches separately
(`READ_ONE` dp[i-1] highlighted as the 1-step group, `READ_TWO` dp[i-2] as the
2-step group) before `SUM_STEP` adds them. Checkpoints `climbing-stairs-why-two`
(why the count is a sequence count, not a move count) and `climbing-stairs-fib-sum`
(addition, not max or product); milestones Base Cases Set / First Sum / Top
Reached. The staircase stage highlights which predecessor feeds which branch, and
the sidebar cross-checks the answer against fib(n+1). Five snippets re-aligned to
10 shared lines; input normalisation clamps n to 1..10 with a note and reports
invalid inputs.

Unique-paths notes: the old module pre-filled both boundaries invisibly in one
frame, made every cell write a milestone and mis-mapped five differently-shaped
snippets. Now the first column is written one cell per frame (`BASE_ROW`, with the
`unique-paths-boundary` checkpoint asking why a first-column cell has exactly one
path) followed by the first row (`BASE_COL`), and every inner cell is a single
`CELL_SUM` frame showing top + left with both predecessors highlighted. Only real
turning points are milestones (Boundary Base Case / First Sum / Grid Fill Complete
/ Goal Reached), with the `unique-paths-first-sum` checkpoint contrasting additive
path counting against a max or a product. The sidebar cross-checks the running
answer against C(m+n-2, m-1). Five snippets re-aligned to 10 shared lines; input
normalisation clamps both dimensions to 1..6 with a note, and degenerate grids
(1x1, corridors) run honestly with zero inner cells.

House-robber notes: the old module crashed on an empty street (dp[0] = nums[0]
before any guard), scattered code lines across five differently-shaped snippets,
and dropped the robbed set to an empty array during the middle frames. Now the
base cases are folded into the loop the way the snippets show it: every house gets
`SKIP_BRANCH` (dp[i-1], with the honest `i > 0` guard) and `ROB_BRANCH`
(dp[i-2] + nums[i], guard `i > 1`) before `DECIDE` writes the max, so house 0 and 1
are no longer special-cased off-screen. The reconstruction walks the rob equation
dp[i] == dp[i-2] + nums[i] one house per frame (`BT_CHECK`, `BT_TAKE` jumping two
back, `BT_SKIP` stepping one back) and keeps the loot visible throughout.
Checkpoints `house-robber-skip-or-rob` and `house-robber-backtrack-first`;
milestones First Decision / Table Complete / First House Robbed / Max Loot
Secured. Five snippets re-aligned to 17 shared lines including the walk; input
normalisation drops non-numeric values with a note, clamps cash to 0..999, caps
the street at 10 houses, and an explicitly empty street is a valid answer-0 run.

Matrix-chain notes: the old module had no pedagogy, and never showed the
parenthesisation being built. Now the diagonal base case is explicit (`ALLOC`),
every interval is armed with `SET_INF` (m[i][j] = infinity) before its splits,
each split is `TRY_SPLIT` (left m[i][k] + right m[k+1][j] + join p[i-1]p[k]p[j],
both dependency cells highlighted) and a winning split is `WRITE_MIN` +
`RECORD_SPLIT` writing the cost and the split pointer separately. The
reconstruction reads splitTable in DFS pre-order — one `BT_SPLIT` per internal
interval until n-1 splits reveal the full parenthesisation, shown live with the
split-tree path. Checkpoints `mcm-split-cost` (candidate vs current minimum on a
real comparison) and `mcm-backtrack-first-split` (recorded split vs positional
convenience); milestones First Minimum / Table Complete / First Split Revealed /
Optimal Order Found. Five snippets re-aligned to 15 shared lines; input
normalisation drops non-numeric dimensions with a note, clamps to 1..999, caps
the chain at 6 matrices, keeps a single-matrix chain as a valid 5-frame answer-0
run, and a 'single product' preset shows the degenerate one-cell table.

Subset-sum notes: the base column dp[i][0] = true is now filled one row per frame
(`BASE_ROW`) instead of pre-filled invisibly, too-big sums inherit explicitly
(`CELL_TOO_BIG` with the failed `nums[i-1] > j` test), fitting sums are
`CELL_COMPARE` (both dependency cells highlighted) then `CELL_DECIDE` (the OR
result with a tie note), and the recovered subset — previously collapsed into the
final frame — is walked one row per frame (`BT_CHECK` comparing dp[i][j] with
dp[i-1][j], `BT_TAKE` taking the item and reducing the sum). An infeasible target
ends in an honest `NO_SOLUTION` frame listing the reachable sums, and target 0 is
a legal run answered by the empty subset. Checkpoints `subset-sum-or-choice`
(first genuine exclude/include difference) and `subset-sum-backtrack-first-take`;
milestones Base Case / First Reachable Sum / Table Complete / First Item Taken /
Subset Found. Five snippets re-aligned to 20 shared lines (reconstruction
included); input normalisation drops non-numeric values with a note, clamps
values to 0..99, caps n at 6 and target at 20.

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

## Legacy batch audit (2026-11-17)

Full sweep of all 40 sorting/searching modules against the DP-batch standard
(pedagogy, checkpoints, audit 0/0 on every preset, five aligned snippets, exact
code-line map). Results in `docs/AUDIT_SWEEP_2026-11-17.md`: 7 modules are fully
up to standard (binary-search, exponential-search, interpolation-search re-aligned
in this pass; linear/rotated/jump/ternary already exact), 3 have small drift
(timsort, binary-search-answer, sleep-sort), and the remaining 30 — including the
flagship sorts — still map code lines proportionally and need one-by-one
re-alignment. Remediation order: insertion → quicksort → mergesort → bubble →
heapsort, then the rest of S1; string/hashing modules stay in STR1/H1.

### Legacy rebuilds (DP standard applied to old batches)

- **kmp-search ✅ (2026-11-20):** rebuild — pedagogy on every frame (was 0%),
  2 checkpoints (LPS meaning with non-zero correct index + mismatch action
  with non-zero correct index), named actions (INIT → MATCH_CHAR →
  MATCH_FOUND → SHIFT_LPS → ADVANCE_I → DONE), 3 real milestones (LPS Table
  Ready, First Full Match, Search Complete), five 16-line snippets with the
  same statement per line and exact code-line mapping (mapBad 246 → 0),
  honest normalisation for {text, pattern} (overlong inputs truncated with a
  note; empty text/pattern = valid short runs). 6 regression tests added
  (780 total).
- **mergesort-recursion-tree ✅ (2026-11-20):** rebuild — pedagogy on every
  frame (was 0%), 2 checkpoints (log₂N depth with non-zero correct index +
  both-halves-already-sorted invariant), named actions (init → call → split →
  merge → base → merged → complete), 3 real milestones + auto Start (First
  Base Case, First Merge Complete, Complete), five 7-line snippets with the
  same statement per line and exact code-line mapping (mapBad 200 → 0),
  honest normalisation for {array} (non-numeric dropped, values clamped
  ±999, >8 truncated so the tree stays readable; empty array = valid short
  run). 6 regression tests added (774 total).
- **quicksort-partition-tree ✅ (2026-11-20):** rebuild — pedagogy on every
  frame (was 0%), 2 checkpoints (last-element-pivot degeneracy with non-zero
  correct index + compose-around-pivot), named actions (init → call →
  choose-pivot → partition → base → sorted → complete), 2 real milestones +
  auto Start (First Base Case, Complete), five 7-line snippets with the same
  statement per line and exact code-line mapping (mapBad 263 → 0), honest
  normalisation for {array} (non-numeric dropped, values clamped ±999, >8
  truncated so the tree stays readable; empty array = valid short run).
  6 regression tests added (768 total).
- **backtracking-decision-tree ✅ (2026-11-20):** rebuild — pedagogy on every
  frame (was 0%), 2 checkpoints (include-vs-exclude order with non-zero
  correct index + prune soundness with non-negative items), named actions
  (init → explore → include → restore → exclude → prune / solution →
  complete), 3 real milestones + auto Start (First Prune, First Solution
  Found, Complete Exploration), five 12-line snippets with the same
  statement per line and exact code-line mapping (mapBad 774 → 0), honest
  normalisation for {items, target} (negative items dropped because pruning
  assumes non-negative items, items clamped to ±99, >6 truncated; empty item
  list = valid short run). 6 regression tests added (762 total).
- **binary-search-answer ✅ (2026-11-20):** rebuild — named actions on every
  frame (INIT → ITERATION → EVALUATE → FEASIBLE / TOO_SLOW → DONE) around the
  existing answer-space slider + pile-breakdown stage, 12 frames on the
  default input with WHAT/WHY/NEXT on all of them, 1 checkpoint (monotonic
  feasibility direction with non-zero correct index), 3 real milestones +
  auto Start (First Feasible Found, Half Answer Space Eliminated, Optimal
  Minimum Speed), five 14-line snippets with the same statement per line and
  exact code-line mapping (mapBad 48 → 0), honest normalisation for
  {piles, h} (non-positive piles dropped, h clamped to ≥ 1, >8 truncated;
  empty piles = valid 2-frame run with result 0). Also fixed the generous
  preset prose: the true minimum there is k = 11, not k = 12. 6 regression
  tests added (756 total).
- **sleep-sort ✅ (2026-11-20):** rebuild — named actions on every frame
  (INIT → DISPATCH → TICK_WAKE → WAKE_APPEND → TICK_IDLE → DONE), 17 frames
  on the default input with WHAT/WHY/NEXT on all of them, 2 checkpoints
  (wake order with non-zero correct index + tie handling at t=2 with the
  duplicates preset), 3 real milestones + auto Start (First Wakeup, Half
  Awake, Complete — per-wakeup milestones removed), five 8-line snippets
  with the same statement per line and exact code-line mapping (mapBad 8 →
  0), honest normalisation (tick domain [1..15] with clamp notes, >8
  truncated; empty = valid 2-frame run), DONE frame shows the sorted output.
  6 regression tests added (750 total).
- **stooge-sort ✅ (2026-11-20):** rebuild — named actions on every frame
  (INIT → BOUNDARY_COMPARE/SWAP → BASE_CASE → BRANCH_FIRST / BRANCH_LAST /
  BRANCH_FIRST_AGAIN → DONE), 111 frames on the default input with
  WHAT/WHY/NEXT on all of them (was 97%), 2 checkpoints (third-branch
  necessity + why the overlap guarantees the maximum reaches j, both with
  non-zero correct index), 2 real milestones + auto Start (First Trisection,
  Complete), five 9-line snippets with the same statement per line and exact
  code-line mapping (mapBad 70 → 0; previously line 9 pointed past the
  8-line pseudocode), honest normalisation (input capped at 6 elements so the
  3-branch recursion tree stays watchable; empty = valid 2-frame run).
  6 regression tests added (744 total).
- **bogosort ✅ (2026-11-20):** rebuild — named actions on every frame (INIT →
  VERIFY per adjacent pair → REJECTED on first violation → SHUFFLED → SORTED),
  12 frames on the default input with WHAT/WHY/NEXT on all of them (was 50%),
  1 checkpoint (shuffle independence — the honest count for one shuffle
  decision per run), 2 real milestones + auto Start (First Rejection, Sorted
  in N Attempts — per-shuffle milestones removed from ~24 to 0), five 11-line
  snippets (isSorted helper + bogosort) with the same statement per line and
  exact code-line mapping (mapBad 109 → 0; previously lines 8/10/12 pointed
  past the 4-line pseudocode), honest normalisation (input capped at 4
  elements with an explicit N! warning note, empty = valid 2-frame run).
  6 regression tests added (738 total).
- **drop-sort ✅ (2026-11-20):** rebuild — named actions on every frame (INIT →
  COMPARE → RETAIN / DROP → DONE), 14 frames on the default input with
  WHAT/WHY/NEXT on all of them, 1 checkpoint (survival decision with dynamic
  correct index — the honest count for a two-outcome scan), 2 real milestones
  + auto Start (First Drop, Complete), five 6-line snippets with the same
  statement per line and exact code-line mapping (mapBad 87 → 0), honest
  input normalisation, loss accounting regression (drops 1,2,3 / retains
  4,5,6; reversed input = 1 survivor). 6 regression tests added (732 total).
- **timsort ✅ (2026-11-19):** rebuild — named actions on every frame (INIT →
  SCAN_RUN (with run-direction checkpoint) → REVERSE_RUN → EXTEND_RUN/SHIFT →
  RUN_PUSHED → MERGE_START/COMPARE/COPY → MERGED → DONE), 21 frames on the
  default input with WHAT/WHY/NEXT on all of them, 2 checkpoints (run
  direction with dynamic correct index + first merge compare), 4 real
  milestones + auto Start (First Run Finalized, All Runs Stacked, First Merge
  Complete, Complete — per-run/per-merge noise removed), five 11-line
  snippets with the same statement per line and exact code-line mapping
  (mapBad 60 → 0), honest input normalisation, best-case regression (one
  natural run, zero merges). 6 regression tests added (726 total).
- **introsort ✅ (2026-11-19):** rebuild — named actions on every frame (INIT →
  PIVOT_SELECTED → COMPARE → SWAP → PIVOT_PLACED → CALL_LEFT/CALL_RIGHT →
  INSERTION_ENTRY/SHIFT/DONE → HEAPSORT_ENTRY/SIFT/EXTRACT → DONE), 38 frames
  on the default input with WHAT/WHY/NEXT on all of them, 2 checkpoints
  (engine dispatch + size cutoff with non-zero correct index), 3 real
  milestones + auto Start (First Pivot Locked, Heapsort Fallback Triggered
  when it fires, Complete — per-partition double milestones removed), five
  11-line snippets with the same statement per line and exact code-line
  mapping (mapBad 136 → 0), honest input normalisation, engine-behaviour
  regression (ideal = no fallback; adversarial sorted input fires the
  Heapsort rescue; 4-element input is pure insertion). 6 regression tests
  added (719 total).
- **linear-search / jump-search / ternary-search / rotated-sorted-array ✅
  (2026-11-19):** snippet-only re-alignment (frames were already semantically
  correct) — five language snippets rebuilt to shared 5-line, 13-line, 11-line
  and 12-line layouts respectively with the same statement per line; mapBad
  3+3+2+1 → 0 across every input, audit 0/0 preserved. Every searching module
  with authored frames is now at full standard.
- **quickselect ✅ (2026-11-19):** rebuild — named actions on every frame (INIT
  → WINDOW → PIVOT_SELECTED → COMPARE → SWAP/NO_SWAP → PIVOT_PLACED →
  FOUND / PRUNE_RIGHT / PRUNE_LEFT), 14 frames on the default input (the first
  partition lands the pivot exactly on k = 3) with WHAT/WHY/NEXT on all of
  them, 2 checkpoints (rank decision with a dynamic correct index + prune
  direction), real milestones (First Rank Locked, Found k-th Element —
  per-pivot-selection milestones removed), five 20-line snippets with the same
  statement per line and exact code-line mapping (mapBad 156 → 0), honest
  normalisation for the {array, k} pair (non-numeric dropped, k clamped into
  [0..n-1] or replaced by the median rank with a note, >12 truncated; empty
  array = valid 2-frame run returning the -1 sentinel). 6 regression tests
  added (713 total).
- **bucket-sort ✅ (2026-11-19):** rebuild around the existing bucket stage —
  named actions on every frame (INIT → SCATTER per element → SCATTER_COMPLETE →
  INTERNAL_SWAP/BUCKET_SORTED per bucket → GATHER per element → DONE), 26
  frames on the default input with WHAT/WHY/NEXT on all of them, 2 checkpoints
  (range-partition invariant + ascending gather order with non-zero correct
  index), 3 real milestones + auto Start (Scatter Phase Complete, Half the
  Array Gathered, Complete), five 14-line snippets with the same statement per
  line and exact code-line mapping (mapBad 260 → 0), honest input
  normalisation, write-cursor monotonicity regression. 6 regression tests
  added (707 total).
- **cocktail-shaker-sort ✅ (2026-11-19):** rebuild — named actions on every
  frame (INIT → FORWARD_COMPARE/SWAP → MAX_LOCKED → BACKWARD_COMPARE/SWAP →
  MIN_LOCKED → EARLY_EXIT → DONE), 39 frames on the default input with
  WHAT/WHY/NEXT on all of them, 2 checkpoints (first forward compare with a
  dynamic correct index + which boundary shrinks), 4 real milestones + auto
  Start (First Max Locked, Half the Array Locked, Early Exit, Complete —
  per-swap milestones removed), five 20-line snippets with the same statement
  per line and exact code-line mapping (mapBad 348 → 0), honest input
  normalisation, turtle-rescue phrasing kept and regression-covered. 6
  regression tests added (701 total).
- **shellsort ✅ (2026-11-19):** rebuild — named actions on every frame (INIT →
  PASS_START → PICKUP → GUARD (both outcomes) → SHIFT → CURSOR → INSERT →
  PASS_END → DONE) around the existing key-shelf + chain visuals, 125 frames
  on the default input with WHAT/WHY/NEXT on all of them, 2 checkpoints
  (first guard with dynamic correct index + gap halving with non-zero correct
  index), 4 real milestones + auto Start (one per completed gap pass —
  genuine h-sorted turning points), five 13-line snippets with the same
  statement per line and exact code-line mapping (mapBad 613 → 0), honest
  input normalisation, pickup/shift accounting regression (pickups 22,
  guard both outcomes). 6 regression tests added (695 total).
- **radix-sort ✅ (2026-11-19):** full rebuild around the existing bucket-grid
  stage — one operation per frame (INIT → PASS_START → DIGIT_PLACE per element
  → COLLECT_BUCKET per non-empty bucket → PASS_COMPLETE per digit place →
  DONE), 46 frames on the default input with WHAT/WHY/NEXT on all of them,
  2 checkpoints (digit formula with non-zero correct index + collect order),
  4 real milestones + auto Start (one per digit pass — genuine invariant
  extensions — plus Complete), five 13-line snippets with the same statement
  per line and exact code-line mapping (mapBad 312 → 0), honest normalisation
  for the key domain (negatives dropped with one aggregated note, clamped to
  max key 9999, >12 truncated; empty = valid 2-frame run), invariant
  regression (after the 10s pass the array is sorted by its two lowest
  digits). 6 regression tests added (689 total).
- **counting-sort ✅ (2026-11-19):** full rebuild around the existing three-panel
  stage — one operation per frame (INIT → COUNT per element → PREFIX_START →
  PREFIX_ACC per key → BUILD_START → PLACE per element → DONE), 26 frames on
  the default input with WHAT/WHY/NEXT on all of them, 2 checkpoints (prefix
  meaning with non-zero correct index + duplicate slot), 3 real milestones +
  auto Start (First Placement, Half the Output Filled, Complete — no
  per-placement noise), five 14-line snippets with the same statement per line
  and exact code-line mapping (mapBad 616 → 0), honest normalisation for the
  key domain (negative values dropped with one aggregated note, clamped to
  max key 99, >12 truncated; empty = valid 2-frame run), stability regression
  (duplicates claim blocks right-to-left). 6 regression tests added
  (683 total).
- **selection-sort ✅ (2026-11-19):** full rebuild — one operation per frame
  (INIT → PASS_START → SCAN_START → COMPARE → MIN_UPDATE → SWAP / NO_SWAP →
  INDEX_LOCKED → DONE), 53 frames on the default input with WHAT/WHY/NEXT on
  all of them, 2 checkpoints (first scan compare with a dynamic correct index +
  first swap guard), 3 real milestones + auto Start (First Index Locked, Half
  the Array Locked, Complete — no per-pass noise), five 10-line snippets with
  the same statement per line and exact code-line mapping (mapBad 249 → 0),
  honest input normalisation, write-minimality regression (swaps ≤ passes;
  sorted input = full O(N²) compares, 0 swaps). 6 regression tests added
  (677 total).
- **heapsort ✅ (2026-11-18):** full rebuild on top of the existing heap stage —
  named actions on every frame (INIT → BUILD_SIFT → INSPECT → LEFT_COMPARE →
  RIGHT_COMPARE → SWAP_DECISION → SIFT_SWAP → SIFT_CONTINUE → HEAP_READY →
  EXTRACT_SWAP → LOCK_SUFFIX → DONE), 95 frames on the default input with
  WHAT/WHY/NEXT on all of them, 2 checkpoints (first left-child compare with a
  dynamic correct index + first extraction target), 4 real milestones + auto
  Start (Max-Heap Ready, First Extraction, Half the Array Sorted, Complete —
  no per-node/per-extraction noise), five 21-line snippets with the same
  statement per line and exact code-line mapping (mapBad 78/475 → 0), honest
  input normalisation, sift-decision tested on both outcomes. 6 regression
  tests added (671 total).
- **bubble-sort ✅ (2026-11-18):** full rebuild — one operation per frame
  (INIT → PASS_START → SWAPPED_FLAG → SCAN_START → COMPARE → SWAP → PASS_END →
  EARLY_EXIT → DONE), 58 frames on the default input with WHAT/WHY/NEXT on all
  of them, 2 checkpoints (first compare with a dynamic correct index + first
  pass result), 3 real milestones + auto Start (First Element Settled, Half the
  Array Settled, Complete — no per-pass noise), five 11-line snippets with the
  same statement per line and exact code-line mapping (mapBad 52/200 → 0),
  honest input normalisation, early-exit semantics regression-tested both ways
  (fires on sorted input, never on reversed). 6 regression tests added
  (665 total).
- **mergesort ✅ (2026-11-18):** full rebuild on top of the existing decomposition
  stage — one operation per frame (INIT → DIVIDE → CALL_LEFT/CALL_RIGHT →
  MERGE_CALL → TEMP_INIT → POINTER_I/POINTER_J → COMPARE → APPEND_LEFT/RIGHT →
  FRONT_EXHAUSTED → remainder appends → BUFFER_READY → COPY_BACK per slot →
  MERGED → DONE), 123 frames on the default input with WHAT/WHY/NEXT on all of
  them, 2 checkpoints (first compare with a dynamic correct index + first
  copy-back), 4 real milestones + auto Start (First Merge, Half the Array
  Merged, Top-Level Merge, Complete), five 18-line snippets with the same
  statement per line and exact code-line mapping (mapBad 361/435 → 0 — the
  worst drift in the repo, now clean), honest input normalisation, stability
  regression on the duplicates preset. 6 regression tests added (658 total).
- **quicksort ✅ (2026-11-18):** full rebuild — one operation per frame
  (INIT → ENTER_RANGE → CALL_PARTITION → PIVOT_SELECTED → PINDEX_INIT →
  SCAN_START → COMPARE → SWAP / NO_SWAP → ADVANCE_PINDEX → PIVOT_SWAP →
  PIVOT_SETTLED → PARTITION_RETURNED → CALL_LEFT → CALL_RIGHT → DONE),
  172 frames on the default input with WHAT/WHY/NEXT on all of them, 2
  checkpoints (first compare + final pivot position, non-zero correct index),
  4 real milestones + auto Start (First Pivot Settled, Half the Array Settled,
  Final Pivot Settled, Complete — no per-partition noise), five 14-line
  snippets with the same statement per line and exact code-line mapping
  (mapBad 112/735 → 0), honest input normalisation, custom stage with
  range/pivot HUD, settled-pivot log and legend. Worst-case already-sorted
  preset documents the O(N²) split (4 partitions, 10 compares). 6 regression
  tests added (652 total).
- **insertion-sort ✅ (2026-11-17):** full rebuild — one operation per frame
  (INIT → PICK_KEY → SET_J → CHECK_GUARD → SHIFT → DECREMENT_J → INSERT_KEY →
  NEXT_ITERATION → DONE), WHAT/WHY/NEXT on all 70 frames, 2 checkpoints
  (first guard evaluation + first insertion position, non-zero correct index),
  4 real milestones + auto Start, five 10-line snippets with the same statement
  per line and exact code-line mapping (mapBad 131/325 → 0 on every input),
  honest input normalisation (empty = valid 2-frame run, non-numeric dropped,
  values clamped ±999, >12 truncated — all reported in INIT), custom stage with
  key chip, insertion log and legend. 6 regression tests added (646 total).

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
   edit-distance ✅, knapsack-01 ✅, lis ✅, unbounded-knapsack ✅, subset-sum ✅,
   matrix-chain ✅.
8. **DP2 — grid/sequence DP + backtracking:** house-robber ✅, unique-paths ✅,
   climbing-stairs ✅, kadanes-algorithm ✅, n-queens, sudoku, word-search, rat-in-maze.
9. **L1 — linked lists:** pointer-diagram stages for the remaining 8.
10. **ST1 — stack/queue internals:** capacity rings, push/pop frames, monotonic stack.
11. **H1 — hashing:** bucket chains, probe sequences, rehash waves.
12. **STR1 — string matching:** pattern sliding + failure links.
13. **M1 — math/geometry:** sieve grid, GCD table, Hanoi pegs, convex hull sweep.

Each batch lands with: module frames + stage + tests + audit-clean + docs update.
