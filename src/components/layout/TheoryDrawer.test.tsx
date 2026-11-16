import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TheoryDrawer } from './TheoryDrawer';
import { bubbleSortModule } from '../../modules/sorting/bubbleSort';

describe('TheoryDrawer variants & related', () => {
  it('renders related-module chips and navigates by id', () => {
    const onSelectModule = vi.fn();
    render(
      <TheoryDrawer
        module={bubbleSortModule}
        isOpen
        onToggle={() => {}}
        onSelectModule={onSelectModule}
      />
    );

    expect(screen.getByText('Variants & Related')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Insertion Sort/i }));
    expect(onSelectModule).toHaveBeenCalledWith('insertion-sort');
  });

  it('hides the section when no navigation callback is provided', () => {
    render(<TheoryDrawer module={bubbleSortModule} isOpen onToggle={() => {}} />);
    expect(screen.queryByText('Variants & Related')).not.toBeInTheDocument();
  });
});
