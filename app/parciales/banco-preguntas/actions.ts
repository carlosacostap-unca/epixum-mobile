"use server";

import { revalidatePath } from "next/cache";
import { createQuestionBankUnit } from "@/lib/question-bank";

export type CreateUnitState = {
  success: boolean;
  error: string | null;
};

export async function createUnitAction(
  _previousState: CreateUnitState,
  formData: FormData,
): Promise<CreateUnitState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return {
      success: false,
      error: "Ingresa un nombre para la unidad.",
    };
  }

  try {
    await createQuestionBankUnit(name, description);
    revalidatePath("/parciales");
    revalidatePath("/parciales/banco-preguntas");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("No se pudo crear la unidad del banco de preguntas", error);
    const detail = error instanceof Error ? error.message : null;

    return {
      success: false,
      error: detail
        ? `No se pudo crear la unidad. ${detail}`
        : "No se pudo crear la unidad. Revisa la coleccion y los permisos en PocketBase.",
    };
  }
}
