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
