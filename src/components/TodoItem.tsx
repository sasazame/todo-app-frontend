'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Todo } from '@/types/todo';
import { todoApi } from '@/lib/api';
import { Button } from '@/components/ui';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number, todo: Todo) => void;
  onDelete: (id: number, todo: Todo) => void;
  onAddChild: (parentId: number) => void;
  level?: number;
}

export default function TodoItem({ todo, onUpdate, onDelete, onAddChild, level = 0 }: TodoItemProps) {
  const [showChildren, setShowChildren] = useState(false);
  
  const { data: children = [], isLoading } = useQuery({
    queryKey: ['todos', todo.id, 'children'],
    queryFn: () => todoApi.getChildren(todo.id),
    enabled: showChildren,
  });

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'TODO':
        return 'bg-status-pending-bg text-status-pending-text';
      case 'IN_PROGRESS':
        return 'bg-status-in-progress-bg text-status-in-progress-text';
      case 'DONE':
        return 'bg-status-completed-bg text-status-completed-text';
    }
  };

  const getPriorityColor = (priority: Todo['priority']) => {
    switch (priority) {
      case 'LOW':
        return 'bg-priority-low-bg text-priority-low-text';
      case 'MEDIUM':
        return 'bg-priority-medium-bg text-priority-medium-text';
      case 'HIGH':
        return 'bg-priority-high-bg text-priority-high-text';
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
          level > 0 ? 'ml-8 border-l-4 border-primary/20' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-card-foreground">{todo.title}</h3>
            {level === 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowChildren(!showChildren)}
              >
                {showChildren ? '折りたたむ' : '子タスクを表示'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                todo.status
              )}`}
            >
              {todo.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(todo.priority)}`}>
              {todo.priority}
            </span>
          </div>
        </div>
        
        {todo.description && (
          <p className="text-muted-foreground mb-4">{todo.description}</p>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {todo.dueDate && (
              <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
            )}
          </div>
          <div className="flex gap-2">
            {level === 0 && (
              <button
                onClick={() => onAddChild(todo.id)}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Add Subtask
              </button>
            )}
            <button
              onClick={() => onUpdate(todo.id, todo)}
              className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(todo.id, todo)}
              className="px-4 py-2 text-sm font-medium text-destructive hover:text-destructive/80 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {showChildren && !isLoading && children.length > 0 && (
        <div className="space-y-2">
          {children.map((child) => (
            <TodoItem
              key={child.id}
              todo={child}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
              level={level + 1}
            />
          ))}
        </div>
      )}
      
      {showChildren && isLoading && (
        <div className="ml-8 text-muted-foreground">Loading subtasks...</div>
      )}
    </div>
  );
}