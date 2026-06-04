import { createServerClient } from "@/lib/pocketbase-server";

export type QuestionBankUnit = {
  id: string;
  name: string;
  description?: string;
  docs: number;
  questions: number;
  selected: number;
};

export type QuestionBankDocument = {
  id: string;
  title: string;
  description?: string;
  fileName?: string;
  key?: string;
  mimeType?: string;
  size?: number;
};

export type QuestionBankQuestion = {
  id: string;
  prompt: string;
  options: Array<{ label: string; text: string }>;
  answer: string;
  selected: boolean;
  explanation?: string;
  source?: string;
  difficulty?: string;
};

type PbRecord = {
  id: string;
  created?: string;
  updated?: string;
  [key: string]: unknown;
};

type UnitCollections = {
  units: { collectionName: string; records: PbRecord[] };
  questions: { collectionName: string; records: PbRecord[] } | null;
  documents: { collectionName: string; records: PbRecord[] } | null;
};

type PocketBaseCollection = {
  name: string;
  fields?: Array<{ name: string; type?: string; required?: boolean }>;
  schema?: Array<{ name: string; type?: string; required?: boolean }>;
};

const unitCollectionCandidates = [
  "partial_exam_units",
  "question_bank_units",
  "banco_preguntas_unidades",
  "preguntas_unidades",
  "parcial_units",
  "parciales_unidades",
  "question_units",
  "unidades_banco_preguntas",
  "unidades",
];

const questionCollectionCandidates = [
  "partial_exam_questions",
  "question_bank_questions",
  "banco_preguntas",
  "preguntas_banco",
  "parcial_questions",
  "parciales_preguntas",
  "questions_bank",
  "preguntas",
  "questions",
];

const documentCollectionCandidates = [
  "partial_exam_unit_documents",
  "question_bank_documents",
  "banco_preguntas_documentos",
  "preguntas_documentos",
  "parcial_documents",
  "parciales_documentos",
  "documents",
];

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

async function getAvailableCollections(pb: Awaited<ReturnType<typeof createServerClient>>) {
  const baseUrl = process.env['NEXT_PUBLIC_POCKETBASE_URL'];

  if (!baseUrl || !pb.authStore.token) {
    return [];
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/collections?page=1&perPage=200`, {
      headers: {
        Authorization: `Bearer ${pb.authStore.token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as { items?: PocketBaseCollection[] };
    return data.items ?? [];
  } catch (error) {
    console.error("No se pudieron descubrir las colecciones de PocketBase", error);
    return [];
  }
}

function getFieldNames(collection: PocketBaseCollection) {
  return (collection.fields ?? collection.schema ?? []).map((field) => field.name.toLowerCase());
}

function getCollectionsByKind(collections: PocketBaseCollection[], kind: "units" | "questions" | "documents") {
  return collections
    .filter((collection) => {
      const name = collection.name.toLowerCase();
      const fields = getFieldNames(collection).join(" ");
      const searchable = `${name} ${fields}`;
      const isQuestionRelated = /pregunt|question|banco|parcial|exam/.test(searchable);

      if (kind === "units") {
        return isQuestionRelated && /unidad|unit/.test(searchable);
      }

      if (kind === "documents") {
        return isQuestionRelated && /document|doc|archivo|file|material/.test(searchable);
      }

      return isQuestionRelated && !/unidad|unit|document|archivo|file/.test(name);
    })
    .map((collection) => collection.name);
}

async function getFirstAvailableCollection(
  pb: Awaited<ReturnType<typeof createServerClient>>,
  candidates: string[],
) {
  for (const collectionName of candidates) {
    try {
      const records = await pb.collection(collectionName).getFullList<PbRecord>({
        sort: 'created',
      });

      return { collectionName, records };
    } catch (error) {
      const status = typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: number }).status
        : undefined;

      if (status !== 404) {
        console.error(`No se pudo leer la coleccion ${collectionName}`, error);
      }
    }
  }

  return null;
}

