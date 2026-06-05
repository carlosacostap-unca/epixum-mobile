import { getCurrentUser } from "@/lib/pocketbase-server";
import { getExamAvailability, getPartialExams } from "@/lib/partial-exams";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getExamWindow(exam: { startAt?: string; endAt?: string; turns?: Array<{ startsAt: string; endsAt: string }> }) {
  if (!exam.turns?.length) {
    return { startAt: exam.startAt, endAt: exam.endAt };
  }

  const turns = [...exam.turns].sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());
  return {
    startAt: turns[0]?.startsAt ?? exam.startAt,
    endAt: turns.at(-1)?.endsAt ?? exam.endAt,
  };
}

export default async function ParcialesPage() {
  const user = await getCurrentUser();
  const isTeacher = user && (user.role === 'docente' || user.role === 'admin');
  const isStudent = user?.role === 'estudiante';

  if (!user) {
    redirect("/login");
  }

  if (!isTeacher && !isStudent) {
    redirect("/");
  }

  if (isStudent) {
    const exams = (await getPartialExams()).filter((exam) => exam.status === "Publicado");

    return (
      <div className="container mx-auto p-8 min-h-screen">
        <div className="mb-9">
          <Link href="/" className="text-sm text-blue-500 hover:text-blue-400">
            Volver al inicio
          </Link>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight mb-3 text-zinc-900 dark:text-zinc-100">
            Parciales
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl">
            Consulta y realiza las evaluaciones parciales disponibles.
          </p>
        </div>

        <div className="space-y-4">
          {exams.length > 0 ? exams.map((exam) => {
            const availability = getExamAvailability(exam);
            const examWindow = getExamWindow(exam);
            return (
              <article
                key={exam.id}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-950/70 px-3 py-1 text-sm text-emerald-200">
                        Publicado
                      </span>
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                        Inicio: {formatDate(examWindow.startAt)}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                        Fin: {formatDate(examWindow.endAt)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{exam.title}</h2>
                    {exam.description && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{exam.description}</p>
                    )}
                    {!availability.available && availability.reason && (
                      <p className="mt-3 text-sm text-amber-600 dark:text-amber-300">{availability.reason}</p>
                    )}
                  </div>

                  <Link
                    href={availability.available ? `/parciales/${exam.id}/realizar` : "#"}
                    aria-disabled={!availability.available}
                    className={`rounded-md px-4 py-2 text-center text-sm text-white transition-colors ${
                      availability.available
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "pointer-events-none bg-blue-600 opacity-50"
                    }`}
                  >
                    Realizar parcial
                  </Link>
                </div>
              </article>
            );
          }) : (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              Todavia no hay parciales disponibles.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <nav className="flex flex-wrap items-center gap-2 mb-8">
        <Link
          href="/"
          className="px-4 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md hover:border-zinc-700 hover:bg-zinc-800 transition-colors dark:bg-zinc-900 dark:border-zinc-800"
        >
          Inicio
        </Link>
        <Link
          href="/parciales/gestionar"
          className="px-4 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md hover:border-zinc-700 hover:bg-zinc-800 transition-colors dark:bg-zinc-900 dark:border-zinc-800"
        >
          Gestionar parciales
        </Link>
        <Link
          href="/parciales/banco-preguntas"
          className="px-4 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md hover:border-zinc-700 hover:bg-zinc-800 transition-colors dark:bg-zinc-900 dark:border-zinc-800"
        >
          Banco de preguntas
        </Link>
      </nav>

      <header className="mb-9">
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-zinc-900 dark:text-zinc-100">
          Parciales
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl">
          Accesos principales para preparar y administrar parciales.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link
          href="/parciales/gestionar"
          id="gestionar-parciales"
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 min-h-40 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center mb-5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M7 5h10a2 2 0 012 2v11a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">Gestionar parciales</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Crea, edita y organiza examenes parciales.
          </p>
        </Link>

        <Link
          href="/parciales/banco-preguntas"
          id="banco-preguntas"
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 min-h-40 hover:border-violet-500 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-300 rounded-xl flex items-center justify-center mb-5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4h8a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2zM8 8h8M8 12h5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">Banco de preguntas</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Consulta las unidades y preguntas cargadas en la base de datos.
          </p>
        </Link>
      </div>
    </div>
  );
}
