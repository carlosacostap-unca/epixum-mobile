"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StudentItem } from './StudentItem';
import { User } from '@/types';
import { deleteTeam, updateTeamName } from '@/lib/actions-teams';

interface TeamColumnProps {
  id: string;
  name: string;
  members: string[]; // List of Student IDs
  students: Record<string, User>;
  isUnassigned?: boolean;
}

export function TeamColumn({ id, name, members, students, isUnassigned }: TeamColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState(name);

  const handleNameSubmit = async () => {
    if (tempName.trim() && tempName !== name) {
        const formData = new FormData();
        formData.append('name', tempName);
        await updateTeamName(id, tempName); // Direct string call if action updated, or FormData
        // Actually my action expects (id, name: string) based on implementation
    }
    setIsEditingName(false);
  };

  return (
    <div className={`p-4 rounded-xl flex flex-col h-full min-h-[300px] transition-colors ${
      isUnassigned 
        ? "bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700" 
        : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600"
    }`}>
      <div className="flex items-center justify-between mb-4">
        {isEditingName ? (
            <input 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                autoFocus
                className="font-bold text-lg bg-transparent border-b border-blue-500 outline-none w-full mr-2"
            />
        ) : (
            <h3 
                className={`font-bold flex-1 truncate cursor-pointer ${isUnassigned ? "text-zinc-500" : "text-lg hover:text-blue-600"}`}
                onClick={() => !isUnassigned && setIsEditingName(true)}
                title={!isUnassigned ? "Click para editar nombre" : undefined}
            >
            {name} <span className="text-xs font-normal ml-2 text-zinc-400">({members.length})</span>
            </h3>
        )}
        
        {!isUnassigned && (
          <button 
            onClick={() => {
                if(confirm('¿Seguro que quieres eliminar este equipo?')) {
                    deleteTeam(id);
                }
            }}
            className="text-zinc-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2"
            title="Eliminar equipo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}
      </div>
      
      <div ref={setNodeRef} className="flex-1 space-y-2">
        <SortableContext items={members} strategy={verticalListSortingStrategy}>
          {members.map((memberId) => {
            const student = students[memberId];
            // If student not found (data inconsistency), skip
            if (!student) return null;
            return <StudentItem key={memberId} student={student} />;
          })}
        </SortableContext>
        
        {members.length === 0 && (
            <div className="h-full min-h-[100px] flex items-center justify-center text-zinc-400 text-sm italic border-2 border-dashed border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 rounded-lg transition-colors">
                Arrastra estudiantes aquí
            </div>
        )}
      </div>
    </div>
  );
}
