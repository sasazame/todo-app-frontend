'use client';

import { Todo } from '@/types/todo';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: number, todo: Todo) => void;
  onDelete: (id: number, todo: Todo) => void;
}

export default function TodoList({ todos, onUpdate, onDelete }: TodoListProps) {
  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
    }
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'LOW':
        return 'text-gray-500';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'HIGH':
        return 'text-red-600';
    }
  };

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{todo.title}</h3>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  todo.status
                )}`}
              >
                {todo.status.replace('_', ' ')}
              </span>
              <span className={`text-sm font-medium ${getPriorityColor(todo.priority)}`}>
                {todo.priority}
              </span>
            </div>
          </div>
          
          {todo.description && (
            <p className="text-gray-600 mb-4">{todo.description}</p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {todo.dueDate && (
                <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate(todo.id, todo)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(todo.id, todo)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}