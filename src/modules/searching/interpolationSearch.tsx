import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const interpolationSearchModule: AlgorithmModule<
  { array: number[]; target: number },
  ArrayStageState
> = {
  id: 'interpolation-search',
  title: 'Interpolation Search (Proportional Probing O(log log N))',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log log N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Non-uniformly distributed array with exponential growth',
  },
  theory: {
    overview:
      'Interpolation Search calculates the probe position based on the value of the target relative to the values at the low and high indices, analogous to how humans look up a word in a physical telephone directory.',
    whyItWorks:
      'For uniformly distributed data, the distance of the target from the lower bound is proportional to the difference between target and arr[low]: pos = low + ((target - arr[low]) * (high - low)) / (arr[high] - arr[low]).',
    invariant:
      'Search Range Invariant: If target exists, arr[low] <= target <= arr[high] must hold.',
    pitfalls: [
      'Data must be sorted and ideally uniformly distributed; skewed data degenerates performance to O(N).',
      'Division by zero if arr[high] == arr[low].',
      'Probe position pos must be checked to stay strictly within [low, high].',
    ],
  },
  presets: [
    {
      id: 'multistep-nonuniform',
      label: 'Non-Uniform Probe Refinement (Find 23)',
      description: 'Demonstrates proportional slope probing converging to target 23 over multiple steps',
      data: { array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23 },
    },
    {
      id: 'uniform-found',
      label: 'Uniform Array (Find 70)',
      description: 'Evenly spaced integers [10, 20, ..., 100]',
      data: { array: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], target: 70 },
    },
    {
      id: 'target-absent',
      label: 'Target Absent (Find 45)',
      description: 'Probing narrows interval then bounds violation occurs',
      data: { array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 45 },
    },
  ],
  defaultInput: { array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23 },
  codeSnippets: {
    python: `def interpolation_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high and target >= arr[low] and target <= arr[high]:
        if low == high:
            if arr[low] == target: return low
            return -1
        pos = low + int(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]))
        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            low = pos + 1
        else:
            high = pos - 1
    return -1`,
    typescript: `function interpolationSearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      return arr[low] === target ? low : -1;
    }
    const pos = low + Math.floor(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]));
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) {
      low = pos + 1;
    } else {
      high = pos - 1;
    }
  }
  return -1;
}`,
    cpp: `int interpolationSearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        if (low == high) return (arr[low] == target) ? low : -1;
        int pos = low + ((double)(high - low) / (arr[high] - arr[low]) * (target - arr[low]));
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) low = pos + 1;
        else high = pos - 1;
    }
    return -1;
}`,
    java: `public int interpolationSearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        if (low == high) return (arr[low] == target) ? low : -1;
        int pos = low + (int)(((long)(target - arr[low]) * (high - low)) / (arr[high] - arr[low]));
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) low = pos + 1;
        else high = pos - 1;
    }
    return -1;
}`,
    pseudocode: `function interpolationSearch(arr, target):
    low <- 0, high <- length(arr) - 1
    while low <= high and target in [arr[low]..arr[high]]:
        if low == high: return low if arr[low] == target else -1
        pos <- low + ((target - arr[low]) * (high - low)) / (arr[high] - arr[low])
        if arr[pos] == target: return pos
        if arr[pos] < target: low <- pos + 1
        else: high <- pos - 1
    return -1`,
  },
  generateTimeline: (input) => {
    const arr = [...input.array].sort((a, b) => a - b);
    const target = input.target;
    let low = 0;
    let high = arr.length - 1;
    const frames: ExecutionFrame<ArrayStageState>[] = [];

    const callStack = [{ name: 'interpolationSearch', params: { n: arr.length, target }, line: 2, isCurrent: true }];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      callStack,
      variables: { low, high, target, 'arr[low]': arr[low], 'arr[high]': arr[high] },
      explanation: `Initialized Interpolation Search for target ${target}. Initial bounds [low=${low}, high=${high}], candidate span [${arr[low]}..${arr[high]}].`,
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: 'default' })),
        pointers: { low, high },
        target,
      },
    });

    while (low <= high && target >= arr[low] && target <= arr[high]) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        action: 'CHECK_INVARIANT',
        callStack,
        conditionEval: {
          expr: `${low} <= ${high} && ${arr[low]} <= ${target} <= ${arr[high]}`,
          result: true,
        },
        variables: { low, high, target, 'arr[low]': arr[low], 'arr[high]': arr[high] },
        invariantStatus: {
          label: `Target ${target} is within span [${arr[low]}..${arr[high]}]`,
          isValid: true,
        },
        explanation: `Checking probe invariant: target ${target} lies within [arr[${low}]=${arr[low]}, arr[${high}]=${arr[high]}]. Continuing search.`,
        state: {
          array: arr.map((v, i) => ({
            id: i,
            value: v,
            status: i >= low && i <= high ? 'active' : 'discarded',
          })),
          pointers: { low, high },
          target,
        },
      });

      if (low === high) {
        if (arr[low] === target) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 5,
            action: 'MATCH_SINGLETON',
            isMilestone: true,
            milestoneTitle: `Target Found at [${low}]`,
            callStack,
            conditionEval: { expr: `arr[${low}] === ${target}`, result: true },
            variables: { low, high, target, foundIndex: low },
            explanation: `Search space narrowed to single index ${low}. Value matches target ${target}!`,
            state: {
              array: arr.map((v, i) => ({
                id: i,
                value: v,
                status: i === low ? 'sorted' : 'discarded',
              })),
              pointers: { found: low },
              target,
            },
          });
        }
        break;
      }

      const fraction = (target - arr[low]) / (arr[high] - arr[low]);
      const pos = low + Math.floor(fraction * (high - low));

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        action: 'COMPUTE_PROBE',
        isMilestone: true,
        milestoneTitle: `Probe Formula -> Index ${pos}`,
        callStack,
        variables: {
          low,
          high,
          target,
          deltaVal: target - arr[low],
          totalSpan: arr[high] - arr[low],
          fraction: parseFloat(fraction.toFixed(3)),
          pos,
          'arr[pos]': arr[pos],
        },
        explanation: `Proportional probe formula: fraction = (${target} - ${arr[low]}) / (${arr[high]} - ${arr[low]}) = ${fraction.toFixed(3)}. Estimated index pos = ${low} + floor(${fraction.toFixed(3)} * ${high - low}) = ${pos}.`,
        state: {
          array: arr.map((v, i) => ({
            id: i,
            value: v,
            status: i === pos ? 'comparing' : i >= low && i <= high ? 'active' : 'discarded',
          })),
          pointers: { low, pos, high },
          target,
        },
      });

      // Comparison frame
      const isEqual = arr[pos] === target;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        action: 'COMPARE_PROBE',
        callStack,
        conditionEval: {
          expr: `arr[${pos}] (${arr[pos]}) === target (${target})`,
          result: isEqual,
        },
        variables: { pos, 'arr[pos]': arr[pos], target, comparison: isEqual ? 'MATCH' : arr[pos] < target ? 'LESS' : 'GREATER' },
        explanation: `Evaluating probe value: arr[${pos}] = ${arr[pos]} vs target ${target}. ${
          isEqual ? 'Exact match found!' : arr[pos] < target ? 'Probe value is less than target.' : 'Probe value is greater than target.'
        }`,
        state: {
          array: arr.map((v, i) => ({
            id: i,
            value: v,
            status: i === pos ? 'comparing' : i >= low && i <= high ? 'active' : 'discarded',
          })),
          pointers: { low, pos, high },
          target,
        },
      });

      if (isEqual) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          action: 'MATCH_FOUND',
          isMilestone: true,
          milestoneTitle: `Target Found at [${pos}]`,
          callStack,
          variables: { foundAt: pos, target, 'arr[pos]': arr[pos] },
          explanation: `🎯 Target ${target} successfully located at index [${pos}]! Interpolation search complete.`,
          state: {
            array: arr.map((v, i) => ({
              id: i,
              value: v,
              status: i === pos ? 'sorted' : 'default',
            })),
            pointers: { found: pos },
            target,
          },
        });
        break;
      }

      if (arr[pos] < target) {
        const prevLow = low;
        low = pos + 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          action: 'DISCARD_LEFT',
          callStack,
          variables: { low, high, target, discardedUpTo: pos },
          explanation: `Since arr[${pos}] (${arr[pos]}) < ${target}, target must lie above pos. Discarding left range [${prevLow}..${pos}]. Setting low = ${low}.`,
          state: {
            array: arr.map((v, i) => ({
              id: i,
              value: v,
              status: i >= low && i <= high ? 'active' : 'discarded',
            })),
            pointers: { low, high },
            target,
          },
        });
      } else {
        const prevHigh = high;
        high = pos - 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          action: 'DISCARD_RIGHT',
          callStack,
          variables: { low, high, target, discardedFrom: pos },
          explanation: `Since arr[${pos}] (${arr[pos]}) > ${target}, target must lie below pos. Discarding right range [${pos}..${prevHigh}]. Setting high = ${high}.`,
          state: {
            array: arr.map((v, i) => ({
              id: i,
              value: v,
              status: i >= low && i <= high ? 'active' : 'discarded',
            })),
            pointers: { low, high },
            target,
          },
        });
      }
    }

    if (frames.every((f) => f.action !== 'MATCH_FOUND' && f.action !== 'MATCH_SINGLETON')) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 16,
        action: 'TARGET_NOT_FOUND',
        isMilestone: true,
        milestoneTitle: 'Target Not Found',
        callStack,
        conditionEval: {
          expr: `target in [arr[low]..arr[high]]`,
          result: false,
        },
        variables: { low, high, target, result: -1 },
        explanation: `Search terminated: target ${target} falls outside current active bounds or low > high. Target absent from array. Returning -1.`,
        state: {
          array: arr.map((v, i) => ({ id: i, value: v, status: 'discarded' })),
          pointers: { low, high },
          target,
        },
      });
    }

    const total = frames.length;
    return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
