'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TodoList from '@/components/TodoList';
import TodoForm from '@/components/TodoForm';
import TodoEditForm from '@/components/TodoEditForm';
import { todoApi } from '@/lib/api';
import { Todo, CreateTodoDto, UpdateTodoDto } from '@/types/todo';

export default function Home() {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsAddingTodo(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTodoDto }) => 
      todoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setEditingTodo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: todoApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setDeletingTodo(null);
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
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error loading todos</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TODO App</h1>
          <p className="text-gray-600">Manage your tasks efficiently</p>
        </header>

        <div className="mb-6">
          <button
            onClick={() => setIsAddingTodo(true)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add New Todo
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No todos yet. Create your first todo!</p>
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Todo</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{deletingTodo.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
