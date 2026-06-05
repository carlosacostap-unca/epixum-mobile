import { redirect } from "next/navigation";

export default async function EditPartialExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  await params;
  redirect("/parciales/gestionar");
}
