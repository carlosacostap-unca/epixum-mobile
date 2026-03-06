"use client";

import { useState } from "react";
import { createInquiryResponse } from "@/lib/actions-inquiries";
import { useRouter } from "next/navigation";

interface InquiryResponseFormProps {
  inquiryId: string;
}

export default function InquiryResponseForm({ inquiryId }: InquiryResponseFormProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsLoading(true);

    const result = await createInquiryResponse(inquiryId, content);

    setIsLoading(false);

    if (result.success) {
      setContent("");
      router.refresh();
    } else {
      alert(result.error || "Error al enviar la respuesta");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        Añadir respuesta
      </h3>
      <div className="mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
          placeholder="Escribe tu respuesta aquí..."
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Enviando..." : "Responder"}
        </button>
      </div>
    </form>
  );
}
