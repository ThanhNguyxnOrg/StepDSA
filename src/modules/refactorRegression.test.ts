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

  it('binary search narrows one half per probe and exposes the elimination checkpoint', () => {
    const mod = moduleById('binary-search');
    const input = { array: [3, 8, 15, 23, 31, 42, 56, 68, 77, 89, 94], target: 89 };
    const timeline = mod.generateTimeline(input);

    // Prediction checkpoint appears exactly once, before the first halving.
    const checkpoints = timeline.filter((f) => f.checkpoint?.id === 'binary-search-halving');
    expect(checkpoints.length).toBe(1);

    // Each discard frame carries the exact eliminated range.
    const discards = timeline.filter(
      (f) => f.action === 'DISCARD_LEFT' || f.action === 'DISCARD_RIGHT'
    );
    expect(discards.length).toBeGreaterThan(0);
    expect(discards.every((f) => Array.isArray((f.state as any).discardedRange))).toBe(true);

    // The candidate window strictly halves every iteration.
    const windowSizes = timeline
      .filter((f) => f.variables?.windowSize !== undefined)
      .map((f) => Number(f.variables!.windowSize));
    for (let i = 1; i < windowSizes.length; i++) {
      expect(windowSizes[i]).toBeLessThan(windowSizes[i - 1]);
    }

    const found = timeline.find((f) => f.action === 'MATCH_FOUND');
    expect(found).toBeDefined();
    expect(found!.variables?.foundAt).toBe(9);

    const missing = mod.generateTimeline({ ...input, target: 50 });
    expect(missing.some((f) => f.action === 'NOT_FOUND')).toBe(true);
    expect(missing[missing.length - 1].variables?.result).toBe(-1);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('linear search grows its verified prefix and exposes the prefix checkpoint', () => {
    const mod = moduleById('linear-search');
    const input = { array: [14, 33, 27, 10, 35, 19, 42, 44], target: 35 };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'linear-search-prefix').length).toBe(1);

    // Every inspected index before the match carries a progressively longer
    // verified prefix: arr[0..i] != target.
    const prefixFrames = timeline.filter((f) =>
      (f.invariantStatus as any)?.label?.startsWith('Verified prefix')
    );
    expect(prefixFrames.length).toBe(4); // indices 0..3 mismatch, 4 matches
    expect((prefixFrames[prefixFrames.length - 1].invariantStatus as any).label).toContain('[0..3]');

    const found = timeline.find((f) => f.variables?.result === 4);
    expect(found?.milestoneTitle).toBe('Found at index 4');

    const missing = mod.generateTimeline({ array: [5, 12, 18, 24, 31, 40], target: 100 });
    const exhausted = missing.find((f) => f.variables?.result === -1);
    expect(exhausted?.milestoneTitle).toBe('Search Exhausted (-1)');
    expect((exhausted?.invariantStatus as any)?.isValid).toBe(false);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('jump search hops whole blocks and only scans the surviving block', () => {
    const mod = moduleById('jump-search');
    const input = { array: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610], target: 55 };
    const timeline = mod.generateTimeline(input);

    // One block-skip prediction checkpoint, before any hop.
    expect(timeline.filter((f) => f.checkpoint?.id === 'jump-search-block-skip').length).toBe(1);

    // The hop phase really fires and always discards a full block.
    const hops = timeline.filter((f) => f.variables?.hop !== undefined);
    expect(hops.length).toBeGreaterThan(0);
    expect(timeline.some((f) => f.milestoneTitle === 'Target Block Located')).toBe(true);

    // The final linear scan stays inside one block (≤ ceil(sqrt(n)) probes).
    const scanFrames = timeline.filter((f) => f.variables?.prev !== undefined && f.codeLine === 10);
    expect(scanFrames.length).toBeLessThanOrEqual(Math.ceil(Math.sqrt(input.array.length)));

    const found = timeline.find((f) => f.milestoneTitle?.startsWith('Target Found'));
    expect(found?.variables?.resultIndex).toBe(10);

    // Absent target: terminates with -1 either by overshooting bounds or by
    // exhausting the candidate block.
    const missing = mod.generateTimeline({ ...input, target: 56 });
    const last = missing[missing.length - 1];
    expect(last.variables?.notFound === true || last.variables?.result === -1).toBe(true);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('interpolation search estimates probes from value ratios and handles degenerate spans', () => {
    const mod = moduleById('interpolation-search');
    const input = { array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23 };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'interpolation-probe-ratio').length).toBe(1);
    expect(timeline.some((f) => f.action === 'COMPUTE_PROBE')).toBe(true);

    // The probe index must always lie inside the active window.
    for (const frame of timeline.filter((f) => f.action === 'COMPUTE_PROBE')) {
      const pos = Number(frame.variables?.pos);
      expect(pos).toBeGreaterThanOrEqual(Number(frame.variables?.low));
      expect(pos).toBeLessThanOrEqual(Number(frame.variables?.high));
    }

    const found = timeline.find((f) => f.action === 'MATCH_FOUND');
    expect(found?.variables?.foundAt).toBe(5);

    const missing = mod.generateTimeline({ ...input, target: 24 });
    expect(missing.some((f) => f.action === 'TARGET_NOT_FOUND')).toBe(true);

    // Duplicate-heavy input exercises the arr[low] === arr[high] degenerate branch.
    const duplicates = mod.generateTimeline({ array: [5, 5, 5, 5, 5], target: 5 });
    expect(duplicates.some((f) => f.action === 'MATCH_SINGLETON')).toBe(true);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, { array: [5, 5, 5, 5, 5], target: 5 }).errorCount).toBe(0);
  });

  it('exponential search doubles to bracket the target then binary-searches only that window', () => {
    const mod = moduleById('exponential-search');
    const input = { array: [2, 5, 8, 12, 17, 23, 38, 45, 56, 72, 85, 91, 104, 118, 130], target: 17 };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'exponential-doubling-purpose').length).toBe(1);

    // Doubling probes must visit powers of two: 1, 2, 4, ...
    const probeIdx = timeline
      .filter((f) => f.variables?.nextCandidate !== undefined)
      .map((f) => Number(f.variables!.i));
    for (const i of probeIdx) {
      expect(Number.isInteger(Math.log2(i))).toBe(true);
    }

    const bounded = timeline.find((f) => f.milestoneTitle === 'Subarray Bounded');
    expect(bounded).toBeDefined();
    const low = Number(bounded!.variables?.low);
    const high = Number(bounded!.variables?.high);
    expect(low).toBeLessThanOrEqual(4);
    expect(high).toBeGreaterThanOrEqual(4);

    // The binary-search phase never touches indices outside the bracketed window.
    for (const frame of timeline.filter((f) => f.variables?.mid !== undefined)) {
      const mid = Number(frame.variables!.mid);
      expect(mid).toBeGreaterThanOrEqual(low);
      expect(mid).toBeLessThanOrEqual(high);
    }

    const found = timeline.find((f) => f.milestoneTitle?.startsWith('Target Found'));
    expect(found?.variables?.foundIndex).toBe(4);

    // Target before index 0's next power still resolves via the inner window.
    const missing = mod.generateTimeline({ ...input, target: 200 });
    expect(missing.some((f) => f.milestoneTitle === 'Target Not Found')).toBe(true);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('ternary search eliminates two thirds per iteration and documents its comparison cost', () => {
    const mod = moduleById('ternary-search');
    const input = { array: [5, 12, 23, 34, 45, 56, 67, 78, 89, 99], target: 78 };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'ternary-elimination').length).toBe(1);

    const sections = timeline.filter((f) => f.action === 'TRI_SECTION');
    expect(sections.length).toBeGreaterThan(0);
    for (const frame of sections) {
      const low = Number(frame.variables?.low);
      const high = Number(frame.variables?.high);
      const mid1 = Number(frame.variables?.mid1);
      const mid2 = Number(frame.variables?.mid2);
      expect(mid1).toBeGreaterThanOrEqual(low);
      expect(mid2).toBeLessThanOrEqual(high);
      expect(mid1).toBeLessThanOrEqual(mid2);
    }

    // Every discard frame keeps only one third of the previous window.
    const discards = timeline.filter((f) => f.action === 'DISCARD_PARTITIONS');
    expect(discards.length).toBeGreaterThan(0);
    for (const frame of discards) {
      const low = Number(frame.variables?.low);
      const high = Number(frame.variables?.high);
      expect(high - low + 1).toBeLessThanOrEqual(Math.ceil(10 / 3));
    }

    const found = timeline.find((f) => f.action === 'MATCH_FOUND');
    expect(found?.variables?.foundIndex).toBe(7);

    const missing = mod.generateTimeline({ ...input, target: 80 });
    expect(missing.some((f) => f.action === 'NOT_FOUND')).toBe(true);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('rotated search identifies the sorted half and rejects non-rotated input', () => {
    const mod = moduleById('rotated-sorted-array');
    const input = { array: [4, 5, 6, 7, 0, 1, 2], target: 0 };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'rotated-sorted-half').length).toBe(1);

    const found = timeline.find((f) => f.state.phase === 'found');
    expect(found?.state.foundIndex).toBe(4);

    // Target in the left (non-rotated) run still resolves.
    const left = mod.generateTimeline({ array: [6, 7, 1, 2, 3, 4, 5], target: 7 });
    expect(left.find((f) => f.state.phase === 'found')?.state.foundIndex).toBe(1);

    // Absent target exhausts the window.
    const missing = mod.generateTimeline({ array: [4, 5, 6, 7, 0, 1, 2], target: 3 });
    expect(missing[missing.length - 1].state.phase).toBe('not_found');

    // Two descents: the module must refuse rather than return a wrong -1.
    const invalid = mod.generateTimeline({ array: [3, 1, 2, 0], target: 2 });
    expect(invalid[invalid.length - 1].state.phase).toBe('invalid');

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('binary search on the answer finds the minimum feasible speed via a monotone predicate', () => {
    const mod = moduleById('binary-search-answer');
    const input = { piles: [3, 6, 7, 11], h: 8 };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'binary-search-answer-monotone').length).toBe(1);

    // Classic Koko result: k = 4.
    const final = timeline[timeline.length - 1];
    expect(final.variables?.optimalSpeed).toBe(4);
    expect(final.state.phase).toBe('found');

    // The predicate must actually be monotone around the reported answer.
    const hoursAt = (speed: number) =>
      input.piles.reduce((acc, p) => acc + Math.ceil(p / speed), 0);
    for (let k = 1; k < 4; k++) expect(hoursAt(k)).toBeGreaterThan(8);
    for (let k = 4; k <= 11; k++) expect(hoursAt(k)).toBeLessThanOrEqual(8);

    // Both branches of the predicate appear across a non-trivial timeline.
    expect(timeline.some((f) => f.variables?.verified === true)).toBe(true);
    expect(timeline.some((f) => f.variables?.tooSlow === true)).toBe(true);

    // The module clamps h to at least one hour per pile (a pile cannot be split).
    const tight = mod.generateTimeline({ piles: [30, 11, 23, 4, 20], h: 1 });
    expect(tight[tight.length - 1].variables?.optimalSpeed).toBe(30);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('DFS colors nodes, detects the back-edge cycle, and exposes depth-first recursion', () => {
    const mod = moduleById('graph-dfs');
    const nodes = [0, 1, 2, 3, 4, 5].map((id) => ({ id, label: `${id}`, x: id * 60, y: 0 }));
    const input = {
      startNode: 0,
      nodes,
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 3, to: 0 },
        { from: 2, to: 4 },
        { from: 4, to: 5 },
        { from: 3, to: 5 },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'dfs-depth-first').length).toBe(1);
    expect(timeline.some((f) => f.milestoneTitle === 'Cycle Detected (3→0)')).toBe(true);

    const final = timeline[timeline.length - 1];
    expect(final.state.cycleDetected).toBe(true);
    expect(final.callStack?.length).toBe(0);
    for (const node of final.state.nodes) {
      expect(node.status).toBe('visited');
      expect(node.finishTime!).toBeGreaterThan(node.discoveryTime!);
    }

    // Acyclic tree: same coloring, no back-edge, DAG verdict.
    const tree = mod.generateTimeline({
      startNode: 0,
      nodes: [0, 1, 2, 3, 4].map((id) => ({ id, label: `${id}`, x: id * 60, y: 0 })),
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
      ],
    });
    expect(tree[tree.length - 1].state.cycleDetected).toBe(false);
    expect(tree.some((f) => f.milestoneTitle?.startsWith('Cycle Detected'))).toBe(false);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('Bellman-Ford relaxes across passes and proves negative cycles only after V-1 passes', () => {
    const mod = moduleById('bellman-ford');
    const nodes = ['S', 'A', 'B', 'C', 'D'].map((id, i) => ({ id, label: id, x: i * 60, y: 0 }));
    const input = {
      startNode: 'S',
      nodes,
      edges: [
        { id: 'e1', from: 'S', to: 'A', weight: 4 },
        { id: 'e2', from: 'S', to: 'B', weight: 5 },
        { id: 'e3', from: 'A', to: 'B', weight: -2 },
        { id: 'e4', from: 'A', to: 'C', weight: 3 },
        { id: 'e5', from: 'B', to: 'D', weight: 6 },
        { id: 'e6', from: 'C', to: 'D', weight: 2 },
        { id: 'e7', from: 'D', to: 'A', weight: 1 },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'bellman-ford-v-minus-1').length).toBe(1);

    const final = timeline[timeline.length - 1];
    expect(final.state.hasNegativeCycle).toBe(false);
    expect(final.state.distances).toMatchObject({ S: 0, A: 4, B: 2, C: 7, D: 8 });

    // Negative edges force real relaxations, and convergence is detected.
    expect(timeline.some((f) => f.milestoneTitle?.startsWith('Relax'))).toBe(true);
    expect(timeline.some((f) => f.milestoneTitle === 'Early Convergence')).toBe(true);

    // Negative cycle preset: verification pass must flag it.
    const cycle = mod.generateTimeline({
      startNode: 'S',
      nodes: ['S', 'A', 'B', 'C'].map((id, i) => ({ id, label: id, x: i * 60, y: 0 })),
      edges: [
        { id: 'c1', from: 'S', to: 'A', weight: 3 },
        { id: 'c2', from: 'A', to: 'B', weight: 1 },
        { id: 'c3', from: 'B', to: 'C', weight: -3 },
        { id: 'c4', from: 'C', to: 'A', weight: 1 },
      ],
    });
    expect(cycle.some((f) => f.milestoneTitle === 'Negative Cycle!')).toBe(true);
    expect(cycle[cycle.length - 1].state.hasNegativeCycle).toBe(true);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('Floyd-Warshall only improves entries through the current intermediate k', () => {
    const mod = moduleById('floyd-warshall');
    const INF = 999;
    const input = {
      vertices: ['1', '2', '3', '4'],
      matrix: [
        [0, 3, INF, 7],
        [8, 0, 2, INF],
        [5, INF, 0, 1],
        [2, INF, INF, 0],
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'floyd-warshall-intermediate').length).toBe(1);

    // Exactly one k-milestone per vertex, in increasing order.
    const kFrames = timeline.filter((f) => f.milestoneTitle?.startsWith('Intermediate k ='));
    expect(kFrames.length).toBe(4);
    expect(kFrames.map((f) => f.variables?.kIndex)).toEqual([0, 1, 2, 3]);

    // Every update frame must strictly improve a cell via the active k.
    for (const frame of timeline.filter((f) => f.milestoneTitle?.startsWith('Update ('))) {
      expect(Number(frame.variables?.newDistance)).toBeLessThan(
        frame.variables?.oldDistance === '∞' ? Infinity : Number(frame.variables?.oldDistance)
      );
      const i = frame.state.i;
      const j = frame.state.j;
      expect(frame.state.matrix[i][j]).toBe(frame.variables?.newDistance);
      expect(frame.state.k).toBeGreaterThanOrEqual(0);
      expect(frame.state.k).toBeLessThan(4);
    }

    // Final matrix is the known all-pairs optimum.
    const final = timeline[timeline.length - 1];
    expect(final.state.matrix).toEqual([
      [0, 3, 5, 6],
      [5, 0, 2, 3],
      [3, 6, 0, 1],
      [2, 5, 7, 0],
    ]);
    expect(final.milestoneTitle).toBe('All-Pairs Complete');

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('A* expands in non-decreasing f order and reports failure honestly when boxed in', () => {
    const mod = moduleById('a-star-search');
    const input = {
      rows: 6,
      cols: 8,
      start: { r: 1, c: 1 },
      goal: { r: 4, c: 6 },
      obstacles: [
        { r: 1, c: 3 },
        { r: 2, c: 3 },
        { r: 3, c: 3 },
        { r: 4, c: 3 },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'a-star-lowest-f').length).toBe(1);

    // Extract-min frames: f = g + h and f never decreases (consistent heuristic).
    const extracts = timeline.filter((f) => (f.callStack?.[0] as any)?.name === 'exploreMinNode');
    expect(extracts.length).toBeGreaterThan(0);
    let lastF = -Infinity;
    for (const frame of extracts) {
      expect(Number(frame.variables?.f)).toBe(
        Number(frame.variables?.g) + Number(frame.variables?.h)
      );
      expect(Number(frame.variables?.f)).toBeGreaterThanOrEqual(lastF);
      lastF = Number(frame.variables?.f);
    }

    // Every closed node was first extracted; the goal is never closed.
    const closes = timeline.filter((f) => (f.callStack?.[0] as any)?.name === 'closeNode');
    expect(closes.length).toBe(extracts.length - 1);

    // Relaxations always strictly improve g and are followed by an Open Set insert/decrease.
    const relaxes = timeline.filter((f) => (f.callStack?.[0] as any)?.name === 'relaxNeighbor');
    expect(relaxes.length).toBeGreaterThan(0);
    for (const frame of relaxes) {
      expect(Number(frame.variables?.g)).toBeLessThan(
        frame.variables?.oldG === '∞' ? Infinity : Number(frame.variables?.oldG)
      );
    }
    const openUpdates = timeline.filter((f) => (f.callStack?.[0] as any)?.name === 'openSetUpdate');
    expect(openUpdates.length).toBe(relaxes.length);
    expect(openUpdates.every((f) => f.variables?.action === 'INSERT' || f.variables?.action === 'DECREASE_KEY')).toBe(true);

    // Known optimum: detour around the wall costs 10 steps (Manhattan alone is 8).
    const final = timeline[timeline.length - 1];
    expect(final.state.pathFound).toBe(true);
    expect(final.variables?.pathLength).toBe(10);
    const pathCells = final.state.grid.flat().filter((cell: any) => cell.status === 'path');
    expect(pathCells.length).toBe(11);

    // Fully walled-off goal: A* must exhaust the frontier, not invent a path.
    const boxed = mod.generateTimeline({
      rows: 3,
      cols: 3,
      start: { r: 0, c: 0 },
      goal: { r: 2, c: 2 },
      obstacles: [
        { r: 0, c: 1 },
        { r: 1, c: 1 },
        { r: 2, c: 1 },
      ],
    });
    const last = boxed[boxed.length - 1];
    expect(last.milestoneTitle).toBe('No Path Exists');
    expect(last.state.pathFound).toBe(false);
    expect(last.state.openCount).toBe(0);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, {
      rows: 3,
      cols: 3,
      start: { r: 0, c: 0 },
      goal: { r: 2, c: 2 },
      obstacles: [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }],
    }).errorCount).toBe(0);
  });

  it('0-1 BFS keeps the deque distance-sorted and pushes 0-weight targets to the front', () => {
    const mod = moduleById('zero-one-bfs');
    const input = {
      numNodes: 6,
      edges: [
        { u: 0, v: 1, weight: 1 },
        { u: 0, v: 2, weight: 0 },
        { u: 1, v: 3, weight: 1 },
        { u: 2, v: 3, weight: 0 },
        { u: 3, v: 4, weight: 1 },
        { u: 2, v: 5, weight: 1 },
        { u: 5, v: 4, weight: 0 },
      ],
      source: 0,
    };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'zero-one-bfs-front-back').length).toBe(1);

    // The deque must stay sorted by distance on every single frame.
    for (const frame of timeline) {
      const deque: number[] = (frame.state as any).deque ?? [];
      const ds = deque.map((v) => {
        const d = (frame.state as any).distances[v];
        return d === null ? Infinity : d;
      });
      for (let i = 1; i < ds.length; i++) {
        expect(ds[i]).toBeGreaterThanOrEqual(ds[i - 1]);
      }
    }

    // Every relaxation is immediately followed by its deque insertion frame.
    const relaxIdx = timeline
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => f.milestoneTitle?.startsWith('Relax Edge'));
    expect(relaxIdx.length).toBeGreaterThan(0);
    for (const { f, i } of relaxIdx) {
      const push = timeline[i + 1];
      expect(push.variables?.v).toBe(f.variables?.v);
      expect(push.variables?.dequeAction).toBe(
        f.variables?.weight === 0 ? 'push_front' : 'push_back'
      );
    }

    // Non-improving edges are shown as explicit rejections.
    expect(timeline.some((f) => f.variables?.rejected === true)).toBe(true);

    // Known optimum for the teleport graph.
    const final = timeline[timeline.length - 1];
    expect(final.state.distances).toEqual([0, 1, 0, 0, 1, 1]);
    expect(final.state.phase).toBe('done');

    // Alternating chain: 0 ->1-> 1 ->0-> 2 ->1-> 3.
    const chain = mod.generateTimeline({
      numNodes: 4,
      edges: [
        { u: 0, v: 1, weight: 1 },
        { u: 1, v: 2, weight: 0 },
        { u: 2, v: 3, weight: 1 },
      ],
      source: 0,
    } as any);
    expect(chain[chain.length - 1].state.distances).toEqual([0, 1, 1, 2]);

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
  });

  it("Kahn's algorithm emits only zero in-degree vertices and detects a starving queue", () => {
    const mod = moduleById('topological-sort');
    const input = {
      nodes: [
        { id: 0, label: 'CS101', x: 80, y: 100 },
        { id: 1, label: 'DataStruct', x: 230, y: 60 },
        { id: 2, label: 'MathDiscrete', x: 230, y: 180 },
        { id: 3, label: 'Algorithms', x: 400, y: 60 },
        { id: 4, label: 'Compilers', x: 400, y: 180 },
        { id: 5, label: 'Capstone', x: 550, y: 120 },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
        { from: 3, to: 4 },
        { from: 3, to: 5 },
        { from: 4, to: 5 },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'topological-sort-zero-indegree').length).toBe(1);

    // One pop, one append, one decrement per edge, and only then possible enqueues.
    const pops = timeline.filter((f) => (f.callStack?.[0] as any)?.name === 'topologicalSort(V, adj)' && f.codeLine === 6);
    const appends = timeline.filter((f) => f.codeLine === 7);
    const decrements = timeline.filter((f) => f.codeLine === 9);
    const enqueues = timeline.filter((f) => f.codeLine === 11);
    expect(pops.length).toBe(6);
    expect(appends.length).toBe(6);
    expect(decrements.length).toBe(input.edges.length);
    expect(enqueues.length).toBe(5); // every vertex except the single source

    // Order lengths grow by exactly one per append frame.
    appends.forEach((frame, i) => expect(frame.variables?.orderLen).toBe(i + 1));

    // Final order is valid: every edge points forward.
    const final = timeline[timeline.length - 1];
    const order: number[] = final.state.topoOrder;
    expect(order.length).toBe(6);
    expect(final.state.cycleDetected).toBe(false);
    for (const e of input.edges) {
      expect(order.indexOf(e.from)).toBeLessThan(order.indexOf(e.to));
    }

    // Cyclic preset: A emits, then the queue starves before B/C/D.
    const cycle = mod.generateTimeline({
      nodes: [
        { id: 0, label: 'A', x: 0, y: 0 },
        { id: 1, label: 'B', x: 60, y: 0 },
        { id: 2, label: 'C', x: 120, y: 0 },
        { id: 3, label: 'D', x: 180, y: 0 },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 1 },
      ],
    });
    const cycleFinal = cycle[cycle.length - 1];
    expect(cycleFinal.state.cycleDetected).toBe(true);
    expect(cycleFinal.milestoneTitle).toBe('Directed Cycle Detected');
    expect(cycleFinal.variables?.emittedCount).toBe(1);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, {
      nodes: [
        { id: 0, label: 'A', x: 0, y: 0 },
        { id: 1, label: 'B', x: 60, y: 0 },
        { id: 2, label: 'C', x: 120, y: 0 },
        { id: 3, label: 'D', x: 180, y: 0 },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 1 },
      ],
    }).errorCount).toBe(0);
  });

  it('DFS topological sort prepends on finish, skips BLACK edges, and aborts on a back-edge', () => {
    const mod = moduleById('topological-sort-dfs');
    const input = {
      nodes: ['A', 'B', 'C', 'D', 'E'],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'E' },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'topological-sort-dfs-postorder').length).toBe(1);

    // Every vertex is visited once, marked BLACK once, and prepended once.
    expect(timeline.filter((f) => f.codeLine === 4).length).toBe(5);
    expect(timeline.filter((f) => f.codeLine === 8).length).toBe(5);
    const prepends = timeline.filter((f) => f.codeLine === 9);
    expect(prepends.length).toBe(5);
    prepends.forEach((frame, i) => {
      expect((frame.state.topoOrder as string[]).length).toBe(i + 1);
    });

    // C → D targets a BLACK vertex, so it must be shown as an explicit skip.
    const skips = timeline.filter((f) => f.variables?.action === 'SKIP');
    expect(skips.length).toBe(1);
    expect(skips[0].variables?.from).toBe('C');
    expect(skips[0].variables?.to).toBe('D');

    // Known DFS post-order for this graph.
    const final = timeline[timeline.length - 1];
    expect(final.state.hasCycle).toBe(false);
    expect(final.state.topoOrder).toEqual(['A', 'C', 'B', 'D', 'E']);
    for (const e of input.edges) {
      expect(final.state.topoOrder.indexOf(e.from)).toBeLessThan(
        final.state.topoOrder.indexOf(e.to)
      );
    }

    // A → B → A: the back-edge aborts before any vertex is emitted.
    const cycle = mod.generateTimeline({
      nodes: ['A', 'B'],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'A' },
      ],
    });
    const cycleFinal = cycle[cycle.length - 1];
    expect(cycleFinal.state.hasCycle).toBe(true);
    expect(cycleFinal.milestoneTitle).toBe('Directed Cycle Detected');
    expect(cycleFinal.state.topoOrder).toEqual([]);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, {
      nodes: ['A', 'B'],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'A' },
      ],
    }).errorCount).toBe(0);
  });

  it("Kruskal accepts edges in weight order, rejects cycles, and stops at V-1 edges", () => {
    const mod = moduleById('kruskal-mst');
    const input = {
      nodes: [
        { id: 'A', label: 'A', x: 100, y: 80 },
        { id: 'B', label: 'B', x: 260, y: 60 },
        { id: 'C', label: 'C', x: 420, y: 80 },
        { id: 'D', label: 'D', x: 100, y: 220 },
        { id: 'E', label: 'E', x: 260, y: 240 },
        { id: 'F', label: 'F', x: 420, y: 220 },
      ],
      edges: [
        { from: 'A', to: 'B', weight: 4 },
        { from: 'A', to: 'D', weight: 3 },
        { from: 'B', to: 'D', weight: 2 },
        { from: 'B', to: 'E', weight: 3 },
        { from: 'B', to: 'C', weight: 5 },
        { from: 'C', to: 'F', weight: 6 },
        { from: 'D', to: 'E', weight: 7 },
        { from: 'E', to: 'F', weight: 4 },
        { from: 'C', to: 'E', weight: 1 },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'kruskal-cycle-check').length).toBe(1);

    // Sorted order is strict, so the first inspect frame is the lightest edge C-E (1).
    const inspects = timeline.filter((f) => f.action?.startsWith('Inspect edge'));
    expect(inspects.length).toBeGreaterThan(0);
    const weights = inspects.map((f) => Number(f.scopeVariables?.weight));
    expect(weights).toEqual([...weights].sort((a, b) => a - b));
    expect(weights[0]).toBe(1);

    // Every rejected edge truly closes a cycle: both endpoints share a root.
    const rejects = timeline.filter((f) => f.action?.startsWith('Reject edge'));
    expect(rejects.length).toBe(1);
    expect(rejects[0].scopeVariables?.cycle).toBe('yes');
    expect(rejects[0].scopeVariables?.sharedRoot).toBeTruthy();

    // Accept → union ordering: each acceptance is followed by its union frame.
    const accepts = timeline.filter((f) => f.action?.startsWith('Accept edge'));
    const unions = timeline.filter((f) => f.action?.startsWith('Union components'));
    expect(accepts.length).toBe(5);
    expect(unions.length).toBe(5);
    for (let i = 0; i < accepts.length; i++) {
      const acceptIdx = timeline.indexOf(accepts[i]);
      expect(timeline[acceptIdx + 1].action).toBe(unions[i].action);
    }

    // Early exit fires exactly once, right when |A| hits V-1.
    const earlyExits = timeline.filter((f) => f.action === 'Early exit: V-1 edges');
    expect(earlyExits.length).toBe(1);
    expect(earlyExits[0].scopeVariables?.mstEdgeCount).toBe(5);
    expect(earlyExits[0].scopeVariables?.neededEdges).toBe(5);

    // Known MST for this graph: C-E(1), B-D(2), A-D(3), B-E(3), E-F(4).
    const final = timeline[timeline.length - 1];
    expect(final.state.mstEdgeCount).toBe(5);
    expect(final.state.mstWeight).toBe(13);
    expect(final.milestoneTitle).toBe('MST Complete (weight 13)');
    expect(final.state.edges.filter((e: any) => e.status === 'accepted').length).toBe(5);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it("Prim annexes the lightest cut edge and reports a forest honestly when disconnected", () => {
    const mod = moduleById('prim-mst');
    const input = {
      startNode: 'A',
      nodes: [
        { id: 'A', label: 'A', x: 120, y: 120 },
        { id: 'B', label: 'B', x: 280, y: 70 },
        { id: 'C', label: 'C', x: 440, y: 120 },
        { id: 'D', label: 'D', x: 120, y: 280 },
        { id: 'E', label: 'E', x: 280, y: 320 },
        { id: 'F', label: 'F', x: 440, y: 280 },
      ],
      edges: [
        { id: 'e-AB', from: 'A', to: 'B', weight: 4, status: 'unvisited' as const },
        { id: 'e-AD', from: 'A', to: 'D', weight: 2, status: 'unvisited' as const },
        { id: 'e-BD', from: 'B', to: 'D', weight: 1, status: 'unvisited' as const },
        { id: 'e-BC', from: 'B', to: 'C', weight: 5, status: 'unvisited' as const },
        { id: 'e-BE', from: 'B', to: 'E', weight: 3, status: 'unvisited' as const },
        { id: 'e-DE', from: 'D', to: 'E', weight: 7, status: 'unvisited' as const },
        { id: 'e-CE', from: 'C', to: 'E', weight: 2, status: 'unvisited' as const },
        { id: 'e-CF', from: 'C', to: 'F', weight: 6, status: 'unvisited' as const },
        { id: 'e-EF', from: 'E', to: 'F', weight: 4, status: 'unvisited' as const },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'prim-min-cut-edge').length).toBe(1);

    const byCall = (name: string) =>
      timeline.filter((f) => (f.callStack?.[0] as any)?.name === name);

    const extracts = byCall('extractMin');
    const annexes = byCall('annexVertex');
    const adds = byCall('addToMST');
    const frontiers = byCall('updateFrontier');
    expect(extracts.length).toBe(5);
    expect(annexes.length).toBe(5);
    expect(adds.length).toBe(5);
    expect(frontiers.length).toBe(5);

    // Prim's chosen weights are locally minimal, not globally sorted: 2, 1, 3, 2, 4.
    expect(extracts.map((f) => f.variables?.minWeight)).toEqual([2, 1, 3, 2, 4]);
    expect(annexes.map((f) => f.variables?.annexedVertex)).toEqual(['D', 'B', 'E', 'C', 'F']);

    // The annex frame must precede the weight increment; only addToMST updates totalWeight.
    const expectedWeights = [2, 3, 6, 8, 12];
    adds.forEach((frame, i) => expect(frame.variables?.totalWeight).toBe(expectedWeights[i]));
    annexes.forEach((frame, i) => {
      expect(frame.variables?.totalWeight).toBeUndefined();
      expect(frame.variables?.visitedSize).toBe(i + 2);
    });

    // Frontier shrinks exactly when an edge becomes internal.
    expect(frontiers.map((f) => f.variables?.frontierSize)).toEqual([3, 3, 3, 2, 0]);
    expect(frontiers.map((f) => f.variables?.discardedCount)).toEqual([0, 1, 1, 1, 1]);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('MST Complete (weight 12)');
    expect(final.state.totalWeight).toBe(12);
    expect(final.state.mstEdgesCount).toBe(5);
    expect(final.state.visitedNodes.length).toBe(6);
    expect(final.state.edges.filter((e: any) => e.status === 'selected').length).toBe(5);

    // Disconnected graph: A-B exists, C and D are isolated.
    const forest = mod.generateTimeline({
      startNode: 'A',
      nodes: [
        { id: 'A', label: 'A', x: 0, y: 0 },
        { id: 'B', label: 'B', x: 60, y: 0 },
        { id: 'C', label: 'C', x: 120, y: 0 },
        { id: 'D', label: 'D', x: 180, y: 0 },
      ],
      edges: [{ id: 'e1', from: 'A', to: 'B', weight: 3, status: 'unvisited' as const }],
    });
    const last = forest[forest.length - 1];
    expect(last.milestoneTitle).toBe('Disconnected — Spanning Forest');
    expect(last.variables?.isComplete).toBe(false);
    expect(last.variables?.reachedVertices).toBe(2);
    expect(last.state.totalWeight).toBe(3);
    expect(last.state.mstEdgesCount).toBe(1);
    expect(forest.some((f) => f.variables?.isComplete === true)).toBe(false);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(
      auditTimeline(mod, {
        startNode: 'A',
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0 },
          { id: 'B', label: 'B', x: 60, y: 0 },
          { id: 'C', label: 'C', x: 120, y: 0 },
          { id: 'D', label: 'D', x: 180, y: 0 },
        ],
        edges: [{ id: 'e1', from: 'A', to: 'B', weight: 3, status: 'unvisited' as const }],
      }).errorCount
    ).toBe(0);
  });

  it("Boruvka contracts components phase by phase, skips duplicate picks, and reaches the true MST", () => {
    const mod = moduleById('boruvka-mst');
    const input = {
      vertices: [1, 2, 3, 4, 5, 6],
      edges: [
        { u: 1, v: 2, weight: 4 },
        { u: 1, v: 3, weight: 2 },
        { u: 2, v: 3, weight: 1 },
        { u: 2, v: 4, weight: 5 },
        { u: 3, v: 4, weight: 8 },
        { u: 3, v: 5, weight: 10 },
        { u: 4, v: 5, weight: 2 },
        { u: 4, v: 6, weight: 6 },
        { u: 5, v: 6, weight: 3 },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'boruvka-parallel-cheapest').length).toBe(1);

    const scans = timeline.filter((f) => f.action === 'PHASE_SCAN');
    const picks = timeline.filter((f) => f.action === 'PHASE_CHEAPEST_FOUND');
    const unions = timeline.filter((f) => f.action === 'UNION_COMPONENTS');
    const adds = timeline.filter((f) => f.action === 'EDGE_ADDED_TO_MST');
    const skips = timeline.filter((f) => f.action === 'CYCLE_AVOIDED');
    const phases = timeline.filter((f) => f.action === 'PHASE_CONTRACTED');

    expect(scans.length).toBe(2);
    expect(picks.length).toBe(8); // 6 singleton components in phase 1, 2 super-components in phase 2
    expect(unions.length).toBe(5);
    expect(adds.length).toBe(5);
    expect(phases.map((f) => f.milestoneTitle)).toEqual(['Phase 1 Completed', 'Phase 2 Completed']);

    // Every add is directly preceded by its union; duplicates are shown as skips.
    for (const add of adds) {
      const idx = timeline.indexOf(add);
      expect(timeline[idx - 1].action).toBe('UNION_COMPONENTS');
      expect(timeline[idx - 1].variables?.edge).toBe(add.variables?.edge);
    }
    expect(skips.length).toBe(3);
    expect(skips.every((f) => f.variables?.cyclePrevented === true)).toBe(true);

    // Phase 1 accepts 1-3(2), 2-3(1), 4-5(2), 5-6(3); phase 2 finishes with 2-4(5).
    expect(timeline.filter((f) => f.action === 'EDGE_ADDED_TO_MST' && f.state.phase === 1).length).toBe(4);
    expect(timeline.filter((f) => f.action === 'EDGE_ADDED_TO_MST' && f.state.phase === 2).length).toBe(1);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('MST Complete (weight 13)');
    expect(final.state.totalWeight).toBe(13);
    expect(final.state.mstEdges.length).toBe(5);
    expect(final.state.componentCount).toBe(1);
    expect(final.variables?.isSpanning).toBe(true);

    // Disconnected graph: A-B exists, 3 and 4 are isolated.
    const forest = mod.generateTimeline({
      vertices: [1, 2, 3, 4],
      edges: [{ u: 1, v: 2, weight: 3 }],
    });
    const last = forest[forest.length - 1];
    expect(last.milestoneTitle).toBe('Disconnected — Spanning Forest (weight 3)');
    expect(last.variables?.isSpanning).toBe(false);
    expect(last.state.componentCount).toBe(3);
    expect(last.state.mstEdges.length).toBe(1);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, { vertices: [1, 2, 3, 4], edges: [{ u: 1, v: 2, weight: 3 }] }).errorCount).toBe(0);
  });

  it('DSU walks one parent hop per frame, compresses paths, and updates rank only on equal ranks', () => {
    const mod = moduleById('disjoint-set-union');
    const input = {
      elements: ['A', 'B', 'C', 'D', 'E', 'F'],
      operations: [
        { type: 'UNION' as const, x: 'A', y: 'B' },
        { type: 'UNION' as const, x: 'C', y: 'D' },
        { type: 'UNION' as const, x: 'B', y: 'C' },
        { type: 'FIND' as const, x: 'D' },
        { type: 'UNION' as const, x: 'E', y: 'F' },
        { type: 'FIND' as const, x: 'A' },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'dsu-union-by-rank').length).toBe(1);

    // One climb frame per parent-pointer hop: B→A, D→C, C→A.
    const climbs = timeline.filter((f) => f.codeLine === 5);
    expect(climbs.length).toBe(3);
    expect(climbs.map((f) => f.variables?.at)).toEqual(['B', 'D', 'C']);

    // One root frame per find call (10 calls) and exactly one compression.
    expect(timeline.filter((f) => f.codeLine === 7).length).toBe(10);
    const compresses = timeline.filter((f) => f.codeLine === 6);
    expect(compresses.length).toBe(1);
    expect(compresses[0].milestoneTitle).toBe('Compress (D → A)');
    expect(compresses[0].variables?.compressedNodes).toBe('D, C');

    // After compression, D and C point straight at A.
    const afterCompress = timeline[timeline.indexOf(compresses[0])];
    expect(afterCompress.state.parents.D).toBe('A');
    expect(afterCompress.state.parents.C).toBe('A');

    // Four links and four rank updates; every default merge joins equal ranks.
    const links = timeline.filter((f) => f.codeLine === 13);
    const rankFrames = timeline.filter((f) => f.codeLine === 14);
    expect(links.length).toBe(4);
    expect(rankFrames.length).toBe(4);
    expect(rankFrames.map((f) => f.variables?.newRank)).toEqual([1, 1, 2, 1]);

    // Merging a smaller-rank root must leave the surviving rank untouched.
    const skew = mod.generateTimeline({
      elements: ['A', 'B', 'C'],
      operations: [
        { type: 'UNION' as const, x: 'A', y: 'B' },
        { type: 'UNION' as const, x: 'B', y: 'C' },
      ],
    });
    const skewRanks = skew.filter((f) => f.codeLine === 14);
    expect(skewRanks.length).toBe(2);
    expect(skewRanks[0].variables?.rankIncremented).toBe(true);
    expect(skewRanks[1].variables?.rankIncremented).toBe(false);
    expect(skewRanks[1].variables?.newRank).toBe(1);

    const final = timeline[timeline.length - 1];
    expect(final.variables?.components).toBe(2); // {A,B,C,D} and {E,F}
    expect(final.state.rootMap.A).toBe('A');
    expect(final.state.rootMap.F).toBe('E');

    // Redundant union of already-connected elements must surface as an explicit no-op.
    const redundant = mod.generateTimeline({
      elements: ['A', 'B'],
      operations: [
        { type: 'UNION' as const, x: 'A', y: 'B' },
        { type: 'UNION' as const, x: 'A', y: 'B' },
      ],
    });
    const noop = redundant.filter((f) => f.milestoneTitle?.startsWith('Redundant Union'));
    expect(noop.length).toBe(1);
    expect(noop[0].variables?.sharedRoot).toBe('A');
    expect(noop[0].state.parents.B).toBe('A');

    // Path-compression preset really compresses: 3 → 2 → 0 collapses to direct 3 → 0 and 2 → 0.
    const preset = mod.presets.find((p) => p.id === 'path-compression')!;
    const presetTimeline = mod.generateTimeline(preset.data as any);
    const presetCompress = presetTimeline.filter((f) => f.codeLine === 6);
    expect(presetCompress.length).toBe(1);
    expect(presetCompress[0].milestoneTitle).toBe('Compress (3 → 0)');
    expect(presetCompress[0].state.parents['2']).toBe('0');
    expect(presetCompress[0].state.parents['3']).toBe('0');

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, preset.data as any).errorCount).toBe(0);
  });

  it('Tarjan discovers, pushes and marks one node per frame, then pops SCCs node by node', () => {
    const mod = moduleById('tarjan-scc');
    const input = {
      nodes: ['A', 'B', 'C', 'D', 'E'],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'A' },
        { from: 'B', to: 'D' },
        { from: 'D', to: 'E' },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'tarjan-scc-root-condition').length).toBe(1);

    // Every visit is exactly three frames: discover (8), push (9), mark inStack (10).
    expect(timeline.filter((f) => f.codeLine === 8).length).toBe(5);
    expect(timeline.filter((f) => f.codeLine === 9).length).toBe(5);
    expect(timeline.filter((f) => f.codeLine === 10).length).toBe(5);

    // Edge classification: 4 tree edges, 1 back edge (C → A), 4 low-link backtracks.
    const treeEdges = timeline.filter((f) => f.variables?.edgeType === 'TREE_EDGE');
    const backEdges = timeline.filter((f) => f.variables?.edgeType === 'BACK_EDGE');
    expect(treeEdges.length).toBe(4);
    expect(backEdges.length).toBe(1);
    expect(backEdges[0].variables?.from).toBe('C');
    expect(backEdges[0].variables?.discV).toBe(1); // disc[A] == 1
    expect(timeline.filter((f) => f.codeLine === 14).length).toBe(4);

    // Root checks (17) happen only when equality holds; pops (18) mirror the stack contents.
    expect(timeline.filter((f) => f.codeLine === 17).length).toBe(3);
    const pops = timeline.filter((f) => (f.callStack?.[0] as any)?.name?.startsWith('popNode'));
    expect(pops.map((f) => f.variables?.popped)).toEqual(['E', 'D', 'C', 'B', 'A']);

    const seals = timeline.filter((f) => (f.callStack?.[0] as any)?.name?.startsWith('sealSCC'));
    expect(seals.map((f) => f.milestoneTitle)).toEqual([
      'SCC #1: {E}',
      'SCC #2: {D}',
      'SCC #3: {C, B, A}',
    ]);

    // Once an SCC is sealed, its members leave the stack and are colored.
    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Tarjan Complete (3 SCCs)');
    expect(final.state.sccList).toEqual([['E'], ['D'], ['C', 'B', 'A']]);
    expect(final.state.stack).toEqual([]);
    expect(Object.keys(final.state.completedSCCNodeColor).sort()).toEqual(['A', 'B', 'C', 'D', 'E']);

    // Two interlocked cycles preset: both components found, each with 3 members.
    const preset = mod.presets.find((p) => p.id === 'two-sccs')!;
    const presetTimeline = mod.generateTimeline(preset.data as any);
    const presetFinal = presetTimeline[presetTimeline.length - 1];
    expect(presetFinal.state.sccList.length).toBe(2);
    const sizes = presetFinal.state.sccList.map((c: string[]) => c.length);
    expect(sizes).toEqual([3, 3]);
    const sets = presetFinal.state.sccList.map((c: string[]) => [...c].sort().join(''));
    expect(sets.sort()).toEqual(['012', '345']);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, preset.data as any).errorCount).toBe(0);
  });

  it('Kosaraju builds the finish stack first, then seals one SCC per pass-2 tree', () => {
    const mod = moduleById('kosaraju-scc');
    const input = {
      nodes: ['A', 'B', 'C', 'D', 'E'],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'A' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'E' },
        { from: 'E', to: 'D' },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'kosaraju-reverse-pass').length).toBe(1);

    // Pass 1: 5 visits, 4 tree edges, 2 skipped edges, 5 finish pushes in postorder.
    const pass1 = timeline.filter((f) => f.state.phase === 'PASS_1_DFS');
    expect(pass1.filter((f) => f.codeLine === 4).length).toBe(5);
    expect(pass1.filter((f) => f.variables?.edgeType === 'TREE_EDGE').length).toBe(4);
    expect(pass1.filter((f) => f.variables?.edgeType === 'SKIP_VISITED').length).toBe(2);
    const finishes = pass1.filter((f) => f.codeLine === 6);
    expect(finishes.map((f) => f.variables?.finishedNode)).toEqual(['E', 'D', 'C', 'B', 'A']);
    expect(finishes[finishes.length - 1].variables?.finishStack).toBe('E, D, C, B, A');

    // Transpose then reset: two distinct frames.
    expect(timeline.filter((f) => f.codeLine === 8).length).toBe(1);
    expect(timeline.filter((f) => f.codeLine === 9).length).toBe(1);
    const transpose = timeline.find((f) => f.codeLine === 8)!;
    expect(transpose.state.edges[0]).toEqual({ from: 'B', to: 'A' });

    // Pass 2: stack pops in reverse push order; assigned vertices are skipped explicitly.
    const popFrames = timeline.filter((f) => (f.callStack?.[0] as any)?.name === 'popFinishStack()');
    expect(popFrames.map((f) => f.variables?.popped)).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(timeline.filter((f) => (f.callStack?.[0] as any)?.name?.startsWith('skipAssigned')).length).toBe(3);

    // Two pass-2 trees: A→C→B and D→E, each sealed once.
    const pass2 = timeline.filter((f) => f.state.phase === 'PASS_2_SCC');
    expect(pass2.filter((f) => f.codeLine === 12).length).toBe(5);
    expect(pass2.filter((f) => f.codeLine === 13).length).toBe(5);
    expect(pass2.filter((f) => f.codeLine === 14 && f.variables?.edgeType === 'TREE_EDGE').length).toBe(3);
    expect(pass2.filter((f) => f.codeLine === 14 && f.variables?.edgeType === 'SKIP_VISITED').length).toBe(3);
    const seals = timeline.filter((f) => (f.callStack?.[0] as any)?.name === 'sealSCC()');
    expect(seals.map((f) => f.milestoneTitle)).toEqual(['SCC #1: {A, C, B}', 'SCC #2: {D, E}']);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Kosaraju Complete (2 SCCs)');
    expect(final.state.sccList).toEqual([
      ['A', 'C', 'B'],
      ['D', 'E'],
    ]);

    // Two disjoint cycles: exactly two pass-2 trees.
    const two = mod.generateTimeline({
      nodes: ['A', 'B', 'C', 'D'],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'A' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'C' },
      ],
    });
    const twoSeals = two.filter((f) => (f.callStack?.[0] as any)?.name === 'sealSCC()');
    expect(twoSeals.map((f) => f.milestoneTitle)).toEqual(['SCC #1: {A, B}', 'SCC #2: {C, D}']);
    expect(two[two.length - 1].state.sccList).toEqual([
      ['A', 'B'],
      ['C', 'D'],
    ]);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, {
      nodes: ['A', 'B', 'C', 'D'],
      edges: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'A' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'C' },
      ],
    }).errorCount).toBe(0);
  });

  it('articulation points skip parent edges, classify back-edges, and apply root vs non-root rules', () => {
    const mod = moduleById('articulation-points');
    const input = {
      nodes: ['A', 'B', 'C', 'D', 'E'],
      edges: [
        { u: 'A', v: 'B' },
        { u: 'B', v: 'C' },
        { u: 'C', v: 'A' },
        { u: 'C', v: 'D' },
        { u: 'D', v: 'E' },
        { u: 'E', v: 'C' },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'articulation-cut-condition').length).toBe(1);

    // One frame per operation: 5 visits, 4 parent skips, 4 back-edges (each edge seen from both ends), 4 tree edges, 4 returns.
    expect(timeline.filter((f) => f.codeLine === 4).length).toBe(5);
    expect(timeline.filter((f) => f.variables?.action === 'SKIP_PARENT').length).toBe(4);
    expect(timeline.filter((f) => f.codeLine === 7).length).toBe(4);
    expect(timeline.filter((f) => f.variables?.edgeType === 'TREE_EDGE').length).toBe(4);
    expect(timeline.filter((f) => f.codeLine === 11).length).toBe(4);

    // Bowtie graph: only C separates the two triangles.
    const cutFrames = timeline.filter((f) => f.codeLine === 12);
    expect(cutFrames.length).toBe(1);
    expect(cutFrames[0].milestoneTitle).toBe('Cut Vertex Found: "C"');
    expect(cutFrames[0].variables?.lowChild).toBe(3);
    expect(cutFrames[0].variables?.discU).toBe(3);
    expect(timeline.filter((f) => f.codeLine === 13).length).toBe(0); // root has one child only

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Found 1 Articulation Point');
    expect(final.state.cutVertices).toEqual(['C']);

    // Linear chain: both internal nodes are cut vertices via the non-root rule.
    const chain = mod.generateTimeline({
      nodes: ['0', '1', '2', '3'],
      edges: [
        { u: '0', v: '1' },
        { u: '1', v: '2' },
        { u: '2', v: '3' },
      ],
    });
    const chainFinal = chain[chain.length - 1];
    expect(chainFinal.milestoneTitle).toBe('Found 2 Articulation Points');
    expect(chainFinal.state.cutVertices.sort()).toEqual(['1', '2']);

    // Star graph centered at 0: root rule fires (3 children), leaves are not cut vertices.
    const star = mod.generateTimeline({
      nodes: ['0', '1', '2', '3'],
      edges: [
        { u: '0', v: '1' },
        { u: '0', v: '2' },
        { u: '0', v: '3' },
      ],
    });
    const rootFrames = star.filter((f) => f.codeLine === 13);
    expect(rootFrames.length).toBe(1);
    expect(rootFrames[0].milestoneTitle).toBe('Root Cut Vertex: "0" (3 Subtrees)');
    expect(star[star.length - 1].state.cutVertices).toEqual(['0']);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, {
      nodes: ['0', '1', '2', '3'],
      edges: [
        { u: '0', v: '1' },
        { u: '0', v: '2' },
        { u: '0', v: '3' },
      ],
    }).errorCount).toBe(0);
  });

  it('bridge finding uses the strict low/disc comparison and finds every tree edge as a bridge', () => {
    const mod = moduleById('bridge-finding');
    const input = {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
      edges: [
        { u: 'A', v: 'B' },
        { u: 'B', v: 'C' },
        { u: 'C', v: 'A' },
        { u: 'C', v: 'D' },
        { u: 'D', v: 'E' },
        { u: 'E', v: 'F' },
        { u: 'F', v: 'D' },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'bridge-low-strict').length).toBe(1);

    // One frame per operation: 6 visits, 5 parent skips, 4 back-edges, 5 tree edges, 5 returns, 5 checks.
    expect(timeline.filter((f) => f.codeLine === 4).length).toBe(6);
    expect(timeline.filter((f) => f.variables?.action === 'SKIP_PARENT').length).toBe(5);
    expect(timeline.filter((f) => f.codeLine === 8).length).toBe(4);
    expect(timeline.filter((f) => f.variables?.edgeType === 'TREE_EDGE').length).toBe(5);
    expect(timeline.filter((f) => f.codeLine === 11).length).toBe(5);
    const checks = timeline.filter((f) => f.codeLine === 12);
    expect(checks.length).toBe(5);
    expect(checks.filter((f) => f.variables?.isBridge === 'YES').length).toBe(1);

    // Only C-D survives the strict test: low[D]=4 > disc[C]=3.
    const bridgeFrames = timeline.filter((f) => f.codeLine === 13);
    expect(bridgeFrames.length).toBe(1);
    expect(bridgeFrames[0].milestoneTitle).toBe('Bridge Found: C — D');
    expect(bridgeFrames[0].state.bridges).toEqual(['C-D']);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Found 1 Bridge');
    expect(final.state.bridges).toEqual(['C-D']);

    // A path is all bridges: 3 edges, 3 bridge frames.
    const tree = mod.generateTimeline({
      nodes: ['0', '1', '2', '3'],
      edges: [
        { u: '0', v: '1' },
        { u: '1', v: '2' },
        { u: '2', v: '3' },
      ],
    });
    expect(tree.filter((f) => f.codeLine === 13).length).toBe(3);
    expect(tree[tree.length - 1].milestoneTitle).toBe('Found 3 Bridges');
    expect(tree[tree.length - 1].state.bridges).toEqual(['2-3', '1-2', '0-1']);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, {
      nodes: ['0', '1', '2', '3'],
      edges: [
        { u: '0', v: '1' },
        { u: '1', v: '2' },
        { u: '2', v: '3' },
      ],
    }).errorCount).toBe(0);
  });

  it('bipartite BFS alternates colors level by level and stops at the first same-color edge', () => {
    const mod = moduleById('bipartite-check');

    // Even cycle: clean 2-coloring, no conflict.
    const even = mod.generateTimeline({ isOddCyclePreset: false } as any);
    expect(even.filter((f) => f.codeLine === 8).length).toBe(4); // one dequeue per vertex
    expect(even.filter((f) => f.codeLine === 9).length).toBe(8); // every undirected edge checked once per endpoint pass
    expect(even.filter((f) => f.codeLine === 11).length).toBe(3); // vertices 1, 3, 2 colored
    expect(even.filter((f) => f.codeLine === 12).length).toBe(3); // and enqueued
    expect(even.filter((f) => f.codeLine === 14).length).toBe(0);
    expect(even.filter((f) => f.codeLine === 3).length).toBe(1); // outer scan finds every vertex colored

    const evenFinal = even[even.length - 1];
    expect(evenFinal.milestoneTitle).toBe('Graph is Bipartite');
    expect(evenFinal.state.isBipartite).toBe(true);
    expect((evenFinal.state.nodes as any[]).map((n) => n.color)).toEqual([1, 2, 1, 2]);

    // Odd cycle: conflict at edge (1,2), the moment two same-color neighbors meet.
    const odd = mod.generateTimeline({ isOddCyclePreset: true } as any);
    expect(odd.filter((f) => f.checkpoint?.id === 'bipartite-odd-cycle').length).toBe(1);
    const conflicts = odd.filter((f) => f.codeLine === 14);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].milestoneTitle).toBe('Conflict Detected: Non-Bipartite');
    expect(conflicts[0].variables?.u).toBe(1);
    expect(conflicts[0].variables?.v).toBe(2);
    expect(conflicts[0].variables?.sharedColor).toBe(2);
    expect(conflicts[0].state.isBipartite).toBe(false);
    expect(odd[odd.length - 1].milestoneTitle).toBe('Conflict Detected: Non-Bipartite');

    expect(auditTimeline(mod, { isOddCyclePreset: false } as any).errorCount).toBe(0);
    expect(auditTimeline(mod, { isOddCyclePreset: true } as any).errorCount).toBe(0);
  });

  it('Edmonds-Karp finds shortest paths, pushes the bottleneck per edge and verifies the min-cut', () => {
    const mod = moduleById('edmonds-karp');
    const input = {
      nodes: ['S', 'A', 'B', 'T'],
      edges: [
        { from: 'S', to: 'A', capacity: 10 },
        { from: 'S', to: 'B', capacity: 10 },
        { from: 'A', to: 'B', capacity: 2 },
        { from: 'A', to: 'T', capacity: 4 },
        { from: 'B', to: 'T', capacity: 8 },
      ],
      source: 'S',
      sink: 'T',
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'edmonds-karp-bfs-shortest').length).toBe(1);
    expect(timeline.filter((f) => f.checkpoint?.id === 'edmonds-karp-bottleneck').length).toBe(1);

    // Two successful rounds then one exhausted BFS.
    expect(timeline.filter((f) => f.action === 'BFS_START').length).toBe(3);

    // Paths: S→A→T with Δ=4, then S→B→T with Δ=8.
    const paths = timeline.filter((f) => f.action === 'PATH_FOUND');
    expect(paths.map((f) => f.variables?.augmentingPath)).toEqual(['S -> A -> T', 'S -> B -> T']);
    const bottlenecks = timeline.filter((f) => f.action === 'BOTTLENECK');
    expect(bottlenecks.map((f) => f.variables?.bottleneck)).toEqual([4, 8]);

    // Each augmentation mutates one path edge per frame before the total grows.
    const edgePushes = timeline.filter((f) => f.action === 'AUGMENT_EDGE');
    expect(edgePushes.length).toBe(4);
    expect(edgePushes.every((f) => f.variables?.direction === 'FORWARD_PUSH')).toBe(true);
    const totals = timeline.filter((f) => f.action === 'AUGMENT_FLOW');
    expect(totals.map((f) => f.variables?.newTotalFlow)).toEqual([4, 12]);

    // Rejections are explicit: saturated edges and already-visited targets.
    const rejects = timeline.filter((f) => f.action === 'BFS_REJECT');
    expect(rejects.filter((f) => f.variables?.reason === 'SATURATED').length).toBe(3);
    expect(rejects.filter((f) => f.variables?.reason === 'ALREADY_VISITED').length).toBe(6);

    // Termination: BFS reaches no sink, then return maxFlow.
    const noPaths = timeline.filter((f) => f.action === 'NO_MORE_PATHS');
    expect(noPaths.length).toBe(1);
    expect(noPaths[0].milestoneTitle).toBe('No More Paths (flow 12)');

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Max Flow = 12');
    expect(final.variables?.maxFlow).toBe(12);
    expect(final.variables?.rounds).toBe(2);
    const flows = final.state.edges.map((e: any) => e.flow);
    expect(flows).toEqual([4, 8, 0, 4, 8]);

    // The min-cut partitions: S side {S, A, B} vs {T}, all crossing edges saturated.
    expect(noPaths[0].variables?.minCutS).toBe('[S, A, B]');
    expect(noPaths[0].variables?.minCutT).toBe('[T]');

    // Bridge-network preset still runs audit-clean.
    const preset = mod.presets[1];
    expect(auditTimeline(mod, preset.data as any).errorCount).toBe(0);
    expect(auditTimeline(mod, input).errorCount).toBe(0);
  });

  it('Dinic alternates level-graph BFS with blocking flows and terminates on the max flow', () => {
    const mod = moduleById('dinics-algorithm');
    const input = {
      nodes: ['S', 'A', 'B', 'C', 'T'],
      edges: [
        { from: 'S', to: 'A', capacity: 10 },
        { from: 'S', to: 'B', capacity: 10 },
        { from: 'A', to: 'C', capacity: 4 },
        { from: 'A', to: 'T', capacity: 8 },
        { from: 'B', to: 'C', capacity: 9 },
        { from: 'C', to: 'T', capacity: 10 },
      ],
      source: 'S',
      sink: 'T',
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'dinic-blocking-flow').length).toBe(1);

    // Two successful level graphs, the second strictly deeper.
    expect(timeline.filter((f) => f.action === 'BFS_START').length).toBe(3);
    const built = timeline.filter((f) => f.action === 'LEVEL_GRAPH_BUILT');
    expect(built.map((f) => f.milestoneTitle)).toEqual([
      'Phase 1 Level Graph (Sink dist = 2)',
      'Phase 2 Level Graph (Sink dist = 3)',
    ]);

    // Every admissible path strictly increases in level and gets its own frame.
    const paths = timeline.filter((f) => f.action === 'PATH_FOUND');
    expect(paths.map((f) => f.variables?.path)).toEqual([
      'S -> A -> T',
      'S -> A -> C -> T',
      'S -> B -> C -> T',
    ]);

    // Per-edge pushes then the maxFlow update: 8, then 8→10→18.
    const edgePushes = timeline.filter((f) => f.action === 'AUGMENT_EDGE');
    expect(edgePushes.length).toBe(8);
    expect(edgePushes.every((f) => f.variables?.direction === 'FORWARD_PUSH')).toBe(true);
    const updates = timeline.filter((f) => f.action === 'MAXFLOW_UPDATE');
    expect(updates.map((f) => f.variables?.currentFlow)).toEqual([8, 10, 18]);

    // Blocking-flow completion frames carry the per-phase totals.
    const done = timeline.filter((f) => f.action === 'BLOCKING_FLOW_DONE');
    expect(done.map((f) => f.variables?.phasePushed)).toEqual([8, 10]);

    // Level-graph rejections distinguish saturated edges from already-labeled ones.
    const rejects = timeline.filter((f) => f.action === 'LEVEL_REJECT');
    expect(rejects.filter((f) => f.variables?.reason === 'NO_RESIDUAL').length).toBe(4);
    expect(rejects.filter((f) => f.variables?.reason === 'ALREADY_LABELED').length).toBe(9);

    // Termination: the sink never gets a level, so the algorithm returns the max flow.
    const term = timeline.filter((f) => f.action === 'TERMINATED');
    expect(term.length).toBe(1);
    expect(term[0].milestoneTitle).toBe('Max Flow Reached: 18');
    const final = timeline[timeline.length - 1];
    expect(final.state.totalFlow).toBe(18);
    expect(final.state.edges.map((e: any) => e.flow)).toEqual([10, 8, 2, 8, 8, 10]);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[1].data as any).errorCount).toBe(0);
  });

  it('Hopcroft-Karp builds layers, prunes dead ends, and flips one augmenting path per search', () => {
    const mod = moduleById('hopcroft-karp');
    const input = {
      uCount: 4,
      vCount: 4,
      edges: [
        { u: 1, v: 1 },
        { u: 1, v: 2 },
        { u: 2, v: 1 },
        { u: 2, v: 3 },
        { u: 3, v: 2 },
        { u: 3, v: 4 },
        { u: 4, v: 3 },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'hopcroft-karp-layer-dfs').length).toBe(1);

    // Three BFS calls: two build a level graph, the last finds no free U vertex.
    expect(timeline.filter((f) => f.action === 'BFS_INIT').length).toBe(3);
    const builds = timeline.filter((f) => f.action === 'BFS_LAYER_BUILT');
    expect(builds.map((f) => f.variables?.shortestAugPathLength)).toEqual([1, 4]);

    // One frame per operation: dequeues, level assignments and rejections.
    expect(timeline.filter((f) => f.action === 'DEQUEUE').length).toBe(10);
    expect(timeline.filter((f) => f.action === 'LEVEL_ASSIGN').length).toBe(5);
    expect(timeline.filter((f) => f.action === 'LEVEL_REJECT').length).toBe(9);

    // DFS: 5 search attempts, 7 layered tries, 4 non-layered rejections, 1 pruning.
    expect(timeline.filter((f) => f.action === 'DFS_SEARCH').length).toBe(5);
    expect(timeline.filter((f) => f.action === 'DFS_TRY').length).toBe(7);
    expect(timeline.filter((f) => f.action === 'DFS_REJECT').length).toBe(4);
    const prunes = timeline.filter((f) => f.action === 'DFS_PRUNE');
    expect(prunes.length).toBe(1);
    expect(prunes[0].variables?.pruned).toBe('U4');

    // Four augmentations: first phase picks U1, U2, U3; second phase reroutes through U4.
    const augments = timeline.filter((f) => f.action === 'AUGMENT_PATH');
    expect(augments.length).toBe(4);
    expect(augments.map((f) => f.variables?.newMatchingSize)).toEqual([1, 2, 3, 4]);

    // Perfect matching on this graph: U1-V2, U2-V1, U3-V4, U4-V3.
    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Max Matching: 4 Pairs');
    expect(final.state.matchingSize).toBe(4);
    expect(final.state.pairU).toEqual({ 1: 2, 2: 1, 3: 4, 4: 3 });

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[1].data as any).errorCount).toBe(0);
  });

  it('Hierholzer consumes edges one by one, pops stuck vertices in postorder, and reports partial trails honestly', () => {
    const mod = moduleById('hierholzer-eulerian');
    const input = {
      nodes: ['1', '2', '3', '4', '5'],
      edges: [
        { u: '1', v: '2' },
        { u: '2', v: '3' },
        { u: '3', v: '4' },
        { u: '4', v: '1' },
        { u: '1', v: '3' },
        { u: '2', v: '4' },
        { u: '3', v: '5' },
        { u: '4', v: '5' },
      ],
      startNode: '1',
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'hierholzer-stuck-pop').length).toBe(1);

    // Parity analysis up front: vertices 1 and 2 have odd degree.
    const init = timeline[0];
    expect(init.variables?.oddVertices).toBe('1, 2');

    // Every consumed edge is a separate select frame, in deterministic id order.
    const selects = timeline.filter((f) => f.action === 'SELECT_EDGE');
    expect(selects.map((f) => f.variables?.edgeId)).toEqual([0, 1, 2, 3, 4, 6, 7, 5]);
    expect(timeline.filter((f) => f.action === 'PUSH_VERTEX').length).toBe(8);
    expect(timeline.filter((f) => f.action === 'BACKTRACK_POP').length).toBe(9);

    // Known Eulerian trail from 1 to 2 covering every edge once.
    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Eulerian Trail Complete');
    expect(final.variables?.unusedEdges).toBe(0);
    expect(final.state.circuit.join(' -> ')).toBe('1 -> 2 -> 3 -> 4 -> 1 -> 3 -> 5 -> 4 -> 2');

    // Disconnected edges: 4 odd-degree vertices, trail must not claim completeness.
    const partial = mod.generateTimeline({
      nodes: ['1', '2', '3', '4'],
      edges: [
        { u: '1', v: '2' },
        { u: '3', v: '4' },
      ],
      startNode: '1',
    });
    const partialFinal = partial[partial.length - 1];
    expect(partialFinal.milestoneTitle).toBe('Partial Trail (1 edge unused)');
    expect(partialFinal.variables?.unusedEdges).toBe(1);
    expect(partialFinal.state.circuit.join(' -> ')).toBe('1 -> 2');

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, {
      nodes: ['1', '2', '3', '4'],
      edges: [
        { u: '1', v: '2' },
        { u: '3', v: '4' },
      ],
      startNode: '1',
    }).errorCount).toBe(0);
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
