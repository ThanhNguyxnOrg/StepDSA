import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const slidingWindowModule: AlgorithmModule<{ array: number[]; k: number }, ArrayStageState> = {
  id: 'sliding-window',
  title: 'Sliding Window (Max Sum Subarray of Size K)',
  category: 'arrays-pointers',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Strictly linear single-pass O(N)',
  },
  theory: {
    overview:
      'The Sliding Window technique is used to perform operations on a specific window size of a given array or string, avoiding redundant re-computations when the window shifts.',
    whyItWorks:
      'Instead of recalculating the sum of K elements from scratch at each position in O(K), we subtract the element leaving the window and add the new element entering the window in O(1) time.',
    invariant:
      'At step i, current_sum = previous_sum - arr[i - k] + arr[i], maintaining exact window sum in O(1).',
    pitfalls: [
      'Window size K must be <= array length.',
      'Remember to initialize the first window of size K before sliding.',
    ],
  },
  presets: [
    { id: 'standard', label: 'Classic Array (k=3)', description: 'Window of size 3', data: { array: [2, 1, 5, 1, 3, 2, 8, 4], k: 3 } },
    { id: 'all-positive', label: 'Rising Array (k=4)', description: 'Window of size 4', data: { array: [1, 4, 2, 10, 23, 3, 1, 0, 20], k: 4 } },
  ],
  defaultInput: { array: [2, 1, 5, 1, 3, 2, 8, 4], k: 3 },
  codeSnippets: {
    python: `def max_sub_array_of_size_k(k, arr):
    max_sum = 0
    window_sum = 0
    window_start = 0

    for window_end in range(len(arr)):
        window_sum += arr[window_end] # add next element
        # slide window once we hit size k
        if window_end >= k - 1:
            max_sum = max(max_sum, window_sum)
            window_sum -= arr[window_start] # subtract leaving element
            window_start += 1 # slide window forward
            
    return max_sum`,
    typescript: `function maxSubArrayOfSizeK(k: number, arr: number[]): number {
  let maxSum = 0;
  let windowSum = 0;
  let windowStart = 0;

  for (let windowEnd = 0; windowEnd < arr.length; windowEnd++) {
    windowSum += arr[windowEnd];
    if (windowEnd >= k - 1) {
      maxSum = Math.max(maxSum, windowSum);
      windowSum -= arr[windowStart];
      windowStart++;
    }
  }
  return maxSum;
}`,
    cpp: `int maxSubArrayOfSizeK(int k, const vector<int>& arr) {
    int maxSum = 0, windowSum = 0, windowStart = 0;
    for (int windowEnd = 0; windowEnd < arr.size(); windowEnd++) {
        windowSum += arr[windowEnd];
        if (windowEnd >= k - 1) {
            maxSum = max(maxSum, windowSum);
            windowSum -= arr[windowStart];
            windowStart++;
        }
    }
    return maxSum;
}`,
    java: `public int maxSubArrayOfSizeK(int k, int[] arr) {
    int maxSum = 0, windowSum = 0, windowStart = 0;
    for (int windowEnd = 0; windowEnd < arr.length; windowEnd++) {
        windowSum += arr[windowEnd];
        if (windowEnd >= k - 1) {
            maxSum = Math.max(maxSum, windowSum);
            windowSum -= arr[windowStart++];
        }
    }
    return maxSum;
}`,
    pseudocode: `function maxSubArrayOfSizeK(k, arr):
    maxSum = 0, windowSum = 0, windowStart = 0
    for windowEnd = 0 to length(arr) - 1:
        windowSum += arr[windowEnd]
        if windowEnd >= k - 1:
            maxSum = max(maxSum, windowSum)
            windowSum -= arr[windowStart]
            windowStart++
    return maxSum`,
  },

  generateTimeline: (input: { array: number[]; k: number }): ExecutionFrame<ArrayStageState>[] => {
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const arr = [...input.array];
    const k = Math.min(input.k, arr.length);
    let maxSum = 0;
    let windowSum = 0;
    let windowStart = 0;
    let bestWindow: [number, number] = [0, k - 1];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Starting Sliding Window of size k=${k} over array of length ${arr.length}.`,
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: {},
      },
    });

    for (let windowEnd = 0; windowEnd < arr.length; windowEnd++) {
      windowSum += arr[windowEnd];

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `Added arr[${windowEnd}] (${arr[windowEnd]}) to window. Current window sum = ${windowSum}.`,
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx >= windowStart && idx <= windowEnd ? 'comparing' : 'default',
          })),
          pointers: { start: windowStart, end: windowEnd },
        },
      });

      if (windowEnd >= k - 1) {
        const isNewMax = windowSum > maxSum;
        if (isNewMax) {
          maxSum = windowSum;
          bestWindow = [windowStart, windowEnd];
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `Window size reached k=${k}. Window [${windowStart}..${windowEnd}] sum = ${windowSum}. ${
            isNewMax ? `🎉 New Max Sum found: ${maxSum}!` : `Max sum remains ${maxSum}.`
          }`,
          invariantStatus: {
            label: `Max Window Sum: ${maxSum}`,
            isValid: true,
          },
          isMilestone: isNewMax,
          milestoneTitle: isNewMax ? `New Max Sum (${maxSum})` : undefined,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= windowStart && idx <= windowEnd ? (isNewMax ? 'sorted' : 'active') : 'default',
            })),
            pointers: { start: windowStart, end: windowEnd },
          },
        });

        windowSum -= arr[windowStart];
        windowStart++;
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: `Completed array scan in single pass O(N). Maximum sum subarray of size k=${k} is ${maxSum} in range [${bestWindow[0]}..${bestWindow[1]}].`,
      isMilestone: true,
      milestoneTitle: `Max Sum: ${maxSum}`,
      state: {
        array: arr.map((v, idx) => ({
          id: idx,
          value: v,
          status: idx >= bestWindow[0] && idx <= bestWindow[1] ? 'sorted' : 'default',
        })),
        pointers: { bestStart: bestWindow[0], bestEnd: bestWindow[1] },
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
