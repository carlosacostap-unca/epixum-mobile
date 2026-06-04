"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CreateUnitState } from "./actions";

type NewUnitButtonProps = {
  action: (previousState: CreateUnitState, formData: FormData) => Promise<CreateUnitState>;
};

function CreateUnitSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
    >
      {pending ? "Creando..." : "Crear unidad"}
    </button>
  );
}

export default function NewUnitButton({ action }: NewUnitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(action, {
    success: false,
    error: null,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setIsOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="self-start px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        Nueva unidad
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-unit-title"
            className="w-full max-w-md rounded-md border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="new-unit-title" className="text-lg font-bold text-zinc-100">
                  Nueva unidad
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Crea una unidad para organizar documentos y preguntas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            <form ref={formRef} action={formAction} className="mt-5 space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Unidad 1"
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
              <textarea
                name="description"
                placeholder="Descripcion breve"
                rows={5}
                className="w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />

              {state.error && (
                <p className="text-sm text-red-300">{state.error}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <CreateUnitSubmitButton />
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
