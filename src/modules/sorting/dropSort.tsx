import { AlgorithmModule, ElementStatus, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const dropSortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'drop-sort',
  title: 'Drop Sort (Lossy Non-Decreasing Extraction O(N))',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1) in-place filter',
    worstCaseCondition: 'Strictly linear scan across all array elements',
  },
  theory: {
    overview:
      'Drop Sort (humorously known as Stalin Sort) is an O(N) lossy sorting algorithm. It iterates through the array and immediately drops (discards) any element that is smaller than the previous retained element, ensuring the surviving sequence is strictly non-decreasing.',
    whyItWorks:
      'By maintaining a running maximum of retained elements, every inspected element either exceeds or equals this maximum (kept) or falls below it (eliminated). The surviving array is guaranteed sorted in a single linear pass.',
    invariant:
      'Monotonic Survival Invariant: All retained elements strictly satisfy arr[k] <= arr[k+1] at all times.',
    pitfalls: [
      'Lossy algorithm: destroys elements that violate monotonic order.',
      'A strictly descending input [5, 4, 3, 2, 1] reduces to a single element [5].',
    ],
  },
  presets: [
    {
      id: 'mixed-drop',
      label: 'Mixed Array: [3, 1, 4, 2, 5, 3, 6]',
      description: 'Drops 1, 2, 3 to produce [3, 4, 5, 6]',
      data: [3, 1, 4, 2, 5, 3, 6],
    },
    {
      id: 'already-sorted',
      label: 'Already Sorted: [1, 2, 3, 4, 5]',
      description: 'Zero elements dropped; 100% survival',
      data: [1, 2, 3, 4, 5],
    },
    {
      id: 'reverse-drop',
      label: 'Worst Case Loss: [8, 7, 6, 5, 4, 3]',
      description: 'All elements except the first are dropped',
      data: [8, 7, 6, 5, 4, 3],
    },
  ],
  defaultInput: [3, 1, 4, 2, 5, 3, 6],
  codeSnippets: {
    cpp: `vector<int> dropSort(const vector<int>& arr) {
    if (arr.empty()) return {};
    vector<int> result = {arr[0]};
    for (size_t i = 1; i < arr.size(); i++) {
        if (arr[i] >= result.back()) {
            result.push_back(arr[i]);
        }
    }
    return result;
}`,
    python: `def drop_sort(arr):
    if not arr: return []
    result = [arr[0]]
    for x in arr[1:]:
        if x >= result[-1]:
            result.append(x)
    return result`,
    typescript: `function dropSort(arr: number[]): number[] {
    if (arr.length === 0) return [];
    const result: number[] = [arr[0]];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] >= result[result.length - 1]) {
            result.push(arr[i]);
        }
    }
    return result;
}`,
    java: `public List<Integer> dropSort(int[] arr) {
    if (arr.length == 0) return Collections.emptyList();
    List<Integer> result = new ArrayList<>();
    result.add(arr[0]);
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] >= result.get(result.size() - 1)) {
            result.add(arr[i]);
        }
    }
    return result;
}`,
    pseudocode: `function dropSort(arr):
    result = [arr[0]]
    for i from 1 to length(arr) - 1:
        if arr[i] >= last(result):
            append arr[i] to result
        else:
            discard arr[i]
    return result`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const arr = input?.length ? [...input] : [3, 1, 4, 2, 5, 3, 6];
    const n = arr.length;

    const elements = arr.map((val, idx) => ({
      id: idx,
      value: val,
      status: 'default' as ElementStatus,
    }));

    const frames: ExecutionFrame<ArrayStageState>[] = [];

    // Frame 0: Initialization
    elements[0].status = 'sorted';
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Drop Sort. First element (${arr[0]}) is retained as baseline maximum.`,
      variables: { index: 0, retainedMax: arr[0], survivingCount: 1 },
      callStack: [{ name: 'dropSort()', params: { n }, line: 2, isCurrent: true }],
      state: {
        array: elements.map((e) => ({ ...e })),
        pointers: { current: 0 },
      },
    });

    let currentMax = arr[0];
    let surviving = 1;

    for (let i = 1; i < n; i++) {
      const val = arr[i];
      const keeps = val >= currentMax;

      elements[i].status = 'comparing';
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Inspect element arr[${i}] = ${val}. Compare with retained maximum (${currentMax}).`,
        variables: { index: i, value: val, currentMax, satisfiesMonotonic: keeps ? 'YES' : 'NO' },
        callStack: [{ name: `inspect(${i})`, params: { val, currentMax }, line: 4, isCurrent: true }],
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { current: i },
        },
      });

      if (keeps) {
        currentMax = val;
        surviving++;
        elements[i].status = 'sorted';
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `arr[${i}] = ${val} >= ${currentMax} -> Retained! New maximum is ${val}. Total kept: ${surviving}.`,
          variables: { index: i, value: val, currentMax, totalSurviving: surviving },
          callStack: [{ name: `retain(${i})`, params: { val }, line: 5, isCurrent: true }],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: { current: i },
          },
        });
      } else {
        elements[i].status = 'discarded';
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `arr[${i}] = ${val} < ${currentMax} -> DROPPED (discarded)! Monotonic order preserved.`,
          variables: { index: i, droppedValue: val, currentMax },
          callStack: [{ name: `drop(${i})`, params: { val }, line: 7, isCurrent: true }],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: { current: i },
          },
        });
      }
    }

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 9,
      explanation: `Drop Sort complete! ${surviving} of ${n} elements survived in sorted order (${n - surviving} discarded).`,
      variables: {
        originalCount: n,
        survivingCount: surviving,
        droppedCount: n - surviving,
      },
      callStack: [{ name: 'complete()', params: { surviving }, line: 9, isCurrent: true }],
      state: {
        array: elements.map((e) => ({ ...e })),
        pointers: {},
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<ArrayStageState>, projection: '2d' | 'isometric') => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
