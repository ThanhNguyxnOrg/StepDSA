import { motion } from 'motion/react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DutchFlagState {
  array: number[];
  low: number;
  mid: number;
  high: number;
  swappedIndices: [number, number] | null;
  done: boolean;
}

const DEFAULT_FLAG = [2, 0, 2, 1, 1, 0, 2, 0, 1];

export const dutchNationalFlagModule: AlgorithmModule<number[], DutchFlagState> = {
  id: 'dutch-national-flag',
  title: 'Dutch National Flag (3-Way Partition)',
  category: 'arrays-pointers',
  difficulty: 'Beginner',
  defaultInput: DEFAULT_FLAG,
  presets: [
    { id: 'dnf-mixed', label: 'Mixed 0s, 1s, 2s', description: 'Balanced mix of 0, 1, and 2 elements.', data: [2, 0, 2, 1, 1, 0, 2, 0, 1] },
    { id: 'dnf-reversed', label: 'Reversed Colors', description: 'Worst-case ordering starting with all 2s and ending with 0s.', data: [2, 2, 2, 1, 1, 0, 0, 0] },
    { id: 'dnf-alternating', label: 'Alternating', description: 'Interleaved 2, 1, 0 pattern demonstrating mid staying after high swaps.', data: [2, 1, 0, 2, 1, 0, 1, 2, 0] },
  ],
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'The unknown region [mid..high] strictly shrinks by 1 on every iteration.',
  },
  theory: {
    overview:
      "Edsger Dijkstra's classic 3-way in-place partitioning algorithm maintains four contiguous invariant zones at all times: [0..low-1] are 0s, [low..mid-1] are 1s, [mid..high] are unclassified, and [high+1..n-1] are 2s.",
    whyItWorks:
      'Every branch strictly shrinks the unclassified interval [mid..high] by 1 (either advancing mid or decrementing high), guaranteeing termination in at most N steps.',
    invariant:
      'arr[0..low-1] == 0, arr[low..mid-1] == 1, arr[mid..high] == unknown, arr[high+1..n-1] == 2.',
    pitfalls: [
      'Incrementing mid after swapping arr[mid] == 2 with arr[high] skips inspecting the newly arrived value from high!',
      'Using mid < high instead of mid <= high leaves the final element at mid == high unclassified.',
    ],
  },
  relatedModules: [
    { id: 'quicksort', label: 'Quicksort' },
    { id: 'counting-sort', label: 'Counting Sort' },
  ],
  codeSnippets: {
    pseudocode: `function sortColors(arr):
  low = 0, mid = 0, high = n - 1
  while mid <= high:
    if arr[mid] == 0:
      swap(arr[low], arr[mid])
      low = low + 1; mid = mid + 1
    else if arr[mid] == 1:
      mid = mid + 1
    else: // arr[mid] == 2
      swap(arr[mid], arr[high])
      high = high - 1`,
    python: `def sort_colors(arr: list[int]) -> None:
    low, mid, high = 0, 0, len(arr) - 1
    while mid <= high:
        if arr[mid] == 0:
            arr[low], arr[mid] = arr[mid], arr[low]
            low += 1
            mid += 1
        elif arr[mid] == 1:
            mid += 1
        else:
            arr[mid], arr[high] = arr[high], arr[mid]
            high -= 1`,
    typescript: `function sortColors(arr: number[]): void {
  let low = 0, mid = 0, high = arr.length - 1;
  while (mid <= high) {
    if (arr[mid] === 0) {
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      low++; mid++;
    } else if (arr[mid] === 1) {
      mid++;
    } else {
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      high--;
    }
  }
}`,
    cpp: `void sortColors(vector<int>& arr) {
    int low = 0, mid = 0, high = (int)arr.size() - 1;
    while (mid <= high) {
        if (arr[mid] == 0) swap(arr[low++], arr[mid++]);
        else if (arr[mid] == 1) mid++;
        else swap(arr[mid], arr[high--]);
    }
}`,
    java: `void sortColors(int[] arr) {
    int low = 0, mid = 0, high = arr.length - 1;
    while (mid <= high) {
        if (arr[mid] == 0) {
            swap(arr, low++, mid++);
        } else if (arr[mid] == 1) {
            mid++;
        } else {
            swap(arr, mid, high--);
        }
    }
}`,
  },
  generateTimeline: (input: number[]): ExecutionFrame<DutchFlagState>[] => {
    const arr = Array.isArray(input) && input.length > 0
      ? input.map((v) => Math.abs(Math.round(Number(v) || 0)) % 3).slice(0, 14)
      : [...DEFAULT_FLAG];
    const frames: ExecutionFrame<DutchFlagState>[] = [];

    let low = 0;
    let mid = 0;
    let high = arr.length - 1;
    let checkpointAdded = false;

    const push = (
      codeLine: number,
      explanation: string,
      opts: {
        action?: string;
        swappedIndices?: [number, number] | null;
        done?: boolean;
        soundCue?: ExecutionFrame['soundCue'];
        isMilestone?: boolean;
        milestoneTitle?: string;
        conditionEval?: ExecutionFrame['conditionEval'];
        pedagogy?: ExecutionFrame['pedagogy'];
        checkpoint?: ExecutionFrame['checkpoint'];
      } = {}
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine,
        action: opts.action,
        explanation,
        soundCue: opts.soundCue,
        isMilestone: opts.isMilestone,
        milestoneTitle: opts.milestoneTitle,
        conditionEval: opts.conditionEval,
        pedagogy: opts.pedagogy,
        checkpoint: opts.checkpoint,
        invariantStatus: {
          label: `0s:[0..${low - 1}] · 1s:[${low}..${mid - 1}] · ?:[${mid}..${high}] · 2s:[${high + 1}..${arr.length - 1}]`,
          isValid: true,
        },
        callStack: [
          { name: 'sortColors(arr)', params: { low, mid, high }, line: codeLine, isCurrent: true },
        ],
        variables: { low, mid, high, 'arr[mid]': mid <= high ? arr[mid] : 'done' },
        state: {
          array: [...arr],
          low,
          mid,
          high,
          swappedIndices: opts.swappedIndices ?? null,
          done: Boolean(opts.done),
        },
      });
    };

    push(2, `Initialize low = 0, mid = 0, high = ${high}. Entire array [0..${high}] is unclassified.`, {
      action: 'init',
      soundCue: 'start',
      isMilestone: true,
      milestoneTitle: 'Init 3 Pointers',
      pedagogy: {
        what: 'Set low=0 (boundary for 0s), mid=0 (scanner), and high=n-1 (boundary for 2s).',
        why: 'Every step classifies arr[mid] and shrinks the unclassified window [mid..high] by 1.',
        whatNext: `Inspect arr[0] = ${arr[0]}.`,
      },
    });

    while (mid <= high) {
      const val = arr[mid];
      if (val === 0) {
        [arr[low], arr[mid]] = [arr[mid], arr[low]];
        const swapped: [number, number] = [low, mid];
        const prevLow = low;
        const prevMid = mid;
        low++;
        mid++;
        push(5, `arr[${prevMid}] == 0 → swap(arr[${prevLow}], arr[${prevMid}]), then advance low → ${low} and mid → ${mid}.`, {
          action: 'swap',
          swappedIndices: swapped,
          soundCue: 'swap',
          conditionEval: { expr: `arr[${prevMid}] == 0`, result: true },
          pedagogy: {
            what: `Moved 0 into the left 0s partition at index ${prevLow} and advanced both low and mid.`,
            why: 'The element swapped from low is guaranteed to be a 1 (already scanned), so mid can safely advance.',
            whatNext: mid <= high ? `Inspect next unclassified arr[${mid}] = ${arr[mid]}.` : 'Unclassified zone is empty!',
          },
        });
      } else if (val === 1) {
        const prevMid = mid;
        mid++;
        push(8, `arr[${prevMid}] == 1 → already belongs in the middle zone! Simply advance mid → ${mid}.`, {
          action: 'compare',
          soundCue: 'step',
          conditionEval: { expr: `arr[${prevMid}] == 1`, result: true },
          pedagogy: {
            what: `Kept 1 in place at index ${prevMid} and grew the 1s region by advancing mid.`,
            why: '1s sit between low and mid, so no swap is needed.',
            whatNext: mid <= high ? `Inspect arr[${mid}] = ${arr[mid]}.` : 'Unclassified zone is empty!',
          },
        });
      } else {
        const cp = !checkpointAdded
          ? {
              id: 'dnf-swap-2-mid-stays',
              question: `arr[${mid}] == 2 is swapped with arr[${high}]. Should we increment mid right after decrementing high?`,
              options: [
                'No — keep mid where it is to inspect the swapped element',
                'Yes — increment both mid and low',
                'Yes — increment mid only',
              ],
              correctIndex: 0,
              explanation: `The element coming from arr[${high}] was in the unclassified region, so mid must stay to inspect it on the next iteration!`,
            }
          : undefined;
        if (cp) checkpointAdded = true;

        [arr[mid], arr[high]] = [arr[high], arr[mid]];
        const swapped: [number, number] = [mid, high];
        const prevHigh = high;
        high--;
        push(
          10,
          `arr[${mid}] == 2 → swap(arr[${mid}], arr[${prevHigh}]) and shrink high → ${high} (mid stays at ${mid} to inspect new value ${arr[mid]}!).`,
          {
            action: 'swap',
            swappedIndices: swapped,
            soundCue: 'swap',
            isMilestone: cp !== undefined,
            milestoneTitle: `Swap 2 → [${prevHigh}]`,
            conditionEval: { expr: `arr[${mid}] == 2`, result: true },
            checkpoint: cp,
            pedagogy: {
              what: `Placed 2 at the right boundary index ${prevHigh} and decremented high to ${high}.`,
              why: 'We keep mid unchanged because the value swapped in from arr[high] has never been inspected yet.',
              whatNext: mid <= high ? `Re-inspect arr[${mid}] = ${arr[mid]}.` : 'Unclassified zone is empty!',
            },
          }
        );
      }
    }

    push(11, `Partition complete! mid (${mid}) > high (${high}). All 0s, 1s, and 2s are sorted in one O(N) pass: [${arr.join(', ')}].`, {
      action: 'complete',
      done: true,
      soundCue: 'complete',
      isMilestone: true,
      milestoneTitle: '3-Way Partition Complete',
      pedagogy: {
        what: 'Finished single-pass 3-way partition with zero extra space.',
        why: 'When mid crosses high, the unclassified region is empty and all three color zones satisfy the global invariant.',
        whatNext: 'Try the "Reversed Colors" preset to see high-swap behavior.',
      },
    });

    const total = frames.length;
    frames.forEach((f, i) => {
      f.stepIndex = i;
      f.totalSteps = total;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<DutchFlagState>) => {
    const { array, low, mid, high, swappedIndices, done } = frame.state;

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 p-4 select-none">
        {/* 4-Zone Invariant Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
          <div
            style={{ backgroundColor: 'var(--sem-active-bg)', borderColor: 'var(--sem-active-border)', color: 'var(--sem-active-text)' }}
            className="px-3 py-1.5 rounded-lg border text-center font-bold"
          >
            0s Zone · [0..{low - 1}]
          </div>
          <div
            style={{ backgroundColor: 'var(--sem-sorted-bg)', borderColor: 'var(--sem-sorted-border)', color: 'var(--sem-sorted-text)' }}
            className="px-3 py-1.5 rounded-lg border text-center font-bold"
          >
            1s Zone · [{low}..{mid - 1}]
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-dashed border-[#334155] bg-[#111827] text-slate-400 text-center font-bold">
            ? Unknown · [{mid}..{high}]
          </div>
          <div
            style={{ backgroundColor: 'var(--sem-comparing-bg)', borderColor: 'var(--sem-comparing-border)', color: 'var(--sem-comparing-text)' }}
            className="px-3 py-1.5 rounded-lg border text-center font-bold"
          >
            2s Zone · [{high + 1}..{array.length - 1}]
          </div>
        </div>

        {/* Interactive Array Cells with 3-Way Color Coding + Pointers */}
        <div className="rounded-xl bg-[#111827] border border-[#1F293D] p-5 shadow-sm">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap py-4">
            {array.map((val, idx) => {
              const isSwapped = swappedIndices && (swappedIndices[0] === idx || swappedIndices[1] === idx);
              const isUnknown = !done && idx >= mid && idx <= high;
              const style = isSwapped
                ? {
                    backgroundColor: 'var(--sem-swapping-bg)',
                    borderColor: 'var(--sem-swapping-border)',
                    color: 'var(--sem-swapping-text)',
                  }
                : val === 0
                ? {
                    backgroundColor: 'var(--sem-active-bg)',
                    borderColor: 'var(--sem-active-border)',
                    color: 'var(--sem-active-text)',
                  }
                : val === 1
                ? {
                    backgroundColor: 'var(--sem-sorted-bg)',
                    borderColor: 'var(--sem-sorted-border)',
                    color: 'var(--sem-sorted-text)',
                  }
                : {
                    backgroundColor: 'var(--sem-comparing-bg)',
                    borderColor: 'var(--sem-comparing-border)',
                    color: 'var(--sem-comparing-text)',
                  };

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 font-mono">
                  <span className="text-[10px] text-slate-400 tabular-nums">[{idx}]</span>
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                    style={style}
                    className={`w-12 h-14 rounded-xl border-2 flex flex-col items-center justify-center shadow-sm ${
                      isUnknown ? 'opacity-75 border-dashed' : 'opacity-100'
                    }`}
                  >
                    <span className="text-lg font-extrabold leading-none">{val}</span>
                    <span className="text-[8.5px] opacity-80 mt-0.5">
                      {val === 0 ? 'ZERO' : val === 1 ? 'ONE' : 'TWO'}
                    </span>
                  </motion.div>

                  {/* Pointer badges */}
                  <div className="flex flex-col items-center gap-0.5 min-h-[34px]">
                    {idx === low && (
                      <span
                        style={{ backgroundColor: 'var(--sem-active-solid)', color: 'var(--sem-active-on-solid)' }}
                        className="theme-solid-badge px-1.5 py-0.2 rounded text-[8.5px] font-bold"
                      >
                        LOW
                      </span>
                    )}
                    {idx === mid && (
                      <span
                        style={{ backgroundColor: 'var(--sem-pivot-solid)', color: 'var(--sem-pivot-on-solid)' }}
                        className="theme-solid-badge px-1.5 py-0.2 rounded text-[8.5px] font-bold"
                      >
                        MID
                      </span>
                    )}
                    {idx === high && (
                      <span
                        style={{ backgroundColor: 'var(--sem-comparing-solid)', color: 'var(--sem-comparing-on-solid)' }}
                        className="theme-solid-badge px-1.5 py-0.2 rounded text-[8.5px] font-bold"
                      >
                        HIGH
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
