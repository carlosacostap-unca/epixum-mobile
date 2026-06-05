"use server";

import { redirect } from "next/navigation";
import {
  finishPartialExamAttempt,
  getOrCreatePartialExamAttempt,
  savePartialExamAnswer,
  savePartialExamProgress,
} from "@/lib/partial-exams";

export async function startExamAttemptAction(examId: string) {
  const { result } = await getOrCreatePartialExamAttempt(examId);
  redirect(`/parciales/${examId}/realizar?result=${result.id}`);
}

export async function saveAnswerAction(resultId: string, questionId: string, answer: string, currentQuestionIndex: number) {
  await savePartialExamAnswer(resultId, questionId, answer, currentQuestionIndex);
}

export async function saveProgressAction(resultId: string, currentQuestionIndex: number) {
  await savePartialExamProgress(resultId, currentQuestionIndex);
}

export async function finishAttemptAction(examId: string, resultId: string) {
  await finishPartialExamAttempt(resultId);
  redirect(`/parciales/${examId}/realizar?result=${resultId}&finished=1`);
}
