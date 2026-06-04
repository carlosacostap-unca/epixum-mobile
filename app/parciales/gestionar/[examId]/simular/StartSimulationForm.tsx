"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { startExamAttemptAction } from "./actions";

function getRemainingMs(endAt?: string) {
  if (!endAt) return null;
  return new Date(endAt).getTime() - Date.now();
}

function formatTime(ms: number | null) {
  if (ms === null) return "Sin limite";
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((item) => String(item).padStart(2, "0")).join(":");
}

export default function StartSimulationForm({
  examId,
  endAt,
  disabled,
}: {
  examId: string;
  endAt?: string;
  disabled: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(endAt));
  const [isPending, startTransition] = useTransition();
  const expired = remainingMs !== null && remainingMs <= 0;

  useEffect(() => {
    if (!endAt) return;

    const tick = () => setRemainingMs(getRemainingMs(endAt));
    tick();
    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [endAt]);

  const start = async () => {
    if (disabled || expired || isPending) return;

    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => track.stop());
      startTransition(async () => {
        await startExamAttemptAction(examId);
      });
    } catch {
      setError("No se pudo acceder a la camara. Revisa los permisos del navegador e intenta nuevamente.");
    }
  };

  return (
    <>
      <div className="mt-6 rounded-md bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        Tiempo restante: {formatTime(remainingMs)}
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {expired && <p className="mt-4 text-sm text-red-400">El tiempo disponible para este parcial ya finalizo.</p>}
      <button
        type="button"
        disabled={disabled || expired || isPending}
        onClick={start}
        className="mt-6 rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Iniciando..." : "Activar camara e iniciar"}
      </button>
      <video ref={videoRef} autoPlay muted playsInline className="hidden" />
    </>
  );
}
