import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { getQuestionBankUnitDetail } from "@/lib/question-bank";
import {
  deleteQuestionAction,
  generateQuestionsFromDocumentAction,
  generateQuestionsFromPromptAction,
  toggleQuestionSelectedAction,
  uploadUnitDocumentAction,
} from "./actions";
import {
  DocumentGenerationForm,
  PromptGenerationForm,
  UploadDocumentForm,
} from "./UnitForms";
import {
  DeleteQuestionButton,
  QuestionEnabledCheckbox,
} from "./QuestionControls";

export const dynamic = 'force-dynamic';

export default async function QuestionBankUnitPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const user = await getCurrentUser();
  const isTeacher = user && (user.role === 'docente' || user.role === 'admin');

  if (!isTeacher) {
    redirect("/");
  }

  const { unitId } = await params;
  const unit = await getQuestionBankUnitDetail(unitId);

  if (!unit) {
    notFound();
  }

  const uploadDocument = uploadUnitDocumentAction.bind(null, unit.id);
  const generateFromPrompt = generateQuestionsFromPromptAction.bind(null, unit.id);

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <nav className="flex flex-wrap items-center gap-2 mb-10">
        <Link
          href="/"
          className="px-4 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md hover:border-zinc-700 hover:bg-zinc-800 transition-colors dark:bg-zinc-900 dark:border-zinc-800"
        >
          Inicio
        </Link>
        <Link
          href="/parciales"
          className="px-4 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md hover:border-zinc-700 hover:bg-zinc-800 transition-colors dark:bg-zinc-900 dark:border-zinc-800"
        >
          Gestionar parciales
        </Link>
        <Link
          href="/parciales/banco-preguntas"
          className="px-4 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-md hover:border-zinc-700 hover:bg-zinc-800 transition-colors dark:bg-zinc-900 dark:border-zinc-800"
        >
          Banco de preguntas
        </Link>
      </nav>

      <div className="mb-8">
        <Link
          href="/parciales/banco-preguntas"
          className="text-sm text-blue-500 hover:text-blue-400"
        >
          Volver al banco de preguntas
        </Link>
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              {unit.name}
            </h1>
            {unit.description && (
              <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-300">{unit.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-sm text-zinc-800 bg-zinc-100 rounded-full dark:text-zinc-100 dark:bg-zinc-800">
              {unit.docs} documentos
            </span>
            <span className="px-3 py-1 text-sm text-zinc-800 bg-zinc-100 rounded-full dark:text-zinc-100 dark:bg-zinc-800">
              {unit.questions} preguntas
            </span>
            <span className="px-3 py-1 text-sm font-bold text-emerald-700 bg-emerald-100 rounded-full dark:text-emerald-300 dark:bg-emerald-950/70">
              {unit.selected} seleccionadas
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_24rem]">
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Preguntas</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {unit.questions} preguntas cargadas, {unit.selected} seleccionadas para tener en cuenta.
            </p>
          </div>

          <div className="space-y-4 p-4">
            {unit.questionItems.length > 0 ? (
              unit.questionItems.map((question) => (
                <article
                  key={question.id}
                  className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-start gap-3">
                    <QuestionEnabledCheckbox
                      selected={question.selected}
                      action={toggleQuestionSelectedAction.bind(null, unit.id, question.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{question.prompt}</h3>
                        <DeleteQuestionButton action={deleteQuestionAction.bind(null, unit.id, question.id)} />
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
                        {question.options.map((option) => (
                          <div
                            key={option.label}
                            className={`rounded-md border px-3 py-2 text-sm ${
                              option.label === question.answer
                                ? "border-emerald-700 bg-emerald-950/40 text-emerald-100"
                                : "border-zinc-200 text-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                            }`}
                          >
                            <strong>{option.label}.</strong> {option.text}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
                        <p>{question.difficulty ?? "Basica"} {question.explanation}</p>
                        {question.source && <p>Fuente: {question.source}</p>}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                Todavia no hay preguntas cargadas para esta unidad.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <UploadDocumentForm action={uploadDocument} />
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <PromptGenerationForm action={generateFromPrompt} />

            {unit.documents.length > 0 && (
              <div className="mt-6 space-y-3">
                {unit.documents.map((document) => (
                  <DocumentGenerationForm
                    key={document.id}
                    document={document}
                    action={generateQuestionsFromDocumentAction.bind(null, unit.id, document.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
