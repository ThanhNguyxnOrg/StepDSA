import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const mergesortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'mergesort',
  title: 'Mergesort (Divide & Conquer)',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Guaranteed O(N log N) in all cases',
  },
  theory: {
    overview:
      'Mergesort is a divide-and-conquer algorithm that recursively divides the array into halves until each subarray contains a single element, then merges the sorted halves back together in order.',
    whyItWorks:
      'Merging two already-sorted subarrays takes linear time O(N) using two pointers. Recursing through log(N) levels guarantees O(N log N) total time complexity.',
    invariant:
      'At each merge step, the merged segment arr[left ... right] is guaranteed to be in non-decreasing order.',
    pitfalls: [
      'Requires O(N) auxiliary space for the temporary buffer during merging.',
      'Not strictly in-place compared to Heapsort or Quicksort.',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Standard demonstration', data: [38, 27, 43, 3, 9, 82, 10] },
    { id: 'reversed', label: 'Reversed Array', description: 'Shows stable merge behavior', data: [70, 60, 50, 40, 30, 20] },
    { id: 'duplicates', label: 'With Duplicates', description: 'Tests stability', data: [15, 30, 15, 45, 30, 10] },
  ],
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
  codeSnippets: {
    python: `def mergesort(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        mergesort(arr, left, mid)
        mergesort(arr, mid + 1, right)
        merge(arr, left, mid, right)

def merge(arr, left, mid, right):
    temp = []
    i, j = left, mid + 1
    while i <= mid and j <= right:
        if arr[i] <= arr[j]:
            temp.append(arr[i]); i += 1
        else:
            temp.append(arr[j]); j += 1
    while i <= mid: temp.append(arr[i]); i += 1
    while j <= right: temp.append(arr[j]); j += 1
    for k in range(len(temp)):
        arr[left + k] = temp[k]`,
    typescript: `function mergesort(arr: number[], left: number, right: number): void {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    mergesort(arr, left, mid);
    mergesort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }
}

function merge(arr: number[], left: number, mid: number, right: number): void {
  const temp: number[] = [];
  let i = left, j = mid + 1;
  while (i <= mid && j <= right) {
    if (arr[i] <= arr[j]) {
      temp.push(arr[i++]);
    } else {
      temp.push(arr[j++]);
    }
  }
  while (i <= mid) temp.push(arr[i++]);
  while (j <= right) temp.push(arr[j++]);
  for (let k = 0; k < temp.length; k++) {
    arr[left + k] = temp[k];
  }
}`,
    cpp: `void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> temp;
    int i = left, j = mid + 1;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) temp.push_back(arr[i++]);
        else temp.push_back(arr[j++]);
    }
    while (i <= mid) temp.push_back(arr[i++]);
    while (j <= right) temp.push_back(arr[j++]);
    for (int k = 0; k < temp.size(); k++) arr[left + k] = temp[k];
}

void mergesort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergesort(arr, left, mid);
        mergesort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}`,
    java: `void merge(int[] arr, int left, int mid, int right) {
    int[] temp = new int[right - left + 1];
    int i = left, j = mid + 1, k = 0;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) temp[k++] = arr[i++];
        else temp[k++] = arr[j++];
    }
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    for (int idx = 0; idx < temp.length; idx++) arr[left + idx] = temp[idx];
}`,
    pseudocode: `function mergesort(arr, left, right):
    if left < right:
        mid = (left + right) / 2
        mergesort(arr, left, mid)
        mergesort(arr, mid + 1, right)
        merge(arr, left, mid, right)

function merge(arr, left, mid, right):
    create temp buffer
    merge sorted subarrays arr[left..mid] and arr[mid+1..right]
    copy temp buffer back into arr[left..right]`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const arr = [...input];
    const n = arr.length;
    const sortedSegments = new Set<string>();

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: 'Starting Mergesort. Recursively dividing array into halves.',
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: {},
      },
    });

    function snapshot(
      codeLine: number,
      explanation: string,
      pointers: Record<string, number> = {},
      activeStatuses: Record<number, any> = {},
      milestone?: string
    ) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine,
        explanation,
        invariantStatus: {
          label: 'Subarrays arr[left..mid] and arr[mid+1..right] are sorted',
          isValid: true,
        },
        isMilestone: !!milestone,
        milestoneTitle: milestone,
        state: {
          array: arr.map((v, idx) => {
            let status = 'default';
            if (activeStatuses[idx]) status = activeStatuses[idx];
            return { id: idx, value: v, status: status as any };
          }),
          pointers,
        },
      });
    }

    function merge(left: number, mid: number, right: number) {
      const temp: number[] = [];
      let i = left;
      let j = mid + 1;

      snapshot(
        9,
        `Merging sorted subarrays arr[${left}..${mid}] and arr[${mid + 1}..${right}].`,
        { left, mid, right, i, j },
        { [left]: 'active', [right]: 'active' },
        `Merge Range [${left}..${right}]`
      );

      while (i <= mid && j <= right) {
        snapshot(
          12,
          `Comparing left element arr[${i}] (${arr[i]}) with right element arr[${j}] (${arr[j]}).`,
          { i, j, left, right },
          { [i]: 'comparing', [j]: 'comparing' }
        );

        if (arr[i] <= arr[j]) {
          temp.push(arr[i]);
          i++;
        } else {
          temp.push(arr[j]);
          j++;
        }
      }

      while (i <= mid) {
        temp.push(arr[i]);
        i++;
      }
      while (j <= right) {
        temp.push(arr[j]);
        j++;
      }

      // Copy back
      for (let k = 0; k < temp.length; k++) {
        arr[left + k] = temp[k];
      }

      const segmentKey = `${left}-${right}`;
      sortedSegments.add(segmentKey);

      const active: Record<number, any> = {};
      for (let k = left; k <= right; k++) active[k] = 'sorted';

      snapshot(
        17,
        `Merged segment arr[${left}..${right}] is now sorted: [${temp.join(', ')}].`,
        { left, right },
        active,
        `Merged [${left}..${right}]`
      );
    }

    function mergesort(left: number, right: number) {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        snapshot(
          3,
          `Dividing range [${left}..${right}] at mid index ${mid}.`,
          { left, mid, right },
          { [mid]: 'pivot' }
        );
        mergesort(left, mid);
        mergesort(mid + 1, right);
        merge(left, mid, right);
      }
    }

    mergesort(0, n - 1);

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 1,
      explanation: '🎉 Mergesort complete! All subarrays successfully merged in O(N log N) time.',
      isMilestone: true,
      milestoneTitle: 'Sorting Complete',
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
        pointers: {},
      },
    });

    const total = frames.length;
    return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
