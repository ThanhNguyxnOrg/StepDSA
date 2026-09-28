import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const shellsortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'shellsort',
  title: 'Shellsort (Diminishing Increment Gap Sort)',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N^(4/3))',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Adversarial inputs with Shell original powers-of-two gap sequence',
  },
  theory: {
    overview:
      'Shellsort is an optimization over Insertion Sort that compares and swaps elements separated by a diminishing gap sequence. By moving elements across large distances early, it eliminates long-distance inversions in few operations.',
    whyItWorks:
      'Insertion sort performs poorly when small elements are far to the right, requiring O(N) shifts each. By first sorting sub-sequences separated by gap h, the array becomes "h-sorted". Subsequent passes with smaller gaps preserve this property while requiring very few shifts. The final pass (gap=1) is standard insertion sort running on nearly sorted data (O(N)).',
    invariant:
      'After completing a pass with gap h, the array is h-sorted: arr[i] <= arr[i + h] for all valid i.',
    pitfalls: [
      'Choosing a poor gap sequence can lead to O(N²) worst-case runtime (e.g. powers of 2).',
      'Confusing the inner gap-insertion loop index boundaries.',
    ],
  },
  presets: [
    {
      id: 'random',
      label: 'Random Array',
      description: 'Shuffled array of 10 elements',
      data: [62, 83, 18, 53, 7, 17, 95, 22, 47, 34],
    },
    {
      id: 'reversed',
      label: 'Reversed Array',
      description: 'Worst-case inversion profile',
      data: [90, 80, 70, 60, 50, 40, 30, 20, 10],
    },
    {
      id: 'nearly-sorted',
      label: 'Nearly Sorted',
      description: 'Quickly verified with large gap',
      data: [10, 15, 25, 20, 35, 30, 45, 40, 50],
    },
  ],
  defaultInput: [62, 83, 18, 53, 7, 17, 95, 22, 47, 34],
  codeSnippets: {
    python: `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr`,
    typescript: `function shellSort(arr: number[]): number[] {
  const n = arr.length;
  let gap = Math.floor(n / 2);
  while (gap > 0) {
    for (let i = gap; i < n; ++i) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
    gap = Math.floor(gap / 2);
  }
  return arr;
}`,
    cpp: `void shellSort(vector<int>& arr) {
    int n = arr.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; ++i) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
    java: `public void shellSort(int[] arr) {
    int n = arr.length;
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; ++i) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
    pseudocode: `function shellSort(arr):
    n <- length(arr)
    gap <- floor(n / 2)
    while gap > 0:
        for i from gap to n - 1:
            temp <- arr[i]
            j <- i
            while j >= gap and arr[j - gap] > temp:
                arr[j] <- arr[j - gap]
                j <- j - gap
            arr[j] <- temp
        gap <- floor(gap / 2)`,
  },
  generateTimeline: (input: number[]) => {
    const arr = [...input];
    const n = arr.length;
    let gap = Math.floor(n / 2);
    const frames: ExecutionFrame<ArrayStageState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Starting Shellsort on array of length ${n}. Initial gap = floor(${n} / 2) = ${gap}.`,
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: { gap },
      },
    });

    while (gap > 0) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Starting pass with gap = ${gap}. Elements separated by ${gap} positions will be compared and sorted.`,
        isMilestone: true,
        milestoneTitle: `Starting Gap ${gap} Pass`,
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'active' })),
          pointers: { gap },
        },
      });

      for (let i = gap; i < n; ++i) {
        const temp = arr[i];
        let j = i;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Inspecting element arr[${i}] = ${temp} with respect to arr[${i - gap}] = ${arr[i - gap]}.`,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === i || idx === i - gap ? 'comparing' : 'default',
            })),
            pointers: { i, 'j-gap': i - gap, gap },
          },
        });

        while (j >= gap && arr[j - gap] > temp) {
          arr[j] = arr[j - gap];
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            explanation: `arr[${j - gap}] (${arr[j - gap]}) > ${temp}: shifting element rightward by ${gap} to index ${j}.`,
            state: {
              array: arr.map((v, idx) => ({
                id: idx,
                value: v,
                status: idx === j || idx === j - gap ? 'swapping' : 'default',
              })),
              pointers: { j, 'j-gap': j - gap, gap },
            },
          });
          j -= gap;
        }

        arr[j] = temp;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          explanation: `Placed temp (${temp}) at resolved index ${j}.`,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === j ? 'pivot' : 'default',
            })),
            pointers: { j, gap },
          },
        });
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 11,
        explanation: `Completed pass for gap = ${gap}. Array is now ${gap}-sorted. Halving gap to ${Math.floor(
          gap / 2
        )}.`,
        isMilestone: true,
        milestoneTitle: `Completed Gap ${gap}`,
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
          pointers: { prevGap: gap },
        },
      });

      gap = Math.floor(gap / 2);
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: 'Gap reduced to 0. All passes completed. Array is fully sorted!',
      isMilestone: true,
      milestoneTitle: 'Shellsort Completed',
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
        pointers: {},
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
