import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface LCSInput {
  str1: string;
  str2: string;
}

export interface LCSCandidate {
  i: number;
  j: number;
  kind: 'match' | 'mismatch';
  diag: number;
  top: number;
  left: number;
  value: number;
}

export interface LCSState {
  str1: string;
  str2: string;
  table: number[][];
  currentI: number;
  currentJ: number;
  /** Cells the active cell depends on: diagonal for a match, top+left for a mismatch. */
  sourceCells: [number, number][];
  candidate: LCSCandidate | null;
  /** Cells already visited on the reconstruction walk. */
  backtrackPath: [number, number][];
  /** Characters taken so far, in reverse (they are pushed from the end). */
  takenChars: string[];
  lcsString: string;
  phase: 'table' | 'backtrack' | 'done';
  stats: { filled: number; matches: number; mismatches: number; backtrackSteps: number };
  isComplete: boolean;
}

const MAX_SIDE = 8;

function normalise(value: unknown, fallback: string): { text: string; notes: string[] } {
  const notes: string[] = [];
  const original = typeof value === 'string' ? value : fallback;
  let text = original.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (text !== original.toUpperCase()) notes.push(`removed non-alphanumeric characters from "${original}"`);
  if (text.length === 0) notes.push(`"${original}" has no alphanumeric characters, so it is treated as an empty string`);
  if (text.length > MAX_SIDE) {
    notes.push(`"${text}" truncated to ${MAX_SIDE} characters for a readable table`);
    text = text.slice(0, MAX_SIDE);
  }
  return { text, notes };
}

