import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal } from 'lucide-react';
import { SupportedLanguage } from '../../core/types';

interface CodeInspectorProps {
  codeSnippets: Record<SupportedLanguage, string>;
  activeLine: number;
  isOpen: boolean;
  onToggle: () => void;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({
  codeSnippets,
  activeLine,
  isOpen,
  onToggle,
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('python');
  const [copied, setCopied] = useState(false);

  const languages: { id: SupportedLanguage; label: string }[] = [
    { id: 'python', label: 'Python' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'pseudocode', label: 'Pseudocode' },
  ];

  const currentCode = codeSnippets[selectedLang] || codeSnippets['python'] || '';
  const lines = currentCode.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isOpen) {
    return (
      <aside className="w-12 border-l border-[#1F293D] bg-[#0B0F19] flex flex-col items-center py-6 gap-6 text-slate-400">
        <button
          onClick={onToggle}
          title="Expand Code Inspector"
          className="p-2 rounded-lg hover:bg-[#1F2937] text-slate-400 hover:text-white transition-colors"
        >
          <Code2 className="w-5 h-5 text-[#06B6D4]" />
        </button>
        <div className="writing-vertical text-xs font-mono tracking-widest uppercase rotate-180 text-slate-500">
          CODE INSPECTOR
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-80 lg:w-96 border-l border-[#1F293D] bg-[#0B0F19] flex flex-col h-full">
      {/* Top Bar / Language Selector */}
      <div className="h-12 border-b border-[#1F293D] px-3 flex items-center justify-between bg-[#111827]/60">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors whitespace-nowrap ${
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
            className="p-1.5 rounded hover:bg-[#1F2937] text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggle}
            title="Collapse Code Inspector"
            className="p-1.5 rounded hover:bg-[#1F2937] text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Code Editor Window */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs leading-relaxed bg-[#0B0F19]">
        <div className="space-y-0.5">
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
                  className={`w-7 shrink-0 text-right pr-3 select-none text-[11px] ${
                    isHighlighted ? 'text-[#10B981] font-bold' : 'text-slate-600'
                  }`}
                >
                  {lineNum}
                </span>
                <span className="whitespace-pre overflow-x-auto">{lineText || ' '}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synchronized Status Card */}
      <div className="border-t border-[#1F293D] p-3 bg-[#111827]/80 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Active Line: <strong className="text-[#10B981]">{activeLine > 0 ? activeLine : '—'}</strong></span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">SYNCED</span>
      </div>
    </aside>
  );
};
