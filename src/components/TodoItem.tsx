'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Todo, UpdateTodoDto } from '@/types/todo';
import { todoApi } from '@/lib/api';
import { Button } from '@/components/ui';
import { Check, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
import { showSuccess } from '@/components/ui/toast';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number, todo: Todo) => void;
  onDelete: (id: number, todo: Todo) => void;
  onAddChild: (parentId: number) => void;
  level?: number;
}

export default function TodoItem({ todo, onUpdate, onDelete, onAddChild, level = 0 }: TodoItemProps) {
  const t = useTranslations();
  const [showChildren, setShowChildren] = useState(false);
  const [isHoveringCheckbox, setIsHoveringCheckbox] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: children = [], isLoading } = useQuery({
    queryKey: ['todos', todo.id, 'children'],
    queryFn: () => todoApi.getChildren(todo.id),
    enabled: showChildren,
  });

  // Mutation for quick status toggle
  const toggleStatusMutation = useMutation({
    mutationFn: (newStatus: Todo['status']) => {
      const updateData: UpdateTodoDto = {
        status: newStatus,
      };
      return todoApi.update(todo.id, updateData);
    },
    onSuccess: (updatedTodo) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      showSuccess(updatedTodo.status === 'DONE' ? t('todo.todoCompleted') : t('todo.todoUpdated'));
    },
  });

  const handleToggleComplete = () => {
    const newStatus = todo.status === 'DONE' ? 'TODO' : 'DONE';
    toggleStatusMutation.mutate(newStatus);
  };

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
        className={`bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
          level > 0 ? 'ml-8 border-l-4 border-primary/30' : ''
        }`}
      >
        <div className="flex items-start p-4 gap-3">
          {/* Checkbox for completion */}
          <button
            onClick={handleToggleComplete}
            onMouseEnter={() => setIsHoveringCheckbox(true)}
            onMouseLeave={() => setIsHoveringCheckbox(false)}
            disabled={toggleStatusMutation.isPending}
            className={`
              mt-1 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
              ${todo.status === 'DONE' 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground/50 hover:border-primary'
              }
              ${toggleStatusMutation.isPending ? 'opacity-50' : ''}
            `}
            aria-label={todo.status === 'DONE' ? t('todo.markIncomplete') : t('todo.markComplete')}
          >
            {(todo.status === 'DONE' || isHoveringCheckbox) && (
              <Check className="w-3 h-3" strokeWidth={3} />
            )}
          </button>

          {/* Main content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {children.length > 0 && level === 0 && (
                  <button
                    onClick={() => setShowChildren(!showChildren)}
                    className="p-1 hover:bg-accent rounded transition-colors"
                    aria-label={showChildren ? t('todo.hideSubtasks') : t('todo.showSubtasks')}
                  >
                    {showChildren ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
                <h3 className={`text-lg font-semibold ${todo.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>
                  {todo.title}
                </h3>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    todo.status
                  )}`}
                >
                  {t(`todo.statusOptions.${todo.status}`)}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(todo.priority)}`}>
                  {t(`todo.priorityOptions.${todo.priority}`)}
                </span>
              </div>
            </div>
            
            {todo.description && (
              <p className={`text-muted-foreground mb-3 ${todo.status === 'DONE' ? 'line-through' : ''}`}>
                {todo.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {todo.dueDate && (
                  <span>{t('todo.dueDateLabel')} {new Date(todo.dueDate).toLocaleDateString()}</span>
                )}
                {level === 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddChild(todo.id)}
                    className="text-xs"
                  >
                    {t('todo.addSubtask')}
                  </Button>
                )}
              </div>
              
              {/* Edit button in bottom right */}
              <Button
                size="sm"
                variant="primary"
                onClick={() => onUpdate(todo.id, todo)}
                leftIcon={<Edit2 className="w-3 h-3" />}
              >
                {t('common.edit')}
              </Button>
            </div>
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
        <div className="ml-8 text-muted-foreground">{t('todo.loadingSubtasks')}</div>
      )}
    </div>
  );
}