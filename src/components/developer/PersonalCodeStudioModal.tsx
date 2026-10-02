import React, { useState, useMemo, useRef } from 'react';
import {
  Terminal,
  ShieldCheck,
  Copy,
  Check,
  Upload,
  X,
  ArrowRight,
  Play,
  Edit2,
  FileCode,
  AlertCircle,
  ExternalLink,
  Loader2,
  Cpu,
} from 'lucide-react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { parseStepDSAFile } from '../../core/studio/parser';
import { classifyAlgorithmPattern, detectSourceLanguage } from '../../core/studio/classifier';
import { traceArrayExecution } from '../../core/studio/tracer';
import { traceJavaScriptExecution } from '../../core/studio/jsTracer';
import { tracePythonExecution } from '../../core/studio/pythonRunner';
import {
  createCustomAlgorithmModule,
  adaptTraceSnapshotToModule,
} from '../../core/studio/universalAdapter';

interface PersonalCodeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomSnapshot?: (module: AlgorithmModule) => void;
}

const JS_SAMPLE_CODE = `// LeetCode: Generate Parentheses (Recursion & Backtracking)
const generateParenthesis = function(n) {
  const res = [];
  const dfs = (open, close, s) => {
    if (!open && !close) {
      res.push(s);
      return;
    }
    if (open > 0) dfs(open - 1, close, s + "(");
    if (close > open) dfs(open, close - 1, s + ")");
  };
  dfs(n, n, "");
  return res;
};
`;

const PYTHON_SAMPLE_CODE = `# LeetCode: Two Sum (Hash Map Lookup)
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []
`;

