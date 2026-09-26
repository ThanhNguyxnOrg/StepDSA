import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { SupportedLanguage, ExecutionFrame } from '../../core/types';
import { CallStackPanel } from '../debugger/CallStackPanel';

interface CodeInspectorProps {
  codeSnippets: Record<SupportedLanguage, string>;
  activeLine: number;
  isOpen: boolean;
  onToggle: () => void;
  frame?: ExecutionFrame | null;
  moduleName?: string;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  codeSnippets,
  activeLine,
  isOpen,
  onToggle,
  frame = null,
  moduleName = 'Algorithm',
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('cpp'); // Default C++ as requested!
  const [copied, setCopied] = useState(false);

  const languages: { id: SupportedLanguage; label: string }[] = [
    { id: 'cpp', label: 'C++' },
    { id: 'python', label: 'Python' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'java', label: 'Java' },
    { id: 'pseudocode', label: 'Pseudocode' },
  ];

  const currentCode = codeSnippets[selectedLang] || codeSnippets['cpp'] || codeSnippets['python'] || '';
  const lines = currentCode.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-full md:w-[22rem] lg:w-96 border-l border-[#1F293D] bg-[#0B0F19] flex flex-col h-full overflow-hidden">
      {/* Top Bar / Language Selector */}
      <div className="h-11 border-b border-[#1F293D] px-3 flex items-center justify-between bg-[#111827]/80 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors whitespace-nowrap ${
                selectedLang === lang.id
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1F2937]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title="Copy Code"
            className="p-1 rounded hover:bg-[#1F2937] text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggle}
            title="Collapse Inspector"
            className="p-1 rounded hover:bg-[#1F2937] text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Upper Half: Code Editor Window (55% Height) */}
      <div className="flex-[3] overflow-auto p-2 font-mono text-[11px] leading-relaxed bg-[#0B0F19]">
        <div className="min-w-max space-y-0.5">
          {lines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = lineNum === activeLine;

            return (
              <div
                key={lineNum}
                className={`flex items-start px-2 py-0.5 rounded transition-all duration-150 ${
                  isHighlighted
                    ? 'bg-[#10B981]/15 text-white border-l-2 border-[#10B981] font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-[#111827]'
                }`}
              >
                <span
                  className={`w-7 shrink-0 text-right pr-2.5 select-none text-[10px] ${
                    isHighlighted ? 'text-[#10B981] font-bold' : 'text-slate-600'
                  }`}
                >
                  {lineNum}
                </span>
                <span className="whitespace-pre pr-4">{lineText || ' '}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synchronized Status Sub-bar */}
      <div className="border-t border-[#1F293D] px-3 py-1.5 bg-[#111827]/80 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-[#10B981]" />
          <span>Line: <strong className="text-[#10B981]">{activeLine > 0 ? activeLine : '—'}</strong></span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">SYNCED</span>
      </div>

      {/* Lower Half: Call Stack & Scope Variables Panel (45% Height) */}
      <div className="flex-[2] min-h-[160px] overflow-hidden flex flex-col">
        <CallStackPanel frame={frame} moduleName={moduleName} />
      </div>
    </aside>
  );
};
