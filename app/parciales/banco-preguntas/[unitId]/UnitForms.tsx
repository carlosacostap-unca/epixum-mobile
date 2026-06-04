"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { UnitActionState } from "./actions";
import { QuestionBankDocument } from "@/lib/question-bank";

type BoundAction = (state: UnitActionState, formData: FormData) => Promise<UnitActionState>;

function SubmitButton({ children, color = "blue" }: { children: string; color?: "blue" | "purple" }) {
  const { pending } = useFormStatus();
  const colorClass = color === "purple"
    ? "bg-violet-600 hover:bg-violet-700"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 transition-colors ${colorClass}`}
    >
      {pending ? "Procesando..." : children}
    </button>
  );
}

function FormMessage({ state }: { state: UnitActionState }) {
  if (!state.error && !state.success) return null;

  return (
    <p className={`text-sm ${state.error ? "text-red-300" : "text-emerald-300"}`}>
      {state.error ?? "Listo."}
    </p>
  );
}

export function UploadDocumentForm({ action }: { action: BoundAction }) {
  const [state, formAction] = useActionState(action, { success: false, error: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Documento de unidad</h2>
      <input
        name="title"
        type="text"
        placeholder="Apunte de la unidad"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
      <input
        name="file"
        type="file"
        accept=".pdf,.txt,.md,.docx"
        required
        className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-300 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
      />
      <div className="grid">
        <SubmitButton>Subir documento</SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

export function PromptGenerationForm({ action }: { action: BoundAction }) {
  const [state, formAction] = useActionState(action, { success: false, error: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Generar preguntas</h2>
      <textarea
        name="prompt"
        rows={5}
        placeholder="Describe los contenidos, temas o criterios para generar preguntas."
        className="w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
      <div className="grid grid-cols-[5.5rem_1fr] gap-2">
        <input
          name="count"
          type="number"
          min={1}
          max={30}
          defaultValue={10}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <SubmitButton color="purple">Generar desde prompt</SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

export function DocumentGenerationForm({ document, action }: { document: QuestionBankDocument; action: BoundAction }) {
  const [state, formAction] = useActionState(action, { success: false, error: null });

  return (
    <form action={formAction} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{document.title}</h3>
      {document.fileName && (
        <p className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-300">{document.fileName}</p>
      )}
      <div className="mt-4 grid grid-cols-[5.5rem_1fr] gap-2">
        <input
          name="count"
          type="number"
          min={1}
          max={30}
          defaultValue={10}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <SubmitButton color="purple">Generar</SubmitButton>
      </div>
      <div className="mt-2">
        <FormMessage state={state} />
      </div>
    </form>
  );
}
