import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SubsetsState {
  nums: number[];
  currentIndex: number;
  currentSubset: number[];
  action: 'INIT' | 'INCLUDE' | 'EXCLUDE' | 'BACKTRACK' | 'DONE';
  allSubsets: number[][];
}

export const subsetsModule: AlgorithmModule<{ nums: number[] }, SubsetsState> = {
  id: 'subsets',
  title: 'Subsets / Power Set (Include/Exclude Decision Tree O(2^N))',
  category: 'arrays-pointers',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(2^N)',
    timeAverage: 'O(2^N)',
    timeWorst: 'O(2^N)',
    spaceAuxiliary: 'O(N) recursion call stack depth',
    worstCaseCondition: 'A set of N unique elements generates exactly 2^N subsets',
  },
  theory: {
    overview:
      'The Power Set P(S) is the set of all subsets of S, including the empty set and S itself. For |S| = N, there are exactly 2^N subsets.',
    whyItWorks:
      'At each index i from 0 to N - 1, we make a binary branching decision: either INCLUDE nums[i] or EXCLUDE nums[i]. This generates a full binary decision tree of depth N, whose 2^N leaves represent all possible subsets.',
    invariant:
      'State-Space Invariant: At recursion depth d, all items nums[0..d-1] have been decisively committed or excluded, leaving nums[d..N-1] to be branched.',
    pitfalls: [
      'Mutating the subset array in place without slicing/copying when saving to results.',
      'Forgetting to backtrack (pop) the element when unwinding the recursion stack.',
    ],
  },
  presets: [
    {
      id: 'classic-3',
      label: 'Classic 3 Elements: [1, 2, 3] (8 subsets)',
      description: 'Generates all 2^3 = 8 subsets cleanly',
      data: { nums: [1, 2, 3] },
    },
    {
      id: 'two-elements',
      label: 'Small: [10, 20] (4 subsets)',
      description: 'Compact 4-leaf tree',
      data: { nums: [10, 20] },
    },
    {
      id: 'four-elements',
      label: '4 Elements: [1, 2, 3, 4] (16 subsets)',
      description: 'Full binary tree of depth 4 with 16 leaf states',
      data: { nums: [1, 2, 3, 4] },
    },
  ],
  defaultInput: { nums: [1, 2, 3] },
  codeSnippets: {
    cpp: `void backtrack(int index, const vector<int>& nums, vector<int>& current, vector<vector<int>>& result) {
    if (index == nums.size()) {
        result.push_back(current);
        return;
    }
    // Decision 1: Exclude nums[index]
    backtrack(index + 1, nums, current, result);

    // Decision 2: Include nums[index]
    current.push_back(nums[index]);
    backtrack(index + 1, nums, current, result);
    current.pop_back(); // Backtrack
}
vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> result;
    vector<int> current;
    backtrack(0, nums, current, result);
    return result;
}`,
    python: `def subsets(nums: list[int]) -> list[list[int]]:
    result = []
    current = []

    def backtrack(index):
        if index == len(nums):
            result.append(list(current))
            return
        # Branch 1: Exclude nums[index]
        backtrack(index + 1)

        # Branch 2: Include nums[index]
        current.append(nums[index])
        backtrack(index + 1)
        current.pop() # Backtrack

    backtrack(0)
    return result`,
    typescript: `function subsets(nums: number[]): number[][] {
    const result: number[][] = [];
    const current: number[] = [];

    function backtrack(index: number) {
        if (index === nums.length) {
            result.push([...current]);
            return;
        }
        // Exclude
        backtrack(index + 1);

        // Include
        current.push(nums[index]);
        backtrack(index + 1);
        current.pop(); // Backtrack
    }

    backtrack(0);
    return result;
}`,
    java: `void backtrack(int index, int[] nums, List<Integer> current, List<List<Integer>> result) {
    if (index == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }
    // Exclude
    backtrack(index + 1, nums, current, result);

    // Include
    current.add(nums[index]);
    backtrack(index + 1, nums, current, result);
    current.remove(current.size() - 1);
}`,
    pseudocode: `function generateSubsets(nums):
    result = []
    function backtrack(index, current):
        if index == length(nums):
            result.append(copy(current))
            return
        backtrack(index + 1, current) # Exclude
        current.append(nums[index])
        backtrack(index + 1, current) # Include
        current.pop() # Backtrack
    backtrack(0, [])
    return result`,
  },

  generateTimeline: (input: { nums: number[] }): ExecutionFrame<SubsetsState>[] => {
    const raw = input.nums?.length ? input.nums : [1, 2, 3];
    const nums = raw.slice(0, 4);
    const n = nums.length;
    const totalSubsetsCount = Math.pow(2, n);

    const allSubsets: number[][] = [];
    const current: number[] = [];
    const frames: ExecutionFrame<SubsetsState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Power Set generation for [${nums.join(', ')}]. Total expected subsets: 2^${n} = ${totalSubsetsCount}.`,
      variables: { inputLength: n, totalSubsetsExpected: totalSubsetsCount },
      callStack: [{ name: 'subsets()', params: { n }, line: 2, isCurrent: true }],
      state: {
        nums,
        currentIndex: 0,
        currentSubset: [],
        action: 'INIT',
        allSubsets: [],
      },
    });

    function backtrack(idx: number) {
      if (idx === n) {
        allSubsets.push([...current]);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `Leaf reached! Completed subset #${allSubsets.length}: [${current.join(', ')} || 'Ø'].`,
          variables: {
            leafDepth: idx,
            subsetFound: `[${current.join(', ')}]`,
            subsetsCollected: `${allSubsets.length}/${totalSubsetsCount}`,
          },
          callStack: [
            { name: `backtrack(idx=${idx}) [LEAF]`, params: { subset: `[${current.join(', ')}]` }, line: 4, isCurrent: true },
          ],
          state: {
            nums,
            currentIndex: idx,
            currentSubset: [...current],
            action: 'INCLUDE',
            allSubsets: allSubsets.map((s) => [...s]),
          },
        });
        return;
      }

      // Branch 1: Exclude nums[idx]
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Index ${idx} (value ${nums[idx]}): Branch 1 -> EXCLUDE ${nums[idx]} from current subset.`,
        variables: {
          index: idx,
          value: nums[idx],
          decision: 'EXCLUDE',
          subset: `[${current.join(', ')}]`,
        },
        callStack: [
          { name: `backtrack(idx=${idx}) -> EXCLUDE ${nums[idx]}`, params: { idx }, line: 8, isCurrent: true },
        ],
        state: {
          nums,
          currentIndex: idx,
          currentSubset: [...current],
          action: 'EXCLUDE',
          allSubsets: allSubsets.map((s) => [...s]),
        },
      });

      backtrack(idx + 1);

      // Branch 2: Include nums[idx]
      current.push(nums[idx]);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 11,
        explanation: `Index ${idx} (value ${nums[idx]}): Branch 2 -> INCLUDE ${nums[idx]} into current subset.`,
        variables: {
          index: idx,
          value: nums[idx],
          decision: 'INCLUDE',
          subset: `[${current.join(', ')}]`,
        },
        callStack: [
          { name: `backtrack(idx=${idx}) -> INCLUDE ${nums[idx]}`, params: { idx }, line: 11, isCurrent: true },
        ],
        state: {
          nums,
          currentIndex: idx,
          currentSubset: [...current],
          action: 'INCLUDE',
          allSubsets: allSubsets.map((s) => [...s]),
        },
      });

      backtrack(idx + 1);

      // Backtrack
      current.pop();
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 13,
        explanation: `Backtrack from index ${idx}: Popped ${nums[idx]} to restore subset state for prior callers.`,
        variables: {
          index: idx,
          poppedValue: nums[idx],
          restoredSubset: `[${current.join(', ')}]`,
        },
        callStack: [
          { name: `backtrack(idx=${idx}) [UNWIND]`, params: { popped: nums[idx] }, line: 13, isCurrent: true },
        ],
        state: {
          nums,
          currentIndex: idx,
          currentSubset: [...current],
          action: 'BACKTRACK',
          allSubsets: allSubsets.map((s) => [...s]),
        },
      });
    }

    backtrack(0);

    // Final Completion Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      explanation: `All 2^${n} = ${totalSubsetsCount} subsets generated successfully!`,
      variables: {
        totalSubsets: allSubsets.length,
      },
      callStack: [{ name: 'complete()', params: { totalSubsets: allSubsets.length }, line: 16, isCurrent: true }],
      state: {
        nums,
        currentIndex: n,
        currentSubset: [],
        action: 'DONE',
        allSubsets: allSubsets.map((s) => [...s]),
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<SubsetsState>) => {
    const { nums, currentIndex, currentSubset, action, allSubsets } = frame.state;
    const n = nums.length;
    const totalExpected = Math.pow(2, n);

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Input Set: <strong className="text-white">[{nums.join(', ')}]</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Power Set Size: <strong className="text-white">2^{n} = {totalExpected}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Found:</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/50">
              {allSubsets.length} / {totalExpected}
            </span>
          </div>
        </div>

        {/* Current State / Decision Visualizer */}
        <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Element Selection Chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">Elements:</span>
            {nums.map((val, idx) => {
              const isCurrent = idx === currentIndex;
              const isIncluded = currentSubset.includes(val);
              return (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-sm border transition-all duration-200 ${
                    isCurrent
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 scale-110 shadow-lg shadow-cyan-500/20'
                      : isIncluded
                      ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                      : 'border-slate-800 bg-slate-900 text-slate-500'
                  }`}
                >
                  <span>{val}</span>
                  <span className="text-[9px] text-slate-500 font-normal">i={idx}</span>
                </div>
              );
            })}
          </div>

          {/* Current Accumulator Subset */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Active Subset:</span>
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-800/80 text-cyan-300 font-mono text-sm font-bold flex items-center gap-1 shadow-md">
              <span>[</span>
              <span>{currentSubset.length > 0 ? currentSubset.join(', ') : 'Ø'}</span>
              <span>]</span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                action === 'INCLUDE'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : action === 'EXCLUDE'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {action}
            </span>
          </div>
        </div>

        {/* Committed Subsets Grid */}
        <div className="w-full overflow-y-auto max-h-56 p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl my-auto">
          <div className="text-xs font-mono text-slate-400 mb-3 font-bold flex items-center justify-between">
            <span>Discovered Subsets ({allSubsets.length})</span>
            <span className="text-[10px] text-slate-500">Each leaf represents a distinct subset</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {allSubsets.map((sub, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center font-mono text-xs text-emerald-400 font-bold hover:border-emerald-500/40 transition-all duration-150"
              >
                {sub.length === 0 ? 'Ø' : `[${sub.join(', ')}]`}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};
