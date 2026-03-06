import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User } from '@/types';

interface StudentItemProps {
  student: User;
}

export function StudentItem({ student }: StudentItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student.id, data: { type: 'student', student } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL?.replace(/\/$/, "") || "";
  const avatarUrl = student.avatar 
    ? `${pbUrl}/api/files/${student.collectionId}/${student.id}/${student.avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center gap-3 cursor-grab active:cursor-grabbing mb-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors ${isDragging ? 'z-50 ring-2 ring-blue-500' : ''}`}
    >
      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 shrink-0">
        <img src={avatarUrl} alt={student.name} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{student.name}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{student.email}</p>
      </div>
    </div>
  );
}
