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
      id: 'uniform-found',
      label: 'Uniform Array (Find 70)',
      description: 'Evenly spaced integers [10, 20, ..., 100]',
      data: { array: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], target: 70 },
    },
    {
      id: 'uniform-early',
      label: 'Probe Hit in 1 Step (Find 30)',
      description: 'Proportional calculation lands directly on index',
      data: { array: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], target: 30 },
    },
    {
      id: 'target-absent',
      label: 'Target Absent (Find 45)',
      description: 'Probing narrows interval then bounds violation',
      data: { array: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], target: 45 },
    },
  ],
  defaultInput: { array: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], target: 70 },
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

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized Interpolation Search. Search range [low=0, high=${high}], array spans from ${arr[low]} to ${arr[high]}. Target: ${target}.`,
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: 'default' })),
        pointers: { low, high },
        target,
      },
    });

    while (low <= high && target >= arr[low] && target <= arr[high]) {
      if (low === high) {
        if (arr[low] === target) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 5,
            explanation: `Search space narrowed to single index ${low}. Value matches target ${target}!`,
            isMilestone: true,
            milestoneTitle: 'Target Found',
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
          const total = frames.length;
          return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
        }
        break;
      }

      const fraction = (target - arr[low]) / (arr[high] - arr[low]);
      const pos = low + Math.floor(fraction * (high - low));

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `Calculated probe pos = ${low} + Math.floor(${fraction.toFixed(2)} * ${high - low}) = index ${pos}. arr[${pos}] = ${arr[pos]}.`,
        isMilestone: true,
        milestoneTitle: `Probe Index ${pos}`,
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

      if (arr[pos] === target) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `arr[${pos}] == target (${target})! Value found in ${frames.length} probe steps.`,
          isMilestone: true,
          milestoneTitle: 'Target Found',
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
        const total = frames.length;
        return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
      }

      if (arr[pos] < target) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `arr[${pos}] (${arr[pos]}) < ${target}. Discarding left range [${low}..${pos}]. Setting low = ${pos + 1}.`,
          state: {
            array: arr.map((v, i) => ({
              id: i,
              value: v,
              status: i > pos && i <= high ? 'active' : 'discarded',
            })),
            pointers: { low: pos + 1, high },
            target,
          },
        });
        low = pos + 1;
      } else {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          explanation: `arr[${pos}] (${arr[pos]}) > ${target}. Discarding right range [${pos}..${high}]. Setting high = ${pos - 1}.`,
          state: {
            array: arr.map((v, i) => ({
              id: i,
              value: v,
              status: i >= low && i < pos ? 'active' : 'discarded',
            })),
            pointers: { low, high: pos - 1 },
            target,
          },
        });
        high = pos - 1;
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      explanation: `Target ${target} is outside remaining bounds or bounds crossed. Target not present. Returning -1.`,
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: 'discarded' })),
        pointers: {},
        target,
      },
    });

    const total = frames.length;
    return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
