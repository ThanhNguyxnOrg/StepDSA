import React, { useState } from 'react';
import {
  Terminal,
  ShieldCheck,
  Copy,
  Check,
  Upload,
  X,
  Sparkles,
  ArrowRight,
  FileCode,
} from 'lucide-react';
import { AlgorithmModule } from '../../core/types';
import { ArrayStage } from '../stage/ArrayStage';

interface PersonalCodeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomSnapshot?: (module: AlgorithmModule) => void;
}

export const PersonalCodeStudioModal: React.FC<PersonalCodeStudioModalProps> = ({
  isOpen,
  onClose,
  onLoadCustomSnapshot,
}) => {
  const [activeLang, setActiveLang] = useState<'python' | 'node' | 'cpp' | 'json'>('python');
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    python: {
      cli: 'pip install stepdsa-cli\nstepdsa trace my_algorithm.py --entry=solution',
      sample: `# my_algorithm.py
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    },
    node: {
      cli: 'npx @stepdsa/cli trace my_algorithm.ts',
      sample: `// my_algorithm.ts
export function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement)!, i];
    map.set(nums[i], i);
  }
  return [];
}`,
    },
    cpp: {
      cli: 'stepdsa-lldb --bin=./solution --watch="arr,left,right"',
      sample: `// solution.cpp
#include <vector>
#include <iostream>

void selectionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        int min_idx = i;
        for (int j = i + 1; j < n; ++j) {
            if (arr[j] < arr[min_idx]) min_idx = j;
        }
        std::swap(arr[min_idx], arr[i]);
    }
}`,
    },
    json: {
      cli: 'cat trace.stepdsa.json | head -n 30',
      sample: `{
  "version": "1.0.0",
  "sourceFile": "custom_heap.py",
  "language": "python",
  "steps": [
    {
      "stepIndex": 0,
      "line": 4,
      "explanation": "Heapifying element at root index 0",
      "dataStructures": [{ "name": "heap", "elements": [10, 5, 3] }]
    }
  ]
}`,
    },
  };

  // Demo sample loader for immediate testing
  const handleLoadDemo = () => {
    if (!onLoadCustomSnapshot) return;
    const demoModule: AlgorithmModule = {
      id: 'personal-trace-demo',
      title: 'Personal Code: Custom Two-Sum',
      category: 'arrays-pointers',
      difficulty: 'Beginner',
      complexity: {
        timeBest: 'O(N)',
        timeAverage: 'O(N)',
        timeWorst: 'O(N)',
        spaceAuxiliary: 'O(N)',
        worstCaseCondition: 'All elements scanned without match',
      },
      theory: {
        overview:
          'This execution trace was recorded locally via the StepDSA Python Tracing Agent without transmitting source code over the cloud.',
        whyItWorks: 'Stores visited values in a hash map for O(1) complement lookup.',
        invariant: 'For every index i, complement = target - nums[i] is probed in lookup table.',
        pitfalls: ['Using the same element twice (e.g. index i == lookup[diff]).'],
      },
      codeSnippets: {
        python: `# Captured locally via stepdsa-cli\ndef two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []`,
        typescript: `export function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
        cpp: `std::vector<int> twoSum(std::vector<int>& nums, int target) {\n    std::unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); ++i) {\n        int comp = target - nums[i];\n        if (map.count(comp)) return {map[comp], i};\n        map[nums[i]] = i;\n    }\n    return {};\n}`,
        java: `public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int comp = target - nums[i];\n        if (map.containsKey(comp)) return new int[] { map.get(comp), i };\n        map.put(nums[i], i);\n    }\n    return new int[0];\n}`,
        pseudocode: `function twoSum(nums, target):\n  lookup = empty map\n  for i, num in nums:\n    if (target - num) in lookup:\n      return [lookup[target - num], i]\n    lookup[num] = i`,
      },
      presets: [
        {
          id: 'pair',
          label: 'Sample Pair',
          description: 'Finds pair summing to 9',
          data: [2, 7, 11, 15],
        },
      ],
      defaultInput: [2, 7, 11, 15],
      generateTimeline: () => [
        {
          stepIndex: 0,
          totalSteps: 5,
          codeLine: 2,
          explanation: 'Step 1: Initializing empty lookup map for target=9',
          state: {
            array: [
              { id: '0', value: 2, status: 'normal' },
              { id: '1', value: 7, status: 'normal' },
              { id: '2', value: 11, status: 'normal' },
              { id: '3', value: 15, status: 'normal' },
            ],
            pointers: { 'i': 0 },
          },
        },
        {
          stepIndex: 1,
          totalSteps: 5,
          codeLine: 4,
          explanation: 'Step 2: Checking diff (9 - 2 = 7). Not in lookup. Storing {2: 0}.',
          state: {
            array: [
              { id: '0', value: 2, status: 'comparing' },
              { id: '1', value: 7, status: 'normal' },
              { id: '2', value: 11, status: 'normal' },
              { id: '3', value: 15, status: 'normal' },
            ],
            pointers: { 'num': 0 },
          },
        },
        {
          stepIndex: 2,
          totalSteps: 5,
          codeLine: 3,
          explanation: 'Step 3: Advancing pointer to index 1 (num=7).',
          state: {
            array: [
              { id: '0', value: 2, status: 'normal' },
              { id: '1', value: 7, status: 'comparing' },
              { id: '2', value: 11, status: 'normal' },
              { id: '3', value: 15, status: 'normal' },
            ],
            pointers: { 'i': 1 },
          },
        },
        {
          stepIndex: 3,
          totalSteps: 5,
          codeLine: 5,
          explanation: 'Step 4: Checking diff (9 - 7 = 2). Found 2 in lookup at index 0!',
          state: {
            array: [
              { id: '0', value: 2, status: 'sorted' },
              { id: '1', value: 7, status: 'sorted' },
              { id: '2', value: 11, status: 'normal' },
              { id: '3', value: 15, status: 'normal' },
            ],
            pointers: { 'match_1': 0, 'match_2': 1 },
          },
        },
        {
          stepIndex: 4,
          totalSteps: 5,
          codeLine: 6,
          isMilestone: true,
          milestoneTitle: 'Pair Found',
          explanation: 'Step 5: Solution pair found: indices [0, 1] sum to 9.',
          state: {
            array: [
              { id: '0', value: 2, status: 'sorted' },
              { id: '1', value: 7, status: 'sorted' },
              { id: '2', value: 11, status: 'normal' },
              { id: '3', value: 15, status: 'normal' },
            ],
            pointers: { 'PAIR_0': 0, 'PAIR_1': 1 },
          },
        },
      ],
      renderStage: (frame, projection) => (
        <ArrayStage
          state={frame.state}
          projection={projection}
        />
      ),
    };

    onLoadCustomSnapshot(demoModule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E293B] bg-gradient-to-r from-[#0F172A] via-[#1E293B]/50 to-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Personal Code Visualization Studio
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                  Developer Capability
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Trace and step through your own algorithms locally in Python, TypeScript, C++, or Java
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Security Guarantee Banner */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-300">100% Local Execution Security:</span>{' '}
              Your source code is never transmitted or compiled on remote servers. A lightweight local tracer
              runs on your machine, generates deterministic execution snapshots, and pipes them directly to your browser.
            </div>
          </div>

          {/* Three Steps Process */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#131D31] border border-slate-800 flex flex-col gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold font-mono flex items-center justify-center">
                1
              </div>
              <h3 className="text-sm font-semibold text-white">Write Your DSA Code</h3>
              <p className="text-xs text-slate-400">
                Write algorithms in standard Python, TypeScript, C++, or Java with your own variables and arrays.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#131D31] border border-slate-800 flex flex-col gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono flex items-center justify-center">
                2
              </div>
              <h3 className="text-sm font-semibold text-white">Run Local Tracer</h3>
              <p className="text-xs text-slate-400">
                Execute the local CLI to step through memory and produce a <code className="text-cyan-300 font-mono text-[11px]">.stepdsa.json</code> trace file.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#131D31] border border-slate-800 flex flex-col gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono flex items-center justify-center">
                3
              </div>
              <h3 className="text-sm font-semibold text-white">Time-Travel in UI</h3>
              <p className="text-xs text-slate-400">
                Drop your trace file or connect via WebSocket to scrub through your code with zero lag.
              </p>
            </div>
          </div>

          {/* Language Selector & Setup Terminal */}
          <div className="bg-[#0B0F19] rounded-xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-1">
                {(['python', 'node', 'cpp', 'json'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase font-mono transition-all ${
                      activeLang === lang
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'node' ? 'TypeScript/Node' : lang === 'cpp' ? 'C++ (LLDB)' : lang}
                  </button>
                ))}
              </div>
              <button
                onClick={() => copyCommand(codeSnippets[activeLang].cli)}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy CLI Command'}</span>
              </button>
            </div>

            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="text-slate-400">
                <span className="text-indigo-400 font-bold">$</span> {codeSnippets[activeLang].cli}
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-500 mb-1">// Sample Developer Code:</div>
                <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed max-h-40">
                  {codeSnippets[activeLang].sample}
                </pre>
              </div>
            </div>
          </div>

          {/* Interactive Drag & Drop Zone + Demo Button */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleLoadDemo();
            }}
            className={`p-6 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-3 ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-800 bg-[#0B0F19]/50 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Drop your <code className="text-indigo-300 font-mono">*.stepdsa.json</code> snapshot here
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Or load an instant pre-recorded demo trace to test the Personal Code playback engine
              </p>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={handleLoadDemo}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Live Python Demo Trace (Two-Sum)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1E293B] bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>Specification: <code className="text-slate-300 font-mono">docs/specs/personal-code-visualization.md</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
