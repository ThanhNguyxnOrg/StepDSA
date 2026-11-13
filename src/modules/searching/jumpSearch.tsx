import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const jumpSearchModule: AlgorithmModule<{ array: number[]; target: number }, ArrayStageState> = {
  id: 'jump-search',
  title: 'Jump Search (Block Hopping O(√N))',
  category: 'searching',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(√N)',
    timeWorst: 'O(√N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Target is at the end of the last block or just greater than the last element',
  },
  theory: {
    overview:
      'Jump Search checks fewer elements than linear search by jumping ahead by fixed blocks of size √N, then performing a linear search within the identified block.',
    whyItWorks:
      'Because the array is sorted, if arr[step] < target, the target cannot exist in arr[0...step]. By skipping √N elements per hop, we only need at most √N hops and √N comparisons.',
    invariant:
      'Block Invariant: If target exists, it must reside in the range [prev ... min(step, N-1)].',
    pitfalls: [
      'Array must be sorted before search.',
      'Optimal block step size is strictly √N; choosing N/2 degrades to linear or poor branching.',
      'Must guard against indexing beyond array length (min(step, N - 1)).',
    ],
  },
  presets: [
    {
      id: 'target-found',
      label: 'Find 55 (Middle-Right)',
      description: 'Standard jump hops then linear scan',
      data: { array: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610], target: 55 },
    },
    {
      id: 'target-early',
      label: 'Find 2 (First Block)',
      description: 'Jump halts immediately at first block',
      data: { array: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610], target: 2 },
    },
    {
      id: 'target-absent',
      label: 'Target Absent (Find 50)',
      description: 'Linear scan exhausts block without finding target',
      data: { array: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610], target: 50 },
    },
  ],
  defaultInput: { array: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610], target: 55 },
  codeSnippets: {
    python: `import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.isqrt(n))
    prev = 0
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.isqrt(n))
        if prev >= n:
            return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
    if arr[prev] == target:
        return prev
    return -1`,
    typescript: `function jumpSearch(arr: number[], target: number): number {
  const n = arr.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }
  if (arr[prev] === target) return prev;
  return -1;
}`,
    cpp: `int jumpSearch(const vector<int>& arr, int target) {
    int n = arr.size();
    int step = sqrt(n);
    int prev = 0;
    while (arr[min(step, n) - 1] < target) {
        prev = step;
        step += sqrt(n);
        if (prev >= n) return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == min(step, n)) return -1;
    }
    if (arr[prev] == target) return prev;
    return -1;
}`,
    java: `public int jumpSearch(int[] arr, int target) {
    int n = arr.length;
    int step = (int) Math.floor(Math.sqrt(n));
    int prev = 0;
    while (arr[Math.min(step, n) - 1] < target) {
        prev = step;
        step += (int) Math.floor(Math.sqrt(n));
        if (prev >= n) return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == Math.min(step, n)) return -1;
    }
    if (arr[prev] == target) return prev;
    return -1;
}`,
    pseudocode: `function jumpSearch(arr, target):
    n <- length(arr)
    step <- floor(sqrt(n))
    prev <- 0
    while arr[min(step, n) - 1] < target:
        prev <- step
        step <- step + floor(sqrt(n))
        if prev >= n: return -1
    while arr[prev] < target:
        prev <- prev + 1
        if prev == min(step, n): return -1
    if arr[prev] == target: return prev
    return -1`,
  },
  generateTimeline: (input) => {
    const arr = [...input.array].sort((a, b) => a - b);
    const target = input.target;
    const n = arr.length;
    const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));
    let step = blockSize;
    let prev = 0;

    const frames: ExecutionFrame<ArrayStageState>[] = [];
    let checkpointAdded = false;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Initialized Jump Search on array of size ${n}. Optimal jump block size m = floor(√${n}) = ${blockSize}. Target is ${target}.`,
      isMilestone: true,
      milestoneTitle: 'Initialized Jump Search',
      soundCue: { type: 'start' },
      callStack: [
        { name: 'jumpSearch(arr, target)', params: { n, blockSize, target }, line: 3, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { n, blockSize, target, prev: 0, step },
      conditionEval: { expr: `target (${target}) >= arr[0] (${arr[0]})`, result: target >= arr[0] },
      pedagogy: {
        what: `Jump search works on sorted data in two phases: hop over blocks of size m, then linearly scan the one block that can contain the target.`,
        why: `With m = ⌊√${n}⌋ ≈ ${blockSize}, there are about ${Math.ceil(n / blockSize)} hops and at most ${blockSize} scans — minimizing hops + scan gives m ≈ √N, hence O(√N).`,
        whatNext: `Check the first block boundary arr[${Math.min(step, n) - 1}] = ${arr[Math.min(step, n) - 1]} against target ${target}.`,
      },
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: 'default' })),
        pointers: { prev: 0, step: Math.min(step, n) - 1 },
        target,
      },
    });

    // Initial check of optimal step size and first block boundary
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Calculated jump step parameter: block size m = √${n} ≈ ${blockSize}. Evaluating first block [0..${Math.min(step, n) - 1}].`,
      soundCue: { type: 'step' },
      callStack: [
        { name: 'jumpSearch(arr, target)', params: { blockSize, firstBoundary: Math.min(step, n) - 1 }, line: 3, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { blockSize, firstBlockEnd: Math.min(step, n) - 1, target },
      conditionEval: { expr: `blockSize > 0`, result: true },
      pedagogy: {
        what: `Block size fixed at m = ${blockSize}; the first block covers [0..${Math.min(step, n) - 1}].`,
        why: 'A block that is too small causes too many hops; too large makes the final linear scan expensive — √N balances both.',
        whatNext: 'Test whether the target is larger than the last value of this block.',
      },
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: i < blockSize ? 'active' : 'default' })),
        pointers: { prev: 0, step: Math.min(step, n) - 1 },
        target,
      },
    });

    // Block hopping phase
    let hopCount = 1;
    while (arr[Math.min(step, n) - 1] < target) {
      const checkIdx = Math.min(step, n) - 1;
      const boundaryVal = arr[checkIdx];

      // Sub-step A: Check block boundary
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `[Hop ${hopCount}] Inspecting boundary arr[${checkIdx}] = ${boundaryVal}. Checking ${boundaryVal} < ${target}.`,
        soundCue: { type: 'compare' },
        callStack: [
          { name: 'jumpSearch(arr, target)', params: { hop: hopCount, checkIdx, boundaryVal }, line: 5, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { hop: hopCount, checkIdx, 'arr[checkIdx]': boundaryVal, target, blockSize },
        conditionEval: { expr: `arr[${checkIdx}] (${boundaryVal}) < target (${target})`, result: true },
        pedagogy: {
          what: `Hop ${hopCount}: compare the block's last value ${boundaryVal} at index ${checkIdx} with target ${target}.`,
          why: 'A block whose maximum is smaller than the target cannot contain it — the whole block is skippable in one comparison.',
          whatNext: `${boundaryVal} < ${target}, so skip block [${prev}..${checkIdx}] and jump forward.`,
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'jump-search-block-skip',
              question: `Boundary arr[${checkIdx}] = ${boundaryVal} < target ${target}. What does jump search do next?`,
              options: [
                `Skip block [${prev}..${checkIdx}] and jump prev to ${step}`,
                `Scan [${prev}..${checkIdx}] linearly anyway`,
              ],
              correctIndex: 0,
              explanation:
                'Sorted order guarantees every value in the block is ≤ the boundary, so all of it is below the target — one jump replaces a linear scan.',
            }
          : undefined,
        state: {
          array: arr.map((v, i) => ({
            id: i,
            value: v,
            status: i < checkIdx ? 'discarded' : i === checkIdx ? 'comparing' : 'default',
          })),
          pointers: { prev, checkIdx },
          target,
        },
      });
      checkpointAdded = true;

      // Sub-step B: Jump forward
      const oldPrev = prev;
      prev = step;
      step += blockSize;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `[Hop ${hopCount}] Boundary ${boundaryVal} < target (${target}). Skipping block [${oldPrev}..${checkIdx}]. Advance prev -> ${prev}, next step -> ${Math.min(step, n) - 1}.`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'jumpSearch(arr, target)', params: { prev, nextStep: step }, line: 6, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { oldPrev, newPrev: prev, nextBoundary: Math.min(step, n) - 1 },
        pedagogy: {
          what: `Block [${oldPrev}..${checkIdx}] is discarded in one step; prev becomes ${prev}.`,
          why: `All ${checkIdx - oldPrev + 1} values in that block are ≤ ${boundaryVal} < ${target}, so scanning them would be wasted work.`,
          whatNext: `Test the next block boundary at index ${Math.min(step, n) - 1}.`,
        },
        state: {
          array: arr.map((v, i) => ({
            id: i,
            value: v,
            status: i < prev ? 'discarded' : 'default',
          })),
          pointers: { prev, step: Math.min(step, n) - 1 },
          target,
        },
      });

      hopCount++;

      if (prev >= n) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `Jumped beyond array bounds (prev = ${prev} >= ${n}). Target ${target} is not in array. Returning -1.`,
          soundCue: { type: 'complete' },
          callStack: [{ name: 'jumpSearch(arr, target)', params: { prev, n }, line: 8, isCurrent: true }],
          variables: { prev, n, notFound: true },
          conditionEval: { expr: `prev (${prev}) >= n (${n})`, result: true },
          pedagogy: {
            what: `prev = ${prev} left the array (n = ${n}) — there is no block left to inspect.`,
            why: 'The hop phase already proved every earlier block max < target, and no later block exists.',
            whatNext: 'Return −1; the target is absent.',
          },
          state: {
            array: arr.map((v, i) => ({ id: i, value: v, status: 'discarded' })),
            pointers: {},
            target,
          },
        });
        const total = frames.length;
        return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
      }
    }

    const boundaryIdx = Math.min(step, n) - 1;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 5,
      explanation: `Target block bounded! arr[${boundaryIdx}] = ${arr[boundaryIdx]} >= ${target}. Target must lie in [${prev}..${boundaryIdx}]. Starting linear search.`,
      isMilestone: true,
      milestoneTitle: 'Target Block Located',
      soundCue: { type: 'compare' },
      callStack: [
        { name: 'linearScan(prev, boundary)', params: { prev, boundaryIdx }, line: 5, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { blockStart: prev, blockEnd: boundaryIdx, target },
      conditionEval: { expr: `arr[${boundaryIdx}] (${arr[boundaryIdx]}) >= target (${target})`, result: true },
      pedagogy: {
        what: `The first boundary ≥ target is at index ${boundaryIdx}, so the target can only be in [${prev}..${boundaryIdx}] — at most ${boundaryIdx - prev + 1} elements.`,
        why: 'The previous block ended below the target, and this block ends at or above it; sorted order confines the answer to exactly this block.',
        whatNext: `Scan [${prev}..${boundaryIdx}] linearly from the left.`,
      },
      state: {
        array: arr.map((v, i) => ({
          id: i,
          value: v,
          status: i >= prev && i <= boundaryIdx ? 'active' : 'discarded',
        })),
        pointers: { prev, boundaryIdx },
        target,
      },
    });

    // Linear scan within block
    while (arr[prev] < target) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 10,
        explanation: `Linear scan: arr[${prev}] = ${arr[prev]} < target (${target}). Discarding index ${prev}, incrementing prev -> ${prev + 1}.`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'linearScan()', params: { prev, 'arr[prev]': arr[prev] }, line: 10, isCurrent: true },
        ],
        variables: { prev, 'arr[prev]': arr[prev], target },
        conditionEval: { expr: `arr[${prev}] < target (${target})`, result: true },
        pedagogy: {
          what: `Inside the candidate block, arr[${prev}] = ${arr[prev]} is below the target.`,
          why: 'Within a block we must check elements one by one — jumping is no longer safe because the target could be any of them.',
          whatNext: `Move to index ${prev + 1}; at most ${boundaryIdx - prev} scan(s) remain in this block.`,
        },
        state: {
          array: arr.map((v, i) => ({
            id: i,
            value: v,
            status: i === prev ? 'comparing' : i > prev && i <= boundaryIdx ? 'active' : 'discarded',
          })),
          pointers: { prev },
          target,
        },
      });
      prev++;
      if (prev === Math.min(step, n)) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Reached end of block boundary without finding ${target}. Target is absent. Returning -1.`,
          soundCue: { type: 'complete' },
          callStack: [{ name: 'linearScan()', params: { prev, terminated: true }, line: 11, isCurrent: true }],
          variables: { prev, notFound: true },
          conditionEval: { expr: `prev == min(step, n)`, result: true },
          pedagogy: {
            what: `The scan reached the block end (${prev} = min(step, n)) without a match.`,
            why: 'The block was the only possible location, and every element in it is now ruled out.',
            whatNext: 'Return −1; no further block can contain the target.',
          },
          state: {
            array: arr.map((v, i) => ({ id: i, value: v, status: 'discarded' })),
            pointers: { prev },
            target,
          },
        });
        const total = frames.length;
        return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: `Evaluating candidate at end of linear scan: arr[${prev}] = ${arr[prev]}. Comparing with target ${target}.`,
      soundCue: { type: 'compare' },
      callStack: [{ name: 'jumpSearch(arr, target)', params: { prev, val: arr[prev], target }, line: 12, isCurrent: true }],
      variables: { prev, 'arr[prev]': arr[prev], target },
      conditionEval: { expr: `arr[${prev}] === ${target}`, result: arr[prev] === target },
      pedagogy: {
        what: `The scan stopped at arr[${prev}] = ${arr[prev]} because it is not below the target.`,
        why: 'Sorted order means the scan can stop at the first value ≥ target: if it is not equal, the target is absent.',
        whatNext: arr[prev] === target ? 'It matches — report this index.' : 'It overshoots — report not found.',
      },
      state: {
        array: arr.map((v, i) => ({
          id: i,
          value: v,
          status: i === prev ? 'comparing' : 'default',
        })),
        pointers: { prev },
        target,
      },
    });

    if (arr[prev] === target) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        explanation: `🎉 MATCH FOUND! arr[${prev}] == ${target}. Target found in O(√N) time!`,
        isMilestone: true,
        milestoneTitle: `Target Found at [${prev}]`,
        soundCue: { type: 'sorted' },
        callStack: [
          { name: 'jumpSearch(arr, target)', params: { foundAt: prev }, line: 12, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { resultIndex: prev, target, totalHops: hopCount },
        conditionEval: { expr: `arr[${prev}] == target (${target})`, result: true },
        pedagogy: {
          what: `arr[${prev}] equals the target — found at index ${prev}.`,
          why: `Only ${hopCount} hop(s) plus a short block scan were needed, versus up to ${n} checks in linear search.`,
          whatNext: 'Return prev.',
        },
        state: {
          array: arr.map((v, i) => ({
            id: i,
            value: v,
            status: i === prev ? 'sorted' : 'default',
          })),
          pointers: { found: prev },
          target,
        },
      });
    } else {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 13,
        explanation: `arr[${prev}] = ${arr[prev]} > ${target}. Target is not in the array. Returning -1.`,
        soundCue: { type: 'complete' },
        callStack: [{ name: 'jumpSearch(arr, target)', params: { returnVal: -1 }, line: 13, isCurrent: true }],
        variables: { result: -1, prev, 'arr[prev]': arr[prev] },
        conditionEval: { expr: `arr[${prev}] == target`, result: false },
        pedagogy: {
          what: `The first value ≥ target (${arr[prev]}) is strictly greater than ${target}, so no exact match exists.`,
          why: 'Every earlier block was below the target and every later value is ≥ this one — the gap proves absence.',
          whatNext: 'Return −1.',
        },
        state: {
          array: arr.map((v, i) => ({ id: i, value: v, status: 'discarded' })),
          pointers: { prev },
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
