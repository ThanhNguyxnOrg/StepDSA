import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OperationalMetricsBar } from './OperationalMetricsBar';

describe('OperationalMetricsBar', () => {
  it('renders all metrics counters correctly', () => {
    render(
      <OperationalMetricsBar
        metrics={{ comparisons: 15, swaps: 4, accesses: 30, lookups: 2 }}
        complexity="O(N log N)"
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('O(N log N)')).toBeInTheDocument();
  });

  it('hides lookups badge when lookups is 0', () => {
    render(
      <OperationalMetricsBar
        metrics={{ comparisons: 5, swaps: 2, accesses: 10, lookups: 0 }}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('Lookups:')).not.toBeInTheDocument();
  });
});
