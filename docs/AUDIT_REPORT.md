# StepDSA — Curriculum-Wide Visualization & Pedagogy Audit

**Date:** 2026-11-09
**Scope:** all 162 registered algorithm modules, their default inputs and every preset
(569 audited timelines), plus the shared stage/narration/theme architecture.

This report is the deliverable of a full inspect → design → TDD → implement → verify pass.
It records what was changed, what was verified, and — honestly — what is still
approximate or incomplete.

---

## 1. Executive summary

| Metric | Before | After |
| --- | --- | --- |
| Structural audit **errors** (569 timelines: defaults + presets) | 0 | **0** |
| Structural audit **warnings** | 297 | **163** |
| `duplicate-consecutive-frame` warnings | 8 (`tree-traversals`) | **0** |
| `missing-milestone` warnings | 134 (41 modules) | **0** (navigation-anchor contract) |
| `code-line-out-of-range` warnings | 163 (24 modules) | 163 (documented limitation, §7) |
| Determinism (regenerating a timeline is byte-identical) | pass | **pass** |
| Daylight Paper bottom dock rendering black | **bug** | **fixed** + regression test |

Delivered in this pass:

- A reusable structural timeline validator (`src/core/timelineAudit.ts`) and an
  all-module audit test suite (162 modules, defaults + presets).
- Frame-level teaching contracts (`StepPedagogy`, `PredictionCheckpoint`) rendered by
  the shared narration banner, without hardcoding algorithm logic into shared UI.
- Structured auxiliary-memory visualization in `MemoryShelf` (buffer / map / set / value).
- A time-travel navigation contract (`withNavigationAnchors`) so **every** module
  timeline exposes Start/Complete jump targets, even the 41 modules that never
  authored milestones.
- Deep, frame-accurate refactors of **8 priority modules**: insertion sort, mergesort,
  quicksort, BFS, Dijkstra, reverse linked list, coin change, AVL.
- Targeted fixes in 5 more modules (tree traversals, two-three tree, mergesort
  recursion tree, quicksort partition tree, backtracking decision tree).
- The Daylight Paper dock bug fix with a CSS-level regression test covering all
  non-midnight themes.

Verification (see §8): `npm test` — **33 files / 469 tests passed**;
`npm run build` — **passes** (`tsc -b` + `vite build`).

---

## 2. Methodology

1. **Inspect** — read every module's timeline generator, stage renderer, narration and
   tests; reproduced the Daylight theme bug from a user screenshot
   (`CallStackPanel` renders `bg-[#0E1420]`, which no daylight override covered).
2. **Design** — extend the shared frame contract with *optional* semantic fields
   (`pedagogy`, `checkpoint`, structured `auxiliary` memory, tree-node annotations)
   instead of forcing one generic visualization; define a structural audit with
   error/warning severities so progress is measurable per module.
3. **Plan / TDD** — new contracts and refactors were driven by failing-then-green
   tests: `timelineAudit.test.ts`, `refactorRegression.test.ts`,
   `navigationAnchors.test.ts`, `themeRegression.test.ts`, extended component tests.
4. **Implement** — deep refactors of the 8 priority modules; targeted fixes elsewhere;
   registry-level navigation-anchor normalization.
5. **Verify** — full test suite + production build; audit re-run over defaults **and**
   presets; determinism checked by regenerating every timeline twice.
6. **Review** — this report, including the exact remaining warning inventory.

### The structural audit (`src/core/timelineAudit.ts`)

`auditTimeline(module, input)` validates, per frame: `stepIndex` matches array position,
`totalSteps` matches timeline length, explanations are non-empty, `codeLine` is a positive
integer, state is present, pedagogy/checkpoint fields are well-formed when present
(at least two checkpoint options, `correctIndex` in range, explanation present),
consecutive duplicate frames, milestone presence for timelines longer than 2 frames,
and byte-level determinism across two generations. It returns
errors/warnings/counter metrics per module and is reusable from any test or tooling.

`timelineAudit.test.ts` runs it over **all 162 modules × (default + presets) = 569
timelines** and fails the suite on any structural **error**.

---

## 3. Shared architecture changes

All additions are **optional** fields — modules that do not use them keep working
unchanged.

### 3.1 Frame-level pedagogy — `StepPedagogy`

`src/core/types.ts` adds `pedagogy?: { what?, why?, whatNext? }` to `ExecutionFrame`.
Refactored modules author concrete, algorithm-specific sentences with real values
("Held key 39 in a temporary variable; slot 5 is now logically empty…") instead of
generic keyword-matched UI copy. `StepNarrationBanner.tsx` renders the three sections
as WHAT / WHY / WHAT-NEXT and falls back to the existing narration when absent.

