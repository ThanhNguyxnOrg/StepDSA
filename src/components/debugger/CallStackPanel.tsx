import React, { useState } from 'react';
import { Layers, ChevronRight, Braces } from 'lucide-react';
import { CallStackFrame, ExecutionFrame } from '../../core/types';

interface CallStackPanelProps {
  frame: ExecutionFrame | null;
  moduleName?: string;
  compact?: boolean;
}

export const CallStackPanel: React.FC<CallStackPanelProps> = ({
  frame,
  moduleName = 'execute',
  compact = false,
}) => {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(0);

  if (!frame) return null;

  // Derive scope variables from frame.variables or frame.scopeVariables or frame.state
  const extractedParams: Record<string, string | number> = {};

  const rawVars = frame.variables || frame.scopeVariables;
  if (rawVars && Object.keys(rawVars).length > 0) {
    Object.entries(rawVars).forEach(([k, v]) => {
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
    if (s.targetValue !== undefined) extractedParams['target'] = s.targetValue;
    if (s.nextKey !== undefined) extractedParams['nextKey'] = s.nextKey;
    if (s.val !== undefined) extractedParams['val'] = s.val;
    if (s.value !== undefined) extractedParams['value'] = s.value;
    if (s.k !== undefined) extractedParams['k'] = s.k;
    if (s.windowSum !== undefined) extractedParams['windowSum'] = s.windowSum;
    if (s.maxSum !== undefined) extractedParams['maxSum'] = s.maxSum;
    if (s.currentArea !== undefined) extractedParams['area'] = s.currentArea;
    if (s.maxArea !== undefined) extractedParams['maxArea'] = s.maxArea;
    if (s.current !== undefined) extractedParams['current'] = s.current;
    if (s.insertingValue !== undefined) extractedParams['inserting'] = s.insertingValue;
    if (s.currentIndex !== undefined) extractedParams['index'] = s.currentIndex;
    if (s.maxReach !== undefined) extractedParams['maxReach'] = s.maxReach;
    if (s.currentStair !== undefined) extractedParams['stair'] = s.currentStair;
    if (s.filledCount !== undefined) extractedParams['filled'] = s.filledCount;
    if (s.isBipartite !== undefined) extractedParams['bipartite'] = String(s.isBipartite);
    if (s.currentCell) extractedParams['cell'] = `(${s.currentCell[0]}, ${s.currentCell[1]})`;
    if (Array.isArray(s.nodes) && extractedParams['nodeCount'] === undefined) {
      extractedParams['nodes'] = s.nodes.length;
    }
  }

  const getCleanFuncName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('bst') || lower.includes('avl')) return 'insert';
    if (lower.includes('search')) return 'search';
    if (lower.includes('sort')) return 'sort';
    if (lower.includes('traversal')) return 'traverse';
    if (lower.includes('parentheses')) return 'isValid';
    if (lower.includes('queue')) return 'enqueue';
    if (lower.includes('stack')) return 'push';
    if (lower.includes('climb')) return 'climbStairs';
    if (lower.includes('path')) return 'uniquePaths';
    if (lower.includes('jump')) return 'canJump';
    if (lower.includes('bipartite')) return 'isBipartite';
    if (lower.includes('flood')) return 'floodFill';
    if (lower.includes('tree')) return 'insert';
    if (lower.includes('heap')) return 'heapify';
    const firstWord = name.split(/[\s(]/)[0].toLowerCase();
    return firstWord.length > 2 ? firstWord : 'execute';
  };

  // Build active call stack: from frame.callStack, or synthesize realistic frames
  let stack: CallStackFrame[] = [];

  if (frame.callStack && frame.callStack.length > 0) {
    const mapped = frame.callStack.map((item, idx) =>
      typeof item === 'string'
        ? {
            name: item,
            params: {},
            line: frame.codeLine || 1,
            isCurrent: idx === frame.callStack!.length - 1,
          }
        : item
    );
    // If the stack was built via .push() (main at index 0, current at the end),
    // reverse it so the active top-of-stack frame is displayed first (index 0).
    const shouldReverse =
      mapped.length > 1 &&
      (mapped[mapped.length - 1].isCurrent ||
        (!mapped[0].isCurrent && mapped[0].name.toLowerCase().startsWith('main')));
    stack = shouldReverse ? [...mapped].reverse() : mapped;
  } else {
    const s = frame.state as any;
    const cleanModName = getCleanFuncName(moduleName);

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

  const safeIndex = selectedFrameIndex < stack.length ? selectedFrameIndex : 0;
  const activeFrame = stack[safeIndex] || stack[0];
  const isTopSelected = safeIndex === 0;
  const activeParams: Record<string, string | number> = isTopSelected
    ? { ...(activeFrame.params || {}), ...extractedParams }
    : activeFrame.params && Object.keys(activeFrame.params).length > 0
    ? { ...activeFrame.params }
    : { ...extractedParams };

  // Guaranteed fallback telemetry so Scope Variables is never blank
  if (Object.keys(activeParams).length === 0) {
    if (activeFrame.name.startsWith('main')) {
      activeParams['status'] = 'running';
      activeParams['step'] = `${frame.stepIndex + 1}/${frame.totalSteps || '?'}`;
      if (frame.codeLine) activeParams['line'] = frame.codeLine;
    } else {
      activeParams['step'] = `${frame.stepIndex + 1}/${frame.totalSteps || '?'}`;
      if (frame.codeLine) activeParams['line'] = frame.codeLine;
      if (frame.isMilestone) activeParams['phase'] = 'milestone';
      else activeParams['phase'] = 'executing';
    }
  }

  if (compact) {
    return (
      <div className="bg-[#0E1420] border-b border-[#1F293D]/80 px-2.5 py-1.5 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-slate-300 uppercase tracking-wider shrink-0">
            <Layers className="w-3 h-3 text-[#06B6D4] shrink-0" />
            <span>CALL STACK</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#1F2937] text-slate-400 font-mono">
              {stack.length}
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0">
            {stack.map((sf, idx) => {
              const isTop = idx === 0;
              const isSelected = idx === selectedFrameIndex;
              return (
                <button
                  key={`${sf.name}-${idx}`}
                  type="button"
                  onClick={() => setSelectedFrameIndex(idx)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-cyan-200 font-semibold'
                      : 'bg-[#111827] text-slate-400 border border-[#1F293D] hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isTop ? 'bg-[#10B981]' : 'bg-slate-600'
                    }`}
                  />
                  <span className="max-w-[140px] truncate">{sf.name}</span>
                  {sf.line && <span className="text-slate-500">:{sf.line}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0E1420] border-t border-[#1F293D]">
      {/* Panel Header */}
      <div className="h-9 px-3 border-b border-[#1F293D] flex items-center justify-between gap-2 bg-[#111827]/80 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-300 shrink-0 whitespace-nowrap">
          <Layers className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
          <span>CALL STACK</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F2937] text-slate-400 font-mono">
            {stack.length}
          </span>
        </div>

        {frame.conditionEval && (
          <div className="flex items-center gap-1 text-[10px] font-mono min-w-0">
            <span className="text-slate-400 font-medium truncate" title={frame.conditionEval.expr}>
              {frame.conditionEval.expr}
            </span>
            <span className="text-slate-500 shrink-0">→</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
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
                  <span className="text-[#06B6D4] font-bold truncate max-w-[120px]" title={typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}>
                    {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                  </span>
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
