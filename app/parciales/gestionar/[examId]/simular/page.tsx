import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/pocketbase-server";
import {
  getExamAvailability,
  getCurrentUserPartialExamAttempt,
  getPartialExam,
  getPartialExamAttempt,
  getPartialExamFinalEndAt,
  isPartialExamReportAvailable,
} from "@/lib/partial-exams";
import { formatArgentinaWallClockDate } from "@/lib/argentina-time";
import ExamRunner from "./ExamRunner";
import StartSimulationForm from "./StartSimulationForm";

export const dynamic = 'force-dynamic';

export default async function SimulateExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ result?: string; finished?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { examId } = await params;
  const { result: resultId } = await searchParams;
  let exam;

  try {
    exam = await getPartialExam(examId);
  } catch {
    notFound();
  }

  const availability = getExamAvailability(exam);
  const isTeacher = user.role === "docente" || user.role === "admin";

  if (resultId) {
    const attempt = await getPartialExamAttempt(examId, resultId);
    if (!attempt) notFound();
    const attemptAvailability = getExamAvailability(attempt.exam);
    const timedExam = {
      ...attempt.exam,
      endAt: attemptAvailability.endAt ?? attempt.exam.endAt,
    };

    return (
      <div className="container mx-auto p-8 min-h-screen">
        <div className="mb-8">
          <Link href={isTeacher ? "/parciales/gestionar" : "/parciales"} className="text-sm text-blue-500 hover:text-blue-400">
            {isTeacher ? "Volver a Gestionar parciales" : "Volver a Parciales"}
          </Link>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Realizar parcial
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-300">{attempt.exam.title}</p>
        </div>
        <ExamRunner
          exam={timedExam}
          result={attempt.result}
          autoStartCamera={Boolean(attempt.result.cameraStartedAt)}
          showAnswerReport={isPartialExamReportAvailable(attempt.exam)}
          answerReportAvailableAt={formatArgentinaWallClockDate(getPartialExamFinalEndAt(attempt.exam))}
        />
      </div>
    );
  }

  const existingAttempt = await getCurrentUserPartialExamAttempt(examId);

  if (existingAttempt) {
    redirect(`/parciales/${examId}/realizar?result=${existingAttempt.id}`);
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <div className="mb-8">
        <Link href={isTeacher ? "/parciales/gestionar" : "/parciales"} className="text-sm text-blue-500 hover:text-blue-400">
          {isTeacher ? "Volver a Gestionar parciales" : "Volver a Parciales"}
        </Link>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Realizar parcial
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-300">{exam.title}</p>
      </div>

      <div className="mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Antes de iniciar</h2>
        <p className="mx-auto mt-5 max-w-2xl text-zinc-600 dark:text-zinc-300">
          Para realizar el parcial, primero activa la camara. La vista previa se mantendra visible durante el intento.
        </p>
        {!availability.available && (
          <p className="mt-4 text-sm text-red-400">{availability.reason}</p>
        )}
        <StartSimulationForm examId={exam.id} endAt={availability.endAt ?? exam.endAt} disabled={!availability.available} />
      </div>
    </div>
  );
}
