import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepperControls } from './StepperControls';
import { PlaybackController, ExecutionFrame } from '../../core/types';

describe('StepperControls Milestone Bookmarks', () => {
  const mockController: PlaybackController = {
    currentStep: 0,
    totalSteps: 10,
    currentFrame: null,
    isPlaying: false,
    speed: 1,
    play: vi.fn(),
    pause: vi.fn(),
    stepForward: vi.fn(),
    stepBackward: vi.fn(),
    seekTo: vi.fn(),
    setSpeed: vi.fn(),
    reset: vi.fn(),
  };

  const timelineWithMilestones: ExecutionFrame[] = [
    { stepIndex: 0, totalSteps: 10, codeLine: 1, explanation: 'Start', isMilestone: true, milestoneTitle: 'Initialization', state: {} },
    { stepIndex: 1, totalSteps: 10, codeLine: 2, explanation: 'Step 1', state: {} },
    { stepIndex: 2, totalSteps: 10, codeLine: 3, explanation: 'Step 2', state: {} },
    { stepIndex: 3, totalSteps: 10, codeLine: 4, explanation: 'Step 3', isMilestone: true, milestoneTitle: 'Partition 1', state: {} },
    { stepIndex: 4, totalSteps: 10, codeLine: 5, explanation: 'Step 4', state: {} },
  ];

  it('renders milestone bookmark pins when milestones are present in timeline', () => {
    render(
      <StepperControls
        controller={mockController}
        currentFrame={timelineWithMilestones[0]}
        timeline={timelineWithMilestones}
      />
    );

    const milestonePins = screen.getAllByRole('button', { name: /Jump to Milestone:/i });
    expect(milestonePins.length).toBe(2);

    fireEvent.click(milestonePins[1]);
    expect(mockController.seekTo).toHaveBeenCalledWith(3);
  });

  it('renders auto-pacing toggle and fires toggleAutoPacing on click', () => {
    const toggleAutoPacing = vi.fn();
    const controllerWithAutoPace = {
      ...mockController,
      isAutoPacing: true,
      toggleAutoPacing,
    };

    render(
      <StepperControls
        controller={controllerWithAutoPace}
        currentFrame={timelineWithMilestones[0]}
        timeline={timelineWithMilestones}
      />
    );

    const autoPaceBtn = screen.getByRole('button', { name: /auto-pace/i });
    expect(autoPaceBtn).toBeInTheDocument();
    expect(autoPaceBtn).toHaveClass('text-amber-300');

    fireEvent.click(autoPaceBtn);
    expect(toggleAutoPacing).toHaveBeenCalledTimes(1);
  });
});
