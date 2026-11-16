import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface EditDistanceInput {
  word1: string;
  word2: string;
}

export type EditOp = 'MATCH' | 'INSERT' | 'DELETE' | 'REPLACE' | 'NONE';

export interface EditCandidate {
  i: number;
  j: number;
  kind: 'match' | 'mismatch';
  deleteCost: number;
  insertCost: number;
  replaceCost: number;
  chosen: EditOp;
  value: number;
}

export interface EditStep {
  op: Exclude<EditOp, 'NONE'>;
  /** Character of word1 involved (empty for INSERT). */
  from: string;
  /** Character of word2 involved (empty for DELETE). */
  to: string;
  i: number;
  j: number;
}

export interface EditDistanceState {
  word1: string;
  word2: string;
  dpTable: number[][];
  currentI: number;
  currentJ: number;
  operationType: EditOp;
  optimalEdits: number;
  /** Cells the active cell depends on. */
  sourceCells: [number, number][];
  candidate: EditCandidate | null;
  phase: 'base' | 'table' | 'backtrack' | 'done';
  /** Operations recovered by the walk, in execution order. */
  editScript: EditStep[];
  walkPath: [number, number][];
  stats: { cells: number; matches: number; mismatches: number; backtrackSteps: number };
}

const MAX_SIDE = 8;

function normalise(value: unknown, fallback: string): { text: string; notes: string[] } {
  const notes: string[] = [];
  const original = typeof value === 'string' ? value : fallback;
  let text = original.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (text !== original.toUpperCase()) notes.push(`removed non-alphanumeric characters from "${original}"`);
  if (text.length === 0) notes.push(`"${original}" has no alphanumeric characters, so it is treated as an empty word`);
  if (text.length > MAX_SIDE) {
    notes.push(`"${text}" truncated to ${MAX_SIDE} characters for a readable table`);
    text = text.slice(0, MAX_SIDE);
  }
  return { text, notes };
}

function describeStep(step: EditStep): string {
  if (step.op === 'MATCH') return `keep '${step.from}'`;
  if (step.op === 'DELETE') return `delete '${step.from}'`;
  if (step.op === 'INSERT') return `insert '${step.to}'`;
  return `replace '${step.from}' with '${step.to}'`;
}