async function getUnitCollections(): Promise<UnitCollections | null> {
  const pb = await createServerClient();
  const availableCollections = await getAvailableCollections(pb);
  const collectionNames = getQuestionBankCollectionNames(availableCollections);
  const units = await getFirstAvailableCollection(pb, collectionNames.units);

  if (!units) {
    return null;
  }

  return {
    units,
    questions: await getFirstAvailableCollection(pb, collectionNames.questions),
    documents: await getFirstAvailableCollection(pb, collectionNames.documents),
  };
}

function getTextValue(record: PbRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function getCountValue(record: PbRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.length;
    }
  }

  return null;
}

function recordBelongsToUnit(record: PbRecord, unitId: string) {
  const relationKeys = [
    "unit",
    "unidad",
    "question_unit",
    "unidad_banco",
    "bank_unit",
    "parcial_unit",
    "parcialUnidad",
  ];

  return relationKeys.some((key) => {
    const value = record[key];
    if (typeof value === "string") {
      return value === unitId;
    }
    if (Array.isArray(value)) {
      return value.includes(unitId);
    }
    return false;
  });
}

function isSelectedQuestion(record: PbRecord) {
  const selectedKeys = [
    "selected",
    "seleccionada",
    "seleccionado",
    "included",
    "incluida",
    "enabled",
    "active",
  ];

  for (const key of selectedKeys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return true;
}

function parseDocumentMetadata(record: PbRecord) {
  const content = typeof record.content === "string" ? record.content : "";

  try {
    return content ? JSON.parse(content) as Partial<QuestionBankDocument> : {};
  } catch {
    return {};
  }
}

function parseQuestionOptions(value: unknown): Array<{ label: string; text: string }> {
  const fallback = ["A", "B", "C", "D"].map((label) => ({ label, text: "" }));

  if (!Array.isArray(value)) {
    return fallback;
  }

  return ["A", "B", "C", "D"].map((label, index) => {
    const option = value[index];
    if (typeof option === "string") {
      return { label, text: option };
    }
    if (typeof option === "object" && option !== null) {
      const optionRecord = option as Record<string, unknown>;
      return {
        label: String(optionRecord.label ?? label),
        text: String(optionRecord.text ?? optionRecord.value ?? ""),
      };
    }
    return { label, text: "" };
  });
}

function getQuestionBankCollectionNames(availableCollections: PocketBaseCollection[]) {
  return {
    units: uniqueValues([
      process.env['QUESTION_BANK_UNITS_COLLECTION'] ?? "",
      ...getCollectionsByKind(availableCollections, "units"),
      ...unitCollectionCandidates,
    ]),
    questions: uniqueValues([
      process.env['QUESTION_BANK_QUESTIONS_COLLECTION'] ?? "",
      ...getCollectionsByKind(availableCollections, "questions"),
      ...questionCollectionCandidates,
    ]),
    documents: uniqueValues([
      process.env['QUESTION_BANK_DOCUMENTS_COLLECTION'] ?? "",
      ...getCollectionsByKind(availableCollections, "documents"),
      ...documentCollectionCandidates,
    ]),
  };
}

export async function getQuestionBankUnits(): Promise<QuestionBankUnit[]> {
  const collections = await getUnitCollections();

  if (!collections) {
    return [];
  }

  const questions = collections.questions?.records ?? [];
  const documents = collections.documents?.records ?? [];

  return collections.units.records.map((unit) => {
    const unitQuestions = questions.filter((question) => recordBelongsToUnit(question, unit.id));
    const unitDocuments = documents.filter((document) => recordBelongsToUnit(document, unit.id));
    const explicitQuestions = getCountValue(unit, [
      "questions",
      "preguntas",
      "questionsCount",
      "questionCount",
      "preguntasCount",
      "totalQuestions",
      "totalPreguntas",
    ]);
    const explicitSelected = getCountValue(unit, [
      "selected",
      "seleccionadas",
      "selectedCount",
      "selectedQuestions",
      "selectedQuestionsCount",
      "preguntasSeleccionadas",
    ]);
    const explicitDocs = getCountValue(unit, [
      "docs",
      "documents",
      "documentos",
      "docsCount",
      "documentsCount",
      "documentosCount",
    ]);

    return {
      id: unit.id,
      name: getTextValue(unit, ["name", "title", "nombre", "titulo", "unit", "unidad"]) ?? "Unidad sin titulo",
      description: getTextValue(unit, ["description", "descripcion", "detalle", "resumen"]) ?? undefined,
      docs: explicitDocs ?? unitDocuments.length,
      questions: explicitQuestions ?? unitQuestions.length,
      selected: explicitSelected ?? unitQuestions.filter(isSelectedQuestion).length,
    };
  });
}

export async function getQuestionBankUnitDetail(unitId: string) {
  const collections = await getUnitCollections();

  if (!collections) {
    return null;
  }

  const unit = collections.units.records.find((record) => record.id === unitId);
  if (!unit) {
    return null;
  }

  const documents = (collections.documents?.records ?? [])
    .filter((document) => recordBelongsToUnit(document, unitId))
    .map((document): QuestionBankDocument => {
      const metadata = parseDocumentMetadata(document);
      return {
        id: document.id,
        title: getTextValue(document, ["title", "name", "nombre", "titulo"]) ?? metadata.title ?? "Documento sin titulo",
        description: getTextValue(document, ["description", "descripcion"]) ?? metadata.description,
        fileName: metadata.fileName,
        key: metadata.key,
        mimeType: metadata.mimeType,
        size: metadata.size,
      };
    });

  const questions = (collections.questions?.records ?? [])
    .filter((question) => recordBelongsToUnit(question, unitId))
    .map((question): QuestionBankQuestion => ({
      id: question.id,
      prompt: getTextValue(question, ["prompt", "question", "pregunta", "title"]) ?? "Pregunta sin texto",
      options: parseQuestionOptions(question.options),
      answer: getTextValue(question, ["answer", "correctAnswer", "respuesta", "respuestaCorrecta"]) ?? "A",
      selected: question.selected === undefined ? true : question.selected === true,
      explanation: getTextValue(question, ["explanation", "explicacion"]) ?? undefined,
      source: getTextValue(question, ["source", "fuente"]) ?? undefined,
      difficulty: getTextValue(question, ["difficulty", "dificultad"]) ?? "Basica",
    }));

  const selected = questions.filter((question) => question.selected).length;

  return {
    id: unit.id,
    name: getTextValue(unit, ["name", "title", "nombre", "titulo", "unit", "unidad"]) ?? "Unidad sin titulo",
    description: getTextValue(unit, ["description", "descripcion", "detalle", "resumen"]) ?? undefined,
    docs: documents.length,
    questions: questions.length,
    selected,
    documents,
    questionItems: questions,
  };
}

function getCollectionMetadata(collections: PocketBaseCollection[], collectionName: string) {
  return collections.find((collection) => collection.name === collectionName);
}

function getFieldName(collection: PocketBaseCollection | undefined, candidates: string[]) {
  const fields = collection?.fields ?? collection?.schema ?? [];
  const normalized = fields.map((field) => ({ ...field, lowerName: field.name.toLowerCase() }));

  for (const candidate of candidates) {
    const field = normalized.find((item) => item.lowerName === candidate.toLowerCase());
    if (field) {
      return field.name;
    }
  }

  return null;
}

function getRecordFieldName(record: PbRecord | undefined, candidates: string[]) {
  if (!record) {
    return null;
  }

  const recordKeys = Object.keys(record).map((key) => ({ key, lowerKey: key.toLowerCase() }));

  for (const candidate of candidates) {
    const field = recordKeys.find((item) => item.lowerKey === candidate.toLowerCase());
    if (field) {
      return field.key;
    }
  }

  return null;
}

function getPocketBaseErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const response = "response" in error
    ? (error as { response?: { message?: string; data?: Record<string, { message?: string }> } }).response
    : undefined;

  if (!response) {
    return "message" in error && typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : null;
  }

  const fieldMessages = response.data
    ? Object.entries(response.data)
        .map(([field, value]) => `${field}: ${value.message ?? "dato invalido"}`)
        .join(" ")
    : "";

  return [response.message, fieldMessages].filter(Boolean).join(" ");
}

