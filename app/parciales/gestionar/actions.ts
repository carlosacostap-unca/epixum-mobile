"use server";

import { revalidatePath } from "next/cache";
import {
  createPartialExam,
  createPartialExamSimulation,
  deletePartialExam,
  PartialExamStatus,
  updatePartialExam,
} from "@/lib/partial-exams";

export type ExamFormState = {
  success: boolean;
  error: string | null;
};

function readExamForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startAt = String(formData.get("startAt") ?? "").trim();
  const endAt = String(formData.get("endAt") ?? "").trim();
  const status = String(formData.get("status") ?? "Planificado") as PartialExamStatus;
  const durationMinutes = Number(formData.get("durationMinutes") ?? 0);
  const banks = formData.getAll("banks").map(String).filter(Boolean);
  const turnIds = formData.getAll("turnIds").map(String);
  const turnNames = formData.getAll("turnNames").map(String);
  const turnStartsAt = formData.getAll("turnStartsAt").map(String);
  const turnEndsAt = formData.getAll("turnEndsAt").map(String);
  const turns = turnNames.map((name, index) => ({
    id: turnIds[index] || undefined,
    name: name.trim() || `Turno ${index + 1}`,
    startsAt: turnStartsAt[index] ? new Date(turnStartsAt[index]).toISOString() : "",
    endsAt: turnEndsAt[index] ? new Date(turnEndsAt[index]).toISOString() : "",
  })).filter((turn) => turn.startsAt && turn.endsAt);

  if (!title) {
    throw new Error("Ingresa un titulo para el parcial.");
  }

  if (!banks.length) {
    throw new Error("Selecciona al menos un banco de preguntas.");
  }

  if (!turns.length && (!startAt || !endAt)) {
    throw new Error("Configura al menos un turno con inicio y fin.");
  }

  return {
    title,
    description,
    startAt: turns[0]?.startsAt ?? (startAt ? new Date(startAt).toISOString() : undefined),
    endAt: turns.at(-1)?.endsAt ?? (endAt ? new Date(endAt).toISOString() : undefined),
    status,
    durationMinutes: Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : undefined,
    banks,
    turns,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Error inesperado.";
}

export async function createExamAction(_state: ExamFormState, formData: FormData): Promise<ExamFormState> {
  try {
    await createPartialExam(readExamForm(formData));
    revalidatePath("/parciales");
    revalidatePath("/parciales/gestionar");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateExamAction(examId: string, _state: ExamFormState, formData: FormData): Promise<ExamFormState> {
  try {
    await updatePartialExam(examId, readExamForm(formData));
    revalidatePath("/parciales");
    revalidatePath("/parciales/gestionar");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteExamAction(examId: string) {
  await deletePartialExam(examId);
  revalidatePath("/parciales");
  revalidatePath("/parciales/gestionar");
}

export async function simulateExamAction(examId: string) {
  await createPartialExamSimulation(examId);
}
