import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { getPartialExam, getPartialExamSimulation } from "@/lib/partial-exams";

export const dynamic = 'force-dynamic';

export default async function SimulationDetailPage({
  params,
}: {
  params: Promise<{ examId: string; simulationId: string }>;
}) {
  const user = await getCurrentUser();
  const isTeacher = user && (user.role === 'docente' || user.role === 'admin');

  if (!isTeacher) {
    redirect("/");
  }

  const { examId, simulationId } = await params;
  const [exam, simulation] = await Promise.all([
    getPartialExam(examId).catch(() => null),
    getPartialExamSimulation(examId, simulationId),
  ]);

  if (!exam || !simulation?.payload) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <nav className="flex flex-wrap items-center gap-2 mb-10">
        <Link href="/" className="px-4 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md">Inicio</Link>
        <Link href="/parciales/gestionar" className="px-4 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md">Gestionar parciales</Link>
        <Link href="/parciales/banco-preguntas" className="px-4 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md">Banco de preguntas</Link>
      </nav>

      <div className="mb-8">
        <Link href={`/parciales/${examId}/resultados`} className="text-sm text-blue-500 hover:text-blue-400">
          Volver a resultados
        </Link>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          {exam.title}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          {simulation.title}. Cada pregunta vale {simulation.payload.scorePerQuestion} punto.
        </p>
      </div>

      <div className="space-y-4">
        {simulation.payload.questions.map((question, index) => (
          <article key={`${question.id}-${index}`} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="font-bold text-zinc-900 dark:text-zinc-100">
                {index + 1}. {question.prompt}
              </h2>
              <span className="rounded-full bg-emerald-950/70 px-3 py-1 text-xs text-emerald-300">
                Correcta: {question.answer}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {question.options.map((option) => (
                <div
                  key={option.label}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    option.label === question.answer
                      ? "border-emerald-700 bg-emerald-950/40 text-emerald-100"
                      : "border-zinc-200 text-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                  }`}
                >
                  <strong>{option.label}.</strong> {option.text}
                </div>
              ))}
            </div>
            {question.explanation && (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">{question.explanation}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
