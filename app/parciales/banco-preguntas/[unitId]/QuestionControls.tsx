"use client";

import { useTransition } from "react";

export function QuestionEnabledCheckbox({
  selected,
  action,
}: {
  selected: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await action(formData);
        });
      }}
    >
      <input
        type="checkbox"
        name="selected"
        defaultChecked={selected}
        disabled={isPending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-4 w-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-500"
      />
    </form>
  );
}

export function DeleteQuestionButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("¿Eliminar esta pregunta definitivamente?")) return;
        startTransition(async () => {
          await action();
        });
      }}
      className="rounded-md border border-red-500 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
    >
      {isPending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
