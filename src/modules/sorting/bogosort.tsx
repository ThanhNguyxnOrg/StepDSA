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
    let checkpointAdded = false;

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
      pedagogy: {
        what: `Bogosort's entire strategy: check whether the array happens to be sorted, otherwise shuffle randomly and retry.`,
        why: 'Instead of arranging elements, it samples permutations — the expected number of tries is N!/2, which explodes factorially.',
        whatNext: `Attempt 1 verification starts with the pair arr[0] vs arr[1].`,
      },
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
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 4,
            explanation: `Attempt #${attempt}: violation arr[${i}] (${arr[i]}) > arr[${i + 1}] (${arr[i + 1]}). This permutation is rejected.`,
            soundCue: { type: 'fail' },
            variables: { attempt, failIndex: i, rejectedPermutation: arr.join(', ') },
            conditionEval: { expr: `isSorted(attempt #${attempt})`, result: false },
            callStack: [
              { name: `isSorted(attempt=${attempt})`, params: { failAt: i }, line: 4, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            pedagogy: {
              what: `The first out-of-order pair (${arr[i]}, ${arr[i + 1]}) rejects this permutation.`,
              why: 'One counterexample is enough: a sorted array allows no adjacent descent anywhere.',
              whatNext: `Shuffle the whole array and try a fresh permutation.`,
            },
            state: {
              array: arr.map((v, idx) => ({
                id: `el-${idx}`,
                value: v,
                status: idx === i || idx === i + 1 ? 'comparing' : 'default',
              })),
              pointers: { i, 'i+1': i + 1 },
            },
          });
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
          pedagogy: {
            what: `Attempt #${attempt} passed every adjacent check — the permutation finally came out sorted.`,
            why: 'This success was pure luck: the expected number of attempts grows factorially, so even 10 elements average millions of shuffles.',
            whatNext: 'Compare with insertion sort: same array, a handful of frames, and a guarantee.',
          },
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
      let forced = false;
      if (attempt === maxAttempts - 1) {
        arr.sort((a, b) => a - b);
        forced = true;
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
        milestoneTitle: forced ? `Forced Sorted Permutation #${attempt}` : `Random Shuffle #${attempt}`,
        explanation: forced
          ? `Safety rail: after ${maxAttempts - 1} failed attempts the visualizer stops shuffling and forces the sorted permutation. Real bogosort would keep sampling — its expected work is N! · N.`
          : `Violation detected at index ${failIndex}. Shuffled array uniformly at random to new permutation: [${arr.join(
              ', '
            )}].`,
        variables: {
          attempt,
          newPermutation: arr.join(', '),
          status: forced ? 'forced-sorted (demo safety rail)' : 'shuffled',
        },
        pedagogy: {
          what: forced
            ? 'The demo terminates by force: no real information was gained about the algorithm from this permutation.'
            : `A brand-new uniformly random permutation: [${arr.join(', ')}].`,
          why: 'Shuffling does not use any knowledge from the failed verification — that ignorance is exactly why bogosort is a joke, not a strategy.',
          whatNext: 'Verify the new permutation from index 0 again.',
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'bogosort-shuffle-independence',
              question: 'The verification just failed at some index. Does the next random shuffle use that information?',
              options: ['No — each shuffle is an independent uniform permutation', 'Yes — it fixes the failed position first'],
              correctIndex: 0,
              explanation: 'Bogosort ignores all progress: every attempt is an independent sample of the N! permutations, which is why its expected cost is factorial.',
            }
          : undefined,
        callStack: [
          { name: `randomShuffle(attempt=${attempt})`, params: { attempt }, line: 10, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          array: arr.map((v, idx) => ({ id: `el-${idx}`, value: v, status: 'swapping' })),
          pointers: {},
        },
      });
      checkpointAdded = true;
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
