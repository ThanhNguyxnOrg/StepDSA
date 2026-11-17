import { describe, it, expect } from 'vitest';
import { getModuleById } from './registry';
import { auditTimeline } from '../core/timelineAudit';
import { resolveActiveCodeLine } from '../utils/codeLineResolver';

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

  it('Hamiltonian backtracking prunes visited neighbors, evaluates closure and undoes failed branches', () => {
    const mod = moduleById('hamiltonian-path');
    const input = {
      vertices: [1, 2, 3, 4, 5],
      edges: [
        { u: 1, v: 2 },
        { u: 2, v: 3 },
        { u: 3, v: 4 },
        { u: 4, v: 5 },
        { u: 5, v: 1 },
      ],
      requireCycle: true,
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'hamiltonian-pruning').length).toBe(1);

    // Pentagon: 4 explores, 3 visited-prunes, then closure and solution immediately.
    expect(timeline.filter((f) => f.action === 'EXPLORE_STEP').length).toBe(4);
    expect(timeline.filter((f) => f.action === 'SKIP_VISITED').length).toBe(3);
    expect(timeline.filter((f) => f.action === 'EVALUATE_CLOSURE').length).toBe(1);
    const solutions = timeline.filter((f) => f.action === 'SOLUTION_FOUND');
    expect(solutions.length).toBe(1);
    expect(solutions[0].milestoneTitle).toBe('Hamiltonian Cycle Found!');
    expect(timeline.filter((f) => f.milestoneTitle?.startsWith('Halfway')).length).toBe(1);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Hamiltonian Cycle Confirmed');
    expect(final.state.foundPath).toEqual([1, 2, 3, 4, 5]);
    expect(final.state.foundCycle).toBe(true);

    // Open path preset: closure edge missing but requireCycle is false, so it still succeeds.
    const preset = mod.presets[1];
    const presetTimeline = mod.generateTimeline(preset.data as any);
    const presetSolutions = presetTimeline.filter((f) => f.action === 'SOLUTION_FOUND');
    expect(presetSolutions.length).toBe(1);
    expect(presetSolutions[0].milestoneTitle).toBe('Hamiltonian Path Found!');
    expect(presetTimeline[presetTimeline.length - 1].milestoneTitle).toBe('Hamiltonian Path Confirmed');

    // Unsolvable input: every branch fails, so the search backtracks and reports no solution.
    const unsolvable = mod.generateTimeline({
      vertices: [1, 2, 3],
      edges: [{ u: 1, v: 2 }],
      requireCycle: false,
    });
    expect(unsolvable.filter((f) => f.action === 'BACKTRACK').length).toBe(1);
    const noSolution = unsolvable[unsolvable.length - 1];
    expect(noSolution.milestoneTitle).toBe('No Hamiltonian Configuration');
    expect(noSolution.state.foundPath).toBeNull();
    expect(noSolution.variables?.exists).toBe(false);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, {
      vertices: [1, 2, 3],
      edges: [{ u: 1, v: 2 }],
      requireCycle: false,
    }).errorCount).toBe(0);
    expect(auditTimeline(mod, preset.data as any).errorCount).toBe(0);
  });

  it('Warshall pivot rounds split init into zeros/diagonal/edges and skip unreachable source rows', () => {
    const mod = moduleById('transitive-closure');
    const input = {
      nodes: ['0', '1', '2', '3'],
      edges: [
        { from: '0', to: '1' },
        { from: '1', to: '2' },
        { from: '2', to: '3' },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'warshall-pivot').length).toBe(1);

    // Init is three honest frames: zeros, diagonal, direct edges.
    expect(timeline.filter((f) => f.codeLine === 2).length).toBe(1);
    expect(timeline.filter((f) => f.codeLine === 3).length).toBe(1);
    expect(timeline.filter((f) => f.action === 'INIT').length).toBe(1);

    // One pivot per vertex, with four row scans in the last round.
    const pivots = timeline.filter((f) => f.action === 'PIVOT_SELECT');
    expect(pivots.map((f) => f.milestoneTitle)).toEqual([
      'Pivot Node 0 (k=0)',
      'Pivot Node 1 (k=1)',
      'Pivot Node 2 (k=2)',
      'Pivot Node 3 (k=3)',
    ]);
    expect(timeline.filter((f) => f.action === 'ROW_SCAN').length).toBe(10);
    expect(timeline.filter((f) => f.action === 'ROW_SKIP').length).toBe(6);

    // Chain graph: exactly three new reachabilities, in DP order.
    const updates = timeline.filter((f) => f.action === 'REACHABILITY_DISCOVERED');
    expect(updates.map((f) => f.milestoneTitle)).toEqual([
      'New Path: 0 → 2',
      'New Path: 0 → 3',
      'New Path: 1 → 3',
    ]);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Transitive Closure Complete');
    expect(final.state.matrix).toEqual([
      [1, 1, 1, 1],
      [0, 1, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 1],
    ]);
    expect(final.variables?.reachablePairs).toBe(10);

    // Cycle preset: 0, 1, 2 all reach everything; isolated sink 3 reaches only itself → 13 pairs.
    const preset = mod.presets[1];
    const presetFinal = mod.generateTimeline(preset.data as any);
    expect(presetFinal[presetFinal.length - 1].variables?.reachablePairs).toBe(13);
    expect(presetFinal[presetFinal.length - 1].state.matrix[3]).toEqual([0, 0, 0, 1]);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, preset.data as any).errorCount).toBe(0);
  });

  it('Welsh-Powell colors degree-ordered classes with explicit conflict, skip and assign frames', () => {
    const mod = moduleById('graph-coloring');
    const input = {
      nodes: ['A', 'B', 'C', 'D', 'E'],
      edges: [
        { u: 'A', v: 'B' },
        { u: 'B', v: 'C' },
        { u: 'C', v: 'D' },
        { u: 'D', v: 'E' },
        { u: 'E', v: 'A' },
      ],
    };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'welsh-powell-degree-order').length).toBe(1);

    // Init is two honest frames: degrees then the degree sort.
    expect(timeline.filter((f) => f.action === 'INIT_DEGREES').length).toBe(1);
    expect(timeline.filter((f) => f.action === 'INIT_DEGREE_SORT').length).toBe(1);

    // Three color classes open; non-adjacent vertices join existing classes.
    expect(timeline.filter((f) => f.action === 'COLOR_PRIMARY_VERTEX').length).toBe(3);
    expect(timeline.filter((f) => f.action === 'COLOR_GREEDY_PASS').length).toBe(2);
    expect(timeline.filter((f) => f.action === 'CHECK_CONFLICT').length).toBe(4);
    // Single sweep over the sorted order: only C and D are already colored when reached.
    expect(timeline.filter((f) => f.action === 'OUTER_SKIP').length).toBe(2);
    expect(timeline.filter((f) => f.action === 'INNER_SKIP').length).toBe(9);

    // Pentagon: A, C emerald; B, D cyan; E amber — three classes.
    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Coloring Finished: 3 Colors');
    expect(final.state.colors).toEqual({ A: 0, B: 1, C: 0, D: 1, E: 2 });

    // A triangle must use three distinct colors.
    const triangle = mod.generateTimeline({
      nodes: ['A', 'B', 'C'],
      edges: [
        { u: 'A', v: 'B' },
        { u: 'B', v: 'C' },
        { u: 'C', v: 'A' },
      ],
    });
    const triColors = triangle[triangle.length - 1].state.colors;
    expect(new Set(Object.values(triColors)).size).toBe(3);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, {
      nodes: ['A', 'B', 'C'],
      edges: [
        { u: 'A', v: 'B' },
        { u: 'B', v: 'C' },
        { u: 'C', v: 'A' },
      ],
    }).errorCount).toBe(0);
  });

  it('flood fill spreads one ring per dequeue with explicit bounds and color rejections', () => {
    const mod = moduleById('flood-fill');
    const input = {
      grid: [
        [1, 1, 0],
        [1, 0, 0],
        [0, 0, 0],
      ],
      startRow: 0,
      startCol: 0,
      newColor: 2,
    };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'flood-fill-visited-by-color').length).toBe(1);

    // Seed path: init, queue, fill; then 3 dequeues and 2 fill/enqueue pairs.
    expect(timeline.filter((f) => f.codeLine === 4).length).toBe(1);
    expect(timeline.filter((f) => f.action === 'DEQUEUE_CELL').length).toBe(3);
    expect(timeline.filter((f) => f.codeLine === 11).length).toBe(2);
    expect(timeline.filter((f) => f.action === 'ENQUEUE_CELL').length).toBe(2);

    // Every rejected neighbor explains why: 4 out-of-bounds, 6 wrong color.
    const rejects = timeline.filter((f) => f.action === 'NEIGHBOR_REJECT');
    expect(rejects.length).toBe(10);
    expect(rejects.filter((f) => f.variables?.reason === 'OUT_OF_BOUNDS').length).toBe(4);
    expect(rejects.filter((f) => f.variables?.reason === 'COLOR_MISMATCH').length).toBe(6);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Flood Fill Finished (3 Cells)');
    expect(final.state.filledCount).toBe(3);
    expect(final.state.grid).toEqual([
      [2, 2, 0],
      [2, 0, 0],
      [0, 0, 0],
    ]);

    // Identical colors: the early exit guards against an unmarkable wavefront.
    const noop = mod.generateTimeline({
      grid: [
        [1, 1],
        [0, 0],
      ],
      startRow: 0,
      startCol: 0,
      newColor: 1,
    } as any);
    expect(noop.length).toBe(2);
    expect(noop[1].milestoneTitle).toBe('Early Exit (Identical Color)');

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[0].data as any).errorCount).toBe(0);
  });

  it('graph representations insert each edge into matrix, list and edge list as separate frames', () => {
    const mod = moduleById('graph-representations');
    const input = {
      numVertices: 5,
      edges: [
        { u: 0, v: 1, weight: 4 },
        { u: 0, v: 2, weight: 2 },
        { u: 1, v: 2, weight: 1 },
        { u: 1, v: 3, weight: 5 },
        { u: 2, v: 3, weight: 8 },
        { u: 2, v: 4, weight: 10 },
        { u: 3, v: 4, weight: 2 },
      ],
      queries: [
        { type: 'hasEdge' as const, u: 0, v: 2 },
        { type: 'hasEdge' as const, u: 0, v: 3 },
        { type: 'getNeighbors' as const, u: 2 },
        { type: 'getNeighbors' as const, u: 3 },
      ],
    };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'graph-rep-space-time').length).toBe(1);

    // Every edge touches all three representations in its own frame.
    expect(timeline.filter((f) => f.action === 'INSERT_MATRIX').length).toBe(7);
    expect(timeline.filter((f) => f.action === 'INSERT_LIST').length).toBe(7);
    expect(timeline.filter((f) => f.action === 'INSERT_EDGELIST').length).toBe(7);

    // hasEdge: found and not-found both work in matrix and list form.
    const matrixQueries = timeline.filter((f) => f.action === 'QUERY_MATRIX_EDGE');
    const listQueries = timeline.filter((f) => f.action === 'QUERY_LIST_EDGE');
    expect(matrixQueries.map((f) => f.variables?.exists)).toEqual([true, false]);
    expect(listQueries.map((f) => f.variables?.exists)).toEqual([true, false]);
    expect(matrixQueries[0].variables?.lookupTime).toBe('O(1)');

    // getNeighbors: matrix scans V cells, list scans only the degree.
    const matrixNb = timeline.filter((f) => f.action === 'MATRIX_GET_NEIGHBORS');
    const listNb = timeline.filter((f) => f.action === 'LIST_GET_NEIGHBORS');
    expect(matrixNb.map((f) => f.variables?.scannedCells)).toEqual([5, 5]);
    expect(listNb.map((f) => f.variables?.degree)).toEqual([4, 3]);

    const final = timeline[timeline.length - 1];
    expect(final.action).toBe('COMPLETE');
    expect(final.variables?.E).toBe(7);

    // Dense preset K4: 6 edges, degree-3 neighbors.
    const dense = mod.presets[1];
    const denseTimeline = mod.generateTimeline(dense.data as any);
    expect(denseTimeline.filter((f) => f.action === 'INSERT_MATRIX').length).toBe(6);
    expect(denseTimeline.filter((f) => f.action === 'LIST_GET_NEIGHBORS')[0].variables?.degree).toBe(3);

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, dense.data as any).errorCount).toBe(0);
  });

  it('BST inserts follow one comparison chain per value and ignore duplicates honestly', () => {
    const mod = moduleById('bst-insert');
    const input = { valuesToInsert: [50, 25, 75, 12, 37, 62, 87] };
    const timeline = mod.generateTimeline(input);

    expect(timeline.filter((f) => f.checkpoint?.id === 'bst-insert-path').length).toBe(1);

    // Root plus one create and one attach frame per remaining value.
    expect(timeline.filter((f) => f.milestoneTitle?.startsWith('Root Inserted')).length).toBe(1);
    const creates = timeline.filter((f) => f.codeLine === 3);
    expect(creates.length).toBe(7); // 1 root + 6 created leaves
    const attaches = timeline.filter((f) => f.milestoneTitle?.startsWith('Inserted '));
    expect(attaches.length).toBe(6);

    // Comparisons: direction sequence is exactly the search paths.
    const compares = timeline.filter((f) => f.variables?.direction !== undefined);
    expect(compares.map((f) => f.variables?.direction).join(',')).toBe(
      'left,right,left,left,left,right,right,left,right,right'
    );
    // Left comparisons <- line 4, right comparisons -> line 6.
    expect(timeline.filter((f) => f.codeLine === 4).length).toBe(5);
    expect(timeline.filter((f) => f.codeLine === 6).length).toBe(5);
    // Left links use line 5, right links line 7.
    expect(timeline.filter((f) => f.codeLine === 5).length).toBe(3);
    expect(timeline.filter((f) => f.codeLine === 7).length).toBe(3);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Inserted 87');
    expect(final.state.nodes.length).toBe(7);

    // Duplicates: the strict comparisons both fail, so nothing is inserted.
    const dup = mod.generateTimeline({ valuesToInsert: [50, 50] });
    const dupFrames = dup.filter((f) => f.milestoneTitle === 'Duplicate 50 Ignored');
    expect(dupFrames.length).toBe(1);
    expect(dupFrames[0].conditionEval?.result).toBe(false);
    expect(dup[dup.length - 1].state.nodes.length).toBe(1);

    expect(auditTimeline(mod, input).errorCount).toBe(0);
    expect(auditTimeline(mod, { valuesToInsert: [50, 50] }).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[2].data as any).errorCount).toBe(0); // skewed preset
  });

  it('BST delete walks one path, handles all three cases, and swaps the inorder successor', () => {
    const mod = moduleById('bst-delete');
    const base = [50, 25, 75, 12, 37, 62, 87];

    // Case 3: two children at the root — successor 62 replaces 50.
    const two = mod.generateTimeline({ initialValues: base, keyToDelete: 50 });
    expect(two.filter((f) => f.checkpoint?.id === 'bst-delete-successor').length).toBe(1);
    expect(two.filter((f) => f.action === 'ENTER_CASE_3').length).toBe(1);
    const succ = two.filter((f) => f.action === 'SUCCESSOR_CONFIRMED');
    expect(succ.length).toBe(1);
    expect(succ[0].milestoneTitle).toBe('Successor Identified: 62');
    expect(two.filter((f) => f.action === 'OVERWRITE_VALUE').length).toBe(1);
    expect(two.filter((f) => f.action === 'PRUNE_OLD_SUCCESSOR').length).toBe(1);
    const verify = two.filter((f) => f.action === 'VERIFY_BST_INVARIANT');
    expect(verify.length).toBe(1);
    expect(verify[0].milestoneTitle).toBe('BST Invariant Verified');
    expect(two[two.length - 1].state.nodes.length).toBe(6);

    // Case 1: leaf 12 — single unlink frame; root compared once, then 25 exactly once.
    const leaf = mod.generateTimeline({ initialValues: base, keyToDelete: 12 });
    expect(leaf.filter((f) => f.milestoneTitle === 'Leaf Node (12) Unlinked').length).toBe(1);
    expect(leaf.filter((f) => f.codeLine === 3).length).toBe(2); // inspect root + compare node 25, no duplication
    expect(leaf[leaf.length - 1].state.nodes.length).toBe(6);

    // Case 2: node 25 with a single right child — child 37 is promoted.
    const single = mod.generateTimeline({
      initialValues: [50, 25, 75, 37, 62, 87],
      keyToDelete: 25,
    });
    const promo = single.filter((f) => f.milestoneTitle?.startsWith('Promoted Child'));
    expect(promo.length).toBe(1);
    expect(promo[0].milestoneTitle).toBe('Promoted Child (37)');
    expect(promo[0].codeLine).toBe(6); // left is null -> return root.right
    expect(single[single.length - 1].state.nodes.length).toBe(5);

    // Not found: search falls off a null leaf without mutating the tree.
    const missing = mod.generateTimeline({ initialValues: base, keyToDelete: 99 });
    const notFound = missing.filter((f) => f.milestoneTitle === 'Key 99 Not Found');
    expect(notFound.length).toBe(1);
    expect(notFound[0].codeLine).toBe(2);
    expect(missing[missing.length - 1].state.nodes.length).toBe(7);

    expect(auditTimeline(mod, { initialValues: base, keyToDelete: 50 }).errorCount).toBe(0);
    expect(auditTimeline(mod, { initialValues: base, keyToDelete: 99 }).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[2].data as any).errorCount).toBe(0);
  });

  it('tree traversals visit at the correct recursion moment and share one NULL base case', () => {
    const mod = moduleById('tree-traversals');
    const values = [2, 1, 3];

    const run = (mode: 'preorder' | 'inorder' | 'postorder') => mod.generateTimeline({ values, mode } as any);

    const pre = run('preorder');
    const ino = run('inorder');
    const post = run('postorder');

    // One checkpoint per mode, on the first recorded visit.
    for (const timeline of [pre, ino, post]) {
      expect(timeline.filter((f) => f.checkpoint?.id === 'tree-traversal-order').length).toBe(1);
      // Shared recursion skeleton: 3 enters, 4 NULL base cases, 1 completion.
      expect(timeline.filter((f) => f.codeLine === 5).length).toBe(3);
      expect(timeline.filter((f) => f.codeLine === 6).length).toBe(4);
      expect(timeline.filter((f) => f.codeLine === 4).length).toBe(1);
    }

    // Recording moments and resulting orders differ per mode.
    expect(pre.filter((f) => f.codeLine === 7).length).toBe(3);
    expect(ino.filter((f) => f.codeLine === 9).length).toBe(3);
    expect(post.filter((f) => f.codeLine === 11).length).toBe(3);

    const visits = (timeline: any[]) =>
      timeline.filter((f) => f.milestoneTitle?.startsWith('Visit ')).map((f) => f.variables?.recorded);
    expect(visits(pre)).toEqual([2, 1, 3]);
    expect(visits(ino)).toEqual([1, 2, 3]);
    expect(visits(post)).toEqual([1, 3, 2]);

    expect(pre[pre.length - 1].variables?.completedSequence).toBe('2, 1, 3');
    expect(ino[ino.length - 1].variables?.completedSequence).toBe('1, 2, 3');
    expect(post[post.length - 1].variables?.completedSequence).toBe('1, 3, 2');

    // Inorder of a BST is sorted — the signature property.
    expect(visits(ino)).toEqual([...visits(ino)].sort((a: any, b: any) => a - b));

    expect(auditTimeline(mod, { values, mode: 'preorder' } as any).errorCount).toBe(0);
    expect(auditTimeline(mod, { values, mode: 'postorder' } as any).errorCount).toBe(0);
  });

  it('level-order traversal snapshots level sizes, seales each level and uses a FIFO queue', () => {
    const mod = moduleById('level-order-traversal');
    const timeline = mod.generateTimeline([50, 30, 70, 20, 40, 60, 80] as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'level-order-queue-fifo').length).toBe(1);

    // Three levels, each opened with a size snapshot and sealed with result.append.
    const levelStarts = timeline.filter((f) => f.milestoneTitle?.startsWith('Level ') && f.milestoneTitle?.includes('('));
    expect(levelStarts.map((f) => f.variables?.levelSize)).toEqual([1, 2, 4]);
    const seals = timeline.filter((f) => f.milestoneTitle?.endsWith('Complete') && f.codeLine === 12);
    expect(seals.map((f) => f.variables?.sealedLevel)).toEqual([1, 2, 3]);

    // One dequeue+visit per node, one enqueue per edge.
    expect(timeline.filter((f) => f.codeLine === 8).length).toBe(7);
    expect(timeline.filter((f) => f.codeLine === 9).length).toBe(7);
    expect(timeline.filter((f) => f.codeLine === 10).length).toBe(3);
    expect(timeline.filter((f) => f.codeLine === 11).length).toBe(3);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Traversal Complete');
    expect(final.state.visitedLevels).toEqual([
      [50],
      [30, 70],
      [20, 40, 60, 80],
    ]);

    // Zig-zag preset [10,5,15,3,12,18]: levels [10], [5,15], [3,12,18].
    const skewed = mod.generateTimeline(mod.presets[1].data as any);
    const skewedFinal = skewed[skewed.length - 1];
    expect(skewedFinal.state.visitedLevels).toEqual([
      [10],
      [5, 15],
      [3, 12, 18],
    ]);

    expect(auditTimeline(mod, [50, 30, 70, 20, 40, 60, 80] as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[1].data as any).errorCount).toBe(0);
  });

  it('binary heap sifts up to the root, extracts the max, and sifts down one path', () => {
    const mod = moduleById('binary-heap');
    const timeline = mod.generateTimeline([80, 65, 75, 40, 50, 60] as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'binary-heap-single-path').length).toBe(1);

    // Insert 95: two comparisons and two swaps bring it to the root.
    const compares = timeline.filter((f) => f.codeLine === 6);
    expect(compares.length).toBe(2);
    expect(compares.map((f) => f.conditionEval?.result)).toEqual([true, true]);
    expect(timeline.filter((f) => f.codeLine === 7).length).toBe(2);
    const insertDone = timeline.filter((f) => f.milestoneTitle === 'Inserted 95 Successfully');
    expect(insertDone.length).toBe(1);
    expect(insertDone[0].variables?.root).toBe(95);

    // Extract: root replaced by the last leaf, then two largest-child scans and one swap.
    const extract = timeline.filter((f) => f.milestoneTitle === 'Extract-Max (95)');
    expect(extract.length).toBe(1);
    expect(extract[0].variables?.temporaryRoot).toBe(75);
    expect(timeline.filter((f) => f.action === 'FIND_LARGEST_CHILD').length).toBe(2);
    expect(timeline.filter((f) => f.codeLine === 18).length).toBe(1);
    const siftDone = timeline.filter((f) => f.action === 'SIFT_DOWN_DONE');
    expect(siftDone.length).toBe(1);
    expect(siftDone[0].variables?.stoppedAtIndex).toBe(2);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Heap Operations Complete');
    expect(final.variables?.finalRoot).toBe(80);
    expect(final.state.heap).toEqual([80, 65, 75, 40, 50, 60]);

    expect(auditTimeline(mod, [80, 65, 75, 40, 50, 60] as any).errorCount).toBe(0);
  });

  it("Floyd's build-heap scans internal nodes bottom-up and stops early on valid subtrees", () => {
    const mod = moduleById('max-heap-build');
    const timeline = mod.generateTimeline([4, 10, 3, 5, 1, 9, 8] as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'floyd-build-heap-linear').length).toBe(1);

    // Three internal nodes (2, 1, 0) each get a loop frame; heapify descends 6 times total.
    const loops = timeline.filter((f) => f.milestoneTitle?.startsWith('Processing Subtree Root'));
    expect(loops.map((f) => f.variables?.currentInternalIdx)).toEqual([2, 1, 0]);
    expect(timeline.filter((f) => f.codeLine === 8).length).toBe(6); // entries at 2,5,1,0,1,3

    // Three swaps and three early stops.
    const swaps = timeline.filter((f) => f.milestoneTitle?.startsWith('Sift Down Swap'));
    expect(swaps.map((f) => f.milestoneTitle)).toEqual([
      'Sift Down Swap (3 ↔ 9)',
      'Sift Down Swap (4 ↔ 10)',
      'Sift Down Swap (4 ↔ 5)',
    ]);
    const stops = timeline.filter((f) => f.variables?.stopReason === 'PARENT_ALREADY_LARGEST');
    expect(stops.length).toBe(3);
    expect(stops.map((f) => f.variables?.idx)).toEqual([5, 1, 3]);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Build-Heap Complete');
    expect(final.variables?.maxElement).toBe(10);
    expect(final.state.heapArray).toEqual([10, 5, 9, 4, 1, 3, 8]);

    // Ascending input still produces a valid max heap with root 7.
    const asc = mod.generateTimeline(mod.presets[1].data as any);
    const ascFinal = asc[asc.length - 1];
    expect(ascFinal.variables?.maxElement).toBe(7);
    expect(ascFinal.state.heapArray[0]).toBe(7);

    expect(auditTimeline(mod, [4, 10, 3, 5, 1, 9, 8] as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[1].data as any).errorCount).toBe(0);
  });

  it('trie reuses shared-prefix nodes, marks word ends, and reports missing prefixes honestly', () => {
    const mod = moduleById('trie-prefix');
    const input = { wordsToInsert: ['cat', 'car', 'cart', 'dog', 'dot'], searchPrefix: 'car' };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'trie-shared-prefix').length).toBe(1);

    // 16 characters total: 9 new nodes created, 7 characters reuse existing nodes.
    expect(timeline.filter((f) => f.action === 'CREATE_NODE').length).toBe(9);
    const moves = timeline.filter((f) => f.action === 'MOVE_CURSOR');
    expect(moves.length).toBe(16);
    expect(moves.filter((f) => f.variables?.reused === true).length).toBe(7);

    // One end-of-word marker per inserted word.
    const ends = timeline.filter((f) => f.action === 'SET_END_OF_WORD');
    expect(ends.map((f) => f.variables?.word)).toEqual(['cat', 'car', 'cart', 'dog', 'dot']);

    // Prefix "car": three matching steps, then completions car + cart.
    expect(timeline.filter((f) => f.action === 'PREFIX_MATCH').length).toBe(3);
    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Prefix "car" Found');
    expect(final.variables?.completionsCount).toBe(2);
    expect(final.state.matchedWords).toEqual(['car', 'cart']);

    // Missing prefix: the walk stops at the first absent character and says so.
    const missing = mod.generateTimeline({ wordsToInsert: ['cat', 'car'], searchPrefix: 'cax' } as any);
    const miss = missing.filter((f) => f.action === 'PREFIX_MISS');
    expect(miss.length).toBe(1);
    expect(miss[0].variables?.missingChar).toBe('x');
    const missFinal = missing[missing.length - 1];
    expect(missFinal.milestoneTitle).toBe('Prefix "cax" Not Found');
    expect(missFinal.variables?.completionsCount).toBe(0);

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, { wordsToInsert: ['cat', 'car'], searchPrefix: 'cax' } as any).errorCount).toBe(0);
  });

  it('segment tree builds leaf-by-leaf and decomposes a range into full-cover segments', () => {
    const mod = moduleById('segment-tree');

    // Default: [1,3,5,7] query [1,3] = 3 + 5 + 7 = 15.
    const timeline = mod.generateTimeline({ array: [1, 3, 5, 7], query: [1, 3] } as any);
    expect(timeline.filter((f) => f.checkpoint?.id === 'segment-tree-log-decomposition').length).toBe(1);

    // Build first: 4 leaves then 3 merges, root merge announces completion.
    expect(timeline.filter((f) => f.action === 'BUILD_LEAF').length).toBe(4);
    const merges = timeline.filter((f) => f.action === 'BUILD_MERGE');
    expect(merges.length).toBe(3);
    expect(merges[merges.length - 1].milestoneTitle).toBe('Segment Tree Built');
    expect(merges[merges.length - 1].variables?.mergedSum).toBe(16);

    // Query [1,3]: 5 visits, 2 splits on the left boundary, one right subtree taken whole.
    expect(timeline.filter((f) => f.action === 'QUERY_VISIT').length).toBe(5);
    expect(timeline.filter((f) => f.action === 'SPLIT').length).toBe(2);
    const overlaps = timeline.filter((f) => f.action === 'TOTAL_OVERLAP');
    expect(overlaps.map((f) => f.variables?.addedValue)).toEqual([3, 12]);
    expect(timeline.filter((f) => f.action === 'DISJOINT').length).toBe(1);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Query Result: 15');
    expect(final.variables?.totalRangeSum).toBe(15);

    // Full range hits the root in a single O(1) frame.
    const full = mod.generateTimeline({ array: [1, 3, 5, 7], query: [0, 3] } as any);
    expect(full.filter((f) => f.action === 'QUERY_VISIT').length).toBe(1);
    expect(full.filter((f) => f.action === 'SPLIT').length).toBe(0);
    expect(full.filter((f) => f.action === 'TOTAL_OVERLAP')[0].variables?.addedValue).toBe(16);
    expect(full[full.length - 1].milestoneTitle).toBe('Query Result: 16');

    expect(auditTimeline(mod, { array: [1, 3, 5, 7], query: [1, 3] } as any).errorCount).toBe(0);
    expect(auditTimeline(mod, { array: [1, 3, 5, 7], query: [0, 3] } as any).errorCount).toBe(0);
  });

  it('Fenwick tree folds each element into its covering blocks and tiles the prefix on query', () => {
    const mod = moduleById('fenwick-tree');
    const input = { array: [3, 2, -1, 6], queryIndex: 3 };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'fenwick-lowbit-blocks').length).toBe(1);

    // Build: every element visits exactly its covering blocks (8 add+advance pairs in total).
    expect(timeline.filter((f) => f.action === 'UPDATE_ADD').length).toBe(8);
    expect(timeline.filter((f) => f.action === 'UPDATE_ADVANCE').length).toBe(8);
    const adds = timeline.filter((f) => f.action === 'UPDATE_ADD');
    expect(adds[0].variables?.treeVal).toBe(3); // tree[1]
    expect(adds[adds.length - 1].variables?.treeVal).toBe(10); // tree[4] after all elements

    // Query [1..3] = tree[3] + tree[2] = -1 + 5.
    const queryAdds = timeline.filter((f) => f.action === 'QUERY_ADD');
    expect(queryAdds.map((f) => f.variables?.addedBlock)).toEqual(['[3..3]', '[1..2]']);
    expect(queryAdds.map((f) => f.variables?.partialSum)).toEqual([-1, 4]);
    expect(timeline.filter((f) => f.action === 'QUERY_ADVANCE').length).toBe(2);

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Prefix Sum [1..3] = 4');
    expect(final.variables?.prefixSumResult).toBe(4);

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[0].data as any).errorCount).toBe(0);
  });

  it('red-black fixup splits recolor/rotate cases and keeps the root black invariant', () => {
    const mod = moduleById('red-black-tree');
    const input = { keys: [10, 20, 30, 15, 25] };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'rb-fixup-cases').length).toBe(1);

    // Five red inserts and two root-black enforcements (after 10 and after the case-1 recolor).
    expect(timeline.filter((f) => f.action === 'INSERT_RED').length).toBe(5);
    expect(timeline.filter((f) => f.action === 'ROOT_BLACK').length).toBe(2);

    // Insert 30 triggers the symmetric case 3 (recolor + rotate on the grandparent).
    expect(timeline.filter((f) => f.action === 'RECOLOR_CASE_3_SYM').length).toBe(1);
    expect(timeline.filter((f) => f.action === 'ROTATE_CASE_3_SYM').length).toBe(1);

    // Insert 15 triggers case 1: recolor parent+uncle (8), grandparent (9), ascend (10).
    expect(timeline.filter((f) => f.action === 'RECOLOR_CASE_1').length).toBe(1);
    expect(timeline.filter((f) => f.action === 'RECOLOR_GRANDPARENT').length).toBe(1);
    expect(timeline.filter((f) => f.action === 'CASE1_ASCEND').length).toBe(1);

    // Final tree: 20 black root, 10 black left with 15 red child, 30 black with 25 red child.
    const tree = timeline[timeline.length - 1].state.tree;
    expect(tree.key).toBe(20);
    expect(tree.color).toBe('BLACK');
    expect(tree.left.key).toBe(10);
    expect(tree.left.color).toBe('BLACK');
    expect(tree.left.right.color).toBe('RED');
    expect(tree.right.key).toBe(30);
    expect(tree.right.color).toBe('BLACK');
    expect(tree.right.left.color).toBe('RED');

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[1].data as any).errorCount).toBe(0);
  });

  it('treap rotations bubble high priorities up while preserving the BST key order', () => {
    const mod = moduleById('treap');
    const input = {
      keys: [
        { key: 30, priority: 70 },
        { key: 10, priority: 90 },
        { key: 50, priority: 40 },
        { key: 20, priority: 85 },
        { key: 40, priority: 95 },
      ],
    };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'treap-heap-rotation').length).toBe(1);

    // Five insertions, each bracketed by start/complete frames.
    expect(timeline.filter((f) => f.action === 'START_INSERT').length).toBe(5);
    expect(timeline.filter((f) => f.action === 'INSERT_COMPLETE').length).toBe(5);

    // Three right rotations (pivots 30, 30, 50) and three left rotations (30, 20, 10).
    const rights = timeline.filter((f) => f.action === 'ROTATE_RIGHT');
    const lefts = timeline.filter((f) => f.action === 'ROTATE_LEFT');
    expect(rights.map((f) => f.variables?.pivot)).toEqual([30, 30, 50]);
    expect(lefts.map((f) => f.variables?.pivot)).toEqual([30, 20, 10]);

    // Priority 95 climbs to the root while keys stay ordered.
    const final = timeline[timeline.length - 1];
    expect(final.state.tree.key).toBe(40);
    expect(final.state.tree.priority).toBe(95);
    expect(final.state.tree.left.key).toBe(10);
    expect(final.state.tree.left.right.key).toBe(20);

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[1].data as any).errorCount).toBe(0);
  });

  it('splay applies zig-zig then zig to hoist the target and covers the zig-zag shape too', () => {
    const mod = moduleById('splay-tree');

    // Left chain [50,30,20,10], search 10.
    const timeline = mod.generateTimeline({ keys: [50, 30, 20, 10], searchKey: 10 } as any);
    expect(timeline.filter((f) => f.checkpoint?.id === 'splay-access-path').length).toBe(1);

    // Four search steps down the chain.
    expect(timeline.filter((f) => f.action === 'SEARCH').length).toBe(4);

    // Zig-zig on (30,20,10) uses identify/part1/part2, then a single zig at the root.
    const zigzig = timeline.filter((f) => f.action === 'ZIG_ZIG');
    expect(zigzig.map((f) => f.codeLine)).toEqual([15, 16, 18]);
    const zig = timeline.filter((f) => f.action === 'ZIG');
    expect(zig.length).toBe(1);
    expect(zig[0].milestoneTitle).toBe('Zig (Right Rotate) Root 50');

    const final = timeline[timeline.length - 1];
    expect(final.milestoneTitle).toBe('Splay Success: 10 is at Root');
    expect(final.state.tree.key).toBe(10);
    expect(final.state.tree.right.key).toBe(50);

    // Zig-zag shape: [30,10,20], search 20 exercises the LR double rotation.
    const zigzag = mod.generateTimeline({ keys: [30, 10, 20], searchKey: 20 } as any);
    const zzFrames = zigzag.filter((f) => f.action === 'ZIG_ZAG');
    expect(zzFrames.map((f) => f.codeLine)).toEqual([28, 30, 32]);
    expect(zigzag[zigzag.length - 1].state.tree.key).toBe(20);

    expect(auditTimeline(mod, { keys: [50, 30, 20, 10], searchKey: 10 } as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[1].data as any).errorCount).toBe(0);
  });

  it('2-3 B-tree splits overflowing nodes bottom-up and never exceeds capacity', () => {
    const mod = moduleById('b-tree');
    const input = { keys: [10, 20, 5, 6, 12, 30, 7, 17], order: 3 };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'btree-overflow-split').length).toBe(1);

    // Eight insertions; six descents; four splits, two of which grow the root.
    expect(timeline.filter((f) => f.action === 'START_INSERT').length).toBe(8);
    expect(timeline.filter((f) => f.action === 'INSERT_KEY').length).toBe(8);
    expect(timeline.filter((f) => f.action === 'TRAVERSE').length).toBe(6);
    expect(timeline.filter((f) => f.action === 'SPLIT').length).toBe(4);
    expect(timeline.filter((f) => f.action === 'NEW_ROOT').length).toBe(2);
    expect(timeline.filter((f) => f.action === 'ROOT_REPLACED').length).toBe(2);

    // Final 2-3 tree: root [10]; children [6] (5,7) and [20] (12,17 & 30).
    interface N { keys: number[]; children: N[] }
    const root = timeline[timeline.length - 1].state.root as N;
    expect(root.keys).toEqual([10]);
    expect(root.children[0].keys).toEqual([6]);
    expect(root.children[0].children.map((c) => c.keys)).toEqual([[5], [7]]);
    expect(root.children[1].keys).toEqual([20]);
    expect(root.children[1].children.map((c) => c.keys)).toEqual([[12, 17], [30]]);

    // Capacity invariant: no node ever exceeds order-1 = 2 keys at rest.
    const walk = (n: N): void => {
      expect(n.keys.length).toBeLessThanOrEqual(2);
      n.children.forEach(walk);
    };
    walk(root);

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[1].data as any).errorCount).toBe(0);
  });

  it('2-3 tree promotes median keys on overflow and grows only at the root', () => {
    const mod = moduleById('two-three-tree');
    const input = { keys: [10, 20, 5, 15, 25, 30] };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'two-three-mean-split').length).toBe(1);

    // One root creation, five leaf arrivals, three descents and three fit-inserts.
    expect(timeline.filter((f) => f.action === 'create-root').length).toBe(1);
    expect(timeline.filter((f) => f.action === 'reach-leaf').length).toBe(5);
    expect(timeline.filter((f) => f.action === 'traverse').length).toBe(3);
    expect(timeline.filter((f) => f.action === 'insert-fit').length).toBe(3);

    // Two splits (the 5-key leaf and the [15,20,25] leaf); the first grows a new root.
    expect(timeline.filter((f) => f.action === 'split').length).toBe(2);
    expect(timeline.filter((f) => f.action === 'new-root').length).toBe(1);
    expect(timeline.filter((f) => f.action === 'push-up').length).toBe(1);

    // Final tree: root [10,20] with leaves [5], [15], [25,30].
    const final = timeline[timeline.length - 1];
    const nodes = final.state.nodes as { keys: number[]; children: number[] }[];
    const root = nodes[final.state.rootIdx as number];
    expect(root.keys).toEqual([10, 20]);
    expect(root.children.map((idx: number) => nodes[idx].keys)).toEqual([[5], [15], [25, 30]]);

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[2].data as any).errorCount).toBe(0);
  });

  it('2-3-4 tree pre-splits 4-nodes top-down and keeps every leaf at one depth', () => {
    const mod = moduleById('two-three-four-tree');
    const input = { keys: [10, 20, 30, 40, 50, 25] };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'ttf-topdown-split').length).toBe(1);

    // One root creation, one root split, one child split, three descents, five leaf inserts.
    expect(timeline.filter((f) => f.action === 'CREATE_ROOT').length).toBe(1);
    expect(timeline.filter((f) => f.action === 'SPLIT_ROOT').length).toBe(1);
    expect(timeline.filter((f) => f.action === 'SPLIT_CHILD').length).toBe(1);
    expect(timeline.filter((f) => f.action === 'TRAVERSE').length).toBe(3);
    expect(timeline.filter((f) => f.action === 'INSERT_LEAF').length).toBe(5);

    // Root split on insert 40 promotes the middle key 20.
    const splitRoot = timeline.find((f) => f.action === 'SPLIT_ROOT')!;
    expect(splitRoot.variables?.midKey).toBe(20);

    // Child split on insert 25 promotes 40 out of [30,40,50].
    const splitChild = timeline.find((f) => f.action === 'SPLIT_CHILD')!;
    expect(splitChild.variables?.mid).toBe(40);

    // Final tree: root [20,40]; leaves [10], [25,30], [50].
    interface N234 { keys: number[]; children: N234[] }
    const root = timeline[timeline.length - 1].state.root as N234;
    expect(root.keys).toEqual([20, 40]);
    expect(root.children.map((c: N234) => c.keys)).toEqual([[10], [25, 30], [50]]);
    const depths = (n: N234): number[] =>
      n.children.length === 0 ? [1] : n.children.flatMap((c) => depths(c).map((d) => d + 1));
    expect(new Set(depths(root)).size).toBe(1);

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[0].data as any).errorCount).toBe(0);
  });

  it('skip list walks express lanes top-down, stepping forward then dropping a level', () => {
    const mod = moduleById('skip-list');
    const elements = [3, 7, 9, 12, 17, 21, 25, 31, 38, 45, 52];
    const timeline = mod.generateTimeline({ elements, searchTarget: 25 } as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'skip-list-express-lanes').length).toBe(1);

    // Two lanes visited: L3 skips 3 and 17, overshoots at 38; L2 matches 25 directly.
    const levels = timeline.filter((f) => f.action === 'LEVEL_START');
    expect(levels.map((f) => f.variables?.currentLevel)).toEqual([3, 2]);
    const compares = timeline.filter((f) => f.action === 'COMPARE_NODE');
    expect(compares.map((f) => f.variables?.candidateKey)).toEqual([3, 17, 38, 25]);
    expect(timeline.filter((f) => f.action === 'FORWARD_STEP').length).toBe(2);
    expect(timeline.filter((f) => f.action === 'OVERSHOOT').length).toBe(1);
    const found = timeline.filter((f) => f.action === 'FOUND');
    expect(found.length).toBe(1);
    expect(found[0].milestoneTitle).toBe('Target Key 25 Found at L2!');

    // Missing key: the walk drops lanes and ends in an honest NOT_FOUND.
    const missing = mod.generateTimeline({ elements, searchTarget: 41 } as any);
    expect(missing.filter((f) => f.action === 'DROP_DOWN').length).toBe(1);
    expect(missing.filter((f) => f.action === 'OVERSHOOT').length).toBe(3);
    const notFound = missing.filter((f) => f.action === 'NOT_FOUND');
    expect(notFound.length).toBe(1);
    expect(notFound[0].milestoneTitle).toBe('Key 41 Not Found');

    expect(auditTimeline(mod, { elements, searchTarget: 25 } as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[0].data as any).errorCount).toBe(0);
  });

  it('TreeMap keeps keys sorted, probes one path per lookup, and answers ranges from order', () => {
    const mod = moduleById('tree-map');
    const input = {
      operations: [
        { op: 'PUT' as const, key: 20, val: 'Paid' },
        { op: 'PUT' as const, key: 10, val: 'Draft' },
        { op: 'PUT' as const, key: 30, val: 'Refunded' },
        { op: 'GET' as const, key: 30 },
        { op: 'GET' as const, key: 99 },
        { op: 'RANGE' as const, low: 15, high: 25 },
      ],
    };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'treemap-range-inorder').length).toBe(1);

    expect(timeline.filter((f) => f.action === 'PUT_ENTRY').length).toBe(3);

    // Two lookups: one hit in two probes, one miss in two probes.
    const probes = timeline.filter((f) => f.action === 'GET_PROBE');
    expect(probes.map((f) => f.variables?.nodeKey)).toEqual([20, 30, 20, 30]);
    const entries = timeline.filter((f) => f.action === 'GET_ENTRY');
    expect(entries.map((f) => f.milestoneTitle)).toEqual([
      'Get Hit: [30] -> "Refunded"',
      'Get Miss: [99]',
    ]);
    expect(entries[0].codeLine).toBe(14);
    expect(entries[1].codeLine).toBe(17);

    // Range [15..25] returns exactly the middle key.
    const range = timeline.filter((f) => f.action === 'RANGE_QUERY');
    expect(range.length).toBe(1);
    expect(range[0].variables?.matchedKeys).toBe('20');

    // In-order traversal stays sorted across all operations.
    const final = timeline[timeline.length - 1];
    expect(final.state.inorderKeys).toEqual([10, 20, 30]);

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[0].data as any).errorCount).toBe(0);
  });

  it('kd-tree alternates split axes on insert and tracks the running best distance', () => {
    const mod = moduleById('kd-tree');
    const input = {
      points: [
        { x: 20, y: 30 },
        { x: 40, y: 70 },
        { x: 80, y: 20 },
      ],
      targetQuery: { x: 45, y: 45 },
    };
    const timeline = mod.generateTimeline(input as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'kd-alternating-axis').length).toBe(1);

    // One root insert, three axis comparisons, two attachments.
    expect(timeline.filter((f) => f.action === 'INSERT_ROOT').length).toBe(1);
    const compares = timeline.filter((f) => f.action === 'COMPARE_AXIS');
    expect(compares.map((f) => f.variables?.axis)).toEqual(['x', 'x', 'y']);
    const attaches = timeline.filter((f) => f.action === 'ATTACH_NODE');
    expect(attaches.map((f) => f.codeLine)).toEqual([13, 11]); // right of root, then left of P1

    // Nearest neighbor: P1 (40,70) at distance sqrt(25^2+15^2 ...) ≈ 25.50 beats P0 and P2.
    expect(timeline.filter((f) => f.action === 'NN_EXPLORE').length).toBe(3);
    const found = timeline.filter((f) => f.action === 'NN_FOUND');
    expect(found.length).toBe(1);
    expect(found[0].variables?.bestId).toBe(1);
    expect(found[0].variables?.distance).toBe('25.50');

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[0].data as any).errorCount).toBe(0);
  });

  it('interval tree gathers every overlap and prunes left subtrees via maxHigh', () => {
    const mod = moduleById('interval-tree');
    const meeting = {
      intervals: [
        { low: 8, high: 11 },
        { low: 9, high: 10 },
        { low: 13, high: 16 },
        { low: 15, high: 18 },
        { low: 17, high: 21 },
      ],
      query: { low: 10, high: 14 },
    };
    const timeline = mod.generateTimeline(meeting as any);

    expect(timeline.filter((f) => f.checkpoint?.id === 'interval-maxhigh-prune').length).toBe(1);

    // Every node is inspected once; the chain has no left children so all five prune.
    const inspects = timeline.filter((f) => f.action === 'TEST_OVERLAP');
    expect(inspects.length).toBe(5);
    expect(inspects.map((f) => f.variables?.overlaps)).toEqual([true, true, true, false, false]);
    expect(timeline.filter((f) => f.action === 'PRUNE_LEFT').length).toBe(5);
    expect(timeline.filter((f) => f.action === 'BRANCH_LEFT').length).toBe(0);
    expect(timeline[timeline.length - 1].variables?.foundCount).toBe(3);

    // A left subtree whose maxHigh reaches query.low must be explored.
    const lefty = mod.generateTimeline({
      intervals: [
        { low: 8, high: 11 },
        { low: 4, high: 6 },
        { low: 9, high: 12 },
      ],
      query: { low: 5, high: 7 },
    } as any);
    expect(lefty.filter((f) => f.action === 'BRANCH_LEFT').length).toBe(1);
    expect(lefty[lefty.length - 1].variables?.foundCount).toBe(1);

    // Fully disjoint intervals: no overlaps found.
    const disjoint = mod.generateTimeline(mod.presets[1].data as any);
    expect(disjoint[disjoint.length - 1].variables?.foundCount).toBe(0);

    expect(auditTimeline(mod, meeting as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[0].data as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[1].data as any).errorCount).toBe(0);
  });

  it('radix tree compacts paths, splits diverging edges once per branch point, and verifies exact-match search', () => {
    const mod = moduleById('radix-tree');
    const input = { words: ['romane', 'romanus', 'romulus', 'rubens'], searchTarget: 'romanus' };
    const timeline = mod.generateTimeline(input as any);

    // Classic romane/romanus divergence: "roman" stays, "e" is pushed down, "us" becomes the new branch.
    const splits = timeline.filter((f) => f.action === 'SPLIT_EDGE');
    expect(splits.length).toBe(3);
    expect(splits[0].variables?.commonPrefix).toBe('roman');
    expect(splits[0].variables?.pushedDownSuffix).toBe('e');
    expect(splits[0].variables?.newBranchSuffix).toBe('us');

    // "romane" arrives as a single compacted leaf edge — no per-character nodes.
    const attaches = timeline.filter((f) => f.action === 'ATTACH_LEAF');
    expect(attaches.length).toBe(1);
    expect(attaches[0].variables?.attachedLabel).toBe('romane');

    // Search for a present key: four traversals, then an exact-match verdict on line 34.
    const traversals = timeline.filter((f) => f.action === 'TRAVERSE_EDGE');
    expect(traversals.length).toBe(4);
    const verdict = timeline[timeline.length - 1];
    expect(verdict.action).toBe('SEARCH_COMPLETE');
    expect(verdict.variables?.searchSuccess).toBe(true);
    expect(verdict.state.found).toBe(true);

    // Frame → pseudocode line mapping stays honest after the WIP remap.
    for (const frame of timeline.filter((f) => f.action === 'INSERT_WORD')) {
      expect(frame.codeLine).toBe(4);
    }
    for (const frame of timeline.filter((f) => f.action === 'START_SEARCH')) {
      expect(frame.codeLine).toBe(28);
    }
    for (const frame of timeline.filter((f) => f.action === 'TRAVERSE_EDGE')) {
      expect(frame.codeLine).toBe(33);
    }
    for (const frame of timeline.filter((f) => f.action === 'SEARCH_COMPLETE')) {
      expect(frame.codeLine).toBe(34);
    }

    // Every user-visible step carries full W/H/N pedagogy.
    for (const action of ['INSERT_WORD', 'START_SEARCH', 'TRAVERSE_EDGE', 'SEARCH_COMPLETE']) {
      const frames = timeline.filter((f) => f.action === action);
      expect(frames.length).toBeGreaterThan(0);
      for (const frame of frames) {
        expect(frame.pedagogy?.what?.trim()).toBeTruthy();
        expect(frame.pedagogy?.why?.trim()).toBeTruthy();
        expect(frame.pedagogy?.whatNext?.trim()).toBeTruthy();
      }
    }

    // One pedagogical checkpoint, plus milestones for time-travel navigation.
    expect(timeline.filter((f) => f.checkpoint?.id === 'radix-edge-compaction').length).toBe(1);
    expect(timeline.some((f) => f.milestoneTitle === 'First Edge Split Created')).toBe(true);
    expect(timeline.some((f) => f.milestoneTitle === 'Dictionary Fully Inserted')).toBe(true);
    expect(timeline.some((f) => f.milestoneTitle === 'Exact Match Verified')).toBe(true);

    // A key that shares a prefix but was never inserted must report MISS.
    const miss = mod.generateTimeline({
      words: ['romane', 'romanus', 'romulus', 'rubens'],
      searchTarget: 'roma',
    } as any);
    expect(miss[miss.length - 1].variables?.searchSuccess).toBe(false);

    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[0].data as any).errorCount).toBe(0);
    expect(auditTimeline(mod, mod.presets[1].data as any).errorCount).toBe(0);
    expect(auditTimeline(mod, input as any).warningCount).toBe(0);
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

