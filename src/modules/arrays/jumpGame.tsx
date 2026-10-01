import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface JumpGameState {
  nums: number[];
  currentIndex: number;
  maxReach: number;
  canReach: boolean;
  status: 'scanning' | 'stuck' | 'success';
}

export const jumpGameModule: AlgorithmModule<number[], JumpGameState> = {
  id: 'jump-game',
  title: 'Jump Game (Greedy Maximum Reachable Frontier)',
  category: 'arrays-pointers',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Scans through all elements to either verify or fail at last index',
  },
  theory: {
    overview:
      'Given an array of non-negative integers nums where each element represents your maximum jump length from that position, determine if you can reach the last index starting from index 0.',
    whyItWorks:
      'A Greedy strategy tracks the farthest reachable index (maxReach). For every index i <= maxReach, we update maxReach = max(maxReach, i + nums[i]). If at any point maxReach >= lastIndex, success is guaranteed. If we ever encounter an index i > maxReach, we are stuck and can never progress further.',
    invariant:
      'Greedy Invariant: Every index k <= maxReach is reachable from index 0.',
    pitfalls: [
      'Zero trapping: elements with value 0 stop forward progress if maxReach cannot jump over them.',
      'Checking i > maxReach before updating maxReach.',
    ],
  },
  presets: [
    {
      id: 'multi-step-reach',
      label: 'Multi-Step Frontier Expansion',
      description: '[2, 1, 2, 1, 0, 2, 1, 4] -> Step-by-step frontier advancement to goal',
      data: [2, 1, 2, 1, 0, 2, 1, 4],
    },
    {
      id: 'reachable-short',
      label: 'Standard Path [2, 3, 1, 1, 4]',
      description: 'Quick leap over intermediate indices',
      data: [2, 3, 1, 1, 4],
    },
    {
      id: 'trapped-zero',
      label: 'Trapped by Zero Barrier [3, 2, 1, 0, 4]',
      description: 'Frontier maxReach stops at index 3, unable to bridge index 4',
      data: [3, 2, 1, 0, 4],
    },
  ],
  defaultInput: [2, 1, 2, 1, 0, 2, 1, 4],
  codeSnippets: {
    python: `def can_jump(nums):
    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + jump)
        if max_reach >= len(nums) - 1:
            return True
    return True`,
    typescript: `function canJump(nums: number[]): boolean {
  let maxReach = 0;
  for (let i = 0; i < nums.length; ++i) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
    if (maxReach >= nums.length - 1) return true;
  }
  return true;
}`,
    cpp: `bool canJump(const vector<int>& nums) {
    int maxReach = 0;
    for (int i = 0; i < nums.size(); ++i) {
        if (i > maxReach) return false;
        maxReach = max(maxReach, i + nums[i]);
        if (maxReach >= nums.size() - 1) return true;
    }
    return true;
}`,
    java: `public boolean canJump(int[] nums) {
    int maxReach = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > maxReach) return false;
        maxReach = Math.max(maxReach, i + nums[i]);
        if (maxReach >= nums.length - 1) return true;
    }
    return true;
}`,
    pseudocode: `function canJump(nums):
    maxReach <- 0
    for i from 0 to length(nums) - 1:
        if i > maxReach: return false
        maxReach <- max(maxReach, i + nums[i])
        if maxReach >= length(nums) - 1: return true
    return true`,
  },
  generateTimeline: (input: number[]) => {
    const nums = input?.length > 0 ? input : [2, 1, 2, 1, 0, 2, 1, 4];
    const n = nums.length;
    let maxReach = 0;
    const frames: ExecutionFrame<JumpGameState>[] = [];

    const callStack = [{ name: 'canJump', params: { n, targetIndex: n - 1 }, line: 2, isCurrent: true }];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      callStack,
      variables: { currentIndex: 0, maxReach: 0, targetIndex: n - 1, totalLength: n },
      explanation: `Initialized Jump Game with array [${nums.join(', ')}]. Destination is index ${
        n - 1
      }. Starting frontier maxReach = 0.`,
      state: {
        nums: [...nums],
        currentIndex: 0,
        maxReach: 0,
        canReach: false,
        status: 'scanning',
      },
    });

    for (let i = 0; i < n; ++i) {
      // Step 1: Reachability check
      const isReachable = i <= maxReach;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        action: 'CHECK_REACHABILITY',
        callStack,
        conditionEval: {
          expr: `i (${i}) <= maxReach (${maxReach})`,
          result: isReachable,
        },
        variables: { currentIndex: i, 'nums[i]': nums[i], maxReach, isReachable },
        explanation: isReachable
          ? `Inspecting index ${i} (value ${nums[i]}): index is within current frontier (${i} <= ${maxReach}). Valid position to jump from.`
          : `Barrier violation! Index ${i} > maxReach (${maxReach}). Cannot advance further!`,
        state: {
          nums: [...nums],
          currentIndex: i,
          maxReach,
          canReach: false,
          status: isReachable ? 'scanning' : 'stuck',
        },
      });

      if (!isReachable) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          action: 'STUCK_TERMINATE',
          isMilestone: true,
          milestoneTitle: `Stuck at Barrier Index ${i}`,
          callStack,
          variables: { stuckIndex: i, maxReach, result: false },
          explanation: `❌ Trapped! Current index ${i} exceeds maximum reachable frontier (${maxReach}). The last index ${n - 1} is unreachable. Returning false.`,
          state: {
            nums: [...nums],
            currentIndex: i,
            maxReach,
            canReach: false,
            status: 'stuck',
          },
        });
        const total = frames.length;
        return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
      }

      const potentialReach = i + nums[i];
      const prevMax = maxReach;
      const expands = potentialReach > maxReach;
      maxReach = Math.max(maxReach, potentialReach);

      // Step 2: Jump potential inspection
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        action: 'UPDATE_MAX_REACH',
        isMilestone: expands,
        milestoneTitle: expands ? `Frontier Extended: maxReach = ${maxReach}` : undefined,
        callStack,
        variables: {
          currentIndex: i,
          jumpPower: nums[i],
          potentialReach,
          prevMax,
          newMaxReach: maxReach,
          frontierExpanded: expands,
        },
        explanation: expands
          ? `From index ${i}, jump length ${nums[i]} gives reach = ${i} + ${nums[i]} = ${potentialReach}. Frontier expands from ${prevMax} to ${maxReach}!`
          : `From index ${i}, jump reach ${i} + ${nums[i]} = ${potentialReach} does not exceed current frontier (${maxReach}). Frontier unchanged.`,
        state: {
          nums: [...nums],
          currentIndex: i,
          maxReach,
          canReach: maxReach >= n - 1,
          status: maxReach >= n - 1 ? 'success' : 'scanning',
        },
      });

      // Step 3: Check goal reached
      if (maxReach >= n - 1) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          action: 'GOAL_REACHED',
          isMilestone: true,
          milestoneTitle: `Goal Reachable! maxReach (${maxReach}) >= ${n - 1}`,
          callStack,
          conditionEval: {
            expr: `maxReach (${maxReach}) >= lastIndex (${n - 1})`,
            result: true,
          },
          variables: { currentIndex: i, maxReach, lastIndex: n - 1, result: true },
          explanation: `🎯 Destination reached! Frontier maxReach (${maxReach}) reaches or surpasses last index ${
            n - 1
          }! Returning true.`,
          state: {
            nums: [...nums],
            currentIndex: i,
            maxReach,
            canReach: true,
            status: 'success',
          },
        });
        const total = frames.length;
        return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      action: 'COMPLETE',
      explanation: 'Scanned all elements. Destination reached!',
      isMilestone: true,
      milestoneTitle: 'Finished',
      state: {
        nums: [...nums],
        currentIndex: n - 1,
        maxReach,
        canReach: true,
        status: 'success',
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<JumpGameState>) => {
    const { nums, currentIndex, maxReach, status } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* HUD */}
        <div className="flex items-center gap-4 mb-8">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Current Index: <span className="text-amber-400 font-bold">{currentIndex}</span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Max Reach Frontier: <span className="text-cyan-400 font-bold">{maxReach}</span>
          </div>
          <div
            className={`px-3 py-1 rounded text-xs font-mono font-bold border ${
              status === 'success'
                ? 'border-emerald-500 bg-emerald-950 text-emerald-300 animate-pulse'
                : status === 'stuck'
                ? 'border-rose-500 bg-rose-950 text-rose-300 animate-pulse'
                : 'border-blue-500 bg-slate-900 text-blue-300'
            }`}
          >
            {status === 'success'
              ? '✓ CAN REACH END'
              : status === 'stuck'
              ? '✗ TRAPPED (CANNOT ADVANCE)'
              : 'SCANNING...'}
          </div>
        </div>

        {/* Array Bars with Reach Highlights */}
        <div className="flex items-end justify-center gap-3 max-w-3xl w-full p-6 bg-slate-950/70 border border-slate-800 rounded-3xl">
          {nums.map((val, idx) => {
            const isCurrent = idx === currentIndex;
            const isReachable = idx <= maxReach;
            const isGoal = idx === nums.length - 1;

            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">#{idx}</span>
                <div
                  className={`w-16 h-20 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-xl border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-950/80 text-amber-200 ring-4 ring-amber-400/40 scale-105'
                      : isReachable
                      ? 'border-cyan-400/60 bg-cyan-950/40 text-cyan-200'
                      : 'border-slate-800 bg-slate-900/30 text-slate-600'
                  }`}
                >
                  <span>{val}</span>
                  <span className="text-[9px] text-slate-400 font-normal">
                    {isGoal ? 'GOAL' : `+${val} jump`}
                  </span>
                </div>
                {idx === maxReach && (
                  <span className="text-[8px] font-mono font-bold bg-cyan-950 border border-cyan-500 text-cyan-300 px-1 py-0.5 rounded">
                    FRONTIER
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
