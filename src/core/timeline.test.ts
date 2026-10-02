import { describe, it, expect } from 'vitest';
import { normalizeTimeline, calculateAdaptiveDelay } from './timeline';

describe('normalizeTimeline', () => {
  it('returns a fallback 1-step timeline when given empty array', () => {
    const emptyTimeline = normalizeTimeline([]);
    expect(emptyTimeline).toHaveLength(1);
    expect(emptyTimeline[0].stepIndex).toBe(0);
    expect(emptyTimeline[0].totalSteps).toBe(1);
  });

  it('normalizes steps with correct 0-based indices and totalSteps count', () => {
    const rawFrames = [
      { codeLine: 1, explanation: 'Step 1', state: { val: 1 } },
      { codeLine: 5, explanation: 'Step 2', state: { val: 2 } },
      { codeLine: 12, explanation: 'Step 3', state: { val: 3 } },
    ];

    const timeline = normalizeTimeline(rawFrames);
    expect(timeline).toHaveLength(3);
    expect(timeline[0].stepIndex).toBe(0);
    expect(timeline[0].totalSteps).toBe(3);
    expect(timeline[1].stepIndex).toBe(1);
    expect(timeline[2].stepIndex).toBe(2);
  });
});

describe('calculateAdaptiveDelay', () => {
  it('returns baseDelayMs unchanged when isAutoPacing is false', () => {
    const frame: any = { action: 'swap', soundCue: 'swap' };
    expect(calculateAdaptiveDelay(frame, 600, false)).toBe(600);
  });

  it('decelerates (increases delay) on decisive swap action or milestone', () => {
    const swapFrame: any = { action: 'swap elements', isMilestone: false };
    const milestoneFrame: any = { isMilestone: true, milestoneTitle: 'Partition done' };
    const normalFrame: any = { action: 'comparing', isMilestone: false };

    const swapDelay = calculateAdaptiveDelay(swapFrame, 600, true);
    const milestoneDelay = calculateAdaptiveDelay(milestoneFrame, 600, true);
    const normalDelay = calculateAdaptiveDelay(normalFrame, 600, true);

    expect(swapDelay).toBeGreaterThan(600);
    expect(milestoneDelay).toBeGreaterThan(600);
    expect(normalDelay).toBeLessThan(600); // accelerates scan loops
  });
});
