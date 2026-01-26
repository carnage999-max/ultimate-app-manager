import React from 'react';
import { cn } from '@/lib/utils';

type StatusChipProps = {
  status: string;
  count?: number;
  className?: string;
  transform?: 'upper' | 'capitalize' | 'none';
};

// Map common statuses to a consistent visual style
function stylesFor(statusRaw: string) {
  const s = (statusRaw || '').toUpperCase();
  if (s === 'ACTIVE' || s === 'RESOLVED') return 'bg-green-100 text-green-700 border-green-200';
  if (s === 'OPEN') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (s === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s === 'CLOSED' || s === 'INACTIVE' || s === 'ENDED' || s === 'EXPIRED') return 'bg-gray-100 text-gray-700 border-gray-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

export function StatusChip({ status, count, className, transform = 'upper' }: StatusChipProps) {
  const label = (status || '').replaceAll('_', ' ');
  const display = transform === 'upper' ? label.toUpperCase() : transform === 'capitalize' ? (label.slice(0,1).toUpperCase() + label.slice(1).toLowerCase()) : label;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
        stylesFor(status),
        className,
      )}
    >
      {display}{typeof count === 'number' ? ` ${count}` : ''}
    </span>
  );
}

