'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Todo, UpdateTodoDto } from '@/types/todo';
import { Modal } from '@/components/ui';
import { Input } from '@/components/ui';
import { TextArea } from '@/components/ui';
import { Button } from '@/components/ui';

interface TodoEditFormProps {
  todo: Todo;
  onSubmit: (data: UpdateTodoDto) => void;
  onCancel: () => void;
  onDelete: () => void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

export default function TodoEditForm({ todo, onSubmit, onCancel, onDelete, isSubmitting, isDeleting }: TodoEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateTodoDto>({
    defaultValues: {
      title: todo.title,
      description: todo.description,
      status: todo.status,
      priority: todo.priority,
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
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
        <h2 className="text-xl font-semibold">TODOを編集</h2>
        
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
                <option value="TODO">未着手</option>
                <option value="IN_PROGRESS">進行中</option>
                <option value="DONE">完了</option>
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
                <option value="LOW">低</option>
                <option value="MEDIUM">中</option>
                <option value="HIGH">高</option>
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

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              disabled={isSubmitting || isDeleting}
            >
              {isDeleting ? '削除中...' : '削除'}
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting || isDeleting}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? '更新中...' : '更新'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}