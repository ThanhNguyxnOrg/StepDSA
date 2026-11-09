import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExecutionFrame } from '../../core/types';

export interface AuxiliaryMemoryData {
  type: 'map' | 'buffer' | 'set' | 'value';
  name: string;
  data: any;
  /** Index of the item currently being written/read, for buffer highlighting. */
  activeIndex?: number;
  /** Optional short explanation rendered under the shelf title. */
  note?: string;
}

export function extractAuxiliaryMemory(frame?: ExecutionFrame | null): AuxiliaryMemoryData | null {
  if (!frame) return null;

  // 1. Check frame.state?.auxiliary / buffer / temp
  const stateAux = (frame.state as any)?.auxiliary ?? (frame.state as any)?.buffer ?? (frame.state as any)?.temp;
  if (
    stateAux &&
    typeof stateAux === 'object' &&
    !Array.isArray(stateAux) &&
    typeof stateAux.name === 'string' &&
    'data' in stateAux
  ) {
    const type = ['map', 'buffer', 'set', 'value'].includes(stateAux.type)
      ? stateAux.type
      : 'map';
    return {
      type,
      name: stateAux.name,
      data: stateAux.data,
      activeIndex: stateAux.activeIndex,
      note: stateAux.note,
    };
  }
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
              : memory.type === 'value'
              ? 'held aside'
              : `${Object.keys(memory.data).length} entr${Object.keys(memory.data).length > 1 ? 'ies' : 'y'}`}
          </span>
        </div>

        {memory.note && (
          <p className="text-[10px] font-mono text-slate-400 -mt-1 mb-1.5 leading-snug">
            {memory.note}
          </p>
        )}

        {/* Content Body */}
        {memory.type === 'value' ? (
          <div className="flex items-center gap-2 py-1">
            <div className="flex flex-col items-center min-w-[48px] px-3 py-1.5 rounded-lg bg-[#0B0F19]/80 border border-amber-500/50 text-amber-200 shadow-sm">
              <span className="text-base font-mono font-bold leading-none">
                {typeof memory.data === 'object' && memory.data !== null
                  ? String(memory.data.value ?? JSON.stringify(memory.data))
                  : String(memory.data)}
              </span>
              <span className="text-[9px] font-mono text-amber-400/80 mt-1">key</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 leading-snug">
              This value is held in a temporary variable while the array slot is overwritten.
            </span>
          </div>
        ) : memory.type === 'buffer' ? (
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <AnimatePresence mode="popLayout">
              {memory.data.map((item: any, idx: number) => {
                const val = typeof item === 'object' && item !== null && 'value' in item ? item.value : item;
                const isActive = memory.activeIndex === idx;
                return (
                  <motion.div
                    key={`buf-${idx}-${val}`}
                    initial={{ scale: 0.8, opacity: 0, y: 4 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`flex flex-col items-center min-w-[36px] px-2 py-1 rounded-lg border ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-400/70 text-amber-200 ring-1 ring-amber-400/50'
                        : 'bg-[#0B0F19]/80 border-indigo-500/30 text-indigo-200'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{String(val)}</span>
                    <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                      [{idx}]{isActive ? ' ←' : ''}
                    </span>
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
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B0F19]/80 border border-indigo-500/30 hover:border-indigo-400/50 transition-colors shadow-xs"
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
