import { getCurrentUser } from "@/lib/pocketbase-server";
import { getTeams } from "@/lib/data";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function TeamsListPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    redirect('/');
  }

  const teams = await getTeams();

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
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Equipos</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Listado de equipos activos en el curso.
            </p>
        </div>
      </header>

      {teams.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No hay equipos creados</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">Utiliza la opción de reestructurar para crear nuevos equipos.</p>
            <Link href="/teams/restructure" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Ir a Reestructurar
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
                <Link 
                    key={team.id} 
                    href={`/teams/view/${team.id}`}
                    className="group block bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all p-6"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full">
                            {team.members?.length || 0} Miembros
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {team.name}
                    </h3>
                    <div className="flex -space-x-2 overflow-hidden mt-4 pl-1">
                        {(team.expand?.members || []).slice(0, 5).map((member) => (
                            <div key={member.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0" title={member.name}>
                                {member.avatar ? (
                                    <img 
                                        src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL?.replace(/\/$/, "")}/api/files/${member.collectionId}/${member.id}/${member.avatar}`} 
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-[10px] font-bold text-zinc-500">
                                        {member.name?.charAt(0).toUpperCase() || "?"}
                                    </span>
                                )}
                            </div>
                        ))}
                        {(team.members?.length || 0) > 5 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                                +{(team.members?.length || 0) - 5}
                            </div>
                        )}
                    </div>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
}
