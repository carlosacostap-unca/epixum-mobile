import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { getBanksForExamForms, getPartialExams } from "@/lib/partial-exams";
import {
  createExamAction,
  deleteExamAction,
  updateExamAction,
} from "./actions";
import {
  DeleteExamButton,
  EditExamButton,
  NewExamButton,
} from "./ExamModals";

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

function statusClass(status: string) {
  if (status === "Publicado") return "bg-violet-950/70 text-violet-200";
  if (status === "Cerrado") return "bg-zinc-800 text-zinc-200";
  return "bg-blue-950/70 text-blue-200";
}

export default async function ManagePartialExamsPage() {
  const user = await getCurrentUser();
  const isTeacher = user && (user.role === 'docente' || user.role === 'admin');

  if (!isTeacher) {
    redirect("/");
  }

  const [exams, banks] = await Promise.all([
    getPartialExams(),
    getBanksForExamForms(),
  ]);
  const selectedQuestionsByBank = new Map(banks.map((bank) => [bank.id, bank.selected]));

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <nav className="flex flex-wrap items-center gap-2 mb-10">
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

      <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Gestionar parciales
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            Alta, edicion y seguimiento de examenes parciales.
          </p>
        </div>
        <NewExamButton banks={banks} action={createExamAction} />
      </header>

      <div className="space-y-4">
        {exams.length > 0 ? exams.map((exam) => {
          const availableQuestions = exam.banks.reduce((total, bankId) => total + (selectedQuestionsByBank.get(bankId) ?? 0), 0);
          const canSimulate = availableQuestions >= 10;

          return (
            <article
              key={exam.id}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm ${statusClass(exam.status)}`}>
                    {exam.status}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                    Inicio: {formatDate(exam.startAt)}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                    Fin: {formatDate(exam.endAt)}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                    10 preguntas
                  </span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                    {availableQuestions} disponibles
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{exam.title}</h2>
                {exam.description && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{exam.description}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={canSimulate ? `/parciales/gestionar/${exam.id}/simular` : "#"}
                  title={canSimulate ? undefined : "Necesita al menos 10 preguntas habilitadas"}
                  aria-disabled={!canSimulate}
                  className={`rounded-md px-4 py-2 text-sm text-white transition-colors ${
                    canSimulate
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "pointer-events-none bg-blue-600 opacity-50"
                  }`}
                >
                  Simular
                </Link>
                <Link
                  href={`/parciales/gestionar/${exam.id}/simulaciones`}
                  className="rounded-md border border-emerald-700 px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                >
                  Simulaciones
                </Link>
                <EditExamButton
                  exam={exam}
                  banks={banks}
                  action={updateExamAction.bind(null, exam.id)}
                />
                <DeleteExamButton action={deleteExamAction.bind(null, exam.id)} />
              </div>
            </div>
          </article>
          );
        }) : (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            No hay parciales registrados.
          </div>
        )}
      </div>
    </div>
  );
}
