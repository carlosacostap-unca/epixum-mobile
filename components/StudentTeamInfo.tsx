"use client";

import { Team } from "@/types";

interface StudentTeamInfoProps {
  team: Team;
  currentUserId: string;
}

export default function StudentTeamInfo({ team, currentUserId }: StudentTeamInfoProps) {
  const members = team.expand?.members || [];
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL?.replace(/\/$/, "") || "";

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
        <span className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </span>
        Mi Equipo: {team.name}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {members.map((member) => {
          const isMe = member.id === currentUserId;
          const avatarUrl = member.avatar 
            ? `${pbUrl}/api/files/${member.collectionId}/${member.id}/${member.avatar}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;

          return (
            <div 
              key={member.id} 
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isMe 
                  ? "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800" 
                  : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-700"
              }`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200 shrink-0">
                <img src={avatarUrl} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className={`font-medium truncate ${isMe ? "text-purple-700 dark:text-purple-300" : "text-zinc-700 dark:text-zinc-300"}`}>
                  {member.name} {isMe && "(Tú)"}
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
  );
}
