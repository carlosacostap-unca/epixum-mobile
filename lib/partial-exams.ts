import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/pocketbase-server";
import { getQuestionBankUnitDetail, QuestionBankQuestion, QuestionBankUnit } from "@/lib/question-bank";
import type { User } from "@/types";

export type PartialExamStatus = "Borrador" | "Publicado" | "Cerrado";

export type PartialExam = {
  id: string;
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  status: PartialExamStatus;
  durationMinutes?: number;
  questionCount: number;
  banks: string[];
  expand?: {
    banks?: Array<{ id: string; name?: string; title?: string }>;
  };
};

export type PartialExamSimulation = {
  id: string;
  title: string;
  exam: string;
  status?: string;
  payload?: SimulationPayload;
  created?: string;
};

export type PartialExamResult = {
  id: string;
  exam: string;
  simulation?: string;
  student: string;
  answers: Record<string, string>;
  score: number;
  total: number;
  status: "Iniciado" | "Entregado" | "Corregido";
  startedAt?: string;
  submittedAt?: string;
  cameraStartedAt?: string;
  currentQuestionIndex: number;
  created?: string;
  updated?: string;
  payload?: SimulationPayload;
};

export type PartialExamAttemptStudent = {
  id: string;
  name: string;
  email: string;
  attempts: number;
  latestAttempt?: PartialExamResult;
};

export type PartialExamAttemptsSummary = {
  completedStudents: PartialExamAttemptStudent[];
  pendingStudents: PartialExamAttemptStudent[];
  totalAttempts: number;
};

export type SimulationPayload = {
  scorePerQuestion: number;
  questions: Array<{
    id: string;
    prompt: string;
    options: Array<{ label: string; text: string; originalLabel: string }>;
    answer: string;
    explanation?: string;
    source?: string;
    difficulty?: string;
  }>;
};

type PocketBaseRecord = {
  id: string;
  [key: string]: unknown;
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeExam(record: PocketBaseRecord): PartialExam {
  return {
    id: record.id,
    title: asString(record.title, "Parcial sin titulo"),
    description: asString(record.description) || undefined,
    startAt: asString(record.startAt) || asString(record.scheduledAt) || undefined,
    endAt: asString(record.endAt) || undefined,
    status: asString(record.status, "Borrador") as PartialExamStatus,
    durationMinutes: asNumber(record.durationMinutes) || undefined,
    questionCount: asNumber(record.questionCount, 10) || 10,
    banks: asStringArray(record.banks),
    expand: record.expand as PartialExam["expand"],
  };
}

function normalizeSimulation(record: PocketBaseRecord): PartialExamSimulation {
  return {
    id: record.id,
    title: asString(record.title, "Simulacion sin titulo"),
    exam: asString(record.exam),
    status: asString(record.status),
    payload: record.payload as SimulationPayload | undefined,
    created: asString(record.created) || undefined,
  };
}

function normalizeResult(record: PocketBaseRecord): PartialExamResult {
  return {
    id: record.id,
    exam: asString(record.exam),
    simulation: asString(record.simulation) || undefined,
    student: asString(record.student),
    answers: (record.answers && typeof record.answers === "object" ? record.answers : {}) as Record<string, string>,
    score: asNumber(record.score),
    total: asNumber(record.total, 10),
    status: asString(record.status, "Iniciado") as PartialExamResult["status"],
    startedAt: asString(record.startedAt) || undefined,
    submittedAt: asString(record.submittedAt) || undefined,
    cameraStartedAt: asString(record.cameraStartedAt) || undefined,
    currentQuestionIndex: asNumber(record.currentQuestionIndex),
    created: asString(record.created) || undefined,
    updated: asString(record.updated) || undefined,
    payload: record.payload as SimulationPayload | undefined,
  };
}

function getUserDisplayName(user: User) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.name || user.username || user.email || "Alumno sin nombre";
}

function normalizeAttemptStudent(user: User, attempts: PartialExamResult[]): PartialExamAttemptStudent {
  return {
    id: user.id,
    name: getUserDisplayName(user),
    email: user.email,
    attempts: attempts.length,
    latestAttempt: attempts.length > 0
      ? [...attempts].sort((left, right) => getResultTime(right) - getResultTime(left))[0]
      : undefined,
  };
}