describe('ternary search tree regressions', () => {
  function collectTstIds(node: any): string[] {
    if (!node) return [];
    return [node.id, ...collectTstIds(node.left), ...collectTstIds(node.mid), ...collectTstIds(node.right)];
  }

  it('emits one frame per three-way branch decision with honest pseudocode lines', () => {
    const mod = moduleById('ternary-search-tree');
    const input = { words: ['cat', 'car', 'dog', 'bug'], searchTarget: 'car' };
    const timeline = mod.generateTimeline(input as any);

    // No bulk "inserted word" shortcut: each allocation/branch is its own frame.
    expect(timeline.filter((f) => f.action === 'INSERT_CREATE').length).toBe(10);
    expect(timeline.filter((f) => f.action === 'INSERT_MID').length).toBe(8);
    expect(timeline.filter((f) => f.action === 'INSERT_LEFT').length).toBe(2);
    expect(timeline.filter((f) => f.action === 'INSERT_RIGHT').length).toBe(1);
    expect(timeline.filter((f) => f.action === 'INSERT_MARK_END').length).toBe(4);
    expect(timeline.filter((f) => f.action === 'INSERT_WORD_DONE').length).toBe(4);

    const expectedLines: Record<string, number> = {
      INSERT_CREATE: 4,
      INSERT_LEFT: 6,
      INSERT_RIGHT: 8,
      INSERT_MID: 10,
      INSERT_MARK_END: 12,
      INSERT_WORD_DONE: 13,
      START_SEARCH: 16,
      SEARCH_MISS_NULL: 17,
      SEARCH_LEFT: 19,
      SEARCH_RIGHT: 20,
      SEARCH_MID: 21,
      SEARCH_CHECK_END: 22,
      SEARCH_COMPLETE: 22,
    };
    for (const frame of timeline) {
      const expected = expectedLines[frame.action ?? ''];
      if (expected !== undefined) {
        expect(frame.codeLine, `${frame.action} at frame ${frame.stepIndex}`).toBe(expected);
      }
      expect(frame.pedagogy?.what, `pedagogy missing on ${frame.action}`).toBeTruthy();
    }

    // The checkpoint asks about the first real comparison at the root.
    const checkpointFrame = timeline.find((f) => f.checkpoint);
    expect(checkpointFrame?.checkpoint?.id).toBe('tst-first-search-branch');
    expect(checkpointFrame?.checkpoint?.correctIndex).toBe(1); // 'c' = 'c' -> MID
    expect(checkpointFrame?.checkpoint?.options[1]).toContain('Mid');

    // Path highlight must only reference nodes that exist in that frame's tree.
    for (const frame of timeline) {
      const ids = new Set(collectTstIds(frame.state.root));
      for (const id of frame.state.pathIds) {
        expect(ids.has(id), `stale path id ${id} on frame ${frame.stepIndex}`).toBe(true);
      }
      if (frame.state.activeNodeId) expect(ids.has(frame.state.activeNodeId)).toBe(true);
      if (frame.state.createdNodeId) expect(ids.has(frame.state.createdNodeId)).toBe(true);
    }

    expect(timeline.some((f) => f.milestoneTitle === 'Root Character Created')).toBe(true);
    expect(timeline.some((f) => f.milestoneTitle === 'Dictionary Fully Inserted')).toBe(true);
    expect(timeline.some((f) => f.milestoneTitle === 'Exact Word Verified')).toBe(true);

    const last = timeline[timeline.length - 1];
    expect(last.state.found).toBe(true);
    expect(last.state.pathIds.length).toBeGreaterThan(0);
    expect(() => mod.renderStage(timeline.find((f) => f.action === 'INSERT_MID')!, '2d')).not.toThrow();
    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
  });

  it('distinguishes a stored word from a mere prefix and reports null-child misses', () => {
    const mod = moduleById('ternary-search-tree');

    const prefix = mod.generateTimeline({ words: ['carpet'], searchTarget: 'car' } as any);
    const prefixCheck = prefix.find((f) => f.action === 'SEARCH_CHECK_END');
    expect(prefixCheck?.state.found).toBe(false);
    expect(prefixCheck?.variables?.isEnd).toBe(false);
    expect(prefix[prefix.length - 1].state.found).toBe(false);
    expect(prefix.some((f) => f.milestoneTitle === 'Search Miss Confirmed')).toBe(true);

    const miss = mod.generateTimeline({
      words: ['cat', 'dog'],
      searchTarget: 'cow',
    } as any);
    expect(miss.some((f) => f.action === 'SEARCH_MISS_NULL')).toBe(true);
    expect(miss[miss.length - 1].state.found).toBe(false);

    expect(auditTimeline(mod, { words: ['carpet'], searchTarget: 'car' } as any).errorCount).toBe(0);
    expect(
      auditTimeline(mod, { words: ['cat', 'dog'], searchTarget: 'cow' } as any).errorCount
    ).toBe(0);
  });
});

