import { getStudentTeam } from "@/lib/data";
import { getCurrentUser } from "@/lib/pocketbase-server";
import StudentTeamInfo from "@/components/StudentTeamInfo";
import TeamChat from "@/components/TeamChat";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function MyTeamPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const studentTeam = await getStudentTeam(user.id);

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <div className="mb-8 flex items-center gap-4">
        <Link 
            href="/"
            className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-3xl font-bold">Mi Equipo</h1>
      </div>
      
      {studentTeam ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <StudentTeamInfo team={studentTeam} currentUserId={user.id} />
            </div>
            <div className="lg:col-span-1 sticky top-8">
                <TeamChat teamId={studentTeam.id} currentUser={user} />
            </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-8 flex items-start gap-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg shrink-0">
                <svg className="w-6 h-6 text-yellow-700 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
                <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-1">Sin equipo asignado</h2>
                <p className="text-yellow-700 dark:text-yellow-300">
                Aún no formas parte de ningún equipo. Tu docente debe asignarte a uno para que puedas ver a tus compañeros aquí.
                </p>
            </div>
        </div>
      )}
    </div>
  );
}
