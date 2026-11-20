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

const MAX_TEXT_LEN = 30;
const MAX_PAT_LEN = 10;
const DELIMITER = '$';
const SAFE_DELIMITERS = ['$', '§', '#', '~', '@', '^'];
const DEFAULT_INPUT: ZInput = { pattern: 'aba', text: 'abacabaeaba' };

interface NormalisedInput {
  pattern: string;
  text: string;
  delimiter: string;
  notes: string[];
}

/**
 * The Z-algorithm concatenates P + delimiter + T, so the delimiter must not
 * appear in either input. If it does, a safe character is substituted and the
 * substitution is reported. Overlong inputs are truncated with a note; an
 * empty pattern or text is a valid short run (zero matches).
 */
function normalise(input: ZInput | undefined): NormalisedInput {
  const notes: string[] = [];
  const raw = input && typeof input === 'object' ? input : DEFAULT_INPUT;

  let pattern = typeof raw.pattern === 'string' ? raw.pattern : DEFAULT_INPUT.pattern;
  let text = typeof raw.text === 'string' ? raw.text : DEFAULT_INPUT.text;

  if (pattern.length > MAX_PAT_LEN) {
    notes.push(`pattern truncated from ${pattern.length} to ${MAX_PAT_LEN} characters for readability`);
    pattern = pattern.slice(0, MAX_PAT_LEN);
  }
  if (text.length > MAX_TEXT_LEN) {
    notes.push(`text truncated from ${text.length} to ${MAX_TEXT_LEN} characters for readability`);
    text = text.slice(0, MAX_TEXT_LEN);
  }

  let delimiter = DELIMITER;
  if (pattern.includes(DELIMITER) || text.includes(DELIMITER)) {
    delimiter = SAFE_DELIMITERS.find((c) => !pattern.includes(c) && !text.includes(c)) ?? DELIMITER;
    notes.push(`input contains the delimiter '${DELIMITER}', so '${delimiter}' is used instead`);
    pattern = pattern.split(DELIMITER).join(delimiter);
    text = text.split(DELIMITER).join(delimiter);
  }

  return { pattern, text, delimiter, notes };
}

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
    pseudocode: `function zAlgorithm(P, T):
    S = P + "$" + T
    n = length(S)
    Z = array of n zeros
    L = 0, R = 0
    matches = []
    for i = 1 to n - 1:
        if i <= R:
            Z[i] = min(R - i + 1, Z[i - L])
        while S[Z[i]] == S[i + Z[i]]:
            Z[i] = Z[i] + 1
        if i + Z[i] - 1 > R:
            L = i
            R = i + Z[i] - 1
        if Z[i] == length(P):
            record match at i - length(P) - 1
    return matches`,
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
      z[i] = Math.min(r - i + 1, z[i - l]); }
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++; }
    if (i + z[i] - 1 > r) {
      l = i;
      r = i + z[i] - 1; }
    if (z[i] === pattern.length) {
      matches.push(i - pattern.length - 1); } }
  return matches; }`,
    cpp: `vector<int> zAlgorithm(string pattern, string text) {
  string s = pattern + "$" + text;
  int n = s.size();
  vector<int> z(n, 0);
  int l = 0, r = 0;
  vector<int> matches;
  for (int i = 1; i < n; i++) {
    if (i <= r) {
      z[i] = min(r - i + 1, z[i - l]); }
    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) {
      z[i]++; }
    if (i + z[i] - 1 > r) {
      l = i;
      r = i + z[i] - 1; }
    if (z[i] == (int)pattern.size()) {
      matches.push_back(i - (int)pattern.size() - 1); } }
  return matches; }`,
    java: `static List<Integer> zAlgorithm(String pattern, String text) {
  String s = pattern + "$" + text;
  int n = s.length();
  int[] z = new int[n];
  int l = 0, r = 0;
  List<Integer> matches = new ArrayList<>();
  for (int i = 1; i < n; i++) {
    if (i <= r) {
      z[i] = Math.min(r - i + 1, z[i - l]); }
    while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) {
      z[i]++; }
    if (i + z[i] - 1 > r) {
      l = i;
      r = i + z[i] - 1; }
    if (z[i] == pattern.length()) {
      matches.add(i - pattern.length() - 1); } }
  return matches; }`,
  },

  generateTimeline: (input: ZInput): ExecutionFrame<ZState>[] => {
    const { pattern, text, delimiter, notes } = normalise(input);
    const S = pattern + delimiter + text;
    const n = S.length;
    const m = pattern.length;
    const Z = new Array(n).fill(0);
    let l = 0;
    let r = 0;
    const matches: number[] = [];

    const frames: ExecutionFrame<ZState>[] = [];
    let boxCheckpointAdded = false;
    let matchCheckpointAdded = false;
    let firstBoxMilestoneUsed = false;
    let firstMatchMilestoneUsed = false;

    let actionType: 'INIT' | 'BOX_CHECK' | 'Z_BOX_SHIFT' | 'MATCH_FOUND' | 'DONE' = 'INIT';

    const pushFrame = (opts: {
      codeLine: number;
      explanation: string;
      pedagogy: { what: string; why: string; whatNext: string };
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<ZState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<ZState>['soundCue'];
      checkpoint?: ExecutionFrame<ZState>['checkpoint'];
      currentIndex: number;
      boxL: number;
      boxR: number;
      phaseText: string;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: actionType,
        explanation: opts.explanation,
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        invariantStatus: {
          label:
            actionType === 'DONE'
              ? `scan finished — ${matches.length} occurrence(s) of "${pattern}" recorded`
              : 'R never moves backwards: every reuse inside [L, R] is exact',
          isValid: true,
        },
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        pedagogy: opts.pedagogy,
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: [{ name: 'zAlgorithm', params: { pattern, text }, line: opts.codeLine, isCurrent: true }],
        scopeVariables: opts.variables ?? {},
        state: {
          fullString: S,
          zArray: [...Z],
          currentIndex: opts.currentIndex,
          boxL: opts.boxL,
          boxR: opts.boxR,
          patternLength: m,
          matchedPositions: [...matches],
          phaseText: opts.phaseText,
        },
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    if (m > 0) {
      pushFrame({
        codeLine: 2,
        explanation:
          `Constructed concatenated string S = P + "${delimiter}" + T: "${S}". Length = ${n}. Z-array initialised to all zeros.` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { concatenatedString: S, patternLength: m, textLength: text.length, n },
        conditionEval: { expr: 'length(P) > 0', condition: `${m} > 0`, result: true },
        soundCue: 'start',
        currentIndex: 0,
        boxL: 0,
        boxR: 0,
        phaseText: 'Initial setup',
        pedagogy: {
          what: `S = "${S}" glues the pattern, a delimiter and the text together so every suffix comparison runs against one string.`,
          why: 'With one string, Z[i] for i > m is the length of the longest prefix match at that position — Z[i] == m flags a full pattern occurrence.',
          whatNext: `Scan i = 1..${n - 1}, reusing the rightmost Z-box [L, R] whenever i falls inside it.`,
        },
        checkpoint: {
          id: 'zalgorithm-delimiter-role',
          question: `Why is a delimiter inserted between the pattern and the text?`,
          options: [
            'It forces the Z-box extension to stop at the pattern boundary, so Z[i] never exceeds m',
            'It separates the two strings so the text is sorted first',
            'It marks positions where matches must be ignored',
          ],
          correctIndex: 0,
          explanation: `The delimiter never occurs in P or T, so while extending a Z-box the comparison S[Z[i]] == S[i + Z[i]] fails at the delimiter — capping Z[i] at m inside the pattern and giving exact match lengths in the text.`,
          hint: 'What happens to the extension loop when it reaches a character that appears only once in S?',
        },
      });

      for (let i = 1; i < n; i++) {
        let reusedFromBox = false;
        actionType = 'BOX_CHECK';

        if (i <= r) {
          Z[i] = Math.min(r - i + 1, Z[i - l]);
          reusedFromBox = true;
        }

        const boxCheckpoint: ExecutionFrame<ZState>['checkpoint'] | undefined =
          !boxCheckpointAdded && reusedFromBox
            ? {
                id: 'zalgorithm-box-reuse',
                question: `Index ${i} is inside the current Z-box [${l}, ${r}]. Why can its Z-value be reused from Z[${i - l}]?`,
                options: [
                  `S[${l}..${r}] equals the prefix S[0..${r - l}], so the character ${r - i + 1} positions ahead is already known to match`,
                  'The Z-box stores all previous matches, so it can answer any query directly',
                  'The reuse is a heuristic that may be wrong but is fast',
                ],
                correctIndex: 0,
                explanation: `The box [${l}, ${r}] satisfies S[${l}..${r}] == S[0..${r - l}]. Position ${i} sits ${i - l} characters into that mirrored prefix, so Z[${i - l}] = ${Z[i - l]} lower-bounds Z[${i}] — only the part past the box edge needs fresh comparisons.`,
                hint: 'Which substring of S does the box copy?',
              }
            : undefined;

        pushFrame({
          codeLine: 9,
          explanation: reusedFromBox
            ? `Index ${i} inside current Z-box [${l}, ${r}]. Reused Z[${i - l}]=${Z[i - l]} from prefix in O(1)! Initial Z[${i}] = ${Z[i]}.`
            : `Index ${i} outside current Z-box. Comparing characters from scratch with prefix.`,
          variables: { i, 'box[L, R]': `[${l}, ${r}]`, initialZ: Z[i], reusedFromBox },
          conditionEval: { expr: 'i <= R', condition: `${i} <= ${r}`, result: i <= r },
          soundCue: reusedFromBox ? 'step' : 'compare',
          checkpoint: boxCheckpoint,
          currentIndex: i,
          boxL: l,
          boxR: r,
          phaseText: reusedFromBox ? 'Reusing Z-box prefix' : 'Naive comparison',
          pedagogy: {
            what: reusedFromBox
              ? `Index ${i} falls inside the Z-box, so its starting match length is copied from Z[${i - l}].`
              : `Index ${i} lies outside the Z-box, so there is no prefix information to reuse.`,
            why: reusedFromBox
              ? 'The box mirrors a prefix of S; the mirrored position already proves a partial match.'
              : 'Without box coverage, the only correct move is to compare characters directly.',
            whatNext: 'Extend the match character by character until a mismatch stops the while loop.',
          },
        });
        if (boxCheckpoint) boxCheckpointAdded = true;

        // Character extension
        while (i + Z[i] < n && S[Z[i]] === S[i + Z[i]]) {
          Z[i]++;
        }

        // Update Z-box
        if (i + Z[i] - 1 > r) {
          l = i;
          r = i + Z[i] - 1;

          const boxMilestone = !firstBoxMilestoneUsed ? 'First Z-Box Shift' : undefined;
          if (boxMilestone) firstBoxMilestoneUsed = true;

          actionType = 'Z_BOX_SHIFT';
          pushFrame({
            codeLine: 14,
            explanation: `Z[${i}] extended to ${Z[i]}. Shifted rightmost Z-box forward to [${l}, ${r}] (substring "${S.slice(l, r + 1)}").`,
            soundCue: 'swap',
            milestone: boxMilestone,
            variables: { i, zValue: Z[i], newL: l, newR: r },
            conditionEval: { expr: 'i + Z[i] - 1 > R', condition: `${i + Z[i] - 1} > ${r}`, result: true },
            currentIndex: i,
            boxL: l,
            boxR: r,
            phaseText: `Z-box expanded to [${l}, ${r}]`,
            pedagogy: {
              what: `The rightmost Z-box moves to [${l}, ${r}] because this is the furthest prefix match seen so far.`,
              why: 'Keeping R as far right as possible maximises the reuse window for every future index.',
              whatNext: 'Continue scanning; future indices inside this box can reuse their mirrored Z-values.',
            },
          });
        }

        // Check if match found
        if (Z[i] === m && i > m) {
          const textPos = i - m - 1;
          matches.push(textPos);

          const matchMilestone = !firstMatchMilestoneUsed ? 'First Match Found' : undefined;
          if (matchMilestone) firstMatchMilestoneUsed = true;

          const matchCheckpoint: ExecutionFrame<ZState>['checkpoint'] | undefined =
            !matchCheckpointAdded
              ? {
                  id: 'zalgorithm-match-position',
                  question: `Z[${i}] = ${Z[i]} equals the pattern length ${m}. Why does that mean a match at TEXT index ${textPos}?`,
                  options: [
                    `S[${i}..${i + m - 1}] equals the whole pattern, and the text starts at S index ${m + 1}`,
                    'The Z-array stores text indices directly',
                    'The delimiter shifts every match by one',
                  ],
                  correctIndex: 0,
                  explanation: `A Z-value equal to m means S[i..i+m-1] equals the pattern. Since the text begins at S index m + 1, that occurrence starts at text index ${i} - ${m} - 1 = ${textPos}.`,
                  hint: 'Where does the text start inside the concatenated string S?',
                }
              : undefined;

          actionType = 'MATCH_FOUND';
          pushFrame({
            codeLine: 16,
            explanation: `🎯 Full pattern match found at text index ${textPos}! Z[${i}] (${Z[i]}) == pattern length (${m}).`,
            milestone: matchMilestone,
            soundCue: 'complete',
            checkpoint: matchCheckpoint,
            variables: { matchIndexInText: textPos, pattern, zVal: Z[i] },
            conditionEval: { expr: 'Z[i] == m', condition: `${Z[i]} == ${m}`, result: true },
            currentIndex: i,
            boxL: l,
            boxR: r,
            phaseText: `Match found at text index ${textPos}`,
            pedagogy: {
              what: `A full occurrence of "${pattern}" starts at text index ${textPos}.`,
              why: 'Z[i] equals the pattern length exactly, so the suffix at i matches the entire pattern — no extra verification needed.',
              whatNext: 'Keep scanning; overlapping occurrences are found the same way.',
            },
          });
          if (matchCheckpoint) matchCheckpointAdded = true;
        }
      }

      actionType = 'DONE';
      pushFrame({
        codeLine: 17,
        explanation: `🎉 Z-Algorithm complete! Found ${matches.length} total occurrences of "${pattern}" at indices: [${matches.join(', ')}].`,
        milestone: 'Search Complete',
        soundCue: 'complete',
        variables: { totalMatches: matches.length, positions: matches.join(', '), completed: true },
        conditionEval: { expr: 'i == n', condition: `${n} == ${n}`, result: true },
        currentIndex: -1,
        boxL: l,
        boxR: r,
        phaseText: 'Complete',
        pedagogy: {
          what: `The scan finished; ${matches.length} occurrence(s) recorded.`,
          why: 'R never moved backwards and every reuse was exact, so total work stayed linear in |P| + |T|.',
          whatNext: 'Try the repeated-chars preset: the Z-box reuse is what keeps "aaaaaa" linear.',
        },
      });
    } else {
      // Empty pattern: no occurrences are defined; the scan would misreport, so stop honestly.
      actionType = 'INIT';
      pushFrame({
        codeLine: 2,
        explanation:
          `S = "${delimiter}" + "${text}" with an EMPTY pattern: the concatenation has no pattern part to match against.` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { patternLength: 0, concatenatedString: S },
        conditionEval: { expr: 'length(P) > 0', condition: '0 > 0', result: false },
        soundCue: 'start',
        currentIndex: 0,
        boxL: 0,
        boxR: 0,
        phaseText: 'Empty pattern — nothing to search',
        pedagogy: {
          what: 'An empty pattern cannot occur in any text by definition.',
          why: 'Z[i] == m with m = 0 would fire at every index, which is meaningless — the search stops before scanning.',
          whatNext: 'Return zero matches; nothing can match an empty pattern.',
        },
      });
      actionType = 'DONE';
      pushFrame({
        codeLine: 2,
        explanation:
          `S = "${delimiter}" + "${text}" with an EMPTY pattern: Z[i] == 0 == m would falsely fire at every index, so the search stops and reports zero matches.` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { patternLength: 0, totalMatches: 0, result: 0 },
        conditionEval: { expr: 'length(P) > 0', condition: '0 > 0', result: false },
        soundCue: 'complete',
        milestone: 'Nothing to Search',
        currentIndex: 0,
        boxL: 0,
        boxR: 0,
        phaseText: 'Empty pattern — nothing to search',
        pedagogy: {
          what: 'An empty pattern has no length, so "Z[i] == m" would be true everywhere.',
          why: 'Reporting n - 1 matches for an empty pattern is meaningless — the honest result is zero occurrences.',
          whatNext: 'Load a preset with a non-empty pattern to watch the Z-box mechanism.',
        },
      });
    }

    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: frames.length }));
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
