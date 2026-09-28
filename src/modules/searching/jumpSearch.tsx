import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const jumpSearchModule: AlgorithmModule<{ array: number[]; target: number }, ArrayStageState> = {
  id: 'jump-search',
  title: 'Jump Search (Block Hopping O(√N))',
  category: 'searching',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(√N)',
    timeWorst: 'O(√N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Target is at the end of the last block or just greater than the last element',
  },
  theory: {
    overview:
      'Jump Search checks fewer elements than linear search by jumping ahead by fixed blocks of size √N, then performing a linear search within the identified block.',
    whyItWorks:
      'Because the array is sorted, if arr[step] < target, the target cannot exist in arr[0...step]. By skipping √N elements per hop, we only need at most √N hops and √N comparisons.',
    invariant:
      'Block Invariant: If target exists, it must reside in the range [prev ... min(step, N-1)].',
    pitfalls: [
      'Array must be sorted before search.',
      'Optimal block step size is strictly √N; choosing N/2 degrades to linear or poor branching.',
      'Must guard against indexing beyond array length (min(step, N - 1)).',
    ],
  },
  presets: [
    {
      id: 'target-found',
      label: 'Find 55 (Middle-Right)',
      description: 'Standard jump hops then linear scan',
      data: { array: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610], target: 55 },
    },
    {
      id: 'target-early',
      label: 'Find 2 (First Block)',
      description: 'Jump halts immediately at first block',
      data: { array: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610], target: 2 },
    },
    {
      id: 'target-absent',
      label: 'Target Absent (Find 50)',
      description: 'Linear scan exhausts block without finding target',
      data: { array: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610], target: 50 },
    },
  ],
  defaultInput: { array: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610], target: 55 },
  codeSnippets: {
    python: `import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.isqrt(n))
    prev = 0
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.isqrt(n))
        if prev >= n:
            return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
    if arr[prev] == target:
        return prev
    return -1`,
    typescript: `function jumpSearch(arr: number[], target: number): number {
  const n = arr.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }
  if (arr[prev] === target) return prev;
  return -1;
}`,
    cpp: `int jumpSearch(const vector<int>& arr, int target) {
    int n = arr.size();
    int step = sqrt(n);
    int prev = 0;
    while (arr[min(step, n) - 1] < target) {
        prev = step;
        step += sqrt(n);
        if (prev >= n) return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == min(step, n)) return -1;
    }
    if (arr[prev] == target) return prev;
    return -1;
}`,
    java: `public int jumpSearch(int[] arr, int target) {
    int n = arr.length;
    int step = (int) Math.floor(Math.sqrt(n));
    int prev = 0;
    while (arr[Math.min(step, n) - 1] < target) {
        prev = step;
        step += (int) Math.floor(Math.sqrt(n));
        if (prev >= n) return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == Math.min(step, n)) return -1;
    }
    if (arr[prev] == target) return prev;
    return -1;
}`,
    pseudocode: `function jumpSearch(arr, target):
    n <- length(arr)
    step <- floor(sqrt(n))
    prev <- 0
    while arr[min(step, n) - 1] < target:
        prev <- step
        step <- step + floor(sqrt(n))
        if prev >= n: return -1
    while arr[prev] < target:
        prev <- prev + 1
        if prev == min(step, n): return -1
    if arr[prev] == target: return prev
    return -1`,
  },
  generateTimeline: (input) => {
    const arr = [...input.array].sort((a, b) => a - b);
    const target = input.target;
    const n = arr.length;
    const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));
    let step = blockSize;
    let prev = 0;

    const frames: ExecutionFrame<ArrayStageState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Initialized Jump Search on array of size ${n}. Optimal jump block size √${n} ≈ ${blockSize}. Target is ${target}.`,
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: 'default' })),
        pointers: { prev: 0, step: Math.min(step, n) - 1 },
        target,
      },
    });

    // Block hopping phase
    while (arr[Math.min(step, n) - 1] < target) {
      const checkIdx = Math.min(step, n) - 1;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Inspecting block boundary arr[${checkIdx}] = ${arr[checkIdx]}. Since ${arr[checkIdx]} < ${target}, jump forward by ${blockSize} indices.`,
        state: {
          array: arr.map((v, i) => ({
            id: i,
            value: v,
            status: i < checkIdx ? 'discarded' : i === checkIdx ? 'comparing' : 'default',
          })),
          pointers: { prev, checkIdx },
          target,
        },
      });

      prev = step;
      step += blockSize;

      if (prev >= n) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `Jumped beyond array bounds (prev = ${prev} >= ${n}). Target ${target} is not in array.`,
          state: {
            array: arr.map((v, i) => ({ id: i, value: v, status: 'discarded' })),
            pointers: {},
            target,
          },
        });
        const total = frames.length;
        return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
      }
    }

    const boundaryIdx = Math.min(step, n) - 1;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      explanation: `Found target block! arr[${boundaryIdx}] = ${arr[boundaryIdx]} >= ${target}. Commencing linear scan from index ${prev} to ${boundaryIdx}.`,
      isMilestone: true,
      milestoneTitle: 'Target Block Located',
      state: {
        array: arr.map((v, i) => ({
          id: i,
          value: v,
          status: i >= prev && i <= boundaryIdx ? 'active' : 'discarded',
        })),
        pointers: { prev, boundaryIdx },
        target,
      },
    });

    // Linear scan within block
    while (arr[prev] < target) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 11,
        explanation: `Linear scan: arr[${prev}] = ${arr[prev]} < ${target}. Incrementing prev to ${prev + 1}.`,
        state: {
          array: arr.map((v, i) => ({
            id: i,
            value: v,
            status: i === prev ? 'comparing' : i > prev && i <= boundaryIdx ? 'active' : 'discarded',
          })),
          pointers: { prev },
          target,
        },
      });
      prev++;
      if (prev === Math.min(step, n)) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          explanation: `Reached end of block without finding ${target}. Target is absent. Returning -1.`,
          state: {
            array: arr.map((v, i) => ({ id: i, value: v, status: 'discarded' })),
            pointers: { prev },
            target,
          },
        });
        const total = frames.length;
        return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
      }
    }

    if (arr[prev] === target) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 14,
        explanation: `Target ${target} found at index ${prev}! Search completed successfully.`,
        isMilestone: true,
        milestoneTitle: 'Target Found',
        state: {
          array: arr.map((v, i) => ({
            id: i,
            value: v,
            status: i === prev ? 'sorted' : 'default',
          })),
          pointers: { found: prev },
          target,
        },
      });
    } else {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 16,
        explanation: `arr[${prev}] = ${arr[prev]} > ${target}. Target is not in the array. Returning -1.`,
        state: {
          array: arr.map((v, i) => ({ id: i, value: v, status: 'discarded' })),
          pointers: { prev },
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