function getResultTime(result: PartialExamResult) {
  const value = result.submittedAt || result.startedAt || result.created || result.updated || "";
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function reshuffleOptions(question: QuestionBankQuestion) {
  const originalOptions = question.options.map((option) => ({ ...option, originalLabel: option.label }));
  const shuffled = shuffle(originalOptions);
  const labels = ["A", "B", "C", "D"];
  const options = shuffled.map((option, index) => ({
    label: labels[index],
    text: option.text,
    originalLabel: option.originalLabel,
  }));
  const correctOption = options.find((option) => option.originalLabel === question.answer);

  return {
    id: question.id,
    prompt: question.prompt,
    options,
    answer: correctOption?.label ?? "A",
    explanation: question.explanation,
    source: question.source,
    difficulty: question.difficulty,
  };
}

async function getSelectedQuestionsForBanks(bankIds: string[]) {
  const details = await Promise.all(bankIds.map((bankId) => getQuestionBankUnitDetail(bankId)));
  return details
    .filter((detail): detail is NonNullable<typeof detail> => Boolean(detail))
    .flatMap((detail) => detail.questionItems)
    .filter((question) => question.selected);
}

export async function getPartialExams() {
  const pb = await createServerClient();
  const records = await pb.collection("partial_exams").getFullList<PocketBaseRecord>({
    sort: "-created",
    expand: "banks",
  });

  return records.map(normalizeExam);
}

export async function getPartialExam(examId: string) {
  const pb = await createServerClient();
  const record = await pb.collection("partial_exams").getOne<PocketBaseRecord>(examId, {
    expand: "banks",
  });

  return normalizeExam(record);
}

export async function createPartialExam(data: {
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  status: PartialExamStatus;
  durationMinutes?: number;
  banks: string[];
}) {
  const pb = await createServerClient();
  return pb.collection("partial_exams").create({
    ...data,
    questionCount: 10,
  });
}

export async function updatePartialExam(examId: string, data: {
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  status: PartialExamStatus;
  durationMinutes?: number;
  banks: string[];
}) {
  const pb = await createServerClient();
  return pb.collection("partial_exams").update(examId, {
    ...data,
    questionCount: 10,
  });
}

export async function deletePartialExam(examId: string) {
  const pb = await createServerClient();
  await pb.collection("partial_exams").delete(examId);
}

export async function createPartialExamSimulation(examId: string) {
  const exam = await getPartialExam(examId);
  const questions = await getSelectedQuestionsForBanks(exam.banks);

  if (questions.length < 10) {
    throw new Error("El parcial necesita al menos 10 preguntas habilitadas entre sus bancos.");
  }

  const payload: SimulationPayload = {
    scorePerQuestion: 1,
    questions: shuffle(questions).slice(0, 10).map(reshuffleOptions),
  };

  const pb = await createServerClient();
  const userId = pb.authStore.model?.id;
  const simulation = await pb.collection("partial_exam_simulations").create<PocketBaseRecord>({
    exam: examId,
    title: `Simulacion ${new Date().toLocaleString("es-AR")}`,
    status: "ready",
    questions: payload.questions.map((question) => question.id),
    payload,
    createdBy: userId || undefined,
  });

  redirect(`/parciales/gestionar/${examId}/simulaciones/${simulation.id}`);
}

export async function createSimulationPayloadForExam(examId: string) {
  const exam = await getPartialExam(examId);
  const questions = await getSelectedQuestionsForBanks(exam.banks);

  if (questions.length < 10) {
    throw new Error("El parcial necesita al menos 10 preguntas habilitadas entre sus bancos.");
  }

  return {
    exam,
    payload: {
      scorePerQuestion: 1,
      questions: shuffle(questions).slice(0, 10).map(reshuffleOptions),
    } satisfies SimulationPayload,
  };
}

export function getExamAvailability(exam: PartialExam, now = new Date()) {
  const startAt = exam.startAt ? new Date(exam.startAt) : null;
  const endAt = exam.endAt ? new Date(exam.endAt) : null;

  if (startAt && now < startAt) {
    return { available: false, reason: "El parcial aun no esta disponible." };
  }
  if (endAt && now > endAt) {
    return { available: false, reason: "El parcial ya finalizo." };
  }
  if (exam.status !== "Publicado") {
    return { available: false, reason: "El parcial no esta publicado." };
  }

  return { available: true, reason: null };
}

export async function getOrCreatePartialExamAttempt(examId: string) {
  const pb = await createServerClient();
  const userId = pb.authStore.model?.id;
  if (!userId) {
    throw new Error("No hay usuario autenticado.");
  }

  try {
    const existing = await pb.collection("partial_exam_results").getFirstListItem<PocketBaseRecord>(
      `exam = "${examId}" && student = "${userId}" && status = "Iniciado"`,
    );
    return {
      exam: await getPartialExam(examId),
      result: normalizeResult(existing),
      created: false,
    };
  } catch {
    const { exam, payload } = await createSimulationPayloadForExam(examId);
    const availability = getExamAvailability(exam);
    if (!availability.available) {
      throw new Error(availability.reason ?? "El parcial no esta disponible.");
    }

    const now = new Date().toISOString();
    const created = await pb.collection("partial_exam_results").create<PocketBaseRecord>({
      exam: examId,
      student: userId,
      answers: {},
      score: 0,
      total: 10,
      status: "Iniciado",
      startedAt: now,
      cameraStartedAt: now,
      currentQuestionIndex: 0,
      payload,
    });

    return {
      exam,
      result: normalizeResult(created),
      created: true,
    };
  }
}

export async function getActivePartialExamAttempt(examId: string) {
  const pb = await createServerClient();
  const userId = pb.authStore.model?.id;
  if (!userId) {
    return null;
  }

  try {
    const existing = await pb.collection("partial_exam_results").getFirstListItem<PocketBaseRecord>(
      `exam = "${examId}" && student = "${userId}" && status = "Iniciado"`,
    );
    return normalizeResult(existing);
  } catch {
    return null;
  }
}

export async function getPartialExamAttempt(examId: string, resultId: string) {
  const [exam, pb] = await Promise.all([getPartialExam(examId), createServerClient()]);
  const record = await pb.collection("partial_exam_results").getOne<PocketBaseRecord>(resultId);
  const result = normalizeResult(record);

  if (result.exam !== examId || result.student !== pb.authStore.model?.id) {
    return null;
  }

  return { exam, result };
}

export async function savePartialExamAnswer(resultId: string, questionId: string, answer: string, currentQuestionIndex: number) {
  const pb = await createServerClient();
  const record = await pb.collection("partial_exam_results").getOne<PocketBaseRecord>(resultId);
  const result = normalizeResult(record);
  const answers = {
    ...result.answers,
    [questionId]: answer,
  };

  const updated = await pb.collection("partial_exam_results").update<PocketBaseRecord>(resultId, {
    answers,
    currentQuestionIndex,
  });

  return normalizeResult(updated);
}

export async function savePartialExamProgress(resultId: string, currentQuestionIndex: number) {
  const pb = await createServerClient();
  const updated = await pb.collection("partial_exam_results").update<PocketBaseRecord>(resultId, {
    currentQuestionIndex,
  });

  return normalizeResult(updated);
}

export async function finishPartialExamAttempt(resultId: string) {
  const pb = await createServerClient();
  const record = await pb.collection("partial_exam_results").getOne<PocketBaseRecord>(resultId);
  const result = normalizeResult(record);
  const questions = result.payload?.questions ?? [];
  const score = questions.reduce((total, question) => {
    return total + (result.answers[question.id] === question.answer ? 1 : 0);
  }, 0);

  const updated = await pb.collection("partial_exam_results").update<PocketBaseRecord>(resultId, {
    score,
    total: questions.length,
    status: "Entregado",
    submittedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  });

  return normalizeResult(updated);
}

export async function getPartialExamSimulations(examId: string) {
  const pb = await createServerClient();
  const records = await pb.collection("partial_exam_simulations").getFullList<PocketBaseRecord>({
    filter: `exam = "${examId}"`,
    sort: "-created",
  });

  return records.map(normalizeSimulation);
}

export async function getPartialExamSimulation(examId: string, simulationId: string) {
  const pb = await createServerClient();
  const record = await pb.collection("partial_exam_simulations").getOne<PocketBaseRecord>(simulationId);
  const simulation = normalizeSimulation(record);

  if (simulation.exam !== examId) {
    return null;
  }

  return simulation;
}

export async function getPartialExamAttemptsSummary(examId: string): Promise<PartialExamAttemptsSummary> {
  const pb = await createServerClient();
  const [students, records] = await Promise.all([
    pb.collection("users").getFullList<User>({
      filter: 'role = "estudiante"',
      sort: "name,email",
    }),
    pb.collection("partial_exam_results").getFullList<PocketBaseRecord>({
      filter: `exam = "${examId}"`,
      sort: "-created",
      expand: "student",
    }),
  ]);

  const attemptsByStudent = new Map<string, PartialExamResult[]>();
  const usersById = new Map<string, User>(students.map((student) => [student.id, student]));
  const results = records.map(normalizeResult);

  for (const record of records) {
    const result = normalizeResult(record);
    const expandedStudent = (record.expand as { student?: User } | undefined)?.student;
    if (expandedStudent) {
      usersById.set(expandedStudent.id, expandedStudent);
    }
    const attempts = attemptsByStudent.get(result.student) ?? [];
    attempts.push(result);
    attemptsByStudent.set(result.student, attempts);
  }

  const completedStudents: PartialExamAttemptStudent[] = [];
  const pendingStudents: PartialExamAttemptStudent[] = [];

  for (const [studentId, attempts] of attemptsByStudent.entries()) {
    const student = usersById.get(studentId);
    if (student) {
      completedStudents.push(normalizeAttemptStudent(student, attempts));
    } else {
      const latestAttempt = [...attempts].sort((left, right) => getResultTime(right) - getResultTime(left))[0];
      completedStudents.push({
        id: studentId,
        name: "Usuario sin datos",
        email: "Sin email",
        attempts: attempts.length,
        latestAttempt,
      });
    }
  }

  for (const student of students) {
    const attempts = attemptsByStudent.get(student.id) ?? [];
    if (attempts.length === 0) {
      pendingStudents.push(normalizeAttemptStudent(student, attempts));
    }
  }

  completedStudents.sort((left, right) => left.name.localeCompare(right.name, "es"));
  pendingStudents.sort((left, right) => left.name.localeCompare(right.name, "es"));

  return {
    completedStudents,
    pendingStudents,
    totalAttempts: results.length,
  };
}

export async function getBanksForExamForms(): Promise<QuestionBankUnit[]> {
  return (await import("@/lib/question-bank")).getQuestionBankUnits();
}
