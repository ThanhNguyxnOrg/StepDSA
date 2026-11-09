import { AlgorithmModule, ElementStatus, ExecutionFrame } from '../../core/types';
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
    let checkpointAdded = false;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Starting Shellsort on array of length ${n}. Initial gap = floor(${n} / 2) = ${gap}.`,
      variables: { n, gap },
      callStack: [{ name: 'shellSort', params: { n, gap }, line: 3, isCurrent: true }],
      conditionEval: { expr: `gap > 0 (${gap} > 0)`, result: gap > 0 },
      soundCue: { type: 'start' },
      isMilestone: true,
      milestoneTitle: 'Shellsort Initialized',
      pedagogy: {
        what: `The gap sequence starts at floor(n / 2) = ${gap} and halves each pass: ${gap} → ${Math.max(
          1,
          Math.floor(gap / 2)
        )} → … → 1.`,
        why: 'Large gaps move far-away elements long distances cheaply; each later pass only needs small, local fixes.',
        whatNext: `Pass 1: insertion-sort every chain of indices separated by gap = ${gap}.`,
      },
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
        soundCue: { type: 'step' },
        variables: { gap, n },
        callStack: [{ name: 'shellSort', params: { gap }, line: 4, isCurrent: true }],
        conditionEval: { expr: `gap > 0 (${gap} > 0)`, result: true },
        pedagogy: {
          what: `This pass treats the array as ${gap} interleaved chains: indices (0, ${gap}, ${2 * gap}, …), (1, ${
            gap + 1
          }, …), …`,
          why: 'Each chain is insertion-sorted independently; the array becomes "gap-sorted", which never destroys earlier passes.',
          whatNext: `Pick up each chain element arr[i] (i = ${gap}…${n - 1}) as the held key temp and shift bigger partners right by ${gap}.`,
        },
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
          pointers: { gap },
        },
      });

      for (let i = gap; i < n; ++i) {
        const temp = arr[i];
        let j = i;

        // All indices reachable from i by stepping -gap form one insertion chain.
        const chainIndices = new Set<number>();
        for (let chainIdx = i; chainIdx >= 0; chainIdx -= gap) chainIndices.add(chainIdx);

        const heldKey = {
          type: 'value' as const,
          name: 'temp',
          data: temp,
          note: `Held element from index ${i}. Its slot is logically empty while partners shift right by ${gap}.`,
        };

        const chainStatuses = (extra: Record<number, ElementStatus> = {}) => {
          const statuses: Record<number, ElementStatus> = {};
          chainIndices.forEach((chainIdx) => {
            statuses[chainIdx] = 'selected';
          });
          return { ...statuses, ...extra };
        };

        const arrayWith = (extra: Record<number, ElementStatus> = {}) => {
          const statuses = chainStatuses(extra);
          return arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: statuses[idx] ?? 'default',
          }));
        };

        // Pickup: the held key leaves the array into the auxiliary slot.
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Pick up the held key: temp = arr[${i}] = ${temp}. Slot [${i}] is now logically empty for shifting.`,
          soundCue: { type: 'select' },
          variables: { gap, i, temp },
          callStack: [{ name: 'shellSort', params: { gap, i, temp }, line: 6, isCurrent: true }],
          conditionEval: { expr: `i < n (${i} < ${n})`, result: true },
          pedagogy: {
            what: `${temp} is lifted out of index ${i}; the chain [${[...chainIndices].sort((a, b) => a - b).join(', ')}] will absorb it at the right slot.`,
            why: 'Holding the key aside is what makes the shifts non-destructive — no value is ever overwritten while moving.',
            whatNext: `Compare temp ${temp} against its chain partner at index ${i - gap} (distance gap = ${gap}).`,
          },
          state: {
            array: arrayWith({ [i]: 'active' }),
            pointers: { i, gap },
            auxiliary: heldKey,
          },
        });

        // Shift loop with explicit guard frames (both outcomes visible).
        while (true) {
          const hasRoom = j >= gap;
          const parentVal = hasRoom ? arr[j - gap] : null;
          const willShift = hasRoom && (parentVal as number) > temp;

          const attachCheckpoint = !checkpointAdded && gap > 0;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            explanation: hasRoom
              ? `${parentVal} vs held key ${temp}: ${
                  willShift ? 'partner is bigger — shift it right by gap.' : 'held key fits here — stop shifting.'
                }`
              : `j = ${j} is smaller than gap = ${gap}: the start of this chain is reached.`,
            soundCue: { type: 'compare' },
            variables: { gap, j, temp, 'arr[j-gap]': parentVal },
            callStack: [
              { name: 'shellSort', params: { gap, j, compareWith: j - gap, temp }, line: 8, isCurrent: true },
            ],
            conditionEval: hasRoom
              ? {
                  expr: `j >= ${gap} && arr[${j - gap}] > temp (${parentVal} > ${temp})`,
                  result: willShift,
                }
              : { expr: `j >= gap (${j} < ${gap})`, result: false },
            pedagogy: {
              what: hasRoom
                ? `The chain partner arr[${j - gap}] = ${parentVal} faces the held key ${temp}.`
                : `No partner exists at j - gap = ${j - gap} < 0; this chain is exhausted.`,
              why: 'Only partners greater than the held key may slide right; the first smaller partner marks the insertion slot.',
              whatNext: willShift
                ? `Shift ${parentVal} right into slot [${j}], then keep scanning left.`
                : `Drop the held key ${temp} into slot [${j}].`,
            },
            checkpoint: attachCheckpoint
              ? {
                  id: 'shellsort-first-guard',
                  question: `Held key temp = ${temp}; chain partner arr[${j - gap}] = ${parentVal}. Does the partner shift right by gap = ${gap}?`,
                  options: ['Yes — partner is bigger', 'No — held key already fits'],
                  correctIndex: willShift ? 0 : 1,
                  explanation: willShift
                    ? `${parentVal} > ${temp}, so slot [${j}] is filled by the partner and the scan continues left.`
                    : `${parentVal} ≤ ${temp}, so the held key belongs at slot [${j}].`,
                }
              : undefined,
            state: {
              array: arrayWith(
                hasRoom
                  ? { [j]: 'comparing', [j - gap]: 'comparing' }
                  : { [j]: 'comparing' }
              ),
              pointers: hasRoom ? { j, 'j-gap': j - gap, gap } : { j, gap },
              auxiliary: heldKey,
            },
          });
          if (attachCheckpoint) checkpointAdded = true;

          if (!willShift) break;

          const shiftedVal = arr[j - gap];
          arr[j] = shiftedVal;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 9,
            explanation: `Shift: arr[${j - gap}] (${shiftedVal}) moves right by gap into slot [${j}].`,
            soundCue: { type: 'swap' },
            variables: { gap, j, shiftedVal, temp },
            callStack: [{ name: 'shellSort', params: { gap, j, shiftTo: j }, line: 9, isCurrent: true }],
            pedagogy: {
              what: `${shiftedVal} slides ${gap} slot(s) right; one position of the chain is now free further left.`,
              why: 'Shifting instead of swapping halves the writes: each value moves once, the held key moves once.',
              whatNext: `Advance the cursor left: j = j - gap = ${j - gap}.`,
            },
            state: {
              array: arrayWith({ [j]: 'swapping', [j - gap]: 'swapping' }),
              pointers: { j, 'j-gap': j - gap, gap },
              auxiliary: heldKey,
            },
          });

          j -= gap;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            explanation: `Cursor moves left by one gap: j = ${j}. Continue checking within the same chain.`,
            soundCue: { type: 'step' },
            variables: { gap, j, temp },
            callStack: [{ name: 'shellSort', params: { gap, j, temp }, line: 10, isCurrent: true }],
            conditionEval: { expr: `j = j - gap (${j})`, result: true },
            pedagogy: {
              what: `j steps back to ${j}; the scan continues along the same gap chain.`,
              why: 'The chain is being insertion-sorted, so earlier partners must also be checked against the held key.',
              whatNext: j >= gap ? `Compare the next partner arr[${j - gap}].` : 'The chain start is reached.',
            },
            state: {
              array: arrayWith({ [j]: 'comparing' }),
              pointers: { j, gap },
              auxiliary: heldKey,
            },
          });
        }

        arr[j] = temp;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Place the held key: arr[${j}] = temp = ${temp}.`,
          soundCue: { type: 'step' },
          variables: { gap, i, j, insertedVal: temp },
          callStack: [{ name: 'shellSort', params: { gap, insertedIndex: j }, line: 11, isCurrent: true }],
          conditionEval: { expr: `arr[${j}] = temp`, result: true },
          pedagogy: {
            what: `${temp} lands at slot [${j}] — the first position in the chain where it is ≥ its left partner.`,
            why: 'Because every bigger partner already moved right, the chain from here on is locally sorted (gap-sorted).',
            whatNext:
              i < n - 1
                ? `Pick up the next chain element arr[${i + 1}].`
                : `The pass for gap = ${gap} is complete.`,
          },
          state: {
            array: arrayWith({ [j]: 'pivot' }),
            pointers: { j, gap },
            auxiliary: {
              ...heldKey,
              note: `Inserted at index ${j}; the auxiliary slot is free again.`,
            },
          },
        });
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        explanation: `Completed pass for gap = ${gap}. Array is now ${gap}-sorted. Halving gap to ${Math.floor(
          gap / 2
        )}.`,
        isMilestone: true,
        milestoneTitle: `Completed Gap ${gap}`,
        soundCue: { type: 'step' },
        variables: { completedGap: gap, nextGap: Math.floor(gap / 2) },
        callStack: [{ name: 'shellSort', params: { completedGap: gap }, line: 12, isCurrent: true }],
        conditionEval: { expr: `nextGap > 0 (${Math.floor(gap / 2)} > 0)`, result: Math.floor(gap / 2) > 0 },
        pedagogy: {
          what: `Every chain of stride ${gap} is now ordered; the array is ${gap}-sorted.`,
          why: 'Gap-sortedness is not full sortedness, but it guarantees elements are close to their final place, so later small-gap passes do little work.',
          whatNext:
            Math.floor(gap / 2) > 0
              ? `Halve the gap to ${Math.floor(gap / 2)} and repeat with shorter strides.`
              : 'The final gap-1 pass is ordinary insertion sort on a nearly sorted array.',
        },
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
      codeLine: 13,
      explanation: 'Gap reduced to 0. All passes completed. Array is fully sorted!',
      isMilestone: true,
      milestoneTitle: 'Shellsort Completed',
      soundCue: { type: 'complete' },
      variables: { gap: 0, n, sorted: true },
      callStack: [{ name: 'shellSort', params: { done: true }, line: 13, isCurrent: true }],
      conditionEval: { expr: `gap == 0 (0 == 0)`, result: true },
      pedagogy: {
        what: `Final array: [${arr.join(', ')}] — sorted after gap passes ${Math.floor(n / 2)} → … → 1.`,
        why: 'The gap-1 pass is insertion sort, whose O(N²) worst case collapses to O(N) when the input is nearly sorted — exactly what the bigger gaps arranged.',
        whatNext: 'Compare with plain insertion sort on the same input: far fewer shifts happen here.',
      },
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
