import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface BoyerMooreState {
  text: string;
  pattern: string;
  shift: number;
  patternIndex: number;
  badCharTable: Record<string, number>;
  matches: number[];
  lastComparison: { textChar: string; patChar: string; match: boolean } | null;
  shiftAmount: number;
  phase: 'comparing' | 'shift' | 'match' | 'done';
}

export const boyerMooreModule: AlgorithmModule<
  { text: string; pattern: string },
  BoyerMooreState
> = {
  id: 'boyer-moore',
  title: 'Boyer-Moore Algorithm (Bad Character Heuristic O(N / M))',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N / M) sublinear',
    timeAverage: 'O(N)',
    timeWorst: 'O(N * M)',
    spaceAuxiliary: 'O(Alphabet)',
    worstCaseCondition: 'All characters identical (e.g., text="AAAAAAA", pattern="BAAA")',
  },
  theory: {
    overview:
      'The Boyer-Moore algorithm is the standard benchmark for high-speed string search in text editors and grep. It compares the pattern against text from RIGHT TO LEFT, allowing massive multi-character jumps when a mismatch occurs.',
    whyItWorks:
      'The Bad Character Heuristic states that when a mismatch occurs at text character c, we look up the rightmost occurrence of c in pattern. We then shift the pattern so that c aligns with that occurrence. If c does not appear anywhere in the pattern, the pattern shifts completely past c.',
    invariant:
      'Right-to-Left Alignment Invariant: Pattern characters j ∈ [M-1 .. 0] are matched in reverse order. Any mismatch gives immediate lower-bound jump distance via precomputed bad-character table.',
    pitfalls: [
      'Negative shift amounts when the last occurrence of the bad character is to the right of the current mismatch (must take max(1, j - badChar[c])).',
      'Forgetting that 1-based or 0-based character indexing changes the shift offset formula.',
    ],
  },
  presets: [
    {
      id: 'classic-jump',
      label: 'Standard: "HERE IS A SIMPLE EXAMPLE", Pattern: "EXAMPLE"',
      description: 'Demonstrates large 6-character leaps across non-matching words',
      data: { text: 'HERE IS A SIMPLE EXAMPLE', pattern: 'EXAMPLE' },
    },
    {
      id: 'multi-match',
      label: 'Multiple Occurrences: "ABAAABCDABC", Pattern: "ABC"',
      description: 'Detects matches with right-to-left verification',
      data: { text: 'ABAAABCDABC', pattern: 'ABC' },
    },
  ],
  defaultInput: { text: 'HERE IS A SIMPLE EXAMPLE', pattern: 'EXAMPLE' },
  codeSnippets: {
    python: `def boyer_moore(text, pattern):
    n, m = len(text), len(pattern)
    bad_char = {char: i for i, char in enumerate(pattern)}
    matches = []
    shift = 0
    while shift <= n - m:
        j = m - 1
        while j >= 0 and pattern[j] == text[shift + j]:
            j -= 1
        if j < 0:
            matches.append(shift)
            shift += (m - bad_char.get(text[shift + m], -1)) if shift + m < n else 1
        else:
            shift += max(1, j - bad_char.get(text[shift + j], -1))
    return matches`,
    typescript: `function boyerMoore(text: string, pattern: string): number[] {
  const n = text.length;
  const m = pattern.length;
  const badChar: Record<string, number> = {};
  for (let i = 0; i < m; i++) badChar[pattern[i]] = i;

  const matches: number[] = [];
  let shift = 0;
  while (shift <= n - m) {
    let j = m - 1;
    while (j >= 0 && pattern[j] === text[shift + j]) {
      j--;
    }
    if (j < 0) {
      matches.push(shift);
      shift += (shift + m < n) ? m - (badChar[text[shift + m]] ?? -1) : 1;
    } else {
      const bc = badChar[text[shift + j]] ?? -1;
      shift += Math.max(1, j - bc);
    }
  }
  return matches;
}`,
    cpp: `vector<int> boyerMoore(const string& text, const string& pattern) {
    int n = text.size(), m = pattern.size();
    unordered_map<char, int> badChar;
    for (int i = 0; i < m; ++i) badChar[pattern[i]] = i;
    vector<int> matches;
    int shift = 0;
    while (shift <= n - m) {
        int j = m - 1;
        while (j >= 0 && pattern[j] == text[shift + j]) --j;
        if (j < 0) {
            matches.push_back(shift);
            shift += (shift + m < n) ? m - (badChar.count(text[shift + m]) ? badChar[text[shift + m]] : -1) : 1;
        } else {
            int bc = badChar.count(text[shift + j]) ? badChar[text[shift + j]] : -1;
            shift += max(1, j - bc);
        }
    }
    return matches;
}`,
    java: `public List<Integer> boyerMoore(String text, String pattern) {
    int n = text.length(), m = pattern.length();
    Map<Character, Integer> badChar = new HashMap<>();
    for (int i = 0; i < m; i++) badChar.put(pattern.charAt(i), i);
    List<Integer> matches = new ArrayList<>();
    int shift = 0;
    while (shift <= n - m) {
        int j = m - 1;
        while (j >= 0 && pattern.charAt(j) == text.charAt(shift + j)) j--;
        if (j < 0) {
            matches.add(shift);
            shift += (shift + m < n) ? m - badChar.getOrDefault(text.charAt(shift + m), -1) : 1;
        } else {
            int bc = badChar.getOrDefault(text.charAt(shift + j), -1);
            shift += Math.max(1, j - bc);
        }
    }
    return matches;
}`,
    pseudocode: `function boyerMoore(text, pattern):
    build bad_character_table for pattern
    shift = 0
    while shift <= length(text) - length(pattern):
        j = length(pattern) - 1
        while j >= 0 and pattern[j] == text[shift + j]:
            j = j - 1 // Match right to left
        if j < 0:
            record match at shift
            advance shift by bad character heuristic
        else:
            shift = shift + max(1, j - bad_char[text[shift + j]])
    return matches`,
  },

  generateTimeline: (input: { text: string; pattern: string }): ExecutionFrame<BoyerMooreState>[] => {
    const text = input.text || 'HERE IS A SIMPLE EXAMPLE';
    const pattern = input.pattern || 'EXAMPLE';
    const n = text.length;
    const m = pattern.length;

    // Precompute Bad Character table
    const badCharTable: Record<string, number> = {};
    for (let i = 0; i < m; i++) {
      badCharTable[pattern[i]] = i;
    }

    const frames: ExecutionFrame<BoyerMooreState>[] = [];
    const matches: number[] = [];

    // Frame 0: Precomputation
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Precomputed Bad Character table for pattern "${pattern}": [${Object.entries(badCharTable)
        .map(([c, idx]) => `'${c}': ${idx}`)
        .join(', ')}]. Comparisons will proceed RIGHT-TO-LEFT.`,
      variables: { textLength: n, patternLength: m, uniqueChars: Object.keys(badCharTable).length },
      callStack: [
        { name: `boyerMoore("${pattern}")`, params: { N: n, M: m }, line: 3, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        text,
        pattern,
        shift: 0,
        patternIndex: m - 1,
        badCharTable,
        matches: [],
        lastComparison: null,
        shiftAmount: 0,
        phase: 'comparing',
      },
    });

    let shift = 0;

    while (shift <= n - m) {
      let j = m - 1;

      while (j >= 0) {
        const textChar = text[shift + j];
        const patChar = pattern[j];
        const isMatch = textChar === patChar;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `Shift ${shift} (matching right-to-left): Checking pattern[${j}] ('${patChar}') against text[${
            shift + j
          }] ('${textChar}'). Result: ${isMatch ? 'MATCH' : 'MISMATCH'}.`,
          variables: {
            shift,
            j,
            patChar,
            textChar,
            match: String(isMatch),
          },
          conditionEval: {
            expr: `pattern[${j}] ('${patChar}') == text[${shift + j}] ('${textChar}')`,
            result: isMatch,
          },
          callStack: [
            { name: `compareRightToLeft(shift=${shift}, j=${j})`, params: { shift, j, match: String(isMatch) }, line: 8, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            text,
            pattern,
            shift,
            patternIndex: j,
            badCharTable,
            matches: [...matches],
            lastComparison: { textChar, patChar, match: isMatch },
            shiftAmount: 0,
            phase: isMatch ? 'comparing' : 'shift',
          },
        });

        if (!isMatch) {
          const lastOccur = badCharTable[textChar] ?? -1;
          const delta = Math.max(1, j - lastOccur);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 13,
            isMilestone: true,
            milestoneTitle: `Jump Forward +${delta} Chars`,
            explanation: `Bad character '${textChar}' mismatch at j = ${j}. Rightmost occurrence in pattern is at index ${lastOccur}. Jump shift forward by max(1, ${j} - (${lastOccur})) = ${delta} positions!`,
            variables: { badCharacter: textChar, rightmostIdx: lastOccur, jumpDistance: delta, newShift: shift + delta },
            callStack: [
              { name: `badCharJump(+${delta})`, params: { char: textChar, delta }, line: 13, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            state: {
              text,
              pattern,
              shift,
              patternIndex: j,
              badCharTable,
              matches: [...matches],
              lastComparison: { textChar, patChar, match: false },
              shiftAmount: delta,
              phase: 'shift',
            },
          });

          shift += delta;
          break;
        }

        j--;
      }

      if (j < 0) {
        matches.push(shift);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          isMilestone: true,
          milestoneTitle: `Match Found at Index ${shift}`,
          explanation: `Complete right-to-left match verified for pattern "${pattern}" at text index ${shift}!`,
          variables: { matchedShift: shift, totalMatches: matches.length },
          callStack: [
            { name: `matchFound(index=${shift})`, params: { index: shift }, line: 11, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            text,
            pattern,
            shift,
            patternIndex: 0,
            badCharTable,
            matches: [...matches],
            lastComparison: null,
            shiftAmount: 1,
            phase: 'match',
          },
        });

        const nextChar = shift + m < n ? text[shift + m] : '';
        const delta = shift + m < n ? m - (badCharTable[nextChar] ?? -1) : 1;
        shift += Math.max(1, delta);
      }
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      isMilestone: true,
      milestoneTitle: 'Boyer-Moore Search Complete',
      explanation: `Search finished. Found ${matches.length} occurrence(s) at text positions: [${matches.join(', ')}].`,
      variables: { totalOccurrences: matches.length, positions: matches.join(', ') || 'None' },
      callStack: [
        { name: 'complete()', params: { matches: matches.length }, line: 14, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        text,
        pattern,
        shift: n,
        patternIndex: 0,
        badCharTable,
        matches: [...matches],
        lastComparison: null,
        shiftAmount: 0,
        phase: 'done',
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<BoyerMooreState>) => {
    const { text, pattern, shift, patternIndex, badCharTable, matches, lastComparison, phase } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Shift Position: <strong className="text-white">{shift} / {text.length}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Matches: <strong className="text-white">{matches.length}</strong>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
            Scan Direction: <strong className="text-white">RIGHT ➔ LEFT</strong>
          </div>
        </div>

        {/* Text & Pattern Visual Alignment */}
        <div className="w-full flex flex-col gap-6 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          {/* Text Tape */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Text Tape
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
              {text.split('').map((char, idx) => {
                const isUnderComparison = idx === shift + patternIndex && phase !== 'done';
                const isMatchStart = matches.includes(idx);

                return (
                  <div key={idx} className="relative flex flex-col items-center shrink-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all duration-200 ${
                        isUnderComparison
                          ? lastComparison?.match
                            ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                            : 'bg-rose-500 text-white font-extrabold shadow-md'
                          : isMatchStart
                          ? 'bg-emerald-950/70 border border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border border-slate-800 text-slate-300'
                      }`}
                    >
                      {char}
                    </div>
                    <span className="text-[8px] text-slate-600 font-mono mt-1">{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pattern Sliding Tape */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Pattern (Shifted {shift} positions)
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto p-3 bg-cyan-950/20 rounded-2xl border border-cyan-900/40">
              {Array.from({ length: Math.min(shift, text.length) }).map((_, padIdx) => (
                <div key={padIdx} className="w-9 h-9 opacity-0 shrink-0" />
              ))}

              {pattern.split('').map((char, idx) => {
                const isCurrent = idx === patternIndex && phase !== 'done';
                return (
                  <div key={idx} className="relative flex flex-col items-center shrink-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all ${
                        isCurrent
                          ? lastComparison?.match
                            ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                            : 'bg-rose-500 text-white font-extrabold shadow-md'
                          : 'bg-cyan-950/60 border border-cyan-700 text-cyan-200'
                      }`}
                    >
                      {char}
                    </div>
                    <span className="text-[8px] text-cyan-600 font-mono mt-1">{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bad Character Lookup Table */}
        <div className="w-full flex flex-col p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mt-4">
          <span className="text-xs font-mono font-bold text-slate-400 mb-2 uppercase tracking-wider">
            Bad Character Table: Rightmost Occurrences in Pattern
          </span>
          <div className="flex items-center gap-2 overflow-x-auto">
            {Object.entries(badCharTable).map(([c, idx]) => (
              <div
                key={c}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center gap-2"
              >
                <span className="text-cyan-400 font-bold">'{c}'</span>
                <span className="text-slate-500">→</span>
                <span className="text-white font-semibold">index {idx}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};
