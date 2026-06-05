"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { ExamFormState } from "./actions";
import { PartialExam } from "@/lib/partial-exams";
import { QuestionBankUnit } from "@/lib/question-bank";
import { toArgentinaDateTimeLocalInput } from "@/lib/argentina-time";

type ExamAction = (state: ExamFormState, formData: FormData) => Promise<ExamFormState>;
type TurnFormRow = {
  key: string;
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
};

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
  return toArgentinaDateTimeLocalInput(value);
}

function getInitialTurns(exam?: PartialExam): TurnFormRow[] {
  if (exam?.turns?.length) {
    return exam.turns.map((turn) => ({
      key: turn.id,
      id: turn.id === "legacy" ? "" : turn.id,
      name: turn.name,
      startsAt: formatDateInput(turn.startsAt),
      endsAt: formatDateInput(turn.endsAt),
    }));
  }

  return [{
    key: "new-turn-0",
    id: "",
    name: "Turno 1",
    startsAt: formatDateInput(exam?.startAt),
    endsAt: formatDateInput(exam?.endAt),
  }];
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
  const [turns, setTurns] = useState<TurnFormRow[]>(() => getInitialTurns(exam));

  useEffect(() => {
    if (!state.success) return;

    const timer = window.setTimeout(() => {
      setIsOpen(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [state.success]);

  const selectedBanks = new Set(exam?.banks ?? []);

  function updateTurn(index: number, field: "name" | "startsAt" | "endsAt", value: string) {
    setTurns((currentTurns) => currentTurns.map((turn, turnIndex) => (
      turnIndex === index ? { ...turn, [field]: value } : turn
    )));
  }

  function addTurn() {
    setTurns((currentTurns) => [
      ...currentTurns,
      {
        key: `new-turn-${Date.now()}`,
        id: "",
        name: `Turno ${currentTurns.length + 1}`,
        startsAt: "",
        endsAt: "",
      },
    ]);
  }

  function removeTurn(index: number) {
    setTurns((currentTurns) => currentTurns.filter((_, turnIndex) => turnIndex !== index));
  }

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
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-zinc-200">Turnos</h3>
                  <button
                    type="button"
                    onClick={addTurn}
                    className="rounded-md border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-200 hover:bg-blue-950/50"
                  >
                    Agregar turno
                  </button>
                </div>
                {turns.map((turn, index) => (
                  <div key={turn.key} className="rounded-md border border-zinc-700 p-3">
                    <input type="hidden" name="turnIds" value={turn.id} />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                      <label className="space-y-1 text-sm text-zinc-300">
                        <span>Nombre</span>
                        <input
                          name="turnNames"
                          value={turn.name}
                          onChange={(event) => updateTurn(index, "name", event.target.value)}
                          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                      </label>
                      <label className="space-y-1 text-sm text-zinc-300">
                        <span>Inicio</span>
                        <input
                          name="turnStartsAt"
                          type="datetime-local"
                          value={turn.startsAt}
                          onChange={(event) => updateTurn(index, "startsAt", event.target.value)}
                          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                      </label>
                      <label className="space-y-1 text-sm text-zinc-300">
                        <span>Fin</span>
                        <input
                          name="turnEndsAt"
                          type="datetime-local"
                          value={turn.endsAt}
                          onChange={(event) => updateTurn(index, "endsAt", event.target.value)}
                          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeTurn(index)}
                        disabled={turns.length === 1}
                        className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </section>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-zinc-300">
                  <span>Estado</span>
                  <select
                    name="status"
                    defaultValue={exam?.status ?? "Planificado"}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option>Planificado</option>
                    <option>Publicado</option>
                    <option>Finalizado</option>
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
          Nuevo parcial
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