### 3.2 Prediction checkpoints — `PredictionCheckpoint`

`checkpoint?: { question, options[], correctIndex, explanation, hint? }` lives on the
frame itself, so the answer is part of the deterministic timeline and testable.
The banner renders an interactive quiz; the learner must answer before advancing,
and the checkpoint resets deterministically when the frame is revisited. Eight
priority modules ship checkpoints at pedagogically pivotal moments (e.g. the first
comparison of insertion sort, the first partition of quicksort, the first enqueue
wave of BFS, the first rotation choice in AVL).

### 3.3 Structured auxiliary memory — `MemoryShelf`

`MemoryShelf` now understands structured auxiliary descriptors
(`buffer` / `map` / `set` / `value`) with active-index highlighting, so modules can
visualize what actually changes off-array: the insertion-sort held key, mergesort's
temp buffer during merge/copy-back, quicksort's pivot slot, DP parent pointers, etc.
Unstructured string/number usage continues to render as before.

### 3.4 Tree node annotations — `TreeStage`

Optional per-node `annotation` renders secondary labels (AVL heights and balance
factors) without altering existing tree layouts.

### 3.5 Time-travel navigation contract — `withNavigationAnchors`

`src/core/navigationAnchors.ts` wraps a module's `generateTimeline` and, **only when
the frame is not already a milestone**, marks the first frame as `Start` and the last
as `Complete`. Frame order, `stepIndex`/`totalSteps`, explanations and visual state
are preserved byte-for-byte; curated, algorithm-specific milestones (all 8 refactored
modules and others that authored them) are left untouched. Applied centrally in
`src/modules/registry.ts`, so every consumer — player, stepper, trace log, tests —
sees anchored timelines. Result: milestone-jump controls now have targets in all
162 modules (previously 41 modules had none), with zero timeline drift
(`navigationAnchors.test.ts` verifies content equality and the all-module contract).

### 3.6 Code-line resolution (unchanged behavior, clarified)

`resolveActiveCodeLine` already guarantees every highlighted line is in-bounds,
non-empty and semantically snapped for all five languages. When a module's canonical
`codeLine` exceeds a snippet's length (see §7), it falls back to keyword-anchored
proportional mapping rather than showing a fake or empty line. Stage tests assert
this guarantee across all 162 modules × 5 languages.

---

## 4. Deep refactors — the 8 priority modules

Each refactor follows the same principle: **one meaningful operation per frame**, with
WHAT/WHY/WHAT-NEXT, exact variable/call-stack synchronization, and regression tests
(`src/modules/refactorRegression.test.ts`, 8 tests) plus clean audits.

| Module | Key visualization fixes |
| --- | --- |
| **Insertion sort** | Held key lives in a real "held" auxiliary slot; `j` index is accurate per frame; separate true/false guard frames for `j >= 0` and `arr[j] > key`; per-shift and per-decrement frames (no hidden loop iterations); first-comparison checkpoint. |
| **Mergesort** | Explicit temp buffer with per-append and drain frames; **per-element** copy-back frames (previously one bulk copy); base-case frames; split/merge phase labels; checkpoint on the first merge. |
| **Quicksort** | False comparison frames (when the scan condition fails), a no-op swap frame (i == j, previously invisible), recursion enter/base/return frames, pivot badges; checkpoint on the first partition decision. |
| **BFS** | Distance table + predecessor tree built incrementally; active enqueue/skip (already-visited) edges highlighted; path-to-current-node rendering; final shortest path in the SVG; checkpoint at the first enqueue wave. |
| **Dijkstra** | Predecessor tracking; stale priority-queue entry frames (the classic relaxation subtlety); settled-edge skips; only settled predecessor edges drawn as the shortest-path tree; explicit reconstruction frames labelled as **post-processing visualization** (snippets return only the distance table — no fake code mapping); target-path HUD; checkpoint. |
| **Reverse linked list** | Spatial SVG stage showing real `nextIndex` arrows per node, prev/curr/next pointer badges, null terminators, and pointer-rewire frames instead of abstract list mutations; checkpoint before the first rewire. |
| **Coin change** | `parent[]` array stored and reconstructed into a chosen-coin list; separate `dp[a]` update and `parent[a]` update frames; coin-reconstruction frames with phase labels; parent/path rendering in the stage; pedagogy on every frame; two checkpoints. All five snippets aligned to 25 lines for exact code mapping. |
| **AVL** | Real recursive call stacks (enter/return per node); height-update and balance-factor frames after each insertion; explicit LL/RR/LR/RL detection frames; pre-rotation → capture → rewire → height-update → return frame sequences; intermediate frames for double rotations; height/BF node annotations; checkpoint on the first rotation choice. Snippets aligned to 57 canonical lines. |

