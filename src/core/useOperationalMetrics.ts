import { useMemo } from 'react';
import { ExecutionFrame, OperationalMetrics } from './types';

/**
 * Computes cumulative operational metrics (comparisons, swaps, accesses, lookups)
 * from step 0 through the current step.
 */
export function computeCumulativeMetrics(
  timeline: ExecutionFrame[] = [],
  currentStep: number = 0
): OperationalMetrics {
  if (!timeline || timeline.length === 0 || currentStep < 0) {
    return { comparisons: 0, swaps: 0, accesses: 0, lookups: 0 };
  }

  const boundedStep = Math.min(currentStep, timeline.length - 1);
  const targetFrame = timeline[boundedStep];

  // If the target frame already contains precomputed cumulative metrics, return them directly
  if (targetFrame?.metrics && targetFrame.metrics.comparisons !== undefined) {
    return {
      comparisons: targetFrame.metrics.comparisons ?? 0,
      swaps: targetFrame.metrics.swaps ?? 0,
      accesses: targetFrame.metrics.accesses ?? 0,
      lookups: targetFrame.metrics.lookups ?? 0,
    };
  }

  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;
  let lookups = 0;

  for (let i = 0; i <= boundedStep; i++) {
    const frame = timeline[i];
    if (!frame) continue;

    const action = frame.action?.toLowerCase() || '';
    const explanation = frame.explanation?.toLowerCase() || '';

    // Check for swap
    const isSwapAction =
      action.includes('swap') ||
      explanation.includes('swap') ||
      (frame.state?.array &&
        Array.isArray(frame.state.array) &&
        frame.state.array.some((el: any) => el?.status === 'swapping'));

    if (isSwapAction) {
      swaps += 1;
      accesses += 2; // Write / swap accesses at least 2 positions
    }

    // Check for compare
    const isCompareAction =
      action.includes('compare') ||
      explanation.includes('compare') ||
      Boolean(frame.conditionEval) ||
      (frame.state?.array &&
        Array.isArray(frame.state.array) &&
        frame.state.array.some((el: any) => el?.status === 'comparing'));

    if (isCompareAction) {
      comparisons += 1;
      accesses += 2; // Read 2 positions
    }

    // Check for hash lookup or search
    const isLookupAction =
      action.includes('lookup') ||
      action.includes('hash') ||
      explanation.includes('hash') ||
      explanation.includes('lookup') ||
      explanation.includes('search') ||
      action.includes('find') ||
      explanation.includes('complement');

    if (isLookupAction) {
      lookups += 1;
      accesses += 1;
    }
  }

  return { comparisons, swaps, accesses, lookups };
}

/**
 * React hook to memoize cumulative operational metrics calculation.
 */
export function useOperationalMetrics(
  timeline: ExecutionFrame[] = [],
  currentStep: number = 0
): OperationalMetrics {
  return useMemo(
    () => computeCumulativeMetrics(timeline, currentStep),
    [timeline, currentStep]
  );
}
