"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { PartialExam, PartialExamResult } from "@/lib/partial-exams";
import { finishAttemptAction, saveAnswerAction, saveProgressAction } from "./actions";

function formatTime(ms: number) {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function ExamRunner({
  exam,
  result,
  autoStartCamera = false,
}: {
  exam: PartialExam;
  result: PartialExamResult;
  autoStartCamera?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStartRequestedRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(result.currentQuestionIndex || 0);
  const [answers, setAnswers] = useState<Record<string, string>>(result.answers ?? {});
  const [remainingMs, setRemainingMs] = useState(() => exam.endAt ? new Date(exam.endAt).getTime() - Date.now() : 0);
  const [isPending, startTransition] = useTransition();
  const questions = result.payload?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const finished = result.status === "Entregado";

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!exam.endAt) return;
      setRemainingMs(new Date(exam.endAt).getTime() - Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [exam.endAt]);

  useEffect(() => {
    if (remainingMs <= 0 && questions.length > 0 && !finished) {
      startTransition(async () => {
        await finishAttemptAction(exam.id, result.id);
      });
    }
  }, [exam.id, finished, questions.length, remainingMs, result.id]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!cameraReady || !videoRef.current || !streamRef.current) return;

    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => {
      setCameraError("La camara se activo, pero el navegador no pudo mostrar la vista previa. Intenta nuevamente.");
    });
  }, [cameraReady]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraReady(true);
    } catch {
      setCameraError("No se pudo acceder a la camara. Revisa los permisos del navegador e intenta nuevamente.");
    }
  }, []);

  useEffect(() => {
    if (!autoStartCamera || finished || cameraReady || autoStartRequestedRef.current) return;

    autoStartRequestedRef.current = true;
    const timer = window.setTimeout(() => {
      void startCamera();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [autoStartCamera, cameraReady, finished, startCamera]);

  const chooseAnswer = (answer: string) => {
    if (!currentQuestion || finished) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(nextAnswers);
    startTransition(async () => {
      await saveAnswerAction(result.id, currentQuestion.id, answer, currentIndex);
    });
  };

  const goToQuestion = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), questions.length - 1);
    setCurrentIndex(nextIndex);
    startTransition(async () => {
      await saveProgressAction(result.id, nextIndex);
    });
  };

  const finish = () => {
    if (!window.confirm("¿Finalizar parcial y entregar respuestas?")) return;
    startTransition(async () => {
      await finishAttemptAction(exam.id, result.id);
    });
  };

  if (finished) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Parcial entregado</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            Nota final: {result.score} / {result.total}
          </p>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Informe de respuestas</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Revision de cada pregunta, tu respuesta, la respuesta correcta y el feedback disponible.
            </p>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => {
              const selectedAnswer = result.answers[question.id];
              const selectedOption = question.options.find((option) => option.label === selectedAnswer);
              const correctOption = question.options.find((option) => option.label === question.answer);
              const answered = Boolean(selectedAnswer);
              const correct = selectedAnswer === question.answer;

              return (
                <article
                  key={question.id}
                  className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Pregunta {index + 1}
                      </p>
                      <h4 className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {question.prompt}
                      </h4>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                        correct
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                          : answered
                            ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                      }`}
                    >
                      {correct ? "Correcta" : answered ? "Incorrecta" : "Sin responder"}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-950/60">
                      <dt className="font-medium text-zinc-500 dark:text-zinc-400">Tu respuesta</dt>
                      <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
                        {selectedOption ? `${selectedOption.label}. ${selectedOption.text}` : "Sin responder"}
                      </dd>
                    </div>
                    <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-950/60">
                      <dt className="font-medium text-zinc-500 dark:text-zinc-400">Respuesta correcta</dt>
                      <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
                        {correctOption ? `${correctOption.label}. ${correctOption.text}` : question.answer}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Feedback</p>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {question.explanation || "No hay feedback cargado para esta pregunta."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (!cameraReady) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Antes de iniciar</h2>
        <p className="mx-auto mt-5 max-w-2xl text-zinc-600 dark:text-zinc-300">
          Para realizar el parcial, primero activa la camara. La vista previa se mantendra visible durante el intento.
        </p>
        <div className="mt-6 rounded-md bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
          Tiempo restante: {formatTime(remainingMs)}
        </div>
        {cameraError && <p className="mt-4 text-sm text-red-400">{cameraError}</p>}
        <button
          type="button"
          onClick={startCamera}
          className="mt-6 rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Activar camara e iniciar
        </button>
        <video ref={videoRef} autoPlay muted playsInline className="hidden" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-300">No hay preguntas para este parcial.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Pregunta {currentIndex + 1} de {questions.length}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{currentQuestion.prompt}</h2>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
            {formatTime(remainingMs)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {currentQuestion.options.map((option) => {
            const selected = answers[currentQuestion.id] === option.label;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => chooseAnswer(option.label)}
                className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                  selected
                    ? "border-blue-600 bg-blue-950/50 text-blue-100"
                    : "border-zinc-200 text-zinc-900 hover:border-blue-500 dark:border-zinc-800 dark:text-zinc-100"
                }`}
              >
                <strong>{option.label}.</strong> {option.text}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => goToQuestion(currentIndex - 1)}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <div className="flex gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex + 1)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={finish}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Finalizar parcial
              </button>
            )}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full bg-black object-cover" />
          <div className="p-4">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Camara activa</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">La vista previa permanece visible durante el intento.</p>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Respondidas: {Object.keys(answers).length}/{questions.length}</p>
        </div>
      </aside>
    </div>
  );
}
