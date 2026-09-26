import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Full Integration Smoke Test', () => {
  it('renders StepDSA branding and default algorithm title', () => {
    render(<App />);
    expect(screen.getByText(/TIME-TRAVEL ENGINE/i)).toBeInTheDocument();
    expect(screen.getAllByText('Quicksort (Lomuto Partition)')[0]).toBeInTheDocument();
    expect(screen.getByTitle(/Reset to Start/i)).toBeInTheDocument();
    expect(screen.getByTitle('Play (Space)')).toBeInTheDocument();
  });
});
