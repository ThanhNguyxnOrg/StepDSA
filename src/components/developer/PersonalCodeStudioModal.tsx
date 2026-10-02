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
} from 'lucide-react';
import { AlgorithmModule } from '../../core/types';
import { parseStepDSAFile } from '../../core/studio/parser';
import { classifyAlgorithmPattern } from '../../core/studio/classifier';
import { traceArrayExecution } from '../../core/studio/tracer';
import {
  createCustomAlgorithmModule,
  adaptTraceSnapshotToModule,
} from '../../core/studio/universalAdapter';

interface PersonalCodeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomSnapshot?: (module: AlgorithmModule) => void;
}

const DEFAULT_SAMPLE_CODE = `// Bubble Sort Algorithm
const arr = [64, 34, 25, 12, 22, 11, 90];

for (let i = 0; i < arr.length; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      const temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
    }
  }
}
`;

export const PersonalCodeStudioModal: React.FC<PersonalCodeStudioModalProps> = ({
  isOpen,
  onClose,
  onLoadCustomSnapshot,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'upload' | 'cli'>('editor');
  const [codeContent, setCodeContent] = useState<string>(DEFAULT_SAMPLE_CODE);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live pattern inference based on current code
  const parsedFile = useMemo(() => parseStepDSAFile(codeContent), [codeContent]);
  const classifiedPattern = useMemo(
    () => classifyAlgorithmPattern(parsedFile.code, customTitle || parsedFile.metadata.title),
    [parsedFile.code, customTitle, parsedFile.metadata.title]
  );

  const displayedTitle = customTitle || parsedFile.metadata.title || classifiedPattern.title;

  if (!isOpen) return null;

  const handleRunAlgorithm = () => {
    setErrorMessage(null);
    try {
      const inputFixture = parsedFile.metadata.input ?? classifiedPattern.defaultInput;
      const rawArray = Array.isArray(inputFixture) ? inputFixture : [10, 20, 30, 40];

      const frames = traceArrayExecution(parsedFile.code, rawArray);
      if (frames.length === 0) {
        setErrorMessage('Execution emitted 0 steps. Ensure your code operates on "input".');
        return;
      }

      const mod = createCustomAlgorithmModule(parsedFile, classifiedPattern, frames);
      if (onLoadCustomSnapshot) {
        onLoadCustomSnapshot(mod);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(`Execution error: ${err.message || String(err)}`);
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
        // It is a .stepdsa text file
        setCodeContent(text);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Personal Code Studio</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                  BYOC · 100% Client-Side
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Author, paste LeetCode solutions, or trace custom code with zero backend
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-[#131D31] p-1 rounded-xl border border-slate-800">
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
                <span>Drop File</span>
              </button>
              <button
                onClick={() => setActiveTab('cli')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'cli'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>CLI</span>
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
              Your source code runs entirely in your local browser sandbox or offline CLI. Zero remote backend servers.
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: CODE EDITOR & RUNNER */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              {/* Header Action Bar with Smart Title Pill */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#131D31] border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Algorithm:</span>
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
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Visualize Algorithm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Code Textarea Editor */}
              <div className="relative rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden focus-within:border-indigo-500 transition-colors">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>algorithm.stepdsa</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Native ES6 Proxy Sandbox • 0ms Remote Latency
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
                  Tip: Standard loops, conditionals, and reads/writes on <code className="text-indigo-400 font-mono">arr</code>, <code className="text-indigo-400 font-mono">nums</code>, or <code className="text-indigo-400 font-mono">input</code> are traced automatically.
                </span>
                <span>Max 500 step safety guard</span>
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
                  accept=".stepdsa,.json"
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
                    Drop your <code className="text-indigo-300 font-mono">*.stepdsa</code> or <code className="text-cyan-300 font-mono">*.stepdsa.json</code> file here
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
                  source code is never transmitted or compiled on remote servers. The lightweight local tracer runs on
                  your machine, generates deterministic execution snapshots, and pipes them directly to your browser.
                </div>
              </div>

              {/* 3 Step Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 font-mono font-bold flex items-center justify-center text-[11px]">1</span>
                    <strong className="text-white">Init Project</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">Scaffolds <code className="text-indigo-300 font-mono">solution.stepdsa</code> template with starter algorithm.</p>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[11px]">2</span>
                    <strong className="text-white">Run & Launch</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">Traces locally and auto-launches browser with compressed execution hash.</p>
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
                    onClick={() => copyCommand('npx stepdsa run solution.stepdsa')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 text-slate-300 space-y-2">
                  <div className="text-slate-500 text-[11px]"># 1. Initialize template</div>
                  <div className="text-indigo-400 font-bold">$ npx stepdsa init</div>
                  <div className="text-slate-500 text-[11px] pt-1"># 2. Trace and visualize in browser</div>
                  <div className="text-emerald-400 font-bold">$ npx stepdsa run solution.stepdsa</div>
                  <div className="text-slate-500 text-[11px] pt-1"># 3. Or export offline JSON trace</div>
                  <div className="text-cyan-400 font-bold">$ npx stepdsa trace solution.stepdsa --out trace.json</div>
                </div>
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
