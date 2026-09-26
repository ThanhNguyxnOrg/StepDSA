import React, { useState } from 'react';
import { Layers, ChevronRight, Braces } from 'lucide-react';
import { CallStackFrame, ExecutionFrame } from '../../core/types';

interface CallStackPanelProps {
  frame: ExecutionFrame | null;
  moduleName: string;
}

export const CallStackPanel: React.FC<CallStackPanelProps> = ({ frame, moduleName }) => {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(0);

  if (!frame) return null;

  // Derive scope variables from frame.variables or frame.state
  const extractedParams: Record<string, string | number> = {};

  if (frame.variables && Object.keys(frame.variables).length > 0) {
    Object.entries(frame.variables).forEach(([k, v]) => {
      extractedParams[k] = typeof v === 'boolean' ? String(v) : (v as string | number);
    });
  }

  // Also extract pointers and state properties if missing
  if (frame.state) {
    const s = frame.state as any;
    if (s.pointers && typeof s.pointers === 'object') {
      const arr = Array.isArray(s.array) ? s.array : [];
      Object.entries(s.pointers).forEach(([pName, pIdx]) => {
        if (typeof pIdx === 'number') {
          const el = arr[pIdx];
          extractedParams[pName] = el !== undefined ? `${pIdx} (val: ${el.value})` : pIdx;
        }
      });
    }
    if (s.target !== undefined) extractedParams['target'] = s.target;
    if (s.k !== undefined) extractedParams['k'] = s.k;
    if (s.windowSum !== undefined) extractedParams['windowSum'] = s.windowSum;
    if (s.maxSum !== undefined) extractedParams['maxSum'] = s.maxSum;
    if (s.currentArea !== undefined) extractedParams['area'] = s.currentArea;
    if (s.maxArea !== undefined) extractedParams['maxArea'] = s.maxArea;
    if (s.current !== undefined) extractedParams['current'] = s.current;
    if (s.insertingValue !== undefined) extractedParams['inserting'] = s.insertingValue;
  }

  // Build active call stack: from frame.callStack, or synthesize realistic frames
  let stack: CallStackFrame[] = [];

  if (frame.callStack && frame.callStack.length > 0) {
    stack = frame.callStack;
  } else {
    const s = frame.state as any;
    const cleanModName = moduleName.split(' ')[0].toLowerCase();

    if (s && s.pointers && s.pointers.low !== undefined && s.pointers.high !== undefined) {
      stack = [
        {
          name: `partition(arr, ${s.pointers.low}, ${s.pointers.high})`,
          params: extractedParams,
          line: frame.codeLine || 4,
          isCurrent: true,
        },
        {
          name: `quicksort(arr, 0, ${Array.isArray(s.array) ? s.array.length - 1 : 10})`,
          params: { low: 0, high: Array.isArray(s.array) ? s.array.length - 1 : 10 },
          line: 15,
        },
        {
          name: 'main()',
          params: { inputSize: Array.isArray(s.array) ? s.array.length : 10 },
          line: 1,
        },
      ];
    } else {
      stack = [
        {
          name: `${cleanModName}()`,
          params: extractedParams,
          line: frame.codeLine,
          isCurrent: true,
        },
        {
          name: 'main()',
          params: {},
          line: 1,
        },
      ];
    }
  }

  const activeFrame = stack[selectedFrameIndex] || stack[0];
  const activeParams =
    activeFrame.params && Object.keys(activeFrame.params).length > 0
      ? activeFrame.params
      : extractedParams;

  return (
    <div className="flex flex-col h-full bg-[#0E1420] border-t border-[#1F293D]">
      {/* Panel Header */}
      <div className="h-9 px-3 border-b border-[#1F293D] flex items-center justify-between bg-[#111827]/80 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-300">
          <Layers className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>CALL STACK</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1F2937] text-slate-400 font-mono">
            {stack.length} {stack.length === 1 ? 'frame' : 'frames'}
          </span>
        </div>

        {frame.conditionEval && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="text-slate-400 font-medium">{frame.conditionEval.expr}</span>
            <span className="text-slate-500">→</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                frame.conditionEval.result === true || frame.conditionEval.result === 'true'
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                  : 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40'
              }`}
            >
              {String(frame.conditionEval.result).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Call Stack List + Scope Variables */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* 1. Frames List */}
        <div className="p-2 space-y-1 border-b border-[#1F293D]/70 bg-[#0B0F19]/40 shrink-0">
          {stack.map((sf, idx) => {
            const isTop = idx === 0;
            const isSelected = idx === selectedFrameIndex;

            return (
              <button
                key={`${sf.name}-${idx}`}
                type="button"
                onClick={() => setSelectedFrameIndex(idx)}
                className={`w-full flex items-center justify-between px-2.5 py-1 rounded text-left font-mono text-[11px] transition-colors ${
                  isSelected
                    ? 'bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-cyan-200'
                    : 'hover:bg-[#1F2937]/50 text-slate-400 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] text-slate-600 font-bold shrink-0">#{stack.length - idx}</span>
                  {isTop ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-200 truncate">{sf.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-slate-500">
                  {sf.line && <span>:{sf.line}</span>}
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </div>
              </button>
            );
          })}
        </div>

        {/* 2. Scope Variables for Active Frame */}
        <div className="p-2.5 flex-1 bg-[#0E1420] overflow-y-auto">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
            <Braces className="w-3 h-3 text-[#10B981]" />
            <span>Scope Variables</span>
            <span className="text-slate-500 font-normal truncate">({activeFrame.name})</span>
          </div>

          {Object.keys(activeParams).length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(activeParams).map(([key, val]) => (
                <div
                  key={key}
                  className="px-2 py-1 rounded bg-[#111827] border border-[#1F293D] flex items-center justify-between text-[11px] font-mono"
                >
                  <span className="text-slate-400 font-medium">{key}</span>
                  <span className="text-[#06B6D4] font-bold truncate max-w-[100px]">{String(val)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] font-mono text-slate-500 italic py-2 text-center">
              No local variables in current frame
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
