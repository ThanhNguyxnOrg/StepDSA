import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface TrieNodeVisual {
  id: string;
  char: string;
  isEnd: boolean;
  x: number;
  y: number;
  status: 'default' | 'active' | 'created' | 'matched';
  children: string[]; // child IDs
}

export interface TrieState {
  nodes: TrieNodeVisual[];
  currentWord: string;
  currentCharIdx: number;
  action: 'insert' | 'search' | 'complete';
  queryPrefix?: string;
  matchedWords?: string[];
}

export interface TrieInput {
  wordsToInsert: string[];
  searchPrefix?: string;
}

const defaultTrieInput: TrieInput = {
  wordsToInsert: ['cat', 'car', 'cart', 'dog', 'dot'],
  searchPrefix: 'car',
};

export const trieModule: AlgorithmModule<TrieInput, TrieState> = {
  id: 'trie-prefix',
  title: 'Trie (Prefix Tree & Autocomplete)',
  category: 'trees-bst',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(L)',
    timeAverage: 'O(L)',
    timeWorst: 'O(L)',
    spaceAuxiliary: 'O(Σ · L · N)',
    worstCaseCondition: 'All words share zero common prefixes',
  },
  theory: {
    overview:
      'A Trie (Prefix Tree) is an efficient tree-like data structure used for storing strings where keys are paths from the root. Common prefixes are shared across multiple words.',
    whyItWorks:
      'Lookup, insertion, and prefix search take O(L) time proportional strictly to string length L, completely independent of the total dictionary size N.',
    invariant:
      'Prefix Sharing Invariant: If two words share an initial prefix of length K, they share the exact same first K nodes descending from the root.',
    pitfalls: [
      'High memory overhead per node if implemented with naive fixed-size arrays (alphabet size 26 or 256) instead of hash maps.',
      'Forgetting to set the isEndOfWord boolean flag when a word is a proper prefix of an existing word.',
    ],
  },
  presets: [
    {
      id: 'animals',
      label: 'Vehicles & Animals (cat, car, cart, dog, dot)',
      description: 'Shared prefixes "ca" and "do"',
      data: defaultTrieInput,
    },
    {
      id: 'coding-terms',
      label: 'Coding Keywords (byte, bit, bin, bug)',
      description: 'Divergent branches from "b"',
      data: {
        wordsToInsert: ['byte', 'bit', 'bin', 'bug'],
        searchPrefix: 'bi',
      },
    },
  ],
  defaultInput: defaultTrieInput,
  codeSnippets: {
    cpp: `struct TrieNode {
    unordered_map<char, TrieNode*> children;
    bool isEndOfWord = false;
};

class Trie {
    TrieNode* root = new TrieNode();
public:
    void insert(string word) {
        TrieNode* curr = root;
        for (char ch : word) {
            if (!curr->children.count(ch)) {
                curr->children[ch] = new TrieNode();
            }
            curr = curr->children[ch];
        }
        curr->isEndOfWord = true;
    }

    bool startsWith(string prefix) {
        TrieNode* curr = root;
        for (char ch : prefix) {
            if (!curr->children.count(ch)) return false;
            curr = curr->children[ch];
        }
        return true;
    }
};`,
    python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root
        for char in word:
            if char not in curr.children:
                curr.children[char] = TrieNode()
            curr = curr.children[char]
        curr.is_end_of_word = True

    def starts_with(self, prefix: str) -> bool:
        curr = self.root
        for char in prefix:
            if char not in curr.children:
                return False
            curr = curr.children[char]
        return True`,
    typescript: `class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

class Trie {
  root = new TrieNode();

  insert(word: string): void {
    let curr = this.root;
    for (const char of word) {
      if (!curr.children.has(char)) {
        curr.children.set(char, new TrieNode());
      }
      curr = curr.children.get(char)!;
    }
    curr.isEndOfWord = true;
  }
}`,
    java: `class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isEndOfWord = false;
}

