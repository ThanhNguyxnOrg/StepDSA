import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface KMPState {
  text: string;
  pattern: string;
  lps: number[];
  textIdx: number;
  patternIdx: number;
  phase: 'lps-build' | 'matching' | 'match-found' | 'done';
  matchedIndices: number[];
  charMatch: boolean | null;
}

export interface KMPInput {
  text: string;
  pattern: string;
}

const defaultKMPInput: KMPInput = {
  text: 'ABABDABACDABABCABAB',
  pattern: 'ABABCABAB',
};

export const kmpModule: AlgorithmModule<KMPInput, KMPState> = {
  id: 'kmp-search',
  title: 'Knuth-Morris-Pratt (KMP Pattern Match)',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N + M)',
    timeWorst: 'O(N + M)',
    spaceAuxiliary: 'O(M) for LPS π table',
    worstCaseCondition: 'Text and pattern with highly repetitive prefixes, still bounded by linear O(N + M)',
  },
  theory: {
    overview:
      'The Knuth-Morris-Pratt (KMP) algorithm is a linear-time string searching algorithm. It preprocesses the pattern to construct a Longest Prefix Suffix (LPS) table π, allowing the search to skip redundant character comparisons whenever a mismatch occurs instead of rewinding back in the text.',
    whyItWorks:
      'When a mismatch occurs at pattern index j, the substring pattern[0 ... j-1] already matched the text. The LPS value π[j-1] tells us the length of the longest proper prefix that is also a suffix, meaning we can safely shift the pattern to π[j-1] without re-checking matched characters.',
    invariant:
      'Text pointer i strictly moves forward or stays in place; it NEVER backtracks backwards.',
    pitfalls: [
      'Off-by-one errors when indexing the LPS / failure array.',
      'Handling multiple matching occurrences requires continuing the search with j = lps[j - 1] rather than resetting j to 0.',
    ],
  },
  presets: [
    {
      id: 'canonical',
      label: 'Canonical Example',
      description: 'Classic textbook text & pattern',
      data: { text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
    },
    {
      id: 'repetitive',
      label: 'Repetitive AAAAAB',
      description: 'LPS skips redundant A matches',
      data: { text: 'AAAAABAAABA', pattern: 'AAAA' },
    },
    {
      id: 'not-found',
      label: 'Pattern Not Found',
      description: 'Scans full text in O(N) with zero backtrack',
      data: { text: 'ABCDEFG', pattern: 'XYZ' },
    },
  ],
  defaultInput: defaultKMPInput,
  codeSnippets: {
    python: `def kmp_search(text, pattern):
    n, m = len(text), len(pattern)
    if m == 0: return []
    # Build LPS (Longest Prefix Suffix) table
    lps = [0] * m
    prev_lps, i = 0, 1
    while i < m:
        if pattern[i] == pattern[prev_lps]:
            prev_lps += 1
            lps[i] = prev_lps
            i += 1
        elif prev_lps != 0:
            prev_lps = lps[prev_lps - 1]
        else:
            lps[i] = 0
            i += 1
    # Search text
    matches = []
    i = j = 0
    while i < n:
        if text[i] == pattern[j]:
            i += 1
            j += 1
        if j == m:
            matches.append(i - j)
            j = lps[j - 1]
        elif i < n and text[i] != pattern[j]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    return matches`,
    typescript: `function kmpSearch(text: string, pattern: string): number[] {
  const n = text.length, m = pattern.length;
  if (m === 0) return [];
  const lps = new Array(m).fill(0);
  let len = 0, i = 1;
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i++] = len;
    } else if (len !== 0) {
      len = lps[len - 1];
    } else {
      lps[i++] = 0;
    }
  }
  const matches: number[] = [];
  let ti = 0, pi = 0;
  while (ti < n) {
    if (text[ti] === pattern[pi]) {
      ti++; pi++;
    }
    if (pi === m) {
      matches.push(ti - pi);
      pi = lps[pi - 1];
    } else if (ti < n && text[ti] !== pattern[pi]) {
      if (pi !== 0) pi = lps[pi - 1];
      else ti++;
    }
  }
  return matches;
}`,
    cpp: `vector<int> KMPSearch(string text, string pat) {
    int n = text.size(), m = pat.size();
    vector<int> lps(m, 0);
    int len = 0, i = 1;
    while (i < m) {
        if (pat[i] == pat[len]) lps[i++] = ++len;
        else if (len != 0) len = lps[len - 1];
        else lps[i++] = 0;
    }
    vector<int> matches;
    int ti = 0, pi = 0;
    while (ti < n) {
        if (text[ti] == pat[pi]) { ti++; pi++; }
        if (pi == m) {
            matches.push_back(ti - pi);
            pi = lps[pi - 1];
        } else if (ti < n && text[ti] != pat[pi]) {
            if (pi != 0) pi = lps[pi - 1];
            else ti++;
        }
    }
    return matches;
}`,
    java: `public static List<Integer> KMPSearch(String text, String pat) {
    int n = text.length(), m = pat.length();
    int[] lps = new int[m];
    int len = 0, i = 1;
    while (i < m) {
        if (pat.charAt(i) == pat.charAt(len)) lps[i++] = ++len;
        else if (len != 0) len = lps[len - 1];
        else lps[i++] = 0;
    }
    List<Integer> matches = new ArrayList<>();
    int ti = 0, pi = 0;
    while (ti < n) {
        if (text.charAt(ti) == pat.charAt(pi)) { ti++; pi++; }
        if (pi == m) {
            matches.add(ti - pi);
            pi = lps[pi - 1];
        } else if (ti < n && text.charAt(ti) != pat.charAt(pi)) {
            if (pi != 0) pi = lps[pi - 1];
            else ti++;
        }
    }
    return matches;
}`,
    pseudocode: `function KMPSearch(T, P):
    lps = computeLPSArray(P)
    i = 0, j = 0
    while i < length(T):
        if T[i] == P[j]:
            i = i + 1, j = j + 1
        if j == length(P):
            print "Pattern found at index " + (i - j)
            j = lps[j - 1]
        else if i < length(T) and T[i] != P[j]:
            if j != 0:
                j = lps[j - 1]
            else:
                i = i + 1`,
  },

  generateTimeline: (input: KMPInput): ExecutionFrame<KMPState>[] => {
    const text = input?.text || defaultKMPInput.text;
    const pattern = input?.pattern || defaultKMPInput.pattern;
    const m = pattern.length;
    const n = text.length;

    // Build LPS array
    const lps = new Array(m).fill(0);
    let len = 0;
    let idx = 1;
    while (idx < m) {
      if (pattern[idx] === pattern[len]) {
        len++;
        lps[idx] = len;
        idx++;
      } else if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[idx] = 0;
        idx++;
      }
    }

    const timeline: ExecutionFrame<KMPState>[] = [];

    const baseFrame = (
      stepIdx: number,
      state: KMPState,
      codeLine: number,
      explanation: string,
      action: string,
      isMilestone: boolean,
      scope: Record<string, string | number>,
      soundCue?: ExecutionFrame<KMPState>['soundCue']
    ): ExecutionFrame<KMPState> => ({
      stepIndex: stepIdx,
      totalSteps: 0,
      codeLine,
      state: {
        text: state.text,
        pattern: state.pattern,
        lps: [...state.lps],
        textIdx: state.textIdx,
        patternIdx: state.patternIdx,
        phase: state.phase,
        matchedIndices: [...state.matchedIndices],
        charMatch: state.charMatch,
      },
      codeHighlights: {
        python: [codeLine],
        typescript: [codeLine],
        cpp: [codeLine],
        java: [codeLine],
        pseudocode: [codeLine],
      },
      callStack: [
        {
          id: 'kmp-frame',
          name: 'kmpSearch',
          file: 'kmpSearch.ts',
          line: codeLine,
          params: { textLen: n, patLen: m, i: state.textIdx, j: state.patternIdx },
        },
      ],
      scopeVariables: scope,
      explanation,
      action,
      isMilestone,
      soundCue,
      invariantStatus:
        state.phase === 'done'
          ? `KMP completed. Found ${state.matchedIndices.length} occurrences.`
          : 'Text pointer i strictly monotonic forward; skips rewind via LPS table.',
    });

    const state: KMPState = {
      text,
      pattern,
      lps,
      textIdx: 0,
      patternIdx: 0,
      phase: 'lps-build',
      matchedIndices: [],
      charMatch: null,
    };

    let step = 0;

    // Step 0: Initial LPS table overview
    timeline.push(
      baseFrame(
        step++,
        state,
        5,
        `Constructed LPS (Longest Proper Prefix which is also Suffix) table for pattern "${pattern}": [${lps.join(', ')}].`,
        'Initialize KMP & LPS',
        true,
        { textLen: n, patLen: m, lpsTable: lps.join(',') },
        'start'
      )
    );

    state.phase = 'matching';
    let i = 0;
    let j = 0;

    while (i < n) {
      state.textIdx = i;
      state.patternIdx = j;

      const tChar = text[i];
      const pChar = pattern[j];

      if (tChar === pChar) {
        state.charMatch = true;
        timeline.push(
          baseFrame(
            step++,
            state,
            16,
            `Match found at text[${i}] ('${tChar}') == pattern[${j}] ('${pChar}'). Advancing both pointers i = ${i + 1}, j = ${j + 1}.`,
            `Char Match '${tChar}'`,
            false,
            { i, j, char: tChar, match: 'yes' },
            'compare'
          )
        );

        i++;
        j++;
        state.textIdx = i;
        state.patternIdx = j;

        if (j === m) {
          const matchStart = i - j;
          state.matchedIndices.push(matchStart);
          state.phase = 'match-found';

          timeline.push(
            baseFrame(
              step++,
              state,
              19,
              `Full pattern match found at text index ${matchStart}! Resetting j to lps[${j - 1}] = ${lps[j - 1]} to search for further occurrences.`,
              `Pattern found at [${matchStart}]`,
              true,
              { matchStart, matchedCount: state.matchedIndices.length, nextJ: lps[j - 1] },
              'success'
            )
          );

          j = lps[j - 1];
          state.patternIdx = j;
          state.phase = 'matching';
        }
      } else {
        state.charMatch = false;

        if (j !== 0) {
          const oldJ = j;
          const newJ = lps[j - 1];

          timeline.push(
            baseFrame(
              step++,
              state,
              23,
              `Mismatch at text[${i}] ('${tChar}') != pattern[${j}] ('${pChar}'). Shifting pattern without rewinding text i: j = lps[${oldJ - 1}] (${newJ}).`,
              `Shift j to lps[${oldJ - 1}] = ${newJ}`,
              true,
              { i, oldJ, newJ, textChar: tChar, patChar: pChar },
              'step'
            )
          );

          j = newJ;
          state.patternIdx = j;
        } else {
          timeline.push(
            baseFrame(
              step++,
              state,
              25,
              `Mismatch at pattern index 0 ('${pChar}' != '${tChar}'). Incrementing text index i to ${i + 1}.`,
              `Advance text pointer i to ${i + 1}`,
              false,
              { i, nextI: i + 1, textChar: tChar, patChar: pChar },
              'discard'
            )
          );

          i++;
          state.textIdx = i;
        }
      }
    }

    state.phase = 'done';
    state.charMatch = null;

    timeline.push(
      baseFrame(
        step++,
        state,
        27,
        `KMP Search completed across entire text! Total matches found: ${state.matchedIndices.length} at indices [${state.matchedIndices.join(', ')}].`,
        'Search Complete',
        true,
        { totalMatches: state.matchedIndices.length, matches: state.matchedIndices.join(',') },
        'complete'
      )
    );

    const total = timeline.length;
    timeline.forEach((f) => {
      f.totalSteps = total;
    });

    return timeline;
  },

  renderStage: (frame: ExecutionFrame<KMPState>) => {
    const { text, pattern, lps, textIdx, patternIdx, matchedIndices, charMatch } = frame.state;

    return (
      <div className="w-full flex flex-col items-center justify-center p-4 space-y-6 select-none">
        {/* Match Count Header */}
        <div className="flex items-center gap-6 bg-slate-900/80 px-6 py-2.5 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Text Length:</span>
            <span className="text-sm font-mono font-bold text-sky-400">{text.length}</span>
          </div>
          <div className="h-4 w-px bg-slate-700/60" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Pattern Length:</span>
            <span className="text-sm font-mono font-bold text-amber-400">{pattern.length}</span>
          </div>
          <div className="h-4 w-px bg-slate-700/60" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Matches:</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{matchedIndices.length}</span>
          </div>
        </div>

        {/* Text and Sliding Pattern Alignment */}
        <div className="w-full max-w-3xl bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur overflow-x-auto">
          {/* 1. Text Row */}
          <div className="mb-4">
            <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>Text T:</span>
              <span className="text-sky-400">Pointer i = {textIdx}</span>
            </div>
            <div className="flex gap-1.5 py-1">
              {text.split('').map((ch, idx) => {
                const isUnderPointer = textIdx === idx;
                const isMatchedPart = matchedIndices.some(
                  (start) => idx >= start && idx < start + pattern.length
                );

                return (
                  <div key={idx} className="flex flex-col items-center shrink-0">
                    <div
                      className={`w-9 h-10 flex items-center justify-center rounded-lg font-mono text-sm font-bold transition-all duration-200 border ${
                        isUnderPointer
                          ? charMatch === true
                            ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/50'
                            : charMatch === false
                            ? 'bg-rose-500/30 text-rose-200 border-rose-400 ring-2 ring-rose-400/50'
                            : 'bg-amber-500/20 text-amber-300 border-amber-400'
                          : isMatchedPart
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-200 border-slate-700/60'
                      }`}
                    >
                      {ch}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-0.5">{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Pattern Row (aligned at offset textIdx - patternIdx) */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>Pattern P:</span>
              <span className="text-amber-400">Pointer j = {patternIdx}</span>
            </div>

            <div className="flex gap-1.5 py-1">
              {/* Offset spacer */}
              {Array.from({ length: Math.max(0, textIdx - patternIdx) }).map((_, i) => (
                <div key={`spacer-${i}`} className="w-9 shrink-0" />
              ))}

              {pattern.split('').map((ch, idx) => {
                const isActive = patternIdx === idx;

                return (
                  <div key={idx} className="flex flex-col items-center shrink-0">
                    <div
                      className={`w-9 h-10 flex items-center justify-center rounded-lg font-mono text-sm font-bold transition-all duration-200 border ${
                        isActive
                          ? 'bg-amber-500/30 text-amber-200 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                          : 'bg-indigo-950/40 text-indigo-200 border-indigo-700/50'
                      }`}
                    >
                      {ch}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-0.5">{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. LPS Table (π Array) */}
        <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">LPS Table (Longest Prefix Suffix π)</span>
            <span className="text-[11px] font-mono text-slate-400">Failure transition values</span>
          </div>

          <div className="flex gap-2 justify-center overflow-x-auto py-1">
            {lps.map((val, idx) => {
              const isCurrent = patternIdx > 0 && patternIdx - 1 === idx;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] font-mono font-bold text-amber-400 mb-1">
                    {pattern[idx]}
                  </span>
                  <div
                    className={`w-9 h-8 flex items-center justify-center rounded font-mono text-xs font-bold border ${
                      isCurrent
                        ? 'bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400/40 font-extrabold'
                        : 'bg-slate-800 text-slate-300 border-slate-700/80'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1">π[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
