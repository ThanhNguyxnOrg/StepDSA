import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface PermCombState {
  mode: 'permutations' | 'combinations';
  elements: string[];
  k: number;
  currentPath: string[];
  used: boolean[];
  results: string[][];
  activeCandidate: string | null;
  message: string;
}

export const permutationsCombinationsModule: AlgorithmModule<
  { mode: 'permutations' | 'combinations'; elements: string[]; k: number },
  PermCombState
> = {
  id: 'permutations-combinations',
  title: 'Permutations & Combinations Generator (State-Space Exploration)',
  category: 'math',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(k * P(N, k)) or O(k * C(N, k))',
    timeAverage: 'O(k * P(N, k)) or O(k * C(N, k))',
    timeWorst: 'O(N! / (N - k)!) for Permutations; O(N! / (k!(N - k)!)) for Combinations',
    spaceAuxiliary: 'O(k) recursion depth call stack',
    worstCaseCondition: 'k = N generating all N! complete permutations or k = N/2 maximizing combinations',
  },
  theory: {
    overview:
      'Permutations generate all ordered sequences of length k from N elements (where order matters: AB != BA). Combinations generate all unordered subsets of size k (where order does not matter: AB == BA).',
    whyItWorks:
      'Both explore a decision tree via depth-first backtracking. Permutations track a visited/used boolean mask, branching across all unused elements at each step. Combinations enforce monotonic index ordering (start index i + 1) to eliminate duplicate permutations.',
    invariant:
      'Lexicographic Backtracking Invariant: Path length == k triggers a leaf recording milestone. Every explored sub-branch is symmetrically restored upon return (path.pop(), used[i] = false).',
    pitfalls: [
      'Combinations: starting the loop at 0 instead of startIdx duplicates permutations as combinations.',
      'Permutations: forgetting to unset the used[i] boolean flag upon backtrack.',
    ],
  },
  defaultInput: {
    mode: 'permutations',
    elements: ['A', 'B', 'C'],
    k: 2,
  },
  presets: [
    {
      id: 'perm-3-2',
      label: 'Permutations P(3, 2) = 6',
      description: 'Ordered pairs selected from {A, B, C}',
      data: {
        mode: 'permutations',
        elements: ['A', 'B', 'C'],
        k: 2,
      },
    },
    {
      id: 'comb-4-2',
      label: 'Combinations C(4, 2) = 6',
      description: 'Unordered pairs selected from {A, B, C, D}',
      data: {
        mode: 'combinations',
        elements: ['A', 'B', 'C', 'D'],
        k: 2,
      },
    },
    {
      id: 'perm-3-3',
      label: 'Full Permutations P(3, 3) = 6',
      description: 'All complete permutations of 3 distinct elements',
      data: {
        mode: 'permutations',
        elements: ['1', '2', '3'],
        k: 3,
      },
    },
  ],
  codeSnippets: {
    cpp: `// Permutations P(N, k)
void permute(vector<int>& nums, vector<int>& path, vector<bool>& used, int k) {
    if (path.size() == k) { results.push_back(path); return; }
    for (int i = 0; i < nums.size(); ++i) {
        if (used[i]) continue;
        used[i] = true;
        path.push_back(nums[i]);
        permute(nums, path, used, k);
        path.pop_back();
        used[i] = false;
    }
}

// Combinations C(N, k)
void combine(vector<int>& nums, vector<int>& path, int start, int k) {
    if (path.size() == k) { results.push_back(path); return; }
    for (int i = start; i < nums.size(); ++i) {
        path.push_back(nums[i]);
        combine(nums, path, i + 1, k);
        path.pop_back();
    }
}`,
    python: `# Permutations
def permute(elements, k, path=[], used=set()):
    if len(path) == k:
        results.append(list(path))
        return
    for x in elements:
        if x not in used:
            used.add(x)
            permute(elements, k, path + [x], used)
            used.remove(x)

# Combinations
def combine(elements, k, start=0, path=[]):
    if len(path) == k:
        results.append(list(path))
        return
    for i in range(start, len(elements)):
        combine(elements, k, i + 1, path + [elements[i]])`,
    typescript: `function generate(mode: 'perm' | 'comb', arr: string[], k: number) {
  const results: string[][] = [];
  const path: string[] = [];
  const used = new Array(arr.length).fill(false);

  function dfs(startIdx: number) {
    if (path.length === k) { results.push([...path]); return; }
    for (let i = mode === 'comb' ? startIdx : 0; i < arr.length; i++) {
      if (mode === 'perm' && used[i]) continue;
      used[i] = true;
      path.push(arr[i]);
      dfs(mode === 'comb' ? i + 1 : 0);
      path.pop();
      used[i] = false;
    }
  }
  dfs(0);
}`,
    java: `// Combinations: monotonically increasing index
void combine(int[] nums, int k, int start, List<Integer> path) {
    if (path.size() == k) { results.add(new ArrayList<>(path)); return; }
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);
        combine(nums, k, i + 1, path);
        path.remove(path.size() - 1);
    }
}`,
    pseudocode: `if len(path) == k:
    emit(path)
for i from (start if COMB else 0) to N - 1:
    if PERM and used[i]: continue
    used[i] = true
    path.append(elements[i])
    recurse()
    path.pop()
    used[i] = false`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<PermCombState>[] = [];
    const { mode, elements, k } = input;
    const N = elements.length;
    const used = new Array(N).fill(false);
    const path: string[] = [];
    const results: string[][] = [];

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: PermCombState,
      options?: {
        action?: string;
        variables?: Record<string, string | number | boolean>;
        callStack?: CallStackFrame[];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 0,
        codeLine,
        explanation,
        action: options?.action,
        variables: options?.variables,
        callStack: options?.callStack,
        state,
      });
    };

    addFrame(
      1,
      `Starting ${mode.toUpperCase()} generator for N=${N} elements [${elements.join(', ')}] choosing k=${k}.`,
      {
        mode,
        elements,
        k,
        currentPath: [],
        used: [...used],
        results: [],
        activeCandidate: null,
        message: `Initialized backtracking state for ${mode}.`,
      },
      {
        action: 'INIT',
        variables: { mode, N, k },
        callStack: [{ name: 'generate', params: { mode, N, k } }],
      }
    );

    function dfs(startIdx: number) {
      if (path.length === k) {
        results.push([...path]);
        addFrame(
          4,
          `Base case reached: Path length == k (${k}). Recorded sequence: [${path.join(', ')}]. Total: ${results.length}.`,
          {
            mode,
            elements,
            k,
            currentPath: [...path],
            used: [...used],
            results: [...results.map((r) => [...r])],
            activeCandidate: null,
            message: `Recorded ${mode === 'permutations' ? 'permutation' : 'combination'}: (${path.join(', ')}).`,
          },
          {
            action: 'EMIT',
            variables: { path: path.join(''), resultsCount: results.length },
            callStack: [{ name: 'emit', params: { result: path.join('') } }],
          }
        );
        return;
      }

      const loopStart = mode === 'combinations' ? startIdx : 0;
      for (let i = loopStart; i < N; i++) {
        const candidate = elements[i];
        if (mode === 'permutations' && used[i]) continue;

        used[i] = true;
        path.push(candidate);

        addFrame(
          8,
          `Chose element '${candidate}' at position ${path.length - 1}. Current prefix: [${path.join(', ')}].`,
          {
            mode,
            elements,
            k,
            currentPath: [...path],
            used: [...used],
            results: [...results.map((r) => [...r])],
            activeCandidate: candidate,
            message: `Exploring branch with prefix [${path.join(', ')}].`,
          },
          {
            action: 'CHOOSE',
            variables: { candidate, depth: path.length, usedMask: used.map((u) => (u ? 1 : 0)).join('') },
            callStack: [{ name: 'dfs', params: { candidate, depth: path.length } }],
          }
        );

        dfs(mode === 'combinations' ? i + 1 : 0);

        // Backtrack
        path.pop();
        used[i] = false;

        addFrame(
          12,
          `Backtracked: Removed '${candidate}'. Restored state for next candidate.`,
          {
            mode,
            elements,
            k,
            currentPath: [...path],
            used: [...used],
            results: [...results.map((r) => [...r])],
            activeCandidate: null,
            message: `Backtracked from '${candidate}'; current prefix: [${path.join(', ')}].`,
          },
          {
            action: 'BACKTRACK',
            variables: { popped: candidate, currentPrefix: path.join(',') },
            callStack: [{ name: 'backtrack', params: { popped: candidate } }],
          }
        );
      }
    }

    dfs(0);

    addFrame(
      16,
      `State space traversal finished. Successfully generated all ${results.length} ${mode}.`,
      {
        mode,
        elements,
        k,
        currentPath: [],
        used: [...used],
        results: [...results.map((r) => [...r])],
        activeCandidate: null,
        message: `Exploration complete: Total ${results.length} valid sequences generated.`,
      },
      {
        action: 'COMPLETE',
        variables: { totalGenerated: results.length },
        callStack: [{ name: 'complete', params: { total: results.length } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<PermCombState>) => {
    const { mode, elements, k, currentPath, used, results, activeCandidate, message } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* Top Controls & State Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Elements Pool */}
          <div className="flex flex-col p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Element Pool (N={elements.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {elements.map((el, idx) => {
                const isUsed = used[idx];
                const isCandidate = el === activeCandidate;
                return (
                  <div
                    key={`el-${idx}`}
                    className={`w-9 h-9 rounded-lg border font-mono font-bold flex items-center justify-center text-sm transition-all duration-200 ${
                      isCandidate
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20'
                        : isUsed
                        ? 'bg-slate-950/60 border-slate-800 text-slate-600 line-through'
                        : 'bg-indigo-950/50 border-indigo-500/50 text-indigo-200'
                    }`}
                  >
                    {el}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Decision Path */}
          <div className="flex flex-col p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Path (k={k})
            </span>
            <div className="flex gap-2 items-center min-h-[36px]">
              {Array.from({ length: k }).map((_, idx) => {
                const val = currentPath[idx];
                return (
                  <div
                    key={`slot-${idx}`}
                    className={`w-9 h-9 rounded-lg border font-mono font-bold flex items-center justify-center text-sm ${
                      val
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/40 border-dashed border-slate-700 text-slate-600'
                    }`}
                  >
                    {val || '·'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mode & Target Metric */}
          <div className="flex flex-col p-4 bg-slate-900/60 border border-slate-800 rounded-xl justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Formula & Mode
            </span>
            <div className="font-mono text-xs text-cyan-300">
              Mode: <span className="font-bold uppercase text-white">{mode}</span>
            </div>
            <div className="font-mono text-xs text-slate-400">
              Formula:{' '}
              <span className="text-amber-300 font-bold">
                {mode === 'permutations'
                  ? `P(${elements.length}, ${k}) = N! / (N-k)!`
                  : `C(${elements.length}, ${k}) = N! / (k!(N-k)!)`}
              </span>
            </div>
          </div>
        </div>

        {/* Results Stream Grid */}
        <div className="w-full flex flex-col p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Emitted Sequences
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              Total: {results.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 font-mono text-xs">
            {results.map((res, idx) => (
              <div
                key={`res-${idx}`}
                className="px-3 py-1.5 rounded-lg border bg-slate-950/80 border-slate-800 text-slate-200 flex items-center gap-1.5"
              >
                <span className="text-slate-500">#{idx + 1}:</span>
                <span className="text-emerald-400 font-bold">({res.join(', ')})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};
