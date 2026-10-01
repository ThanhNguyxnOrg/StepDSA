import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export interface LinearSearchInput {
  array: number[];
  target: number;
}

export const linearSearchModule: AlgorithmModule<LinearSearchInput, ArrayStageState> = {
  id: 'linear-search',
  title: 'Linear Search (Sequential Scan)',
  category: 'searching',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Target is at the very last index or not present in array',
  },
  theory: {
    overview:
      'Linear Search sequentially checks each element of the list until a match is found or the whole list has been searched. It requires no sorting or structural preconditions.',
    whyItWorks:
      'By checking every candidate position from 0 to N-1, any existing occurrence of target is guaranteed to be detected.',
    invariant:
      'Target element is not present in prefix arr[0 ... i-1].',
    pitfalls: [
      'Slow for large datasets (O(N) time).',
      'Does not take advantage of sorted ordering when available (Binary Search is exponentially faster).',
    ],
  },
  presets: [
    { id: 'found-mid', label: 'Target in Middle', description: 'Average case match', data: { array: [14, 33, 27, 10, 35, 19, 42, 44], target: 35 } },
    { id: 'found-first', label: 'Best Case (Index 0)', description: 'Target found on first probe O(1)', data: { array: [99, 12, 45, 67, 34, 89], target: 99 } },
    { id: 'not-found', label: 'Worst Case (Not Found)', description: 'Target absent, full O(N) scan', data: { array: [5, 12, 18, 24, 31, 40], target: 100 } },
  ],
  defaultInput: {
    array: [14, 33, 27, 10, 35, 19, 42, 44],
    target: 35,
  },
  codeSnippets: {
    python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i # Found at index i
    return -1 # Not found`,
    typescript: `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found at index i
    }
  }
  return -1; // Not found
}`,
    cpp: `int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i; // Found at index i
        }
    }
    return -1; // Not found
}`,
    java: `int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i; // Found at index i
        }
    }
    return -1; // Not found
}`,
    pseudocode: `function linearSearch(arr, target):
    for i = 0 to length(arr) - 1:
        if arr[i] == target:
            return i
    return -1`,
  },

  generateTimeline: (input: LinearSearchInput): ExecutionFrame<ArrayStageState>[] => {
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const arr = [...input.array];
    const target = input.target;
    const n = arr.length;

    // Step 0: Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Starting Linear Search for target = ${target} across ${n} elements.`,
      callStack: [
        { name: 'linearSearch(arr, target)', params: { target, n }, line: 1, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { target, n, i: 0 },
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: {},
        target,
      },
    });

    let foundIndex = -1;

    for (let i = 0; i < n; i++) {
      const isMatch = arr[i] === target;

      // Frame: Inspect arr[i]
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        explanation: `Comparing arr[${i}] (${arr[i]}) with target (${target}).`,
        callStack: [
          { name: 'linearSearch(arr, target)', params: { i, 'arr[i]': arr[i], target }, line: 3, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { i, 'arr[i]': arr[i], target },
        conditionEval: {
          expr: `arr[${i}] (${arr[i]}) == target (${target})`,
          result: isMatch,
        },
        soundCue: { type: 'compare' },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === i ? 'comparing' : idx < i ? 'discarded' : 'default',
          })),
          pointers: { i },
          target,
        },
        invariantStatus: {
          isValid: true,
          label: `arr[0..${i - 1}] != ${target}`,
        },
      });

      if (isMatch) {
        foundIndex = i;

        // Frame: Match found!
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `MATCH FOUND! arr[${i}] == ${target}. Returning index ${i}.`,
          callStack: [
            { name: 'linearSearch(arr, target)', params: { foundAt: i }, line: 4, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { result: i, target },
          isMilestone: true,
          milestoneTitle: `Found at index ${i}`,
          soundCue: { type: 'sorted' },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === i ? 'sorted' : idx < i ? 'discarded' : 'default',
            })),
            pointers: { found: i },
            target,
          },
          invariantStatus: {
            isValid: true,
            label: `Target found at [${i}]`,
          },
        });
        break;
      } else {
        // Frame: Mismatch, discard index i
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 3,
          explanation: `Mismatch: arr[${i}] (${arr[i]}) != target (${target}). Discarding index ${i}. Advancing to index ${i + 1}.`,
          soundCue: { type: 'step' },
          callStack: [
            { name: 'linearSearch(arr, target)', params: { i, mismatch: true }, line: 3, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { i, discardedValue: arr[i], nextIndex: i + 1, target },
          conditionEval: { expr: `arr[${i}] != target (${target})`, result: true },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx <= i ? 'discarded' : 'default',
            })),
            pointers: { i },
            target,
          },
          invariantStatus: {
            isValid: true,
            label: `Verified prefix arr[0..${i}] != ${target}`,
          },
        });
      }
    }

    if (foundIndex === -1) {
      // Frame: Not found
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Target ${target} was not found in array. Returning -1.`,
        callStack: [
          { name: 'linearSearch(arr, target)', params: { result: -1 }, line: 5, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { result: -1, status: 'NOT_FOUND' },
        isMilestone: true,
        milestoneTitle: 'Search Exhausted (-1)',
        soundCue: { type: 'discard' },
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'discarded' })),
          pointers: {},
          target,
        },
        invariantStatus: {
          isValid: false,
          label: `Target ${target} not found`,
        },
      });
    }

    const totalSteps = frames.length;
    return frames.map((f) => ({ ...f, totalSteps }));
  },

  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
