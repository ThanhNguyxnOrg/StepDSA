import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface NaiveSearchState {
  text: string;
  pattern: string;
  textIndex: number;
  patternIndex: number;
  matchIndices: number[];
  charMatch: boolean | null;
  phase: 'comparing' | 'matched' | 'mismatch' | 'done';
}

export const naiveSearchModule: AlgorithmModule<
  { text: string; pattern: string },
  NaiveSearchState
> = {
  id: 'naive-string-matching',
  title: 'Naive String Matching (Slide-and-Compare Baseline O(N * M))',
  category: 'searching',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N + M)',
    timeWorst: 'O(N * M)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Text and pattern share repetitive prefixes (e.g., text="AAAAAB", pattern="AAB")',
  },
  theory: {
    overview:
      'The Naive (Brute Force) pattern matching algorithm slides the pattern string character-by-character across the text string, comparing characters from left to right at every shift alignment.',
    whyItWorks:
      'By exhaustively testing all possible starting positions shift ∈ [0 .. N - M], it is guaranteed to discover every occurrence of the pattern without requiring precomputed prefix tables or hash functions.',
    invariant:
      'Shift Invariant: At shift i, if text[i + j] == pattern[j] for all j ∈ [0 .. M-1], a full pattern match is verified at index i.',
    pitfalls: [
      'Worst-case O(N * M) performance on redundant texts, which prompted the design of KMP and Boyer-Moore.',
      'Off-by-one errors when checking valid shift upper bound N - M.',
    ],
  },
  presets: [
    {
      id: 'standard-match',
      label: 'Standard: "AABAACAADAABAABA", Pattern: "AABA"',
      description: 'Multiple occurrences with partial prefix matches',
      data: { text: 'AABAACAADAABAABA', pattern: 'AABA' },
    },
    {
      id: 'worst-case',
      label: 'Worst Case: "AAAAAAAAAB", Pattern: "AAAB"',
      description: 'Repeatedly checks M-1 characters before failing at last',
      data: { text: 'AAAAAAAAAB', pattern: 'AAAB' },
    },
    {
      id: 'no-match',
      label: 'No Match: "HELLO WORLD", Pattern: "CAT"',
      description: 'Early mismatch at index 0 for each shift',
      data: { text: 'HELLO WORLD', pattern: 'CAT' },
    },
  ],
  defaultInput: { text: 'AABAACAADAABAABA', pattern: 'AABA' },
  codeSnippets: {
    python: `def naive_search(text, pattern):
    n, m = len(text), len(pattern)
    matches = []
    for i in range(n - m + 1):
        match = True
        for j in range(m):
            if text[i + j] != pattern[j]:
                match = False
                break
        if match:
            matches.append(i)
    return matches`,
    typescript: `function naiveSearch(text: string, pattern: string): number[] {
  const n = text.length;
  const m = pattern.length;
  const matches: number[] = [];
  for (let i = 0; i <= n - m; i++) {
    let match = true;
    for (let j = 0; j < m; j++) {
      if (text[i + j] !== pattern[j]) {
        match = false;
        break;
      }
    }
    if (match) matches.push(i);
  }
  return matches;
}`,
    cpp: `vector<int> naiveSearch(const string& text, const string& pattern) {
    int n = text.size(), m = pattern.size();
    vector<int> matches;
    for (int i = 0; i <= n - m; ++i) {
        bool match = true;
        for (int j = 0; j < m; ++j) {
            if (text[i + j] != pattern[j]) {
                match = false;
                break;
            }
        }
        if (match) matches.push_back(i);
    }
    return matches;
}`,
    java: `public List<Integer> naiveSearch(String text, String pattern) {
    int n = text.length(), m = pattern.length();
    List<Integer> matches = new ArrayList<>();
    for (int i = 0; i <= n - m; i++) {
        boolean match = true;
        for (int j = 0; j < m; j++) {
            if (text.charAt(i + j) != pattern.charAt(j)) {
                match = false;
                break;
            }
        }
        if (match) matches.add(i);
    }
    return matches;
}`,
    pseudocode: `function naiveSearch(text, pattern):
    matches = empty list
    for i from 0 to length(text) - length(pattern):
        j = 0
        while j < length(pattern) and text[i + j] == pattern[j]:
            j = j + 1
        if j == length(pattern):
            matches.append(i)
    return matches`,
  },

  generateTimeline: (input: { text: string; pattern: string }): ExecutionFrame<NaiveSearchState>[] => {
    const text = input.text || 'AABAACAADAABAABA';
    const pattern = input.pattern || 'AABA';
    const n = text.length;
    const m = pattern.length;

    const frames: ExecutionFrame<NaiveSearchState>[] = [];
    const matches: number[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Naive pattern matcher. Text length N = ${n}, Pattern length M = ${m}. Valid search shifts range from 0 to ${n - m}.`,
      variables: { textLength: n, patternLength: m, totalShifts: Math.max(0, n - m + 1) },
      callStack: [
        { name: `naiveSearch("${pattern}")`, params: { N: n, M: m }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        text,
        pattern,
        textIndex: 0,
        patternIndex: 0,
        matchIndices: [],
        charMatch: null,
        phase: 'comparing',
      },
    });

    for (let i = 0; i <= n - m; i++) {
      let isMatch = true;

      for (let j = 0; j < m; j++) {
        const textChar = text[i + j];
        const patternChar = pattern[j];
        const charEquals = textChar === patternChar;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Shift ${i}: Comparing text[${i + j}] ('${textChar}') with pattern[${j}] ('${patternChar}'). Result: ${charEquals ? 'MATCH' : 'MISMATCH'}.`,
          variables: {
            shift: i,
            patternIdx: j,
            textChar,
            patternChar,
            charEquals: String(charEquals),
          },
          conditionEval: {
            expr: `text[${i + j}] ('${textChar}') == pattern[${j}] ('${patternChar}')`,
            result: charEquals,
          },
          callStack: [
            { name: `compareChar(shift=${i}, j=${j})`, params: { i, j, match: String(charEquals) }, line: 6, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            text,
            pattern,
            textIndex: i + j,
            patternIndex: j,
            matchIndices: [...matches],
            charMatch: charEquals,
            phase: charEquals ? 'comparing' : 'mismatch',
          },
        });

        if (!charEquals) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        matches.push(i);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          isMilestone: true,
          milestoneTitle: `Pattern Found at Index ${i}`,
          explanation: `Complete match verified! Pattern "${pattern}" matches text starting at index ${i}. Recorded match position.`,
          variables: { matchedShift: i, totalMatchesFound: matches.length },
          callStack: [
            { name: `matchFound(index=${i})`, params: { index: i }, line: 11, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            text,
            pattern,
            textIndex: i + m - 1,
            patternIndex: m - 1,
            matchIndices: [...matches],
            charMatch: true,
            phase: 'matched',
          },
        });
      }
    }

    // Final Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      isMilestone: true,
      milestoneTitle: `Search Complete (${matches.length} Matches)`,
      explanation: `Exhaustive search finished. Found ${matches.length} occurrence(s) at indices [${matches.join(', ')}].`,
      variables: { totalMatches: matches.length, positions: matches.join(', ') || 'None' },
      callStack: [
        { name: 'complete()', params: { totalMatches: matches.length }, line: 12, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        text,
        pattern,
        textIndex: n,
        patternIndex: m,
        matchIndices: [...matches],
        charMatch: null,
        phase: 'done',
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<NaiveSearchState>) => {
    const { text, pattern, textIndex, patternIndex, matchIndices, charMatch, phase } = frame.state;
    const currentShift = Math.max(0, textIndex - patternIndex);

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Pattern Length: <strong className="text-white">{pattern.length} chars</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Matches Found: <strong className="text-white">{matchIndices.length}</strong>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            Current Shift: <strong className="text-cyan-300">{currentShift}</strong>
          </div>
        </div>

        {/* Alignment Matrix View */}
        <div className="w-full flex flex-col gap-6 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          {/* Text String Track */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Text Tape (N = {text.length})
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
              {text.split('').map((char, idx) => {
                const isUnderComparison = idx === textIndex;
                const isMatchStart = matchIndices.includes(idx);

                return (
                  <div key={idx} className="relative flex flex-col items-center">
                    {isUnderComparison && (
                      <span className="absolute -top-6 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-slate-950">
                        i+j
                      </span>
                    )}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all duration-200 ${
                        isUnderComparison
                          ? charMatch === true
                            ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                            : charMatch === false
                            ? 'bg-rose-500 text-white font-extrabold'
                            : 'bg-cyan-500 text-slate-950 font-bold'
                          : isMatchStart
                          ? 'bg-emerald-950/60 border border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-900 border border-slate-800 text-slate-300'
                      }`}
                    >
                      {char}
                    </div>
                    <span className="text-[9px] text-slate-600 font-mono mt-1">{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pattern Sliding Window Track */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Pattern Window (Shift = {currentShift})
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto p-3 bg-cyan-950/20 rounded-2xl border border-cyan-900/40">
              {/* Shift spacing placeholder */}
              {Array.from({ length: currentShift }).map((_, padIdx) => (
                <div key={padIdx} className="w-10 h-10 opacity-0 shrink-0" />
              ))}

              {pattern.split('').map((char, idx) => {
                const isComparing = idx === patternIndex && phase !== 'done';
                return (
                  <div key={idx} className="relative flex flex-col items-center shrink-0">
                    {isComparing && (
                      <span className="absolute -top-6 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-slate-950">
                        j
                      </span>
                    )}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all ${
                        isComparing
                          ? charMatch === true
                            ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                            : charMatch === false
                            ? 'bg-rose-500 text-white font-extrabold shadow-md'
                            : 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-cyan-950/60 border border-cyan-700 text-cyan-200'
                      }`}
                    >
                      {char}
                    </div>
                    <span className="text-[9px] text-cyan-600 font-mono mt-1">{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