class Trie {
    private TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode curr = root;
        for (char ch : word.toCharArray()) {
            curr.children.putIfAbsent(ch, new TrieNode());
            curr = curr.children.get(ch);
        }
        curr.isEndOfWord = true;
    }
}`,
    pseudocode: `function insert(word):
    curr = root
    for each char in word:
        if char not in curr.children:
            curr.children[char] = new Node()
        curr = curr.children[char]
    curr.isEndOfWord = true`,
  },

  generateTimeline: (input: TrieInput): ExecutionFrame<TrieState>[] => {
    const { wordsToInsert, searchPrefix = 'car' } = input;
    const frames: ExecutionFrame<TrieState>[] = [];

    // Internal trie representation for visual layout
    interface InternalNode {
      id: string;
      char: string;
      isEnd: boolean;
      parentId?: string;
      depth: number;
      children: Record<string, InternalNode>;
    }

    const root: InternalNode = {
      id: 'root',
      char: 'ROOT',
      isEnd: false,
      depth: 0,
      children: {},
    };

    function flattenNodes(activeId?: string): TrieNodeVisual[] {
      const visualList: TrieNodeVisual[] = [];
      const depthLevels: Record<number, InternalNode[]> = {};

      function collect(node: InternalNode) {
        if (!depthLevels[node.depth]) depthLevels[node.depth] = [];
        depthLevels[node.depth].push(node);
        Object.values(node.children).forEach(collect);
      }
      collect(root);

      // Compute coordinate positions based on depth and sibling index
      Object.entries(depthLevels).forEach(([dStr, nodeList]) => {
        const d = Number(dStr);
        const y = 35 + d * 52;
        const total = nodeList.length;
        nodeList.forEach((n, idx) => {
          const x = 320 + (idx - (total - 1) / 2) * (560 / Math.max(1, total));
          visualList.push({
            id: n.id,
            char: n.char,
            isEnd: n.isEnd,
            x,
            y,
            status: n.id === activeId ? 'active' : n.isEnd ? 'matched' : 'default',
            children: Object.values(n.children).map((c) => c.id),
          });
        });
      });

      return visualList;
    }

    // Frame 0: Init Empty Trie
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 8,
      explanation: 'Initialized empty Trie with ROOT node. Preparing to insert word list.',
      variables: { totalWords: wordsToInsert.length, activeWord: '' },
      state: {
        nodes: flattenNodes('root'),
        currentWord: '',
        currentCharIdx: 0,
        action: 'insert',
      },
    });

    // Step-by-step insertion
    wordsToInsert.forEach((word) => {
      let curr = root;

      for (let i = 0; i < word.length; i++) {
        const ch = word[i];
        const isLast = i === word.length - 1;
        const isNewNode = !curr.children[ch];

        if (isNewNode) {
          curr.children[ch] = {
            id: `${curr.id}_${ch}`,
            char: ch,
            isEnd: false,
            parentId: curr.id,
            depth: curr.depth + 1,
            children: {},
          };
        }

        curr = curr.children[ch];
        if (isLast) {
          curr.isEnd = true;
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: isNewNode ? 13 : 15,
          explanation: isNewNode
            ? `Inserting '${word}': Character '${ch}' not found under '${curr.parentId}'. Created new Trie node for '${ch}'.`
            : `Inserting '${word}': Character '${ch}' already exists as a shared prefix. Reusing node.`,
          isMilestone: isLast,
          milestoneTitle: isLast ? `Inserted Word: "${word}"` : undefined,
          variables: {
            word,
            char: ch,
            position: `${i + 1}/${word.length}`,
            isEndOfWord: isLast,
          },
          conditionEval: {
            expr: `hasChild('${ch}')`,
            result: !isNewNode,
          },
          state: {
            nodes: flattenNodes(curr.id),
            currentWord: word,
            currentCharIdx: i,
            action: 'insert',
          },
        });
      }
    });

    // Final prefix search demonstration
    if (searchPrefix) {
      let currSearch: InternalNode | null = root;
      let matched = true;

      for (let i = 0; i < searchPrefix.length; i++) {
        const ch = searchPrefix[i];
        if (currSearch && currSearch.children[ch]) {
          currSearch = currSearch.children[ch];
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 23,
            explanation: `Prefix search "${searchPrefix}": Matching char '${ch}' at depth ${i + 1}. Node exists!`,
            variables: { prefix: searchPrefix, matchedChar: ch, status: 'MATCHING' },
            state: {
              nodes: flattenNodes(currSearch.id),
              currentWord: searchPrefix,
              currentCharIdx: i,
              action: 'search',
              queryPrefix: searchPrefix,
            },
          });
        } else {
          matched = false;
          break;
        }
      }

      // Collect all words under search prefix
      const matches: string[] = [];
      function collectWords(n: InternalNode, acc: string) {
        if (n.isEnd) matches.push(acc);
        Object.entries(n.children).forEach(([c, child]) => collectWords(child, acc + c));
      }
      if (matched && currSearch) {
        collectWords(currSearch, searchPrefix);
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 26,
        isMilestone: true,
        milestoneTitle: `Prefix "${searchPrefix}" Found`,
        explanation: `Prefix query "${searchPrefix}" complete! Found ${matches.length} matching completions: [${matches.join(', ')}].`,
        variables: { query: searchPrefix, completionsCount: matches.length, status: 'FOUND' },
        state: {
          nodes: flattenNodes(currSearch ? currSearch.id : undefined),
          currentWord: searchPrefix,
          currentCharIdx: searchPrefix.length,
          action: 'complete',
          queryPrefix: searchPrefix,
          matchedWords: matches,
        },
      });
    }

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<TrieState>) => {
    const { nodes, currentWord, queryPrefix, matchedWords } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-center p-3 gap-4 max-w-5xl mx-auto min-h-[360px]">
        {/* SVG Canvas for Trie Hierarchy */}
        <div className="flex-1 w-full bg-[#111827]/80 border border-[#1F293D] rounded-2xl p-4 relative flex items-center justify-center min-h-[310px] overflow-x-auto">
          <svg className="w-full h-[290px] min-w-[500px]" viewBox="0 0 640 280">
            {/* Edge Connections between Parent and Children */}
            {nodes.map((node) =>
              node.children.map((childId) => {
                const child = nodes.find((n) => n.id === childId);
                if (!child) return null;
                const isPathActive = child.status === 'active' || child.status === 'matched';

                return (
                  <line
                    key={`${node.id}->${childId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={child.x}
                    y2={child.y}
                    stroke={isPathActive ? '#06B6D4' : '#334155'}
                    strokeWidth={isPathActive ? 2.5 : 1.5}
                    className="transition-colors duration-200"
                  />
                );
              })
            )}

            {/* Nodes */}
            {nodes.map((node) => {
              const isActive = node.status === 'active';
              let fill = '#1E293B';
              let stroke = '#475569';
              let textColor = '#F1F5F9';

              if (isActive) {
                fill = '#06B6D4';
                stroke = '#0891B2';
                textColor = '#0B0F19';
              } else if (node.isEnd) {
                fill = '#10B981';
                stroke = '#059669';
                textColor = '#0B0F19';
              }

              return (
                <g key={node.id} className="cursor-pointer">
                  {/* End of word ring */}
                  {node.isEnd && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={20}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth={1.5}
                      strokeDasharray="2 2"
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={16}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={2}
                    className="transition-all duration-200 shadow-md"
                  />

                  <text
                    x={node.x}
                    y={node.y + 3.5}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={node.id === 'root' ? 9 : 12}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.char}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Trie Legend & Autocomplete Card */}
        <div className="w-full md:w-64 flex flex-col gap-3 shrink-0">
          {/* Active Word & Autocomplete Card */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 text-xs font-mono shadow-sm">
            <div className="text-[11px] font-semibold uppercase text-slate-400 mb-2">
              Prefix Autocomplete
            </div>

            {queryPrefix ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Prefix:</span>
                  <strong className="text-[#06B6D4] font-bold">"{queryPrefix}"</strong>
                </div>

                <div className="pt-1.5 border-t border-[#1F293D]">
                  <span className="text-slate-400 block mb-1">Completions:</span>
                  {matchedWords && matchedWords.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {matchedWords.map((w) => (
                        <span
                          key={w}
                          className="px-2 py-0.5 rounded bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] font-bold"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">No matches</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-slate-400">
                Active Word: <strong className="text-white">"{currentWord}"</strong>
              </div>
            )}
          </div>

          {/* Node Legend */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 text-xs font-mono space-y-2">
            <div className="text-[11px] font-semibold uppercase text-slate-400">Node Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10B981] border border-[#059669]" />
              <span className="text-emerald-200">Green: isEndOfWord (★)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#06B6D4]" />
              <span className="text-cyan-200">Cyan: Active Traversal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1E293B] border border-[#475569]" />
              <span className="text-slate-300">Slate: Prefix Node</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
