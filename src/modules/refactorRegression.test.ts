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
    expectSorted(arrayValues(timeline[timeline.length - 1]));
    expect(auditTimeline(mod, input).errorCount).toBe(0);
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