export async function createQuestionBankUnit(name: string, description: string) {
  const pb = await createServerClient();
  const availableCollections = await getAvailableCollections(pb);
  const collectionNames = getQuestionBankCollectionNames(availableCollections);
  const unitsResponse = await getFirstAvailableCollection(pb, collectionNames.units);
  const collectionName = unitsResponse?.collectionName ?? collectionNames.units[0];

  if (!collectionName) {
    throw new Error("No se encontro la coleccion de unidades del banco de preguntas.");
  }

  const collection = getCollectionMetadata(availableCollections, collectionName);
  const sampleUnit = unitsResponse?.records[0];
  const nameField = getFieldName(collection, ["name", "title", "nombre", "titulo", "unit", "unidad"])
    ?? getRecordFieldName(sampleUnit, ["name", "title", "nombre", "titulo", "unit", "unidad"])
    ?? "name";
  const descriptionField = getFieldName(collection, ["description", "descripcion", "detalle", "resumen"])
    ?? getRecordFieldName(sampleUnit, ["description", "descripcion", "detalle", "resumen"]);
  const data: Record<string, string> = {
    [nameField]: name,
  };

  if (description.trim() && descriptionField) {
    data[descriptionField] = description;
  }

  try {
    return await pb.collection(collectionName).create<PbRecord>(data);
  } catch (error) {
    const detail = getPocketBaseErrorMessage(error);
    throw new Error(detail ?? "PocketBase rechazo la creacion de la unidad.");
  }
}

