import { render, screen, fireEvent } from '@testing-library/react';
import TodoStatusFilter from '../TodoStatusFilter';

describe('TodoStatusFilter', () => {
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all status options', () => {
    render(
      <TodoStatusFilter selectedStatus="ALL" onStatusChange={mockOnStatusChange} />
    );

    expect(screen.getByText('すべて')).toBeInTheDocument();
    expect(screen.getByText('未着手')).toBeInTheDocument();
    expect(screen.getByText('進行中')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('highlights the selected status', () => {
    render(
      <TodoStatusFilter selectedStatus="TODO" onStatusChange={mockOnStatusChange} />
    );

    const todoButton = screen.getByText('未着手');
    const allButton = screen.getByText('すべて');
    
    expect(todoButton.closest('button')).toHaveClass('bg-blue-600');
    expect(allButton.closest('button')).toHaveClass('bg-gray-600');
  });

  it('calls onStatusChange when a status is clicked', () => {
    render(
      <TodoStatusFilter selectedStatus="ALL" onStatusChange={mockOnStatusChange} />
    );

    const inProgressButton = screen.getByText('進行中');
    fireEvent.click(inProgressButton);

    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledWith('IN_PROGRESS');
  });

  it('calls onStatusChange with ALL when すべて is clicked', () => {
    render(
      <TodoStatusFilter selectedStatus="TODO" onStatusChange={mockOnStatusChange} />
    );

    const allButton = screen.getByText('すべて');
    fireEvent.click(allButton);

    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledWith('ALL');
  });

  it('updates button styles when selectedStatus changes', () => {
    const { rerender } = render(
      <TodoStatusFilter selectedStatus="ALL" onStatusChange={mockOnStatusChange} />
    );

    let allButton = screen.getByText('すべて');
    expect(allButton.closest('button')).toHaveClass('bg-blue-600');

    rerender(
      <TodoStatusFilter selectedStatus="DONE" onStatusChange={mockOnStatusChange} />
    );

    const doneButton = screen.getByText('完了');
    allButton = screen.getByText('すべて');
    
    expect(doneButton.closest('button')).toHaveClass('bg-blue-600');
    expect(allButton.closest('button')).toHaveClass('bg-gray-600');
  });
});