describe('octree 3d regressions', () => {
  function collectBoxIds(state: any): Set<string> {
    return new Set((state.boxes ?? []).map((box: any) => box.id));
  }

  it('splits a full leaf before routing, and never hides a subdivision', () => {
    const mod = moduleById('octree-3d');
    const input = [
      { id: 'a', x: 10, y: 10, z: 10, label: 'A' },
      { id: 'b', x: 80, y: 80, z: 80, label: 'B' },
      { id: 'c', x: 20, y: 20, z: 20, label: 'C' },
    ];
    const timeline = mod.generateTimeline(input as any);
    const actions = timeline.map((f) => f.action);

    // First point fills the root leaf; the second must overflow it.
    expect(actions[0]).toBe('INIT');
    expect(actions[1]).toBe('STORE_POINT');
    const overflowIdx = actions.indexOf('OVERFLOW');
    expect(overflowIdx).toBeGreaterThan(0);
    expect(actions[overflowIdx + 1]).toBe('SUBDIVIDE');
    expect(actions[overflowIdx + 2]).toBe('REDISTRIBUTE_ROUTE');
    expect(actions[overflowIdx + 3]).toBe('REDISTRIBUTE_STORE');
    expect(actions[overflowIdx + 4]).toBe('ROUTE');
    expect(actions[overflowIdx + 5]).toBe('STORE_POINT');

    // The root leaf gains exactly 8 children in the SUBDIVIDE frame.
    const subdivide = timeline[overflowIdx + 1];
    expect(subdivide.state.root?.children.length).toBe(8);
    expect(subdivide.state.stats.nodes).toBe(9);

    const expectedLines: Record<string, number> = {
      REJECT_OUTSIDE: 2,
      STORE_POINT: 4,
      REDISTRIBUTE_STORE: 4,
      DEPTH_CAP: 8,
      OVERFLOW: 11,
      SUBDIVIDE: 12,
      REDISTRIBUTE_ROUTE: 13,
      ROUTE: 17,
      QUERY_START: 20,
      PRUNE: 21,
      QUERY_LEAF: 22,
      CHECK_POINT: 24,
      FOUND_POINT: 25,
      DESCEND: 29,
      QUERY_COMPLETE: 31,
    };
    for (const frame of timeline) {
      const expected = expectedLines[frame.action ?? ''];
      if (expected !== undefined) {
        expect(frame.codeLine, `${frame.action} at frame ${frame.stepIndex}`).toBe(expected);
      }
      expect(frame.pedagogy?.what, `pedagogy missing on ${frame.action}`).toBeTruthy();
      expect(frame.pedagogy?.why, `why missing on ${frame.action}`).toBeTruthy();
    }

    // Path/active ids must exist in the cloned boxes of the same frame.
    for (const frame of timeline) {
      const ids = collectBoxIds(frame.state);
      for (const id of frame.state.pathIds) {
        expect(ids.has(id), `stale path id ${id} on frame ${frame.stepIndex}`).toBe(true);
      }
      if (frame.state.activeNodeId) {
        expect(ids.has(frame.state.activeNodeId)).toBe(true);
      }
    }

    const last = timeline[timeline.length - 1];
    expect(last.state.stats.stored).toBe(3);
    expect(last.state.foundPoints).toContain('a');
    expect(last.state.foundPoints).toContain('c');
    expect(() => mod.renderStage(timeline[overflowIdx + 1], '2d')).not.toThrow();
    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
  });

  it('asks the overflow prediction at the first full root leaf', () => {
    const mod = moduleById('octree-3d');
    const timeline = mod.generateTimeline(mod.defaultInput as any);
    const checkpoints = timeline.filter((f) => f.checkpoint);
    expect(checkpoints).toHaveLength(1);
    expect(checkpoints[0].checkpoint?.id).toBe('octree-first-overflow');
    expect(checkpoints[0].checkpoint?.correctIndex).toBe(1);
    expect(checkpoints[0].action).toBe('OVERFLOW');
    expect(checkpoints[0].state.stats.stored).toBe(1);
  });

  it('rejects points outside the root cube instead of clamping them', () => {
    const mod = moduleById('octree-3d');
    const input = [
      { id: 'in1', x: 20, y: 20, z: 20, label: 'IN1' },
      { id: 'out', x: 140, y: 40, z: 40, label: 'OUT' },
      { id: 'in2', x: 70, y: 70, z: 70, label: 'IN2' },
    ];
    const timeline = mod.generateTimeline(input as any);

    const reject = timeline.find((f) => f.action === 'REJECT_OUTSIDE');
    expect(reject).toBeDefined();
    expect(reject?.variables?.point).toBe('OUT');
    expect(reject?.conditionEval?.result).toBe(false);
    expect(timeline.some((f) => f.action === 'INSERT_REJECTED')).toBe(true);

    const last = timeline[timeline.length - 1];
    expect(last.state.stats.stored).toBe(2);
    expect(last.state.points.find((p: any) => p.id === 'out')?.rejected).toBe(true);
    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
  });

  it('stops coincident points at the depth cap instead of recursing forever', () => {
    const mod = moduleById('octree-3d');
    const input = [
      { id: 'd0', x: 50, y: 50, z: 50, label: 'D0' },
      { id: 'd1', x: 50, y: 50, z: 50, label: 'D1' },
      { id: 'd2', x: 50, y: 50, z: 50, label: 'D2' },
    ];
    const timeline = mod.generateTimeline(input as any);
    const caps = timeline.filter((f) => f.action === 'DEPTH_CAP');

    // The second and third identical points cannot be separated by any split.
    expect(caps.length).toBe(2);
    for (const cap of caps) {
      expect(cap.variables?.depth).toBe(6);
      expect(cap.conditionEval?.result).toBe(true);
    }
    const last = timeline[timeline.length - 1];
    expect(last.state.stats.maxDepth).toBe(6);
    expect(last.state.stats.stored).toBe(3);
    expect(auditTimeline(mod, input as any).errorCount).toBe(0);
  });

  it('prunes non-intersecting octants and reports only exact-distance hits', () => {
    const mod = moduleById('octree-3d');
    const timeline = mod.generateTimeline(mod.defaultInput as any);

    const pruneFrames = timeline.filter((f) => f.action === 'PRUNE');
    expect(pruneFrames.length).toBeGreaterThan(0);
    for (const frame of pruneFrames) {
      expect(frame.conditionEval?.result).toBe(false);
      expect(frame.state.prunedIds).toContain(frame.state.activeNodeId);
    }

    const queryStart = timeline.find((f) => f.action === 'QUERY_START');
    expect(queryStart?.state.querySphere).toEqual({ x: 25, y: 75, z: 30, radius: 25 });

    const foundFrames = timeline.filter((f) => f.action === 'FOUND_POINT');
    expect(foundFrames.map((f) => f.variables?.point)).toEqual(['P0', 'P2']);
    for (const frame of foundFrames) {
      expect(frame.variables?.inside).toBe(true);
      expect(frame.variables?.distance).toBeLessThanOrEqual(25);
    }

    const last = timeline[timeline.length - 1];
    expect(last.action).toBe('QUERY_COMPLETE');
    expect(last.state.foundPoints).toEqual(['p0', 'p2']);
    expect(last.state.prunedIds.length).toBe(pruneFrames.length);
    expect(last.milestoneTitle).toBe('Range Query Complete');

    for (const preset of mod.presets) {
      expect(auditTimeline(mod, preset.data as any).errorCount).toBe(0);
    }
  });
});

