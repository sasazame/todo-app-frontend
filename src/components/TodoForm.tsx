'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { CreateTodoDto } from '@/types/todo';
import { Modal } from '@/components/ui';
import { Input } from '@/components/ui';
import { TextArea } from '@/components/ui';
import { Button } from '@/components/ui';

interface TodoFormProps {
  onSubmit: (data: CreateTodoDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  parentId?: number | null;
}

export default function TodoForm({ onSubmit, onCancel, isSubmitting, parentId }: TodoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTodoDto>({
    defaultValues: {
      status: 'TODO',
      priority: 'MEDIUM',
      parentId: parentId || undefined,
    },
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return (
    <Modal open={true} onClose={onCancel}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{parentId ? 'Create Subtask' : 'Create New Todo'}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register('title', { required: 'Title is required' })}
              type="text"
              id="title"
              label="Title *"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <TextArea
              {...register('description')}
              id="description"
              rows={3}
              label="Description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                {...register('status')}
                id="status"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium mb-1">
                Priority
              </label>
              <select
                {...register('priority')}
                id="priority"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div>
            <Input
              {...register('dueDate')}
              type="date"
              id="dueDate"
              label="Due Date"
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Todo'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}