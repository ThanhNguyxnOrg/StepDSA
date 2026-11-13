import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const exponentialSearchModule: AlgorithmModule<
  { array: number[]; target: number },
  ArrayStageState
> = {
  id: 'exponential-search',
  title: 'Exponential Search (Doubling Range O(log i))',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log i)',
    timeWorst: 'O(log i)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Target is located at index i with i near end of array',
  },
  theory: {
    overview:
      'Exponential Search (also known as Galloping Search or Doubling Search) finds the range where the target resides by repeatedly doubling an index boundary (1, 2, 4, 8...), then executes Binary Search within that bounded window.',
    whyItWorks:
      'Doubling takes O(log i) steps to bound the target index i. Binary search within [i/2, i] takes O(log(i/2)) = O(log i) steps, yielding an overall O(log i) runtime. This is exceptionally fast when the target is located near the beginning of large or infinite streams.',
    invariant:
      'Bounding Invariant: If target > arr[i/2], target must reside in the half-open window [i/2 ... min(i, n-1)].',
    pitfalls: [
      'Must check index 0 first before beginning the doubling loop starting at 1.',
      'Must clamp the upper bound with min(i, n - 1) to avoid index out-of-bounds.',
    ],
  },
  presets: [
    {
      id: 'target-early',
      label: 'Target Near Front (Find 17)',
      description: 'Bounded quickly at small index (i = 4)',
      data: { array: [2, 5, 8, 12, 17, 23, 38, 45, 56, 72, 85, 91, 104, 118, 130], target: 17 },
    },
    {
      id: 'target-deep',
      label: 'Target Near End (Find 104)',
      description: 'Multiple doubling iterations up to i = 16',
      data: { array: [2, 5, 8, 12, 17, 23, 38, 45, 56, 72, 85, 91, 104, 118, 130], target: 104 },
    },
    {
      id: 'target-index-zero',
      label: 'Target at Index 0 (Find 2)',
      description: 'Handled in O(1) before doubling loop',
      data: { array: [2, 5, 8, 12, 17, 23, 38, 45, 56, 72, 85, 91, 104, 118, 130], target: 2 },
    },
  ],
  defaultInput: { array: [2, 5, 8, 12, 17, 23, 38, 45, 56, 72, 85, 91, 104, 118, 130], target: 17 },
  codeSnippets: {
    python: `def exponential_search(arr, target):
    n = len(arr)
    if arr[0] == target:
        return 0
    i = 1
    while i < n and arr[i] <= target:
        i = i * 2
    # Binary search within [i // 2, min(i, n - 1)]
    low, high = i // 2, min(i, n - 1)
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: low = mid + 1
        else: high = mid - 1
    return -1`,
    typescript: `function exponentialSearch(arr: number[], target: number): number {
  const n = arr.length;
  if (arr[0] === target) return 0;
  let i = 1;
  while (i < n && arr[i] <= target) {
    i *= 2;
  }
  let low = Math.floor(i / 2);
  let high = Math.min(i, n - 1);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    cpp: `int exponentialSearch(const vector<int>& arr, int target) {
    int n = arr.size();
    if (arr[0] == target) return 0;
    int i = 1;
    while (i < n && arr[i] <= target) i *= 2;
    int low = i / 2, high = min(i, n - 1);
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    java: `public int exponentialSearch(int[] arr, int target) {
    int n = arr.length;
    if (arr[0] == target) return 0;
    int i = 1;
    while (i < n && arr[i] <= target) i *= 2;
    int low = i / 2, high = Math.min(i, n - 1);
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    pseudocode: `function exponentialSearch(arr, target):
    if arr[0] == target: return 0
    i <- 1
    while i < n and arr[i] <= target:
        i <- i * 2
    return binarySearch(arr, target, i / 2, min(i, n - 1))
function binarySearch(arr, target, low, high):
    while low <= high:
        mid <- low + (high - low) / 2
        if arr[mid] == target: return mid
        if arr[mid] < target: low <- mid + 1
        else: high <- mid - 1
    return -1`,
  },
  generateTimeline: (input) => {
    const arr = [...input.array].sort((a, b) => a - b);
    const target = input.target;
    const n = arr.length;
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    let checkpointAdded = false;

    const baseCallStack = [{ name: 'exponentialSearch', params: { n, target }, line: 1, isCurrent: true }];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized Exponential Search for target ${target} in sorted array of ${n} elements.`,
      isMilestone: true,
      milestoneTitle: 'Search Initialized',
      soundCue: 'start',
      variables: { n, target, i: 1 },
      callStack: baseCallStack,
      conditionEval: { expr: `n > 0`, result: true },
      pedagogy: {
        what: `Exponential search is for sorted arrays when the target may be near the front: it doubles the probe index until it overshoots, then binary-searches that narrow interval.`,
        why: `If the target sits at position p, doubling needs O(log p) probes and the final binary search O(log p) more — much better than O(log N) when p is small.`,
        whatNext: `Check the special case arr[0] = ${arr[0]} against target ${target}.`,
      },
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: 'default' })),
        target,
      },
    });

    // Frame 1: Base check at index 0
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Checking base element arr[0] = ${arr[0]}. Testing if arr[0] == target (${target}).`,
      soundCue: 'compare',
      variables: { n, target, 'arr[0]': arr[0] },
      callStack: baseCallStack,
      conditionEval: { expr: `arr[0] === target`, result: arr[0] === target },
      pedagogy: {
        what: `Index 0 is checked explicitly before the doubling loop starts at i = 1.`,
        why: 'Otherwise a target at index 0 could never be probed: the loop begins at 1 and only visits powers of two.',
        whatNext: arr[0] === target ? 'Match at index 0 — return immediately.' : 'Not a match; begin doubling at i = 1.',
      },
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: i === 0 ? 'comparing' : 'default' })),
        pointers: { check: 0 },
        target,
      },
    });

    if (arr[0] === target) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 2,
        explanation: `Target ${target} matches arr[0] immediately! Returning index 0 in O(1).`,
        isMilestone: true,
        milestoneTitle: 'Target Found at Index 0',
        soundCue: 'complete',
        variables: { foundIndex: 0, target },
        callStack: baseCallStack,
        conditionEval: { expr: `arr[0] === target`, result: true },
        pedagogy: {
          what: `arr[0] equals the target, so the answer is index 0.`,
          why: 'The explicit base check handles the one position the doubling sequence can never reach.',
          whatNext: 'Return 0 — the best case of the whole algorithm.',
        },
        state: {
          array: arr.map((v, i) => ({ id: i, value: v, status: i === 0 ? 'sorted' : 'default' })),
          pointers: { found: 0 },
          target,
        },
      });
      const total = frames.length;
      return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
    }

    let i = 1;
    while (i < n && arr[i] <= target) {
      // Comparison at current power of 2
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Exponential Doubling probe: arr[${i}] = ${arr[i]}. Evaluating arr[${i}] <= target (${target}).`,
        soundCue: 'compare',
        variables: { i, 'arr[i]': arr[i], target, nextCandidate: i * 2 },
        callStack: baseCallStack,
        conditionEval: { expr: `i < ${n} && arr[${i}] <= ${target}`, result: true },
        pedagogy: {
          what: `Probe at the current power of two: i = ${i}, arr[${i}] = ${arr[i]}.`,
          why: 'Doubling grows the bound geometrically, so reaching the target position p takes only ⌈log₂ p⌉ probes.',
          whatNext: `${arr[i]} ≤ ${target}, so the target (if present) lies at or after ${i}: double the index.`,
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'exponential-doubling-purpose',
              question: `arr[${i}] = ${arr[i]} ≤ target ${target}. What does doubling i buy over incrementing it by 1?`,
              options: [
                'A logarithmic upper bound: O(log p) doublings bracket the target before binary search',
                'It jumps directly onto the target index, so no binary search is needed',
              ],
              correctIndex: 0,
              explanation:
                'Doubling only needs to pass the target once; the last interval [i/2, i] is then binary-searched. Total cost is O(log p), where p is the target position.',
            }
          : undefined,
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === i ? 'comparing' : idx < i ? 'discarded' : 'default',
          })),
          pointers: { bound: i },
          target,
        },
      });
      checkpointAdded = true;

      const nextI = i * 2;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Condition met: ${arr[i]} <= ${target}. Doubling index jump: i = ${i} * 2 = ${nextI}.`,
        soundCue: 'step',
        variables: { prevI: i, i: nextI, target },
        callStack: baseCallStack,
        conditionEval: { expr: `i *= 2`, result: nextI },
        pedagogy: {
          what: `i jumps from ${i} to ${nextI}: the entire prefix up to ${i} is known to be ≤ target.`,
          why: 'The loop only continues while arr[i] ≤ target, so no valid candidate is skipped by doubling.',
          whatNext: `Probe index ${nextI} (or stop if it is past the array end).`,
        },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === i ? 'active' : idx < i ? 'discarded' : 'default',
          })),
          pointers: { leapFrom: i, leapTo: Math.min(nextI, n - 1) },
          target,
        },
      });

      i = nextI;
    }

    // Bound overshoot or bound loop exit check
    const overshootExceeded = i < n ? `arr[${i}] (${arr[i]}) > ${target}` : `i (${i}) >= array length (${n})`;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      explanation: `Doubling loop terminated: ${overshootExceeded}. Target must reside between index ${Math.floor(i / 2)} and ${Math.min(i, n - 1)}.`,
      soundCue: 'pivot',
      variables: { i, 'arr[i]': i < n ? arr[i] : 'OOB', target },
      callStack: baseCallStack,
      conditionEval: { expr: `i < n && arr[i] <= target`, result: false },
      pedagogy: {
        what: `The doubling phase ends at i = ${i}: the target, if present, is inside [${Math.floor(i / 2)}..${Math.min(i, n - 1)}].`,
        why: 'The previous probe i/2 was ≤ target and this one is > target (or out of bounds) — sorted order traps the answer in between.',
        whatNext: 'Hand this interval to binary search.',
      },
      state: {
        array: arr.map((v, idx) => ({
          id: idx,
          value: v,
          status: idx === Math.min(i, n - 1) ? 'pivot' : idx < Math.floor(i / 2) ? 'discarded' : 'default',
        })),
        pointers: { overshoot: Math.min(i, n - 1) },
        target,
      },
    });

    let low = Math.floor(i / 2);
    let high = Math.min(i, n - 1);

    const bsCallStack = [
      { name: 'exponentialSearch', params: { n, target }, line: 6, isCurrent: false },
      { name: 'binarySearch', params: { low, high, target }, line: 7, isCurrent: true },
    ];

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      explanation: `Bounded Search Window: low = ${low}, high = ${high}. Subarray size = ${high - low + 1}. Invoking binarySearch.`,
      isMilestone: true,
      milestoneTitle: 'Subarray Bounded',
      soundCue: 'pivot',
      variables: { low, high, target, windowSpan: high - low + 1 },
      callStack: bsCallStack,
      conditionEval: { expr: `low <= high`, result: low <= high },
      pedagogy: {
        what: `Binary search is called on [${low}..${high}] — only ${high - low + 1} candidates, not the whole array.`,
        why: 'Everything before low was proven ≤ target and everything after high ≥ target; this interval is the only possible location.',
        whatNext: 'Run standard binary search inside this interval.',
      },
      state: {
        array: arr.map((v, idx) => ({
          id: idx,
          value: v,
          status: idx >= low && idx <= high ? 'active' : 'discarded',
        })),
        pointers: { low, high },
        target,
      },
    });

    // Binary search phase
    let found = -1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      // Mid calculation frame
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Binary Search mid calculation: mid = floor((${low} + ${high}) / 2) = ${mid}. Inspecting arr[${mid}] = ${arr[mid]}.`,
        soundCue: 'compare',
        variables: { low, mid, high, 'arr[mid]': arr[mid], target },
        callStack: [
          { name: 'exponentialSearch', params: { n, target }, line: 6, isCurrent: false },
          { name: 'binarySearch', params: { low, high, target }, line: 9, isCurrent: true },
        ],
        conditionEval: { expr: `low <= high`, result: true },
        pedagogy: {
          what: `Inside the bounded interval, mid = ${mid} and arr[${mid}] = ${arr[mid]}.`,
          why: 'The inner loop is ordinary binary search; the exponential phase only chose a tighter starting window.',
          whatNext: `Compare ${arr[mid]} with target ${target}.`,
        },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === mid ? 'comparing' : idx >= low && idx <= high ? 'active' : 'discarded',
          })),
          pointers: { low, mid, high },
          target,
        },
      });

      if (arr[mid] === target) {
        found = mid;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          explanation: `🎯 Target ${target} successfully matched at index ${mid}! Exponential search complete in O(log i) time.`,
          isMilestone: true,
          milestoneTitle: `Target Found at Index ${mid}`,
          soundCue: 'complete',
          variables: { foundIndex: mid, value: arr[mid], target },
          callStack: [
            { name: 'exponentialSearch', params: { n, target }, line: 6, isCurrent: false },
            { name: 'binarySearch', params: { low, high, target }, line: 10, isCurrent: true },
          ],
          conditionEval: { expr: `arr[${mid}] === target`, result: true },
          pedagogy: {
            what: `Binary search found the target at index ${mid}.`,
            why: `Total work: O(log ${mid + 1}) doubling probes + O(log ${mid + 1}) binary-search steps — independent of the array length ${n}.`,
            whatNext: 'Return mid.',
          },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === mid ? 'sorted' : 'default',
            })),
            pointers: { found: mid },
            target,
          },
        });
        break;
      }

      if (arr[mid] < target) {
        const nextLow = mid + 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `arr[${mid}] (${arr[mid]}) < ${target}. Discarding left subarray [${low}..${mid}]. Adjusting low = ${nextLow}.`,
          soundCue: 'discard',
          variables: { oldLow: low, newLow: nextLow, high, mid, target },
          callStack: [
            { name: 'exponentialSearch', params: { n, target }, line: 6, isCurrent: false },
            { name: 'binarySearch', params: { low: nextLow, high, target }, line: 11, isCurrent: true },
          ],
          conditionEval: { expr: `arr[${mid}] < target`, result: true },
          pedagogy: {
            what: `Discard [${low}..${mid}]; the inner window becomes [${nextLow}..${high}].`,
            why: `All discarded values are ≤ ${arr[mid]} < ${target}, so none can match.`,
            whatNext: 'Halve the remaining inner window.',
          },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= nextLow && idx <= high ? 'active' : 'discarded',
            })),
            pointers: { low: nextLow, high },
            target,
          },
        });
        low = nextLow;
      } else {
        const nextHigh = mid - 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          explanation: `arr[${mid}] (${arr[mid]}) > ${target}. Discarding right subarray [${mid}..${high}]. Adjusting high = ${nextHigh}.`,
          soundCue: 'discard',
          variables: { low, oldHigh: high, newHigh: nextHigh, mid, target },
          callStack: [
            { name: 'exponentialSearch', params: { n, target }, line: 6, isCurrent: false },
            { name: 'binarySearch', params: { low, high: nextHigh, target }, line: 12, isCurrent: true },
          ],
          conditionEval: { expr: `arr[${mid}] > target`, result: true },
          pedagogy: {
            what: `Discard [${mid}..${high}]; the inner window becomes [${low}..${nextHigh}].`,
            why: `All discarded values are ≥ ${arr[mid]} > ${target}, so none can match.`,
            whatNext: 'Halve the remaining inner window.',
          },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= low && idx <= nextHigh ? 'active' : 'discarded',
            })),
            pointers: { low, high: nextHigh },
            target,
          },
        });
        high = nextHigh;
      }
    }

    if (found === -1) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 13,
        explanation: `Target ${target} not found within range (low > high). Search terminated. Returning -1.`,
        isMilestone: true,
        milestoneTitle: 'Target Not Found',
        soundCue: 'complete',
        variables: { low, high, found: -1, target },
        callStack: baseCallStack,
        conditionEval: { expr: `low <= high`, result: false },
        pedagogy: {
          what: `The inner binary search exhausted [${low}..${high}] without a match.`,
          why: 'The doubling phase already bracketed the only possible interval; an empty inner window proves the target is absent.',
          whatNext: 'Return −1.',
        },
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'discarded' })),
          pointers: {},
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