describe('suffix tree (Ukkonen) regressions', () => {
  function suffixTreeProblems(state: any): string[] {
    const problems: string[] = [];
    const nodes = new Map(state.nodes.map((n: any) => [n.id, n]));
    const incoming = new Map<string, any>();
    const childKeys = new Set<string>();
    for (const edge of state.edges) {
      if (!edge.label) problems.push(`empty edge label ${edge.id}`);
      if (incoming.has(edge.toNode)) problems.push(`double parent ${edge.toNode}`);
      incoming.set(edge.toNode, edge);
      const key = `${edge.fromNode}:${state.text[edge.start]}`;
      if (childKeys.has(key)) problems.push(`duplicate child key ${key}`);
      childKeys.add(key);
      if (state.text.slice(edge.start, edge.end + 1) !== edge.label) {
        problems.push(`label mismatch ${edge.id}`);
      }
      if (edge.isLeaf && edge.end !== Math.max(edge.start, state.phase)) {
        problems.push(`leaf ${edge.id} not extended to phase ${state.phase}`);
      }
    }
    for (const node of state.nodes) {
      if (node.id !== 'n0' && !incoming.has(node.id)) problems.push(`orphan ${node.id}`);
    }
    const leaves = state.nodes.filter((n: any) => n.isLeaf);
    if (leaves.length > state.phase + 1) {
      problems.push(`leaves ${leaves.length} exceed suffixes ${state.phase + 1}`);
    }
    const seenSuffixes = new Set<number>();
    for (const leaf of leaves) {
      if (leaf.suffixIdx == null) {
        problems.push(`leaf ${leaf.id} has no suffix index`);
        continue;
      }
      if (seenSuffixes.has(leaf.suffixIdx)) problems.push(`duplicate suffix ${leaf.suffixIdx}`);
      seenSuffixes.add(leaf.suffixIdx);
      let cur: any = leaf;
      const parts: string[] = [];
      while (cur.parent) {
        const edge = incoming.get(cur.id);
        if (!edge) break;
        parts.push(edge.label);
        cur = nodes.get(cur.parent);
      }
      const path = parts.reverse().join('');
      const expected = state.text.slice(leaf.suffixIdx, state.phase + 1);
      if (path !== expected) {
        problems.push(`leaf ${leaf.id} path ${JSON.stringify(path)} != ${JSON.stringify(expected)}`);
      }
    }
    for (const node of state.nodes) {
      if (!node.isLeaf && node.id !== 'n0') {
        const children = state.edges.filter((e: any) => e.fromNode === node.id);
        if (children.length < 2) problems.push(`internal ${node.id} has ${children.length} child`);
      }
    }
    return problems;
  }

  function unrepresentedSuffixes(state: any): number[] {
    const nodes = new Map(state.nodes.map((n: any) => [n.id, n]));
    const incoming = new Map<string, any>();
    for (const edge of state.edges) incoming.set(edge.toNode, edge);
    const pathTo = (id: string): string => {
      let cur: any = nodes.get(id);
      const parts: string[] = [];
      while (cur?.parent) {
        const edge = incoming.get(cur.id);
        if (!edge) break;
        parts.push(edge.label);
        cur = nodes.get(cur.parent);
      }
      return parts.reverse().join('');
    };
    const loci: string[] = [];
    for (const node of state.nodes) loci.push(pathTo(node.id));
    for (const edge of state.edges) loci.push(pathTo(edge.fromNode) + edge.label);
    const missing: number[] = [];
    for (let j = 0; j <= state.phase; j++) {
      const expected = state.text.slice(j, state.phase + 1);
      if (!loci.some((locus) => locus.startsWith(expected))) missing.push(j);
    }
    return missing;
  }

  it('builds every suffix with real splits, suffix links and leaf extension', () => {
    const mod = moduleById('suffix-tree');

    for (const input of [
      { text: 'banana$' },
      { text: 'mississippi$' },
      { text: 'abaa$' },
      { text: 'aaaa$' },
      { text: 'abc$' },
      { text: 'abracadabra' },
    ]) {
      const timeline = mod.generateTimeline(input as any);
      const last = timeline[timeline.length - 1];
      expect(last.action).toBe('COMPLETE');
      expect(suffixTreeProblems(last.state)).toEqual([]);
      expect(last.state.nodes.filter((n: any) => n.isLeaf).length).toBe(last.state.text.length);

      // Every intermediate frame is a structurally valid suffix tree of the
      // current prefix: no orphan nodes, no empty labels, leaves end at phase.
      for (const frame of timeline) {
        expect(suffixTreeProblems(frame.state), `frame ${frame.stepIndex}`).toEqual([]);
        if (frame.action === 'PHASE_COMPLETE' || frame.action === 'COMPLETE') {
          // Ukkonen's invariant: every suffix of text[0..phase] is explicit as
          // a leaf or implicit somewhere along an edge.
          expect(unrepresentedSuffixes(frame.state), `frame ${frame.stepIndex}`).toEqual([]);
        }
      }
      expect(auditTimeline(mod, input as any).errorCount).toBe(0);
    }
  });

  it('emits one frame per phase, rule-3 stop, split and suffix link with honest code lines', () => {
    const mod = moduleById('suffix-tree');
    const timeline = mod.generateTimeline({ text: 'banana$' } as any);
    const actions = timeline.map((f) => f.action);

    expect(actions[0]).toBe('INIT');
    expect(actions.filter((a) => a === 'PHASE_START')).toHaveLength(7);
    expect(actions.filter((a) => a === 'RULE3_MATCH')).toHaveLength(3);
    expect(actions.filter((a) => a === 'SPLIT_EDGE')).toHaveLength(3);
    expect(actions.filter((a) => a === 'CREATE_LEAF')).toHaveLength(4);
    expect(actions.filter((a) => a === 'PHASE_COMPLETE')).toHaveLength(7);

    const expectedLines: Record<string, number> = {
      INIT: 1,
      PHASE_START: 5,
      SET_ACTIVE_EDGE: 8,
      CREATE_LEAF: 11,
      WALK_DOWN: 16,
      RULE3_MATCH: 20,
      SPLIT_EDGE: 23,
      EXTENSION_DONE: 26,
      PHASE_COMPLETE: 32,
      COMPLETE: 33,
    };
    for (const frame of timeline) {
      const expected = expectedLines[frame.action ?? ''];
      if (expected !== undefined) {
        expect(frame.codeLine, `${frame.action} at ${frame.stepIndex}`).toBe(expected);
      }
      expect(frame.pedagogy?.what, `pedagogy missing on ${frame.action}`).toBeTruthy();
      expect(frame.pedagogy?.why, `pedagogy missing on ${frame.action}`).toBeTruthy();
      expect(frame.pedagogy?.whatNext, `whatNext missing on ${frame.action}`).toBeTruthy();
    }

    // SET_SUFFIX_LINK uses line 12 (leaf case) or 24 (split case).
    for (const frame of timeline.filter((f) => f.action === 'SET_SUFFIX_LINK')) {
      expect([12, 19, 24]).toContain(frame.codeLine);
      const link = frame.state.suffixLinkHighlight;
      expect(link).toBeTruthy();
      const ids = new Set(frame.state.nodes.map((n: any) => n.id));
      expect(ids.has(link!.from)).toBe(true);
      expect(ids.has(link!.to)).toBe(true);
    }
  });

  it('stops on Rule 3 and asks the learner to predict the early phase stop', () => {
    const mod = moduleById('suffix-tree');
    const timeline = mod.generateTimeline({ text: 'banana$' } as any);
    const checkpoints = timeline.filter((f) => f.checkpoint);
    expect(checkpoints.map((f) => f.checkpoint?.id)).toEqual([
      'suffix-tree-rule3-stop',
      'suffix-tree-first-split',
    ]);

    const rule3 = checkpoints[0];
    expect(rule3.action).toBe('RULE3_MATCH');
    expect(rule3.checkpoint?.correctIndex).toBe(1);
    expect(rule3.state.activeLength).toBeGreaterThan(0);
    expect(rule3.variables?.rule).toBe(3);
    // Rule 3 ends the phase without decrementing remainder.
    const next = timeline[rule3.stepIndex + 1];
    expect(next.action).toBe('PHASE_COMPLETE');
    expect(next.state.remainder).toBe(rule3.state.remainder);
  });

  it('splits the active edge and links the new internal node', () => {
    const mod = moduleById('suffix-tree');
    const timeline = mod.generateTimeline({ text: 'banana$' } as any);
    const splitCheckpoint = timeline.find(
      (f) => f.checkpoint?.id === 'suffix-tree-first-split'
    );
    expect(splitCheckpoint?.action).toBe('SPLIT_EDGE');
    expect(splitCheckpoint?.checkpoint?.correctIndex).toBe(1);

    const splitNodeId = splitCheckpoint?.variables?.splitNode;
    const leafId = splitCheckpoint?.variables?.newLeaf;
    expect(splitCheckpoint?.state.highlightNodeIds).toEqual([splitNodeId, leafId]);
    const splitNode = splitCheckpoint?.state.nodes.find((n: any) => n.id === splitNodeId);
    expect(splitNode?.isLeaf).toBe(false);
    const splitEdges = splitCheckpoint?.state.edges.filter((e: any) => e.fromNode === splitNodeId);
    expect(splitEdges).toHaveLength(2);
    expect(splitEdges?.some((e: any) => e.isLeaf)).toBe(true);

    const linkFrames = timeline.filter(
      (f) => f.state.suffixLinkHighlight?.from === splitNodeId
    );
    expect(linkFrames.length).toBeGreaterThan(0);
    expect(linkFrames[0].state.suffixLinkHighlight?.to).toBeTruthy();

    // The final tree has a suffix link on every internal non-root node.
    const last = timeline[timeline.length - 1];
    for (const node of last.state.nodes) {
      if (!node.isLeaf && node.id !== 'n0') {
        expect(node.suffixLink, `internal ${node.id} missing suffix link`).toBeTruthy();
      }
    }
  });

  it('normalises input: appends the sentinel, removes internal sentinels, caps length', () => {
    const mod = moduleById('suffix-tree');

    const noSentinel = mod.generateTimeline({ text: 'banana' } as any);
    expect(noSentinel[0].state.text).toBe('banana$');
    expect(noSentinel[0].variables?.sentinelAdded).toBe(true);

    const internalSentinel = mod.generateTimeline({ text: 'a$b$a' } as any);
    expect(internalSentinel[0].state.text).toBe('aba$');
    expect(internalSentinel[0].variables?.internalSentinelsRemoved).toBe(true);

    const long = mod.generateTimeline({ text: 'abcdefghijklmnopqrstuvwxyz0123456789' } as any);
    expect(long[0].state.text.length).toBeLessThanOrEqual(24);
    expect(long[0].state.text.endsWith('$')).toBe(true);
    expect(long[0].variables?.truncated).toBe(true);
    expect(auditTimeline(mod, { text: 'banana' } as any).errorCount).toBe(0);
    expect(auditTimeline(mod, { text: 'abcdefghijklmnopqrstuvwxyz0123456789' } as any).errorCount).toBe(0);
  });

  it('renders the tree stage for an active split without throwing', () => {
    const mod = moduleById('suffix-tree');
    const timeline = mod.generateTimeline({ text: 'mississippi$' } as any);
    const split = timeline.find((f) => f.action === 'SPLIT_EDGE');
    expect(split).toBeDefined();
    expect(() => mod.renderStage(split!, '2d')).not.toThrow();
    expect(() => mod.renderStage(timeline[0], '2d')).not.toThrow();
    for (const preset of mod.presets) {
      expect(auditTimeline(mod, preset.data as any).errorCount).toBe(0);
    }
  });
});

