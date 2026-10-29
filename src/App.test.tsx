import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Full Integration Smoke Test', () => {
  it('renders StepDSA Dashboard with curriculum cards and metrics', () => {
    render(<App />);
    expect(screen.getByText(/Deterministic Time-Travel Debugger/i)).toBeInTheDocument();
    expect(screen.getByText('MODULES', { exact: true })).toBeInTheDocument();
    expect(screen.getAllByText(/Quicksort/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Personal Code Studio & Local CLI/i)).toBeInTheDocument();
  }, 20000);

  it('navigates to Workbench when clicking Launch Visualizer', () => {
    render(<App />);
    const wbBtn = screen.getByRole('button', { name: /^Workbench$/i });
    fireEvent.click(wbBtn);

    // Should now show the Workbench controls
    expect(screen.getByTitle(/Reset to Start/i)).toBeInTheDocument();
    expect(screen.getByTitle('Play (Space)')).toBeInTheDocument();
  }, 20000);

  it('opens Personal Code Studio modal when clicking CLI button', () => {
    render(<App />);
    const studioBtn = screen.getByTitle(/Personal Code Studio/i);
    fireEvent.click(studioBtn);

    expect(screen.getAllByText(/Personal Code Studio/i)[0]).toBeInTheDocument();
  }, 20000);

  it('navigates to Workbench and applies presets and custom input cleanly', () => {
    render(<App />);
    const wbBtn = screen.getByRole('button', { name: /^Workbench$/i });
    fireEvent.click(wbBtn);

    // Click 'Worst Case (Reversed)' preset
    const reversedPreset = screen.getByText('Worst Case (Reversed)');
    expect(reversedPreset).toBeInTheDocument();
    fireEvent.click(reversedPreset);

    // Timeline should update and show step 1
    expect(screen.getAllByText(/Step 1\//i)[0]).toBeInTheDocument();

    // Change size to 6
    const size6Btn = screen.getByRole('button', { name: '6' });
    fireEvent.click(size6Btn);
    expect(screen.getAllByText(/Step 1\//i)[0]).toBeInTheDocument();

    // Custom input apply
    const input = screen.getByPlaceholderText(/Custom numbers/i);
    fireEvent.change(input, { target: { value: '10, 20, 30, 40' } });
    const applyBtn = screen.getByText('Apply');
    fireEvent.click(applyBtn);
    expect(screen.getAllByText(/Step 1\//i)[0]).toBeInTheDocument();
  }, 20000);

  it('runs custom code in Personal Code Studio and mounts custom module on Workbench', async () => {
    render(<App />);
    const studioBtn = screen.getByTitle(/Personal Code Studio/i);
    fireEvent.click(studioBtn);

    // Verify modal opened with Visualize button
    const visualizeBtn = screen.getByText(/Visualize Algorithm/i);
    expect(visualizeBtn).toBeInTheDocument();

    // Click Visualize Algorithm
    fireEvent.click(visualizeBtn);

    // Modal should close and Workbench should mount the custom algorithm asynchronously
    await waitFor(() => {
      expect(screen.getByTitle(/Reset to Start/i)).toBeInTheDocument();
    }, { timeout: 8000 });
    expect(screen.getByTitle('Play (Space)')).toBeInTheDocument();
    expect(screen.getAllByText(/Step 1\//i)[0]).toBeInTheDocument();
  }, 20000);
});
