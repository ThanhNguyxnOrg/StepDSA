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
    let checkpointAdded = false;

    const callStack: { name: string; params: Record<string, string | number>; line?: number; isCurrent?: boolean }[] = [
      { name: 'main', params: { n }, line: 1, isCurrent: true },
    ];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      isMilestone: true,
      milestoneTitle: 'Mergesort Initialized',
      soundCue: { type: 'start' },
      variables: { n, left: 0, right: n - 1 },
      conditionEval: { expr: `n > 1`, result: n > 1 },
      callStack: [...callStack],
      explanation: 'Starting Mergesort. Recursively dividing array into halves.',
      pedagogy: {
        what: `The full range [0..${n - 1}] is the first subproblem.`,
        why: 'Divide-and-conquer only needs to solve this range; its two halves are independent until the merge.',
        whatNext: 'Split the range at mid, solve the left half, then the right half, then merge.',
      },
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
      milestone?: string,
      customVars?: Record<string, any>,
      conditionEval?: { expr: string; result: boolean },
      soundCue?: any,
      auxiliary?: any,
      pedagogy?: ExecutionFrame['pedagogy'],
      checkpoint?: ExecutionFrame['checkpoint']
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
        soundCue: soundCue ?? (milestone ? { type: 'sorted' } : { type: 'step' }),
        pedagogy,
        checkpoint,
        variables: {
          ...pointers,
          ...(customVars || {}),
        },
        conditionEval,
        callStack: callStack.map((frame, i) => ({
          ...frame,
          line: i === callStack.length - 1 ? codeLine : frame.line,
          isCurrent: i === callStack.length - 1,
        })),
        state: {
          array: arr.map((v, idx) => {
            let status = 'default';
            if (activeStatuses[idx]) status = activeStatuses[idx];
            return { id: idx, value: v, status: status as any };
          }),
          pointers,
          auxiliary,
        },
      });
    }

    function merge(left: number, mid: number, right: number) {
      callStack.push({ name: 'merge', params: { left, mid, right }, line: 9 });
      const temp: number[] = [];
      let i = left;
      let j = mid + 1;

      const tempAuxiliary = (activeIndex?: number, note?: string) => ({
        type: 'buffer' as const,
        name: 'temp',
        data: [...temp],
        activeIndex,
        note:
          note ??
          `Merge buffer for arr[${left}..${right}]. Values are appended in sorted order, then copied back.`,
      });

      snapshot(
        9,
        `Merging sorted subarrays arr[${left}..${mid}] and arr[${mid + 1}..${right}].`,
        { left, mid, right, i, j },
        { [left]: 'active', [right]: 'active' },
        `Merge Range [${left}..${right}]`,
        { left, mid, right, leftLen: mid - left + 1, rightLen: right - mid },
        { expr: `left <= mid && mid + 1 <= right`, result: true },
        { type: 'pivot' },
        tempAuxiliary(undefined, 'The merge buffer starts empty; the original array is still untouched.'),
        {
          what: `Two sorted halves are ready: arr[${left}..${mid}] and arr[${mid + 1}..${right}].`,
          why: 'Merging only needs the two front pointers i and j; no comparison beyond the two fronts is necessary.',
          whatNext: `Compare arr[${i}] = ${arr[i]} with arr[${j}] = ${arr[j]}.`,
        }
      );

      while (i <= mid && j <= right) {
        const isLessOrEqual = arr[i] <= arr[j];
        const leftValue = arr[i];
        const rightValue = arr[j];
        snapshot(
          12,
          `Comparing left element arr[${i}] (${leftValue}) with right element arr[${j}] (${rightValue}).`,
          { i, j, left, right },
          { [i]: 'comparing', [j]: 'comparing' },
          undefined,
          { 'arr[i]': leftValue, 'arr[j]': rightValue, choose: isLessOrEqual ? 'left' : 'right' },
          { expr: `arr[${i}] <= arr[${j}] (${leftValue} <= ${rightValue})`, result: isLessOrEqual },
          { type: 'compare' },
          tempAuxiliary(undefined, 'Compare the two front elements; the winner has not been appended yet.'),
          {
            what: `The two candidates are ${leftValue} (left half) and ${rightValue} (right half).`,
            why: 'Each half is already sorted, so only their front elements can be the next smallest overall value.',
            whatNext: isLessOrEqual
              ? `${leftValue} <= ${rightValue}, so append the left value and advance i.`
              : `${rightValue} < ${leftValue}, so append the right value and advance j.`,
          },
          !checkpointAdded
            ? {
                id: 'mergesort-first-compare',
                question: `arr[i] = ${leftValue}, arr[j] = ${rightValue}. Which value enters temp next?`,
                options: [`${leftValue} (left half)`, `${rightValue} (right half)`],
                correctIndex: isLessOrEqual ? 0 : 1,
                explanation: isLessOrEqual
                  ? `The left value is <= the right value, so it is appended first. Stability also prefers the left value on ties.`
                  : `The right value is smaller, so it is appended first.`,
              }
            : undefined
        );
        checkpointAdded = true;

        if (isLessOrEqual) {
          temp.push(arr[i]);
          const appended = arr[i];
          i++;
          snapshot(
            14,
            `Appended ${appended} from the left half to temp[${temp.length - 1}]. Advanced i to ${i}.`,
            { i, j, left, right },
            { [i - 1]: 'active', [j]: 'comparing' },
            undefined,
            { appended, from: 'left', tempSize: temp.length },
            undefined,
            { type: 'step' },
            tempAuxiliary(temp.length - 1, `temp now holds ${temp.length} value(s).`),
            {
              what: `${appended} is written into the next free temp slot.`,
              why: 'The left value is the smaller front, so it must appear before the right value in sorted order.',
              whatNext: `Advance i to ${i} and compare the next left value with arr[${j}].`,
            }
          );
        } else {
          temp.push(arr[j]);
          const appended = arr[j];
          j++;
          snapshot(
            16,
            `Appended ${appended} from the right half to temp[${temp.length - 1}]. Advanced j to ${j}.`,
            { i, j, left, right },
            { [i]: 'comparing', [j - 1]: 'active' },
            undefined,
            { appended, from: 'right', tempSize: temp.length },
            undefined,
            { type: 'step' },
            tempAuxiliary(temp.length - 1, `temp now holds ${temp.length} value(s).`),
            {
              what: `${appended} is written into the next free temp slot.`,
              why: 'The right value is strictly smaller than the left front, so it must be placed first.',
              whatNext: `Advance j to ${j} and compare the next right value with arr[${i}].`,
            }
          );
        }
      }

      while (i <= mid) {
        temp.push(arr[i]);
        const appended = arr[i];
        i++;
        snapshot(
          19,
          `Left half still has values: appended ${appended} to temp[${temp.length - 1}].`,
          { i, j, left, right },
          { [i - 1]: 'active' },
          undefined,
          { appended, from: 'left-remainder', tempSize: temp.length },
          { expr: `i <= mid`, result: true },
          { type: 'step' },
          tempAuxiliary(temp.length - 1, 'The right half is exhausted; copy the remaining left values in order.'),
          {
            what: `The right half has no values left, so ${appended} is appended directly.`,
            why: 'Remaining left values are already sorted among themselves and larger than every value already in temp.',
            whatNext: i <= mid ? `Append the next left value arr[${i}].` : 'Copy the completed temp buffer back into arr.',
          }
        );
      }
      while (j <= right) {
        temp.push(arr[j]);
        const appended = arr[j];
        j++;
        snapshot(
          21,
          `Right half still has values: appended ${appended} to temp[${temp.length - 1}].`,
          { i, j, left, right },
          { [j - 1]: 'active' },
          undefined,
          { appended, from: 'right-remainder', tempSize: temp.length },
          { expr: `j <= right`, result: true },
          { type: 'step' },
          tempAuxiliary(temp.length - 1, 'The left half is exhausted; copy the remaining right values in order.'),
          {
            what: `The left half has no values left, so ${appended} is appended directly.`,
            why: 'Remaining right values are already sorted and larger than every value already in temp.',
            whatNext: j <= right ? `Append the next right value arr[${j}].` : 'Copy the completed temp buffer back into arr.',
          }
        );
      }

      snapshot(
        24,
        `Merge buffer is complete: [${temp.join(', ')}]. Now copy it back into arr[${left}..${right}].`,
        { left, right, copyFrom: 0 },
        {},
        undefined,
        { tempSize: temp.length },
        { expr: `temp.length === right - left + 1`, result: temp.length === right - left + 1 },
        { type: 'step' },
        tempAuxiliary(undefined, 'The buffer is final. The next frames copy each value back into the original array.'),
        {
          what: `temp = [${temp.join(', ')}] is fully merged.`,
          why: 'The original array still holds the pre-merge values; copying back is a separate, observable phase.',
          whatNext: `Copy temp[0] = ${temp[0]} into arr[${left}], then continue left to right.`,
        }
      );

      // Copy back one element per frame so the buffer and the array never jump silently.
      for (let k = 0; k < temp.length; k++) {
        arr[left + k] = temp[k];
        const copied = temp[k];
        snapshot(
          24,
          `Copied temp[${k}] (${copied}) into arr[${left + k}].`,
          { left, right, copyFrom: k, copyTo: left + k },
          { [left + k]: 'active' },
          undefined,
          { copied, tempIndex: k, arrayIndex: left + k },
          undefined,
          { type: 'step' },
          tempAuxiliary(k, `Copying temp[${k}] = ${copied} back into the original array.`),
          {
            what: `arr[${left + k}] now equals ${copied}.`,
            why: 'The buffer is the source of truth during the merge; the array is rebuilt from it left to right.',
            whatNext:
              k + 1 < temp.length
                ? `Copy temp[${k + 1}] = ${temp[k + 1]} into arr[${left + k + 1}].`
                : `The range [${left}..${right}] is fully copied back and sorted.`,
          }
        );
      }

      const segmentKey = `${left}-${right}`;
      sortedSegments.add(segmentKey);

      const active: Record<number, any> = {};
      for (let k = left; k <= right; k++) active[k] = 'sorted';

      snapshot(
        24,
        `Merged segment arr[${left}..${right}] is now sorted: [${temp.join(', ')}].`,
        { left, right },
        active,
        `Merged [${left}..${right}]`,
        { mergedCount: temp.length, range: `[${left}..${right}]` },
        { expr: `isSorted(range)`, result: true },
        { type: 'swap' },
        tempAuxiliary(undefined, 'Copy-back finished; the auxiliary buffer is no longer needed for this range.'),
        {
          what: `The original array segment [${left}..${right}] now matches the sorted buffer.`,
          why: 'The merge invariant is restored for this range, so the parent merge can treat it as one sorted half.',
          whatNext: 'Return to the caller and continue merging larger ranges.',
        }
      );

      callStack.pop();
    }

    function mergesort(left: number, right: number) {
      callStack.push({ name: 'mergesort', params: { left, right }, line: 2 });
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        snapshot(
          3,
          `Dividing range [${left}..${right}] at mid index ${mid}.`,
          { left, mid, right },
          { [mid]: 'pivot' },
          undefined,
          { left, mid, right },
          { expr: `left < right (${left} < ${right})`, result: true },
          { type: 'step' }
        );
        mergesort(left, mid);
        mergesort(mid + 1, right);
        merge(left, mid, right);
      } else {
        snapshot(
          2,
          `Base case: range [${left}..${right}] contains one element (${arr[left]}), already sorted.`,
          { left, right },
          { [left]: 'sorted' },
          undefined,
          { left, right, baseValue: arr[left] },
          { expr: `left < right (${left} < ${right})`, result: false },
          { type: 'step' },
          undefined,
          {
            what: `A single-element range [${left}..${right}] needs no further division.`,
            why: 'Any one-element array is sorted by definition; this is the recursion base case.',
            whatNext: 'Return to the parent call, which will merge this element with its sibling range.',
          }
        );
      }
      callStack.pop();
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
      soundCue: { type: 'complete' },
      variables: { n, sorted: true },
      conditionEval: { expr: `isSorted(arr)`, result: true },
      callStack: [{ name: 'main', params: { n }, line: 1, isCurrent: true }],
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
