import { getCurrentUser } from "@/lib/pocketbase-server";
import { getQuestionBankUnits } from "@/lib/question-bank";
import Link from "next/link";
import { redirect } from "next/navigation";
import NewUnitButton from "./NewUnitButton";
import { createUnitAction } from "./actions";

export const dynamic = 'force-dynamic';

export default async function BancoPreguntasPage() {
  const user = await getCurrentUser();
  const isTeacher = user && (user.role === 'docente' || user.role === 'admin');

  if (!isTeacher) {
    redirect("/");
  }

  const units = await getQuestionBankUnits();

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <nav className="flex flex-wrap items-center gap-2 mb-8">
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

      <header className="mb-9">
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-zinc-900 dark:text-zinc-100">
          Banco de preguntas
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300 max-w-4xl">
          Organiza preguntas por unidad, genera propuestas con IA y decide cuales se tendran en cuenta.
        </p>
      </header>

      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Unidades</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
              Entra a una unidad para cargar documentos, generar preguntas y revisar la seleccion.
            </p>
          </div>
          <NewUnitButton action={createUnitAction} />
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {units.length > 0 ? (
            units.map((unit) => (
              <Link
                key={unit.id}
                href={`/parciales/banco-preguntas/${unit.id}`}
                className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{unit.name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 text-xs font-bold text-zinc-800 bg-zinc-100 rounded-full dark:text-zinc-100 dark:bg-zinc-800">
                    {unit.docs} docs
                  </span>
                  <span className="px-3 py-1 text-xs font-bold text-zinc-800 bg-zinc-100 rounded-full dark:text-zinc-100 dark:bg-zinc-800">
                    {unit.questions} preguntas
                  </span>
                  <span className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full dark:text-emerald-300 dark:bg-emerald-950/70">
                    {unit.selected} seleccionadas
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-5 py-6 text-sm text-zinc-600 dark:text-zinc-300">
              No hay unidades cargadas en el banco de preguntas.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