describe('recursion trees & memoisation regressions', () => {
  const mod = () => moduleById('recursion-trees');

  function structuralProblems(state: any): string[] {
    const problems: string[] = [];
    const ids = new Set(state.nodes.map((n: any) => n.id));
    const childSeen = new Set<string>();

    for (const node of state.nodes) {
      if (node.parentId !== null && !ids.has(node.parentId)) {
        problems.push(`node ${node.id} has unknown parent ${node.parentId}`);
      }
      if (node.status === 'done' && node.value === undefined) {
        problems.push(`node ${node.id} is done without a value`);
      }
      if (node.base && node.childIds.length > 0) {
        problems.push(`base node ${node.id} has children`);
      }
      if (node.repeated && state.memoOn) {
        problems.push(`memo mode must not mark ${node.id} as repeated`);
      }
      for (const childId of node.childIds) {
        if (!ids.has(childId)) problems.push(`node ${node.id} points at missing child ${childId}`);
        if (childSeen.has(childId)) problems.push(`child ${childId} has two parents`);
        childSeen.add(childId);
        const child = state.nodes.find((n: any) => n.id === childId);
        if (child && child.parentId !== node.id) {
          problems.push(`child ${childId} disagrees about its parent`);
        }
        if (child && child.depth !== node.depth + 1) {
          problems.push(`child ${childId} depth ${child.depth} should be ${node.depth + 1}`);
        }
      }
      // Stack unwinding: a non-base frame is only finished once every child is.
      if (node.status === 'done' && !node.base) {
        for (const childId of node.childIds) {
          const child = state.nodes.find((n: any) => n.id === childId);
          if (!child || child.status !== 'done') {
            problems.push(`node ${node.id} finished before child ${childId}`);
          }
        }
      }
      if (node.reusedFrom !== undefined && node.childIds.length > 0) {
        problems.push(`memo reuse node ${node.id} should not expand children`);
      }
    }

    // pathIds must be the ancestor chain of the active frame.
    const nodeMap = new Map(state.nodes.map((n: any) => [n.id, n]));
    state.pathIds.forEach((id: string, index: number) => {
      const node = nodeMap.get(id) as any;
      if (!node) {
        problems.push(`path id ${id} is not in the tree`);
        return;
      }
      if (node.depth !== index) problems.push(`path id ${id} has depth ${node.depth} at index ${index}`);
      const prevId = state.pathIds[index - 1];
      if (index > 0 && node.parentId !== prevId) {
        problems.push(`path id ${id} parent ${node.parentId} != previous ${prevId}`);
      }
    });
    if (state.pathIds.length > 0 && state.activeNodeId !== state.pathIds[state.pathIds.length - 1]) {
      problems.push('activeNodeId is not the innermost open frame');
    }
    if (state.pathIds.length === 0 && state.activeNodeId !== null && state.nodes.length > 0) {
      const active = nodeMap.get(state.activeNodeId) as any;
      if (active && active.status !== 'done') problems.push('activeNodeId points at an unfinished node with an empty stack');
    }
    // Ancestors are still computing; the innermost frame may already carry its
    // returned value (base case reached or value combined, pop happens next).
    state.pathIds.forEach((id: string, index: number) => {
      const node = nodeMap.get(id) as any;
      const isInner = index === state.pathIds.length - 1;
      if (!isInner && node?.status !== 'computing') {
        problems.push(`ancestor ${id} on the stack is not computing`);
      }
    });
    return problems;
  }

  it('matches the reference counts for fib(5) naive and fib(6) memoised', () => {
    const module = mod();
    const naive = module.generateTimeline({ fn: 'fib', n: 5, memo: false } as any);
    const naiveLast = naive[naive.length - 1];
    expect(naiveLast.state.stats).toMatchObject({
      calls: 15,
      distinct: 6,
      repeated: 3,
      baseVisits: 8,
      memoHits: 0,
    });
    expect(naiveLast.state.nodes.filter((n: any) => n.repeated).length).toBe(3);

    const memo = module.generateTimeline({ fn: 'fib', n: 6, memo: true } as any);
    const memoLast = memo[memo.length - 1];
    expect(memoLast.state.stats).toMatchObject({
      calls: 11,
      distinct: 7,
      repeated: 0,
      baseVisits: 2,
      memoHits: 4,
      memoEntries: 7,
      callsAvoided: 18,
    });
    expect(memoLast.state.memoTable.map((e: any) => e.key)).toEqual([
      'fib(1)',
      'fib(0)',
      'fib(2)',
      'fib(3)',
      'fib(4)',
      'fib(5)',
      'fib(6)',
    ]);
    expect(memoLast.state.nodes.filter((n: any) => n.reusedFrom).length).toBe(4);

    // Every invocation is either an expansion, a base visit or a table hit.
    // The classification of an invocation lands one frame after its CALL frame,
    // so the accounting identity is checked on every settled frame.
    for (const frame of memo) {
      const s = frame.state.stats;
      const delta = s.calls - (s.distinct + s.memoHits);
      if (frame.action === 'CALL') {
        expect([0, 1]).toContain(delta);
      } else {
        expect(delta, `memo accounting on ${frame.action} frame ${frame.stepIndex}`).toBe(0);
      }
      expect(s.repeated).toBe(0);
    }
    for (const frame of naive) {
      const s = frame.state.stats;
      const distinctBaseArgs = new Set(
        frame.state.nodes.filter((n: any) => n.base).map((n: any) => n.argsKey)
      ).size;
      const accounted = s.distinct + s.repeated + (s.baseVisits - distinctBaseArgs);
      if (frame.action === 'CALL') {
        expect([0, 1]).toContain(s.calls - accounted);
      } else {
        expect(accounted, `naive accounting on ${frame.action} frame ${frame.stepIndex}`).toBe(s.calls);
      }
      expect(s.memoHits).toBe(0);
      expect(s.memoEntries).toBe(0);
    }
  });

  it('keeps every frame a valid call tree with consistent stack depth', () => {
    const module = mod();
    for (const data of [
      { fn: 'fib', n: 6, memo: false },
      { fn: 'fib', n: 6, memo: true },
      { fn: 'binomial', n: 5, k: 3, memo: false },
      { fn: 'binomial', n: 6, k: 3, memo: true },
      { fn: 'grid-paths', n: 3, k: 3, memo: true },
    ]) {
      const timeline = module.generateTimeline(data as any);
      expect(timeline.length).toBeGreaterThan(10);
      for (const frame of timeline) {
        expect(structuralProblems(frame.state), `frame ${frame.stepIndex} (${frame.action})`).toEqual([]);
        expect(frame.pedagogy?.what, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.why, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.whatNext, `pedagogy missing on ${frame.action}`).toBeTruthy();
      }
      expect(auditTimeline(module, data as any).errorCount).toBe(0);
      expect(auditTimeline(module, data as any).warningCount).toBe(0);
    }
  });

  it('maps every action to an honest line in all five snippets', () => {
    const module = mod();
    const timeline = module.generateTimeline({ fn: 'fib', n: 5, memo: true } as any);

    const expectedLines: Record<string, number[]> = {
      INIT: [1],
      CALL: [1, 5, 6],
      ASSIGN: [5, 6],
      MEMO_MISS: [2],
      MEMO_HIT: [2],
      BASE_CASE: [3],
      COMBINE: [7],
      MEMO_STORE: [8],
      RETURN: [9],
      DONE: [9],
    };
    for (const frame of timeline) {
      const allowed = expectedLines[frame.action ?? ''];
      expect(allowed, `unexpected action ${frame.action}`).toBeDefined();
      expect(allowed, `${frame.action} at frame ${frame.stepIndex}`).toContain(frame.codeLine);
    }

    const lineMatchers: Record<number, RegExp> = {
      1: /solve\(/,
      2: /table/,
      3: /(is_base|isBase)/,
      5: /solve\(next/,
      6: /solve\(next/,
      7: /combine/,
      8: /table/,
      9: /return value/,
    };
    const languages = ['pseudocode', 'python', 'typescript', 'cpp', 'java'] as const;
    for (const lang of languages) {
      const raw = module.codeSnippets[lang];
      const lines = raw.split('\n');
      for (const frame of timeline) {
        const line = resolveActiveCodeLine(raw, frame, timeline);
        expect(line, `${lang} out of range on ${frame.action}`).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(lines.length);
        // The authored line number must land on the matching statement in every language.
        expect(line, `${lang} ${frame.action}: line ${line} = ${lines[line - 1]}`).toBe(frame.codeLine);
        expect(lines[line - 1]).toMatch(lineMatchers[frame.codeLine]);
      }
    }
  });

  it('asks for a prediction at the first repeat and at the first memo lookup', () => {
    const module = mod();
    const naive = module.generateTimeline({ fn: 'fib', n: 5, memo: false } as any);
    const repeatCheckpoints = naive.filter((f) => f.checkpoint);
    expect(repeatCheckpoints).toHaveLength(1);
    expect(repeatCheckpoints[0].checkpoint?.id).toBe('recursion-trees-first-repeat');
    expect(repeatCheckpoints[0].checkpoint?.correctIndex).toBe(1);
    expect(repeatCheckpoints[0].action).toBe('CALL');
    expect(repeatCheckpoints[0].state.nodes.some((n: any) => n.repeated)).toBe(true);

    const memo = module.generateTimeline({ fn: 'fib', n: 6, memo: true } as any);
    const memoCheckpoints = memo.filter((f) => f.checkpoint);
    expect(memoCheckpoints.map((f) => f.checkpoint?.id)).toEqual([
      'recursion-trees-memo-miss',
      'recursion-trees-memo-hit',
    ]);
    expect(memoCheckpoints[0].action).toBe('MEMO_MISS');
    expect(memoCheckpoints[0].state.memoTable).toHaveLength(0);
    expect(memoCheckpoints[1].action).toBe('MEMO_HIT');
    expect(memoCheckpoints[1].state.memoTable.length).toBeGreaterThan(0);
    expect(memoCheckpoints[1].state.reuseEdge).toBeTruthy();

    // Every checkpoint frame is answerable from its own state.
    for (const frame of [...repeatCheckpoints, ...memoCheckpoints]) {
      expect(frame.checkpoint!.correctIndex).toBeGreaterThanOrEqual(0);
      expect(frame.checkpoint!.correctIndex).toBeLessThan(frame.checkpoint!.options.length);
      expect(frame.checkpoint!.explanation.length).toBeGreaterThan(20);
    }
  });

  it('renders the stage for every phase and clamps oversized input honestly', () => {
    const module = mod();
    for (const preset of module.presets) {
      const timeline = module.generateTimeline(preset.data as any);
      for (const frame of [timeline[0], timeline[Math.floor(timeline.length / 2)], timeline[timeline.length - 1]]) {
        expect(() => module.renderStage(frame, '2d')).not.toThrow();
      }
      expect(auditTimeline(module, preset.data as any).errorCount).toBe(0);
    }

    const clamped = module.generateTimeline({ fn: 'binomial', n: 99, k: 99, memo: true } as any);
    expect(clamped[0].variables?.n).toBe(6);
    expect(clamped[0].variables?.k).toBe(6);
    expect(clamped[0].explanation).toContain('clamped');
    expect(auditTimeline(module, { fn: 'binomial', n: 99, k: 99, memo: true } as any).errorCount).toBe(0);

    // Unknown/legacy input falls back to the documented default.
    const fallback = module.generateTimeline({} as any);
    expect(fallback[0].variables?.root).toBe('fib(5)');
    const legacy = module.generateTimeline({ mode: 'mergesort', inputData: [8, 3, 5, 1] } as any);
    expect(legacy[0].variables?.root).toBe('fib(5)');
    expect(legacy[legacy.length - 1].variables?.rootValue).toBe(5);

    const rootIsBase = module.generateTimeline({ fn: 'fib', n: 0, memo: false } as any);
    expect(rootIsBase[rootIsBase.length - 1].variables?.rootValue).toBe(0);
    expect(rootIsBase.every((f) => f.pedagogy)).toBe(true);
  });
});

describe('LCS 2D DP regressions', () => {
  const mod = () => moduleById('longest-common-subsequence');

  function tableProblems(state: any): string[] {
    const problems: string[] = [];
    const { str1, str2, table } = state;
    if (table.length !== str1.length + 1) problems.push(`rows ${table.length} != ${str1.length + 1}`);
    for (const row of table) {
      if (row.length !== str2.length + 1) problems.push(`row width ${row.length} != ${str2.length + 1}`);
    }
    for (let j = 0; j <= str2.length; j++) {
      if (table[0][j] !== 0) problems.push(`base cell dp[0][${j}] = ${table[0][j]}`);
    }
    for (let i = 0; i <= str1.length; i++) {
      if (table[i][0] !== 0) problems.push(`base cell dp[${i}][0] = ${table[i][0]}`);
    }
    // Only cells that are already finished (row-major order) may be checked
    // against the recurrence; later cells still hold their initial value.
    const filledCells = state.stats?.filled ?? 0;
    let seen = 0;
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (seen >= filledCells) break;
        seen++;
        const expected =
          str1[i - 1] === str2[j - 1]
            ? table[i - 1][j - 1] + 1
            : Math.max(table[i - 1][j], table[i][j - 1]);
        if (table[i][j] !== expected) {
          problems.push(`dp[${i}][${j}] = ${table[i][j]} but the recurrence gives ${expected}`);
        }
      }
    }
    // The active cell's dependencies must explain its value.
    const candidate = state.candidate;
    if (candidate) {
      const value = candidate.kind === 'match' ? candidate.diag + 1 : Math.max(candidate.top, candidate.left);
      if (candidate.value !== value) problems.push(`candidate value ${candidate.value} != ${value}`);
      const sources = state.sourceCells.map(([i, j]: [number, number]) => `${i}:${j}`).sort();
      const expectedSources = (
        candidate.kind === 'match'
          ? [`${candidate.i - 1}:${candidate.j - 1}`]
          : [`${candidate.i - 1}:${candidate.j}`, `${candidate.i}:${candidate.j - 1}`]
      ).sort();
      if (JSON.stringify(sources) !== JSON.stringify(expectedSources)) {
        problems.push(`sourceCells ${JSON.stringify(sources)} != ${JSON.stringify(expectedSources)}`);
      }
      if (table[candidate.i][candidate.j] !== candidate.value) problems.push('candidate disagrees with the table');
    }
    // The reconstruction must follow the dependency of every visited cell.
    const path: [number, number][] = state.backtrackPath;
    for (let k = 1; k < path.length; k++) {
      const [pi, pj] = path[k - 1];
      const [ci, cj] = path[k];
      const di = pi - ci;
      const dj = pj - cj;
      if (pi > 0 && pj > 0) {
        const isMatch = str1[pi - 1] === str2[pj - 1];
        const valid = isMatch
          ? di === 1 && dj === 1
          : (table[pi - 1][pj] >= table[pi][pj - 1] ? di === 1 && dj === 0 : di === 0 && dj === 1);
        if (!valid) problems.push(`walk ${pi},${pj} -> ${ci},${cj} does not follow the dependency`);
      } else if (di !== 0 || dj !== 0) {
        problems.push(`walk left a zero border from ${pi},${pj}`);
      }
    }
    if (state.phase === 'done' && path.length > 0) {
      const [lastI, lastJ] = path[path.length - 1];
      if (lastI !== 0 && lastJ !== 0) problems.push(`walk ended at (${lastI}, ${lastJ}) instead of a zero border`);
    }
    for (const [i, j] of path) {
      if (i < 0 || i > str1.length || j < 0 || j > str2.length) problems.push(`walk visited (${i}, ${j}) outside the table`);
    }
    return problems;
  }

  it('reconstructs the exact LCS for every preset and keeps the walk honest', () => {
    const module = mod();
    const expected: Record<string, string> = {
      'stone-longest': 'ONE',
      'dna-match': 'GTAB',
      identical: 'ABCDE',
      disjoint: '',
    };
    for (const preset of module.presets) {
      const timeline = module.generateTimeline(preset.data as any);
      const last = timeline[timeline.length - 1];
      const want = expected[preset.id];
      expect(last.state.lcsString, `preset ${preset.id}`).toBe(want);
      expect(last.state.isComplete).toBe(true);
      expect(last.state.takenChars).toEqual([...want].reverse());

      for (const frame of timeline) {
        expect(tableProblems(frame.state), `frame ${frame.stepIndex} (${frame.action})`).toEqual([]);
        expect(frame.pedagogy?.what, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.why, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.whatNext, `pedagogy missing on ${frame.action}`).toBeTruthy();
      }

      // The reconstructed length always equals the bottom-right cell.
      const m = last.state.str1.length;
      const n = last.state.str2.length;
      expect(last.state.lcsString.length).toBe(last.state.table[m][n]);
      const audit = auditTimeline(module, preset.data as any);
      expect(audit.errorCount).toBe(0);
      expect(audit.warningCount).toBe(0);
    }
  });

  it('fills the table one cell per frame with a genuine max() prediction', () => {
    const module = mod();
    const timeline = module.generateTimeline({ str1: 'STONE', str2: 'LONGEST' } as any);

    expect(timeline[0].action).toBe('INIT');
    expect(timeline.filter((f) => f.action === 'ROW_START')).toHaveLength(5);
    // Every character of STONE occurs in LONGEST, so exactly one cell per row matches.
    expect(timeline.filter((f) => f.action === 'CELL_MATCH')).toHaveLength(5);
    expect(timeline.filter((f) => f.action === 'CELL_MISMATCH')).toHaveLength(5 * 7 - 5);
    expect(timeline.filter((f) => f.action === 'TABLE_COMPLETE')).toHaveLength(1);

    const cellFrames = timeline.filter((f) => (f.action ?? '').startsWith('CELL_'));
    const expectedLines: Record<string, number[]> = {
      INIT: [3],
      ROW_START: [4],
      CELL_MATCH: [7],
      CELL_MISMATCH: [9],
      TABLE_COMPLETE: [7, 9],
      BACKTRACK_START: [10],
      BT_TAKE: [13],
      BT_MOVE: [14, 16, 18],
      DONE: [19],
    };
    for (const frame of timeline) {
      const allowed = expectedLines[frame.action ?? ''];
      expect(allowed, `unexpected action ${frame.action}`).toBeDefined();
      expect(allowed, `${frame.action} at frame ${frame.stepIndex}`).toContain(frame.codeLine);
    }
    for (const frame of cellFrames) {
      const label = frame.variables ?? {};
      const stats = frame.state.stats;
      expect(stats.matches + stats.mismatches).toBe(stats.filled);
      if (frame.action === 'CELL_MATCH') expect(frame.conditionEval?.result).toBe(true);
      else expect(frame.conditionEval?.result).toBe(label['dp[i][j]']);
    }

    const maxCheckpoint = timeline.find((f) => f.checkpoint?.id === 'lcs-max-choice');
    expect(maxCheckpoint).toBeDefined();
    expect(maxCheckpoint?.action).toBe('CELL_MISMATCH');
    expect(maxCheckpoint?.variables?.top).not.toBe(maxCheckpoint?.variables?.left);
    expect(maxCheckpoint?.checkpoint?.correctIndex).toBe(1);
    expect(maxCheckpoint?.checkpoint?.options[1]).toContain(String(maxCheckpoint?.variables?.['dp[i][j]']));

    const backtrackCheckpoint = timeline.find((f) => f.checkpoint?.id === 'lcs-backtrack-first-step');
    expect(backtrackCheckpoint).toBeDefined();
    expect(['BT_TAKE', 'BT_MOVE']).toContain(backtrackCheckpoint?.action);
    expect(backtrackCheckpoint?.checkpoint?.correctIndex).toBe(0);

    // Splitting the backtrack into one frame per move is what the old module hid.
    expect(timeline.filter((f) => f.action === 'BT_TAKE').length).toBe(3);
    expect(timeline.filter((f) => f.action === 'BT_MOVE').length).toBeGreaterThanOrEqual(3);
  });

  it('maps every action to an exact line in all five language snippets', () => {
    const module = mod();
    const timeline = module.generateTimeline({ str1: 'AGGTAB', str2: 'GXTXAYB' } as any);
    const lineMatchers: Record<number, RegExp> = {
      3: /dp/,
      4: /for /,
      7: /dp\[i\]\[j\]|dp\[i - 1\]\[j - 1\]/,
      9: /max|Math\.max/,
      10: /i\s*=\s*m|i, j|chars/,
      13: /push|append|\+=/,
      14: /i--|i = i - 1|i, j =/,
      16: /i--|i = i - 1/,
      18: /j--|j = j - 1/,
      19: /return/,
    };
    const languages = ['pseudocode', 'python', 'typescript', 'cpp', 'java'] as const;
    for (const lang of languages) {
      const raw = module.codeSnippets[lang];
      const lines = raw.split('\n');
      for (const frame of timeline) {
        const line = resolveActiveCodeLine(raw, frame, timeline);
        expect(line, `${lang} ${frame.action} line ${line}: ${lines[line - 1]}`).toBe(frame.codeLine);
        expect(lines[line - 1]).not.toBeUndefined();
        expect(lines[line - 1]).toMatch(lineMatchers[frame.codeLine]);
      }
    }
  });

  it('handles empty, cleaned and oversized inputs without lying about the table', () => {
    const module = mod();
    const empty = module.generateTimeline({ str1: '', str2: 'ABC' } as any);
    expect(empty).toHaveLength(2);
    expect(empty[empty.length - 1].state.lcsString).toBe('');
    expect(auditTimeline(module, { str1: '', str2: 'ABC' } as any).errorCount).toBe(0);

    const cleaned = module.generateTimeline({ str1: 'a-b!', str2: 'AB' } as any);
    expect(cleaned[0].state.str1).toBe('AB');
    expect(cleaned[0].explanation).toMatch(/removed non-alphanumeric/);
    expect(cleaned[cleaned.length - 1].state.lcsString).toBe('AB');

    const long = module.generateTimeline({ str1: 'ABCDEFGHIJKL', str2: 'WXYZABCDE' } as any);
    expect(long[0].state.str1).toBe('ABCDEFGH');
    expect(long[0].state.str2).toBe('WXYZABCD');
    expect(long[0].explanation).toMatch(/truncated/);
    // 'ABCDEFGH' vs 'WXYZABCD' keeps A B C D (E is beyond the truncated column side).
    expect(long[long.length - 1].state.lcsString).toBe('ABCD');

    const fallback = module.generateTimeline({} as any);
    expect(fallback[0].state.str1).toBe('STONE');
    expect(auditTimeline(module, {} as any).errorCount).toBe(0);

    for (const data of [{ str1: 'STONE', str2: 'LONGEST' }, { str1: 'XYZ', str2: 'ABC' }]) {
      const timeline = module.generateTimeline(data as any);
      for (const frame of [timeline[0], timeline[Math.floor(timeline.length / 2)], timeline[timeline.length - 1]]) {
        expect(() => module.renderStage(frame, '2d')).not.toThrow();
      }
    }
  });
});

describe('edit distance regressions', () => {
  const mod = () => moduleById('edit-distance');

  function tableProblems(state: any, action: string): string[] {
    const problems: string[] = [];
    const { word1, word2, dpTable, stats } = state;
    if (dpTable.length !== word1.length + 1) problems.push(`rows ${dpTable.length} != ${word1.length + 1}`);
    for (const row of dpTable) {
      if (row.length !== word2.length + 1) problems.push(`row width ${row.length} != ${word2.length + 1}`);
    }
    // The borders are filled one cell per frame, so only the cells that were
    // already written may hold their final value.
    let filledLeft = word1.length;
    let filledTop = word2.length;
    if (state.phase === 'base') {
      if (action === 'INIT') {
        filledLeft = 0;
        filledTop = 0;
      } else if (action === 'BASE_ROW') {
        filledLeft = state.currentI;
        filledTop = 0;
      } else {
        filledLeft = word1.length;
        filledTop = state.currentJ;
      }
    }
    for (let i = 1; i <= word1.length; i++) {
      const expected = i <= filledLeft ? i : 0;
      if (dpTable[i][0] !== expected) problems.push(`border dp[${i}][0] = ${dpTable[i][0]} != ${expected}`);
    }
    for (let j = 1; j <= word2.length; j++) {
      const expected = j <= filledTop ? j : 0;
      if (dpTable[0][j] !== expected) problems.push(`border dp[0][${j}] = ${dpTable[0][j]} != ${expected}`);
    }
    let seen = 0;
    for (let i = 1; i <= word1.length; i++) {
      for (let j = 1; j <= word2.length; j++) {
        if (seen >= (stats?.cells ?? 0)) break;
        seen++;
        const match = word1[i - 1] === word2[j - 1];
        const expected = match
          ? dpTable[i - 1][j - 1]
          : 1 + Math.min(dpTable[i - 1][j], dpTable[i][j - 1], dpTable[i - 1][j - 1]);
        if (dpTable[i][j] !== expected) problems.push(`dp[${i}][${j}] = ${dpTable[i][j]} but the recurrence gives ${expected}`);
      }
    }
    const candidate = state.candidate;
    if (candidate) {
      const value = candidate.kind === 'match'
        ? candidate.replaceCost
        : 1 + Math.min(candidate.deleteCost, candidate.insertCost, candidate.replaceCost);
      if (candidate.value !== value) problems.push(`candidate value ${candidate.value} != ${value}`);
      if (dpTable[candidate.i][candidate.j] !== candidate.value) problems.push('candidate disagrees with the table');
      const expectedSources = (
        candidate.kind === 'match'
          ? [`${candidate.i - 1}:${candidate.j - 1}`]
          : [`${candidate.i - 1}:${candidate.j}`, `${candidate.i}:${candidate.j - 1}`, `${candidate.i - 1}:${candidate.j - 1}`]
      ).sort();
      const sources = state.sourceCells.map(([i, j]: [number, number]) => `${i}:${j}`).sort();
      if (JSON.stringify(sources) !== JSON.stringify(expectedSources)) {
        problems.push(`sourceCells ${JSON.stringify(sources)} != ${JSON.stringify(expectedSources)}`);
      }
    }
    return problems;
  }

  /** Every recorded operation must explain the cell it was taken from. */
  function scriptProblems(state: any): string[] {
    const problems: string[] = [];
    const { word1, word2, editScript, walkPath, phase, dpTable } = state;

    for (const step of editScript) {
      const { op, i, j } = step;
      if (i === undefined || j === undefined) continue;
      const cell = dpTable[i]?.[j];
      const diagonal = dpTable[i - 1]?.[j - 1];
      const above = dpTable[i - 1]?.[j];
      const left = dpTable[i]?.[j - 1];
      if (op === 'MATCH') {
        if (cell !== diagonal) problems.push(`MATCH at (${i},${j}) but dp = ${cell} != diagonal ${diagonal}`);
      } else if (op === 'DELETE') {
        if (cell !== above + 1) problems.push(`DELETE at (${i},${j}) but dp = ${cell} != ${above} + 1`);
      } else if (op === 'INSERT') {
        if (cell !== left + 1) problems.push(`INSERT at (${i},${j}) but dp = ${cell} != ${left} + 1`);
      } else if (cell !== diagonal + 1) {
        problems.push(`REPLACE at (${i},${j}) but dp = ${cell} != ${diagonal} + 1`);
      }
    }

    if (phase === 'done') {
      // The finished script must really transform word1 into word2.
      let cursor = 0;
      let output = '';
      for (const step of editScript) {
        if (step.op === 'MATCH' || step.op === 'REPLACE') {
          if (word1[cursor] !== step.from) problems.push(`${step.op} at ${cursor} expected '${step.from}'`);
          output += step.to;
          cursor++;
        } else if (step.op === 'DELETE') {
          if (word1[cursor] !== step.from) problems.push(`DELETE at ${cursor} expected '${step.from}'`);
          cursor++;
        } else {
          output += step.to;
        }
      }
      if (output !== word2) problems.push(`script produces "${output}" instead of "${word2}"`);
      if (cursor !== word1.length) problems.push(`script consumed ${cursor}/${word1.length} characters of word1`);
      const costed = editScript.filter((step: any) => step.op !== 'MATCH').length;
      if (costed !== dpTable[word1.length][word2.length]) {
        problems.push(`script has ${costed} edits but dp[m][n] = ${dpTable[word1.length][word2.length]}`);
      }
    }
    // Every walk move must follow the dependency of the cell it leaves.
    for (let k = 1; k < walkPath.length; k++) {
      const [pi, pj] = walkPath[k - 1];
      const [ci, cj] = walkPath[k];
      const di = pi - ci;
      const dj = pj - cj;
      if (pi > 0 && pj > 0 && word1[pi - 1] === word2[pj - 1]) {
        if (di !== 1 || dj !== 1) problems.push(`match cell (${pi},${pj}) must move diagonally`);
      } else if (pi > 0 && dpTable[pi][pj] === dpTable[pi - 1][pj] + 1) {
        if (di !== 1 || dj !== 0) problems.push(`cell (${pi},${pj}) realises a delete but moved ${di},${dj}`);
      } else if (pj > 0 && dpTable[pi][pj] === dpTable[pi][pj - 1] + 1) {
        if (di !== 0 || dj !== 1) problems.push(`cell (${pi},${pj}) realises an insert but moved ${di},${dj}`);
      } else if (di !== 1 || dj !== 1) {
        problems.push(`cell (${pi},${pj}) must move diagonally (replace)`);
      }
    }
    return problems;
  }

  it('recovers an edit script that really transforms word1 into word2', () => {
    const module = mod();
    const expected: Record<string, { distance: number; script: string }> = {
      'horse-ros': { distance: 3, script: "replace 'H' with 'R' → delete 'R' → delete 'E'" },
      'kitten-sitting': { distance: 3, script: "replace 'K' with 'S' → replace 'E' with 'I' → insert 'G'" },
      'single-char': { distance: 1, script: "replace 'T' with 'R'" },
      'same-words': { distance: 0, script: '(no edits needed)' },
      'append-suffix': { distance: 1, script: "insert 'S'" },
    };
    for (const preset of module.presets) {
      const timeline = module.generateTimeline(preset.data as any);
      const last = timeline[timeline.length - 1];
      const m = last.state.word1.length;
      const n = last.state.word2.length;
      const want = expected[preset.id];
      expect(last.state.dpTable[m][n], `distance for ${preset.id}`).toBe(want.distance);
      expect(last.variables?.script ?? '(no edits needed)', `script for ${preset.id}`).toBe(want.script);

      for (const frame of timeline) {
        expect(tableProblems(frame.state, frame.action ?? ''), `frame ${frame.stepIndex} (${frame.action})`).toEqual([]);
        expect(scriptProblems(frame.state), `script on frame ${frame.stepIndex} (${frame.action})`).toEqual([]);
        expect(frame.pedagogy?.what, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.why, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.whatNext, `pedagogy missing on ${frame.action}`).toBeTruthy();
      }
      const audit = auditTimeline(module, preset.data as any);
      expect(audit.errorCount).toBe(0);
      expect(audit.warningCount).toBe(0);
    }
  });

  it('shows the border cells separately and keeps one frame per decision', () => {
    const module = mod();
    const timeline = module.generateTimeline({ word1: 'HORSE', word2: 'ROS' } as any);

    expect(timeline[0].action).toBe('INIT');
    const baseRows = timeline.filter((f) => f.action === 'BASE_ROW');
    const baseCols = timeline.filter((f) => f.action === 'BASE_COL');
    expect(baseRows).toHaveLength(5);
    expect(baseCols).toHaveLength(3);
    baseRows.forEach((frame, index) => {
      const i = index + 1;
      expect(frame.state.dpTable[i][0]).toBe(i);
      expect(frame.state.dpTable[i].slice(1).every((v: number) => v === 0)).toBe(true);
    });
    // HORSE vs ROS matches on O, R (row 3) and S (row 4): three match cells.
    expect(timeline.filter((f) => f.action === 'CELL_MATCH')).toHaveLength(3);
    expect(timeline.filter((f) => f.action === 'CELL_MISMATCH')).toHaveLength(5 * 3 - 3);
    expect(timeline.filter((f) => f.action === 'TABLE_COMPLETE')).toHaveLength(1);

    const expectedLines: Record<string, number[]> = {
      INIT: [3],
      BASE_ROW: [4],
      BASE_COL: [5],
      CELL_MATCH: [9],
      CELL_MISMATCH: [11],
      TABLE_COMPLETE: [9, 11],
      BACKTRACK_START: [12],
      BT_KEEP: [15],
      BT_DELETE: [17],
      BT_INSERT: [19],
      BT_REPLACE: [21],
      DONE: [22],
    };
    for (const frame of timeline) {
      const allowed = expectedLines[frame.action ?? ''];
      expect(allowed, `unexpected action ${frame.action}`).toBeDefined();
      expect(allowed, `${frame.action} at frame ${frame.stepIndex}`).toContain(frame.codeLine);
    }

    // The script is filled one operation per frame during the walk.
    const walkFrames = timeline.filter((f) => (f.action ?? '').startsWith('BT_'));
    expect(walkFrames.length).toBeGreaterThanOrEqual(3);
    let collected = 0;
    for (const frame of walkFrames) {
      const script = frame.state.editScript;
      expect(script.length).toBeGreaterThanOrEqual(collected);
      collected = script.length;
    }
    // HORSE -> ROS needs 3 edits and no matches.
    const btOps = walkFrames.map((f) => f.state.operationType);
    expect(btOps).toContain('REPLACE');
    expect(btOps).toContain('DELETE');
  });

  it('asks which of the three candidates is cheapest and how the walk decides', () => {
    const module = mod();
    const timeline = module.generateTimeline({ word1: 'HORSE', word2: 'ROS' } as any);

    const choice = timeline.find((f) => f.checkpoint?.id === 'edit-distance-cheapest-op');
    expect(choice).toBeDefined();
    expect(choice?.action).toBe('CELL_MISMATCH');
    expect(choice?.checkpoint?.correctIndex).toBe(0);
    const v = choice?.variables ?? {};
    expect(new Set([v.deleteCost, v.insertCost, v.replaceCost]).size).toBe(3);
    expect(choice?.checkpoint?.options[0]).toContain(v.chosen);
    expect(choice?.checkpoint?.options[0]).toContain(String(v['dp[i][j]']));

    const walk = timeline.find((f) => f.checkpoint?.id === 'edit-distance-backtrack-first-step');
    expect(walk).toBeDefined();
    expect(['BT_KEEP', 'BT_DELETE', 'BT_INSERT', 'BT_REPLACE']).toContain(walk?.action);
    expect(walk?.checkpoint?.correctIndex).toBe(0);

    // Distinct candidate costs must differ for the cheapest-op checkpoint to be asked.
    const checkpointCells = timeline.filter((f) => f.checkpoint?.id === 'edit-distance-cheapest-op');
    expect(checkpointCells).toHaveLength(1);
  });

  it('maps every action to an exact line in all five language snippets', () => {
    const module = mod();
    const timeline = module.generateTimeline({ word1: 'KITTEN', word2: 'SITTING' } as any);
    const lineMatchers: Record<number, RegExp> = {
      3: /D|dp/,
      4: /\[i\]\[0\]|D\[i, 0\]|D\[i\]\[0\]/,
      5: /\[0\]\[j\]|D\[0, j\]|D\[0\]\[j\]/,
      9: /D\[i\]\[j\]/,
      11: /min|Math\.min/,
      12: /ops|i = m|i, j/,
      15: /i--|i = i - 1|i, j = i/,
      17: /DELETE|delete|i--|i -= 1/,
      19: /INSERT|insert|j--|j -= 1/,
      21: /REPLACE|replace/,
      22: /return/,
    };
    const languages = ['pseudocode', 'python', 'typescript', 'cpp', 'java'] as const;
    for (const lang of languages) {
      const raw = module.codeSnippets[lang];
      const lines = raw.split('\n');
      for (const frame of timeline) {
        const line = resolveActiveCodeLine(raw, frame, timeline);
        expect(line, `${lang} ${frame.action} line ${line}: ${lines[line - 1]}`).toBe(frame.codeLine);
        expect(lines[line - 1]).not.toBeUndefined();
        expect(lines[line - 1]).toMatch(lineMatchers[frame.codeLine]);
      }
    }
  });

  it('forces the script when one word is empty and normalises bad input', () => {
    const module = mod();
    const inserts = module.generateTimeline({ word1: '', word2: 'ABC' } as any);
    expect(inserts).toHaveLength(2);
    expect(inserts[inserts.length - 1].state.editScript.map((s: any) => s.op)).toEqual(['INSERT', 'INSERT', 'INSERT']);
    expect(inserts[inserts.length - 1].variables?.script).toBe("insert 'A' → insert 'B' → insert 'C'");

    const deletes = module.generateTimeline({ word1: 'AB', word2: '' } as any);
    expect(deletes[deletes.length - 1].state.editScript.map((s: any) => s.op)).toEqual(['DELETE', 'DELETE']);

    const none = module.generateTimeline({ word1: '', word2: '' } as any);
    expect(none[none.length - 1].variables?.distance).toBe(0);

    const cleaned = module.generateTimeline({ word1: 'c-a!t', word2: 'car' } as any);
    expect(cleaned[0].state.word1).toBe('CAT');
    expect(cleaned[0].state.word2).toBe('CAR');
    expect(cleaned[0].explanation).toMatch(/removed non-alphanumeric/);

    const long = module.generateTimeline({ word1: 'ABCDEFGHIJKL', word2: 'WXYZABCDE' } as any);
    expect(long[0].state.word1).toBe('ABCDEFGH');
    expect(long[0].explanation).toMatch(/truncated/);

    const fallback = module.generateTimeline({} as any);
    expect(fallback[0].state.word1).toBe('HORSE');
    expect(auditTimeline(module, {} as any).errorCount).toBe(0);

    for (const data of [{ word1: 'HORSE', word2: 'ROS' }, { word1: 'SAME', word2: 'SAME' }]) {
      const timeline = module.generateTimeline(data as any);
      for (const frame of [timeline[0], timeline[Math.floor(timeline.length / 2)], timeline[timeline.length - 1]]) {
        expect(() => module.renderStage(frame, '2d')).not.toThrow();
      }
    }
  });
});

describe('0/1 knapsack regressions', () => {
  const mod = () => moduleById('knapsack-01');

  function tableProblems(state: any): string[] {
    const problems: string[] = [];
    const { items, capacity, dpTable, stats, candidate } = state;
    if (dpTable.length !== items.length + 1) problems.push(`rows ${dpTable.length} != ${items.length + 1}`);
    for (const row of dpTable) {
      if (row.length !== capacity + 1) problems.push(`row width ${row.length} != ${capacity + 1}`);
    }
    for (let w = 0; w <= capacity; w++) {
      if (dpTable[0][w] !== 0) problems.push(`base row dp[0][${w}] = ${dpTable[0][w]}`);
    }
    for (let i = 0; i <= items.length; i++) {
      if (dpTable[i][0] !== 0) problems.push(`base column dp[${i}][0] = ${dpTable[i][0]}`);
    }
    // Only cells already decided (row-major) must satisfy the recurrence. A
    // CELL_COMPARE frame has counted the cell but has not written it yet.
    const decided = (stats?.cells ?? 0) - (state.decision === 'compare' ? 1 : 0);
    let seen = 0;
    for (let i = 1; i <= items.length; i++) {
      for (let w = 1; w <= capacity; w++) {
        if (seen >= decided) break;
        seen++;
        const item = items[i - 1];
        const expected =
          item.weight <= w
            ? Math.max(dpTable[i - 1][w], item.value + dpTable[i - 1][w - item.weight])
            : dpTable[i - 1][w];
        if (dpTable[i][w] !== expected) {
          problems.push(`dp[${i}][${w}] = ${dpTable[i][w]} but the recurrence gives ${expected}`);
        }
      }
    }
    if (candidate && state.phase === 'table' && state.decision !== 'compare') {
      if (candidate.canTake) {
        const expected = Math.max(candidate.excludeVal, candidate.includeVal);
        if (candidate.value !== expected) problems.push(`candidate value ${candidate.value} != max ${expected}`);
        if (dpTable[candidate.i][candidate.w] !== candidate.value) problems.push('candidate disagrees with the table');
        const sources = state.activeDependencies ?? {};
        if (!sources.excludeCell || !sources.includeCell) problems.push('can-take candidate is missing a dependency');
        else {
          const [ei, ew] = sources.excludeCell;
          const [ii, iw] = sources.includeCell;
          if (ei !== candidate.i - 1 || ew !== candidate.w) problems.push('exclude dependency points at the wrong cell');
          if (ii !== candidate.i - 1 || iw !== candidate.w - candidate.itemWeight) {
            problems.push('include dependency points at the wrong cell');
          }
        }
      } else {
        if (dpTable[candidate.i][candidate.w] !== candidate.excludeVal) problems.push('too-heavy cell did not inherit');
        if (state.activeDependencies?.includeCell) problems.push('too-heavy cell must not have an include dependency');
      }
    }
    return problems;
  }

  function selectionProblems(state: any): string[] {
    const problems: string[] = [];
    const { items, capacity, dpTable, chosenItems, stats } = state;
    if (state.phase !== 'done') return problems;
    const ids: number[] = chosenItems ?? [];
    const weight = ids.reduce((sum, id) => sum + items[id - 1].weight, 0);
    const value = ids.reduce((sum, id) => sum + items[id - 1].value, 0);
    if (weight > capacity) problems.push(`selection weighs ${weight} > ${capacity}`);
    if (value !== dpTable[items.length][capacity]) {
      problems.push(`selection value ${value} != dp[${items.length}][${capacity}] = ${dpTable[items.length][capacity]}`);
    }
    if (new Set(ids).size !== ids.length) problems.push('an item was selected twice');
    if (stats.backtrackSteps !== items.length) problems.push(`walk visited ${stats.backtrackSteps} rows, expected ${items.length}`);
    return problems;
  }

  it('solves every preset with an optimal, capacity-respecting selection', () => {
    const module = mod();
    const expected: Record<string, { value: number; chosen: string; weight: number }> = {
      'classic-4-items': { value: 9, chosen: 'Vase, Book', weight: 7 },
      'heavy-items': { value: 10, chosen: 'Relic, Armor', weight: 8 },
      'one-heavy': { value: 8, chosen: 'Pearl, Ruby', weight: 4 },
      'tie-breaker': { value: 4, chosen: 'A, B', weight: 4 },
    };
    for (const preset of module.presets) {
      const timeline = module.generateTimeline(preset.data as any);
      const last = timeline[timeline.length - 1];
      const want = expected[preset.id];
      expect(last.variables?.maxValue, `value for ${preset.id}`).toBe(want.value);
      expect(last.variables?.chosen, `selection for ${preset.id}`).toBe(want.chosen);
      expect(last.variables?.chosenWeight, `weight for ${preset.id}`).toBe(want.weight);
      expect(last.state.phase).toBe('done');

      for (const frame of timeline) {
        expect(tableProblems(frame.state), `frame ${frame.stepIndex} (${frame.action})`).toEqual([]);
        expect(selectionProblems(frame.state), `selection on frame ${frame.stepIndex}`).toEqual([]);
        expect(frame.pedagogy?.what, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.why, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.whatNext, `pedagogy missing on ${frame.action}`).toBeTruthy();
      }
      const audit = auditTimeline(module, preset.data as any);
      expect(audit.errorCount).toBe(0);
      expect(audit.warningCount).toBe(0);
    }
  });

  it('shows the compare and decide steps of every cell separately', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.defaultInput as any);

    expect(timeline[0].action).toBe('INIT');
    expect(timeline.filter((f) => f.action === 'ITEM_START')).toHaveLength(4);
    // Gem fits every capacity (7), Vase 5, Book 4, Gold 3 => 19 fitting cells.
    expect(timeline.filter((f) => f.action === 'CELL_COMPARE')).toHaveLength(19);
    expect(timeline.filter((f) => f.action === 'CELL_DECIDE')).toHaveLength(19);
    expect(timeline.filter((f) => f.action === 'CELL_TOO_HEAVY')).toHaveLength(4 * 7 - 19);

    for (const frame of timeline.filter((f) => f.action === 'CELL_COMPARE')) {
      const v = frame.variables ?? {};
      expect(frame.conditionEval?.result).toBe(true);
      expect(v['dp[i][w]']).toBe(Math.max(v.exclude, v.include));
      expect(v.remainingCapacityIfTaken).toBe(v.w - v.itemWeight);
      expect(frame.state.decision).toBe('compare');
      expect(frame.state.activeDependencies?.includeCell).toBeTruthy();
    }
    for (const frame of timeline.filter((f) => f.action === 'CELL_DECIDE')) {
      const v = frame.variables ?? {};
      expect(v['dp[i][w]']).toBe(Math.max(v.exclude, v.include));
      expect(v.decision).toBe(v.include > v.exclude ? 'include' : 'exclude');
      expect(frame.conditionEval?.result).toBe(v['dp[i][w]']);
    }
    for (const frame of timeline.filter((f) => f.action === 'CELL_TOO_HEAVY')) {
      expect(frame.conditionEval?.result).toBe(false);
      expect(frame.state.activeDependencies?.includeCell).toBeUndefined();
      expect(frame.variables?.decision).toBe('skip (too heavy)');
    }

    const expectedLines: Record<string, number[]> = {
      INIT: [2],
      ITEM_START: [3],
      CELL_COMPARE: [7],
      CELL_DECIDE: [8],
      CELL_TOO_HEAVY: [10],
      TABLE_COMPLETE: [8, 10],
      BT_START: [11],
      BT_CHECK: [13],
      BT_TAKE: [14],
      DONE: [15],
    };
    for (const frame of timeline) {
      const allowed = expectedLines[frame.action ?? ''];
      expect(allowed, `unexpected action ${frame.action}`).toBeDefined();
      expect(allowed, `${frame.action} at frame ${frame.stepIndex}`).toContain(frame.codeLine);
    }
  });

  it('walks back through the table and justifies every selected item', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.defaultInput as any);

    const checks = timeline.filter((f) => f.action === 'BT_CHECK');
    const takes = timeline.filter((f) => f.action === 'BT_TAKE');
    expect(checks).toHaveLength(4);
    expect(takes.length).toBeGreaterThan(0);
    expect(takes).toHaveLength((timeline[timeline.length - 1].state.chosenItems ?? []).length);

    // Every BT_TAKE must be immediately preceded by a BT_CHECK whose condition held.
    for (const take of takes) {
      const before = timeline[take.stepIndex - 1];
      expect(before.action).toBe('BT_CHECK');
      expect(before.conditionEval?.result).toBe(true);
      expect(before.variables?.i).toBe(take.variables?.i);
    }
    // The selected rows are exactly the rows whose comparison differed.
    const differingRows = checks
      .filter((f) => f.conditionEval?.result === true)
      .map((f) => f.variables?.i)
      .sort((a, b) => a - b);
    const last = timeline[timeline.length - 1];
    expect(last.state.chosenItems).toEqual(differingRows);
    // A skip keeps the remaining capacity unchanged.
    for (const check of checks.filter((f) => f.conditionEval?.result === false)) {
      const next = timeline[check.stepIndex + 1];
      if (next && next.action === 'BT_CHECK') {
        expect(next.variables?.w).toBe(check.variables?.w);
      }
    }

    const firstDecision = timeline.find((f) => f.checkpoint?.id === 'knapsack-backtrack-first-decision');
    expect(firstDecision).toBeDefined();
    expect(firstDecision?.action).toBe('BT_CHECK');
    const differs = firstDecision?.conditionEval?.result;
    expect(firstDecision?.checkpoint?.correctIndex).toBe(differs ? 0 : 1);
    expect(firstDecision?.checkpoint?.options[0]).toContain(String(firstDecision?.variables?.item));
  });

  it('asks for the include/exclude prediction at a genuine choice', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.defaultInput as any);

    const checkpoints = timeline.filter((f) => f.checkpoint?.id === 'knapsack-include-or-exclude');
    expect(checkpoints).toHaveLength(1);
    const frame = checkpoints[0];
    expect(frame.action).toBe('CELL_DECIDE');
    const v = frame.variables ?? {};
    expect(v.exclude).not.toBe(v.include);
    expect(frame.checkpoint?.correctIndex).toBe(v.include > v.exclude ? 0 : 1);
    expect(frame.checkpoint?.options[0]).toContain(String(v.include));
    expect(frame.checkpoint?.options[1]).toContain(String(v.exclude));
    expect(frame.checkpoint?.options[2]).toContain(String(v.exclude + v.include));

    // Milestones mark the real turning points, not every include cell.
    const milestones = timeline.filter((f) => f.isMilestone).map((f) => f.milestoneTitle ?? '');
    expect(milestones).toContain('First Fitting Item');
    expect(milestones.some((m) => m.startsWith('First Include'))).toBe(true);
    expect(milestones).toContain('Table Complete');
    expect(milestones).toContain('First Item Selected');
    expect(milestones).toContain('Knapsack Solved');
    // The registry adds a 'Start' anchor on frame 0; the module adds five.
    expect(milestones).toContain('Start');
    expect(timeline.filter((f) => f.isMilestone)).toHaveLength(6);
  });

  it('maps every action to an exact line in all five language snippets', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.presets[1].data as any);
    const lineMatchers: Record<number, RegExp> = {
      2: /dp|matrix/,
      3: /for /,
      7: /include|val\[/,
      8: /max|Math\.max/,
      10: /dp\[i\]\[w\]|dp\[i - 1\]\[w\]/,
      11: /w\s*=|w, chosen|chosen/,
      13: /dp\[i\]\[w\]|!==|!=/,
      14: /chosen|push|append|w -=/,
      15: /return/,
    };
    const languages = ['pseudocode', 'python', 'typescript', 'cpp', 'java'] as const;
    for (const lang of languages) {
      const raw = module.codeSnippets[lang];
      const lines = raw.split('\n');
      expect(lines).toHaveLength(15);
      for (const frame of timeline) {
        const line = resolveActiveCodeLine(raw, frame, timeline);
        expect(line, `${lang} ${frame.action} line ${line}: ${lines[line - 1]}`).toBe(frame.codeLine);
        expect(lines[line - 1]).not.toBeUndefined();
        expect(lines[line - 1]).toMatch(lineMatchers[frame.codeLine]);
      }
    }
  });

  it('handles empty, invalid, clamped and legacy input honestly', () => {
    const module = mod();

    const empty = module.generateTimeline({ capacity: 5, items: [] } as any);
    expect(empty).toHaveLength(2);
    expect(empty[empty.length - 1].variables?.maxValue).toBe(0);
    expect(empty[empty.length - 1].state.chosenItems).toEqual([]);
    expect(auditTimeline(module, { capacity: 5, items: [] } as any).errorCount).toBe(0);

    const invalidItems = module.generateTimeline({ capacity: 5, items: [{ id: 1, name: 'bad' }] } as any);
    expect(invalidItems[0].explanation).toMatch(/no usable items/);
    expect(invalidItems[invalidItems.length - 1].variables?.maxValue).toBe(7);

    const clamped = module.generateTimeline({
      capacity: 99,
      items: [
        { id: 7, name: 'Heavy', weight: 40, value: 500 },
        { id: 7, name: 'Light', weight: 2, value: 3 },
      ],
    } as any);
    expect(clamped[0].state.capacity).toBe(12);
    expect(clamped[0].state.items.map((i: any) => i.weight)).toEqual([12, 2]);
    expect(clamped[0].state.items.map((i: any) => i.value)).toEqual([99, 3]);
    expect(clamped[0].state.items.map((i: any) => i.id)).toEqual([1, 2]);
    expect(clamped[0].explanation).toMatch(/clamped/);
    expect(auditTimeline(module, {
      capacity: 99,
      items: [
        { id: 7, name: 'Heavy', weight: 40, value: 500 },
        { id: 7, name: 'Light', weight: 2, value: 3 },
      ],
    } as any).errorCount).toBe(0);

    const fallback = module.generateTimeline({} as any);
    expect(fallback[0].state.items.map((i: any) => i.name)).toEqual(['Gem', 'Vase', 'Book', 'Gold']);
    expect(fallback[fallback.length - 1].variables?.maxValue).toBe(9);

    for (const data of [module.defaultInput, module.presets[2].data]) {
      const timeline = module.generateTimeline(data as any);
      for (const frame of [timeline[0], timeline[Math.floor(timeline.length / 2)], timeline[timeline.length - 1]]) {
        expect(() => module.renderStage(frame, '2d')).not.toThrow();
      }
    }
  });
});

