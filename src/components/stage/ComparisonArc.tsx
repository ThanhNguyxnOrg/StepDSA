import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function calculateArcHeight(distance: number): number {
  return Math.min(85, Math.max(24, 24 + distance * 10));
}

export function calculateArcPath(x1: number, x2: number, arcHeight: number): string {
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);
  const midX = (startX + endX) / 2;
  const controlY = -arcHeight;
  return `M ${startX} 0 Q ${midX} ${controlY} ${endX} 0`;
}

export interface ComparisonArcProps {
  x1: number;
  x2: number;
  distance: number;
  status: 'comparing' | 'swapping';
  label?: string | null;
}

export const ComparisonArc: React.FC<ComparisonArcProps> = ({
  x1,
  x2,
  distance,
  status,
  label,
}) => {
  const arcHeight = calculateArcHeight(distance);
  const pathData = calculateArcPath(x1, x2, arcHeight);
  const isSwap = status === 'swapping';
  const color = isSwap ? '#F43F5E' : '#F59E0B';
  const midX = (x1 + x2) / 2;

  return (
    <div
      data-testid="comparison-arc"
      className="absolute top-0 left-0 w-full h-0 pointer-events-none overflow-visible z-20"
    >
      <svg className="w-full h-24 overflow-visible">
        <defs>
          <filter id={`arc-glow-${status}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          key={pathData}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={isSwap ? '6 4' : undefined}
          filter={`url(#arc-glow-${status})`}
        />
      </svg>

      {/* Floating mathematical evaluation pill at vertex of the arc */}
      <AnimatePresence>
        {label && (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 4, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.85 }}
            style={{ left: `${midX}px`, top: `-${arcHeight + 14}px` }}
            className={`absolute -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold shadow-lg border backdrop-blur-md whitespace-nowrap select-none ${
              isSwap
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-300 shadow-rose-500/20'
                : 'bg-amber-950/90 border-amber-500/50 text-amber-300 shadow-amber-500/20'
            }`}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
