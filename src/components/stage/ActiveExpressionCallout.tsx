import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrayElement } from './ArrayStage';

export interface ActiveExpressionProps {
  elements?: ArrayElement[];
  conditionEval?: {
    expr?: string;
    condition?: string;
    result?: any;
    formatted?: string;
  };
  action?: string;
  className?: string;
}

export function formatActiveExpression(
  elements: ArrayElement[] = [],
  conditionEval?: { expr?: string; condition?: string; result?: any; formatted?: string },
  action?: string
): string | null {
  if (conditionEval?.formatted) {
    return conditionEval.formatted;
  }

  if (conditionEval?.expr) {
    const res =
      conditionEval.result !== undefined
        ? ` ➔ ${String(conditionEval.result).toUpperCase()}`
        : '';
    return `${conditionEval.expr}${res}`;
  }

  const swapping = elements.filter((el) => el.status === 'swapping');
  if (swapping.length >= 2) {
    return `SWAP ${swapping.map((e) => e.value).join(' ⇄ ')}`;
  }

  const comparing = elements.filter((el) => el.status === 'comparing');
  if (comparing.length === 2) {
    const [a, b] = comparing;
    const outcome = a.value > b.value ? '➔ SWAP' : '➔ KEEP';
    return `${a.value} vs ${b.value} (${outcome})`;
  }

  if (action && action.toLowerCase().includes('swap')) {
    return 'SWAPPING ELEMENTS';
  }

  return null;
}

export const ActiveExpressionCallout: React.FC<ActiveExpressionProps> = ({
  elements = [],
  conditionEval,
  action,
  className = '',
}) => {
  const text = formatActiveExpression(elements, conditionEval, action);
  if (!text) return null;

  const isSwap = text.includes('SWAP');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: -8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.95 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        data-testid="active-expression-callout"
        className={`px-3 py-1 rounded-full text-xs font-mono font-bold shadow-lg backdrop-blur-md flex items-center gap-2 border select-none ${
          isSwap
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-rose-500/10'
            : 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-amber-500/10'
        } ${className}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full animate-ping ${
            isSwap ? 'bg-rose-400' : 'bg-amber-400'
          }`}
        />
        <span>{text}</span>
      </motion.div>
    </AnimatePresence>
  );
};
