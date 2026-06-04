"use server";

import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { s3Client } from "@/lib/s3";
import {
  createQuestionBankDocument,
  createQuestionBankQuestions,
  deleteQuestionBankQuestion,
  getQuestionBankUnitDetail,
  updateQuestionBankQuestionSelected,
} from "@/lib/question-bank";

export type UnitActionState = {
  success: boolean;
  error: string | null;
};

type GeneratedQuestion = {
  prompt: string;
  options: Array<{ label: string; text: string }>;
  answer: "A" | "B" | "C" | "D";
  explanation: string;
  source?: string;
  difficulty?: "Basica" | "Intermedia" | "Avanzada";
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Error inesperado.";
}

function revalidateUnit(unitId: string) {
  revalidatePath("/parciales/banco-preguntas");
  revalidatePath(`/parciales/banco-preguntas/${unitId}`);
}

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function fileToText(file: File) {
  const mimeType = file.type;
  const name = file.name.toLowerCase();

  if (mimeType.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) {
    return await file.text();
  }

  return "";
}

async function getS3ObjectBytes(key: string) {
  const bucketName = process.env.IDRIVE_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Bucket de iDrive no configurado.");
  }

  const response = await s3Client.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  }));

  if (!response.Body) {
    throw new Error("No se pudo leer el documento.");
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function normalizeGeneratedQuestions(value: unknown, count: number): GeneratedQuestion[] {
  const record = value as { questions?: unknown };
  const questions = Array.isArray(record?.questions) ? record.questions : [];

  return questions.slice(0, count).map((item) => {
    const question = item as Record<string, unknown>;
    const rawOptions = Array.isArray(question.options) ? question.options : [];
    const labels = ["A", "B", "C", "D"] as const;
    const options = labels.map((label, index) => {
      const option = rawOptions[index];
      if (typeof option === "string") return { label, text: option };
      if (typeof option === "object" && option !== null) {
        const optionRecord = option as Record<string, unknown>;
        return { label, text: String(optionRecord.text ?? optionRecord.value ?? "") };
      }
      return { label, text: "" };
    });
    const answer = String(question.answer ?? "A").toUpperCase();

    return {
      prompt: String(question.prompt ?? question.question ?? "").trim(),
      options,
      answer: labels.includes(answer as "A" | "B" | "C" | "D") ? answer as "A" | "B" | "C" | "D" : "A",
      explanation: String(question.explanation ?? "").trim(),
      source: String(question.source ?? "").trim(),
      difficulty: ["Basica", "Intermedia", "Avanzada"].includes(String(question.difficulty))
        ? question.difficulty as "Basica" | "Intermedia" | "Avanzada"
        : "Basica",
    };
  }).filter((question) =>
    question.prompt &&
    question.options.length === 4 &&
    question.options.every((option) => option.text.trim()) &&
    question.explanation
  );
}

async function callOpenAIForQuestions(args: {
  count: number;
  unitName: string;
  prompt: string;
  file?: {
    filename: string;
    mimeType: string;
    bytes: Buffer;
  };
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no esta configurada.");
  }

  const content: Array<Record<string, unknown>> = [];

  if (args.file) {
    content.push({
      type: "input_file",
      filename: args.file.filename,
      file_data: `data:${args.file.mimeType || "application/octet-stream"};base64,${args.file.bytes.toString("base64")}`,
    });
  }

  content.push({
    type: "input_text",
    text: [
      `Unidad: ${args.unitName}`,
      `Cantidad exacta de preguntas: ${args.count}`,
      args.prompt,
      "Genera preguntas de opcion multiple con exactamente 4 opciones A, B, C y D.",
      "Devuelve JSON valido con la forma {\"questions\":[{\"prompt\":\"...\",\"options\":[{\"label\":\"A\",\"text\":\"...\"},{\"label\":\"B\",\"text\":\"...\"},{\"label\":\"C\",\"text\":\"...\"},{\"label\":\"D\",\"text\":\"...\"}],\"answer\":\"A\",\"explanation\":\"...\",\"source\":\"...\",\"difficulty\":\"Basica\"}]}",
    ].join("\n\n"),
  });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_QUESTION_MODEL || "gpt-5.4-mini",
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text: "Sos un generador de preguntas de evaluacion. Respondé solamente JSON valido. No incluyas markdown.",
            },
          ],
        },
        {
          role: "user",
          content,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "multiple_choice_questions",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["questions"],
            properties: {
              questions: {
                type: "array",
                minItems: args.count,
                maxItems: args.count,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["prompt", "options", "answer", "explanation", "source", "difficulty"],
                  properties: {
                    prompt: { type: "string" },
                    options: {
                      type: "array",
                      minItems: 4,
                      maxItems: 4,
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["label", "text"],
                        properties: {
                          label: { type: "string", enum: ["A", "B", "C", "D"] },
                          text: { type: "string" },
                        },
                      },
                    },
                    answer: { type: "string", enum: ["A", "B", "C", "D"] },
                    explanation: { type: "string" },
                    source: { type: "string" },
                    difficulty: { type: "string", enum: ["Basica", "Intermedia", "Avanzada"] },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? "OpenAI rechazo la solicitud.");
  }

  const outputText = data.output_text
    ?? data.output?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? [])
      .map((item: { text?: string }) => item.text)
      .filter(Boolean)
      .join("");

  if (!outputText) {
    throw new Error("OpenAI no devolvio preguntas.");
  }

  return normalizeGeneratedQuestions(JSON.parse(outputText), args.count);
}

