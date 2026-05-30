import { getAvailableStudyGuides, updateStudyGuideMetadata } from "@/lib/actions-slides";
import { getCurrentUser } from "@/lib/pocketbase-server";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const user = await getCurrentUser();
  const isTeacher = user && (user.role === 'docente' || user.role === 'admin');
  const guidesResponse = await getAvailableStudyGuides({ includeUnavailable: !!isTeacher });
  const guides = guidesResponse.success ? guidesResponse.guides : [];
  const saveStudyGuideMetadata = async (formData: FormData) => {
    "use server";
    await updateStudyGuideMetadata(formData);
  };

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline inline-block">
          &larr; Volver al menu principal
        </Link>
      </div>

      <header className="mb-10">
        <span className="px-3 py-1 text-sm font-medium text-cyan-600 bg-cyan-100 rounded-full dark:bg-cyan-900 dark:text-cyan-200">
          Material de estudio
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl mt-4 mb-3 text-zinc-900 dark:text-zinc-100">
          Apuntes disponibles
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
          {isTeacher
            ? "Administra los titulos y la visibilidad de los apuntes publicados para estudiantes."
            : "Accede a los apuntes y guias de estudio publicados para acompanar las clases."}
        </p>
      </header>

      {guides.length > 0 ? (
        isTeacher ? (
          <div className="space-y-4">
            {guides.map((guide) => (
              <form
                key={guide.path}
                action={saveStudyGuideMetadata}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
              >
                <input type="hidden" name="filename" value={guide.filename} />
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 lg:items-end">
                  <div>
                    <label htmlFor={`title-${guide.filename}`} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Titulo del apunte
                    </label>
                    <input
                      id={`title-${guide.filename}`}
                      name="title"
                      type="text"
                      defaultValue={guide.title}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    />
                    <Link href={guide.path} target="_blank" className="inline-block mt-2 text-xs text-cyan-600 hover:text-cyan-700 hover:underline">
                      {guide.filename}
                    </Link>
                  </div>

                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 h-10">
                    <input
                      type="checkbox"
                      name="available"
                      defaultChecked={guide.available}
                      className="h-4 w-4 rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    Visible para estudiantes
                  </label>

                  <button
                    type="submit"
                    className="h-10 px-4 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((guide) => (
              <Link
                key={guide.path}
                href={guide.path}
                target="_blank"
                className="group flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500 hover:shadow-md transition-all"
              >
                <div className="shrink-0 w-11 h-11 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                    {guide.title}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                    {guide.filename}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="flex items-center justify-center min-h-64 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <span className="text-zinc-500 dark:text-zinc-400">No hay apuntes disponibles por el momento.</span>
        </div>
      )}
    </div>
  );
}
