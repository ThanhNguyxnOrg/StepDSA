import { describe, it, expect } from 'vitest';
import { AlgorithmModule, ExecutionFrame } from './types';
import { withNavigationAnchors } from './navigationAnchors';
import { allModules } from '../modules/registry';

interface FakeState {
  value: number;
}

const makeFrame = (index: number, total: number): ExecutionFrame<FakeState> => ({
  stepIndex: index,
  totalSteps: total,
  codeLine: index + 1,
  explanation: `Frame ${index}`,
  state: { value: index },
});

const makeModule = (
  frames: ExecutionFrame<FakeState>[]
): AlgorithmModule<null, FakeState> => {
  const timeline = frames.map((frame, index) => ({
    ...frame,
    stepIndex: index,
    totalSteps: frames.length,
  }));
  return {
    id: 'fake-anchor-module',
    title: 'Fake Anchor Module',
    category: 'sorting',
    difficulty: 'Beginner',
    complexity: {
      timeBest: 'O(1)',
      timeAverage: 'O(1)',
      timeWorst: 'O(1)',
      spaceAuxiliary: 'O(1)',
      worstCaseCondition: 'n/a',
    },
    theory: { overview: 'test', whyItWorks: 'test', invariant: 'test', pitfalls: [] },
    codeSnippets: { python: '', typescript: '', cpp: '', java: '', pseudocode: '' },
    presets: [],
    defaultInput: null,
    generateTimeline: () => timeline.map((frame) => ({ ...frame, state: { ...frame.state } })),
    renderStage: () => null,
  };
};

describe('withNavigationAnchors', () => {
  it('adds Start/Complete anchors without changing frame order, bookkeeping, or state', () => {
    const raw = makeModule([makeFrame(0, 4), makeFrame(1, 4), makeFrame(2, 4), makeFrame(3, 4)]);
    const wrapped = withNavigationAnchors(raw);
    const frames = wrapped.generateTimeline(null);

    expect(frames).toHaveLength(4);
    expect(frames.map((f) => f.stepIndex)).toEqual([0, 1, 2, 3]);
    expect(frames.every((f) => f.totalSteps === 4)).toBe(true);

    expect(frames[0].isMilestone).toBe(true);
    expect(frames[0].milestoneTitle).toBe('Start');
    expect(frames[3].isMilestone).toBe(true);
    expect(frames[3].milestoneTitle).toBe('Complete');

    // Everything except the anchor metadata must be preserved byte-for-byte.
    const { isMilestone: _s0, milestoneTitle: _t0, ...firstRest } = frames[0];
    const { isMilestone: _s3, milestoneTitle: _t3, ...lastRest } = frames[3];
    expect(firstRest).toEqual(makeFrame(0, 4));
    expect(lastRest).toEqual(makeFrame(3, 4));
    expect(frames[1]).toEqual(makeFrame(1, 4));
    expect(frames[2]).toEqual(makeFrame(2, 4));

    // Deterministic regeneration.
    expect(wrapped.generateTimeline(null)).toEqual(frames);
  });

  it('keeps curated milestone anchors and only fills the missing end', () => {
    const frames = [makeFrame(0, 3), makeFrame(1, 3), makeFrame(2, 3)];
    frames[0] = { ...frames[0], isMilestone: true, milestoneTitle: 'Seed phase' };
    const wrapped = withNavigationAnchors(makeModule(frames));
    const out = wrapped.generateTimeline(null);

    expect(out[0].milestoneTitle).toBe('Seed phase');
    expect(out[0].isMilestone).toBe(true);
    expect(out[2].isMilestone).toBe(true);
    expect(out[2].milestoneTitle).toBe('Complete');
  });

  it('treats a milestoneTitle-only frame as already anchored', () => {
    const frames = [makeFrame(0, 3), makeFrame(1, 3), makeFrame(2, 3)];
    frames[0] = { ...frames[0], milestoneTitle: 'Init snapshot' };
    frames[2] = { ...frames[2], milestoneTitle: 'Final result' };
    const wrapped = withNavigationAnchors(makeModule(frames));
    const out = wrapped.generateTimeline(null);

    expect(out[0].isMilestone).toBeUndefined();
    expect(out[0].milestoneTitle).toBe('Init snapshot');
    expect(out[2].isMilestone).toBeUndefined();
    expect(out[2].milestoneTitle).toBe('Final result');
  });

  it('leaves single-frame timelines untouched', () => {
    const wrapped = withNavigationAnchors(makeModule([makeFrame(0, 1)]));
    const out = wrapped.generateTimeline(null);
    expect(out).toHaveLength(1);
    expect(out[0].isMilestone).toBeUndefined();
  });

  it('every registered module default timeline exposes start and end navigation anchors', () => {
    for (const mod of allModules) {
      const frames = mod.generateTimeline(mod.defaultInput);
      expect(frames.length, `${mod.id} must have a usable timeline`).toBeGreaterThan(1);
      const first = frames[0];
      const last = frames[frames.length - 1];
      expect(
        Boolean(first.isMilestone || first.milestoneTitle),
        `${mod.id} first frame must be a milestone anchor`
      ).toBe(true);
      expect(
        Boolean(last.isMilestone || last.milestoneTitle),
        `${mod.id} last frame must be a milestone anchor`
      ).toBe(true);
    }
  }, 120_000);
});
