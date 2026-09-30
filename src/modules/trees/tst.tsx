import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface TSTNodeData {
  id: string;
  char: string;
  isEnd: boolean;
  left: TSTNodeData | null;
  mid: TSTNodeData | null;
  right: TSTNodeData | null;
}

export interface TSTState {
  root: TSTNodeData | null;
  activeWord: string | null;
  activeCharIdx: number;
  activeNodeId: string | null;
  branchTaken: 'LEFT' | 'MID' | 'RIGHT' | null;
  found: boolean | null;
}

function cloneTST(node: TSTNodeData | null): TSTNodeData | null {
  if (!node) return null;
  return {
    id: node.id,
    char: node.char,
    isEnd: node.isEnd,
    left: cloneTST(node.left),
    mid: cloneTST(node.mid),
    right: cloneTST(node.right),
  };
}

export const tstModule: AlgorithmModule<
  { words: string[]; searchTarget: string },
  TSTState
> = {
  id: 'ternary-search-tree',
  title: 'Ternary Search Tree (TST Compact Three-Way Branching)',
  category: 'trees-bst',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(L)',
    timeAverage: 'O(L + log N)',
    timeWorst: 'O(L + N)',
    spaceAuxiliary: 'O(N * L) compact 3-way node allocations',
    worstCaseCondition: 'Degenerate character ordering forming deep left/right unbalanced BST chains',
  },
  theory: {
    overview:
      'A Ternary Search Tree (TST) is a hybrid of a Trie and a Binary Search Tree invented by Jon Bentley and Robert Sedgewick. Each node contains a single character and branches in three directions: Left (<), Mid (=), and Right (>).',
    whyItWorks:
      'Standard Tries allocate 26 (or 256) child pointers per node, wasting tremendous space on sparse alphabets. TST avoids memory bloat by only storing 3 pointers per node, dynamically balancing characters at each depth while retaining O(L + log N) prefix searches.',
    invariant:
      'Three-Way Branching Invariant: At any node containing character c: Left child contains keys whose current character is strictly less than c; Mid child advances to the next character in keys matching c; Right child contains keys whose character is strictly greater than c.',
    pitfalls: [
      'Forgetting to advance to the next string character (index + 1) only on the MID branch, not on LEFT or RIGHT branches.',
      'Missing the isEndOfWord flag when a word is a prefix of another (e.g. "car" and "carpet").',
    ],
  },
  presets: [
    {
      id: 'tst-classic-set',
      label: 'Insert ["cat", "car", "dog", "bug"] & Search "car"',
      description: 'Demonstrates common prefixes and three-way branching with positive search hit',
      data: {
        words: ['cat', 'car', 'dog', 'bug'],
        searchTarget: 'car',
      },
    },
    {
      id: 'tst-missing-search',
      label: 'Search for Non-Existent "cow"',
      description: 'Shows branching miss at character "w"',
      data: {
        words: ['cat', 'car', 'cowboy'],
        searchTarget: 'cow',
      },
    },
  ],
  defaultInput: {
    words: ['cat', 'car', 'dog', 'bug'],
    searchTarget: 'car',
  },
  codeSnippets: {
    cpp: `struct Node {
    char c;
    bool isEnd;
    Node *left, *mid, *right;
    Node(char ch) : c(ch), isEnd(false), left(nullptr), mid(nullptr), right(nullptr) {}
};

Node* insert(Node* root, const string& word, int idx) {
    if (!root) root = new Node(word[idx]);
    if (word[idx] < root->c) root->left = insert(root->left, word, idx);
    else if (word[idx] > root->c) root->right = insert(root->right, word, idx);
    else {
        if (idx + 1 < word.length()) root->mid = insert(root->mid, word, idx + 1);
        else root->isEnd = true;
    }
    return root;
}

bool search(Node* root, const string& word, int idx) {
    if (!root) return false;
    if (word[idx] < root->c) return search(root->left, word, idx);
    if (word[idx] > root->c) return search(root->right, word, idx);
    if (idx + 1 < word.length()) return search(root->mid, word, idx + 1);
    return root->isEnd;
}`,
    python: `class TSTNode:
    def __init__(self, char):
        self.char = char
        self.is_end = False
        self.left = self.mid = self.right = None

def insert(node, word, idx):
    char = word[idx]
    if not node: node = TSTNode(char)
    if char < node.char:
        node.left = insert(node.left, word, idx)
    elif char > node.char:
        node.right = insert(node.right, word, idx)
    else:
        if idx + 1 < len(word):
            node.mid = insert(node.mid, word, idx + 1)
        else:
            node.is_end = True
    return node`,
    typescript: `interface TSTNode {
  char: string;
  isEnd: boolean;
  left: TSTNode | null;
  mid: TSTNode | null;
  right: TSTNode | null;
}`,
    java: `class TSTNode {
    char c;
    boolean isEnd;
    TSTNode left, mid, right;
}`,
    pseudocode: `function insert(node, word, idx):
    if node is null: node = new Node(word[idx])
    if word[idx] < node.char: node.left = insert(node.left, word, idx)
    else if word[idx] > node.char: node.right = insert(node.right, word, idx)
    else:
        if idx + 1 < length(word): node.mid = insert(node.mid, word, idx + 1)
        else: node.isEnd = true
    return node`,
  },
  generateTimeline: (input: {
    words: string[];
    searchTarget: string;
  }): ExecutionFrame<TSTState>[] => {
    const words = input?.words?.length ? input.words : ['cat', 'car', 'dog', 'bug'];
    const target = input?.searchTarget ?? 'car';

    let nodeCounter = 0;
    function makeNode(char: string): TSTNodeData {
      return {
        id: `tst-${++nodeCounter}`,
        char,
        isEnd: false,
        left: null,
        mid: null,
        right: null,
      };
    }

    const frames: ExecutionFrame<TSTState>[] = [];
    let root: TSTNodeData | null = null;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        root: null,
        activeWord: null,
        activeCharIdx: 0,
        activeNodeId: null,
        branchTaken: null,
        found: null,
      },
      callStack: [{ name: 'tstInit', params: { totalWords: words.length } }],
      variables: { totalWords: words.length, searchTarget: target },
      explanation: `Initialized empty Ternary Search Tree. Ready to insert ${words.length} words.`,
    });

    function insert(node: TSTNodeData | null, word: string, idx: number): TSTNodeData {
      const ch = word[idx];
      if (!node) {
        node = makeNode(ch);
      }

      if (ch < node.char) {
        node.left = insert(node.left, word, idx);
      } else if (ch > node.char) {
        node.right = insert(node.right, word, idx);
      } else {
        if (idx + 1 < word.length) {
          node.mid = insert(node.mid, word, idx + 1);
        } else {
          node.isEnd = true;
        }
      }
      return node;
    }

    for (const w of words) {
      root = insert(root, w, 0);
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 12,
        action: 'INSERT_WORD',
        state: {
          root: cloneTST(root),
          activeWord: w,
          activeCharIdx: w.length - 1,
          activeNodeId: null,
          branchTaken: null,
          found: null,
        },
        callStack: [{ name: 'insertWord', params: { word: w, length: w.length } }],
        variables: { insertedWord: w },
        explanation: `Inserted word "${w}" into Ternary Search Tree.`,
      });
    }

    // Now search for target
    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 20,
      action: 'START_SEARCH',
      state: {
        root: cloneTST(root),
        activeWord: target,
        activeCharIdx: 0,
        activeNodeId: root?.id ?? null,
        branchTaken: null,
        found: null,
      },
      callStack: [{ name: 'search', params: { target, charIdx: 0 } }],
      variables: { target, startChar: target[0] },
      explanation: `Starting search for "${target}" from root.`,
    });

    let curr: TSTNodeData | null = root;
    let sIdx = 0;
    let matched = false;

    while (curr && sIdx < target.length) {
      const ch = target[sIdx];

      if (ch < curr.char) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 22,
          action: 'BRANCH_LEFT',
          state: {
            root: cloneTST(root),
            activeWord: target,
            activeCharIdx: sIdx,
            activeNodeId: curr.id,
            branchTaken: 'LEFT',
            found: null,
          },
          callStack: [{ name: 'branchLeft', params: { char: ch, nodeChar: curr.char } }],
          variables: { targetChar: ch, nodeChar: curr.char, comparison: `'${ch}' < '${curr.char}'` },
          explanation: `'${ch}' < '${curr.char}'. Traversing LEFT branch (<).`,
        });
        curr = curr.left;
      } else if (ch > curr.char) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 24,
          action: 'BRANCH_RIGHT',
          state: {
            root: cloneTST(root),
            activeWord: target,
            activeCharIdx: sIdx,
            activeNodeId: curr.id,
            branchTaken: 'RIGHT',
            found: null,
          },
          callStack: [{ name: 'branchRight', params: { char: ch, nodeChar: curr.char } }],
          variables: { targetChar: ch, nodeChar: curr.char, comparison: `'${ch}' > '${curr.char}'` },
          explanation: `'${ch}' > '${curr.char}'. Traversing RIGHT branch (>).`,
        });
        curr = curr.right;
      } else {
        // Matched character
        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 26,
          action: 'BRANCH_MID',
          state: {
            root: cloneTST(root),
            activeWord: target,
            activeCharIdx: sIdx,
            activeNodeId: curr.id,
            branchTaken: 'MID',
            found: null,
          },
          callStack: [{ name: 'branchMid', params: { char: ch, nextCharIdx: sIdx + 1 } }],
          variables: { matchedChar: ch, isEnd: curr.isEnd, sIdx },
          explanation: `Matched '${ch}'! Advancing string pointer and traversing MID branch (=).`,
        });

        if (sIdx === target.length - 1) {
          matched = curr.isEnd;
          break;
        }
        sIdx++;
        curr = curr.mid;
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 32,
      action: 'SEARCH_COMPLETE',
      state: {
        root: cloneTST(root),
        activeWord: target,
        activeCharIdx: sIdx,
        activeNodeId: curr?.id ?? null,
        branchTaken: null,
        found: matched,
      },
      callStack: [{ name: 'complete', params: { matched: matched ? 1 : 0 } }],
      variables: { completed: true, target, found: matched },
      explanation: matched
        ? `Search SUCCESS: Word "${target}" exists in the Ternary Search Tree!`
        : `Search FAILURE: Word "${target}" was NOT found in the tree.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<TSTState>) => {
    const { root, activeWord, activeCharIdx, activeNodeId, branchTaken, found } = frame.state;

    interface LayoutTST {
      id: string;
      char: string;
      isEnd: boolean;
      x: number;
      y: number;
      left: LayoutTST | null;
      mid: LayoutTST | null;
      right: LayoutTST | null;
    }

    function layout(node: TSTNodeData | null, x: number, y: number, dx: number): LayoutTST | null {
      if (!node) return null;
      return {
        id: node.id,
        char: node.char,
        isEnd: node.isEnd,
        x,
        y,
        left: layout(node.left, x - dx, y + 65, dx * 0.5),
        mid: layout(node.mid, x, y + 65, dx * 0.5),
        right: layout(node.right, x + dx, y + 65, dx * 0.5),
      };
    }

    const visualRoot = layout(root, 360, 45, 140);
    const edges: { x1: number; y1: number; x2: number; y2: number; type: string }[] = [];
    const flatNodes: LayoutTST[] = [];

    function collect(n: LayoutTST | null) {
      if (!n) return;
      flatNodes.push(n);
      if (n.left) {
        edges.push({ x1: n.x, y1: n.y, x2: n.left.x, y2: n.left.y, type: '<' });
        collect(n.left);
      }
      if (n.mid) {
        edges.push({ x1: n.x, y1: n.y, x2: n.mid.x, y2: n.mid.y, type: '=' });
        collect(n.mid);
      }
      if (n.right) {
        edges.push({ x1: n.x, y1: n.y, x2: n.right.x, y2: n.right.y, type: '>' });
        collect(n.right);
      }
    }
    collect(visualRoot);

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Search Target:</span>
            {activeWord && (
              <div className="flex items-center font-mono text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded">
                <span>{activeWord.slice(0, activeCharIdx)}</span>
                <span className="text-amber-300 underline">{activeWord[activeCharIdx]}</span>
                <span>{activeWord.slice(activeCharIdx + 1)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {branchTaken && (
              <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded">
                Branch: {branchTaken}
              </span>
            )}
            {found === true && (
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
                FOUND
              </span>
            )}
            {found === false && (
              <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded">
                NOT FOUND
              </span>
            )}
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[340px] flex items-center justify-center">
          <svg className="w-[720px] h-[320px]" viewBox="0 0 720 320">
            {edges.map((e, idx) => (
              <g key={`edge-${idx}`}>
                <line
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray={e.type === '=' ? undefined : '3 3'}
                />
                <text
                  x={(e.x1 + e.x2) / 2}
                  y={(e.y1 + e.y2) / 2 - 4}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {e.type}
                </text>
              </g>
            ))}

            {flatNodes.map((n) => {
              const isActive = n.id === activeNodeId;
              let fill = '#0f172a';
              let stroke = n.isEnd ? '#10b981' : '#334155';
              if (isActive) {
                fill = '#78350f';
                stroke = '#f59e0b';
              }

              return (
                <g key={n.id} className="transition-all duration-300">
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="16"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isActive ? '2.5' : n.isEnd ? '2' : '1.5'}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    fill={isActive ? '#fbbf24' : '#f8fafc'}
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {n.char}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
