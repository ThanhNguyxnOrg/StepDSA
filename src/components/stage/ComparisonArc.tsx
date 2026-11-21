import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function calculateArcHeight(distance: number): number {
  return Math.min(44, Math.max(22, 18 + distance * 5));
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
  const color = isSwap ? 'var(--sem-swapping-solid, #F43F5E)' : 'var(--sem-comparing-solid, #F59E0B)';
  const midX = (x1 + x2) / 2;
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);

  return (
    <div
      data-testid="comparison-arc"
      className="absolute top-[52px] left-0 w-full h-0 pointer-events-none overflow-visible z-20"
    >
      <svg className="w-full h-16 overflow-visible">
        <defs>
          <filter id={`arc-glow-${status}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {isSwap && (
            <marker
              id="arc-swap-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" style={{ fill: color }} />
            </marker>
          )}
        </defs>
        <motion.path
          key={pathData}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          d={pathData}
          fill="none"
          style={{ stroke: color }}
          strokeWidth="2.5"
          strokeDasharray={isSwap ? '5 3' : undefined}
          markerStart={isSwap ? 'url(#arc-swap-arrow)' : undefined}
          markerEnd={isSwap ? 'url(#arc-swap-arrow)' : undefined}
          filter={`url(#arc-glow-${status})`}
        />
        {/* Endpoint Anchor Dots */}
        {!isSwap && (
          <>
            <circle cx={startX} cy={0} r={4} style={{ fill: color }} />
            <circle cx={endX} cy={0} r={4} style={{ fill: color }} />
          </>
        )}
      </svg>

      {/* Compact evaluation badge anchored safely at vertex of the arc */}
      <AnimatePresence>
        {label && (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -2, scale: 0.9 }}
            style={{
              left: `${midX}px`,
              top: `-${Math.round(arcHeight * 0.55) + 14}px`,
              backgroundColor: 'var(--theme-surface, #111827)',
              borderColor: isSwap ? 'var(--sem-swapping-border, #F43F5E)' : 'var(--sem-comparing-border, #F59E0B)',
              color: isSwap ? 'var(--sem-swapping-text, #FECDD3)' : 'var(--sem-comparing-text, #FDE68A)',
            }}
            className="absolute -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-md border-2 whitespace-nowrap select-none"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