export async function createQuestionBankDocument(unitId: string, metadata: {
  title: string;
  description?: string;
  key: string;
  fileName: string;
  mimeType: string;
  size: number;
}) {
  const collections = await getUnitCollections();
  if (!collections?.documents) {
    throw new Error("No se encontro la coleccion de documentos de unidad.");
  }

  const pb = await createServerClient();
  return pb.collection(collections.documents.collectionName).create<PbRecord>({
    unit: unitId,
    title: metadata.title,
    description: metadata.description ?? "",
    content: JSON.stringify(metadata),
  });
}

export async function createQuestionBankQuestions(unitId: string, questions: Array<{
  prompt: string;
  options: Array<{ label: string; text: string }>;
  answer: string;
  explanation: string;
  source?: string;
  difficulty?: string;
  document?: string;
}>) {
  const collections = await getUnitCollections();
  if (!collections?.questions) {
    throw new Error("No se encontro la coleccion de preguntas.");
  }

  const pb = await createServerClient();
  const created = [];

  for (const question of questions) {
    created.push(await pb.collection(collections.questions.collectionName).create<PbRecord>({
      unit: unitId,
      document: question.document || undefined,
      prompt: question.prompt,
      options: question.options,
      answer: question.answer,
      type: "multiple_choice",
      selected: true,
      explanation: question.explanation,
      source: question.source ?? "",
      difficulty: question.difficulty ?? "Basica",
    }));
  }

  return created;
}

export async function updateQuestionBankQuestionSelected(questionId: string, selected: boolean) {
  const collections = await getUnitCollections();
  if (!collections?.questions) {
    throw new Error("No se encontro la coleccion de preguntas.");
  }

  const pb = await createServerClient();
  return pb.collection(collections.questions.collectionName).update<PbRecord>(questionId, { selected });
}

export async function deleteQuestionBankQuestion(questionId: string) {
  const collections = await getUnitCollections();
  if (!collections?.questions) {
    throw new Error("No se encontro la coleccion de preguntas.");
  }

  const pb = await createServerClient();
  await pb.collection(collections.questions.collectionName).delete(questionId);
}
