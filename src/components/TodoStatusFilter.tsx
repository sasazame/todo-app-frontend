'use client';

import { TodoStatus } from '@/types/todo';
import { Button } from '@/components/ui';

interface TodoStatusFilterProps {
  selectedStatus: TodoStatus | 'ALL';
  onStatusChange: (status: TodoStatus | 'ALL') => void;
}

const statusOptions: { value: TodoStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'すべて' },
  { value: 'TODO', label: '未着手' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'DONE', label: '完了' },
];

export default function TodoStatusFilter({ selectedStatus, onStatusChange }: TodoStatusFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedStatus === option.value ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onStatusChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}