describe('LIS DP regressions', () => {
  const mod = () => moduleById('longest-increasing-subsequence');

  /** Brute-force LIS length for cross-checking dp values. */
  function bruteForceLis(values: number[]): number {
    if (values.length === 0) return 0;
    const best = new Array(values.length).fill(1);
    for (let i = 1; i < values.length; i++) {
      for (let j = 0; j < i; j++) {
        if (values[j] < values[i]) best[i] = Math.max(best[i], best[j] + 1);
      }
    }
    return Math.max(...best);
  }

  function fillProblems(state: any): string[] {
    const problems: string[] = [];
    const { array, dp, parent, stats, candidate, phase, actionType } = state;
    if (dp.length !== array.length) problems.push(`dp size ${dp.length} != ${array.length}`);
    if (parent.length !== array.length) problems.push(`parent size ${parent.length} != ${array.length}`);
    for (let i = 0; i < dp.length; i++) {
      if (parent[i] !== -1 && (parent[i] < 0 || parent[i] >= i)) {
        problems.push(`parent[${i}] = ${parent[i]} is not an earlier index or -1`);
      }
      if (parent[i] !== -1 && array[parent[i]] >= array[i]) {
        problems.push(`parent[${i}] = ${parent[i]} but nums[${parent[i]}] >= nums[${i}] (not increasing)`);
      }
      // An UPDATE frame has already written the new dp but not yet the new parent,
      // so pointer/length consistency is only asserted on every other frame.
      if (parent[i] !== -1 && actionType !== 'UPDATE' && dp[i] !== dp[parent[i]] + 1) {
        problems.push(`dp[${i}] = ${dp[i]} but dp[parent] + 1 = ${dp[parent[i]] + 1}`);
      }
    }
    // A fill frame with a decided candidate must agree with the stored dp value.
    if (candidate && phase === 'fill') {
      if (candidate.canExtend !== (array[candidate.j] < array[candidate.i])) {
        problems.push('candidate canExtend disagrees with the strict comparison');
      }
      if (candidate.dpJPlusOne !== dp[candidate.j] + 1) {
        problems.push('candidate dpJPlusOne is stale');
      }
      if (state.actionType === 'CHECK') {
        if (dp[candidate.i] !== candidate.dpI) problems.push('dp[i] changed during the check');
        if (candidate.better !== (candidate.dpJPlusOne > candidate.dpI)) {
          problems.push('candidate better disagrees with the candidate comparison');
        }
      } else if (state.actionType === 'UPDATE' || state.actionType === 'LINK') {
        const expected = Math.max(candidate.dpI, candidate.dpJPlusOne);
        if (dp[candidate.i] !== expected) {
          problems.push(`dp[${candidate.i}] = ${dp[candidate.i]} but the candidate outcome gives ${expected}`);
        }
        if (state.actionType === 'LINK' && parent[candidate.i] !== candidate.j) {
          problems.push(`parent[${candidate.i}] = ${parent[candidate.i]} but the link says ${candidate.j}`);
        }
      }
    }
    if (stats.comparisons > ((array.length - 1) * array.length) / 2) {
      problems.push(`comparisons ${stats.comparisons} exceed the pair count`);
    }
    return problems;
  }

  function sequenceProblems(state: any, array: number[]): string[] {
    const problems: string[] = [];
    if (state.phase !== 'done') return problems;
    const seq: number[] = state.optimalSequence;
    if (seq.length !== state.maxLisLength) {
      problems.push(`sequence length ${seq.length} != maxLisLength ${state.maxLisLength}`);
    }
    for (let k = 1; k < seq.length; k++) {
      if (seq[k] <= seq[k - 1]) problems.push(`sequence not strictly increasing at ${k}: ${seq[k]} <= ${seq[k - 1]}`);
    }
    // The sequence must be a subsequence of the input (multiset check, in order).
    let cursor = 0;
    for (const value of seq) {
      const found = array.indexOf(value, cursor);
      if (found === -1) {
        problems.push(`${value} is not a subsequence element after position ${cursor}`);
        break;
      }
      cursor = found + 1;
    }
    if (state.chainIndices.length !== seq.length) {
      problems.push(`chainIndices ${state.chainIndices.length} != sequence length ${seq.length}`);
    }
    for (let k = 1; k < state.chainIndices.length; k++) {
      if (state.chainIndices[k] <= state.chainIndices[k - 1]) problems.push('chainIndices not increasing');
      if (array[state.chainIndices[k]] !== seq[k]) problems.push('chainIndices values do not match the sequence');
    }
    return problems;
  }

  it('solves every preset with a dp table matching brute force', () => {
    const module = mod();
    const expected: Record<string, { length: number; sequence: string }> = {
      'classic-leetcode': { length: 4, sequence: '2, 5, 7, 101' },
      alternating: { length: 4, sequence: '0, 8, 12, 14' },
      sorted: { length: 5, sequence: '1, 2, 3, 4, 5' },
      'all-equal': { length: 1, sequence: '4' },
    };
    for (const preset of module.presets) {
      const timeline = module.generateTimeline(preset.data as any);
      const last = timeline[timeline.length - 1];
      const want = expected[preset.id];
      const arr = (preset.data as any).array as number[];
      expect(last.variables?.maxLen, `length for ${preset.id}`).toBe(want.length);
      expect(last.variables?.maxLen, `brute force for ${preset.id}`).toBe(bruteForceLis(arr));
      expect(last.variables?.sequence, `sequence for ${preset.id}`).toBe(want.sequence);
      expect(last.state.phase).toBe('done');

      for (const frame of timeline) {
        expect(fillProblems(frame.state), `frame ${frame.stepIndex} (${frame.action})`).toEqual([]);
        expect(sequenceProblems(frame.state, arr), `sequence on frame ${frame.stepIndex}`).toEqual([]);
        expect(frame.pedagogy?.what, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.why, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.whatNext, `pedagogy missing on ${frame.action}`).toBeTruthy();
      }
      const audit = auditTimeline(module, preset.data as any);
      expect(audit.errorCount).toBe(0);
      expect(audit.warningCount).toBe(0);
    }
  });

  it('shows guard, base case, one frame per comparison and separate check/update/link', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.defaultInput as any);
    const arr = module.defaultInput.array;

    expect(timeline[0].action).toBe('GUARD');
    expect(timeline[0].conditionEval?.result).toBe(false);
    expect(timeline.map((f) => f.action)).toContain('SIZE');
    expect(timeline.filter((f) => f.action === 'BASE_DP')).toHaveLength(1);
    expect(timeline.filter((f) => f.action === 'BASE_PARENT')).toHaveLength(1);
    expect(timeline.filter((f) => f.action === 'ITER_START')).toHaveLength(arr.length - 1);

    const pairs = timeline.filter((f) => f.action === 'PAIR_COMPARE');
    expect(pairs).toHaveLength((arr.length * (arr.length - 1)) / 2);
    const expectedPairs: string[] = [];
    for (let i = 1; i < arr.length; i++) {
      for (let j = 0; j < i; j++) expectedPairs.push(`${j}:${i}`);
    }
    expect(pairs.map((f) => `${f.variables?.j}:${f.variables?.i}`)).toEqual(expectedPairs);
    for (const frame of pairs) {
      expect(frame.conditionEval?.result).toBe(arr[frame.variables!.j] < arr[frame.variables!.i]);
    }

    // Every pair that can extend gets its own CHECK_BETTER frame with the honest outcome.
    const checks = timeline.filter((f) => f.action === 'CHECK_BETTER');
    expect(checks).toHaveLength(pairs.filter((f) => f.conditionEval?.result === true).length);
    for (const frame of checks) {
      const v = frame.variables!;
      // Variables are captured before the write, so the condition is exactly
      // candidate > dp[i].
      expect(frame.conditionEval?.result).toBe(v.candidate > v['dp[i]']);
      expect(v.outcome).toBe(
        frame.conditionEval?.result ? 'will update' : v.candidate === v['dp[i]'] ? 'tie — keep' : 'keep'
      );
      expect(frame.state.parent[v.i] === -1 || arr[frame.state.parent[v.i]] < arr[v.i]).toBe(true);
    }

    const updates = timeline.filter((f) => f.action === 'UPDATE');
    const links = timeline.filter((f) => f.action === 'LINK');
    expect(updates).toHaveLength(links.length);
    for (const link of links) {
      const before = timeline[link.stepIndex - 1];
      expect(before.action).toBe('UPDATE');
      expect(before.variables?.i).toBe(link.variables?.i);
      expect(before.state.dp[link.variables!.i]).toBe(before.state.dp[link.variables!.j] + 1);
      expect(link.state.parent[link.variables!.i]).toBe(link.variables!.j);
    }

    const expectedLines: Record<string, number[]> = {
      GUARD: [2],
      EMPTY_DONE: [2],
      SIZE: [3],
      BASE_DP: [4],
      BASE_PARENT: [5],
      ITER_START: [6],
      FILL_SKIP: [6],
      FILL_COMPLETE: [6],
      PAIR_COMPARE: [8],
      CHECK_BETTER: [9],
      UPDATE: [10],
      LINK: [11],
      RECON_START: [12],
      SCAN_SKIP: [13],
      SCAN_COMPARE: [14],
      NEW_BEST: [15],
      LENGTH: [16],
      WALK_PICK: [19],
      WALK_MOVE: [20],
      REVERSE: [21],
      DONE: [22],
    };
    for (const frame of timeline) {
      const allowed = expectedLines[frame.action ?? ''];
      expect(allowed, `unexpected action ${frame.action}`).toBeDefined();
      expect(allowed, `${frame.action} at frame ${frame.stepIndex}`).toContain(frame.codeLine);
    }
  });

  it('scans for argmax honestly and walks the parent chain end to start', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.defaultInput as any);

    // The scan compares every index after 0 with the running best.
    const scans = timeline.filter((f) => f.action === 'SCAN_COMPARE');
    expect(scans).toHaveLength(module.defaultInput.array.length - 1);
    for (const frame of scans) {
      expect(frame.conditionEval?.result).toBe(
        frame.variables!['dp[i]'] > frame.variables!['dp[best]']
      );
    }
    const newBests = timeline.filter((f) => f.action === 'NEW_BEST');
    for (const frame of newBests) {
      const before = timeline[frame.stepIndex - 1];
      expect(before.action).toBe('SCAN_COMPARE');
      expect(before.conditionEval?.result).toBe(true);
      expect(frame.variables?.best).toBe(before.variables?.i);
    }
    // Ties do not move best: dp[7] = dp[6] = 4 is the last scan comparison.
    const lastScan = scans[scans.length - 1];
    expect(lastScan.conditionEval?.result).toBe(false);
    expect(lastScan.variables?.['dp[i]']).toBe(lastScan.variables?.['dp[best]']);

    const picks = timeline.filter((f) => f.action === 'WALK_PICK');
    const moves = timeline.filter((f) => f.action === 'WALK_MOVE');
    const finalState = timeline[timeline.length - 1].state;
    expect(picks).toHaveLength(finalState.maxLisLength);
    expect(moves).toHaveLength(picks.length);
    for (const pick of picks) {
      expect(pick.conditionEval).toMatchObject({ expr: 'best != -1', result: true });
      expect(pick.variables?.appended).toBe(finalState.array[pick.variables?.best]);
    }
    for (const move of moves) {
      const pick = timeline[move.stepIndex - 1];
      expect(pick.action).toBe('WALK_PICK');
      expect(move.variables?.previousBest).toBe(pick.variables?.best);
      expect(finalState.parent[move.variables!.previousBest]).toBe(move.variables!.nextBest);
    }
    // The walk follows the parent chain exactly.
    const chainFromParents: number[] = [];
    let cursor = finalState.chainIndices[finalState.chainIndices.length - 1];
    while (cursor !== -1) {
      chainFromParents.unshift(cursor);
      cursor = finalState.parent[cursor];
    }
    expect(finalState.chainIndices).toEqual(chainFromParents);
    expect(timeline.filter((f) => f.action === 'REVERSE')).toHaveLength(1);
    const reverse = timeline.find((f) => f.action === 'REVERSE')!;
    expect(reverse.variables?.walkOrder).toBe(`[${[...finalState.optimalSequence].reverse().join(', ')}]`);
    expect(reverse.variables?.reversed).toBe(`[${finalState.optimalSequence.join(', ')}]`);
  });

  it('asks for the extend-or-keep prediction at a genuine choice and the parent jump on the walk', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.defaultInput as any);

    const extend = timeline.filter((f) => f.checkpoint?.id === 'lis-extend-or-keep');
    expect(extend).toHaveLength(1);
    const check = extend[0];
    expect(check.action).toBe('CHECK_BETTER');
    const v = check.variables ?? {};
    expect(v.candidate).not.toBe(v['dp[i]']);
    expect(check.checkpoint?.correctIndex).toBe(v.candidate > v['dp[i]'] ? 0 : 1);
    expect(check.checkpoint?.options[0]).toContain(String(v.candidate));
    expect(check.checkpoint?.options[1]).toContain(String(v['dp[i]']));

    const jumps = timeline.filter((f) => f.checkpoint?.id === 'lis-parent-jump');
    expect(jumps).toHaveLength(1);
    const jump = jumps[0];
    expect(jump.action).toBe('WALK_PICK');
    const firstMove = timeline.filter((f) => f.action === 'WALK_MOVE')[0];
    expect(jump.stepIndex).toBeLessThan(firstMove.stepIndex);
    const options = jump.checkpoint!.options;
    expect(new Set(options).size).toBe(options.length);
    expect(options[jump.checkpoint!.correctIndex]).toContain('Index');
    // The correct option names the real predecessor.
    const best = jump.variables?.best as number;
    const parent = jump.state.parent[best];
    if (parent !== -1) {
      expect(options[0]).toContain(`Index ${parent}`);
      expect(options[0]).toContain(String(jump.state.array[parent]));
    }
    expect(timeline.filter((f) => f.isMilestone)).toHaveLength(6);
    const titles = timeline.filter((f) => f.isMilestone).map((f) => f.milestoneTitle);
    expect(titles).toEqual(
      expect.arrayContaining(['Start', 'Base Case dp[:]=1', 'First Extension', 'Fill Complete', 'Longest Chain Found', 'LIS Reconstructed'])
    );
  });

  it('maps every action to an exact line in all five 22-line snippets', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.presets[1].data as any);
    const lineMatchers: Record<number, RegExp> = {
      2: /== 0|return/,
      3: /n =|len|length|size/,
      4: /dp.*1|fill\(dp/,
      5: /parent.*-1|fill\(parent/,
      6: /for \((let |int )?i|for i in range|for i = 1/,
      8: /nums\[j\] < nums\[i\]|nums\[j\] < nums\[i\]/,
      9: /dp\[j\] \+ 1 > dp\[i\]/,
      10: /dp\[i\] = dp\[j\] \+ 1/,
      11: /parent\[i\] = j/,
      12: /best = 0/,
      13: /for \((let |int )?i = 1; i < n; i\+\+\)|for i in range\(1, n\)|for i = 1 to n - 1/,
      14: /dp\[i\] > dp\[best\]/,
      15: /best = i/,
      16: /maxLen = dp\[best\]|max_len = dp\[best\]/,
      19: /push|append|add/,
      20: /best = parent\[best\]/,
      21: /reverse|Reverse/,
      22: /return/,
    };
    const languages = ['pseudocode', 'python', 'typescript', 'cpp', 'java'] as const;
    for (const lang of languages) {
      const raw = module.codeSnippets[lang];
      const lines = raw.split('\n');
      expect(lines, `${lang} snippet line count`).toHaveLength(22);
      for (const frame of timeline) {
        const line = resolveActiveCodeLine(raw, frame, timeline);
        expect(line, `${lang} ${frame.action} line ${line}: ${lines[line - 1]}`).toBe(frame.codeLine);
        expect(lines[line - 1]).toMatch(lineMatchers[frame.codeLine]);
      }
    }
  });

  it('handles empty, invalid, clamped and truncated input honestly', () => {
    const module = mod();

    const empty = module.generateTimeline({ array: [] } as any);
    expect(empty).toHaveLength(2);
    expect(empty[0].conditionEval?.result).toBe(true);
    expect(empty[1].variables?.maxLen).toBe(0);
    expect(empty[1].state.phase).toBe('done');
    expect(auditTimeline(module, { array: [] } as any).errorCount).toBe(0);

    const invalid = module.generateTimeline({ array: ['x', 3, null, 7] } as any);
    expect(invalid[0].explanation).toMatch(/2 non-numeric value\(s\) dropped/);
    expect(invalid[invalid.length - 1].variables?.maxLen).toBe(2);
    expect(invalid[invalid.length - 1].variables?.sequence).toBe('3, 7');

    const clamped = module.generateTimeline({ array: [5, 1000, -1000, 6] } as any);
    expect(clamped[0].explanation).toMatch(/clamped/);
    expect(clamped[0].state.array).toEqual([5, 999, -999, 6]);

    const truncated = module.generateTimeline({ array: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } as any);
    expect(truncated[0].explanation).toMatch(/truncated to 10/);
    expect(truncated[0].state.array).toHaveLength(10);
    expect(truncated[truncated.length - 1].variables?.maxLen).toBe(10);
    expect(auditTimeline(module, { array: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } as any).errorCount).toBe(0);

    const fallback = module.generateTimeline({ array: ['a', 'b'] } as any);
    expect(fallback[0].state.array).toEqual([10, 9, 2, 5, 3, 7, 101, 18]);
    expect(fallback[fallback.length - 1].variables?.maxLen).toBe(4);

    for (const data of [module.defaultInput, module.presets[3].data, { array: [] }]) {
      const timeline = module.generateTimeline(data as any);
      for (const frame of [timeline[0], timeline[Math.floor(timeline.length / 2)], timeline[timeline.length - 1]]) {
        expect(() => module.renderStage(frame, '2d')).not.toThrow();
      }
    }
  });
});

