# Audit sweep — sorting & searching batches (2026-11-17)

Full sweep of every registered `sorting` / `searching` module (40 total) against the
standard the DP batch set: WHAT/WHY/NEXT pedagogy on every frame, real checkpoints,
structural audit 0/0 on default **and** every preset, five language snippets with the
**same line count and the same statement on each line**, and `resolveActiveCodeLine`
landing exactly on the authored line in all five languages.

Measured with a scripted sweep over `generateTimeline` for the default input plus
`auditTimeline` for every preset. Raw numbers, no sampling.

## Status after the flagship rebuilds (2026-11-19)

**19/40 modules fully meet the standard** (aligned snippets + exact code-line map
+ full pedagogy + 2 checkpoints + clean audit on every input): the five flagship
sorts — insertion-sort, quicksort, mergesort, bubble-sort, heapsort — plus
selection-sort, counting-sort, radix-sort, shellsort, cocktail-shaker-sort and
bucket-sort, and the three re-aligned searches —
binary-search, exponential-search, interpolation-search, plus the four
snippet-re-aligned linear-search, jump-search, ternary-search and
rotated-sorted-array.
The remaining 24 keep their tier classification below.

## Verdict by tier

### Tier A — fully up to standard (aligned snippets + exact code-line map)

| Module | Frames | Pedagogy | Checkpoint | mapBad |
|---|---|---|---|---|
| binary-search | 13 | 100% | 1 | 0/65 (after fix) |
| exponential-search | 14–18 | 100% | 1 | 0/70 (after fix) |
| interpolation-search | 5–17 | 100% | 1 | 0/85 (after fix) |
| linear-search | 11 | 100% | 1 | 0/55 |
| rotated-sorted-array | 12 | 100% | 1 | 0/60 |
| jump-search | 11 | 100% | 1 | 0/55 |
| ternary-search | 10 | 100% | 1 | 0/50 |

`binary-search`, `exponential-search` and `interpolation-search` were re-aligned in
this pass (see "Fixes applied"). The other four were already exact.

### Tier B — structurally clean, snippets not yet aligned (small drift)

Audit 0/0, full pedagogy, ≥1 checkpoint — but the five snippets have different line
counts, so the code panel maps proportionally instead of exactly. Worst residual
drift per module (mismatched frame×language pairs on the default input):

| Module | Frames | mapBad | Snippet lines (pseudo/py/ts/cpp/java) |
|---|---|---|---|
| timsort | 21 | 18/105 | 10/13/14/13/13 — pseudocode is a different algorithm shape |
| binary-search-answer | 11 | 9/55 | helper `hoursNeeded` sits at different lines per language |
| sleep-sort | 17 | 2/85 | virtual-tick model does not map 1:1 onto real threaded code |
| exponential (fixed), interpolation (fixed), binary-search (fixed) | — | — | moved to Tier A |

### Tier C — old-style modules that predate the DP standard

Still audit-clean where applicable, but missing pedagogy/checkpoints entirely and
with heavily drifted snippets. These need a full LIS-style rebuild, one per session:

| Module | Frames | Pedagogy | Checkpoint | mapBad | Note |
|---|---|---|---|---|---|
| introsort | 32 | 100% | 1 | 38/160 | |
| bogosort | 12 | 50% | 1 | 37/60 | |
| stooge-sort | 111 | 97% | 1 | 28/555 | |
| drop-sort | 14 | 100% | 1 | 24/70 | |
| backtracking-decision-tree | 64 | 0% | 0 | 164/320 | no pedagogy at all |
| mergesort-recursion-tree | 46 | 0% | 0 | 62/230 | superseded by `recursion-trees` |
| quicksort-partition-tree | 28 | 0% | 0 | 70/140 | no pedagogy at all |

String/hashing modules that were swept incidentally (they sit in the `searching`
category but belong to the STR1/H1 batches, not S1/S2): kmp-search, z-algorithm,
boyer-moore, naive-string-matching, rabin-karp, aho-corasick, manachers-algorithm,
suffix-array-kasai, suffix-automaton, hash-table-chaining, hash-table-open-addressing —
all Tier C (0% pedagogy, 0 checkpoints).

## Fixes applied in this pass

1. **binary-search** — cpp/java merged `if + body` onto one line and TS trailed with
   standalone braces; all five snippets rebuilt to a shared 12-line layout
   (statements match line-for-line), mapBad 4/65 → 0/65.
2. **exponential-search** — authored lines referenced a 13-line C++-shaped snippet
   while pseudocode had 13 lines in a different shape (the binary-search sub-procedure
   started at line 7 vs 9). All five snippets rebuilt to a shared 14-line layout, all
   frame `codeLine`s remapped (2→3, 4→5, 5→6, 6→8, 9→10, 10→11, 11→12, 12→13, 13→14),
   mapBad 78/270 → 0/270 across every preset including the found-at-index-0 path.
3. **interpolation-search** — python was 15 lines, TS 17, pseudocode 9 with the probe
   formula on different lines. All five rebuilt to a shared 10-line layout; frames
   remapped (3→4 invariant, 5→6 probe, 6→7 compare/found, 7→8 discard-left,
   8→9 discard-right, 9→10 not-found), mapBad 3/85 → 0/85.

## Remediation order for the rest

