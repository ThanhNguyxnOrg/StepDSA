import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface ZInput {
  text: string;
  pattern: string;
}

export interface ZState {
  fullString: string;
  zArray: number[];
  currentIndex: number;
  boxL: number;
  boxR: number;
  patternLength: number;
  matchedPositions: number[];
  phaseText: string;
}

const defaultZInput: ZInput = {
  pattern: 'aba',
  text: 'abacabaeaba',
};

export const zAlgorithmModule: AlgorithmModule<ZInput, ZState> = {
  id: 'z-algorithm',
  title: 'Z-Algorithm (Linear Z-Box Pattern Match)',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N + M)',
    timeAverage: 'O(N + M)',
    timeWorst: 'O(N + M)',
    spaceAuxiliary: 'O(N + M) for Z-array',
    worstCaseCondition: 'Strictly bounded linear time; right Z-box boundary R never moves backwards',
  },
  theory: {
    overview:
      'The Z-Algorithm finds all occurrences of a pattern P of length M in a text T of length N in linear O(N + M) time. It constructs the Z-array for string S = P + "$" + T, where Z[i] is the length of the longest substring starting from S[i] that is also a prefix of S. Any index where Z[i] == M represents a complete pattern match.',
    whyItWorks:
      'By maintaining the rightmost interval [L, R] matching a prefix (the "Z-box"), when evaluating index i inside [L, R], the value at relative offset k = i - L can be reused in O(1) time without redundant character re-comparisons.',
    invariant:
      'For every index i, Z[i] is the exact length of the longest common prefix between S and the suffix S[i ... |S|-1]. At all times, [L, R] satisfies S[L ... R] == S[0 ... R - L].',
    pitfalls: [
      'Forgetting that delimiter character "$" must not appear anywhere in P or T.',
      'Failing to handle the boundary case when i + Z[k] - 1 exceeds the current box boundary R.',
    ],
  },
  presets: [
    {
      id: 'standard-aba',
      label: 'Pattern "aba" in Text',
      description: 'Pattern "aba" in "abacabaeaba"',
      data: defaultZInput,
    },
    {
      id: 'repeated-chars',
      label: 'Repeated "aa" in Text',
      description: 'Pattern "aa" in "aaaaaa"',
      data: { pattern: 'aa', text: 'aaaaaa' },
    },
    {
      id: 'no-match',
      label: 'No Match Query',
      description: 'Search "xyz" in "abcdef"',
      data: { pattern: 'xyz', text: 'abcdef' },
    },
  ],
  defaultInput: defaultZInput,
  codeSnippets: {
    python: `def z_algorithm(pattern, text):
    s = pattern + "$" + text
    n = len(s)
    z = [0] * n
    l = r = 0
    matches = []

    for i in range(1, n):
        if i <= r:
            z[i] = min(r - i + 1, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] - 1 > r:
            l = i
            r = i + z[i] - 1
        if z[i] == len(pattern):
            matches.append(i - len(pattern) - 1)
    return matches`,
    typescript: `function zAlgorithm(pattern: string, text: string): number[] {
  const s = pattern + "$" + text;
  const n = s.length;
  const z: number[] = new Array(n).fill(0);
  let l = 0, r = 0;
  const matches: number[] = [];

  for (let i = 1; i < n; i++) {
    if (i <= r) {
      z[i] = Math.min(r - i + 1, z[i - l]);
    }
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++;
    }
    if (i + z[i] - 1 > r) {
      l = i;
      r = i + z[i] - 1;
    }
    if (z[i] === pattern.length) {
      matches.push(i - pattern.length - 1);
    }
  }
  return matches;
}`,
    cpp: `vector<int> zAlgorithm(string pattern, string text) {
    string s = pattern + "$" + text;
    int n = s.size(), m = pattern.size();
    vector<int> z(n, 0), matches;
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i <= r) z[i] = min(r - i + 1, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
        if (z[i] == m) matches.push_back(i - m - 1);
    }
    return matches;
}`,
    java: `public List<Integer> zAlgorithm(String pattern, String text) {
    String s = pattern + "$" + text;
    int n = s.length(), m = pattern.length();
    int[] z = new int[n];
    int l = 0, r = 0;
    List<Integer> matches = new ArrayList<>();
    for (int i = 1; i < n; i++) {
        if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);
        while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
        if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
        if (z[i] == m) matches.add(i - m - 1);
    }
    return matches;
}`,
    pseudocode: `function Z_Algorithm(P, T):
    S = P + "$" + T
    L = 0, R = 0
    for i = 1 to length(S) - 1:
        if i <= R: Z[i] = min(R - i + 1, Z[i - L])
        while S[Z[i]] == S[i + Z[i]]: Z[i]++
        if i + Z[i] - 1 > R:
            L = i, R = i + Z[i] - 1
        if Z[i] == length(P): report match at i - length(P) - 1`,
  },

  generateTimeline: (input: ZInput): ExecutionFrame<ZState>[] => {
    const frames: ExecutionFrame<ZState>[] = [];
    const { pattern, text } = input;
    const S = pattern + '$' + text;
    const n = S.length;
    const m = pattern.length;
    const Z = new Array(n).fill(0);
    let l = 0;
    let r = 0;
    const matches: number[] = [];

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Constructed concatenated string S = P + "$" + T: "${S}". Length = ${n}. Initializing Z-array.`,
      isMilestone: true,
      milestoneTitle: 'String Constructed',
      soundCue: { type: 'start' },
      variables: { concatenatedString: S, patternLength: m, textLength: text.length, n },
      callStack: [{ name: 'zAlgorithm', params: { pattern, text }, line: 1, isCurrent: true }],
      conditionEval: { expr: `n > 0`, result: true },
      scopeVariables: { concatenatedString: S, patternLength: m, textLength: text.length },
      state: {
        fullString: S,
        zArray: [...Z],
        currentIndex: 0,
        boxL: 0,
        boxR: 0,
        patternLength: m,
        matchedPositions: [],
        phaseText: 'Initial setup',
      },
    });

    for (let i = 1; i < n; i++) {
      let reusedFromBox = false;

      if (i <= r) {
        Z[i] = Math.min(r - i + 1, Z[i - l]);
        reusedFromBox = true;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: reusedFromBox
          ? `Index ${i} inside current Z-box [${l}, ${r}]. Reused Z[${i - l}]=${Z[i - l]} from prefix in O(1)! Initial Z[${i}] = ${Z[i]}.`
          : `Index ${i} outside current Z-box. Comparing characters from scratch with prefix.`,
        soundCue: { type: reusedFromBox ? 'step' : 'compare' },
        variables: { i, 'box[L, R]': `[${l}, ${r}]`, initialZ: Z[i], reusedFromBox },
        callStack: [{ name: 'computeZ', params: { i, boxL: l, boxR: r }, line: 8, isCurrent: true }],
        conditionEval: { expr: `i <= r (${i} <= ${r})`, result: i <= r },
        scopeVariables: { i, 'box[L, R]': `[${l}, ${r}]`, initialZ: Z[i] },
        state: {
          fullString: S,
          zArray: [...Z],
          currentIndex: i,
          boxL: l,
          boxR: r,
          patternLength: m,
          matchedPositions: [...matches],
          phaseText: reusedFromBox ? 'Reusing Z-box prefix' : 'Naive comparison',
        },
      });

      // Character extension
      while (i + Z[i] < n && S[Z[i]] === S[i + Z[i]]) {
        Z[i]++;
      }

      // Update Z-box
      if (i + Z[i] - 1 > r) {
        l = i;
        r = i + Z[i] - 1;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          explanation: `Z[${i}] extended to ${Z[i]}. Shifted rightmost Z-box forward to [${l}, ${r}] (substring "${S.slice(l, r + 1)}").`,
          soundCue: { type: 'swap' },
          isMilestone: true,
          milestoneTitle: `Z-Box [${l}, ${r}]`,
          variables: { i, zValue: Z[i], newL: l, newR: r },
          callStack: [{ name: 'updateZBox', params: { l, r }, line: 14, isCurrent: true }],
          conditionEval: { expr: `i + Z[i] - 1 > r`, result: true },
          scopeVariables: { i, zValue: Z[i], newL: l, newR: r },
          state: {
            fullString: S,
            zArray: [...Z],
            currentIndex: i,
            boxL: l,
            boxR: r,
            patternLength: m,
            matchedPositions: [...matches],
            phaseText: `Z-box expanded to [${l}, ${r}]`,
          },
        });
      }

      // Check if match found
      if (Z[i] === m && i > m) {
        const textPos = i - m - 1;
        matches.push(textPos);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 16,
          explanation: `🎯 Full pattern match found at text index ${textPos}! Z[${i}] (${Z[i]}) == pattern length (${m}).`,
          isMilestone: true,
          milestoneTitle: `Match at Index ${textPos}`,
          soundCue: { type: 'complete' },
          variables: { matchIndexInText: textPos, pattern, zVal: Z[i] },
          callStack: [{ name: 'reportMatch', params: { textPos, i }, line: 16, isCurrent: true }],
          conditionEval: { expr: `Z[i] == m (${Z[i]} == ${m})`, result: true },
          scopeVariables: { matchIndexInText: textPos, pattern },
          state: {
            fullString: S,
            zArray: [...Z],
            currentIndex: i,
            boxL: l,
            boxR: r,
            patternLength: m,
            matchedPositions: [...matches],
            phaseText: `Match found at text index ${textPos}`,
          },
        });
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 18,
      explanation: `🎉 Z-Algorithm complete! Found ${matches.length} total occurrences of "${pattern}" at indices: [${matches.join(', ')}].`,
      isMilestone: true,
      milestoneTitle: 'Search Complete',
      soundCue: { type: 'complete' },
      variables: { totalMatches: matches.length, positions: matches.join(', '), completed: true },
      callStack: [{ name: 'zAlgorithm.done', params: { matchCount: matches.length }, line: 18, isCurrent: true }],
      conditionEval: { expr: `i == n (${n} == ${n})`, result: true },
      scopeVariables: { totalMatches: matches.length, positions: matches.join(', ') },
      state: {
        fullString: S,
        zArray: [...Z],
        currentIndex: -1,
        boxL: l,
        boxR: r,
        patternLength: m,
        matchedPositions: [...matches],
        phaseText: 'Complete',
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<ZState>) => {
    const { fullString, zArray, currentIndex, boxL, boxR, patternLength, matchedPositions, phaseText } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 select-none">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-4">
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Z-Box: <span className="text-amber-400 font-bold">[{boxL}, {boxR}]</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Pattern Length: <span className="text-cyan-400 font-bold">{patternLength}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Matches: <span className="text-emerald-400 font-bold">{matchedPositions.length}</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            {phaseText}
          </div>
        </div>

        {/* Character & Z-Value Strip */}
        <div className="flex flex-col items-center max-w-5xl w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto p-4 max-w-full">
            {fullString.split('').map((char, idx) => {
              const isCurrent = idx === currentIndex;
              const inZBox = idx >= boxL && idx <= boxR && boxR > 0;
              const isDelimiter = char === '$';
              const isMatch = zArray[idx] === patternLength && idx > patternLength;

              return (
                <div key={idx} className="flex flex-col items-center">
                  {/* Character box */}
                  <div
                    className={`w-11 h-14 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                      isCurrent
                        ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 ring-2 ring-cyan-400/50 scale-105 z-10'
                        : isMatch
                        ? 'border-emerald-500 bg-emerald-950/70 text-emerald-200 ring-2 ring-emerald-400/40'
                        : inZBox
                        ? 'border-amber-400/80 bg-amber-950/40 text-amber-200'
                        : isDelimiter
                        ? 'border-rose-600/80 bg-rose-950/40 text-rose-300'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <span className="font-mono font-bold text-base">{char}</span>
                    <span className="text-[9px] font-mono text-slate-500">{idx}</span>
                  </div>

                  {/* Z-array value below */}
                  <div className="mt-1 flex items-center justify-center w-8 h-6 rounded bg-slate-900/80 border border-slate-800 text-xs font-mono font-bold text-white">
                    {zArray[idx]}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 text-xs font-mono text-slate-500">
            Bottom row = Z-array value (length of longest prefix match starting at index)
          </div>
        </div>
      </div>
    );
  },
};
