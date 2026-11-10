import { describe, it, expect } from 'vitest';
import { getModuleById } from './registry';
import { auditTimeline } from '../core/timelineAudit';

function moduleById(id: string) {
  const mod = getModuleById(id);
  expect(mod, `module ${id} is not registered`).toBeDefined();
  return mod!;
}

function arrayValues(frame: any): number[] {
  return (frame.state?.array ?? []).map((item: any) =>
    typeof item === 'number' ? item : item.value
  );
}

function expectSorted(values: number[]) {
  for (let i = 1; i < values.length; i++) {
    expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
  }
}

describe('pedagogical timeline regressions', () => {
  it('insertion sort keeps the held key visible through every shift and exposes the false guard', () => {
    const mod = moduleById('insertion-sort');
    const input = [35, 12, 48, 20, 9, 31, 15];
    const timeline = mod.generateTimeline(input);

    const heldKeys = timeline.filter((frame) => frame.state.auxiliary?.type === 'value');
    expect(heldKeys.length).toBeGreaterThan(0);
    expect(heldKeys[0].state.auxiliary.name).toBe('key');

    const shiftFrames = timeline.filter((frame) => frame.codeLine === 7);
    expect(shiftFrames.length).toBeGreaterThan(0);
    expect(shiftFrames[0].state.auxiliary.data).toBe(12);
    expect(shiftFrames[0].variables?.shiftedValue).toBe(35);

    expect(
      timeline.some((frame) => frame.codeLine === 6 && frame.conditionEval?.result === false)
    ).toBe(true);
    expect(
      timeline.some((frame) => frame.checkpoint?.id === 'insertion-sort-first-compare')
    ).toBe(true);

    expectSorted(arrayValues(timeline[timeline.length - 1]));
    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('mergesort shows the temp buffer, active append index, and one copy-back frame per element', () => {
    const mod = moduleById('mergesort');
    const input = [38, 27, 43, 3, 9, 82, 10];
    const timeline = mod.generateTimeline(input);

    const bufferFrames = timeline.filter((frame) => frame.state.auxiliary?.type === 'buffer');
    expect(bufferFrames.length).toBeGreaterThan(0);
    expect(
      bufferFrames.some((frame) => typeof frame.state.auxiliary.activeIndex === 'number')
    ).toBe(true);

    const copyFrames = timeline.filter((frame) =>
      frame.explanation.startsWith('Copied temp[')
    );
    expect(copyFrames.length).toBeGreaterThan(0);
    expect(copyFrames.every((frame) => typeof frame.variables?.tempIndex === 'number')).toBe(true);

    expect(timeline.some((frame) => frame.checkpoint?.id === 'mergesort-first-compare')).toBe(true);

    // ── Divide/merge decomposition view (split-apart → rejoin) ──────────────
    for (const frame of timeline) {
      expect(frame.state.mergeView, 'every mergesort frame carries a mergeView').toBeTruthy();
    }

    // Every depth row stays a non-overlapping, in-bounds partition of the array.
    for (const frame of timeline) {
      const byDepth = new Map<number, any[]>();
      for (const node of frame.state.mergeView.nodes) {
        if (!byDepth.has(node.depth)) byDepth.set(node.depth, []);
        byDepth.get(node.depth)!.push(node);
      }
      for (const nodes of byDepth.values()) {
        const sortedNodes = [...nodes].sort((a, b) => a.left - b.left);
        for (let index = 1; index < sortedNodes.length; index++) {
          expect(sortedNodes[index].left).toBeGreaterThan(sortedNodes[index - 1].right);
        }
        for (const node of sortedNodes) {
          expect(node.left).toBeGreaterThanOrEqual(0);
          expect(node.right).toBeLessThan(input.length);
          expect(node.right).toBeGreaterThanOrEqual(node.left);
        }
      }
    }

    // A divide frame shows the splitting parent plus its two contiguous children.
    const divideFrame = timeline.find(
      (frame) => frame.state.mergeView.statusKind === 'divide'
    )!;
    const splitNode = divideFrame.state.mergeView.nodes.find(
      (node: any) => node.phase === 'splitting'
    );
    expect(splitNode).toBeTruthy();
    const spawnedChildren = divideFrame.state.mergeView.nodes
      .filter(
        (node: any) =>
          node.depth === splitNode.depth + 1 &&
          node.left >= splitNode.left &&
          node.right <= splitNode.right
      )
      .sort((a: any, b: any) => a.left - b.left);
    expect(spawnedChildren).toHaveLength(2);
    expect(spawnedChildren[0].left).toBe(splitNode.left);
    expect(spawnedChildren[0].right + 1).toBe(spawnedChildren[1].left);
    expect(spawnedChildren[1].right).toBe(splitNode.right);

    // Merge phases occur, and copy-back cursors carry an explicit destination index.
    const phases = new Set<string>(
      timeline.flatMap((frame) =>
        frame.state.mergeView.nodes.map((node: any) => node.phase)
      )
    );
    for (const phase of ['base', 'left', 'right', 'merging', 'sorted', 'consumed']) {
      expect(phases.has(phase), `mergeView must use the ${phase} phase`).toBe(true);
    }
    expect(
      timeline.some(
        (frame) =>
          frame.state.mergeView.merge?.phase === 'copy' &&
          typeof frame.state.mergeView.merge.copyTo === 'number'
      )
    ).toBe(true);

    // The final frame collapses back to one sorted root; everything else is consumed.
    const finalView = timeline[timeline.length - 1].state.mergeView;
    const root = finalView.nodes.find(
      (node: any) => node.left === 0 && node.right === input.length - 1
    );
    expect(root?.phase).toBe('sorted');
    expect(finalView.statusKind).toBe('done');
    expect(finalView.nodes.filter((node: any) => node.phase === 'consumed')).toHaveLength(
      finalView.nodes.length - 1
    );

    expectSorted(arrayValues(timeline[timeline.length - 1]));
    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('cocktail shaker visualizes both sweep directions, early exit, and turtle rescue', () => {
    const mod = moduleById('cocktail-shaker-sort');

    // Sorted input: the forward sweep makes no swaps -> explicit early-exit frame.
    const sortedTimeline = mod.generateTimeline([1, 2, 3, 4, 5]);
    expect(
      sortedTimeline.some(
        (frame) => frame.codeLine === 13 && frame.conditionEval?.result === true
      )
    ).toBe(true);
    expect(sortedTimeline.some((frame) => frame.explanation.includes('stops early'))).toBe(true);

    // Turtle preset: the backward sweep runs and drags the trailing 1 left.
    const turtle = mod.generateTimeline([2, 3, 4, 5, 6, 7, 8, 9, 1]);
    expect(turtle.some((frame) => frame.variables?.direction === 'BACKWARD')).toBe(true);
    expect(
      turtle.some((frame) => frame.explanation.includes('Turtle element dragged to left'))
    ).toBe(true);

    expect(
      mod
        .generateTimeline(mod.defaultInput)
        .some((frame) => frame.checkpoint?.id === 'cocktail-first-forward-compare')
    ).toBe(true);

    expectSorted(arrayValues(sortedTimeline[sortedTimeline.length - 1]));
    expectSorted(arrayValues(turtle[turtle.length - 1]));
    expect(auditTimeline(mod, [5, 1, 4, 2, 8, 0, 2]).errorCount).toBe(0);
  });

  it('novelty sorts carry pedagogy, checkpoints, and honest simulation rails', () => {
    // Stooge: base-case frame + third-branch checkpoint.
    const stooge = moduleById('stooge-sort');
    const stoogeTimeline = stooge.generateTimeline([5, 2, 4, 1, 3]);
    expect(
      stoogeTimeline.some((frame) => frame.codeLine === 3 && frame.conditionEval?.result === false)
    ).toBe(true);
    expect(stoogeTimeline.some((frame) => frame.checkpoint?.id === 'stooge-third-branch')).toBe(
      true
    );
    expectSorted(arrayValues(stoogeTimeline[stoogeTimeline.length - 1]));
    expect(auditTimeline(stooge, [5, 2, 4, 1, 3]).errorCount).toBe(0);

    // Bogo: natural success path AND the honestly-labelled forced rail
    // ([3,4,2,1] is never hit by the deterministic PRNG within 24 attempts).
    const bogo = moduleById('bogosort');
    const bogoNatural = bogo.generateTimeline([4, 1, 3, 2]);
    expect(bogoNatural.some((frame) => frame.milestoneTitle?.startsWith('Sorted in'))).toBe(true);
    expect(bogoNatural.some((frame) => frame.explanation.includes('rejected'))).toBe(true);
    expect(
      bogoNatural.some((frame) => frame.checkpoint?.id === 'bogosort-shuffle-independence')
    ).toBe(true);

    const bogoForced = bogo.generateTimeline([3, 4, 2, 1]);
    expect(bogoForced.some((frame) => frame.variables?.status?.includes('safety rail'))).toBe(true);
    expect(bogoForced.some((frame) => frame.milestoneTitle?.includes('Forced'))).toBe(true);
    expect(auditTimeline(bogo, [4, 1, 3, 2]).errorCount).toBe(0);

    // Drop sort: guard conditionEval + survival checkpoint; output loses data.
    const drop = moduleById('drop-sort');
    const dropTimeline = drop.generateTimeline([3, 1, 4, 2, 5, 3, 6]);
    expect(
      dropTimeline.some((frame) => frame.codeLine === 4 && frame.conditionEval !== undefined)
    ).toBe(true);
    expect(dropTimeline.some((frame) => frame.checkpoint?.id === 'dropsort-survival')).toBe(true);
    const dropFinal = dropTimeline[dropTimeline.length - 1];
    expect(dropFinal.state.array.length).toBeLessThan(7);
    expect(auditTimeline(drop, [3, 1, 4, 2, 5, 3, 6]).errorCount).toBe(0);

    // Sleep sort: wake-order checkpoint + sorted output.
    const sleep = moduleById('sleep-sort');
    const sleepTimeline = sleep.generateTimeline([3, 1, 4, 2, 5]);
    expect(sleepTimeline.some((frame) => frame.checkpoint?.id === 'sleepsort-wake-order')).toBe(
      true
    );
    expectSorted(arrayValues(sleepTimeline[sleepTimeline.length - 1]));
    expect(auditTimeline(sleep, [3, 1, 4, 2, 5]).errorCount).toBe(0);
  });

  it('introsort dispatches engines correctly and the heapsort fallback really fires', () => {
    const mod = moduleById('introsort');

    // Default shuffle: quicksort partitions + insertion leaves, NO fallback.
    const standard = mod.generateTimeline([24, 9, 29, 14, 19, 27, 4, 30]);
    expect(standard.some((frame) => frame.variables?.engine === 'INSERTION_SORT')).toBe(true);
    expect(standard.some((frame) => frame.variables?.engine === 'HEAPSORT_FALLBACK')).toBe(false);
    expect(standard.some((frame) => frame.checkpoint?.id === 'introsort-engine-dispatch')).toBe(
      true
    );

    // Adversarial sorted input: the scaled depth budget really exhausts,
    // so the flagship fallback milestone must actually occur.
    const adversarial = mod.generateTimeline([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(
      adversarial.some((frame) => frame.milestoneTitle === 'Heapsort Fallback Triggered')
    ).toBe(true);
    expect(adversarial.some((frame) => frame.variables?.engine === 'HEAPSORT_SIFT')).toBe(true);
    expect(adversarial.some((frame) => frame.variables?.engine === 'HEAPSORT_EXTRACT')).toBe(true);

    // Tiny array: pure insertion-sort path with an explicit completion frame.
    const tiny = mod.generateTimeline([8, 3, 5, 1, 9]);
    expect(tiny.some((frame) => frame.variables?.engine === 'INSERTION_SORT')).toBe(true);
    expect(tiny.some((frame) => frame.variables?.engine === 'HEAPSORT_FALLBACK')).toBe(false);
    expect(
      tiny.some((frame) => frame.explanation.includes('Insertion Sort finished'))
    ).toBe(true);

    for (const timeline of [standard, adversarial, tiny]) {
      expectSorted(arrayValues(timeline[timeline.length - 1]));
    }
    expect(auditTimeline(mod, [24, 9, 29, 14, 19, 27, 4, 30]).errorCount).toBe(0);
  });

  it('timsort exposes natural-run scanning, extension, and per-step merging', () => {
    const mod = moduleById('timsort');
    const input = [1, 2, 8, 7, 6, 3, 4, 9];
    const timeline = mod.generateTimeline(input);

    // Run discovery + descending-run reversal frames exist.
    expect(timeline.some((frame) => frame.codeLine === 3)).toBe(true);
    expect(
      timeline.some((frame) => frame.explanation.includes('Reversed strictly descending'))
    ).toBe(true);

    // minRun extension guard frame is explicit.
    expect(
      timeline.some((frame) => frame.codeLine === 5 && frame.conditionEval?.result === true)
    ).toBe(true);

    // Merge phase compares step by step, in BOTH outcomes, with a checkpoint.
    const compares = timeline.filter(
      (frame) => frame.codeLine === 8 && frame.conditionEval !== undefined
    );
    expect(compares.length).toBeGreaterThan(0);
    expect(compares.some((frame) => frame.conditionEval?.result === true)).toBe(true);
    expect(compares.some((frame) => frame.conditionEval?.result === false)).toBe(true);
    expect(timeline.some((frame) => frame.checkpoint?.id === 'timsort-first-merge-compare')).toBe(
      true
    );

    // Best case: one natural run covers everything — no merge comparisons at all.
    const best = mod.generateTimeline([1, 2, 3, 4, 5, 6]);
    expect(best.some((frame) => frame.explanation.includes('Merge compare'))).toBe(false);

    expectSorted(arrayValues(timeline[timeline.length - 1]));
    expectSorted(arrayValues(best[best.length - 1]));
    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('quickselect visualizes the rank decision, no-op swaps, and one-sided pruning', () => {
    const mod = moduleById('quickselect');
    const input = { array: [7, 10, 4, 3, 20, 15, 8], k: 3 };
    const timeline = mod.generateTimeline(input);

    // Window-entry + pivot frames exist for every iteration.
    expect(timeline.some((frame) => frame.codeLine === 13)).toBe(true);
    expect(
      timeline.some((frame) => frame.codeLine === 3 && frame.milestoneTitle?.includes('Pivot'))
    ).toBe(true);

    // Both outcomes of the partition comparison are visible.
    const compares = timeline.filter((frame) => frame.codeLine === 6);
    expect(compares.some((frame) => frame.conditionEval?.result === true)).toBe(true);
    expect(compares.some((frame) => frame.conditionEval?.result === false)).toBe(true);

    // The no-op swap branch (i === j) is explicit instead of hidden.
    expect(
      timeline.some((frame) => frame.codeLine === 7 && frame.conditionEval?.result === false)
    ).toBe(true);

    // The rank-decision checkpoint fires on the first pivot placement.
    expect(timeline.some((frame) => frame.checkpoint?.id === 'quickselect-rank-decision')).toBe(
      true
    );

    // Pruning frames appear when the target rank lies on one side (preset: k = 0).
    const smallest = mod.generateTimeline({ array: [25, 12, 48, 6, 33, 19], k: 0 });
    expect(smallest.some((frame) => frame.codeLine === 20)).toBe(true);

    const found = timeline[timeline.length - 1];
    expect(found.explanation).toContain('Rank match found');
    expect(found.state.array[3].value).toBe(8);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('shellsort exposes held-key chains with both guard outcomes and per-shift frames', () => {
    const mod = moduleById('shellsort');
    const input = [62, 83, 18, 53, 7, 17, 95, 22, 47, 34];
    const timeline = mod.generateTimeline(input);

    // The held key lives in the auxiliary slot during the inner scan.
    const heldKeys = timeline.filter((frame) => frame.state.auxiliary?.type === 'value');
    expect(heldKeys.length).toBeGreaterThan(0);
    expect(heldKeys[0].state.auxiliary.name).toBe('temp');

    // Guard frames at line 8 show BOTH outcomes (shift-needed and fits-here).
    const guardFrames = timeline.filter((frame) => frame.codeLine === 8);
    expect(guardFrames.length).toBeGreaterThan(0);
    expect(guardFrames.some((frame) => frame.conditionEval?.result === true)).toBe(true);
    expect(guardFrames.some((frame) => frame.conditionEval?.result === false)).toBe(true);

    // Shift frames carry the moved value; decrement frames exist per shift.
    const shiftFrames = timeline.filter((frame) => frame.codeLine === 9);
    expect(shiftFrames.length).toBeGreaterThan(0);
    expect(shiftFrames.every((frame) => typeof frame.variables?.shiftedVal === 'number')).toBe(
      true
    );
    expect(timeline.some((frame) => frame.codeLine === 10)).toBe(true);
    expect(
      timeline.some((frame) => frame.checkpoint?.id === 'shellsort-first-guard')
    ).toBe(true);

    expectSorted(arrayValues(timeline[timeline.length - 1]));
    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('counting sort visualizes frequency tallies, prefix sums, and duplicate placement slots', () => {
    const mod = moduleById('counting-sort');
    const input = [4, 2, 2, 8, 3, 3, 1];
    const timeline = mod.generateTimeline(input);

    // Frequency pass records real before/after tallies (the duplicate 2 reaches 2).
    expect(
      timeline.some((frame) => frame.codeLine === 8 && frame.scopeVariables?.updatedFreq === 2)
    ).toBe(true);

    // Prefix sums turn frequencies into cumulative "last free slot" pointers.
    const prefixFrames = timeline.filter((frame) => frame.codeLine === 11);
    expect(prefixFrames.length).toBe(8); // keys 1..8
    const finalCount = prefixFrames[prefixFrames.length - 1].state.count as number[];
    expect(Math.max(...finalCount)).toBe(input.length);

    // One placement frame per element; duplicates shrink their block right-to-left.
    const placedFrames = timeline.filter((frame) => frame.codeLine === 16);
    expect(placedFrames.length).toBe(input.length);
    expect(
      timeline.some((frame) => frame.checkpoint?.id === 'counting-sort-duplicate-slot')
    ).toBe(true);

    const final = timeline[timeline.length - 1];
    expect(final.state.output).toEqual([1, 2, 2, 3, 3, 4, 8]);
    expect(final.state.phase).toBe('done');

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('bucket sort visualizes scatter routing, per-bucket sorting, and ordered gather', () => {
    const mod = moduleById('bucket-sort');
    const input = [29, 25, 3, 49, 9, 37, 21, 43];
    const timeline = mod.generateTimeline(input);

    // Every frame carries the bucket view.
    for (const frame of timeline) {
      expect(frame.state.bucketView).toBeTruthy();
    }

    // Scatter routes by value range: one frame per element.
    const scatterFrames = timeline.filter((frame) =>
      frame.state.bucketView.statusLabel?.startsWith('SCATTER ')
    );
    expect(scatterFrames.length).toBe(input.length);
    expect(scatterFrames.some((frame) => frame.state.bucketView.buckets[0].includes(3))).toBe(true);
    expect(scatterFrames[input.length - 1].state.bucketView.buckets[4]).toContain(49);

    // Per-bucket sorting is explicit, including the sorted snapshot per bucket.
    expect(
      timeline.some((frame) => frame.state.bucketView.statusLabel?.startsWith('SORT '))
    ).toBe(true);
    expect(
      timeline.filter((frame) => frame.state.bucketView.statusLabel?.includes('SORTED')).length
    ).toBeGreaterThan(0);

    // Gather drains ascending buckets, one element per frame.
    const gatherFrames = timeline.filter((frame) =>
      frame.state.bucketView.statusLabel?.startsWith('GATHER')
    );
    expect(gatherFrames.length).toBe(input.length);
    expect(
      timeline.some((frame) => frame.checkpoint?.id === 'bucket-sort-range-invariant')
    ).toBe(true);

    const finalArray = timeline[timeline.length - 1].state.array.map((el: any) => el.value);
    expect(finalArray).toEqual([3, 9, 21, 25, 29, 37, 43, 49]);
    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('radix sort drains buckets one at a time in ascending order', () => {
    const mod = moduleById('radix-sort');
    const input = [170, 45, 75, 90, 802, 24, 2, 66];
    const timeline = mod.generateTimeline(input);

    // Routing frames expose the extracted digit (the 1s pass routes 170 via digit 0).
    expect(
      timeline.some((frame) => frame.codeLine === 8 && frame.scopeVariables?.digit === 0)
    ).toBe(true);

    // Collect phase: one drain frame per non-empty bucket — never one bulk jump.
    const drainFrames = timeline.filter((frame) => frame.state.collectBucket !== null);
    expect(drainFrames.length).toBeGreaterThan(8);
    expect(
      timeline.some(
        (frame) =>
          frame.codeLine === 10 &&
          frame.scopeVariables?.bucket === 0 &&
          frame.state.array.length > 0
      )
    ).toBe(true);

    // A drained bucket is genuinely empty — items are never shown twice.
    const firstDrain = drainFrames[0];
    expect(firstDrain.state.buckets[0]).toEqual([]);

    expect(timeline.some((frame) => frame.checkpoint?.id === 'radix-collect-order')).toBe(true);
    expect(timeline[timeline.length - 1].state.array).toEqual([2, 24, 45, 66, 75, 90, 170, 802]);
    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('selection sort exposes the no-swap guard, pedagogy, and a first-scan checkpoint', () => {
    const mod = moduleById('selection-sort');
    // Pass 0 already has the minimum at index 0 (guard false), later passes swap (guard true).
    const input = [10, 25, 12, 22, 11, 48, 9];
    const timeline = mod.generateTimeline(input);

    // The `minIdx !== i` guard is visualized in BOTH outcomes: the guard-true
    // path leads to a swap frame, the guard-false path to an explicit no-op frame.
    expect(
      timeline.some(
        (frame) => frame.codeLine === 11 && frame.conditionEval?.result === true
      )
    ).toBe(true);
    expect(
      timeline.some(
        (frame) => frame.codeLine === 10 && frame.conditionEval?.result === false
      )
    ).toBe(true);

    expect(timeline.some((frame) => frame.checkpoint?.id === 'selection-sort-first-scan')).toBe(true);
    expect(timeline.some((frame) => frame.pedagogy?.why)).toBe(true);

    expectSorted(arrayValues(timeline[timeline.length - 1]));
    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('bubble sort visualizes every comparison outcome, swap, early exit, and checkpoint', () => {
    const mod = moduleById('bubble-sort');
    const sortedInput = [10, 15, 25, 30, 45, 60];
    const timeline = mod.generateTimeline(sortedInput);

    // Sorted input: compares exist but every guard is false, so early exit fires.
    expect(
      timeline.some((frame) => frame.codeLine === 6 && frame.conditionEval?.result === false)
    ).toBe(true);
    expect(timeline.some((frame) => frame.explanation.includes('Early termination'))).toBe(true);

    // Reversed input: swaps happen and no bogus early-exit frame may fire
    // (including from the empty final outer iteration).
    const reversedTimeline = mod.generateTimeline([60, 45, 30, 25, 15, 10]);
    expect(reversedTimeline.some((frame) => frame.codeLine === 7)).toBe(true);
    expect(
      reversedTimeline.some((frame) => frame.explanation.includes('Early termination'))
    ).toBe(false);

    expect(timeline.some((frame) => frame.checkpoint?.id === 'bubble-sort-first-compare')).toBe(true);
    expectSorted(arrayValues(timeline[timeline.length - 1]));
    expectSorted(arrayValues(reversedTimeline[reversedTimeline.length - 1]));
    expect(auditTimeline(mod, sortedInput).errorCount).toBe(0);
  });

  it('heapsort visualizes every child comparison, the swap decision, and the shrinking heap tree', () => {
    const mod = moduleById('heapsort');
    const input = [35, 12, 45, 9, 28, 50, 18];
    const timeline = mod.generateTimeline(input);

    // Every frame carries the heap view; the heap never grows.
    let previousHeapSize = input.length;
    for (const frame of timeline) {
      const view = frame.state.heapView;
      expect(view).toBeTruthy();
      expect(view.heapSize).toBeGreaterThanOrEqual(0);
      expect(view.heapSize).toBeLessThanOrEqual(input.length);
      expect(view.heapSize).toBeLessThanOrEqual(previousHeapSize);
      previousHeapSize = view.heapSize;
    }

    // Both outcomes of a left-child comparison are visualized.
    const leftCompares = timeline.filter((frame) => frame.codeLine === 17);
    expect(leftCompares.length).toBeGreaterThan(0);
    const outcomes = new Set(leftCompares.map((frame) => frame.conditionEval?.result));
    expect(outcomes.has(true)).toBe(true);
    expect(outcomes.has(false)).toBe(true);

    // A real swap frame and a no-swap decision frame both occur.
    expect(timeline.some((frame) => frame.state.heapView.statusKind === 'swap')).toBe(true);
    expect(
      timeline.some(
        (frame) => frame.codeLine === 21 && frame.conditionEval?.result === true
      )
    ).toBe(true);

    // One extraction per element: the heap shrinks from n to 1, then locks index 0.
    const extractFrames = timeline.filter(
      (frame) => frame.state.heapView.statusKind === 'extract'
    );
    expect(extractFrames.length).toBe(input.length - 1);
    expect(timeline[timeline.length - 1].state.heapView.heapSize).toBe(0);

    expect(timeline.some((frame) => frame.checkpoint?.id === 'heapsort-first-left-compare')).toBe(
      true
    );

    // Clean audit: no structural errors AND no code-line range warnings.
    const audit = auditTimeline(mod, input);
    expect(audit.errorCount).toBe(0);
    expect(audit.warningCount).toBe(0);

    // Frame lines must fit inside every language snippet so mapping stays direct.
    for (const lang of ['python', 'typescript', 'cpp', 'java', 'pseudocode'] as const) {
      const lineCount = mod.codeSnippets[lang].split('\n').length;
      const maxFrameLine = Math.max(...timeline.map((frame) => frame.codeLine));
      expect(
        lineCount,
        `${lang} snippet must cover line ${maxFrameLine}`
      ).toBeGreaterThanOrEqual(maxFrameLine);
    }

    expectSorted(arrayValues(timeline[timeline.length - 1]));
  });

  it('quicksort separates false comparisons, no-op swaps, recursion entry, and base cases', () => {
    const mod = moduleById('quicksort');
    const input = [45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 98];
    const timeline = mod.generateTimeline(input);

    expect(
      timeline.some((frame) => frame.codeLine === 11 && frame.conditionEval?.result === false)
    ).toBe(true);
    expect(timeline.some((frame) => frame.variables?.noSwap === true)).toBe(true);
    expect(timeline.some((frame) => frame.explanation.startsWith('Base case:'))).toBe(true);
    expect(timeline.some((frame) => frame.explanation.startsWith('Enter quicksort('))).toBe(true);
    expect(timeline.some((frame) => frame.checkpoint?.id === 'quicksort-first-compare')).toBe(true);

    expectSorted(arrayValues(timeline[timeline.length - 1]));
    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('BFS records distances, discovery parents, enqueue/skip edges, and a final shortest path', () => {
    const mod = moduleById('graph-bfs');
    const timeline = mod.generateTimeline(mod.defaultInput);
    const final = timeline[timeline.length - 1];

    expect(final.state.visitedOrder.length).toBeGreaterThan(1);
    expect(final.state.shortestPath?.length).toBeGreaterThan(1);
    expect(final.state.distances[mod.defaultInput]).toBe(0);
    const discoveredParents = Object.values(final.state.parents).filter(
      (parent) => parent !== null
    );
    expect(discoveredParents.length).toBe(final.state.visitedOrder.length - 1);

    expect(
      timeline.some((frame) => frame.state.activeEdge?.kind === 'enqueue')
    ).toBe(true);
    expect(timeline.some((frame) => frame.state.activeEdge?.kind === 'skip')).toBe(true);
    expect(timeline.some((frame) => frame.checkpoint?.id === 'bfs-initial-frontier')).toBe(true);

    expect(auditTimeline(mod, mod.defaultInput).errorCount).toBe(0);
  });

  it('Dijkstra distinguishes stale heap entries, settled-edge skips, and reconstruction frames', () => {
    const mod = moduleById('dijkstra');
    const timeline = mod.generateTimeline(mod.defaultInput);
    const final = timeline[timeline.length - 1];

    expect(final.state.pathToTarget?.[0]).toBe('A');
    expect(final.state.pathToTarget?.[final.state.pathToTarget!.length - 1]).toBe('F');
    expect(final.state.shortestPathEdges.length).toBeGreaterThan(0);

    expect(timeline.some((frame) => frame.explanation.includes('Skipped stale priority-queue entry'))).toBe(true);
    expect(timeline.some((frame) => frame.explanation.includes('is skipped because'))).toBe(true);
    expect(timeline.some((frame) => frame.explanation.includes('Post-processing visualization'))).toBe(true);
    expect(timeline.some((frame) => frame.checkpoint?.id === 'dijkstra-first-extract')).toBe(true);

    const settledEdges = final.state.shortestPathEdges;
    for (const edge of settledEdges) {
      expect(final.state.predecessor[edge.to]).toBe(edge.from);
    }
    expect(auditTimeline(mod, mod.defaultInput).errorCount).toBe(0);
  });

  it('reverse linked list rewires nextIndex pointers and exposes the cached-next checkpoint', () => {
    const mod = moduleById('reverse-linked-list');
    const timeline = mod.generateTimeline([1, 2, 3, 4, 5]);
    const final = timeline[timeline.length - 1];

    expect(final.state.prev).toBe(4);
    expect(final.state.curr).toBeNull();
    expect(final.state.nodes[0].nextIndex).toBeNull();
    expect(final.state.nodes[1].nextIndex).toBe(0);
    expect(final.state.nodes[4].nextIndex).toBe(3);
    expect(timeline.some((frame) => frame.checkpoint?.id === 'reverse-linked-list-first-cache')).toBe(true);

    expect(auditTimeline(mod, [1, 2, 3, 4, 5]).errorCount).toBe(0);
  });

  it('coin change updates dp and parent in separate frames, then reconstructs the chosen coins', () => {
    const mod = moduleById('coin-change');
    const timeline = mod.generateTimeline({ coins: [1, 3, 4], amount: 6 });

    const dpUpdate = timeline.find((frame) => frame.codeLine === 9);
    const parentUpdate = timeline.find((frame) => frame.codeLine === 10);
    expect(dpUpdate?.state.dpTable[1]).toBe(1);
    expect(dpUpdate?.state.parentCoin[1]).toBe(-1);
    expect(parentUpdate?.state.parentCoin[1]).toBe(1);

    const appendFrames = timeline.filter(
      (frame) => frame.codeLine === 20 && frame.state.phase === 'reconstruct'
    );
    expect(appendFrames).toHaveLength(2);
    expect(appendFrames[0].state.optimalCoins).toEqual([3]);
    expect(appendFrames[1].state.optimalCoins).toEqual([3, 3]);

    const final = timeline[timeline.length - 1];
    expect(final.state.phase).toBe('done');
    expect(final.state.optimalCoins).toEqual([3, 3]);
    expect(final.state.reconstructPath).toEqual([6, 3, 0]);
    expect(final.explanation).toContain('3 + 3 = 6');
    expect(timeline.filter((frame) => frame.checkpoint).length).toBeGreaterThanOrEqual(2);

    const unreachable = mod.generateTimeline({ coins: [2, 4], amount: 7 });
    const unreachableFinal = unreachable[unreachable.length - 1];
    expect(unreachableFinal.state.phase).toBe('done');
    expect(unreachableFinal.state.optimalCoins).toEqual([]);
    expect(unreachableFinal.explanation).toContain('unreachable');

    expect(auditTimeline(mod, { coins: [1, 3, 4], amount: 6 }).errorCount).toBe(0);
  });

  it('AVL inserts emit balanced annotations, real call stacks, and single/double rotation frames', () => {
    const mod = moduleById('avl-tree');

    const rr = mod.generateTimeline({ values: [10, 20, 30] });
    const rrFinal = rr[rr.length - 1];
    expect(rrFinal.state.nodes[0].value).toBe(20);
    expect(rrFinal.state.nodes[0].leftId).toBeDefined();
    expect(rrFinal.state.nodes[0].rightId).toBeDefined();

    const leftRotateFrames = rr.filter((frame) => frame.milestoneTitle?.startsWith('Left Rotate'));
    expect(leftRotateFrames.length).toBeGreaterThan(0);
    expect(
      leftRotateFrames[0].callStack?.some(
        (entry) => typeof entry !== 'string' && entry.name === 'rotateLeft'
      )
    ).toBe(true);

    const lr = mod.generateTimeline({ values: [30, 10, 20] });
    expect(lr.some((frame) => frame.milestoneTitle === 'Left Rotate 10')).toBe(true);
    expect(lr.some((frame) => frame.milestoneTitle === 'Right Rotate 30')).toBe(true);
    expect(lr[lr.length - 1].state.nodes[0].value).toBe(20);

    for (const timeline of [rr, lr]) {
      for (const frame of timeline) {
        expect(frame.codeLine).toBeGreaterThanOrEqual(1);
        expect(frame.codeLine).toBeLessThanOrEqual(57);
        const ids = frame.state.nodes.map((node: any) => node.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
      const finalNodes = timeline[timeline.length - 1].state.nodes;
      for (const node of finalNodes as any[]) {
        const match = node.annotation?.match(/h(\d+) bf(-?\d+)/);
        expect(match, `missing AVL annotation on node ${node.value}`).not.toBeNull();
        expect(Math.abs(Number(match![2]))).toBeLessThanOrEqual(1);
      }
    }

    expect(auditTimeline(mod, { values: [10, 20, 30] }).errorCount).toBe(0);
    expect(auditTimeline(mod, { values: [30, 10, 20] }).errorCount).toBe(0);
  });
});
