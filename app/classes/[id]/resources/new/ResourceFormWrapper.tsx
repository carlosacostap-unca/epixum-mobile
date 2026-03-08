"use client";

import LinkForm from "@/components/LinkForm";
import { useRouter } from "next/navigation";

export default function ResourceFormWrapper({ classId }: { classId: string }) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
      <LinkForm 
        classId={classId}
        isEmbedded={true}
        onClose={() => {
          router.push(`/classes/${classId}`);
          router.refresh();
        }} 
      />
    </div>
  );
}
