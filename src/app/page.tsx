'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TodoItem from '@/components/TodoItem';
import TodoForm from '@/components/TodoForm';
import TodoEditForm from '@/components/TodoEditForm';
import TodoStatusFilter from '@/components/TodoStatusFilter';
import { AuthGuard } from '@/components/auth';
import { Header } from '@/components/layout';
import { todoApi } from '@/lib/api';
import { Todo, CreateTodoDto, UpdateTodoDto, TodoStatus } from '@/types/todo';
import { showSuccess, showError } from '@/components/ui/toast';
import { Modal, Button } from '@/components/ui';

function TodoApp() {
  const queryClient = useQueryClient();
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus | 'ALL'>('ALL');
  const [parentIdForNewTodo, setParentIdForNewTodo] = useState<number | null>(null);

  const { data: todosResponse, isLoading, error } = useQuery({
    queryKey: ['todos', selectedStatus],
    queryFn: async () => {
      if (selectedStatus === 'ALL') {
        return todoApi.getAll();
      } else {
        const statusTodos = await todoApi.getByStatus(selectedStatus);
        return {
          content: statusTodos,
          pageable: {
            pageNumber: 0,
            pageSize: statusTodos.length,
            sort: { sorted: false },
          },
          totalElements: statusTodos.length,
          totalPages: 1,
          first: true,
          last: true,
        };
      }
    },
  });

  const todos = todosResponse?.content || [];

  const createMutation = useMutation({
    mutationFn: todoApi.create,
    onSuccess: (newTodo) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsAddingTodo(false);
      setParentIdForNewTodo(null);
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
    createMutation.mutate({ ...data, parentId: parentIdForNewTodo });
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

  const handleDeleteFromEdit = () => {
    if (editingTodo) {
      setDeletingTodo(editingTodo);
      setEditingTodo(null);
    }
  };

  const confirmDelete = () => {
    if (deletingTodo) {
      deleteMutation.mutate(deletingTodo.id);
    }
  };

  const cancelDelete = () => {
    setDeletingTodo(null);
  };

  const handleAddChild = (parentId: number) => {
    setParentIdForNewTodo(parentId);
    setIsAddingTodo(true);
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
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setParentIdForNewTodo(null);
                  setIsAddingTodo(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all"
              >
                Add New Todo
              </button>
            </div>
            <TodoStatusFilter
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
          </div>

        {todos.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg shadow">
            <p className="text-muted-foreground text-lg">No todos yet. Create your first todo!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todos.filter(todo => !todo.parentId).map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
              />
            ))}
          </div>
        )}

        {isAddingTodo && (
          <TodoForm
            onSubmit={handleCreate}
            onCancel={() => {
              setIsAddingTodo(false);
              setParentIdForNewTodo(null);
            }}
            isSubmitting={createMutation.isPending}
            parentId={parentIdForNewTodo}
          />
        )}

        {editingTodo && (
          <TodoEditForm
            todo={editingTodo}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setEditingTodo(null)}
            onDelete={handleDeleteFromEdit}
            isSubmitting={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        )}

        {deletingTodo && (
          <Modal open={true} onClose={cancelDelete}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">TODOを削除</h2>
              <p className="text-muted-foreground">
                「{deletingTodo.title}」を削除してもよろしいですか？この操作は取り消せません。
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={cancelDelete}
                  disabled={deleteMutation.isPending}
                >
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '削除中...' : '削除'}
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