1. Flagship sorts first (highest visit rate, worst teaching impact): quicksort,
   mergesort, bubble-sort, heapsort — one per session, LIS-style
   (snippet layout chosen first, frames remapped, regression tests added).
   ~~insertion-sort~~ ✅ rebuilt 2026-11-17: per-operation frames, pedagogy on all
   70 frames, 2 checkpoints, 4 real milestones, five aligned 10-line snippets,
   mapBad 0 on every input, honest input normalisation, 6 regression tests.
   ~~quicksort~~ ✅ rebuilt 2026-11-18: per-operation frames (incl. SCAN_START and
   explicit CALL_LEFT/CALL_RIGHT), 172 frames with full pedagogy, 2 checkpoints,
   4 real milestones, five aligned 14-line snippets, mapBad 0 on every input,
   honest input normalisation, 6 regression tests.
   ~~mergesort~~ ✅ rebuilt 2026-11-18: per-operation frames around the existing
   decomposition stage, 123 frames with full pedagogy, 2 checkpoints, 4 real
   milestones, five aligned 18-line snippets, mapBad 0 on every input, honest
   input normalisation, stability check on duplicates, 6 regression tests.
   ~~bubble-sort~~ ✅ rebuilt 2026-11-18: per-operation frames incl. explicit
   PASS_START/SWAPPED_FLAG/SCAN_START, 58 frames with full pedagogy, 2
   checkpoints, 3 real milestones + Start, five aligned 11-line snippets,
   mapBad 0 on every input, honest input normalisation, early-exit tested both
   ways, 6 regression tests.
   ~~heapsort~~ ✅ rebuilt 2026-11-18: named per-operation frames around the
   existing heap stage, 95 frames with full pedagogy, 2 checkpoints, 4 real
   milestones + Start, five aligned 21-line snippets, mapBad 0 on every input,
   honest input normalisation, sift decisions tested both ways, 6 regression
   tests.
   ~~selection-sort~~ ✅ rebuilt 2026-11-19: per-operation frames incl. explicit
   SCAN_START and SWAP/NO_SWAP guard outcomes, 53 frames with full pedagogy,
   2 checkpoints, 3 real milestones + Start, five aligned 10-line snippets,
   mapBad 0 on every input, honest input normalisation, write-minimality
   tested, 6 regression tests.
   ~~counting-sort~~ ✅ rebuilt 2026-11-19: per-operation frames around the
   existing three-panel stage, 26 frames with full pedagogy, 2 checkpoints,
   3 real milestones + Start, five aligned 14-line snippets, mapBad 0 on every
   input, honest key-domain normalisation (negatives dropped, clamp 99),
   stability tested, 6 regression tests.
   ~~radix-sort~~ ✅ rebuilt 2026-11-19: per-operation frames around the existing
   bucket-grid stage, 46 frames with full pedagogy, 2 checkpoints, 4 real
   milestones + Start, five aligned 13-line snippets, mapBad 0 on every input,
   honest key-domain normalisation (negatives dropped, clamp 9999),
   per-digit-pass invariant tested, 6 regression tests.
   ~~shellsort~~ ✅ rebuilt 2026-11-19: named per-operation frames with the key
   shelf and chain visuals, 125 frames with full pedagogy, 2 checkpoints,
   4 real milestones + Start, five aligned 13-line snippets, mapBad 0 on every
   input, honest input normalisation, pickups/guards accounted, 6 regression
   tests.
   ~~cocktail-shaker-sort~~ ✅ rebuilt 2026-11-19: named per-operation frames for
   both sweep directions, 39 frames with full pedagogy, 2 checkpoints,
   4 real milestones + Start, five aligned 20-line snippets, mapBad 0 on every
   input, honest input normalisation, turtle rescue covered, 6 regression
   tests.
   ~~bucket-sort~~ ✅ rebuilt 2026-11-19: named per-operation frames around the
   existing bucket stage, 26 frames with full pedagogy, 2 checkpoints,
   3 real milestones + Start, five aligned 14-line snippets, mapBad 0 on every
   input, honest input normalisation, gather monotonicity tested, 6 regression
   tests.
   ~~quickselect~~ ✅ rebuilt 2026-11-19: named per-operation frames for the rank
   search, 14 frames with full pedagogy on the default input, 2 checkpoints,
   3 real milestones + Start, five aligned 20-line snippets, mapBad 0 on every
   input, honest {array, k} normalisation (k clamped / median fallback),
   prune-only-the-impossible-side tested, 6 regression tests.
   ~~introsort~~ ✅ rebuilt 2026-11-19: named per-operation frames for all three
   engines, 38 frames with full pedagogy, 2 checkpoints, 3 real milestones +
   Start, five aligned 11-line snippets, mapBad 0 on every input, honest input
   normalisation, fallback/no-fallback/pure-insertion behaviour tested,
   6 regression tests.
   ~~timsort~~ ✅ rebuilt 2026-11-19: named per-operation frames for run
   discovery/extension/merging, 21 frames with full pedagogy, 2 checkpoints,
   4 real milestones + Start, five aligned 11-line snippets, mapBad 0 on every
   input, honest input normalisation, best-case O(N) behaviour tested,
   6 regression tests.
   ~~drop-sort~~ ✅ rebuilt 2026-11-20: named per-operation frames for the
   keep-or-drop scan, 14 frames with full pedagogy, 1 checkpoint, 2 real
   milestones + Start, five aligned 6-line snippets, mapBad 0 on every input,
   honest input normalisation, loss accounting tested, 6 regression tests.
2. Then the remaining S1 sorts: selection, counting, radix, shellsort, cocktail,
   bucket, introsort, quickselect, timsort, stooge, bogosort, drop-sort, sleep-sort.
3. `backtracking-decision-tree` / `mergesort-recursion-tree` /
   `quicksort-partition-tree`: decide whether the recursion-tree hub
   (`recursion-trees`, already rebuilt) supersedes them; if so they still need
   pedagogy + aligned snippets, not a rebuild.
4. String/hashing modules are the STR1/H1 batches and keep their existing plan.

Every Tier B/C fix must land with regression tests asserting the exact line map in
all five languages (see the LIS/knapsack tests for the pattern), plus
`npm run build` — vitest does not catch TS errors in snippet strings.
