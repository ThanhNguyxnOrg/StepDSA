import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

const MAX_LEN = 4; // bogosort must terminate deterministically in a visualizer
const MAX_ABS = 999;
const DEFAULT_ARRAY = [4, 1, 3, 2];

interface NormalisedInput {
  array: number[];
  notes: string[];
}

function normalise(input: number[] | undefined): NormalisedInput {
  const notes: string[] = [];

  if (!Array.isArray(input)) {
    notes.push('input was not an array, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }

  const usable = input.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  // An explicitly empty array is a valid run (nothing to sort), not an error.
  if (input.length > 0 && usable.length === 0) {
    notes.push('no usable numbers in the input, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }
  if (usable.length < input.length) {
    notes.push(`${input.length - usable.length} non-numeric value(s) dropped`);
  }

  const clamped = usable.map((value) => {
    const rounded = Math.max(-MAX_ABS, Math.min(MAX_ABS, Math.round(value)));
    if (rounded !== Math.round(value)) {
      notes.push(`value ${Math.round(value)} clamped to ${rounded} (±${MAX_ABS})`);
    }
    return rounded;
  });

  let array = clamped;
  if (array.length > MAX_LEN) {
    notes.push(`${array.length} values truncated to ${MAX_LEN} so the demo terminates (N! explodes fast)`);
    array = array.slice(0, MAX_LEN);
  }

  return { array, notes };
}

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
      'Shuffling uses zero information from the failed verification — every attempt is an independent uniform sample.',
    ],
    steps: [
      'Guard: an empty or one-element array is sorted without any attempt.',
      'Verify: scan adjacent pairs; the first out-of-order pair rejects the whole permutation.',
      'Shuffle uniformly at random — deliberately ignoring everything learned so far.',
      'Repeat until a permutation happens to be sorted (or the demo safety rail forces one).',
    ],
    watchOut: [
      'The demo caps input at 4 elements and forces a sorted permutation after 24 failed attempts — real bogosort has no such rail.',
      'The deterministic pseudo-random generator keeps the visualizer timeline reproducible.',
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
    {
      id: 'single-element',
      label: 'One Element',
      description: 'Sorted without a single attempt',
      data: [42],
    },
  ],
  defaultInput: [4, 1, 3, 2],
  codeSnippets: {
    pseudocode: `function isSorted(arr):
    for i from 0 to length(arr) - 2:
        if arr[i] > arr[i + 1]:
            return false
    return true
function bogosort(arr):
    attempts = 0
    while not isSorted(arr):
        random_shuffle(arr)
        attempts = attempts + 1
    return arr`,
    python: `def is_sorted(arr):
    for i in range(len(arr) - 1):
        if arr[i] > arr[i + 1]:
            return False
    return True
def bogosort(arr):
    attempts = 0
    while not is_sorted(arr):
        random_shuffle(arr)
        attempts += 1
    return arr`,
    typescript: `function isSorted(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      return false; } }
  return true; }
function bogosort(arr: number[]): number[] {
  let attempts = 0;
  while (!isSorted(arr)) {
    randomShuffle(arr);
    attempts++; }
  return arr; }`,
    cpp: `bool isSorted(const vector<int>& arr) {
    for (int i = 0; i < (int)arr.size() - 1; ++i) {
        if (arr[i] > arr[i + 1]) {
            return false; } }
    return true; }
vector<int> bogosort(vector<int>& arr) {
    int attempts = 0;
    while (!isSorted(arr)) {
        randomShuffle(arr);
        attempts++; }
    return arr; }`,
    java: `static boolean isSorted(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            return false; } }
    return true; }
static int[] bogosort(int[] arr) {
    int attempts = 0;
    while (!isSorted(arr)) {
        randomShuffle(arr);
        attempts++; }
    return arr; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const { array, notes } = normalise(input);
    const arr = [...array];
    const n = arr.length;

    const frames: ExecutionFrame<ArrayStageState>[] = [];
    let shuffleCheckpointAdded = false;
    let firstRejectionMilestoneUsed = false;

    let actionType: 'INIT' | 'VERIFY' | 'REJECTED' | 'SHUFFLED' | 'SORTED' | 'DONE' = 'INIT';

    const pushFrame = (opts: {
      codeLine: number;
      explanation: string;
      pedagogy?: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<ArrayStageState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<ArrayStageState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      statuses?: Record<number, ElementStatus>;
      pointers?: Record<string, number>;
    }) => {
      const statusFor = (idx: number): ElementStatus => opts.statuses?.[idx] ?? 'default';
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: actionType,
        explanation: opts.explanation,
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        invariantStatus: {
          label: `attempt ${opts.variables?.attempt ?? 0}: every adjacent pair must satisfy arr[i] <= arr[i+1]`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: [
          { name: 'bogosort(arr)', params: { length: n, attempts: opts.variables?.attempt ?? 0 }, line: opts.codeLine, isCurrent: true },
        ],
        state: {
          array: arr.map((v, idx) => ({ id: `el-${idx}`, value: v, status: statusFor(idx) })),
          pointers: opts.pointers ?? {},
        },
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    if (n > 0) {
      pushFrame({
        codeLine: 6,
        explanation:
          `Bogosort on [${arr.join(', ')}]: ${n}! = ${((): number => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f; })()} possible permutations — the strategy is to sample until one comes out sorted.` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { elements: n, attempt: 0, status: 'verifying' },
        soundCue: 'start',
        pedagogy: {
          what: `Bogosort's entire strategy: check whether the array happens to be sorted, otherwise shuffle randomly and retry.`,
          why: 'Instead of arranging elements, it samples permutations — the expected number of tries is N!/2, which explodes factorially.',
          whatNext: `Attempt 1 verification starts with the pair arr[0] vs arr[1].`,
        },
      });
    } else {
      pushFrame({
        codeLine: 6,
        explanation:
          'n = length(arr) = 0: an empty array is sorted, so zero attempts are needed.' +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { elements: 0, attempt: 0, status: 'already-sorted' },
        soundCue: 'start',
        pedagogy: {
          what: 'An empty array is sorted by definition.',
          why: 'isSorted is vacuously true when there are no adjacent pairs to violate.',
          whatNext: 'Return the empty array immediately.',
        },
      });
      actionType = 'DONE';
      pushFrame({
        codeLine: 11,
        explanation: 'Bogosort complete on an empty array: 0 attempts, the result is the empty array.',
        variables: { totalAttempts: 0, found: true, result: 0 },
        milestone: 'Nothing to Sort',
        soundCue: 'complete',
        pedagogy: {
          what: 'The while loop never runs because isSorted is vacuously true.',
          why: 'No permutation of an empty array exists beyond the empty one.',
          whatNext: 'Load a preset such as Small Array to watch attempts happen.',
        },
      });
      const totalEarly = frames.length;
      return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: totalEarly }));
    }

    let attempt = 0;
    const maxAttempts = 25;

    // Simple deterministic PRNG for a reproducible shuffle timeline
    let seed = 123456789;
    const pseudoRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    while (attempt < maxAttempts) {
      attempt++;

      // Verification pass
      let sortedSoFar = true;
      let failIndex = -1;

      for (let i = 0; i < arr.length - 1; i++) {
        const ok = arr[i] <= arr[i + 1];
        actionType = 'VERIFY';

        const verifyPedagogy: StepPedagogy = {
          what: `Attempt #${attempt} checks the pair arr[${i}] = ${arr[i]} and arr[${i + 1}] = ${arr[i + 1]}.`,
          why: 'One counterexample is enough: a sorted array allows no adjacent descent anywhere, so the scan can stop at the first violation.',
          whatNext: ok
            ? `The pair is in order — continue with arr[${i + 1}] vs arr[${i + 2}].`
            : `The pair violates order — reject this permutation and shuffle.`,
        };

        pushFrame({
          codeLine: 3,
          explanation: `Attempt #${attempt} verification: arr[${i}] (${arr[i]}) <= arr[${i + 1}] (${arr[i + 1]}) → ${ok ? 'VALID' : 'VIOLATION'}.`,
          variables: { attempt, checkIndex: i, leftVal: arr[i], rightVal: arr[i + 1], valid: String(ok) },
          conditionEval: {
            expr: `arr[${i}] <= arr[${i + 1}]`,
            condition: `${arr[i]} <= ${arr[i + 1]}`,
            result: ok,
          },
          pedagogy: verifyPedagogy,
          statuses: {
            [i]: ok ? 'active' : 'comparing',
            [i + 1]: ok ? 'active' : 'comparing',
          },
          pointers: { i, 'i+1': i + 1 },
        });

        if (!ok) {
          sortedSoFar = false;
          failIndex = i;
          actionType = 'REJECTED';

          const rejectMilestone = !firstRejectionMilestoneUsed ? 'First Rejection' : undefined;
          if (rejectMilestone) firstRejectionMilestoneUsed = true;

          pushFrame({
            codeLine: 4,
            explanation: `Attempt #${attempt} rejected: arr[${i}] (${arr[i]}) > arr[${i + 1}] (${arr[i + 1]}). This permutation is discarded wholesale.`,
            soundCue: 'fail',
            milestone: rejectMilestone,
            variables: { attempt, failIndex: i, rejectedPermutation: arr.join(', ') },
            conditionEval: { expr: 'isSorted(attempt)', condition: `rejected at ${i}`, result: false },
            pedagogy: {
              what: `The first out-of-order pair (${arr[i]}, ${arr[i + 1]}) rejects this permutation.`,
              why: 'One counterexample is enough: a sorted array allows no adjacent descent anywhere.',
              whatNext: `Shuffle the whole array and try a fresh permutation.`,
            },
            statuses: { [i]: 'comparing', [i + 1]: 'comparing' },
            pointers: { i, 'i+1': i + 1 },
          });
          break;
        }
      }

      if (sortedSoFar) {
        actionType = 'SORTED';
        pushFrame({
          codeLine: 11,
          explanation: `All pairwise checks passed! Array is sorted after ${attempt} permutation attempt(s): [${arr.join(', ')}].`,
          milestone: `Sorted in ${attempt} Attempt(s)`,
          soundCue: 'complete',
          variables: { totalAttempts: attempt, found: true, result: attempt },
          conditionEval: { expr: 'isSorted(arr)', condition: arr.join(', '), result: true },
          pedagogy: {
            what: `Attempt #${attempt} passed every adjacent check — the permutation finally came out sorted.`,
            why: 'This success was pure luck: the expected number of attempts grows factorially, so even 10 elements average millions of shuffles.',
            whatNext: 'Compare with insertion sort: same array, a handful of frames, and a guarantee.',
          },
          statuses: Object.fromEntries(arr.map((_, idx) => [idx, 'sorted' as ElementStatus])),
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

      actionType = 'SHUFFLED';
      const shuffleCheckpoint: PredictionCheckpoint | undefined = !shuffleCheckpointAdded
        ? {
            id: 'bogosort-shuffle-independence',
            question: 'The verification just failed at some index. Does the next random shuffle use that information?',
            options: ['No — each shuffle is an independent uniform permutation', 'Yes — it fixes the failed position first'],
            correctIndex: 0,
            explanation:
              'Bogosort ignores all progress: every attempt is an independent sample of the N! permutations, which is why its expected cost is factorial.',
            hint: 'Does the shuffle read any variable from the verification step?',
          }
        : undefined;

      pushFrame({
        codeLine: 9,
        explanation: forced
          ? `Safety rail: after ${maxAttempts - 1} failed attempts the visualizer forces the sorted permutation. Real bogosort would keep sampling — its expected work is N! · N.`
          : `Violation at index ${failIndex}. Shuffled uniformly at random into a brand-new permutation: [${arr.join(', ')}].`,
        milestone: forced ? 'Safety Rail Forced' : undefined,
        checkpoint: shuffleCheckpoint,
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
        statuses: Object.fromEntries(arr.map((_, idx) => [idx, 'swapping' as ElementStatus])),
      });
      if (shuffleCheckpoint) shuffleCheckpointAdded = true;
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
