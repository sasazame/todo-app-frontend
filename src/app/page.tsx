'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TodoList from '@/components/TodoList';
import TodoForm from '@/components/TodoForm';
import TodoEditForm from '@/components/TodoEditForm';
import { AuthGuard } from '@/components/auth';
import { Header } from '@/components/layout';
import { todoApi } from '@/lib/api';
import { Todo, CreateTodoDto, UpdateTodoDto } from '@/types/todo';
import { showSuccess, showError } from '@/components/ui/toast';
import { Modal, Button } from '@/components/ui';

function TodoApp() {
  const queryClient = useQueryClient();
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);

  const { data: todos = [], isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: todoApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: todoApi.create,
    onSuccess: (newTodo) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsAddingTodo(false);
      showSuccess(`Todo "${newTodo.title}" created successfully!`);
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : 'Failed to create todo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTodoDto }) => 
      todoApi.update(id, data),
    onSuccess: (updatedTodo) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setEditingTodo(null);
      showSuccess(`Todo "${updatedTodo.title}" updated successfully!`);
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : 'Failed to update todo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: todoApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      const todoTitle = deletingTodo?.title || 'Todo';
      setDeletingTodo(null);
      showSuccess(`"${todoTitle}" deleted successfully!`);
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : 'Failed to delete todo');
    },
  });

  const handleCreate = (data: CreateTodoDto) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (id: number, todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleUpdateSubmit = (data: UpdateTodoDto) => {
    if (editingTodo) {
      updateMutation.mutate({ id: editingTodo.id, data });
    }
  };

  const handleDelete = (id: number, todo: Todo) => {
    setDeletingTodo(todo);
  };

  const confirmDelete = () => {
    if (deletingTodo) {
      deleteMutation.mutate(deletingTodo.id);
    }
  };

  const cancelDelete = () => {
    setDeletingTodo(null);
  };

  // Handle Escape key for delete modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deletingTodo) {
        cancelDelete();
      }
    };

    if (deletingTodo) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [deletingTodo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-destructive">Error loading todos</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="mb-6">
          <button
            onClick={() => setIsAddingTodo(true)}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Add New Todo
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg shadow">
            <p className="text-muted-foreground text-lg">No todos yet. Create your first todo!</p>
          </div>
        ) : (
          <TodoList todos={todos} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}

        {isAddingTodo && (
          <TodoForm
            onSubmit={handleCreate}
            onCancel={() => setIsAddingTodo(false)}
            isSubmitting={createMutation.isPending}
          />
        )}

        {editingTodo && (
          <TodoEditForm
            todo={editingTodo}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setEditingTodo(null)}
            isSubmitting={updateMutation.isPending}
          />
        )}

        {deletingTodo && (
          <Modal open={true} onClose={cancelDelete}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Delete Todo</h2>
              <p className="text-muted-foreground">
                Are you sure you want to delete &quot;{deletingTodo.title}&quot;? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={cancelDelete}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
        </main>
      </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <TodoApp />
    </AuthGuard>
  );
}
