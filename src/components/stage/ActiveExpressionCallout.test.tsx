import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatActiveExpression, ActiveExpressionCallout } from './ActiveExpressionCallout';
import { ArrayElement } from './ArrayStage';

describe('formatActiveExpression', () => {
  it('formats conditionEval if present with formatted or expr', () => {
    const expr1 = formatActiveExpression([], { formatted: '64 > 34 ➔ SWAP' });
    expect(expr1).toBe('64 > 34 ➔ SWAP');

    const expr2 = formatActiveExpression([], { expr: 'arr[i] > arr[j]', result: true });
    expect(expr2).toContain('arr[i] > arr[j]');
    expect(expr2).toContain('TRUE');
  });

  it('synthesizes comparison when two elements have status comparing', () => {
    const elements: ArrayElement[] = [
      { id: 0, value: 12, status: 'comparing' },
      { id: 1, value: 45, status: 'comparing' },
    ];
    const expr = formatActiveExpression(elements);
    expect(expr).toContain('12 vs 45');
    expect(expr).toContain('KEEP');
  });

  it('synthesizes swap when elements have status swapping', () => {
    const elements: ArrayElement[] = [
      { id: 0, value: 45, status: 'swapping' },
      { id: 1, value: 12, status: 'swapping' },
    ];
    const expr = formatActiveExpression(elements);
    expect(expr).toContain('SWAP 45 ⇄ 12');
  });

  it('returns null when no active elements or conditions', () => {
    const elements: ArrayElement[] = [
      { id: 0, value: 10, status: 'default' },
      { id: 1, value: 20, status: 'default' },
    ];
    const expr = formatActiveExpression(elements);
    expect(expr).toBeNull();
  });
});

describe('ActiveExpressionCallout Component', () => {
  it('renders floating callout when expression is active', () => {
    const elements: ArrayElement[] = [
      { id: 0, value: 64, status: 'comparing' },
      { id: 1, value: 34, status: 'comparing' },
    ];
    render(<ActiveExpressionCallout elements={elements} />);
    expect(screen.getByText(/64 vs 34/)).toBeInTheDocument();
  });

  it('renders nothing when there is no active expression', () => {
    const { container } = render(<ActiveExpressionCallout elements={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
