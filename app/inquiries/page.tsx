import { getInquiries } from "@/lib/actions-inquiries";
import { getCurrentUser } from "@/lib/pocketbase-server";
import InquiryList from "@/components/inquiries/InquiryList";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;
  
  const inquiries = await getInquiries({ search });

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <div className="mb-8">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Volver al inicio</Link>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl mb-2">
          Consultas
        </h1>
        <p className="text-xl text-zinc-500 dark:text-zinc-400">
          Preguntas y respuestas de la comunidad.
        </p>
      </div>

      <InquiryList inquiries={inquiries} currentUser={user} showSearch={true} />
    </div>
  );
}
