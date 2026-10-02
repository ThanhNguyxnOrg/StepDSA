import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExecutionFrame } from '../../core/types';
import { Layers, ArrowDown } from 'lucide-react';

interface CallStackStageProps {
  frame: ExecutionFrame | null;
}

interface ParsedCallFrame {
  name: string;
  args: Record<string, string>;
  raw: string;
}

function parseCallStackString(str: string): ParsedCallFrame {
  const match = str.match(/^([a-zA-Z0-9_$]+)\s*\((.*)\)$/);
  if (!match) {
    return { name: str, args: {}, raw: str };
  }

  const name = match[1];
  const rawArgs = match[2];
  const args: Record<string, string> = {};

  if (rawArgs.trim()) {
    // Split by commas not inside quotes or brackets
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
      args: Object.fromEntries(Object.entries(item.params || {}).map(([k, v]) => [k, JSON.stringify(v)])),
      raw: `${item.name}(...)`,
    };
  });

  if (parsedFrames.length === 0) {
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
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4 min-h-[320px] select-none">
      {/* Stage Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-3 px-1">
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

      {/* Stacked Frames Display (Bottom-to-Top or Top-Down) */}
      <div className="w-full max-w-2xl flex flex-col gap-2">
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
  );
};
