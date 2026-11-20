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

const MAX_TEXT_LEN = 40;
const MAX_PAT_LEN = 12;

interface NormalisedInput {
  text: string;
  pattern: string;
  notes: string[];
}

/** Truncate overlong inputs so the sliding-pattern stage stays readable. */
function normalise(input: KMPInput | undefined): NormalisedInput {
  const notes: string[] = [];
  const raw = input && typeof input === 'object' ? input : defaultKMPInput;

  let text = typeof raw.text === 'string' ? raw.text : defaultKMPInput.text;
  let pattern = typeof raw.pattern === 'string' ? raw.pattern : defaultKMPInput.pattern;

  if (text.length > MAX_TEXT_LEN) {
    notes.push(`text truncated from ${text.length} to ${MAX_TEXT_LEN} characters for readability`);
    text = text.slice(0, MAX_TEXT_LEN);
  }
  if (pattern.length > MAX_PAT_LEN) {
    notes.push(`pattern truncated from ${pattern.length} to ${MAX_PAT_LEN} characters for readability`);
    pattern = pattern.slice(0, MAX_PAT_LEN);
  }

  return { text, pattern, notes };
}

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
    pseudocode: `function kmpSearch(T, P):
    lps = computeLPSArray(P)
    i = 0, j = 0
    while i < length(T):
        if T[i] == P[j]:
            i = i + 1
            j = j + 1
        if j == length(P):
            record match at (i - j)
            j = lps[j - 1]
        else if i < length(T) and T[i] != P[j]:
            if j != 0:
                j = lps[j - 1]
            else:
                i = i + 1
    return matches`,
    python: `def kmp_search(text, pattern):
    lps = compute_lps_array(pattern)
    i, j = 0, 0
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1
            j += 1
        if j == len(pattern):
            matches.append(i - j)
            j = lps[j - 1]
        elif i < len(text) and text[i] != pattern[j]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    return matches`,
    typescript: `function kmpSearch(text: string, pattern: string): number[] {
  const lps = computeLPSArray(pattern);
  let i = 0, j = 0;
  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i++;
      j++; }
    if (j === pattern.length) {
      matches.push(i - j);
      j = lps[j - 1]; }
    else if (i < text.length && text[i] !== pattern[j]) {
      if (j !== 0) {
        j = lps[j - 1]; }
      else {
        i++; } } }
  return matches; }`,
    cpp: `vector<int> KMPSearch(string text, string pat) {
  vector<int> lps = computeLPSArray(pat);
  int i = 0, j = 0;
  while (i < (int)text.size()) {
    if (text[i] == pat[j]) {
      i++;
      j++; }
    if (j == (int)pat.size()) {
      matches.push_back(i - j);
      j = lps[j - 1]; }
    else if (i < (int)text.size() && text[i] != pat[j]) {
      if (j != 0) {
        j = lps[j - 1]; }
      else {
        i++; } } }
  return matches; }`,
    java: `static List<Integer> KMPSearch(String text, String pat) {
  int[] lps = computeLPSArray(pat);
  int i = 0, j = 0;
  while (i < text.length()) {
    if (text.charAt(i) == pat.charAt(j)) {
      i++;
      j++; }
    if (j == pat.length()) {
      matches.add(i - j);
      j = lps[j - 1]; }
    else if (i < text.length() && text.charAt(i) != pat.charAt(j)) {
      if (j != 0) {
        j = lps[j - 1]; }
      else {
        i++; } } }
  return matches; }`,
  },

  generateTimeline: (input: KMPInput): ExecutionFrame<KMPState>[] => {
    const { text, pattern, notes } = normalise(input);
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

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: { what: string; why: string; whatNext: string };
      state: KMPState;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<KMPState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<KMPState>['soundCue'];
      checkpoint?: ExecutionFrame<KMPState>['checkpoint'];
    }) => {
      timeline.push({
        stepIndex: timeline.length,
        totalSteps: timeline.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        state: {
          text: opts.state.text,
          pattern: opts.state.pattern,
          lps: [...opts.state.lps],
          textIdx: opts.state.textIdx,
          patternIdx: opts.state.patternIdx,
          phase: opts.state.phase,
          matchedIndices: [...opts.state.matchedIndices],
          charMatch: opts.state.charMatch,
        },
        codeHighlights: {
          python: [opts.codeLine],
          typescript: [opts.codeLine],
          cpp: [opts.codeLine],
          java: [opts.codeLine],
          pseudocode: [opts.codeLine],
        },
        callStack: [
          {
            id: 'kmp-frame',
            name: 'kmpSearch',
            file: 'kmpSearch.ts',
            line: opts.codeLine,
            params: { textLen: n, patLen: m, i: opts.state.textIdx, j: opts.state.patternIdx },
          },
        ],
        scopeVariables: opts.variables ?? {},
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        explanation: opts.explanation,
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        invariantStatus: {
          label:
            opts.state.phase === 'done'
              ? `KMP completed. Found ${opts.state.matchedIndices.length} occurrences.`
              : 'Text pointer i strictly monotonic forward; skips rewind via LPS table.',
          isValid: true,
        },
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

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

    let firstMatchMilestoneUsed = false;
    let lpsCheckpointAdded = false;
    let shiftCheckpointAdded = false;

    // ── Frame 0: initialisation (LPS table overview) ────────────────────────
    pushFrame({
      codeLine: 4,
      action: 'INIT',
      explanation:
        `Constructed LPS (Longest Proper Prefix which is also Suffix) table for pattern "${pattern}": [${lps.join(', ')}].` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      variables: { textLen: n, patLen: m, lpsTable: lps.join(',') },
      conditionEval: { expr: 'pattern.length > 0', condition: `${m} > 0`, result: m > 0 },
      soundCue: 'start',
      milestone: 'LPS Table Ready',
      state,
      pedagogy: {
        what: `The LPS table for "${pattern}" is [${lps.join(', ')}] — each entry is the longest proper prefix that is also a suffix.`,
        why: 'Knowing this fallback lets KMP skip redundant comparisons: on a mismatch we slide the pattern to the longest self-overlap instead of rewinding the text pointer.',
        whatNext: `Start matching at text[0] with pattern[0].`,
      },
      checkpoint: m > 0 && lps.length > 0 && !lpsCheckpointAdded
        ? {
            id: 'kmp-lps-meaning',
            question: `For pattern "${pattern}", the LPS entry lps[${lps.length - 1}] = ${lps[lps.length - 1]}. What does that number represent?`,
            options: [
              'The length of the longest proper prefix that is also a suffix of the pattern',
              'The number of times the pattern occurs in the text',
              'The index of the next match in the text',
            ],
            correctIndex: 0,
            explanation: `lps[j] is the length of the longest proper prefix of pattern[0..j] that is also a suffix of pattern[0..j]. That overlap is exactly what lets KMP avoid rechecking matched characters.`,
            hint: 'LPS = Longest Prefix which is also Suffix.',
          }
        : undefined,
    });

    if (m > 0 && lps.length > 0 && !lpsCheckpointAdded) lpsCheckpointAdded = true;
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
        pushFrame({
          codeLine: 6,
          action: 'MATCH_CHAR',
          explanation: `Match at text[${i}] ('${tChar}') == pattern[${j}] ('${pChar}'). Advancing both pointers i = ${i + 1}, j = ${j + 1}.`,
          variables: { i, j, char: tChar, match: 'yes' },
          conditionEval: { expr: 'T[i] == P[j]', condition: `'${tChar}' == '${pChar}'`, result: true },
          soundCue: 'compare',
          state,
          pedagogy: {
            what: `Characters match at text[${i}] and pattern[${j}]: '${tChar}'.`,
            why: 'Matching characters advance both pointers by one — the text pointer never moves backwards.',
            whatNext: j + 1 === m ? 'A full pattern match is about to complete.' : 'Compare the next pair.',
          },
        });

        i++;
        j++;
        state.textIdx = i;
        state.patternIdx = j;

        if (j === m) {
          const matchStart = i - j;
          state.matchedIndices.push(matchStart);
          state.phase = 'match-found';

          const matchMilestone = !firstMatchMilestoneUsed ? 'First Full Match' : undefined;
          if (matchMilestone) firstMatchMilestoneUsed = true;

          pushFrame({
            codeLine: 9,
            action: 'MATCH_FOUND',
            explanation: `Full pattern match found at text index ${matchStart}! Resetting j to lps[${j - 1}] = ${lps[j - 1]} to search for further occurrences.`,
            variables: { matchStart, matchedCount: state.matchedIndices.length, nextJ: lps[j - 1] },
            conditionEval: { expr: 'j == m', condition: `${j} == ${m}`, result: true },
            soundCue: 'success',
            milestone: matchMilestone,
            state,
            pedagogy: {
              what: `The whole pattern matched starting at text index ${matchStart}.`,
              why: 'Recording the start index, then resetting j to lps[j - 1] (not 0) lets KMP continue finding overlapping occurrences without missing any.',
              whatNext: 'Continue the scan from the current text position for more matches.',
            },
          });

          j = lps[j - 1];
          state.patternIdx = j;
          state.phase = 'matching';
        }
      } else {
        state.charMatch = false;

        if (j !== 0) {
          const oldJ = j;
          const newJ = lps[j - 1];

          const shiftCheckpoint: ExecutionFrame<KMPState>['checkpoint'] | undefined = !shiftCheckpointAdded
            ? {
                id: 'kmp-mismatch-action',
                question: `Mismatch at text[${i}] ('${tChar}') against pattern[${j}] ('${pChar}') with j = ${j} > 0. What does KMP do next?`,
                options: [
                  `Set j = lps[${j - 1}] = ${newJ} — the text pointer never rewinds`,
                  'Advance the text pointer i immediately and keep j unchanged',
                  'Reset j to 0 and start the whole pattern over',
                ],
                correctIndex: 0,
                explanation: `On a mismatch, the LPS fallback moves the pattern to its longest self-overlap (${newJ}), so the text pointer i stays exactly where it is — no re-checking of already-matched characters.`,
                hint: 'Which pointer does the LPS table control?',
              }
            : undefined;

          pushFrame({
            codeLine: 13,
            action: 'SHIFT_LPS',
            explanation: `Mismatch at text[${i}] ('${tChar}') != pattern[${j}] ('${pChar}'). Shifting pattern without rewinding text i: j = lps[${oldJ - 1}] (${newJ}).`,
            variables: { i, oldJ, newJ, textChar: tChar, patChar: pChar },
            conditionEval: { expr: 'j = lps[j - 1]', condition: `${newJ}`, result: newJ },
            soundCue: 'step',
            checkpoint: shiftCheckpoint,
            state,
            pedagogy: {
              what: `A mismatch shifts the pattern using its own structure: j = lps[${oldJ - 1}] = ${newJ}.`,
              why: 'The text pointer never moves backwards — that is exactly the O(N) guarantee KMP buys with the LPS table.',
              whatNext: 'Re-compare the same text character against the shifted pattern.',
            },
          });
          if (shiftCheckpoint) shiftCheckpointAdded = true;

          j = newJ;
          state.patternIdx = j;
        } else {
          pushFrame({
            codeLine: 15,
            action: 'ADVANCE_I',
            explanation: `Mismatch at pattern index 0 ('${pChar}' != '${tChar}'). Incrementing text index i to ${i + 1}.`,
            variables: { i, nextI: i + 1, textChar: tChar, patChar: pChar },
            conditionEval: { expr: 'j == 0', condition: `${j} == 0`, result: true },
            soundCue: 'discard',
            state,
            pedagogy: {
              what: `The very first pattern character mismatches, so there is no self-overlap to fall back on.`,
              why: 'With j = 0, lps has no fallback value, so the only correct move is to advance the text pointer by one.',
              whatNext: 'Compare the next text character against pattern[0] again.',
            },
          });

          i++;
          state.textIdx = i;
        }
      }
    }

    state.phase = 'done';
    state.charMatch = null;

    pushFrame({
      codeLine: 16,
      action: 'DONE',
      explanation: `KMP Search completed across entire text! Total matches found: ${state.matchedIndices.length} at indices [${state.matchedIndices.join(', ')}].`,
      variables: { totalMatches: state.matchedIndices.length, matches: state.matchedIndices.join(',') },
      conditionEval: { expr: 'scan finished', condition: `${n} characters scanned`, result: true },
      soundCue: 'complete',
      milestone: 'Search Complete',
      state,
      pedagogy: {
        what: `The full text was scanned; ${state.matchedIndices.length} match(es) recorded.`,
        why: 'Every character was examined at most a constant number of times, so total work is O(N + M) regardless of repetition.',
        whatNext: 'Try the repetitive preset: the LPS fallback keeps the scan linear even on highly repetitive input.',
      },
    });

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
