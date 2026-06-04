import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/pocketbase-server";
import {
  getPartialExam,
  getPartialExamAttemptsSummary,
} from "@/lib/partial-exams";
import type { PartialExamAttemptStudent, PartialExamResult } from "@/lib/partial-exams";

export const dynamic = "force-dynamic";

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatAttempts(count: number) {
  return count === 1 ? "1 intento" : `${count} intentos`;
}

function getAttemptDate(attempt?: PartialExamResult) {
  return attempt?.submittedAt || attempt?.startedAt || attempt?.created || attempt?.updated;
}

function ScoreBadge({ attempt }: { attempt?: PartialExamResult }) {
  if (!attempt) return null;

  if (attempt.status === "Iniciado") {
    return (
      <span className="rounded-full bg-blue-950/70 px-3 py-2 text-sm font-medium text-blue-200">
        En curso
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-950/70 px-3 py-2 text-sm font-medium text-emerald-200">
      {attempt.score}/{attempt.total}
    </span>
  );
}

function CompletedStudentRow({ student }: { student: PartialExamAttemptStudent }) {
  return (
    <li className="flex flex-col gap-4 border-t border-zinc-200 p-5 first:border-t-0 md:flex-row md:items-center md:justify-between dark:border-zinc-800">
      <div className="min-w-0">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{student.name}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{student.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Ultimo intento: {formatDate(getAttemptDate(student.latestAttempt))}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {formatAttempts(student.attempts)}
          </span>
        </div>
      </div>
      <ScoreBadge attempt={student.latestAttempt} />
    </li>
  );
}

function PendingStudentRow({ student }: { student: PartialExamAttemptStudent }) {
  return (
    <li className="border-t border-zinc-200 p-5 first:border-t-0 dark:border-zinc-800">
      <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{student.name}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{student.email}</p>
    </li>
  );
}

export default async function ExamSimulationsPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const user = await getCurrentUser();
  const isTeacher = user && (user.role === "docente" || user.role === "admin");

  if (!isTeacher) {
    redirect("/");
  }

  const { examId } = await params;
  let exam;
  try {
    exam = await getPartialExam(examId);
  } catch {
    notFound();
  }

  const summary = await getPartialExamAttemptsSummary(examId);

  return (
    <div className="container mx-auto min-h-screen p-8">
      <div className="mb-10">
        <Link href="/parciales/gestionar" className="text-sm text-blue-500 hover:text-blue-400">
          Volver a Gestionar parciales
        </Link>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Seguimiento de simulacro
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-300">{exam.title}</p>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Realizaron</p>
          <p className="mt-3 text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {summary.completedStudents.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">No realizaron</p>
          <p className="mt-3 text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {summary.pendingStudents.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Intentos registrados</p>
          <p className="mt-3 text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {summary.totalAttempts}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="p-5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Estudiantes que realizaron</h2>
          </div>
          {summary.completedStudents.length > 0 ? (
            <ul>
              {summary.completedStudents.map((student) => (
                <CompletedStudentRow key={student.id} student={student} />
              ))}
            </ul>
          ) : (
            <p className="border-t border-zinc-200 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              Todavia no hay estudiantes con intentos registrados.
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="p-5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Estudiantes que no realizaron</h2>
          </div>
          {summary.pendingStudents.length > 0 ? (
            <ul>
              {summary.pendingStudents.map((student) => (
                <PendingStudentRow key={student.id} student={student} />
              ))}
            </ul>
          ) : (
            <p className="border-t border-zinc-200 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              Todos los estudiantes registran al menos un intento.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
