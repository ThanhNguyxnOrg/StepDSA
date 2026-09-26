import { describe, it, expect } from 'vitest';
import { normalizeTimeline } from './timeline';

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
