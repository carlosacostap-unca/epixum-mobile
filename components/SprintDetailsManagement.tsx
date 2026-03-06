"use client";

import { useState } from "react";
import { Class, Assignment, User } from "@/types";
import Link from "next/link";
import FormattedDate from "@/components/FormattedDate";
import { deleteClass, deleteAssignment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import ClassForm from "./ClassForm";
import AssignmentForm from "./AssignmentForm";

interface SprintDetailsManagementProps {
  user: User;
  sprintId: string;
  classes: Class[];
  assignments: Assignment[];
}

export default function SprintDetailsManagement({ user, sprintId, classes, assignments }: SprintDetailsManagementProps) {
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  
  const router = useRouter();
  const isAuthorized = user.role === "docente" || user.role === "admin";

  if (!isAuthorized) return null; // Should not happen if used correctly, but safety check

  const handleDeleteClass = async (classId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta clase?")) {
      await deleteClass(classId, sprintId);
      router.refresh();
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este trabajo práctico?")) {
      await deleteAssignment(assignmentId, sprintId);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Classes Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clases del Sprint</h2>
        <button
          onClick={() => setIsCreatingClass(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Clase
        </button>
      </div>

      {classes.length === 0 ? (
        <p className="text-zinc-500 mb-8">No hay clases en este sprint todavía.</p>
      ) : (
        <div className="space-y-4 mb-12">
          {classes.map((clase, index) => (
            <div 
              key={clase.id}
              className="relative group flex items-center p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <Link href={`/classes/${clase.id}`} className="flex-grow flex items-center">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900 dark:group-hover:text-blue-200 transition-colors">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {clase.title}
                  </h3>
                  {clase.date && (
                    <p className="text-xs text-zinc-400 mb-1">
                      <FormattedDate date={clase.date} showTime={true} />
                    </p>
                  )}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {clase.description}
                  </p>
                </div>
              </Link>
              
              <div className="flex gap-2 ml-4">
                 <button 
                   onClick={() => setEditingClass(clase)}
                   className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"
                   title="Editar"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                 </button>
                 <button 
                   onClick={() => handleDeleteClass(clase.id)}
                   className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                   title="Eliminar"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignments Section */}
      <div className="flex items-center justify-between mb-6 mt-12 border-t pt-8 border-zinc-100 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span className="p-1 bg-purple-100 dark:bg-purple-900 rounded-md">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </span>
            Trabajos Prácticos
        </h2>
        <button
          onClick={() => setIsCreatingAssignment(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium shadow-sm flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo TP
        </button>
      </div>

      {assignments.length > 0 ? (
        <div className="grid gap-4">
            {assignments.map((tp, index) => (
                <div 
                    key={tp.id} 
                    className="group relative flex items-center p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-md"
                >
                    <Link href={`/assignments/${tp.id}`} className="flex-grow flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold mr-4">
                            {index + 1}
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-lg font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {tp.title}
                            </h3>
                            <div 
                                className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 prose prose-sm dark:prose-invert max-w-none [&>p]:my-0 [&>ul]:my-0 [&>ol]:my-0"
                                dangerouslySetInnerHTML={{ __html: tp.description }}
                            />
                        </div>
                    </Link>

                    <div className="flex gap-2 ml-4">
                        <button 
                            onClick={() => setEditingAssignment(tp)}
                            className="p-2 text-zinc-400 hover:text-purple-600 transition-colors"
                            title="Editar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => handleDeleteAssignment(tp.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <p className="text-zinc-500 italic">No hay trabajos prácticos en este sprint.</p>
      )}

      {/* Modals */}
      {isCreatingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <ClassForm sprintId={sprintId} onClose={() => setIsCreatingClass(false)} />
        </div>
      )}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <ClassForm sprintId={sprintId} clase={editingClass} onClose={() => setEditingClass(null)} />
        </div>
      )}

      {isCreatingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <AssignmentForm sprintId={sprintId} onClose={() => setIsCreatingAssignment(false)} />
        </div>
      )}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <AssignmentForm sprintId={sprintId} assignment={editingAssignment} onClose={() => setEditingAssignment(null)} />
        </div>
      )}

    </div>
  );
}
