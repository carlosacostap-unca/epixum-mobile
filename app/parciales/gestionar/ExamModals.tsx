"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { ExamFormState } from "./actions";
import { PartialExam } from "@/lib/partial-exams";
import { QuestionBankUnit } from "@/lib/question-bank";

type ExamAction = (state: ExamFormState, formData: FormData) => Promise<ExamFormState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
    >
      {pending ? "Guardando..." : label}
    </button>
  );
}

function formatDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function ExamModal({
  title,
  exam,
  banks,
  action,
  trigger,
}: {
  title: string;
  exam?: PartialExam;
  banks: QuestionBankUnit[];
  action: ExamAction;
  trigger: (open: () => void) => React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(action, { success: false, error: null });

  useEffect(() => {
    if (state.success) setIsOpen(false);
  }, [state.success]);

  const selectedBanks = new Set(exam?.banks ?? []);

  return (
    <>
      {trigger(() => setIsOpen(true))}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-2xl rounded-md border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Cada parcial toma 10 preguntas al azar desde los bancos seleccionados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                aria-label="Cerrar"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            <form action={formAction} className="mt-5 space-y-4">
              <input
                name="title"
                required
                defaultValue={exam?.title ?? ""}
                placeholder="Titulo del parcial"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
              <textarea
                name="description"
                rows={3}
                defaultValue={exam?.description ?? ""}
                placeholder="Descripcion breve"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-zinc-300">
                  <span>Inicio</span>
                  <input
                    name="startAt"
                    type="datetime-local"
                    defaultValue={formatDateInput(exam?.startAt)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </label>
                <label className="space-y-1 text-sm text-zinc-300">
                  <span>Fin</span>
                  <input
                    name="endAt"
                    type="datetime-local"
                    defaultValue={formatDateInput(exam?.endAt)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-zinc-300">
                  <span>Estado</span>
                  <select
                    name="status"
                    defaultValue={exam?.status ?? "Borrador"}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option>Borrador</option>
                    <option>Publicado</option>
                    <option>Cerrado</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm text-zinc-300">
                  <span>Duracion (minutos)</span>
                  <input
                    name="durationMinutes"
                    type="number"
                    min={1}
                    defaultValue={exam?.durationMinutes ?? ""}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  />
                </label>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-zinc-200">Bancos de preguntas</legend>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-zinc-700 p-3">
                  {banks.length > 0 ? banks.map((bank) => (
                    <label key={bank.id} className="flex items-center justify-between gap-3 text-sm text-zinc-200">
                      <span>{bank.name}</span>
                      <span className="ml-auto text-xs text-zinc-500">{bank.selected} seleccionadas</span>
                      <input
                        type="checkbox"
                        name="banks"
                        value={bank.id}
                        defaultChecked={selectedBanks.has(bank.id)}
                        className="h-4 w-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  )) : (
                    <p className="text-sm text-zinc-400">No hay bancos disponibles.</p>
                  )}
                </div>
              </fieldset>

              {state.error && <p className="text-sm text-red-300">{state.error}</p>}

              <div className="flex flex-wrap gap-2">
                <SubmitButton label={exam ? "Guardar cambios" : "Crear parcial"} />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function NewExamButton({ banks, action }: { banks: QuestionBankUnit[]; action: ExamAction }) {
  return (
    <ExamModal
      title="Nuevo parcial"
      banks={banks}
      action={action}
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 transition-colors"
        >
          <span className="text-2xl leading-none">+</span>
          Nuevo Parcial
        </button>
      )}
    />
  );
}

export function EditExamButton({ exam, banks, action }: { exam: PartialExam; banks: QuestionBankUnit[]; action: ExamAction }) {
  return (
    <ExamModal
      title="Editar parcial"
      exam={exam}
      banks={banks}
      action={action}
      trigger={(open) => (
        <button
          type="button"
          onClick={open}
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          Editar
        </button>
      )}
    />
  );
}

export function DeleteExamButton({ action }: { action: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("¿Eliminar este parcial definitivamente?")) return;
        startTransition(async () => {
          await action();
        });
      }}
      className="rounded-md border border-red-500 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
