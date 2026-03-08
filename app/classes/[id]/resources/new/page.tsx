import ResourceFormWrapper from "./ResourceFormWrapper";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewResourcePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href={`/classes/${id}`}
          className="text-blue-500 hover:underline inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver a la clase
        </Link>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">Añadir Nuevo Recurso</h1>
        <ResourceFormWrapper classId={id} />
      </div>
    </div>
  );
}