export const PersonalCodeStudioModal: React.FC<PersonalCodeStudioModalProps> = ({
  isOpen,
  onClose,
  onLoadCustomSnapshot,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'upload' | 'cli'>('cli');
  const [selectedLang, setSelectedLang] = useState<'javascript' | 'python'>('javascript');
  const [codeContent, setCodeContent] = useState<string>(JS_SAMPLE_CODE);
  const [testcaseInput, setTestcaseInput] = useState<string>('3');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live pattern inference based on current code
  const parsedFile = useMemo(() => parseStepDSAFile(codeContent), [codeContent]);
  const classifiedPattern = useMemo(
    () => classifyAlgorithmPattern(parsedFile.code, customTitle || parsedFile.metadata.title),
    [parsedFile.code, customTitle, parsedFile.metadata.title]
  );

  const displayedTitle = customTitle || parsedFile.metadata.title || classifiedPattern.title;
  const detectedLang = useMemo(() => detectSourceLanguage(parsedFile.code), [parsedFile.code]);

  if (!isOpen) return null;

  const handleLanguageSwitch = (lang: 'javascript' | 'python') => {
    setSelectedLang(lang);
    setErrorMessage(null);
    if (lang === 'python') {
      setCodeContent(PYTHON_SAMPLE_CODE);
      setTestcaseInput('[2, 7, 11, 15], 9');
    } else {
      setCodeContent(JS_SAMPLE_CODE);
      setTestcaseInput('3');
    }
  };

  const handleRunAlgorithm = async () => {
    setErrorMessage(null);
    setIsRunning(true);
    setStatusMessage(null);

    try {
      if (detectedLang === 'cpp') {
        setErrorMessage(
          'C++ requires local compilation with g++/clang++. Run "stepdsa run solution.cpp" in your terminal to trace and visualize in 1 click!'
        );
        setIsRunning(false);
        return;
      }

      let frames: ExecutionFrame[] = [];

      if (selectedLang === 'python' || detectedLang === 'python') {
        frames = await tracePythonExecution(codeContent, testcaseInput, {
          onStatus: (msg) => setStatusMessage(msg),
        });
      } else {
        // Try JS Function Tracer first (LeetCode style)
        try {
          frames = traceJavaScriptExecution(codeContent, testcaseInput);
        } catch {
          // Fallback to legacy array tracer for imperative scripts
          const inputFixture = parsedFile.metadata.input ?? classifiedPattern.defaultInput;
          const rawArray = Array.isArray(inputFixture) ? inputFixture : [10, 20, 30, 40];
          frames = traceArrayExecution(parsedFile.code, rawArray);
        }
      }

      if (!frames || frames.length === 0) {
        setErrorMessage('Execution emitted 0 steps. Ensure your code executes or returns statements.');
        setIsRunning(false);
        return;
      }

      const mod = createCustomAlgorithmModule(parsedFile, classifiedPattern, frames);
      if (onLoadCustomSnapshot) {
        onLoadCustomSnapshot(mod);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || String(err));
    } finally {
      setIsRunning(false);
      setStatusMessage(null);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
        try {
          const mod = adaptTraceSnapshotToModule(text);
          if (onLoadCustomSnapshot) {
            onLoadCustomSnapshot(mod);
          }
          onClose();
        } catch (err: any) {
          setErrorMessage(`Invalid .stepdsa.json snapshot: ${err.message}`);
        }
      } else {
        // It is a .stepdsa or source text file
        setCodeContent(text);
        if (file.name.endsWith('.py')) {
          setSelectedLang('python');
        } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
          setSelectedLang('javascript');
        }
        setActiveTab('editor');
      }
    };
    reader.readAsText(file);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1E293B] bg-gradient-to-r from-[#0F172A] via-[#1E293B]/40 to-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">StepDSA CLI & Personal Code Studio</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  100% READY · LOCAL EXECUTION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Trace algorithms locally via zero-setup CLI or simulate in-browser with zero backend risks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-[#131D31] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('cli')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'cli'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>CLI Quickstart</span>
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'editor'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Code Editor</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Drop Snapshot</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Security Guarantee Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-300">100% Local Execution Security:</span>{' '}
              Your source code runs entirely in your local browser sandbox (V8 / Pyodide WASM) or offline CLI. Zero remote backend servers.
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3 text-indigo-300 text-xs">
              <Loader2 className="w-4 h-4 shrink-0 animate-spin text-indigo-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* TAB 1: CODE EDITOR & RUNNER */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              {/* Header Action Bar with Smart Title Pill and Language Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#131D31] border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Language Selector */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => handleLanguageSwitch('javascript')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold font-mono transition-all ${
                        selectedLang === 'javascript'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      JS / TS
                    </button>
                    <button
                      onClick={() => handleLanguageSwitch('python')}
                      className={`px-2.5 py-1 rounded text-xs font-semibold font-mono transition-all ${
                        selectedLang === 'python'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Python (WASM)
                    </button>
                  </div>

                  <span className="text-xs text-slate-500 font-mono">|</span>

                  <span className="text-xs text-slate-400 font-mono">Title:</span>
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                      autoFocus
                      className="px-2 py-0.5 rounded bg-slate-900 border border-indigo-500 text-white text-xs font-semibold focus:outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setCustomTitle(displayedTitle);
                        setIsEditingTitle(true);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 transition-all group"
                      title="Click to rename algorithm"
                    >
                      <span>{displayedTitle}</span>
                      <Edit2 className="w-3 h-3 text-indigo-400 opacity-60 group-hover:opacity-100" />
                    </button>
                  )}

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                    Category: {classifiedPattern.category}
                  </span>
                </div>

                <button
                  onClick={handleRunAlgorithm}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  {isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isRunning ? 'Tracing...' : 'Visualize Algorithm'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Language Alert Banner for C++ Code */}
              {detectedLang === 'cpp' && (
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-start gap-3 text-xs text-blue-200">
                  <Cpu className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-blue-300 flex items-center justify-between">
                      <span>C++ LeetCode / Native Code Detected</span>
                      <button
                        onClick={() => copyCommand('npx stepdsa run solution.cpp')}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-[10px] text-blue-200 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy CLI Command</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-blue-200/80 leading-relaxed">
                      C++ requires local compilation with your system's <code className="px-1 py-0.5 rounded bg-blue-900/60 font-mono text-blue-200">g++</code> or <code className="px-1 py-0.5 rounded bg-blue-900/60 font-mono text-blue-200">clang++</code> compiler.
                      Save your solution to <code className="px-1 py-0.5 rounded bg-blue-900/60 font-mono text-blue-200">solution.cpp</code> and run:
                      <code className="block mt-1 p-2 rounded bg-slate-950 font-mono text-blue-300 text-[11px]">
                        $ npx stepdsa run solution.cpp
                      </code>
                    </p>
                  </div>
                </div>
              )}

              {/* Testcase Input Bar */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                <span className="text-xs font-mono text-slate-400 shrink-0 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Testcase Input:</span>
                </span>
                <input
                  type="text"
                  value={testcaseInput}
                  onChange={(e) => setTestcaseInput(e.target.value)}
                  placeholder={
                    selectedLang === 'python'
                      ? 'e.g. [2, 7, 11, 15], 9  or  nums = [3, 2, 4], target = 6'
                      : 'e.g. 3  or  [2, 7, 11, 15], 9  or  n = 3'
                  }
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 shrink-0">LeetCode argument format</span>
              </div>

              {/* Code Textarea Editor */}
              <div className="relative rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden focus-within:border-indigo-500 transition-colors">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>solution.{selectedLang === 'python' ? 'py' : 'js'}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-mono font-bold uppercase">
                      {selectedLang === 'python' ? 'Python' : 'JavaScript'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {selectedLang === 'python'
                      ? 'Pyodide WebAssembly Sandbox • Client-side'
                      : 'Native V8 Proxy Sandbox • Client-side'}
                  </span>
                </div>
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="// Paste your algorithm code or .stepdsa file here..."
                  className="w-full h-80 p-4 font-mono text-xs text-slate-200 bg-transparent resize-y focus:outline-none leading-relaxed selection:bg-indigo-500/30"
                  spellCheck={false}
                />
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                <span>
                  Tip: Functions and LeetCode <code className="text-indigo-400 font-mono">class Solution</code> methods are automatically invoked with your Testcase Input.
                </span>
                <span>Max 300 step safety guard</span>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD & DRAG DROP */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-800 bg-[#0B0F19]/50 hover:border-slate-700'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".stepdsa,.json,.cpp,.py,.js,.ts"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-1">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">
                    Drop your <code className="text-indigo-300 font-mono">*.stepdsa</code>, <code className="text-cyan-300 font-mono">*.json</code>, or code file here
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Or click anywhere in this box to browse local files on your computer
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLI SETUP GUIDE */}
          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-emerald-300">100% Local Execution Security:</span> Your
                  source code is never transmitted or compiled on remote servers. The lightweight local CLI runs on
                  your machine, compiles C++ locally via your system compiler, and pipes traces directly to your browser.
                </div>
              </div>

              {/* 3 Step Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 font-mono font-bold flex items-center justify-center text-[11px]">1</span>
                    <strong className="text-white">Init or Write C++</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">Write standard C++ with <code className="text-indigo-300 font-mono">class Solution</code> or initialize a template.</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[11px]">2</span>
                    <strong className="text-white">Compile & Trace</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">Runs <code className="text-cyan-300 font-mono">stepdsa run solution.cpp</code> to compile locally and capture state.</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-[11px]">3</span>
                    <strong className="text-white">Time-Travel</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">Scrub backward/forward, observe pointers, metrics, and call stacks with 0 lag.</p>
                </div>
              </div>

              {/* Command Snippet */}
              <div className="bg-[#0B0F19] rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                  <span className="text-slate-400 text-xs">Terminal Commands:</span>
                  <button
                    onClick={() => copyCommand('npx stepdsa run solution.cpp')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 text-slate-300 space-y-2">
                  <div className="text-slate-500 text-[11px]"># Run native C++ LeetCode solution directly</div>
                  <div className="text-emerald-400 font-bold">$ npx stepdsa run solution.cpp</div>
                  <div className="text-slate-500 text-[11px] pt-1"># Or initialize template</div>
                  <div className="text-indigo-400 font-bold">$ npx stepdsa init</div>
                  <div className="text-slate-500 text-[11px] pt-1"># Or export offline JSON trace</div>
                  <div className="text-cyan-400 font-bold">$ npx stepdsa trace solution.stepdsa --out trace.json</div>
                </div>
              </div>

              {/* Link to Full Documentation in Repo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs">
                <span className="text-slate-300">
                  Need C++ harness details or advanced flags (<code className="text-indigo-400 font-mono">--dev</code>, <code className="text-indigo-400 font-mono">--no-open</code>)?
                </span>
                <a
                  href="https://github.com/ThanhNguyxnOrg/StepDSA/blob/main/docs/CLI.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 hover:text-white font-medium transition-all shrink-0"
                >
                  <span>Open Full docs/CLI.md</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1E293B] bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>CLI Guide: <code className="text-slate-300 font-mono">docs/CLI.md</code></span>
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
