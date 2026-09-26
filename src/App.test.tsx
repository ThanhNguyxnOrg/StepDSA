import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Full Integration Smoke Test', () => {
  it('renders StepDSA Dashboard with curriculum cards and metrics', () => {
    render(<App />);
    expect(screen.getAllByText(/TIME-TRAVEL ENGINE/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Explore Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Core Algorithms/i)).toBeInTheDocument();
    expect(screen.getByText(/Quicksort \(Lomuto Partition\)/i)).toBeInTheDocument();
  });

  it('navigates to Workbench when clicking Launch Visualizer', () => {
    render(<App />);
    const launchButtons = screen.getAllByText(/Launch Visualizer/i);
    expect(launchButtons.length).toBeGreaterThan(0);
    fireEvent.click(launchButtons[0]);

    // Should now show the Workbench controls
    expect(screen.getByTitle(/Reset to Start/i)).toBeInTheDocument();
    expect(screen.getByTitle('Play (Space)')).toBeInTheDocument();
  });
});
