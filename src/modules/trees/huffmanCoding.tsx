import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface HuffmanCharFreq {
  char: string;
  freq: number;
}

export interface HuffmanNodeData {
  id: string;
  char?: string;
  freq: number;
  leftId?: string;
  rightId?: string;
}

export interface HuffmanState {
  charFreqs: HuffmanCharFreq[];
  heap: HuffmanNodeData[];
  allNodes: Record<string, HuffmanNodeData>;
  rootId?: string;
  activePair?: [string, string];
  justMergedId?: string;
  prefixCodes: Record<string, string>;
  totalOriginalBits: number;
  totalCompressedBits: number;
}

export const huffmanCodingModule: AlgorithmModule<
  { charFreqs: HuffmanCharFreq[] },
  HuffmanState
> = {
  id: 'huffman-coding',
  title: 'Huffman Coding (Greedy Min-Heap Optimal Prefix Tree O(N log N))',
  category: 'trees-bst',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N) priority queue & tree nodes',
    worstCaseCondition: 'All characters have non-zero distinct frequencies processed by min-heap',
  },
  theory: {
    overview:
      'Huffman coding is a greedy lossless data compression algorithm. It assigns variable-length prefix codes to characters: frequent characters receive short codes while rare characters receive longer codes.',
    whyItWorks:
      'By repeatedly merging the two nodes with minimal frequency into a parent node whose weight is their sum, the algorithm guarantees the Prefix Rule: no code is a prefix of another, and the weighted path length sum(f_i * len_i) is mathematically minimal.',
    invariant:
      'Optimal Substructure & Greedy Choice: The two symbols with smallest frequencies appear as sibling leaves at the deepest level of the optimal prefix tree.',
    pitfalls: [
      'Violating the prefix property, which causes ambiguous decoding.',
      'Treating equal frequency nodes inconsistently, though all valid tie-break trees produce identical optimal weighted lengths.',
    ],
  },
  presets: [
    {
      id: 'textbook-6',
      label: 'Classic Textbook: 6 Characters (A:5, B:9, C:12, D:13, E:16, F:45)',
      description: 'F receives short code (1 bit) due to dominating 45 frequency',
      data: {
        charFreqs: [
          { char: 'A', freq: 5 },
          { char: 'B', freq: 9 },
          { char: 'C', freq: 12 },
          { char: 'D', freq: 13 },
          { char: 'E', freq: 16 },
          { char: 'F', freq: 45 },
        ],
      },
    },
    {
      id: 'short-alphabet',
      label: '4 Characters: (A:10, B:15, C:30, D:40)',
      description: 'Compact 4-node tree',
      data: {
        charFreqs: [
          { char: 'A', freq: 10 },
          { char: 'B', freq: 15 },
          { char: 'C', freq: 30 },
          { char: 'D', freq: 40 },
        ],
      },
    },
  ],
  defaultInput: {
    charFreqs: [
      { char: 'A', freq: 5 },
      { char: 'B', freq: 9 },
      { char: 'C', freq: 12 },
      { char: 'D', freq: 13 },
      { char: 'E', freq: 16 },
      { char: 'F', freq: 45 },
    ],
  },
  codeSnippets: {
    cpp: `struct Node {
    char ch; int freq;
    Node *left, *right;
    Node(char c, int f) : ch(c), freq(f), left(nullptr), right(nullptr) {}
};
struct Compare {
    bool operator()(Node* a, Node* b) { return a->freq > b->freq; }
};
Node* buildHuffmanTree(const vector<pair<char, int>>& freqs) {
    priority_queue<Node*, vector<Node*>, Compare> pq;
    for (auto& p : freqs) pq.push(new Node(p.first, p.second));
    while (pq.size() > 1) {
        Node* left = pq.top(); pq.pop();
        Node* right = pq.top(); pq.pop();
        Node* parent = new Node('\\0', left->freq + right->freq);
        parent->left = left; parent->right = right;
        pq.push(parent);
    }
    return pq.top();
}`,
    python: `import heapq

class Node:
    def __init__(self, char, freq):
        self.char, self.freq = char, freq
        self.left, self.right = None, None
    def __lt__(self, other):
        return self.freq < other.freq

def build_huffman_tree(frequencies):
    heap = [Node(ch, f) for ch, f in frequencies.items()]
    heapq.heapify(heap)
    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        parent = Node(None, left.freq + right.freq)
        parent.left, parent.right = left, right
        heapq.heappush(heap, parent)
    return heap[0]`,
    typescript: `interface HuffmanNode {
    char?: string; freq: number;
    left?: HuffmanNode; right?: HuffmanNode;
}
function buildHuffmanTree(freqs: { char: string; freq: number }[]): HuffmanNode {
    const heap = freqs.map(f => ({ ...f }));
    heap.sort((a, b) => a.freq - b.freq);
    while (heap.length > 1) {
        const left = heap.shift()!;
        const right = heap.shift()!;
        const parent: HuffmanNode = {
            freq: left.freq + right.freq,
            left, right
        };
        heap.push(parent);
        heap.sort((a, b) => a.freq - b.freq);
    }
    return heap[0];
}`,
    java: `class Node implements Comparable<Node> {
    char ch; int freq;
    Node left, right;
    public int compareTo(Node o) { return Integer.compare(this.freq, o.freq); }
}
Node buildHuffman(char[] chars, int[] freqs) {
    PriorityQueue<Node> pq = new PriorityQueue<>();
    for (int i = 0; i < chars.length; i++) pq.add(new Node(chars[i], freqs[i]));
    while (pq.size() > 1) {
        Node left = pq.poll();
        Node right = pq.poll();
        Node parent = new Node('\\0', left.freq + right.freq);
        parent.left = left; parent.right = right;
        pq.add(parent);
    }
    return pq.peek();
}`,
    pseudocode: `function buildHuffman(frequencies):
    Q = MinPriorityQueue(frequencies)
    for i from 1 to n - 1:
        left = Q.extractMin()
        right = Q.extractMin()
        parent = new Node(freq = left.freq + right.freq)
        parent.left = left, parent.right = right
        Q.insert(parent)
    return Q.extractMin()`,
  },

  generateTimeline: (input: { charFreqs: HuffmanCharFreq[] }): ExecutionFrame<HuffmanState>[] => {
    const raw = input.charFreqs?.length ? input.charFreqs : [
      { char: 'A', freq: 5 },
      { char: 'B', freq: 9 },
      { char: 'C', freq: 12 },
      { char: 'D', freq: 13 },
      { char: 'E', freq: 16 },
      { char: 'F', freq: 45 },
    ];

    const allNodes: Record<string, HuffmanNodeData> = {};
    const heap: HuffmanNodeData[] = raw.map((item, idx) => {
      const node: HuffmanNodeData = {
        id: `leaf-${item.char}-${idx}`,
        char: item.char,
        freq: item.freq,
      };
      allNodes[node.id] = node;
      return node;
    });

    heap.sort((a, b) => a.freq - b.freq);

    const frames: ExecutionFrame<HuffmanState>[] = [];

    // Helper to calculate total 8-bit ASCII bits vs compressed bits
    const totalChars = raw.reduce((sum, item) => sum + item.freq, 0);
    const totalOriginalBits = totalChars * 8;

    // Helper to derive codes
    function generateCodes(rootId: string, currentCode: string, codeMap: Record<string, string>) {
      const node = allNodes[rootId];
      if (!node) return;
      if (node.char) {
        codeMap[node.char] = currentCode || '0';
        return;
      }
      if (node.leftId) generateCodes(node.leftId, currentCode + '0', codeMap);
      if (node.rightId) generateCodes(node.rightId, currentCode + '1', codeMap);
    }

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Initialize Min-Heap with ${heap.length} character frequency leaves. Total character count: ${totalChars} (${totalOriginalBits} bits in standard 8-bit ASCII).`,
      variables: {
        totalLeaves: heap.length,
        minFrequencyChar: `${heap[0]?.char} (${heap[0]?.freq})`,
      },
      callStack: [{ name: 'buildHuffmanTree()', params: { leaves: heap.length }, line: 4, isCurrent: true }],
      state: {
        charFreqs: raw,
        heap: heap.map((n) => ({ ...n })),
        allNodes: { ...allNodes },
        prefixCodes: {},
        totalOriginalBits,
        totalCompressedBits: 0,
      },
    });

    let internalCounter = 1;
    while (heap.length > 1) {
      // Extract two smallest
      const left = heap.shift()!;
      const right = heap.shift()!;
      const parentId = `internal-${internalCounter++}`;
      const parentFreq = left.freq + right.freq;

      const parentNode: HuffmanNodeData = {
        id: parentId,
        freq: parentFreq,
        leftId: left.id,
        rightId: right.id,
      };
      allNodes[parentId] = parentNode;

      // Step frame: Extracting min pair
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `Extract two smallest nodes: Left "${left.char || left.id}" (${left.freq}) and Right "${right.char || right.id}" (${right.freq}).`,
        variables: {
          leftNode: `${left.char || left.id}: ${left.freq}`,
          rightNode: `${right.char || right.id}: ${right.freq}`,
          combinedFreq: parentFreq,
        },
        callStack: [
          { name: 'extractMinPair()', params: { left: left.freq, right: right.freq }, line: 7, isCurrent: true },
          { name: 'buildHuffmanTree()', params: { remaining: heap.length }, line: 5 },
        ],
        state: {
          charFreqs: raw,
          heap: heap.map((n) => ({ ...n })),
          allNodes: { ...allNodes },
          activePair: [left.id, right.id],
          justMergedId: undefined,
          prefixCodes: {},
          totalOriginalBits,
          totalCompressedBits: 0,
        },
      });

      // Insert parent node back into heap
      heap.push(parentNode);
      heap.sort((a, b) => a.freq - b.freq);

      // Step frame: Merge into parent
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 11,
        explanation: `Create internal parent node [freq=${parentFreq}]. Left branch labeled "0", Right branch labeled "1". Reinserted into Min-Heap.`,
        variables: {
          newNode: `${parentId} (freq=${parentFreq})`,
          heapSize: heap.length,
        },
        callStack: [
          { name: 'insertParent()', params: { parentFreq }, line: 11, isCurrent: true },
          { name: 'buildHuffmanTree()', params: { remaining: heap.length }, line: 5 },
        ],
        state: {
          charFreqs: raw,
          heap: heap.map((n) => ({ ...n })),
          allNodes: { ...allNodes },
          activePair: undefined,
          justMergedId: parentId,
          prefixCodes: {},
          totalOriginalBits,
          totalCompressedBits: 0,
        },
      });
    }

    const root = heap[0];
    const finalCodes: Record<string, string> = {};
    if (root) {
      generateCodes(root.id, '', finalCodes);
    }

    let compressedBits = 0;
    raw.forEach((item) => {
      const code = finalCodes[item.char] || '';
      compressedBits += item.freq * code.length;
    });

    const compressionRatio = ((1 - compressedBits / totalOriginalBits) * 100).toFixed(1);

    // Final Completion Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      explanation: `Optimal Prefix Tree constructed! Root frequency: ${root?.freq}. Compression achieves ${compressionRatio}% space savings (${compressedBits} bits vs ${totalOriginalBits} bits).`,
      variables: {
        rootWeight: root?.freq,
        totalOriginalBits,
        totalCompressedBits: compressedBits,
        savings: `${compressionRatio}%`,
      },
      callStack: [{ name: 'complete()', params: { compressedBits, ratio: `${compressionRatio}%` }, line: 15, isCurrent: true }],
      state: {
        charFreqs: raw,
        heap: heap.map((n) => ({ ...n })),
        allNodes: { ...allNodes },
        rootId: root?.id,
        activePair: undefined,
        justMergedId: undefined,
        prefixCodes: finalCodes,
        totalOriginalBits,
        totalCompressedBits: compressedBits,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<HuffmanState>) => {
    const {
      charFreqs,
      heap,
      activePair,
      justMergedId,
      prefixCodes,
      totalOriginalBits,
      totalCompressedBits,
    } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Min-Heap Size: <strong className="text-white">{heap.length}</strong>
            </div>
            {totalCompressedBits > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs font-mono text-emerald-300 font-bold">
                Saved: {totalOriginalBits - totalCompressedBits} bits ({(
                  (1 - totalCompressedBits / totalOriginalBits) *
                  100
                ).toFixed(1)}
                %)
              </div>
            )}
          </div>

          <div className="text-xs font-mono text-slate-400">
            Original: <strong className="text-white">{totalOriginalBits} bits</strong> | Compressed:{' '}
            <strong className="text-cyan-400">{totalCompressedBits || '—'} bits</strong>
          </div>
        </div>

        {/* Priority Queue (Min-Heap) Strip */}
        <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl mb-4">
          <div className="text-xs font-mono text-slate-400 mb-2 font-bold flex items-center justify-between">
            <span>Priority Queue (Min-Heap Ordered)</span>
            <span className="text-[10px] text-cyan-400 font-normal">Head has lowest frequency</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {heap.map((node) => {
              const isActive = activePair?.includes(node.id);
              const isJustMerged = justMergedId === node.id;
              return (
                <div
                  key={node.id}
                  className={`px-3 py-2 rounded-xl border font-mono text-xs flex flex-col items-center min-w-16 transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-md shadow-amber-500/20'
                      : isJustMerged
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-105 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  <span className="font-extrabold text-sm">{node.char ? `'${node.char}'` : 'Σ'}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{node.freq}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generated Prefix Code Dictionary */}
        <div className="w-full overflow-x-auto p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl my-auto">
          <div className="text-xs font-mono text-slate-400 mb-3 font-bold">
            Prefix Codes Dictionary (Prefix-Free Optimal Encodings)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {charFreqs.map((item) => {
              const code = prefixCodes[item.char];
              return (
                <div
                  key={item.char}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center font-mono font-bold text-cyan-300 mb-1">
                    {item.char}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">Freq: {item.freq}</div>
                  <div className="mt-2 text-xs font-mono font-bold text-emerald-400">
                    {code ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                        {code}
                      </span>
                    ) : (
                      <span className="text-slate-600">Pending</span>
                    )}
                  </div>
                  {code && (
                    <div className="text-[9px] font-mono text-slate-500 mt-1">
                      {code.length} bits ({code.length * item.freq} total)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
