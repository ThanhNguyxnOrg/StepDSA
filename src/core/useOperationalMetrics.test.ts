import { describe, it, expect } from 'vitest';
import { computeCumulativeMetrics } from './useOperationalMetrics';
import { ExecutionFrame } from './types';

describe('computeCumulativeMetrics', () => {
  it('accumulates comparisons, swaps, and accesses from frame actions and element states', () => {
    const timeline: ExecutionFrame[] = [
      {
        stepIndex: 0,
        totalSteps: 3,
        codeLine: 1,
        explanation: 'Comparing elements',
        state: {
          array: [
            { id: 1, value: 5, status: 'comparing' },
            { id: 2, value: 3, status: 'comparing' },
          ],
        },
      },
      {
        stepIndex: 1,
        totalSteps: 3,
        codeLine: 2,
        explanation: 'Swap 5 and 3',
        action: 'swap',
        state: {
          array: [
            { id: 2, value: 3, status: 'swapping' },
            { id: 1, value: 5, status: 'swapping' },
          ],
        },
      },
      {
        stepIndex: 2,
        totalSteps: 3,
        codeLine: 3,
        explanation: 'Array is sorted',
        state: {
          array: [
            { id: 2, value: 3, status: 'sorted' },
            { id: 1, value: 5, status: 'sorted' },
          ],
        },
      },
    ];

    const metricsAtStep0 = computeCumulativeMetrics(timeline, 0);
    expect(metricsAtStep0.comparisons).toBe(1);
    expect(metricsAtStep0.swaps).toBe(0);

    const metricsAtStep1 = computeCumulativeMetrics(timeline, 1);
    expect(metricsAtStep1.comparisons).toBe(1);
    expect(metricsAtStep1.swaps).toBe(1);
    expect(metricsAtStep1.accesses).toBeGreaterThanOrEqual(2);
  });

  it('respects pre-computed metrics if supplied on frame', () => {
    const timeline: ExecutionFrame[] = [
      {
        stepIndex: 0,
        totalSteps: 1,
        codeLine: 1,
        explanation: 'Precomputed step',
        metrics: { comparisons: 42, swaps: 7, accesses: 100, lookups: 12 },
        state: {},
      },
    ];
    const metrics = computeCumulativeMetrics(timeline, 0);
    expect(metrics.comparisons).toBe(42);
    expect(metrics.swaps).toBe(7);
    expect(metrics.accesses).toBe(100);
    expect(metrics.lookups).toBe(12);
  });

  it('handles empty timeline and out-of-bound indices gracefully without error', () => {
    expect(computeCumulativeMetrics([], 0)).toEqual({
      comparisons: 0,
      swaps: 0,
      accesses: 0,
      lookups: 0,
    });
    expect(computeCumulativeMetrics(undefined as any, -1)).toEqual({
      comparisons: 0,
      swaps: 0,
      accesses: 0,
      lookups: 0,
    });
  });
});
