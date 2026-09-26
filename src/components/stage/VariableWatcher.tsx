import React from 'react';
import { ExecutionFrame } from '../../core/types';
import { Activity } from 'lucide-react';

interface VariableWatcherProps {
  frame: ExecutionFrame | null;
}

export const VariableWatcher: React.FC<VariableWatcherProps> = ({ frame }) => {
  if (!frame) return null;

  // Extract variables: from explicit frame.variables, or derive from state
  const derivedVars: { key: string; value: string | number; color?: string }[] = [];

  if (frame.variables && Object.keys(frame.variables).length > 0) {
    Object.entries(frame.variables).forEach(([k, v]) => {
      derivedVars.push({ key: k, value: String(v) });
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
            color,
          });
        }
      });
    }

    // 2. Target or auxiliary metrics
    if (s.target !== undefined) {
      derivedVars.unshift({ key: 'target', value: s.target, color: 'amber' });
    }
    if (s.k !== undefined) {
      derivedVars.push({ key: 'k', value: s.k, color: 'blue' });
    }
    if (s.windowSum !== undefined) {
      derivedVars.push({ key: 'windowSum', value: s.windowSum, color: 'cyan' });
    }
    if (s.maxSum !== undefined) {
      derivedVars.push({ key: 'maxSum', value: s.maxSum, color: 'emerald' });
    }
    if (s.currentArea !== undefined) {
      derivedVars.push({ key: 'area', value: s.currentArea, color: 'cyan' });
    }
    if (s.maxArea !== undefined) {
      derivedVars.push({ key: 'maxArea', value: s.maxArea, color: 'emerald' });
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

          return (
            <div
              key={`${item.key}-${idx}`}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-mono shadow-sm transition-all ${badgeBorder}`}
            >
              <span className={`font-semibold ${keyColor}`}>{item.key}</span>
              <span className="text-slate-500">=</span>
              <span className={`font-bold ${valColor}`}>{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
