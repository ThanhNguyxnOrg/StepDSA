import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExecutionFrame } from '../../core/types';

export interface AuxiliaryMemoryData {
  type: 'map' | 'buffer' | 'set';
  name: string;
  data: any;
}

export function extractAuxiliaryMemory(frame?: ExecutionFrame | null): AuxiliaryMemoryData | null {
  if (!frame) return null;

  // 1. Check frame.state?.auxiliary / buffer / temp
  const stateAux = (frame.state as any)?.auxiliary ?? (frame.state as any)?.buffer ?? (frame.state as any)?.temp;
  if (Array.isArray(stateAux) && stateAux.length > 0) {
    return {
      type: 'buffer',
      name: 'auxiliary buffer',
      data: stateAux,
    };
  }

  // 2. Check frame.variables
  if (frame.variables) {
    // Buffer/Array check
    for (const [key, val] of Object.entries(frame.variables)) {
      if (['temp', 'buffer', 'auxiliary'].includes(key.toLowerCase()) && Array.isArray(val) && val.length > 0) {
        return {
          type: 'buffer',
          name: key,
          data: val,
        };
      }
    }

    // Map/Set check with preferred names
    const mapNames = ['seen', 'map', 'freq', 'counts', 'count', 'visited', 'memo', 'lookup', 'table'];
    for (const name of mapNames) {
      const val = frame.variables[name];
      if (val && typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length > 0) {
        return {
          type: 'map',
          name,
          data: val,
        };
      }
      if (val instanceof Set && val.size > 0) {
        return {
          type: 'set',
          name,
          data: Array.from(val),
        };
      }
    }

    // Any generic object in variables (excluding pointers, conditionEval, or null)
    for (const [key, val] of Object.entries(frame.variables)) {
      if (
        val &&
        typeof val === 'object' &&
        !Array.isArray(val) &&
        val.constructor === Object &&
        Object.keys(val).length > 0
      ) {
        if (!['pointers', 'conditionEval', 'metrics', 'state'].includes(key)) {
          return {
            type: 'map',
            name: key,
            data: val,
          };
        }
      }
    }
  }

  return null;
}

interface MemoryShelfProps {
  frame?: ExecutionFrame | null;
}

export const MemoryShelf: React.FC<MemoryShelfProps> = ({ frame }) => {
  const memory = extractAuxiliaryMemory(frame);

  if (!memory) return null;

  return (
    <div
      data-testid="memory-shelf"
      className="w-full max-w-4xl mx-auto px-4 py-2 mb-2 select-none"
    >
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 shadow-lg shadow-black/40 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wide uppercase text-indigo-300">
              {memory.type === 'buffer' ? 'Auxiliary Buffer' : 'Auxiliary Memory Shelf'}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/50">
              {memory.name}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {memory.type === 'buffer'
              ? `${memory.data.length} item${memory.data.length > 1 ? 's' : ''}`
              : `${Object.keys(memory.data).length} entr${Object.keys(memory.data).length > 1 ? 'ies' : 'y'}`}
          </span>
        </div>

        {/* Content Body */}
        {memory.type === 'buffer' ? (
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <AnimatePresence mode="popLayout">
              {memory.data.map((item: any, idx: number) => {
                const val = typeof item === 'object' && item !== null && 'value' in item ? item.value : item;
                return (
                  <motion.div
                    key={`buf-${idx}-${val}`}
                    initial={{ scale: 0.8, opacity: 0, y: 4 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="flex flex-col items-center min-w-[36px] px-2 py-1 rounded-lg bg-slate-950/80 border border-indigo-500/30 text-indigo-200"
                  >
                    <span className="text-xs font-mono font-bold">{String(val)}</span>
                    <span className="text-[9px] font-mono text-slate-500 mt-0.5">[{idx}]</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <AnimatePresence mode="popLayout">
              {Object.entries(memory.data).map(([key, val]) => (
                <motion.div
                  key={`entry-${key}-${val}`}
                  initial={{ scale: 0.8, opacity: 0, y: 4 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-indigo-500/30 hover:border-indigo-400/50 transition-colors shadow-xs"
                >
                  <span className="text-xs font-mono font-bold text-indigo-300">{key}</span>
                  <span className="text-[10px] font-mono text-slate-500">:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{String(val)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
