import { describe, it, expect } from 'vitest';
import { allModules, getModuleById } from './registry';
import { INTERVIEW_MODULE_IDS } from '../components/dashboard/DashboardView';
import { isRotationOfSortedArray } from './searching/rotatedSortedArray';
import { generateRotatedSortedArray } from '../utils/arrayGenerators';
import { resolveCueTone } from '../utils/soundEngine';

describe('Visualizer regression fixes', () => {
  it('does not patch empty first frames with later state (BST starts with 0 nodes)', () => {
    const bst = getModuleById('bst-insert');
    expect(bst).toBeDefined();
    const timeline = bst!.generateTimeline(bst!.defaultInput);
    expect(timeline[0].state.nodes).toHaveLength(0);
    expect(timeline[1].state.nodes.length).toBeGreaterThan(0);
  });

  it('binary-tree-topologies computes Balanced = YES for the Full tree preset', () => {
    const mod = getModuleById('binary-tree-topologies');
    expect(mod).toBeDefined();
    const timeline = mod!.generateTimeline({ topology: 'full' });
    expect(timeline[0].state.properties.isBalanced).toBe(true);
    expect(timeline[0].state.properties.isFull).toBe(true);
    expect(timeline[0].state.properties.isComplete).toBe(false);
  });

  it('tree stages receive parent-child links so edges are drawn', () => {
    const cases: { id: string; input?: any }[] = [
      { id: 'level-order-traversal' },
      { id: 'max-heap-build' },
      { id: 'segment-tree' },
    ];
    for (const { id, input } of cases) {
      const mod = getModuleById(id);
      expect(mod, id).toBeDefined();
      const timeline = mod!.generateTimeline(input ?? mod!.defaultInput);
      const withLinks = timeline.some((frame) =>
        Array.isArray(frame.state.nodes) &&
        frame.state.nodes.some((n: any) => n.leftId !== undefined || n.rightId !== undefined)
      );
      expect(withLinks, `${id} has no leftId/rightId edges`).toBe(true);
    }
  });

  it('level-order-traversal keeps unique node ids for duplicate input values', () => {
    const mod = getModuleById('level-order-traversal');
    const timeline = mod!.generateTimeline([5, 3, 5, 3, 7]);
    const ids = timeline[timeline.length - 1].state.nodes.map((n: any) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(5);
  });

  it('interpolation search finds a target inside an all-equal sorted array', () => {
    const mod = getModuleById('interpolation-search');
    const timeline = mod!.generateTimeline({ array: [5, 5], target: 5 });
    const last = timeline[timeline.length - 1];
    expect(last.action).not.toBe('TARGET_NOT_FOUND');
    expect(last.explanation.toLowerCase()).not.toContain('absent');
  });

  it('rotated search rejects non-rotated input instead of reporting a false "not found"', () => {
    const mod = getModuleById('rotated-sorted-array');
    const invalid = mod!.generateTimeline({ array: [17, 18, 11, 9, 10, 7], target: 7 });
    const lastInvalid = invalid[invalid.length - 1];
    expect(lastInvalid.state.phase).toBe('invalid');
    expect(lastInvalid.explanation).toContain('Input rejected');

    const valid = mod!.generateTimeline({ array: [4, 5, 6, 7, 0, 1, 2], target: 0 });
    expect(valid[valid.length - 1].state.foundIndex).toBe(4);
  });

  it('rotation helpers agree with the rotated-search precondition', () => {
    expect(isRotationOfSortedArray([4, 5, 6, 7, 0, 1, 2])).toBe(true);
    expect(isRotationOfSortedArray([2, 2, 2, 0, 2, 2])).toBe(true);
    expect(isRotationOfSortedArray([1, 2, 3, 4])).toBe(true);
    expect(isRotationOfSortedArray([17, 18, 11, 9, 10, 7])).toBe(false);
    for (let i = 0; i < 20; i++) {
      expect(isRotationOfSortedArray(generateRotatedSortedArray(10))).toBe(true);
    }
  });

  it('heaps and stacks accept the full custom input instead of silently truncating', () => {
    const heap = getModuleById('max-heap-build');
    const heapTimeline = heap!.generateTimeline([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
    const heapNodes = heapTimeline[heapTimeline.length - 1].state.nodes;
    expect(heapNodes).toHaveLength(10);

    const stack = getModuleById('stack-lifo');
    const stackTimeline = stack!.generateTimeline([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const deepest = stackTimeline[stackTimeline.length - 1].state;
    expect(deepest.items.length).toBeGreaterThanOrEqual(8);
    expect(deepest.capacity).toBeGreaterThanOrEqual(10);
  });

  it('maps sound cues to tones while routine steps stay silent', () => {
    expect(resolveCueTone('compare')?.frequency).toBeGreaterThan(0);
    expect(resolveCueTone({ type: 'swap' })?.type).toBe('square');
    expect(resolveCueTone('step')).toBeNull();
    expect(resolveCueTone(undefined)).toBeNull();
  });

  it('every Interview-track module id exists in the registry', () => {
    for (const id of INTERVIEW_MODULE_IDS) {
      expect(getModuleById(id), `missing module id in INTERVIEW_MODULE_IDS: ${id}`).toBeDefined();
    }
  });

  it('has 162 registered modules with unique ids', () => {
    expect(allModules).toHaveLength(162);
    expect(new Set(allModules.map((m) => m.id)).size).toBe(162);
  });
});
