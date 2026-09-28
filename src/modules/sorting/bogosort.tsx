import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const bogosortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'bogosort',
  title: 'Bogosort (Permutation Random Shuffle O(N * N!))',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N) already sorted',
    timeAverage: 'O(N * N!)',
    timeWorst: 'O(∞) unbounded',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Array is never randomly permuted into sorted order',
  },
  theory: {
    overview:
      'Bogosort (also known as Permutation Sort, Stupid Sort, or Monkey Sort) is a highly inefficient sorting algorithm based on the generate-and-test paradigm. It successively generates permutations of its input until it stumbles upon one that is sorted.',
    whyItWorks:
      'Because an array of N unique elements has exactly N! permutations and at least one is monotonically non-decreasing, repeatedly shuffling uniformly at random has probability 1 / N! of producing the sorted array on each iteration.',
    invariant:
      'Sorted Verification Invariant: Array is sorted iff arr[i] <= arr[i+1] for all 0 <= i < N - 1.',
    pitfalls: [
      'Factorial time complexity explodes rapidly: for N = 10, N! = 3,628,800 shuffles; for N = 15, over 1.3 trillion shuffles.',
      'Unbounded worst-case execution time (may never terminate).',
    ],
  },
  presets: [
    {
      id: 'small-shuffle',
      label: 'Small Array (4 elements: [4, 1, 3, 2])',
      description: '4! = 24 total permutations, solves in reasonable steps',
      data: [4, 1, 3, 2],
    },
    {
      id: 'already-sorted',
      label: 'Best Case (Already Sorted: [1, 2, 3, 4])',
      description: 'Single O(N) verification pass without shuffling',
      data: [1, 2, 3, 4],
    },
    {
      id: 'three-elements',
      label: 'Tiny Array (3 elements: [3, 2, 1])',
      description: '3! = 6 total permutations',
      data: [3, 2, 1],
    },
  ],
  defaultInput: [4, 1, 3, 2],
  codeSnippets: {
    python: `import random

def is_sorted(arr):
    for i in range(len(arr) - 1):
        if arr[i] > arr[i + 1]:
            return False
    return True

def bogosort(arr):
    attempts = 0
    while not is_sorted(arr):
        random.shuffle(arr)
        attempts += 1
    return arr`,
    typescript: `function isSorted(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}

function bogosort(arr: number[]): number[] {
  while (!isSorted(arr)) {
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  return arr;
}`,
    cpp: `bool isSorted(const vector<int>& arr) {
    for (int i = 0; i < (int)arr.size() - 1; ++i) {
        if (arr[i] > arr[i + 1]) return false;
    }
    return true;
}

void bogosort(vector<int>& arr) {
    random_device rd;
    mt19937 g(rd());
    while (!isSorted(arr)) {
        shuffle(arr.begin(), arr.end(), g);
    }
}`,
    java: `public static boolean isSorted(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) return false;
    }
    return true;
}

public static void bogosort(int[] arr) {
    Random rand = new Random();
    while (!isSorted(arr)) {
        for (int i = arr.length - 1; i > 0; i--) {
            int j = rand.nextInt(i + 1);
            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
        }
    }
}`,
    pseudocode: `function bogosort(arr):
    while not isSorted(arr):
        random_shuffle(arr)
    return arr`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    // Cap to 4 elements so bogosort terminates deterministically in visualizer
    const raw = (input && input.length > 0 ? input : [4, 1, 3, 2]).slice(0, 4);
    const arr = [...raw];

    const frames: ExecutionFrame<ArrayStageState>[] = [];

    // Simple deterministic PRNG for reproducible shuffle timeline
    let seed = 123456789;
    const pseudoRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 8,
      explanation: `Initialize Bogosort for array [${arr.join(', ')}]. Checking if array is already sorted.`,
      variables: { elements: arr.length, attempt: 0, status: 'verifying' },
      callStack: [
        { name: 'bogosort(arr)', params: { length: arr.length }, line: 8, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        array: arr.map((v, i) => ({ id: `el-${i}`, value: v, status: 'default' })),
        pointers: {},
      },
    });

    let attempt = 0;
    const maxAttempts = 25;

    while (attempt < maxAttempts) {
      attempt++;

      // Verification pass
      let sortedSoFar = true;
      let failIndex = -1;

      for (let i = 0; i < arr.length - 1; i++) {
        const ok = arr[i] <= arr[i + 1];

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `Attempt #${attempt} Verification: Checking arr[${i}] (${arr[i]}) <= arr[${i + 1}] (${arr[i + 1]}). Result: ${
            ok ? 'VALID' : 'VIOLATION'
          }.`,
          variables: { attempt, checkIndex: i, leftVal: arr[i], rightVal: arr[i + 1], valid: String(ok) },
          conditionEval: {
            expr: `arr[${i}] (${arr[i]}) <= arr[${i + 1}] (${arr[i + 1]})`,
            result: ok,
          },
          callStack: [
            { name: `isSorted(attempt=${attempt})`, params: { check: i, ok: String(ok) }, line: 4, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            array: arr.map((v, idx) => ({
              id: `el-${idx}`,
              value: v,
              status: idx === i || idx === i + 1 ? (ok ? 'active' : 'comparing') : 'default',
            })),
            pointers: { i, 'i+1': i + 1 },
          },
        });

        if (!ok) {
          sortedSoFar = false;
          failIndex = i;
          break;
        }
      }

      if (sortedSoFar) {
        // Successfully sorted!
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          isMilestone: true,
          milestoneTitle: `Sorted in ${attempt} Attempt(s)!`,
          explanation: `All pairwise comparisons verified! Array is sorted: [${arr.join(', ')}] after ${attempt} permutation attempt(s).`,
          variables: { totalAttempts: attempt, isSorted: 'true' },
          callStack: [
            { name: 'complete()', params: { attempts: attempt }, line: 12, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            array: arr.map((v, idx) => ({ id: `el-${idx}`, value: v, status: 'sorted' })),
            pointers: {},
          },
        });
        break;
      }

      // If not sorted, perform shuffle
      // If we are near maxAttempts, force the sorted permutation to guarantee termination
      if (attempt === maxAttempts - 1) {
        arr.sort((a, b) => a - b);
      } else {
        // Fisher-Yates random shuffle
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(pseudoRandom() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 10,
        isMilestone: true,
        milestoneTitle: `Random Shuffle #${attempt}`,
        explanation: `Violation detected at index ${failIndex}. Shuffled array uniformly at random to new permutation: [${arr.join(
          ', '
        )}].`,
        variables: { attempt, newPermutation: arr.join(', '), status: 'shuffled' },
        callStack: [
          { name: `randomShuffle(attempt=${attempt})`, params: { attempt }, line: 10, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          array: arr.map((v, idx) => ({ id: `el-${idx}`, value: v, status: 'swapping' })),
          pointers: {},
        },
      });
    }

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
