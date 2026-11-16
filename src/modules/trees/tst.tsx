import {
  AlgorithmModule,
  ExecutionFrame,
  PredictionCheckpoint,
  SoundCue,
  StepPedagogy,
} from '../../core/types';

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
  /** Which operation the current frame belongs to. */
  phase: 'insert' | 'search' | null;
  /** Nodes visited so far in the current operation (ordered, for path highlight). */
  pathIds: string[];
  /** Node allocated in this frame, if any. */
  createdNodeId: string | null;
  /** Node whose isEnd flag was flipped in this frame, if any. */
  markedEndNodeId: string | null;
  /** Words fully inserted before this frame. */
  insertedWords: string[];
  /** Index of the word currently being inserted. */
  currentWordIndex: number;
  totalWords: number;
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
  relatedModules: [
    { id: 'trie-prefix', label: 'Standard Trie' },
    { id: 'radix-tree', label: 'Radix Tree' },
  ],
  complexity: {
    timeBest: 'O(L)',
    timeAverage: 'O(L + log N)',
    timeWorst: 'O(L + N)',
    spaceAuxiliary: 'O(N * L) compact 3-way node allocations',
    worstCaseCondition:
      'Degenerate character ordering forming deep left/right unbalanced BST chains',
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
      'Treating a successful character walk as a successful search — the final node must also have isEnd set.',
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
    {
      id: 'tst-prefix-vs-word',
      label: 'Prefix Is Not A Word ("car" vs "carpet")',
      description: 'The walk reaches the node for "car", but only "carpet" has isEnd set',
      data: {
        words: ['carpet'],
        searchTarget: 'car',
      },
    },
  ],
  defaultInput: {
    words: ['cat', 'car', 'dog', 'bug'],
    searchTarget: 'car',
  },
  codeSnippets: {
    cpp: `struct Node { char c; bool isEnd = false; Node *left=nullptr, *mid=nullptr, *right=nullptr; };
Node* insert(Node* node, const string& word, int idx) {
    char ch = word[idx];
    if (!node) node = new Node{ch};
    // compare the current character with this node
    if (ch < node->c) node->left = insert(node->left, word, idx);
    else if (ch > node->c) {
        node->right = insert(node->right, word, idx);
    } else if (idx + 1 < (int)word.size()) {
        node->mid = insert(node->mid, word, idx + 1);
    } else {
        node->isEnd = true;
    }
    return node;
}
bool search(Node* node, const string& word, int idx) {
    if (!node) return false;
    char ch = word[idx];
    if (ch < node->c) return search(node->left, word, idx);
    if (ch > node->c) return search(node->right, word, idx);
    if (idx + 1 < (int)word.size()) return search(node->mid, word, idx + 1);
    return node->isEnd;
}`,
    python: `def insert(node, word, idx):
    ch = word[idx]
    if node is None:
        node = {"char": ch, "is_end": False, "left": None, "mid": None, "right": None}
    if ch < node["char"]:
        node["left"] = insert(node["left"], word, idx)
    elif ch > node["char"]:
        node["right"] = insert(node["right"], word, idx)
    elif idx + 1 < len(word):
        node["mid"] = insert(node["mid"], word, idx + 1)
    else:
        node["is_end"] = True
    return node

# search mirrors insert: same three-way rule, no mutation
def search(node, word, idx):
    if node is None: return False
    ch = word[idx]
    if ch < node["char"]: return search(node["left"], word, idx)
    if ch > node["char"]: return search(node["right"], word, idx)
    if idx + 1 < len(word): return search(node["mid"], word, idx + 1)
    return node["is_end"]`,
    typescript: `interface TSTNode { char: string; isEnd: boolean; left: TSTNode | null; mid: TSTNode | null; right: TSTNode | null; }
function insert(node: TSTNode | null, word: string, idx: number): TSTNode {
  const ch = word[idx];
  if (node === null) node = { char: ch, isEnd: false, left: null, mid: null, right: null };
  // compare the current character with this node
  if (ch < node.char) node.left = insert(node.left, word, idx);
  else if (ch > node.char) {
    node.right = insert(node.right, word, idx);
  } else if (idx + 1 < word.length) {
    node.mid = insert(node.mid, word, idx + 1);
  } else {
    node.isEnd = true;
  }
  return node;
}
function search(node: TSTNode | null, word: string, idx: number): boolean {
  if (node === null) return false;
  const ch = word[idx];
  if (ch < node.char) return search(node.left, word, idx);
  if (ch > node.char) return search(node.right, word, idx);
  if (idx + 1 < word.length) return search(node.mid, word, idx + 1);
  return node.isEnd;
}`,
    java: `class TSTNode { char c; boolean isEnd; TSTNode left, mid, right; }
TSTNode insert(TSTNode node, String word, int idx) {
    char ch = word.charAt(idx);
    if (node == null) { node = new TSTNode(); node.c = ch; }
    // compare the current character with this node
    if (ch < node.c) node.left = insert(node.left, word, idx);
    else if (ch > node.c) {
        node.right = insert(node.right, word, idx);
    } else if (idx + 1 < word.length()) {
        node.mid = insert(node.mid, word, idx + 1);
    } else {
        node.isEnd = true;
    }
    return node;
}
boolean search(TSTNode node, String word, int idx) {
    if (node == null) return false;
    char ch = word.charAt(idx);
    if (ch < node.c) return search(node.left, word, idx);
    if (ch > node.c) return search(node.right, word, idx);
    if (idx + 1 < word.length()) return search(node.mid, word, idx + 1);
    return node.isEnd;
}`,
    pseudocode: `function insert(node, word, idx):
    ch = word[idx]
    if node is null:
        node = new Node(ch)
    if ch < node.char:
        node.left = insert(node.left, word, idx)
    else if ch > node.char:
        node.right = insert(node.right, word, idx)
    else if idx + 1 < length(word):
        node.mid = insert(node.mid, word, idx + 1)
    else:
        node.isEnd = true
    return node

# search mirrors insert: same three-way rule, no mutation
function search(node, word, idx):
    if node is null: return false
    ch = word[idx]
    if ch < node.char: return search(node.left, word, idx)
    if ch > node.char: return search(node.right, word, idx)
    if idx + 1 < length(word): return search(node.mid, word, idx + 1)
    return node.isEnd`,
  },
  generateTimeline: (input: {
    words: string[];
    searchTarget: string;
  }): ExecutionFrame<TSTState>[] => {
    const rawWords = Array.isArray(input?.words) ? input.words : [];
    const words = rawWords.filter((w): w is string => typeof w === 'string' && w.length > 0);
    const safeWords = words.length > 0 ? words : ['cat', 'car', 'dog', 'bug'];
    const target = typeof input?.searchTarget === 'string' ? input.searchTarget : 'car';

    let nodeCounter = 0;
    let comparisons = 0;
    let nodeVisits = 0;

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
    const inserted: string[] = [];
    let currentInsertIndex = 0;
    let checkpointAdded = false;
    let rootMilestoneAdded = false;
    let dictionaryMilestoneAdded = false;

    const snapshot = (overrides: Partial<TSTState>): TSTState => ({
      root: cloneTST(root),
      activeWord: null,
      activeCharIdx: 0,
      activeNodeId: null,
      branchTaken: null,
      found: null,
      phase: null,
      pathIds: [],
      createdNodeId: null,
      markedEndNodeId: null,
      insertedWords: [...inserted],
      currentWordIndex: 0,
      totalWords: safeWords.length,
      ...overrides,
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      state: Partial<TSTState>;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      callStack?: ExecutionFrame<TSTState>['callStack'];
      milestone?: string;
      soundCue?: SoundCue;
      checkpoint?: PredictionCheckpoint;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state: snapshot(opts.state),
        callStack: opts.callStack ?? [
          { name: opts.action.toLowerCase(), params: {}, line: opts.codeLine, isCurrent: true },
        ],
        variables: opts.variables,
        metrics: { comparisons, accesses: nodeVisits },
        invariantStatus: {
          label: 'Left < node.char < Right, Mid advances the word index',
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone
          ? { isMilestone: true, milestoneTitle: opts.milestone }
          : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: snapshot({ phase: null }),
      callStack: [{ name: 'tstInit', params: { totalWords: safeWords.length }, line: 1, isCurrent: true }],
      variables: { totalWords: safeWords.length, searchTarget: target },
      pedagogy: {
        what: 'A TST stores one character per node with exactly three links: left (<), mid (=, next character), right (>).',
        why: 'It keeps the prefix-sharing power of a trie while spending only three pointers per node instead of a 26-slot alphabet array.',
        whatNext: `Insert [${safeWords.join(', ')}] one character decision at a time, then search "${target}".`,
      },
      explanation: `Initialized an empty Ternary Search Tree. Preparing to insert ${safeWords.length} word(s).`,
    });

    function insert(
      node: TSTNodeData | null,
      word: string,
      idx: number,
      path: string[],
      attach: (created: TSTNodeData) => void
    ): TSTNodeData {
      const ch = word[idx];

      if (!node) {
        node = makeNode(ch);
        // Link the fresh node immediately so this frame's snapshot already
        // shows it in the tree (otherwise the highlight points at a node
        // that the cloned state does not contain yet).
        attach(node);
        path.push(node.id);
        nodeVisits++;
        pushFrame({
          codeLine: 4,
          action: 'INSERT_CREATE',
          explanation: `No node at this position — allocate node '${ch}' and link it into the tree.`,
          state: {
            activeWord: word,
            activeCharIdx: idx,
            activeNodeId: node.id,
            createdNodeId: node.id,
            phase: 'insert',
            pathIds: [...path],
            currentWordIndex: currentInsertIndex,
          },
          variables: { word, idx, createdChar: ch, createdNodeId: node.id },
          milestone:
            !rootMilestoneAdded && nodeCounter === 1 ? 'Root Character Created' : undefined,
          soundCue: 'insert',
          pedagogy: {
            what: `The path has no node for '${ch}', so a fresh node is allocated.`,
            why: 'A TST grows lazily: nodes exist only where some inserted word actually needs a character.',
            whatNext: `Compare '${ch}' with this new node's character and continue.`,
          },
        });
        if (nodeCounter === 1) rootMilestoneAdded = true;
      } else {
        path.push(node.id);
        nodeVisits++;
      }

      if (ch < node.char) {
        comparisons++;
        pushFrame({
          codeLine: 6,
          action: 'INSERT_LEFT',
          explanation: `'${ch}' < '${node.char}' — follow the LEFT (<) branch at string index ${idx}.`,
          state: {
            activeWord: word,
            activeCharIdx: idx,
            activeNodeId: node.id,
            branchTaken: 'LEFT',
            phase: 'insert',
            pathIds: [...path],
            currentWordIndex: currentInsertIndex,
          },
          variables: {
            word,
            idx,
            wordChar: ch,
            nodeChar: node.char,
            comparison: `'${ch}' < '${node.char}'`,
            nextChild: 'left',
          },
          soundCue: 'compare',
          pedagogy: {
            what: `Compare word[${idx}] = '${ch}' with node.char = '${node.char}'.`,
            why: "Smaller characters belong only in the left subtree, so the word index does NOT advance here.",
            whatNext: `Descend LEFT and compare '${ch}' again against the next node.`,
          },
        });
        node.left = insert(node.left, word, idx, path, (child) => { node!.left = child; });
      } else if (ch > node.char) {
        comparisons++;
        pushFrame({
          codeLine: 8,
          action: 'INSERT_RIGHT',
          explanation: `'${ch}' > '${node.char}' — follow the RIGHT (>) branch at string index ${idx}.`,
          state: {
            activeWord: word,
            activeCharIdx: idx,
            activeNodeId: node.id,
            branchTaken: 'RIGHT',
            phase: 'insert',
            pathIds: [...path],
            currentWordIndex: currentInsertIndex,
          },
          variables: {
            word,
            idx,
            wordChar: ch,
            nodeChar: node.char,
            comparison: `'${ch}' > '${node.char}'`,
            nextChild: 'right',
          },
          soundCue: 'compare',
          pedagogy: {
            what: `Compare word[${idx}] = '${ch}' with node.char = '${node.char}'.`,
            why: 'Greater characters belong only in the right subtree, so the word index stays the same.',
            whatNext: `Descend RIGHT and compare '${ch}' again against the next node.`,
          },
        });
        node.right = insert(node.right, word, idx, path, (child) => { node!.right = child; });
      } else {
        comparisons++;
        if (idx + 1 < word.length) {
          pushFrame({
            codeLine: 10,
            action: 'INSERT_MID',
            explanation: `'${ch}' = '${node.char}' — consume the character and descend MID (=) to string index ${idx + 1}.`,
            state: {
              activeWord: word,
              activeCharIdx: idx,
              activeNodeId: node.id,
              branchTaken: 'MID',
              phase: 'insert',
              pathIds: [...path],
              currentWordIndex: currentInsertIndex,
            },
            variables: {
              word,
              idx,
              wordChar: ch,
              nodeChar: node.char,
              comparison: `'${ch}' = '${node.char}'`,
              nextIndex: idx + 1,
              nextChild: 'mid',
            },
            soundCue: 'compare',
            pedagogy: {
              what: `Characters match at index ${idx}; the word still has ${word.length - idx - 1} character(s) left.`,
              why: 'MID means "same character, next position", so only this branch increments the string index.',
              whatNext: `Descend MID and insert '${word[idx + 1]}' at index ${idx + 1}.`,
            },
          });
          node.mid = insert(node.mid, word, idx + 1, path, (child) => { node!.mid = child; });
        } else {
          const alreadyEnd = node.isEnd;
          node.isEnd = true;
          pushFrame({
            codeLine: 12,
            action: 'INSERT_MARK_END',
            explanation: alreadyEnd
              ? `Word "${word}" was already stored — isEnd is already true on '${node.char}'.`
              : `Word "${word}" ends here — set isEnd = true on node '${node.char}'.`,
            state: {
              activeWord: word,
              activeCharIdx: idx,
              activeNodeId: node.id,
              phase: 'insert',
              pathIds: [...path],
              markedEndNodeId: node.id,
              currentWordIndex: currentInsertIndex,
            },
            variables: { word, idx, terminalChar: node.char, isEnd: true, wasAlreadyEnd: alreadyEnd },
            soundCue: 'success',
            pedagogy: {
              what: `The last character '${ch}' is consumed, so this node is the end of a stored word.`,
              why: 'isEnd distinguishes a real word from a mere prefix — "car" can end here while "carpet" keeps going.',
              whatNext: 'Return up the recursion; the tree now recognises this word.',
            },
          });
        }
      }

      return node;
    }

    for (let wordIndex = 0; wordIndex < safeWords.length; wordIndex++) {
      const word = safeWords[wordIndex];
      currentInsertIndex = wordIndex;
      const path: string[] = [];
      root = insert(root, word, 0, path, (created) => { root = created; });
      inserted.push(word);

      pushFrame({
        codeLine: 13,
        action: 'INSERT_WORD_DONE',
        explanation: `Finished inserting "${word}" (${wordIndex + 1}/${safeWords.length}); the path used ${path.length} node(s).`,
        state: {
          activeWord: word,
          activeCharIdx: word.length - 1,
          activeNodeId: path[path.length - 1] ?? null,
          phase: 'insert',
          pathIds: path,
          currentWordIndex: wordIndex,
        },
        variables: {
          insertedWord: word,
          wordIndex,
          pathLength: path.length,
          insertedCount: inserted.length,
        },
        milestone:
          !dictionaryMilestoneAdded && wordIndex === safeWords.length - 1
            ? 'Dictionary Fully Inserted'
            : undefined,
        soundCue: 'complete',
        pedagogy: {
          what: `"${word}" is fully stored (${wordIndex + 1}/${safeWords.length} words).`,
          why: 'Only the path for this word changed; every other subtree is untouched, which is why insertion costs O(L + log N).',
          whatNext:
            wordIndex === safeWords.length - 1
              ? `Search for "${target}" using the same three-way comparisons.`
              : `Insert the next word "${safeWords[wordIndex + 1]}".`,
        },
      });
      if (wordIndex === safeWords.length - 1) dictionaryMilestoneAdded = true;
    }

    const rootChar = root?.char ?? '';
    const firstChar = target[0] ?? '';
    const firstBranch: 'LEFT' | 'MID' | 'RIGHT' =
      firstChar === rootChar ? 'MID' : firstChar < rootChar ? 'LEFT' : 'RIGHT';
    const firstOp = firstChar === rootChar ? '=' : firstChar < rootChar ? '<' : '>';
    const branchLabel = firstBranch === 'LEFT' ? 'left (<)' : firstBranch === 'RIGHT' ? 'right (>)' : 'mid (=)';

    const checkpoint: PredictionCheckpoint | undefined = root
      ? {
          id: 'tst-first-search-branch',
          question: `The root stores '${rootChar}'. Searching "${target}" starts by comparing '${firstChar}' with '${rootChar}'. Which branch is taken first?`,
          options: ['Left (<)', 'Mid (=)', 'Right (>)'],
          correctIndex: firstBranch === 'LEFT' ? 0 : firstBranch === 'MID' ? 1 : 2,
          explanation: `'${firstChar}' ${firstOp} '${rootChar}', so the search follows the ${branchLabel} branch.`,
          hint: 'The three-way order is decided by the current character only, before looking at the rest of the word.',
        }
      : undefined;

    pushFrame({
      codeLine: 16,
      action: 'START_SEARCH',
      explanation: `Search "${target}" from the root: compare '${firstChar}' with root '${rootChar}'.`,
      state: {
        activeWord: target,
        activeCharIdx: 0,
        activeNodeId: root?.id ?? null,
        phase: 'search',
        pathIds: root ? [root.id] : [],
        currentWordIndex: safeWords.length - 1,
      },
      variables: { target, targetChar: firstChar, rootChar, startIndex: 0 },
      soundCue: 'start',
      checkpoint: checkpointAdded ? undefined : checkpoint,
      pedagogy: {
        what: `The search starts exactly like insertion: compare target[0] = '${firstChar}' with the root character.`,
        why: 'A search reuses the insertion rule; nothing is mutated, it only walks existing nodes.',
        whatNext: `Take the ${branchLabel} branch if that node exists, otherwise the word is absent.`,
      },
    });
    checkpointAdded = true;

    function search(node: TSTNodeData | null, idx: number, path: string[]): boolean {
      if (!node) {
        pushFrame({
          codeLine: 17,
          action: 'SEARCH_MISS_NULL',
          explanation: `Required child is null at string index ${idx} — "${target}" is not stored in the tree.`,
          state: {
            activeWord: target,
            activeCharIdx: idx,
            activeNodeId: null,
            phase: 'search',
            pathIds: [...path],
            found: false,
            currentWordIndex: safeWords.length - 1,
          },
          variables: { target, idx, missingChar: target[idx] ?? null, reason: 'null-child' },
          soundCue: 'fail',
          pedagogy: {
            what: `The branch needed for '${target[idx] ?? ''}' does not exist.`,
            why: 'A TST only allocates nodes that some inserted word needed, so a missing child is a definitive miss.',
            whatNext: 'Report the search result — no further comparisons can recover this word.',
          },
        });
        return false;
      }

      path.push(node.id);
      nodeVisits++;
      const ch = target[idx];

      if (ch < node.char) {
        comparisons++;
        pushFrame({
          codeLine: 19,
          action: 'SEARCH_LEFT',
          explanation: `'${ch}' < '${node.char}' — move LEFT, keeping string index ${idx}.`,
          state: {
            activeWord: target,
            activeCharIdx: idx,
            activeNodeId: node.id,
            branchTaken: 'LEFT',
            phase: 'search',
            pathIds: [...path],
            currentWordIndex: safeWords.length - 1,
          },
          variables: {
            target,
            idx,
            targetChar: ch,
            nodeChar: node.char,
            comparison: `'${ch}' < '${node.char}'`,
            nextChild: 'left',
          },
          soundCue: 'compare',
          pedagogy: {
            what: `target[${idx}] = '${ch}' is smaller than node.char = '${node.char}'.`,
            why: 'All smaller characters live in the left subtree, and the word index cannot advance on a miss.',
            whatNext: `Descend LEFT and compare '${ch}' again.`,
          },
        });
        return search(node.left, idx, path);
      }

      if (ch > node.char) {
        comparisons++;
        pushFrame({
          codeLine: 20,
          action: 'SEARCH_RIGHT',
          explanation: `'${ch}' > '${node.char}' — move RIGHT, keeping string index ${idx}.`,
          state: {
            activeWord: target,
            activeCharIdx: idx,
            activeNodeId: node.id,
            branchTaken: 'RIGHT',
            phase: 'search',
            pathIds: [...path],
            currentWordIndex: safeWords.length - 1,
          },
          variables: {
            target,
            idx,
            targetChar: ch,
            nodeChar: node.char,
            comparison: `'${ch}' > '${node.char}'`,
            nextChild: 'right',
          },
          soundCue: 'compare',
          pedagogy: {
            what: `target[${idx}] = '${ch}' is greater than node.char = '${node.char}'.`,
            why: 'All greater characters live in the right subtree, and the word index cannot advance on a miss.',
            whatNext: `Descend RIGHT and compare '${ch}' again.`,
          },
        });
        return search(node.right, idx, path);
      }

      comparisons++;
      if (idx + 1 < target.length) {
        pushFrame({
          codeLine: 21,
          action: 'SEARCH_MID',
          explanation: `'${ch}' = '${node.char}' — consume it and move MID to string index ${idx + 1}.`,
          state: {
            activeWord: target,
            activeCharIdx: idx,
            activeNodeId: node.id,
            branchTaken: 'MID',
            phase: 'search',
            pathIds: [...path],
            currentWordIndex: safeWords.length - 1,
          },
          variables: {
            target,
            idx,
            targetChar: ch,
            nodeChar: node.char,
            comparison: `'${ch}' = '${node.char}'`,
            nextIndex: idx + 1,
            nextChild: 'mid',
          },
          soundCue: 'compare',
          pedagogy: {
            what: `Character ${idx} matches; ${target.length - idx - 1} character(s) of the target remain.`,
            why: 'Only the MID branch means "same character, next position".',
            whatNext: `Descend MID and compare '${target[idx + 1]}'.`,
          },
        });
        return search(node.mid, idx + 1, path);
      }

      const matched = node.isEnd;
      pushFrame({
        codeLine: 22,
        action: 'SEARCH_CHECK_END',
        explanation: matched
          ? `All characters matched and node '${node.char}' has isEnd = true — "${target}" is a stored word.`
          : `All characters matched, but node '${node.char}' has isEnd = false — "${target}" is only a prefix.`,
        state: {
          activeWord: target,
          activeCharIdx: idx,
          activeNodeId: node.id,
          phase: 'search',
          pathIds: [...path],
          found: matched,
          currentWordIndex: safeWords.length - 1,
        },
        variables: { target, idx, terminalChar: node.char, isEnd: node.isEnd, matched },
        soundCue: matched ? 'success' : 'fail',
        pedagogy: {
          what: matched
            ? 'The walk consumed every character and landed on a terminal node.'
            : 'The walk consumed every character but the node is not a word boundary.',
          why: 'Exact-match search needs both conditions: all characters consumed AND isEnd = true.',
          whatNext: 'Report the final verdict.',
        },
      });
      return matched;
    }

    if (target.length === 0) {
      pushFrame({
        codeLine: 17,
        action: 'SEARCH_EMPTY',
        explanation: 'The empty string is never a stored word in this TST — report a miss without walking.',
        state: {
          activeWord: target,
          activeCharIdx: 0,
          activeNodeId: null,
          phase: 'search',
          pathIds: [],
          found: false,
          currentWordIndex: safeWords.length - 1,
        },
        variables: { target, reason: 'empty-target' },
        soundCue: 'fail',
        pedagogy: {
          what: 'The target has zero characters, so there is no character comparison to perform.',
          why: 'Insert never sets isEnd on the root for an empty word, so an empty target cannot match.',
          whatNext: 'Try a non-empty target to exercise the three-way walk.',
        },
      });
    } else {
      const searchPath: string[] = [];
      const found = search(root, 0, searchPath);
      pushFrame({
        codeLine: 22,
        action: 'SEARCH_COMPLETE',
        explanation: found
          ? `Search SUCCESS: "${target}" exists in the Ternary Search Tree.`
          : `Search FAILURE: "${target}" was NOT found in the tree.`,
        state: {
          activeWord: target,
          activeCharIdx: Math.max(0, target.length - 1),
          activeNodeId: searchPath[searchPath.length - 1] ?? null,
          phase: null,
          pathIds: [...searchPath],
          found,
          currentWordIndex: safeWords.length - 1,
        },
        variables: { target, found, comparisons },
        milestone: found ? 'Exact Word Verified' : 'Search Miss Confirmed',
        soundCue: found ? 'finish' : 'fail',
        pedagogy: {
          what: found
            ? `"${target}" reached a terminal node after ${comparisons} character comparison(s).`
            : `"${target}" cannot be formed along any root-to-terminal path (${comparisons} comparison(s)).`,
          why: found
            ? 'Every character matched and the final node is marked as a word end.'
            : 'Either a required child was missing or the final node was only a prefix.',
          whatNext: 'Use time-travel to replay the branch decisions, or edit the word list to compare cases.',
        },
      });
    }

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<TSTState>) => {
    const {
      root,
      activeWord,
      activeCharIdx,
      activeNodeId,
      branchTaken,
      found,
      phase,
      pathIds,
      createdNodeId,
      markedEndNodeId,
      insertedWords,
      currentWordIndex,
      totalWords,
    } = frame.state;

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

    // Column-based tidy layout: left subtree, node, mid subtree, right subtree.
    // Guarantees unique x positions (no overlap) at any tree size, unlike the
    // old halving layout which clipped deep chains like "cowboy".
    let colCursor = 0;
    let maxDepth = 0;
    function layout(node: TSTNodeData | null, depth: number): LayoutTST | null {
      if (!node) return null;
      const left = layout(node.left, depth + 1);
      const x = 40 + colCursor * 64;
      colCursor += 1;
      const mid = layout(node.mid, depth + 1);
      const right = layout(node.right, depth + 1);
      maxDepth = Math.max(maxDepth, depth);
      return {
        id: node.id,
        char: node.char,
        isEnd: node.isEnd,
        x,
        y: 50 + depth * 70,
        left,
        mid,
        right,
      };
    }

    const visualRoot = layout(root, 0);
    const edges: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      type: string;
      parentId: string;
      childId: string;
    }[] = [];
    const flatNodes: LayoutTST[] = [];

    function collect(n: LayoutTST | null) {
      if (!n) return;
      flatNodes.push(n);
      if (n.left) {
        edges.push({
          x1: n.x,
          y1: n.y,
          x2: n.left.x,
          y2: n.left.y,
          type: '<',
          parentId: n.id,
          childId: n.left.id,
        });
        collect(n.left);
      }
      if (n.mid) {
        edges.push({
          x1: n.x,
          y1: n.y,
          x2: n.mid.x,
          y2: n.mid.y,
          type: '=',
          parentId: n.id,
          childId: n.mid.id,
        });
        collect(n.mid);
      }
      if (n.right) {
        edges.push({
          x1: n.x,
          y1: n.y,
          x2: n.right.x,
          y2: n.right.y,
          type: '>',
          parentId: n.id,
          childId: n.right.id,
        });
        collect(n.right);
      }
    }
    collect(visualRoot);

    const pathSet = new Set(pathIds);
    const pathPairs = new Set(
      pathIds.slice(1).map((id, i) => `${pathIds[i]}>${id}`)
    );
    const activeNode = flatNodes.find((n) => n.id === activeNodeId) ?? null;
    const viewWidth = Math.max(720, colCursor * 64 + 80);
    const viewHeight = Math.max(320, (maxDepth + 1) * 70 + 60);

    const targetChar = activeWord ? activeWord[activeCharIdx] ?? '' : '';
    const operator = activeNode
      ? targetChar === activeNode.char
        ? '='
        : targetChar < activeNode.char
          ? '<'
          : '>'
      : '∅';

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-5 w-full max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            {phase && (
              <span
                className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${
                  phase === 'insert'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}
              >
                {phase}
              </span>
            )}
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              {phase === 'search' ? 'Search Target:' : phase === 'insert' ? 'Inserting:' : 'Word:'}
            </span>
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
            <span className="text-[11px] font-mono text-slate-400">
              words {Math.min(currentWordIndex + 1, totalWords)}/{totalWords}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Dictionary
          </span>
          {insertedWords.length === 0 && (
            <span className="text-[11px] font-mono text-slate-600 italic">empty</span>
          )}
          {insertedWords.map((word, idx) => (
            <span
              key={`${word}-${idx}`}
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                activeWord === word && phase === 'insert'
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/50'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700'
              }`}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 font-mono text-[11px]">
          <span className="text-slate-500 uppercase tracking-wider">Compare</span>
          <span className="text-cyan-300">
            word[{activeCharIdx}] = '{targetChar}'
          </span>
          <span className="text-amber-300 font-bold text-base leading-none">{operator}</span>
          <span className="text-slate-300">
            node.char = {activeNode ? `'${activeNode.char}'` : 'null'}
          </span>
          <span className="ml-auto text-slate-500">
            comparisons: <span className="text-slate-300">{frame.metrics?.comparisons ?? 0}</span>
          </span>
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 shadow-inner">
          <svg
            className="block mx-auto"
            width={viewWidth}
            height={viewHeight}
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          >
            {edges.map((e, idx) => {
              const onPath = pathPairs.has(`${e.parentId}>${e.childId}`);
              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={e.x1}
                    y1={e.y1}
                    x2={e.x2}
                    y2={e.y2}
                    stroke={onPath ? '#f59e0b' : '#475569'}
                    strokeWidth={onPath ? 2.5 : 1.5}
                    strokeDasharray={e.type === '=' ? undefined : '3 3'}
                  />
                  <text
                    x={(e.x1 + e.x2) / 2}
                    y={(e.y1 + e.y2) / 2 - 4}
                    textAnchor="middle"
                    fill={onPath ? '#fbbf24' : '#94a3b8'}
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {e.type}
                  </text>
                </g>
              );
            })}

            {flatNodes.map((n) => {
              const isActive = n.id === activeNodeId;
              const onPath = pathSet.has(n.id);
              const isCreated = n.id === createdNodeId;
              const justMarkedEnd = n.id === markedEndNodeId;

              let fill = '#0f172a';
              let stroke = n.isEnd ? '#10b981' : '#334155';
              let textFill = '#f8fafc';

              if (onPath && !isActive && !isCreated) {
                fill = '#1c1917';
                stroke = '#f59e0b';
              }
              if (isCreated) {
                fill = '#064e3b';
                stroke = '#34d399';
                textFill = '#d1fae5';
              }
              if (justMarkedEnd) {
                fill = '#064e3b';
                stroke = '#6ee7b7';
                textFill = '#d1fae5';
              }
              if (isActive && !isCreated && !justMarkedEnd) {
                fill = '#78350f';
                stroke = '#fbbf24';
                textFill = '#fde68a';
              }

              return (
                <g key={n.id} className="transition-all duration-300">
                  {n.isEnd && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="21"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="2 3"
                      opacity="0.9"
                    />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={isActive ? 18 : 16}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isActive || isCreated || justMarkedEnd ? 2.5 : n.isEnd ? 2 : 1.5}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    fill={textFill}
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {n.char}
                  </text>
                  {n.isEnd && (
                    <text
                      x={n.x + 17}
                      y={n.y - 15}
                      textAnchor="middle"
                      fill="#34d399"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      $
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-500">
          <span><span className="text-amber-300">&lt;</span> left = smaller char (same index)</span>
          <span><span className="text-amber-300">=</span> mid = matching char (index + 1)</span>
          <span><span className="text-amber-300">&gt;</span> right = greater char (same index)</span>
          <span><span className="text-emerald-400">$</span> / green ring = end of a stored word</span>
          <span><span className="text-emerald-400">●</span> green fill = node just created / just marked</span>
        </div>
      </div>
    );
  },
};
