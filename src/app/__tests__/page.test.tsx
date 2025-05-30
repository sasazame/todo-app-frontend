import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import { todoApi } from '@/lib/api';
import { Todo } from '@/types/todo';

jest.mock('@/lib/api');

const mockTodos: Todo[] = [
  {
    id: 1,
    title: 'Test Todo 1',
    description: 'Test description',
    status: 'TODO',
    priority: 'HIGH',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Test Todo 2',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

function renderWithQuery(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
}

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (todoApi.getAll as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    renderWithQuery(<Home />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays todos when loaded', async () => {
    (todoApi.getAll as jest.Mock).mockResolvedValue(mockTodos);
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  it('shows empty state when no todos', async () => {
    (todoApi.getAll as jest.Mock).mockResolvedValue([]);
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
    });
  });

  it('shows error state when loading fails', async () => {
    (todoApi.getAll as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading todos')).toBeInTheDocument();
    });
  });

  it('opens add todo form when button clicked', async () => {
    const user = userEvent.setup();
    (todoApi.getAll as jest.Mock).mockResolvedValue(mockTodos);
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add New Todo');
    await user.click(addButton);

    expect(screen.getByText('Create New Todo')).toBeInTheDocument();
  });

  it('creates a new todo', async () => {
    const user = userEvent.setup();
    const newTodo = { ...mockTodos[0], id: 3, title: 'New Todo' };
    
    (todoApi.getAll as jest.Mock).mockResolvedValue(mockTodos);
    (todoApi.create as jest.Mock).mockResolvedValue(newTodo);
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add New Todo');
    await user.click(addButton);

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'New Todo');

    const submitButton = screen.getByText('Create Todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(todoApi.create).toHaveBeenCalled();
    });
  });

  it('deletes a todo with confirmation', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    (todoApi.getAll as jest.Mock).mockResolvedValue(mockTodos);
    (todoApi.delete as jest.Mock).mockResolvedValue(undefined);
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
    await waitFor(() => {
      expect(todoApi.delete).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  it('cancels delete when not confirmed', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    (todoApi.getAll as jest.Mock).mockResolvedValue(mockTodos);
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(todoApi.delete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('opens edit form when Edit button clicked', async () => {
    (todoApi.getAll as jest.Mock).mockResolvedValue(mockTodos);
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Todo 1')).toBeInTheDocument();
  });
});