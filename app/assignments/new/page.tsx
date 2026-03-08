import AssignmentFormWrapper from "./AssignmentFormWrapper";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewAssignmentPage() {
  const user = await getCurrentUser();
  const isTeacher = user && (user.role === 'docente' || user.role === 'admin');

  if (!isTeacher) {
    redirect("/assignments");
  }

  return (
    <div className="container mx-auto p-8 min-h-screen max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/assignments"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver a Trabajos Prácticos
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Crear Nuevo Trabajo Práctico</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Completa el formulario para asignar un nuevo trabajo práctico a los estudiantes.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <AssignmentFormWrapper />
      </div>
    </div>
  );
}
