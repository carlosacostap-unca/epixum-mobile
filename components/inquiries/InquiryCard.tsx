"use client";

import { Inquiry, User } from "@/types";
import Link from "next/link";
import FormattedDate from "../FormattedDate";

interface InquiryCardProps {
  inquiry: Inquiry;
  currentUser: User | null;
}

export default function InquiryCard({ inquiry, currentUser }: InquiryCardProps) {
  const isAuthor = currentUser?.id === inquiry.author;
  const isTeacher = currentUser?.role === "docente" || currentUser?.role === "admin";
  const isResolved = inquiry.status === "Resuelta";

  return (
    <Link
      href={`/inquiries/${inquiry.id}`}
      className={`block p-6 rounded-lg border transition-all hover:shadow-md ${
        isResolved
          ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          : "bg-white dark:bg-zinc-800 border-blue-200 dark:border-blue-900/30 shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-bold rounded-full ${
              isResolved
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {isResolved ? "Resuelta" : "Pendiente"}
          </span>
          {(inquiry.expand?.class || inquiry.expand?.assignment) && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              En: 
              {inquiry.expand?.class && <span className="font-medium truncate max-w-[150px]">{inquiry.expand.class.title}</span>}
              {inquiry.expand?.assignment && <span className="font-medium truncate max-w-[150px]">{inquiry.expand.assignment.title}</span>}
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-400">
          <FormattedDate date={inquiry.created} />
        </span>
      </div>

      <h3 className={`text-lg font-bold mb-2 ${isResolved ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
        {inquiry.title}
      </h3>

      <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 mb-4">
        {inquiry.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-700/50">
        <div className="flex items-center gap-2">
          {inquiry.expand?.author?.avatar ? (
            <img
              src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${inquiry.expand.author.id}/${inquiry.expand.author.avatar}`}
              className="w-6 h-6 rounded-full object-cover"
              alt=""
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500">
              {inquiry.expand?.author?.name?.charAt(0) || "?"}
            </div>
          )}
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {isAuthor ? "Tú" : inquiry.expand?.author?.name || "Usuario"}
          </span>
        </div>
        
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Ver discusión &rarr;
        </span>
      </div>
    </Link>
  );
}
