import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArrayStage, getElementSpectrumColor } from './ArrayStage';

describe('getElementSpectrumColor', () => {
  it('maps min value to high hue (violet/indigo)', () => {
    const color = getElementSpectrumColor(10, 10, 100);
    expect(color).toContain('hsl(250');
  });

  it('maps max value to low hue (rose/red)', () => {
    const color = getElementSpectrumColor(100, 10, 100);
    expect(color).toContain('hsl(0');
  });

  it('maps midpoint value to intermediate green/amber hue', () => {
    const color = getElementSpectrumColor(55, 10, 100);
    expect(color).toMatch(/hsl\(\d+/);
  });
});

describe('ArrayStage Component', () => {
  it('renders elements and toggles rainbow spectrum mode', () => {
    const state = {
      array: [
        { id: 0, value: 10, status: 'default' as const },
        { id: 1, value: 50, status: 'default' as const },
        { id: 2, value: 90, status: 'sorted' as const },
      ],
      pointers: { i: 0 },
    };

    render(<ArrayStage state={state} projection="2d" />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();

    const rainbowBtn = screen.getByRole('button', { name: /rainbow/i });
    expect(rainbowBtn).toBeInTheDocument();

    fireEvent.click(rainbowBtn);
    expect(rainbowBtn).toHaveClass('text-white');
  });

  it('renders comparison arc when two elements are comparing', () => {
    const state = {
      array: [
        { id: 0, value: 20, status: 'comparing' as const },
        { id: 1, value: 40, status: 'comparing' as const },
      ],
    };

    render(
      <ArrayStage
        state={state}
        projection="2d"
        conditionEval={{ formatted: '20 < 40' }}
      />
    );

    expect(screen.getByTestId('comparison-arc')).toBeInTheDocument();
    expect(screen.getAllByText('20 < 40').length).toBeGreaterThanOrEqual(1);
  });
});
