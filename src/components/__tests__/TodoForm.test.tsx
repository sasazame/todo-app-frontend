import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoForm from '../TodoForm';

describe('TodoForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('shows validation error when title is empty', async () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Create Todo');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/title/i), 'New Todo');
    await user.type(screen.getByLabelText(/description/i), 'Todo description');
    await user.selectOptions(screen.getByLabelText(/status/i), 'IN_PROGRESS');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'HIGH');

    const submitButton = screen.getByText('Create Todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs).toMatchObject({
        title: 'New Todo',
        description: 'Todo description',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      });
    });
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <TodoForm
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
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    expect(screen.getByText('Creating...')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('has correct default values', () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/status/i)).toHaveValue('TODO');
    expect(screen.getByLabelText(/priority/i)).toHaveValue('MEDIUM');
  });
});