export const lcsModule: AlgorithmModule<LCSInput, LCSState> = {
  id: 'longest-common-subsequence',
  title: 'Longest Common Subsequence (LCS 2D DP)',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  relatedModules: [
    { id: 'edit-distance', label: 'Edit Distance' },
    { id: 'longest-palindromic-substring', label: 'Longest Palindromic Substring' },
    { id: 'coin-change', label: 'Coin Change' },
    { id: 'longest-increasing-subsequence', label: 'LIS' },
  ],
  complexity: {
    timeBest: 'O(M · N)',
    timeAverage: 'O(M · N)',
    timeWorst: 'O(M · N)',
    spaceAuxiliary: 'O(M · N) table, O(M + N) for the reconstruction walk',
    worstCaseCondition: 'Every cell of the (M+1)·(N+1) grid is evaluated; disjoint strings still fill the whole table',
  },
  theory: {
    overview:
      'Longest Common Subsequence (LCS) finds the longest sequence of characters that appears in both strings in the same relative order without needing to be contiguous. A 2D table stores the answer for every pair of prefixes.',
    whyItWorks:
      'If the last characters of the two prefixes are equal, every optimal solution uses that pair: dp[i][j] = dp[i-1][j-1] + 1. If they differ, one of them must be discarded, so the answer is the better of the two neighbours: dp[i][j] = max(dp[i-1][j], dp[i][j-1]). Row 0 and column 0 are 0 because an empty prefix shares nothing.',
    invariant:
      'dp[i][j] holds exactly the LCS length of str1[0..i-1] and str2[0..j-1]; the reconstruction always moves to the neighbour (or diagonal) that produced dp[i][j].',
    pitfalls: [
      'Subsequence is not substring: "ONE" is a subsequence of "STONE" but not a substring.',
      'Off-by-one indexing: dp[i][j] is about str1[i-1] and str2[j-1] because row/column 0 represent the empty prefix.',
      'Reconstruction must follow the dependency that was actually used (the diagonal on a match), otherwise the recovered string is not an LCS.',
      'When dp[i-1][j] == dp[i][j-1] there are several valid LCS strings; the tie-break rule only decides which one this walk returns.',
    ],
    steps: [
      'Allocate the (M+1)×(N+1) table and fill row 0 / column 0 with zeros.',
      'Walk i = 1..M and j = 1..N: characters equal → diagonal + 1; otherwise the larger of top and left.',
      'Start the reconstruction at dp[M][N] with an empty character stack.',
      'On a match, take the character and step diagonally; otherwise step to the larger neighbour.',
      'Stop when i or j reaches 0 and read the characters back in reverse.',
    ],
  },
  presets: [
    { id: 'stone-longest', label: 'STONE vs LONGEST', description: 'Common subsequence "ONE" of length 3 with two clear max() choices', data: { str1: 'STONE', str2: 'LONGEST' } },
    { id: 'dna-match', label: 'AGGTAB vs GXTXAYB', description: 'Classic bioinformatics alignment "GTAB" (length 4)', data: { str1: 'AGGTAB', str2: 'GXTXAYB' } },
    { id: 'identical', label: 'Identical Strings (ABCDE)', description: 'Every cell matches on the diagonal, so the whole string is the LCS', data: { str1: 'ABCDE', str2: 'ABCDE' } },
    { id: 'disjoint', label: 'Disjoint Characters (XYZ vs ABC)', description: 'Zero overlap: the whole table is max() moves and the LCS stays empty', data: { str1: 'XYZ', str2: 'ABC' } },
  ],
  defaultInput: { str1: 'STONE', str2: 'LONGEST' },
  codeSnippets: {
    pseudocode: `function lcs(str1, str2):
    m = length(str1); n = length(str2)
    dp = (m + 1) x (n + 1) matrix of zeros
    for i = 1 to m:
        for j = 1 to n:
            if str1[i-1] == str2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    i = m; j = n; chars = []
    while i > 0 and j > 0:
        if str1[i-1] == str2[j-1]:
            chars.push(str1[i-1])
            i = i - 1; j = j - 1
        else if dp[i-1][j] >= dp[i][j-1]:
            i = i - 1
        else:
            j = j - 1
    return reverse(chars).join('')`,
    python: `def lcs(str1, str2):
    m, n = len(str1), len(str2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if str1[i - 1] == str2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    i, j, chars = m, n, []
    while i > 0 and j > 0:
        if str1[i - 1] == str2[j - 1]:
            chars.append(str1[i - 1])
            i, j = i - 1, j - 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i = i - 1
        else:
            j = j - 1
    return ''.join(reversed(chars))`,
    typescript: `function lcs(str1: string, str2: string): string {
  const m = str1.length, n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1; }
      else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); } }
  let i = m, j = n; const chars: string[] = [];
  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      chars.push(str1[i - 1]);
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--; }
    else {
      j--; } }
  return chars.reverse().join('');
}`,
    cpp: `string lcs(string str1, string str2) {
    int m = str1.size(), n = str2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (str1[i - 1] == str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1; }
            else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]); } }
    int i = m, j = n; string chars = "";
    while (i > 0 && j > 0) {
        if (str1[i - 1] == str2[j - 1]) {
            chars += str1[i - 1];
            i--; j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--; }
        else {
            j--; } }
    return string(chars.rbegin(), chars.rend()); }`,
    java: `public String lcs(String str1, String str2) {
    int m = str1.length(), n = str2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1; }
            else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); } }
    int i = m, j = n; StringBuilder chars = new StringBuilder();
    while (i > 0 && j > 0) {
        if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
            chars.append(str1.charAt(i - 1));
            i--; j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--; }
        else {
            j--; } }
    return chars.reverse().toString(); }`,
  },
  generateTimeline: (input: LCSInput): ExecutionFrame<LCSState>[] => {
    const first = normalise(input?.str1, 'STONE');
    const second = normalise(input?.str2, 'LONGEST');
    const s1 = first.text;
    const s2 = second.text;
    const notes = [...first.notes, ...second.notes];
    const m = s1.length;
    const n = s2.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    const frames: ExecutionFrame<LCSState>[] = [];
    const backtrackPath: [number, number][] = [];
    const takenChars: string[] = [];

    let filled = 0;
    let matches = 0;
    let mismatches = 0;
    let backtrackSteps = 0;

    let sourceCells: [number, number][] = [];
    let candidate: LCSCandidate | null = null;
    let currentI = 0;
    let currentJ = 0;
    let phase: LCSState['phase'] = 'table';
    let lastCellLine = 9;

    let maxChoiceCheckpointAdded = false;
    let backtrackCheckpointAdded = false;
    let firstMatchMilestone = false;

    const stats = () => ({ filled, matches, mismatches, backtrackSteps });

    const snapshot = (overrides: Partial<LCSState> = {}): LCSState => ({
      str1: s1,
      str2: s2,
      table: dp.map((row) => [...row]),
      currentI,
      currentJ,
      sourceCells: sourceCells.map(([i, j]) => [i, j] as [number, number]),
      candidate,
      backtrackPath: backtrackPath.map(([i, j]) => [i, j] as [number, number]),
      takenChars: [...takenChars],
      lcsString: [...takenChars].reverse().join(''),
      phase,
      stats: stats(),
      isComplete: phase === 'done',
      ...overrides,
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<LCSState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<LCSState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      callStackName?: string;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state: snapshot(),
        callStack: [
          {
            name: opts.callStackName ?? (phase === 'backtrack' || phase === 'done' ? 'backtrack(dp, str1, str2)' : 'lcs(str1, str2)'),
            params: { m, n, ...(currentI > 0 ? { i: currentI, j: currentJ } : {}) },
            line: opts.codeLine,
            isCurrent: true,
          },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: filled + backtrackSteps, accesses: filled, lookups: backtrackSteps },
        invariantStatus: {
          label:
            phase === 'table'
              ? `dp[${currentI}][${currentJ}] = ${dp[currentI]?.[currentJ] ?? 0} = LCS of "${s1.slice(0, currentI)}" and "${s2.slice(0, currentJ)}"`
              : `Reconstruction follows the dependency of every visited cell (${backtrackSteps} step(s))`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    pushFrame({
      codeLine: 3,
      action: 'INIT',
      explanation:
        `Allocate the (M+1)×(N+1) = ${m + 1}×${n + 1} table for "${s1}" and "${s2}" and set row 0 / column 0 to 0 (empty prefixes share nothing).` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      variables: {
        str1: s1,
        str2: s2,
        m,
        n,
        cells: (m + 1) * (n + 1),
        decisions: m * n,
      },
      soundCue: 'start',
      pedagogy: {
        what: `The table has ${m + 1} row(s) and ${n + 1} column(s); every cell will hold one LCS length.`,
        why: 'Row 0 and column 0 encode the empty prefix: with no characters on one side the common subsequence is empty, length 0.',
        whatNext: `Fill row 1: compare '${s1[0]}' against every character of "${s2}".`,
      },
    });

    if (m === 0 || n === 0) {
      phase = 'done';
      pushFrame({
        codeLine: 19,
        action: 'DONE',
        explanation: `One of the strings is empty, so the LCS is "" with length 0.`,
        variables: { result: '', length: 0 },
        milestone: 'LCS Reconstructed',
        soundCue: 'finish',
        pedagogy: {
          what: 'With an empty prefix there is nothing to match, so the answer is the empty subsequence.',
          why: 'The base cases of the recurrence are exactly this situation: dp[i][0] = dp[0][j] = 0.',
          whatNext: 'Edit the strings to compare non-empty inputs.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    for (let i = 1; i <= m; i++) {
      const c1 = s1[i - 1];
      currentI = i;
      currentJ = 0;
      sourceCells = [];
      candidate = null;

      pushFrame({
        codeLine: 4,
        action: 'ROW_START',
        explanation: `Start row ${i}: every cell dp[${i}][j] will use '${c1}' = str1[${i - 1}] against str2[0..${n - 1}].`,
        variables: { i, char: c1, rowFilled: filled, matches, mismatches },
        soundCue: 'step',
        pedagogy: {
          what: `Row ${i} of the table answers: what is the LCS of "${s1.slice(0, i)}" with each prefix of "${s2}"?`,
          why: 'Each row extends the previous row by exactly one character of str1, which is why the recurrence only needs the row above.',
          whatNext: `Compare '${c1}' with '${s2[0]}' in dp[${i}][1].`,
        },
      });

      for (let j = 1; j <= n; j++) {
        const c2 = s2[j - 1];
        const isMatch = c1 === c2;
        const diag = dp[i - 1][j - 1];
        const top = dp[i - 1][j];
        const left = dp[i][j - 1];
        dp[i][j] = isMatch ? diag + 1 : Math.max(top, left);
        const value = dp[i][j];
        filled++;
        if (isMatch) matches++;
        else mismatches++;

        currentJ = j;
        sourceCells = isMatch ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]];
        candidate = { i, j, kind: isMatch ? 'match' : 'mismatch', diag, top, left, value };

        const genuineChoice = !isMatch && top !== left;
        lastCellLine = isMatch ? 7 : 9;
        pushFrame({
          codeLine: isMatch ? 7 : 9,
          action: isMatch ? 'CELL_MATCH' : 'CELL_MISMATCH',
          explanation: isMatch
            ? `'${c1}' == '${c2}': the pair can extend the diagonal, so dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${diag} + 1 = ${value}.`
            : `'${c1}' != '${c2}': one character must be dropped, so dp[${i}][${j}] = max(top dp[${i - 1}][${j}] = ${top}, left dp[${i}][${j - 1}] = ${left}) = ${value}.`,
          conditionEval: isMatch
            ? { expr: `str1[${i - 1}] == str2[${j - 1}]`, condition: `'${c1}' == '${c2}'`, result: true }
            : {
                expr: `max(dp[${i - 1}][${j}], dp[${i}][${j - 1}])`,
                condition: `max(${top}, ${left}) = ${value}`,
                result: value,
                formatted: `${value} (${top > left ? 'above' : top < left ? 'left' : 'tie'})`,
              },
          variables: {
            i,
            j,
            'str1[i-1]': c1,
            'str2[j-1]': c2,
            match: isMatch,
            diag,
            top,
            left,
            'dp[i][j]': value,
            cellsFilled: filled,
          },
          milestone: isMatch && !firstMatchMilestone ? 'First Match' : undefined,
          soundCue: isMatch ? 'success' : 'compare',
          checkpoint:
            genuineChoice && !maxChoiceCheckpointAdded
              ? {
                  id: 'lcs-max-choice',
                  question: `'${c1}' != '${c2}', and the two neighbours differ: dp[${i - 1}][${j}] = ${top} (above) while dp[${i}][${j - 1}] = ${left} (left). Which value belongs in dp[${i}][${j}]?`,
                  options: [
                    `${Math.min(top, left)} — the smaller neighbour (keeping the shorter prefix)`,
                    `${Math.max(top, left)} — the larger neighbour (keeping the better prefix)`,
                    `0 — a mismatch means the LCS length stays 0`,
                  ],
                  correctIndex: 1,
                  explanation: `Dropping one character can only lose matches, so the best sub-answer is the larger neighbour: dp[${i}][${j}] = ${value}.`,
                  hint: 'Both neighbours describe the same two prefixes minus one character each.',
                }
              : undefined,
          pedagogy: {
            what: isMatch
              ? `The characters agree, so dp[${i}][${j}] extends the diagonal dp[${i - 1}][${j - 1}] = ${diag} by one.`
              : `The characters differ, so dp[${i}][${j}] copies the better neighbour: ${top} from above vs ${left} from the left → ${value}.`,
            why: isMatch
              ? 'When the last characters are equal, using them is always safe: any LCS that ignored them could be extended by this pair.'
              : 'When they differ at least one of them is not in the LCS, so the answer is the best answer of the two shorter prefix pairs.',
            whatNext:
              j < n
                ? `Compare '${c1}' with '${s2[j]}' in dp[${i}][${j + 1}].`
                : i < m
                  ? `Row ${i} is filled; move to row ${i + 1} with '${s1[i]}'.`
                  : `Table complete with dp[${m}][${n}] = ${dp[m][n]}; reconstruct the string from the bottom-right corner.`,
          },
        });
        if (isMatch && !firstMatchMilestone) firstMatchMilestone = true;
        if (genuineChoice) maxChoiceCheckpointAdded = true;
      }
    }

    pushFrame({
      codeLine: lastCellLine,
      action: 'TABLE_COMPLETE',
      explanation: `Table filled: dp[${m}][${n}] = ${dp[m][n]}, so the LCS of "${s1}" and "${s2}" has length ${dp[m][n]} (${matches} match cell(s), ${mismatches} max cell(s)).`,
      variables: { length: dp[m][n], matches, mismatches, cells: filled },
      milestone: 'Table Complete',
      soundCue: 'complete',
      pedagogy: {
        what: `All ${filled} decisions are done; the bottom-right cell answers the original question with ${dp[m][n]}.`,
        why: 'Every cell was computed from already-known cells (above, left, diagonal), so no subproblem is ever recomputed.',
        whatNext: `Start the reconstruction at dp[${m}][${n}] and walk back to a zero border.`,
      },
    });

    // ─── reconstruction ───
    phase = 'backtrack';
    let bi = m;
    let bj = n;
    currentI = bi;
    currentJ = bj;
    sourceCells = [];
    candidate = null;
    backtrackPath.push([bi, bj]);

    pushFrame({
      codeLine: 10,
      action: 'BACKTRACK_START',
      explanation: `Reconstruction starts at dp[${m}][${n}] = ${dp[m][n]} with an empty character stack; each move follows the dependency that produced the current cell.`,
      variables: { i: bi, j: bj, 'dp[i][j]': dp[bi][bj], taken: '' },
      soundCue: 'start',
      pedagogy: {
        what: `The walk begins at the bottom-right cell (${bi}, ${bj}), which holds the final answer ${dp[bi][bj]}.`,
        why: 'The table only stores lengths; walking back through the dependencies recovers which characters were actually used.',
        whatNext: `Check whether str1[${bi - 1}] and str2[${bj - 1}] match at this cell.`,
      },
    });

    while (bi > 0 && bj > 0) {
      const c1 = s1[bi - 1];
      const c2 = s2[bj - 1];
      currentI = bi;
      currentJ = bj;
      backtrackSteps++;

      if (c1 === c2) {
        takenChars.push(c1);
        // The walk already recorded this cell; only the moves add new cells.
        sourceCells = [[bi - 1, bj - 1]];
        pushFrame({
          codeLine: 13,
          action: 'BT_TAKE',
          explanation: `'${c1}' == '${c2}' at (${bi}, ${bj}): take '${c1}' into the stack — it is the ${takenChars.length === 1 ? 'last' : `#${takenChars.length}`} character of the LCS.`,
          conditionEval: { expr: `str1[${bi - 1}] == str2[${bj - 1}]`, condition: `'${c1}' == '${c2}'`, result: true },
          variables: { i: bi, j: bj, char: c1, takenSoFar: [...takenChars].reverse().join(''), backtrackSteps },
          soundCue: 'success',
          checkpoint:
            !backtrackCheckpointAdded
              ? {
                  id: 'lcs-backtrack-first-step',
                  question: `At (${bi}, ${bj}) the characters match and dp[${bi}][${bj}] = dp[${bi - 1}][${bj - 1}] + 1. What must the reconstruction do?`,
                  options: [
                    'Take the character and step diagonally',
                    'Step up, dropping a character of str1',
                    'Step left, dropping a character of str2',
                  ],
                  correctIndex: 0,
                  explanation: 'A match is exactly the diagonal dependency "+1", so the character is part of the LCS and both indices move one step back.',
                  hint: 'Look which neighbour the cell value came from.',
                }
              : undefined,
          pedagogy: {
            what: `The characters agree, so '${c1}' is part of the answer and is pushed onto the stack.`,
            why: 'If the cell value came from the diagonal, then this pair was used by the optimal solution.',
            whatNext: 'Step diagonally to (i-1, j-1) and continue the walk.',
          },
        });
        backtrackCheckpointAdded = true;

        bi--;
        bj--;
        sourceCells = bi > 0 && bj > 0 ? [[bi, bj]] : [];
        backtrackPath.push([bi, bj]);
        pushFrame({
          codeLine: 14,
          action: 'BT_MOVE',
          explanation: `Step diagonally to (${bi}, ${bj})${bi === 0 || bj === 0 ? ' — the zero border, so the walk stops' : ` where dp[${bi}][${bj}] = ${dp[bi][bj]}`}.`,
          variables: { i: bi, j: bj, takenSoFar: [...takenChars].reverse().join('') },
          soundCue: 'step',
          pedagogy: {
            what: `Both indices decrease, consuming one character of each string.`,
            why: 'A diagonal move marks a matched pair; nothing is skipped on either side.',
            whatNext: bi > 0 && bj > 0 ? `Inspect dp[${bi}][${bj}] = ${dp[bi][bj]} and decide the next move.` : 'The walk reached a zero border, so the stack is complete.',
          },
        });
      } else {
        const top = dp[bi - 1][bj];
        const left = dp[bi][bj - 1];
        const goUp = top >= left;
        sourceCells = goUp ? [[bi - 1, bj]] : [[bi, bj - 1]];
        pushFrame({
          codeLine: goUp ? 16 : 18,
          action: 'BT_MOVE',
          explanation: goUp
            ? `'${c1}' != '${c2}': dp[${bi}][${bj}] = ${dp[bi][bj]} came from above (dp[${bi - 1}][${bj}] = ${top} vs left dp[${bi}][${bj - 1}] = ${left}), so '${c1}' is dropped and i moves up.`
            : `'${c1}' != '${c2}': dp[${bi}][${bj}] = ${dp[bi][bj]} came from the left (left dp[${bi}][${bj - 1}] = ${left} > above dp[${bi - 1}][${bj}] = ${top}), so '${c2}' is dropped and j moves left.`,
          conditionEval: {
            expr: `dp[${bi - 1}][${bj}] >= dp[${bi}][${bj - 1}]`,
            condition: `${top} >= ${left}`,
            result: goUp,
          },
          variables: { i: bi, j: bj, top, left, 'dp[i][j]': dp[bi][bj], move: goUp ? 'up' : 'left', dropped: goUp ? c1 : c2 },
          soundCue: 'discard',
          checkpoint:
            !backtrackCheckpointAdded
              ? {
                  id: 'lcs-backtrack-first-step',
                  question: `dp[${bi}][${bj}] = ${dp[bi][bj]} differs from the diagonal, so the character pair was not used. Which neighbour produced the value?`,
                  options: goUp
                    ? [`Above: dp[${bi - 1}][${bj}] = ${top} (${top} >= ${left})`, `Left: dp[${bi}][${bj - 1}] = ${left}`, `Both: dp[${bi}][${bj}] = ${top + left}`]
                    : [`Left: dp[${bi}][${bj - 1}] = ${left} (${left} > ${top})`, `Above: dp[${bi - 1}][${bj}] = ${top}`, `Both: dp[${bi}][${bj}] = ${top + left}`],
                  correctIndex: 0,
                  explanation: `The reconstruction always follows the larger neighbour because that is the value the cell copied; ties break upwards.`,
                  hint: 'Compare the cell with its top and left neighbours.',
                }
              : undefined,
          pedagogy: {
            what: goUp
              ? `The value copied from above, so '${c1}' is not part of this LCS and the walk moves up.`
              : `The value copied from the left, so '${c2}' is not part of this LCS and the walk moves left.`,
            why: `dp[${bi}][${bj}] records a length, not a decision; checking which neighbour equals the value recovers the decision that was made while filling the table.`,
            whatNext: goUp ? `Inspect dp[${bi - 1}][${bj}] = ${top} next.` : `Inspect dp[${bi}][${bj - 1}] = ${left} next.`,
          },
        });
        backtrackCheckpointAdded = true;

        backtrackPath.push(goUp ? [bi - 1, bj] : [bi, bj - 1]);
        if (goUp) bi--;
        else bj--;
      }
    }

    currentI = bi;
    currentJ = bj;
    sourceCells = [];
    phase = 'done';
    const finalLcs = [...takenChars].reverse().join('');

    pushFrame({
      codeLine: 19,
      action: 'DONE',
      explanation: `Reconstruction finished at (${bi}, ${bj}): the LCS of "${s1}" and "${s2}" is "${finalLcs}" with length ${finalLcs.length} (= dp[${m}][${n}] = ${dp[m][n]}).`,
      variables: {
        result: finalLcs,
        length: finalLcs.length,
        tableLength: dp[m][n],
        matches,
        mismatches,
        backtrackSteps,
      },
      milestone: 'LCS Reconstructed',
      soundCue: 'finish',
      pedagogy: {
        what: `The stack holds ${finalLcs.length} character(s), read back in reverse as "${finalLcs}".`,
        why: 'The reconstruction length always equals dp[m][n]; if it did not, the walk followed a wrong dependency.',
        whatNext: 'Compare presets: identical strings take the diagonal everywhere, disjoint strings never match.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<LCSState>) => {
    const {
      str1,
      str2,
      table,
      currentI,
      currentJ,
      sourceCells,
      candidate,
      backtrackPath,
      takenChars,
      lcsString,
      phase,
      stats,
      isComplete,
    } = frame.state;

    const m = str1.length;
    const n = str2.length;
    const sourceSet = new Set(sourceCells.map(([i, j]) => `${i}:${j}`));
    const pathSet = new Set(backtrackPath.map(([i, j]) => `${i}:${j}`));
    const takenKeys = new Set(backtrackPath.filter(([i, j]) => table[i]?.[j] !== undefined && i > 0 && j > 0 && str1[i - 1] === str2[j - 1]).map(([i, j]) => `${i}:${j}`));

    const formula =
      candidate === null
        ? phase === 'table'
          ? 'if str1[i-1] == str2[j-1] → dp[i-1][j-1] + 1, else → max(top, left)'
          : 'follow the dependency of each cell: diagonal on a match, larger neighbour otherwise'
        : candidate.kind === 'match'
          ? `dp[${candidate.i}][${candidate.j}] = dp[${candidate.i - 1}][${candidate.j - 1}] + 1 = ${candidate.diag} + 1 = ${candidate.value}`
          : `dp[${candidate.i}][${candidate.j}] = max(top ${candidate.top}, left ${candidate.left}) = ${candidate.value}${candidate.top === candidate.left ? ' (tie → either neighbour is valid)' : ''}`;

    const cellClass = (rowIdx: number, colIdx: number): string => {
      const key = `${rowIdx}:${colIdx}`;
      const isActive = rowIdx === currentI && colIdx === currentJ;
      if (isActive) return 'bg-amber-500/30 border-2 border-amber-400 text-amber-100 font-extrabold';
      if (sourceSet.has(key)) return 'bg-indigo-500/25 border-2 border-indigo-400 text-indigo-100 font-bold';
      if (phase !== 'table' && takenKeys.has(key)) return 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-100 font-extrabold';
      if (phase !== 'table' && pathSet.has(key)) return 'bg-emerald-900/40 border border-emerald-700 text-emerald-200';
      return 'bg-[#0E1420] text-slate-300 border border-[#1F293D]';
    };

    return (
      <div className="flex w-full h-full flex-col justify-between gap-3 p-4 bg-[#0B0F19] rounded-2xl border border-[#1F293D] select-none">
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400">Rows:</span>{' '}
              <span className="font-bold text-cyan-300">"{str1}"</span>
            </div>
            <div>
              <span className="text-slate-400">Cols:</span>{' '}
              <span className="font-bold text-amber-300">"{str2}"</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase ${
                phase === 'table' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40' : 'bg-violet-500/20 text-violet-200 border border-violet-500/40'
              }`}
            >
              {phase === 'table' ? 'filling table' : phase === 'backtrack' ? 'reconstruction' : 'done'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              matches <span className="font-bold text-emerald-300">{stats.matches}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              max cells <span className="font-bold text-indigo-300">{stats.mismatches}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              filled <span className="font-bold text-cyan-300">{stats.filled}</span>/{(m * n).toString()}
            </span>
            <span className={`rounded-md px-2 py-0.5 font-bold ${isComplete ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-200' : 'bg-[#1F2937] text-slate-300'}`}>
              {isComplete ? `LCS "${lcsString}" (${lcsString.length})` : `dp[${m}][${n}] = ${table[m]?.[n] ?? 0}`}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 font-mono text-[11px] text-slate-200">
          {formula}
        </div>

        <div className="flex-1 flex items-start justify-center overflow-auto max-h-[340px] p-1">
          <table className="border-collapse font-mono text-xs">
            <thead>
              <tr>
                <th className="p-2 border border-[#1F293D] bg-[#111827] text-slate-500 text-[10px]">i \ j</th>
                <th className="p-2 border border-[#1F293D] bg-[#111827] text-slate-400 text-[10px]">ε</th>
                {str2.split('').map((char, j) => (
                  <th
                    key={`col-${j}`}
                    className={`p-2 border border-[#1F293D] text-xs font-bold ${
                      j + 1 === currentJ && phase === 'table' ? 'bg-amber-500/20 text-amber-300' : 'bg-[#111827] text-amber-300'
                    }`}
                  >
                    {char}
                    <div className="text-[8px] font-normal text-slate-500">[{j + 1}]</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="p-2 border border-[#1F293D] bg-[#111827] text-slate-400 text-[10px]">ε</th>
                {table[0]?.map((val, colIdx) => (
                  <td key={`r0-c${colIdx}`} className="p-2.5 border border-[#1F293D] text-center text-slate-500 bg-[#0B0F19]">
                    {val}
                  </td>
                ))}
              </tr>
              {str1.split('').map((char, i) => {
                const rowIdx = i + 1;
                const isRowActive = rowIdx === currentI;
                return (
                  <tr key={`row-${rowIdx}`}>
                    <th
                      className={`p-2 border border-[#1F293D] text-xs font-bold ${
                        isRowActive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-[#111827] text-cyan-300'
                      }`}
                    >
                      {char}
                      <div className="text-[8px] font-normal text-slate-500">[{rowIdx}]</div>
                    </th>
                    {table[rowIdx]?.map((val, colIdx) => {
                      const isTaken = takenKeys.has(`${rowIdx}:${colIdx}`);
                      return (
                        <td key={`cell-${rowIdx}-${colIdx}`} className={`p-2.5 text-center transition-all ${cellClass(rowIdx, colIdx)}`}>
                          <div>{val}</div>
                          {isTaken && <div className="text-[8px] leading-none text-emerald-300">take</div>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1F293D] bg-[#111827] px-4 py-2 font-mono text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border-2 border-amber-400 bg-amber-500/30" /> active cell
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border-2 border-indigo-400 bg-indigo-500/25" /> dependency of the active cell
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border-2 border-emerald-400 bg-emerald-500/30" /> LCS character / walk
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">taken stack (reversed):</span>
            {takenChars.length === 0 ? (
              <span className="text-slate-600">empty</span>
            ) : (
              [...takenChars].reverse().map((char, index) => (
                <span key={`${char}-${index}`} className="rounded border border-emerald-600 bg-emerald-900/40 px-1.5 py-0.5 font-bold text-emerald-200">
                  {char}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    );
  },
};