export async function uploadUnitDocumentAction(unitId: string, _state: UnitActionState, formData: FormData): Promise<UnitActionState> {
  const file = formData.get("file") as File | null;
  const title = String(formData.get("title") ?? "").trim();

  if (!file || file.size === 0) {
    return { success: false, error: "Selecciona un archivo." };
  }

  try {
    const bucketName = process.env.IDRIVE_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("Bucket de iDrive no configurado.");
    }

    const safeName = sanitizeFileName(file.name);
    const key = `partial-exam-units/${unitId}/${Date.now()}-${safeName}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const text = await fileToText(file);

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: bytes,
      ContentType: file.type || "application/octet-stream",
    }));

    await createQuestionBankDocument(unitId, {
      title: title || file.name,
      description: text.slice(0, 5000),
      key,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });

    revalidateUnit(unitId);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function generateQuestionsFromPromptAction(unitId: string, _state: UnitActionState, formData: FormData): Promise<UnitActionState> {
  const prompt = String(formData.get("prompt") ?? "").trim();
  const count = Number(formData.get("count") ?? 10);
  const unit = await getQuestionBankUnitDetail(unitId);

  if (!unit) notFound();
  if (!prompt) return { success: false, error: "Describe los contenidos o criterios." };

  try {
    const questions = await callOpenAIForQuestions({
      count: Number.isFinite(count) ? Math.min(Math.max(count, 1), 30) : 10,
      unitName: unit.name,
      prompt,
    });
    await createQuestionBankQuestions(unitId, questions);
    revalidateUnit(unitId);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function generateQuestionsFromDocumentAction(unitId: string, documentId: string, _state: UnitActionState, formData: FormData): Promise<UnitActionState> {
  const count = Number(formData.get("count") ?? 10);
  const unit = await getQuestionBankUnitDetail(unitId);
  if (!unit) notFound();
  const document = unit.documents.find((item) => item.id === documentId);
  if (!document?.key) return { success: false, error: "El documento no tiene archivo asociado." };

  try {
    const bytes = await getS3ObjectBytes(document.key);
    const questions = await callOpenAIForQuestions({
      count: Number.isFinite(count) ? Math.min(Math.max(count, 1), 30) : 10,
      unitName: unit.name,
      prompt: `Genera preguntas a partir del documento "${document.title}".`,
      file: {
        filename: document.fileName ?? document.title,
        mimeType: document.mimeType ?? "application/octet-stream",
        bytes,
      },
    });
    await createQuestionBankQuestions(unitId, questions.map((question) => ({ ...question, document: document.id })));
    revalidateUnit(unitId);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function toggleQuestionSelectedAction(unitId: string, questionId: string, formData: FormData) {
  await updateQuestionBankQuestionSelected(questionId, formData.get("selected") === "on");
  revalidateUnit(unitId);
}

export async function deleteQuestionAction(unitId: string, questionId: string) {
  await deleteQuestionBankQuestion(questionId);
  revalidateUnit(unitId);
}
