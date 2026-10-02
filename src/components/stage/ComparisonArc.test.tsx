import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparisonArc, calculateArcHeight, calculateArcPath } from './ComparisonArc';

describe('calculateArcHeight', () => {
  it('scales height with distance and enforces ceiling', () => {
    const h1 = calculateArcHeight(1);
    const h5 = calculateArcHeight(5);
    const h20 = calculateArcHeight(20);

    expect(h5).toBeGreaterThan(h1);
    expect(h20).toBeLessThanOrEqual(85);
    expect(h1).toBeGreaterThanOrEqual(24);
  });
});

describe('calculateArcPath', () => {
  it('generates a valid quadratic Bézier path connecting two points', () => {
    const path = calculateArcPath(50, 200, 40);
    expect(path).toContain('M 50');
    expect(path).toContain('Q 125');
    expect(path).toContain('200');
  });

  it('orders coordinates correctly when x1 > x2', () => {
    const path = calculateArcPath(200, 50, 40);
    expect(path).toContain('M 50');
    expect(path).toContain('Q 125');
    expect(path).toContain('200');
  });

  it('renders ComparisonArc component', () => {
    render(<ComparisonArc x1={50} x2={200} distance={2} status="comparing" label="20 < 40" />);
    expect(screen.getByTestId('comparison-arc')).toBeInTheDocument();
  });
});
