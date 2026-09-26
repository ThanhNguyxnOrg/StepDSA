import React from 'react';
import { motion } from 'motion/react';
import { ElementStatus } from '../../core/types';

export interface ArrayElement {
  id: string | number;
  value: number;
  status: ElementStatus;
}

export interface ArrayStageState {
  array: ArrayElement[];
  pointers?: Record<string, number>;
  discardedRange?: [number, number]; // e.g. for Binary Search
  target?: number;
  auxiliary?: any;
}

interface ArrayStageProps {
  state: ArrayStageState;
  projection: '2d' | 'isometric';
}

export const ArrayStage: React.FC<ArrayStageProps> = ({ state, projection }) => {
  const { array = [], pointers = {}, discardedRange } = state;

  if (array.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-xs">
        No elements to display
      </div>
    );
  }

  // Calculate max value for height scaling
  const maxValue = Math.max(1, ...array.map((el) => el.value));

  // Invert pointer map to easily lookup all pointers sitting on index i
  const pointersAtIndex: Record<number, string[]> = {};
  Object.entries(pointers).forEach(([name, idx]) => {
    if (idx !== undefined && idx !== null && idx >= 0 && idx < array.length) {
      if (!pointersAtIndex[idx]) pointersAtIndex[idx] = [];
      pointersAtIndex[idx].push(name);
    }
  });

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4 overflow-x-auto min-h-[320px]">
      <div
        className={`w-full max-w-4xl flex items-end justify-center gap-2 sm:gap-3 transition-all duration-500 ${
          projection === 'isometric' ? 'stage-isometric py-8' : 'stage-flat'
        }`}
      >
        {array.map((el, idx) => {
          const heightPercent = Math.max(18, Math.round((el.value / maxValue) * 100));
          const elPointers = pointersAtIndex[idx] || [];

          const isDiscarded =
            discardedRange && idx >= discardedRange[0] && idx <= discardedRange[1];

          // Determine styles based on status
          let bgClass = 'bg-[#1E293B] border-[#334155] text-slate-200';
          let glowClass = '';

          if (isDiscarded) {
            bgClass = 'bg-[#1F2937]/30 border-dashed border-[#374151] text-slate-600 opacity-30';
          } else {
            switch (el.status) {
              case 'comparing':
                bgClass = 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]';
                glowClass = 'shadow-lg shadow-[#F59E0B]/20 ring-2 ring-[#F59E0B]/50';
                break;
              case 'swapping':
                bgClass = 'bg-[#F43F5E]/20 border-[#F43F5E] text-[#F43F5E]';
                glowClass = 'shadow-lg shadow-[#F43F5E]/30 ring-2 ring-[#F43F5E]/60';
                break;
              case 'sorted':
                bgClass = 'bg-[#10B981]/25 border-[#10B981] text-[#10B981]';
                glowClass = 'shadow-lg shadow-[#10B981]/25';
                break;
              case 'pivot':
                bgClass = 'bg-[#8B5CF6]/25 border-[#8B5CF6] text-[#A78BFA]';
                glowClass = 'shadow-lg shadow-[#8B5CF6]/30 ring-2 ring-[#8B5CF6]/60';
                break;
              case 'active':
                bgClass = 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#06B6D4]';
                glowClass = 'shadow-md shadow-[#06B6D4]/20 ring-1 ring-[#06B6D4]/50';
                break;
            }
          }

          return (
            <div key={el.id ?? idx} className="flex flex-col items-center flex-1 max-w-[56px] min-w-[28px] relative group">
              {/* Value Header */}
              <span
                className={`text-[11px] sm:text-xs font-mono font-bold mb-1.5 transition-colors ${
                  el.status === 'sorted' ? 'text-[#10B981]' : el.status === 'pivot' ? 'text-[#A78BFA]' : 'text-slate-300'
                }`}
              >
                {el.value}
              </span>

              {/* Vertical Bar */}
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                style={{ height: `${heightPercent * 2.2}px` }}
                className={`w-full rounded-t-lg sm:rounded-t-xl border flex flex-col justify-end items-center pb-2 transition-all ${bgClass} ${glowClass}`}
              >
                {/* Visual bar gradient line */}
                <div className="w-1/3 h-1 rounded-full bg-white/20 mb-1" />
              </motion.div>

              {/* Index Subtext */}
              <span className="text-[10px] font-mono text-slate-500 mt-1 select-none">
                [{idx}]
              </span>

              {/* Pointer Badges: Strictly on SAME horizontal line, never stacking vertically */}
              <div className="mt-1 flex flex-row items-center justify-center gap-1 whitespace-nowrap min-h-[22px] z-10">
                {elPointers.map((pName) => (
                  <motion.div
                    key={pName}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shadow-sm border whitespace-nowrap shrink-0 ${
                      pName === 'pivot'
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                        : pName === 'left' || pName === 'i' || pName === 'low'
                        ? 'bg-[#06B6D4] text-[#0B0F19] border-[#06B6D4]'
                        : 'bg-[#10B981] text-[#0B0F19] border-[#10B981]'
                    }`}
                  >
                    {pName}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
