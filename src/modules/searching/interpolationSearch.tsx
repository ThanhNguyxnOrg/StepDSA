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
    let checkpointAdded = false;

    const callStack = [{ name: 'interpolationSearch', params: { n: arr.length, target }, line: 2, isCurrent: true }];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      callStack,
      variables: { low, high, target, 'arr[low]': arr[low], 'arr[high]': arr[high] },
      explanation: `Initialized Interpolation Search for target ${target}. Initial bounds [low=${low}, high=${high}], candidate span [${arr[low]}..${arr[high]}].`,
      pedagogy: {
        what: `Interpolation search estimates the target's position from its value, instead of always probing the midpoint.`,
        why: 'For roughly uniformly distributed sorted data, the value ratio predicts the index well, giving O(log log N) expected probes — faster than binary search.',
        whatNext: `Estimate pos for target ${target} inside span [${arr[low]}..${arr[high]}].`,
      },
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
        codeLine: 3,
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
        pedagogy: {
          what: `The target lies inside the current value span [${arr[low]}..${arr[high]}] and low ≤ high.`,
          why: 'Outside this span the target cannot exist; the guard lets the algorithm stop early without scanning.',
          whatNext: 'Estimate the probe index proportionally.',
        },
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

      // `low === high` is the singleton case; `arr[low] === arr[high]` means every value in the
      // window is equal. The loop guard already proved the target lies in that span, so in both
      // cases a match at `low` is guaranteed and the interpolation fraction would divide by zero.
      if (low === high || arr[high] === arr[low]) {
        if (arr[low] === target) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 4,
            action: 'MATCH_SINGLETON',
            isMilestone: true,
            milestoneTitle: `Target Found at [${low}]`,
            callStack,
            conditionEval: { expr: `arr[${low}] === ${target}`, result: true },
            variables: { low, high, target, foundIndex: low },
            explanation:
              low === high
                ? `Search space narrowed to single index ${low}. Value matches target ${target}!`
                : `Active window [${low}..${high}] contains only equal values; target ${target} matches arr[${low}] directly (no interpolation needed).`,
            pedagogy: {
              what: low === high
                ? `The window collapsed to the single index ${low}, and it holds the target.`
                : `All values in [${low}..${high}] are equal; the span check already proved the target equals them.`,
              why: 'Interpolation would divide by zero here (arr[high] − arr[low] = 0), so this branch resolves the degenerate case directly.',
              whatNext: 'Return low.',
            },
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
        codeLine: 5,
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
        pedagogy: {
          what: `Value ratio (${target} − ${arr[low]}) / (${arr[high]} − ${arr[low]}) = ${fraction.toFixed(3)} places the probe at index ${pos}.`,
          why: 'If values grow roughly linearly with index, the value ratio predicts the index ratio — this is the interpolation assumption.',
          whatNext: `Compare arr[${pos}] = ${arr[pos]} with target ${target}.`,
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'interpolation-probe-ratio',
              question: `Why estimate pos = ${pos} from the value span instead of always probing the midpoint?`,
              options: [
                `Because ${target} sits ${(fraction * 100).toFixed(0)}% of the way through the value span [${arr[low]}..${arr[high]}], so it is expected at the same fraction of the index span`,
                'Because the formula is just a slower way to compute the midpoint',
              ],
              correctIndex: 0,
              explanation:
                'Interpolation trusts the data distribution: uniformly spread values give O(log log N) expected probes. On skewed data the estimate can be poor, degrading to O(N).',
            }
          : undefined,
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
      checkpointAdded = true;

      // Comparison frame
      const isEqual = arr[pos] === target;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
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
        pedagogy: {
          what: `Probe arr[${pos}] = ${arr[pos]} is compared with target ${target}.`,
          why: 'The comparison confirms whether the estimate was exact or tells us which side to keep.',
          whatNext: isEqual ? 'Match — return pos.' : arr[pos] < target ? 'Target is larger: keep (pos, high].' : 'Target is smaller: keep [low, pos).',
        },
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
          codeLine: 6,
          action: 'MATCH_FOUND',
          isMilestone: true,
          milestoneTitle: `Target Found at [${pos}]`,
          callStack,
          variables: { foundAt: pos, target, 'arr[pos]': arr[pos] },
          explanation: `🎯 Target ${target} successfully located at index [${pos}]! Interpolation search complete.`,
          pedagogy: {
            what: `The estimated probe landed exactly on the target at index ${pos}.`,
            why: 'On well-spread data the first or second estimate often hits; this is the O(log log N) best case.',
            whatNext: 'Return pos.',
          },
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
          codeLine: 7,
          action: 'DISCARD_LEFT',
          callStack,
          variables: { low, high, target, discardedUpTo: pos },
          explanation: `Since arr[${pos}] (${arr[pos]}) < ${target}, target must lie above pos. Discarding left range [${prevLow}..${pos}]. Setting low = ${low}.`,
          pedagogy: {
            what: `Discard [${prevLow}..${pos}]; the new window is [${low}..${high}].`,
            why: `Every value there is ≤ ${arr[pos]} < ${target}, so none can match.`,
            whatNext: 'Re-estimate the probe inside the smaller value span.',
          },
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
          codeLine: 8,
          action: 'DISCARD_RIGHT',
          callStack,
          variables: { low, high, target, discardedFrom: pos },
          explanation: `Since arr[${pos}] (${arr[pos]}) > ${target}, target must lie below pos. Discarding right range [${pos}..${prevHigh}]. Setting high = ${high}.`,
          pedagogy: {
            what: `Discard [${pos}..${prevHigh}]; the new window is [${low}..${high}].`,
            why: `Every value there is ≥ ${arr[pos]} > ${target}, so none can match.`,
            whatNext: 'Re-estimate the probe inside the smaller value span.',
          },
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
        codeLine: 9,
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
        pedagogy: {
          what: `The guard failed: either low > high or ${target} lies outside [${arr[low] ?? '?'}..${arr[high] ?? '?'}].`,
          why: 'A value outside the current span cannot exist in a sorted array; an empty window means everything was eliminated.',
          whatNext: 'Return −1. Skewed distributions can make this phase much slower than binary search.',
        },
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
