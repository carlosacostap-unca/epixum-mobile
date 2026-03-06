"use client";

import { InquiryResponse, User } from "@/types";
import FormattedDate from "../FormattedDate";
import { deleteInquiryResponse } from "@/lib/actions-inquiries";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface InquiryResponseListProps {
  responses: InquiryResponse[];
  currentUser: User | null;
  inquiryId: string;
}

export default function InquiryResponseList({ responses, currentUser, inquiryId }: InquiryResponseListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (responseId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta respuesta?")) return;

    startTransition(async () => {
      await deleteInquiryResponse(responseId, inquiryId);
      router.refresh();
    });
  };

  if (responses.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        No hay respuestas todavía. ¡Sé el primero en responder!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => {
        const isAuthor = currentUser?.id === response.author;
        const isTeacher = currentUser?.role === "docente" || currentUser?.role === "admin";
        const canDelete = isAuthor || isTeacher;
        const isTeacherResponse = response.expand?.author?.role === "docente" || response.expand?.author?.role === "admin";

        return (
          <div 
            key={response.id} 
            className={`p-4 rounded-lg border ${
                isTeacherResponse 
                ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30" 
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {response.expand?.author?.avatar ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${response.expand.author.id}/${response.expand.author.avatar}`}
                    className="w-6 h-6 rounded-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isTeacherResponse 
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" 
                        : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                  }`}>
                    {response.expand?.author?.name?.charAt(0) || "?"}
                  </div>
                )}
                <div>
                    <span className={`text-sm font-bold ${isTeacherResponse ? "text-blue-700 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                        {response.expand?.author?.name || "Usuario"}
                    </span>
                    {isTeacherResponse && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                            Docente
                        </span>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  <FormattedDate date={response.created} />
                </span>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(response.id)}
                    disabled={isPending}
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                    title="Eliminar respuesta"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap pl-8">
              {response.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
