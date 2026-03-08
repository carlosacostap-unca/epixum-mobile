import { getCurrentUser } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import ClassCreationForm from "./ClassCreationForm";

export default async function NewClassPage() {
  const user = await getCurrentUser();
  const isTeacher = user && (user.role === 'docente' || user.role === 'admin');

  if (!isTeacher) {
    redirect("/classes");
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-100 text-center">Crear Nueva Clase</h1>
      <ClassCreationForm />
    </div>
  );
}
