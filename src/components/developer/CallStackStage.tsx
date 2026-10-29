import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExecutionFrame } from '../../core/types';
import { Layers, Database, Hash, Boxes } from 'lucide-react';

interface CallStackStageProps {
  frame: ExecutionFrame | null;
}

interface ParsedCallFrame {
  name: string;
  args: Record<string, string>;
  raw: string;
}

function parseCallStackString(str: string): ParsedCallFrame {
  const match = str.match(/^([a-zA-Z0-9_$:]+)\s*\((.*)\)$/);
  if (!match) {
    return { name: str, args: {}, raw: str };
  }

  const name = match[1];
  const rawArgs = match[2];
  const args: Record<string, string> = {};

  if (rawArgs.trim()) {
    const parts = rawArgs.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    parts.forEach((p) => {
      const eqIdx = p.indexOf('=');
      const colonIdx = p.indexOf(':');
      const sep = eqIdx !== -1 ? eqIdx : colonIdx;
      if (sep !== -1) {
        const k = p.slice(0, sep).trim();
        const v = p.slice(sep + 1).trim();
        args[k] = v;
      } else {
        args[`arg${Object.keys(args).length}`] = p.trim();
      }
    });
  }

  return { name, args, raw: str };
}

export const CallStackStage: React.FC<CallStackStageProps> = ({ frame }) => {
  if (!frame) return null;

  const rawStack = Array.isArray(frame.callStack) ? frame.callStack : [];
  const parsedFrames: ParsedCallFrame[] = rawStack.map((item) => {
    if (typeof item === 'string') {
      return parseCallStackString(item);
    }
    return {
      name: item.name,
      args: Object.fromEntries(
        Object.entries(item.params || {}).map(([k, v]) => [k, JSON.stringify(v)])
      ),
      raw: `${item.name}(...)`,
    };
  });

  // Extract Heap Objects (Arrays/Lists & Hash Maps/Dictionaries) and Scalar Locals from frame.variables
  const vars = frame.variables || frame.state?.variables || {};
  const arrayEntries: [string, any[]][] = [];
  const dictEntries: [string, Record<string, any>][] = [];
  const scalarEntries: [string, string | number | boolean][] = [];

  Object.entries(vars).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      arrayEntries.push([k, v]);
    } else if (v !== null && typeof v === 'object') {
      dictEntries.push([k, v as Record<string, any>]);
    } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      scalarEntries.push([k, v]);
    }
  });

  const hasMemoryObjects =
    arrayEntries.length > 0 || dictEntries.length > 0 || scalarEntries.length > 0;

  if (parsedFrames.length === 0 && !hasMemoryObjects) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 min-h-[320px]">
        <div className="flex flex-col items-center justify-center max-w-sm p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
          <div className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-500 mb-3 text-lg">
            <Layers className="w-6 h-6 text-slate-400" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 mb-1">
            Call Stack Ready
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Step through execution to observe recursive call frames and returns.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4 min-h-[320px] select-none gap-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT / MAIN COLUMN: Active Call Stack Frames */}
        <div
          className={
            hasMemoryObjects
              ? 'lg:col-span-7 flex flex-col'
              : 'lg:col-span-12 max-w-2xl mx-auto w-full flex flex-col'
          }
        >
          {/* Stage Header */}
          <div className="w-full flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                Active Call Stack
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Depth: <strong className="text-cyan-400">{parsedFrames.length}</strong>
            </span>
          </div>

          {/* Stacked Frames Display */}
          <div className="w-full flex flex-col gap-2">
            {parsedFrames.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between">
                <span>Call stack unwound — execution returned to caller.</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] font-bold uppercase">
                  FINISHED
                </span>
              </div>
            ) : null}
            <AnimatePresence mode="popLayout">
              {parsedFrames.map((cf, idx) => {
                const isTop = idx === parsedFrames.length - 1;
                const depthIndex = idx + 1;

                return (
                  <motion.div
                    key={`call-frame-${idx}-${cf.name}`}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg transition-all backdrop-blur-md ${
                      isTop
                        ? 'bg-slate-900/95 border-cyan-500/50 shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400'
                    }`}
                  >
                    {/* Left: Stack Level & Function Name */}
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isTop
                            ? 'bg-cyan-500 text-[#0B0F19]'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{depthIndex}
                      </span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          isTop ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {cf.name}
                      </span>
                      {isTop && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Right: Arguments Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Object.entries(cf.args).map(([argName, argVal]) => (
                        <div
                          key={argName}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 border ${
                            isTop
                              ? 'bg-cyan-950/60 border-cyan-800/60 text-cyan-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="text-slate-400 font-semibold">{argName}:</span>
                          <span className="font-bold text-amber-300">{argVal}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Python-Tutor-Style Live Heap & Memory Inspector */}
        {(arrayEntries.length > 0 || dictEntries.length > 0 || scalarEntries.length > 0) && (
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Heap & Memory State
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Live Objects</span>
            </div>

            {/* Array / List Objects */}
            {arrayEntries.map(([arrName, items]) => (
              <div
                key={arrName}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5" />
                    <span>{arrName}[]</span>
                  </span>
                  <span className="text-slate-500">len = {items.length}</span>
                </div>
                {items.length === 0 ? (
                  <div className="text-[11px] font-mono text-slate-500 italic px-1">
                    Empty list []
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {items.slice(0, 16).map((val, idx) => (
                      <div
                        key={`${arrName}-${idx}`}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-emerald-500/30 font-mono text-[11px] flex flex-col items-center min-w-[38px]"
                      >
                        <span className="text-[9px] text-slate-500">[{idx}]</span>
                        <span className="font-bold text-emerald-300">
                          {typeof val === 'string' ? `"${val}"` : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Dictionary / Hash Map Objects */}
            {dictEntries.map(([dictName, entriesObj]) => {
              const keys = Object.keys(entriesObj);
              return (
                <div
                  key={dictName}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-purple-400 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />
                      <span>{dictName} {'{ }'}</span>
                    </span>
                    <span className="text-slate-500">{keys.length} entries</span>
                  </div>
                  {keys.length === 0 ? (
                    <div className="text-[11px] font-mono text-slate-500 italic px-1">
                      Empty map {'{}'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      {keys.slice(0, 12).map((k) => (
                        <div
                          key={k}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-purple-500/30 font-mono text-[11px] flex items-center justify-between"
                        >
                          <span className="text-purple-300 font-semibold">{k}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-amber-300 font-bold">
                            {JSON.stringify(entriesObj[k])}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Scalar Frame Variables */}
            {scalarEntries.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Active Scope Bindings
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scalarEntries.slice(0, 12).map(([k, v]) => (
                    <div
                      key={k}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] flex items-center gap-1.5"
                    >
                      <span className="text-slate-400">{k} =</span>
                      <span className="font-bold text-cyan-300">
                        {typeof v === 'string' ? `"${v}"` : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
