import { getTeam } from "@/lib/data";
import { getCurrentUser } from "@/lib/pocketbase-server";
import TeamChat from "@/components/TeamChat";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function TeamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== "docente" && user.role !== "admin")) {
    redirect("/");
  }

  const team = await getTeam(id);

  if (!team) {
    notFound();
  }

  const members = team.expand?.members || [];
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL?.replace(/\/$/, "") || "";

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <div className="mb-8 flex items-center gap-4">
        <Link 
            href="/teams/view"
            className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-3xl font-bold">Detalles del Equipo: {team.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            {/* Members List */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
                    <span className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </span>
                    Miembros ({members.length})
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {members.map((member) => {
                    const avatarUrl = member.avatar 
                        ? `${pbUrl}/api/files/${member.collectionId}/${member.id}/${member.avatar}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;

                    return (
                        <div 
                        key={member.id} 
                        className="flex items-center gap-3 p-3 rounded-lg border transition-colors bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-700"
                        >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200 shrink-0">
                            <img src={avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium truncate text-zinc-700 dark:text-zinc-300">
                            {member.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {member.email}
                            </p>
                        </div>
                        </div>
                    );
                    })}
                </div>
            </div>
        </div>

        <div className="lg:col-span-1 sticky top-8">
            <TeamChat teamId={team.id} currentUser={user} />
        </div>
      </div>
    </div>
  );
}
