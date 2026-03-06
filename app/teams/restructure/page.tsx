import { getCurrentUser } from "@/lib/pocketbase-server";
import { getTeams, getStudents } from "@/lib/data";
import TeamsBoard from "@/components/teams/TeamsBoard";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function TeamsRestructurePage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    redirect('/');
  }

  const teams = await getTeams();
  const allStudents = await getStudents();

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <header className="mb-8 flex items-center gap-4">
        <Link 
            href="/teams"
            className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Reestructurar Equipos</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Organiza a los estudiantes en equipos arrastrando y soltando.
            </p>
        </div>
      </header>
      <TeamsBoard initialTeams={teams} allStudents={allStudents} />
    </div>
  );
}
