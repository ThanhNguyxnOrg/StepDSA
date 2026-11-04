import React, { useState, useMemo, useRef, useEffect } from 'react';
import LZString from 'lz-string';
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
  Download,
  Share2,
  Sparkles,
  Layers,
  ListOrdered,
  Eye,
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
import {
  STUDIO_TEMPLATES,
  StudioLanguage,
  StudioTemplate,
  getTemplatesByLanguage,
  traceCppInBrowser,
} from '../../core/studio/studioTemplates';
import { StepDSALogo } from '../brand/StepDSALogo';
import { usePlatformShortcuts } from '../../utils/platformShortcuts';

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
  const [activeTab, setActiveTab] = useState<'editor' | 'inspector' | 'cli'>('editor');
  const shortcuts = usePlatformShortcuts();
  const [selectedLang, setSelectedLang] = useState<StudioLanguage>('javascript');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('editor');
    }
  }, [isOpen]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(STUDIO_TEMPLATES[0].id);
  const [codeContent, setCodeContent] = useState<string>(STUDIO_TEMPLATES[0].code);
  const [testcaseInput, setTestcaseInput] = useState<string>(STUDIO_TEMPLATES[0].testcaseInput);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewFrames, setPreviewFrames] = useState<ExecutionFrame[]>([]);

  // Interactive CLI Command Builder state
  const [cliSubcommand, setCliSubcommand] = useState<'run' | 'trace' | 'init' | 'doctor'>('run');
  const [cliFlagDev, setCliFlagDev] = useState<boolean>(true);
  const [cliFlagVerbose, setCliFlagVerbose] = useState<boolean>(false);
  const [cliFlagNoOpen, setCliFlagNoOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorScrollRef = useRef<HTMLTextAreaElement>(null);
  const gutterScrollRef = useRef<HTMLDivElement>(null);

  // Live pattern inference based on current code
  const parsedFile = useMemo(() => parseStepDSAFile(codeContent), [codeContent]);
  const classifiedPattern = useMemo(
    () => classifyAlgorithmPattern(parsedFile.code, customTitle || parsedFile.metadata.title),
    [parsedFile.code, customTitle, parsedFile.metadata.title]
  );

  const displayedTitle = customTitle || parsedFile.metadata.title || classifiedPattern.title;
  const detectedLang = useMemo(() => detectSourceLanguage(parsedFile.code), [parsedFile.code]);
  const languageTemplates = useMemo(() => getTemplatesByLanguage(selectedLang), [selectedLang]);
  const lineCount = useMemo(() => Math.max(1, codeContent.split('\n').length), [codeContent]);

  const builtCliCommand = useMemo(() => {
    const ext = selectedLang === 'python' ? 'py' : selectedLang === 'cpp' ? 'cpp' : 'stepdsa';
    const fileArg = `solution.${ext}`;
    if (cliSubcommand === 'init') return 'npx stepdsa init';
    if (cliSubcommand === 'doctor') return 'npx stepdsa doctor';
    const flags: string[] = [];
    if (cliSubcommand === 'run' && cliFlagDev) flags.push('--dev');
    if (cliSubcommand === 'run' && cliFlagNoOpen) flags.push('--no-open');
    if (cliSubcommand === 'trace' && cliFlagVerbose) flags.push('--verbose');
    if (cliSubcommand === 'trace') flags.push('--out trace.stepdsa.json');
    return `npx stepdsa ${cliSubcommand} ${fileArg}${flags.length > 0 ? ' ' + flags.join(' ') : ''}`;
  }, [selectedLang, cliSubcommand, cliFlagDev, cliFlagNoOpen, cliFlagVerbose]);

  if (!isOpen) return null;

  const applyTemplate = (tpl: StudioTemplate) => {
    setSelectedLang(tpl.language);
    setActiveTemplateId(tpl.id);
    setCodeContent(tpl.code);
    setTestcaseInput(tpl.testcaseInput);
    setCustomTitle(tpl.title);
    setErrorMessage(null);
  };

  const handleLanguageSwitch = (lang: StudioLanguage) => {
    setSelectedLang(lang);
    setErrorMessage(null);
    const templates = getTemplatesByLanguage(lang);
    if (templates.length > 0) {
      applyTemplate(templates[0]);
    }
  };

  const executeCodeTrace = async (): Promise<ExecutionFrame[] | null> => {
    setErrorMessage(null);
    setIsRunning(true);
    setStatusMessage(null);

    try {
      let frames: ExecutionFrame[] = [];

      if (selectedLang === 'cpp' || detectedLang === 'cpp') {
        frames = traceCppInBrowser(codeContent, testcaseInput);
      } else if (selectedLang === 'python' || detectedLang === 'python') {
        frames = await tracePythonExecution(codeContent, testcaseInput, {
          onStatus: (msg) => setStatusMessage(msg),
        });
      } else {
        try {
          frames = traceJavaScriptExecution(codeContent, testcaseInput);
        } catch {
          const inputFixture = parsedFile.metadata.input ?? classifiedPattern.defaultInput;
          const rawArray = Array.isArray(inputFixture) ? inputFixture : [10, 20, 30, 40];
          frames = traceArrayExecution(parsedFile.code, rawArray);
        }
      }

      if (!frames || frames.length === 0) {
        setErrorMessage('Execution emitted 0 steps. Ensure your code executes statements or returns a value.');
        return null;
      }

      setPreviewFrames(frames);
      return frames;
    } catch (err: any) {
      setErrorMessage(err.message || String(err));
      return null;
    } finally {
      setIsRunning(false);
      setStatusMessage(null);
    }
  };

  const handleRunAlgorithm = async () => {
    const frames = await executeCodeTrace();
    if (!frames) return;

    const mod = createCustomAlgorithmModule(parsedFile, classifiedPattern, frames);
    if (onLoadCustomSnapshot) {
      onLoadCustomSnapshot(mod);
    }
    onClose();
  };

  const handleDryRunInspect = async () => {
    const frames = await executeCodeTrace();
    if (frames && frames.length > 0) {
      setActiveTab('inspector');
    }
  };

  const buildSnapshotPayload = (framesToExport: ExecutionFrame[]) => {
    const ext = selectedLang === 'python' ? '.py' : selectedLang === 'cpp' ? '.cpp' : '.js';
    const metaObj = {
      title: displayedTitle,
      sourceFile: `solution${ext}`,
      language: selectedLang === 'cpp' ? 'cpp' : selectedLang === 'python' ? 'python' : 'typescript',
      totalSteps: framesToExport.length,
      category: classifiedPattern.category || 'sorting',
      createdAt: new Date().toISOString(),
      generator: 'StepDSA Personal Code Studio v2.0',
    };
    return {
      version: '1.0.0',
      meta: metaObj,
      metadata: metaObj,
      sourceCode: codeContent,
      frames: framesToExport,
      steps: framesToExport,
    };
  };

  const handleDownloadSnapshotJson = async () => {
    const frames = previewFrames.length > 0 ? previewFrames : await executeCodeTrace();
    if (!frames || frames.length === 0) return;

    const snapshot = buildSnapshotPayload(frames);
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeSlug = displayedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'solution';
    a.href = url;
    a.download = `${safeSlug}.stepdsa.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyShareableTraceUrl = async () => {
    const frames = previewFrames.length > 0 ? previewFrames : await executeCodeTrace();
    if (!frames || frames.length === 0) return;

    const snapshot = buildSnapshotPayload(frames);
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(snapshot));
    const shareUrl = `${window.location.origin}${window.location.pathname}#trace=${compressed}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2200);
  };

  const handleDownloadSourceFile = () => {
    const ext = selectedLang === 'python' ? 'py' : selectedLang === 'cpp' ? 'cpp' : 'stepdsa';
    const blob = new Blob([codeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
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
        setCodeContent(text);
        if (file.name.endsWith('.py')) {
          setSelectedLang('python');
        } else if (file.name.endsWith('.cpp') || file.name.endsWith('.cc')) {
          setSelectedLang('cpp');
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
      <div className="relative w-full max-w-5xl bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-[#1E293B] bg-gradient-to-r from-[#0F172A] via-[#1E293B]/40 to-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] shadow-inner shrink-0">
              <StepDSALogo size="md" showText={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Personal Code Studio
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Trace & visualize custom JS/TS, Python (Pyodide WASM), and C++17 algorithms with time-travel debugging
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 3-Tab Switcher */}
            <div className="flex items-center gap-1 bg-[#131D31] p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Code Sandbox</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (previewFrames.length === 0) {
                    handleDryRunInspect();
                  } else {
                    setActiveTab('inspector');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'inspector'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Trace Inspector</span>
                {previewFrames.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                    {previewFrames.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cli')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'cli'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>CLI & C++ Engine</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Personal Code Studio"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
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

          {/* ==================== TAB 1: CODE SANDBOX ==================== */}
          {activeTab === 'editor' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                setDragActive(false);
                handleFileDrop(e);
              }}
              className={`space-y-3.5 rounded-xl transition-all ${
                dragActive ? 'ring-2 ring-indigo-500 bg-indigo-500/5 p-2' : ''
              }`}
            >
              {/* Top Toolbar: Language Selector + Editable Title + Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#131D31] border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {/* 3-Language Selector */}
                  <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleLanguageSwitch('javascript')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedLang === 'javascript'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>JS / TS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageSwitch('python')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedLang === 'python'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>Python (WASM)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageSwitch('cpp')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedLang === 'cpp'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>C++ 17/20</span>
                    </button>
                  </div>

                  <span className="text-xs text-slate-600 font-mono hidden sm:inline">|</span>

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
                      type="button"
                      onClick={() => {
                        setCustomTitle(displayedTitle);
                        setIsEditingTitle(true);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 transition-all group cursor-pointer"
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

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                    title="Import local .py, .js, .cpp, .stepdsa, or .json file"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Import File</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDryRunInspect}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
                    title="Dry-run trace and inspect frames before launching"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Dry-Run Inspect</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRunAlgorithm}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
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
              </div>

              {/* 1-Click Algorithm Template Preset Bar */}
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0F19] border border-slate-800/80">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Templates:</span>
                </span>
                {languageTemplates.map((tpl) => {
                  const isActive = tpl.id === activeTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
                      }`}
                      title={tpl.description}
                    >
                      <span>{tpl.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950/70 text-slate-400">
                        {tpl.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* C++ Dual-Mode Banner (In-Browser Simulator + Local g++ CLI) */}
              {(selectedLang === 'cpp' || detectedLang === 'cpp') && (
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs text-cyan-200">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span>
                      <strong>Dual C++ Mode Active:</strong> Click <strong>Visualize Algorithm</strong> for instant in-browser C++ simulation, or run locally with native <code className="px-1 py-0.5 rounded bg-cyan-900/60 font-mono">g++</code>:
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 rounded bg-slate-950 font-mono text-cyan-300 text-[11px]">
                      $ npx stepdsa run solution.cpp
                    </code>
                    <button
                      type="button"
                      onClick={() => copyCommand('npx stepdsa run solution.cpp')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-[11px] text-cyan-100 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy CLI'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Testcase Input Bar */}
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                <span className="text-xs font-mono text-slate-400 shrink-0 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Testcase Input:</span>
                </span>
                <input
                  type="text"
                  value={testcaseInput}
                  onChange={(e) => setTestcaseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleRunAlgorithm();
                    }
                  }}
                  placeholder={
                    selectedLang === 'python'
                      ? 'e.g. [2, 7, 11, 15], 9  or  nums = [3, 2, 4], target = 6'
                      : 'e.g. 3  or  [64, 34, 25, 12, 22, 11]  or  [2, 7, 11, 15], 9'
                  }
                  className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  LeetCode argument format · <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">{shortcuts.modKey}+Enter</kbd> to Run
                </span>
              </div>

              {/* Line-Numbered IDE Code Editor */}
              <div className="relative rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden focus-within:border-indigo-500 transition-colors">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      solution.{selectedLang === 'python' ? 'py' : selectedLang === 'cpp' ? 'cpp' : 'js'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-mono font-bold uppercase">
                      {selectedLang === 'python' ? 'Python 3' : selectedLang === 'cpp' ? 'C++17' : 'JavaScript / TS'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({lineCount} lines)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 hidden sm:inline">
                      {selectedLang === 'python'
                        ? 'Pyodide WebAssembly Runtime • sys.settrace()'
                        : selectedLang === 'cpp'
                        ? 'C++17 Deterministic Simulator + Local g++ CLI'
                        : 'Native V8 Proxy Runner • Line & Pointer Tracking'}
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadSourceFile}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors cursor-pointer"
                      title="Download source code file"
                    >
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>Save File</span>
                    </button>
                  </div>
                </div>

                <div className="relative flex h-72 sm:h-80 overflow-hidden">
                  {/* Synchronized Line Numbers Gutter */}
                  <div
                    ref={gutterScrollRef}
                    aria-hidden="true"
                    className="select-none py-4 px-3 bg-slate-950/70 border-r border-slate-800/80 text-right font-mono text-xs text-slate-600 leading-relaxed overflow-hidden shrink-0 min-w-[44px]"
                  >
                    {Array.from({ length: lineCount }, (_, idx) => (
                      <div key={idx + 1}>{idx + 1}</div>
                    ))}
                  </div>

                  {/* Code Textarea */}
                  <textarea
                    ref={editorScrollRef}
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    onScroll={(e) => {
                      if (gutterScrollRef.current) {
                        gutterScrollRef.current.scrollTop = e.currentTarget.scrollTop;
                      }
                    }}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleRunAlgorithm();
                        return;
                      }
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        const start = e.currentTarget.selectionStart;
                        const end = e.currentTarget.selectionEnd;
                        const next = codeContent.substring(0, start) + '  ' + codeContent.substring(end);
                        setCodeContent(next);
                        requestAnimationFrame(() => {
                          if (editorScrollRef.current) {
                            editorScrollRef.current.selectionStart = editorScrollRef.current.selectionEnd =
                              start + 2;
                          }
                        });
                      }
                    }}
                    placeholder="// Paste your algorithm code or .stepdsa file here..."
                    className="w-full h-full p-4 font-mono text-xs text-slate-200 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-indigo-500/30 overflow-y-auto"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 px-1">
                <span>
                  Tip: Functions and LeetCode <code className="text-indigo-400 font-mono">class Solution</code> methods are automatically invoked with your Testcase Input.
                </span>
                <span>Max 500 step safety guard • Drag & drop <code className="text-slate-400 font-mono">.stepdsa.json</code> supported</span>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: TRACE INSPECTOR & EXPORT ==================== */}
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              {/* Summary Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Captured Frames</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                    {previewFrames.length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Detected Stage</div>
                  <div className="text-sm font-bold font-mono text-cyan-300 mt-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {previewFrames.some((f) => Array.isArray(f.state?.array) && f.state.array.length > 0)
                        ? 'ArrayStage + Pointers'
                        : 'CallStack + Heap'}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Max Stack Depth</div>
                  <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
                    {Math.max(1, ...previewFrames.map((f) => f.callStack?.length || 1))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Category Tag</div>
                  <div className="text-sm font-bold font-mono text-amber-300 mt-1">
                    {classifiedPattern.category}
                  </div>
                </div>
              </div>

              {/* Export & Share Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#131D31] border border-slate-800">
                <div className="text-xs text-slate-300">
                  Export a portable <code className="text-emerald-300 font-mono">.stepdsa.json</code> trace snapshot or copy a compressed <code className="text-cyan-300 font-mono">#trace=</code> URL:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSnapshotJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download .stepdsa.json</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyShareableTraceUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {copiedShareUrl ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>{copiedShareUrl ? 'Copied #trace= URL!' : 'Copy Shareable URL'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRunAlgorithm}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-md cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch in Workbench</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Trace Table Preview */}
              <div className="rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Captured Execution Timeline ({previewFrames.length} steps)</span>
                  <span className="text-[10px] text-slate-500">Showing first 40 frames</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/70 font-mono text-xs">
                  {previewFrames.slice(0, 40).map((f, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 flex items-start justify-between gap-3 hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] shrink-0">
                          #{idx}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px] shrink-0">
                          L{f.codeLine || 1}
                        </span>
                        <span className="text-slate-200 truncate">{f.explanation}</span>
                      </div>
                      {f.callStack && f.callStack.length > 0 && (
                        <span className="text-[10px] text-cyan-400 shrink-0 max-w-[220px] truncate">
                          {(() => {
                            const top = f.callStack[f.callStack.length - 1];
                            return typeof top === 'string' ? top : top.name;
                          })()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: LOCAL CLI & C++ ENGINE ==================== */}
          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-emerald-300">100% Local Execution Security:</span> Your
                  source code is never transmitted or compiled on remote servers. The local CLI runs on your machine,
                  compiles C++ via <code className="text-emerald-200 font-mono">g++</code>/<code className="text-emerald-200 font-mono">clang++</code> or traces Python via <code className="text-emerald-200 font-mono">python3</code>, and pipes compressed <code className="text-emerald-200 font-mono">#trace=</code> snapshots directly to your browser.
                </div>
              </div>

              {/* Interactive CLI Command Builder */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Interactive CLI Command Builder</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['run', 'trace', 'init', 'doctor'] as const).map((cmd) => (
                      <button
                        key={cmd}
                        type="button"
                        onClick={() => setCliSubcommand(cmd)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                          cliSubcommand === cmd
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        stepdsa {cmd}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional CLI Flags */}
                {(cliSubcommand === 'run' || cliSubcommand === 'trace') && (
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-300">
                    <span className="text-slate-500 text-[11px]">Flags:</span>
                    {cliSubcommand === 'run' && (
                      <>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cliFlagDev}
                            onChange={(e) => setCliFlagDev(e.target.checked)}
                            className="rounded border-slate-700"
                          />
                          <span>--dev (localhost:5173)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cliFlagNoOpen}
                            onChange={(e) => setCliFlagNoOpen(e.target.checked)}
                            className="rounded border-slate-700"
                          />
                          <span>--no-open</span>
                        </label>
                      </>
                    )}
                    {cliSubcommand === 'trace' && (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cliFlagVerbose}
                          onChange={(e) => setCliFlagVerbose(e.target.checked)}
                          className="rounded border-slate-700"
                        />
                        <span>--verbose</span>
                      </label>
                    )}
                  </div>
                )}

                {/* Generated Command Box */}
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                  <span className="text-emerald-400 font-bold truncate">$ {builtCliCommand}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleDownloadSourceFile}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-cyan-400" />
                      <span>Download solution.{selectedLang === 'python' ? 'py' : selectedLang === 'cpp' ? 'cpp' : 'stepdsa'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyCommand(builtCliCommand)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 text-[11px] cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy Command'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Step Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 font-mono font-bold flex items-center justify-center text-[11px]">
                      1
                    </span>
                    <strong className="text-white">Init or Save Solution</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Run <code className="text-indigo-300 font-mono">npx stepdsa init</code> or download your <code className="text-indigo-300 font-mono">solution.cpp</code> / <code className="text-indigo-300 font-mono">solution.py</code> file.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[11px]">
                      2
                    </span>
                    <strong className="text-white">Compile & Trace Locally</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Run <code className="text-cyan-300 font-mono">npx stepdsa run solution.cpp --dev</code> to capture every frame and metric.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-[11px]">
                      3
                    </span>
                    <strong className="text-white">Time-Travel in Browser</strong>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Scrub backward/forward across array states, pointers, and recursive Call Stack frames with 0ms lag.
                  </p>
                </div>
              </div>

              {/* Link to Full Documentation in Repo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs">
                <span className="text-slate-300">
                  Need C++ harness details, JSON schema specs, or advanced CLI flags (<code className="text-indigo-400 font-mono">--dev</code>, <code className="text-indigo-400 font-mono">--no-open</code>, <code className="text-indigo-400 font-mono">doctor</code>)?
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
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400/90 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side Execution</span>
            </span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Docs: <code className="text-slate-300 font-mono">docs/STUDIO_GUIDE.md</code> & <code className="text-slate-300 font-mono">docs/CLI.md</code>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
