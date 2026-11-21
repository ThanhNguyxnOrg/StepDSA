import { motion } from 'motion/react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface PrefixSumInput {
  array: number[];
  queries: [number, number][];
}

export interface PrefixSumState {
  array: number[];
  prefix: (number | null)[];
  phase: 'build' | 'query' | 'done';
  buildIdx: number | null;
  activeQuery: [number, number] | null;
  queryAnswer: number | null;
  completedQueries: { l: number; r: number; ans: number }[];
}

const DEFAULT_INPUT: PrefixSumInput = {
  array: [3, 1, 4, 1, 5, 9, 2],
  queries: [
    [1, 4],
    [2, 6],
    [0, 3],
  ],
};

export const prefixSumModule: AlgorithmModule<PrefixSumInput, PrefixSumState> = {
  id: 'prefix-sum',
  title: 'Prefix Sum & O(1) Range Queries',
  category: 'arrays-pointers',
  difficulty: 'Beginner',
  defaultInput: DEFAULT_INPUT,
  presets: [
    { id: 'prefix-standard', label: 'Standard Array + 3 Queries', description: '7-element array followed by 3 constant-time range sum queries.', data: DEFAULT_INPUT },
    {
      id: 'prefix-negatives',
      label: 'With Negatives',
      description: 'Demonstrates that prefix sums handle negative numbers seamlessly.',
      data: {
        array: [5, -2, 7, -4, 6, 3],
        queries: [
          [1, 4],
          [0, 5],
        ],
      },
    },
    {
      id: 'prefix-single-full',
      label: 'Single-Element & Full-Range',
      description: 'Tests single-element query [2..2] and full-array query [0..4] using sentinel prefix[0]=0.',
      data: {
        array: [10, 20, 30, 40, 50],
        queries: [
          [2, 2],
          [0, 4],
          [1, 3],
        ],
      },
    },
  ],
  complexity: {
    timeBest: 'O(N + Q)',
    timeAverage: 'O(N + Q)',
    timeWorst: 'O(N + Q)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'One O(N) build sweep followed by O(1) time per range-sum query.',
  },
  theory: {
    overview:
      'Answering Q range sum queries directly takes O(N · Q). By storing prefix[0] = 0 and prefix[i + 1] = prefix[i] + arr[i], any contiguous sum arr[L..R] cancels out its leading prefix in a single subtraction: prefix[R + 1] - prefix[L].',
    whyItWorks:
      'Using a 1-indexed sentinel prefix[0] = 0 makes prefix[k] equal the exact sum of the first k elements, eliminating every special case when L = 0.',
    invariant:
      'prefix[0] == 0 and for every built k, prefix[k] == sum(arr[0..k-1]); rangeSum(L, R) == prefix[R+1] - prefix[L].',
    pitfalls: [
      'Off-by-one error: computing prefix[R] - prefix[L] instead of prefix[R + 1] - prefix[L] omits arr[R].',
      'If elements are updated frequently between queries, use a Fenwick Tree or Segment Tree instead of static Prefix Sums.',
    ],
  },
  relatedModules: [
    { id: 'fenwick-tree', label: 'Fenwick Tree (BIT)' },
    { id: 'segment-tree', label: 'Segment Tree' },
    { id: 'sliding-window-max-sum', label: 'Sliding Window' },
  ],
  codeSnippets: {
    pseudocode: `function buildPrefix(arr):
  prefix = array of size n + 1
  prefix[0] = 0
  for i = 0 to n - 1:
    prefix[i + 1] = prefix[i] + arr[i]
  return prefix

function rangeSum(prefix, L, R):
  // O(1) constant-time subtraction
  return prefix[R + 1] - prefix[L]`,
    python: `def build_prefix(arr: list[int]) -> list[int]:
    prefix = [0] * (len(arr) + 1)
    for i, val in enumerate(arr):
        prefix[i + 1] = prefix[i] + val
    return prefix

def range_sum(prefix: list[int], L: int, R: int) -> int:
    return prefix[R + 1] - prefix[L]`,
    typescript: `function buildPrefix(arr: number[]): number[] {
  const prefix = new Array<number>(arr.length + 1).fill(0);
  for (let i = 0; i < arr.length; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
  }
  return prefix;
}

function rangeSum(prefix: number[], L: number, R: number): number {
  return prefix[R + 1] - prefix[L];
}`,
    cpp: `vector<int> buildPrefix(const vector<int>& arr) {
    vector<int> prefix(arr.size() + 1, 0);
    for (size_t i = 0; i < arr.size(); i++)
        prefix[i + 1] = prefix[i] + arr[i];
    return prefix;
}

int rangeSum(const vector<int>& prefix, int L, int R) {
    return prefix[R + 1] - prefix[L];
}`,
    java: `int[] buildPrefix(int[] arr) {
    int[] prefix = new int[arr.length + 1];
    for (int i = 0; i < arr.length; i++) {
        prefix[i + 1] = prefix[i] + arr[i];
    }
    return prefix;
}

int rangeSum(int[] prefix, int L, int R) {
    return prefix[R + 1] - prefix[L];
}`,
  },
  generateTimeline: (input: PrefixSumInput): ExecutionFrame<PrefixSumState>[] => {
    const arr = Array.isArray(input?.array) && input.array.length > 0
      ? input.array.map((v) => Number(v) || 0).slice(0, 12)
      : DEFAULT_INPUT.array;
    const n = arr.length;
    const rawQueries = Array.isArray(input?.queries) && input.queries.length > 0
      ? input.queries
      : DEFAULT_INPUT.queries;
    const queries: [number, number][] = rawQueries.map(([l, r]) => {
      const cl = Math.max(0, Math.min(n - 1, Number(l) || 0));
      const cr = Math.max(cl, Math.min(n - 1, Number(r) || cl));
      return [cl, cr];
    });

    const prefix: (number | null)[] = new Array(n + 1).fill(null);
    const completedQueries: { l: number; r: number; ans: number }[] = [];
    const frames: ExecutionFrame<PrefixSumState>[] = [];

    const push = (
      codeLine: number,
      explanation: string,
      opts: {
        phase: 'build' | 'query' | 'done';
        action?: string;
        buildIdx?: number | null;
        activeQuery?: [number, number] | null;
        queryAnswer?: number | null;
        soundCue?: ExecutionFrame['soundCue'];
        isMilestone?: boolean;
        milestoneTitle?: string;
        pedagogy?: ExecutionFrame['pedagogy'];
        checkpoint?: ExecutionFrame['checkpoint'];
      }
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
        pedagogy: opts.pedagogy,
        checkpoint: opts.checkpoint,
        invariantStatus: {
          label:
            opts.phase === 'build'
              ? `prefix[k] = sum(arr[0..k-1])`
              : `O(1) Query: prefix[R+1] - prefix[L]`,
          isValid: true,
        },
        callStack: [
          {
            name: opts.phase === 'query' ? 'rangeSum(prefix, L, R)' : 'buildPrefix(arr)',
            params:
              opts.activeQuery
                ? { L: opts.activeQuery[0], R: opts.activeQuery[1] }
                : { i: opts.buildIdx ?? 0 },
            line: codeLine,
            isCurrent: true,
          },
        ],
        variables: {
          n,
          ...(opts.buildIdx !== null && opts.buildIdx !== undefined
            ? { i: opts.buildIdx, 'arr[i]': arr[opts.buildIdx], 'prefix[i+1]': prefix[opts.buildIdx + 1] }
            : {}),
          ...(opts.activeQuery
            ? {
                L: opts.activeQuery[0],
                R: opts.activeQuery[1],
                'prefix[R+1]': prefix[opts.activeQuery[1] + 1],
                'prefix[L]': prefix[opts.activeQuery[0]],
                answer: opts.queryAnswer,
              }
            : {}),
        },
        state: {
          array: [...arr],
          prefix: [...prefix],
          phase: opts.phase,
          buildIdx: opts.buildIdx ?? null,
          activeQuery: opts.activeQuery ?? null,
          queryAnswer: opts.queryAnswer ?? null,
          completedQueries: [...completedQueries],
        },
      });
    };

    prefix[0] = 0;
    push(3, `Initialized sentinel prefix[0] = 0 (sum of 0 elements). Ready for O(N) build sweep.`, {
      phase: 'build',
      action: 'init',
      soundCue: 'start',
      isMilestone: true,
      milestoneTitle: 'Sentinel prefix[0] = 0',
      pedagogy: {
        what: 'Set prefix[0] = 0 as the empty-prefix base case.',
        why: 'With prefix[0] = 0, queries starting at L = 0 work cleanly via prefix[R+1] - prefix[0] with zero if-checks.',
        whatNext: `Compute prefix[1] = prefix[0] + arr[0] = 0 + ${arr[0]}.`,
      },
    });

    for (let i = 0; i < n; i++) {
      prefix[i + 1] = (prefix[i] ?? 0) + arr[i];
      push(
        5,
        `Build prefix[${i + 1}] = prefix[${i}] (${prefix[i]}) + arr[${i}] (${arr[i]}) = ${prefix[i + 1]}.`,
        {
          phase: 'build',
          action: 'insert',
          buildIdx: i,
          soundCue: 'step',
          isMilestone: i === n - 1,
          milestoneTitle: i === n - 1 ? 'Prefix Table Built O(N)' : undefined,
          pedagogy: {
            what: `Accumulated arr[${i}] = ${arr[i]} into prefix[${i + 1}] = ${prefix[i + 1]}.`,
            why: 'Each prefix entry reuses the previous cumulative sum in O(1), keeping total preprocessing O(N).',
            whatNext:
              i < n - 1
                ? `Next: prefix[${i + 2}] = ${prefix[i + 1]} + arr[${i + 1}] (${arr[i + 1]}).`
                : `Now answer range queries in O(1) time!`,
          },
        }
      );
    }

    queries.forEach(([l, r], qIdx) => {
      const rightSum = prefix[r + 1]!;
      const leftSum = prefix[l]!;
      const ans = rightSum - leftSum;
      completedQueries.push({ l, r, ans });

      const cp =
        qIdx === 0
          ? {
              id: 'prefix-first-query',
              question: `To compute sum(arr[${l}..${r}]) in O(1), which subtraction gives the exact answer?`,
              options: [
                `prefix[${r + 1}] (${rightSum}) - prefix[${l}] (${leftSum}) = ${ans}`,
                `prefix[${r}] - prefix[${l}]`,
                `prefix[${r + 1}] + prefix[${l}]`,
              ],
              correctIndex: 0,
              explanation: `prefix[${r + 1}] sums [0..${r}], and subtracting prefix[${l}] removes [0..${l - 1}], leaving exactly [${l}..${r}] = ${ans}.`,
            }
          : undefined;

      push(
        10,
        `O(1) Query sum(arr[${l}..${r}]) = prefix[${r + 1}] (${rightSum}) − prefix[${l}] (${leftSum}) = ${ans}!`,
        {
          phase: 'query',
          action: 'found',
          activeQuery: [l, r],
          queryAnswer: ans,
          soundCue: 'success',
          isMilestone: true,
          milestoneTitle: `Query [${l}..${r}] = ${ans}`,
          checkpoint: cp,
          pedagogy: {
            what: `Evaluated sum(arr[${l}..${r}]) = ${rightSum} - ${leftSum} = ${ans} in a single subtraction.`,
            why: `Subtracting prefix[${l}] cancels out elements [0..${l - 1}], leaving only the highlighted window [${l}..${r}].`,
            whatNext:
              qIdx < queries.length - 1
                ? `Answer next O(1) query [${queries[qIdx + 1][0]}..${queries[qIdx + 1][1]}].`
                : 'All range queries answered!',
          },
        }
      );
    });

    push(10, `All ${queries.length} range-sum queries answered in O(1) each after a single O(N) build!`, {
      phase: 'done',
      action: 'complete',
      soundCue: 'complete',
      isMilestone: true,
      milestoneTitle: 'All Queries Complete',
      pedagogy: {
        what: `Built prefix[] in O(${n}) and answered ${queries.length} queries in O(1) each.`,
        why: 'Prefix sums trade O(N) memory for instant O(1) static range queries.',
        whatNext: 'Try the "With Negatives" preset to see negative values handled identically.',
      },
    });

    const total = frames.length;
    frames.forEach((f, i) => {
      f.stepIndex = i;
      f.totalSteps = total;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<PrefixSumState>) => {
    const { array, prefix, phase, buildIdx, activeQuery, queryAnswer, completedQueries } = frame.state;

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 p-4 select-none">
        {/* Formula Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#111827] border border-[#1F293D] px-4 py-2.5 font-mono text-xs shadow-sm">
          <span className="font-bold text-cyan-400">
            {phase === 'build'
              ? 'PHASE 1: O(N) Build · prefix[i+1] = prefix[i] + arr[i]'
              : activeQuery
              ? `PHASE 2: O(1) Query · sum(${activeQuery[0]}..${activeQuery[1]}) = prefix[${activeQuery[1] + 1}] − prefix[${activeQuery[0]}] = ${queryAnswer}`
              : 'ALL QUERIES COMPLETE · O(N + Q)'}
          </span>
          {completedQueries.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {completedQueries.map((q, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10.5px] font-bold">
                  [{q.l}..{q.r}]={q.ans}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Aligned arr[] + prefix[] Dual Row Visualizer */}
        <div className="rounded-xl bg-[#111827] border border-[#1F293D] p-5 shadow-sm flex flex-col gap-5 overflow-x-auto">
          {/* Original arr[] */}
          <div className="flex items-center gap-2">
            <span className="w-16 text-right font-mono text-[11px] font-bold text-slate-400 shrink-0">
              arr[]
            </span>
            {/* Spacer matching prefix[0] sentinel */}
            <div className="w-12 shrink-0 text-center font-mono text-[10px] text-slate-500 italic">
              sentinel
            </div>
            {array.map((val, idx) => {
              const inQuery = activeQuery && idx >= activeQuery[0] && idx <= activeQuery[1];
              const isBuilding = phase === 'build' && buildIdx === idx;
              const style = inQuery
                ? {
                    backgroundColor: 'var(--sem-sorted-bg)',
                    borderColor: 'var(--sem-sorted-border)',
                    color: 'var(--sem-sorted-text)',
                  }
                : isBuilding
                ? {
                    backgroundColor: 'var(--sem-comparing-bg)',
                    borderColor: 'var(--sem-comparing-border)',
                    color: 'var(--sem-comparing-text)',
                  }
                : {
                    backgroundColor: 'var(--sem-default-cell-bg)',
                    borderColor: 'var(--sem-default-border)',
                    color: 'var(--sem-default-text)',
                  };
              return (
                <div key={idx} className="w-12 shrink-0 flex flex-col items-center gap-1 font-mono">
                  <span className="text-[9.5px] text-slate-400">[{idx}]</span>
                  <div
                    style={style}
                    className="w-12 h-11 rounded-lg border-2 flex items-center justify-center text-sm font-bold tabular-nums transition-colors"
                  >
                    {val}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cumulative prefix[] */}
          <div className="flex items-center gap-2">
            <span className="w-16 text-right font-mono text-[11px] font-bold text-cyan-400 shrink-0">
              prefix[]
            </span>
            {prefix.map((val, pIdx) => {
              const isJustBuilt = phase === 'build' && buildIdx !== null && pIdx === buildIdx + 1;
              const isPrevBuild = phase === 'build' && buildIdx !== null && pIdx === buildIdx;
              const isQueryPlus = activeQuery && pIdx === activeQuery[1] + 1;
              const isQueryMinus = activeQuery && pIdx === activeQuery[0];

              const style = isQueryPlus
                ? {
                    backgroundColor: 'var(--sem-sorted-bg)',
                    borderColor: 'var(--sem-sorted-border)',
                    color: 'var(--sem-sorted-text)',
                  }
                : isQueryMinus
                ? {
                    backgroundColor: 'var(--sem-swapping-bg)',
                    borderColor: 'var(--sem-swapping-border)',
                    color: 'var(--sem-swapping-text)',
                  }
                : isJustBuilt
                ? {
                    backgroundColor: 'var(--sem-active-bg)',
                    borderColor: 'var(--sem-active-border)',
                    color: 'var(--sem-active-text)',
                  }
                : isPrevBuild
                ? {
                    backgroundColor: 'var(--sem-comparing-bg)',
                    borderColor: 'var(--sem-comparing-border)',
                    color: 'var(--sem-comparing-text)',
                  }
                : {
                    backgroundColor: 'var(--sem-default-cell-bg)',
                    borderColor: 'var(--sem-default-border)',
                    color: 'var(--sem-default-text)',
                  };

              return (
                <div key={pIdx} className="w-12 shrink-0 flex flex-col items-center gap-1 font-mono">
                  <motion.div
                    animate={{ scale: isJustBuilt || isQueryPlus || isQueryMinus ? 1.07 : 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                    style={style}
                    className={`w-12 h-11 rounded-lg border-2 flex items-center justify-center text-sm font-bold tabular-nums ${
                      val === null ? 'opacity-35 border-dashed' : ''
                    }`}
                  >
                    {val === null ? '·' : val}
                  </motion.div>
                  <span className="text-[9.5px] text-slate-400">p[{pIdx}]</span>
                  <div className="h-4 flex items-center justify-center">
                    {isQueryPlus && (
                      <span
                        style={{ backgroundColor: 'var(--sem-sorted-solid)', color: 'var(--sem-sorted-on-solid)' }}
                        className="theme-solid-badge px-1 rounded text-[8.5px] font-bold"
                      >
                        +R+1
                      </span>
                    )}
                    {isQueryMinus && (
                      <span
                        style={{ backgroundColor: 'var(--sem-swapping-solid)', color: 'var(--sem-swapping-on-solid)' }}
                        className="theme-solid-badge px-1 rounded text-[8.5px] font-bold"
                      >
                        −L
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