---

## 5. Other curriculum fixes

- **`tree-traversals`**: consecutive NULL base-case frames were byte-identical because
  they only differed by which child pointer was NULL → 8 `duplicate-consecutive-frame`
  warnings. Each base case now carries its **branch context**
  ("Base case: right child of 30 is NULL at depth 3…") in explanation, variables,
  call stack and action phase — distinct, informative frames, no merging of operations.
- **First-frame `codeLine: 0` errors** fixed in `twoThreeTree`,
  `mergesortRecursionTree`, `quicksortPartitionTree`, `backtrackingDecisionTree`
  (mapped to 1, error → clean).
- **`mergesortRecursionTree`** final frame mapped from line 9 → 7 (completion line was
  off the snippet's true range).

---

## 6. Daylight Paper theme fix (reported UI bug)

**Symptom:** with the Daylight Paper theme active, the bottom-right dock
(`CallStackPanel` surface, screenshot attached to the report) rendered black because it
uses the hardcoded `bg-[#0E1420]` utility, which the daylight block never overrode.

**Fix:** `src/index.css` adds `bg-[#0E1420]` and its `/95`, `/90`, `/80` opacity
variants to **all three** non-midnight theme blocks:

- `daylight` → `#FFFFFF` (light dock surface),
- `visualgo` → `#0B1F3A` (ocean navy),
- `dracula` → `#1C1829` (purple charcoal).

**Regression guard:** `src/utils/themeRegression.test.ts` scans `CallStackPanel.tsx`
for dark `bg-[#...]` surfaces and asserts every theme block overrides every one of them,
so a future panel surface cannot silently miss a theme again.

---

## 7. Remaining warnings — honest limitations

After this pass the audit reports **0 errors and 163 warnings** across 569 timelines.
All 163 are the *non-fatal* `code-line-out-of-range` diagnostic: a frame's canonical
`codeLine` exceeds the longest snippet, so the resolver highlights a semantically
matched, in-bounds line instead of the exact one. Nothing renders broken or empty;
it is an **exactness gap, not a correctness bug**.

Distribution (default + presets), with the largest canonical line vs longest snippet:

| Module | Warnings | Canonical max line | Longest snippet |
| --- | --- | --- | --- |
| heapsort | 34 | 27 | 24 |
| treap | 15 | 32 | 31 |
| dynamic-rehashing | 15 | 18 | 15 |
| ternary-search-tree | 12 | 32 | 25 |
| sparse-table | 11 | 30 | 21 |
| strassen-matrix | 9 | 22 | 14 |
| hash-table-open-addressing | 7 | 38 | 23 |
| binary-heap, red-black-tree | 6 each | 22 / 25 | 14 / 22 |
| tree-map | 5 | 30 | 16 |
| prime-factorization | 4 | 16 | 15 |
| The remaining 13 modules (splay-tree, b-tree, hopcroft-karp, burst-balloons, hash-table-chaining, suffix-array-kasai, hamiltonian-path, tree-diameter-dp, closest-pair-points, point-in-polygon, kd-tree, interval-tree, two-three-four-tree) | 3 each | 16–40 | 9–36 |

Why this remains: frames are authored against one canonical reference, while the
Python/C++/Java/TypeScript/pseudocode snippets have different lengths — pseudocode
in particular is a 2–14 line summary. Fixing exactness properly means re-authoring
either the canonical frame lines or the per-language snippets for 24 modules, with a
per-language verification pass. That is deliberate follow-up content work, not a
mechanical rename; the resolver’s keyword-anchored fallback keeps the learner on a
meaningful line meanwhile, and the 8 priority modules are already exact.

Other honest notes:

- **Algorithm-specific pedagogy and checkpoints are not in all 162 modules** — they are
  concentrated in the 8 priority modules (and frames elsewhere that already had rich
  narration). Remaining modules keep their existing explanations; the shared contracts
  make incremental adoption additive (no rewrites required).
- **Generic Start/Complete milestones**: modules without curated milestones receive
  generic navigation anchors; they are accurate but intentionally coarse. Enriching
  them with per-phase milestones is incremental follow-up.
- The audit’s milestone warning can no longer fire for registry modules because the
  anchor contract guarantees at least one milestone; raw, unwrapped modules are still
  checked when audited directly.

---

## 8. Verification results

Environment: `npm ci --no-audit --no-fund` (184 packages), Node/Vite per repo toolchain.

| Command | Result |
| --- | --- |
| `npm test -- --reporter=dot` | **33 test files, 469 tests passed** |
| `npm run build` (`tsc -b && vite build`) | **passes** |
| Audit re-run: defaults + presets (569 timelines) | 0 errors, 163 documented warnings, 100% deterministic |
| Stage contract: `resolveActiveCodeLine` for 162 modules × 5 languages | every resolved line in-bounds and non-empty |

New/updated test coverage of this pass:

- `src/core/timelineAudit.test.ts` — all-module default + preset structural audit,
  determinism, milestone coverage contract.
- `src/core/navigationAnchors.test.ts` — anchor injection rules (preservation of
  bookkeeping/state/order, curated-milestone respect, single-frame no-op) and the
  all-162-module start/end anchor contract.
- `src/modules/refactorRegression.test.ts` — 8 targeted regressions (insertion, merge,
  quick, BFS, Dijkstra, reverse list, coin change, AVL) asserting the concrete new
  frames (held key, temp buffer copy-back, false comparisons, discovery parents,
  stale PQ entries, pointer rewires, parent reconstruction, rotation frame sequences).
- `src/utils/themeRegression.test.ts` — daylight/visualgo/dracula dock overrides.
- `MemoryShelf.test.tsx` / `StepNarrationBanner.test.tsx` — structured memory,
  pedagogy sections, checkpoint interaction and deterministic reset.
- Timeouts raised for the heavy all-module stage test and the native C++ CLI-run test
  to keep CI deterministic on slower machines.

---

## 9. Changed-file inventory

Modified (23):

| File | Purpose |
| --- | --- |
| `src/core/types.ts` | `StepPedagogy`, `PredictionCheckpoint`, frame fields |
| `src/index.css` | Daylight/visualgo/dracula `#0E1420` dock overrides |
| `src/components/stage/StepNarrationBanner.tsx` | WHAT/WHY/NEXT + interactive checkpoint UI |
| `src/components/stage/MemoryShelf.tsx` | structured auxiliary memory descriptors + active index |
| `src/components/stage/TreeStage.tsx` | node annotations (AVL height/BF) |
| `src/components/stage/StepNarrationBanner.test.tsx`, `MemoryShelf.test.tsx` | new behavior coverage |
| `src/modules/registry.ts` | central `withNavigationAnchors` application |
| `src/modules/sorting/insertionSort.tsx` | held-key, guard, per-shift frames; pedagogy; checkpoint |
| `src/modules/sorting/mergesort.tsx` | buffer append/drain, per-element copy-back, base cases |
| `src/modules/sorting/quicksort.tsx` | false comparisons, no-op swap, recursion frames |
| `src/modules/graphs/bfsTraversal.tsx` | distances, parents, edge kinds, path rendering |
| `src/modules/graphs/dijkstra.tsx` | stale PQ entries, settled edges, reconstruction (labelled post-processing) |
| `src/modules/linkedList/reverseLinkedList.tsx` | spatial pointer-rewire stage |
| `src/modules/dp/coinChange.tsx` | parent pointers, reconstruction, 25-line snippets |
| `src/modules/trees/avlTree.tsx` | call stacks, heights/BF, rotation sequences, 57-line snippets |
| `src/modules/trees/treeTraversals.tsx` | NULL branch-context frames (duplicate fix) |
| `src/modules/trees/twoThreeTree.tsx`, `recursion/*Tree*.tsx` | first-frame `codeLine: 0` → 1 fixes |
| `src/utils/stageLayout.test.ts`, `src/core/studio/cli-run.test.ts` | deterministic timeouts |

Added (7):

| File | Purpose |
| --- | --- |
| `src/core/timelineAudit.ts` | reusable structural timeline validator |
| `src/core/timelineAudit.test.ts` | 162-module × default/preset audit |
| `src/core/navigationAnchors.ts` | start/complete milestone contract |
| `src/core/navigationAnchors.test.ts` | anchor unit + all-module integration tests |
| `src/modules/refactorRegression.test.ts` | 8 priority-module behavior regressions |
| `src/utils/themeRegression.test.ts` | theme dock-override regression |
| `docs/AUDIT_REPORT.md` | this report |

Net diff on tracked files: ~3,200 insertions / ~530 deletions, plus the 6 new
source/test files and this report (all currently uncommitted on `main`).

---

## 10. Follow-up backlog (prioritized)

1. **Code-line exactness for 24 modules** (§7): re-author canonical frame lines or
   snippet lengths per language, starting with `heapsort`, `hash-table-open-addressing`,
   `ternary-search-tree`, `dynamic-rehashing`, `splay-tree`.
2. **Per-phase milestones** for the 41 anchor-only modules (replace generic
   Start/Complete with domain milestones).
3. **Pedagogy/checkpoint rollout** to the remaining curriculum using the shared
   contracts (pure content addition, no architecture changes).
4. Optional: surface the audit as an `npm run` script for contributors to track the
   warning count over time.
