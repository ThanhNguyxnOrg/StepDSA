import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Full Integration Smoke Test', () => {
  it('renders StepDSA Dashboard with curriculum cards and metrics', () => {
    render(<App />);
    expect(screen.getAllByText(/TIME-TRAVEL ENGINE/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Explore Hub/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Quicksort/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Personal Code Visualization Studio/i)).toBeInTheDocument();
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

  it('opens Personal Code Studio modal when clicking CLI button', () => {
    render(<App />);
    const studioBtn = screen.getByText(/Launch CLI Studio/i);
    fireEvent.click(studioBtn);

    expect(screen.getByText(/100% Local Execution Security/i)).toBeInTheDocument();
  });

  it('navigates to Workbench and applies presets and custom input cleanly', () => {
    render(<App />);
    const launchButtons = screen.getAllByText(/Launch Visualizer/i);
    fireEvent.click(launchButtons[0]);

    // Click 'Worst Case (Reversed)' preset
    const reversedPreset = screen.getByText('Worst Case (Reversed)');
    expect(reversedPreset).toBeInTheDocument();
    fireEvent.click(reversedPreset);

    // Timeline should update and show step 1
    expect(screen.getByText(/Step 1\//i)).toBeInTheDocument();

    // Change size to 6
    const size6Btn = screen.getByRole('button', { name: '6' });
    fireEvent.click(size6Btn);
    expect(screen.getByText(/Step 1\//i)).toBeInTheDocument();

    // Custom input apply
    const input = screen.getByPlaceholderText(/Custom numbers/i);
    fireEvent.change(input, { target: { value: '10, 20, 30, 40' } });
    const applyBtn = screen.getByText('Apply');
    fireEvent.click(applyBtn);
    expect(screen.getByText(/Step 1\//i)).toBeInTheDocument();
  });
});