describe('unbounded knapsack regressions', () => {
  const mod = () => moduleById('unbounded-knapsack');

  function tableProblems(state: any): string[] {
    const problems: string[] = [];
    const { items, capacity, dp, parent } = state;
    if (dp.length !== capacity + 1) problems.push(`dp size ${dp.length} != ${capacity + 1}`);
    if (parent.length !== capacity + 1) problems.push(`parent size ${parent.length} != ${capacity + 1}`);
    for (let w = 0; w <= capacity; w++) {
      if (parent[w] !== -1 && (parent[w] < 0 || parent[w] >= items.length)) {
        problems.push(`parent[${w}] = ${parent[w]} is not a valid item index`);
      } else if (parent[w] !== -1) {
        const item = items[parent[w]];
        if (item.weight > w) problems.push(`parent[${w}] names '${item.name}' which does not fit capacity ${w}`);
        // An UPDATE frame has already written the new dp but not yet the new parent.
        if (state.actionType !== 'UPDATE' && dp[w] !== dp[w - item.weight] + item.value) {
          problems.push(`dp[${w}] = ${dp[w]} but dp[parent] + value = ${dp[w - item.weight] + item.value}`);
        }
      }
    }
    // Once the fill phase passed capacity w, dp[w] must satisfy the full recurrence.
    if (state.phase === 'walk' || state.phase === 'done') {
      for (let w = 0; w <= capacity; w++) {
        const fitting = items.filter((item: any) => item.weight <= w);
        const expected = fitting.reduce(
          (best: number, item: any) => Math.max(best, dp[w - item.weight] + item.value),
          0
        );
        if (dp[w] !== expected) problems.push(`dp[${w}] = ${dp[w]} but the unbounded recurrence gives ${expected}`);
      }
    }
    return problems;
  }

  function packingProblems(state: any): string[] {
    const problems: string[] = [];
    if (state.phase !== 'done') return problems;
    const { items, capacity, dp, walkPicks, remainingCapacity, stats } = state;
    let weight = 0;
    let value = 0;
    let expectedCapacity = capacity;
    for (const pick of walkPicks) {
      const item = items[pick.itemIndex];
      if (pick.itemName !== item.name) problems.push('pick names the wrong item');
      if (pick.capacityBefore !== expectedCapacity) problems.push(`pick at capacity ${pick.capacityBefore}, expected ${expectedCapacity}`);
      if (pick.capacityAfter !== expectedCapacity - item.weight) problems.push('pick capacityAfter is wrong');
      weight += item.weight;
      value += item.value;
      expectedCapacity -= item.weight;
    }
    if (expectedCapacity !== remainingCapacity) problems.push('remaining capacity does not match the walk');
    if (weight > capacity) problems.push(`packing weighs ${weight} > ${capacity}`);
    if (value !== dp[capacity]) problems.push(`packing value ${value} != dp[${capacity}] = ${dp[capacity]}`);
    if (stats.walkSteps !== walkPicks.length) problems.push('walkSteps disagrees with walkPicks');
    return problems;
  }

  it('solves every preset with an optimal reusable packing', () => {
    const module = mod();
    const expected: Record<string, { value: number; picks: string; weight: number }> = {
      'coin-density': { value: 28, picks: 'C, C', weight: 10 },
      'high-density-light': { value: 28, picks: 'Gem, Gem, Gem, Gem', weight: 8 },
      'reuse-beats-unique': { value: 18, picks: 'Sword, Sword', weight: 10 },
    };
    for (const preset of module.presets) {
      const timeline = module.generateTimeline(preset.data as any);
      const last = timeline[timeline.length - 1];
      const want = expected[preset.id];
      expect(last.variables?.maxValue, `value for ${preset.id}`).toBe(want.value);
      expect(last.variables?.picks, `packing for ${preset.id}`).toBe(want.picks);
      expect(last.variables?.pickedWeight, `weight for ${preset.id}`).toBe(want.weight);
      expect(last.state.phase).toBe('done');

      for (const frame of timeline) {
        expect(tableProblems(frame.state), `frame ${frame.stepIndex} (${frame.action})`).toEqual([]);
        expect(packingProblems(frame.state), `packing on frame ${frame.stepIndex}`).toEqual([]);
        expect(frame.pedagogy?.what, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.why, `pedagogy missing on ${frame.action}`).toBeTruthy();
        expect(frame.pedagogy?.whatNext, `pedagogy missing on ${frame.action}`).toBeTruthy();
      }
      const audit = auditTimeline(module, preset.data as any);
      expect(audit.errorCount).toBe(0);
      expect(audit.warningCount).toBe(0);
    }
  });

  it('tests every item per capacity with separate candidate, update and link frames', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.defaultInput as any);
    const { items, capacity } = module.defaultInput;

    expect(timeline[0].action).toBe('INIT');
    expect(timeline.filter((f) => f.action === 'W_START')).toHaveLength(capacity);
    const tries = timeline.filter((f) => f.action === 'ITEM_TRY');
    expect(tries).toHaveLength(items.length * capacity);
    for (const frame of tries) {
      expect(frame.state.currentItem).toBe(frame.state.candidate.i);
      expect(frame.conditionEval?.result).toBe(items[frame.state.candidate.i].weight <= frame.variables!.w);
    }
    const fits = tries.filter((f) => f.conditionEval?.result === true);
    const candidates = timeline.filter((f) => f.action === 'CANDIDATE');
    expect(candidates).toHaveLength(fits.length);
    for (const frame of candidates) {
      const v = frame.variables!;
      expect(v.candidate).toBe(v['dp[w-wt]'] + v.itemValue);
      expect(frame.conditionEval?.result).toBe(v.candidate);
    }
    const updates = timeline.filter((f) => f.action === 'UPDATE');
    const links = timeline.filter((f) => f.action === 'LINK');
    expect(links).toHaveLength(updates.length);
    for (const link of links) {
      const before = timeline[link.stepIndex - 1];
      expect(before.action).toBe('UPDATE');
      expect(before.variables?.w).toBe(link.variables?.w);
      const w = link.variables!.w;
      const linked = link.state.items[link.state.parent[w]];
      expect(linked.name).toBe(link.variables!.item);
      expect(link.state.dp[w]).toBe(link.state.dp[w - linked.weight] + linked.value);
      expect(link.state.parent[w]).toBe(items.findIndex((i: { name: string }) => i.name === linked.name));
    }
    // A fitting candidate that loses is honestly reported as skipped.
    const skippedCandidates = candidates.filter((f) => f.variables!.candidate <= f.variables!.currentBest);
    expect(skippedCandidates.length + updates.length).toBe(fits.length);
    for (const frame of skippedCandidates) {
      const after = timeline[frame.stepIndex + 1];
      expect(after.action === 'CANDIDATE' || after.action === 'W_START' || after.action === 'ITEM_TRY').toBe(true);
      expect(after.state.dp[frame.variables!.w]).toBe(frame.variables!.currentBest);
    }

    const expectedLines: Record<string, number[]> = {
      INIT: [2],
      W_START: [4],
      ITEM_TRY: [6],
      CANDIDATE: [7],
      UPDATE: [9],
      LINK: [10],
      TABLE_DONE: [11],
      WALK_START: [13],
      PICK: [15],
      MOVE: [16],
      DONE: [17],
    };
    for (const frame of timeline) {
      const allowed = expectedLines[frame.action ?? ''];
      expect(allowed, `unexpected action ${frame.action}`).toBeDefined();
      expect(allowed, `${frame.action} at frame ${frame.stepIndex}`).toContain(frame.codeLine);
    }
  });

  it('walks the parent chain and proves the reuse is real', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.defaultInput as any);
    const finalState = timeline[timeline.length - 1].state;

    const picks = timeline.filter((f) => f.action === 'PICK');
    const moves = timeline.filter((f) => f.action === 'MOVE');
    expect(picks).toHaveLength(finalState.walkPicks.length);
    expect(moves).toHaveLength(picks.length);
    for (const pick of picks) {
      const w = pick.variables!.w;
      expect(finalState.parent[w]).toBe(finalState.items.findIndex((i: any) => i.name === pick.variables!.item));
      expect(pick.variables!.copyNumber).toBe(pick.variables!.picksSoFar.split(', ').filter((n: string) => n === pick.variables!.item).length);
    }
    for (const move of moves) {
      const pick = timeline[move.stepIndex - 1];
      expect(pick.action).toBe('PICK');
      expect(move.variables!.previousW).toBe(pick.variables!.w);
      expect(move.state.dp[move.variables!.previousW] - pick.state.items[finalState.parent[pick.variables!.w]].value).toBe(
        move.state.dp[move.variables!.w]
      );
    }
    // The default optimum is C twice — the unbounded hallmark.
    expect(finalState.walkPicks.map((p: any) => p.itemName)).toEqual(['C', 'C']);
    expect(finalState.pickedCounts['C']).toBe(2);
    const reuseMilestone = timeline.filter((f) => f.milestoneTitle === 'Same Item Reused');
    expect(reuseMilestone).toHaveLength(1);
    expect(reuseMilestone[0].action).toBe('PICK');
    expect(reuseMilestone[0].variables!.copyNumber).toBe(2);
  });

  it('asks for the candidate prediction and the walk jump at genuine points', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.defaultInput as any);

    const candidateCps = timeline.filter((f) => f.checkpoint?.id === 'unbounded-candidate-vs-best');
    expect(candidateCps).toHaveLength(1);
    const check = candidateCps[0];
    expect(check.action).toBe('CANDIDATE');
    const v = check.variables ?? {};
    expect(v.candidate).not.toBe(v.currentBest);
    expect(check.checkpoint?.correctIndex).toBe(v.candidate > v.currentBest ? 0 : 1);
    expect(check.checkpoint?.options[0]).toContain(String(Math.max(v.candidate, v.currentBest)));

    const walkCps = timeline.filter((f) => f.checkpoint?.id === 'unbounded-walk-jump');
    expect(walkCps).toHaveLength(1);
    const jump = walkCps[0];
    expect(jump.action).toBe('PICK');
    const options = jump.checkpoint!.options;
    expect(new Set(options).size).toBe(options.length);
    expect(options[0]).toContain(String(jump.variables!.w - jump.state.items[jump.state.parent[jump.variables!.w]].weight));
    const firstMove = timeline.filter((f) => f.action === 'MOVE')[0];
    expect(jump.stepIndex).toBeLessThan(firstMove.stepIndex);

    expect(timeline.filter((f) => f.isMilestone)).toHaveLength(6);
    const titles = timeline.filter((f) => f.isMilestone).map((f) => f.milestoneTitle);
    expect(titles).toEqual(
      expect.arrayContaining(['Start', 'First Update', 'Table Complete', 'First Copy Picked', 'Same Item Reused', 'Knapsack Solved'])
    );
  });

  it('maps every action to an exact line in all five 17-line snippets', () => {
    const module = mod();
    const timeline = module.generateTimeline(module.presets[1].data as any);
    const lineMatchers: Record<number, RegExp> = {
      2: /dp/,
      4: /for w|for \(int w|for \(let w|for w in range/,
      6: /<= w/,
      7: /candidate/,
      8: /candidate > dp\[w\]/,
      9: /dp\[w\] = candidate/,
      10: /parent\[w\] = i/,
      11: /best/,
      12: /picks/,
      13: /w = W|let w = W|int w = W/,
      14: /while/,
      15: /push|append|count\+\+/,
      16: /w -=|w = w - /,
      17: /return/,
    };
    const languages = ['pseudocode', 'python', 'typescript', 'cpp', 'java'] as const;
    for (const lang of languages) {
      const raw = module.codeSnippets[lang];
      const lines = raw.split('\n');
      expect(lines, `${lang} snippet line count`).toHaveLength(17);
      for (const frame of timeline) {
        const line = resolveActiveCodeLine(raw, frame, timeline);
        expect(line, `${lang} ${frame.action} line ${line}: ${lines[line - 1]}`).toBe(frame.codeLine);
        if (lineMatchers[frame.codeLine]) {
          expect(lines[line - 1]).toMatch(lineMatchers[frame.codeLine]);
        }
      }
    }
  });

  it('handles empty, invalid, clamped and legacy input honestly', () => {
    const module = mod();

    const empty = module.generateTimeline({ capacity: 5, items: [] } as any);
    expect(empty[empty.length - 1].variables?.maxValue).toBe(0);
    expect(empty[empty.length - 1].variables?.picks).toBe('(none)');
    expect(auditTimeline(module, { capacity: 5, items: [] } as any).errorCount).toBe(0);

    const invalid = module.generateTimeline({ capacity: 5, items: [{ name: 'bad' }] } as any);
    expect(invalid[0].explanation).toMatch(/no usable items/);
    // Capacity 5 with the default items: one copy of C (14) beats A+B (13).
    expect(invalid[invalid.length - 1].variables?.maxValue).toBe(14);
    expect(invalid[invalid.length - 1].variables?.picks).toBe('C');

    const clamped = module.generateTimeline({
      capacity: 99,
      items: [
        { name: 'Heavy', weight: 0, value: 500 },
        { name: 'Light', weight: 2, value: 3 },
      ],
    } as any);
    expect(clamped[0].explanation).toMatch(/clamped/);
    expect(clamped[0].state.items.map((i: any) => i.weight)).toEqual([1, 2]);
    expect(clamped[0].state.items.map((i: any) => i.value)).toEqual([99, 3]);
    expect(clamped[0].state.capacity).toBe(15);
    expect(clamped[0].state.items.map((i: any) => i.id)).toEqual([1, 2]);

    const tooHeavy = module.generateTimeline({
      capacity: 3,
      items: [
        { name: 'Big', weight: 9, value: 50 },
        { name: 'Small', weight: 3, value: 4 },
      ],
    } as any);
    expect(tooHeavy[tooHeavy.length - 1].variables?.maxValue).toBe(4);
    expect(tooHeavy[tooHeavy.length - 1].variables?.picks).toBe('Small');

    const fallback = module.generateTimeline({} as any);
    expect(fallback[0].state.items.map((i: any) => i.name)).toEqual(['A', 'B', 'C']);
    expect(fallback[fallback.length - 1].variables?.maxValue).toBe(28);

    for (const data of [module.defaultInput, module.presets[2].data, { capacity: 5, items: [] }]) {
      const timeline = module.generateTimeline(data as any);
      for (const frame of [timeline[0], timeline[Math.floor(timeline.length / 2)], timeline[timeline.length - 1]]) {
        expect(() => module.renderStage(frame, '2d')).not.toThrow();
      }
    }
  });
});
