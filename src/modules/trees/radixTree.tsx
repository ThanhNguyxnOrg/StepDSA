import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface RadixEdge {
  label: string;
  target: RadixNodeData;
}

export interface RadixNodeData {
  id: string;
  isEnd: boolean;
  edges: RadixEdge[];
}

export interface RadixTreeState {
  root: RadixNodeData | null;
  activeWord: string | null;
  activeNodeId: string | null;
  activeEdgeLabel: string | null;
  matchedPrefix: string;
  found: boolean | null;
}

function cloneRadix(node: RadixNodeData | null): RadixNodeData | null {
  if (!node) return null;
  return {
    id: node.id,
    isEnd: node.isEnd,
    edges: node.edges.map((e) => ({
      label: e.label,
      target: cloneRadix(e.target)!,
    })),
  };
}

export const radixTreeModule: AlgorithmModule<
  { words: string[]; searchTarget: string },
  RadixTreeState
> = {
  id: 'radix-tree',
  title: 'Radix Tree (Compressed Patricia Trie Edge Compacting)',
  category: 'trees-bst',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(L)',
    timeAverage: 'O(L)',
    timeWorst: 'O(L)',
    spaceAuxiliary: 'O(N) bounded by at most N internal branching nodes',
    worstCaseCondition: 'Strictly linear in key length L independent of dictionary size',
  },
  theory: {
    overview:
      'A Radix Tree (also known as a Compact Trie or Patricia Tree) is a space-optimized Trie in which every node with only one child is merged with its child. Edge labels contain variable-length strings rather than individual characters.',
    whyItWorks:
      'Standard Tries waste huge amounts of memory creating single-child chains (e.g., "r" -> "o" -> "m" -> "a" -> "n"). Radix Trees compress these paths into a single edge ("roman"), bounding total nodes by 2N and dramatically cutting pointer traversals.',
    invariant:
      'Compaction Invariant: No non-root internal node has exactly one child. Every edge label is non-empty, and edges radiating from the same node start with distinct characters.',
    pitfalls: [
      'Edge splitting logic errors when a new word shares only a partial prefix with an existing edge label.',
      'Failing to preserve terminal isEnd flags during node splits.',
    ],
  },
  presets: [
    {
      id: 'radix-romans',
      label: 'Classic Roman Words',
      description: 'Inserts ["romane", "romanus", "romulus", "rubens"] compressing common "rom" prefixes',
      data: {
        words: ['romane', 'romanus', 'romulus', 'rubens'],
        searchTarget: 'romanus',
      },
    },
    {
      id: 'radix-code-words',
      label: 'Tech Terminology',
      description: 'Inserts ["test", "tester", "team"] with edge splits',
      data: {
        words: ['test', 'tester', 'team'],
        searchTarget: 'team',
      },
    },
  ],
  defaultInput: {
    words: ['romane', 'romanus', 'romulus', 'rubens'],
    searchTarget: 'romanus',
  },
  codeSnippets: {
    cpp: `struct RadixNode {
    bool isEnd = false;
    map<string, RadixNode*> children;
};

void insert(RadixNode* root, string word) {
    RadixNode* curr = root;
    while (!word.empty()) {
        bool found = false;
        for (auto& [edge, child] : curr->children) {
            int common = 0;
            while (common < edge.size() && common < word.size() && edge[common] == word[common])
                common++;
            if (common > 0) {
                if (common == edge.size()) {
                    word = word.substr(common);
                    curr = child;
                    found = true;
                    break;
                } else {
                    // Split edge
                    RadixNode* split = new RadixNode();
                    split->children[edge.substr(common)] = child;
                    curr->children.erase(edge);
                    curr->children[edge.substr(0, common)] = split;
                    if (common == word.size()) split->isEnd = true;
                    else split->children[word.substr(common)] = new RadixNode{true};
                    return;
                }
            }
        }
        if (!found) {
            curr->children[word] = new RadixNode{true};
            return;
        }
    }
    curr->isEnd = true;
}`,
    python: `class RadixNode:
    def __init__(self, is_end=False):
        self.is_end = is_end
        self.children = {} # edge_label -> RadixNode

def insert(root, word):
    curr = root
    while word:
        for edge, child in list(curr.children.items()):
            common = 0
            while common < len(edge) and common < len(word) and edge[common] == word[common]:
                common += 1
            if common > 0:
                if common == len(edge):
                    word = word[common:]
                    curr = child
                    break
                else:
                    split = RadixNode()
                    split.children[edge[common:]] = child
                    del curr.children[edge]
                    curr.children[edge[:common]] = split
                    if common == len(word): split.is_end = True
                    else: split.children[word[common:]] = RadixNode(True)
                    return
        else:
            curr.children[word] = RadixNode(True)
            return
    curr.is_end = True`,
    typescript: `interface RadixNode {
  isEnd: boolean;
  edges: { label: string; child: RadixNode }[];
}`,
    java: `class RadixNode {
    boolean isEnd;
    Map<String, RadixNode> children = new HashMap<>();
}`,
    pseudocode: `function buildRadixTree(words):
    root = new Node()
    for each word w:
        insert(root, w)
    return root

function insert(node, word):
    remaining = word
    while remaining is not empty:
        # scan the outgoing edges for the longest shared prefix
        commonLabel = best edge label sharing a prefix with remaining
        if commonLabel is empty: attach a new leaf edge labeled remaining
        else:
            let common = shared prefix length with that edge
            if common == edge.label.length:
                # the edge fully matches: descend
                remaining = remaining.slice(common); node = edge.target
            else:
                # divergence inside the edge: split it
                splitNode = new Node()
                splitNode.edges.add(edge.label.slice(common) -> edge.target)
                edge.label = edge.label.slice(0, common); edge.target = splitNode
                if remaining.length == common: splitNode.isEnd = true
                else: splitNode.edges.add(remaining.slice(common) -> new leaf)
                return
    node.isEnd = true       # the word ends exactly here

function search(root, target):
    remaining = target; curr = root
    while remaining is not empty:
        find an edge whose label is a prefix of remaining
        if none: return MISS
        curr = edge.target; remaining = remaining without the label
    return curr.isEnd ? HIT : MISS
# result: exact-match lookup with O(|target|) character work`,
  },
  generateTimeline: (input: {
    words: string[];
    searchTarget: string;
  }): ExecutionFrame<RadixTreeState>[] => {
    const words = input?.words?.length ? input.words : ['romane', 'romanus', 'romulus', 'rubens'];
    const target = input?.searchTarget ?? 'romanus';

    let nodeCounter = 0;
    function makeNode(isEnd = false): RadixNodeData {
      return {
        id: `radix-${++nodeCounter}`,
        isEnd,
        edges: [],
      };
    }

    const frames: ExecutionFrame<RadixTreeState>[] = [];
    const root: RadixNodeData = makeNode(false);
    let checkpointAdded = false;
    let firstSplitAdded = false;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        root: cloneRadix(root),
        activeWord: null,
        activeNodeId: root.id,
        activeEdgeLabel: null,
        matchedPrefix: '',
        found: null,
      },
      callStack: [{ name: 'radixInit', params: { totalWords: words.length }, line: 1, isCurrent: true }],
      variables: { totalWords: words.length, searchTarget: target },
      pedagogy: {
        what: `A radix tree compacts every edge into a whole substring; nodes exist only at branch points and word ends.`,
        why: 'Unlike a character trie, an n-character chain becomes one labeled edge, so lookups compare substrings.',
        whatNext: `Insert [${words.join(', ')}] one word at a time.`,
      },
      explanation: `Initialized empty Radix Tree root. Preparing to insert ${words.length} words.`,
    });

    function insert(curr: RadixNodeData, word: string) {
      let remaining = word;

      while (remaining.length > 0) {
        let matchedEdge: RadixEdge | null = null;
        let common = 0;

        for (const edge of curr.edges) {
          common = 0;
          while (
            common < edge.label.length &&
            common < remaining.length &&
            edge.label[common] === remaining[common]
          ) {
            common++;
          }
          if (common > 0) {
            matchedEdge = edge;
            break;
          }
        }

        if (!matchedEdge) {
          const newNode = makeNode(true);
          curr.edges.push({ label: remaining, target: newNode });

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            action: 'ATTACH_LEAF',
            state: {
              root: cloneRadix(root),
              activeWord: word,
              activeNodeId: newNode.id,
              activeEdgeLabel: remaining,
              matchedPrefix: word.slice(0, word.length - remaining.length),
              found: null,
            },
            callStack: [{ name: `attachLeaf("${remaining}")`, params: { label: remaining }, line: 12, isCurrent: true }],
            variables: { attachedLabel: remaining, parentId: curr.id, asLeaf: true },
            pedagogy: {
              what: `No outgoing edge shares a prefix with "${remaining}", so the whole remainder becomes a new leaf edge.`,
              why: 'Compaction: the entire suffix is stored in one label instead of one node per character.',
              whatNext: '"' + word + '" is fully inserted.',
            },
            explanation: `Attached new leaf edge "${remaining}" under node ${curr.id}.`,
          });
          return;
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          action: 'MATCH_EDGE',
          state: {
            root: cloneRadix(root),
            activeWord: word,
            activeNodeId: curr.id,
            activeEdgeLabel: matchedEdge.label,
            matchedPrefix: word.slice(0, word.length - remaining.length) + matchedEdge.label.slice(0, common),
            found: null,
          },
          callStack: [{ name: `matchEdge("${matchedEdge.label}")`, params: { common }, line: 14, isCurrent: true }],
          variables: { edgeLabel: matchedEdge.label, remaining, commonPrefixLength: common },
          pedagogy: {
            what: `Edge label "${matchedEdge.label}" shares the ${common}-character prefix "${matchedEdge.label.slice(0, common)}" with remaining "${remaining}".`,
            why: 'Substring comparison at each node replaces character-by-character walking; that is the radix advantage.',
            whatNext:
              common === matchedEdge.label.length
                ? 'The whole label matched — descend into its target node.'
                : 'The match ends inside the label — split the edge at the divergence point.',
          },
          checkpoint: !checkpointAdded
            ? {
                id: 'radix-edge-compaction',
                question: 'Why can a radix tree store several characters on a single edge?',
                options: [
                  'Chains with no branching are compressed into one label, so nodes appear only where paths diverge or words end — fewer nodes and substring compares instead of per-character hops',
                  'Because edge labels are sorted alphabetically for binary search',
                ],
                correctIndex: 0,
                explanation:
                  'Compaction is the whole point of a radix tree: "romane" and "romanus" share "roma", so one edge carries the common prefix and the divergence creates a split node.',
              }
            : undefined,
          explanation: `Edge "${matchedEdge.label}" shares prefix length ${common} with "${remaining}".`,
        });
        checkpointAdded = true;

        if (common === matchedEdge.label.length) {
          remaining = remaining.slice(common);
          curr = matchedEdge.target;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 17,
            action: 'DESCEND',
            state: {
              root: cloneRadix(root),
              activeWord: word,
              activeNodeId: curr.id,
              activeEdgeLabel: matchedEdge.label,
              matchedPrefix: word.slice(0, word.length - remaining.length),
              found: null,
            },
            callStack: [{ name: `descend("${matchedEdge.label}")`, params: { remaining }, line: 17, isCurrent: true }],
            variables: { consumedLabel: matchedEdge.label, remaining },
            pedagogy: {
              what: `Edge "${matchedEdge.label}" was consumed entirely; remaining drops to "${remaining}".`,
              why: 'A full-edge match needs no structural change — the walk simply continues one level deeper.',
              whatNext: remaining.length > 0 ? `Continue inserting "${remaining}" from the new node.` : 'The word ends exactly here; mark isEnd.',
            },
            explanation: `Descended along edge "${matchedEdge.label}"; remaining = "${remaining}".`,
          });
        } else {
          // Split edge
          const splitNode = makeNode(false);
          const oldTarget = matchedEdge.target;
          const oldRemainingLabel = matchedEdge.label.slice(common);

          splitNode.edges.push({ label: oldRemainingLabel, target: oldTarget });
          matchedEdge.label = matchedEdge.label.slice(0, common);
          matchedEdge.target = splitNode;

          let newSuffix: string | null = null;
          if (common === remaining.length) {
            splitNode.isEnd = true;
          } else {
            newSuffix = remaining.slice(common);
            const newLeaf = makeNode(true);
            splitNode.edges.push({ label: newSuffix, target: newLeaf });
          }

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 22,
            action: 'SPLIT_EDGE',
            ...(!firstSplitAdded
              ? { isMilestone: true, milestoneTitle: 'First Edge Split Created' }
              : {}),
            state: {
              root: cloneRadix(root),
              activeWord: word,
              activeNodeId: splitNode.id,
              activeEdgeLabel: matchedEdge.label,
              matchedPrefix: word.slice(0, word.length - remaining.length) + matchedEdge.label,
              found: null,
            },
            callStack: [{ name: `splitEdge("${matchedEdge.label}")`, params: { common, oldSuffix: oldRemainingLabel }, line: 22, isCurrent: true }],
            variables: {
              commonPrefix: matchedEdge.label,
              pushedDownSuffix: oldRemainingLabel,
              newBranchSuffix: newSuffix ?? '(word ends at split)',
            },
            pedagogy: {
              what: `The edge is split after "${matchedEdge.label}": its old suffix "${oldRemainingLabel}" moves under a new split node.`,
              why: 'The paths diverge inside this edge, so a branch point must be created exactly where the shared prefix ends.',
              whatNext: newSuffix
                ? `Attach the divergent remainder "${newSuffix}" as a sibling leaf.`
                : 'The inserted word ends at the split node, so it is marked as a word end.',
            },
            explanation: `Split edge: common "${matchedEdge.label}", old suffix "${oldRemainingLabel}" pushed down${newSuffix ? `, new branch "${newSuffix}"` : ', split node marked as word end'}.`,
          });
          firstSplitAdded = true;
          return;
        }
      }
      curr.isEnd = true;
    }

    words.forEach((w, wi) => {
      insert(root, w);
      const isLastWord = wi === words.length - 1;
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 4,
        action: 'INSERT_WORD',
        ...(isLastWord
          ? { isMilestone: true, milestoneTitle: 'Dictionary Fully Inserted' }
          : {}),
        state: {
          root: cloneRadix(root),
          activeWord: w,
          activeNodeId: root.id,
          activeEdgeLabel: null,
          matchedPrefix: w,
          found: null,
        },
        callStack: [{ name: 'insertWord', params: { word: w }, line: 4, isCurrent: true }],
        variables: { insertedWord: w },
        pedagogy: {
          what: `Word "${w}" is fully inserted; the dictionary now holds ${wi + 1}/${words.length} words.`,
          why: 'Insertion only walks the path whose edge labels share prefixes; every other subtree is untouched.',
          whatNext: isLastWord
            ? `Run the exact-match search for "${target}" starting from the root.`
            : `Insert the next word "${words[wi + 1]}".`,
        },
        explanation: `Inserted word "${w}" via the buildRadixTree loop (line 4); compaction preserved.`,
      });
    });

    // Now search for target
    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 28,
      action: 'START_SEARCH',
      state: {
        root: cloneRadix(root),
        activeWord: target,
        activeNodeId: root.id,
        activeEdgeLabel: null,
        matchedPrefix: '',
        found: null,
      },
      callStack: [{ name: 'search', params: { target }, line: 28, isCurrent: true }],
      variables: { target },
      pedagogy: {
        what: `Exact-match search starts for "${target}" at the root (line 28).`,
        why: 'Search reuses the same prefix-sharing structure: whole edge labels are compared as substrings, never character by character across nodes.',
        whatNext: 'Walk down edges whose label is a prefix of the remaining key.',
      },
      explanation: `Initiating search for "${target}" from root.`,
    });

    let curr: RadixNodeData | null = root;
    let remaining = target;
    let found = false;

    while (curr && remaining.length > 0) {
      let matchedEdge: RadixEdge | null = null;
      for (const edge of curr.edges) {
        if (remaining.startsWith(edge.label)) {
          matchedEdge = edge;
          break;
        }
      }

      if (!matchedEdge) {
        break;
      }

      const remainingAfter = remaining.slice(matchedEdge.label.length);
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 33,
        action: 'TRAVERSE_EDGE',
        state: {
          root: cloneRadix(root),
          activeWord: target,
          activeNodeId: matchedEdge.target.id,
          activeEdgeLabel: matchedEdge.label,
          matchedPrefix: target.slice(0, target.length - remaining.length + matchedEdge.label.length),
          found: null,
        },
        callStack: [{ name: 'traverseEdge', params: { label: matchedEdge.label }, line: 33, isCurrent: true }],
        variables: { matchedEdgeLabel: matchedEdge.label, remainingBefore: remaining, remainingAfter },
        pedagogy: {
          what: `Edge "${matchedEdge.label}" is a prefix of the remaining key, so the walk descends and consumes it whole.`,
          why: 'Each traversal spends O(label length) character work and skips every node that compaction removed.',
          whatNext:
            remainingAfter.length > 0
              ? `Continue with the remaining key "${remainingAfter}".`
              : 'The key is fully consumed; check whether this node marks a word end.',
        },
        explanation: `Matched edge label "${matchedEdge.label}". Traversing down to node ${matchedEdge.target.id}.`,
      });

      remaining = remaining.slice(matchedEdge.label.length);
      curr = matchedEdge.target;
    }

    if (curr && remaining.length === 0 && curr.isEnd) {
      found = true;
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 34,
      action: 'SEARCH_COMPLETE',
      ...(found ? { isMilestone: true, milestoneTitle: 'Exact Match Verified' } : {}),
      state: {
        root: cloneRadix(root),
        activeWord: target,
        activeNodeId: curr?.id ?? null,
        activeEdgeLabel: null,
        matchedPrefix: target,
        found,
      },
      callStack: [{ name: 'search', params: { found: found ? 1 : 0 }, line: 34, isCurrent: true }],
      variables: { completed: true, target, searchSuccess: found },
      pedagogy: {
        what: found
          ? `The key "${target}" was consumed exactly and the final node is a word end — exact match verified (line 34).`
          : `The walk stopped without consuming all of "${target}" at a word-end node — the key is not present.`,
        why: 'A radix search only matches on word boundaries: consuming every character is necessary, but the final node must also carry the isEnd flag.',
        whatNext: found
          ? 'Done — the dictionary lookup answered HIT in O(|target|) character work.'
          : 'Done — report MISS; the key shares prefixes but was never inserted as a word.',
      },
      explanation: found
        ? `Search SUCCESS: Exact match for "${target}" verified in Radix Tree!`
        : `Search MISS: Word "${target}" does not exist in Radix Tree.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<RadixTreeState>) => {
    const { root, activeWord, activeNodeId, activeEdgeLabel, matchedPrefix, found } = frame.state;

    interface LayoutRadix {
      id: string;
      isEnd: boolean;
      x: number;
      y: number;
      edges: { label: string; target: LayoutRadix }[];
    }

    function layout(node: RadixNodeData | null, x: number, y: number, dx: number): LayoutRadix | null {
      if (!node) return null;
      const childCount = node.edges.length;
      const sliceWidth = childCount > 0 ? (dx * 2) / childCount : 0;

      return {
        id: node.id,
        isEnd: node.isEnd,
        x,
        y,
        edges: node.edges.map((e, idx) => ({
          label: e.label,
          target: layout(
            e.target,
            x - dx + (idx + 0.5) * sliceWidth,
            y + 75,
            Math.max(45, dx * 0.45)
          )!,
        })),
      };
    }

    const visualRoot = layout(root, 360, 45, 170);
    const edgesList: { x1: number; y1: number; x2: number; y2: number; label: string }[] = [];
    const nodesList: LayoutRadix[] = [];

    function collect(n: LayoutRadix | null) {
      if (!n) return;
      nodesList.push(n);
      for (const e of n.edges) {
        if (e.target) {
          edgesList.push({ x1: n.x, y1: n.y, x2: e.target.x, y2: e.target.y, label: e.label });
          collect(e.target);
        }
      }
    }
    collect(visualRoot);

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Search:</span>
            {activeWord && (
              <span className="font-mono text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded">
                {activeWord}
              </span>
            )}
            {matchedPrefix && (
              <span className="text-xs font-mono text-slate-400">
                Matched: <strong className="text-emerald-400">{matchedPrefix}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {found === true && (
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
                MATCH FOUND
              </span>
            )}
            {found === false && (
              <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded">
                NOT PRESENT
              </span>
            )}
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[340px] flex items-center justify-center">
          <svg className="w-[720px] h-[320px]" viewBox="0 0 720 320">
            {edgesList.map((e, idx) => {
              const isEdgeActive = e.label === activeEdgeLabel;
              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={e.x1}
                    y1={e.y1}
                    x2={e.x2}
                    y2={e.y2}
                    stroke={isEdgeActive ? '#38bdf8' : '#475569'}
                    strokeWidth={isEdgeActive ? '3' : '1.5'}
                  />
                  <rect
                    x={(e.x1 + e.x2) / 2 - 20}
                    y={(e.y1 + e.y2) / 2 - 10}
                    width="40"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke={isEdgeActive ? '#38bdf8' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x={(e.x1 + e.x2) / 2}
                    y={(e.y1 + e.y2) / 2 + 3}
                    textAnchor="middle"
                    fill={isEdgeActive ? '#38bdf8' : '#94a3b8'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    "{e.label}"
                  </text>
                </g>
              );
            })}

            {nodesList.map((n) => {
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
                    r="12"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isActive ? '2.5' : n.isEnd ? '2' : '1.5'}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
