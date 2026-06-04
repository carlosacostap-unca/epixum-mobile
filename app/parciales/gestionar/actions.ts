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
  const status = String(formData.get("status") ?? "Borrador") as PartialExamStatus;
  const durationMinutes = Number(formData.get("durationMinutes") ?? 0);
  const banks = formData.getAll("banks").map(String).filter(Boolean);

  if (!title) {
    throw new Error("Ingresa un titulo para el parcial.");
  }

  if (!banks.length) {
    throw new Error("Selecciona al menos un banco de preguntas.");
  }

  return {
    title,
    description,
    startAt: startAt ? new Date(startAt).toISOString() : undefined,
    endAt: endAt ? new Date(endAt).toISOString() : undefined,
    status,
    durationMinutes: Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : undefined,
    banks,
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
