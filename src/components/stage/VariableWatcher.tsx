import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExecutionFrame } from '../../core/types';
import { Activity } from 'lucide-react';

interface VariableWatcherProps {
  frame: ExecutionFrame | null;
}

export const VariableWatcher: React.FC<VariableWatcherProps> = ({ frame }) => {
  const prevValuesRef = React.useRef<Record<string, number>>({});
  const lastStepIndexRef = React.useRef<number | null>(null);

  if (!frame) return null;

  // Extract variables: from explicit frame.variables, or derive from state
  const derivedVars: { key: string; value: string | number; rawNumeric?: number; color?: string }[] = [];

  if (frame.variables && Object.keys(frame.variables).length > 0) {
    Object.entries(frame.variables).forEach(([k, v]) => {
      // Exclude large object structures (like maps/sets handled by MemoryShelf)
      if (typeof v === 'number') {
        derivedVars.push({ key: k, value: v, rawNumeric: v });
      } else if (typeof v === 'string' || typeof v === 'boolean') {
        derivedVars.push({ key: k, value: String(v) });
      }
    });
  } else if (frame.state) {
    const s = frame.state as any;

    // 1. Pointers in array stage
    if (s.pointers && typeof s.pointers === 'object') {
      const arr = Array.isArray(s.array) ? s.array : [];
      Object.entries(s.pointers).forEach(([name, idx]) => {
        if (typeof idx === 'number' && idx >= 0) {
          const el = arr[idx];
          const valSuffix = el !== undefined ? ` [${el.value}]` : '';
          let color = 'cyan';
          if (name.toLowerCase().includes('pivot')) color = 'purple';
          else if (name.toLowerCase().includes('mid') || name.toLowerCase().includes('target')) color = 'amber';
          else if (name.toLowerCase().includes('max') || name.toLowerCase().includes('best')) color = 'emerald';

          derivedVars.push({
            key: name,
            value: `${idx}${valSuffix}`,
            rawNumeric: idx,
            color,
          });
        }
      });
    }

    // 2. Target or auxiliary metrics
    if (s.target !== undefined && typeof s.target === 'number') {
      derivedVars.unshift({ key: 'target', value: s.target, rawNumeric: s.target, color: 'amber' });
    }
    if (s.k !== undefined && typeof s.k === 'number') {
      derivedVars.push({ key: 'k', value: s.k, rawNumeric: s.k, color: 'blue' });
    }
    if (s.windowSum !== undefined && typeof s.windowSum === 'number') {
      derivedVars.push({ key: 'windowSum', value: s.windowSum, rawNumeric: s.windowSum, color: 'cyan' });
    }
    if (s.maxSum !== undefined && typeof s.maxSum === 'number') {
      derivedVars.push({ key: 'maxSum', value: s.maxSum, rawNumeric: s.maxSum, color: 'emerald' });
    }
    if (s.currentArea !== undefined && typeof s.currentArea === 'number') {
      derivedVars.push({ key: 'area', value: s.currentArea, rawNumeric: s.currentArea, color: 'cyan' });
    }
    if (s.maxArea !== undefined && typeof s.maxArea === 'number') {
      derivedVars.push({ key: 'maxArea', value: s.maxArea, rawNumeric: s.maxArea, color: 'emerald' });
    }

    // 3. Graph traversal / Queue
    if (s.current !== undefined) {
      derivedVars.unshift({ key: 'current', value: s.current, color: 'amber' });
    }
    if (Array.isArray(s.queue)) {
      derivedVars.push({
        key: 'queue',
        value: s.queue.length > 0 ? `[${s.queue.join(', ')}]` : '[]',
        color: 'purple',
      });
    }

    // 4. Tree traversal / insert
    if (s.insertingValue !== undefined) {
      derivedVars.unshift({ key: 'inserting', value: s.insertingValue, color: 'amber' });
    }
  }

  // Calculate numeric deltas across adjacent steps
  const currentNumericValues: Record<string, number> = {};
  derivedVars.forEach((item) => {
    if (typeof item.rawNumeric === 'number' && !Number.isNaN(item.rawNumeric)) {
      currentNumericValues[item.key] = item.rawNumeric;
    } else if (typeof item.value === 'number' && !Number.isNaN(item.value)) {
      currentNumericValues[item.key] = item.value;
    } else if (typeof item.value === 'string' && /^-?\d+(\.\d+)?$/.test(item.value.trim())) {
      const parsed = Number(item.value.trim());
      if (!Number.isNaN(parsed)) {
        currentNumericValues[item.key] = parsed;
      }
    }
  });

  const deltas: Record<string, { delta: number; text: string }> = {};
  if (lastStepIndexRef.current !== null && frame.stepIndex !== lastStepIndexRef.current) {
    if (Math.abs(frame.stepIndex - lastStepIndexRef.current) <= 2) {
      Object.entries(currentNumericValues).forEach(([key, curVal]) => {
        const prevVal = prevValuesRef.current[key];
        if (prevVal !== undefined && prevVal !== curVal) {
          const diff = curVal - prevVal;
          deltas[key] = {
            delta: diff,
            text: diff > 0 ? `▲ +${diff}` : `▼ ${diff}`,
          };
        }
      });
    }
  }

  // Synchronize ref on every render cycle
  React.useEffect(() => {
    prevValuesRef.current = currentNumericValues;
    lastStepIndexRef.current = frame.stepIndex;
  });

  if (derivedVars.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider shrink-0 mr-0.5">
        <Activity className="w-3 h-3 text-[#06B6D4]" />
        <span>Watch:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {derivedVars.map((item, idx) => {
          let badgeBorder = 'border-[#1F293D] bg-[#111827] text-slate-200';
          let keyColor = 'text-slate-400';
          let valColor = 'text-white';

          if (item.color === 'cyan') {
            badgeBorder = 'border-[#06B6D4]/30 bg-[#06B6D4]/10';
            keyColor = 'text-[#06B6D4]';
            valColor = 'text-cyan-200';
          } else if (item.color === 'purple') {
            badgeBorder = 'border-[#8B5CF6]/30 bg-[#8B5CF6]/10';
            keyColor = 'text-[#A78BFA]';
            valColor = 'text-purple-200';
          } else if (item.color === 'amber') {
            badgeBorder = 'border-[#F59E0B]/30 bg-[#F59E0B]/10';
            keyColor = 'text-[#F59E0B]';
            valColor = 'text-amber-200';
          } else if (item.color === 'emerald') {
            badgeBorder = 'border-[#10B981]/30 bg-[#10B981]/10';
            keyColor = 'text-[#10B981]';
            valColor = 'text-emerald-200';
          }

          const deltaInfo = deltas[item.key];

          return (
            <div
              key={`${item.key}-${idx}`}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-mono shadow-sm transition-all ${badgeBorder}`}
            >
              <span className={`font-semibold ${keyColor}`}>{item.key}</span>
              <span className="text-slate-500">=</span>
              <span className={`font-bold ${valColor}`}>{item.value}</span>

              {/* Live Variable Delta Badge */}
              <AnimatePresence>
                {deltaInfo && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7, y: 2 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`ml-1 px-1 py-0.2 rounded text-[9px] font-mono font-bold leading-none select-none ${
                      deltaInfo.delta > 0
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs'
                    }`}
                  >
                    {deltaInfo.text}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
