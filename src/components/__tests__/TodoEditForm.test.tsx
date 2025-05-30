import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoEditForm from '../TodoEditForm';
import { Todo } from '@/types/todo';

describe('TodoEditForm', () => {
  const mockTodo: Todo = {
    id: 1,
    title: 'Existing Todo',
    description: 'Existing description',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2024-12-31T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with existing todo data', () => {
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Existing Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
    
    const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement;
    expect(statusSelect.value).toBe('IN_PROGRESS');
    
    const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement;
    expect(prioritySelect.value).toBe('HIGH');
    
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
  });

  it('shows validation error when title is cleared', async () => {
    const user = userEvent.setup();
    
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);

    const submitButton = screen.getByText('Update Todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with updated data', async () => {
    const user = userEvent.setup();
    
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Todo');

    await user.selectOptions(screen.getByLabelText(/status/i), 'DONE');

    const submitButton = screen.getByText('Update Todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs).toEqual({
        title: 'Updated Todo',
        description: 'Existing description',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: '2024-12-31',
      });
    });
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables buttons when submitting', () => {
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    expect(screen.getByText('Updating...')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('handles todo without due date', () => {
    const todoWithoutDueDate = { ...mockTodo, dueDate: undefined };
    
    render(
      <TodoEditForm
        todo={todoWithoutDueDate}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
    expect(dueDateInput.value).toBe('');
  });

  it('has visible text in input fields', () => {
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionTextarea = screen.getByLabelText(/description/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const prioritySelect = screen.getByLabelText(/priority/i);
    const dueDateInput = screen.getByLabelText(/due date/i);

    expect(titleInput).toHaveClass('text-gray-900');
    expect(descriptionTextarea).toHaveClass('text-gray-900');
    expect(statusSelect).toHaveClass('text-gray-900');
    expect(prioritySelect).toHaveClass('text-gray-900');
    expect(dueDateInput).toHaveClass('text-gray-900');
  });
});