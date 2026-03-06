import { getCurrentUser } from "@/lib/pocketbase-server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function TeamsLandingPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    redirect('/');
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <header className="mb-8 flex items-center gap-4">
        <Link 
            href="/"
            className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Gestión de Equipos</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Selecciona una opción para gestionar los equipos.
            </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
        {/* Card 1: Ver Equipos */}
        <Link href="/teams/view" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Ver Equipos</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Visualiza los equipos, sus miembros y accede a los chats.</p>
        </Link>
        
        {/* Card 2: Reestructurar Equipos */}
        <Link href="/teams/restructure" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Reestructurar Equipos</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Organiza a los estudiantes en equipos arrastrando y soltando.</p>
        </Link>
      </div>
    </div>
  );
}