export const editDistanceModule: AlgorithmModule<EditDistanceInput, EditDistanceState> = {
  id: 'edit-distance',
  title: 'Edit Distance (Levenshtein Distance)',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  relatedModules: [
    { id: 'longest-common-subsequence', label: 'LCS' },
    { id: 'longest-palindromic-substring', label: 'Longest Palindromic Substring' },
    { id: 'coin-change', label: 'Coin Change' },
  ],
  complexity: {
    timeBest: 'O(M · N)',
    timeAverage: 'O(M · N)',
    timeWorst: 'O(M · N)',
    spaceAuxiliary: 'O(M · N) table, O(M + N) for the edit script walk',
    worstCaseCondition: 'Every prefix pair is evaluated; words with no common characters still fill the whole table',
  },
  theory: {
    overview:
      'Edit distance (Levenshtein) counts the minimum number of single-character insertions, deletions and replacements needed to turn word1 into word2. It powers spell checkers, diff tools and DNA alignment.',
    whyItWorks:
      'dp[i][j] is the distance between the prefixes word1[0..i-1] and word2[0..j-1]. Equal last characters cost nothing, so dp[i][j] = dp[i-1][j-1]. Otherwise exactly one of the three operations is used last, so dp[i][j] = 1 + min(delete dp[i-1][j], insert dp[i][j-1], replace dp[i-1][j-1]). Row 0 / column 0 are the pure-insert / pure-delete borders: dp[i][0] = i and dp[0][j] = j.',
    invariant:
      'Every finished cell equals the minimum edit distance of its two prefixes, and the walk always follows a predecessor whose cost plus the operation equals the current cell.',
    pitfalls: [
      'Base cases are real work, not decoration: turning a prefix into the empty word costs one deletion per character.',
      'A replacement can be more expensive than a delete+insert pair; the min() must consider all three candidates at once.',
      'Ties are resolved by the code order (delete, then insert, then replace), so several different scripts can share the same distance.',
      'Off-by-one mapping between the 1-based table and the 0-based characters: dp[i][j] talks about word1[i-1] and word2[j-1].',
    ],
    steps: [
      'Allocate the (M+1)×(N+1) table and fill the borders dp[i][0] = i and dp[0][j] = j.',
      'For every inner cell compare the characters: equal → copy the diagonal, otherwise 1 + min of the three neighbours.',
      'Start the walk at dp[M][N] and emit the operation that explains the cell.',
      'Equal characters → keep the character and step diagonally.',
      'Otherwise follow the neighbour that realises the value (delete, insert, then replace) and record the operation.',
    ],
    watchOut: [
      'The chips under the table are the recovered script: applying them left to right turns word1 into word2.',
      'The script length always equals dp[M][N], which is the check that the walk used the same tie-break as the table fill.',
    ],
  },
  defaultInput: { word1: 'HORSE', word2: 'ROS' },
  presets: [
    { id: 'horse-ros', label: 'HORSE → ROS', description: 'Classic LeetCode 72 input: 3 edits (distance 3)', data: { word1: 'HORSE', word2: 'ROS' } },
    { id: 'kitten-sitting', label: 'KITTEN → SITTING', description: 'Textbook input from Wikipedia: 3 edits (k→s, e→i, insert g)', data: { word1: 'KITTEN', word2: 'SITTING' } },
    { id: 'single-char', label: 'CAT → CAR', description: 'A single replacement: distance 1', data: { word1: 'CAT', word2: 'CAR' } },
    { id: 'same-words', label: 'SAME → SAME', description: 'Identical words: every cell copies the diagonal, distance 0', data: { word1: 'SAME', word2: 'SAME' } },
    { id: 'append-suffix', label: 'CAT → CATS', description: 'Pure insertion: the walk emits one INSERT and nothing else', data: { word1: 'CAT', word2: 'CATS' } },
  ],
  codeSnippets: {
    pseudocode: `function editDistance(A, B):
    m = length(A); n = length(B)
    D = (m + 1) x (n + 1) matrix of zeros
    for i = 0 to m: D[i][0] = i
    for j = 0 to n: D[0][j] = j
    for i = 1 to m:
        for j = 1 to n:
            if A[i-1] == B[j-1]:
                D[i][j] = D[i-1][j-1]
            else:
                D[i][j] = 1 + min(D[i-1][j], D[i][j-1], D[i-1][j-1])
    i = m; j = n; ops = []
    while i > 0 or j > 0:
        if i > 0 and j > 0 and A[i-1] == B[j-1]:
            i = i - 1; j = j - 1
        else if i > 0 and D[i][j] == D[i-1][j] + 1:
            ops.push(DELETE A[i-1]); i = i - 1
        else if j > 0 and D[i][j] == D[i][j-1] + 1:
            ops.push(INSERT B[j-1]); j = j - 1
        else:
            ops.push(REPLACE A[i-1] -> B[j-1]); i = i - 1; j = j - 1
    return reverse(ops), D[m][n]`,
    python: `def edit_distance(A, B):
    m, n = len(A), len(B)
    D = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): D[i][0] = i
    for j in range(n + 1): D[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if A[i - 1] == B[j - 1]:
                D[i][j] = D[i - 1][j - 1]
            else:
                D[i][j] = 1 + min(D[i - 1][j], D[i][j - 1], D[i - 1][j - 1])
    i, j, ops = m, n, []
    while i > 0 or j > 0:
        if i > 0 and j > 0 and A[i - 1] == B[j - 1]:
            i, j = i - 1, j - 1
        elif i > 0 and D[i][j] == D[i - 1][j] + 1:
            ops.append(f"DELETE {A[i - 1]}"); i -= 1
        elif j > 0 and D[i][j] == D[i][j - 1] + 1:
            ops.append(f"INSERT {B[j - 1]}"); j -= 1
        else:
            ops.append(f"REPLACE {A[i - 1]}->{B[j - 1]}"); i, j = i - 1, j - 1
    return list(reversed(ops)), D[m][n]`,
    typescript: `function editDistance(A: string, B: string): [string[], number] {
  const m = A.length, n = B.length;
  const D = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) D[i][0] = i;
  for (let j = 0; j <= n; j++) D[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (A[i - 1] === B[j - 1]) {
        D[i][j] = D[i - 1][j - 1]; }
      else {
        D[i][j] = 1 + Math.min(D[i - 1][j], D[i][j - 1], D[i - 1][j - 1]); } } }
  let i = m, j = n; const ops: string[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && A[i - 1] === B[j - 1]) {
      i--; j--; }
    else if (i > 0 && D[i][j] === D[i - 1][j] + 1) {
      ops.push(\`DELETE \${A[i - 1]}\`); i--; }
    else if (j > 0 && D[i][j] === D[i][j - 1] + 1) {
      ops.push(\`INSERT \${B[j - 1]}\`); j--; }
    else {
      ops.push(\`REPLACE \${A[i - 1]}->\${B[j - 1]}\`); i--; j--; } }
  return [ops.reverse(), D[m][n]];
}`,
    cpp: `int editDistance(string A, string B, vector<string>& ops) {
    int m = A.size(), n = B.size();
    vector<vector<int>> D(m + 1, vector<int>(n + 1, 0));
    for (int i = 0; i <= m; i++) D[i][0] = i;
    for (int j = 0; j <= n; j++) D[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (A[i - 1] == B[j - 1]) {
                D[i][j] = D[i - 1][j - 1]; }
            else {
                D[i][j] = 1 + min({D[i - 1][j], D[i][j - 1], D[i - 1][j - 1]}); } } }
    int i = m, j = n;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && A[i - 1] == B[j - 1]) {
            i--; j--; }
        else if (i > 0 && D[i][j] == D[i - 1][j] + 1) {
            ops.push_back("DELETE " + string(1, A[i - 1])); i--; }
        else if (j > 0 && D[i][j] == D[i][j - 1] + 1) {
            ops.push_back("INSERT " + string(1, B[j - 1])); j--; }
        else {
            ops.push_back("REPLACE " + string(1, A[i - 1]) + "->" + string(1, B[j - 1])); i--; j--; } }
    reverse(ops.begin(), ops.end()); return D[m][n]; }`,
    java: `public int editDistance(String A, String B, List<String> ops) {
    int m = A.length(), n = B.length();
    int[][] D = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) D[i][0] = i;
    for (int j = 0; j <= n; j++) D[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (A.charAt(i - 1) == B.charAt(j - 1)) {
                D[i][j] = D[i - 1][j - 1]; }
            else {
                D[i][j] = 1 + Math.min(D[i - 1][j], Math.min(D[i][j - 1], D[i - 1][j - 1])); } } }
    int i = m, j = n;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && A.charAt(i - 1) == B.charAt(j - 1)) {
            i--; j--; }
        else if (i > 0 && D[i][j] == D[i - 1][j] + 1) {
            ops.add("DELETE " + A.charAt(i - 1)); i--; }
        else if (j > 0 && D[i][j] == D[i][j - 1] + 1) {
            ops.add("INSERT " + B.charAt(j - 1)); j--; }
        else {
            ops.add("REPLACE " + A.charAt(i - 1) + "->" + B.charAt(j - 1)); i--; j--; } }
    Collections.reverse(ops); return D[m][n]; }`,
  },
  generateTimeline: (input: EditDistanceInput): ExecutionFrame<EditDistanceState>[] => {
    const first = normalise(input?.word1, 'HORSE');
    const second = normalise(input?.word2, 'ROS');
    const word1 = first.text;
    const word2 = second.text;
    const notes = [...first.notes, ...second.notes];
    const m = word1.length;
    const n = word2.length;

    const D: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    const frames: ExecutionFrame<EditDistanceState>[] = [];
    const editScript: EditStep[] = [];
    const walkPath: [number, number][] = [];

    let cells = 0;
    let matches = 0;
    let mismatches = 0;
    let backtrackSteps = 0;
    let currentI = 0;
    let currentJ = 0;
    let operationType: EditOp = 'NONE';
    let sourceCells: [number, number][] = [];
    let candidate: EditCandidate | null = null;
    let phase: EditDistanceState['phase'] = 'base';
    let lastCellLine = 11;

    let choiceCheckpointAdded = false;
    let backtrackCheckpointAdded = false;
    let baseRowMilestone = false;
    let baseColMilestone = false;
    let firstReplaceMilestone = false;

    const stats = () => ({ cells, matches, mismatches, backtrackSteps });

    const snapshot = (overrides: Partial<EditDistanceState> = {}): EditDistanceState => ({
      word1,
      word2,
      dpTable: D.map((row) => [...row]),
      currentI,
      currentJ,
      operationType,
      optimalEdits: phase === 'done' ? D[m][n] : D[currentI]?.[currentJ] ?? 0,
      sourceCells: sourceCells.map(([i, j]) => [i, j] as [number, number]),
      candidate,
      phase,
      editScript: editScript.map((step) => ({ ...step })),
      walkPath: walkPath.map(([i, j]) => [i, j] as [number, number]),
      stats: stats(),
      ...overrides,
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<EditDistanceState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<EditDistanceState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      callName?: string;
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
            name: opts.callName ?? (phase === 'backtrack' || phase === 'done' ? 'reconstruct(D, A, B)' : 'editDistance(A, B)'),
            params: { m, n, ...(currentI > 0 || currentJ > 0 ? { i: currentI, j: currentJ } : {}) },
            line: opts.codeLine,
            isCurrent: true,
          },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: cells + backtrackSteps, accesses: cells, lookups: backtrackSteps },
        invariantStatus: {
          label:
            phase === 'base'
              ? 'Borders: dp[i][0] = i deletions, dp[0][j] = j insertions'
              : phase === 'table'
                ? `dp[${currentI}][${currentJ}] = ${D[currentI]?.[currentJ] ?? 0} = edit distance of "${word1.slice(0, currentI)}" and "${word2.slice(0, currentJ)}"`
                : `Recovered script has ${editScript.length} operation(s); applying them turns "${word1}" into "${word2}"`,
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
        `Allocate the (M+1)×(N+1) = ${m + 1}×${n + 1} cost table for "${word1}" → "${word2}"; the borders will hold pure deletion / insertion costs.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      variables: {
        word1,
        word2,
        m,
        n,
        cells: (m + 1) * (n + 1),
        decisions: m * n,
      },
      soundCue: 'start',
      pedagogy: {
        what: `The table has ${m + 1} row(s) and ${n + 1} column(s); dp[i][j] will hold the distance between the two prefixes.`,
        why: 'Row 0 and column 0 are not padding: they describe how many deletions or insertions a prefix needs to become empty.',
        whatNext: `Fill the left border: dp[i][0] = i for i = 1..${m}.`,
      },
    });

    if (m === 0 || n === 0) {
      phase = 'done';
      const inserts = n;
      const deletes = m;
      // The borders are the whole problem here, so the script is forced.
      for (let idx = 1; idx <= n; idx++) {
        editScript.push({ op: 'INSERT', from: '', to: word2[idx - 1], i: 0, j: idx });
      }
      for (let idx = 1; idx <= m; idx++) {
        editScript.push({ op: 'DELETE', from: word1[idx - 1], to: '', i: idx, j: 0 });
      }
      pushFrame({
        codeLine: 22,
        action: 'DONE',
        explanation:
          inserts > 0
            ? `One word is empty, so the script is ${inserts} insertion(s): ${word2.split('').map((char) => `insert '${char}'`).join(' → ')}.`
            : deletes > 0
              ? `One word is empty, so the script is ${deletes} deletion(s): ${word1.split('').map((char) => `delete '${char}'`).join(' → ')}.`
              : 'Both words are empty, so the distance is 0.',
        variables: {
          distance: inserts + deletes,
          inserts,
          deletes,
          script: editScript.map(describeStep).join(' → ') || '(no edits needed)',
        },
        milestone: 'Edit Script Reconstructed',
        soundCue: 'finish',
        pedagogy: {
          what: 'With one empty prefix there is only one kind of operation available.',
          why: 'The base cases dp[i][0] = i and dp[0][j] = j are exactly these pure runs of deletions and insertions.',
          whatNext: 'Edit the words to compare two non-empty inputs.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    for (let i = 1; i <= m; i++) {
      D[i][0] = i;
      currentI = i;
      currentJ = 0;
      operationType = 'DELETE';
      sourceCells = [[i - 1, 0]];
      candidate = null;
      pushFrame({
        codeLine: 4,
        action: 'BASE_ROW',
        explanation: `Base case dp[${i}][0] = ${i}: turning "${word1.slice(0, i)}" into the empty prefix costs ${i} deletion(s).`,
        variables: { i, 'dp[i][0]': i, deletions: i },
        milestone: i === m && !baseRowMilestone ? 'Left Border Filled' : undefined,
        soundCue: 'step',
        pedagogy: {
          what: `The left border cell dp[${i}][0] = ${i} is one deletion per remaining character.`,
          why: 'Deleting is the only way to remove characters, so this cost grows by exactly one per row.',
          whatNext: i < m ? `Fill dp[${i + 1}][0] = ${i + 1}.` : `Fill the top border dp[0][j] = j for j = 1..${n}.`,
        },
      });
      if (i === m) baseRowMilestone = true;
    }

    for (let j = 1; j <= n; j++) {
      D[0][j] = j;
      currentI = 0;
      currentJ = j;
      operationType = 'INSERT';
      sourceCells = [[0, j - 1]];
      candidate = null;
      pushFrame({
        codeLine: 5,
        action: 'BASE_COL',
        explanation: `Base case dp[0][${j}] = ${j}: building "${word2.slice(0, j)}" from the empty prefix costs ${j} insertion(s).`,
        variables: { j, 'dp[0][j]': j, insertions: j },
        milestone: j === n && !baseColMilestone ? 'Top Border Filled' : undefined,
        soundCue: 'step',
        pedagogy: {
          what: `The top border cell dp[0][${j}] = ${j} is one insertion per character of "${word2}".`,
          why: 'The empty word can only grow by insertions, so this cost grows by exactly one per column.',
          whatNext: j < n ? `Fill dp[0][${j + 1}] = ${j + 1}.` : `Borders are ready; fill the inner cell dp[1][1].`,
        },
      });
      if (j === n) baseColMilestone = true;
    }

    phase = 'table';
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const c1 = word1[i - 1];
        const c2 = word2[j - 1];
        const isMatch = c1 === c2;
        const deleteCost = D[i - 1][j];
        const insertCost = D[i][j - 1];
        const replaceCost = D[i - 1][j - 1];
        const minCost = Math.min(deleteCost, insertCost, replaceCost);
        let chosen: EditOp;
        if (isMatch) chosen = 'MATCH';
        else if (minCost === deleteCost) chosen = 'DELETE';
        else if (minCost === insertCost) chosen = 'INSERT';
        else chosen = 'REPLACE';
        D[i][j] = isMatch ? replaceCost : 1 + minCost;
        const value = D[i][j];

        cells++;
        if (isMatch) matches++;
        else mismatches++;

        currentI = i;
        currentJ = j;
        operationType = chosen;
        sourceCells = isMatch ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1], [i - 1, j - 1]];
        candidate = { i, j, kind: isMatch ? 'match' : 'mismatch', deleteCost, insertCost, replaceCost, chosen, value };
        lastCellLine = isMatch ? 9 : 11;

        const allDistinct = !isMatch && deleteCost !== insertCost && insertCost !== replaceCost && deleteCost !== replaceCost;
        const distinctCosts = new Set([deleteCost, insertCost, replaceCost]).size;

        pushFrame({
          codeLine: isMatch ? 9 : 11,
          action: isMatch ? 'CELL_MATCH' : 'CELL_MISMATCH',
          explanation: isMatch
            ? `'${c1}' == '${c2}': the characters can stay, so dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${value} with cost 0.`
            : `'${c1}' != '${c2}': costs are delete ${deleteCost} + 1 = ${deleteCost + 1}, insert ${insertCost} + 1 = ${insertCost + 1}, replace ${replaceCost} + 1 = ${replaceCost + 1} → best is ${chosen} with dp[${i}][${j}] = ${value}.`,
          conditionEval: isMatch
            ? { expr: `word1[${i - 1}] == word2[${j - 1}]`, condition: `'${c1}' == '${c2}'`, result: true }
            : {
                expr: `1 + min(${deleteCost}, ${insertCost}, ${replaceCost})`,
                condition: `1 + ${minCost} = ${value}`,
                result: value,
                formatted: `${chosen} (cost 1 + ${minCost})`,
              },
          variables: {
            i,
            j,
            'word1[i-1]': c1,
            'word2[j-1]': c2,
            match: isMatch,
            deleteCost: deleteCost + 1,
            insertCost: insertCost + 1,
            replaceCost: replaceCost + 1,
            chosen,
            'dp[i][j]': value,
            cellsFilled: cells,
          },
          milestone: chosen === 'REPLACE' && !firstReplaceMilestone ? 'First Substitution' : undefined,
          soundCue: isMatch ? 'success' : 'compare',
          checkpoint:
            allDistinct && !choiceCheckpointAdded
              ? {
                  id: 'edit-distance-cheapest-op',
                  question: `dp[${i}][${j}] for '${c1}' vs '${c2}': delete costs 1 + ${deleteCost} = ${deleteCost + 1}, insert 1 + ${insertCost} = ${insertCost + 1}, replace 1 + ${replaceCost} = ${replaceCost + 1}. Which combination is cheapest?`,
                  options: [
                    `${chosen} → dp[${i}][${j}] = ${value}`,
                    `always replace → dp[${i}][${j}] = ${replaceCost + 1}`,
                    `always delete → dp[${i}][${j}] = ${deleteCost + 1}`,
                  ],
                  correctIndex: 0,
                  explanation: `The recurrence takes the smallest candidate over all three operations, here ${chosen}, giving ${value}.`,
                  hint: 'Compare the three candidate cells before deciding.',
                }
              : undefined,
          pedagogy: {
            what: isMatch
              ? `Identical characters are free, so dp[${i}][${j}] copies the diagonal cost ${replaceCost}.`
              : `${chosen} wins the min() of the three candidates, so dp[${i}][${j}] = 1 + ${minCost} = ${value}.`,
            why: isMatch
              ? 'Keeping an equal character never increases the distance, so no operation can do better.'
              : `Every edit sequence ends with exactly one of delete/insert/replace; taking the cheapest predecessor cannot be beaten.${
                  distinctCosts < 3 ? ' Two candidates tie here, and the code order (delete → insert → replace) breaks the tie.' : ''
                }`,
            whatNext:
              j < n
                ? `Compare '${c1}' with '${word2[j]}' in dp[${i}][${j + 1}].`
                : i < m
                  ? `Row ${i} is done; continue with '${word1[i]}' in the next row.`
                  : `Table complete with dp[${m}][${n}] = ${D[m][n]}; recover the edits from the bottom-right corner.`,
          },
        });
        if (chosen === 'REPLACE' && !firstReplaceMilestone) firstReplaceMilestone = true;
        if (allDistinct) choiceCheckpointAdded = true;
      }
    }

    pushFrame({
      codeLine: lastCellLine,
      action: 'TABLE_COMPLETE',
      explanation: `Cost table filled: dp[${m}][${n}] = ${D[m][n]}, so "${word1}" needs ${D[m][n]} edit(s) to become "${word2}" (${matches} free match cell(s), ${mismatches} cost cell(s)).`,
      variables: { distance: D[m][n], matches, mismatches, cells },
      milestone: 'Cost Table Complete',
      soundCue: 'complete',
      pedagogy: {
        what: `All ${cells} inner decisions are done; the corner cell holds the answer ${D[m][n]}.`,
        why: 'Every cell used only already-computed neighbours, so each subproblem was solved exactly once.',
        whatNext: `Start at dp[${m}][${n}] and collect the operations that produced it.`,
      },
    });

    // ─── reconstruction ───
    phase = 'backtrack';
    let i = m;
    let j = n;
    currentI = i;
    currentJ = j;
    sourceCells = [];
    candidate = null;
    operationType = 'NONE';
    walkPath.push([i, j]);

    pushFrame({
      codeLine: 12,
      action: 'BACKTRACK_START',
      explanation: `Walk back from dp[${m}][${n}] = ${D[m][n]} with an empty script; each step emits the operation that explains the current cell.`,
      variables: { i, j, 'dp[i][j]': D[i][j], collected: 0 },
      soundCue: 'start',
      pedagogy: {
        what: `The reconstruction begins at the corner (${i}, ${j}) whose value ${D[i][j]} is the final distance.`,
        why: 'The table stores costs only; walking back recovers which operations realised them.',
        whatNext: `Compare word1[${i - 1}] = '${word1[i - 1]}' with word2[${j - 1}] = '${word2[j - 1]}'.`,
      },
    });

    while (i > 0 || j > 0) {
      backtrackSteps++;
      if (i > 0 && j > 0 && word1[i - 1] === word2[j - 1]) {
        const step: EditStep = { op: 'MATCH', from: word1[i - 1], to: word2[j - 1], i, j };
        editScript.unshift(step);
        currentI = i;
        currentJ = j;
        operationType = 'MATCH';
        sourceCells = [[i - 1, j - 1]];
        pushFrame({
          codeLine: 15,
          action: 'BT_KEEP',
          explanation: `'${word1[i - 1]}' == '${word2[j - 1]}' at (${i}, ${j}): keep the character (cost 0) and step diagonally.`,
          conditionEval: { expr: `word1[${i - 1}] == word2[${j - 1}]`, condition: `'${word1[i - 1]}' == '${word2[j - 1]}'`, result: true },
          variables: { i, j, op: 'keep', char: word1[i - 1], collected: editScript.length },
          soundCue: 'success',
          pedagogy: {
            what: `The characters agree, so the walk takes no operation and moves one step diagonally.`,
            why: 'dp[i][j] = dp[i-1][j-1] here, which is exactly the diagonal dependency.',
            whatNext: `Inspect dp[${i - 1}][${j - 1}] = ${D[i - 1][j - 1]} next.`,
          },
        });
        i--;
        j--;
      } else if (i > 0 && D[i][j] === D[i - 1][j] + 1) {
        const step: EditStep = { op: 'DELETE', from: word1[i - 1], to: '', i, j };
        editScript.unshift(step);
        currentI = i;
        currentJ = j;
        operationType = 'DELETE';
        sourceCells = [[i - 1, j]];
        pushFrame({
          codeLine: 17,
          action: 'BT_DELETE',
          explanation: `dp[${i}][${j}] = ${D[i][j]} = dp[${i - 1}][${j}] + 1 = ${D[i - 1][j]} + 1, so '${word1[i - 1]}' is deleted and i moves up.`,
          conditionEval: { expr: `D[${i}][${j}] == D[${i - 1}][${j}] + 1`, condition: `${D[i][j]} == ${D[i - 1][j]} + 1`, result: true },
          variables: { i, j, op: 'delete', char: word1[i - 1], collected: editScript.length },
          soundCue: 'discard',
          checkpoint:
            !backtrackCheckpointAdded
              ? {
                  id: 'edit-distance-backtrack-first-step',
                  question: `At (${i}, ${j}) the characters differ and dp[${i}][${j}] = ${D[i][j]}. Which operation does the recovered script contain here?`,
                  options: [
                    `delete '${word1[i - 1]}' (dp[${i - 1}][${j}] + 1 = ${D[i][j]})`,
                    `insert '${word2[j - 1]}' (dp[${i}][${j - 1}] + 1 = ${D[i][j - 1] + 1})`,
                    `replace '${word1[i - 1]}' with '${word2[j - 1]}' (cost ${D[i - 1][j - 1] + 1})`,
                  ],
                  correctIndex: 0,
                  explanation: `Only the delete predecessor realises the cell value: ${D[i - 1][j]} + 1 = ${D[i][j]}.`,
                  hint: 'Check which neighbour plus one equals the current cell.',
                }
              : undefined,
          pedagogy: {
            what: `The cell came from above, so the script records a deletion of '${word1[i - 1]}'.`,
            why: 'Moving up keeps word2 fixed and removes one character of word1 — exactly what DELETE means.',
            whatNext: `Continue from dp[${i - 1}][${j}] = ${D[i - 1][j]}.`,
          },
        });
        i--;
      } else if (j > 0 && D[i][j] === D[i][j - 1] + 1) {
        const step: EditStep = { op: 'INSERT', from: '', to: word2[j - 1], i, j };
        editScript.unshift(step);
        currentI = i;
        currentJ = j;
        operationType = 'INSERT';
        sourceCells = [[i, j - 1]];
        pushFrame({
          codeLine: 19,
          action: 'BT_INSERT',
          explanation: `dp[${i}][${j}] = ${D[i][j]} = dp[${i}][${j - 1}] + 1 = ${D[i][j - 1]} + 1, so '${word2[j - 1]}' is inserted and j moves left.`,
          conditionEval: { expr: `D[${i}][${j}] == D[${i}][${j - 1}] + 1`, condition: `${D[i][j]} == ${D[i][j - 1]} + 1`, result: true },
          variables: { i, j, op: 'insert', char: word2[j - 1], collected: editScript.length },
          soundCue: 'insert',
          checkpoint:
            !backtrackCheckpointAdded
              ? {
                  id: 'edit-distance-backtrack-first-step',
                  question: `At (${i}, ${j}) the characters differ and dp[${i}][${j}] = ${D[i][j]}. Which operation does the recovered script contain here?`,
                  options: [
                    `insert '${word2[j - 1]}' (dp[${i}][${j - 1}] + 1 = ${D[i][j]})`,
                    `delete '${word1[i - 1]}' (cost ${D[i - 1][j] + 1})`,
                    `replace '${word1[i - 1]}' with '${word2[j - 1]}' (cost ${D[i - 1][j - 1] + 1})`,
                  ],
                  correctIndex: 0,
                  explanation: `Only the left predecessor realises the cell value: ${D[i][j - 1]} + 1 = ${D[i][j]}.`,
                  hint: 'Check which neighbour plus one equals the current cell.',
                }
              : undefined,
          pedagogy: {
            what: `The cell came from the left, so the script records an insertion of '${word2[j - 1]}'.`,
            why: 'Moving left keeps word1 fixed and consumes one character of word2 — that is what INSERT means.',
            whatNext: `Continue from dp[${i}][${j - 1}] = ${D[i][j - 1]}.`,
          },
        });
        j--;
      } else if (i > 0 && j > 0) {
        const step: EditStep = { op: 'REPLACE', from: word1[i - 1], to: word2[j - 1], i, j };
        editScript.unshift(step);
        currentI = i;
        currentJ = j;
        operationType = 'REPLACE';
        sourceCells = [[i - 1, j - 1]];
        pushFrame({
          codeLine: 21,
          action: 'BT_REPLACE',
          explanation: `dp[${i}][${j}] = ${D[i][j]} = dp[${i - 1}][${j - 1}] + 1 = ${D[i - 1][j - 1]} + 1, so '${word1[i - 1]}' is replaced by '${word2[j - 1]}' and both indices step back.`,
          conditionEval: { expr: `D[${i}][${j}] == D[${i - 1}][${j - 1}] + 1`, condition: `${D[i][j]} == ${D[i - 1][j - 1]} + 1`, result: true },
          variables: { i, j, op: 'replace', from: word1[i - 1], to: word2[j - 1], collected: editScript.length },
          milestone: !firstReplaceMilestone ? 'First Substitution' : undefined,
          soundCue: 'swap',
          checkpoint:
            !backtrackCheckpointAdded
              ? {
                  id: 'edit-distance-backtrack-first-step',
                  question: `At (${i}, ${j}) the characters differ and dp[${i}][${j}] = ${D[i][j]}. Neither a delete nor an insert matches, so what does the script record?`,
                  options: [
                    `replace '${word1[i - 1]}' with '${word2[j - 1]}' (dp[${i - 1}][${j - 1}] + 1 = ${D[i][j]})`,
                    `delete '${word1[i - 1]}' (cost ${D[i - 1][j] + 1})`,
                    `insert '${word2[j - 1]}' (cost ${D[i][j - 1] + 1})`,
                  ],
                  correctIndex: 0,
                  explanation: `The diagonal predecessor plus one realises the cell, so one replacement is cheaper than dropping and re-adding the character.`,
                  hint: 'Compare all three predecessors with the cell value.',
                }
              : undefined,
          pedagogy: {
            what: `The cell came from the diagonal, so the script replaces '${word1[i - 1]}' with '${word2[j - 1]}'.`,
            why: 'A diagonal move consumes one character of each word, which is exactly one substitution.',
            whatNext: `Continue from dp[${i - 1}][${j - 1}] = ${D[i - 1][j - 1]}.`,
          },
        });
        if (!firstReplaceMilestone) firstReplaceMilestone = true;
        i--;
        j--;
      } else if (j > 0) {
        const step: EditStep = { op: 'INSERT', from: '', to: word2[j - 1], i, j };
        editScript.unshift(step);
        currentI = i;
        currentJ = j;
        operationType = 'INSERT';
        sourceCells = [[i, j - 1]];
        pushFrame({
          codeLine: 19,
          action: 'BT_INSERT',
          explanation: `word1 is exhausted (i = 0), so the remaining prefix "${word2.slice(0, j)}" is inserted one character at a time: insert '${word2[j - 1]}'.`,
          variables: { i, j, op: 'insert', char: word2[j - 1], collected: editScript.length },
          soundCue: 'insert',
          pedagogy: {
            what: `With word1 empty the only possible operation is inserting '${word2[j - 1]}'.`,
            why: 'The top border encodes exactly these forced insertions: dp[0][j] = j.',
            whatNext: j > 1 ? `Insert the previous character '${word2[j - 2]}'.` : 'The walk reached the origin; the script is complete.',
          },
        });
        j--;
      } else {
        const step: EditStep = { op: 'DELETE', from: word1[i - 1], to: '', i, j };
        editScript.unshift(step);
        currentI = i;
        currentJ = j;
        operationType = 'DELETE';
        sourceCells = [[i - 1, j]];
        pushFrame({
          codeLine: 17,
          action: 'BT_DELETE',
          explanation: `word2 is exhausted (j = 0), so the remaining prefix "${word1.slice(0, i)}" is deleted one character at a time: delete '${word1[i - 1]}'.`,
          variables: { i, j, op: 'delete', char: word1[i - 1], collected: editScript.length },
          soundCue: 'discard',
          pedagogy: {
            what: `With word2 empty the only possible operation is deleting '${word1[i - 1]}'.`,
            why: 'The left border encodes exactly these forced deletions: dp[i][0] = i.',
            whatNext: i > 1 ? `Delete the previous character '${word1[i - 2]}'.` : 'The walk reached the origin; the script is complete.',
          },
        });
        i--;
      }
      backtrackCheckpointAdded = true;
      walkPath.push([i, j]);
    }

    currentI = 0;
    currentJ = 0;
    sourceCells = [];
    candidate = null;
    operationType = 'NONE';
    phase = 'done';
    const costedOps = editScript.filter((step) => step.op !== 'MATCH');

    pushFrame({
      codeLine: 22,
      action: 'DONE',
      explanation: `Script reconstructed: ${costedOps.length === 0 ? 'both words are already equal' : costedOps.map(describeStep).join(' → ')} — ${costedOps.length} edit(s), matching dp[${m}][${n}] = ${D[m][n]}.`,
      variables: {
        distance: D[m][n],
        edits: costedOps.length,
        kept: editScript.length - costedOps.length,
        script: costedOps.map(describeStep).join(' → ') || '(no edits needed)',
      },
      milestone: 'Edit Script Reconstructed',
      soundCue: 'finish',
      pedagogy: {
        what: `The recovered script has ${costedOps.length} edit(s), exactly the value in dp[${m}][${n}].`,
        why: 'Each step followed a predecessor whose cost plus the operation equals the cell, so the script is optimal for the chosen tie-break.',
        whatNext: 'Compare presets: SAME→SAME keeps every character, CAT→CATS only inserts, HORSE→ROS mixes replace and delete.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<EditDistanceState>) => {
    const {
      word1,
      word2,
      dpTable,
      currentI,
      currentJ,
      operationType,
      optimalEdits,
      sourceCells,
      candidate,
      phase,
      editScript,
      walkPath,
      stats,
    } = frame.state;

    const m = word1.length;
    const n = word2.length;
    const sourceSet = new Set(sourceCells.map(([i, j]) => `${i}:${j}`));
    const walkSet = new Set(walkPath.map(([i, j]) => `${i}:${j}`));

    const formula =
      candidate === null
        ? phase === 'base'
          ? 'borders: dp[i][0] = i deletions, dp[0][j] = j insertions'
          : phase === 'table'
            ? 'equal characters → copy the diagonal; otherwise 1 + min(delete, insert, replace)'
            : 'walk back: keep on a match, otherwise follow the predecessor that realises the value'
        : candidate.kind === 'match'
          ? `dp[${candidate.i}][${candidate.j}] = dp[${candidate.i - 1}][${candidate.j - 1}] = ${candidate.value} (no edit needed)`
          : `dp[${candidate.i}][${candidate.j}] = 1 + min(delete ${candidate.deleteCost}, insert ${candidate.insertCost}, replace ${candidate.replaceCost}) = ${candidate.value} → ${candidate.chosen}`;

    const cellClass = (rowIdx: number, colIdx: number): string => {
      const key = `${rowIdx}:${colIdx}`;
      if (rowIdx === currentI && colIdx === currentJ) return 'bg-amber-500/30 border-2 border-amber-400 text-amber-100 font-extrabold';
      if (sourceSet.has(key)) return 'bg-indigo-500/25 border-2 border-indigo-400 text-indigo-100 font-bold';
      if (phase !== 'table' && phase !== 'base' && walkSet.has(key)) return 'bg-emerald-900/40 border border-emerald-700 text-emerald-200';
      if (rowIdx === 0 || colIdx === 0) return 'bg-cyan-950/30 border border-cyan-900 text-cyan-200';
      return 'bg-slate-900/60 border border-slate-800 text-slate-300';
    };

    return (
      <div className="flex w-full h-full flex-col justify-between gap-3 p-4 select-none">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300">
              Word 1: <span className="font-bold text-cyan-400">"{word1}"</span> → Word 2:{' '}
              <span className="font-bold text-amber-400">"{word2}"</span>
            </span>
            <span
              className={`rounded-lg border px-2 py-1 font-bold uppercase ${
                phase === 'base'
                  ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-200'
                  : phase === 'table'
                    ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-200'
                    : 'border-violet-500/40 bg-violet-500/20 text-violet-200'
              }`}
            >
              {phase === 'base' ? 'base borders' : phase === 'table' ? 'filling table' : phase === 'backtrack' ? 'recovering script' : 'done'}
            </span>
            {operationType !== 'NONE' && (
              <span className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 font-bold uppercase tracking-wider text-slate-200">
                {operationType}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-slate-300">
              matches <span className="font-bold text-emerald-300">{stats.matches}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-slate-300">
              cost cells <span className="font-bold text-indigo-300">{stats.mismatches}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-slate-300">
              distance <span className="font-bold text-emerald-300">{dpTable[m]?.[n] ?? 0}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-0.5 text-slate-300">
              current <span className="font-bold text-amber-300">{optimalEdits}</span>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 font-mono text-[11px] text-slate-200">{formula}</div>

        <div className="overflow-x-auto">
          <div className="inline-block rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-2xl">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-slate-800 p-2 text-xs font-mono text-slate-600">w1 \ w2</th>
                  <th className="border-b border-slate-800 p-2 text-xs font-mono text-slate-500">ε</th>
                  {word2.split('').map((char, idx) => (
                    <th
                      key={idx}
                      className={`border-b border-slate-800 p-2 text-center text-xs font-mono font-bold ${
                        idx + 1 === currentJ && phase === 'table' ? 'bg-amber-950/40 text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      {char}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dpTable.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td
                      className={`border-r border-slate-800 p-2 text-center text-xs font-mono font-bold ${
                        rIdx === currentI ? 'bg-cyan-950/40 text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      {rIdx === 0 ? 'ε' : word1[rIdx - 1]}
                    </td>
                    {row.map((val, cIdx) => (
                      <td key={cIdx} className={`p-2.5 text-center font-mono text-xs transition-all ${cellClass(rIdx, cIdx)}`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 font-mono text-[11px]">
          <span className="text-slate-500">recovered script:</span>
          {editScript.length === 0 ? (
            <span className="text-slate-600">empty</span>
          ) : (
            editScript.map((step, index) => (
              <span
                key={`${step.op}-${index}`}
                className={`rounded border px-1.5 py-0.5 font-bold ${
                  step.op === 'MATCH'
                    ? 'border-emerald-700 bg-emerald-950/50 text-emerald-200'
                    : step.op === 'INSERT'
                      ? 'border-cyan-700 bg-cyan-950/50 text-cyan-200'
                      : step.op === 'DELETE'
                        ? 'border-rose-700 bg-rose-950/50 text-rose-200'
                        : 'border-violet-700 bg-violet-950/50 text-violet-200'
                }`}
              >
                {describeStep(step)}
              </span>
            ))
          )}
        </div>
      </div>
    );
  },
};
